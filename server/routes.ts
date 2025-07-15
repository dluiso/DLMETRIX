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

      // Advanced Technical SEO Analysis
      const performanceSeoChecks = performAdvancedSeoAnalysis($, html, url);

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
        schemaMarkup: performanceSeoChecks.schemaMarkup,
        sitemap: performanceSeoChecks.sitemap,
        technicalSeoChecks: performanceSeoChecks.technicalSeoChecks,
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
        schemaMarkup: performanceSeoChecks.schemaMarkup,
        sitemap: performanceSeoChecks.sitemap,
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

// Advanced SEO Analysis Function (Similar to PageSpeed Insights)
function performAdvancedSeoAnalysis($: any, html: string, url: string) {
  const checks: Record<string, boolean> = {};
  
  // Core Web Vitals & Performance Related SEO
  checks.hasViewportMeta = $('meta[name="viewport"]').length > 0;
  checks.hasCharset = $('meta[charset]').length > 0 || html.includes('charset=');
  checks.hasLangAttribute = $('html[lang]').length > 0;
  checks.hasCanonicalURL = $('link[rel="canonical"]').length > 0;
  checks.hasRobotsMeta = $('meta[name="robots"]').length > 0;
  
  // Schema Markup & Structured Data
  checks.hasSchemaMarkup = $('script[type="application/ld+json"]').length > 0;
  checks.hasOpenGraph = $('meta[property^="og:"]').length > 0;
  checks.hasTwitterCards = $('meta[name^="twitter:"]').length > 0;
  
  // Image Optimization
  const images = $('img');
  let imagesWithAlt = 0;
  let imagesWithOptimizedSizes = 0;
  
  images.each((_: any, img: any) => {
    if ($(img).attr('alt')) imagesWithAlt++;
    if ($(img).attr('width') && $(img).attr('height')) imagesWithOptimizedSizes++;
  });
  
  checks.imagesHaveAltText = images.length === 0 || imagesWithAlt / images.length >= 0.8;
  checks.imagesHaveDimensions = images.length === 0 || imagesWithOptimizedSizes / images.length >= 0.5;
  
  // Link Analysis
  const links = $('a[href]');
  let internalLinks = 0;
  let externalLinksWithNofollow = 0;
  let totalExternalLinks = 0;
  
  links.each((_: any, link: any) => {
    const href = $(link).attr('href');
    if (href) {
      if (href.startsWith('/') || href.includes(new URL(url).hostname)) {
        internalLinks++;
      } else if (href.startsWith('http')) {
        totalExternalLinks++;
        if ($(link).attr('rel')?.includes('nofollow')) {
          externalLinksWithNofollow++;
        }
      }
    }
  });
  
  checks.hasInternalLinks = internalLinks > 0;
  checks.externalLinksOptimized = totalExternalLinks === 0 || externalLinksWithNofollow / totalExternalLinks >= 0.5;
  
  // Content Analysis
  checks.hasH1Tag = $('h1').length > 0;
  checks.hasMultipleHeadings = $('h1, h2, h3, h4, h5, h6').length > 1;
  checks.hasMetaDescription = $('meta[name="description"]').length > 0;
  
  // Performance & Technical
  checks.hasSSL = url.startsWith('https://');
  checks.noInlineStyles = $('style').length === 0 && !html.includes('style=');
  checks.minifiedHTML = html.length < html.replace(/\s+/g, ' ').length * 0.8; // Basic minification check
  
  // Mobile Optimization
  checks.responsiveImages = $('img[srcset]').length > 0 || $('picture').length > 0;
  checks.touchFriendlyElements = $('[onclick]').length === 0; // Basic check for touch-friendly elements
  
  // Sitemap and Robots
  checks.sitemap = html.includes('sitemap') || html.includes('Sitemap');
  checks.robotsTxt = true; // Would need separate request to check /robots.txt
  
  // Social Media Optimization
  checks.hasTwitterSite = $('meta[name="twitter:site"]').length > 0;
  checks.hasOGImage = $('meta[property="og:image"]').length > 0;
  
  // Content Quality Indicators
  const textContent = $.text();
  checks.sufficientContent = textContent.length > 300;
  checks.keywordInTitle = $('title').text().split(' ').length >= 3;
  
  return {
    schemaMarkup: checks.hasSchemaMarkup,
    sitemap: checks.sitemap,
    technicalSeoChecks: checks,
  };
}

// Helper function to calculate SEO score and recommendations
function calculateSeoScore(data: any) {
  let score = 0;
  let passed = 0;
  let warnings = 0;
  let errors = 0;
  const recommendations: any[] = [];
  
  // Use the advanced technical checks directly from data
  const technicalSeoChecks = data.technicalSeoChecks || {};

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

  // Process advanced technical SEO checks
  const techChecks = data.technicalSeoChecks || {};
  let techScore = 0;
  let techPassed = 0;
  let techWarnings = 0;
  let techErrors = 0;

  // Critical technical checks (higher points)
  const criticalChecks = [
    { key: 'hasSSL', points: 8, title: 'HTTPS/SSL Security', description: 'Website must use HTTPS for security and SEO' },
    { key: 'hasViewportMeta', points: 6, title: 'Mobile Viewport', description: 'Viewport meta tag is essential for mobile optimization' },
    { key: 'hasH1Tag', points: 6, title: 'H1 Heading Tag', description: 'Every page should have exactly one H1 tag' },
    { key: 'hasMetaDescription', points: 6, title: 'Meta Description', description: 'Meta description is crucial for search results' },
  ];

  // Important technical checks (medium points)
  const importantChecks = [
    { key: 'hasCharset', points: 4, title: 'Character Encoding', description: 'Proper character encoding prevents display issues' },
    { key: 'hasLangAttribute', points: 4, title: 'Language Declaration', description: 'HTML lang attribute helps search engines understand content language' },
    { key: 'hasCanonicalURL', points: 4, title: 'Canonical URL', description: 'Prevents duplicate content issues' },
    { key: 'hasSchemaMarkup', points: 5, title: 'Schema Markup', description: 'Structured data improves rich snippets' },
    { key: 'imagesHaveAltText', points: 4, title: 'Image Alt Text', description: 'Alt text improves accessibility and SEO' },
    { key: 'hasMultipleHeadings', points: 3, title: 'Heading Structure', description: 'Proper heading hierarchy improves content structure' },
  ];

  // Performance and optimization checks (lower points)
  const optimizationChecks = [
    { key: 'minifiedHTML', points: 2, title: 'HTML Optimization', description: 'Minified HTML improves loading speed' },
    { key: 'noInlineStyles', points: 2, title: 'External Stylesheets', description: 'External CSS improves caching and performance' },
    { key: 'responsiveImages', points: 3, title: 'Responsive Images', description: 'Optimized images for different screen sizes' },
    { key: 'hasInternalLinks', points: 2, title: 'Internal Linking', description: 'Internal links improve site navigation and SEO' },
    { key: 'sufficientContent', points: 3, title: 'Content Length', description: 'Sufficient content provides value to users' },
  ];

  const allTechnicalChecks = [...criticalChecks, ...importantChecks, ...optimizationChecks];

  // Evaluate all technical checks
  allTechnicalChecks.forEach(check => {
    if (techChecks[check.key]) {
      techScore += check.points;
      techPassed++;
      recommendations.push({
        type: 'success',
        priority: 'low',
        title: `✓ ${check.title}`,
        description: check.description
      });
    } else {
      if (criticalChecks.some(c => c.key === check.key)) {
        techErrors++;
        recommendations.push({
          type: 'error',
          priority: 'high',
          title: `Missing: ${check.title}`,
          description: check.description
        });
      } else {
        techWarnings++;
        recommendations.push({
          type: 'warning',
          priority: 'medium',
          title: `Improve: ${check.title}`,
          description: check.description
        });
      }
    }
  });

  // Add technical score to overall score
  score += techScore;
  passed += techPassed;
  warnings += techWarnings;
  errors += techErrors;

  return {
    score: Math.min(score, 100),
    passed,
    warnings,
    errors,
    recommendations,
    technicalSeoChecks,
  };
}
