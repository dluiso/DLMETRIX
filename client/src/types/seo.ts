export interface WebAnalysisResult {
  url: string;
  
  // Basic SEO fields
  title: string | null;
  description: string | null;
  keywords: string | null;
  canonicalUrl: string | null;
  robotsMeta: string | null;
  viewportMeta: string | null;
  openGraphTags: Record<string, string> | null;
  twitterCardTags: Record<string, string> | null;
  schemaMarkup: boolean;
  sitemap: boolean;
  
  // Performance metrics
  coreWebVitals: CoreWebVitals;
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  
  // Screenshots
  mobileScreenshot: string | null;
  desktopScreenshot: string | null;
  
  // Analysis results
  recommendations: Recommendation[];
  diagnostics: Diagnostics;
  insights: Insights;
  technicalChecks: Record<string, boolean>;
}

export interface CoreWebVitals {
  mobile: {
    lcp: number | null; // Largest Contentful Paint
    fid: number | null; // First Input Delay
    cls: number | null; // Cumulative Layout Shift
    fcp: number | null; // First Contentful Paint
    ttfb: number | null; // Time to First Byte
  };
  desktop: {
    lcp: number | null;
    fid: number | null;
    cls: number | null;
    fcp: number | null;
    ttfb: number | null;
  };
}

export interface Diagnostic {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode: 'numeric' | 'binary' | 'manual' | 'informative';
  details?: any;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  score: number | null;
  displayValue?: string;
  details?: any;
}

export interface Diagnostics {
  performance: Diagnostic[];
  accessibility: Diagnostic[];
  bestPractices: Diagnostic[];
  seo: Diagnostic[];
}

export interface Insights {
  opportunities: Insight[];
  diagnostics: Insight[];
}

export interface Recommendation {
  type: 'error' | 'warning' | 'success';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  howToFix?: string;
  category?: 'performance' | 'accessibility' | 'best-practices' | 'seo';
}

export interface WebStats {
  passed: number;
  warnings: number;
  errors: number;
  totalChecks: number;
}

// Legacy types for backward compatibility
export type SeoAnalysisResult = WebAnalysisResult;
export interface SeoStats {
  passed: number;
  warnings: number;
  errors: number;
  totalTags: number;
}
