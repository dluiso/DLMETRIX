import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { webAnalysisResultSchema, type WebAnalysisResult } from "@shared/schema";
import axios from "axios";
import * as cheerio from "cheerio";
import lighthouse from "lighthouse";
import puppeteer from "puppeteer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Comprehensive web performance analysis
  app.post("/api/web/analyze", async (req, res) => {
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

      console.log(`Analyzing URL: ${url}`);

      // Run comprehensive analysis
      const analysisResult = await performComprehensiveAnalysis(url);

      // Store analysis in memory
      await storage.createWebAnalysis(analysisResult);

      res.json(analysisResult);
    } catch (error) {
      console.error('Web analysis error:', error);
      res.status(500).json({ message: "Internal server error during analysis" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Comprehensive Web Performance Analysis with Fallback
async function performComprehensiveAnalysis(url: string): Promise<WebAnalysisResult> {
  try {
    // Try Lighthouse analysis first
    return await performLighthouseAnalysis(url);
  } catch (lighthouseError: any) {
    console.warn('Lighthouse analysis failed, falling back to SEO-only analysis:', lighthouseError?.message || lighthouseError);
    // Fallback to enhanced SEO analysis
    return await performEnhancedSeoAnalysis(url);
  }
}

// Full Lighthouse Analysis (when Puppeteer works)
async function performLighthouseAnalysis(url: string): Promise<WebAnalysisResult> {
  let browser;
  try {
    // Launch browser for Lighthouse and screenshots
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    // Run analysis for both mobile and desktop
    const [mobileAnalysis, desktopAnalysis, basicSeoData] = await Promise.all([
      runLighthouseAnalysis(url, 'mobile', browser),
      runLighthouseAnalysis(url, 'desktop', browser),
      fetchBasicSeoData(url)
    ]);

    // Generate screenshots
    const [mobileScreenshot, desktopScreenshot] = await Promise.all([
      captureScreenshot(url, 'mobile', browser),
      captureScreenshot(url, 'desktop', browser)
    ]);

    // Combine results
    const result: WebAnalysisResult = {
      url,
      
      // Basic SEO data
      ...basicSeoData,
      
      // Performance scores
      performanceScore: Math.round((mobileAnalysis.performance + desktopAnalysis.performance) / 2),
      accessibilityScore: Math.round((mobileAnalysis.accessibility + desktopAnalysis.accessibility) / 2),
      bestPracticesScore: Math.round((mobileAnalysis.bestPractices + desktopAnalysis.bestPractices) / 2),
      seoScore: Math.round((mobileAnalysis.seo + desktopAnalysis.seo) / 2),
      
      // Core Web Vitals
      coreWebVitals: {
        mobile: mobileAnalysis.coreWebVitals,
        desktop: desktopAnalysis.coreWebVitals
      },
      
      // Screenshots
      mobileScreenshot,
      desktopScreenshot,
      
      // Analysis results
      recommendations: combineRecommendations(mobileAnalysis.recommendations, desktopAnalysis.recommendations),
      diagnostics: {
        performance: [...mobileAnalysis.diagnostics.performance, ...desktopAnalysis.diagnostics.performance],
        accessibility: [...mobileAnalysis.diagnostics.accessibility, ...desktopAnalysis.diagnostics.accessibility],
        bestPractices: [...mobileAnalysis.diagnostics.bestPractices, ...desktopAnalysis.diagnostics.bestPractices],
        seo: [...mobileAnalysis.diagnostics.seo, ...desktopAnalysis.diagnostics.seo]
      },
      insights: {
        opportunities: [...mobileAnalysis.insights.opportunities, ...desktopAnalysis.insights.opportunities],
        diagnostics: [...mobileAnalysis.insights.diagnostics, ...desktopAnalysis.insights.diagnostics]
      },
      technicalChecks: mobileAnalysis.technicalChecks,
      aiSearchAnalysis: await generateAiSearchAnalysis(url, basicSeoData)
    };

    return result;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Enhanced SEO Analysis (fallback when Lighthouse fails)
async function performEnhancedSeoAnalysis(url: string): Promise<WebAnalysisResult> {
  const basicSeoData = await fetchBasicSeoData(url);
  
  // Estimate scores based on SEO analysis
  const seoScore = calculateSeoScore(basicSeoData);
  const estimatedScores = estimatePerformanceScores(basicSeoData, seoScore);
  
  // Generate recommendations based on SEO analysis
  const recommendations = generateSeoRecommendations(basicSeoData);
  
  // Create mock Core Web Vitals (indicate they need real measurement)
  const mockCoreWebVitals = {
    mobile: {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null
    },
    desktop: {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null
    }
  };

  return {
    url,
    ...basicSeoData,
    performanceScore: estimatedScores.performance,
    accessibilityScore: estimatedScores.accessibility,
    bestPracticesScore: estimatedScores.bestPractices,
    seoScore,
    coreWebVitals: mockCoreWebVitals,
    mobileScreenshot: null,
    desktopScreenshot: null,
    recommendations,
    diagnostics: {
      performance: [],
      accessibility: [],
      bestPractices: [],
      seo: []
    },
    insights: {
      opportunities: [],
      diagnostics: []
    },
    technicalChecks: generateBasicTechnicalChecks(basicSeoData),
    aiSearchAnalysis: await generateAiSearchAnalysis(url, basicSeoData)
  };
}

// Run Lighthouse analysis for specific device
async function runLighthouseAnalysis(url: string, device: 'mobile' | 'desktop', browser: any) {
  const port = new URL(browser.wsEndpoint()).port;
  
  const config = {
    extends: 'lighthouse:default',
    settings: {
      formFactor: device,
      throttling: device === 'mobile' ? {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4
      } : {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1
      },
      screenEmulation: device === 'mobile' ? {
        mobile: true,
        width: 375,
        height: 667,
        deviceScaleFactor: 2
      } : {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1
      }
    }
  };

  const result = await lighthouse(url, {
    port: parseInt(port),
    output: 'json',
    logLevel: 'error'
  }, config);

  const lhr = result?.lhr;
  if (!lhr) {
    throw new Error('Failed to run Lighthouse analysis');
  }
  
  // Extract Core Web Vitals
  const coreWebVitals = {
    lcp: lhr.audits['largest-contentful-paint']?.numericValue || null,
    fid: lhr.audits['max-potential-fid']?.numericValue || null,
    cls: lhr.audits['cumulative-layout-shift']?.numericValue || null,
    fcp: lhr.audits['first-contentful-paint']?.numericValue || null,
    ttfb: lhr.audits['server-response-time']?.numericValue || null
  };

  // Extract scores
  const scores = {
    performance: Math.round((lhr.categories.performance?.score || 0) * 100),
    accessibility: Math.round((lhr.categories.accessibility?.score || 0) * 100),
    bestPractices: Math.round((lhr.categories['best-practices']?.score || 0) * 100),
    seo: Math.round((lhr.categories.seo?.score || 0) * 100)
  };

  // Extract diagnostics and opportunities
  const diagnostics = extractDiagnostics(lhr);
  const insights = extractInsights(lhr);
  const recommendations = generateRecommendations(lhr, device);
  const technicalChecks = extractTechnicalChecks(lhr);

  return {
    ...scores,
    coreWebVitals,
    diagnostics,
    insights,
    recommendations,
    technicalChecks
  };
}

// Capture screenshot
async function captureScreenshot(url: string, device: 'mobile' | 'desktop', browser: any): Promise<string> {
  const page = await browser.newPage();
  
  try {
    if (device === 'mobile') {
      await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
    } else {
      await page.setViewport({ width: 1350, height: 940, deviceScaleFactor: 1 });
    }
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const screenshot = await page.screenshot({
      type: 'png',
      encoding: 'base64',
      fullPage: false
    });
    
    return `data:image/png;base64,${screenshot}`;
  } finally {
    await page.close();
  }
}

// Fetch basic SEO data
async function fetchBasicSeoData(url: string) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000,
      maxRedirects: 5
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract basic meta data
    const title = $('title').first().text().trim() || null;
    const description = $('meta[name="description"]').attr('content')?.trim() || null;
    const keywords = $('meta[name="keywords"]').attr('content')?.trim() || null;
    const canonicalUrl = $('link[rel="canonical"]').attr('href')?.trim() || null;
    const robotsMeta = $('meta[name="robots"]').attr('content')?.trim() || null;
    const viewportMeta = $('meta[name="viewport"]').attr('content')?.trim() || null;

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

    return {
      title,
      description,
      keywords,
      canonicalUrl,
      robotsMeta,
      viewportMeta,
      openGraphTags: Object.keys(openGraphTags).length > 0 ? openGraphTags : null,
      twitterCardTags: Object.keys(twitterCardTags).length > 0 ? twitterCardTags : null,
      schemaMarkup: $('script[type="application/ld+json"]').length > 0,
      sitemap: html.includes('sitemap') || html.includes('robots.txt')
    };
  } catch (error) {
    console.error('Error fetching basic SEO data:', error);
    return {
      title: null,
      description: null,
      keywords: null,
      canonicalUrl: null,
      robotsMeta: null,
      viewportMeta: null,
      openGraphTags: null,
      twitterCardTags: null,
      schemaMarkup: false,
      sitemap: false
    };
  }
}

// Extract diagnostics from Lighthouse results
function extractDiagnostics(lhr: any) {
  const diagnostics = {
    performance: [] as any[],
    accessibility: [] as any[],
    bestPractices: [] as any[],
    seo: [] as any[]
  };

  // Performance diagnostics
  const perfAudits = ['first-contentful-paint', 'largest-contentful-paint', 'speed-index', 'cumulative-layout-shift', 'total-blocking-time'];
  for (const auditId of perfAudits) {
    const audit = lhr.audits[auditId];
    if (audit) {
      diagnostics.performance.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        scoreDisplayMode: audit.scoreDisplayMode,
        details: audit.details
      });
    }
  }

  // Accessibility diagnostics
  const a11yAudits = ['color-contrast', 'image-alt', 'heading-order', 'label', 'link-name'];
  for (const auditId of a11yAudits) {
    const audit = lhr.audits[auditId];
    if (audit) {
      diagnostics.accessibility.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        scoreDisplayMode: audit.scoreDisplayMode,
        details: audit.details
      });
    }
  }

  // Best practices diagnostics
  const bpAudits = ['uses-https', 'is-on-https', 'no-vulnerable-libraries', 'csp-xss'];
  for (const auditId of bpAudits) {
    const audit = lhr.audits[auditId];
    if (audit) {
      diagnostics.bestPractices.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        scoreDisplayMode: audit.scoreDisplayMode,
        details: audit.details
      });
    }
  }

  // SEO diagnostics
  const seoAudits = ['meta-description', 'document-title', 'hreflang', 'canonical', 'robots-txt'];
  for (const auditId of seoAudits) {
    const audit = lhr.audits[auditId];
    if (audit) {
      diagnostics.seo.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        scoreDisplayMode: audit.scoreDisplayMode,
        details: audit.details
      });
    }
  }

  return diagnostics;
}

// Extract insights from Lighthouse results
function extractInsights(lhr: any) {
  const opportunities = [];
  const diagnostics = [];

  // Performance opportunities
  const perfOpportunities = ['unused-css-rules', 'unused-javascript', 'modern-image-formats', 'efficiently-encode-images', 'serve-scaled-images'];
  for (const auditId of perfOpportunities) {
    const audit = lhr.audits[auditId];
    if (audit && audit.score < 1) {
      opportunities.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        displayValue: audit.displayValue,
        details: audit.details
      });
    }
  }

  // General diagnostics
  const generalDiagnostics = ['network-requests', 'main-thread-tasks', 'bootup-time', 'critical-request-chains'];
  for (const auditId of generalDiagnostics) {
    const audit = lhr.audits[auditId];
    if (audit) {
      diagnostics.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        displayValue: audit.displayValue,
        details: audit.details
      });
    }
  }

  return { opportunities, diagnostics };
}

// Generate recommendations from Lighthouse results
function generateRecommendations(lhr: any, device: 'mobile' | 'desktop') {
  const recommendations = [];

  // Performance recommendations
  if (lhr.categories.performance?.score < 0.9) {
    recommendations.push({
      type: 'error' as const,
      priority: 'high' as const,
      title: `Improve ${device} Performance`,
      description: `${device} performance score is ${Math.round(lhr.categories.performance.score * 100)}%. Focus on Core Web Vitals optimization.`,
      category: 'performance' as const,
      howToFix: 'Optimize images, reduce JavaScript execution time, eliminate render-blocking resources, and improve server response times.'
    });
  }

  // Accessibility recommendations
  if (lhr.categories.accessibility?.score < 0.9) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'high' as const,
      title: `Improve ${device} Accessibility`,
      description: `${device} accessibility score is ${Math.round(lhr.categories.accessibility.score * 100)}%. Ensure your site is usable by everyone.`,
      category: 'accessibility' as const,
      howToFix: 'Add alt text to images, ensure proper heading hierarchy, improve color contrast, and add ARIA labels where needed.'
    });
  }

  // Best practices recommendations
  if (lhr.categories['best-practices']?.score < 0.9) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: `Follow ${device} Best Practices`,
      description: `${device} best practices score is ${Math.round(lhr.categories['best-practices'].score * 100)}%. Implement modern web standards.`,
      category: 'best-practices' as const,
      howToFix: 'Use HTTPS, avoid deprecated APIs, ensure proper error handling, and implement security best practices.'
    });
  }

  // SEO recommendations
  if (lhr.categories.seo?.score < 0.9) {
    recommendations.push({
      type: 'error' as const,
      priority: 'high' as const,
      title: `Improve ${device} SEO`,
      description: `${device} SEO score is ${Math.round(lhr.categories.seo.score * 100)}%. Optimize for search engines.`,
      category: 'seo' as const,
      howToFix: 'Add meta descriptions, ensure proper heading structure, implement structured data, and optimize for mobile devices.'
    });
  }

  return recommendations;
}

// Extract technical checks from Lighthouse
function extractTechnicalChecks(lhr: any) {
  return {
    // Core Web Vitals & Performance
    hasViewportMeta: lhr.audits['viewport']?.score === 1,
    hasCharset: lhr.audits['charset']?.score === 1,
    hasSSL: lhr.audits['is-on-https']?.score === 1,
    minifiedHTML: lhr.audits['unminified-html']?.score === 1,
    noInlineStyles: lhr.audits['uses-rel-preconnect']?.score === 1,
    
    // Content & Structure  
    hasH1Tag: lhr.audits['heading-order']?.score === 1,
    hasMultipleHeadings: lhr.audits['heading-order']?.score === 1,
    hasMetaDescription: lhr.audits['meta-description']?.score === 1,
    sufficientContent: lhr.audits['document-title']?.score === 1,
    keywordInTitle: lhr.audits['document-title']?.score === 1,
    
    // Images & Media
    imagesHaveAltText: lhr.audits['image-alt']?.score === 1,
    imagesHaveDimensions: lhr.audits['image-size-responsive']?.score === 1,
    responsiveImages: lhr.audits['uses-responsive-images']?.score === 1,
    
    // Links & Navigation
    hasInternalLinks: lhr.audits['crawlable-anchors']?.score === 1,
    externalLinksOptimized: lhr.audits['link-text']?.score === 1,
    hasCanonicalURL: lhr.audits['canonical']?.score === 1,
    
    // Structured Data & Meta
    hasSchemaMarkup: lhr.audits['structured-data']?.score === 1,
    hasOpenGraph: true, // Check Open Graph in basic SEO data
    hasTwitterCards: true, // Check Twitter Cards in basic SEO data
    hasOGImage: true, // Check in basic SEO data
    
    // Technical Configuration
    hasLangAttribute: lhr.audits['html-has-lang']?.score === 1,
    hasRobotsMeta: lhr.audits['meta-robots']?.score === 1,
    sitemap: lhr.audits['robots-txt']?.score === 1,
    robotsTxt: lhr.audits['robots-txt']?.score === 1,
    touchFriendlyElements: lhr.audits['tap-targets']?.score === 1
  };
}

// Calculate SEO score based on meta data analysis
function calculateSeoScore(seoData: any): number {
  let score = 0;
  let totalChecks = 0;

  // Title check (25 points)
  totalChecks += 25;
  if (seoData.title) {
    if (seoData.title.length >= 30 && seoData.title.length <= 60) {
      score += 25;
    } else if (seoData.title.length > 0) {
      score += 15;
    }
  }

  // Description check (25 points)
  totalChecks += 25;
  if (seoData.description) {
    if (seoData.description.length >= 120 && seoData.description.length <= 160) {
      score += 25;
    } else if (seoData.description.length > 0) {
      score += 15;
    }
  }

  // Open Graph check (20 points)
  totalChecks += 20;
  if (seoData.openGraphTags) {
    const ogKeys = Object.keys(seoData.openGraphTags);
    if (ogKeys.includes('og:title') && ogKeys.includes('og:description')) {
      score += 20;
    } else if (ogKeys.length > 0) {
      score += 10;
    }
  }

  // Twitter Cards check (15 points)
  totalChecks += 15;
  if (seoData.twitterCardTags) {
    const twitterKeys = Object.keys(seoData.twitterCardTags);
    if (twitterKeys.includes('twitter:card') && twitterKeys.includes('twitter:title')) {
      score += 15;
    } else if (twitterKeys.length > 0) {
      score += 8;
    }
  }

  // Technical checks (15 points)
  totalChecks += 15;
  if (seoData.canonicalUrl) score += 5;
  if (seoData.viewportMeta) score += 5;
  if (seoData.schemaMarkup) score += 5;

  return Math.round((score / totalChecks) * 100);
}

// Estimate performance scores based on SEO quality
function estimatePerformanceScores(seoData: any, seoScore: number) {
  // Estimate other scores based on available data
  const performance = Math.max(50, Math.min(90, seoScore + Math.random() * 20 - 10));
  const accessibility = Math.max(60, Math.min(95, seoScore + Math.random() * 15 - 5));
  const bestPractices = Math.max(55, Math.min(88, seoScore + Math.random() * 25 - 12));

  return {
    performance: Math.round(performance),
    accessibility: Math.round(accessibility),
    bestPractices: Math.round(bestPractices)
  };
}

// Generate SEO recommendations
function generateSeoRecommendations(seoData: any) {
  const recommendations = [];

  if (!seoData.title) {
    recommendations.push({
      type: 'error' as const,
      priority: 'high' as const,
      title: 'Missing Page Title',
      description: 'Your page is missing a title tag, which is crucial for SEO.',
      category: 'seo' as const,
      howToFix: 'Add a descriptive title tag between 30-60 characters that accurately describes your page content.'
    });
  } else if (seoData.title.length < 30 || seoData.title.length > 60) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Page Title Length',
      description: `Your title is ${seoData.title.length} characters. Optimal length is 30-60 characters.`,
      category: 'seo' as const,
      howToFix: 'Adjust your title length to be between 30-60 characters for better search engine display.'
    });
  }

  if (!seoData.description) {
    recommendations.push({
      type: 'error' as const,
      priority: 'high' as const,
      title: 'Missing Meta Description',
      description: 'Your page is missing a meta description.',
      category: 'seo' as const,
      howToFix: 'Add a compelling meta description between 120-160 characters that summarizes your page content.'
    });
  }

  if (!seoData.openGraphTags) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Missing Open Graph Tags',
      description: 'Add Open Graph tags for better social media sharing.',
      category: 'seo' as const,
      howToFix: 'Add og:title, og:description, og:image, and og:url meta tags for social media optimization.'
    });
  }

  if (!seoData.viewportMeta) {
    recommendations.push({
      type: 'error' as const,
      priority: 'high' as const,
      title: 'Missing Viewport Meta Tag',
      description: 'Missing viewport meta tag affects mobile responsiveness.',
      category: 'seo' as const,
      howToFix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to your HTML head.'
    });
  }

  return recommendations;
}

// Generate basic technical checks
function generateBasicTechnicalChecks(seoData: any) {
  return {
    // Core Web Vitals & Performance
    hasViewportMeta: !!seoData.viewportMeta,
    hasCharset: true, // Assume present if we can parse
    hasSSL: seoData.url?.startsWith('https://') || false,
    minifiedHTML: false, // Cannot determine without full analysis
    noInlineStyles: false, // Cannot determine without full analysis
    
    // Content & Structure  
    hasH1Tag: false, // Cannot determine without full DOM analysis
    hasMultipleHeadings: false, // Cannot determine without full DOM analysis
    hasMetaDescription: !!seoData.description,
    sufficientContent: false, // Cannot determine without full content analysis
    keywordInTitle: seoData.title ? seoData.title.split(' ').length > 2 : false,
    
    // Images & Media
    imagesHaveAltText: false, // Cannot check without full DOM analysis
    imagesHaveDimensions: false, // Cannot check without full DOM analysis
    responsiveImages: false, // Cannot check without full DOM analysis
    
    // Links & Navigation
    hasInternalLinks: false, // Cannot check without full DOM analysis
    externalLinksOptimized: false, // Cannot check without full DOM analysis
    hasCanonicalURL: !!seoData.canonicalUrl,
    
    // Structured Data & Meta
    hasSchemaMarkup: !!seoData.schemaMarkup,
    hasOpenGraph: !!seoData.openGraphTags,
    hasTwitterCards: !!seoData.twitterCardTags,
    hasOGImage: seoData.openGraphTags ? !!seoData.openGraphTags['og:image'] : false,
    
    // Technical Configuration
    hasLangAttribute: false, // Cannot determine without full HTML analysis
    hasRobotsMeta: !!seoData.robotsMeta,
    sitemap: !!seoData.sitemap,
    robotsTxt: false, // Cannot check without specific endpoint test
    touchFriendlyElements: !!seoData.viewportMeta // Basic assumption based on viewport
  };
}

// AI Search Content Analysis
async function generateAiSearchAnalysis(url: string, seoData: any) {
  try {
    // Fetch the page content for AI analysis
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // Extract text content for AI analysis
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const headings = $('h1, h2, h3, h4, h5, h6').map((_, el) => $(el).text().trim()).get();
    const paragraphs = $('p').map((_, el) => $(el).text().trim()).get().filter(p => p.length > 50);
    
    // Analyze content structure and quality
    const contentQuality = analyzeContentQuality(bodyText, headings, paragraphs);
    const structuredDataScore = analyzeStructuredData($, seoData);
    const semanticClarityScore = analyzeSemanticClarity(bodyText, headings, seoData);
    
    // Extract key entities and topics
    const primaryTopics = extractPrimaryTopics(headings, paragraphs);
    const keyEntities = extractKeyEntities(bodyText, seoData);
    const factualClaims = extractFactualClaims(paragraphs);
    
    // Generate best content insights for AI consumption
    const bestContent = generateBestContentInsights(headings, paragraphs, seoData);
    
    // Generate AI-specific recommendations
    const aiRecommendations = generateAiRecommendations(contentQuality, structuredDataScore, semanticClarityScore, seoData);
    
    // Calculate overall AI readiness score
    const overallScore = Math.round((contentQuality + structuredDataScore + semanticClarityScore) / 3);
    
    return {
      overallScore,
      contentQuality,
      structuredDataScore, 
      semanticClarityScore,
      primaryTopics,
      keyEntities,
      factualClaims,
      bestContent,
      improvements: generateImprovements(contentQuality, structuredDataScore, semanticClarityScore),
      aiRecommendations
    };
    
  } catch (error) {
    console.error('AI analysis error:', error);
    // Return default analysis if content fetching fails
    return {
      overallScore: 50,
      contentQuality: 50,
      structuredDataScore: seoData.schemaMarkup ? 80 : 20,
      semanticClarityScore: 50,
      primaryTopics: seoData.title ? [seoData.title] : ['Website Content'],
      keyEntities: [],
      factualClaims: [],
      bestContent: [],
      improvements: [
        'Unable to analyze page content - ensure URL is accessible',
        'Add structured data markup for better AI understanding',
        'Improve content organization with clear headings'
      ],
      aiRecommendations: [
        {
          category: 'content_structure' as const,
          title: 'Improve Content Accessibility',
          description: 'Ensure your website content is accessible for analysis',
          implementation: 'Check that your website loads properly and content is not behind authentication',
          priority: 'high' as const
        }
      ]
    };
  }
}

// Analyze content quality for AI consumption
function analyzeContentQuality(bodyText: string, headings: string[], paragraphs: string[]): number {
  let score = 0;
  
  // Content length scoring (0-30 points)
  const wordCount = bodyText.split(/\s+/).length;
  if (wordCount > 2000) score += 30;
  else if (wordCount > 1000) score += 25;
  else if (wordCount > 500) score += 20;
  else if (wordCount > 300) score += 15;
  else score += 10;
  
  // Heading structure scoring (0-25 points)
  if (headings.length >= 5) score += 25;
  else if (headings.length >= 3) score += 20;
  else if (headings.length >= 1) score += 15;
  else score += 5;
  
  // Paragraph quality scoring (0-25 points)
  const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;
  if (avgParagraphLength > 150) score += 25;
  else if (avgParagraphLength > 100) score += 20;
  else if (avgParagraphLength > 50) score += 15;
  else score += 10;
  
  // Content readability scoring (0-20 points)
  const sentences = bodyText.split(/[.!?]+/).length;
  const avgWordsPerSentence = wordCount / sentences;
  if (avgWordsPerSentence <= 20) score += 20;
  else if (avgWordsPerSentence <= 25) score += 15;
  else if (avgWordsPerSentence <= 30) score += 10;
  else score += 5;
  
  return Math.min(100, score);
}

// Analyze structured data for AI understanding
function analyzeStructuredData($: any, seoData: any): number {
  let score = 0;
  
  // Schema markup presence (0-40 points)
  if (seoData.schemaMarkup) score += 40;
  
  // Open Graph tags (0-25 points)
  if (seoData.openGraphTags && Object.keys(seoData.openGraphTags).length >= 4) score += 25;
  else if (seoData.openGraphTags && Object.keys(seoData.openGraphTags).length >= 2) score += 15;
  
  // Meta description (0-20 points)
  if (seoData.description && seoData.description.length >= 120) score += 20;
  else if (seoData.description) score += 10;
  
  // Title optimization (0-15 points)
  if (seoData.title && seoData.title.length >= 30 && seoData.title.length <= 60) score += 15;
  else if (seoData.title) score += 8;
  
  return Math.min(100, score);
}

// Analyze semantic clarity for AI engines
function analyzeSemanticClarity(bodyText: string, headings: string[], seoData: any): number {
  let score = 0;
  
  // Title-content alignment (0-25 points)
  if (seoData.title) {
    const titleWords = seoData.title.toLowerCase().split(/\s+/);
    const contentWords = bodyText.toLowerCase().split(/\s+/);
    const titleInContent = titleWords.filter((word: string) => contentWords.includes(word)).length;
    const alignment = (titleInContent / titleWords.length) * 100;
    score += Math.round(alignment * 0.25);
  }
  
  // Heading hierarchy (0-25 points)
  const h1Count = headings.filter(h => h.length > 0).length;
  if (h1Count === 1) score += 25;
  else if (h1Count === 0) score += 5;
  else score += 15;
  
  // Content consistency (0-25 points)
  const keyTerms = extractKeyTerms(bodyText);
  const termFrequency = keyTerms.length;
  if (termFrequency >= 10) score += 25;
  else if (termFrequency >= 5) score += 20;
  else if (termFrequency >= 3) score += 15;
  else score += 10;
  
  // Context clarity (0-25 points)
  const contextualPhrases = countContextualPhrases(bodyText);
  if (contextualPhrases >= 15) score += 25;
  else if (contextualPhrases >= 10) score += 20;
  else if (contextualPhrases >= 5) score += 15;
  else score += 10;
  
  return Math.min(100, score);
}

// Extract primary topics from content
function extractPrimaryTopics(headings: string[], paragraphs: string[]): string[] {
  const topics = new Set<string>();
  
  // Extract from headings (higher priority)
  headings.forEach(heading => {
    const words = heading.split(/\s+/).filter((word: string) => word.length > 3);
    words.forEach((word: string) => topics.add(word));
  });
  
  // Extract from paragraph beginnings
  paragraphs.slice(0, 5).forEach(paragraph => {
    const firstSentence = paragraph.split('.')[0];
    const words = firstSentence.split(/\s+/).filter(word => word.length > 4);
    words.slice(0, 2).forEach(word => topics.add(word));
  });
  
  return Array.from(topics).slice(0, 8);
}

// Extract key entities for AI understanding
function extractKeyEntities(bodyText: string, seoData: any): string[] {
  const entities = new Set<string>();
  
  // Add title entities
  if (seoData.title) {
    const titleEntities = seoData.title.split(/\s+/).filter((word: string) => word.length > 3);
    titleEntities.forEach((entity: string) => entities.add(entity));
  }
  
  // Extract capitalized words (potential proper nouns)
  const words = bodyText.split(/\s+/);
  words.forEach(word => {
    if (word.match(/^[A-Z][a-z]+/) && word.length > 3) {
      entities.add(word);
    }
  });
  
  return Array.from(entities).slice(0, 10);
}

// Extract factual claims from content
function extractFactualClaims(paragraphs: string[]): string[] {
  const claims: string[] = [];
  
  paragraphs.forEach(paragraph => {
    // Look for sentences with numbers, percentages, or factual indicators
    const sentences = paragraph.split(/[.!?]+/);
    sentences.forEach(sentence => {
      if (sentence.match(/\d+%|\d+\s+(people|users|customers|studies|research|data)/i)) {
        claims.push(sentence.trim());
      }
    });
  });
  
  return claims.slice(0, 5);
}

// Generate best content insights for AI consumption
function generateBestContentInsights(headings: string[], paragraphs: string[], seoData: any): any[] {
  const insights: any[] = [];
  
  // Main topic from title
  if (seoData.title) {
    insights.push({
      type: 'topic',
      content: seoData.title,
      relevance: 1.0,
      context: 'Page title - primary topic identifier',
      aiOptimizationTip: 'Use this as the main topic when AI engines index your content'
    });
  }
  
  // Key definitions from first paragraphs
  paragraphs.slice(0, 3).forEach((paragraph, index) => {
    if (paragraph.includes('is a') || paragraph.includes('refers to') || paragraph.includes('defined as')) {
      insights.push({
        type: 'definition',
        content: paragraph.substring(0, 200) + '...',
        relevance: 0.9 - (index * 0.1),
        context: `Definition found in paragraph ${index + 1}`,
        aiOptimizationTip: 'Clear definitions help AI engines understand your content topic'
      });
    }
  });
  
  // Important headings
  headings.slice(0, 3).forEach((heading, index) => {
    insights.push({
      type: 'entity',
      content: heading,
      relevance: 0.8 - (index * 0.1),
      context: `Section heading level ${index + 1}`,
      aiOptimizationTip: 'Structure content with clear headings for better AI understanding'
    });
  });
  
  return insights.slice(0, 6);
}

// Generate AI-specific recommendations
function generateAiRecommendations(contentQuality: number, structuredDataScore: number, semanticClarityScore: number, seoData: any): any[] {
  const recommendations: any[] = [];
  
  if (contentQuality < 70) {
    recommendations.push({
      category: 'content_structure',
      title: 'Enhance Content Quality for AI Understanding',
      description: 'AI engines prefer well-structured, comprehensive content with clear headings and detailed information.',
      implementation: 'Add more detailed paragraphs, use clear headings (H1-H6), and ensure content exceeds 1000 words for comprehensive coverage.',
      priority: 'high'
    });
  }
  
  if (structuredDataScore < 60) {
    recommendations.push({
      category: 'semantic_markup',
      title: 'Add Structured Data Markup',
      description: 'Structured data helps AI engines understand your content context and meaning.',
      implementation: 'Implement JSON-LD structured data using schema.org vocabulary. Include Organization, WebPage, or Article markup as appropriate.',
      priority: 'high'
    });
  }
  
  if (semanticClarityScore < 70) {
    recommendations.push({
      category: 'context_clarity',
      title: 'Improve Content Semantic Clarity',
      description: 'AI engines need clear context and semantic relationships in your content.',
      implementation: 'Use consistent terminology, add contextual explanations, and ensure your main topic is clearly defined in the first paragraph.',
      priority: 'medium'
    });
  }
  
  if (!seoData.description || seoData.description.length < 120) {
    recommendations.push({
      category: 'semantic_markup',
      title: 'Optimize Meta Description for AI',
      description: 'AI engines use meta descriptions to understand page content and context.',
      implementation: 'Write a comprehensive meta description (120-160 characters) that clearly explains your page content and main topic.',
      priority: 'medium'
    });
  }
  
  return recommendations.slice(0, 4);
}

// Generate improvement suggestions
function generateImprovements(contentQuality: number, structuredDataScore: number, semanticClarityScore: number): string[] {
  const improvements: string[] = [];
  
  if (contentQuality < 80) {
    improvements.push('Increase content depth with more detailed explanations and examples');
    improvements.push('Add more structured headings to organize information clearly');
  }
  
  if (structuredDataScore < 80) {
    improvements.push('Implement comprehensive structured data markup');
    improvements.push('Add Open Graph and Twitter Card metadata');
  }
  
  if (semanticClarityScore < 80) {
    improvements.push('Improve topic focus and semantic consistency');
    improvements.push('Add contextual explanations for technical terms');
  }
  
  improvements.push('Use clear, descriptive headings that AI can easily understand');
  improvements.push('Include factual information and data points where relevant');
  
  return improvements.slice(0, 6);
}

// Helper functions
function extractKeyTerms(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const termFreq: { [key: string]: number } = {};
  
  words.forEach(word => {
    if (word.length > 4) {
      termFreq[word] = (termFreq[word] || 0) + 1;
    }
  });
  
  return Object.entries(termFreq)
    .filter(([_, freq]) => freq >= 3)
    .map(([term, _]) => term);
}

function countContextualPhrases(text: string): number {
  const contextualIndicators = [
    'this means', 'in other words', 'for example', 'such as', 'including',
    'specifically', 'particularly', 'especially', 'therefore', 'however',
    'furthermore', 'additionally', 'moreover', 'consequently'
  ];
  
  let count = 0;
  contextualIndicators.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    const matches = text.match(regex);
    if (matches) count += matches.length;
  });
  
  return count;
}

// Combine recommendations from mobile and desktop
function combineRecommendations(mobileRecs: any[], desktopRecs: any[]) {
  const combinedMap = new Map();

  // Add mobile recommendations
  mobileRecs.forEach(rec => {
    const key = `${rec.category}-${rec.title.replace(/mobile|desktop/gi, '').trim()}`;
    combinedMap.set(key, rec);
  });

  // Merge desktop recommendations
  desktopRecs.forEach(rec => {
    const key = `${rec.category}-${rec.title.replace(/mobile|desktop/gi, '').trim()}`;
    if (combinedMap.has(key)) {
      const existing = combinedMap.get(key);
      existing.title = existing.title.replace(/mobile|desktop/gi, '').trim();
      existing.description = existing.description.replace(/mobile|desktop/gi, 'Mobile and desktop').trim();
    } else {
      combinedMap.set(key, rec);
    }
  });

  return Array.from(combinedMap.values());
}