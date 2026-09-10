import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.DATA_API_KEY || process.env.DSK_API_KEY;
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;

    const [walletRes, txRes] = await Promise.all([
      fetch('https://nrsfvhztpzwkadwciizp.supabase.co/functions/v1/api-wallet', {
        headers: { Authorization: 'Bearer ' + apiKey },
        cache: 'no-store',
      }),
      paystackKey
        ? fetch('https://api.paystack.co/transaction?perPage=100&status=success', {
            headers: { Authorization: 'Bearer ' + paystackKey },
            cache: 'no-store',
          })
        : Promise.resolve(null),
    ]);

    let wallet = null;
    if (walletRes.ok) wallet = await walletRes.json();

    const dailyEarnings: Record<string, { revenue: number; orders: number }> = {};
    let totalRevenue = 0;
    let totalOrders = 0;

    if (txRes && txRes.ok) {
      const txData = await txRes.json();
      const txs: any[] = Array.isArray(txData.data) ? txData.data : [];
      txs.forEach((t) => {
        const amount = (Number(t.amount) || 0) / 100;
        const day = (t.paid_at || t.created_at || '').substring(0, 10);
        if (!day) return;
        if (!dailyEarnings[day]) dailyEarnings[day] = { revenue: 0, orders: 0 };
        dailyEarnings[day].revenue += amount;
        dailyEarnings[day].orders += 1;
        totalRevenue += amount;
        totalOrders += 1;
      });
    }

    const chartData = Object.entries(dailyEarnings)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, val]) => ({
        date,
        revenue: Math.round(val.revenue * 100) / 100,
        orders: val.orders,
      }));

    return NextResponse.json({
      success: true,
      wallet,
      chartData,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
