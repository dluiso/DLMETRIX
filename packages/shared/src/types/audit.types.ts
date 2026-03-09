export type AuditStatus = 'pending' | 'running' | 'completed' | 'failed';

export type AuditCategory =
  | 'performance'
  | 'seo'
  | 'content'
  | 'metadata'
  | 'links'
  | 'accessibility'
  | 'security';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface AuditIssue {
  id: string;
  category: AuditCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  technicalDetail: string;
  recommendation: string;
  affectedElement?: string;
  learnMoreUrl?: string;
}

export interface CategoryScore {
  category: AuditCategory;
  score: number; // 0-100
  label: string;
  issues: AuditIssue[];
  passed: number;
  failed: number;
}

export interface AuditProgressEvent {
  auditId: string;
  phase: AuditPhase;
  progress: number; // 0-100
  message: string;
  timestamp: number;
}

export type AuditPhase =
  | 'initializing'
  | 'fetching'
  | 'performance'
  | 'seo'
  | 'content'
  | 'metadata'
  | 'links'
  | 'accessibility'
  | 'security'
  | 'scoring'
  | 'completed'
  | 'failed';

export interface AuditResult {
  id: string;
  url: string;
  domain: string;
  status: AuditStatus;
  overallScore: number;
  categories: CategoryScore[];
  metadata: {
    title?: string;
    description?: string;
    favicon?: string;
    screenshot?: string;
    loadTime?: number;
    pageSize?: number;
    httpStatus?: number;
    redirectChain?: string[];
    technologies?: string[];
  };
  performance: PerformanceData;
  seo: SeoData;
  accessibility: AccessibilityData;
  security: SecurityData;
  links: LinksData;
  createdAt: string;
  completedAt?: string;
}

export interface BrowserTimings {
  redirect?: number;        // ms
  dns?: number;             // ms
  connection?: number;      // ms
  ssl?: number;             // ms
  backend?: number;         // ms (request → response start)
  domInteractive?: number;  // ms from nav start
  domContentLoaded?: number; // ms from nav start
  onload?: number;          // ms from nav start
  fullyLoaded?: number;     // ms from nav start
}

export interface ResourceTypeBreakdown {
  type: string;         // 'script' | 'image' | 'stylesheet' | 'font' | 'document' | 'other'
  size: number;         // bytes (uncompressed)
  transferSize: number; // bytes (compressed/wire)
  count: number;
}

export interface NetworkRequest {
  url: string;
  type: string;
  size: number;         // bytes
  transferSize: number;
  duration: number;     // ms
  status: number;
  startTime: number;    // ms from navigation start
}

export interface PerformanceData {
  fcp?: number;     // First Contentful Paint (ms)
  lcp?: number;     // Largest Contentful Paint (ms)
  cls?: number;     // Cumulative Layout Shift
  fid?: number;     // First Input Delay (ms)
  ttfb?: number;    // Time to First Byte (ms)
  tti?: number;     // Time to Interactive (ms)
  tbt?: number;     // Total Blocking Time (ms)
  si?: number;      // Speed Index
  pageSize?: number; // bytes
  requests?: number;
  renderBlockingResources?: string[];
  unusedCss?: number; // bytes
  unusedJs?: number;  // bytes
  lighthouseScore?: number;           // 0-100
  browserTimings?: BrowserTimings;
  resourceBreakdown?: ResourceTypeBreakdown[];
  networkRequests?: NetworkRequest[];
}

export interface SeoData {
  title?: string;
  titleLength?: number;
  metaDescription?: string;
  metaDescriptionLength?: number;
  h1Count?: number;
  h1Text?: string[];
  headingStructure?: { tag: string; text: string }[];
  canonicalUrl?: string;
  robotsTxt?: boolean;
  sitemap?: boolean;
  noindexTag?: boolean;
  noindexHeader?: boolean;
  langAttribute?: string;
  imageAltMissing?: number;
  structuredData?: any[];
}

export interface AccessibilityData {
  score?: number;
  violations?: { id: string; impact: string; description: string; nodes: number }[];
  ariaLabels?: number;
  colorContrast?: boolean;
  skipLinks?: boolean;
  formLabels?: boolean;
}

export interface SecurityData {
  https?: boolean;
  hsts?: boolean;
  csp?: boolean;
  xFrameOptions?: boolean;
  xContentTypeOptions?: boolean;
  mixedContent?: boolean;
  vulnerableDeps?: string[];
}

export interface LinksData {
  internalLinks?: number;
  externalLinks?: number;
  brokenLinks?: { url: string; status: number }[];
  redirects?: number;
  nofollow?: number;
}
