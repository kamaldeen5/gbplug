import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = (params?.code || '').trim().toUpperCase();
  const origin = req.nextUrl.origin || 'https://gbplug.com';

  const redirectUrl = new URL('/', origin);
  if (code) {
    redirectUrl.searchParams.set('ref', code);
  }

  const response = NextResponse.redirect(redirectUrl);

  if (code) {
    // 30 days cookie attribution
    response.cookies.set('gbplug_ref', code, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false, // readable by client-side checkout
      sameSite: 'lax',
    });
  }

  return response;
}
