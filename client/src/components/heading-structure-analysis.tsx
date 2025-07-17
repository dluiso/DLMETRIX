import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Info, ArrowRight } from "lucide-react";

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
    headingStructure?: Array<{ level: string; text: string; order: number }>;
  };
  language?: 'en' | 'es';
}

const translations = {
  en: {
    title: "Heading Structure Analysis",
    hierarchyTree: "Heading Hierarchy Tree",
    currentStructure: "Current Structure",
    suggestedStructure: "Suggested Structure",
    statistics: "Heading Statistics",
    analysis: "Hierarchy Analysis",
    recommendations: "Recommendations",
    noHeadings: "No headings found on this page",
    count: "Count",
    type: "Type",
    orderFound: "Order found on page",
    issues: {
      noH1: "Missing H1 heading - every page should have exactly one H1",
      multipleH1: "Multiple H1 headings found - use only one H1 per page",
      skipLevel: "Heading hierarchy jumps levels - avoid skipping from H1 to H3",
      excessiveUse: "Excessive use of heading levels",
      poorStructure: "Poor heading structure affects SEO and accessibility",
      noH1Start: "Page doesn't start with H1 - first heading should always be H1",
      wrongStart: "Page starts with wrong heading level - this affects SEO and accessibility"
    },
    recommendationTexts: {
      addH1: "Add a single, descriptive H1 heading that defines the main topic",
      consolidateH1: "Use only one H1 heading and convert others to H2 or lower levels",
      fixHierarchy: "Follow proper hierarchy: H1 → H2 → H3 → H4 → H5 → H6",
      balanceHeadings: "Balance heading distribution for better content structure",
      improveStructure: "Restructure headings to create logical content flow",
      startWithH1: "Always start your page with an H1 heading as the main title",
      fixStartLevel: "Move your first heading to H1 and adjust subsequent headings accordingly"
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
    currentStructure: "Estructura Actual",
    suggestedStructure: "Estructura Sugerida",
    statistics: "Estadísticas de Encabezados",
    analysis: "Análisis de Jerarquía",
    recommendations: "Recomendaciones",
    noHeadings: "No se encontraron encabezados en esta página",
    count: "Cantidad",
    type: "Tipo",
    orderFound: "Orden encontrado en la página",
    issues: {
      noH1: "Falta encabezado H1 - cada página debe tener exactamente un H1",
      multipleH1: "Se encontraron múltiples encabezados H1 - usa solo uno por página",
      skipLevel: "La jerarquía de encabezados salta niveles - evita saltar de H1 a H3",
      excessiveUse: "Uso excesivo de niveles de encabezados",
      poorStructure: "La estructura pobre de encabezados afecta SEO y accesibilidad",
      noH1Start: "La página no comienza con H1 - el primer encabezado siempre debe ser H1",
      wrongStart: "La página comienza con nivel incorrecto - esto afecta SEO y accesibilidad"
    },
    recommendationTexts: {
      addH1: "Agrega un solo encabezado H1 descriptivo que defina el tema principal",
      consolidateH1: "Usa solo un encabezado H1 y convierte otros a H2 o niveles inferiores",
      fixHierarchy: "Sigue la jerarquía adecuada: H1 → H2 → H3 → H4 → H5 → H6",
      balanceHeadings: "Equilibra la distribución de encabezados para mejor estructura",
      improveStructure: "Reestructura encabezados para crear flujo lógico de contenido",
      startWithH1: "Siempre comienza tu página con un encabezado H1 como título principal",
      fixStartLevel: "Mueve tu primer encabezado a H1 y ajusta los encabezados siguientes"
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
  
  // Use heading structure from server data if available, otherwise create from grouped headings
  const orderedStructure = data.headingStructure || (() => {
    const structure = [];
    let order = 1;
    
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((level) => {
      const levelHeadings = headings[level as keyof typeof headings] || [];
      levelHeadings.forEach((text) => {
        structure.push({ level, text, order: order++ });
      });
    });
    
    return structure;
  })();
  const firstHeadingLevel = orderedStructure.length > 0 ? orderedStructure[0].level : null;
  
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
  
  // Check if page starts with H1
  if (firstHeadingLevel && firstHeadingLevel !== 'h1') {
    issues.push(t.issues.noH1Start);
    recommendations.push(t.recommendationTexts.startWithH1);
    status = 'error';
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
  
  // Generate suggested structure
  const generateSuggestedStructure = () => {
    if (orderedStructure.length === 0) return [];
    
    const suggested = [];
    let currentH1 = null;
    
    orderedStructure.forEach((item, index) => {
      if (index === 0) {
        // First heading should always be H1
        suggested.push({ level: 'h1', text: item.text, order: 1 });
        currentH1 = item.text;
      } else {
        // Adjust subsequent headings based on content hierarchy
        const originalLevel = parseInt(item.level.replace('h', ''));
        let suggestedLevel = Math.min(originalLevel, 6);
        
        // Ensure proper hierarchy
        if (suggestedLevel === 1 && currentH1) {
          suggestedLevel = 2; // Subsequent H1s should become H2s
        }
        
        suggested.push({ level: `h${suggestedLevel}`, text: item.text, order: index + 1 });
      }
    });
    
    return suggested;
  };
  
  const suggestedStructure = generateSuggestedStructure();
  
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
        {/* Heading Tree Structure with Tabs */}
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">{t.hierarchyTree}</h4>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="current">{t.currentStructure}</TabsTrigger>
              <TabsTrigger value="suggested">{t.suggestedStructure}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="space-y-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {t.orderFound}
              </div>
              {orderedStructure.map((item, index) => {
                const levelNumber = item.level.replace('h', '');
                const indent = (parseInt(levelNumber) - 1) * 20;
                const isFirstAndNotH1 = index === 0 && item.level !== 'h1';
                
                return (
                  <div 
                    key={`current-${index}`}
                    style={{ marginLeft: `${indent}px` }}
                    className={`flex items-center gap-2 p-2 rounded-lg border-l-4 ${
                      isFirstAndNotH1 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-500' 
                        : 'bg-gray-50 dark:bg-gray-700 border-blue-400 dark:border-blue-500'
                    }`}
                  >
                    <Badge 
                      variant="secondary" 
                      className={`text-xs font-mono ${
                        isFirstAndNotH1
                          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      }`}
                    >
                      {item.level.toUpperCase()}
                    </Badge>
                    {isFirstAndNotH1 && (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                      {item.text || `(${language === 'es' ? 'Vacío' : 'Empty'})`}
                    </span>
                  </div>
                );
              })}
            </TabsContent>
            
            <TabsContent value="suggested" className="space-y-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {language === 'es' ? 'Estructura recomendada para SEO óptimo' : 'Recommended structure for optimal SEO'}
              </div>
              {suggestedStructure.map((item, index) => {
                const levelNumber = item.level.replace('h', '');
                const indent = (parseInt(levelNumber) - 1) * 20;
                const originalItem = orderedStructure[index];
                const hasChanged = originalItem && originalItem.level !== item.level;
                
                return (
                  <div 
                    key={`suggested-${index}`}
                    style={{ marginLeft: `${indent}px` }}
                    className={`flex items-center gap-2 p-2 rounded-lg border-l-4 ${
                      hasChanged 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-500'
                        : 'bg-gray-50 dark:bg-gray-700 border-blue-400 dark:border-blue-500'
                    }`}
                  >
                    <Badge 
                      variant="secondary" 
                      className={`text-xs font-mono ${
                        hasChanged
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      }`}
                    >
                      {item.level.toUpperCase()}
                    </Badge>
                    {hasChanged && (
                      <ArrowRight className="h-3 w-3 text-green-500" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                      {item.text || `(${language === 'es' ? 'Vacío' : 'Empty'})`}
                    </span>
                    {hasChanged && originalItem && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {language === 'es' ? 'era' : 'was'} {originalItem.level.toUpperCase()}
                      </span>
                    )}
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>

        {/* Statistics */}
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">{t.statistics}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
            {Object.entries(stats).map(([level, count]) => (
              <div key={level} className="p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-center">
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