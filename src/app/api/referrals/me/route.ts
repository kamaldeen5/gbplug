import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateReferrer, normalizeGhanaPhone } from '@/lib/referrals';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('gbplug_ref_session')?.value;
    const phoneParam = req.nextUrl.searchParams.get('phone');
    const phone = normalizeGhanaPhone(sessionCookie || phoneParam || '');

    if (!phone || phone.length !== 10) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const referrer = await getOrCreateReferrer(phone);
    const referredList = Object.values(referrer.referredCustomers || {}).sort((a, b) => {
      const aTime = a.purchases?.[a.purchases.length - 1]?.timestamp || '';
      const bTime = b.purchases?.[b.purchases.length - 1]?.timestamp || '';
      return bTime.localeCompare(aTime);
    });

    return NextResponse.json({
      success: true,
      authenticated: true,
      referrer: {
        phone: referrer.phone,
        referralCode: referrer.referralCode,
        createdAt: referrer.createdAt,
        rewardsEarned: referrer.rewardsEarned || 0,
        totalEligibleGb: referrer.totalEligibleGb || 0,
        totalReferredCount: Object.keys(referrer.referredCustomers || {}).length,
        referredCustomers: referredList,
      },
    });
  } catch (err: any) {
    console.error('Referrals me endpoint error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch referral details' },
      { status: 500 }
    );
  }
}
