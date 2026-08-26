import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { buyDataBundle } from '@/lib/datasika';
import { registerOrderEntry } from '@/lib/order-registry';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.SIKAPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers.get('x-sikapay-signature');
      if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }
      const hash = crypto
        .createHmac('sha512', webhookSecret)
        .update(rawBody)
        .digest('hex');
      if (hash !== signature) {
        console.error('Invalid SikaPay webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const { event, data } = payload;
    console.log(`SikaPay webhook received: ${event}`, data?.reference);

    if (event === 'charge.success' && data) {
      const reference = data.reference;
      const recipientPhone = data.customer?.phone || data.metadata?.recipient_phone;
      const productId = data.metadata?.product_id;

      if (productId && recipientPhone) {
        try {
          const order = await buyDataBundle({
            productId,
            recipient: recipientPhone.replace(/\D/g, ''),
            idempotencyKey: `sikapay-webhook-${reference}`,
          });
          console.log(`DataSika order dispatched for ${reference}:`, order.order_id);
          if (order.order_id) {
            registerOrderEntry({ orderId: order.order_id, recipient: recipientPhone.replace(/\D/g, '') });
          }
        } catch (err: any) {
          console.error(`DataSika dispatch failed for ${reference}:`, err.message);
          // Still return 200 so SikaPay doesn't retry the webhook endlessly
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
