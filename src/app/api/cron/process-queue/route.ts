import { NextRequest, NextResponse } from 'next/server';
import { getPendingOrders, registerOrderEntry } from '@/lib/order-registry';
import { buyDataBundle, buyFlexaBundle } from '@/lib/datasika';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Allow Vercel cron runner (sends Authorization: Bearer <CRON_SECRET>)
  // or direct calls with ?secret=<CRON_SECRET> for manual triggers
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    const querySecret = new URL(req.url).searchParams.get('secret');
    const isVercelCron = authHeader === `Bearer ${cronSecret}`;
    const isManualTrigger = querySecret === cronSecret;
    if (!isVercelCron && !isManualTrigger) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

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
