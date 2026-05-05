import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter, IBM_Plex_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import Heartbeat from '@/components/Heartbeat';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-ibm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Daily Slice',
  description: 'Vote the best slice in town. A daily pizza battle for Lake Orion & Rochester Hills.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'The Daily Slice',
  },
  openGraph: {
    title: 'The Daily Slice',
    description: 'Vote the best slice in town.',
    type: 'website',
    images: ['/icon-512.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#D93025',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${ibmMono.variable}`}>
      <body>
        {children}
        <Analytics />
        <Heartbeat />
        <p style={{ position: 'fixed', bottom: '6px', right: '8px', fontSize: '9px', opacity: 0.25, color: '#1C1C1C', fontFamily: 'var(--font-inter)', pointerEvents: 'none', zIndex: 9999, userSelect: 'none' }}>
          © 2026 Key Service Corporation. All Rights Reserved.
        </p>
      </body>
    </html>
  );
}
