import { NextRequest, NextResponse } from 'next/server';
import { POST as handleSikaPayWebhook } from '@/app/api/webhook/sikapay/route';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return handleSikaPayWebhook(req);
}
