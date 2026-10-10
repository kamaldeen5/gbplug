import { NextRequest, NextResponse } from 'next/server';
import { normalizeGhanaPhone, getOrCreateReferrer } from '@/lib/referrals';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const cleanPhone = normalizeGhanaPhone(phone);
    if (cleanPhone.length !== 10 || !cleanPhone.startsWith('0')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit Ghana phone number (e.g. 0541234567)' },
        { status: 400 }
      );
    }

    // Frictionless login/signup: gets or creates referrer account
    const referrer = await getOrCreateReferrer(cleanPhone);

    const response = NextResponse.json({
      success: true,
      referrer: {
        phone: referrer.phone,
        referralCode: referrer.referralCode,
        rewardsEarned: referrer.rewardsEarned,
        totalEligibleGb: referrer.totalEligibleGb,
      },
    });

    // Set authenticated session cookie for 30 days
    response.cookies.set('gbplug_ref_session', cleanPhone, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    console.error('Referrals auth error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
