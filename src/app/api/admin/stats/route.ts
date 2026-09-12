import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// Exact wholesale cost by bundle size (in GHS)
const WHOLESALE_COST_MAP: Record<number, number> = {
  1: 3.95,
  2: 8.00,
  3: 12.00,
  4: 16.00,
  5: 20.00,
  6: 24.00,
  8: 33.00,
  10: 40.00,
  15: 60.00,
  20: 78.00,
  25: 98.00,
  30: 119.00,
  40: 160.00,
  50: 195.00,
};

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

    const dailyEarnings: Record<string, { revenue: number; profit: number; orders: number }> = {};
    let totalRevenue = 0;
    let totalPaystackFees = 0;
    let totalWholesaleCost = 0;
    let totalOrders = 0;

    if (txRes && txRes.ok) {
      const txData = await txRes.json();
      const txs: any[] = Array.isArray(txData.data) ? txData.data : [];

      txs.forEach((t) => {
        const gross = (Number(t.amount) || 0) / 100;
        const fee = (Number(t.fees) || 0) / 100;
        const meta = t.metadata || {};
        const customerOrders = t.customer?.metadata?.orders || {};
        const saved = customerOrders[t.reference] || {};

        // Extract bundle GB from metadata or estimate from amount
        const parsedGb = Number(meta.bundle_gb || (meta.bundle_name || '').replace(/\D/g, ''));
        const gb = parsedGb > 0 ? parsedGb : gross < 5 ? 1 : gross < 10 ? 2 : gross < 14 ? 3 : 1;
        const standardCost = WHOLESALE_COST_MAP[gb] || gb * 4.0;

        // Exclude fraudulent underpayment transactions (e.g. paying 1 GHS for 30GB or 50GB)
        const isFraud =
          (gross <= 1.0 && gb > 1) ||
          (gross < standardCost * 0.6 && gb >= 3) ||
          saved.status === 'fraud_blocked';

        if (isFraud) {
          // Do not contaminate business revenue or incur phantom wholesale cost
          return;
        }

        // Only incur wholesale cost if DataSika actually dispatched the order
        const isUndispatched = saved.orderId === null && !!saved.failureReason && saved.status !== 'delivered';
        const cost = isUndispatched ? 0 : standardCost;
        const profit = gross - fee - cost;

        const day = (t.paid_at || t.created_at || '').substring(0, 10);
        if (day) {
          if (!dailyEarnings[day]) dailyEarnings[day] = { revenue: 0, profit: 0, orders: 0 };
          dailyEarnings[day].revenue += gross;
          dailyEarnings[day].profit += profit;
          dailyEarnings[day].orders += 1;
        }

        totalRevenue += gross;
        totalPaystackFees += fee;
        totalWholesaleCost += cost;
        totalOrders += 1;
      });
    }

    const netProfit = totalRevenue - totalPaystackFees - totalWholesaleCost;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const chartData = Object.entries(dailyEarnings)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, val]) => ({
        date,
        revenue: Math.round(val.revenue * 100) / 100,
        profit: Math.round(val.profit * 100) / 100,
        orders: val.orders,
      }));

    return NextResponse.json({
      success: true,
      wallet,
      chartData,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalPaystackFees: Math.round(totalPaystackFees * 100) / 100,
      totalWholesaleCost: Math.round(totalWholesaleCost * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      profitMargin: Math.round(profitMargin * 10) / 10,
      totalOrders,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
