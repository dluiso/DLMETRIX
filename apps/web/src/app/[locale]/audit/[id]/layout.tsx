import type { Metadata } from 'next';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  try {
    const res = await fetch(`${apiUrl}/audits/${params.id}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const audit = await res.json();
      const domain = audit.domain || 'Website';
      const score = audit.overallScore != null ? ` · Score ${audit.overallScore}/100` : '';
      return {
        title: `Audit: ${domain}${score}`,
        description: `Web audit results for ${domain}. Detailed analysis of performance, SEO, accessibility, security and content.`,
        openGraph: {
          title: `DLMETRIX Audit: ${domain}${score}`,
          description: `Detailed web audit for ${domain} covering Core Web Vitals, SEO, accessibility, and security.`,
        },
      };
    }
  } catch { /* fallback */ }

  return {
    title: 'Audit Results',
    description: 'Detailed website audit results from DLMETRIX.',
  };
}

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return children;
}
