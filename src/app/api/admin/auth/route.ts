import { NextRequest, NextResponse } from 'next/server';
import { getAdminPin, generateAdminToken } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();
    const correctPin = getAdminPin();

    if (!pin || pin.toString().trim() !== correctPin) {
      return NextResponse.json({ success: false, error: 'Invalid secret PIN' }, { status: 401 });
    }

    const token = generateAdminToken(correctPin);

    return NextResponse.json({
      success: true,
      token,
      message: 'Authentication successful',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Auth error' }, { status: 500 });
  }
}
