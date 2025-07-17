import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Activity
} from "lucide-react";
import { getTranslations } from "@/lib/translations";

interface HealthIndicatorProps {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  language?: 'en' | 'es';
  animated?: boolean;
}

export default function HealthIndicator({ 
  performanceScore, 
  accessibilityScore, 
  bestPracticesScore, 
  seoScore,
  language = 'en',
  animated = true
}: HealthIndicatorProps) {
  const t = getTranslations(language);
  
  const overallScore = Math.round((performanceScore + accessibilityScore + bestPracticesScore + seoScore) / 4);
  
  const getHealthStatus = (score: number) => {
    if (score >= 90) return { status: 'excellent', color: 'green', icon: CheckCircle };
    if (score >= 70) return { status: 'good', color: 'blue', icon: TrendingUp };
    if (score >= 50) return { status: 'warning', color: 'yellow', icon: AlertTriangle };
    return { status: 'critical', color: 'red', icon: XCircle };
  };
  
  const health = getHealthStatus(overallScore);
  const IconComponent = health.icon;
  
  const getHealthMessage = () => {
    const messages = {
      excellent: {
        en: "Excellent website health! Your site follows best practices.",
        es: "¡Excelente salud del sitio! Tu sitio sigue las mejores prácticas."
      },
      good: {
        en: "Good website health with minor optimization opportunities.",
        es: "Buena salud del sitio con oportunidades menores de optimización."
      },
      warning: {
        en: "Website needs attention. Several areas need improvement.",
        es: "El sitio necesita atención. Varias áreas necesitan mejoras."
      },
      critical: {
        en: "Critical issues detected. Immediate action required.",
        es: "Problemas críticos detectados. Se requiere acción inmediata."
      }
    };
    return messages[health.status][language];
  };
  
  const getColorClasses = (color: string) => {
    const classes = {
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-800 dark:text-green-200',
        icon: 'text-green-600 dark:text-green-400',
        progress: 'bg-green-500'
      },
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-800 dark:text-blue-200',
        icon: 'text-blue-600 dark:text-blue-400',
        progress: 'bg-blue-500'
      },
      yellow: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-800 dark:text-yellow-200',
        icon: 'text-yellow-600 dark:text-yellow-400',
        progress: 'bg-yellow-500'
      },
      red: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-800 dark:text-red-200',
        icon: 'text-red-600 dark:text-red-400',
        progress: 'bg-red-500'
      }
    };
    return classes[color];
  };
  
  const colorClasses = getColorClasses(health.color);
  
  return (
    <Card className={`${colorClasses.bg} ${colorClasses.border} ${animated ? 'animate-pulse-subtle' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Activity className={`w-5 h-5 ${colorClasses.icon}`} />
            <h3 className={`font-semibold ${colorClasses.text}`}>
              {language === 'es' ? 'Salud del Sitio' : 'Website Health'}
            </h3>
          </div>
          <Badge variant="outline" className={`${colorClasses.text} ${colorClasses.border}`}>
            {overallScore}/100
          </Badge>
        </div>
        
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses.bg} ${colorClasses.border} border-2`}>
              <IconComponent className={`w-6 h-6 ${colorClasses.icon}`} />
            </div>
            {animated && (
              <div className={`absolute inset-0 rounded-full ${colorClasses.border} border-2 animate-ping opacity-30`}></div>
            )}
          </div>
          
          <div className="flex-1">
            <div className={`text-sm font-medium ${colorClasses.text} mb-1`}>
              {health.status === 'excellent' ? (language === 'es' ? 'Excelente' : 'Excellent') :
               health.status === 'good' ? (language === 'es' ? 'Bueno' : 'Good') :
               health.status === 'warning' ? (language === 'es' ? 'Necesita Atención' : 'Needs Attention') :
               (language === 'es' ? 'Crítico' : 'Critical')}
            </div>
            <div className={`text-xs ${colorClasses.text} opacity-80`}>
              {getHealthMessage()}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className={colorClasses.text}>
              {language === 'es' ? 'Progreso General' : 'Overall Progress'}
            </span>
            <span className={`font-medium ${colorClasses.text}`}>{overallScore}%</span>
          </div>
          <Progress 
            value={overallScore} 
            className="h-2"
            // @ts-ignore
            style={{ '--progress-foreground': colorClasses.progress }}
          />
        </div>
        
        {/* Mini breakdown */}
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="flex items-center justify-between">
            <span className={`${colorClasses.text} opacity-80`}>
              {language === 'es' ? 'Rendimiento' : 'Performance'}
            </span>
            <span className={`font-medium ${colorClasses.text}`}>{performanceScore}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`${colorClasses.text} opacity-80`}>SEO</span>
            <span className={`font-medium ${colorClasses.text}`}>{seoScore}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`${colorClasses.text} opacity-80`}>
              {language === 'es' ? 'Accesibilidad' : 'Accessibility'}
            </span>
            <span className={`font-medium ${colorClasses.text}`}>{accessibilityScore}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`${colorClasses.text} opacity-80`}>
              {language === 'es' ? 'Prácticas' : 'Practices'}
            </span>
            <span className={`font-medium ${colorClasses.text}`}>{bestPracticesScore}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}