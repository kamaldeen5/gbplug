import { NextRequest, NextResponse } from 'next/server';
import { registerOrderEntry, getOrdersByPhone } from '@/lib/order-registry';

export const dynamic = 'force-dynamic';

const DATASIKA_BASE_URL = 'https://nrsfvhztpzwkadwciizp.supabase.co/functions/v1';

function detectNetwork(phone: string): { id: 'mtn' | 'telecel' | 'airteltigo'; name: string } {
  const p = phone.replace(/\D/g, '');
  if (/^(024|054|055|059|025)/.test(p)) return { id: 'mtn', name: 'MTN Ghana' };
  if (/^(020|050)/.test(p)) return { id: 'telecel', name: 'Telecel Ghana' };
  return { id: 'airteltigo', name: 'AirtelTigo' };
}

async function fetchDsOrder(orderId: string, dataSikaKey: string) {
  const res = await fetch(
    `${DATASIKA_BASE_URL}/api-order-status?order_id=${encodeURIComponent(orderId)}`,
    { headers: { Authorization: `Bearer ${dataSikaKey}` }, cache: 'no-store' }
  );
  if (!res.ok) return null;
  return res.json() as Promise<any>;
}

function dsOrderToUi(ds: any) {
  const { id: networkId, name: networkName } = detectNetwork(ds.recipient || '');
  const dsStatus = (ds.status || '').toLowerCase();
  return {
    id: ds.order_id,
    reference: ds.order_id,
    network: networkId,
    networkName: ds.network ? `${ds.network} Ghana` : networkName,
    bundle: ds.bundle_gb ? `${ds.bundle_gb} GB Data Bundle` : 'Data Bundle',
    data: ds.bundle_gb ? `${ds.bundle_gb} GB` : 'Data Bundle',
    phone: ds.recipient || '',
    amount: Number(ds.amount_charged) || 0,
    status: dsStatus as 'delivered' | 'processing' | 'pending' | 'failed' | 'refunded',
    timeline: {
      orderPlacedAt: ds.created_at || null,
      processingAt: ds.created_at || null,
      deliveredAt:
        dsStatus === 'delivered'
          ? ds.updated_at || ds.created_at
          : dsStatus === 'failed' || dsStatus === 'refunded'
          ? ds.updated_at || null
          : null,
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
      const ds = await fetchDsOrder(query.toUpperCase(), dataSikaKey);
      if (!ds) {
        return NextResponse.json({
          success: false,
          error: `Order ${query} not found. Double-check the Order ID and try again.`,
        });
      }
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

    // Fetch live status from DataSika for each order in parallel
    const settled = await Promise.allSettled(
      sorted.map((e) => fetchDsOrder(e.orderId, dataSikaKey))
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
