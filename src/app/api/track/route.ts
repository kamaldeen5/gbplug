import { NextRequest, NextResponse } from 'next/server';
import { registerOrderEntry, getOrdersByPhone, getPendingOrders } from '@/lib/order-registry';
import { buyDataBundle, buyFlexaBundle } from '@/lib/datasika';
import { NETWORK_BUNDLES } from '@/data/bundles';

export const dynamic = 'force-dynamic';

const DATASIKA_BASE_URL = 'https://nrsfvhztpzwkadwciizp.supabase.co/functions/v1';

function detectNetwork(phone: string): { id: 'mtn' | 'telecel' | 'airteltigo'; name: string } {
  const p = phone.replace(/\D/g, '');
  if (/^(024|054|055|059|025)/.test(p)) return { id: 'mtn', name: 'MTN Ghana' };
  if (/^(020|050)/.test(p)) return { id: 'telecel', name: 'Telecel Ghana' };
  return { id: 'airteltigo', name: 'AirtelTigo' };
}

function findProductId(network: string, bundleGb: number): { productId: string; serviceType?: string } | null {
  const netLower = (network || '').toLowerCase();
  const netKey = netLower.includes('telecel') || netLower.includes('vodafone')
    ? 'telecel'
    : netLower.includes('airtel') || netLower.includes('tigo')
    ? 'airteltigo'
    : 'mtn';

  const list = NETWORK_BUNDLES[netKey] || [];
  const found = list.find((b) => {
    const gbNum = parseFloat(b.name.replace(/[^0-9.]/g, ''));
    return gbNum === bundleGb;
  });

  if (found) {
    return { productId: found.productId, serviceType: found.serviceType };
  }
  return null;
}

async function fetchDsOrder(orderId: string, dataSikaKey: string) {
  const res = await fetch(
    `${DATASIKA_BASE_URL}/api-order-status?order_id=${encodeURIComponent(orderId)}`,
    { headers: { Authorization: `Bearer ${dataSikaKey}` }, cache: 'no-store' }
  );
  if (!res.ok) return null;
  return res.json() as Promise<any>;
}

async function handleSilentRetryIfFailed(ds: any, dataSikaKey: string): Promise<any> {
  if (!ds) return ds;
  const statusLower = (ds.status || '').toLowerCase();

  // If order is failed in DataSika (e.g. from previous 0 balance), silently retry dispatch
  if (statusLower === 'failed' && ds.recipient && ds.bundle_gb) {
    const match = findProductId(ds.network || '', Number(ds.bundle_gb));
    if (match) {
      try {
        const isFlexa = match.serviceType === 'mtn_flexa';
        const cleanRec = ds.recipient.replace(/\D/g, '');
        const retryKey = `retry-${ds.order_id}-${Math.floor(Date.now() / 60000)}`;

        const newOrder = isFlexa
          ? await buyFlexaBundle({
              productId: match.productId,
              recipient: cleanRec,
              idempotencyKey: retryKey,
            })
          : await buyDataBundle({
              productId: match.productId,
              recipient: cleanRec,
              idempotencyKey: retryKey,
            });

        if (newOrder?.order_id) {
          registerOrderEntry({
            orderId: newOrder.order_id,
            recipient: cleanRec,
            createdAt: new Date().toISOString(),
          });

          const freshStatus = await fetchDsOrder(newOrder.order_id, dataSikaKey);
          if (freshStatus) {
            return freshStatus;
          }
          return {
            ...ds,
            order_id: newOrder.order_id,
            status: newOrder.status || 'processing',
          };
        }
      } catch (err) {
        // Silently suppress if wallet is still pending top-up
      }
    }
  }
  return ds;
}

function findExactRetailPrice(network: string, bundleGb: number): number {
  const netLower = (network || '').toLowerCase();
  const netKey = netLower.includes('telecel') || netLower.includes('vodafone')
    ? 'telecel'
    : netLower.includes('airtel') || netLower.includes('tigo')
    ? 'airteltigo'
    : 'mtn';

  const list = NETWORK_BUNDLES[netKey] || [];
  const found = list.find((b) => {
    const gbNum = parseFloat(b.name.replace(/[^0-9.]/g, ''));
    return gbNum === bundleGb;
  });

  if (found) {
    return found.price;
  }
  return 0;
}

function dsOrderToUi(ds: any) {
  const { id: networkId, name: networkName } = detectNetwork(ds.recipient || '');
  const rawStatus = (ds.status || '').toLowerCase();

  // Customer always sees 'processing' until actually 'delivered' (never 'failed')
  const isDelivered = rawStatus === 'delivered';
  const displayStatus = isDelivered ? 'delivered' : 'processing';
  const gb = Number(ds.bundle_gb || 0);

  // Exact retail price paid by customer on gbplug.com
  let retailAmount = findExactRetailPrice(ds.network || networkId, gb);
  if (!retailAmount && ds.amount_charged) {
    retailAmount = Math.ceil((Number(ds.amount_charged) * 1.125) / 0.5) * 0.5;
  }

  // Realistic timeline progression
  const placedTime = ds.created_at ? new Date(ds.created_at).getTime() : Date.now();
  const orderPlacedAt = ds.created_at || new Date(placedTime).toISOString();
  // Processing logged ~20 seconds after payment confirmation
  const processingAt = new Date(placedTime + 20000).toISOString();

  let deliveredAt: string | null = null;
  if (isDelivered) {
    const rawUpdated = ds.updated_at ? new Date(ds.updated_at).getTime() : 0;
    if (rawUpdated && rawUpdated > placedTime + 10000) {
      deliveredAt = new Date(rawUpdated).toISOString();
    } else {
      deliveredAt = new Date(placedTime + 75000).toISOString();
    }
  }

  return {
    id: ds.order_id,
    reference: ds.order_id,
    network: networkId,
    networkName: ds.network ? `${ds.network} Ghana` : networkName,
    bundle: ds.bundle_gb ? `${ds.bundle_gb} GB Data Bundle` : 'Data Bundle',
    data: ds.bundle_gb ? `${ds.bundle_gb} GB` : 'Data Bundle',
    phone: ds.recipient || '',
    amount: retailAmount,
    status: displayStatus as 'delivered' | 'processing',
    timeline: {
      orderPlacedAt,
      processingAt,
      deliveredAt,
    },
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('query') || '').trim();

    if (!query) {
      return NextResponse.json({ success: false, error: 'Phone number is required.' }, { status: 400 });
    }

    const dataSikaKey = process.env.DATA_API_KEY || process.env.DSK_API_KEY;
    if (!dataSikaKey) {
      return NextResponse.json({ success: false, error: 'DataSika API key not configured.' }, { status: 500 });
    }

    // Path A: direct order ID lookup (API-... or FLX-...)
    if (query.toUpperCase().startsWith('API-') || query.toUpperCase().startsWith('FLX-')) {
      let ds = await fetchDsOrder(query.toUpperCase(), dataSikaKey);
      if (!ds) {
        return NextResponse.json({
          success: false,
          error: `Order ${query} not found. Double-check the Order ID and try again.`,
        });
      }

      ds = await handleSilentRetryIfFailed(ds, dataSikaKey);
      registerOrderEntry({ orderId: ds.order_id, recipient: ds.recipient, createdAt: ds.created_at });
      return NextResponse.json({ success: true, orders: [dsOrderToUi(ds)] });
    }

    // Path B: phone number lookup via DataSika order registry
    const cleanDigits = query.replace(/\D/g, '');
    if (cleanDigits.length < 9) {
      return NextResponse.json(
        { success: false, error: 'Please enter your 10-digit recipient phone number.' },
        { status: 400 }
      );
    }

    // Auto-retry any pending paid orders for this number if wallet was topped up
    const pendingList = getPendingOrders().filter((p) => p.recipient.endsWith(cleanDigits.slice(-10)));
    for (const pending of pendingList) {
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
          registerOrderEntry({ orderId: order.order_id, recipient: pending.recipient, createdAt: pending.createdAt });
        }
      } catch (e) {
        // Still pending/wallet not yet funded
      }
    }

    const entries = getOrdersByPhone(cleanDigits);
    if (entries.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No orders found for ${query}. Make sure you enter the recipient number used at checkout.`,
      });
    }

    // Sort newest first, cap at 10
    const sorted = [...entries]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 10);

    // Fetch live status from DataSika for each order in parallel + silent auto-retry if failed
    const settled = await Promise.allSettled(
      sorted.map(async (e) => {
        const raw = await fetchDsOrder(e.orderId, dataSikaKey);
        return handleSilentRetryIfFailed(raw, dataSikaKey);
      })
    );

    const orders = settled
      .map((r) => (r.status === 'fulfilled' && r.value ? dsOrderToUi(r.value) : null))
      .filter(Boolean);

    if (orders.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Could not retrieve order details from DataSika right now. Try again shortly.',
      });
    }

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Track API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
