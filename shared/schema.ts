import { mysqlTable, text, int, boolean, json, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const webAnalyses = mysqlTable("web_analyses", {
  id: int("id").primaryKey().autoincrement(),
  url: text("url").notNull(),
  
  // Basic SEO fields
  title: text("title"),
  keywords: text("keywords"),
  canonicalUrl: text("canonical_url"),
  robotsMeta: text("robots_meta"),
  viewportMeta: text("viewport_meta"),
  openGraphTags: json("open_graph_tags"),
  twitterCardTags: json("twitter_card_tags"),
  schemaMarkup: boolean("schema_markup").default(false),
  sitemap: boolean("sitemap").default(false),
  
  // Performance & Core Web Vitals
  coreWebVitals: json("core_web_vitals"), // LCP, FID, CLS for mobile & desktop
  performanceScore: int("performance_score").default(0),
  accessibilityScore: int("accessibility_score").default(0),
  bestPracticesScore: int("best_practices_score").default(0),
  seoScore: int("seo_score").default(0),
  
  // Screenshots and insights
  mobileScreenshot: text("mobile_screenshot"), // base64 or URL
  desktopScreenshot: text("desktop_screenshot"), // base64 or URL
  
  // Analysis results
  recommendations: json("recommendations"),
  diagnostics: json("diagnostics"), // Performance, accessibility, best practices diagnostics
  insights: json("insights"), // Key findings and opportunities
  technicalChecks: json("technical_checks"),
  waterfallAnalysis: json("waterfall_analysis"), // Waterfall resource loading analysis
  offPageData: json("off_page_data"), // OffPage SEO analysis: backlinks, domain authority, Wikipedia references
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sharedReports = mysqlTable("shared_reports", {
  id: int("id").primaryKey().autoincrement(),
  shareToken: text("share_token").unique().notNull(),
  url: text("url").notNull(),
  analysisData: json("analysis_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertWebAnalysisSchema = createInsertSchema(webAnalyses).omit({
  id: true,
});

export const insertSharedReportSchema = createInsertSchema(sharedReports).omit({
  id: true,
  createdAt: true,
});

export type InsertWebAnalysis = z.infer<typeof insertWebAnalysisSchema>;
export type WebAnalysis = typeof webAnalyses.$inferSelect;
export type InsertSharedReport = z.infer<typeof insertSharedReportSchema>;
export type SharedReport = typeof sharedReports.$inferSelect;

// Core Web Vitals schema
export const coreWebVitalsSchema = z.object({
  mobile: z.object({
    lcp: z.number().nullable(), // Largest Contentful Paint
    fid: z.number().nullable(), // First Input Delay
    cls: z.number().nullable(), // Cumulative Layout Shift
    fcp: z.number().nullable(), // First Contentful Paint
    ttfb: z.number().nullable(), // Time to First Byte
  }),
  desktop: z.object({
    lcp: z.number().nullable(),
    fid: z.number().nullable(),
    cls: z.number().nullable(),
    fcp: z.number().nullable(),
    ttfb: z.number().nullable(),
  }),
});

// Diagnostic schema
export const diagnosticSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  score: z.number().nullable(),
  scoreDisplayMode: z.enum(['numeric', 'binary', 'manual', 'informative']),
  details: z.any().optional(),
});

// Insight schema
export const insightSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  score: z.number().nullable(),
  displayValue: z.string().optional(),
  details: z.any().optional(),
});

// AI Content Analysis schemas
export const aiContentInsightSchema = z.object({
  type: z.enum(['entity', 'topic', 'fact', 'quote', 'statistic', 'definition']),
  content: z.string(),
  relevance: z.number(), // 0-1 score
  context: z.string(),
  aiOptimizationTip: z.string()
});

export const aiContentRecommendationSchema = z.object({
  type: z.enum(['heading', 'paragraph', 'meta_description', 'title', 'content_section']),
  currentContent: z.string(),
  suggestedContent: z.string(),
  reason: z.string(),
  impact: z.enum(['high', 'medium', 'low']),
  location: z.string(),
  implementationTip: z.string()
});

export const keywordTrendDataSchema = z.object({
  keyword: z.string(),
  volume: z.number(),
  difficulty: z.number(),
  trend: z.enum(['rising', 'falling', 'stable']),
  position: z.number().nullable(),
  competition: z.enum(['low', 'medium', 'high']),
  opportunity: z.number(), // 0-100 score
  relatedKeywords: z.array(z.string())
});

export const seoKeywordAnalysisSchema = z.object({
  primaryKeywords: z.array(keywordTrendDataSchema),
  secondaryKeywords: z.array(keywordTrendDataSchema),
  longTailKeywords: z.array(keywordTrendDataSchema),
  keywordDensity: z.record(z.number()),
  competitorKeywords: z.array(z.string()),
  missedOpportunities: z.array(z.string()),
  overallKeywordScore: z.number()
});

export const aiSearchAnalysisSchema = z.object({
  overallScore: z.number(), // 0-100 AI readiness score
  contentQuality: z.number(), // 0-100
  structuredDataScore: z.number(), // 0-100
  semanticClarityScore: z.number(), // 0-100
  
  // Key insights for AI consumption
  primaryTopics: z.array(z.string()),
  keyEntities: z.array(z.string()),
  factualClaims: z.array(z.string()),
  
  // Content analysis
  bestContent: z.array(aiContentInsightSchema),
  improvements: z.array(z.string()),
  contentRecommendations: z.array(aiContentRecommendationSchema),
  aiRecommendations: z.array(z.object({
    category: z.enum(['content_structure', 'semantic_markup', 'factual_accuracy', 'context_clarity']),
    title: z.string(),
    description: z.string(),
    implementation: z.string(),
    priority: z.enum(['high', 'medium', 'low'])
  }))
});

// Waterfall Analysis schemas
export const waterfallResourceSchema = z.object({
  url: z.string(),
  type: z.enum(['document', 'stylesheet', 'script', 'image', 'font', 'fetch', 'xhr', 'other']),
  mimeType: z.string(),
  size: z.number(), // bytes
  transferSize: z.number(), // bytes transferred over network
  duration: z.number(), // milliseconds
  startTime: z.number(), // milliseconds from navigation start
  endTime: z.number(), // milliseconds from navigation start
  isRenderBlocking: z.boolean(),
  isCritical: z.boolean(),
  status: z.number(), // HTTP status code
  initiator: z.string().optional(), // what triggered this request
  priority: z.enum(['VeryHigh', 'High', 'Medium', 'Low', 'VeryLow']),
  cached: z.boolean(),
  protocol: z.string(), // HTTP/1.1, HTTP/2, etc.
  timing: z.object({
    dnsLookup: z.number(),
    connecting: z.number(),
    tlsHandshake: z.number(),
    waiting: z.number(), // TTFB
    receiving: z.number(),
  }),
});

export const waterfallAnalysisSchema = z.object({
  mobile: z.object({
    resources: z.array(waterfallResourceSchema),
    totalResources: z.number(),
    totalSize: z.number(),
    totalTransferSize: z.number(),
    totalDuration: z.number(),
    renderBlockingResources: z.number(),
    criticalResources: z.number(),
    parallelRequests: z.number(),
    cacheHitRate: z.number(), // percentage
    compressionSavings: z.number(), // percentage
    totalBlockingTime: z.number().nullable(), // Real TBT measurement in milliseconds
    firstContentfulPaint: z.number().nullable(), // FCP timing in milliseconds
  }),
  desktop: z.object({
    resources: z.array(waterfallResourceSchema),
    totalResources: z.number(),
    totalSize: z.number(),
    totalTransferSize: z.number(),
    totalDuration: z.number(),
    renderBlockingResources: z.number(),
    criticalResources: z.number(),
    parallelRequests: z.number(),
    cacheHitRate: z.number(), // percentage
    compressionSavings: z.number(), // percentage
    totalBlockingTime: z.number().nullable(), // Real TBT measurement in milliseconds
    firstContentfulPaint: z.number().nullable(), // FCP timing in milliseconds
  }),
  recommendations: z.array(z.object({
    type: z.enum(['critical', 'warning', 'suggestion']),
    title: z.string(),
    description: z.string(),
    impact: z.enum(['high', 'medium', 'low']),
    resourcesAffected: z.array(z.string()),
    howToFix: z.string(),
    potentialSavings: z.string(),
  })),
  insights: z.array(z.object({
    metric: z.string(),
    value: z.string(),
    description: z.string(),
    impact: z.enum(['positive', 'negative', 'neutral']),
  })),
});

// OffPage Data schema
export const offPageDataSchema = z.object({
  backlinks: z.object({
    totalBacklinks: z.number(),
    referringDomains: z.number(),
    domainPopularity: z.number(),
    linkPopularity: z.number(),
    topReferrers: z.array(z.object({
      domain: z.string(),
      linkCount: z.number(),
      trustScore: z.number(),
      lastSeen: z.string(),
    })),
    linkTypes: z.object({
      dofollow: z.number(),
      nofollow: z.number(),
      internal: z.number(),
      external: z.number(),
    }),
  }),
  wikipediaBacklinks: z.object({
    isReferenced: z.boolean(),
    wikipediaPages: z.array(z.object({
      title: z.string(),
      url: z.string(),
      language: z.string(),
      linkType: z.enum(['citation', 'reference', 'external']),
    })),
    totalWikipediaLinks: z.number(),
    languages: z.array(z.string()),
  }),
  domainAuthority: z.object({
    score: z.number(),
    pageRank: z.number(),
    trustRank: z.number(),
    algorithmUsed: z.enum(['custom-pagerank', 'link-analysis', 'trust-flow']),
    factors: z.object({
      linkProfile: z.number(),
      contentQuality: z.number(),
      technicalSeo: z.number(),
      socialSignals: z.number(),
      brandMentions: z.number(),
    }),
  }),
  socialPresence: z.object({
    mentions: z.number(),
    shareCount: z.number(),
    platforms: z.array(z.object({
      platform: z.string(),
      mentions: z.number(),
      engagement: z.number(),
    })),
  }),
  trustMetrics: z.object({
    httpsEnabled: z.boolean(),
    certificateValid: z.boolean(),
    domainAge: z.number(),
    whoisPrivacy: z.boolean(),
    spamScore: z.number(),
    trustSignals: z.array(z.string()),
  }),
  analysisDate: z.string(),
  dataSource: z.string(),
});

// Web analysis result type
export const webAnalysisResultSchema = z.object({
  url: z.string().url(),
  
  // Basic SEO fields
  title: z.string().nullable(),
  description: z.string().nullable(),
  keywords: z.string().nullable(),
  canonicalUrl: z.string().nullable(),
  robotsMeta: z.string().nullable(),
  viewportMeta: z.string().nullable(),
  openGraphTags: z.record(z.string()).nullable(),
  twitterCardTags: z.record(z.string()).nullable(),
  schemaMarkup: z.boolean(),
  sitemap: z.boolean(),
  
  // Performance metrics
  coreWebVitals: coreWebVitalsSchema,
  performanceScore: z.number(),
  accessibilityScore: z.number(),
  bestPracticesScore: z.number(),
  seoScore: z.number(),
  
  // Screenshots
  mobileScreenshot: z.string().nullable(),
  desktopScreenshot: z.string().nullable(),
  
  // Analysis results
  recommendations: z.array(z.object({
    type: z.enum(['error', 'warning', 'success']),
    priority: z.enum(['high', 'medium', 'low']),
    title: z.string(),
    description: z.string(),
    howToFix: z.string().optional(),
    category: z.enum(['performance', 'accessibility', 'best-practices', 'seo']).optional(),
  })),
  diagnostics: z.object({
    performance: z.array(diagnosticSchema),
    accessibility: z.array(diagnosticSchema),
    bestPractices: z.array(diagnosticSchema),
    seo: z.array(diagnosticSchema),
  }),
  insights: z.object({
    opportunities: z.array(insightSchema), // Performance opportunities
    diagnostics: z.array(insightSchema), // General diagnostics
  }),
  technicalChecks: z.record(z.boolean()),
  
  // AI Search Analysis
  aiSearchAnalysis: aiSearchAnalysisSchema.nullable(),
  
  // SEO Keyword Analysis
  keywordAnalysis: seoKeywordAnalysisSchema.nullable(),
  
  // Waterfall Analysis
  waterfallAnalysis: waterfallAnalysisSchema.nullable(),
  
  // OffPage Data Analysis
  offPageData: offPageDataSchema.nullable(),
});

export type WebAnalysisResult = z.infer<typeof webAnalysisResultSchema>;
export type CoreWebVitals = z.infer<typeof coreWebVitalsSchema>;
export type Diagnostic = z.infer<typeof diagnosticSchema>;
export type Insight = z.infer<typeof insightSchema>;
export type AiSearchAnalysis = z.infer<typeof aiSearchAnalysisSchema>;
export type AiContentInsight = z.infer<typeof aiContentInsightSchema>;
export type AiContentRecommendation = z.infer<typeof aiContentRecommendationSchema>;
export type KeywordTrendData = z.infer<typeof keywordTrendDataSchema>;
export type SeoKeywordAnalysis = z.infer<typeof seoKeywordAnalysisSchema>;
export type WaterfallResource = z.infer<typeof waterfallResourceSchema>;
export type WaterfallAnalysis = z.infer<typeof waterfallAnalysisSchema>;
export type OffPageData = z.infer<typeof offPageDataSchema>;
