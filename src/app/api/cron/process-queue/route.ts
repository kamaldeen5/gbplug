import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      status: 'active',
      gateway: 'moolre',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Queue processing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
