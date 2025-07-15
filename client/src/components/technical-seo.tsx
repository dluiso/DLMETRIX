import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Check, X } from "lucide-react";

interface TechnicalSeoProps {
  checks: Record<string, boolean>;
}

export default function TechnicalSeo({ checks }: TechnicalSeoProps) {
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
                  {category.items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-2 border rounded-md hover:bg-slate-50">
                      <div className="flex items-center space-x-3">
                        {checks[item.key] ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-slate-600">{item.description}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={checks[item.key] ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {checks[item.key] ? "Pass" : "Fail"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
