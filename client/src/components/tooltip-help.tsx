import { useState } from "react";
import { Info, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TooltipHelpProps {
  content: string;
  title?: string;
  icon?: 'info' | 'help';
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function TooltipHelp({ 
  content, 
  title, 
  icon = 'info', 
  side = 'top',
  className = ""
}: TooltipHelpProps) {
  const IconComponent = icon === 'info' ? Info : HelpCircle;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className={`inline-flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400 transition-colors ${className}`}>
            <IconComponent className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-sm">
          <div className="space-y-1">
            {title && (
              <div className="font-medium text-slate-900 dark:text-slate-100">{title}</div>
            )}
            <div className="text-sm text-slate-600 dark:text-slate-400">{content}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Contenido de tooltips predefinidos para elementos SEO
export const seoTooltips = {
  coreWebVitals: {
    title: "Core Web Vitals",
    content: "Métricas esenciales de Google que miden la experiencia del usuario: velocidad de carga (LCP), interactividad (FID), y estabilidad visual (CLS)."
  },
  performanceScore: {
    title: "Puntuación de Rendimiento",
    content: "Evaluación general del rendimiento de carga basada en múltiples métricas. 90+ es excelente, 50-89 necesita mejoras, <50 es pobre."
  },
  accessibilityScore: {
    title: "Puntuación de Accesibilidad",
    content: "Mide qué tan accesible es tu sitio para usuarios con discapacidades. Incluye contraste, navegación por teclado, y lectores de pantalla."
  },
  seoScore: {
    title: "Puntuación SEO",
    content: "Evaluación de optimización para motores de búsqueda basada en meta tags, estructura de contenido, y mejores prácticas."
  },
  bestPracticesScore: {
    title: "Mejores Prácticas",
    content: "Cumplimiento de estándares web modernos incluyendo seguridad, rendimiento, y prácticas de desarrollo recomendadas."
  },
  metaDescription: {
    title: "Meta Description",
    content: "Descripción que aparece en resultados de búsqueda. Longitud óptima: 150-160 caracteres. Debe ser única y descriptiva."
  },
  titleTag: {
    title: "Etiqueta Title",
    content: "Título que aparece en la pestaña del navegador y resultados de búsqueda. Longitud óptima: 50-60 caracteres."
  },
  openGraph: {
    title: "Open Graph Tags",
    content: "Meta tags que controlan cómo se ve tu página cuando se comparte en redes sociales como Facebook y LinkedIn."
  },
  twitterCards: {
    title: "Twitter Cards",
    content: "Meta tags específicos para optimizar cómo se muestra tu contenido cuando se comparte en X (Twitter)."
  },
  headingStructure: {
    title: "Estructura de Encabezados",
    content: "Jerarquía H1-H6 que ayuda a los motores de búsqueda entender la estructura de tu contenido. Debe comenzar con H1."
  },
  waterfallAnalysis: {
    title: "Análisis de Waterfall",
    content: "Visualización detallada de cómo se cargan los recursos de tu página, identificando cuellos de botella y oportunidades de optimización."
  },
  technicalSeo: {
    title: "SEO Técnico",
    content: "Verificación de elementos técnicos como SSL, viewport, charset, y otros factores que afectan el rendimiento SEO."
  },
  keywordAnalysis: {
    title: "Análisis de Palabras Clave",
    content: "Evaluación de palabras clave utilizadas en tu contenido y oportunidades de optimización para mejorar el ranking."
  },
  aiContentAnalysis: {
    title: "Análisis de Contenido IA",
    content: "Evaluación inteligente de la calidad y relevancia de tu contenido para búsquedas modernas y algoritmos de IA."
  }
};