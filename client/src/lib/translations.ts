// Comprehensive translation system for DLMETRIX

export interface Translations {
  // Header and Navigation
  title: string;
  subtitle: string;
  history: string;
  settings: string;
  help: string;
  saveReport: string;
  generating: string;
  
  // Analysis States
  analyzingWebsite: string;
  analysisHistory: string;
  clearAll: string;
  noAnalysisHistory: string;
  analyzeWebsite: string;
  analysisLoaded: string;
  viewingResults: string;
  comparing: string;
  exitComparison: string;
  
  // Settings
  analysisSettings: string;
  darkMode: string;
  language: string;
  english: string;
  spanish: string;
  
  // Help Content
  helpTitle: string;
  howItWorks: string;
  analysisTypes: string;
  desktopAnalysis: string;
  desktopAnalysisDesc: string;
  mobileAnalysis: string;
  mobileAnalysisDesc: string;
  seoAnalysis: string;
  seoAnalysisDesc: string;
  analysisFeatures: string;
  feature1: string;
  feature2: string;
  feature3: string;
  feature4: string;
  feature5: string;
  feature6: string;
  feature7: string;
  feature8: string;
  feature9: string;
  feature10: string;
  howToUse: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  
  // URL Input
  enterUrl: string;
  analyze: string;
  analyzing: string;
  
  // Performance Overview
  performanceOverview: string;
  performance: string;
  accessibility: string;
  bestPractices: string;
  seo: string;
  
  // Core Web Vitals
  coreWebVitals: string;
  mobile: string;
  desktop: string;
  lcp: string;
  fid: string;
  cls: string;
  fcp: string;
  ttfb: string;
  good: string;
  needsImprovement: string;
  poor: string;
  
  // SEO Analysis
  seoAnalysisResults: string;
  metaDescription: string;
  openGraphTags: string;
  twitterCards: string;
  technicalSeo: string;
  recommendations: string;
  
  // Recommendations
  highPriority: string;
  mediumPriority: string;
  lowPriority: string;
  howToFix: string;
  
  // Technical SEO
  technicalSeoAnalysis: string;
  passed: string;
  failed: string;
  
  // Common Terms
  characters: string;
  notFound: string;
  notSpecified: string;
  tags: string;
  none: string;
  items: string;
  
  // PDF Export
  webAnalysisReport: string;
  generatedOn: string;
  
  // Errors and Messages
  noDataToExport: string;
  analyzeFirst: string;
  reportExported: string;
  pdfDownloaded: string;
  exportFailed: string;
  tryAgain: string;
  csvExported: string;
  csvDescription: string;
  exportCSV: string;
  comparisonEnabled: string;
  comparingWith: string;
  
  // New Navigation Elements
  whyDlmetrix: string;
  contact: string;
  enjoyingDlmetrix: string;
  
  // Why DLMETRIX Dialog
  whyDlmetrixTitle: string;
  whyDlmetrixContent1: string;
  whyDlmetrixContent2: string;
  whyDlmetrixContent3: string;
  supportProjectTitle: string;
  supportProjectDescription: string;
  buyMeCoffee: string;
  
  // Contact Dialog
  contactTitle: string;
  contactDescription: string;
  emailSupport: string;
  responseTime: string;
  emailCopied: string;
  emailCopiedDescription: string;
  copyFailed: string;
  copyFailedDescription: string;
  
  // Support Dialog
  supportTitle: string;
  supportDescription: string;
}

export const translations: Record<'en' | 'es', Translations> = {
  en: {
    // Header and Navigation
    title: "DLMETRIX",
    subtitle: "Comprehensive website analysis with Core Web Vitals, SEO, and performance insights",
    history: "History",
    settings: "Settings", 
    help: "Help",
    saveReport: "Save Report",
    generating: "Generating...",
    
    // Analysis States
    analyzingWebsite: "Analyzing Website",
    analysisHistory: "Analysis History",
    clearAll: "Clear All",
    noAnalysisHistory: "No analysis history yet",
    analyzeWebsite: "Analyze a website to see it here",
    analysisLoaded: "Analysis loaded",
    viewingResults: "Viewing results for",
    comparing: "Comparing",
    exitComparison: "Exit Comparison",
    
    // Settings
    analysisSettings: "Analysis Settings",
    darkMode: "Dark Mode",
    language: "Language",
    english: "English",
    spanish: "Spanish",
    
    // Help Content
    helpTitle: "How to Use DLMETRIX",
    howItWorks: "How It Works",
    analysisTypes: "Analysis Types",
    desktopAnalysis: "Desktop Analysis",
    desktopAnalysisDesc: "Full Lighthouse audit for desktop performance, accessibility, and SEO",
    mobileAnalysis: "Mobile Analysis", 
    mobileAnalysisDesc: "Mobile-optimized performance testing with Core Web Vitals measurement",
    seoAnalysis: "SEO Analysis",
    seoAnalysisDesc: "Comprehensive meta tag analysis, social media optimization, and technical SEO",
    analysisFeatures: "Analysis Features",
    feature1: "Real-time Core Web Vitals measurement (LCP, FID, CLS)",
    feature2: "Mobile and desktop screenshot capture", 
    feature3: "Comprehensive performance diagnostics",
    feature4: "SEO recommendations with fix instructions",
    feature5: "Social media optimization analysis",
    feature6: "PDF and CSV export capabilities",
    feature7: "AI Search Content Analysis for search engine indexing",
    feature8: "SEO Keyword Analysis with trend visualization",
    feature9: "Social media preview optimization (Open Graph, Twitter Cards)",
    feature10: "Technical SEO auditing with detailed fix guides",
    howToUse: "How to Use",
    step1: "Enter a website URL in the search box above",
    step2: "Click 'Analyze' to start the comprehensive analysis",
    step3: "Review the results including performance scores, Core Web Vitals, and SEO insights",
    step4: "Use the recommendations to improve your website's performance and SEO",
    
    // URL Input
    enterUrl: "Enter website URL to analyze",
    analyze: "Analyze",
    analyzing: "Analyzing...",
    
    // Performance Overview
    performanceOverview: "Performance Overview",
    performance: "Performance",
    accessibility: "Accessibility",
    bestPractices: "Best Practices",
    seo: "SEO",
    
    // Core Web Vitals
    coreWebVitals: "Core Web Vitals",
    mobile: "Mobile",
    desktop: "Desktop",
    lcp: "LCP",
    fid: "FID",
    cls: "CLS",
    fcp: "FCP",
    ttfb: "TTFB",
    good: "Good",
    needsImprovement: "Needs Improvement",
    poor: "Poor",
    
    // Core Web Vitals Additional
    averageScore: "Average Score",
    basedOnMetrics: "Based on Core Web Vitals performance",
    issuesFound: "Issues Found & Recommendations",
    performanceAreas: "performance areas that need attention",
    excellent: "Excellent",
    needsWork: "Needs Work",
    screenshotNotAvailable: "Screenshot Not Available",
    screenshotFailureReason: "Screenshot could not be generated. This may be due to server policies, security restrictions, or website blocking features.",
    
    // SEO Analysis
    seoAnalysisResults: "SEO Analysis Results",
    metaDescription: "Meta Description",
    openGraphTags: "Open Graph Tags",
    twitterCards: "Twitter Cards",
    technicalSeo: "Technical SEO",
    recommendations: "Recommendations",
    
    // Recommendations
    highPriority: "High Priority",
    mediumPriority: "Medium Priority", 
    lowPriority: "Low Priority",
    howToFix: "How to Fix This Issue",
    
    // Technical SEO
    technicalSeoAnalysis: "Technical SEO Analysis",
    passed: "Passed",
    failed: "Failed",
    
    // Common Terms
    characters: "characters",
    notFound: "Not found",
    notSpecified: "Not specified",
    tags: "tags",
    none: "None",
    items: "items",
    
    // PDF Export
    webAnalysisReport: "Web Analysis Report",
    generatedOn: "Generated on",
    
    // Errors and Messages
    noDataToExport: "No data to export",
    analyzeFirst: "Please analyze a website first to generate a report.",
    reportExported: "Report exported successfully",
    pdfDownloaded: "Your PDF report has been downloaded.",
    exportFailed: "Export failed",
    tryAgain: "There was an error generating the PDF report. Please try again.",
    csvExported: "CSV exported!",
    csvDescription: "Analysis data has been exported to CSV format.",
    exportCSV: "Export CSV",
    comparisonEnabled: "Comparison mode enabled",
    comparingWith: "Comparing current analysis with",
    
    // New Navigation Elements
    whyDlmetrix: "Why DLMETRIX",
    contact: "Contact",
    enjoyingDlmetrix: "Enjoying DLMETRIX?",
    
    // Why DLMETRIX Dialog
    whyDlmetrixTitle: "Why DLMETRIX",
    whyDlmetrixContent1: "DLMETRIX was born from the need to provide a powerful and accessible SEO metrics tool—without the high costs often associated with similar platforms. While many competitors limit essential features behind paywalls, DLMETRIX offers real-time, high-quality web analytics that anyone can use for free.",
    whyDlmetrixContent2: "Our mission is to democratize SEO and performance analysis by delivering cutting-edge diagnostic tools built with the latest web technologies. With DLMETRIX, users can gain instant insights into their site's Core Web Vitals, technical SEO, mobile readiness, social media previews, and keyword trends—all with the support of AI-driven content analysis and actionable recommendations.",
    whyDlmetrixContent3: "Whether you're a developer, marketer, freelancer, or business owner, DLMETRIX empowers you to optimize your online presence with ease, clarity, and transparency. No barriers. No hidden fees. Just smart, reliable metrics—ready when you are.",
    supportProjectTitle: "Enjoying DLMETRIX?",
    supportProjectDescription: "If you'd like to support this project, consider buying me a coffee ☕—your contribution helps keep the platform free and growing!",
    buyMeCoffee: "Buy me a coffee",
    
    // Contact Dialog
    contactTitle: "Contact Information",
    contactDescription: "Need help or have questions about DLMETRIX? Get in touch with our support team:",
    emailSupport: "Email Support",
    responseTime: "We typically respond within 24 hours during business days.",
    emailCopied: "Email copied!",
    emailCopiedDescription: "Email address has been copied to clipboard.",
    copyFailed: "Copy failed",
    copyFailedDescription: "Please copy the email manually: support@dlmetrix.com",
    
    // Support Dialog
    supportTitle: "Support DLMETRIX",
    supportDescription: "If you'd like to support this project, consider buying me a coffee ☕—your contribution helps keep the platform free and growing!"
  },
  es: {
    // Header and Navigation
    title: "DLMETRIX",
    subtitle: "Análisis integral de sitios web con Core Web Vitals, SEO e insights de rendimiento",
    history: "Historial",
    settings: "Configuración",
    help: "Ayuda", 
    saveReport: "Guardar Reporte",
    generating: "Generando...",
    
    // Analysis States
    analyzingWebsite: "Analizando Sitio Web",
    analysisHistory: "Historial de Análisis",
    clearAll: "Limpiar Todo",
    noAnalysisHistory: "No hay historial de análisis",
    analyzeWebsite: "Analiza un sitio web para verlo aquí",
    analysisLoaded: "Análisis cargado",
    viewingResults: "Viendo resultados para",
    comparing: "Comparando",
    exitComparison: "Salir de Comparación",
    
    // Settings
    analysisSettings: "Configuración de Análisis",
    darkMode: "Modo Oscuro",
    language: "Idioma",
    english: "Inglés",
    spanish: "Español",
    
    // Help Content
    helpTitle: "Cómo Usar DLMETRIX",
    howItWorks: "Cómo Funciona",
    analysisTypes: "Tipos de Análisis",
    desktopAnalysis: "Análisis de Escritorio",
    desktopAnalysisDesc: "Auditoría completa de Lighthouse para rendimiento, accesibilidad y SEO de escritorio",
    mobileAnalysis: "Análisis Móvil",
    mobileAnalysisDesc: "Pruebas de rendimiento optimizadas para móviles con medición de Core Web Vitals",
    seoAnalysis: "Análisis SEO",
    seoAnalysisDesc: "Análisis integral de meta tags, optimización para redes sociales y SEO técnico",
    analysisFeatures: "Características del Análisis",
    feature1: "Medición en tiempo real de Core Web Vitals (LCP, FID, CLS)",
    feature2: "Captura de pantalla móvil y escritorio",
    feature3: "Diagnósticos completos de rendimiento", 
    feature4: "Recomendaciones SEO con instrucciones de corrección",
    feature5: "Análisis de optimización para redes sociales",
    feature6: "Capacidades de exportación a PDF y CSV",
    feature7: "Análisis de Contenido IA para indexación en motores de búsqueda",
    feature8: "Análisis de Palabras Clave SEO con visualización de tendencias",
    feature9: "Optimización de previsualizaciones en redes sociales (Open Graph, Twitter Cards)",
    feature10: "Auditoría técnica de SEO con guías detalladas de corrección",
    howToUse: "Cómo Usar",
    step1: "Ingresa una URL de sitio web en el cuadro de búsqueda arriba",
    step2: "Haz clic en 'Analizar' para iniciar el análisis integral",
    step3: "Revisa los resultados incluyendo puntuaciones de rendimiento, Core Web Vitals e insights SEO",
    step4: "Usa las recomendaciones para mejorar el rendimiento y SEO de tu sitio web",
    
    // URL Input
    enterUrl: "Ingresa URL del sitio web a analizar",
    analyze: "Analizar",
    analyzing: "Analizando...",
    
    // Performance Overview
    performanceOverview: "Resumen de Rendimiento",
    performance: "Rendimiento",
    accessibility: "Accesibilidad",
    bestPractices: "Mejores Prácticas",
    seo: "SEO",
    
    // Core Web Vitals
    coreWebVitals: "Core Web Vitals",
    mobile: "Móvil",
    desktop: "Escritorio",
    lcp: "LCP",
    fid: "FID", 
    cls: "CLS",
    fcp: "FCP",
    ttfb: "TTFB",
    good: "Bueno",
    needsImprovement: "Necesita Mejora",
    poor: "Pobre",
    
    // Core Web Vitals Additional
    averageScore: "Puntuación Promedio",
    basedOnMetrics: "Basado en el rendimiento de Core Web Vitals",
    issuesFound: "Problemas Encontrados y Recomendaciones",
    performanceAreas: "áreas de rendimiento que necesitan atención",
    excellent: "Excelente",
    needsWork: "Necesita Trabajo",
    screenshotNotAvailable: "Captura de Pantalla No Disponible",
    screenshotFailureReason: "No se pudo generar la captura de pantalla. Esto puede deberse a políticas del servidor, restricciones de seguridad o funciones de bloqueo del sitio web.",
    
    // SEO Analysis
    seoAnalysisResults: "Resultados del Análisis SEO",
    metaDescription: "Meta Descripción",
    openGraphTags: "Etiquetas Open Graph",
    twitterCards: "Twitter Cards",
    technicalSeo: "SEO Técnico",
    recommendations: "Recomendaciones",
    
    // Recommendations
    highPriority: "Prioridad Alta",
    mediumPriority: "Prioridad Media",
    lowPriority: "Prioridad Baja",
    howToFix: "Cómo Arreglar Este Problema",
    
    // Technical SEO
    technicalSeoAnalysis: "Análisis de SEO Técnico",
    passed: "Aprobado",
    failed: "Fallido",
    
    // Common Terms
    characters: "caracteres",
    notFound: "No encontrado",
    notSpecified: "No especificado",
    tags: "etiquetas",
    none: "Ninguno",
    items: "elementos",
    
    // PDF Export
    webAnalysisReport: "Reporte de Análisis Web",
    generatedOn: "Generado el",
    
    // Errors and Messages
    noDataToExport: "No hay datos para exportar",
    analyzeFirst: "Por favor analiza un sitio web primero para generar un reporte.",
    reportExported: "Reporte exportado exitosamente",
    pdfDownloaded: "Tu reporte PDF ha sido descargado.",
    exportFailed: "Error al exportar",
    tryAgain: "Hubo un error generando el reporte PDF. Por favor intenta de nuevo.",
    csvExported: "¡CSV exportado!",
    csvDescription: "Los datos del análisis han sido exportados a formato CSV.",
    exportCSV: "Exportar CSV",
    comparisonEnabled: "Modo de comparación habilitado",
    comparingWith: "Comparando análisis actual con",
    
    // New Navigation Elements
    whyDlmetrix: "Por qué DLMETRIX",
    contact: "Contacto",
    enjoyingDlmetrix: "¿Te gusta DLMETRIX?",
    
    // Why DLMETRIX Dialog
    whyDlmetrixTitle: "Por qué DLMETRIX",
    whyDlmetrixContent1: "DLMETRIX nació de la necesidad de proporcionar una herramienta de métricas SEO potente y accesible, sin los altos costos que suelen asociarse con plataformas similares. Mientras muchos competidores limitan funciones esenciales detrás de muros de pago, DLMETRIX ofrece análisis web de alta calidad en tiempo real que cualquiera puede usar gratis.",
    whyDlmetrixContent2: "Nuestra misión es democratizar el análisis SEO y de rendimiento entregando herramientas de diagnóstico de vanguardia construidas con las últimas tecnologías web. Con DLMETRIX, los usuarios pueden obtener insights instantáneos sobre Core Web Vitals, SEO técnico, preparación móvil, previsualizaciones de redes sociales y tendencias de palabras clave, todo con el apoyo de análisis de contenido impulsado por IA y recomendaciones accionables.",
    whyDlmetrixContent3: "Ya seas desarrollador, marketero, freelancer o dueño de negocio, DLMETRIX te empodera para optimizar tu presencia online con facilidad, claridad y transparencia. Sin barreras. Sin tarifas ocultas. Solo métricas inteligentes y confiables, listas cuando las necesites.",
    supportProjectTitle: "¿Te gusta DLMETRIX?",
    supportProjectDescription: "Si te gustaría apoyar este proyecto, considera comprarme un café ☕—tu contribución ayuda a mantener la plataforma gratuita y en crecimiento!",
    buyMeCoffee: "Cómprame un café",
    
    // Contact Dialog
    contactTitle: "Información de Contacto",
    contactDescription: "¿Necesitas ayuda o tienes preguntas sobre DLMETRIX? Ponte en contacto con nuestro equipo de soporte:",
    emailSupport: "Soporte por Email",
    responseTime: "Típicamente respondemos dentro de 24 horas durante días laborales.",
    emailCopied: "¡Email copiado!",
    emailCopiedDescription: "La dirección de email ha sido copiada al portapapeles.",
    copyFailed: "Error al copiar",
    copyFailedDescription: "Por favor copia el email manualmente: support@dlmetrix.com",
    
    // Support Dialog
    supportTitle: "Apoyar DLMETRIX",
    supportDescription: "Si te gustaría apoyar este proyecto, considera comprarme un café ☕—tu contribución ayuda a mantener la plataforma gratuita y en crecimiento!"
  }
};

export function getTranslations(language: 'en' | 'es'): Translations {
  return translations[language];
}