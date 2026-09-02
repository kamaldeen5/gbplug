import { NextRequest, NextResponse } from 'next/server';
import { registerOrderEntry, getOrdersByPhone } from '@/lib/order-registry';
import { NETWORK_BUNDLES } from '@/data/bundles';
import { getOrderStatus } from '@/lib/datasika';

export const dynamic = 'force-dynamic';

function detectNetwork(phone: string): { id: 'mtn' | 'telecel' | 'airteltigo'; name: string } {
  const p = phone.replace(/\D/g, '');
  if (/^(024|054|055|059|025)/.test(p)) return { id: 'mtn', name: 'MTN Ghana' };
  if (/^(020|050)/.test(p)) return { id: 'telecel', name: 'Telecel Ghana' };
  return { id: 'airteltigo', name: 'AirtelTigo' };
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

  // Customer sees 'delivered' when complete, 'processing' during queue/transit
  const isDelivered = rawStatus === 'delivered';
  const isFailed = rawStatus === 'failed' || rawStatus === 'refunded';
  const displayStatus = isDelivered ? 'delivered' : isFailed ? 'failed' : 'processing';
  const gb = Number(ds.bundle_gb || 0);

  // Exact retail price paid by customer on gbplug.com
  let retailAmount = findExactRetailPrice(ds.network || networkId, gb);
  if (!retailAmount && ds.amount_charged) {
    retailAmount = Math.ceil((Number(ds.amount_charged) * 1.125) / 0.5) * 0.5;
  }

  // Timeline progression
  const placedTime = ds.created_at ? new Date(ds.created_at).getTime() : Date.now();
  const orderPlacedAt = ds.created_at || new Date(placedTime).toISOString();
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
    status: displayStatus,
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

    // Accept multiple query param aliases for maximum compatibility
    const rawQuery = (
      searchParams.get('q') ||
      searchParams.get('query') ||
      searchParams.get('phone') ||
      searchParams.get('order_id') ||
      searchParams.get('orderId') ||
      searchParams.get('ref') ||
      searchParams.get('reference') ||
      ''
    ).trim();

    if (!rawQuery) {
      return NextResponse.json(
        { success: false, error: 'Please enter your phone number or Order ID.' },
        { status: 400 }
      );
    }

    const dataSikaKey = process.env.DATA_API_KEY || process.env.DSK_API_KEY;
    if (!dataSikaKey) {
      return NextResponse.json(
        { success: false, error: 'Data gateway key not configured.' },
        { status: 500 }
      );
    }

    // Direct Order ID Lookup (e.g. API-..., FLX-..., ORD-..., or any alphanumeric order code)
    const isDirectOrderId =
      rawQuery.toUpperCase().startsWith('API-') ||
      rawQuery.toUpperCase().startsWith('FLX-') ||
      rawQuery.toUpperCase().startsWith('ORD-') ||
      (/[A-Za-z]/.test(rawQuery) && rawQuery.length > 5);

    if (isDirectOrderId) {
      try {
        const ds = await getOrderStatus(rawQuery.toUpperCase());
        if (ds && ds.order_id) {
          registerOrderEntry({
            orderId: ds.order_id,
            recipient: ds.recipient,
            createdAt: (ds as any).created_at,
          });
          return NextResponse.json({ success: true, orders: [dsOrderToUi(ds)] });
        }
      } catch (err) {
        console.error('[Track] Direct order lookup error:', err);
      }
    }

    // Phone Number / Registry Lookup
    const cleanDigits = rawQuery.replace(/\D/g, '');
    const clean10 = cleanDigits.slice(-10);

    // Collect order IDs from:
    // 1. In-memory registry
    const registryEntries = clean10.length >= 9 ? getOrdersByPhone(clean10) : [];
    const orderIdSet = new Set<string>(registryEntries.map((e) => e.orderId));

    // 2. Extra order IDs passed from client localStorage
    const extraParam = searchParams.get('orderIds') || searchParams.get('order_ids') || '';
    if (extraParam) {
      extraParam
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
        .forEach((oid) => orderIdSet.add(oid));
    }

    // 3. If the query itself looks like an order ID, add it
    if (rawQuery.length >= 6) {
      orderIdSet.add(rawQuery.trim().toUpperCase());
    }

    const allOrderIds = Array.from(orderIdSet);

    if (allOrderIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No live orders found for ${rawQuery}. Please ensure you enter the exact recipient number used at checkout.`,
      });
    }

    // Fetch live status from DataSika in parallel
    const settled = await Promise.allSettled(
      allOrderIds.slice(0, 10).map(async (oid) => {
        return getOrderStatus(oid);
      })
    );

    const validOrders = settled
      .map((r) => (r.status === 'fulfilled' && r.value ? dsOrderToUi(r.value) : null))
      .filter(Boolean);

    // Filter by phone number if a specific phone was queried
    const filtered = clean10.length >= 9
      ? validOrders.filter((o) => (o!.phone || '').replace(/\D/g, '').endsWith(clean10.slice(-9)))
      : validOrders;

    const results = filtered.length > 0 ? filtered : validOrders;

    if (results.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No orders found for ${rawQuery}. Please verify your details or contact support.`,
      });
    }

    return NextResponse.json({ success: true, orders: results });
  } catch (error: any) {
    console.error('Track API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
