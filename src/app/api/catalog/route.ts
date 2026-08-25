import { NextResponse } from 'next/server';
import { getCatalog } from '@/lib/datasika';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const catalog = await getCatalog();
    return NextResponse.json(catalog);
  } catch (error: any) {
    console.error('Error fetching DataSika catalog:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch data bundle catalog' },
      { status: 500 }
    );
  }
}
