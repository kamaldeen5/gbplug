import { NextRequest, NextResponse } from 'next/server';
import { getOrderStatus, buyDataBundle } from '@/lib/datasika';

export const dynamic = 'force-dynamic';

const SIKAPAY_BASE_URL = 'https://api.sikapaygh.com/api/v1';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('query') || '').trim();

    if (!query) {
      return NextResponse.json({ success: false, error: 'Query parameter is required' }, { status: 400 });
    }

    const secretKey = process.env.SIKAPAY_SECRET_KEY;
    const cleanDigits = query.replace(/\D/g, '');

    // 1. Direct search by DataSika order ID (starts with API-)
    if (query.toUpperCase().startsWith('API-')) {
      try {
        const dataSikaStatus = await getOrderStatus(query);
        return NextResponse.json({
          success: true,
          order: {
            id: dataSikaStatus.order_id,
            network: (dataSikaStatus.network || 'mtn').toLowerCase(),
            networkName: dataSikaStatus.network || 'MTN Ghana',
            bundle: `${dataSikaStatus.bundle_gb || ''} GB Data Bundle`.trim(),
            data: `${dataSikaStatus.bundle_gb || ''} GB`.trim(),
            phone: dataSikaStatus.recipient,
            amount: Number(dataSikaStatus.amount_charged) || 0,
            status: dataSikaStatus.status?.toLowerCase() || 'delivered',
            timestamp: 'Live Gateway Status',
          },
        });
      } catch (e) {
        console.error('DataSika direct lookup error:', e);
      }
    }

    // 2. Query SikaPay Live Transactions list
    if (secretKey) {
      try {
        const res = await fetch(`${SIKAPAY_BASE_URL}/transaction`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${secretKey}`,
          },
          cache: 'no-store',
        });

        const data = await res.json();

        if (data.status && Array.isArray(data.data)) {
          const transactions = data.data;

          // Match by reference, email, or recipient phone
          const match = transactions.find((t: any) => {
            const refMatch = t.reference?.toLowerCase() === query.toLowerCase();
            const emailMatch = t.customer?.email?.toLowerCase().includes(query.toLowerCase());
            const phoneInEmail = cleanDigits.length >= 9 && t.customer?.email?.includes(cleanDigits);
            const phoneInMeta = cleanDigits.length >= 9 && t.metadata?.recipient_phone?.includes(cleanDigits);
            const phoneInCustomer = cleanDigits.length >= 9 && t.customer?.phone?.includes(cleanDigits);
            return refMatch || emailMatch || phoneInEmail || phoneInMeta || phoneInCustomer;
          });

          if (match) {
            const isPaid = match.status?.toLowerCase() === 'success';
            const recipientPhone = match.metadata?.recipient_phone || cleanDigits || match.customer?.phone;
            const bundleName = match.metadata?.bundle_name || `${match.amount >= 20 ? '5 GB' : '1 GB'}`;
            const productId = match.metadata?.product_id;

            let deliveryStatus: 'delivered' | 'pending' | 'processing' | 'failed' | 'refunded' =
              isPaid ? 'processing' : 'pending';

            // If paid and has product_id, attempt/check DataSika dispatch
            if (isPaid && productId && recipientPhone) {
              try {
                const order = await buyDataBundle({
                  productId,
                  recipient: recipientPhone.replace(/\D/g, ''),
                  idempotencyKey: `sikapay-${match.reference}`,
                });
                if (order.status?.toLowerCase() === 'delivered') {
                  deliveryStatus = 'delivered';
                }
              } catch (dispatchErr: any) {
                // If DataSika is queued or low balance, it is safely in 'processing' state
                deliveryStatus = 'processing';
              }
            }

            const isMtn = recipientPhone.startsWith('024') || recipientPhone.startsWith('054') || recipientPhone.startsWith('055') || recipientPhone.startsWith('059');
            const isTelecel = recipientPhone.startsWith('020') || recipientPhone.startsWith('050');

            return NextResponse.json({
              success: true,
              order: {
                id: match.reference,
                network: isMtn ? 'mtn' : isTelecel ? 'telecel' : 'airteltigo',
                networkName: isMtn ? 'MTN Ghana' : isTelecel ? 'Telecel Ghana' : 'AirtelTigo',
                bundle: `${bundleName} Data Bundle`,
                data: bundleName,
                phone: recipientPhone,
                amount: Number(match.amount) || 0,
                status: deliveryStatus,
                timestamp: match.paid_at ? new Date(match.paid_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
              },
            });
          }
        }
      } catch (err) {
        console.error('SikaPay live transactions query error:', err);
      }
    }

    return NextResponse.json({ success: false, error: 'No active orders found for this search.' });
  } catch (error: any) {
    console.error('Track API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
