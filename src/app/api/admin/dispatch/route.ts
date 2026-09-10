import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/adminAuth';
import { buyDataBundle } from '@/lib/datasika';
import { registerOrderEntry } from '@/lib/order-registry';
import { REGULAR_MTN_PACKAGES } from '@/data/bundles';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { recipient, bundleGb, customProductId } = body;

    if (!recipient) {
      return NextResponse.json({ success: false, error: 'Recipient phone number is required' }, { status: 400 });
    }

    const cleanRecipient = recipient.toString().replace(/\D/g, '');
    if (cleanRecipient.length !== 10 || !cleanRecipient.startsWith('0')) {
      return NextResponse.json(
        { success: false, error: 'Recipient must be a valid 10-digit Ghana number starting with 0' },
        { status: 400 }
      );
    }

    // Find the matching Regular Normal MTN Product ID
    let targetProductId = customProductId;
    let targetGb = Number(bundleGb) || 1;

    if (!targetProductId) {
      const matched = REGULAR_MTN_PACKAGES.find((p) => p.gb === targetGb);
      if (matched) {
        targetProductId = matched.productId;
      } else {
        // Fallback to closest or default 1GB
        targetProductId = REGULAR_MTN_PACKAGES[0].productId;
      }
    }

    const idempotencyKey = `gbplug-admin-dispatch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    console.log(`[Admin Dispatch] Sending Regular Normal MTN (${targetGb} GB) to ${cleanRecipient}...`);

    const result = await buyDataBundle({
      productId: targetProductId,
      recipient: cleanRecipient,
      idempotencyKey,
    });

    if (result.order_id) {
      registerOrderEntry({ orderId: result.order_id, recipient: cleanRecipient });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully dispatched ${targetGb} GB Regular MTN data to ${cleanRecipient}!`,
      order: result,
      newBalance: (result as any).new_balance,
    });
  } catch (error: any) {
    console.error('Admin dispatch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to dispatch data bundle' },
      { status: 500 }
    );
  }
}
