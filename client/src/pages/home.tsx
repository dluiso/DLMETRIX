import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, HelpCircle, Search, Download, History, FileText, Trash2, Calendar, BarChart3, FileDown, Settings, Monitor, Smartphone, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UrlInput from "@/components/url-input";
import SeoScore from "@/components/seo-score";
import SeoSummaryCards from "@/components/seo-summary-cards";
import MetaTagAnalysis from "@/components/meta-tag-analysis";
import MetaDescriptionAnalysis from "@/components/meta-description-analysis";
import OpenGraphAnalysis from "@/components/open-graph-analysis";
import TwitterCardsAnalysis from "@/components/twitter-cards-analysis";
import VisualRecommendations from "@/components/visual-recommendations";
import PreviewTabs from "@/components/preview-tabs";
import TechnicalSeo from "@/components/technical-seo";
import CoreWebVitalsComponent from "@/components/core-web-vitals";
import PerformanceOverview from "@/components/performance-overview";
import ScreenshotsView from "@/components/screenshots-view";
import { WebAnalysisResult } from "@/types/seo";
import { apiRequest } from "@/lib/queryClient";
import { exportToPDF, exportVisualPDF } from "@/lib/pdf-export";

export default function Home() {
  const [seoData, setSeoData] = useState<WebAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<WebAnalysisResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareData, setCompareData] = useState<WebAnalysisResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (url: string): Promise<WebAnalysisResult> => {
      const response = await apiRequest("POST", "/api/web/analyze", { url });
      return response.json();
    },
    onSuccess: (data) => {
      setSeoData(data);
      setError(null);
      
      // Add to history (avoid duplicates)
      setAnalysisHistory(prev => {
        const existing = prev.find(item => item.url === data.url);
        if (existing) {
          // Update existing entry
          return prev.map(item => item.url === data.url ? data : item);
        } else {
          // Add new entry (keep only last 10)
          return [data, ...prev.slice(0, 9)];
        }
      });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : "Failed to analyze website");
      setSeoData(null);
    },
  });

  const handleAnalyze = async (url: string) => {
    setError(null);
    setAnalysisProgress('Initializing analysis...');
    
    // Simulate progress updates
    const progressSteps = [
      'Launching browser automation...',
      'Running Lighthouse analysis for mobile...',
      'Running Lighthouse analysis for desktop...',
      'Capturing mobile screenshot...',
      'Capturing desktop screenshot...',
      'Analyzing SEO metadata...',
      'Processing Core Web Vitals...',
      'Generating recommendations...',
      'Finalizing results...'
    ];
    
    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length - 1) {
        stepIndex++;
        setAnalysisProgress(progressSteps[stepIndex]);
      }
    }, 1000);

    analyzeMutation.mutate(url, {
      onSettled: () => {
        clearInterval(progressInterval);
        setAnalysisProgress('');
      }
    });
  };

  const handleExportPDF = async () => {
    if (!seoData) {
      toast({
        title: "No data to export",
        description: "Please analyze a website first to generate a report.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      // Try visual export first (with web component captures), fallback to standard PDF
      try {
        await exportVisualPDF(seoData);
      } catch (visualError) {
        console.warn('Visual export failed, using standard PDF:', visualError);
        await exportToPDF(seoData);
      }
      
      toast({
        title: "Report exported successfully",
        description: "Your PDF report has been downloaded.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!seoData) return;

    const csvData = [
      ['Metric', 'Value'],
      ['URL', seoData.url],
      ['Performance Score', seoData.performanceScore.toString()],
      ['Accessibility Score', seoData.accessibilityScore.toString()],
      ['Best Practices Score', seoData.bestPracticesScore.toString()],
      ['SEO Score', seoData.seoScore.toString()],
      ['Title', seoData.title || 'N/A'],
      ['Description', seoData.description || 'N/A'],
      ['Keywords', seoData.keywords || 'N/A'],
      ['Canonical URL', seoData.canonicalUrl || 'N/A'],
      ['Mobile LCP', seoData.coreWebVitals.mobile.lcp?.toString() || 'N/A'],
      ['Mobile FID', seoData.coreWebVitals.mobile.fid?.toString() || 'N/A'],
      ['Mobile CLS', seoData.coreWebVitals.mobile.cls?.toString() || 'N/A'],
      ['Desktop LCP', seoData.coreWebVitals.desktop.lcp?.toString() || 'N/A'],
      ['Desktop FID', seoData.coreWebVitals.desktop.fid?.toString() || 'N/A'],
      ['Desktop CLS', seoData.coreWebVitals.desktop.cls?.toString() || 'N/A'],
      ...seoData.recommendations.map((rec, i) => [`Recommendation ${i + 1}`, rec.title])
    ];

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `web-analysis-${new URL(seoData.url).hostname}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV exported!",
      description: "Analysis data has been exported to CSV format.",
    });
  };

  const handleCompareWith = (data: WebAnalysisResult) => {
    setCompareData(data);
    setCompareMode(true);
    setShowHistory(false);
    toast({
      title: "Comparison mode enabled",
      description: `Comparing current analysis with ${data.url}`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-0 sm:h-16 gap-4 sm:gap-0">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="bg-primary text-white p-2 rounded-lg flex-shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">Web Performance Analyzer</h1>
                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">Comprehensive website analysis with Core Web Vitals, SEO, and performance insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowHistory(!showHistory)}
                className="relative"
              >
                <History className="w-4 h-4" />
                {analysisHistory.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {analysisHistory.length}
                  </span>
                )}
                <span className="hidden sm:inline ml-2">History</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Settings</span>
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                <HelpCircle className="w-4 h-4" />
              </Button>
              {seoData && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={!seoData}
                >
                  <FileDown className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">CSV</span>
                </Button>
              )}
              <Button 
                className="bg-primary hover:bg-blue-700 text-sm"
                onClick={handleExportPDF}
                disabled={!seoData || isExporting}
              >
                {isExporting ? (
                  <Download className="w-4 h-4 mr-1 sm:mr-2 animate-spin" />
                ) : (
                  <Bookmark className="w-4 h-4 mr-1 sm:mr-2" />
                )}
                <span className="hidden sm:inline">
                  {isExporting ? "Generating..." : "Save Report"}
                </span>
                <span className="sm:hidden">
                  {isExporting ? "..." : "Save"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-6 bg-slate-50 border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Analysis Settings</h3>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 bg-white rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Desktop Analysis</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Full Lighthouse audit for desktop performance, accessibility, and SEO
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Smartphone className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Mobile Analysis</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Mobile-optimized performance testing with Core Web Vitals measurement
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">SEO Analysis</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Comprehensive meta tag analysis, social media optimization, and technical SEO
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-1">Analysis Features</h4>
                <div className="text-sm text-blue-700 grid gap-1">
                  <span>✓ Real-time Core Web Vitals measurement</span>
                  <span>✓ Mobile and desktop screenshot capture</span>
                  <span>✓ Comprehensive performance diagnostics</span>
                  <span>✓ SEO recommendations with fix instructions</span>
                  <span>✓ Social media optimization analysis</span>
                  <span>✓ PDF and CSV export capabilities</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis History Panel */}
        {showHistory && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Analysis History</h3>
                </div>
                {analysisHistory.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setAnalysisHistory([])}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {analysisHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No analysis history yet</p>
                  <p className="text-sm">Analyze a website to see it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analysisHistory.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                      onClick={() => {
                        setSeoData(item);
                        setShowHistory(false);
                        toast({
                          title: "Analysis loaded",
                          description: `Viewing results for ${item.url}`,
                        });
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">
                          {item.url}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Just analyzed</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600">SEO: {item.seoScore}</span>
                            <span className="text-blue-600">Perf: {item.performanceScore}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompareWith(item);
                          }}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            exportToPDF(item).catch(console.error);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAnalysisHistory(prev => prev.filter((_, i) => i !== index));
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <UrlInput onAnalyze={handleAnalyze} isLoading={analyzeMutation.isPending} />
        
        {error && (
          <Card className="p-4 sm:p-6 mb-6 sm:mb-8 border-red-200 bg-red-50">
            <div className="text-red-800">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Analysis Error</h3>
              <p className="text-xs sm:text-sm leading-relaxed">
                {error}
              </p>
            </div>
          </Card>
        )}

        {seoData && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Comparison Mode Banner */}
            {compareMode && compareData && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        Comparing: {seoData.url} vs {compareData.url}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setCompareMode(false);
                        setCompareData(null);
                      }}
                    >
                      Exit Comparison
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <div className="font-medium text-slate-900">{seoData.url}</div>
                      <div className="flex space-x-4 mt-1">
                        <span className="text-blue-600">Perf: {seoData.performanceScore}</span>
                        <span className="text-green-600">SEO: {seoData.seoScore}</span>
                        <span className="text-purple-600">A11y: {seoData.accessibilityScore}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{compareData.url}</div>
                      <div className="flex space-x-4 mt-1">
                        <span className="text-blue-600">Perf: {compareData.performanceScore}</span>
                        <span className="text-green-600">SEO: {compareData.seoScore}</span>
                        <span className="text-purple-600">A11y: {compareData.accessibilityScore}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Overview */}
            <PerformanceOverview 
              performanceScore={seoData.performanceScore}
              accessibilityScore={seoData.accessibilityScore}
              bestPracticesScore={seoData.bestPracticesScore}
              seoScore={seoData.seoScore}
            />

            {/* Core Web Vitals */}
            <CoreWebVitalsComponent data={seoData.coreWebVitals} />

            {/* Screenshots */}
            <ScreenshotsView 
              mobileScreenshot={seoData.mobileScreenshot}
              desktopScreenshot={seoData.desktopScreenshot}
              url={seoData.url}
            />

            {/* Legacy SEO Analysis */}
            <div className="grid gap-4 sm:gap-6">
              {/* Preview Tabs */}
              <PreviewTabs data={seoData} />

              {/* Meta Tags Analysis */}
              <MetaTagAnalysis data={seoData} />

              {/* Meta Description Analysis */}
              <MetaDescriptionAnalysis data={seoData} />

              {/* Open Graph and Twitter Cards */}
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <OpenGraphAnalysis data={seoData} />
                <TwitterCardsAnalysis data={seoData} />
              </div>

              {/* Visual Recommendations */}
              <VisualRecommendations recommendations={seoData.recommendations} />

              {/* Technical Checks */}
              <TechnicalSeo checks={seoData.technicalChecks} />
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Loading Overlay */}
      {analyzeMutation.isPending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 sm:p-8 max-w-sm sm:max-w-md mx-auto w-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mb-4"></div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">Analyzing Website</h3>
              <p className="text-sm sm:text-base text-slate-600 mb-4">
                {analysisProgress || 'Running comprehensive web performance analysis...'}
              </p>
              <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-500 ease-out rounded-full animate-pulse"
                  style={{ width: '75%' }}
                />
              </div>
              <div className="mt-3 text-xs text-slate-500 space-y-1">
                <div className="flex items-center justify-center space-x-2">
                  <Monitor className="w-3 h-3" />
                  <span>Desktop Analysis</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile Analysis</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Globe className="w-3 h-3" />
                  <span>SEO Analysis</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
