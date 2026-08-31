import { NextResponse } from 'next/server';
import { getCatalog, buyDataBundle, buyFlexaBundle } from '@/lib/datasika';
import { getPendingOrders, registerOrderEntry } from '@/lib/order-registry';

export const dynamic = 'force-dynamic';

async function backgroundSweepPendingOrders() {
  try {
    const pendingOrders = getPendingOrders();
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

        if (order?.order_id) {
          registerOrderEntry({
            orderId: order.order_id,
            recipient: cleanRecipient,
            createdAt: pending.createdAt,
          });
        }
      } catch {
        // Suppress silently if wallet is still awaiting funding
      }
    }
  } catch {
    // Non-blocking
  }
}

export async function GET() {
  // Fire-and-forget background queue sweep
  backgroundSweepPendingOrders().catch(() => {});

  try {
    const catalog = await getCatalog();
    const isDataBundlesAvailable = catalog.services?.data_bundles?.available ?? true;

    // Check if custom pause env var is active
    const isManuallyPaused = process.env.MAINTENANCE_MODE === 'true';

    return NextResponse.json({
      inStock: isDataBundlesAvailable && !isManuallyPaused,
      message: isManuallyPaused
        ? 'Temporarily restocking. Back shortly!'
        : isDataBundlesAvailable
        ? 'Orders Fulfilled Same Day'
        : 'Service temporarily undergoing routine provider maintenance.',
    });
  } catch (error: any) {
    return NextResponse.json({
      inStock: true, // Default to operational
      message: 'Active',
    });
  }
}
