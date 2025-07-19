import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock, Download, FileText, Image, Zap, AlertTriangle, CheckCircle, XCircle, Globe, Layers, Code, FileImage, Type, Database, Wifi } from 'lucide-react';
import type { WaterfallAnalysis } from '@shared/schema';
import { getTranslations } from '@/lib/translations';
import { formatTime as utilFormatTime, formatTimeScale, isSlowTime } from '@/lib/time-utils';

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

  // Use unified time formatting from time-utils.ts
  const formatTime = (ms: number) => utilFormatTime(ms).formatted;
  const formatTimeDisplay = (ms: number) => {
    const result = utilFormatTime(ms);
    return result.formatted;
  };

  // Use the correct total duration from backend analysis
  const totalDuration = currentData.totalDuration || 0;
  
  // Calcular el tiempo máximo para el timeline con validación
  const validResources = currentData.resources.filter(r => 
    Number.isFinite(r.endTime) && Number.isFinite(r.startTime) && 
    r.endTime >= 0 && r.startTime >= 0
  );
  
  let maxEndTime = 0;
  let minStartTime = 0;
  let timelineRange = 0;
  
  if (validResources.length > 0) {
    maxEndTime = Math.max(...validResources.map(r => r.endTime || 0));
    minStartTime = Math.min(...validResources.map(r => r.startTime || 0));
    timelineRange = Math.abs(maxEndTime - minStartTime);
  }
  
  // Use real Total Blocking Time from backend measurement
  const totalBlockingTime = currentData.totalBlockingTime || 0;
  
  // Calcular métricas adicionales
  const firstContentfulPaint = currentData.resources
    .filter(r => r.type === 'document')
    .reduce((min, r) => Math.min(min, r.endTime || Infinity), Infinity);
  
  const largestContentfulPaint = Math.max(...currentData.resources
    .filter(r => r.type === 'image' || r.type === 'document')
    .map(r => r.endTime || 0));

  const getResourceBarWidth = (resource: any) => {
    const duration = resource.duration || 0;
    const minWidth = 2; // Ancho mínimo en porcentaje
    
    if (timelineRange === 0) return minWidth;
    
    // Calcular ancho proporcional al tiempo real
    const width = (duration / timelineRange) * 85;
    return Math.max(width, minWidth);
  };

  const getResourceBarOffset = (resource: any) => {
    const startTime = resource.startTime || 0;
    
    if (timelineRange === 0) return 0;
    
    // Calcular offset proporcional al tiempo real de inicio
    const offset = ((startTime - minStartTime) / timelineRange) * 85;
    return Math.max(offset, 0);
  };

  const getPerformanceColor = (duration: number) => {
    if (duration <= 100) return 'bg-gradient-to-r from-green-400 to-green-500 shadow-green-200';
    if (duration <= 300) return 'bg-gradient-to-r from-green-300 to-yellow-400 shadow-yellow-200';
    if (duration <= 500) return 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-orange-200';
    if (duration <= 1000) return 'bg-gradient-to-r from-orange-400 to-red-400 shadow-red-200';
    return 'bg-gradient-to-r from-red-400 to-red-600 shadow-red-300';
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-teal-500';
      case 'stylesheet': return 'bg-blue-500';
      case 'script': return 'bg-yellow-500';
      case 'image': return 'bg-green-500';
      case 'font': return 'bg-purple-500';
      case 'fetch': return 'bg-orange-500';
      case 'xhr': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getPerformanceLabel = (duration: number) => {
    if (duration <= 100) return t.waterfallExcellent;
    if (duration <= 300) return t.waterfallGood;
    if (duration <= 500) return t.waterfallAcceptable;
    if (duration <= 1000) return t.waterfallSlow;
    return t.waterfallVerySlow;
  };

  // Crear marcadores de tiempo para la escala (tiempo relativo desde 0)
  const getTimeMarkers = () => {
    const markers = [];
    const intervals = [0, 0.25, 0.5, 0.75, 1];
    
    intervals.forEach(interval => {
      const relativeTime = timelineRange * interval;
      markers.push({
        position: interval * 80,
        time: interval === 0 ? '0ms' : formatTimeScale(relativeTime)
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
        
        {/* Device tabs movidos aquí */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">{language === 'es' ? 'Dispositivo' : 'Device'}:</label>
          <Tabs value={selectedDevice} onValueChange={(value) => setSelectedDevice(value as 'mobile' | 'desktop')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mobile">{t.mobile}</TabsTrigger>
              <TabsTrigger value="desktop">{t.desktop}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Resumen de métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              <div className={`text-2xl font-bold text-green-600 ${isSlowTime(totalDuration) ? 'slow-load' : ''}`}>{formatTime(totalDuration)}</div>
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
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">{language === 'es' ? 'Tiempo de Bloqueo' : 'Total Blocking Time'}</span>
              </div>
              <div className={`text-2xl font-bold text-red-600 ${isSlowTime(totalBlockingTime) ? 'slow-load' : ''}`}>{formatTime(totalBlockingTime)}</div>
            </div>
          </div>

          {/* Leyenda de tipos de recursos */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border">
            <h4 className="text-sm font-medium mb-3">{language === 'es' ? 'Tipos de Recursos' : 'Resource Types'}</h4>
            <div className="flex flex-wrap gap-3">
              {resourceTypes.filter(rt => rt.key !== 'all').map(resourceType => (
                <div key={resourceType.key} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${getResourceTypeColor(resourceType.key)}`}></div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{resourceType.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controles de filtros */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{language === 'es' ? 'Tipo de Recurso' : 'Resource Type'}:</label>
              {/* Dropdown para móvil */}
              <div className="block sm:hidden">
                <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={language === 'es' ? 'Seleccionar tipo' : 'Select type'} />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map(type => (
                      <SelectItem key={type.key} value={type.key}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Tabs para desktop */}
              <div className="hidden sm:block">
                <Tabs value={selectedResourceType} onValueChange={setSelectedResourceType}>
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-1">
                    {resourceTypes.map(type => (
                      <TabsTrigger key={type.key} value={type.key} className="text-xs px-1 py-1">
                        {type.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
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

          {/* Métricas de rendimiento de página */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {language === 'es' ? 'Métricas de Rendimiento de Página' : 'Page Performance Metrics'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 text-center">
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'es' ? 'Primer Byte' : 'First Byte'}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {formatTime(minStartTime)}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'es' ? 'Primer Paint' : 'First Paint'}
                </div>
                <div className="text-sm font-bold text-green-600">
                  {formatTime(firstContentfulPaint === Infinity ? 0 : firstContentfulPaint)}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'es' ? 'Paint Grande' : 'Largest Paint'}
                </div>
                <div className="text-sm font-bold text-orange-600">
                  {formatTime(largestContentfulPaint)}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'es' ? 'T. Bloqueo' : 'Blocking Time'}
                </div>
                <div className="text-sm font-bold text-red-600">
                  {formatTime(totalBlockingTime)}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'es' ? 'Recursos' : 'Resources'}
                </div>
                <div className="text-sm font-bold text-blue-600">
                  {currentData.resources.length}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'es' ? 'Peso Total' : 'Total Weight'}
                </div>
                <div className="text-sm font-bold text-purple-600">
                  {formatBytes(currentData.resources.reduce((sum, r) => sum + r.size, 0))}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline visual de carga */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Image className="h-4 w-4" />
              {language === 'es' ? 'Proceso Visual de Carga de Página' : 'Visual Page Loading Process'}
            </h4>
            
            {/* Timeline con snapshots */}
            <div className="relative mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">0.0s</span>
                <span className="text-xs text-slate-600 dark:text-slate-400">{formatTime(maxEndTime)}</span>
              </div>
              
              <div className="relative h-12 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
                {/* Snapshots en el timeline */}
                {(() => {
                  const snapshots = [];
                  const numSnapshots = 10;
                  
                  for (let i = 0; i <= numSnapshots; i++) {
                    const timeProgress = timelineRange * (i / numSnapshots);
                    const time = minStartTime + timeProgress;
                    const resourcesLoaded = currentData.resources.filter(r => r.endTime <= time).length;
                    const percentage = (resourcesLoaded / currentData.resources.length) * 100;
                    const position = (i / numSnapshots) * 100;
                    
                    // Determinar color basado en el progreso
                    let bgColor = 'bg-slate-300 dark:bg-slate-600';
                    if (percentage >= 90) bgColor = 'bg-green-500';
                    else if (percentage >= 70) bgColor = 'bg-yellow-500';
                    else if (percentage >= 50) bgColor = 'bg-orange-500';
                    else if (percentage >= 25) bgColor = 'bg-red-400';
                    
                    snapshots.push(
                      <div
                        key={i}
                        className={`absolute top-0 w-2 h-full ${bgColor} transition-all duration-300`}
                        style={{ left: `${position}%` }}
                        title={`${formatTime(timeProgress)}: ${Math.round(percentage)}% cargado`}
                      />
                    );
                  }
                  
                  return snapshots;
                })()}
              </div>
              
              {/* Marcadores de tiempo */}
              <div className="flex justify-between mt-1">
                {Array.from({ length: 6 }, (_, i) => {
                  const timeProgress = timelineRange * (i / 5);
                  const absoluteTime = minStartTime + timeProgress;
                  const resourcesLoaded = currentData.resources.filter(r => (r.endTime || 0) <= absoluteTime).length;
                  const percentage = Math.round((resourcesLoaded / currentData.resources.length) * 100);
                  
                  return (
                    <div key={i} className="text-center">
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {formatTime(timeProgress)}
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Escala de tiempo mejorada */}
          <div className="relative">
            <h4 className="font-medium mb-3">{t.timeScale}:</h4>
            <div className="relative h-8 bg-slate-100 dark:bg-slate-700 rounded-md">
              {/* Líneas de referencia */}
              {getTimeMarkers().map((marker, index) => (
                <div
                  key={index}
                  className="absolute top-0 h-full border-l border-slate-300 dark:border-slate-600"
                  style={{ left: `${marker.position}%` }}
                >
                  <span className="absolute top-9 text-xs text-slate-600 dark:text-slate-400 transform -translate-x-1/2">
                    {marker.time}
                  </span>
                </div>
              ))}
              
              {/* Indicadores de métricas importantes */}
              {firstContentfulPaint !== Infinity && (
                <div
                  className="absolute top-0 h-full border-l-2 border-green-500"
                  style={{ left: `${((firstContentfulPaint - minStartTime) / timelineRange) * 85}%` }}
                  title={`First Contentful Paint: ${formatTime(firstContentfulPaint - minStartTime)}`}
                >
                  <div className="absolute -top-6 transform -translate-x-1/2 text-xs text-green-600 font-bold">
                    FCP
                  </div>
                </div>
              )}
              
              {largestContentfulPaint > 0 && (
                <div
                  className="absolute top-0 h-full border-l-2 border-orange-500"
                  style={{ left: `${((largestContentfulPaint - minStartTime) / timelineRange) * 85}%` }}
                  title={`Largest Contentful Paint: ${formatTime(largestContentfulPaint - minStartTime)}`}
                >
                  <div className="absolute -top-6 transform -translate-x-1/2 text-xs text-orange-600 font-bold">
                    LCP
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vista de conexión mejorada */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              {language === 'es' ? 'Vista de Conexión' : 'Connection View'}
            </h4>
            
            {/* Etiquetas de fases de conexión */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-teal-500 rounded-sm"></div>
                <span className="text-xs">DNS Lookup</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                <span className="text-xs">Initial Connection</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                <span className="text-xs">SSL Negotiation</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <span className="text-xs">Start Render</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div>
                <span className="text-xs">DOM Content Loaded</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-cyan-500 rounded-sm"></div>
                <span className="text-xs">On Load</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-slate-500 rounded-sm"></div>
                <span className="text-xs">Document Complete</span>
              </div>
            </div>

            {/* Timeline con escala de tiempo más detallada */}
            <div className="relative mb-4">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                {Array.from({ length: 11 }, (_, i) => {
                  const timeAtPosition = minStartTime + (timelineRange * (i / 10));
                  return (
                    <span key={i} className="text-center">
                      {i === 0 ? '0ms' : formatTimeScale(timeAtPosition - minStartTime)}
                    </span>
                  );
                })}
              </div>
              
              <div className="relative h-8 bg-slate-200 dark:bg-slate-700 rounded">
                {/* Grid de referencia */}
                {Array.from({ length: 11 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-full w-px bg-slate-300 dark:bg-slate-600"
                    style={{ left: `${i * 10}%` }}
                  />
                ))}
                
                {/* Eventos específicos del timeline */}
                {(() => {
                  const events = [
                    { timePercent: 0.02, color: 'bg-teal-500', label: 'DNS', width: '3%' },
                    { timePercent: 0.05, color: 'bg-orange-500', label: 'Connect', width: '5%' },
                    { timePercent: 0.08, color: 'bg-purple-500', label: 'SSL', width: '4%' },
                    { timePercent: 0.25, color: 'bg-green-500', label: 'Start Render', width: '2%' },
                    { timePercent: 0.45, color: 'bg-indigo-500', label: 'DOM Loaded', width: '3%' },
                    { timePercent: 0.70, color: 'bg-cyan-500', label: 'On Load', width: '4%' },
                    { timePercent: 0.90, color: 'bg-slate-500', label: 'Complete', width: '2%' }
                  ];
                  
                  return events.map((event, index) => {
                    const relativeTime = timelineRange * event.timePercent;
                    const position = event.timePercent * 100;
                    return (
                      <div
                        key={index}
                        className={`absolute top-0 h-full ${event.color} rounded-sm`}
                        style={{ 
                          left: `${position}%`, 
                          width: event.width,
                          zIndex: 10
                        }}
                        title={`${event.label}: ${formatTime(relativeTime)}`}
                      />
                    );
                  });
                })()}
                
                {/* Barras de proceso de página */}
                <div className="absolute bottom-0 left-0 h-1 bg-orange-400 rounded" style={{ width: '15%' }} title="CPU Utilization" />
                <div className="absolute bottom-2 left-0 h-1 bg-blue-400 rounded" style={{ width: '60%' }} title="Bandwidth (0-5,000 Kbps)" />
                <div className="absolute bottom-4 left-0 h-1 bg-purple-400 rounded" style={{ width: '85%' }} title="Browser Main Thread" />
                <div className="absolute bottom-6 left-0 h-1 bg-green-400 rounded" style={{ width: '95%' }} title="Long Tasks" />
              </div>
              
              {/* Etiquetas de proceso */}
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-orange-400 rounded"></div>
                  <span>CPU Utilization</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-400 rounded"></div>
                  <span>Bandwidth (0 - 5,000 Kbps)</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-purple-400 rounded"></div>
                  <span>Browser Main Thread</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded"></div>
                  <span>Long Tasks</span>
                </div>
              </div>
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
              <div className="space-y-1">
                {filteredResources.slice(0, 50).map((resource, index) => (
                  <div
                    key={index}
                    className="group relative border border-slate-200 dark:border-slate-700 rounded-md p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getResourceIcon(resource.type)}
                        <span className="text-sm font-medium truncate" title={resource.url}>
                          {resource.url.split('/').pop() || resource.url}
                        </span>
                        {getStatusIcon(resource.status)}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs py-0 px-1">
                          {formatBytes(resource.size)}
                        </Badge>
                        <Badge variant="outline" className="text-xs py-0 px-1">
                          {formatTime(resource.duration)}
                        </Badge>
                      </div>
                    </div>

                    {/* Barra de tiempo visual proporcional */}
                    <div className="relative h-4 bg-slate-100 dark:bg-slate-700 rounded-sm overflow-hidden mb-1">
                      {/* Líneas de referencia sutiles */}
                      <div className="absolute top-0 h-full w-px bg-slate-300 dark:bg-slate-600" style={{ left: '25%' }}></div>
                      <div className="absolute top-0 h-full w-px bg-slate-300 dark:bg-slate-600" style={{ left: '50%' }}></div>
                      <div className="absolute top-0 h-full w-px bg-slate-300 dark:bg-slate-600" style={{ left: '75%' }}></div>
                      
                      {/* Barra de recurso con código de colores por tipo */}
                      <div
                        className={`absolute top-0 h-full rounded-sm shadow-sm transition-all duration-300 ${getResourceTypeColor(resource.type)}`}
                        style={{
                          left: `${getResourceBarOffset(resource)}%`,
                          width: `${getResourceBarWidth(resource)}%`
                        }}
                      >
                        {/* Mostrar tiempo solo si la barra es lo suficientemente ancha */}
                        {getResourceBarWidth(resource) > 10 && (
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-overlay">
                            {formatTime(resource.duration)}
                          </span>
                        )}
                      </div>
                      
                      {/* Indicador de inicio */}
                      <div
                        className="absolute top-0 h-full w-px bg-slate-800 dark:bg-slate-200"
                        style={{ left: `${getResourceBarOffset(resource)}%` }}
                      ></div>
                    </div>

                    {/* Badges de estado - compactos */}
                    <div className="flex flex-wrap gap-1">
                      {resource.cached && (
                        <Badge variant="success" className="text-xs py-0 px-1 h-4">
                          {t.cached}
                        </Badge>
                      )}
                      {resource.isBlocking && (
                        <Badge variant="destructive" className="text-xs py-0 px-1 h-4">
                          {t.blocking}
                        </Badge>
                      )}
                      {resource.isCritical && (
                        <Badge variant="warning" className="text-xs py-0 px-1 h-4">
                          {t.critical}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs py-0 px-1 h-4">
                        {getPerformanceLabel(resource.duration)}
                      </Badge>
                    </div>

                    {/* Información detallada visible en hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1 text-xs text-slate-600 dark:text-slate-400">
                      <div className="grid grid-cols-2 gap-1">
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