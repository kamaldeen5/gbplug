import { NextRequest, NextResponse } from 'next/server';
import { getPendingOrders, registerOrderEntry } from '@/lib/order-registry';
import { buyDataBundle, buyFlexaBundle } from '@/lib/datasika';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const pendingOrders = getPendingOrders();
    const results = [];

    for (const pending of pendingOrders) {
      try {
        const isFlexa = pending.serviceType === 'mtn_flexa';
        const order = isFlexa
          ? await buyFlexaBundle({
              productId: pending.productId,
              recipient: pending.recipient,
              idempotencyKey: `moolre-${pending.reference}`,
            })
          : await buyDataBundle({
              productId: pending.productId,
              recipient: pending.recipient,
              idempotencyKey: `moolre-${pending.reference}`,
            });

        if (order.order_id) {
          registerOrderEntry({
            orderId: order.order_id,
            recipient: pending.recipient,
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
