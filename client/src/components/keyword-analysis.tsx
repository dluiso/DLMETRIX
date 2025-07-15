import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  Minus,
  Search,
  Target,
  BarChart3,
  Trophy,
  AlertTriangle,
  Eye,
  Users,
  Zap
} from "lucide-react";
import type { SeoKeywordAnalysis } from "../../../shared/schema";

interface KeywordAnalysisProps {
  data: SeoKeywordAnalysis;
}

export default function KeywordAnalysis({ data }: KeywordAnalysisProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'falling':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-600 dark:text-green-400';
    if (difficulty < 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getOpportunityColor = (opportunity: number) => {
    if (opportunity > 70) return 'text-green-600 dark:text-green-400';
    if (opportunity > 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>SEO Keyword Analysis</span>
          <Badge variant="outline" className="ml-2">
            Score: {data.overallKeywordScore}/100
          </Badge>
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Comprehensive keyword performance analysis with trend insights and optimization opportunities
        </p>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="primary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="primary">Primary</TabsTrigger>
            <TabsTrigger value="secondary">Secondary</TabsTrigger>
            <TabsTrigger value="longtail">Long-tail</TabsTrigger>
            <TabsTrigger value="density">Density</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>

          <TabsContent value="primary" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Target className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>Primary Keywords</span>
                <Badge variant="secondary" className="text-xs">
                  {data.primaryKeywords.length} keywords
                </Badge>
              </h4>
              
              {data.primaryKeywords.map((keyword, index) => (
                <div key={index} className="border dark:border-slate-600 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium text-slate-900 dark:text-slate-100">
                        "{keyword.keyword}"
                      </h5>
                      {getTrendIcon(keyword.trend)}
                      <Badge className={getCompetitionColor(keyword.competition)}>
                        {keyword.competition} competition
                      </Badge>
                    </div>
                    {keyword.position && (
                      <Badge variant="outline" className="text-xs">
                        Rank #{keyword.position}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-slate-600 dark:text-slate-400 text-xs">Monthly Volume</p>
                      <p className="font-medium flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {keyword.volume.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-600 dark:text-slate-400 text-xs">Difficulty</p>
                      <p className={`font-medium ${getDifficultyColor(keyword.difficulty)}`}>
                        {keyword.difficulty}/100
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-600 dark:text-slate-400 text-xs">Opportunity</p>
                      <p className={`font-medium ${getOpportunityColor(keyword.opportunity)}`}>
                        {keyword.opportunity}/100
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-600 dark:text-slate-400 text-xs">Trend</p>
                      <p className="font-medium capitalize">{keyword.trend}</p>
                    </div>
                  </div>

                  {keyword.relatedKeywords.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Related Keywords:</p>
                      <div className="flex flex-wrap gap-1">
                        {keyword.relatedKeywords.map((related, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {related}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="secondary" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Secondary Keywords</span>
                <Badge variant="secondary" className="text-xs">
                  {data.secondaryKeywords.length} keywords
                </Badge>
              </h4>
              
              <div className="grid gap-3">
                {data.secondaryKeywords.map((keyword, index) => (
                  <div key={index} className="border dark:border-slate-600 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          "{keyword.keyword}"
                        </span>
                        {getTrendIcon(keyword.trend)}
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          {keyword.volume.toLocaleString()} vol
                        </span>
                        <Badge className={getCompetitionColor(keyword.competition)}>
                          {keyword.competition}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-slate-600 dark:text-slate-400">
                      <span>Difficulty: <span className={getDifficultyColor(keyword.difficulty)}>{keyword.difficulty}</span></span>
                      <span>Opportunity: <span className={getOpportunityColor(keyword.opportunity)}>{keyword.opportunity}</span></span>
                      {keyword.position && <span>Rank: #{keyword.position}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="longtail" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Long-tail Keywords</span>
                <Badge variant="secondary" className="text-xs">
                  {data.longTailKeywords.length} keywords
                </Badge>
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Long-tail keywords typically have lower competition and higher conversion rates
              </p>
              
              <div className="grid gap-2">
                {data.longTailKeywords.map((keyword, index) => (
                  <div key={index} className="border dark:border-slate-600 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        "{keyword.keyword}"
                      </span>
                      <div className="flex items-center space-x-2 text-sm">
                        {getTrendIcon(keyword.trend)}
                        <span className="text-slate-600 dark:text-slate-400">
                          {keyword.volume.toLocaleString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Difficulty: {keyword.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="density" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Eye className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span>Keyword Density Analysis</span>
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Optimal keyword density is typically between 0.5% and 3% for natural content
              </p>
              
              <div className="space-y-3">
                {Object.entries(data.keywordDensity).map(([keyword, density]) => (
                  <div key={keyword} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        "{keyword}"
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {density.toFixed(2)}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Progress 
                        value={Math.min(density * 20, 100)} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>0%</span>
                        <span className={density > 3 ? 'text-red-500' : density < 0.5 ? 'text-yellow-500' : 'text-green-500'}>
                          {density > 3 ? 'Too high' : density < 0.5 ? 'Too low' : 'Good'}
                        </span>
                        <span>5%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span>Keyword Opportunities</span>
              </h4>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h5 className="font-medium text-slate-800 dark:text-slate-200 flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span>Missed Opportunities</span>
                  </h5>
                  <div className="space-y-2">
                    {data.missedOpportunities.map((opportunity, index) => (
                      <div key={index} className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded border-l-4 border-orange-400">
                        <p className="text-sm text-orange-800 dark:text-orange-200">
                          {opportunity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium text-slate-800 dark:text-slate-200 flex items-center space-x-1">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span>Competitor Keywords</span>
                  </h5>
                  <div className="space-y-2">
                    {data.competitorKeywords.map((keyword, index) => (
                      <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-4 border-blue-400">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          "{keyword}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                  Overall Keyword Performance
                </h5>
                <div className="flex items-center space-x-2 mb-2">
                  <Progress value={data.overallKeywordScore} className="flex-1" />
                  <span className="text-sm font-medium">{data.overallKeywordScore}/100</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {data.overallKeywordScore >= 80 ? 'Excellent keyword optimization!' :
                   data.overallKeywordScore >= 60 ? 'Good keyword strategy with room for improvement' :
                   data.overallKeywordScore >= 40 ? 'Moderate keyword optimization, focus on improvements' :
                   'Significant keyword optimization needed'}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}