import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SIKAPAY_BASE_URL = 'https://api.sikapaygh.com/api/v1';
const DATASIKA_BASE_URL = 'https://nrsfvhztpzwkadwciizp.supabase.co/functions/v1';

function detectNetwork(phone: string): { id: 'mtn' | 'telecel' | 'airteltigo'; name: string } {
  const p = phone.replace(/\D/g, '');
  if (/^(024|054|055|059|025)/.test(p)) return { id: 'mtn', name: 'MTN Ghana' };
  if (/^(020|050)/.test(p)) return { id: 'telecel', name: 'Telecel Ghana' };
  return { id: 'airteltigo', name: 'AirtelTigo' };
}

async function fetchLiveOrderDetails(
  t: any,
  cleanDigits: string,
  dataSikaKey?: string
) {
  const isPaid = t.status?.toLowerCase() === 'success';
  const recipientPhone =
    (t.metadata?.recipient_phone || '').replace(/\D/g, '') ||
    (t.customer?.phone || '').replace(/\D/g, '').slice(-10) ||
    cleanDigits;

  const { id: networkId, name: networkName } = detectNetwork(recipientPhone);
  const bundleName = t.metadata?.bundle_name || '';
  const productId = t.metadata?.product_id;

  let orderId = t.reference;
  let status: 'delivered' | 'pending' | 'processing' | 'failed' | 'refunded' = isPaid
    ? 'processing'
    : 'pending';

  let orderPlacedAt = t.created_at || null;
  let processingAt: string | null = t.paid_at || null;
  let deliveredAt: string | null = null;

  // If customer paid, query DataSika for the live gateway record & real status
  if (isPaid && dataSikaKey && productId && recipientPhone) {
    try {
      // 1. Idempotently resolve DataSika order record
      const dsRes = await fetch(`${DATASIKA_BASE_URL}/api-buy-data`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${dataSikaKey}`,
          'Idempotency-Key': `sikapay-${t.reference}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          recipient: recipientPhone.slice(-10),
        }),
      });

      const dsData = await dsRes.json();

      if (dsData.order_id) {
        orderId = dsData.order_id;

        // 2. Query DataSika live order status endpoint for accurate timestamps & state
        const statusRes = await fetch(
          `${DATASIKA_BASE_URL}/api-order-status?order_id=${encodeURIComponent(dsData.order_id)}`,
          {
            headers: { Authorization: `Bearer ${dataSikaKey}` },
            cache: 'no-store',
          }
        );

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          const dsStatus = (statusData.status || '').toLowerCase();

          if (dsStatus === 'delivered') {
            status = 'delivered';
            deliveredAt = statusData.updated_at || statusData.created_at || null;
          } else if (dsStatus === 'failed') {
            status = 'failed';
            deliveredAt = statusData.updated_at || null;
          } else if (dsStatus === 'refunded') {
            status = 'refunded';
            deliveredAt = statusData.updated_at || null;
          } else {
            status = 'processing';
          }

          if (statusData.created_at) {
            processingAt = statusData.created_at;
          }
        }
      }
    } catch (err) {
      console.error('DataSika live status query error:', err);
    }
  }

  return {
    id: orderId,
    reference: t.reference,
    network: networkId,
    networkName,
    bundle: bundleName ? `${bundleName} Data Bundle` : 'Data Bundle',
    data: bundleName,
    phone: recipientPhone,
    amount: Number(t.amount) || 0,
    status,
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
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    const cleanDigits = query.replace(/\D/g, '');

    // Phone number only — must be at least 9 digits
    if (cleanDigits.length < 9) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit phone number.' },
        { status: 400 }
      );
    }

    const secretKey = process.env.SIKAPAY_SECRET_KEY;
    const dataSikaKey = process.env.DATA_API_KEY || process.env.DSK_API_KEY;

    if (!secretKey) {
      return NextResponse.json({ success: false, error: 'Payment gateway not configured.' }, { status: 500 });
    }

    // Fetch live transaction list from SikaPay
    const res = await fetch(`${SIKAPAY_BASE_URL}/transaction`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: 'no-store',
    });

    const data = await res.json();

    if (!data.status || !Array.isArray(data.data)) {
      return NextResponse.json(
        { success: false, error: 'Could not reach payment gateway. Try again shortly.' },
        { status: 502 }
      );
    }

    // Filter strictly by phone number AND successful payment (ignore unpaid/abandoned checkout sessions)
    const matches = (data.data as any[]).filter((t) => {
      const isPaid = (t.status || '').toLowerCase() === 'success';
      if (!isPaid) return false;

      const inEmail = (t.customer?.email || '').includes(cleanDigits);
      const inMeta = (t.metadata?.recipient_phone || '').replace(/\D/g, '').includes(cleanDigits);
      const inPhone = (t.customer?.phone || '').replace(/\D/g, '').includes(cleanDigits);
      return inEmail || inMeta || inPhone;
    });

    if (matches.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No paid orders found for ${query}. Make sure you enter the recipient number or the number you used to pay.`,
      });
    }

    // Newest first, cap at 5
    const sorted = [...matches]
      .sort((a, b) => {
        const at = new Date(a.paid_at || a.created_at || 0).getTime();
        const bt = new Date(b.paid_at || b.created_at || 0).getTime();
        return bt - at;
      })
      .slice(0, 5);

    // Resolve live status and timeline from DataSika for each order concurrently
    const orders = await Promise.all(
      sorted.map((t) => fetchLiveOrderDetails(t, cleanDigits, dataSikaKey))
    );

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Track API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}



