import { NextRequest, NextResponse } from 'next/server';
import { buyDataBundle } from '@/lib/datasika';
import { registerOrderEntry } from '@/lib/order-registry';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, recipient, idempotencyKey } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'product_id is required' },
        { status: 400 }
      );
    }

    if (!recipient) {
      return NextResponse.json(
        { error: 'recipient phone number is required' },
        { status: 400 }
      );
    }

    const cleanRecipient = recipient.toString().replace(/\D/g, '');
    if (cleanRecipient.length !== 10 || !cleanRecipient.startsWith('0')) {
      return NextResponse.json(
        { error: 'Recipient must be a valid 10-digit Ghana number starting with 0' },
        { status: 400 }
      );
    }

    const result = await buyDataBundle({
      productId,
      recipient: cleanRecipient,
      idempotencyKey,
    });

    // Register in order registry so tracking by phone always finds this order
    if (result.order_id) {
      registerOrderEntry({ orderId: result.order_id, recipient: cleanRecipient });
    }

    return NextResponse.json({
      success: true,
      order: result,
    });
  } catch (error: any) {
    console.error('Error executing buyDataBundle:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Data bundle dispatch failed',
      },
      { status: 500 }
    );
  }
}
