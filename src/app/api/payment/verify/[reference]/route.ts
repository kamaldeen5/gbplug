import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/sikapay';
import { buyDataBundle } from '@/lib/datasika';

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

    // If payment is confirmed successful, trigger DataSika dispatch
    if (paymentStatus === 'success') {
      const url = new URL(req.url);
      const productId = url.searchParams.get('productId');
      const recipient = url.searchParams.get('recipient');

      if (productId && recipient) {
        try {
          const order = await buyDataBundle({
            productId,
            recipient: recipient.replace(/\D/g, ''),
            idempotencyKey: `sikapay-${reference}`, // Idempotent — safe to call multiple times
          });

          return NextResponse.json({
            success: true,
            paymentStatus: 'success',
            payment: result.data,
            order,
          });
        } catch (dispatchErr: any) {
          console.error('DataSika dispatch error after payment success:', dispatchErr);
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
