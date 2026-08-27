import { NextRequest, NextResponse } from 'next/server';
import { buyDataBundle, buyFlexaBundle } from '@/lib/datasika';
import { registerOrderEntry } from '@/lib/order-registry';

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
        const isFlexa = serviceType === 'mtn_flexa';
        const cleanRecipient = recipientPhone.toString().replace(/\D/g, '');

        const order = isFlexa
          ? await buyFlexaBundle({
              productId,
              recipient: cleanRecipient,
              idempotencyKey: `moolre-webhook-${externalRef}`,
            })
          : await buyDataBundle({
              productId,
              recipient: cleanRecipient,
              idempotencyKey: `moolre-webhook-${externalRef}`,
            });

        console.log(`DataSika order dispatched via Moolre webhook for ${externalRef}:`, order.order_id);
        if (order.order_id) {
          registerOrderEntry({ orderId: order.order_id, recipient: cleanRecipient });
        }
      } catch (err: any) {
        console.error(`DataSika dispatch failed in Moolre webhook for ${externalRef}:`, err.message);
      }
    }

    return NextResponse.json({ status: 1, message: 'Webhook received' }, { status: 200 });
  } catch (error: any) {
    console.error('Moolre webhook error:', error);
    return NextResponse.json({ status: 0, error: 'Webhook processing failed' }, { status: 500 });
  }
}
