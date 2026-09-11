import { NextRequest, NextResponse } from 'next/server';
import { fulfillOrderOnce } from '@/lib/fulfillment';
import { verifyWebhookSignature } from '@/lib/paystack';
import { queuePendingOrder } from '@/lib/order-registry';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // 1. Verify HMAC SHA512 signature from Paystack
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[Paystack Webhook] Invalid or missing signature.');
      return NextResponse.json({ status: false, error: 'Invalid signature' }, { status: 401 });
    }

    let eventPayload: any;
    try {
      eventPayload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ status: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    console.log(`[Paystack Webhook] Event: ${eventPayload.event}`);

    // 2. Process charge.success event
    if (eventPayload.event === 'charge.success') {
      const data = eventPayload.data;
      const reference = data.reference;
      const metadata = data.metadata || {};
      const productId = metadata.product_id;
      const recipientPhone = metadata.recipient_phone || data.customer?.phone;
      const serviceType = metadata.service_type;
      const customerCode = data.customer?.customer_code;

      if (reference && productId && recipientPhone) {
        const cleanRecipient = recipientPhone.toString().replace(/\D/g, '');
        try {
          const order = await fulfillOrderOnce({
            reference,
            productId,
            recipient: cleanRecipient,
            serviceType,
            customerCode,
          });

          console.log(`[Paystack Webhook] Order successfully dispatched for ${reference}:`, order.order_id);
        } catch (dispatchErr: any) {
          console.error(`[Paystack Webhook] DataSika dispatch error for ${reference}:`, dispatchErr.message);
          queuePendingOrder({
            reference,
            productId,
            recipient: cleanRecipient,
            serviceType,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({ status: true, message: 'Webhook processed' }, { status: 200 });
  } catch (error: any) {
    console.error('[Paystack Webhook] Internal error:', error);
    return NextResponse.json({ status: false, error: 'Webhook processing failed' }, { status: 500 });
  }
}
