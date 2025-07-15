import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const seoAnalyses = pgTable("seo_analyses", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
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
  score: integer("score").default(0),
  recommendations: json("recommendations"),
  technicalSeoChecks: json("technical_seo_checks"),
});

export const insertSeoAnalysisSchema = createInsertSchema(seoAnalyses).omit({
  id: true,
});

export type InsertSeoAnalysis = z.infer<typeof insertSeoAnalysisSchema>;
export type SeoAnalysis = typeof seoAnalyses.$inferSelect;

// SEO analysis result type
export const seoAnalysisResultSchema = z.object({
  url: z.string().url(),
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
  score: z.number(),
  recommendations: z.array(z.object({
    type: z.enum(['error', 'warning', 'success']),
    priority: z.enum(['high', 'medium', 'low']),
    title: z.string(),
    description: z.string(),
    howToFix: z.string().optional(),
  })),
  technicalSeoChecks: z.record(z.boolean()),
});

export type SeoAnalysisResult = z.infer<typeof seoAnalysisResultSchema>;
