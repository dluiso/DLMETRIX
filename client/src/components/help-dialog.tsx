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
  Download
} from "lucide-react";
import { getTranslations } from "@/lib/translations";

interface HelpDialogProps {
  language: 'en' | 'es';
}

export default function HelpDialog({ language }: HelpDialogProps) {
  const [open, setOpen] = useState(false);
  const t = getTranslations(language);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">{t.help}</span>
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
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                  {language === 'en' ? 'Export & Sharing' : 'Exportar y Compartir'}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {language === 'en' 
                    ? "Generate comprehensive PDF reports or export raw data to CSV format for further analysis. Perfect for sharing insights with your team or clients."
                    : "Genera reportes PDF integrales o exporta datos sin procesar a formato CSV para análisis adicional. Perfecto para compartir insights con tu equipo o clientes."
                  }
                </p>
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    {language === 'en' ? 'PDF Reports & CSV Data Export' : 'Reportes PDF y Exportación de Datos CSV'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}