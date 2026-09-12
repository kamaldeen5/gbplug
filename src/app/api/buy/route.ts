import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Direct purchase endpoint is disabled for security. Use official checkout.' },
    { status: 403 }
  );
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Direct purchase endpoint is disabled for security. Use official checkout.' },
    { status: 403 }
  );
}
