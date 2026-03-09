import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'DLMETRIX – Professional Web Audit Tool', template: '%s | DLMETRIX' },
  description: 'Comprehensive website audits for performance, SEO, accessibility, security and more.',
  keywords: ['web audit', 'SEO analysis', 'performance', 'website analyzer', 'Core Web Vitals'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
