import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/adminAuth';
import { getOrderStatus } from '@/lib/datasika';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lookupOrderId = searchParams.get('orderId') || searchParams.get('order_id');

    if (lookupOrderId) {
      try {
        const ds = await getOrderStatus(lookupOrderId.trim());
        return NextResponse.json({
          success: true,
          directOrder: ds,
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          error: err.message || 'Order lookup failed on DataSika',
        }, { status: 404 });
      }
    }

    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey) {
      return NextResponse.json({ success: false, error: 'PAYSTACK_SECRET_KEY not configured' }, { status: 500 });
    }

    // 1. Fetch recent Paystack transactions (last 40)
    const pRes = await fetch('https://api.paystack.co/transaction?perPage=40', {
      headers: { Authorization: `Bearer ${paystackKey}` },
      cache: 'no-store',
    });

    const pData = await pRes.json();
    const rawTxs: any[] = Array.isArray(pData.data) ? pData.data : [];

    // Filter only successful payments
    const successfulTxs = rawTxs.filter((t) => t.status === 'success');

    // 2. Correlate with DataSika orders
    const processedOrders = await Promise.all(
      successfulTxs.map(async (tx) => {
        const ref = tx.reference;
        const metadata = tx.metadata || {};
        const recipient = (metadata.recipient_phone || tx.customer?.phone || '').replace(/\D/g, '');
        const bundleName = metadata.bundle_name || `${(Number(tx.amount) / 100).toFixed(2)} GHS`;
        const serviceType = metadata.service_type || 'mtn_flexa';
        const paidAt = tx.paid_at || tx.paidAt || tx.created_at;
        const amountPaid = (Number(tx.amount) || 0) / 100;

        // Try checking DataSika status
        let dsStatus: any = null;
        let finalStatus = 'processing';
        let failureReason: string | null = null;
        let dataSikaOrderId = metadata.order_id || null;

        // Check if we can look up status by reference or order ID
        try {
          if (dataSikaOrderId) {
            dsStatus = await getOrderStatus(dataSikaOrderId);
          } else if (ref) {
            dsStatus = await getOrderStatus(ref);
          }
        } catch {}

        const txTime = paidAt ? new Date(paidAt).getTime() : 0;
        const minsAgo = txTime ? (Date.now() - txTime) / (1000 * 60) : 0;

        if (dsStatus && dsStatus.order_id) {
          dataSikaOrderId = dsStatus.order_id;
          const rawSt = (dsStatus.status || '').toLowerCase();
          if (rawSt === 'delivered') {
            finalStatus = 'delivered';
          } else if (rawSt === 'failed' || rawSt === 'refunded' || dsStatus.failure_reason) {
            finalStatus = 'refunded';
            failureReason = dsStatus.failure_reason || 'Order was refunded or rejected by telco gateway';
          } else {
            finalStatus = minsAgo > 3 ? 'delivered' : 'processing';
          }
        } else {
          // If DataSika direct query wasn't available by Paystack ref, but payment succeeded > 3 mins ago
          if (minsAgo > 3) {
            finalStatus = 'delivered';
          }
        }

        // Parse bundle GB number
        const gbMatch = bundleName.match(/([0-9.]+)\s*GB/i);
        const bundleGb = gbMatch ? parseFloat(gbMatch[1]) : parseFloat(bundleName) || 1;

        return {
          id: dataSikaOrderId || ref,
          reference: ref,
          orderId: dataSikaOrderId,
          recipient,
          bundleName,
          bundleGb,
          amountPaid,
          serviceType,
          status: finalStatus,
          failureReason,
          paidAt,
          rawTx: {
            id: tx.id,
            channel: tx.channel,
          },
        };
      })
    );

    // Filter into Action Needed (refunded/failed) and All Orders
    const actionNeeded = processedOrders.filter((o) => o.status === 'refunded' || !!o.failureReason);

    return NextResponse.json({
      success: true,
      actionNeeded,
      allOrders: processedOrders,
      totalCount: processedOrders.length,
      actionNeededCount: actionNeeded.length,
    });
  } catch (error: any) {
    console.error('Admin orders fetch error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
