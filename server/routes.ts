import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seoAnalysisResultSchema } from "@shared/schema";
import axios from "axios";
import * as cheerio from "cheerio";

export async function registerRoutes(app: Express): Promise<Server> {
  // Analyze SEO for a given URL
  app.post("/api/seo/analyze", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: "URL is required" });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ message: "Invalid URL format" });
      }

      // Fetch HTML content
      let html: string;
      try {
        const response = await axios.get(url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        html = response.data;
      } catch (error) {
        return res.status(400).json({ message: "Failed to fetch website content" });
      }

      // Parse HTML with Cheerio
      const $ = cheerio.load(html);
      
      // Extract meta tags
      const title = $('title').text().trim();
      const description = $('meta[name="description"]').attr('content') || null;
      const keywords = $('meta[name="keywords"]').attr('content') || null;
      const canonicalUrl = $('link[rel="canonical"]').attr('href') || null;
      const robotsMeta = $('meta[name="robots"]').attr('content') || null;
      const viewportMeta = $('meta[name="viewport"]').attr('content') || null;

      // Extract Open Graph tags
      const openGraphTags: Record<string, string> = {};
      $('meta[property^="og:"]').each((_, element) => {
        const property = $(element).attr('property');
        const content = $(element).attr('content');
        if (property && content) {
          openGraphTags[property] = content;
        }
      });

      // Extract Twitter Card tags
      const twitterCardTags: Record<string, string> = {};
      $('meta[name^="twitter:"]').each((_, element) => {
        const name = $(element).attr('name');
        const content = $(element).attr('content');
        if (name && content) {
          twitterCardTags[name] = content;
        }
      });

      // Check for schema markup
      const schemaMarkup = $('script[type="application/ld+json"]').length > 0;

      // Check for sitemap (simplified check)
      const sitemap = html.includes('sitemap') || html.includes('Sitemap');

      // Calculate SEO score and generate recommendations
      const analysis = calculateSeoScore({
        title,
        description,
        keywords,
        canonicalUrl,
        robotsMeta,
        viewportMeta,
        openGraphTags,
        twitterCardTags,
        schemaMarkup,
        sitemap,
      });

      const result = {
        url,
        title,
        description,
        keywords,
        canonicalUrl,
        robotsMeta,
        viewportMeta,
        openGraphTags: Object.keys(openGraphTags).length > 0 ? openGraphTags : null,
        twitterCardTags: Object.keys(twitterCardTags).length > 0 ? twitterCardTags : null,
        schemaMarkup,
        sitemap,
        score: analysis.score,
        recommendations: analysis.recommendations,
        technicalSeoChecks: analysis.technicalSeoChecks,
      };

      // Store analysis in memory
      await storage.createSeoAnalysis(result);

      res.json(result);
    } catch (error) {
      console.error('SEO analysis error:', error);
      res.status(500).json({ message: "Internal server error during SEO analysis" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to calculate SEO score and recommendations
function calculateSeoScore(data: any) {
  let score = 0;
  let passed = 0;
  let warnings = 0;
  let errors = 0;
  const recommendations: any[] = [];
  const technicalSeoChecks: Record<string, boolean> = {};

  // Title tag analysis
  if (data.title) {
    const titleLength = data.title.length;
    if (titleLength >= 50 && titleLength <= 60) {
      score += 15;
      passed++;
    } else if (titleLength >= 30 && titleLength <= 80) {
      score += 10;
      warnings++;
      recommendations.push({
        type: 'warning',
        priority: 'medium',
        title: 'Optimize Title Tag Length',
        description: `Title is ${titleLength} characters. Recommended length is 50-60 characters.`
      });
    } else {
      score += 5;
      errors++;
      recommendations.push({
        type: 'error',
        priority: 'high',
        title: 'Fix Title Tag Length',
        description: `Title is ${titleLength} characters. This is outside the recommended range of 50-60 characters.`
      });
    }
  } else {
    errors++;
    recommendations.push({
      type: 'error',
      priority: 'high',
      title: 'Missing Title Tag',
      description: 'Your page is missing a title tag, which is crucial for SEO.'
    });
  }

  // Meta description analysis
  if (data.description) {
    const descLength = data.description.length;
    if (descLength >= 150 && descLength <= 160) {
      score += 15;
      passed++;
    } else if (descLength >= 120 && descLength <= 200) {
      score += 10;
      warnings++;
      recommendations.push({
        type: 'warning',
        priority: 'medium',
        title: 'Optimize Meta Description',
        description: `Meta description is ${descLength} characters. Recommended length is 150-160 characters.`
      });
    } else {
      score += 5;
      errors++;
      recommendations.push({
        type: 'error',
        priority: 'high',
        title: 'Fix Meta Description Length',
        description: `Meta description is ${descLength} characters. This is outside the recommended range.`
      });
    }
  } else {
    errors++;
    recommendations.push({
      type: 'error',
      priority: 'high',
      title: 'Missing Meta Description',
      description: 'Your page is missing a meta description, which is important for search results.'
    });
  }

  // Open Graph tags
  if (data.openGraphTags && Object.keys(data.openGraphTags).length > 0) {
    const requiredOgTags = ['og:title', 'og:description', 'og:image', 'og:url'];
    const presentOgTags = Object.keys(data.openGraphTags);
    const missingOgTags = requiredOgTags.filter(tag => !presentOgTags.includes(tag));
    
    if (missingOgTags.length === 0) {
      score += 20;
      passed++;
      recommendations.push({
        type: 'success',
        priority: 'low',
        title: 'Well Done: Complete Open Graph Tags',
        description: 'All essential Open Graph tags are present for optimal social media sharing.'
      });
    } else {
      score += 10;
      warnings++;
      recommendations.push({
        type: 'warning',
        priority: 'medium',
        title: 'Incomplete Open Graph Tags',
        description: `Missing Open Graph tags: ${missingOgTags.join(', ')}`
      });
    }
  } else {
    errors++;
    recommendations.push({
      type: 'error',
      priority: 'high',
      title: 'Missing Open Graph Tags',
      description: 'Open Graph tags are missing. These are essential for social media sharing.'
    });
  }

  // Twitter Cards
  if (data.twitterCardTags && Object.keys(data.twitterCardTags).length > 0) {
    score += 15;
    passed++;
    recommendations.push({
      type: 'success',
      priority: 'low',
      title: 'Well Done: Twitter Cards Present',
      description: 'Twitter Card tags are present for optimal Twitter sharing.'
    });
  } else {
    errors++;
    recommendations.push({
      type: 'error',
      priority: 'high',
      title: 'Missing Twitter Cards',
      description: 'Twitter Card tags are missing. These optimize how your content appears on Twitter.'
    });
  }

  // Technical SEO checks
  technicalSeoChecks.canonicalUrl = !!data.canonicalUrl;
  technicalSeoChecks.robotsMeta = !!data.robotsMeta;
  technicalSeoChecks.viewportMeta = !!data.viewportMeta;
  technicalSeoChecks.schemaMarkup = !!data.schemaMarkup;
  technicalSeoChecks.sitemap = !!data.sitemap;

  // Add points for technical SEO
  if (data.canonicalUrl) score += 5;
  if (data.robotsMeta) score += 5;
  if (data.viewportMeta) score += 5;
  if (data.schemaMarkup) score += 10;
  if (data.sitemap) score += 5;

  // Add technical SEO recommendations
  if (!data.schemaMarkup) {
    warnings++;
    recommendations.push({
      type: 'warning',
      priority: 'medium',
      title: 'Consider Adding Schema Markup',
      description: 'Schema markup helps search engines better understand your content.'
    });
  }

  return {
    score: Math.min(score, 100),
    passed,
    warnings,
    errors,
    recommendations,
    technicalSeoChecks,
  };
}
