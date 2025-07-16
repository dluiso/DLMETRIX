import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Settings, Check, X, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface TechnicalSeoProps {
  checks: Array<{ check: string; status: string; description: string }> | Record<string, boolean>;
}

export default function TechnicalSeo({ checks }: TechnicalSeoProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Handle both array format (from shared reports) and object format (from original reports)
  const checksArray = Array.isArray(checks) ? checks : Object.entries(checks || {}).map(([key, value]) => {
    // Create more descriptive labels and descriptions for better display
    const checkLabels: Record<string, { label: string; description: string }> = {
      hasViewportMeta: { label: 'Viewport Meta Tag', description: 'hasViewportMeta check' },
      hasCharset: { label: 'Character Encoding', description: 'hasCharset check' },
      hasSSL: { label: 'SSL Certificate', description: 'hasSSL check' },
      minifiedHTML: { label: 'HTML Minification', description: 'minifiedHTML check' },
      noInlineStyles: { label: 'External Stylesheets', description: 'noInlineStyles check' },
      hasH1Tag: { label: 'H1 Tag Present', description: 'hasH1Tag check' },
      hasMultipleHeadings: { label: 'Multiple Headings', description: 'hasMultipleHeadings check' },
      hasMetaDescription: { label: 'Meta Description', description: 'hasMetaDescription check' },
      sufficientContent: { label: 'Content Length', description: 'sufficientContent check' },
      keywordInTitle: { label: 'Descriptive Title', description: 'keywordInTitle check' }
    };
    
    const labelInfo = checkLabels[key] || { label: key, description: `${key} check` };
    
    return {
      check: labelInfo.label,
      status: value ? 'pass' : 'fail',
      description: labelInfo.description
    };
  });

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const getFixGuide = (key: string) => {
    const guides: Record<string, { steps: string[], code?: string, location: string }> = {
      hasViewportMeta: {
        steps: [
          "Add the viewport meta tag to your HTML head section",
          "This ensures your website displays properly on mobile devices",
          "Place it early in the <head> section for best results"
        ],
        code: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        location: "HTML <head> section"
      },
      hasCharset: {
        steps: [
          "Add UTF-8 character encoding declaration to prevent text display issues",
          "Place this as the first meta tag in your HTML head",
          "This ensures proper display of special characters and emojis"
        ],
        code: '<meta charset="UTF-8">',
        location: "First line in HTML <head> section"
      },
      hasSSL: {
        steps: [
          "Purchase an SSL certificate from your hosting provider or use a free one from Let's Encrypt",
          "Install and configure the certificate on your web server",
          "Update all internal links to use https:// instead of http://",
          "Set up 301 redirects from HTTP to HTTPS URLs"
        ],
        location: "Web server configuration and hosting settings"
      },
      minifiedHTML: {
        steps: [
          "Remove unnecessary whitespace, comments, and line breaks from your HTML",
          "Use build tools like Webpack, Gulp, or online minifiers",
          "Enable gzip compression on your web server",
          "Consider using a CDN for faster content delivery"
        ],
        location: "Build process and server configuration"
      },
      noInlineStyles: {
        steps: [
          "Move all inline CSS styles to external stylesheets",
          "Create separate .css files for your styles",
          "Link stylesheets in the HTML head section",
          "Use CSS classes instead of style attributes"
        ],
        code: `<!-- Instead of: <div style="color: red;"> -->
<div class="error-text">
<!-- Add to external CSS: .error-text { color: red; } -->`,
        location: "External CSS files and HTML cleanup"
      },
      hasH1Tag: {
        steps: [
          "Add exactly one H1 tag per page containing your main headline",
          "Make it descriptive and include your primary keyword",
          "Place it prominently near the top of your content",
          "Ensure it accurately describes the page content"
        ],
        code: '<h1>Your Main Page Headline Here</h1>',
        location: "Main content area of your HTML"
      },
      hasMultipleHeadings: {
        steps: [
          "Create a logical heading hierarchy using H1, H2, H3, etc.",
          "Don't skip heading levels (H1 → H2 → H3, not H1 → H3)",
          "Use headings to structure your content outline",
          "Include relevant keywords in subheadings naturally"
        ],
        code: `<h1>Main Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>
<h2>Another Section</h2>`,
        location: "Throughout your HTML content structure"
      },
      hasMetaDescription: {
        steps: [
          "Write a compelling meta description between 120-160 characters",
          "Summarize your page content clearly and include relevant keywords",
          "Make it appealing to encourage clicks from search results",
          "Make each page's description unique and specific"
        ],
        code: '<meta name="description" content="Your compelling page description that summarizes the content and includes relevant keywords">',
        location: "HTML <head> section"
      },
      sufficientContent: {
        steps: [
          "Add substantial, high-quality content (minimum 300 words)",
          "Focus on providing value to your visitors",
          "Include relevant keywords naturally in your text",
          "Break up content with headings, lists, and images"
        ],
        location: "Main content area of your webpage"
      },
      keywordInTitle: {
        steps: [
          "Include your primary keyword in the title tag",
          "Keep the title between 30-60 characters for best display",
          "Make it descriptive and compelling for users",
          "Use a format like: Primary Keyword - Brand Name"
        ],
        code: '<title>Primary Keyword - Descriptive Title | Brand Name</title>',
        location: "HTML <head> section"
      },
      imagesHaveAltText: {
        steps: [
          "Add descriptive alt text to all images on your page",
          "Describe what's in the image clearly and concisely",
          "Use keywords naturally when relevant to the image content",
          "Leave alt empty (alt=\"\") only for purely decorative images"
        ],
        code: '<img src="image.jpg" alt="Descriptive text about the image content">',
        location: "All <img> tags in your HTML"
      },
      imagesHaveDimensions: {
        steps: [
          "Specify width and height attributes for all images",
          "This prevents layout shift as images load",
          "Use actual pixel dimensions or responsive units",
          "Consider using CSS for responsive image sizing"
        ],
        code: '<img src="image.jpg" alt="Description" width="300" height="200">',
        location: "All <img> tags in your HTML"
      },
      responsiveImages: {
        steps: [
          "Use srcset attribute to provide multiple image sizes",
          "Implement picture element for art direction",
          "Serve appropriate image sizes for different devices",
          "Use modern image formats like WebP when possible"
        ],
        code: `<img src="image-800.jpg" 
     srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
     sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
     alt="Description">`,
        location: "All <img> tags in your HTML"
      },
      hasInternalLinks: {
        steps: [
          "Add relevant internal links to other pages on your website",
          "Use descriptive anchor text that describes the linked page",
          "Link to related content and important pages",
          "Ensure links are accessible and properly formatted"
        ],
        code: '<a href="/related-page">Descriptive anchor text</a>',
        location: "Throughout your page content"
      },
      externalLinksOptimized: {
        steps: [
          "Add rel=\"noopener\" to external links for security",
          "Consider rel=\"nofollow\" for untrusted external links",
          "Use descriptive anchor text for external links",
          "Ensure external links open in new tabs if desired"
        ],
        code: '<a href="https://example.com" rel="noopener" target="_blank">External Link</a>',
        location: "All external links in your HTML"
      },
      hasCanonicalURL: {
        steps: [
          "Add a canonical link tag to specify the preferred URL version",
          "This prevents duplicate content issues",
          "Use the full absolute URL including https://",
          "Ensure canonical points to the current page or preferred version"
        ],
        code: '<link rel="canonical" href="https://yoursite.com/current-page-url">',
        location: "HTML <head> section"
      },
      hasSchemaMarkup: {
        steps: [
          "Add JSON-LD structured data to help search engines understand your content",
          "Choose appropriate schema.org markup for your content type",
          "Test your markup using Google's Rich Results Test tool",
          "Include essential properties like name, description, and relevant data"
        ],
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Your Page Name",
  "description": "Your page description",
  "url": "https://yoursite.com/current-page"
}
</script>`,
        location: "HTML <head> or before closing </body> tag"
      },
      hasOpenGraph: {
        steps: [
          "Add Open Graph meta tags for better social media sharing",
          "Include og:title, og:description, og:image, and og:url at minimum",
          "Use high-quality images (1200x630px recommended for Facebook)",
          "Test your Open Graph tags using Facebook's Sharing Debugger"
        ],
        code: `<meta property="og:title" content="Your Page Title">
<meta property="og:description" content="Your page description">
<meta property="og:image" content="https://yoursite.com/social-image.jpg">
<meta property="og:url" content="https://yoursite.com/current-page">
<meta property="og:type" content="website">`,
        location: "HTML <head> section"
      },
      hasTwitterCards: {
        steps: [
          "Add Twitter Card meta tags for optimized Twitter sharing",
          "Choose appropriate card type (summary, summary_large_image, etc.)",
          "Include twitter:title, twitter:description, and twitter:image",
          "Test using Twitter's Card Validator tool"
        ],
        code: `<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Your Page Title">
<meta name="twitter:description" content="Your page description">
<meta name="twitter:image" content="https://yoursite.com/twitter-image.jpg">`,
        location: "HTML <head> section"
      },
      hasOGImage: {
        steps: [
          "Create and upload a high-quality social media image",
          "Use dimensions of 1200x630px for optimal display",
          "Include your brand and relevant visual elements",
          "Add the og:image meta tag pointing to your image URL"
        ],
        code: '<meta property="og:image" content="https://yoursite.com/social-sharing-image.jpg">',
        location: "HTML <head> section and image hosting"
      },
      hasLangAttribute: {
        steps: [
          "Add the lang attribute to your HTML tag",
          "Specify the primary language of your page content",
          "Use standard language codes (en, es, fr, de, etc.)",
          "This helps screen readers and search engines"
        ],
        code: '<html lang="en">',
        location: "Opening <html> tag"
      },
      hasRobotsMeta: {
        steps: [
          "Add robots meta tag to control search engine crawling",
          "Use 'index, follow' for normal pages you want indexed",
          "Use 'noindex' for pages you don't want in search results",
          "Consider 'nofollow' for pages with untrusted links"
        ],
        code: '<meta name="robots" content="index, follow">',
        location: "HTML <head> section"
      },
      sitemap: {
        steps: [
          "Create an XML sitemap listing all your important pages",
          "Submit your sitemap to Google Search Console",
          "Include sitemap location in your robots.txt file",
          "Update sitemap regularly when adding new content"
        ],
        code: `<!-- In robots.txt -->
Sitemap: https://yoursite.com/sitemap.xml`,
        location: "Root directory and robots.txt file"
      },
      robotsTxt: {
        steps: [
          "Create a robots.txt file in your website's root directory",
          "Specify crawling rules for search engine bots",
          "Include your sitemap URL for easy discovery",
          "Test your robots.txt using Google Search Console"
        ],
        code: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
Sitemap: https://yoursite.com/sitemap.xml`,
        location: "Root directory (yoursite.com/robots.txt)"
      },
      touchFriendlyElements: {
        steps: [
          "Ensure buttons and links are at least 44x44px for easy touch",
          "Add adequate spacing between clickable elements",
          "Use CSS to improve touch target sizes",
          "Test your site on actual mobile devices"
        ],
        code: `.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}`,
        location: "CSS stylesheet and interactive elements"
      }
    };

    return guides[key] || {
      steps: [
        "This check failed and requires technical attention",
        "Review your website's code and configuration",
        "Consider consulting with a web developer for implementation"
      ],
      location: "Various locations in your website"
    };
  };

  const categories = [
    {
      title: "Core Web Vitals & Performance",
      items: [
        { key: 'hasViewportMeta', label: 'Viewport Meta Tag', description: 'Mobile-friendly viewport configuration' },
        { key: 'hasCharset', label: 'Character Encoding', description: 'Proper character encoding specified' },
        { key: 'hasSSL', label: 'HTTPS/SSL', description: 'Website uses secure HTTPS protocol' },
        { key: 'minifiedHTML', label: 'HTML Optimization', description: 'HTML is minified for faster loading' },
        { key: 'noInlineStyles', label: 'External Stylesheets', description: 'CSS is externalized, not inline' }
      ]
    },
    {
      title: "Content & Structure",
      items: [
        { key: 'hasH1Tag', label: 'H1 Heading Tag', description: 'Page has a proper H1 heading tag' },
        { key: 'hasMultipleHeadings', label: 'Heading Hierarchy', description: 'Proper heading structure (H1-H6)' },
        { key: 'hasMetaDescription', label: 'Meta Description', description: 'Page has a meta description' },
        { key: 'sufficientContent', label: 'Content Length', description: 'Page has sufficient text content' },
        { key: 'keywordInTitle', label: 'Descriptive Title', description: 'Title contains multiple descriptive words' }
      ]
    },
    {
      title: "Images & Media",
      items: [
        { key: 'imagesHaveAltText', label: 'Image Alt Text', description: 'Images have descriptive alt attributes' },
        { key: 'imagesHaveDimensions', label: 'Image Dimensions', description: 'Images specify width and height' },
        { key: 'responsiveImages', label: 'Responsive Images', description: 'Images use srcset or picture elements' }
      ]
    },
    {
      title: "Links & Navigation",
      items: [
        { key: 'hasInternalLinks', label: 'Internal Links', description: 'Page has internal navigation links' },
        { key: 'externalLinksOptimized', label: 'External Link SEO', description: 'External links properly configured' },
        { key: 'hasCanonicalURL', label: 'Canonical URL', description: 'Canonical URL is properly set' }
      ]
    },
    {
      title: "Structured Data & Meta",
      items: [
        { key: 'hasSchemaMarkup', label: 'Schema Markup', description: 'JSON-LD structured data present' },
        { key: 'hasOpenGraph', label: 'Open Graph Tags', description: 'Facebook/social media meta tags' },
        { key: 'hasTwitterCards', label: 'Twitter Cards', description: 'Twitter-specific meta tags' },
        { key: 'hasOGImage', label: 'Social Media Image', description: 'Open Graph image specified' }
      ]
    },
    {
      title: "Technical Configuration",
      items: [
        { key: 'hasLangAttribute', label: 'Language Declaration', description: 'HTML lang attribute specified' },
        { key: 'hasRobotsMeta', label: 'Robots Meta Tag', description: 'Search engine crawling instructions' },
        { key: 'sitemap', label: 'Sitemap Reference', description: 'Sitemap referenced or mentioned' },
        { key: 'robotsTxt', label: 'Robots.txt', description: 'Robots.txt file accessibility' },
        { key: 'touchFriendlyElements', label: 'Touch-Friendly UI', description: 'Mobile-optimized interactive elements' }
      ]
    }
  ];

  // Calculate statistics based on the actual checks data
  const passedChecks = checksArray.filter(check => check.status === 'pass').length;
  const totalChecks = checksArray.length;
  const passRate = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <CardTitle className="text-base sm:text-lg text-slate-900 dark:text-slate-100">Technical SEO Analysis</CardTitle>
          </div>
          <Badge variant={passRate >= 80 ? "default" : passRate >= 60 ? "secondary" : "destructive"} className="text-xs sm:text-sm w-fit">
            {passedChecks}/{totalChecks} Passed ({passRate}%)
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
          Comprehensive technical analysis covering performance, accessibility, and SEO best practices
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checksArray.length > 0 ? (
            checksArray.map((check) => {
              const isExpanded = expandedItems.has(check.check);
              const hasFailed = check.status === 'fail';
              const fixGuide = getFixGuide(check.check);
              
              return (
                <div key={check.check} className="border dark:border-slate-600 rounded-md overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-2 hover:bg-slate-50 dark:hover:bg-slate-700 gap-2">
                    <div className="flex items-center space-x-3 flex-1">
                      {check.status === 'pass' ? (
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-sm text-slate-900 dark:text-slate-100">{check.check}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{check.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 justify-end sm:justify-start">
                      <Badge 
                        variant={check.status === 'pass' ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {check.status === 'pass' ? "Pass" : "Fail"}
                      </Badge>
                      {hasFailed && (
                        <button
                          onClick={() => toggleExpanded(check.check)}
                          className="flex items-center justify-center w-6 h-6 rounded hover:bg-slate-100 dark:hover:bg-slate-600 flex-shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {hasFailed && isExpanded && (
                    <div className="border-t bg-red-50 dark:bg-red-900/20 p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h5 className="font-medium text-red-900 dark:text-red-100 mb-2">How to Fix This Issue</h5>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Steps to resolve:</p>
                              <ol className="text-sm text-red-700 dark:text-red-300 space-y-1">
                                {fixGuide.steps.map((step, index) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <span className="font-medium text-red-600 dark:text-red-400 flex-shrink-0">{index + 1}.</span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                            
                            {fixGuide.code && (
                              <div>
                                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Code example:</p>
                                <div className="bg-slate-900 dark:bg-slate-800 text-green-400 dark:text-green-300 p-3 rounded text-xs font-mono overflow-x-auto">
                                  <pre>{fixGuide.code}</pre>
                                </div>
                              </div>
                            )}
                            
                            <div>
                              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Where to add this:</p>
                              <p className="text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800/30 px-2 py-1 rounded">
                                {fixGuide.location}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
              <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No technical checks available for this report</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
