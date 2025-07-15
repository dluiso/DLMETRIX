import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Settings, Check, X, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface TechnicalSeoProps {
  checks: Record<string, boolean>;
}

export default function TechnicalSeo({ checks }: TechnicalSeoProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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
      hasMetaDescription: {
        steps: [
          "Add a compelling meta description between 120-160 characters",
          "Summarize your page content clearly and include relevant keywords",
          "Make it appealing to encourage clicks from search results"
        ],
        code: '<meta name="description" content="Your compelling page description here">',
        location: "HTML <head> section"
      },
      hasDocumentTitle: {
        steps: [
          "Add a descriptive title tag between 30-60 characters",
          "Include your main keyword and make it unique for each page",
          "Use a format like: Primary Keyword - Secondary Keyword | Brand Name"
        ],
        code: '<title>Your Page Title - Brand Name</title>',
        location: "HTML <head> section"
      },
      hasHTTPS: {
        steps: [
          "Purchase an SSL certificate from your hosting provider",
          "Install the certificate on your web server",
          "Update all internal links to use https://",
          "Set up 301 redirects from HTTP to HTTPS"
        ],
        location: "Web server configuration"
      },
      hasStructuredData: {
        steps: [
          "Add JSON-LD structured data to help search engines understand your content",
          "Use schema.org markup appropriate for your content type",
          "Test your markup using Google's Rich Results Test tool"
        ],
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Your Page Name",
  "description": "Your page description"
}
</script>`,
        location: "HTML <head> or <body> section"
      },
      hasCanonical: {
        steps: [
          "Add a canonical link tag to specify the preferred URL",
          "This prevents duplicate content issues",
          "Use the full absolute URL including https://"
        ],
        code: '<link rel="canonical" href="https://yoursite.com/page-url">',
        location: "HTML <head> section"
      },
      hasOpenGraph: {
        steps: [
          "Add Open Graph meta tags for better social media sharing",
          "Include og:title, og:description, og:image, and og:url",
          "Use high-quality images (1200x630px recommended)"
        ],
        code: `<meta property="og:title" content="Your Page Title">
<meta property="og:description" content="Your page description">
<meta property="og:image" content="https://yoursite.com/image.jpg">
<meta property="og:url" content="https://yoursite.com/page-url">`,
        location: "HTML <head> section"
      },
      hasTwitterCards: {
        steps: [
          "Add Twitter Card meta tags for optimized Twitter sharing",
          "Choose appropriate card type (summary, summary_large_image, etc.)",
          "Include twitter:title, twitter:description, and twitter:image"
        ],
        code: `<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Your Page Title">
<meta name="twitter:description" content="Your page description">
<meta name="twitter:image" content="https://yoursite.com/image.jpg">`,
        location: "HTML <head> section"
      },
      hasRobotsTxt: {
        steps: [
          "Create a robots.txt file in your website's root directory",
          "Specify which pages search engines should crawl",
          "Include a link to your XML sitemap"
        ],
        code: `User-agent: *
Allow: /
Sitemap: https://yoursite.com/sitemap.xml`,
        location: "Root directory (yoursite.com/robots.txt)"
      },
      hasImageAlt: {
        steps: [
          "Add descriptive alt text to all images on your page",
          "Describe what's in the image clearly and concisely",
          "Use keywords naturally when relevant to the image content"
        ],
        code: '<img src="image.jpg" alt="Descriptive text about the image content">',
        location: "All <img> tags in your HTML"
      },
      hasProperHeadings: {
        steps: [
          "Use only one H1 tag per page for the main heading",
          "Create a logical heading hierarchy: H1 > H2 > H3 > etc.",
          "Don't skip heading levels (don't jump from H1 to H3)"
        ],
        code: `<h1>Main Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>`,
        location: "Throughout your HTML content"
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

  const allChecks = categories.flatMap(cat => cat.items);
  const passedChecks = allChecks.filter(item => checks[item.key]).length;
  const totalChecks = allChecks.length;
  const passRate = Math.round((passedChecks / totalChecks) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-slate-600" />
            <CardTitle>Advanced Technical SEO Analysis</CardTitle>
          </div>
          <Badge variant={passRate >= 80 ? "default" : passRate >= 60 ? "secondary" : "destructive"}>
            {passedChecks}/{totalChecks} Passed ({passRate}%)
          </Badge>
        </div>
        <p className="text-sm text-slate-600 mt-2">
          Comprehensive technical analysis covering performance, accessibility, and SEO best practices
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryPassed = category.items.filter(item => checks[item.key]).length;
            const categoryTotal = category.items.length;
            const categoryRate = Math.round((categoryPassed / categoryTotal) * 100);
            
            return (
              <div key={category.title} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">{category.title}</h4>
                  <span className={`text-sm font-medium ${
                    categoryRate >= 80 ? 'text-green-600' : 
                    categoryRate >= 60 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {categoryPassed}/{categoryTotal}
                  </span>
                </div>
                <div className="grid gap-2">
                  {category.items.map((item) => {
                    const isExpanded = expandedItems.has(item.key);
                    const hasFailed = !checks[item.key];
                    const fixGuide = getFixGuide(item.key);
                    
                    return (
                      <div key={item.key} className="border rounded-md overflow-hidden">
                        <div className="flex items-center justify-between p-2 hover:bg-slate-50">
                          <div className="flex items-center space-x-3 flex-1">
                            {checks[item.key] ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <X className="w-4 h-4 text-red-600" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.label}</p>
                              <p className="text-xs text-slate-600">{item.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={checks[item.key] ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {checks[item.key] ? "Pass" : "Fail"}
                            </Badge>
                            {hasFailed && (
                              <button
                                onClick={() => toggleExpanded(item.key)}
                                className="flex items-center justify-center w-6 h-6 rounded hover:bg-slate-100"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-slate-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-600" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {hasFailed && isExpanded && (
                          <div className="border-t bg-red-50 p-4">
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h5 className="font-medium text-red-900 mb-2">How to Fix This Issue</h5>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-sm font-medium text-red-800 mb-1">Steps to resolve:</p>
                                    <ol className="text-sm text-red-700 space-y-1">
                                      {fixGuide.steps.map((step, index) => (
                                        <li key={index} className="flex items-start space-x-2">
                                          <span className="font-medium text-red-600 flex-shrink-0">{index + 1}.</span>
                                          <span>{step}</span>
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                  
                                  {fixGuide.code && (
                                    <div>
                                      <p className="text-sm font-medium text-red-800 mb-1">Code example:</p>
                                      <div className="bg-slate-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                                        <pre>{fixGuide.code}</pre>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <p className="text-sm font-medium text-red-800 mb-1">Where to add this:</p>
                                    <p className="text-sm text-red-700 bg-red-100 px-2 py-1 rounded">
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
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
