import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = (params?.code || '').trim().toUpperCase();
  const origin = 'https://gbplug.com';

  const redirectUrl = new URL('/', origin);
  if (code) {
    redirectUrl.searchParams.set('ref', code);
  }

  // Render Open Graph tags with ONLY the logo image (strictly NO text snippet)
  // and instantly redirect browser visitors via JavaScript & meta refresh
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>GB Plug</title>
  
  <!-- Open Graph: Image only, no text snippet -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${origin}/r/${code}" />
  <meta property="og:title" content="GB Plug" />
  <meta property="og:image" content="${origin}/logo.jpg" />
  <meta property="og:image:secure_url" content="${origin}/logo.jpg" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1024" />
  <meta property="og:image:height" content="527" />
  <meta property="og:site_name" content="GB Plug" />

  <!-- Twitter Card: Large Image -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="GB Plug" />
  <meta name="twitter:image" content="${origin}/logo.jpg" />

  <meta http-equiv="refresh" content="0;url=${redirectUrl.toString()}" />
</head>
<body>
  <script>window.location.replace("${redirectUrl.toString()}");</script>
  <p>Loading <a href="${redirectUrl.toString()}">GB Plug</a>...</p>
</body>
</html>`;

  const response = new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });

  if (code) {
    response.cookies.set('gbplug_ref', code, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: 'lax',
    });
  }

  return response;
}
