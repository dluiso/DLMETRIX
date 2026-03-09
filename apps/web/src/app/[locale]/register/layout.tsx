import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a free DLMETRIX account and start auditing your websites today.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
