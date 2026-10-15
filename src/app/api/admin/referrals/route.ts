import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/adminAuth';
import { getAllReferrersAdmin } from '@/lib/referrals';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getAllReferrersAdmin();

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    console.error('[Admin Referrals API Error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch referral data' },
      { status: 500 }
    );
  }
}
