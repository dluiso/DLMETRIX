export interface SeoAnalysisResult {
  url: string;
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
  score: number;
  recommendations: Recommendation[];
  technicalSeoChecks: Record<string, boolean>;
}

export interface Recommendation {
  type: 'error' | 'warning' | 'success';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

export interface SeoStats {
  passed: number;
  warnings: number;
  errors: number;
  totalTags: number;
}
