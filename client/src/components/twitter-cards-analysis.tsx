import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Check, AlertTriangle, X } from "lucide-react";
import { SeoAnalysisResult } from "@/types/seo";

interface TwitterCardsAnalysisProps {
  data: SeoAnalysisResult;
}

export default function TwitterCardsAnalysis({ data }: TwitterCardsAnalysisProps) {
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

  const getTwitterStatus = () => {
    if (!data.twitterCardTags) return 'error';
    const requiredTags = ['twitter:card', 'twitter:title', 'twitter:description'];
    const presentTags = Object.keys(data.twitterCardTags);
    const hasAllRequired = requiredTags.every(tag => presentTags.includes(tag));
    
    if (hasAllRequired) return 'good';
    if (presentTags.length > 0) return 'warning';
    return 'error';
  };

  const twitterTags = [
    { key: 'twitter:card', label: 'Card Type', description: 'The type of Twitter Card (summary, summary_large_image, etc.)' },
    { key: 'twitter:title', label: 'Title', description: 'The title to display in the Twitter Card' },
    { key: 'twitter:description', label: 'Description', description: 'A description for the Twitter Card' },
    { key: 'twitter:image', label: 'Image', description: 'The image to display in the Twitter Card' },
    { key: 'twitter:site', label: 'Site', description: 'The Twitter username of the website (e.g., @username)' },
    { key: 'twitter:creator', label: 'Creator', description: 'The Twitter username of the content creator' }
  ];

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-primary flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">Twitter Cards</h3>
          </div>
          {getStatusBadge(getTwitterStatus())}
        </div>
        
        <div className="space-y-3">
          {twitterTags.map((tag) => {
            const value = data.twitterCardTags?.[tag.key];
            const hasValue = !!value;
            
            return (
              <div key={tag.key} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(hasValue ? 'good' : 'error')}
                    <span className="font-medium text-slate-900 dark:text-white text-sm">{tag.label}</span>
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
          
          {data.twitterCardTags && Object.keys(data.twitterCardTags).length === 0 && (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
              <p className="text-sm">No Twitter Card tags found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}