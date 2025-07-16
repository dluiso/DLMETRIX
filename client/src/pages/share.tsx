import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Share2, ExternalLink, Clock, AlertTriangle } from "lucide-react";
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
import Footer from "@/components/footer";
import { WebAnalysisResult } from "@/shared/schema";

interface SharedReportData {
  url: string;
  analysisData: WebAnalysisResult;
  createdAt: string;
  expiresAt: string;
}

export default function SharePage() {
  const params = useParams();
  const shareToken = params.token;
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  console.log('SharePage mounted with params:', params, 'token:', shareToken);

  const { data: sharedReport, isLoading, error } = useQuery<SharedReportData>({
    queryKey: ['/api/share', shareToken],
    enabled: !!shareToken,
  });

  // Debug logging
  useEffect(() => {
    console.log('SharePage Debug:', {
      shareToken,
      isLoading,
      error: error ? error.message : null,
      hasSharedReport: !!sharedReport,
      sharedReportKeys: sharedReport ? Object.keys(sharedReport) : [],
      analysisDataKeys: sharedReport?.analysisData ? Object.keys(sharedReport.analysisData) : [],
      analysisDataType: sharedReport?.analysisData ? typeof sharedReport.analysisData : 'undefined',
      url: sharedReport?.url,
      createdAt: sharedReport?.createdAt,
      expiresAt: sharedReport?.expiresAt
    });
    
    // Additional check for analysisData structure
    if (sharedReport?.analysisData) {
      console.log('Analysis Data Structure:', {
        hasPerformanceOverview: !!sharedReport.analysisData.performanceOverview,
        hasCoreWebVitals: !!sharedReport.analysisData.coreWebVitals,
        hasSeoAnalysis: !!sharedReport.analysisData.seoAnalysis,
        hasTechnicalSeoAnalysis: !!sharedReport.analysisData.technicalSeoAnalysis,
        hasRecommendations: !!sharedReport.analysisData.recommendations,
        fullStructure: Object.keys(sharedReport.analysisData)
      });
    }
  }, [shareToken, isLoading, error, sharedReport]);

  // Calculate time remaining
  useEffect(() => {
    if (!sharedReport?.expiresAt) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const expires = new Date(sharedReport.expiresAt);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${minutes}m remaining`);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [sharedReport?.expiresAt]);

  if (isLoading) {
    console.log('SharePage: Currently loading shared report...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Loading Shared Report</h3>
            <p className="text-slate-600 dark:text-slate-400">Please wait while we fetch the analysis...</p>
            <div className="text-xs text-slate-500 mt-4">
              Token: {shareToken}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !sharedReport) {
    console.log('SharePage: Error or no shared report found:', { error, sharedReport });
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Report Not Found</h3>
            <p className="text-red-600 dark:text-red-300 mb-4">
              This shared report doesn't exist or has expired. Shared reports are only available for 12 hours.
            </p>
            <div className="text-xs text-red-700 dark:text-red-400 mb-4 p-4 bg-red-100 dark:bg-red-900/40 rounded">
              Debug Info: 
              <br />Token: {shareToken}
              <br />Error: {error ? error.message : 'No error'}
              <br />Has Report: {!!sharedReport}
            </div>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Go to DLMETRIX
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Create safe defaults for missing data to prevent component crashes
  const safeAnalysisData = {
    url: sharedReport.url || '',
    performanceOverview: {
      performance: sharedReport.analysisData?.performanceOverview?.performance || 0,
      accessibility: sharedReport.analysisData?.performanceOverview?.accessibility || 0,
      bestPractices: sharedReport.analysisData?.performanceOverview?.bestPractices || 0,
      seo: sharedReport.analysisData?.performanceOverview?.seo || 0
    },
    coreWebVitals: {
      mobile: {
        lcp: sharedReport.analysisData?.coreWebVitals?.mobile?.lcp || { value: null, score: 'N/A' },
        fid: sharedReport.analysisData?.coreWebVitals?.mobile?.fid || { value: null, score: 'N/A' },
        cls: sharedReport.analysisData?.coreWebVitals?.mobile?.cls || { value: null, score: 'N/A' },
        fcp: sharedReport.analysisData?.coreWebVitals?.mobile?.fcp || { value: null, score: 'N/A' },
        ttfb: sharedReport.analysisData?.coreWebVitals?.mobile?.ttfb || { value: null, score: 'N/A' }
      },
      desktop: {
        lcp: sharedReport.analysisData?.coreWebVitals?.desktop?.lcp || { value: null, score: 'N/A' },
        fid: sharedReport.analysisData?.coreWebVitals?.desktop?.fid || { value: null, score: 'N/A' },
        cls: sharedReport.analysisData?.coreWebVitals?.desktop?.cls || { value: null, score: 'N/A' },
        fcp: sharedReport.analysisData?.coreWebVitals?.desktop?.fcp || { value: null, score: 'N/A' },
        ttfb: sharedReport.analysisData?.coreWebVitals?.desktop?.ttfb || { value: null, score: 'N/A' }
      }
    },
    // Map all the data fields correctly for compatibility
    title: sharedReport.analysisData?.title || sharedReport.analysisData?.seoAnalysis?.title || '',
    description: sharedReport.analysisData?.description || sharedReport.analysisData?.seoAnalysis?.description || null,
    keywords: sharedReport.analysisData?.keywords || sharedReport.analysisData?.seoAnalysis?.keywords || null,
    canonicalUrl: sharedReport.analysisData?.canonicalUrl || sharedReport.analysisData?.seoAnalysis?.canonicalUrl || null,
    robotsMeta: sharedReport.analysisData?.robotsMeta || sharedReport.analysisData?.seoAnalysis?.robotsMeta || null,
    viewportMeta: sharedReport.analysisData?.viewportMeta || sharedReport.analysisData?.seoAnalysis?.viewportMeta || null,
    charset: sharedReport.analysisData?.charset || sharedReport.analysisData?.seoAnalysis?.charset || null,
    langAttribute: sharedReport.analysisData?.langAttribute || sharedReport.analysisData?.seoAnalysis?.langAttribute || null,
    
    // Open Graph data
    ogTitle: sharedReport.analysisData?.ogTitle || null,
    ogDescription: sharedReport.analysisData?.ogDescription || null,
    ogImage: sharedReport.analysisData?.ogImage || null,
    ogUrl: sharedReport.analysisData?.ogUrl || null,
    ogType: sharedReport.analysisData?.ogType || null,
    
    // Twitter Cards data  
    twitterCard: sharedReport.analysisData?.twitterCard || null,
    twitterTitle: sharedReport.analysisData?.twitterTitle || null,
    twitterDescription: sharedReport.analysisData?.twitterDescription || null,
    twitterImage: sharedReport.analysisData?.twitterImage || null,
    
    // Headings structure
    headings: {
      h1: sharedReport.analysisData?.headings?.h1 || [],
      h2: sharedReport.analysisData?.headings?.h2 || [],
      h3: sharedReport.analysisData?.headings?.h3 || [],
      h4: sharedReport.analysisData?.headings?.h4 || [],
      h5: sharedReport.analysisData?.headings?.h5 || [],
      h6: sharedReport.analysisData?.headings?.h6 || []
    },
    headingStructure: sharedReport.analysisData?.headingStructure || [],
    
    // Performance scores for compatibility
    performanceScore: Number(sharedReport.analysisData?.performanceScore || sharedReport.analysisData?.performanceOverview?.performance) || 0,
    accessibilityScore: Number(sharedReport.analysisData?.accessibilityScore || sharedReport.analysisData?.performanceOverview?.accessibility) || 0,
    bestPracticesScore: Number(sharedReport.analysisData?.bestPracticesScore || sharedReport.analysisData?.performanceOverview?.bestPractices) || 0,
    seoScore: Number(sharedReport.analysisData?.seoScore || sharedReport.analysisData?.performanceOverview?.seo) || 0,
    
    // Technical checks
    technicalChecks: sharedReport.analysisData?.technicalChecks || {},
    
    seoAnalysis: {
      title: sharedReport.analysisData?.title || sharedReport.analysisData?.seoAnalysis?.title || '',
      description: sharedReport.analysisData?.description || sharedReport.analysisData?.seoAnalysis?.description || '',
      keywords: sharedReport.analysisData?.keywords || sharedReport.analysisData?.seoAnalysis?.keywords || null,
      canonicalUrl: sharedReport.analysisData?.canonicalUrl || sharedReport.analysisData?.seoAnalysis?.canonicalUrl || null,
      robotsMeta: sharedReport.analysisData?.robotsMeta || sharedReport.analysisData?.seoAnalysis?.robotsMeta || null,
      viewportMeta: sharedReport.analysisData?.viewportMeta || sharedReport.analysisData?.seoAnalysis?.viewportMeta || null,
      charset: sharedReport.analysisData?.charset || sharedReport.analysisData?.seoAnalysis?.charset || null,
      langAttribute: sharedReport.analysisData?.langAttribute || null,
      openGraphTags: sharedReport.analysisData?.openGraphTags || {},
      twitterCardTags: sharedReport.analysisData?.twitterCardTags || {},
      headings: {
        h1: sharedReport.analysisData?.headings?.h1 || [],
        h2: sharedReport.analysisData?.headings?.h2 || [],
        h3: sharedReport.analysisData?.headings?.h3 || [],
        h4: sharedReport.analysisData?.headings?.h4 || [],
        h5: sharedReport.analysisData?.headings?.h5 || [],
        h6: sharedReport.analysisData?.headings?.h6 || []
      },
      headingStructure: sharedReport.analysisData?.headingStructure || []
    },
    technicalSeoAnalysis: sharedReport.analysisData?.technicalSeoAnalysis || [],
    recommendations: sharedReport.analysisData?.recommendations || [],
    diagnostics: sharedReport.analysisData?.diagnostics || [],
    insights: sharedReport.analysisData?.insights || [],
    aiSearchAnalysis: sharedReport.analysisData?.aiSearchAnalysis || null,
    keywordAnalysis: sharedReport.analysisData?.keywordAnalysis || null,
    screenshots: {
      mobile: sharedReport.analysisData?.screenshots?.mobile || sharedReport.analysisData?.mobileScreenshot || null,
      desktop: sharedReport.analysisData?.screenshots?.desktop || sharedReport.analysisData?.desktopScreenshot || null
    },
    mobileScreenshot: sharedReport.analysisData?.mobileScreenshot || null,
    desktopScreenshot: sharedReport.analysisData?.desktopScreenshot || null
  };

  const analysisData = safeAnalysisData;
  
  console.log('SharePage: About to render main content with safe analysisData:', !!analysisData);

  // Additional safety check
  if (!analysisData) {
    console.error('No analysis data found in shared report:', {
      sharedReport,
      hasSharedReport: !!sharedReport,
      sharedReportKeys: sharedReport ? Object.keys(sharedReport) : []
    });
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Invalid Report Data</h3>
            <p className="text-yellow-600 dark:text-yellow-300 mb-4">
              The shared report data appears to be corrupted or incomplete.
            </p>
            <div className="text-xs text-yellow-700 dark:text-yellow-400 mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/40 rounded">
              Debug Info: {JSON.stringify({
                hasSharedReport: !!sharedReport,
                sharedReportKeys: sharedReport ? Object.keys(sharedReport) : [],
                analysisDataType: sharedReport?.analysisData ? typeof sharedReport.analysisData : 'undefined'
              }, null, 2)}
            </div>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Go to DLMETRIX
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  console.log('SharePage: Successfully rendering main content');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Share2 className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Shared DLMETRIX Report
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Analysis for: {sharedReport.url}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4 mr-1" />
                {timeRemaining}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(sharedReport.url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Visit Site
              </Button>
              <Button
                size="sm"
                onClick={() => window.location.href = '/'}
              >
                Analyze Your Site
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content - EXACT SAME STRUCTURE AS ORIGINAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Report Info Banner */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  Generated: {new Date(sharedReport.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Expires: {new Date(sharedReport.expiresAt).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Performance Overview */}
          <PerformanceOverview 
            performanceScore={Number(analysisData.performanceOverview.performance) || 0}
            accessibilityScore={Number(analysisData.performanceOverview.accessibility) || 0}
            bestPracticesScore={Number(analysisData.performanceOverview.bestPractices) || 0}
            seoScore={Number(analysisData.performanceOverview.seo) || 0}
            language="en"
          />

          {/* Core Web Vitals */}
          <CoreWebVitalsComponent data={analysisData.coreWebVitals} language="en" />

          {/* Screenshots */}
          <ScreenshotsView 
            mobileScreenshot={analysisData.screenshots?.mobile}
            desktopScreenshot={analysisData.screenshots?.desktop}
            url={analysisData.url}
            language="en"
          />

          {/* Legacy SEO Analysis - EXACT SAME STRUCTURE */}
          <div className="grid gap-4 sm:gap-6">
            {/* Preview Tabs */}
            <PreviewTabs data={analysisData} language="en" />

            {/* Meta Tags Analysis */}
            <MetaTagAnalysis data={analysisData} language="en" />

            {/* Heading Structure Analysis */}
            <HeadingStructureAnalysis data={analysisData} language="en" />

            {/* Open Graph and Twitter Cards */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <OpenGraphAnalysis data={analysisData} language="en" />
              <TwitterCardsAnalysis data={analysisData} language="en" />
            </div>

            {/* Visual Recommendations */}
            <VisualRecommendations recommendations={analysisData.recommendations} language="en" />

            {/* AI Search Content Analysis */}
            {analysisData.aiSearchAnalysis && (
              <AiSearchAnalysisComponent data={analysisData.aiSearchAnalysis} />
            )}

            {/* SEO Keyword Analysis */}
            {analysisData.keywordAnalysis && (
              <KeywordAnalysis data={analysisData.keywordAnalysis} />
            )}

            {/* Technical Checks */}
            <TechnicalSeo checks={analysisData.technicalSeoAnalysis} language="en" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}