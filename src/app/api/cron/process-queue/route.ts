import { NextRequest, NextResponse } from 'next/server';
import { getPendingOrders } from '@/lib/order-registry';
import { fulfillOrderOnce } from '@/lib/fulfillment';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const pendingOrders = getPendingOrders();
    const results: any[] = [];

    // 1. Process explicit pending queue
    for (const pending of pendingOrders) {
      try {
        const cleanRecipient = pending.recipient.replace(/\D/g, '');
        const order = await fulfillOrderOnce({
          reference: pending.reference,
          productId: pending.productId,
          recipient: cleanRecipient,
          serviceType: pending.serviceType,
        });

        if (order.order_id) {
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
