import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, X, Tags, TrendingUp, Award } from "lucide-react";
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
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Work";
  };

  const passedPercentage = Math.round((stats.passed / (stats.passed + stats.warnings + stats.errors || 1)) * 100);
  const warningsPercentage = Math.round((stats.warnings / (stats.passed + stats.warnings + stats.errors || 1)) * 100);
  const failedPercentage = Math.round((stats.errors / (stats.passed + stats.warnings + stats.errors || 1)) * 100);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className={`rounded-lg p-4 ${
        score >= 80 ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 
        score >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : 
        'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Award className={`w-6 h-6 ${
              score >= 80 ? 'text-green-600 dark:text-green-400' : 
              score >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 
              'text-red-600 dark:text-red-400'
            }`} />
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">SEO Analysis Results</h2>
              <p className={`text-sm ${
                score >= 80 ? 'text-green-700 dark:text-green-300' : 
                score >= 60 ? 'text-yellow-700 dark:text-yellow-300' : 
                'text-red-700 dark:text-red-300'
              }`}>
                Scored {stats.passed} passed, {stats.warnings} warnings, {stats.errors} failed
              </p>
            </div>
          </div>
          <Badge className={`${
            score >= 80 ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' : 
            score >= 60 ? 'bg-yellow-200 text-yellow-800' : 
            'bg-red-200 text-red-800'
          } text-sm font-semibold px-3 py-1`}>
            {getScoreStatus(score)}
          </Badge>
        </div>
      </div>

      {/* Main Analysis Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Score Circle */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="56" 
                    stroke="hsl(220, 13%, 91%)" 
                    strokeWidth="8" 
                    fill="none"
                  />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="56" 
                    stroke={score >= 80 ? "hsl(142, 76%, 36%)" : score >= 60 ? "hsl(45, 93%, 47%)" : "hsl(0, 72%, 51%)"} 
                    strokeWidth="8" 
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-slate-900">{score}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Overall SEO Score</h3>
              <p className={`text-lg font-semibold ${getScoreColor(score)}`}>
                {getScoreStatus(score)}
              </p>
            </div>

            {/* Right: SEO Health Summary */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900">SEO Health Summary</h3>
              </div>

              <div className="grid gap-4 mb-6">
                {/* Passed Checks */}
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-green-800">Passed Checks</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{stats.passed}</span>
                </div>

                {/* Warnings */}
                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-yellow-800">Warnings</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">{stats.warnings}</span>
                </div>

                {/* Failed Checks */}
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <X className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-red-800">Failed Checks</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{stats.errors}</span>
                </div>
              </div>

              {/* Check Distribution */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Check Distribution</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                  <div className="flex h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500 transition-all duration-1000 ease-out" 
                      style={{ width: `${passedPercentage}%` }}
                    />
                    <div 
                      className="bg-yellow-500 transition-all duration-1000 ease-out" 
                      style={{ width: `${warningsPercentage}%` }}
                    />
                    <div 
                      className="bg-red-500 transition-all duration-1000 ease-out" 
                      style={{ width: `${failedPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{passedPercentage}% Passed</span>
                  <span>{warningsPercentage}% Warnings</span>
                  <span>{failedPercentage}% Failed</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
