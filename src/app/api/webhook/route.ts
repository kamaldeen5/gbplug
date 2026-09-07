import { NextRequest } from 'next/server';
import { POST as handlePaystackWebhook } from '@/app/api/webhook/paystack/route';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return handlePaystackWebhook(req);
}
