import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cutting-mat-studio.abhiram355203.chatgpt.site'),
  title: 'Cutting Mat — Wallpaper Studio',
  openGraph: { title: 'Cutting Mat — Wallpaper Studio', description: 'A little structure for your screen. Design your own cutting-mat wallpaper.', type: 'website', images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Cutting Mat wallpaper studio — grids, guides, good geometry.' }] },
  twitter: { card: 'summary_large_image', title: 'Cutting Mat — Wallpaper Studio', description: 'A little structure for your screen.', images: ['/og.png'] },
  description: 'A little structure for your screen. Create precision cutting-mat wallpapers with procedural grids, guides, and textures.',
};

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
      </body>
    </html>
  );
}
