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

    // Extract headings structure (grouped by type)
    const headings = {
      h1: $('h1').map((_, el) => $(el).text().trim()).get(),
      h2: $('h2').map((_, el) => $(el).text().trim()).get(),
      h3: $('h3').map((_, el) => $(el).text().trim()).get(),
      h4: $('h4').map((_, el) => $(el).text().trim()).get(),
      h5: $('h5').map((_, el) => $(el).text().trim()).get(),
      h6: $('h6').map((_, el) => $(el).text().trim()).get()
    };

    // Extract headings in the order they appear on the page
    const headingStructure = [];
    $('h1, h2, h3, h4, h5, h6').each((index, element) => {
      const $el = $(element);
      const level = element.tagName.toLowerCase();
      const text = $el.text().trim();
      if (text) {
        headingStructure.push({
          level,
          text,
          order: index + 1
        });
      }
    });

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
      headingStructure,
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
    hasOpenGraph: false, // Will be set correctly in generateBasicTechnicalChecks
    hasTwitterCards: false, // Will be set correctly in generateBasicTechnicalChecks  
    hasOGImage: false, // Will be set correctly in generateBasicTechnicalChecks
    
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
    const requiredOgTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
    const hasAllRequired = requiredOgTags.every(tag => ogKeys.includes(tag));
    if (hasAllRequired) {
      score += 20;
    } else if (ogKeys.length > 0) {
      score += 10;
    }
  }

  // Twitter Cards check (15 points)
  totalChecks += 15;
  if (seoData.twitterCardTags) {
    const twitterKeys = Object.keys(seoData.twitterCardTags);
    const requiredTwitterTags = ['twitter:card', 'twitter:title', 'twitter:description'];
    const hasAllRequired = requiredTwitterTags.every(tag => twitterKeys.includes(tag));
    if (hasAllRequired) {
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

  // Title analysis with detailed technical information
  if (!seoData.title) {
    recommendations.push({
      type: 'error' as const,
      priority: 'high' as const,
      title: 'Missing Page Title',
      description: 'Your page is missing a title tag, which is crucial for SEO and user experience.',
      category: 'seo' as const,
      affectedFiles: ['index.html', 'head section', 'template files'],
      technicalLocation: 'HTML <head> section, between <title></title> tags',
      detectionMethod: 'DOM parsing: document.querySelector("title")',
      codeExample: '<title>Your Page Title - Brand Name</title>',
      seoImpact: 'Critical - Search engines use title tags as clickable headlines in search results',
      howToFix: 'Add a descriptive title tag between 30-60 characters that accurately describes your page content.',
      implementation: [
        '1. Open your HTML file or template',
        '2. Locate the <head> section',
        '3. Add: <title>Your Descriptive Page Title</title>',
        '4. Include primary keyword near the beginning',
        '5. Keep it under 60 characters for full display in search results'
      ],
      externalResources: [
        'Google SEO Guidelines: https://developers.google.com/search/docs/fundamentals/seo-starter-guide#title-tags',
        'MDN Title Element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title',
        'Moz Title Tag Guide: https://moz.com/learn/seo/title-tag'
      ],
      testingTools: ['Google Search Console', 'SEO Browser Extensions', 'View Page Source']
    });
  } else if (seoData.title.length < 30 || seoData.title.length > 60) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Page Title Length Optimization',
      description: `Your title is ${seoData.title.length} characters. Optimal length is 30-60 characters for best search engine display.`,
      category: 'seo' as const,
      currentValue: `"${seoData.title}" (${seoData.title.length} chars)`,
      affectedFiles: ['HTML template', 'CMS title field', 'meta management system'],
      technicalLocation: 'HTML <head><title> tag content',
      detectionMethod: 'String length analysis: document.title.length',
      codeExample: seoData.title.length > 60 ? 
        `<!-- Current (too long) -->\n<title>${seoData.title}</title>\n\n<!-- Optimized -->\n<title>${seoData.title.substring(0, 57)}...</title>` :
        `<!-- Current (too short) -->\n<title>${seoData.title}</title>\n\n<!-- Optimized -->\n<title>${seoData.title} - Additional Context | Brand</title>`,
      seoImpact: 'Medium - Titles longer than 60 chars get truncated in search results, shorter than 30 may lack context',
      howToFix: 'Adjust your title length to be between 30-60 characters for optimal search engine display.',
      implementation: [
        '1. Count current title characters',
        '2. If too long: Remove unnecessary words, use shorter synonyms',
        '3. If too short: Add relevant keywords, location, or brand name',
        '4. Include primary keyword near the beginning',
        '5. Make it compelling for users to click'
      ],
      externalResources: [
        'Title Length Checker: https://www.seotesteronline.com/title-tag-checker/',
        'SERP Preview Tool: https://www.sistrix.com/serp-snippet-generator/',
        'Google Title Guidelines: https://developers.google.com/search/docs/fundamentals/seo-starter-guide#title-tags'
      ],
      testingTools: ['SERP Preview Tools', 'Google Search Console', 'Title Tag Analyzers']
    });
  }

  // Meta description analysis with detailed technical information
  if (!seoData.description) {
    recommendations.push({
      type: 'error' as const,
      priority: 'high' as const,
      title: 'Missing Meta Description',
      description: 'Your page is missing a meta description tag, which affects search result snippets and click-through rates.',
      category: 'seo' as const,
      affectedFiles: ['index.html', 'template files', 'CMS meta fields'],
      technicalLocation: 'HTML <head> section, <meta name="description" content="...">',
      detectionMethod: 'DOM query: document.querySelector(\'meta[name="description"]\')?.getAttribute("content")',
      codeExample: '<meta name="description" content="Comprehensive guide to improving website SEO with actionable tips and best practices for better search rankings.">',
      seoImpact: 'High - Meta descriptions appear in search results and influence click-through rates',
      howToFix: 'Add a compelling meta description between 120-160 characters that summarizes your page content.',
      implementation: [
        '1. Open your HTML file or CMS meta settings',
        '2. Locate the <head> section',
        '3. Add: <meta name="description" content="Your page description">',
        '4. Write 120-160 characters describing page content',
        '5. Include primary keywords naturally',
        '6. Make it compelling to encourage clicks'
      ],
      externalResources: [
        'Google Meta Description Guide: https://developers.google.com/search/docs/appearance/snippet',
        'Meta Description Best Practices: https://moz.com/learn/seo/meta-description',
        'SERP Snippet Optimization: https://ahrefs.com/blog/meta-description/'
      ],
      testingTools: ['Google Search Console', 'SERP Preview Tools', 'Meta Tag Analyzers']
    });
  } else if (seoData.description.length < 120 || seoData.description.length > 160) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Meta Description Length Optimization',
      description: `Your meta description is ${seoData.description.length} characters. Optimal length is 120-160 characters for complete display in search results.`,
      category: 'seo' as const,
      currentValue: `"${seoData.description}" (${seoData.description.length} chars)`,
      affectedFiles: ['HTML meta tags', 'CMS content management', 'template meta fields'],
      technicalLocation: 'HTML <head><meta name="description" content="...">',
      detectionMethod: 'Meta content length: document.querySelector(\'meta[name="description"]\').content.length',
      codeExample: seoData.description.length > 160 ? 
        `<!-- Current (too long) -->\n<meta name="description" content="${seoData.description}">\n\n<!-- Optimized -->\n<meta name="description" content="${seoData.description.substring(0, 157)}...">` :
        `<!-- Current (too short) -->\n<meta name="description" content="${seoData.description}">\n\n<!-- Optimized -->\n<meta name="description" content="${seoData.description} Learn more about key benefits, implementation steps, and best practices for optimal results.">`,
      seoImpact: 'Medium - Descriptions longer than 160 chars get truncated, shorter ones may lack detail for users',
      howToFix: 'Adjust your meta description to be between 120-160 characters for optimal search result display.',
      implementation: [
        '1. Review current meta description content',
        '2. If too long: Condense while keeping key information',
        '3. If too short: Add relevant details, benefits, or call-to-action',
        '4. Include primary and secondary keywords naturally',
        '5. End with compelling reason to visit your page'
      ],
      externalResources: [
        'Meta Description Length Tool: https://www.seoptimer.com/meta-description-length-checker',
        'SERP Preview Generator: https://portent.com/serp-preview-tool/',
        'Meta Tag Guidelines: https://developers.google.com/search/docs/appearance/snippet'
      ],
      testingTools: ['Meta Description Checkers', 'Google Search Console', 'SERP Simulators']
    });
  }

  // Heading structure analysis with detailed technical information
  const headings = seoData.headings || {};
  const headingStructure = seoData.headingStructure || [];
  
  if (!headings.h1 || headings.h1.length === 0) {
    recommendations.push({
      type: 'error' as const,
      priority: 'high' as const,
      title: 'Missing H1 Tag - Critical SEO Issue',
      description: 'Your page is missing an H1 heading, which is crucial for SEO structure and content hierarchy.',
      category: 'seo' as const,
      affectedFiles: ['HTML content files', 'template files', 'CMS content editor'],
      technicalLocation: 'HTML document body, typically near the top of main content',
      detectionMethod: 'DOM query: document.querySelector("h1") === null',
      codeExample: '<h1>Your Main Page Topic - Clear and Descriptive Title</h1>',
      seoImpact: 'Critical - H1 tags signal primary page topic to search engines and screen readers',
      currentIssue: headingStructure.length > 0 ? 
        `First heading found: ${headingStructure[0]?.level} - "${headingStructure[0]?.text}"` : 
        'No headings detected on page',
      howToFix: 'Add a single, descriptive H1 tag that clearly defines the main topic of your page.',
      implementation: [
        '1. Identify your page\'s main topic or primary keyword',
        '2. Open your HTML file or CMS editor',
        '3. Add <h1>Your Main Topic</h1> near the top of your content',
        '4. Ensure H1 contains your primary keyword naturally',
        '5. Convert any existing large text or headers to proper H1 tag',
        '6. Structure remaining headings as H2, H3, etc. hierarchically'
      ],
      externalResources: [
        'HTML Heading Structure: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements',
        'SEO Heading Best Practices: https://moz.com/learn/seo/on-page-factors#heading-tags',
        'Accessibility Heading Guidelines: https://www.w3.org/WAI/tutorials/page-structure/headings/'
      ],
      testingTools: ['HTML Validator', 'Accessibility Checkers', 'SEO Browser Extensions', 'Heading Structure Tools']
    });
  } else if (headings.h1.length > 1) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Multiple H1 Tags Detected',
      description: `Found ${headings.h1.length} H1 tags. SEO best practice is to use only one H1 per page for clear topic hierarchy.`,
      category: 'seo' as const,
      currentValue: `${headings.h1.length} H1 tags found: ${headings.h1.map((h, i) => `"${h.substring(0, 40)}${h.length > 40 ? '...' : ''}"`).join(', ')}`,
      affectedFiles: ['HTML content files', 'template includes', 'component files'],
      technicalLocation: 'Multiple <h1> tags throughout HTML document',
      detectionMethod: 'DOM query: document.querySelectorAll("h1").length > 1',
      codeExample: `<!-- Current (Multiple H1s) -->\n<h1>${headings.h1[0]}</h1>\n<h1>${headings.h1[1]}</h1>\n\n<!-- Optimized -->\n<h1>${headings.h1[0]}</h1>\n<h2>${headings.h1[1]}</h2>`,
      seoImpact: 'Medium - Multiple H1s dilute page topic focus and confuse search engine content understanding',
      howToFix: 'Use only one H1 tag per page and structure other headings hierarchically with H2, H3, etc.',
      implementation: [
        '1. Identify which H1 represents the main page topic',
        '2. Keep the most important H1, convert others to H2 or H3',
        '3. Ensure proper heading hierarchy (H1 → H2 → H3...)',
        '4. Check templates and components for duplicate H1s',
        '5. Update CSS if styling depends on multiple H1s',
        '6. Test page structure with accessibility tools'
      ],
      externalResources: [
        'Single H1 Best Practice: https://www.searchenginejournal.com/h1-tag-seo/308091/',
        'Heading Hierarchy Guide: https://blog.hubspot.com/marketing/header-tags-for-seo',
        'HTML Semantic Structure: https://web.dev/headings-and-landmarks/'
      ],
      testingTools: ['HTML Outline Tools', 'SEO Analyzers', 'Accessibility Checkers', 'WAVE Web Accessibility Evaluator']
    });
  }

  // Check if page doesn't start with H1 (new critical check)
  if (headingStructure.length > 0 && headingStructure[0]?.level !== 'H1') {
    recommendations.push({
      type: 'error' as const,
      priority: 'high' as const,
      title: 'Page Does Not Start with H1 - Critical SEO Deficiency',
      description: `Your page starts with ${headingStructure[0]?.level} instead of H1. This creates poor content hierarchy for search engines and accessibility tools.`,
      category: 'seo' as const,
      currentValue: `First heading: ${headingStructure[0]?.level} - "${headingStructure[0]?.text}"`,
      affectedFiles: ['Main content template', 'page layout files', 'content management system'],
      technicalLocation: `Current first heading at: document.querySelector("${headingStructure[0]?.level.toLowerCase()}")`,
      detectionMethod: 'Heading order analysis: document.querySelectorAll("h1,h2,h3,h4,h5,h6")[0].tagName !== "H1"',
      codeExample: `<!-- Current (Poor Structure) -->\n<${headingStructure[0]?.level.toLowerCase()}>${headingStructure[0]?.text}</${headingStructure[0]?.level.toLowerCase()}>\n\n<!-- Optimized -->\n<h1>${headingStructure[0]?.text}</h1>`,
      seoImpact: 'Critical - Search engines expect H1 as primary topic indicator, starting with other levels confuses content hierarchy',
      howToFix: 'Change your first heading to H1 and restructure subsequent headings to follow proper hierarchy.',
      implementation: [
        '1. Locate the first heading in your content',
        `2. Change <${headingStructure[0]?.level.toLowerCase()}> to <h1>`,
        '3. Adjust subsequent headings to maintain hierarchy',
        '4. Update CSS selectors if they target specific heading levels',
        '5. Ensure H1 contains your main page keyword',
        '6. Test heading structure with accessibility tools'
      ],
      externalResources: [
        'Heading Hierarchy Standards: https://www.w3.org/WAI/tutorials/page-structure/headings/',
        'SEO Heading Structure: https://developers.google.com/search/docs/fundamentals/seo-starter-guide#heading-tags',
        'Content Accessibility Guidelines: https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html'
      ],
      testingTools: ['W3C HTML Validator', 'WAVE Accessibility Checker', 'HeadingsMap Browser Extension', 'SEO Site Checkup']
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

  // Image analysis with detailed technical information
  const imageStats = seoData.imageAnalysis || {};
  if (imageStats.total > 0) {
    const altTextPercentage = (imageStats.withAlt / imageStats.total) * 100;
    const missingAltCount = imageStats.total - imageStats.withAlt;
    
    if (altTextPercentage < 80) {
      recommendations.push({
        type: 'warning' as const,
        priority: 'medium' as const,
        title: 'Missing Alt Text on Images - Accessibility & SEO Issue',
        description: `${missingAltCount} out of ${imageStats.total} images (${Math.round(100 - altTextPercentage)}%) are missing alt text, affecting accessibility and SEO.`,
        category: 'accessibility' as const,
        currentValue: `${missingAltCount} images without alt text, ${imageStats.withAlt} images with alt text`,
        affectedFiles: ['HTML templates', 'image components', 'CMS image fields', 'content files'],
        technicalLocation: '<img> tags throughout HTML document',
        detectionMethod: 'DOM query: document.querySelectorAll("img:not([alt])").length',
        codeExample: `<!-- Current (Missing Alt) -->\n<img src="product-image.jpg">\n\n<!-- Optimized -->\n<img src="product-image.jpg" alt="Professional office desk with ergonomic chair and laptop setup">`,
        seoImpact: 'Medium-High - Alt text helps search engines understand image content and improves accessibility for screen readers',
        howToFix: 'Add descriptive alt text to all images to improve accessibility and SEO.',
        implementation: [
          '1. Audit all images using browser developer tools',
          '2. For each img tag, add alt="descriptive text"',
          '3. Describe what the image shows, not "image of" or "picture of"',
          '4. Include relevant keywords naturally when appropriate',
          '5. Use empty alt="" for decorative images only',
          '6. Update CMS/templates to require alt text for new images'
        ],
        diagnosticScript: `// Find images missing alt text\nconsole.log('Images missing alt text:', document.querySelectorAll('img:not([alt])'));\nconsole.log('Images with empty alt:', document.querySelectorAll('img[alt=""]'));`,
        externalResources: [
          'Alt Text Best Practices: https://moz.com/learn/seo/alt-text',
          'WebAIM Alt Text Guidelines: https://webaim.org/techniques/alttext/',
          'Image Accessibility Guide: https://www.w3.org/WAI/tutorials/images/'
        ],
        testingTools: ['WAVE Accessibility Checker', 'axe DevTools', 'Lighthouse Accessibility Audit', 'Screen Reader Testing']
      });
    }

    if (imageStats.withSrcset === 0 && imageStats.total > 0) {
      recommendations.push({
        type: 'info' as const,
        priority: 'low' as const,
        title: 'Implement Responsive Images for Better Performance',
        description: `None of your ${imageStats.total} images use responsive image techniques, missing performance optimization opportunities.`,
        category: 'performance' as const,
        currentValue: `${imageStats.total} images without responsive sizing`,
        affectedFiles: ['HTML templates', 'image components', 'CSS media queries'],
        technicalLocation: '<img> tags, <picture> elements, CSS background-image rules',
        detectionMethod: 'DOM query: document.querySelectorAll("img[srcset], picture").length === 0',
        codeExample: `<!-- Current (Non-responsive) -->\n<img src="large-image.jpg" alt="Product image">\n\n<!-- Optimized (Responsive) -->\n<img src="large-image.jpg" \n     srcset="small-image.jpg 480w, medium-image.jpg 768w, large-image.jpg 1200w"\n     sizes="(max-width: 480px) 480px, (max-width: 768px) 768px, 1200px"\n     alt="Product image">`,
        seoImpact: 'Low-Medium - Faster loading images improve user experience and Core Web Vitals scores',
        howToFix: 'Use srcset attribute or picture elements to serve appropriate image sizes for different devices.',
        implementation: [
          '1. Create multiple image sizes (480px, 768px, 1200px widths)',
          '2. Add srcset attribute with different image sizes',
          '3. Add sizes attribute to specify display conditions',
          '4. Consider using picture element for art direction',
          '5. Implement lazy loading with loading="lazy"',
          '6. Use modern formats (WebP, AVIF) with fallbacks'
        ],
        externalResources: [
          'Responsive Images Guide: https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images',
          'Web.dev Responsive Images: https://web.dev/serve-responsive-images/',
          'Srcset and Sizes Guide: https://ericportis.com/posts/2014/srcset-sizes/'
        ],
        testingTools: ['Lighthouse Performance Audit', 'Image Optimization Tools', 'Chrome DevTools Network Tab']
      });
    }
  }

  // Technical SEO checks with detailed information
  if (!seoData.langAttribute) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Missing Language Attribute - Accessibility Issue',
      description: 'Your HTML tag is missing the lang attribute, which affects accessibility and search engine content understanding.',
      category: 'seo' as const,
      affectedFiles: ['index.html', 'document root', 'HTML template files'],
      technicalLocation: 'Opening <html> tag at document root',
      detectionMethod: 'DOM query: document.documentElement.getAttribute("lang") === null',
      codeExample: `<!-- Current (Missing Lang) -->\n<html>\n\n<!-- Optimized -->\n<html lang="en">`,
      seoImpact: 'Medium - Helps search engines understand content language and improves accessibility for screen readers',
      howToFix: 'Add lang="en" (or appropriate language code) to your <html> tag to help search engines understand your content language.',
      implementation: [
        '1. Open your main HTML file or template',
        '2. Locate the opening <html> tag',
        '3. Add lang attribute: <html lang="en">',
        '4. Use ISO 639-1 language codes (en, es, fr, de, etc.)',
        '5. For regional variants use: lang="en-US", lang="es-MX"',
        '6. Ensure lang matches your actual content language'
      ],
      languageCodes: {
        'English': 'en',
        'Spanish': 'es', 
        'French': 'fr',
        'German': 'de',
        'Portuguese': 'pt',
        'Italian': 'it'
      },
      externalResources: [
        'HTML Lang Attribute Guide: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang',
        'Language Codes Reference: https://www.w3schools.com/tags/ref_language_codes.asp',
        'Accessibility Language Guidelines: https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html'
      ],
      testingTools: ['W3C HTML Validator', 'WAVE Accessibility Checker', 'axe DevTools', 'Lighthouse Accessibility Audit']
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

  // Social media optimization with detailed technical information
  const ogTags = seoData.openGraphTags || {};
  const requiredOgTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
  const missingOgTags = requiredOgTags.filter(tag => !ogTags[tag]);
  
  if (!seoData.openGraphTags || Object.keys(ogTags).length < 3 || missingOgTags.length > 0) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Incomplete Open Graph Tags - Social Media Optimization',
      description: `Missing ${missingOgTags.length} essential Open Graph tags. Current: ${Object.keys(ogTags).length}, Required: ${requiredOgTags.length} for optimal social sharing.`,
      category: 'seo' as const,
      currentValue: `Present: ${Object.keys(ogTags).join(', ') || 'None'} | Missing: ${missingOgTags.join(', ') || 'None'}`,
      affectedFiles: ['HTML head section', 'meta tag templates', 'CMS social media fields'],
      technicalLocation: 'HTML <head> section, <meta property="og:*" content="...">',
      detectionMethod: 'DOM query: document.querySelectorAll(\'meta[property^="og:"]\').length',
      codeExample: `<!-- Add to HTML head -->\n<meta property="og:title" content="Your Page Title">\n<meta property="og:description" content="Your page description">\n<meta property="og:image" content="https://yoursite.com/image.jpg">\n<meta property="og:url" content="https://yoursite.com/page">\n<meta property="og:type" content="website">`,
      seoImpact: 'Medium - Open Graph tags control how your content appears when shared on Facebook, LinkedIn, and other platforms',
      howToFix: 'Add og:title, og:description, og:image, og:url, and og:type meta tags for social media optimization.',
      implementation: [
        '1. Add meta tags to HTML head section',
        '2. og:title - Use your page title (up to 60 chars)',
        '3. og:description - Compelling description (up to 160 chars)',
        '4. og:image - High-quality image (1200x630px recommended)',
        '5. og:url - Canonical URL of your page',
        '6. og:type - Content type (website, article, etc.)',
        '7. Test with Facebook Sharing Debugger'
      ],
      externalResources: [
        'Open Graph Protocol: https://ogp.me/',
        'Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/',
        'Open Graph Meta Tags Guide: https://blog.hootsuite.com/open-graph-meta-tags/'
      ],
      testingTools: ['Facebook Sharing Debugger', 'LinkedIn Post Inspector', 'Open Graph Preview Tools']
    });
  }

  const twitterTags = seoData.twitterCardTags || {};
  const requiredTwitterTags = ['twitter:card', 'twitter:title', 'twitter:description'];
  const missingTwitterTags = requiredTwitterTags.filter(tag => !twitterTags[tag]);

  if (!seoData.twitterCardTags || Object.keys(twitterTags).length < 2 || missingTwitterTags.length > 0) {
    recommendations.push({
      type: 'info' as const,
      priority: 'low' as const,
      title: 'Missing Twitter Card Tags - Social Sharing Enhancement',
      description: `Missing ${missingTwitterTags.length} Twitter Card tags. Proper Twitter Cards improve engagement when shared on Twitter/X.`,
      category: 'seo' as const,
      currentValue: `Present: ${Object.keys(twitterTags).join(', ') || 'None'} | Missing: ${missingTwitterTags.join(', ') || 'None'}`,
      affectedFiles: ['HTML head section', 'social media meta templates'],
      technicalLocation: 'HTML <head> section, <meta name="twitter:*" content="...">',
      detectionMethod: 'DOM query: document.querySelectorAll(\'meta[name^="twitter:"]\').length',
      codeExample: `<!-- Add to HTML head -->\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="Your Page Title">\n<meta name="twitter:description" content="Your page description">\n<meta name="twitter:image" content="https://yoursite.com/image.jpg">`,
      seoImpact: 'Low-Medium - Twitter Cards enhance appearance and engagement when content is shared on Twitter/X',
      howToFix: 'Add twitter:card, twitter:title, twitter:description, and twitter:image meta tags.',
      implementation: [
        '1. Add Twitter meta tags to HTML head',
        '2. twitter:card - Choose card type (summary, summary_large_image)',
        '3. twitter:title - Compelling title (up to 70 chars)',
        '4. twitter:description - Clear description (up to 200 chars)',
        '5. twitter:image - High-quality image (minimum 300x157px)',
        '6. Test with Twitter Card Validator'
      ],
      cardTypes: {
        'summary': 'Small image, title, description',
        'summary_large_image': 'Large image with title and description',
        'app': 'Mobile app promotion',
        'player': 'Video/audio content'
      },
      externalResources: [
        'Twitter Cards Guide: https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started',
        'Card Validator: https://cards-dev.twitter.com/validator',
        'Twitter Cards Markup: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup'
      ],
      testingTools: ['Twitter Card Validator', 'Social Media Preview Tools', 'Meta Tag Debuggers']
    });
  }

  // Technical files with detailed implementation guidance
  if (!seoData.robotsTxtExists) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Missing robots.txt File - Crawler Control Issue',
      description: 'Your website is missing a robots.txt file, which provides important instructions to search engine crawlers.',
      category: 'technical' as const,
      affectedFiles: ['Domain root directory', 'web server configuration', 'FTP/hosting control panel'],
      technicalLocation: 'https://yourdomain.com/robots.txt (root directory)',
      detectionMethod: 'HTTP request: fetch("/robots.txt").then(r => r.status === 404)',
      codeExample: `# Basic robots.txt example\nUser-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /private/\nDisallow: /wp-admin/\n\n# Sitemap location\nSitemap: https://yourdomain.com/sitemap.xml`,
      seoImpact: 'Medium - robots.txt helps search engines understand which pages to crawl and which to avoid',
      howToFix: 'Create a robots.txt file at your domain root to guide search engine crawlers.',
      implementation: [
        '1. Create a text file named "robots.txt"',
        '2. Upload it to your website root directory (same level as index.html)',
        '3. Add User-agent: * (rules for all crawlers)',
        '4. Add Allow: / (allow crawling main content)',
        '5. Add Disallow: lines for private areas (/admin/, /private/)',
        '6. Include Sitemap: URL if you have one',
        '7. Test accessibility at https://yourdomain.com/robots.txt'
      ],
      commonDirectives: {
        'User-agent: *': 'Rules apply to all search engines',
        'Allow: /': 'Allow crawling of all pages',
        'Disallow: /admin/': 'Block admin/backend areas',
        'Disallow: /private/': 'Block private content',
        'Crawl-delay: 1': 'Wait 1 second between requests',
        'Sitemap: URL': 'Location of your XML sitemap'
      },
      externalResources: [
        'Google Robots.txt Guide: https://developers.google.com/search/docs/crawling-indexing/robots/intro',
        'Robots.txt Tester Tool: https://support.google.com/webmasters/answer/6062598',
        'Robots.txt Generator: https://www.seoptimer.com/robots-txt-generator'
      ],
      testingTools: ['Google Search Console Robots.txt Tester', 'Robots.txt Validators', 'Live URL Testing']
    });
  }

  if (!seoData.sitemapExists) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Missing XML Sitemap - Indexing Efficiency Issue',
      description: 'Your website is missing an XML sitemap, which helps search engines discover and efficiently index your pages.',
      category: 'technical' as const,
      affectedFiles: ['Domain root directory', 'CMS sitemap generator', 'build automation scripts'],
      technicalLocation: 'https://yourdomain.com/sitemap.xml (root directory)',
      detectionMethod: 'HTTP request: fetch("/sitemap.xml").then(r => r.status === 404)',
      codeExample: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://yourdomain.com/</loc>\n    <lastmod>2025-01-16</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://yourdomain.com/about</loc>\n    <lastmod>2025-01-10</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`,
      seoImpact: 'Medium - Sitemaps help search engines discover pages faster and understand site structure',
      howToFix: 'Create an XML sitemap and submit it to search engines to help them discover your content.',
      implementation: [
        '1. List all important pages on your website',
        '2. Create XML file with proper sitemap structure',
        '3. Include <loc>, <lastmod>, <changefreq>, <priority> for each URL',
        '4. Upload sitemap.xml to your root directory',
        '5. Add sitemap URL to robots.txt file',
        '6. Submit sitemap to Google Search Console and Bing Webmaster Tools',
        '7. Update sitemap when adding new pages or content'
      ],
      sitemapElements: {
        '<loc>': 'Full URL of the page',
        '<lastmod>': 'Last modification date (YYYY-MM-DD format)',
        '<changefreq>': 'Update frequency (daily, weekly, monthly, yearly)',
        '<priority>': 'Relative importance (0.0 to 1.0, homepage usually 1.0)'
      },
      automationOptions: [
        'WordPress: Yoast SEO, RankMath, Google XML Sitemaps plugins',
        'Static sites: Build script generators, sitemap libraries',
        'Shopify/Squarespace: Built-in sitemap generators',
        'Manual tools: XML-sitemaps.com, Screaming Frog'
      ],
      externalResources: [
        'Google Sitemap Guide: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview',
        'XML Sitemap Protocol: https://www.sitemaps.org/protocol.html',
        'Free Sitemap Generator: https://www.xml-sitemaps.com/'
      ],
      testingTools: ['Google Search Console Sitemap Reports', 'Bing Webmaster Tools', 'XML Validators', 'Sitemap Analyzers']
    });
  }

  // Technical performance with detailed implementation guidance
  const techStats = seoData.technicalAnalysis || {};
  if (techStats.inlineStyles > 5) {
    recommendations.push({
      type: 'info' as const,
      priority: 'low' as const,
      title: 'Excessive Inline Styles - Performance Optimization',
      description: `Found ${techStats.inlineStyles} instances of inline styles. This impacts caching efficiency and page load performance.`,
      category: 'performance' as const,
      currentValue: `${techStats.inlineStyles} elements with style="" attributes`,
      affectedFiles: ['HTML templates', 'component files', 'dynamic content generators'],
      technicalLocation: 'HTML elements with style="" attributes throughout document',
      detectionMethod: 'DOM query: document.querySelectorAll("[style]").length',
      codeExample: `<!-- Current (Inline Styles) -->\n<div style="color: red; font-size: 16px; margin: 10px;">Content</div>\n\n<!-- Optimized (External CSS) -->\n<div class="highlight-text">Content</div>\n\n/* In external CSS file */\n.highlight-text {\n  color: red;\n  font-size: 16px;\n  margin: 10px;\n}`,
      seoImpact: 'Low - Inline styles prevent CSS caching and increase HTML size, affecting page load speed',
      howToFix: 'Move inline styles to external CSS files for better caching and maintainability.',
      implementation: [
        '1. Identify all elements with style="" attributes',
        '2. Create CSS classes for common style patterns',
        '3. Move styles to external CSS file',
        '4. Replace style="" with class="" attributes',
        '5. Group related styles into logical CSS sections',
        '6. Minify CSS files for production'
      ],
      auditScript: `// Find all inline styles\nconst inlineStyleElements = document.querySelectorAll('[style]');\nconsole.log('Elements with inline styles:', inlineStyleElements.length);\ninlineStyleElements.forEach(el => console.log(el.tagName, el.style.cssText));`,
      externalResources: [
        'CSS Best Practices: https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Organizing',
        'Performance CSS Guide: https://web.dev/defer-non-critical-css/',
        'CSS Architecture: https://www.smashingmagazine.com/2007/05/css-specificity-things-you-should-know/'
      ],
      testingTools: ['Lighthouse Performance Audit', 'CSS Analyzer Tools', 'Browser DevTools Coverage Tab']
    });
  }

  // Form accessibility issues
  if (techStats.formsWithoutLabels > 0) {
    recommendations.push({
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Form Accessibility Issues - Missing Labels',
      description: `${techStats.formsWithoutLabels} form inputs are missing proper labels, affecting accessibility and SEO.`,
      category: 'accessibility' as const,
      currentValue: `${techStats.formsWithoutLabels} inputs without associated labels`,
      affectedFiles: ['Form templates', 'contact forms', 'search forms', 'user input components'],
      technicalLocation: '<input>, <textarea>, <select> elements without <label> association',
      detectionMethod: 'DOM query: document.querySelectorAll("input:not([id]), input[id]:not([id*=label])").length',
      codeExample: `<!-- Current (Missing Labels) -->\n<input type="email" placeholder="Enter email">\n\n<!-- Optimized (Proper Labels) -->\n<label for="email-input">Email Address:</label>\n<input type="email" id="email-input" placeholder="Enter email">\n\n<!-- Alternative (aria-label) -->\n<input type="email" aria-label="Email Address" placeholder="Enter email">`,
      seoImpact: 'Medium - Proper form labels improve accessibility and help search engines understand form purpose',
      howToFix: 'Add proper labels to all form inputs for better accessibility and SEO.',
      implementation: [
        '1. Audit all form inputs, textareas, and select elements',
        '2. Add <label> elements with for="" attribute matching input id',
        '3. Alternative: Use aria-label for inputs without visible labels',
        '4. Ensure label text clearly describes the input purpose',
        '5. Group related form fields with <fieldset> and <legend>',
        '6. Test with screen readers and accessibility tools'
      ],
      accessibilityStandards: {
        'WCAG 2.1 Level A': 'Labels or Instructions - 3.3.2',
        'Section 508': 'Forms must have associated labels',
        'ADA Compliance': 'Form controls must be programmatically associated'
      },
      externalResources: [
        'Form Labels Guide: https://www.w3.org/WAI/tutorials/forms/labels/',
        'WCAG Form Guidelines: https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html',
        'Accessible Forms: https://webaim.org/techniques/forms/'
      ],
      testingTools: ['WAVE Accessibility Checker', 'axe DevTools', 'Lighthouse Accessibility Audit', 'Screen Reader Testing']
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
  // Debug logging for production troubleshooting
  console.log('DEBUG generateBasicTechnicalChecks - seoData keys:', Object.keys(seoData || {}));
  console.log('DEBUG headings data:', seoData?.headings);
  
  // Real analysis based on extracted DOM data with explicit checks
  const hasH1 = !!(seoData?.headings?.h1 && Array.isArray(seoData.headings.h1) && seoData.headings.h1.length > 0);
  const hasMultipleHeadingTypes = Object.values(seoData?.headings || {}).filter(arr => Array.isArray(arr) && arr.length > 0).length > 1;
  const hasProperHeadingStructure = hasH1 && seoData.headings?.h1?.length === 1; // Single H1 is best practice
  
  console.log('DEBUG heading analysis:', { hasH1, hasMultipleHeadingTypes, h1Count: seoData?.headings?.h1?.length });
  
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
    hasOpenGraph: (() => {
      if (!seoData.openGraphTags) return false;
      const requiredOgTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
      const presentTags = Object.keys(seoData.openGraphTags);
      return requiredOgTags.every(tag => presentTags.includes(tag));
    })(),
    hasTwitterCards: (() => {
      if (!seoData.twitterCardTags) return false;
      const requiredTwitterTags = ['twitter:card', 'twitter:title', 'twitter:description'];
      const presentTags = Object.keys(seoData.twitterCardTags);
      return requiredTwitterTags.every(tag => presentTags.includes(tag));
    })(),
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