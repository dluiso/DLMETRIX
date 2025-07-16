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

  console.log('SharePage mounted with token:', shareToken);

  const { data: sharedReport, isLoading, error } = useQuery<SharedReportData>({
    queryKey: ['/api/share', shareToken],
    enabled: !!shareToken,
  });

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
    const interval = setInterval(updateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [sharedReport?.expiresAt]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Loading Shared Report</h3>
            <p className="text-slate-600 dark:text-slate-400">Please wait while we fetch the analysis...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !sharedReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Report Not Found</h3>
            <p className="text-red-600 dark:text-red-300 mb-4">
              This shared report doesn't exist or has expired. Shared reports are only available for 12 hours.
            </p>
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

  // Use the analysis data directly
  const analysisData = sharedReport.analysisData;

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

      {/* Report Content */}
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
            performanceScore={analysisData.performanceScore}
            accessibilityScore={analysisData.accessibilityScore}
            bestPracticesScore={analysisData.bestPracticesScore}
            seoScore={analysisData.seoScore}
            language="en"
          />

          {/* Core Web Vitals */}
          <CoreWebVitalsComponent data={analysisData.coreWebVitals} language="en" />

          {/* Screenshots */}
          <ScreenshotsView 
            mobileScreenshot={analysisData.mobileScreenshot}
            desktopScreenshot={analysisData.desktopScreenshot}
            url={analysisData.url}
            language="en"
          />

          {/* SEO Analysis */}
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
            <TechnicalSeo checks={analysisData.technicalChecks} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}