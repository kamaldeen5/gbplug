import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/adminAuth';
import { dismissOrderRef } from '@/lib/order-registry';
import { saveCustomerOrderMetadata } from '@/lib/paystack';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { reference, customerCode } = body;

    if (!reference) {
      return NextResponse.json({ success: false, error: 'Reference is required' }, { status: 400 });
    }

    // Dismiss in in-memory registry
    dismissOrderRef(reference);

    // Dismiss in Paystack customer metadata so it persists across all server lambdas
    if (customerCode) {
      await saveCustomerOrderMetadata(customerCode, reference, {
        status: 'delivered',
        failureReason: null,
        dismissed: true,
      }).catch((err) => console.error('[Dismiss Order] Error updating metadata:', err));
    }

    return NextResponse.json({ success: true, message: 'Order dismissed from Action Needed' });
  } catch (error: any) {
    console.error('Dismiss order error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to dismiss order' }, { status: 500 });
  }
}
