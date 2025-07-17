import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Check, AlertTriangle, X } from "lucide-react";
import { SeoAnalysisResult } from "@/types/seo";

interface MetaTagAnalysisProps {
  data: SeoAnalysisResult;
}

export default function MetaTagAnalysis({ data }: MetaTagAnalysisProps) {
  const getStatusIcon = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return <Check className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      case 'error':
        return <X className="w-4 h-4 text-red-600 dark:text-red-400" />;
    }
  };

  const getStatusBadge = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100">GOOD</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 hover:bg-yellow-100">NEEDS IMPROVEMENT</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100">MISSING</Badge>;
    }
  };

  const getTitleStatus = () => {
    if (!data.title) return 'error';
    const length = data.title.length;
    if (length >= 50 && length <= 60) return 'good';
    if (length >= 30 && length <= 80) return 'warning';
    return 'error';
  };

  const getDescriptionStatus = () => {
    if (!data.description) return 'error';
    const length = data.description.length;
    if (length >= 150 && length <= 160) return 'good';
    if (length >= 120 && length <= 200) return 'warning';
    return 'error';
  };

  const getOpenGraphStatus = () => {
    if (!data.openGraphTags) return 'error';
    const requiredTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
    const presentTags = Object.keys(data.openGraphTags);
    const hasAllRequired = requiredTags.every(tag => presentTags.includes(tag));
    
    if (hasAllRequired) return 'good';
    if (presentTags.length > 0) return 'warning';
    return 'error';
  };

  const getTwitterStatus = () => {
    if (!data.twitterCardTags) return 'error';
    const requiredTags = ['twitter:card', 'twitter:title', 'twitter:description'];
    const presentTags = Object.keys(data.twitterCardTags);
    const hasAllRequired = requiredTags.every(tag => presentTags.includes(tag));
    
    if (hasAllRequired) return 'good';
    if (presentTags.length > 0) return 'warning';
    return 'error';
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center space-x-2 mb-4 sm:mb-6">
          <Code className="w-5 h-5 text-primary flex-shrink-0" />
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">Meta Tags Analysis</h3>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {/* Title Tag */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(getTitleStatus())}
                <span className="font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base">Title Tag</span>
              </div>
              {getStatusBadge(getTitleStatus())}
            </div>
            
            {data.title ? (
              <>
                <div className="bg-slate-50 dark:bg-slate-800 p-2 sm:p-3 rounded font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-2 overflow-x-auto break-all">
                  &lt;title&gt;{data.title}&lt;/title&gt;
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600">
                  <span>Length: {data.title.length} characters</span>
                  <span className={getTitleStatus() === 'good' ? 'text-green-600 dark:text-green-400' : getTitleStatus() === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}>
                    {getTitleStatus() === 'good' ? '✓ Within recommended range (50-60)' : 
                     getTitleStatus() === 'warning' ? '⚠ Outside optimal range' : 
                     '✗ Poor length'}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-xs sm:text-sm text-slate-600">
                Title tag is missing. This is crucial for SEO.
              </div>
            )}
          </div>

          {/* Meta Description */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(getDescriptionStatus())}
                <span className="font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base">Meta Description</span>
              </div>
              {getStatusBadge(getDescriptionStatus())}
            </div>
            
            {data.description ? (
              <>
                <div className="bg-slate-50 p-2 sm:p-3 rounded font-mono text-xs sm:text-sm text-slate-700 mb-2 overflow-x-auto break-all">
                  &lt;meta name="description" content="{data.description}"&gt;
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600">
                  <span>Length: {data.description.length} characters</span>
                  <span className={getDescriptionStatus() === 'good' ? 'text-green-600' : getDescriptionStatus() === 'warning' ? 'text-yellow-600' : 'text-red-600'}>
                    {getDescriptionStatus() === 'good' ? '✓ Within recommended range (150-160)' : 
                     getDescriptionStatus() === 'warning' ? '⚠ Outside optimal range' : 
                     '✗ Poor length'}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-xs sm:text-sm text-slate-600">
                Meta description is missing. This is important for search results.
              </div>
            )}
          </div>

          {/* Open Graph Tags */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(getOpenGraphStatus())}
                <span className="font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base">Open Graph Tags</span>
              </div>
              {getStatusBadge(getOpenGraphStatus())}
            </div>
            
            {data.openGraphTags ? (
              <div className="bg-slate-50 dark:bg-slate-800 p-2 sm:p-3 rounded text-xs sm:text-sm overflow-x-auto">
                <div className="font-mono text-slate-600 dark:text-slate-300 space-y-1 break-all">
                  {Object.entries(data.openGraphTags).map(([property, content]) => (
                    <div key={property} className="whitespace-nowrap">
                      &lt;meta property="{property}" content="{content.substring(0, 50)}{content.length > 50 ? '...' : ''}"&gt;
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Open Graph tags are missing. These are essential for social media sharing.
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-2 sm:p-3 rounded text-xs sm:text-sm overflow-x-auto">
                  <div className="text-slate-700 dark:text-slate-300 mb-1">Recommended tags:</div>
                  <div className="font-mono text-slate-600 dark:text-slate-300 space-y-1">
                    <div>&lt;meta property="og:title" content="..."&gt;</div>
                    <div>&lt;meta property="og:description" content="..."&gt;</div>
                    <div>&lt;meta property="og:image" content="..."&gt;</div>
                    <div>&lt;meta property="og:url" content="..."&gt;</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Twitter Cards */}
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(getTwitterStatus())}
                <span className="font-medium text-slate-900">Twitter Cards</span>
              </div>
              {getStatusBadge(getTwitterStatus())}
            </div>
            
            {data.twitterCardTags ? (
              <div className="bg-slate-50 p-3 rounded text-sm">
                <div className="font-mono text-slate-600 space-y-1">
                  {Object.entries(data.twitterCardTags).map(([name, content]) => (
                    <div key={name}>
                      &lt;meta name="{name}" content="{content.substring(0, 50)}{content.length > 50 ? '...' : ''}"&gt;
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="text-sm text-slate-600 mb-2">
                  Twitter Card tags are missing. These optimize how your content appears on Twitter.
                </div>
                <div className="bg-slate-50 p-3 rounded text-sm">
                  <div className="text-slate-700 mb-1">Recommended tags:</div>
                  <div className="font-mono text-slate-600 space-y-1">
                    <div>&lt;meta name="twitter:card" content="summary_large_image"&gt;</div>
                    <div>&lt;meta name="twitter:title" content="..."&gt;</div>
                    <div>&lt;meta name="twitter:description" content="..."&gt;</div>
                    <div>&lt;meta name="twitter:image" content="..."&gt;</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
