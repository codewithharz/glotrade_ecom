import type { Metadata } from "next";
import localFont from "next/font/local";
import { Poppins } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import ToastHost from "@/components/common/Toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-header",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://glotrade.online'),
  title: {
    default: 'GloTrade - Your Trusted African E-Commerce Marketplace',
    template: '%s | GloTrade'
  },
  description: 'Shop the best products across Africa with GloTrade. Secure payments, fast delivery, and quality guaranteed. Your one-stop marketplace for electronics, fashion, home goods, and more.',
  keywords: ['e-commerce', 'African marketplace', 'online shopping', 'GloTrade', 'buy online', 'sell online', 'African products', 'secure shopping'],
  authors: [{ name: 'GloTrade' }],
  creator: 'GloTrade',
  publisher: 'GloTrade',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://glotrade.online',
    siteName: 'GloTrade',
    title: 'GloTrade - Your Trusted African E-Commerce Marketplace',
    description: 'Shop the best products across Africa with GloTrade. Secure payments, fast delivery, and quality guaranteed.',
    images: [
      {
        url: '/glotrade_logo.png',
        width: 1200,
        height: 630,
        alt: 'GloTrade Logo',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GloTrade - Your Trusted African E-Commerce Marketplace',
    description: 'Shop the best products across Africa with GloTrade. Secure payments, fast delivery, and quality guaranteed.',
    images: ['/glotrade_logo.png'],
    creator: '@glotrade',
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
  verification: {
    google: 'c6niqZ0eRnxsCitlB4zi2qh7pG9oPgmPpuVVXc4iRdw',
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <ToastHost />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}