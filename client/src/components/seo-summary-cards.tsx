import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Share2, 
  MessageSquare, 
  Settings, 
  Check, 
  AlertTriangle, 
  X,
  TrendingUp
} from "lucide-react";
import { SeoAnalysisResult } from "@/types/seo";

interface SeoSummaryCardsProps {
  data: SeoAnalysisResult;
}

export default function SeoSummaryCards({ data }: SeoSummaryCardsProps) {
  // Calculate meta tags summary
  const getMetaTagsSummary = () => {
    let score = 0;
    let total = 3;
    
    if (data.title) score++;
    if (data.description && data.description.length >= 120 && data.description.length <= 200) score++;
    if (data.keywords) score++;
    
    return { score, total, percentage: Math.round((score / total) * 100) };
  };

  // Calculate Open Graph summary
  const getOpenGraphSummary = () => {
    if (!data.openGraphTags) return { score: 0, total: 4, percentage: 0 };
    
    const requiredTags = ['og:title', 'og:description', 'og:image', 'og:url'];
    const presentTags = Object.keys(data.openGraphTags);
    const score = requiredTags.filter(tag => presentTags.includes(tag)).length;
    
    return { score, total: 4, percentage: Math.round((score / 4) * 100) };
  };

  // Calculate X Cards summary
  const getTwitterSummary = () => {
    if (!data.twitterCardTags) return { score: 0, total: 3, percentage: 0 };
    
    const requiredTags = ['twitter:card', 'twitter:title', 'twitter:description'];
    const presentTags = Object.keys(data.twitterCardTags);
    const score = requiredTags.filter(tag => presentTags.includes(tag)).length;
    
    return { score, total: 3, percentage: Math.round((score / 3) * 100) };
  };

  // Calculate Technical SEO summary
  const getTechnicalSummary = () => {
    const checks = Object.values(data.technicalSeoChecks || {});
    const score = checks.filter(Boolean).length;
    const total = checks.length || 1;
    
    return { score, total, percentage: Math.round((score / total) * 100) };
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-400', icon: Check };
    if (percentage >= 50) return { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-400', icon: AlertTriangle };
    return { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-400', icon: X };
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 50) return 'Good';
    return 'Needs Work';
  };

  const summaryCards = [
    {
      title: 'Meta Tags',
      icon: FileText,
      summary: getMetaTagsSummary(),
      description: 'Title, description, and keywords'
    },
    {
      title: 'Open Graph',
      icon: Share2,
      summary: getOpenGraphSummary(),
      description: 'Facebook sharing optimization'
    },
    {
      title: 'X Cards',
      icon: MessageSquare,
      summary: getTwitterSummary(),
      description: 'X sharing optimization'
    },
    {
      title: 'Technical SEO',
      icon: Settings,
      summary: getTechnicalSummary(),
      description: 'Robots, sitemap, and schema'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {summaryCards.map((card) => {
        const statusColor = getStatusColor(card.summary.percentage);
        const StatusIcon = statusColor.icon;
        const CardIcon = card.icon;
        
        return (
          <Card key={card.title} className="relative overflow-hidden">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <CardIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <StatusIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${statusColor.text}`} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    {card.title}
                  </h3>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {card.summary.score}/{card.summary.total}
                  </span>
                </div>
                
                <Progress 
                  value={card.summary.percentage} 
                  className="h-1.5 sm:h-2"
                />
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor.bg} ${statusColor.text}`}>
                    {getStatusText(card.summary.percentage)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {card.summary.percentage}%
                  </span>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}