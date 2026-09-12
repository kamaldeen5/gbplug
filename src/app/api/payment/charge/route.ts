import { NextRequest, NextResponse } from 'next/server';
import { initializePayment } from '@/lib/paystack';
import { getOfficialBundle } from '@/data/bundles';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, phone, email, productId, callbackUrl, serviceType } = body;

    if (!phone || !productId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: phone, productId' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.toString().replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !cleanPhone.startsWith('0')) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ghana phone number (e.g. 0241234567)' },
        { status: 400 }
      );
    }

    // 1. STRICT SERVER-SIDE PRICE & PRODUCT VALIDATION
    const officialBundle = getOfficialBundle(productId);
    if (!officialBundle) {
      console.error(`[Security Alert] Unknown or invalid productId attempted: ${productId} by ${cleanPhone}`);
      return NextResponse.json(
        { success: false, error: 'Invalid bundle product ID. Transaction rejected.' },
        { status: 400 }
      );
    }

    // 2. DETECT CLIENT-SIDE PRICE TAMPERING FRAUD
    if (amount !== undefined && amount !== null) {
      const clientAmount = Number(amount);
      if (isNaN(clientAmount) || Math.abs(clientAmount - officialBundle.price) > 0.01) {
        console.error(
          `[SECURITY FRAUD BLOCKED] Price tampering attempt detected! Phone: ${cleanPhone}, Product: ${officialBundle.name} (${officialBundle.productId}), Client claimed: GHS ${clientAmount}, Official Price: GHS ${officialBundle.price}`
        );
        return NextResponse.json(
          {
            success: false,
            error: 'Security verification failed: Price tampering detected. Your transaction has been blocked.',
          },
          { status: 400 }
        );
      }
    }

    // 3. ALWAYS USE THE SERVER OFFICIAL PRICE FOR PAYMENT INITIALIZATION
    const verifiedAmount = officialBundle.price;
    const verifiedBundleName = officialBundle.name;
    const verifiedServiceType = officialBundle.serviceType || serviceType || 'data_bundles';

    const result = await initializePayment({
      amount: verifiedAmount,
      phone: cleanPhone,
      email: email || `${cleanPhone}@gbplug.com`,
      bundleName: verifiedBundleName,
      productId: officialBundle.productId,
      callbackUrl,
      serviceType: verifiedServiceType,
    });

    if (!result.status || !result.data) {
      return NextResponse.json(
        { success: false, error: result.message || 'Failed to initialize payment' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      reference: result.data.reference,
      authorization_url: result.data.authorization_url,
      access_code: result.data.access_code,
    });
  } catch (error: any) {
    console.error('Paystack initialize error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment initiation failed' },
      { status: 500 }
    );
  }
}
