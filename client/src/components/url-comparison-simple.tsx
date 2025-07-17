import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getText } from '@/lib/production-translations';

interface ComparisonData {
  previous: {
    performanceScore: number;
    accessibilityScore: number;
    bestPracticesScore: number;
    seoScore: number;
    coreWebVitals: any;
  };
  current: {
    performanceScore: number;
    accessibilityScore: number;
    bestPracticesScore: number;
    seoScore: number;
    coreWebVitals: any;
  };
  improvements: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  summary: {
    totalImprovements: number;
    totalRegressions: number;
    overallTrend: 'improved' | 'declined' | 'unchanged';
  };
}

interface URLComparisonProps {
  analysisData: any;
  language?: 'en' | 'es';
}

export function URLComparison({ analysisData, language = 'en' }: URLComparisonProps) {
  const [showComparison, setShowComparison] = useState(false);
  
  // Use production translation system

  const { data: comparisonHistory } = useQuery({
    queryKey: ['/api/comparison/history', analysisData?.url],
    enabled: !!analysisData?.url
  });

  const { data: comparisonSummary } = useQuery({
    queryKey: ['/api/comparison/summary', analysisData?.url],
    enabled: !!analysisData?.url
  });

  // Check if we have comparison data from the analysis
  const hasComparison = analysisData?.comparison || (comparisonHistory && comparisonHistory.length > 1);

  if (!hasComparison) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {getText('urlComparison', language)}
          </CardTitle>
          <CardDescription>{getText('noComparisonData', language)}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const comparison: ComparisonData = analysisData?.comparison;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {getText('urlComparison', language)}
        </CardTitle>
        <CardDescription>{getText('comparisonDescription', language)}</CardDescription>
      </CardHeader>
      
      <CardContent>
        {comparisonSummary && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{getText('analysisHistory', language)}</span>
              <Badge variant="outline">
                {comparisonSummary.totalAnalyses} {getText('analyses', language)}
              </Badge>
            </div>
            
            {comparisonSummary.lastAnalyzed && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {getText('lastAnalyzed', language)}: {new Date(comparisonSummary.lastAnalyzed).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        <Button 
          variant="outline" 
          onClick={() => setShowComparison(!showComparison)}
          className="mb-4"
        >
          {showComparison ? getText('hideComparison', language) : getText('showComparison', language)}
        </Button>

        {showComparison && comparison && (
          <div className="space-y-6">
            {/* Overall Trend */}
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {comparison.summary.overallTrend === 'improved' && (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                )}
                {comparison.summary.overallTrend === 'declined' && (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
                {comparison.summary.overallTrend === 'unchanged' && (
                  <Minus className="h-5 w-5 text-gray-500" />
                )}
                <span className="font-medium">
                  {comparison.summary.overallTrend}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  {comparison.summary.totalImprovements} {getText('improvements', language)}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  {comparison.summary.totalRegressions} {getText('regressions', language)}
                </span>
              </div>
            </div>

            {/* Score Changes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(comparison.improvements).map(([metric, change]) => (
                <div key={metric} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{getText(metric)}</span>
                    <div className="flex items-center gap-1">
                      {change > 0 && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {change < 0 && <TrendingDown className="h-4 w-4 text-red-500" />}
                      {change === 0 && <Minus className="h-4 w-4 text-gray-500" />}
                    </div>
                  </div>
                  
                  <div className="text-lg font-semibold">
                    {change > 0 ? '+' : ''}{change}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {comparison.previous[`${metric}Score`] || 0} → {comparison.current[`${metric}Score`] || 0}
                  </div>
                </div>
              ))}
            </div>

            {/* Core Web Vitals Changes */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                {getText('coreWebVitalsChanges', language)}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['mobile', 'desktop'].map(device => (
                  <div key={device} className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-3 capitalize">{device}</h5>
                    
                    <div className="space-y-2">
                      {comparison.current.coreWebVitals?.[device] && Object.entries(comparison.current.coreWebVitals[device]).map(([metric, currentValue]) => {
                        const previousValue = comparison.previous.coreWebVitals?.[device]?.[metric];
                        const change = currentValue - previousValue;
                        
                        return (
                          <div key={metric} className="flex items-center justify-between text-sm">
                            <span className="uppercase">{metric}</span>
                            <div className="flex items-center gap-2">
                              {change > 0 && <TrendingUp className="h-3 w-3 text-green-500" />}
                              {change < 0 && <TrendingDown className="h-3 w-3 text-red-500" />}
                              {change === 0 && <Minus className="h-3 w-3 text-gray-500" />}
                              <span>{previousValue || 0} → {currentValue || 0}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}