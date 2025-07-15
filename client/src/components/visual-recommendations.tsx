import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Zap,
  Target
} from "lucide-react";
import { Recommendation } from "@/types/seo";

interface VisualRecommendationsProps {
  recommendations: Recommendation[];
}

export default function VisualRecommendations({ recommendations }: VisualRecommendationsProps) {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return { 
          icon: XCircle, 
          color: 'text-red-600 dark:text-red-400', 
          bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          badge: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
        };
      case 'medium':
        return { 
          icon: AlertTriangle, 
          color: 'text-yellow-600 dark:text-yellow-400', 
          bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
          badge: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
        };
      case 'low':
        return { 
          icon: TrendingUp, 
          color: 'text-blue-600 dark:text-blue-400', 
          bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          badge: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
        };
      default:
        return { 
          icon: CheckCircle, 
          color: 'text-green-600 dark:text-green-400', 
          bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          badge: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return XCircle;
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      default:
        return Target;
    }
  };

  // Group recommendations by priority
  const groupedRecommendations = recommendations.reduce((acc, rec) => {
    if (!acc[rec.priority]) acc[rec.priority] = [];
    acc[rec.priority].push(rec);
    return acc;
  }, {} as Record<string, Recommendation[]>);

  const priorityOrder = ['high', 'medium', 'low'];

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center space-x-2 mb-4 sm:mb-6">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
            SEO Recommendations
          </h3>
          <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {recommendations.length} items
          </Badge>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Excellent SEO!</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No major issues found. Your page is well optimized.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {priorityOrder.map((priority) => {
              const items = groupedRecommendations[priority] || [];
              if (items.length === 0) return null;

              const config = getPriorityConfig(priority);

              return (
                <div key={priority}>
                  <div className="flex items-center space-x-2 mb-3">
                    <config.icon className={`w-4 h-4 ${config.color}`} />
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                      {priority} Priority
                    </h4>
                    <Badge className={config.badge}>
                      {items.length}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {items.map((rec, index) => {
                      const TypeIcon = getTypeIcon(rec.type);
                      
                      return (
                        <div 
                          key={index}
                          className={`border rounded-lg p-3 sm:p-4 ${config.bg}`}
                        >
                          <div className="flex items-start space-x-3">
                            <TypeIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color}`} />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-slate-900 dark:text-slate-100 text-sm mb-1">
                                {rec.title}
                              </h5>
                              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                {rec.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}