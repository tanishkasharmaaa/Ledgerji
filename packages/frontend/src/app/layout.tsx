import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#3b82f6',
};

export const metadata: Metadata = {
  title: {
    default: 'LedgerJi - Simple Business Money Tracker',
    template: '%s | LedgerJi',
  },
  description: 'Super simple money tracking app for local Indian businesses. Track pending payments, send WhatsApp reminders, and collect money faster.',
  keywords: [
    'khata app', 'ledger app', 'udhaar app', 'business payment reminder',
    'local business accounting', 'money tracker', 'pending payment app',
    'WhatsApp payment reminder', 'UPI QR payment', 'small business bookkeeping',
    'kirana store app', 'shop ledger', 'customer balance tracker',
  ],
  authors: [{ name: 'LedgerJi' }],
  creator: 'LedgerJi',
  publisher: 'LedgerJi',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ledgerji.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'LedgerJi',
    title: 'LedgerJi - Simple Business Money Tracker',
    description: 'Track pending payments, send WhatsApp reminders, collect money faster. Built for local Indian businesses.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'LedgerJi' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LedgerJi - Simple Business Money Tracker',
    description: 'Track pending payments, send WhatsApp reminders, collect money faster.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
  manifest: '/manifest.json',
  
  // ---- FIXED PWA APP ICONS ----
  icons: {
    icon: [
      { url: '/ledgerji-logo.svg', type: 'image/svg+xml' },                         // Browser tab
      { url: '/ledgerji-192.png', sizes: '192x192', type: 'image/png' },               // Android App Drawer Icon
      { url: '/ledgerji-512.png', sizes: '512x512', type: 'image/png' },               // Splash / Loading Screen Icon
    ],
    apple: [
      { url: '/ledgerji-logo.png', sizes: '180x180', type: 'image/png' },             // iOS Home Screen icon
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'LedgerJi',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web, Android, iOS',
              description: 'Super simple money tracking app for local Indian businesses. Track pending payments and send WhatsApp reminders.',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
            }),
          }}
        />
        {/* SW registration — only in production */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(registration) { console.log('SW registered:', registration.scope); },
                      function(err) { console.log('SW registration failed:', err); }
                    );
                  });
                }
              `,
            }}
          />
        )}
      </head>
      <body className="min-h-screen bg-surface-secondary" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              className: 'text-sm-touch font-medium',
              duration: 3000,
            }}
            richColors
            closeButton
          />
        </Providers>
      </body>
    </html>
  );
}