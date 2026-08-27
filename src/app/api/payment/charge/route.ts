import { NextRequest, NextResponse } from 'next/server';
import { initializePayment } from '@/lib/moolre';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, phone, bundleName, productId, callbackUrl, serviceType } = body;

    if (!amount || !phone || !bundleName || !productId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: amount, phone, bundleName, productId' },
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

    const result = await initializePayment({
      amount: Number(amount),
      phone: cleanPhone,
      bundleName,
      productId,
      callbackUrl,
      serviceType: serviceType || 'data_bundles',
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
    });
  } catch (error: any) {
    console.error('Moolre initialize error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment initiation failed' },
      { status: 500 }
    );
  }
}
