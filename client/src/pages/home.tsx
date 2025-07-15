import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, HelpCircle, Search, Download } from "lucide-react";
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
import { exportToPDF } from "@/lib/pdf-export";

export default function Home() {
  const [seoData, setSeoData] = useState<WebAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (url: string): Promise<WebAnalysisResult> => {
      const response = await apiRequest("POST", "/api/web/analyze", { url });
      return response.json();
    },
    onSuccess: (data) => {
      setSeoData(data);
      setError(null);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : "Failed to analyze website");
      setSeoData(null);
    },
  });

  const handleAnalyze = async (url: string) => {
    setError(null);
    analyzeMutation.mutate(url);
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
      await exportToPDF(seoData);
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
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                <HelpCircle className="w-4 h-4" />
              </Button>
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

      {/* Loading Overlay */}
      {analyzeMutation.isPending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 sm:p-8 max-w-sm sm:max-w-md mx-auto w-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mb-4"></div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">Analyzing Website</h3>
              <p className="text-sm sm:text-base text-slate-600">Running Lighthouse analysis, capturing screenshots, and measuring Core Web Vitals...</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
