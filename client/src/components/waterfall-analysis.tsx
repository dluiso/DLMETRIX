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
    // Usar el tiempo de duración real, no el tiempo total
    return Math.max((resource.duration / maxEndTime) * 80, 2); // Máximo 80% del ancho, mínimo 2%
  };

  const getResourceBarOffset = (resource: any) => {
    const maxEndTime = Math.max(...currentData.resources.map(r => r.endTime));
    return (resource.startTime / maxEndTime) * 80; // Máximo 80% para dejar espacio
  };

  // Nueva función para obtener el color basado en el tiempo de carga
  const getPerformanceColor = (duration: number) => {
    // Definir rangos de tiempo (en ms)
    if (duration <= 100) return 'bg-gradient-to-r from-green-400 to-green-500'; // Excelente
    if (duration <= 300) return 'bg-gradient-to-r from-green-300 to-yellow-400'; // Bueno
    if (duration <= 500) return 'bg-gradient-to-r from-yellow-400 to-orange-400'; // Aceptable
    if (duration <= 1000) return 'bg-gradient-to-r from-orange-400 to-red-400'; // Lento
    return 'bg-gradient-to-r from-red-400 to-red-600'; // Muy lento
  };

  // Nueva función para obtener el color del texto basado en el tiempo
  const getPerformanceTextColor = (duration: number) => {
    if (duration <= 100) return 'text-green-600 dark:text-green-400';
    if (duration <= 300) return 'text-yellow-600 dark:text-yellow-400';
    if (duration <= 500) return 'text-orange-600 dark:text-orange-400';
    if (duration <= 1000) return 'text-red-600 dark:text-red-400';
    return 'text-red-700 dark:text-red-500';
  };

  // Función para obtener íconos específicos mejorados para cada tipo de recurso
  const getEnhancedResourceIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'stylesheet': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'script': return <Zap className="h-4 w-4 text-yellow-600" />;
      case 'image': return <Image className="h-4 w-4 text-green-600" />;
      case 'font': return <FileText className="h-4 w-4 text-purple-600" />;
      case 'fetch': return <Download className="h-4 w-4 text-cyan-600" />;
      case 'xhr': return <Download className="h-4 w-4 text-indigo-600" />;
      case 'other': return <FileText className="h-4 w-4 text-gray-600" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
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
            getResourceIcon={getEnhancedResourceIcon}
            getStatusIcon={getStatusIcon}
            formatBytes={formatBytes}
            formatTime={formatTime}
            getResourceBarWidth={getResourceBarWidth}
            getResourceBarOffset={getResourceBarOffset}
            getPerformanceColor={getPerformanceColor}
            getPerformanceTextColor={getPerformanceTextColor}
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
            getResourceIcon={getEnhancedResourceIcon}
            getStatusIcon={getStatusIcon}
            formatBytes={formatBytes}
            formatTime={formatTime}
            getResourceBarWidth={getResourceBarWidth}
            getResourceBarOffset={getResourceBarOffset}
            getPerformanceColor={getPerformanceColor}
            getPerformanceTextColor={getPerformanceTextColor}
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
  getPerformanceColor: (duration: number) => string;
  getPerformanceTextColor: (duration: number) => string;
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
  getResourceBarOffset,
  getPerformanceColor,
  getPerformanceTextColor
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
          {/* Performance Legend */}
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-sm font-medium mb-2">Performance Legend:</div>
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded"></div>
                <span>≤100ms (Excelente)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 bg-gradient-to-r from-green-300 to-yellow-400 rounded"></div>
                <span>≤300ms (Bueno)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded"></div>
                <span>≤500ms (Aceptable)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded"></div>
                <span>≤1000ms (Lento)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 bg-gradient-to-r from-red-400 to-red-600 rounded"></div>
                <span>&gt;1000ms (Muy lento)</span>
              </div>
            </div>
          </div>

          {/* Timeline Scale */}
          {data && data.resources && data.resources.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 w-1/3 min-w-0">
                <div className="text-xs text-muted-foreground font-medium">Escala de Tiempo:</div>
              </div>
              <div className="flex-1 ml-2">
                <div className="relative h-6 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded border">
                  <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-muted-foreground">
                    <span>0ms</span>
                    <span>{formatTime(Math.max(...data.resources.map(r => r.endTime)) * 0.25)}</span>
                    <span>{formatTime(Math.max(...data.resources.map(r => r.endTime)) * 0.5)}</span>
                    <span>{formatTime(Math.max(...data.resources.map(r => r.endTime)) * 0.75)}</span>
                    <span>{formatTime(Math.max(...data.resources.map(r => r.endTime)))}</span>
                  </div>
                  {/* Marcas de tiempo */}
                  <div className="absolute top-0 left-1/4 w-px h-full bg-slate-400 opacity-50"></div>
                  <div className="absolute top-0 left-1/2 w-px h-full bg-slate-400 opacity-50"></div>
                  <div className="absolute top-0 left-3/4 w-px h-full bg-slate-400 opacity-50"></div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {filteredResources.map((resource, index) => (
              <div key={index} className="flex items-center gap-3 py-2 hover:bg-muted/50 rounded-lg px-3 transition-colors border-l-2 border-transparent hover:border-l-blue-300">
                <div className="flex items-center gap-2 w-80 min-w-0">
                  {getResourceIcon(resource.type)}
                  {getStatusIcon(resource.status)}
                  <span className="text-sm truncate font-medium" title={resource.url}>
                    {resource.url.split('/').pop() || resource.url}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="relative h-6 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm border">
                    {/* Líneas de referencia de tiempo */}
                    <div className="absolute top-0 left-1/4 w-px h-full bg-gray-300 dark:bg-gray-600 opacity-40"></div>
                    <div className="absolute top-0 left-1/2 w-px h-full bg-gray-300 dark:bg-gray-600 opacity-40"></div>
                    <div className="absolute top-0 left-3/4 w-px h-full bg-gray-300 dark:bg-gray-600 opacity-40"></div>
                    
                    {/* Barra de progreso con gradiente basado en rendimiento */}
                    <div
                      className={`absolute h-full rounded-md shadow-sm transition-all duration-300 ${getPerformanceColor(resource.duration)}`}
                      style={{
                        left: `${getResourceBarOffset(resource)}%`,
                        width: `${Math.max(getResourceBarWidth(resource), 4)}%`, // Ancho mínimo más visible
                        top: '2px',
                        height: 'calc(100% - 4px)' // Pequeño margen interno
                      }}
                    />
                    
                    {/* Indicadores adicionales para recursos críticos */}
                    {resource.isRenderBlocking && (
                      <div 
                        className="absolute border-2 border-red-500 rounded-md opacity-60"
                        style={{
                          left: `${getResourceBarOffset(resource)}%`,
                          width: `${Math.max(getResourceBarWidth(resource), 4)}%`,
                          top: '1px',
                          height: 'calc(100% - 2px)'
                        }}
                      ></div>
                    )}
                    
                    {/* Indicador de tiempo optimizado */}
                    {getResourceBarWidth(resource) > 8 && (
                      <div 
                        className="absolute top-1/2 transform -translate-y-1/2 text-xs text-white bg-black bg-opacity-80 px-1 rounded-sm pointer-events-none"
                        style={{
                          left: `${getResourceBarOffset(resource) + (getResourceBarWidth(resource) / 2)}%`,
                          transform: 'translateX(-50%) translateY(-50%)'
                        }}
                      >
                        {formatTime(resource.duration)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs min-w-0">
                  <div className="flex flex-col items-end">
                    <span className="text-muted-foreground">{formatBytes(resource.size)}</span>
                    <span className={`font-medium ${getPerformanceTextColor(resource.duration)}`}>
                      {formatTime(resource.duration)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {resource.cached && <Badge variant="outline" className="text-xs">Cached</Badge>}
                    {resource.isRenderBlocking && <Badge variant="destructive" className="text-xs">Blocking</Badge>}
                    {resource.isCritical && <Badge variant="default" className="text-xs">Critical</Badge>}
                  </div>
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