import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GB Plug - Buy Data Instantly | Affordable Data Bundles in Ghana',
  description: 'Affordable data bundles for all networks in Ghana (MTN, Telecel, AirtelTigo). Instant delivery and secure payments.',
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
