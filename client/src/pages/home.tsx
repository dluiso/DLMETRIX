import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bookmark, Search, Download, History, FileText, Trash2, Calendar, BarChart3, FileDown, Settings, Moon, Sun, Languages, Monitor, Smartphone, Globe } from "lucide-react";
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
import AiSearchAnalysisComponent from "@/components/ai-search-analysis";
import KeywordAnalysis from "@/components/keyword-analysis";
import Footer from "@/components/footer";
import HelpDialog from "@/components/help-dialog";
import { WebAnalysisResult } from "@/shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { exportToPDF } from "@/lib/pdf-export-complete";
import { getTranslations } from "@/lib/translations";

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
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [isLegalOpen, setIsLegalOpen] = useState(false);
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

  const t = getTranslations(language);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
        title: t.reportExported,
        description: t.pdfDownloaded,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t.exportFailed,
        description: t.tryAgain,
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
      title: t.csvExported,
      description: t.csvDescription,
    });
  };

  const handleCompareWith = (data: WebAnalysisResult) => {
    setCompareData(data);
    setCompareMode(true);
    setShowHistory(false);
    toast({
      title: t.comparisonEnabled,
      description: `${t.comparingWith} ${data.url}`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors relative">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-0 sm:h-16 gap-4 sm:gap-0">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 text-white p-2 rounded-lg flex-shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">{t.title}</h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden sm:block">{t.subtitle}</p>
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
                <span className="hidden sm:inline ml-2">{t.history}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">{t.settings}</span>
              </Button>
              <HelpDialog language={language} />
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
                  {isExporting ? t.generating : t.saveReport}
                </span>
                <span className="sm:hidden">
                  {isExporting ? "..." : t.saveReport.split(' ')[0]}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={seoData ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8" : ""}>
        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-6 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t.analysisSettings}</h3>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Theme and Language Settings */}
              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <div className="p-4 bg-white dark:bg-slate-700 rounded-lg border dark:border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {darkMode ? <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                      <span className="font-medium text-slate-900 dark:text-slate-100">{t.darkMode}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDarkMode(!darkMode)}
                      className="h-8 w-16 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500"
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-2' : '-translate-x-2'}`} />
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-700 rounded-lg border dark:border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Languages className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-slate-900 dark:text-slate-100">{t.language}</span>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-500 text-sm"
                    >
                      <option value="en">{t.english}</option>
                      <option value="es">{t.spanish}</option>
                    </select>
                  </div>
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
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t.analysisHistory}</h3>
                </div>
                {analysisHistory.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setAnalysisHistory([])}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {t.clearAll}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {analysisHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t.noAnalysisHistory}</p>
                  <p className="text-sm">{t.analyzeWebsite}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analysisHistory.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer transition-colors"
                      onClick={() => {
                        setSeoData(item);
                        setShowHistory(false);
                        toast({
                          title: t.analysisLoaded,
                          description: `${t.viewingResults} ${item.url}`,
                        });
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {item.url}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Just analyzed</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 dark:text-green-400">SEO: {item.seoScore}</span>
                            <span className="text-blue-600 dark:text-blue-400">Perf: {item.performanceScore}</span>
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

        {/* URL Input - Centered when no data, normal when data exists */}
        {!seoData ? (
          <div className="fixed inset-0 flex items-center justify-center">
            {/* Elegant Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
            
            {/* Performance Analytics Background Pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
              <svg width="100%" height="100%" viewBox="0 0 1000 1000" className="absolute inset-0">
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" className="text-slate-400 dark:text-slate-600" />
              </svg>
              
              {/* Floating Analytics Icons */}
              <div className="absolute top-1/4 left-1/4 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
                <BarChart3 className="w-8 h-8 text-blue-300 dark:text-blue-500" />
              </div>
              <div className="absolute top-1/3 right-1/4 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>
                <Monitor className="w-6 h-6 text-green-300 dark:text-green-500" />
              </div>
              <div className="absolute bottom-1/4 left-1/3 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>
                <Smartphone className="w-7 h-7 text-purple-300 dark:text-purple-500" />
              </div>
              <div className="absolute bottom-1/3 right-1/3 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.8s' }}>
                <Globe className="w-5 h-5 text-indigo-300 dark:text-indigo-500" />
              </div>
            </div>
            
            {/* Centered Content */}
            <div className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Hero Section */}
              <div className="text-center mb-8 animate-fade-in">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 text-white shadow-elegant">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
                  {t.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mx-auto">
                  {t.subtitle}
                </p>
              </div>
              
              {/* Centered URL Input */}
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <UrlInput onAnalyze={handleAnalyze} isLoading={analyzeMutation.isPending} language={language} currentUrl={seoData?.url} />
              </div>
              
              {/* Features List */}
              <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    <Monitor className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span className="font-medium">Desktop</span>
                  </div>
                  <span className="text-slate-400 dark:text-slate-600">|</span>
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span className="font-medium">Mobile</span>
                  </div>
                  <span className="text-slate-400 dark:text-slate-600">|</span>
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                    <span className="font-medium">Performance</span>
                  </div>
                  <span className="text-slate-400 dark:text-slate-600">|</span>
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500" />
                    <span className="font-medium">SEO</span>
                  </div>
                  <span className="text-slate-400 dark:text-slate-600">|</span>
                  <div className="flex items-center gap-1.5">
                    <Search className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                    <span className="font-medium">AI Search</span>
                  </div>
                  <span className="text-slate-400 dark:text-slate-600">|</span>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-pink-500" />
                    <span className="font-medium">Keywords</span>
                  </div>
                </div>
              </div>
              
              {/* Footer for centered layout */}
              <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center justify-center gap-1 flex-wrap text-sm text-slate-500 dark:text-slate-400">
                  <span>© 2025 Web Performance Analyzer. All rights reserved. Created by Luis Mena.</span>
                  <span className="mx-1">•</span>
                  <Dialog open={isLegalOpen} onOpenChange={setIsLegalOpen}>
                    <DialogTrigger asChild>
                      <button 
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
                        onClick={() => setIsLegalOpen(true)}
                      >
                        Legal Notice
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          Legal Notice
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                        <p>
                          All rights reserved to Luis Mena Hernandez.
                        </p>
                        <div className="space-y-2">
                          <p className="font-medium">Legal Address:</p>
                          <address className="not-italic text-slate-600 dark:text-slate-400">
                            461 N Lake<br />
                            Aurora, Illinois 60506<br />
                            United States
                          </address>
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium">Application Registration Number:</p>
                          <p className="text-slate-600 dark:text-slate-400 font-mono">
                            EU VAT: EU847629301
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <UrlInput onAnalyze={handleAnalyze} isLoading={analyzeMutation.isPending} language={language} currentUrl={seoData?.url} />
          </div>
        )}
        
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
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        {t.comparing}: {seoData.url} vs {compareData.url}
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
                      {t.exitComparison}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{seoData.url}</div>
                      <div className="flex space-x-4 mt-1">
                        <span className="text-blue-600 dark:text-blue-400">Perf: {seoData.performanceScore}</span>
                        <span className="text-green-600 dark:text-green-400">SEO: {seoData.seoScore}</span>
                        <span className="text-purple-600 dark:text-purple-400">A11y: {seoData.accessibilityScore}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{compareData.url}</div>
                      <div className="flex space-x-4 mt-1">
                        <span className="text-blue-600 dark:text-blue-400">Perf: {compareData.performanceScore}</span>
                        <span className="text-green-600 dark:text-green-400">SEO: {compareData.seoScore}</span>
                        <span className="text-purple-600 dark:text-purple-400">A11y: {compareData.accessibilityScore}</span>
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
              language={language}
            />

            {/* Core Web Vitals */}
            <CoreWebVitalsComponent data={seoData.coreWebVitals} language={language} />

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

              {/* AI Search Content Analysis */}
              {seoData.aiSearchAnalysis && (
                <AiSearchAnalysisComponent data={seoData.aiSearchAnalysis} />
              )}

              {/* SEO Keyword Analysis */}
              {seoData.keywordAnalysis && (
                <KeywordAnalysis data={seoData.keywordAnalysis} />
              )}

              {/* Technical Checks */}
              <TechnicalSeo checks={seoData.technicalChecks} />
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Loading Overlay */}
      {analyzeMutation.isPending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 sm:p-8 max-w-sm sm:max-w-md mx-auto w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mb-4"></div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{t.analyzingWebsite}</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
                {analysisProgress || (language === 'en' ? 'Running comprehensive web performance analysis...' : 'Ejecutando análisis integral de rendimiento web...')}
              </p>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-500 ease-out rounded-full animate-pulse"
                  style={{ width: '75%' }}
                />
              </div>
              <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div className="flex items-center justify-center space-x-2">
                  <Monitor className="w-3 h-3" />
                  <span>{t.desktopAnalysis}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Smartphone className="w-3 h-3" />
                  <span>{t.mobileAnalysis}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Globe className="w-3 h-3" />
                  <span>{t.seoAnalysis}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
