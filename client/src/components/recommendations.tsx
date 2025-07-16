import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, AlertTriangle, CheckCircle, XCircle, Wrench, FileText, Code, ExternalLink, Bug, Settings, Database } from "lucide-react";
import { Recommendation } from "@/types/seo";
import { useState } from "react";

interface RecommendationsProps {
  recommendations: Recommendation[];
}

export default function Recommendations({ recommendations }: RecommendationsProps) {
  const getRecommendationIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
    }
  };

  const getRecommendationBg = (type: Recommendation['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
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
        return 'bg-red-100 dark:bg-red-800';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-800';
      case 'success':
        return 'bg-green-100 dark:bg-green-800';
    }
  };

  const getPriorityText = (type: Recommendation['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-600 dark:text-red-300';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-300';
      case 'success':
        return 'text-green-600 dark:text-green-300';
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
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center space-x-2 mb-4 sm:mb-6">
          <Lightbulb className="w-5 h-5 text-primary flex-shrink-0" />
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">SEO Recommendations</h3>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {recommendations.length} item{recommendations.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {sortedRecommendations.map((rec, index) => (
            <EnhancedRecommendationCard key={index} recommendation={rec} />
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

interface EnhancedRecommendationCardProps {
  recommendation: Recommendation;
}

function EnhancedRecommendationCard({ recommendation: rec }: EnhancedRecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getRecommendationIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
    }
  };

  const getRecommendationBg = (type: Recommendation['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
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
        return 'bg-red-100 dark:bg-red-800';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-800';
      case 'success':
        return 'bg-green-100 dark:bg-green-800';
    }
  };

  const getPriorityText = (type: Recommendation['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-600 dark:text-red-300';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-300';
      case 'success':
        return 'text-green-600 dark:text-green-300';
    }
  };

  return (
    <div className={`border rounded-lg ${getRecommendationBg(rec.type)}`}>
      {/* Main recommendation header */}
      <div className="flex items-start space-x-3 p-4">
        <div className={`w-6 h-6 ${getPriorityBg(rec.type)} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <span className={`text-sm font-bold ${getPriorityText(rec.type)}`}>
            {getPriorityIcon(rec.type)}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1 text-base">
                <span className="text-sm opacity-75">
                  {rec.priority === 'high' && 'High Priority: '}
                  {rec.priority === 'medium' && 'Medium Priority: '}
                  {rec.priority === 'low' && 'Low Priority: '}
                </span>
                {rec.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{rec.description}</p>
              
              {/* Current issue/value if available */}
              {(rec as any).currentValue && (
                <div className="mb-3 p-2 bg-slate-100 dark:bg-slate-800 rounded text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Current: </span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">{(rec as any).currentValue}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2 p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <Settings className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* Basic fix instructions */}
          {rec.howToFix && rec.howToFix !== 'Already implemented correctly' && (
            <div className="mt-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2 mb-2">
                <Wrench className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Quick Fix:</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {rec.howToFix}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Expanded technical details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="pt-4 grid gap-4 md:grid-cols-2">
            
            {/* Affected Files */}
            {(rec as any).affectedFiles && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Affected Files:</span>
                </div>
                <div className="pl-6 space-y-1">
                  {(rec as any).affectedFiles.map((file: string, idx: number) => (
                    <div key={idx} className="text-sm font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded">
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Location */}
            {(rec as any).technicalLocation && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Location:</span>
                </div>
                <div className="pl-6">
                  <div className="text-sm font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded">
                    {(rec as any).technicalLocation}
                  </div>
                </div>
              </div>
            )}

            {/* Detection Method */}
            {(rec as any).detectionMethod && (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Bug className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Detection Method:</span>
                </div>
                <div className="pl-6">
                  <div className="text-sm font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded">
                    {(rec as any).detectionMethod}
                  </div>
                </div>
              </div>
            )}

            {/* Code Example */}
            {(rec as any).codeExample && (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Code Example:</span>
                </div>
                <div className="pl-6">
                  <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                    {(rec as any).codeExample}
                  </pre>
                </div>
              </div>
            )}

            {/* Implementation Steps */}
            {(rec as any).implementation && (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Implementation Steps:</span>
                </div>
                <div className="pl-6">
                  <ol className="list-decimal list-inside space-y-1">
                    {(rec as any).implementation.map((step: string, idx: number) => (
                      <li key={idx} className="text-sm text-slate-600 dark:text-slate-400">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* SEO Impact */}
            {(rec as any).seoImpact && (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">SEO Impact:</span>
                </div>
                <div className="pl-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {(rec as any).seoImpact}
                  </p>
                </div>
              </div>
            )}

            {/* External Resources */}
            {(rec as any).externalResources && (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Learn More:</span>
                </div>
                <div className="pl-6 space-y-1">
                  {(rec as any).externalResources.map((resource: string, idx: number) => {
                    const [title, url] = resource.split(': ');
                    return (
                      <div key={idx}>
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {title} ↗
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Testing Tools */}
            {(rec as any).testingTools && (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Recommended Testing Tools:</span>
                </div>
                <div className="pl-6">
                  <div className="flex flex-wrap gap-2">
                    {(rec as any).testingTools.map((tool: string, idx: number) => (
                      <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
