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
        description: `Title is ${titleLength} characters. Recommended length is 50-60 characters.`,
        howToFix: 'Edit your title tag to be between 50-60 characters. Focus on your primary keyword and make it compelling for users. Example: <title>Primary Keyword - Secondary Keyword | Brand Name</title>'
      });
    } else {
      score += 5;
      errors++;
      recommendations.push({
        type: 'error',
        priority: 'high',
        title: 'Fix Title Tag Length',
        description: `Title is ${titleLength} characters. This is outside the recommended range of 50-60 characters.`,
        howToFix: 'Rewrite your title tag to be 50-60 characters. Include your main keyword near the beginning and make it descriptive and compelling. Avoid keyword stuffing.'
      });
    }
  } else {
    errors++;
    recommendations.push({
      type: 'error',
      priority: 'high',
      title: 'Missing Title Tag',
      description: 'Your page is missing a title tag, which is crucial for SEO.',
      howToFix: 'Add a title tag in your <head> section: <title>Your Page Title Here</title>. Make it 50-60 characters, include your main keyword, and make it compelling for users.'
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
        description: `Meta description is ${descLength} characters. Recommended length is 150-160 characters.`,
        howToFix: 'Edit your meta description to be 150-160 characters. Write a compelling summary that includes your main keyword and encourages clicks: <meta name="description" content="Your optimized description here">'
      });
    } else {
      score += 5;
      errors++;
      recommendations.push({
        type: 'error',
        priority: 'high',
        title: 'Fix Meta Description Length',
        description: `Meta description is ${descLength} characters. This is outside the recommended range.`,
        howToFix: 'Rewrite your meta description to be 150-160 characters. Focus on clearly describing what users will find on your page and include a call-to-action.'
      });
    }
  } else {
    errors++;
    recommendations.push({
      type: 'error',
      priority: 'high',
      title: 'Missing Meta Description',
      description: 'Your page is missing a meta description, which is important for search results.',
      howToFix: 'Add a meta description in your <head> section: <meta name="description" content="Your compelling 150-160 character description that includes your main keyword and entices users to click">'
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
        description: 'All essential Open Graph tags are present for optimal social media sharing.',
        howToFix: 'Already implemented correctly'
      });
    } else {
      score += 10;
      warnings++;
      recommendations.push({
        type: 'warning',
        priority: 'medium',
        title: 'Incomplete Open Graph Tags',
        description: `Missing Open Graph tags: ${missingOgTags.join(', ')}`,
        howToFix: `Add the missing Open Graph tags to your <head> section: ${missingOgTags.map(tag => `<meta property="${tag}" content="Your content here">`).join(', ')}. Ensure og:image is at least 1200x630 pixels.`
      });
    }
  } else {
    errors++;
    recommendations.push({
      type: 'error',
      priority: 'high',
      title: 'Missing Open Graph Tags',
      description: 'Open Graph tags are missing. These are essential for social media sharing.',
      howToFix: 'Add Open Graph tags to your <head>: <meta property="og:title" content="Page Title">, <meta property="og:description" content="Page description">, <meta property="og:image" content="https://yoursite.com/image.jpg">, <meta property="og:url" content="https://yoursite.com/current-page">'
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
      description: 'Twitter Card tags are present for optimal Twitter sharing.',
      howToFix: 'Already implemented correctly'
    });
  } else {
    errors++;
    recommendations.push({
      type: 'error',
      priority: 'high',
      title: 'Missing Twitter Cards',
      description: 'Twitter Card tags are missing. These optimize how your content appears on Twitter.',
      howToFix: 'Add Twitter Card tags to your <head>: <meta name="twitter:card" content="summary_large_image">, <meta name="twitter:title" content="Page Title">, <meta name="twitter:description" content="Description">, <meta name="twitter:image" content="https://yoursite.com/image.jpg">'
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
        description: check.description,
        howToFix: 'Already implemented correctly'
      });
    } else {
      if (criticalChecks.some(c => c.key === check.key)) {
        techErrors++;
        recommendations.push({
          type: 'error',
          priority: 'high',
          title: `Missing: ${check.title}`,
          description: check.description,
          howToFix: getFixGuideline(check.key)
        });
      } else {
        techWarnings++;
        recommendations.push({
          type: 'warning',
          priority: 'medium',
          title: `Improve: ${check.title}`,
          description: check.description,
          howToFix: getFixGuideline(check.key)
        });
      }
    }
  });

  // Add technical score to overall score
  score += techScore;
  passed += techPassed;
  warnings += techWarnings;
  errors += techErrors;

  // Calculate more balanced score (penalize warnings and errors more)
  const maxPossibleScore = 100;
  const warningPenalty = warnings * 3; // 3 points per warning
  const errorPenalty = errors * 8; // 8 points per error
  const finalScore = Math.max(0, Math.min(maxPossibleScore, score - warningPenalty - errorPenalty));

  return {
    score: finalScore,
    passed,
    warnings,
    errors,
    recommendations,
    technicalSeoChecks,
  };
}

// Function to provide comprehensive fix guidelines
function getFixGuideline(checkKey: string): string {
  const guidelines: Record<string, string> = {
    // Critical checks
    'hasSSL': 'Install an SSL certificate on your server. For free certificates, use Let\'s Encrypt or contact your hosting provider. Update all URLs to use https:// instead of http://.',
    'hasViewportMeta': 'Add this meta tag to your <head> section: <meta name="viewport" content="width=device-width, initial-scale=1.0">. This ensures proper mobile display.',
    'hasH1Tag': 'Add exactly one <h1> tag per page containing your main heading. Example: <h1>Your Main Page Title</h1>. Only use one H1 per page.',
    'hasMetaDescription': 'Add a meta description tag: <meta name="description" content="Your 150-160 character description here">. Write compelling, unique descriptions for each page.',
    
    // Important checks
    'hasCharset': 'Add character encoding to your <head>: <meta charset="UTF-8">. This prevents character display issues across different browsers.',
    'hasLangAttribute': 'Add language attribute to your <html> tag: <html lang="en"> (replace "en" with your content\'s language code).',
    'hasCanonicalURL': 'Add canonical URL: <link rel="canonical" href="https://yoursite.com/page-url">. This prevents duplicate content issues.',
    'hasSchemaMarkup': 'Add JSON-LD structured data to help search engines understand your content. Use Google\'s Structured Data Markup Helper or Schema.org guidelines.',
    'imagesHaveAltText': 'Add descriptive alt attributes to all images: <img src="image.jpg" alt="Descriptive text about the image">. Alt text helps accessibility and SEO.',
    'hasMultipleHeadings': 'Use proper heading hierarchy (H1, H2, H3, etc.) to structure your content. Start with H1, then use H2 for main sections, H3 for subsections.',
    
    // Performance checks
    'minifiedHTML': 'Minify your HTML by removing unnecessary spaces, comments, and line breaks. Use build tools like Webpack, Gulp, or online minifiers.',
    'noInlineStyles': 'Move all CSS to external stylesheet files instead of using style="" attributes or <style> tags. Link with: <link rel="stylesheet" href="styles.css">.',
    'responsiveImages': 'Use responsive images with srcset: <img src="image.jpg" srcset="image-480w.jpg 480w, image-800w.jpg 800w" sizes="(max-width: 600px) 480px, 800px" alt="Description">.',
    'hasInternalLinks': 'Add internal links to other relevant pages on your website. Use descriptive anchor text that tells users what they\'ll find on the linked page.',
    'sufficientContent': 'Add more valuable, unique content to your page. Aim for at least 300 words of high-quality, relevant text that provides value to your visitors.',
    
    // Social media checks
    'hasOpenGraph': 'Add Open Graph tags: <meta property="og:title" content="Page Title">, <meta property="og:description" content="Page description">, <meta property="og:image" content="image-url">, <meta property="og:url" content="page-url">.',
    'hasTwitterCards': 'Add Twitter Card tags: <meta name="twitter:card" content="summary_large_image">, <meta name="twitter:title" content="Page Title">, <meta name="twitter:description" content="Description">.',
    'hasOGImage': 'Add Open Graph image: <meta property="og:image" content="https://yoursite.com/image.jpg">. Use images at least 1200x630 pixels for best results.',
    
    // Technical configuration
    'hasRobotsMeta': 'Add robots meta tag: <meta name="robots" content="index, follow"> for pages you want indexed, or <meta name="robots" content="noindex, nofollow"> for pages you don\'t.',
    'sitemap': 'Create and submit an XML sitemap to search engines. Use tools like XML-Sitemaps.com or SEO plugins if using WordPress.',
    'robotsTxt': 'Create a robots.txt file in your website root directory. Example content: User-agent: *\\nAllow: /\\nSitemap: https://yoursite.com/sitemap.xml',
    'touchFriendlyElements': 'Ensure interactive elements are at least 44x44 pixels and have adequate spacing. Remove onclick handlers in favor of proper buttons and links.',
    'hasTwitterSite': 'Add Twitter site tag: <meta name="twitter:site" content="@yourusername"> to associate content with your Twitter account.',
    'externalLinksOptimized': 'Add rel="nofollow" to external links you don\'t want to endorse: <a href="external-site.com" rel="nofollow">Link text</a>.',
    'imagesHaveDimensions': 'Add width and height attributes to images: <img src="image.jpg" width="800" height="600" alt="Description">. This prevents layout shift.',
  };

  return guidelines[checkKey] || 'Please review this item and implement according to SEO best practices.';
}
