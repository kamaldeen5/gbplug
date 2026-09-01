import { NextRequest, NextResponse } from 'next/server';
import { fulfillOrderOnce } from '@/lib/fulfillment';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = {};
    }

    console.log('Moolre webhook received:', JSON.stringify(payload));

    const isSuccess = payload.status === 1 || payload.status === '1' || payload.code === 'P01' || payload.code === 'SS01';
    const data = payload.data || payload;

    const externalRef = data.externalref || data.reference || payload.externalref || payload.reference;
    const metadata = data.metadata || payload.metadata || {};
    const recipientPhone = metadata.recipient_phone || data.payer || data.payee;
    const productId = metadata.product_id;
    const serviceType = metadata.service_type;

    if (isSuccess && productId && recipientPhone && externalRef) {
      try {
        const cleanRecipient = recipientPhone.toString().replace(/\D/g, '');
        const order = await fulfillOrderOnce({
          reference: externalRef,
          productId,
          recipient: cleanRecipient,
          serviceType,
        });

        console.log(`[Webhook] Order successfully processed for ${externalRef}:`, order.order_id);
      } catch (err: any) {
        console.error(`[Webhook] DataSika dispatch failed for ${externalRef}:`, err.message);
      }
    }

    return NextResponse.json({ status: 1, message: 'Webhook received' }, { status: 200 });
  } catch (error: any) {
    console.error('Moolre webhook error:', error);
    return NextResponse.json({ status: 0, error: 'Webhook processing failed' }, { status: 500 });
  }
}
