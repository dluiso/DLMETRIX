import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Clock, Zap, TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { CoreWebVitals } from "@/types/seo";
import { getTranslations } from "@/lib/translations";
import { formatTime, isSlowTime } from "@/lib/time-utils";

interface CoreWebVitalsProps {
  data: CoreWebVitals;
  language?: 'en' | 'es';
}

export default function CoreWebVitalsComponent({ data, language = 'en' }: CoreWebVitalsProps) {
  const t = getTranslations(language);
  // Check if we have any real Core Web Vitals data
  const hasRealData = data.mobile.lcp !== null || data.mobile.fid !== null || 
                     data.desktop.lcp !== null || data.desktop.fid !== null;

  const formatTimeValue = (value: number | null) => {
    if (value === null) return { formatted: 'N/A', cssClass: '' };
    
    // Apply DLMETRIX time formatting logic
    if (value < 1000) {
      return { formatted: `${Math.round(value)}ms`, cssClass: '' };
    }
    
    const seconds = (value / 1000).toFixed(1);
    const cssClass = value >= 10000 ? 'slow-load' : '';
    
    return { formatted: `${seconds}s`, cssClass };
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
      format: formatTimeValue,
      suggestions: {
        poor: 'Optimize images, reduce render-blocking resources, improve server response times, use CDN',
        needsImprovement: 'Compress images, preload critical resources, minimize unused CSS/JS'
      }
    },
    {
      key: 'fid',
      title: 'First Input Delay',
      description: 'Time from first user interaction to browser response',
      icon: <Zap className="w-5 h-5" />,
      format: formatTimeValue,
      suggestions: {
        poor: 'Reduce JavaScript execution time, split long tasks, use web workers, defer non-critical scripts',
        needsImprovement: 'Optimize JavaScript, remove unused code, use code splitting'
      }
    },
    {
      key: 'cls',
      title: 'Cumulative Layout Shift',
      description: 'Visual stability as page loads',
      icon: <Activity className="w-5 h-5" />,
      format: formatCLS,
      suggestions: {
        poor: 'Set size attributes for images/videos, reserve space for ads, avoid dynamic content insertion',
        needsImprovement: 'Use aspect-ratio CSS, preload fonts, optimize web fonts loading'
      }
    },
    {
      key: 'fcp',
      title: 'First Contentful Paint',
      description: 'Time until first content appears',
      icon: <Clock className="w-5 h-5" />,
      format: formatTimeValue,
      suggestions: {
        poor: 'Eliminate render-blocking resources, minify CSS, optimize server response, use HTTP/2',
        needsImprovement: 'Inline critical CSS, defer non-critical resources, optimize fonts'
      }
    },
    {
      key: 'ttfb',
      title: 'Time to First Byte',
      description: 'Server response time',
      icon: <Clock className="w-5 h-5" />,
      format: formatTimeValue,
      suggestions: {
        poor: 'Upgrade hosting, use CDN, optimize database queries, enable server-side caching',
        needsImprovement: 'Optimize server configuration, use compression, reduce server load'
      }
    }
  ];

  // Calculate average score for device
  const calculateAverageScore = (deviceData: any) => {
    const scores: number[] = [];
    
    vitalsConfig.forEach(vital => {
      const value = deviceData[vital.key];
      if (value !== null) {
        const thresholds = {
          lcp: { good: 2500, poor: 4000 },
          fid: { good: 100, poor: 300 },
          cls: { good: 0.1, poor: 0.25 },
          fcp: { good: 1800, poor: 3000 },
          ttfb: { good: 800, poor: 1800 }
        };
        
        const threshold = thresholds[vital.key as keyof typeof thresholds];
        if (threshold) {
          if (value <= threshold.good) scores.push(100);
          else if (value <= threshold.poor) scores.push(60);
          else scores.push(20);
        }
      }
    });
    
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  // Get problems and suggestions with specific elements for device
  const getProblemsAndSuggestions = (deviceData: any, device: 'mobile' | 'desktop') => {
    const problems: Array<{metric: string, title: string, status: string, suggestion: string, specificElements: string[]}> = [];
    
    vitalsConfig.forEach(vital => {
      const value = deviceData[vital.key];
      if (value !== null) {
        const thresholds = {
          lcp: { good: 2500, poor: 4000 },
          fid: { good: 100, poor: 300 },
          cls: { good: 0.1, poor: 0.25 },
          fcp: { good: 1800, poor: 3000 },
          ttfb: { good: 800, poor: 1800 }
        };
        
        const threshold = thresholds[vital.key as keyof typeof thresholds];
        if (threshold) {
          let status = 'good';
          let suggestion = '';
          let specificElements: string[] = [];
          
          if (value > threshold.poor) {
            status = 'poor';
            suggestion = vital.suggestions.poor;
            specificElements = getSpecificElements(vital.key, 'poor', device);
          } else if (value > threshold.good) {
            status = 'needsImprovement';
            suggestion = vital.suggestions.needsImprovement;
            specificElements = getSpecificElements(vital.key, 'needsImprovement', device);
          }
          
          if (status !== 'good') {
            problems.push({
              metric: vital.key,
              title: vital.title,
              status: status === 'poor' ? 'Poor' : 'Needs Improvement',
              suggestion,
              specificElements
            });
          }
        }
      }
    });
    
    return problems;
  };

  // Get specific elements causing issues
  const getSpecificElements = (metric: string, severity: string, device: 'mobile' | 'desktop'): string[] => {
    const elementsByMetric = {
      lcp: {
        poor: [
          'Large unoptimized images (hero images, banners)',
          'Render-blocking CSS files in <head>',
          'Large JavaScript bundles blocking rendering',
          'Slow server response (>600ms TTFB)',
          'Third-party scripts (ads, analytics)',
          'Web fonts without font-display: swap'
        ],
        needsImprovement: [
          'Images without responsive sizing',
          'Unused CSS rules',
          'Non-critical JavaScript in <head>',
          'Missing resource hints (preload, prefetch)'
        ]
      },
      fid: {
        poor: [
          'Heavy JavaScript execution blocking main thread',
          'Large DOM manipulation scripts',
          'Synchronous third-party scripts',
          'Event handlers on document/window',
          'Long-running functions (>50ms)',
          'Unoptimized React/Vue components'
        ],
        needsImprovement: [
          'Non-essential JavaScript bundles',
          'Excessive event listeners',
          'Large framework libraries',
          'Heavy CSS animations'
        ]
      },
      cls: {
        poor: [
          'Images without width/height attributes',
          'Dynamic content insertion (ads, embeds)',
          'Web fonts causing FOIT/FOUT',
          'Elements without reserved space',
          'JavaScript-injected content',
          'CSS animations affecting layout'
        ],
        needsImprovement: [
          'Missing aspect-ratio CSS properties',
          'Late-loading web fonts',
          'Responsive images without sizes',
          'Dynamic height containers'
        ]
      },
      fcp: {
        poor: [
          'Render-blocking CSS files',
          'Large JavaScript bundles',
          'Slow server response times',
          'Multiple DNS lookups',
          'Unoptimized critical rendering path',
          'Missing HTTP/2 or HTTP/3'
        ],
        needsImprovement: [
          'Non-inlined critical CSS',
          'Large CSS files',
          'Unoptimized web fonts',
          'Missing resource prioritization'
        ]
      },
      ttfb: {
        poor: [
          'Slow hosting server/provider',
          'Database queries without optimization',
          'Missing server-side caching',
          'No CDN implementation',
          'Heavy server-side processing',
          'Poor database indexes'
        ],
        needsImprovement: [
          'Suboptimal server configuration',
          'Missing compression (gzip/brotli)',
          'Heavy application logic',
          'Inefficient hosting plan'
        ]
      }
    };

    return elementsByMetric[metric as keyof typeof elementsByMetric]?.[severity as keyof typeof elementsByMetric[metric]] || [];
  };

  return (
    <Card data-component="core-web-vitals" className="shadow-elegant bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary" />
          <CardTitle className="text-base sm:text-lg text-slate-900 dark:text-slate-100">{t.coreWebVitals}</CardTitle>
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
            <TabsTrigger value="mobile" className="text-xs sm:text-sm px-2 py-2">{t.mobile}</TabsTrigger>
            <TabsTrigger value="desktop" className="text-xs sm:text-sm px-2 py-2">{t.desktop}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mobile" className="space-y-3 sm:space-y-4">
            {/* Average Score Section */}
            {hasRealData && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">{t.mobile} {t.averageScore}</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{t.basedOnMetrics}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      calculateAverageScore(data.mobile) === null ? 'text-gray-500' :
                      calculateAverageScore(data.mobile)! >= 80 ? 'text-green-600 dark:text-green-400' :
                      calculateAverageScore(data.mobile)! >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {calculateAverageScore(data.mobile) === null ? 'N/A' : `${calculateAverageScore(data.mobile)}/100`}
                    </div>
                    <Badge variant={
                      calculateAverageScore(data.mobile) === null ? 'secondary' :
                      calculateAverageScore(data.mobile)! >= 80 ? 'default' :
                      calculateAverageScore(data.mobile)! >= 60 ? 'secondary' : 'destructive'
                    } className="text-xs">
                      {calculateAverageScore(data.mobile) === null ? 'N/A' :
                       calculateAverageScore(data.mobile)! >= 80 ? t.excellent :
                       calculateAverageScore(data.mobile)! >= 60 ? t.good : t.needsWork}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:gap-4">
              {vitalsConfig.map((vital) => {
                const value = data.mobile[vital.key as keyof typeof data.mobile];
                const formattedValue = vital.format(value);
                const displayValue = typeof formattedValue === 'object' ? formattedValue.formatted : formattedValue;
                const slowLoadClass = typeof formattedValue === 'object' ? formattedValue.cssClass || '' : '';
                
                return (
                  <div key={vital.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 gap-2 hover:shadow-md transition-all duration-200">
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
                      <div className={`text-lg font-semibold ${getScoreColor(vital.key, value)} ${slowLoadClass}`}>
                        {displayValue}
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

            {/* Problems and Suggestions Section */}
            {hasRealData && getProblemsAndSuggestions(data.mobile, 'mobile').length > 0 && (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start space-x-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900 dark:text-amber-100">{t.issuesFound}</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">{t.mobile} {t.performanceAreas}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {getProblemsAndSuggestions(data.mobile, 'mobile').map((problem, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{problem.title}</span>
                        <Badge variant={problem.status === 'Poor' ? 'destructive' : 'secondary'} className="text-xs">
                          {problem.status}
                        </Badge>
                      </div>
                      
                      {/* General Recommendation */}
                      <div className="flex items-start space-x-2 mb-3">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">{problem.suggestion}</p>
                      </div>
                      
                      {/* Specific Elements */}
                      {problem.specificElements.length > 0 && (
                        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Specific elements causing issues:</h5>
                          <ul className="space-y-1">
                            {problem.specificElements.map((element, idx) => (
                              <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start space-x-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>{element}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="desktop" className="space-y-4">
            {/* Average Score Section */}
            {hasRealData && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <h4 className="font-medium text-green-900 dark:text-green-100">{t.desktop} {t.averageScore}</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">{t.basedOnMetrics}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      calculateAverageScore(data.desktop) === null ? 'text-gray-500' :
                      calculateAverageScore(data.desktop)! >= 80 ? 'text-green-600 dark:text-green-400' :
                      calculateAverageScore(data.desktop)! >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {calculateAverageScore(data.desktop) === null ? 'N/A' : `${calculateAverageScore(data.desktop)}/100`}
                    </div>
                    <Badge variant={
                      calculateAverageScore(data.desktop) === null ? 'secondary' :
                      calculateAverageScore(data.desktop)! >= 80 ? 'default' :
                      calculateAverageScore(data.desktop)! >= 60 ? 'secondary' : 'destructive'
                    } className="text-xs">
                      {calculateAverageScore(data.desktop) === null ? 'N/A' :
                       calculateAverageScore(data.desktop)! >= 80 ? t.excellent :
                       calculateAverageScore(data.desktop)! >= 60 ? t.good : t.needsWork}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {vitalsConfig.map((vital) => {
                const value = data.desktop[vital.key as keyof typeof data.desktop];
                const formattedValue = vital.format(value);
                const displayValue = typeof formattedValue === 'object' ? formattedValue.formatted : formattedValue;
                const slowLoadClass = typeof formattedValue === 'object' ? formattedValue.cssClass || '' : '';
                
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
                      <div className={`text-lg font-semibold ${getScoreColor(vital.key, value)} ${slowLoadClass}`}>
                        {displayValue}
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

            {/* Problems and Suggestions Section */}
            {hasRealData && getProblemsAndSuggestions(data.desktop, 'desktop').length > 0 && (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start space-x-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900 dark:text-amber-100">{t.issuesFound}</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">{t.desktop} {t.performanceAreas}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {getProblemsAndSuggestions(data.desktop, 'desktop').map((problem, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{problem.title}</span>
                        <Badge variant={problem.status === 'Poor' ? 'destructive' : 'secondary'} className="text-xs">
                          {problem.status}
                        </Badge>
                      </div>
                      
                      {/* General Recommendation */}
                      <div className="flex items-start space-x-2 mb-3">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">{problem.suggestion}</p>
                      </div>
                      
                      {/* Specific Elements */}
                      {problem.specificElements.length > 0 && (
                        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Specific elements causing issues:</h5>
                          <ul className="space-y-1">
                            {problem.specificElements.map((element, idx) => (
                              <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start space-x-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>{element}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}