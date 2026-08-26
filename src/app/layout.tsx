import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GB Plug - Buy Cheap Data Ghana | Fast Delivery',
  description: 'Ghana’s #1 data bundle plug. Buy affordable non-expiry data for MTN, Telecel, and AirtelTigo with Mobile Money.',
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
  applicationName: 'GB Plug',
  authors: [{ name: 'GB Plug Ghana' }],
  keywords: ['data bundle ghana', 'cheap data', 'buy mtn data', 'buy telecel data', 'airteltigo data', 'ghana data plug'],
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
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#070D18] dark:bg-[#070D18] text-slate-100 min-h-screen transition-colors duration-200 antialiased selection:bg-[#00C853]/20 selection:text-[#00C853] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
