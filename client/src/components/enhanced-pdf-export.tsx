import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  CheckCircle, 
  Clock, 
  Zap,
  Eye,
  Sparkles,
  Mail,
  Share2
} from "lucide-react";
import { getTranslations } from "@/lib/translations";
import { exportToPDF } from "@/lib/pdf-export-complete";
import { WebAnalysisResult } from "@/shared/schema";

interface EnhancedPdfExportProps {
  analysisData: WebAnalysisResult;
  language?: 'en' | 'es';
  onExportComplete?: () => void;
}

export default function EnhancedPdfExport({ 
  analysisData, 
  language = 'en',
  onExportComplete 
}: EnhancedPdfExportProps) {
  const t = getTranslations(language);
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStage, setExportStage] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const exportStages = [
    { 
      key: 'preparing', 
      label: language === 'es' ? 'Preparando datos...' : 'Preparing data...',
      duration: 500 
    },
    { 
      key: 'formatting', 
      label: language === 'es' ? 'Formateando contenido...' : 'Formatting content...',
      duration: 800 
    },
    { 
      key: 'charts', 
      label: language === 'es' ? 'Generando gráficos...' : 'Generating charts...',
      duration: 1200 
    },
    { 
      key: 'layout', 
      label: language === 'es' ? 'Optimizando diseño...' : 'Optimizing layout...',
      duration: 700 
    },
    { 
      key: 'finalizing', 
      label: language === 'es' ? 'Finalizando PDF...' : 'Finalizing PDF...',
      duration: 600 
    }
  ];
  
  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setIsComplete(false);
    
    let currentProgress = 0;
    const progressPerStage = 100 / exportStages.length;
    
    // Simulate export process with realistic stages
    for (let i = 0; i < exportStages.length; i++) {
      const stage = exportStages[i];
      setExportStage(stage.label);
      
      // Animate progress for this stage
      const startProgress = currentProgress;
      const endProgress = currentProgress + progressPerStage;
      
      const animateProgress = () => {
        const duration = stage.duration;
        const steps = 20;
        const stepDuration = duration / steps;
        const progressStep = (endProgress - startProgress) / steps;
        
        let step = 0;
        const interval = setInterval(() => {
          step++;
          const newProgress = startProgress + (progressStep * step);
          setExportProgress(Math.min(newProgress, endProgress));
          
          if (step >= steps) {
            clearInterval(interval);
            currentProgress = endProgress;
            
            // If last stage, perform actual export
            if (i === exportStages.length - 1) {
              setTimeout(async () => {
                try {
                  await exportToPDF(analysisData);
                  setIsComplete(true);
                  setExportProgress(100);
                  setExportStage(language === 'es' ? '¡Exportación completada!' : 'Export completed!');
                  onExportComplete?.();
                } catch (error) {
                  console.error('Export failed:', error);
                  setExportStage(language === 'es' ? 'Error en exportación' : 'Export failed');
                } finally {
                  setTimeout(() => {
                    setIsExporting(false);
                    setIsComplete(false);
                    setExportProgress(0);
                    setExportStage('');
                  }, 2000);
                }
              }, 200);
            }
          }
        }, stepDuration);
      };
      
      animateProgress();
      
      // Wait for this stage to complete
      await new Promise(resolve => setTimeout(resolve, stage.duration));
    }
  };
  
  const getReportStats = () => {
    const overallScore = Math.round(((analysisData.performanceScore || 0) + 
                                   (analysisData.accessibilityScore || 0) + 
                                   (analysisData.bestPracticesScore || 0) + 
                                   (analysisData.seoScore || 0)) / 4);
    
    const issuesCount = (analysisData.recommendations?.performance?.length || 0) +
                       (analysisData.recommendations?.accessibility?.length || 0) +
                       (analysisData.recommendations?.bestPractices?.length || 0) +
                       (analysisData.recommendations?.seo?.length || 0);
    
    const hasScreenshots = !!(analysisData.mobileScreenshot || analysisData.desktopScreenshot);
    const hasWaterfall = !!(analysisData.waterfallAnalysis);
    
    return {
      overallScore,
      issuesCount,
      hasScreenshots,
      hasWaterfall,
      sectionsCount: 8 + (hasScreenshots ? 1 : 0) + (hasWaterfall ? 1 : 0)
    };
  };
  
  const stats = getReportStats();
  
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {language === 'es' ? 'Exportación Profesional PDF' : 'Professional PDF Export'}
            </h3>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            <Sparkles className="w-3 h-3 mr-1" />
            {language === 'es' ? 'Mejorado' : 'Enhanced'}
          </Badge>
        </div>
        
        {/* Report Preview Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-white/70 dark:bg-white/5 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {language === 'es' ? 'Puntuación General' : 'Overall Score'}
              </span>
              <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {stats.overallScore}/100
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-white/70 dark:bg-white/5 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {language === 'es' ? 'Secciones' : 'Sections'}
              </span>
              <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {stats.sectionsCount}
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-white/70 dark:bg-white/5 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {language === 'es' ? 'Recomendaciones' : 'Recommendations'}
              </span>
              <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {stats.issuesCount}
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-white/70 dark:bg-white/5 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {language === 'es' ? 'Capturas' : 'Screenshots'}
              </span>
              <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {stats.hasScreenshots ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Export Progress */}
        {isExporting && (
          <div className="mb-6 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {exportStage}
              </span>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {Math.round(exportProgress)}%
              </span>
            </div>
            <Progress value={exportProgress} className="h-2 bg-blue-200 dark:bg-blue-800" />
            <div className="flex items-center mt-2 text-xs text-blue-600 dark:text-blue-400">
              <Clock className="w-3 h-3 mr-1" />
              {language === 'es' ? 'Tiempo estimado: 3-5 segundos' : 'Estimated time: 3-5 seconds'}
            </div>
          </div>
        )}
        
        {/* Success Message */}
        {isComplete && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                {language === 'es' ? '¡PDF generado exitosamente!' : 'PDF generated successfully!'}
              </span>
            </div>
          </div>
        )}
        
        {/* Export Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isExporting ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                {language === 'es' ? 'Exportando...' : 'Exporting...'}
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Descargar PDF' : 'Download PDF'}
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
            className="border-blue-200 dark:border-blue-800"
          >
            <Eye className="w-4 h-4 mr-2" />
            {language === 'es' ? 'Vista Previa' : 'Preview'}
          </Button>
        </div>
        
        {/* Additional Options */}
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between text-sm text-blue-700 dark:text-blue-300">
            <span>{language === 'es' ? 'Opciones adicionales:' : 'Additional options:'}</span>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-1 hover:text-blue-900 dark:hover:text-blue-100">
                <Mail className="w-4 h-4" />
                <span>{language === 'es' ? 'Enviar' : 'Email'}</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-blue-900 dark:hover:text-blue-100">
                <Share2 className="w-4 h-4" />
                <span>{language === 'es' ? 'Compartir' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Report Content Preview */}
        {previewMode && (
          <div className="mt-4 p-4 bg-white/50 dark:bg-white/5 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              {language === 'es' ? 'Contenido del reporte:' : 'Report content:'}
            </h4>
            <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <div>• {language === 'es' ? 'Resumen ejecutivo con puntuaciones' : 'Executive summary with scores'}</div>
              <div>• {language === 'es' ? 'Análisis detallado Core Web Vitals' : 'Detailed Core Web Vitals analysis'}</div>
              <div>• {language === 'es' ? 'Recomendaciones categorizadas' : 'Categorized recommendations'}</div>
              {stats.hasScreenshots && (
                <div>• {language === 'es' ? 'Capturas móvil y desktop' : 'Mobile and desktop screenshots'}</div>
              )}
              {stats.hasWaterfall && (
                <div>• {language === 'es' ? 'Análisis waterfall completo' : 'Complete waterfall analysis'}</div>
              )}
              <div>• {language === 'es' ? 'Gráficos y visualizaciones' : 'Charts and visualizations'}</div>
              <div>• {language === 'es' ? 'Anexos técnicos' : 'Technical appendices'}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}