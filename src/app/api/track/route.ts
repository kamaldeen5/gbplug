import { NextRequest, NextResponse } from 'next/server';
import { registerOrderEntry, getOrdersByPhone } from '@/lib/order-registry';
import { NETWORK_BUNDLES } from '@/data/bundles';
import { getOrderStatus } from '@/lib/datasika';
import { verifyPayment } from '@/lib/moolre';
import { fulfillOrderOnce } from '@/lib/fulfillment';

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

  const isDelivered = rawStatus === 'delivered';
  const isFailed = rawStatus === 'failed' || rawStatus === 'refunded';
  const displayStatus = isDelivered ? 'delivered' : isFailed ? 'failed' : 'processing';
  const gb = Number(ds.bundle_gb || 0);

  let retailAmount = findExactRetailPrice(ds.network || networkId, gb);
  if (!retailAmount && ds.amount_charged) {
    retailAmount = Math.ceil((Number(ds.amount_charged) * 1.125) / 0.5) * 0.5;
  }

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

async function resolveSingleOrder(idOrRef: string): Promise<any | null> {
  const clean = idOrRef.trim();
  if (!clean) return null;

  // 1. If it's a DataSika order ID
  if (clean.toUpperCase().startsWith('API-') || clean.toUpperCase().startsWith('FLX-') || clean.toUpperCase().startsWith('ORD-')) {
    try {
      const ds = await getOrderStatus(clean.toUpperCase());
      if (ds && ds.order_id) {
        registerOrderEntry({ orderId: ds.order_id, recipient: ds.recipient, createdAt: (ds as any).created_at });
        return dsOrderToUi(ds);
      }
    } catch (e) {}
  }

  // 2. If it's a Moolre / GB Plug payment reference
  if (clean.toLowerCase().startsWith('gbplug-') || clean.toLowerCase().startsWith('moolre') || clean.includes('-')) {
    try {
      const res = await verifyPayment(clean);
      if (res.status && res.data) {
        const pData = res.data;
        const metadata = pData.raw?.metadata || {};
        const productId = metadata.product_id;
        const recipient = metadata.recipient_phone || pData.customer_phone || '';
        const serviceType = metadata.service_type;
        const cleanRecipient = recipient.replace(/\D/g, '');

        if (pData.status === 'success' && productId && cleanRecipient) {
          try {
            const dsOrder = await fulfillOrderOnce({
              reference: clean,
              productId,
              recipient: cleanRecipient,
              serviceType,
            });

            if (dsOrder && dsOrder.order_id) {
              registerOrderEntry({ orderId: dsOrder.order_id, recipient: cleanRecipient });
              return dsOrderToUi(dsOrder);
            }
          } catch (fErr) {}
        }

        const { id: netId, name: netName } = detectNetwork(cleanRecipient);
        return {
          id: pData.reference,
          reference: pData.reference,
          network: netId,
          networkName: netName,
          bundle: metadata.bundle_name || `${pData.amount} GHS Bundle`,
          data: metadata.bundle_name || `${pData.amount} GHS`,
          phone: cleanRecipient,
          amount: pData.amount,
          status: pData.status === 'success' ? 'processing' : (pData.status === 'failed' ? 'failed' : 'processing'),
          timeline: {
            orderPlacedAt: pData.paid_at || new Date().toISOString(),
            processingAt: new Date().toISOString(),
            deliveredAt: null,
          },
        };
      }
    } catch (e) {}
  }

  // 3. Fallback try DataSika status check
  try {
    const ds = await getOrderStatus(clean);
    if (ds && ds.order_id) {
      return dsOrderToUi(ds);
    }
  } catch (e) {}

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

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

    // Direct single reference / order ID check
    const isDirectId =
      rawQuery.toUpperCase().startsWith('API-') ||
      rawQuery.toUpperCase().startsWith('FLX-') ||
      rawQuery.toUpperCase().startsWith('ORD-') ||
      rawQuery.toLowerCase().startsWith('gbplug-') ||
      (/[A-Za-z]/.test(rawQuery) && rawQuery.length > 5);

    if (isDirectId) {
      const resolved = await resolveSingleOrder(rawQuery);
      if (resolved) {
        return NextResponse.json({ success: true, orders: [resolved] });
      }
    }

    // Phone Number / Multiple Order IDs lookup
    const cleanDigits = rawQuery.replace(/\D/g, '');
    const clean10 = cleanDigits.slice(-10);

    const orderIdSet = new Set<string>();

    // 1. In-memory registry
    if (clean10.length >= 9) {
      const registryEntries = getOrdersByPhone(clean10);
      registryEntries.forEach((e) => orderIdSet.add(e.orderId));
    }

    // 2. Extra order IDs from client localStorage
    const extraParam = searchParams.get('orderIds') || searchParams.get('order_ids') || '';
    if (extraParam) {
      extraParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((oid) => orderIdSet.add(oid));
    }

    if (rawQuery.length >= 6) {
      orderIdSet.add(rawQuery.trim());
    }

    const allIds = Array.from(orderIdSet);

    if (allIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No live orders found for ${rawQuery}. Please ensure you enter the recipient number or reference used at checkout.`,
      });
    }

    // Resolve all order IDs in parallel
    const settled = await Promise.allSettled(
      allIds.slice(0, 10).map((id) => resolveSingleOrder(id))
    );

    const validOrders = settled
      .map((r) => (r.status === 'fulfilled' ? r.value : null))
      .filter(Boolean);

    // Filter by phone number if a specific phone was queried
    const filtered = clean10.length >= 9
      ? validOrders.filter((o) => (o.phone || '').replace(/\D/g, '').endsWith(clean10.slice(-9)))
      : validOrders;

    const results = filtered.length > 0 ? filtered : validOrders;

    if (results.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No orders found for ${rawQuery}. If you just placed an order, please allow 1-2 minutes for the network to register it, or contact WhatsApp support.`,
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
