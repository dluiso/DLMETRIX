import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Choose the right DLMETRIX plan for your needs. Start free and upgrade as you grow.',
  openGraph: {
    title: 'DLMETRIX Pricing – Plans & Features',
    description: 'Flexible plans for individuals, teams, and enterprises. Free, Pro, and Premium tiers available.',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
