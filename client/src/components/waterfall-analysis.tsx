import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Clock, Download, FileText, Image, Zap, AlertTriangle, CheckCircle, XCircle, Globe, Layers, Code, FileImage, Type, Database, Wifi } from 'lucide-react';
import type { WaterfallAnalysis } from '@shared/schema';
import { getTranslations } from '@/lib/translations';

interface WaterfallAnalysisProps {
  analysis: WaterfallAnalysis;
  language?: 'en' | 'es';
}

export function WaterfallAnalysis({ analysis, language = 'en' }: WaterfallAnalysisProps) {
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [selectedResourceType, setSelectedResourceType] = useState<string>('all');
  const t = getTranslations(language);

  if (!analysis || (!analysis.mobile && !analysis.desktop)) {
    return (
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <Clock className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            {t.waterfallAnalysis} {t.notFound}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t.visualRepresentation}
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
            {t.noResourcesFound}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t.waterfallAnalysisDesc}
          </p>
        </div>
      </Card>
    );
  }

  const resourceTypes = [
    { key: 'all', label: t.all },
    { key: 'document', label: t.document },
    { key: 'stylesheet', label: t.stylesheet },
    { key: 'script', label: t.script },
    { key: 'image', label: t.image },
    { key: 'font', label: t.font },
    { key: 'fetch', label: t.fetch },
    { key: 'xhr', label: t.xhr },
    { key: 'other', label: t.other }
  ];
  
  const filteredResources = selectedResourceType === 'all' 
    ? currentData.resources 
    : currentData.resources.filter(r => r.type === selectedResourceType);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document': return <Globe className="h-4 w-4 text-blue-600" />;
      case 'stylesheet': return <Layers className="h-4 w-4 text-blue-500" />;
      case 'script': return <Code className="h-4 w-4 text-yellow-600" />;
      case 'image': return <FileImage className="h-4 w-4 text-green-600" />;
      case 'font': return <Type className="h-4 w-4 text-purple-600" />;
      case 'fetch': return <Database className="h-4 w-4 text-orange-600" />;
      case 'xhr': return <Wifi className="h-4 w-4 text-orange-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
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

  // Calcular el tiempo máximo para el timeline
  const maxEndTime = Math.max(...currentData.resources.map(r => r.endTime || 0));
  const minStartTime = Math.min(...currentData.resources.map(r => r.startTime || 0));
  const totalDuration = maxEndTime - minStartTime;

  const getResourceBarWidth = (resource: any) => {
    const duration = resource.duration || 0;
    const minWidth = 4; // Ancho mínimo en porcentaje
    const maxWidth = 80; // Ancho máximo en porcentaje
    
    if (totalDuration === 0) return minWidth;
    
    const width = (duration / totalDuration) * maxWidth;
    return Math.max(width, minWidth);
  };

  const getResourceBarOffset = (resource: any) => {
    const startTime = resource.startTime || 0;
    const offset = ((startTime - minStartTime) / totalDuration) * 80;
    return Math.max(offset, 0);
  };

  const getPerformanceColor = (duration: number) => {
    if (duration <= 100) return 'bg-gradient-to-r from-green-400 to-green-500 shadow-green-200';
    if (duration <= 300) return 'bg-gradient-to-r from-green-300 to-yellow-400 shadow-yellow-200';
    if (duration <= 500) return 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-orange-200';
    if (duration <= 1000) return 'bg-gradient-to-r from-orange-400 to-red-400 shadow-red-200';
    return 'bg-gradient-to-r from-red-400 to-red-600 shadow-red-300';
  };

  const getPerformanceLabel = (duration: number) => {
    if (duration <= 100) return t.waterfallExcellent;
    if (duration <= 300) return t.waterfallGood;
    if (duration <= 500) return t.waterfallAcceptable;
    if (duration <= 1000) return t.waterfallSlow;
    return t.waterfallVerySlow;
  };

  // Crear marcadores de tiempo para la escala
  const getTimeMarkers = () => {
    const markers = [];
    const intervals = [0, 0.25, 0.5, 0.75, 1];
    
    intervals.forEach(interval => {
      const time = minStartTime + (totalDuration * interval);
      markers.push({
        position: interval * 80,
        time: formatTime(time)
      });
    });
    
    return markers;
  };

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t.waterfallAnalysis}
        </CardTitle>
        <CardDescription>
          {t.waterfallAnalysisDesc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Resumen de métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{t.totalResources}</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{currentData.resources.length}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{t.totalLoadTime}</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{formatTime(maxEndTime - minStartTime)}</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">{t.totalSize}</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {formatBytes(currentData.resources.reduce((sum, r) => sum + r.size, 0))}
              </div>
            </div>
          </div>

          {/* Controles de filtros */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{language === 'es' ? 'Dispositivo' : 'Device'}:</label>
              <Tabs value={selectedDevice} onValueChange={(value) => setSelectedDevice(value as 'mobile' | 'desktop')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mobile">{t.mobile}</TabsTrigger>
                  <TabsTrigger value="desktop">{t.desktop}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{language === 'es' ? 'Tipo de Recurso' : 'Resource Type'}:</label>
              <Tabs value={selectedResourceType} onValueChange={setSelectedResourceType}>
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
                  {resourceTypes.map(type => (
                    <TabsTrigger key={type.key} value={type.key} className="text-xs">
                      {type.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Leyenda de rendimiento */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {t.performanceLegend}
            </h4>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-sm"></div>
                <span className="text-sm">{t.waterfallExcellent} (≤100ms)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-green-300 to-yellow-400 rounded-sm"></div>
                <span className="text-sm">{t.waterfallGood} (≤300ms)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-sm"></div>
                <span className="text-sm">{t.waterfallAcceptable} (≤500ms)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-sm"></div>
                <span className="text-sm">{t.waterfallSlow} (≤1000ms)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-600 rounded-sm"></div>
                <span className="text-sm">{t.waterfallVerySlow} (&gt;1000ms)</span>
              </div>
            </div>
          </div>

          {/* Snapshots de progreso de carga */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Image className="h-4 w-4" />
              {language === 'es' ? 'Instantáneas de Carga' : 'Loading Snapshots'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(() => {
                const snapshots = [];
                const intervals = [0.25, 0.5, 0.75, 1];
                
                intervals.forEach((interval, index) => {
                  const time = minStartTime + (totalDuration * interval);
                  const resourcesLoaded = currentData.resources.filter(r => r.endTime <= time).length;
                  const percentage = Math.round((resourcesLoaded / currentData.resources.length) * 100);
                  
                  snapshots.push(
                    <div key={index} className="text-center">
                      <div className="bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg p-3 mb-2">
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                          {formatTime(time)}
                        </div>
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {percentage}%
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          {resourcesLoaded}/{currentData.resources.length} {language === 'es' ? 'recursos' : 'resources'}
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                });
                
                return snapshots;
              })()}
            </div>
          </div>

          {/* Escala de tiempo */}
          <div className="relative">
            <h4 className="font-medium mb-3">{t.timeScale}:</h4>
            <div className="relative h-6 bg-slate-100 dark:bg-slate-700 rounded-md">
              {getTimeMarkers().map((marker, index) => (
                <div
                  key={index}
                  className="absolute top-0 h-full border-l border-slate-300 dark:border-slate-600"
                  style={{ left: `${marker.position}%` }}
                >
                  <span className="absolute top-7 text-xs text-slate-600 dark:text-slate-400 transform -translate-x-1/2">
                    {marker.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline de recursos */}
          <div className="space-y-2">
            <h4 className="font-medium mb-3">{t.resourceLoadingTimeline}:</h4>
            
            {filteredResources.length === 0 ? (
              <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                {t.noResourcesFound}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredResources.slice(0, 50).map((resource, index) => (
                  <div
                    key={index}
                    className="group relative border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getResourceIcon(resource.type)}
                        <span className="text-sm font-medium truncate" title={resource.url}>
                          {resource.url.split('/').pop() || resource.url}
                        </span>
                        {getStatusIcon(resource.status)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {formatBytes(resource.size)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {formatTime(resource.duration)}
                        </Badge>
                      </div>
                    </div>

                    {/* Barra de tiempo visual */}
                    <div className="relative h-6 bg-slate-100 dark:bg-slate-700 rounded-md overflow-hidden">
                      <div
                        className={`absolute top-0 h-full rounded-md shadow-sm transition-all duration-300 ${getPerformanceColor(resource.duration)}`}
                        style={{
                          left: `${getResourceBarOffset(resource)}%`,
                          width: `${getResourceBarWidth(resource)}%`
                        }}
                      >
                        {/* Mostrar tiempo solo si la barra es lo suficientemente ancha */}
                        {getResourceBarWidth(resource) > 15 && (
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-overlay">
                            {formatTime(resource.duration)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Badges de estado */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {resource.cached && (
                        <Badge variant="success" className="text-xs">
                          {t.cached}
                        </Badge>
                      )}
                      {resource.isBlocking && (
                        <Badge variant="destructive" className="text-xs">
                          {t.blocking}
                        </Badge>
                      )}
                      {resource.isCritical && (
                        <Badge variant="warning" className="text-xs">
                          {t.critical}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {getPerformanceLabel(resource.duration)}
                      </Badge>
                    </div>

                    {/* Información detallada visible en hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="grid grid-cols-2 gap-2">
                        <div>Start: {formatTime(resource.startTime)}</div>
                        <div>End: {formatTime(resource.endTime)}</div>
                        <div>Status: {resource.status}</div>
                        <div>Type: {resource.type}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumen y recomendaciones */}
          {currentData.insights && currentData.insights.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                {t.recommendations}
              </h4>
              <div className="space-y-2">
                {currentData.insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="text-sm text-slate-700 dark:text-slate-300">
                    • {insight.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}