import { NextResponse } from 'next/server';
import { getCatalog } from '@/lib/datasika';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const catalog = await getCatalog();
    const isDataBundlesAvailable = catalog.services?.data_bundles?.available ?? true;

    // Check if custom pause env var is active
    const isManuallyPaused = process.env.MAINTENANCE_MODE === 'true';

    return NextResponse.json({
      inStock: isDataBundlesAvailable && !isManuallyPaused,
      message: isManuallyPaused
        ? 'Temporarily restocking. Back shortly!'
        : isDataBundlesAvailable
        ? 'Orders Fulfilled Same Day'
        : 'Service temporarily undergoing routine provider maintenance.',
    });
  } catch (error: any) {
    return NextResponse.json({
      inStock: true, // Default to operational
      message: 'Active',
    });
  }
}
