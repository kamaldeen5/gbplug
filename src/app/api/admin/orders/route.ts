import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/adminAuth';
import { getOrderStatus } from '@/lib/datasika';
import { getOrderByRef } from '@/lib/order-registry';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
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
        const customerCode = tx.customer?.customer_code;

        // Check persistent customer metadata first, then in-memory registry
        const customerSavedOrders = tx.customer?.metadata?.orders || {};
        const savedOrder = customerSavedOrders[ref];

        const registryEntry = getOrderByRef(ref);
        let dataSikaOrderId =
          savedOrder?.orderId ||
          metadata.order_id ||
          registryEntry?.orderId ||
          null;

        let dsStatus: any = null;
        let finalStatus = savedOrder?.status || 'processing';
        let failureReason: string | null = savedOrder?.failureReason || null;

        // Query live status directly from DataSika if we have an ID
        if (dataSikaOrderId) {
          try {
            dsStatus = await getOrderStatus(dataSikaOrderId);
          } catch {}
        } else if (ref && (ref.startsWith('API-') || ref.startsWith('FLX-'))) {
          try {
            dsStatus = await getOrderStatus(ref);
          } catch {}
        }

        if (dsStatus && dsStatus.order_id) {
          dataSikaOrderId = dsStatus.order_id;
          const rawSt = (dsStatus.status || '').toLowerCase();
          if (rawSt === 'delivered') {
            finalStatus = 'delivered';
            failureReason = null;
          } else if (rawSt === 'failed' || rawSt === 'refunded' || dsStatus.failure_reason) {
            finalStatus = 'refunded';
            failureReason = dsStatus.failure_reason || 'Order was refunded or rejected by telco gateway';
          } else {
            finalStatus = rawSt || 'processing';
          }
        } else {
          // If no live DataSika response was found, check if it was marked refunded in saved metadata
          if (savedOrder?.status === 'refunded' || savedOrder?.failureReason) {
            finalStatus = 'refunded';
            failureReason = savedOrder.failureReason || 'Dispatch failed on DataSika gateway';
          }
        }

        const paidTime = new Date(paidAt).getTime();
        const minutesElapsed = (Date.now() - paidTime) / 60000;
        const hoursElapsed = minutesElapsed / 60;
        const isFlexa = serviceType === 'mtn_flexa' || metadata.service_type === 'mtn_flexa';

        // Proactive safety check for active orders within last 24h
        if (savedOrder?.status === 'delivered') {
          finalStatus = 'delivered';
          failureReason = null;
        } else if (savedOrder?.status === 'refunded' || savedOrder?.failureReason) {
          finalStatus = 'refunded';
          failureReason = savedOrder.failureReason;
        } else if (finalStatus !== 'delivered' && minutesElapsed >= 2 && hoursElapsed <= 24) {
          if (!dataSikaOrderId) {
            finalStatus = 'refunded';
            failureReason = failureReason || 'Unconfirmed dispatch. Check if number is non-Flexa and send normal data.';
          } else if (finalStatus === 'processing' && minutesElapsed >= 5) {
            finalStatus = 'refunded';
            failureReason = failureReason || 'Processing delay exceeding 5 minutes. Possible telco refund or stall.';
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
          customerCode,
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
