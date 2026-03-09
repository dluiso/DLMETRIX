import { Injectable } from '@nestjs/common';
import {
  CategoryScore, AuditCategory, AuditIssue, IssueSeverity,
  PerformanceData, SeoData, AccessibilityData, SecurityData, LinksData,
  AUDIT_CATEGORY_WEIGHTS,
} from '@dlmetrix/shared';
import { ContentResult } from './analyzers/content.analyzer';
import { MetadataResult } from './analyzers/metadata.analyzer';

interface AnalysisInput {
  performance: PerformanceData;
  seo: SeoData;
  content: ContentResult;
  metadata: MetadataResult;
  links: LinksData;
  accessibility: AccessibilityData;
  security: SecurityData;
}

@Injectable()
export class ScoreCalculator {
  calculateCategories(input: AnalysisInput): CategoryScore[] {
    return [
      this.scorePerformance(input.performance),
      this.scoreSeo(input.seo),
      this.scoreContent(input.content),
      this.scoreMetadata(input.metadata),
      this.scoreLinks(input.links),
      this.scoreAccessibility(input.accessibility),
      this.scoreSecurity(input.security),
    ];
  }

  calculateOverallScore(categories: CategoryScore[]): number {
    let total = 0;
    let weightSum = 0;

    for (const cat of categories) {
      const weight = AUDIT_CATEGORY_WEIGHTS[cat.category] || 0;
      total += cat.score * weight;
      weightSum += weight;
    }

    return Math.round(weightSum > 0 ? total / weightSum : 0);
  }

  // ─── Performance ─────────────────────────────────────────────────────────

  private scorePerformance(data: PerformanceData): CategoryScore {
    const issues: AuditIssue[] = [];
    let score = 100;

    // LCP
    if (data.lcp !== undefined) {
      if (data.lcp > 4000) {
        score -= 25;
        issues.push(this.issue('perf-lcp-bad', 'performance', 'critical',
          'Poor Largest Contentful Paint',
          `LCP is ${(data.lcp / 1000).toFixed(1)}s (should be < 2.5s)`,
          'Optimize images, use CDN, improve server response times',
        ));
      } else if (data.lcp > 2500) {
        score -= 12;
        issues.push(this.issue('perf-lcp-avg', 'performance', 'medium',
          'LCP Needs Improvement',
          `LCP is ${(data.lcp / 1000).toFixed(1)}s (target: < 2.5s)`,
          'Optimize critical resources, preload key assets',
        ));
      }
    }

    // CLS
    if (data.cls !== undefined) {
      if (data.cls > 0.25) {
        score -= 20;
        issues.push(this.issue('perf-cls-bad', 'performance', 'high',
          'Poor Cumulative Layout Shift',
          `CLS is ${data.cls.toFixed(3)} (should be < 0.1)`,
          'Add size attributes to images/videos, avoid dynamic content insertion above fold',
        ));
      } else if (data.cls > 0.1) {
        score -= 8;
        issues.push(this.issue('perf-cls-avg', 'performance', 'medium',
          'Layout Shift Needs Improvement',
          `CLS is ${data.cls.toFixed(3)} (target: < 0.1)`,
          'Reserve space for dynamically loaded content',
        ));
      }
    }

    // FCP
    if (data.fcp !== undefined && data.fcp > 3000) {
      score -= 15;
      issues.push(this.issue('perf-fcp', 'performance', 'high',
        'Slow First Contentful Paint',
        `FCP is ${(data.fcp / 1000).toFixed(1)}s (should be < 1.8s)`,
        'Reduce server response time, eliminate render-blocking resources',
      ));
    }

    // TBT
    if (data.tbt !== undefined && data.tbt > 300) {
      score -= 15;
      issues.push(this.issue('perf-tbt', 'performance', 'high',
        'High Total Blocking Time',
        `TBT is ${data.tbt}ms (should be < 200ms)`,
        'Break up long JavaScript tasks, use web workers',
      ));
    }

    // Render blocking
    if (data.renderBlockingResources && data.renderBlockingResources.length > 0) {
      score -= Math.min(15, data.renderBlockingResources.length * 5);
      issues.push(this.issue('perf-render-blocking', 'performance', 'high',
        'Render-Blocking Resources',
        `${data.renderBlockingResources.length} resource(s) blocking render`,
        'Defer or async-load non-critical CSS and JavaScript',
      ));
    }

    // Unused JS
    if (data.unusedJs && data.unusedJs > 100000) {
      score -= 8;
      issues.push(this.issue('perf-unused-js', 'performance', 'medium',
        'Unused JavaScript',
        `${(data.unusedJs / 1024).toFixed(0)}KB of unused JavaScript`,
        'Use code splitting and tree shaking to reduce unused JS',
      ));
    }

    return this.buildCategory('performance', 'Performance', score, issues);
  }

  // ─── SEO ─────────────────────────────────────────────────────────────────

  private scoreSeo(data: SeoData): CategoryScore {
    const issues: AuditIssue[] = [];
    let score = 100;

    if (!data.title) {
      score -= 20;
      issues.push(this.issue('seo-no-title', 'seo', 'critical',
        'Missing Page Title', 'No <title> tag found',
        'Add a descriptive title tag between 30-60 characters',
      ));
    } else if (data.titleLength < 30 || data.titleLength > 60) {
      score -= 8;
      issues.push(this.issue('seo-title-length', 'seo', 'medium',
        'Title Length Out of Range',
        `Title is ${data.titleLength} chars (ideal: 30–60)`,
        'Adjust title to be between 30-60 characters',
      ));
    }

    if (!data.metaDescription) {
      score -= 15;
      issues.push(this.issue('seo-no-desc', 'seo', 'high',
        'Missing Meta Description', 'No meta description tag found',
        'Add a compelling meta description between 120-160 characters',
      ));
    } else if (data.metaDescriptionLength < 120 || data.metaDescriptionLength > 160) {
      score -= 5;
      issues.push(this.issue('seo-desc-length', 'seo', 'low',
        'Meta Description Length Off',
        `Description is ${data.metaDescriptionLength} chars (ideal: 120–160)`,
        'Adjust meta description to 120-160 characters',
      ));
    }

    if (data.h1Count === 0) {
      score -= 15;
      issues.push(this.issue('seo-no-h1', 'seo', 'critical',
        'Missing H1 Heading', 'No H1 tag found on the page',
        'Add a single, descriptive H1 tag containing your primary keyword',
      ));
    } else if (data.h1Count > 1) {
      score -= 8;
      issues.push(this.issue('seo-multiple-h1', 'seo', 'medium',
        'Multiple H1 Headings',
        `Found ${data.h1Count} H1 tags (should be exactly 1)`,
        'Use only one H1 tag per page as the main heading',
      ));
    }

    if (!data.robotsTxt) {
      score -= 8;
      issues.push(this.issue('seo-no-robots', 'seo', 'medium',
        'Missing robots.txt', 'No robots.txt file found',
        'Create a robots.txt file to guide search engine crawlers',
      ));
    }

    if (!data.sitemap) {
      score -= 8;
      issues.push(this.issue('seo-no-sitemap', 'seo', 'medium',
        'No Sitemap Found', 'No XML sitemap detected',
        'Create an XML sitemap and submit it to search engines',
      ));
    }

    if (data.noindexTag) {
      score -= 25;
      issues.push(this.issue('seo-noindex', 'seo', 'critical',
        'Page Has noindex Tag',
        'Meta robots tag contains "noindex" — page will not be indexed',
        'Remove the noindex directive if you want this page indexed',
      ));
    }

    if (!data.langAttribute) {
      score -= 5;
      issues.push(this.issue('seo-no-lang', 'seo', 'low',
        'Missing HTML lang Attribute',
        'The html element has no lang attribute',
        'Add lang="en" (or appropriate language code) to the html element',
      ));
    }

    if (data.imageAltMissing && data.imageAltMissing > 0) {
      score -= Math.min(10, data.imageAltMissing * 2);
      issues.push(this.issue('seo-img-alt', 'seo', 'medium',
        'Images Missing Alt Text',
        `${data.imageAltMissing} image(s) are missing alt attributes`,
        'Add descriptive alt text to all meaningful images',
      ));
    }

    return this.buildCategory('seo', 'SEO', score, issues);
  }

  // ─── Content ─────────────────────────────────────────────────────────────

  private scoreContent(data: ContentResult): CategoryScore {
    const issues: AuditIssue[] = [];
    let score = 100;

    if (data.contentLength === 'thin') {
      score -= 25;
      issues.push(this.issue('content-thin', 'content', 'high',
        'Thin Content',
        `Only ${data.wordCount} words detected (target: 300+)`,
        'Add more valuable, relevant content to improve rankings and engagement',
      ));
    }

    if (data.textToHtmlRatio < 10) {
      score -= 15;
      issues.push(this.issue('content-ratio', 'content', 'medium',
        'Low Text-to-HTML Ratio',
        `Text is only ${data.textToHtmlRatio}% of the page (ideal: >15%)`,
        'Reduce unnecessary HTML markup or increase visible content',
      ));
    }

    if (data.readabilityScore < 40) {
      score -= 10;
      issues.push(this.issue('content-readability', 'content', 'medium',
        'Low Readability Score',
        `Readability score: ${data.readabilityScore}/100`,
        'Use shorter sentences and simpler vocabulary',
      ));
    }

    if (!data.hasStructuredContent) {
      score -= 5;
      issues.push(this.issue('content-no-lists', 'content', 'low',
        'No Structured Content',
        'No lists, tables or structured elements found',
        'Use bullet points, numbered lists and tables to improve scannability',
      ));
    }

    return this.buildCategory('content', 'Content', score, issues);
  }

  // ─── Metadata ────────────────────────────────────────────────────────────

  private scoreMetadata(data: MetadataResult): CategoryScore {
    const issues: AuditIssue[] = [];
    let score = 100;

    if (!data.hasOgTitle) {
      score -= 15;
      issues.push(this.issue('meta-og-title', 'metadata', 'medium',
        'Missing Open Graph Title', 'No og:title meta tag found',
        'Add <meta property="og:title" content="..."> for social sharing',
      ));
    }

    if (!data.hasOgDescription) {
      score -= 10;
      issues.push(this.issue('meta-og-desc', 'metadata', 'medium',
        'Missing Open Graph Description', 'No og:description found',
        'Add og:description for better social media previews',
      ));
    }

    if (!data.hasOgImage) {
      score -= 15;
      issues.push(this.issue('meta-og-image', 'metadata', 'high',
        'Missing Open Graph Image', 'No og:image tag found',
        'Add an og:image (1200x630px recommended) for social sharing',
      ));
    }

    if (!data.hasTwitterCard) {
      score -= 10;
      issues.push(this.issue('meta-twitter', 'metadata', 'low',
        'Missing Twitter Card', 'No twitter:card meta tag found',
        'Add Twitter Card meta tags for better Twitter sharing appearance',
      ));
    }

    if (!data.viewport) {
      score -= 20;
      issues.push(this.issue('meta-viewport', 'metadata', 'critical',
        'Missing Viewport Meta Tag', 'No viewport meta tag found',
        'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
      ));
    }

    if (!data.canonical) {
      score -= 10;
      issues.push(this.issue('meta-canonical', 'metadata', 'medium',
        'Missing Canonical URL', 'No canonical link tag found',
        'Add <link rel="canonical" href="..."> to prevent duplicate content issues',
      ));
    }

    return this.buildCategory('metadata', 'Metadata', score, issues);
  }

  // ─── Links ───────────────────────────────────────────────────────────────

  private scoreLinks(data: LinksData): CategoryScore {
    const issues: AuditIssue[] = [];
    let score = 100;

    if (data.brokenLinks && data.brokenLinks.length > 0) {
      score -= Math.min(40, data.brokenLinks.length * 10);
      issues.push(this.issue('links-broken', 'links', 'critical',
        'Broken Links Found',
        `${data.brokenLinks.length} broken link(s) detected`,
        'Fix or remove all broken links to maintain user experience and SEO',
      ));
    }

    if (!data.internalLinks || data.internalLinks < 3) {
      score -= 15;
      issues.push(this.issue('links-few-internal', 'links', 'medium',
        'Few Internal Links',
        `Only ${data.internalLinks || 0} internal link(s) found`,
        'Add more internal links to improve site structure and crawlability',
      ));
    }

    return this.buildCategory('links', 'Links', score, issues);
  }

  // ─── Accessibility ───────────────────────────────────────────────────────

  private scoreAccessibility(data: AccessibilityData): CategoryScore {
    const issues: AuditIssue[] = (data.violations || []).map(v =>
      this.issue(
        `a11y-${v.id}`,
        'accessibility',
        this.mapImpact(v.impact),
        v.description,
        v.description,
        'Review WCAG 2.1 guidelines for this issue',
      ),
    );

    const score = data.score ?? Math.max(0, 100 - issues.length * 15);
    return this.buildCategory('accessibility', 'Accessibility', score, issues);
  }

  // ─── Security ────────────────────────────────────────────────────────────

  private scoreSecurity(data: SecurityData): CategoryScore {
    const issues: AuditIssue[] = [];
    let score = 100;

    if (!data.https) {
      score -= 40;
      issues.push(this.issue('sec-no-https', 'security', 'critical',
        'Site Not Using HTTPS', 'The site is served over HTTP (insecure)',
        'Install an SSL/TLS certificate and redirect all traffic to HTTPS',
      ));
    }

    if (!data.hsts) {
      score -= 10;
      issues.push(this.issue('sec-no-hsts', 'security', 'medium',
        'Missing HSTS Header',
        'Strict-Transport-Security header not set',
        'Add: Strict-Transport-Security: max-age=31536000; includeSubDomains',
      ));
    }

    if (!data.csp) {
      score -= 15;
      issues.push(this.issue('sec-no-csp', 'security', 'high',
        'Missing Content Security Policy',
        'No Content-Security-Policy header found',
        'Implement a Content Security Policy to prevent XSS attacks',
      ));
    }

    if (!data.xFrameOptions) {
      score -= 10;
      issues.push(this.issue('sec-no-xfo', 'security', 'medium',
        'Missing X-Frame-Options Header',
        'X-Frame-Options header not set (clickjacking risk)',
        'Add: X-Frame-Options: DENY or SAMEORIGIN',
      ));
    }

    if (!data.xContentTypeOptions) {
      score -= 10;
      issues.push(this.issue('sec-no-xcto', 'security', 'medium',
        'Missing X-Content-Type-Options',
        'X-Content-Type-Options: nosniff not set',
        'Add: X-Content-Type-Options: nosniff',
      ));
    }

    return this.buildCategory('security', 'Security', score, issues);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private buildCategory(
    category: AuditCategory,
    label: string,
    rawScore: number,
    issues: AuditIssue[],
  ): CategoryScore {
    return {
      category,
      label,
      score: Math.max(0, Math.min(100, rawScore)),
      issues,
      passed: issues.filter(i => i.severity === 'info').length,
      failed: issues.filter(i => i.severity !== 'info').length,
    };
  }

  private issue(
    id: string,
    category: AuditCategory,
    severity: IssueSeverity,
    title: string,
    description: string,
    recommendation: string,
    affectedElement?: string,
  ): AuditIssue {
    return { id, category, severity, title, description, technicalDetail: description, recommendation, affectedElement };
  }

  private mapImpact(impact: string): IssueSeverity {
    switch (impact) {
      case 'critical': return 'critical';
      case 'serious':  return 'high';
      case 'moderate': return 'medium';
      default:         return 'low';
    }
  }
}
