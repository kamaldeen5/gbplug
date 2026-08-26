import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SIKAPAY_BASE_URL = 'https://api.sikapaygh.com/api/v1';

function detectNetwork(phone: string): { id: string; name: string } {
  const p = phone.replace(/\D/g, '');
  if (/^(024|054|055|059|025)/.test(p)) return { id: 'mtn', name: 'MTN Ghana' };
  if (/^(020|050)/.test(p)) return { id: 'telecel', name: 'Telecel Ghana' };
  return { id: 'airteltigo', name: 'AirtelTigo' };
}

function sikaStatusToDelivery(
  sikaStatus: string
): 'delivered' | 'pending' | 'processing' | 'failed' | 'refunded' {
  const s = (sikaStatus || '').toLowerCase();
  if (s === 'success') return 'processing';   // Payment confirmed — data dispatch in progress
  if (s === 'failed' || s === 'abandoned') return 'failed';
  if (s === 'refunded') return 'refunded';
  return 'pending';
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

    // Filter strictly by phone number
    const matches = (data.data as any[]).filter((t) => {
      const inEmail = (t.customer?.email || '').includes(cleanDigits);
      const inMeta  = (t.metadata?.recipient_phone || '').replace(/\D/g, '').includes(cleanDigits);
      const inPhone = (t.customer?.phone || '').replace(/\D/g, '').includes(cleanDigits);
      return inEmail || inMeta || inPhone;
    });

    if (matches.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No orders found for ${query}. Make sure you enter the number you used to pay.`,
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

    const orders = sorted.map((t) => {
      const recipientPhone =
        (t.metadata?.recipient_phone || '').replace(/\D/g, '') || cleanDigits;
      const { id: networkId, name: networkName } = detectNetwork(recipientPhone);
      const bundleName = t.metadata?.bundle_name || '';

      return {
        id: t.reference,
        network: networkId,
        networkName,
        bundle: bundleName ? `${bundleName} Data Bundle` : 'Data Bundle',
        data: bundleName,
        phone: recipientPhone,
        amount: Number(t.amount) || 0,
        status: sikaStatusToDelivery(t.status),
      };
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Track API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


