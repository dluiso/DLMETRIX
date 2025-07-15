import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, CheckCircle, Search, Monitor, Smartphone } from "lucide-react";
import { getTranslations } from "@/lib/translations";

interface PerformanceOverviewProps {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  language?: 'en' | 'es';
}

export default function PerformanceOverview({ 
  performanceScore, 
  accessibilityScore, 
  bestPracticesScore, 
  seoScore,
  language = 'en'
}: PerformanceOverviewProps) {
  const t = getTranslations(language);
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getBadgeVariant = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 50) return "secondary";
    return "destructive";
  };

  const categories = [
    {
      title: t.performance,
      score: performanceScore,
      icon: <TrendingUp className="w-5 h-5" />,
      description: language === 'en' ? "Load speed and runtime performance" : "Velocidad de carga y rendimiento en tiempo de ejecución"
    },
    {
      title: t.accessibility,
      score: accessibilityScore,
      icon: <Shield className="w-5 h-5" />,
      description: language === 'en' ? "Usability for people with disabilities" : "Usabilidad para personas con discapacidades"
    },
    {
      title: t.bestPractices,
      score: bestPracticesScore,
      icon: <CheckCircle className="w-5 h-5" />,
      description: language === 'en' ? "Modern web development standards" : "Estándares modernos de desarrollo web"
    },
    {
      title: t.seo,
      score: seoScore,
      icon: <Search className="w-5 h-5" />,
      description: language === 'en' ? "Search engine optimization" : "Optimización para motores de búsqueda"
    }
  ];

  const overallScore = Math.round((performanceScore + accessibilityScore + bestPracticesScore + seoScore) / 4);

  return (
    <div className="grid gap-4 sm:gap-6" data-component="performance-overview">
      {/* Overall Score */}
      <Card className="shadow-elegant bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 animate-fade-in">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-base sm:text-lg text-slate-900 dark:text-slate-100">{t.performanceOverview}</CardTitle>
            <Badge variant={getBadgeVariant(overallScore)} className="text-sm sm:text-lg px-2 sm:px-3 py-1 w-fit">
              {overallScore}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-200 dark:text-slate-600"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${overallScore * 2.51} 251`}
                  className={getScoreColor(overallScore)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </span>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-4">
            Average score across all categories
          </p>
        </CardContent>
      </Card>

      {/* Individual Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {categories.map((category) => (
          <Card key={category.title} className="shadow-elegant bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <div className="flex items-center space-x-3">
                  <div className="text-slate-600 dark:text-slate-400">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base">{category.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{category.description}</p>
                  </div>
                </div>
                <Badge variant={getBadgeVariant(category.score)} className="text-sm sm:text-lg px-2 sm:px-3 py-1 w-fit">
                  {category.score}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Score</span>
                  <span className={`font-medium ${getScoreColor(category.score)}`}>
                    {category.score}/100
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(category.score)}`}
                    style={{ width: `${category.score}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}