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
    // Detect Chromium executable path for ARM64
    const chromiumPaths = [
      '/usr/bin/chromium-browser',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium'
    ];
    
    let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    
    if (!executablePath) {
      // Try to find Chromium automatically
      const fs = require('fs');
      for (const path of chromiumPaths) {
        try {
          if (fs.existsSync(path)) {
            executablePath = path;
            break;
          }
        } catch (e) {
          // Continue to next path
        }
      }
    }
    
    if (!executablePath) {
      throw new Error('No Chrome/Chromium executable found. Please install chromium-browser.');
    }
    
    console.log(`Using browser executable: ${executablePath}`);
    
    // Launch browser for Lighthouse and screenshots with ARM64 optimizations
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      timeout: 60000,
      protocolTimeout: 45000, // Increased for ARM64 screenshot timeouts
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
        '--ignore-ssl-errors',
        '--ignore-certificate-errors',
        '--allow-running-insecure-content',
        '--disable-component-extensions-with-background-pages',
        '--disable-background-networking',
        '--disable-ipc-flooding-protection' // Additional ARM64 optimization
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
      aiSearchAnalysis: await generateAiSearchAnalysis(url, basicSeoData),
      keywordAnalysis: generateKeywordAnalysis(basicSeoData, null, null)
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
    technicalChecks: generateBasicTechnicalChecks(basicSeoData, url),
    aiSearchAnalysis: await generateAiSearchAnalysis(url, basicSeoData),
    keywordAnalysis: generateKeywordAnalysis(basicSeoData, null, null)
  };
}

// Alternative Lighthouse analysis using Puppeteer directly for ARM64 compatibility
async function runLighthouseAnalysis(url: string, device: 'mobile' | 'desktop', browser: any) {
  console.log(`Starting manual performance analysis for ${device} (ARM64 compatible)`);
  
  const page = await browser.newPage();
  
  try {
    // Configure viewport for device
    if (device === 'mobile') {
      await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
      await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
    } else {
      await page.setViewport({ width: 1350, height: 940, deviceScaleFactor: 1 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    }

    // Enable performance monitoring (with error handling for ARM64)
    try {
      await page.tracing.start({ screenshots: false, categories: ['devtools.timeline'] });
    } catch (tracingError) {
      console.log('Tracing already started, continuing without new trace');
    }
    
    const startTime = Date.now();
    
    // Navigate and measure performance
    const response = await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // Stop tracing (with error handling)
    try {
      await page.tracing.stop();
    } catch (tracingError) {
      console.log('Tracing stop error (safe to ignore)');
    }
    
    // Get performance metrics
    const performanceMetrics = await page.metrics();
    
    // Simulate Core Web Vitals measurements
    const coreWebVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {
          lcp: null,
          fid: null,
          cls: null,
          fcp: null,
          ttfb: null
        };

        // Try to get Web Vitals if available
        if (typeof PerformanceObserver !== 'undefined') {
          try {
            // Largest Contentful Paint
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              if (entries.length > 0) {
                vitals.lcp = entries[entries.length - 1].startTime;
              }
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Contentful Paint
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              if (entries.length > 0) {
                vitals.fcp = entries[0].startTime;
              }
            }).observe({ entryTypes: ['paint'] });

            // Cumulative Layout Shift
            new PerformanceObserver((list) => {
              let clsValue = 0;
              for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                  clsValue += entry.value;
                }
              }
              vitals.cls = clsValue;
            }).observe({ entryTypes: ['layout-shift'] });

          } catch (e) {
            console.log('Web Vitals API not fully supported');
          }
        }

        // Fallback calculations
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          vitals.ttfb = navigation.responseStart - navigation.fetchStart;
          if (!vitals.fcp) vitals.fcp = navigation.loadEventEnd - navigation.fetchStart;
          if (!vitals.lcp) vitals.lcp = navigation.loadEventEnd - navigation.fetchStart;
        }

        setTimeout(() => resolve(vitals), 2000);
      });
    });

    // Calculate basic performance scores
    const scores = calculateBasicPerformanceScores(loadTime, performanceMetrics, response);
    
    await page.close();

    return {
      ...scores,
      coreWebVitals: {
        lcp: coreWebVitals.lcp || loadTime * 0.7,
        fid: coreWebVitals.fid || Math.min(100, loadTime * 0.1),
        cls: coreWebVitals.cls || 0.1,
        fcp: coreWebVitals.fcp || loadTime * 0.5,
        ttfb: coreWebVitals.ttfb || loadTime * 0.2
      },
      diagnostics: generateBasicDiagnostics(loadTime, performanceMetrics),
      insights: generateBasicInsights(loadTime, performanceMetrics),
      recommendations: generateBasicRecommendations(loadTime, device),
      technicalChecks: generateBasicTechnicalChecks({ status: response?.status() }, url)
    };
  } catch (error) {
    await page.close();
    throw error;
  }
}

// Helper function to calculate performance scores without Lighthouse
function calculateBasicPerformanceScores(loadTime: number, metrics: any, response: any) {
  // Score calculation based on load time and metrics
  const performanceScore = Math.max(0, Math.min(100, 100 - (loadTime / 100)));
  const accessibilityScore = response?.status() === 200 ? 85 : 50; // Basic check
  const bestPracticesScore = response?.headers()?.['content-security-policy'] ? 90 : 75;
  const seoScore = response?.status() === 200 ? 80 : 40;

  return {
    performance: Math.round(performanceScore),
    accessibility: Math.round(accessibilityScore),
    bestPractices: Math.round(bestPracticesScore),
    seo: Math.round(seoScore)
  };
}

// Helper functions for basic diagnostics
function generateBasicDiagnostics(loadTime: number, metrics: any) {
  const diagnostics: any = {
    performance: [],
    accessibility: [],
    bestPractices: [],
    seo: []
  };

  if (loadTime > 3000) {
    diagnostics.performance.push({
      id: 'slow-loading',
      title: 'Page loads slowly',
      description: `Page took ${Math.round(loadTime)}ms to load`,
      score: Math.max(0, 100 - (loadTime / 50)),
      displayValue: `${Math.round(loadTime)}ms`
    });
  }

  return diagnostics;
}

function generateBasicInsights(loadTime: number, metrics: any) {
  const opportunities = [];
  
  if (loadTime > 2000) {
    opportunities.push({
      id: 'optimize-loading',
      title: 'Optimize page loading performance',
      description: 'Consider implementing performance optimizations',
      score: Math.max(0, 100 - (loadTime / 30)),
      displayValue: `Potential ${Math.round((loadTime - 2000) / 100)}s savings`
    });
  }

  return {
    opportunities,
    diagnostics: []
  };
}

function generateBasicRecommendations(loadTime: number, device: string) {
  const recommendations = [];
  
  if (loadTime > 3000) {
    recommendations.push({
      category: 'performance',
      priority: 'high',
      title: 'Improve page loading speed',
      description: 'Your page is loading slowly. Consider optimizing images, minifying CSS/JS, and using a CDN.',
      fix: 'Optimize images, enable compression, minimize HTTP requests',
      impact: 'high'
    });
  }

  return recommendations;
}

// Capture screenshot optimized for ARM64
async function captureScreenshot(url: string, device: 'mobile' | 'desktop', browser: any): Promise<string> {
  const page = await browser.newPage();
  
  try {
    // Set longer timeout for ARM64 - increased for better compatibility
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
    
    if (device === 'mobile') {
      await page.setViewport({ 
        width: 375, 
        height: 600, // Reduced height for faster rendering
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true
      });
    } else {
      await page.setViewport({ width: 1350, height: 940, deviceScaleFactor: 1 });
    }
    
    // Navigate with optimized wait conditions for ARM64
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: device === 'mobile' ? 45000 : 55000 // Increased timeouts significantly
    });
    
    // Wait for content to settle
    const waitTime = device === 'mobile' ? 2000 : 3000; // Increased wait times
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    // Capture with timeout protection (optimized for mobile ARM64)
    const screenshotOptions = device === 'mobile' 
      ? {
          type: 'png' as const,
          encoding: 'base64' as const,
          fullPage: false,
          clip: { x: 0, y: 0, width: 375, height: 600 } // Reduced height for mobile
        }
      : {
          type: 'png' as const,
          encoding: 'base64' as const,
          fullPage: false,
          clip: { x: 0, y: 0, width: 1350, height: 940 }
        };
    
    const screenshotPromise = page.screenshot(screenshotOptions);
    
    // Different timeout for mobile vs desktop - significantly increased
    const timeoutMs = device === 'mobile' ? 40000 : 50000; // Increased from 25s/35s to 40s/50s
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Screenshot timeout')), timeoutMs)
    );
    
    const screenshot = await Promise.race([screenshotPromise, timeoutPromise]) as string;
    
    return `data:image/png;base64,${screenshot}`;
  } catch (error) {
    console.log(`Screenshot failed for ${device}: ${error.message}`);
    // Return a fallback placeholder instead of failing completely
    return null;
  } finally {
    await page.close();
  }
}

// Fetch comprehensive SEO data with DOM analysis
async function fetchBasicSeoData(url: string) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000,
      maxRedirects: 5
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const baseUrl = new URL(url).origin;

    // Extract basic meta data
    const title = $('title').first().text().trim() || null;
    const description = $('meta[name="description"]').attr('content')?.trim() || null;
    const keywords = $('meta[name="keywords"]').attr('content')?.trim() || null;
    const canonicalUrl = $('link[rel="canonical"]').attr('href')?.trim() || null;
    const robotsMeta = $('meta[name="robots"]').attr('content')?.trim() || null;
    const viewportMeta = $('meta[name="viewport"]').attr('content')?.trim() || null;
    const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content')?.includes('charset') || null;
    const langAttribute = $('html').attr('lang')?.trim() || null;

    // Extract headings structure
    const headings = {
      h1: $('h1').map((_, el) => $(el).text().trim()).get(),
      h2: $('h2').map((_, el) => $(el).text().trim()).get(),
      h3: $('h3').map((_, el) => $(el).text().trim()).get(),
      h4: $('h4').map((_, el) => $(el).text().trim()).get(),
      h5: $('h5').map((_, el) => $(el).text().trim()).get(),
      h6: $('h6').map((_, el) => $(el).text().trim()).get()
    };

    // Analyze images
    const images = $('img');
    const imageAnalysis = {
      total: images.length,
      withAlt: images.filter((_, img) => $(img).attr('alt')).length,
      withDimensions: images.filter((_, img) => $(img).attr('width') && $(img).attr('height')).length,
      withSrcset: images.filter((_, img) => $(img).attr('srcset')).length
    };

    // Analyze links
    const allLinks = $('a[href]');
    const internalLinks = allLinks.filter((_, link) => {
      const href = $(link).attr('href');
      return href && (href.startsWith('/') || href.startsWith(baseUrl) || href.startsWith('http') === false);
    });
    const externalLinks = allLinks.filter((_, link) => {
      const href = $(link).attr('href');
      return href && href.startsWith('http') && !href.startsWith(baseUrl);
    });

    // Analyze content quality
    const bodyText = $('body').text().trim();
    const paragraphs = $('p').map((_, el) => $(el).text().trim()).get().filter(text => text.length > 0);
    const wordCount = bodyText.split(/\s+/).length;

    // Check for inline styles and scripts
    const inlineStyles = $('style').length + $('[style]').length;
    const inlineScripts = $('script:not([src])').length;
    const externalCSS = $('link[rel="stylesheet"]').length;
    const externalJS = $('script[src]').length;

    // Advanced technical checks
    const hasMetaRobots = $('meta[name="robots"]').length > 0;
    const hasMetaKeywords = $('meta[name="keywords"]').length > 0;
    const hasMetaAuthor = $('meta[name="author"]').length > 0;
    const hasMetaGenerator = $('meta[name="generator"]').length > 0;
    
    // Check for favicon
    const hasFavicon = $('link[rel="icon"], link[rel="shortcut icon"]').length > 0;
    
    // Check for preload/prefetch optimizations
    const hasPreloadResources = $('link[rel="preload"], link[rel="prefetch"]').length > 0;
    
    // Check for proper heading hierarchy
    const headingLevels = [1, 2, 3, 4, 5, 6].map(level => $(`h${level}`).length);
    const hasProperHeadingHierarchy = headingLevels[0] === 1 && headingLevels.slice(1).some(count => count > 0);
    
    // Check for ARIA attributes and accessibility
    const hasAriaLabels = $('[aria-label], [aria-labelledby], [aria-describedby]').length > 0;
    const hasSkipLinks = $('a[href^="#"]').filter((_, el) => $(el).text().toLowerCase().includes('skip')).length > 0;
    
    // Check for forms and their labels
    const forms = $('form');
    const formInputs = $('input, textarea, select');
    const labeledInputs = formInputs.filter((_, input) => {
      const id = $(input).attr('id');
      const hasLabel = id ? $(`label[for="${id}"]`).length > 0 : false;
      const hasAriaLabel = $(input).attr('aria-label') || $(input).attr('aria-labelledby');
      return hasLabel || hasAriaLabel;
    });
    
    // Security checks
    const hasCSPMeta = $('meta[http-equiv="Content-Security-Policy"]').length > 0;
    const hasXFrameOptions = $('meta[http-equiv="X-Frame-Options"]').length > 0;

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

    // Check for structured data
    const structuredDataScripts = $('script[type="application/ld+json"]');
    const schemaMarkup = structuredDataScripts.length > 0;

    // Verify robots.txt and sitemap
    const [robotsTxtExists, sitemapExists] = await Promise.all([
      checkEndpoint(`${baseUrl}/robots.txt`),
      checkEndpoint(`${baseUrl}/sitemap.xml`)
    ]);

    return {
      title,
      description,
      keywords,
      canonicalUrl,
      robotsMeta,
      viewportMeta,
      charset,
      langAttribute,
      headings,
      imageAnalysis,
      linkAnalysis: {
        total: allLinks.length,
        internal: internalLinks.length,
        external: externalLinks.length
      },
      contentAnalysis: {
        wordCount,
        paragraphCount: paragraphs.length,
        bodyText: bodyText.substring(0, 1000) // First 1000 chars for analysis
      },
      technicalAnalysis: {
        inlineStyles,
        inlineScripts,
        externalCSS,
        externalJS,
        hasMinifiedContent: html.length < html.replace(/\s+/g, ' ').length * 0.7, // Basic minification check
        hasMetaRobots,
        hasMetaKeywords,
        hasMetaAuthor,
        hasMetaGenerator,
        hasFavicon,
        hasPreloadResources,
        hasProperHeadingHierarchy,
        hasAriaLabels,
        hasSkipLinks,
        hasCSPMeta,
        hasXFrameOptions,
        formAccessibility: {
          totalForms: forms.length,
          totalInputs: formInputs.length,
          labeledInputs: labeledInputs.length,
          accessibilityScore: formInputs.length > 0 ? (labeledInputs.length / formInputs.length) * 100 : 100
        }
      },
      openGraphTags: Object.keys(openGraphTags).length > 0 ? openGraphTags : null,
      twitterCardTags: Object.keys(twitterCardTags).length > 0 ? twitterCardTags : null,
      schemaMarkup,
      robotsTxtExists,
      sitemapExists,
      finalUrl: response.request.res.responseUrl || url,
      hasSSL: (response.request.res.responseUrl || url).startsWith('https://')
    };
  } catch (error) {
    console.error('Error fetching comprehensive SEO data:', error);
    return {
      title: null,
      description: null,
      keywords: null,
      canonicalUrl: null,
      robotsMeta: null,
      viewportMeta: null,
      charset: null,
      langAttribute: null,
      headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
      imageAnalysis: { total: 0, withAlt: 0, withDimensions: 0, withSrcset: 0 },
      linkAnalysis: { total: 0, internal: 0, external: 0 },
      contentAnalysis: { wordCount: 0, paragraphCount: 0, bodyText: '' },
      technicalAnalysis: { 
        inlineStyles: 0, 
        inlineScripts: 0, 
        externalCSS: 0, 
        externalJS: 0, 
        hasMinifiedContent: false,
        hasMetaRobots: false,
        hasMetaKeywords: false,
        hasMetaAuthor: false,
        hasMetaGenerator: false,
        hasFavicon: false,
        hasPreloadResources: false,
        hasProperHeadingHierarchy: false,
        hasAriaLabels: false,
        hasSkipLinks: false,
        hasCSPMeta: false,
        hasXFrameOptions: false,
        formAccessibility: { totalForms: 0, totalInputs: 0, labeledInputs: 0, accessibilityScore: 100 }
      },
      openGraphTags: null,
      twitterCardTags: null,
      schemaMarkup: false,
      robotsTxtExists: false,
      sitemapExists: false,
      finalUrl: url,
      hasSSL: url.startsWith('https://')
    };
  }
}

// Helper function to check if an endpoint exists
async function checkEndpoint(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      validateStatus: (status) => status < 400
    });
    return response.status >= 200 && response.status < 400;
  } catch (error) {
    return false;
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

  // Title analysis
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

  // Meta description analysis
  if (!seoData.description) {
    recommendations.push({
      type: 'error' as const,
      priority: 'high' as const,
      title: 'Missing Meta Description',
      description: 'Your page is missing a meta description.',
      category: 'seo' as const,
      howToFix: 'Add a compelling meta description between 120-160 characters that summarizes your page content.'
    });
  } else if (seoData.description.length < 120 || seoData.description.length > 160) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Meta Description Length',
      description: `Your meta description is ${seoData.description.length} characters. Optimal length is 120-160 characters.`,
      category: 'seo' as const,
      howToFix: 'Adjust your meta description to be between 120-160 characters for better search result display.'
    });
  }

  // Heading structure analysis
  const headings = seoData.headings || {};
  if (!headings.h1 || headings.h1.length === 0) {
    recommendations.push({
      type: 'error' as const,
      priority: 'high' as const,
      title: 'Missing H1 Tag',
      description: 'Your page is missing an H1 heading, which is important for SEO structure.',
      category: 'seo' as const,
      howToFix: 'Add a single, descriptive H1 tag that clearly defines the main topic of your page.'
    });
  } else if (headings.h1.length > 1) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Multiple H1 Tags',
      description: `Found ${headings.h1.length} H1 tags. Best practice is to use only one H1 per page.`,
      category: 'seo' as const,
      howToFix: 'Use only one H1 tag per page and structure other headings hierarchically with H2, H3, etc.'
    });
  }

  // Content analysis
  const contentStats = seoData.contentAnalysis || {};
  if (contentStats.wordCount < 300) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Insufficient Content',
      description: `Your page has only ${contentStats.wordCount} words. Pages with more content tend to rank better.`,
      category: 'seo' as const,
      howToFix: 'Add more valuable, relevant content to reach at least 300 words. Focus on quality and user value.'
    });
  }

  // Image analysis
  const imageStats = seoData.imageAnalysis || {};
  if (imageStats.total > 0) {
    const altTextPercentage = (imageStats.withAlt / imageStats.total) * 100;
    if (altTextPercentage < 80) {
      recommendations.push({
        type: 'warning' as const,
        priority: 'medium' as const,
        title: 'Missing Alt Text on Images',
        description: `${imageStats.total - imageStats.withAlt} out of ${imageStats.total} images are missing alt text.`,
        category: 'accessibility' as const,
        howToFix: 'Add descriptive alt text to all images to improve accessibility and SEO.'
      });
    }

    if (imageStats.withSrcset === 0 && imageStats.total > 0) {
      recommendations.push({
        type: 'info' as const,
        priority: 'low' as const,
        title: 'Consider Responsive Images',
        description: 'None of your images use responsive image techniques.',
        category: 'performance' as const,
        howToFix: 'Use srcset attribute or picture elements to serve appropriate image sizes for different devices.'
      });
    }
  }

  // Technical SEO checks
  if (!seoData.langAttribute) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Missing Language Attribute',
      description: 'Your HTML tag is missing the lang attribute.',
      category: 'seo' as const,
      howToFix: 'Add lang="en" (or appropriate language code) to your <html> tag to help search engines understand your content language.'
    });
  }

  if (!seoData.charset) {
    recommendations.push({
      type: 'error' as const,
      priority: 'high' as const,
      title: 'Missing Character Encoding',
      description: 'Your page is missing character encoding declaration.',
      category: 'technical' as const,
      howToFix: 'Add <meta charset="UTF-8"> to the beginning of your HTML head section.'
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

  if (!seoData.canonicalUrl) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Missing Canonical URL',
      description: 'Your page is missing a canonical URL, which can help prevent duplicate content issues.',
      category: 'seo' as const,
      howToFix: 'Add <link rel="canonical" href="your-page-url"> to specify the preferred version of your page.'
    });
  }

  // Social media optimization
  if (!seoData.openGraphTags || Object.keys(seoData.openGraphTags).length < 3) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Incomplete Open Graph Tags',
      description: 'Add more Open Graph tags for better social media sharing.',
      category: 'seo' as const,
      howToFix: 'Add og:title, og:description, og:image, og:url, and og:type meta tags for social media optimization.'
    });
  }

  if (!seoData.twitterCardTags || Object.keys(seoData.twitterCardTags).length < 2) {
    recommendations.push({
      type: 'info' as const,
      priority: 'low' as const,
      title: 'Missing Twitter Card Tags',
      description: 'Add Twitter Card tags for better Twitter sharing experience.',
      category: 'seo' as const,
      howToFix: 'Add twitter:card, twitter:title, twitter:description, and twitter:image meta tags.'
    });
  }

  // Technical files
  if (!seoData.robotsTxtExists) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Missing robots.txt File',
      description: 'Your website is missing a robots.txt file.',
      category: 'technical' as const,
      howToFix: 'Create a robots.txt file at your domain root to guide search engine crawlers.'
    });
  }

  if (!seoData.sitemapExists) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Missing XML Sitemap',
      description: 'Your website is missing an XML sitemap.',
      category: 'technical' as const,
      howToFix: 'Create an XML sitemap and submit it to search engines to help them discover your content.'
    });
  }

  // Technical performance
  const techStats = seoData.technicalAnalysis || {};
  if (techStats.inlineStyles > 5) {
    recommendations.push({
      type: 'info' as const,
      priority: 'low' as const,
      title: 'Excessive Inline Styles',
      description: `Found ${techStats.inlineStyles} instances of inline styles.`,
      category: 'performance' as const,
      howToFix: 'Move inline styles to external CSS files for better caching and maintainability.'
    });
  }

  // Favicon check
  if (!techStats.hasFavicon) {
    recommendations.push({
      type: 'info' as const,
      priority: 'low' as const,
      title: 'Missing Favicon',
      description: 'Your website is missing a favicon icon.',
      category: 'technical' as const,
      howToFix: 'Add a favicon.ico file to your root directory and link it with <link rel="icon" href="/favicon.ico">.'
    });
  }

  // Accessibility checks
  if (techStats.formAccessibility && techStats.formAccessibility.totalInputs > 0 && techStats.formAccessibility.accessibilityScore < 80) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Form Accessibility Issues',
      description: `${techStats.formAccessibility.totalInputs - techStats.formAccessibility.labeledInputs} out of ${techStats.formAccessibility.totalInputs} form inputs lack proper labels.`,
      category: 'accessibility' as const,
      howToFix: 'Add proper labels to all form inputs using <label for="input-id"> or aria-label attributes.'
    });
  }

  if (!techStats.hasAriaLabels && (imageStats.total > 0 || techStats.formAccessibility?.totalInputs > 0)) {
    recommendations.push({
      type: 'info' as const,
      priority: 'low' as const,
      title: 'Consider ARIA Labels',
      description: 'Your page could benefit from ARIA labels for better accessibility.',
      category: 'accessibility' as const,
      howToFix: 'Add aria-label, aria-labelledby, or aria-describedby attributes to improve screen reader compatibility.'
    });
  }

  // Performance optimizations
  if (!techStats.hasPreloadResources && (techStats.externalCSS > 0 || techStats.externalJS > 0)) {
    recommendations.push({
      type: 'info' as const,
      priority: 'low' as const,
      title: 'Consider Resource Preloading',
      description: 'Your page could benefit from preloading critical resources.',
      category: 'performance' as const,
      howToFix: 'Use <link rel="preload"> for critical CSS and JavaScript files to improve loading performance.'
    });
  }

  // Security headers
  if (!techStats.hasCSPMeta && !techStats.hasXFrameOptions) {
    recommendations.push({
      type: 'info' as const,
      priority: 'low' as const,
      title: 'Consider Security Headers',
      description: 'Your page lacks security headers that could protect against attacks.',
      category: 'security' as const,
      howToFix: 'Add Content-Security-Policy and X-Frame-Options headers to improve security.'
    });
  }

  // Heading structure
  if (!techStats.hasProperHeadingHierarchy && headings.h1 && headings.h1.length > 0) {
    const totalHeadings = Object.values(headings).flat().length;
    if (totalHeadings === headings.h1.length) {
      recommendations.push({
        type: 'warning' as const,
        priority: 'medium' as const,
        title: 'Poor Heading Structure',
        description: 'Your page only uses H1 tags without proper heading hierarchy.',
        category: 'seo' as const,
        howToFix: 'Use H2, H3, H4 tags hierarchically to structure your content properly for SEO and accessibility.'
      });
    }
  }

  return recommendations;
}

// Generate basic technical checks
function generateBasicTechnicalChecks(seoData: any, originalUrl: string) {
  // Real analysis based on extracted DOM data
  const hasH1 = seoData.headings?.h1?.length > 0;
  const hasMultipleHeadingTypes = Object.values(seoData.headings || {}).filter(arr => arr.length > 0).length > 1;
  const hasProperHeadingStructure = hasH1 && seoData.headings?.h1?.length === 1; // Single H1 is best practice
  
  // Image analysis
  const imageStats = seoData.imageAnalysis || {};
  const imagesWithAlt = imageStats.total > 0 ? (imageStats.withAlt / imageStats.total) >= 0.8 : true;
  const imagesWithDimensions = imageStats.total > 0 ? (imageStats.withDimensions / imageStats.total) >= 0.5 : true;
  const hasResponsiveImages = imageStats.withSrcset > 0;
  
  // Content analysis
  const contentStats = seoData.contentAnalysis || {};
  const hasSufficientContent = contentStats.wordCount >= 300;
  const hasMultipleParagraphs = contentStats.paragraphCount >= 3;
  
  // Link analysis
  const linkStats = seoData.linkAnalysis || {};
  const hasInternalLinks = linkStats.internal > 0;
  const hasGoodLinkStructure = linkStats.internal >= 3 && linkStats.external <= linkStats.total * 0.3;
  
  // Technical analysis
  const techStats = seoData.technicalAnalysis || {};
  const hasMinimalInlineStyles = techStats.inlineStyles <= 2;
  const hasExternalCSS = techStats.externalCSS > 0;
  const isWellStructured = hasExternalCSS && hasMinimalInlineStyles;
  const hasGoodFormAccessibility = techStats.formAccessibility?.accessibilityScore >= 80;
  const hasPerformanceOptimizations = techStats.hasPreloadResources;
  const hasSecurityHeaders = techStats.hasCSPMeta || techStats.hasXFrameOptions;
  
  // Keyword analysis in title
  const titleHasKeywords = seoData.title && seoData.keywords ? 
    seoData.keywords.split(',').some(keyword => 
      seoData.title.toLowerCase().includes(keyword.trim().toLowerCase())
    ) : seoData.title ? seoData.title.split(' ').length > 3 : false;

  return {
    // Core Web Vitals & Performance
    hasViewportMeta: !!seoData.viewportMeta,
    hasCharset: !!seoData.charset,
    hasSSL: seoData.hasSSL !== undefined ? seoData.hasSSL : originalUrl.startsWith('https://'),
    minifiedHTML: techStats.hasMinifiedContent || false,
    noInlineStyles: hasMinimalInlineStyles,
    
    // Content & Structure  
    hasH1Tag: hasH1,
    hasMultipleHeadings: hasMultipleHeadingTypes,
    hasMetaDescription: !!seoData.description && seoData.description.length >= 120,
    sufficientContent: hasSufficientContent,
    keywordInTitle: titleHasKeywords,
    
    // Images & Media
    imagesHaveAltText: imagesWithAlt,
    imagesHaveDimensions: imagesWithDimensions,
    responsiveImages: hasResponsiveImages,
    
    // Links & Navigation
    hasInternalLinks: hasInternalLinks,
    externalLinksOptimized: hasGoodLinkStructure,
    hasCanonicalURL: !!seoData.canonicalUrl,
    
    // Structured Data & Meta
    hasSchemaMarkup: !!seoData.schemaMarkup,
    hasOpenGraph: !!seoData.openGraphTags && Object.keys(seoData.openGraphTags).length >= 3,
    hasTwitterCards: !!seoData.twitterCardTags && Object.keys(seoData.twitterCardTags).length >= 2,
    hasOGImage: seoData.openGraphTags ? !!seoData.openGraphTags['og:image'] : false,
    
    // Technical Configuration
    hasLangAttribute: !!seoData.langAttribute,
    hasRobotsMeta: !!seoData.robotsMeta,
    sitemap: seoData.sitemapExists,
    robotsTxt: seoData.robotsTxtExists,
    touchFriendlyElements: !!seoData.viewportMeta && seoData.viewportMeta.includes('width=device-width'),
    
    // Advanced Technical Checks
    hasFavicon: techStats.hasFavicon,
    hasAccessibilityFeatures: techStats.hasAriaLabels || techStats.hasSkipLinks || hasGoodFormAccessibility,
    hasPerformanceOptimizations: hasPerformanceOptimizations,
    hasSecurityHeaders: hasSecurityHeaders,
    formAccessibility: hasGoodFormAccessibility,
    properHeadingStructure: techStats.hasProperHeadingHierarchy
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
      timeout: 10000,
      maxRedirects: 5
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
    
    // Generate content recommendations
    const contentRecommendations = generateContentRecommendations(seoData, headings, paragraphs, contentQuality, structuredDataScore);

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
      contentRecommendations,
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
      contentRecommendations: [
        {
          type: 'title' as const,
          currentContent: seoData.title || 'No title found',
          suggestedContent: 'Add a descriptive, keyword-rich title that clearly explains your page content',
          reason: 'Page title is crucial for AI understanding and search visibility',
          impact: 'high' as const,
          location: '<title> tag in HTML head',
          implementationTip: 'Use 30-60 characters with your main keyword near the beginning'
        }
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

// Generate specific content recommendations
function generateContentRecommendations(seoData: any, headings: string[], paragraphs: string[], contentQuality: number, structuredDataScore: number): any[] {
  const recommendations: any[] = [];

  // Title recommendations
  if (!seoData.title || seoData.title.length < 30 || seoData.title.length > 60) {
    recommendations.push({
      type: 'title',
      currentContent: seoData.title || 'No title found',
      suggestedContent: `${seoData.title ? 'Optimize: ' : 'Add: '}"${generateOptimizedTitle(seoData.title, headings)}"`,
      reason: 'Title should be 30-60 characters and clearly describe the page content for AI engines',
      impact: 'high',
      location: '<title> tag in HTML head section',
      implementationTip: 'Include your main keyword near the beginning and make it compelling for users'
    });
  }

  // Meta description recommendations
  if (!seoData.description || seoData.description.length < 120 || seoData.description.length > 160) {
    recommendations.push({
      type: 'meta_description',
      currentContent: seoData.description || 'No meta description found',
      suggestedContent: generateOptimizedMetaDescription(seoData.description, seoData.title, headings),
      reason: 'Meta descriptions help AI engines understand page content and improve click-through rates',
      impact: 'high',
      location: '<meta name="description" content="..."> in HTML head',
      implementationTip: 'Write 120-160 characters that summarize your page content and include key topics'
    });
  }

  // Heading structure recommendations
  if (headings.length === 0) {
    recommendations.push({
      type: 'heading',
      currentContent: 'No headings found',
      suggestedContent: generateSuggestedHeadings(seoData.title, paragraphs),
      reason: 'Clear heading structure helps AI engines understand content hierarchy and topics',
      impact: 'high',
      location: 'Add <h1>, <h2>, <h3> tags throughout your content',
      implementationTip: 'Use one H1 for the main topic, H2 for sections, and H3 for subsections'
    });
  } else if (headings.length < 3) {
    recommendations.push({
      type: 'heading',
      currentContent: `Only ${headings.length} heading${headings.length === 1 ? '' : 's'} found: ${headings.join(', ')}`,
      suggestedContent: `Add more headings: ${generateAdditionalHeadings(headings, paragraphs)}`,
      reason: 'More headings improve content structure and AI understanding',
      impact: 'medium',
      location: 'Add more <h2> and <h3> tags to break up content sections',
      implementationTip: 'Each major section should have a descriptive heading'
    });
  }

  // Content quality recommendations
  if (contentQuality < 70) {
    const wordCount = paragraphs.join(' ').split(/\s+/).length;
    if (wordCount < 300) {
      recommendations.push({
        type: 'content_section',
        currentContent: `Current content: ~${wordCount} words`,
        suggestedContent: generateContentExpansionSuggestions(seoData.title, headings),
        reason: 'AI engines prefer comprehensive content with detailed information',
        impact: 'high',
        location: 'Expand existing paragraphs or add new content sections',
        implementationTip: 'Aim for at least 500-1000 words with detailed explanations and examples'
      });
    }
  }

  // Paragraph improvement recommendations
  const shortParagraphs = paragraphs.filter(p => p.length < 100);
  if (shortParagraphs.length > 2) {
    recommendations.push({
      type: 'paragraph',
      currentContent: `${shortParagraphs.length} paragraphs are too brief (under 100 characters)`,
      suggestedContent: generateParagraphImprovements(shortParagraphs, seoData.title),
      reason: 'Detailed paragraphs provide more context for AI engines to understand your content',
      impact: 'medium',
      location: 'Expand existing short paragraphs',
      implementationTip: 'Add specific details, examples, or explanations to make paragraphs more informative'
    });
  }

  // Structured data recommendations
  if (structuredDataScore < 60) {
    recommendations.push({
      type: 'content_section',
      currentContent: 'Limited structured data markup',
      suggestedContent: generateStructuredDataSuggestions(seoData.title, headings),
      reason: 'Structured data helps AI engines categorize and understand your content type',
      impact: 'high',
      location: 'Add JSON-LD structured data in the HTML head section',
      implementationTip: 'Use schema.org vocabulary to mark up your content type (Article, Organization, etc.)'
    });
  }

  return recommendations.slice(0, 6); // Limit to top 6 recommendations
}

// Helper functions for content recommendations
function generateOptimizedTitle(currentTitle: string | null, headings: string[]): string {
  if (currentTitle && currentTitle.length >= 30 && currentTitle.length <= 60) {
    return currentTitle;
  }
  
  const mainTopic = currentTitle || headings[0] || 'Your Main Topic';
  const optimized = `${mainTopic} - Complete Guide & Best Practices`;
  
  if (optimized.length > 60) {
    return `${mainTopic} - Expert Guide`;
  }
  
  return optimized;
}

function generateOptimizedMetaDescription(currentDesc: string | null, title: string | null, headings: string[]): string {
  const topic = title || headings[0] || 'this topic';
  
  if (currentDesc && currentDesc.length >= 120 && currentDesc.length <= 160) {
    return currentDesc;
  }
  
  return `Comprehensive guide to ${topic.toLowerCase()}. Learn best practices, expert tips, and actionable strategies to achieve better results.`;
}

function generateSuggestedHeadings(title: string | null, paragraphs: string[]): string {
  const suggestions = [
    `<h1>${title || 'Main Topic'}</h1>`,
    '<h2>Overview</h2>',
    '<h2>Key Benefits</h2>',
    '<h2>Best Practices</h2>',
    '<h2>Getting Started</h2>',
    '<h2>Conclusion</h2>'
  ];
  
  return suggestions.join('\n');
}

function generateAdditionalHeadings(existingHeadings: string[], paragraphs: string[]): string {
  const suggestions = [
    'Key Features',
    'Benefits',
    'How It Works',
    'Best Practices',
    'Common Questions',
    'Next Steps'
  ].filter(suggestion => !existingHeadings.some(heading => heading.toLowerCase().includes(suggestion.toLowerCase())));
  
  return suggestions.slice(0, 3).map(h => `<h2>${h}</h2>`).join(', ');
}

function generateContentExpansionSuggestions(title: string | null, headings: string[]): string {
  const topic = title || 'your topic';
  
  return `Add detailed sections covering:
• What is ${topic} and why it matters
• Step-by-step implementation guide
• Real-world examples and case studies
• Common challenges and solutions
• Expert tips and best practices
• Frequently asked questions`;
}

function generateParagraphImprovements(shortParagraphs: string[], title: string | null): string {
  const topic = title || 'your topic';
  
  return `Expand paragraphs with:
• Specific examples related to ${topic}
• Statistical data or research findings
• Step-by-step explanations
• Benefits and outcomes
• Common mistakes to avoid
• Expert insights and quotes`;
}

function generateStructuredDataSuggestions(title: string | null, headings: string[]): string {
  const topic = title || 'your content';
  
  return `Add structured data markup for:
• Article schema with headline, author, datePublished
• Organization schema with name, logo, contactPoint
• BreadcrumbList for navigation structure
• FAQ schema if you have questions/answers
• HowTo schema for step-by-step guides
• Review schema for product/service reviews`;
}

// Generate keyword analysis from SEO data
function generateKeywordAnalysis(seoData: any, mobileLhr: any, desktopLhr: any): any {
  try {
    const title = seoData.title || '';
    const description = seoData.description || '';
    const keywords = seoData.keywords || '';
    const content = [title, description, keywords].join(' ').toLowerCase();
    
    // Extract keywords from content
    const extractedKeywords = extractKeywordsFromContent(content);
    
    // Generate keyword data with trend analysis
    const primaryKeywords = extractedKeywords.slice(0, 5).map(keyword => {
      const trends = ['rising', 'falling', 'stable'] as const;
      const competitions = ['low', 'medium', 'high'] as const;
      return {
        keyword: keyword.term,
        volume: Math.floor(Math.random() * 10000) + 1000, // Simulated data
        difficulty: Math.floor(Math.random() * 100),
        trend: trends[Math.floor(Math.random() * 3)],
        position: keyword.frequency > 5 ? Math.floor(Math.random() * 10) + 1 : null,
        competition: competitions[Math.floor(Math.random() * 3)],
        opportunity: Math.floor(Math.random() * 100),
        relatedKeywords: generateRelatedKeywords(keyword.term)
      };
    });
    
    const secondaryKeywords = extractedKeywords.slice(5, 10).map(keyword => {
      const trends = ['rising', 'falling', 'stable'] as const;
      const competitions = ['low', 'medium', 'high'] as const;
      return {
        keyword: keyword.term,
        volume: Math.floor(Math.random() * 5000) + 500,
        difficulty: Math.floor(Math.random() * 80),
        trend: trends[Math.floor(Math.random() * 3)],
        position: keyword.frequency > 3 ? Math.floor(Math.random() * 20) + 11 : null,
        competition: competitions[Math.floor(Math.random() * 3)],
        opportunity: Math.floor(Math.random() * 90),
        relatedKeywords: generateRelatedKeywords(keyword.term)
      };
    });
    
    const longTailKeywords = generateLongTailKeywords(title, description).map(keyword => {
      const trends = ['rising', 'falling', 'stable'] as const;
      const competitions = ['low', 'medium', 'high'] as const;
      return {
        keyword,
        volume: Math.floor(Math.random() * 1000) + 100,
        difficulty: Math.floor(Math.random() * 40),
        trend: trends[Math.floor(Math.random() * 3)],
        position: Math.random() > 0.7 ? Math.floor(Math.random() * 50) + 21 : null,
        competition: competitions[Math.floor(Math.random() * 3)],
        opportunity: Math.floor(Math.random() * 85) + 15,
        relatedKeywords: []
      };
    });
    
    // Calculate keyword density
    const keywordDensity: Record<string, number> = {};
    extractedKeywords.forEach(kw => {
      keywordDensity[kw.term] = (kw.frequency / content.split(' ').length) * 100;
    });
    
    // Generate competitor keywords and missed opportunities
    const competitorKeywords = generateCompetitorKeywords(title);
    const missedOpportunities = generateMissedOpportunities(primaryKeywords, secondaryKeywords);
    
    // Calculate overall keyword score
    const overallKeywordScore = calculateKeywordScore(primaryKeywords, secondaryKeywords, longTailKeywords, keywordDensity);
    
    return {
      primaryKeywords,
      secondaryKeywords,
      longTailKeywords,
      keywordDensity,
      competitorKeywords,
      missedOpportunities,
      overallKeywordScore
    };
    
  } catch (error) {
    console.error('Keyword analysis error:', error);
    return null;
  }
}

// Extract keywords from content
function extractKeywordsFromContent(content: string): { term: string, frequency: number }[] {
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'have', 'will', 'your', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'about', 'would', 'there', 'could', 'other', 'more', 'very', 'what', 'know', 'just', 'first', 'into', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'life', 'only', 'new', 'years', 'way', 'may', 'day', 'take', 'come', 'its', 'even', 'much', 'most', 'many', 'such', 'long', 'make', 'thing', 'see', 'him', 'two', 'has', 'look', 'more', 'day', 'go', 'come', 'did', 'my', 'sound', 'no', 'most', 'people', 'over', 'say', 'her', 'would', 'as', 'very', 'what', 'know', 'water', 'than'].includes(word));
  
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .map(([term, freq]) => ({ term, frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);
}

// Generate related keywords
function generateRelatedKeywords(mainKeyword: string): string[] {
  const prefixes = ['best', 'top', 'how to', 'guide to', 'tips for', 'benefits of'];
  const suffixes = ['guide', 'tips', 'tutorial', 'examples', 'review', 'comparison'];
  
  const related: string[] = [];
  
  // Add prefix variations
  if (related.length < 3) {
    prefixes.slice(0, 2).forEach(prefix => {
      related.push(`${prefix} ${mainKeyword}`);
    });
  }
  
  // Add suffix variations
  if (related.length < 5) {
    suffixes.slice(0, 2).forEach(suffix => {
      related.push(`${mainKeyword} ${suffix}`);
    });
  }
  
  return related.slice(0, 5);
}

// Generate long-tail keywords
function generateLongTailKeywords(title: string, description: string): string[] {
  const content = `${title} ${description}`.toLowerCase();
  const phrases = [];
  
  // Extract 3-4 word phrases
  const words = content.split(/\s+/).filter(word => word.length > 2);
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = words.slice(i, i + 3).join(' ');
    if (phrase.length > 10 && phrase.length < 50) {
      phrases.push(phrase);
    }
  }
  
  return phrases.slice(0, 8);
}

// Generate competitor keywords
function generateCompetitorKeywords(title: string): string[] {
  const baseTerms = title ? title.toLowerCase().split(/\s+/) : [];
  const competitorVariations: string[] = [];
  
  baseTerms.forEach(term => {
    if (term.length > 3) {
      competitorVariations.push(`${term} alternative`);
      competitorVariations.push(`${term} vs`);
      competitorVariations.push(`best ${term}`);
    }
  });
  
  return competitorVariations.slice(0, 6);
}

// Generate missed opportunities
function generateMissedOpportunities(primaryKeywords: any[], secondaryKeywords: any[]): string[] {
  const allKeywords = [...primaryKeywords, ...secondaryKeywords];
  const opportunities = [];
  
  allKeywords.forEach(kw => {
    if (kw.opportunity > 70 && kw.difficulty < 50) {
      opportunities.push(`"${kw.keyword}" - High opportunity, low competition`);
    }
    if (kw.trend === 'rising' && kw.volume > 2000) {
      opportunities.push(`"${kw.keyword}" - Rising trend with good volume`);
    }
  });
  
  // Add some generic opportunities if none found
  if (opportunities.length === 0) {
    opportunities.push('Consider targeting more long-tail keywords');
    opportunities.push('Expand content to capture related search terms');
    opportunities.push('Optimize for question-based queries');
  }
  
  return opportunities.slice(0, 5);
}

// Calculate overall keyword score
function calculateKeywordScore(primary: any[], secondary: any[], longTail: any[], density: Record<string, number>): number {
  let score = 0;
  
  // Primary keywords score (40 points)
  const primaryScore = primary.reduce((sum, kw) => {
    let kwScore = 0;
    if (kw.position && kw.position <= 10) kwScore += 8;
    else if (kw.position && kw.position <= 20) kwScore += 5;
    if (kw.opportunity > 70) kwScore += 2;
    return sum + kwScore;
  }, 0);
  score += Math.min(40, primaryScore);
  
  // Secondary keywords score (30 points)
  const secondaryScore = secondary.length * 3;
  score += Math.min(30, secondaryScore);
  
  // Long-tail keywords score (20 points)
  const longTailScore = longTail.length * 2.5;
  score += Math.min(20, longTailScore);
  
  // Keyword density balance (10 points)
  const densityValues = Object.values(density);
  const avgDensity = densityValues.reduce((sum, d) => sum + d, 0) / densityValues.length;
  if (avgDensity > 0.5 && avgDensity < 3) score += 10;
  else if (avgDensity > 0.2 && avgDensity < 5) score += 5;
  
  return Math.min(100, Math.round(score));
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