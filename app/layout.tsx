import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Luminaire Solar - Leading Provider of Solar Solutions',
  description:
    'Comprehensive Solar Energy solutions for all your needs. Monitor and optimize your solar energy systems with AI-powered insights and smart maintenance.',
  keywords: [
    'solar energy',
    'solar panels',
    'solar solutions',
    'renewable energy',
    'solar monitoring',
    'solar calculator',
    'AI solar',
    'Heroku AI',
  ],
  authors: [{ name: 'Luminaire Solar' }],
  creator: 'Luminaire Solar',
  publisher: 'Luminaire Solar',
  icons: {
    icon: [{ url: '/mia-icon.png', type: 'image/png' }],
    apple: [{ url: '/mia-icon.png', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://luminaire-solar.com',
    siteName: 'Luminaire Solar',
    title: 'Luminaire Solar - Leading Provider of Solar Solutions',
    description:
      'Comprehensive Solar Energy solutions for all your needs. Monitor and optimize your solar energy systems with AI-powered insights and smart maintenance.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luminaire Solar - Leading Provider of Solar Solutions',
    description:
      'Comprehensive Solar Energy solutions for all your needs. Monitor and optimize your solar energy systems with AI-powered insights.',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
