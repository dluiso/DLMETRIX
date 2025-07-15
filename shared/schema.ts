import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const webAnalyses = pgTable("web_analyses", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  
  // Basic SEO fields
  title: text("title"),
  description: text("description"),
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
  performanceScore: integer("performance_score").default(0),
  accessibilityScore: integer("accessibility_score").default(0),
  bestPracticesScore: integer("best_practices_score").default(0),
  seoScore: integer("seo_score").default(0),
  
  // Screenshots and insights
  mobileScreenshot: text("mobile_screenshot"), // base64 or URL
  desktopScreenshot: text("desktop_screenshot"), // base64 or URL
  
  // Analysis results
  recommendations: json("recommendations"),
  diagnostics: json("diagnostics"), // Performance, accessibility, best practices diagnostics
  insights: json("insights"), // Key findings and opportunities
  technicalChecks: json("technical_checks"),
});

export const insertWebAnalysisSchema = createInsertSchema(webAnalyses).omit({
  id: true,
});

export type InsertWebAnalysis = z.infer<typeof insertWebAnalysisSchema>;
export type WebAnalysis = typeof webAnalyses.$inferSelect;

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
});

export type WebAnalysisResult = z.infer<typeof webAnalysisResultSchema>;
export type CoreWebVitals = z.infer<typeof coreWebVitalsSchema>;
export type Diagnostic = z.infer<typeof diagnosticSchema>;
export type Insight = z.infer<typeof insightSchema>;
export type AiSearchAnalysis = z.infer<typeof aiSearchAnalysisSchema>;
export type AiContentInsight = z.infer<typeof aiContentInsightSchema>;
export type AiContentRecommendation = z.infer<typeof aiContentRecommendationSchema>;
