'use client';

import { useState } from 'react';
import type { SeoData } from '@dlmetrix/shared';
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  seo: SeoData;
  userRole?: string; // 'PUBLIC' | 'PRO' | 'PREMIUM' | 'ADMIN'
}

function StatusIcon({ ok, warn }: { ok?: boolean; warn?: boolean }) {
  if (ok) return <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />;
  if (warn) return <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />;
  return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
}

function DetailRow({ label, value, status, detail, isPaid, userRole }: {
  label: string;
  value: string | number | boolean | null | undefined;
  status: 'good' | 'warn' | 'bad';
  detail?: string;   // detailed recommendation (paid only)
  isPaid?: boolean;  // this detail requires paid plan
  userRole?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isPaidUser = userRole === 'PRO' || userRole === 'PREMIUM' || userRole === 'ADMIN';
  const showDetail = detail && (!isPaid || isPaidUser);
  const showUpgrade = detail && isPaid && !isPaidUser;

  const rowColor = status === 'good'
    ? 'border-l-green-500 bg-green-50 dark:bg-green-950/20'
    : status === 'warn'
    ? 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/20'
    : 'border-l-red-500 bg-red-50 dark:bg-red-950/20';

  return (
    <div className={cn('border-l-4 rounded-r-lg px-4 py-3', rowColor)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <StatusIcon ok={status === 'good'} warn={status === 'warn'} />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-shrink-0">{label}</span>
          {value !== null && value !== undefined && value !== '' && (
            <span className="text-xs text-muted-foreground truncate">
              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
            </span>
          )}
        </div>
        {(showDetail || showUpgrade) && (
          <button onClick={() => setExpanded(!expanded)} className="flex-shrink-0">
            {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
        )}
      </div>
      {expanded && showDetail && (
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 ml-6 leading-relaxed">{detail}</p>
      )}
      {expanded && showUpgrade && (
        <p className="mt-2 text-xs text-brand-600 ml-6">
          Upgrade to PRO for detailed recommendations and actionable fixes.
        </p>
      )}
    </div>
  );
}

export function SeoDetailPanel({ seo, userRole }: Props) {
  const [showAllHeadings, setShowAllHeadings] = useState(false);

  const headings = seo.headingStructure || [];
  const displayedHeadings = showAllHeadings ? headings : headings.slice(0, 10);

  const titleStatus = !seo.title ? 'bad'
    : (seo.titleLength || 0) < 10 ? 'bad'
    : (seo.titleLength || 0) > 60 ? 'warn'
    : 'good';

  const descStatus = !seo.metaDescription ? 'bad'
    : (seo.metaDescriptionLength || 0) < 50 ? 'warn'
    : (seo.metaDescriptionLength || 0) > 160 ? 'warn'
    : 'good';

  const h1Status = (seo.h1Count || 0) === 0 ? 'bad' : (seo.h1Count || 0) > 1 ? 'warn' : 'good';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
      <h3 className="font-semibold mb-1">SEO Analysis</h3>
      <p className="text-xs text-muted-foreground mb-5">Technical SEO signals and on-page optimization factors</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Title & Meta */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Title &amp; Meta</p>
          <div className="space-y-2">
            <DetailRow
              label="Page Title"
              value={seo.title ? `"${seo.title.substring(0, 40)}${(seo.title?.length || 0) > 40 ? '…' : ''}" (${seo.titleLength} chars)` : 'Missing'}
              status={titleStatus}
              detail={titleStatus !== 'good' ? `Your title is ${seo.titleLength || 0} characters. Ideal length is 30-60 characters. Keep it descriptive, include your main keyword near the start, and avoid duplicate titles across pages.` : undefined}
              isPaid
              userRole={userRole}
            />
            <DetailRow
              label="Meta Description"
              value={seo.metaDescription ? `${seo.metaDescriptionLength} chars` : 'Missing'}
              status={descStatus}
              detail={descStatus !== 'good' ? `Your meta description is ${seo.metaDescriptionLength || 0} characters. Ideal is 120-160 characters. Write a compelling summary that includes your main keyword and a call-to-action to improve click-through rate.` : undefined}
              isPaid
              userRole={userRole}
            />
            <DetailRow
              label="H1 Tag"
              value={seo.h1Text?.[0] ? `"${seo.h1Text[0].substring(0, 40)}${(seo.h1Text[0]?.length || 0) > 40 ? '…' : ''}"` : `Count: ${seo.h1Count || 0}`}
              status={h1Status}
              detail={h1Status === 'bad' ? 'No H1 tag found. Every page should have exactly one H1 tag containing your primary keyword. The H1 is a strong on-page SEO signal.' : h1Status === 'warn' ? `Found ${seo.h1Count} H1 tags. Use exactly one H1 per page to clearly signal the main topic to search engines.` : undefined}
              isPaid
              userRole={userRole}
            />
            <DetailRow
              label="Canonical URL"
              value={seo.canonicalUrl || 'Not set'}
              status={seo.canonicalUrl ? 'good' : 'warn'}
              detail="A canonical tag tells search engines which version of a URL is the preferred one, preventing duplicate content issues. Add: <link rel='canonical' href='YOUR-URL' /> to your <head>."
              isPaid
              userRole={userRole}
            />
            <DetailRow
              label="Lang Attribute"
              value={seo.langAttribute || 'Not set'}
              status={seo.langAttribute ? 'good' : 'warn'}
              detail="The lang attribute on the <html> element helps search engines understand your page's language and serve it to the right audience. Add lang='en' (or your language code) to the <html> tag."
              isPaid
              userRole={userRole}
            />
          </div>
        </div>

        {/* Technical SEO */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Technical SEO</p>
          <div className="space-y-2">
            <DetailRow
              label="Robots.txt"
              value={seo.robotsTxt ? 'Found' : 'Not found'}
              status={seo.robotsTxt ? 'good' : 'warn'}
              detail="robots.txt controls which pages search engines can crawl. Create a /robots.txt file on your domain root. Example: User-agent: * / Allow: / / Sitemap: https://yourdomain.com/sitemap.xml"
              isPaid
              userRole={userRole}
            />
            <DetailRow
              label="XML Sitemap"
              value={seo.sitemap ? 'Found' : 'Not found'}
              status={seo.sitemap ? 'good' : 'warn'}
              detail="An XML sitemap helps search engines discover and index all your important pages. Generate one at /sitemap.xml and submit it to Google Search Console and Bing Webmaster Tools."
              isPaid
              userRole={userRole}
            />
            <DetailRow
              label="Noindex Tag"
              value={seo.noindexTag ? 'Present — page blocked' : 'Not set (indexable)'}
              status={seo.noindexTag ? 'bad' : 'good'}
              detail="A noindex meta tag prevents search engines from indexing this page. Remove <meta name='robots' content='noindex'> from your HTML if you want this page to appear in search results."
              isPaid
              userRole={userRole}
            />
            <DetailRow
              label="Images without Alt"
              value={seo.imageAltMissing != null ? `${seo.imageAltMissing} image(s) missing alt` : 'N/A'}
              status={(seo.imageAltMissing || 0) === 0 ? 'good' : (seo.imageAltMissing || 0) <= 3 ? 'warn' : 'bad'}
              detail={`${seo.imageAltMissing} images are missing alt text. Alt attributes describe images to screen readers and help search engines understand your visual content. Add descriptive alt="..." to every <img> tag.`}
              isPaid
              userRole={userRole}
            />
            <DetailRow
              label="Structured Data"
              value={seo.structuredData && seo.structuredData.length > 0 ? `${seo.structuredData.length} schema(s) found` : 'None found'}
              status={seo.structuredData && seo.structuredData.length > 0 ? 'good' : 'warn'}
              detail="Schema.org structured data helps search engines understand your content and can enable rich results (stars, prices, etc.) in search. Add JSON-LD schemas relevant to your content type (Article, Product, LocalBusiness, etc.)."
              isPaid
              userRole={userRole}
            />
          </div>
        </div>
      </div>

      {/* Heading Structure */}
      {headings.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Heading Structure ({headings.length} headings)
          </p>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-1.5 text-xs font-mono">
            {displayedHeadings.map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                style={{ paddingLeft: `${(parseInt(h.tag.replace('H', '')) - 1) * 16}px` }}
              >
                <span className="font-bold text-brand-600 flex-shrink-0 w-6">{h.tag}</span>
                <span className="truncate opacity-80">{h.text || '(empty)'}</span>
              </div>
            ))}
            {headings.length > 10 && (
              <button
                onClick={() => setShowAllHeadings(!showAllHeadings)}
                className="text-brand-600 hover:underline mt-1"
              >
                {showAllHeadings ? 'Show less' : `Show ${headings.length - 10} more headings`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Keyword Density — shown in categories via content */}
      {seo.h1Text && seo.h1Text.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
          <span className="font-semibold">H1:</span> {seo.h1Text.join(' | ')}
        </div>
      )}
    </div>
  );
}
