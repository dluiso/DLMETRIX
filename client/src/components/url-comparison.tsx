import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

interface ComparisonData {
  url: string;
  previous: any;
  current: any;
  improvements: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  coreWebVitalsChanges: any;
  summary: {
    totalImprovements: number;
    totalRegressions: number;
    overallTrend: 'improved' | 'declined' | 'unchanged';
  };
}

interface URLComparisonProps {
  analysisData: any;
}

export function URLComparison({ analysisData }: URLComparisonProps) {
  const { t } = useTranslation();
  const [showComparison, setShowComparison] = useState(false);

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
            {t('urlComparison')}
          </CardTitle>
          <CardDescription>{t('noComparisonData')}</CardDescription>
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
          {t('urlComparison')}
        </CardTitle>
        <CardDescription>{t('comparisonDescription')}</CardDescription>
      </CardHeader>
      
      <CardContent>
        {comparisonSummary && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('analysisHistory')}</span>
              <Badge variant="outline">
                {comparisonSummary.totalAnalyses} {t('analyses')}
              </Badge>
            </div>
            
            {comparisonSummary.lastAnalyzed && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {t('lastAnalyzed')}: {new Date(comparisonSummary.lastAnalyzed).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        <Button 
          variant="outline" 
          onClick={() => setShowComparison(!showComparison)}
          className="mb-4"
        >
          {showComparison ? t('hideComparison') : t('showComparison')}
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
                  {t(`trend.${comparison.summary.overallTrend}`)}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  {comparison.summary.totalImprovements} {t('improvements')}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  {comparison.summary.totalRegressions} {t('regressions')}
                </span>
              </div>
            </div>

            {/* Score Changes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(comparison.improvements).map(([metric, change]) => (
                <div key={metric} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{t(metric)}</span>
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
                {t('coreWebVitalsChanges')}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['mobile', 'desktop'].map(device => (
                  <div key={device} className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-3 capitalize">{device}</h5>
                    
                    <div className="space-y-2">
                      {Object.entries(comparison.coreWebVitalsChanges[device]).map(([metric, data]: [string, any]) => (
                        <div key={metric} className="flex items-center justify-between text-sm">
                          <span className="uppercase">{metric}</span>
                          <div className="flex items-center gap-2">
                            {data.change !== null && (
                              <>
                                {data.change > 0 && <TrendingUp className="h-3 w-3 text-red-500" />}
                                {data.change < 0 && <TrendingDown className="h-3 w-3 text-green-500" />}
                                {data.change === 0 && <Minus className="h-3 w-3 text-gray-500" />}
                                <span className={`font-mono ${data.change > 0 ? 'text-red-500' : data.change < 0 ? 'text-green-500' : 'text-gray-500'}`}>
                                  {data.change > 0 ? '+' : ''}{data.change?.toFixed(0)}ms
                                </span>
                              </>
                            )}
                            {data.change === null && (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </div>
                        </div>
                      ))}
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