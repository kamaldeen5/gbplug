import { NextRequest, NextResponse } from 'next/server';
import { POST as handleMoolreWebhook } from '@/app/api/webhook/moolre/route';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return handleMoolreWebhook(req);
}
