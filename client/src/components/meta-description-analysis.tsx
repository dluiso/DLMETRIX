import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Check, AlertTriangle, X } from "lucide-react";
import { SeoAnalysisResult } from "@/types/seo";

interface MetaDescriptionAnalysisProps {
  data: SeoAnalysisResult;
}

export default function MetaDescriptionAnalysis({ data }: MetaDescriptionAnalysisProps) {
  const getStatusIcon = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return <Check className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      case 'error':
        return <X className="w-4 h-4 text-red-600 dark:text-red-400" />;
    }
  };

  const getStatusBadge = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100">GOOD</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 hover:bg-yellow-100">NEEDS IMPROVEMENT</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100">MISSING</Badge>;
    }
  };

  const getDescriptionStatus = () => {
    if (!data.description) return 'error';
    const length = data.description.length;
    if (length >= 150 && length <= 160) return 'good';
    if (length >= 120 && length <= 200) return 'warning';
    return 'error';
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-primary flex-shrink-0" />
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">Meta Description</h3>
        </div>
        
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon(getDescriptionStatus())}
              <span className="font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base">Description</span>
            </div>
            {getStatusBadge(getDescriptionStatus())}
          </div>
          
          {data.description ? (
            <div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
                "{data.description}"
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Length: {data.description.length} characters</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span>Optimal: 150-160 characters</span>
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic">No meta description found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}