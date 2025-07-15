import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Clock, Zap, TrendingUp } from "lucide-react";
import { CoreWebVitals } from "@/types/seo";

interface CoreWebVitalsProps {
  data: CoreWebVitals;
}

export default function CoreWebVitalsComponent({ data }: CoreWebVitalsProps) {
  // Check if we have any real Core Web Vitals data
  const hasRealData = data.mobile.lcp !== null || data.mobile.fid !== null || 
                     data.desktop.lcp !== null || data.desktop.fid !== null;

  const formatTime = (value: number | null) => {
    if (value === null) return 'N/A';
    if (value < 1000) return `${Math.round(value)}ms`;
    return `${(value / 1000).toFixed(2)}s`;
  };

  const formatCLS = (value: number | null) => {
    if (value === null) return 'N/A';
    return value.toFixed(3);
  };

  const getScoreColor = (metric: string, value: number | null) => {
    if (value === null) return 'text-gray-500 dark:text-gray-400';
    
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'text-gray-500 dark:text-gray-400';

    if (value <= threshold.good) return 'text-green-600 dark:text-green-400';
    if (value <= threshold.poor) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getBadgeVariant = (metric: string, value: number | null) => {
    if (value === null) return 'secondary';
    
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'secondary';

    if (value <= threshold.good) return 'default';
    if (value <= threshold.poor) return 'secondary';
    return 'destructive';
  };

  const vitalsConfig = [
    {
      key: 'lcp',
      title: 'Largest Contentful Paint',
      description: 'Time until the largest content element is rendered',
      icon: <TrendingUp className="w-5 h-5" />,
      format: formatTime
    },
    {
      key: 'fid',
      title: 'First Input Delay',
      description: 'Time from first user interaction to browser response',
      icon: <Zap className="w-5 h-5" />,
      format: formatTime
    },
    {
      key: 'cls',
      title: 'Cumulative Layout Shift',
      description: 'Visual stability as page loads',
      icon: <Activity className="w-5 h-5" />,
      format: formatCLS
    },
    {
      key: 'fcp',
      title: 'First Contentful Paint',
      description: 'Time until first content appears',
      icon: <Clock className="w-5 h-5" />,
      format: formatTime
    },
    {
      key: 'ttfb',
      title: 'Time to First Byte',
      description: 'Server response time',
      icon: <Clock className="w-5 h-5" />,
      format: formatTime
    }
  ];

  return (
    <Card data-component="core-web-vitals" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary" />
          <CardTitle className="text-base sm:text-lg text-slate-900 dark:text-slate-100">Core Web Vitals</CardTitle>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
          Essential metrics for user experience and search ranking
        </p>
      </CardHeader>
      <CardContent>
        {!hasRealData && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-100">Core Web Vitals Not Available</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Real Core Web Vitals measurements require running performance tests with Google Lighthouse. 
                  The current analysis provides SEO and technical insights only.
                </p>
              </div>
            </div>
          </div>
        )}
        <Tabs defaultValue="mobile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
            <TabsTrigger value="mobile" className="text-xs sm:text-sm px-2 py-2">Mobile</TabsTrigger>
            <TabsTrigger value="desktop" className="text-xs sm:text-sm px-2 py-2">Desktop</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mobile" className="space-y-3 sm:space-y-4">
            <div className="grid gap-3 sm:gap-4">
              {vitalsConfig.map((vital) => {
                const value = data.mobile[vital.key as keyof typeof data.mobile];
                return (
                  <div key={vital.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="text-slate-600 dark:text-slate-400">
                        {vital.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">{vital.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{vital.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${getScoreColor(vital.key, value)}`}>
                        {vital.format(value)}
                      </div>
                      <Badge variant={getBadgeVariant(vital.key, value)} className="text-xs">
                        {value === null ? 'N/A' : 
                         value <= (vital.key === 'cls' ? 0.1 : vital.key === 'lcp' ? 2500 : vital.key === 'fid' ? 100 : vital.key === 'fcp' ? 1800 : 800) ? 'Good' :
                         value <= (vital.key === 'cls' ? 0.25 : vital.key === 'lcp' ? 4000 : vital.key === 'fid' ? 300 : vital.key === 'fcp' ? 3000 : 1800) ? 'Needs Improvement' : 'Poor'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="desktop" className="space-y-4">
            <div className="grid gap-4">
              {vitalsConfig.map((vital) => {
                const value = data.desktop[vital.key as keyof typeof data.desktop];
                return (
                  <div key={vital.key} className="flex items-center justify-between p-4 border dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                    <div className="flex items-center space-x-3">
                      <div className="text-slate-600 dark:text-slate-400">
                        {vital.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">{vital.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{vital.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${getScoreColor(vital.key, value)}`}>
                        {vital.format(value)}
                      </div>
                      <Badge variant={getBadgeVariant(vital.key, value)} className="text-xs">
                        {value === null ? 'N/A' : 
                         value <= (vital.key === 'cls' ? 0.1 : vital.key === 'lcp' ? 2500 : vital.key === 'fid' ? 100 : vital.key === 'fcp' ? 1800 : 800) ? 'Good' :
                         value <= (vital.key === 'cls' ? 0.25 : vital.key === 'lcp' ? 4000 : vital.key === 'fid' ? 300 : vital.key === 'fcp' ? 3000 : 1800) ? 'Needs Improvement' : 'Poor'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}