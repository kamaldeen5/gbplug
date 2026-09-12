import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/paystack';
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
      const customerCode = result.data.raw?.customer?.customer_code;

      if (productId && recipient) {
        // ANTI-FRAUD: Validate that the amount paid strictly matches the official price
        const { getOfficialBundle } = await import('@/data/bundles');
        const officialBundle = getOfficialBundle(productId);

        if (!officialBundle) {
          console.error(`[SECURITY FRAUD] Unrecognized productId in verify: ${productId}`);
          return NextResponse.json({ success: false, error: 'Invalid product bundle' }, { status: 400 });
        }

        const paidGhs = Number(result.data.amount) || 0;
        if (paidGhs < officialBundle.price - 0.01) {
          console.error(
            `[SECURITY FRAUD BLOCKED] Underpayment intercepted on verify! Ref: ${reference}, Paid: GHS ${paidGhs.toFixed(2)}, Required: GHS ${officialBundle.price.toFixed(2)}. Dispatch prevented.`
          );
          const { saveCustomerOrderMetadata } = await import('@/lib/paystack');
          if (customerCode) {
            saveCustomerOrderMetadata(customerCode, reference, {
              status: 'fraud_blocked',
              failureReason: `Security Alert: Underpaid GHS ${paidGhs.toFixed(2)} for ${officialBundle.name} (Required: GHS ${officialBundle.price.toFixed(2)})`,
            }).catch(() => {});
          }
          return NextResponse.json(
            { success: false, error: 'Payment verification failed: Underpaid transaction detected.' },
            { status: 400 }
          );
        }

        const cleanRecipient = recipient.replace(/\D/g, '');
        try {
          const order = await fulfillOrderOnce({
            reference,
            productId: officialBundle.productId,
            recipient: cleanRecipient,
            serviceType: officialBundle.serviceType || serviceType,
            customerCode,
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
