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
          color: 'text-red-600', 
          bg: 'bg-red-50 border-red-200',
          badge: 'bg-red-100 text-red-800'
        };
      case 'medium':
        return { 
          icon: AlertTriangle, 
          color: 'text-yellow-600', 
          bg: 'bg-yellow-50 border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-800'
        };
      case 'low':
        return { 
          icon: TrendingUp, 
          color: 'text-blue-600', 
          bg: 'bg-blue-50 border-blue-200',
          badge: 'bg-blue-100 text-blue-800'
        };
      default:
        return { 
          icon: CheckCircle, 
          color: 'text-green-600', 
          bg: 'bg-green-50 border-green-200',
          badge: 'bg-green-100 text-green-800'
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
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">
            SEO Recommendations
          </h3>
          <Badge className="bg-slate-100 text-slate-700">
            {recommendations.length} items
          </Badge>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-medium text-slate-900 mb-1">Excellent SEO!</h4>
            <p className="text-sm text-slate-600">
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
                    <h4 className="font-medium text-slate-900 capitalize">
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
                              <h5 className="font-medium text-slate-900 text-sm mb-1">
                                {rec.title}
                              </h5>
                              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
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