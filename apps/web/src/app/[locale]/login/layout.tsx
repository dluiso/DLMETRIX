import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your DLMETRIX account to access your audit history, reports, and dashboard.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
