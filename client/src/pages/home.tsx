import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, HelpCircle, Search } from "lucide-react";
import UrlInput from "@/components/url-input";
import SeoScore from "@/components/seo-score";
import MetaTagAnalysis from "@/components/meta-tag-analysis";
import Recommendations from "@/components/recommendations";
import Previews from "@/components/previews";
import TechnicalSeo from "@/components/technical-seo";
import { SeoAnalysisResult } from "@/types/seo";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [seoData, setSeoData] = useState<SeoAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (url: string): Promise<SeoAnalysisResult> => {
      const response = await apiRequest("POST", "/api/seo/analyze", { url });
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
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">SEO Tag Analyzer</h1>
                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">Analyze and optimize your website's meta tags</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                <HelpCircle className="w-4 h-4" />
              </Button>
              <Button className="bg-primary hover:bg-blue-700 text-sm">
                <Bookmark className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Save Report</span>
                <span className="sm:hidden">Save</span>
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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column - SEO Analysis */}
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              <SeoScore data={seoData} />
              <MetaTagAnalysis data={seoData} />
              <Recommendations recommendations={seoData.recommendations} />
            </div>

            {/* Right Column - Previews */}
            <div className="space-y-4 sm:space-y-6">
              <Previews data={seoData} />
              <TechnicalSeo checks={seoData.technicalSeoChecks} />
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
              <p className="text-sm sm:text-base text-slate-600">Fetching HTML and parsing meta tags...</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
