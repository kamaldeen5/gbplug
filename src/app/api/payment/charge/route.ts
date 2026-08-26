import { NextRequest, NextResponse } from 'next/server';
import { initiateMoMoCharge } from '@/lib/sikapay';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, phone, bundleName, productId } = body;

    if (!amount || !phone || !bundleName || !productId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: amount, phone, bundleName, productId' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.toString().replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !cleanPhone.startsWith('0')) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ghana phone number' },
        { status: 400 }
      );
    }

    // Generate a unique reference for this order
    const reference = `GBP-${Date.now()}-${cleanPhone.slice(-4)}`;

    const result = await initiateMoMoCharge({
      amount: Number(amount),
      phone: cleanPhone,
      reference,
      bundleName,
      productId,
    });

    if (!result.status) {
      return NextResponse.json(
        { success: false, error: result.message || 'Failed to initiate MoMo charge' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      reference,
      message: result.message,
      data: result.data,
    });
  } catch (error: any) {
    console.error('SikaPay charge error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment initiation failed' },
      { status: 500 }
    );
  }
}
