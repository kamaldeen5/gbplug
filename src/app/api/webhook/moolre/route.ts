import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    { status: 0, error: 'Moolre payment gateway is inactive.' },
    { status: 403 }
  );
}
