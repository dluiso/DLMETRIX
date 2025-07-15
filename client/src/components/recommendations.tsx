import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Recommendation } from "@/types/seo";

interface RecommendationsProps {
  recommendations: Recommendation[];
}

export default function Recommendations({ recommendations }: RecommendationsProps) {
  const getRecommendationIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getRecommendationBg = (type: Recommendation['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
    }
  };

  const getPriorityIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'error':
        return '!';
      case 'warning':
        return '⚠';
      case 'success':
        return '✓';
    }
  };

  const getPriorityBg = (type: Recommendation['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'success':
        return 'bg-green-100';
    }
  };

  const getPriorityText = (type: Recommendation['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'success':
        return 'text-green-600';
    }
  };

  // Sort recommendations by priority and type
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const typeOrder = { error: 0, warning: 1, success: 2 };
    
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    return typeOrder[a.type] - typeOrder[b.type];
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-slate-900">Recommendations</h3>
        </div>
        
        <div className="space-y-4">
          {sortedRecommendations.map((rec, index) => (
            <div key={index} className={`flex items-start space-x-3 p-4 rounded-lg border ${getRecommendationBg(rec.type)}`}>
              <div className={`w-6 h-6 ${getPriorityBg(rec.type)} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <span className={`text-sm font-bold ${getPriorityText(rec.type)}`}>
                  {getPriorityIcon(rec.type)}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 mb-1">
                  {rec.priority === 'high' && 'High Priority: '}
                  {rec.priority === 'medium' && 'Medium Priority: '}
                  {rec.priority === 'low' && 'Low Priority: '}
                  {rec.title}
                </h4>
                <p className="text-sm text-slate-600">{rec.description}</p>
              </div>
            </div>
          ))}
          
          {recommendations.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              <p>No recommendations available. Analyze a website to get started!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
