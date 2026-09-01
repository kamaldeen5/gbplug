import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/moolre';
import { fulfillOrderOnce } from '@/lib/fulfillment';
import { queuePendingOrder } from '@/lib/order-registry';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    const { reference } = params;
    if (!reference) {
      return NextResponse.json({ success: false, error: 'Reference is required' }, { status: 400 });
    }

    const result = await verifyPayment(reference);

    if (!result.status || !result.data) {
      return NextResponse.json({ success: false, error: result.message || 'Payment not found' }, { status: 404 });
    }

    const paymentStatus = result.data.status?.toLowerCase();

    // If payment is confirmed successful, trigger single idempotent dispatch
    if (paymentStatus === 'success') {
      const url = new URL(req.url);
      const productId = url.searchParams.get('productId') || result.data.raw?.metadata?.product_id;
      const recipient = url.searchParams.get('recipient') || result.data.raw?.metadata?.recipient_phone;
      const serviceType = url.searchParams.get('serviceType') || result.data.raw?.metadata?.service_type;

      if (productId && recipient) {
        const cleanRecipient = recipient.replace(/\D/g, '');
        try {
          const order = await fulfillOrderOnce({
            reference,
            productId,
            recipient: cleanRecipient,
            serviceType,
          });

          return NextResponse.json({
            success: true,
            paymentStatus: 'success',
            payment: result.data,
            order,
          });
        } catch (dispatchErr: any) {
          console.error('DataSika dispatch error after payment success:', dispatchErr);
          // Queue for automated retry as soon as wallet balance is topped up
          queuePendingOrder({
            reference,
            productId,
            recipient: cleanRecipient,
            serviceType,
            createdAt: new Date().toISOString(),
          });

          return NextResponse.json({
            success: true,
            paymentStatus: 'success',
            payment: result.data,
            dispatchError: dispatchErr.message,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      paymentStatus,
      payment: result.data,
    });
  } catch (error: any) {
    console.error('Payment verify error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
