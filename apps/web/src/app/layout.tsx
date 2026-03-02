import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Kairo - Practice Management Software',
    template: '%s | Kairo',
  },
  description: 'Modern Practice Management System for Healthcare Practices in Zimbabwe. Manage appointments, patients, billing, and clinical notes.',
  metadataBase: new URL('https://kairo.clinic'),
  alternates: {
    canonical: '/',
  },
  keywords: [
    'practice management software',
    'healthcare software Zimbabwe',
    'clinic management system',
    'appointment scheduling',
    'patient records',
    'medical billing',
    'electronic health records',
  ],
  verification: {
    google: 'AocnB-sdXeusuNcWIpKWdFaZgXWmMHfUF4eTfUuvRyw',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Kairo - GP Practice Management',
    description: 'Modern GP Practice Management System for Healthcare Practices. Manage appointments, patients, billing, and clinical notes all in one place.',
    url: 'https://kairo.clinic',
    siteName: 'Kairo',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kairo - GP Practice Management System',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kairo - GP Practice Management',
    description: 'Modern GP Practice Management System for Healthcare Practices.',
    images: ['/og-image.png'],
  },
  other: {
    'theme-color': '#03989E',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
