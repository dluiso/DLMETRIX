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
    <Card className="shadow-elegant bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 animate-fade-in" data-component="performance-overview">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {t.performanceOverview}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Overall Score */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 mb-4">
              {/* Circular Progress */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-slate-200 dark:text-slate-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${overallScore * 2.83} 283`}
                  className={overallScore >= 90 ? "text-green-500" : overallScore >= 50 ? "text-yellow-500" : "text-red-500"}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              {language === 'en' ? 'Average score across all categories' : 'Puntuación promedio en todas las categorías'}
            </p>
          </div>

          {/* Right Side - Category Scores in 2x2 Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((category, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={getScoreColor(category.score)}>
                      {category.icon}
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      {category.title}
                    </h3>
                  </div>
                  <Badge variant={getBadgeVariant(category.score)} className="text-xs">
                    {category.score}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  {category.description}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Score</span>
                  <Progress 
                    value={category.score} 
                    className="flex-1 h-2"
                  />
                  <span className={`font-medium ${getScoreColor(category.score)}`}>
                    {category.score}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}