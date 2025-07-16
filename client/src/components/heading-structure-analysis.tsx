import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface HeadingStructureAnalysisProps {
  data: {
    headings?: {
      h1: string[];
      h2: string[];
      h3: string[];
      h4: string[];
      h5: string[];
      h6: string[];
    };
  };
  language?: 'en' | 'es';
}

const translations = {
  en: {
    title: "Heading Structure Analysis",
    hierarchyTree: "Heading Hierarchy Tree",
    statistics: "Heading Statistics",
    analysis: "Hierarchy Analysis",
    recommendations: "Recommendations",
    noHeadings: "No headings found on this page",
    count: "Count",
    type: "Type",
    issues: {
      noH1: "Missing H1 heading - every page should have exactly one H1",
      multipleH1: "Multiple H1 headings found - use only one H1 per page",
      skipLevel: "Heading hierarchy jumps levels - avoid skipping from H1 to H3",
      excessiveUse: "Excessive use of heading levels",
      poorStructure: "Poor heading structure affects SEO and accessibility"
    },
    recommendationTexts: {
      addH1: "Add a single, descriptive H1 heading that defines the main topic",
      consolidateH1: "Use only one H1 heading and convert others to H2 or lower levels",
      fixHierarchy: "Follow proper hierarchy: H1 → H2 → H3 → H4 → H5 → H6",
      balanceHeadings: "Balance heading distribution for better content structure",
      improveStructure: "Restructure headings to create logical content flow"
    },
    status: {
      good: "Good heading structure",
      warning: "Heading structure needs improvement",
      error: "Critical heading structure issues"
    }
  },
  es: {
    title: "Análisis de Estructura de Encabezados",
    hierarchyTree: "Árbol de Jerarquía de Encabezados",
    statistics: "Estadísticas de Encabezados",
    analysis: "Análisis de Jerarquía",
    recommendations: "Recomendaciones",
    noHeadings: "No se encontraron encabezados en esta página",
    count: "Cantidad",
    type: "Tipo",
    issues: {
      noH1: "Falta encabezado H1 - cada página debe tener exactamente un H1",
      multipleH1: "Se encontraron múltiples encabezados H1 - usa solo uno por página",
      skipLevel: "La jerarquía de encabezados salta niveles - evita saltar de H1 a H3",
      excessiveUse: "Uso excesivo de niveles de encabezados",
      poorStructure: "La estructura pobre de encabezados afecta SEO y accesibilidad"
    },
    recommendationTexts: {
      addH1: "Agrega un solo encabezado H1 descriptivo que defina el tema principal",
      consolidateH1: "Usa solo un encabezado H1 y convierte otros a H2 o niveles inferiores",
      fixHierarchy: "Sigue la jerarquía adecuada: H1 → H2 → H3 → H4 → H5 → H6",
      balanceHeadings: "Equilibra la distribución de encabezados para mejor estructura",
      improveStructure: "Reestructura encabezados para crear flujo lógico de contenido"
    },
    status: {
      good: "Buena estructura de encabezados",
      warning: "La estructura de encabezados necesita mejoras",
      error: "Problemas críticos en estructura de encabezados"
    }
  }
};

export default function HeadingStructureAnalysis({ data, language = 'en' }: HeadingStructureAnalysisProps) {
  const t = translations[language];
  const headings = data.headings || { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
  
  // Calculate statistics
  const stats = {
    h1: headings.h1.length,
    h2: headings.h2.length,
    h3: headings.h3.length,
    h4: headings.h4.length,
    h5: headings.h5.length,
    h6: headings.h6.length
  };
  
  const totalHeadings = Object.values(stats).reduce((sum, count) => sum + count, 0);
  
  // Analyze hierarchy issues
  const issues = [];
  const recommendations = [];
  let status: 'good' | 'warning' | 'error' = 'good';
  
  if (stats.h1 === 0) {
    issues.push(t.issues.noH1);
    recommendations.push(t.recommendationTexts.addH1);
    status = 'error';
  } else if (stats.h1 > 1) {
    issues.push(t.issues.multipleH1);
    recommendations.push(t.recommendationTexts.consolidateH1);
    status = 'warning';
  }
  
  // Check for level skipping
  const levelsUsed = Object.entries(stats)
    .filter(([_, count]) => count > 0)
    .map(([level, _]) => parseInt(level.replace('h', '')));
  
  for (let i = 1; i < levelsUsed.length; i++) {
    if (levelsUsed[i] - levelsUsed[i-1] > 1) {
      issues.push(t.issues.skipLevel);
      recommendations.push(t.recommendationTexts.fixHierarchy);
      if (status === 'good') status = 'warning';
      break;
    }
  }
  
  // Check for excessive use
  const excessiveCount = Object.values(stats).some(count => count > 10);
  if (excessiveCount) {
    issues.push(t.issues.excessiveUse);
    recommendations.push(t.recommendationTexts.balanceHeadings);
    if (status === 'good') status = 'warning';
  }
  
  // Check overall structure
  if (totalHeadings > 0 && stats.h1 > 0 && levelsUsed.length === 1 && levelsUsed[0] === 1) {
    issues.push(t.issues.poorStructure);
    recommendations.push(t.recommendationTexts.improveStructure);
    if (status === 'good') status = 'warning';
  }
  
  const getStatusIcon = () => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };
  
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'error': return 'text-red-600 dark:text-red-400';
    }
  };

  if (totalHeadings === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-200">{t.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
            <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              {t.noHeadings}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
          {getStatusIcon()}
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Heading Tree Structure */}
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">{t.hierarchyTree}</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((level) => {
              const levelHeadings = headings[level as keyof typeof headings] || [];
              const levelNumber = level.replace('h', '');
              const indent = (parseInt(levelNumber) - 1) * 20;
              
              return levelHeadings.map((heading, index) => (
                <div 
                  key={`${level}-${index}`}
                  style={{ marginLeft: `${indent}px` }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border-l-4 border-blue-400 dark:border-blue-500"
                >
                  <Badge 
                    variant="secondary" 
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-mono"
                  >
                    {level.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                    {heading || `(${language === 'es' ? 'Vacío' : 'Empty'})`}
                  </span>
                </div>
              ));
            })}
          </div>
        </div>

        {/* Statistics */}
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">{t.statistics}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(stats).map(([level, count]) => (
              <div key={level} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {level.toUpperCase()}
                </div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis and Status */}
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">{t.analysis}</h4>
          <div className={`flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="font-medium">
              {status === 'good' ? t.status.good : status === 'warning' ? t.status.warning : t.status.error}
            </span>
          </div>
        </div>

        {/* Issues and Recommendations */}
        {(issues.length > 0 || recommendations.length > 0) && (
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">{t.recommendations}</h4>
            <div className="space-y-3">
              {issues.map((issue, index) => (
                <Alert key={`issue-${index}`} className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    {issue}
                  </AlertDescription>
                </Alert>
              ))}
              {recommendations.map((recommendation, index) => (
                <Alert key={`rec-${index}`} className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    {recommendation}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}