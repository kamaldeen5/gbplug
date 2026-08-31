import { NextRequest, NextResponse } from 'next/server';
import { getPendingOrders, registerOrderEntry } from '@/lib/order-registry';
import { buyDataBundle, buyFlexaBundle } from '@/lib/datasika';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const dataSikaKey = process.env.DATA_API_KEY || process.env.DSK_API_KEY;
    const pendingOrders = getPendingOrders();
    const results: any[] = [];

    // 1. Process explicit pending queue
    for (const pending of pendingOrders) {
      try {
        const isFlexa = pending.serviceType === 'mtn_flexa';
        const cleanRecipient = pending.recipient.replace(/\D/g, '');
        const order = isFlexa
          ? await buyFlexaBundle({
              productId: pending.productId,
              recipient: cleanRecipient,
              idempotencyKey: `moolre-${pending.reference}`,
            })
          : await buyDataBundle({
              productId: pending.productId,
              recipient: cleanRecipient,
              idempotencyKey: `moolre-${pending.reference}`,
            });

        if (order.order_id) {
          registerOrderEntry({
            orderId: order.order_id,
            recipient: cleanRecipient,
            createdAt: pending.createdAt,
          });
          results.push({ reference: pending.reference, orderId: order.order_id, status: 'dispatched' });
        }
      } catch (err: any) {
        results.push({ reference: pending.reference, status: 'pending', error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      pendingCount: pendingOrders.length,
      dispatchedCount: results.filter((r) => r.status === 'dispatched').length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Queue processing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
