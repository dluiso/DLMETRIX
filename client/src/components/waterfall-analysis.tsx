import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Clock, Download, FileText, Image, Zap, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { WaterfallAnalysis } from '@shared/schema';

interface WaterfallAnalysisProps {
  analysis: WaterfallAnalysis;
}

export function WaterfallAnalysis({ analysis }: WaterfallAnalysisProps) {
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [selectedResourceType, setSelectedResourceType] = useState<string>('all');

  if (!analysis || (!analysis.mobile && !analysis.desktop)) {
    return (
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <Clock className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            Waterfall Analysis Not Available
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Advanced resource loading analysis requires browser automation capabilities that are not available in this environment.
          </p>
        </div>
      </Card>
    );
  }

  const currentData = analysis[selectedDevice];
  
  if (!currentData || !currentData.resources) {
    return (
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <Clock className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No {selectedDevice} Data Available
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Waterfall analysis data is not available for {selectedDevice} view.
          </p>
        </div>
      </Card>
    );
  }

  const resourceTypes = ['all', 'document', 'stylesheet', 'script', 'image', 'font', 'fetch', 'xhr', 'other'];
  
  const filteredResources = selectedResourceType === 'all' 
    ? currentData.resources 
    : currentData.resources.filter(r => r.type === selectedResourceType);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'stylesheet': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'script': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'image': return <Image className="h-4 w-4 text-green-500" />;
      case 'font': return <FileText className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status >= 400) return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getResourceBarWidth = (resource: any) => {
    const maxEndTime = Math.max(...currentData.resources.map(r => r.endTime));
    return (resource.duration / maxEndTime) * 100;
  };

  const getResourceBarOffset = (resource: any) => {
    const maxEndTime = Math.max(...currentData.resources.map(r => r.endTime));
    return (resource.startTime / maxEndTime) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.totalResources}</div>
            <div className="text-xs text-muted-foreground">
              {currentData.renderBlockingResources} render-blocking
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(currentData.totalSize)}</div>
            <div className="text-xs text-muted-foreground">
              {formatBytes(currentData.totalTransferSize)} transferred
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Load Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(currentData.totalDuration)}</div>
            <div className="text-xs text-muted-foreground">
              {currentData.parallelRequests} max parallel
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.cacheHitRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              {currentData.compressionSavings.toFixed(1)}% compressed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Selector */}
      <Tabs value={selectedDevice} onValueChange={(value) => setSelectedDevice(value as 'mobile' | 'desktop')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="desktop">Desktop</TabsTrigger>
        </TabsList>

        <TabsContent value="mobile" className="space-y-4">
          <WaterfallView 
            data={analysis.mobile} 
            deviceType="mobile"
            selectedResourceType={selectedResourceType}
            onResourceTypeChange={setSelectedResourceType}
            resourceTypes={resourceTypes}
            filteredResources={filteredResources}
            getResourceIcon={getResourceIcon}
            getStatusIcon={getStatusIcon}
            formatBytes={formatBytes}
            formatTime={formatTime}
            getResourceBarWidth={getResourceBarWidth}
            getResourceBarOffset={getResourceBarOffset}
          />
        </TabsContent>

        <TabsContent value="desktop" className="space-y-4">
          <WaterfallView 
            data={analysis.desktop} 
            deviceType="desktop"
            selectedResourceType={selectedResourceType}
            onResourceTypeChange={setSelectedResourceType}
            resourceTypes={resourceTypes}
            filteredResources={filteredResources}
            getResourceIcon={getResourceIcon}
            getStatusIcon={getStatusIcon}
            formatBytes={formatBytes}
            formatTime={formatTime}
            getResourceBarWidth={getResourceBarWidth}
            getResourceBarOffset={getResourceBarOffset}
          />
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Recommendations</CardTitle>
            <CardDescription>
              Actionable suggestions to improve your resource loading performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={rec.type === 'critical' ? 'destructive' : rec.type === 'warning' ? 'default' : 'secondary'}>
                          {rec.type}
                        </Badge>
                        <Badge variant="outline">{rec.impact} impact</Badge>
                      </div>
                      <h4 className="font-medium mb-2">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                      <div className="text-sm">
                        <div className="font-medium mb-1">How to fix:</div>
                        <p className="text-muted-foreground mb-2">{rec.howToFix}</p>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          💡 {rec.potentialSavings}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      {analysis.insights && analysis.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>
              Key metrics and findings from your waterfall analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.insights.map((insight, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{insight.metric}</h4>
                    <Badge variant={insight.impact === 'positive' ? 'default' : insight.impact === 'negative' ? 'destructive' : 'secondary'}>
                      {insight.impact}
                    </Badge>
                  </div>
                  <div className="text-lg font-bold mb-1">{insight.value}</div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface WaterfallViewProps {
  data: any;
  deviceType: string;
  selectedResourceType: string;
  onResourceTypeChange: (type: string) => void;
  resourceTypes: string[];
  filteredResources: any[];
  getResourceIcon: (type: string) => React.ReactNode;
  getStatusIcon: (status: number) => React.ReactNode;
  formatBytes: (bytes: number) => string;
  formatTime: (ms: number) => string;
  getResourceBarWidth: (resource: any) => number;
  getResourceBarOffset: (resource: any) => number;
}

function WaterfallView({
  data,
  deviceType,
  selectedResourceType,
  onResourceTypeChange,
  resourceTypes,
  filteredResources,
  getResourceIcon,
  getStatusIcon,
  formatBytes,
  formatTime,
  getResourceBarWidth,
  getResourceBarOffset
}: WaterfallViewProps) {
  return (
    <div className="space-y-4">
      {/* Resource Type Filter */}
      <div className="flex flex-wrap gap-2">
        {resourceTypes.map(type => (
          <button
            key={type}
            onClick={() => onResourceTypeChange(type)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedResourceType === type
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Waterfall Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Resource Loading Timeline ({deviceType})
          </CardTitle>
          <CardDescription>
            Visual representation of resource loading sequence and timing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {filteredResources.map((resource, index) => (
              <div key={index} className="flex items-center gap-2 py-1 hover:bg-muted/50 rounded px-2">
                <div className="flex items-center gap-2 w-1/3 min-w-0">
                  {getResourceIcon(resource.type)}
                  {getStatusIcon(resource.status)}
                  <span className="text-sm truncate" title={resource.url}>
                    {resource.url.split('/').pop() || resource.url}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="relative h-4 bg-gray-100 dark:bg-gray-800 rounded">
                    <div
                      className={`absolute h-full rounded ${
                        resource.isRenderBlocking ? 'bg-red-500' : 
                        resource.isCritical ? 'bg-yellow-500' : 
                        'bg-blue-500'
                      }`}
                      style={{
                        left: `${getResourceBarOffset(resource)}%`,
                        width: `${getResourceBarWidth(resource)}%`
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatBytes(resource.size)}</span>
                  <span>{formatTime(resource.duration)}</span>
                  {resource.cached && <Badge variant="outline" className="text-xs">Cached</Badge>}
                </div>
              </div>
            ))}
          </div>
          
          {filteredResources.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No resources found for the selected filter
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}