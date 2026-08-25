import { NextRequest, NextResponse } from 'next/server';
import { getOrderStatus } from '@/lib/datasika';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json(
        { error: 'order_id query parameter is required' },
        { status: 400 }
      );
    }

    const status = await getOrderStatus(orderId);
    return NextResponse.json(status);
  } catch (error: any) {
    console.error('Error fetching order status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order status' },
      { status: 500 }
    );
  }
}
