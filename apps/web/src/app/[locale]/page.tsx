import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturesSection } from '@/components/home/features-section';
import { StatsSection } from '@/components/home/stats-section';
import { PricingSection } from '@/components/home/pricing-section';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'DLMETRIX – Professional Web Audit Tool',
  description: 'Analyze your website for performance, SEO, accessibility, security and content quality. Get actionable insights with DLMETRIX.',
  openGraph: {
    title: 'DLMETRIX – Professional Web Audit Tool',
    description: 'Comprehensive website audits covering Core Web Vitals, SEO, accessibility, security, and more.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DLMETRIX – Professional Web Audit Tool',
    description: 'Comprehensive website audits covering Core Web Vitals, SEO, accessibility, security, and more.',
  },
};

export default async function HomePage() {
  const t = await getTranslations('home');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="h-[520px]" />}>
          <HeroSection />
        </Suspense>
        <FeaturesSection />
        <StatsSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
