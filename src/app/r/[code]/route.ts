import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function isCrawler(userAgent: string): boolean {
  const ua = (userAgent || '').toLowerCase();
  return (
    ua.includes('whatsapp') ||
    ua.includes('facebookexternalhit') ||
    ua.includes('facebot') ||
    ua.includes('twitterbot') ||
    ua.includes('telegrambot') ||
    ua.includes('slackbot') ||
    ua.includes('discordbot') ||
    ua.includes('linkedinbot') ||
    ua.includes('googlebot') ||
    ua.includes('bingbot')
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = (params?.code || '').trim().toUpperCase();
  const origin = 'https://gbplug.com';
  const ua = req.headers.get('user-agent') || '';

  const redirectUrl = new URL('/', origin);
  if (code) {
    redirectUrl.searchParams.set('ref', code);
  }

  // If a social media crawler (WhatsApp, Facebook, etc.) is scraping the link preview:
  // Render full Open Graph tags pulling only the official GB Plug logo image!
  if (isCrawler(ua)) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>GB Plug | Buy Cheap MTN, Telecel & AT Data Bundles</title>
  <meta name="description" content="Instant SIM delivery 24/7. Get FREE 1 GB per friend on GB Plug!" />
  
  <!-- Open Graph / WhatsApp Preview -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${origin}/r/${code}" />
  <meta property="og:title" content="GB Plug | Cheap MTN, Telecel & AT Data" />
  <meta property="og:description" content="Instant SIM delivery 24/7. Get FREE 1 GB per friend on GB Plug!" />
  <meta property="og:image" content="${origin}/logo.jpg" />
  <meta property="og:image:secure_url" content="${origin}/logo.jpg" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1024" />
  <meta property="og:image:height" content="527" />
  <meta property="og:site_name" content="GB Plug Ghana" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="GB Plug | Cheap MTN, Telecel & AT Data" />
  <meta name="twitter:description" content="Instant SIM delivery 24/7. Get FREE 1 GB per friend on GB Plug!" />
  <meta name="twitter:image" content="${origin}/logo.jpg" />

  <meta http-equiv="refresh" content="0;url=${redirectUrl.toString()}" />
</head>
<body>
  <script>window.location.replace("${redirectUrl.toString()}");</script>
  <p>Redirecting to <a href="${redirectUrl.toString()}">GB Plug</a>...</p>
</body>
</html>`;

    const htmlResponse = new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

    if (code) {
      htmlResponse.cookies.set('gbplug_ref', code, {
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: false,
        sameSite: 'lax',
      });
    }

    return htmlResponse;
  }

  // Real user in browser: direct 307 redirect + cookie
  const response = NextResponse.redirect(redirectUrl);

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
