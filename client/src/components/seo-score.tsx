import { Card, CardContent } from "@/components/ui/card";
import { Check, AlertTriangle, X, Tags } from "lucide-react";
import { SeoAnalysisResult } from "@/types/seo";

interface SeoScoreProps {
  data: SeoAnalysisResult;
}

export default function SeoScore({ data }: SeoScoreProps) {
  const score = data.score;
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // Calculate stats from recommendations
  const stats = data.recommendations.reduce(
    (acc, rec) => {
      if (rec.type === 'success') acc.passed++;
      else if (rec.type === 'warning') acc.warnings++;
      else if (rec.type === 'error') acc.errors++;
      return acc;
    },
    { passed: 0, warnings: 0, errors: 0 }
  );

  const totalTags = Object.keys(data.technicalSeoChecks).length + 
                   (data.title ? 1 : 0) + 
                   (data.description ? 1 : 0) + 
                   (data.openGraphTags ? Object.keys(data.openGraphTags).length : 0) + 
                   (data.twitterCardTags ? Object.keys(data.twitterCardTags).length : 0);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Work";
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-0">SEO Score Overview</h3>
          <div className="flex items-center justify-center sm:justify-end space-x-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 relative">
              <svg className="w-14 h-14 sm:w-16 sm:h-16 transform -rotate-90">
                <circle 
                  cx="28" 
                  cy="28" 
                  r="24" 
                  stroke="hsl(220, 13%, 91%)" 
                  strokeWidth="3" 
                  fill="none"
                  className="sm:hidden"
                />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  stroke="hsl(220, 13%, 91%)" 
                  strokeWidth="4" 
                  fill="none"
                  className="hidden sm:block"
                />
                <circle 
                  cx="28" 
                  cy="28" 
                  r="24" 
                  stroke={score >= 80 ? "hsl(142, 76%, 36%)" : score >= 60 ? "hsl(45, 93%, 47%)" : "hsl(0, 72%, 51%)"} 
                  strokeWidth="3" 
                  fill="none"
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={2 * Math.PI * 24 - (score / 100) * 2 * Math.PI * 24}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out sm:hidden"
                />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  stroke={score >= 80 ? "hsl(142, 76%, 36%)" : score >= 60 ? "hsl(45, 93%, 47%)" : "hsl(0, 72%, 51%)"} 
                  strokeWidth="4" 
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out hidden sm:block"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base sm:text-lg font-bold text-slate-900">{score}</span>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs sm:text-sm text-slate-600">Score</div>
              <div className={`text-xs font-medium ${getScoreColor(score)}`}>
                {getScoreStatus(score)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-slate-900">{stats.passed}</div>
            <div className="text-xs sm:text-sm text-slate-600">Passed</div>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-slate-900">{stats.warnings}</div>
            <div className="text-xs sm:text-sm text-slate-600">Warnings</div>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-slate-900">{stats.errors}</div>
            <div className="text-xs sm:text-sm text-slate-600">Errors</div>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Tags className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-slate-900">{totalTags}</div>
            <div className="text-xs sm:text-sm text-slate-600">Total Tags</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
