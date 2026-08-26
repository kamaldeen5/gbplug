import { NextRequest, NextResponse } from 'next/server';
import { buyDataBundle, buyFlexaBundle } from '@/lib/datasika';

export const dynamic = 'force-dynamic';

const SIKAPAY_BASE_URL = 'https://api.sikapaygh.com/api/v1';

export async function GET(req: NextRequest) {
  try {
    const secretKey = process.env.SIKAPAY_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ success: false, error: 'SIKAPAY_SECRET_KEY is missing' }, { status: 500 });
    }

    // 1. Fetch recent transactions from SikaPay
    const res = await fetch(`${SIKAPAY_BASE_URL}/transaction`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      },
      cache: 'no-store',
    });

    const sikaData = await res.json();
    if (!sikaData.status || !Array.isArray(sikaData.data)) {
      return NextResponse.json({ success: false, message: 'No transactions found in SikaPay' });
    }

    const transactions = sikaData.data;
    const successfulTransactions = transactions.filter((t: any) => t.status?.toLowerCase() === 'success');

    const results = [];

    // 2. Loop through successful transactions and attempt DataSika dispatch
    for (const tx of successfulTransactions) {
      const recipient = tx.metadata?.recipient_phone || tx.customer?.phone?.replace(/\D/g, '').slice(-10);
      const productId = tx.metadata?.product_id;
      const reference = tx.reference;
      const isFlexa = tx.metadata?.service_type === 'mtn_flexa';

      if (!productId || !recipient || recipient.length !== 10) {
        continue;
      }

      try {
        const order = isFlexa
          ? await buyFlexaBundle({
              productId,
              recipient,
              idempotencyKey: `sikapay-${reference}`,
            })
          : await buyDataBundle({
              productId,
              recipient,
              idempotencyKey: `sikapay-${reference}`, // Guaranteed idempotent: won't double charge
            });

        results.push({
          reference,
          recipient,
          bundle: tx.metadata?.bundle_name,
          status: 'dispatched_successfully',
          orderId: order.order_id,
        });
      } catch (err: any) {
        results.push({
          reference,
          recipient,
          bundle: tx.metadata?.bundle_name,
          status: 'queued_or_failed',
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: results.length,
      details: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Queue processing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
