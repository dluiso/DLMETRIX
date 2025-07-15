import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Target, 
  FileText, 
  Database, 
  Lightbulb, 
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  Zap,
  Eye,
  Edit,
  ArrowRight,
  Copy
} from "lucide-react";
import type { AiSearchAnalysis } from "../../../shared/schema";

interface AiSearchAnalysisProps {
  data: AiSearchAnalysis;
}

export default function AiSearchAnalysisComponent({ data }: AiSearchAnalysisProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'topic': return <Target className="w-4 h-4" />;
      case 'entity': return <Database className="w-4 h-4" />;
      case 'fact': return <CheckCircle className="w-4 h-4" />;
      case 'definition': return <Info className="w-4 h-4" />;
      case 'quote': return <FileText className="w-4 h-4" />;
      case 'statistic': return <TrendingUp className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-slate-900 dark:text-slate-100">AI Search Content Analysis</CardTitle>
          </div>
          <Badge 
            variant={data.overallScore >= 80 ? "default" : data.overallScore >= 60 ? "secondary" : "destructive"}
            className="text-sm"
          >
            {data.overallScore}/100 AI Ready
          </Badge>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Analyze how AI search engines understand and index your website content for optimal AI-powered search results
        </p>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Best Content</TabsTrigger>
            <TabsTrigger value="improvements">Content Ideas</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="recommendations">Optimize</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* AI Readiness Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Overall AI Score</h4>
                  <span className={`text-lg font-bold ${getScoreColor(data.overallScore)}`}>
                    {data.overallScore}
                  </span>
                </div>
                <Progress 
                  value={data.overallScore} 
                  className="h-2"
                  indicatorClassName={getProgressColor(data.overallScore)}
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Content Quality</h4>
                  <span className={`text-lg font-bold ${getScoreColor(data.contentQuality)}`}>
                    {data.contentQuality}
                  </span>
                </div>
                <Progress 
                  value={data.contentQuality} 
                  className="h-2"
                  indicatorClassName={getProgressColor(data.contentQuality)}
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Structured Data</h4>
                  <span className={`text-lg font-bold ${getScoreColor(data.structuredDataScore)}`}>
                    {data.structuredDataScore}
                  </span>
                </div>
                <Progress 
                  value={data.structuredDataScore} 
                  className="h-2"
                  indicatorClassName={getProgressColor(data.structuredDataScore)}
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Semantic Clarity</h4>
                  <span className={`text-lg font-bold ${getScoreColor(data.semanticClarityScore)}`}>
                    {data.semanticClarityScore}
                  </span>
                </div>
                <Progress 
                  value={data.semanticClarityScore} 
                  className="h-2"
                  indicatorClassName={getProgressColor(data.semanticClarityScore)}
                />
              </div>
            </div>

            {/* Key Discoveries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Primary Topics</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.primaryTopics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                  {data.primaryTopics.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No topics identified</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <Database className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span>Key Entities</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.keyEntities.slice(0, 6).map((entity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {entity}
                    </Badge>
                  ))}
                  {data.keyEntities.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No entities found</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Factual Claims</span>
                </h4>
                <div className="space-y-2">
                  {data.factualClaims.slice(0, 2).map((claim, index) => (
                    <div key={index} className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 p-2 rounded">
                      {claim.length > 80 ? `${claim.substring(0, 80)}...` : claim}
                    </div>
                  ))}
                  {data.factualClaims.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No factual claims detected</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Best Content for AI Understanding</span>
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                High-quality content that AI engines can easily understand and use for search results
              </p>

              {data.bestContent.length > 0 ? (
                <div className="space-y-4">
                  {data.bestContent.map((content, index) => (
                    <div key={index} className="border dark:border-slate-600 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getContentTypeIcon(content.type)}
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">
                            {content.type}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(content.relevance * 100)}% relevance
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 p-3 rounded">
                          "{content.content}"
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <strong>Context:</strong> {content.context}
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-4 border-blue-400">
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            <Lightbulb className="w-3 h-3 inline mr-1" />
                            <strong>AI Optimization Tip:</strong> {content.aiOptimizationTip}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">No optimized content found for AI analysis</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="improvements" className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Edit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Content Improvement Recommendations</span>
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                AI-powered suggestions to improve your current content with specific replacement text and implementation guidance
              </p>

              {data.contentRecommendations && data.contentRecommendations.length > 0 ? (
                <div className="space-y-4">
                  {data.contentRecommendations.map((rec, index) => (
                    <div key={index} className="border dark:border-slate-600 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {rec.type === 'title' && <FileText className="w-4 h-4 text-blue-600" />}
                            {rec.type === 'heading' && <Database className="w-4 h-4 text-green-600" />}
                            {rec.type === 'paragraph' && <Edit className="w-4 h-4 text-purple-600" />}
                            {rec.type === 'meta_description' && <Info className="w-4 h-4 text-orange-600" />}
                            {rec.type === 'content_section' && <TrendingUp className="w-4 h-4 text-indigo-600" />}
                            <span className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                              {rec.type.replace('_', ' ')}
                            </span>
                          </div>
                          <Badge variant={rec.impact === 'high' ? 'destructive' : rec.impact === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                            {rec.impact} impact
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Current Content */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Content:</h5>
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border-l-4 border-red-400">
                            <p className="text-sm text-red-800 dark:text-red-200 font-mono whitespace-pre-wrap">
                              {rec.currentContent}
                            </p>
                          </div>
                        </div>

                        {/* Suggested Content */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">AI-Suggested Content:</h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(rec.suggestedContent)}
                              className="text-xs"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border-l-4 border-green-400">
                            <p className="text-sm text-green-800 dark:text-green-200 font-mono whitespace-pre-wrap">
                              {rec.suggestedContent}
                            </p>
                          </div>
                        </div>

                        {/* Implementation Details */}
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <h6 className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Why Change This?</h6>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{rec.reason}</p>
                          </div>
                          <div className="space-y-2">
                            <h6 className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Where to Implement</h6>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{rec.location}</p>
                          </div>
                        </div>

                        {/* Implementation Tip */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-4 border-blue-400">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            <Lightbulb className="w-3 h-3 inline mr-1" />
                            <strong>Implementation Tip:</strong> {rec.implementationTip}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Great! Your content is well-optimized. No major improvements needed.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span>AI Optimization Insights</span>
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Specific improvements to help AI engines better understand and rank your content
              </p>

              <div className="space-y-3">
                {data.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700 dark:text-slate-300">{improvement}</p>
                  </div>
                ))}
                {data.improvements.length === 0 && (
                  <div className="text-center py-6">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Your content is well-optimized for AI understanding!</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span>AI Search Optimization</span>
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Actionable recommendations to improve your website's performance in AI-powered search results
              </p>

              {data.aiRecommendations.length > 0 ? (
                <div className="space-y-4">
                  {data.aiRecommendations.map((rec, index) => (
                    <div key={index} className="border dark:border-slate-600 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-slate-900 dark:text-slate-100">{rec.title}</h5>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getBadgeVariant(rec.priority)} className="text-xs">
                            {rec.priority} priority
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {rec.category.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400">{rec.description}</p>
                      
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-4 border-blue-400">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Implementation:</strong> {rec.implementation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Excellent! Your content is already well-optimized for AI search engines.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}