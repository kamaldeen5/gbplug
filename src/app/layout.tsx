import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://gbplug.com'),
  title: {
    default: 'GB Plug | Buy Cheap MTN, Telecel & AT Data Bundles in Ghana',
    template: '%s | GB Plug Ghana',
  },
  description:
    'Instant SIM delivery 24/7. Get free 1 GB per friend on GB Plug!',
  applicationName: 'GB Plug',
  authors: [{ name: 'GB Plug Ghana', url: 'https://gbplug.com' }],
  keywords: [
    'buy cheap data ghana',
    'mtn flexa data bundle',
    'buy mtn data online',
    'telecel ghana data',
    'airteltigo data bundles',
    'cheap data plug ghana',
    'instant data top up ghana',
    'momo data bundles',
    'gbplug',
    'gb plug',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'GB Plug',
    url: 'https://gbplug.com',
    siteName: 'GB Plug',
    locale: 'en_GH',
    type: 'website',
    images: [
      {
        url: 'https://gbplug.com/logo.jpg',
        secureUrl: 'https://gbplug.com/logo.jpg',
        width: 1024,
        height: 527,
        alt: 'GB Plug',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GB Plug',
    images: ['https://gbplug.com/logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GB Plug',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#070D18' },
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta property="og:image" content="https://gbplug.com/logo.jpg" />
        <meta property="og:image:secure_url" content="https://gbplug.com/logo.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="527" />
        <meta name="twitter:image" content="https://gbplug.com/logo.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#070D18] dark:bg-[#070D18] text-slate-100 min-h-screen transition-colors duration-200 antialiased selection:bg-[#00C853]/20 selection:text-[#00C853] overflow-x-hidden">
        {/* Google Analytics (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-GK8K452QSZ"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-GK8K452QSZ', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

        {children}
      </body>
    </html>
  );
}
