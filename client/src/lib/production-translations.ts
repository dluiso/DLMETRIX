// Production-safe translation system
export const productionTranslations = {
  en: {
    urlComparison: "URL Comparison",
    noComparisonData: "No comparison data available. This is the first analysis for this URL.",
    comparisonDescription: "Compare current analysis with previous results to track improvements over time.",
    analysisHistory: "Analysis History",
    analyses: "analyses",
    lastAnalyzed: "Last Analyzed",
    hideComparison: "Hide Comparison",
    showComparison: "Show Comparison",
    improvements: "improvements",
    regressions: "regressions",
    coreWebVitalsChanges: "Core Web Vitals Changes",
    performance: "Performance",
    accessibility: "Accessibility",
    bestPractices: "Best Practices",
    seo: "SEO",
    rateLimitTitle: "Rate limit exceeded",
    queueStatus: "Queue Status",
    position: "Your position",
    inQueue: "in queue",
    activeAnalyses: "active analyses",
    estimatedWait: "Estimated wait time",
    seconds: "seconds",
    minutes: "minutes",
    analyzing: "Analyzing",
    complete: "Complete",
    seoAnalysis: "SEO Analysis"
  },
  es: {
    urlComparison: "Comparación de URL",
    noComparisonData: "No hay datos de comparación disponibles. Este es el primer análisis para esta URL.",
    comparisonDescription: "Compara el análisis actual con resultados anteriores para seguir las mejoras a lo largo del tiempo.",
    analysisHistory: "Historial de Análisis",
    analyses: "análisis",
    lastAnalyzed: "Último Analizado",
    hideComparison: "Ocultar Comparación",
    showComparison: "Mostrar Comparación",
    improvements: "mejoras",
    regressions: "regresiones",
    coreWebVitalsChanges: "Cambios en Core Web Vitals",
    performance: "Rendimiento",
    accessibility: "Accesibilidad",
    bestPractices: "Mejores Prácticas",
    seo: "SEO",
    rateLimitTitle: "Límite de velocidad excedido",
    queueStatus: "Estado de Cola",
    position: "Tu posición",
    inQueue: "en cola",
    activeAnalyses: "análisis activos",
    estimatedWait: "Tiempo estimado de espera",
    seconds: "segundos",
    minutes: "minutos",
    analyzing: "Analizando",
    complete: "Completo",
    seoAnalysis: "Análisis SEO"
  }
};

export const getText = (key: string, language: 'en' | 'es' = 'en'): string => {
  return productionTranslations[language]?.[key] || productionTranslations.en[key] || key;
};
