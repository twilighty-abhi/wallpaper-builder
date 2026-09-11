import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const siteUrl = 'https://cutting-mat-studio.abhiram355203.chatgpt.site';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Cutting Mat — Wallpaper Studio',
  applicationName: 'Cutting Mat Studio',
  alternates: { canonical: '/' },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: { title: 'Cutting Mat — Wallpaper Studio', description: 'A little structure for your screen. Design your own cutting-mat wallpaper.', url: '/', siteName: 'Cutting Mat Studio', type: 'website', images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Cutting Mat wallpaper studio — grids, guides, good geometry.' }] },
  twitter: { card: 'summary_large_image', title: 'Cutting Mat — Wallpaper Studio', description: 'A little structure for your screen.', images: ['/og.png'] },
  description: 'A little structure for your screen. Create precision cutting-mat wallpapers with procedural grids, guides, and textures.',
};

export const viewport = { themeColor: '#174c3c', colorScheme: 'dark' };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-E6Y3QLH6XN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-E6Y3QLH6XN');`}
        </Script>
      </body>
    </html>
  );
}
