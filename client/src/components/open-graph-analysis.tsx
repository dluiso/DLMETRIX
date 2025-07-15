import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, Check, AlertTriangle, X } from "lucide-react";
import { SeoAnalysisResult } from "@/types/seo";

interface OpenGraphAnalysisProps {
  data: SeoAnalysisResult;
}

export default function OpenGraphAnalysis({ data }: OpenGraphAnalysisProps) {
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
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 hover:bg-yellow-100">PARTIAL</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100">MISSING</Badge>;
    }
  };

  const getOpenGraphStatus = () => {
    if (!data.openGraphTags) return 'error';
    const requiredTags = ['og:title', 'og:description', 'og:image', 'og:url'];
    const presentTags = Object.keys(data.openGraphTags);
    const hasAllRequired = requiredTags.every(tag => presentTags.includes(tag));
    if (hasAllRequired) return 'good';
    if (presentTags.length > 0) return 'warning';
    return 'error';
  };

  const requiredTags = [
    { key: 'og:title', label: 'Title', description: 'The title of your page' },
    { key: 'og:description', label: 'Description', description: 'A brief description of your page' },
    { key: 'og:image', label: 'Image', description: 'The image to display when shared' },
    { key: 'og:url', label: 'URL', description: 'The canonical URL of your page' },
    { key: 'og:type', label: 'Type', description: 'The type of object (e.g., website, article)' },
    { key: 'og:site_name', label: 'Site Name', description: 'The name of your website' }
  ];

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-primary flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">Open Graph Tags</h3>
          </div>
          {getStatusBadge(getOpenGraphStatus())}
        </div>
        
        <div className="space-y-3">
          {requiredTags.map((tag) => {
            const value = data.openGraphTags?.[tag.key];
            const hasValue = !!value;
            
            return (
              <div key={tag.key} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(hasValue ? 'good' : 'error')}
                    <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">{tag.label}</span>
                  </div>
                  <code className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {tag.key}
                  </code>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{tag.description}</p>
                
                {value ? (
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-xs text-slate-700 dark:text-slate-300 break-words">
                    {value}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 dark:text-slate-400 italic">Not specified</div>
                )}
              </div>
            );
          })}
          
          {data.openGraphTags && Object.keys(data.openGraphTags).length === 0 && (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
              <p className="text-sm">No Open Graph tags found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}