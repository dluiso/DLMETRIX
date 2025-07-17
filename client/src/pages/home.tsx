import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bookmark, Search, Download, History, FileText, Trash2, Calendar, BarChart3, FileDown, Settings, Moon, Sun, Languages, Monitor, Smartphone, Globe, Menu, X, Info, HelpCircle, Coffee, Share2, Link, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UrlInput from "@/components/url-input";
import SeoScore from "@/components/seo-score";
import SeoSummaryCards from "@/components/seo-summary-cards";
import MetaTagAnalysis from "@/components/meta-tag-analysis";
import HeadingStructureAnalysis from "@/components/heading-structure-analysis";
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
import { WaterfallAnalysis } from "@/components/waterfall-analysis";
import Footer from "@/components/footer";
import { trackEvent } from "@/lib/analytics";
import HelpDialog from "@/components/help-dialog";
import WhyDlmetrixDialog from "@/components/why-dlmetrix-dialog";
import SupportDialog from "@/components/support-dialog";
import ContactDialog from "@/components/contact-dialog";
import { WebAnalysisResult } from "@/shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { exportToPDF } from "@/lib/pdf-export-complete";
import { getTranslations } from "@/lib/translations";
import { DLMETRIXSpinner, SEOAnalysisSpinner, PerformanceSpinner, AIContentSpinner } from "@/components/loading-spinners";
import AnimatedBackground from "@/components/animated-background";

export default function Home() {
  const [seoData, setSeoData] = useState<WebAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [protectionError, setProtectionError] = useState<any | null>(null);
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isSharing, setIsSharing] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (url: string): Promise<WebAnalysisResult> => {
      const response = await apiRequest("POST", "/api/web/analyze", { url });
      
      // Check for protection errors (status 423)
      if (response.status === 423) {
        const protectionData = await response.json();
        throw new Error(JSON.stringify({ isProtectionError: true, ...protectionData }));
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setSeoData(data);
      setError(null);
      setProtectionError(null);
      
      // Track analysis completion event
      trackEvent('analysis_completed', 'seo_analysis', data.url, data.seoScore);
      
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
      // Check if it's a protection error
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.isProtectionError) {
          setProtectionError(errorData);
          setError(null);
          setSeoData(null);
          return;
        }
      } catch (e) {
        // Not a protection error, handle normally
      }
      
      setError(error instanceof Error ? error.message : "Failed to analyze website");
      setProtectionError(null);
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
    setProtectionError(null);
    setAnalysisProgress('Initializing analysis...');
    
    // Track analysis start event
    trackEvent('analysis_started', 'seo_analysis', url);
    
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
    // Track PDF export event
    trackEvent('pdf_export', 'report_export', seoData.url);
    
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
    
    // Track CSV export event
    trackEvent('csv_export', 'report_export', seoData.url);

    const csvData = [
      // Header
      ['DLMETRIX - Complete Web Analysis Report'],
      ['Generated on', new Date().toLocaleDateString()],
      ['Website URL', seoData.url],
      [''],

      // Performance Overview
      ['=== PERFORMANCE OVERVIEW ==='],
      ['Metric', 'Score'],
      ['Performance', seoData.performanceScore.toString()],
      ['Accessibility', seoData.accessibilityScore.toString()],
      ['Best Practices', seoData.bestPracticesScore.toString()],
      ['SEO', seoData.seoScore.toString()],
      [''],

      // Core Web Vitals
      ['=== CORE WEB VITALS ==='],
      ['Device', 'Metric', 'Value', 'Status'],
      ['Mobile', 'LCP (Largest Contentful Paint)', seoData.coreWebVitals.mobile.lcp?.toString() || 'N/A', seoData.coreWebVitals.mobile.lcp ? (seoData.coreWebVitals.mobile.lcp <= 2.5 ? 'Good' : seoData.coreWebVitals.mobile.lcp <= 4.0 ? 'Needs Improvement' : 'Poor') : 'N/A'],
      ['Mobile', 'FID (First Input Delay)', seoData.coreWebVitals.mobile.fid?.toString() || 'N/A', seoData.coreWebVitals.mobile.fid ? (seoData.coreWebVitals.mobile.fid <= 100 ? 'Good' : seoData.coreWebVitals.mobile.fid <= 300 ? 'Needs Improvement' : 'Poor') : 'N/A'],
      ['Mobile', 'CLS (Cumulative Layout Shift)', seoData.coreWebVitals.mobile.cls?.toString() || 'N/A', seoData.coreWebVitals.mobile.cls ? (seoData.coreWebVitals.mobile.cls <= 0.1 ? 'Good' : seoData.coreWebVitals.mobile.cls <= 0.25 ? 'Needs Improvement' : 'Poor') : 'N/A'],
      ['Mobile', 'FCP (First Contentful Paint)', seoData.coreWebVitals.mobile.fcp?.toString() || 'N/A', seoData.coreWebVitals.mobile.fcp ? (seoData.coreWebVitals.mobile.fcp <= 1.8 ? 'Good' : seoData.coreWebVitals.mobile.fcp <= 3.0 ? 'Needs Improvement' : 'Poor') : 'N/A'],
      ['Mobile', 'TTFB (Time to First Byte)', seoData.coreWebVitals.mobile.ttfb?.toString() || 'N/A', seoData.coreWebVitals.mobile.ttfb ? (seoData.coreWebVitals.mobile.ttfb <= 800 ? 'Good' : seoData.coreWebVitals.mobile.ttfb <= 1800 ? 'Needs Improvement' : 'Poor') : 'N/A'],
      ['Desktop', 'LCP (Largest Contentful Paint)', seoData.coreWebVitals.desktop.lcp?.toString() || 'N/A', seoData.coreWebVitals.desktop.lcp ? (seoData.coreWebVitals.desktop.lcp <= 2.5 ? 'Good' : seoData.coreWebVitals.desktop.lcp <= 4.0 ? 'Needs Improvement' : 'Poor') : 'N/A'],
      ['Desktop', 'FID (First Input Delay)', seoData.coreWebVitals.desktop.fid?.toString() || 'N/A', seoData.coreWebVitals.desktop.fid ? (seoData.coreWebVitals.desktop.fid <= 100 ? 'Good' : seoData.coreWebVitals.desktop.fid <= 300 ? 'Needs Improvement' : 'Poor') : 'N/A'],
      ['Desktop', 'CLS (Cumulative Layout Shift)', seoData.coreWebVitals.desktop.cls?.toString() || 'N/A', seoData.coreWebVitals.desktop.cls ? (seoData.coreWebVitals.desktop.cls <= 0.1 ? 'Good' : seoData.coreWebVitals.desktop.cls <= 0.25 ? 'Needs Improvement' : 'Poor') : 'N/A'],
      ['Desktop', 'FCP (First Contentful Paint)', seoData.coreWebVitals.desktop.fcp?.toString() || 'N/A', seoData.coreWebVitals.desktop.fcp ? (seoData.coreWebVitals.desktop.fcp <= 1.8 ? 'Good' : seoData.coreWebVitals.desktop.fcp <= 3.0 ? 'Needs Improvement' : 'Poor') : 'N/A'],
      ['Desktop', 'TTFB (Time to First Byte)', seoData.coreWebVitals.desktop.ttfb?.toString() || 'N/A', seoData.coreWebVitals.desktop.ttfb ? (seoData.coreWebVitals.desktop.ttfb <= 800 ? 'Good' : seoData.coreWebVitals.desktop.ttfb <= 1800 ? 'Needs Improvement' : 'Poor') : 'N/A'],
      [''],

      // SEO Meta Information
      ['=== SEO METADATA ==='],
      ['Element', 'Content', 'Length', 'Status'],
      ['Title Tag', seoData.title || 'Not Found', seoData.title?.length.toString() || '0', seoData.title ? (seoData.title.length >= 30 && seoData.title.length <= 60 ? 'Good' : 'Needs Optimization') : 'Missing'],
      ['Meta Description', seoData.description || 'Not Found', seoData.description?.length.toString() || '0', seoData.description ? (seoData.description.length >= 120 && seoData.description.length <= 160 ? 'Good' : 'Needs Optimization') : 'Missing'],
      ['Keywords', seoData.keywords || 'Not Specified', seoData.keywords?.length.toString() || '0', seoData.keywords ? 'Present' : 'Not Specified'],
      ['Canonical URL', seoData.canonicalUrl || 'Not Found', seoData.canonicalUrl?.length.toString() || '0', seoData.canonicalUrl ? 'Present' : 'Missing'],
      [''],

      // Open Graph Tags
      ['=== OPEN GRAPH TAGS ==='],
      ['Property', 'Content', 'Status'],
      ['og:title', seoData.ogTitle || 'Not Found', seoData.ogTitle ? 'Present' : 'Missing'],
      ['og:description', seoData.ogDescription || 'Not Found', seoData.ogDescription ? 'Present' : 'Missing'],
      ['og:image', seoData.ogImage || 'Not Found', seoData.ogImage ? 'Present' : 'Missing'],
      ['og:url', seoData.ogUrl || 'Not Found', seoData.ogUrl ? 'Present' : 'Missing'],
      ['og:type', seoData.ogType || 'Not Found', seoData.ogType ? 'Present' : 'Missing'],
      [''],

      // Twitter Cards
      ['=== TWITTER CARDS ==='],
      ['Property', 'Content', 'Status'],
      ['twitter:card', seoData.twitterCard || 'Not Found', seoData.twitterCard ? 'Present' : 'Missing'],
      ['twitter:title', seoData.twitterTitle || 'Not Found', seoData.twitterTitle ? 'Present' : 'Missing'],
      ['twitter:description', seoData.twitterDescription || 'Not Found', seoData.twitterDescription ? 'Present' : 'Missing'],
      ['twitter:image', seoData.twitterImage || 'Not Found', seoData.twitterImage ? 'Present' : 'Missing'],
      [''],

      // Technical SEO Checks
      ['=== TECHNICAL SEO CHECKS ==='],
      ['Check', 'Status'],
      ...(seoData.technicalChecks ? Object.entries(seoData.technicalChecks).map(([check, passed]) => [
        check.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        passed ? 'Pass' : 'Fail'
      ]) : []),
      [''],

      // AI Search Analysis
      ...(seoData.aiSearchAnalysis ? [
        ['=== AI SEARCH ANALYSIS ==='],
        ['Content Quality Score', seoData.aiSearchAnalysis.contentQuality?.toString() || 'N/A'],
        ['Structured Data Score', seoData.aiSearchAnalysis.structuredDataScore?.toString() || 'N/A'],
        ['Semantic Clarity Score', seoData.aiSearchAnalysis.semanticClarityScore?.toString() || 'N/A'],
        ['Primary Topics', seoData.aiSearchAnalysis.primaryTopics?.join(', ') || 'N/A'],
        ['Key Entities', seoData.aiSearchAnalysis.keyEntities?.join(', ') || 'N/A'],
        ['Factual Claims', seoData.aiSearchAnalysis.factualClaims?.join(', ') || 'N/A'],
        ['']
      ] : []),

      // Heading Structure Analysis
      ...(seoData.headings || seoData.headingStructure ? [
        ['=== HEADING STRUCTURE ANALYSIS ==='],
        ['H1 Headings', (seoData.headings?.h1?.join(' | ') || 'None')],
        ['H2 Headings', (seoData.headings?.h2?.join(' | ') || 'None')],
        ['H3 Headings', (seoData.headings?.h3?.join(' | ') || 'None')],
        ['H4 Headings', (seoData.headings?.h4?.join(' | ') || 'None')],
        ['H5 Headings', (seoData.headings?.h5?.join(' | ') || 'None')],
        ['H6 Headings', (seoData.headings?.h6?.join(' | ') || 'None')],
        [''],
        ['Heading Structure (Order)', 'Level', 'Text Content'],
        ...(seoData.headingStructure?.map((heading, index) => [
          `#${index + 1}`,
          heading.level || 'N/A',
          heading.text || 'N/A'
        ]) || []),
        [''],
        ['Structure Analysis'],
        ['First Heading Level', seoData.headingStructure?.[0]?.level || 'N/A'],
        ['Starts with H1', seoData.headingStructure?.[0]?.level === 'H1' ? 'Yes (Good)' : 'No (Critical Issue)'],
        ['Total Headings', seoData.headingStructure?.length?.toString() || '0'],
        ['H1 Count', seoData.headings?.h1?.length?.toString() || '0'],
        ['SEO Hierarchy Score', seoData.headingStructure?.[0]?.level === 'H1' ? '100 (Excellent)' : '25 (Poor - Does not start with H1)'],
        ['']
      ] : []),

      // Keyword Analysis
      ...(seoData.keywordAnalysis ? [
        ['=== KEYWORD ANALYSIS ==='],
        ['Overall Score', seoData.keywordAnalysis.overallScore?.toString() || 'N/A'],
        ['Primary Keywords'],
        ['Keyword', 'Frequency', 'Density'],
        ...(seoData.keywordAnalysis.primaryKeywords?.map(kw => [kw.term, kw.frequency?.toString() || '0', kw.density?.toString() || '0']) || []),
        [''],
        ['Secondary Keywords'],
        ['Keyword', 'Frequency', 'Density'],
        ...(seoData.keywordAnalysis.secondaryKeywords?.map(kw => [kw.term, kw.frequency?.toString() || '0', kw.density?.toString() || '0']) || []),
        [''],
        ['Long-tail Keywords'],
        ...(seoData.keywordAnalysis.longTailKeywords?.map(kw => [kw]) || []),
        [''],
        ['Missed Opportunities'],
        ...(seoData.keywordAnalysis.missedOpportunities?.map(opp => [opp]) || []),
        ['']
      ] : []),

      // Recommendations
      ['=== RECOMMENDATIONS ==='],
      ['Priority', 'Category', 'Title', 'Description'],
      ...(seoData.recommendations?.map(rec => [
        rec.priority || 'Medium',
        rec.category || 'General',
        rec.title || 'N/A',
        rec.description?.replace(/\n/g, ' ') || 'N/A'
      ]) || []),
      [''],

      // Diagnostics
      ...(seoData.diagnostics?.length ? [
        ['=== PERFORMANCE DIAGNOSTICS ==='],
        ['Title', 'Description', 'Score Impact'],
        ...seoData.diagnostics.map(diag => [
          diag.title || 'N/A',
          diag.description?.replace(/\n/g, ' ') || 'N/A',
          diag.scoreDisplayMode || 'N/A'
        ]),
        ['']
      ] : []),

      // Performance Insights
      ...(seoData.insights?.length ? [
        ['=== PERFORMANCE INSIGHTS ==='],
        ['Title', 'Description', 'Type'],
        ...seoData.insights.map(insight => [
          insight.title || 'N/A',
          insight.description?.replace(/\n/g, ' ') || 'N/A',
          insight.scoreDisplayMode || 'N/A'
        ]),
        ['']
      ] : []),

      // Footer
      [''],
      ['Report generated by DLMETRIX'],
      ['https://dlmetrix.com'],
      ['© 2025 Luis Mena Hernandez']
    ];

    const csvContent = csvData.map(row => 
      row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dlmetrix-complete-analysis-${new URL(seoData.url).hostname}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: t.csvExported,
      description: t.csvDescription,
    });
  };

  const createShareableLink = async () => {
    if (!seoData) return;

    setIsSharing(true);
    // Track share creation event
    trackEvent('share_created', 'report_sharing', seoData.url);
    
    try {
      const response = await apiRequest("POST", "/api/share/create", { analysisData: seoData });
      const data = await response.json();
      
      setShareUrl(data.shareUrl);
      setShowShareDialog(true);
      
      toast({
        title: language === 'es' ? "Enlace creado" : "Link created",
        description: language === 'es' 
          ? "El enlace compartible ha sido creado exitosamente" 
          : "Shareable link has been created successfully",
      });
    } catch (error) {
      toast({
        title: language === 'es' ? "Error" : "Error",
        description: language === 'es' 
          ? "No se pudo crear el enlace compartible" 
          : "Failed to create shareable link",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Track copy event
      trackEvent('link_copied', 'report_sharing', 'clipboard');
      
      toast({
        title: language === 'es' ? "Copiado" : "Copied",
        description: language === 'es' 
          ? "Enlace copiado al portapapeles" 
          : "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: language === 'es' ? "Error" : "Error",
        description: language === 'es' 
          ? "No se pudo copiar el enlace" 
          : "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleCompareWith = (data: WebAnalysisResult) => {
    setCompareData(data);
    setCompareMode(true);
    setShowHistory(false);
    
    // Track comparison event
    trackEvent('comparison_started', 'comparison', `${seoData?.url} vs ${data.url}`);
    
    toast({
      title: t.comparisonEnabled,
      description: `${t.comparingWith} ${data.url}`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors relative">
      {/* Animated Background - Web Transformation */}
      <AnimatedBackground />
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo and Title - Mobile Optimized */}
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => window.location.reload()}>
              <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 text-white p-1.5 sm:p-2 rounded-lg flex-shrink-0 hover:scale-105 transition-transform">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-sm sm:text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {t.title}
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <WhyDlmetrixDialog language={language} />
              <HelpDialog language={language} />
              {analysisHistory.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowHistory(!showHistory)}
                  className="relative"
                >
                  <History className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {analysisHistory.length}
                  </span>
                  <span className="hidden lg:inline ml-2">{t.history}</span>
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden lg:inline ml-2">{t.settings}</span>
              </Button>
              {seoData && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleExportCSV}
                    disabled={!seoData}
                  >
                    <FileDown className="w-4 h-4" />
                    <span className="hidden lg:inline ml-2">CSV</span>
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-blue-700 text-sm"
                    onClick={handleExportPDF}
                    disabled={!seoData || isExporting}
                  >
                    {isExporting ? (
                      <Download className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Bookmark className="w-4 h-4 mr-1" />
                    )}
                    <span className="hidden lg:inline">
                      {isExporting ? t.generating : t.saveReport}
                    </span>
                  </Button>
                </>
              )}
              <ContactDialog language={language} />
              <SupportDialog language={language} />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 btn-mobile"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 dark:border-slate-700 py-3 bg-white dark:bg-slate-800">
              <div className="flex flex-col space-y-3">
                {/* Main Navigation */}
                <div className="grid grid-cols-2 gap-2 px-3">
                  <WhyDlmetrixDialog language={language} />
                  <HelpDialog language={language} />
                </div>
                
                {/* Settings and History */}
                <div className="grid grid-cols-2 gap-2 px-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setShowSettings(!showSettings);
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {t.settings}
                  </Button>
                  
                  {analysisHistory.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setShowHistory(!showHistory);
                        setIsMobileMenuOpen(false);
                      }}
                      className="relative justify-start"
                    >
                      <History className="w-4 h-4 mr-2" />
                      {t.history}
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {analysisHistory.length}
                      </span>
                    </Button>
                  )}
                </div>

                {/* Export Options - Only show if there's data */}
                {seoData && (
                  <div className="grid grid-cols-2 gap-2 px-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        handleExportCSV();
                        setIsMobileMenuOpen(false);
                      }}
                      disabled={!seoData}
                      className="justify-start"
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                    
                    <Button 
                      className="bg-primary hover:bg-blue-700 justify-start text-white"
                      onClick={() => {
                        handleExportPDF();
                        setIsMobileMenuOpen(false);
                      }}
                      disabled={!seoData || isExporting}
                    >
                      {isExporting ? (
                        <Download className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Bookmark className="w-4 h-4 mr-2" />
                      )}
                      PDF
                    </Button>
                  </div>
                )}

                {/* Contact and Support */}
                <div className="grid grid-cols-2 gap-2 px-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <ContactDialog language={language} />
                  <SupportDialog language={language} />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={seoData ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 relative z-10" : "relative z-10"}>
        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-6 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t.analysisSettings}</h2>
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
                      onClick={() => {
                        setDarkMode(!darkMode);
                        trackEvent('theme_changed', 'settings', darkMode ? 'light' : 'dark');
                      }}
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
                      onChange={(e) => {
                        setLanguage(e.target.value as 'en' | 'es');
                        trackEvent('language_changed', 'settings', e.target.value);
                      }}
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
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t.analysisHistory}</h2>
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
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer transition-colors gap-2 sm:gap-0"
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
                        <div className="font-medium text-slate-900 dark:text-slate-100 truncate text-sm">
                          {item.url}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-slate-500 dark:text-slate-400 mt-1 gap-1 sm:gap-0">
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
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompareWith(item);
                          }}
                          className="flex-shrink-0 p-2"
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
                          className="flex-shrink-0 p-2"
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
                          className="flex-shrink-0 p-2"
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
            
            {/* Animated Background - Web Transformation */}
            <AnimatedBackground />
            
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
              <div className="text-center mb-6 animate-fade-in">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 text-white p-2 rounded-lg">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                    DLMETRIX
                  </h1>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mx-auto px-4">
                  All-in-one website audit tool: Core Web Vitals, SEO diagnostics, and performance reports.
                </p>
              </div>
              
              {/* Centered URL Input */}
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <UrlInput onAnalyze={handleAnalyze} isLoading={analyzeMutation.isPending} language={language} currentUrl={seoData?.url} />
              </div>
              
              {/* Feature Icons Section - Mobile Optimized */}
              <section className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center text-slate-600 dark:text-slate-400 text-xs max-w-md mx-auto">
                  <div className="flex items-center gap-1.5 justify-center bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                    <Monitor className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="font-medium">Desktop</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                    <Smartphone className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Mobile</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                    <span className="font-medium">Performance</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                    <Globe className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span className="font-medium">SEO</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                    <Search className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                    <span className="font-medium">AI Search</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                    <FileText className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                    <span className="font-medium">Keywords</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                    <BarChart3 className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                    <span className="font-medium">Waterfall</span>
                  </div>
                </div>
              </section>
              
              {/* Features Section - Hidden on Mobile */}
              <section className="mt-6 text-center animate-fade-in hidden sm:block" style={{ animationDelay: '0.4s' }}>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  {language === 'en' ? 'Comprehensive Website Analysis Features' : 'Características de Análisis Web Integral'}
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto px-4">
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {language === 'en' ? 'Core Web Vitals' : 'Core Web Vitals'}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                      {language === 'en' 
                        ? 'Measure LCP, FID, CLS and other performance metrics.'
                        : 'Mide LCP, FID, CLS y otras métricas de rendimiento.'
                      }
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {language === 'en' ? 'Technical SEO' : 'SEO Técnico'}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                      {language === 'en' 
                        ? 'Analyze meta tags, heading structure, schema markup.'
                        : 'Analiza meta etiquetas, estructura de encabezados, marcado.'
                      }
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {language === 'en' ? 'Accessibility' : 'Accesibilidad'}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                      {language === 'en' 
                        ? 'Check website accessibility compliance and get recommendations.'
                        : 'Verifica el cumplimiento de accesibilidad del sitio web.'
                      }
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {language === 'en' ? 'Waterfall Analysis' : 'Análisis Waterfall'}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                      {language === 'en' 
                        ? 'Resource loading timeline and performance optimization.'
                        : 'Línea de tiempo de carga y optimización de rendimiento.'
                      }
                    </p>
                  </div>
                </div>
              </section>
              
              {/* Footer for centered layout - Mobile Optimized */}
              <footer className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 px-4">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span>© 2025 DLMETRIX. All rights reserved.</span>
                    <div className="flex items-center gap-2">
                      <span>Made with ❤️ for web developers</span>
                      <span>•</span>
                      <span>Free SEO analysis tool</span>
                    </div>
                  </div>
                  <div>
                    <Dialog open={isLegalOpen} onOpenChange={setIsLegalOpen}>
                      <DialogTrigger asChild>
                        <button 
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors text-xs"
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
                            <p className="font-medium">Application Registration:</p>
                            <div className="text-slate-600 dark:text-slate-400 font-mono space-y-1">
                              <p>DLMETRIX™</p>
                              <p>App Registration No. DLM-2025-US-01783</p>
                              <p>© 2025 DLMETRIX. All rights reserved.</p>
                              <p>Copyright Reference: TXu 2-974-635</p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </footer>
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

        {protectionError && (
          <Card className="p-4 sm:p-6 mb-6 sm:mb-8 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
            <div className="text-amber-800 dark:text-amber-100">
              <div className="flex items-center mb-3">
                <Settings className="w-5 h-5 mr-2" />
                <h3 className="font-semibold text-sm sm:text-base">
                  {language === 'en' ? 'Site Protection Detected' : 'Protección del Sitio Detectada'}
                </h3>
              </div>
              
              <p className="text-xs sm:text-sm leading-relaxed mb-4">
                {protectionError.message}
              </p>

              {protectionError.protections && protectionError.protections.length > 0 && (
                <div className="space-y-3 mb-4">
                  <h4 className="font-medium text-sm">
                    {language === 'en' ? 'Protection Services Detected:' : 'Servicios de Protección Detectados:'}
                  </h4>
                  {protectionError.protections.map((protection, index) => (
                    <div key={index} className="bg-white dark:bg-amber-900/30 p-3 rounded-lg border border-amber-200 dark:border-amber-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-amber-900 dark:text-amber-200">{protection.name}</span>
                        <span className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-1 rounded">
                          {protection.type}
                        </span>
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">{protection.description}</p>
                      <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
                        <span className="font-semibold">
                          {language === 'en' ? 'Recommended action:' : 'Acción recomendada:'} 
                        </span> {protection.action}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {protectionError.recommendations && (
                <div className="bg-white dark:bg-amber-900/30 p-3 rounded-lg border border-amber-200 dark:border-amber-700">
                  <h4 className="font-medium text-sm mb-2 text-amber-900 dark:text-amber-200">
                    {language === 'en' ? 'How to Fix:' : 'Cómo Solucionarlo:'}
                  </h4>
                  <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
                    {protectionError.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1 h-1 bg-amber-600 dark:bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {protectionError.pageInfo && (
                <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    <span className="font-medium">
                      {language === 'en' ? 'Page detected:' : 'Página detectada:'} 
                    </span> {protectionError.pageInfo.title}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {seoData && (
          <main className="space-y-4 sm:space-y-6 lg:space-y-8">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100 truncate">{seoData.url}</div>
                      <div className="flex flex-wrap gap-2 sm:gap-4 mt-1">
                        <span className="text-blue-600 dark:text-blue-400">Perf: {seoData.performanceScore}</span>
                        <span className="text-green-600 dark:text-green-400">SEO: {seoData.seoScore}</span>
                        <span className="text-purple-600 dark:text-purple-400">A11y: {seoData.accessibilityScore}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100 truncate">{compareData.url}</div>
                      <div className="flex flex-wrap gap-2 sm:gap-4 mt-1">
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
              onShareReport={createShareableLink}
              isSharing={isSharing}
            />

            {/* Core Web Vitals */}
            <CoreWebVitalsComponent data={seoData.coreWebVitals} language={language} />

            {/* Screenshots */}
            <ScreenshotsView 
              mobileScreenshot={seoData.mobileScreenshot}
              desktopScreenshot={seoData.desktopScreenshot}
              url={seoData.url}
              language={language}
            />

            {/* Waterfall Analysis */}
            {seoData.waterfallAnalysis && (
              <WaterfallAnalysis analysis={seoData.waterfallAnalysis} language={language} />
            )}

            {/* Legacy SEO Analysis */}
            <div className="grid gap-4 sm:gap-6">
              {/* Preview Tabs */}
              <PreviewTabs data={seoData} />

              {/* Meta Tags Analysis */}
              <MetaTagAnalysis data={seoData} />

              {/* Heading Structure Analysis */}
              <HeadingStructureAnalysis data={seoData} language={language} />

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
          </main>
        )}
      </main>

      {/* Enhanced Loading Overlay with Custom Spinners */}
      {analyzeMutation.isPending && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="p-6 sm:p-8 max-w-sm sm:max-w-md mx-auto w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-700">
            <div className="text-center">
              {/* Main DLMETRIX branded spinner */}
              <div className="mb-6">
                <DLMETRIXSpinner size="lg" />
              </div>
              
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{t.analyzingWebsite}</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
                {analysisProgress || (language === 'en' ? 'Running comprehensive web performance analysis...' : 'Ejecutando análisis integral de rendimiento web...')}
              </p>
              
              {/* Progress bar */}
              <div className="bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500 ease-out rounded-full animate-pulse"
                  style={{ width: '75%' }}
                />
              </div>
              
              {/* Analysis stages with themed spinners in pairs */}
              <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 space-y-3">
                {/* First row: Desktop & Mobile Analysis */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-center space-x-1.5">
                    <PerformanceSpinner size="sm" className="scale-75" />
                    <span className="text-center">{t.desktopAnalysis}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1.5">
                    <PerformanceSpinner size="sm" className="scale-75" />
                    <span className="text-center">{t.mobileAnalysis}</span>
                  </div>
                </div>
                
                {/* Second row: SEO & AI Content Analysis */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-center space-x-1.5">
                    <SEOAnalysisSpinner size="sm" className="scale-75" />
                    <span className="text-center">{t.seoAnalysis}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1.5">
                    <AIContentSpinner size="sm" className="scale-75" />
                    <span className="text-center">
                      {language === 'en' ? 'AI Content Analysis' : 'Análisis de Contenido AI'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      <Footer />

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Share2 className="w-5 h-5 text-blue-600" />
              <span>{language === 'es' ? 'Compartir Análisis' : 'Share Analysis'}</span>
            </DialogTitle>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {language === 'es' 
                ? 'Genera un enlace para compartir este análisis completo de SEO y rendimiento web.' 
                : 'Generate a shareable link for this complete SEO and web performance analysis.'}
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {language === 'es' 
                ? 'Tu enlace compartible estará disponible por 12 horas.' 
                : 'Your shareable link will be available for 12 hours.'}
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-800 dark:text-slate-200 break-all">
                {shareUrl}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(language === 'es' ? 'Mira este análisis SEO completo de mi sitio web' : 'Check out this comprehensive SEO analysis of my website')}`, '_blank')}
                className="flex-1"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
                className="flex-1"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}
                className="flex-1"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </Button>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
              {language === 'es' 
                ? 'El enlace expirará automáticamente después de 12 horas por seguridad.' 
                : 'Link will automatically expire after 12 hours for security.'}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
