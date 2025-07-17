import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  HelpCircle, 
  Monitor, 
  Smartphone, 
  Globe, 
  Search,
  BarChart3,
  FileText,
  Download,
  Camera,
  Bot,
  Share2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Eye,
  TrendingUp,
  Activity,
  Gauge,
  Network,
  Image,
  Shield,
  Users
} from "lucide-react";
import { getTranslations } from "@/lib/translations";

interface HelpDialogProps {
  language: 'en' | 'es';
}

export default function HelpDialog({ language }: HelpDialogProps) {
  const [open, setOpen] = useState(false);
  const t = getTranslations(language);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start md:justify-center touch-manipulation"
          onTouchStart={(e) => e.stopPropagation()}
        >
          <HelpCircle className="w-4 h-4" />
          <span className="ml-2 md:hidden lg:inline">{t.help}</span>
          <span className="hidden md:inline lg:hidden ml-2">{t.help}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center space-x-2">
            <Search className="w-6 h-6 text-primary" />
            <span>{t.helpTitle}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* How It Works Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>{t.howItWorks}</span>
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                {language === 'en' 
                  ? "The Web Performance Analyzer is a comprehensive tool that evaluates your website across multiple dimensions to provide actionable insights for optimization."
                  : "El Analizador de Rendimiento Web es una herramienta integral que evalúa tu sitio web en múltiples dimensiones para proporcionar insights accionables para la optimización."
                }
              </p>
              <div className="grid gap-2">
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-blue-700 dark:text-blue-300">1.</span>
                  <span className="text-sm text-blue-700 dark:text-blue-300">{t.step1}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-blue-700 dark:text-blue-300">2.</span>
                  <span className="text-sm text-blue-700 dark:text-blue-300">{t.step2}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-blue-700 dark:text-blue-300">3.</span>
                  <span className="text-sm text-blue-700 dark:text-blue-300">{t.step3}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-blue-700 dark:text-blue-300">4.</span>
                  <span className="text-sm text-blue-700 dark:text-blue-300">{t.step4}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Types Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t.analysisTypes}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">{t.desktopAnalysis}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t.desktopAnalysisDesc}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Smartphone className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">{t.mobileAnalysis}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t.mobileAnalysisDesc}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-purple-200 dark:border-purple-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">{t.seoAnalysis}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t.seoAnalysisDesc}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Analysis Features Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t.analysisFeatures}</h3>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-sm text-green-700 dark:text-green-300">{t.feature1}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-sm text-green-700 dark:text-green-300">{t.feature2}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-sm text-green-700 dark:text-green-300">{t.feature3}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-sm text-green-700 dark:text-green-300">{t.feature4}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-sm text-green-700 dark:text-green-300">{t.feature5}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-sm text-green-700 dark:text-green-300">{t.feature6}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-sm text-green-700 dark:text-green-300">{t.feature7}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-sm text-green-700 dark:text-green-300">{t.feature8}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-sm text-green-700 dark:text-green-300">{t.feature9}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-sm text-green-700 dark:text-green-300">{t.feature10}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Web Vitals Metrics Explained */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span>{language === 'en' ? 'Core Web Vitals Explained' : 'Core Web Vitals Explicadas'}</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {language === 'en' ? 'LCP (Largest Contentful Paint)' : 'LCP (Largest Contentful Paint)'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {language === 'en' 
                      ? "Time it takes for the main content to load. Good: <2.5s, Needs improvement: 2.5-4s, Poor: >4s"
                      : "Tiempo que tarda en cargar el contenido principal. Bueno: <2.5s, Necesita mejora: 2.5-4s, Pobre: >4s"
                    }
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">{language === 'en' ? 'Good: <2.5s' : 'Bueno: <2.5s'}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {language === 'en' ? 'FID (First Input Delay)' : 'FID (First Input Delay)'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {language === 'en' 
                      ? "Time from first user interaction to browser response. Good: <100ms, Needs improvement: 100-300ms, Poor: >300ms"
                      : "Tiempo desde la primera interacción del usuario hasta la respuesta del navegador. Bueno: <100ms, Necesita mejora: 100-300ms, Pobre: >300ms"
                    }
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-blue-600">{language === 'en' ? 'Good: <100ms' : 'Bueno: <100ms'}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-purple-200 dark:border-purple-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {language === 'en' ? 'CLS (Cumulative Layout Shift)' : 'CLS (Cumulative Layout Shift)'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {language === 'en' 
                      ? "Visual stability of the page. Good: <0.1, Needs improvement: 0.1-0.25, Poor: >0.25"
                      : "Estabilidad visual de la página. Bueno: <0.1, Necesita mejora: 0.1-0.25, Pobre: >0.25"
                    }
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-xs text-purple-600">{language === 'en' ? 'Good: <0.1' : 'Bueno: <0.1'}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-orange-200 dark:border-orange-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {language === 'en' ? 'TTFB (Time to First Byte)' : 'TTFB (Time to First Byte)'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {language === 'en' 
                      ? "Server response time. Good: <200ms, Needs improvement: 200-600ms, Poor: >600ms"
                      : "Tiempo de respuesta del servidor. Bueno: <200ms, Necesita mejora: 200-600ms, Pobre: >600ms"
                    }
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-orange-600">{language === 'en' ? 'Good: <200ms' : 'Bueno: <200ms'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* New Features Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
              <Bot className="w-5 h-5 text-cyan-600" />
              <span>{language === 'en' ? 'Latest Features' : 'Últimas Características'}</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-cyan-200 dark:border-cyan-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Network className="w-4 h-4 text-cyan-600" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {language === 'en' ? 'Waterfall Analysis' : 'Análisis Waterfall'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {language === 'en' 
                      ? "Visualizes resource loading timeline, identifies render-blocking resources, and provides optimization recommendations for faster page loads."
                      : "Visualiza la línea de tiempo de carga de recursos, identifica recursos que bloquean el renderizado y proporciona recomendaciones de optimización para cargas más rápidas."
                    }
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-indigo-200 dark:border-indigo-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {language === 'en' ? 'AI Content Analysis' : 'Análisis de Contenido IA'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {language === 'en' 
                      ? "AI-powered content analysis that evaluates readability, SEO optimization, and provides intelligent recommendations for better search rankings."
                      : "Análisis de contenido impulsado por IA que evalúa la legibilidad, optimización SEO y proporciona recomendaciones inteligentes para mejores rankings de búsqueda."
                    }
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-pink-200 dark:border-pink-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Share2 className="w-4 h-4 text-pink-600" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {language === 'en' ? 'Shareable Reports' : 'Reportes Compartibles'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {language === 'en' 
                      ? "Generate secure, time-limited links to share complete analysis reports with clients or team members. Links expire after 12 hours."
                      : "Genera enlaces seguros y con tiempo limitado para compartir reportes de análisis completos con clientes o miembros del equipo. Los enlaces expiran después de 12 horas."
                    }
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Search className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {language === 'en' ? 'X Cards Analysis' : 'Análisis de Tarjetas X'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {language === 'en' 
                      ? "Updated social media optimization analysis for X (formerly Twitter) cards, ensuring optimal appearance when sharing on social platforms."
                      : "Análisis de optimización de redes sociales actualizado para tarjetas X (anteriormente Twitter), asegurando una apariencia óptima al compartir en plataformas sociales."
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Data Availability Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>{language === 'en' ? 'Understanding Data Availability' : 'Entendiendo la Disponibilidad de Datos'}</span>
            </h3>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                {language === 'en' 
                  ? "Some website features may not be available for all sites due to security restrictions or server configurations. This is normal behavior."
                  : "Algunas características del sitio web pueden no estar disponibles para todos los sitios debido a restricciones de seguridad o configuraciones del servidor. Este es un comportamiento normal."
                }
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      {language === 'en' ? 'Screenshots' : 'Capturas de Pantalla'}
                    </span>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {language === 'en' 
                        ? "May fail on sites with X-Frame-Options or bot detection"
                        : "Pueden fallar en sitios con X-Frame-Options o detección de bots"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      {language === 'en' ? 'Waterfall Analysis' : 'Análisis Waterfall'}
                    </span>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {language === 'en' 
                        ? "Unavailable on sites with strict automation blocking"
                        : "No disponible en sitios con bloqueo estricto de automatización"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      {language === 'en' ? 'Core Web Vitals' : 'Core Web Vitals'}
                    </span>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {language === 'en' 
                        ? "May be empty for sites that block JavaScript evaluation"
                        : "Pueden estar vacías para sitios que bloquean la evaluación de JavaScript"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      {language === 'en' ? 'SEO Analysis' : 'Análisis SEO'}
                    </span>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      {language === 'en' 
                        ? "Always available - works on all public websites"
                        : "Siempre disponible - funciona en todos los sitios web públicos"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Scores Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-blue-600" />
              <span>{language === 'en' ? 'Performance Scores Guide' : 'Guía de Puntuaciones de Rendimiento'}</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {language === 'en' ? 'Good (90-100)' : 'Bueno (90-100)'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {language === 'en' 
                      ? "Excellent performance with minimal optimization needed"
                      : "Excelente rendimiento con optimización mínima necesaria"
                    }
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-orange-200 dark:border-orange-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {language === 'en' ? 'Needs Improvement (50-89)' : 'Necesita Mejora (50-89)'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {language === 'en' 
                      ? "Some optimization opportunities available"
                      : "Algunas oportunidades de optimización disponibles"
                    }
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-red-200 dark:border-red-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {language === 'en' ? 'Poor (0-49)' : 'Pobre (0-49)'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {language === 'en' 
                      ? "Significant optimization needed for better user experience"
                      : "Optimización significativa necesaria para mejor experiencia del usuario"
                    }
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-4 h-4 text-slate-600" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {language === 'en' ? 'Protected Sites' : 'Sitios Protegidos'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {language === 'en' 
                      ? "Government and high-security sites may show limited data"
                      : "Sitios gubernamentales y de alta seguridad pueden mostrar datos limitados"
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Export & Sharing Section */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                  {language === 'en' ? 'Export & Sharing Options' : 'Opciones de Exportar y Compartir'}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {language === 'en' 
                    ? "DLMETRIX offers multiple ways to save and share your analysis results:"
                    : "DLMETRIX ofrece múltiples formas de guardar y compartir tus resultados de análisis:"
                  }
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {language === 'en' ? 'PDF Reports' : 'Reportes PDF'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {language === 'en' ? 'CSV Data Export' : 'Exportar Datos CSV'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Share2 className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-600 dark:text-purple-400">
                      {language === 'en' ? '12-hour Share Links' : 'Enlaces de 12 horas'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-600 dark:text-orange-400">
                      {language === 'en' ? 'Team Collaboration' : 'Colaboración en Equipo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}