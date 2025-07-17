#!/usr/bin/env node

// Script para corregir problemas de traducción en producción
// Aplica un sistema de traducción compatible con minificación

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo traducciones para producción...\n');

// Función para reemplazar contenido en archivos
const replaceInFile = (filePath, searchValue, replaceValue) => {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Archivo no encontrado: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(searchValue)) {
    console.log(`⚠️  Patrón no encontrado en ${filePath}: ${searchValue}`);
    return false;
  }
  
  const newContent = content.replace(new RegExp(searchValue, 'g'), replaceValue);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`✅ Actualizado: ${filePath}`);
  return true;
};

// 1. Crear sistema de traducción simplificado
const createProductionTranslations = () => {
  console.log('1. Creando sistema de traducción para producción...');
  
  const translationContent = `// Production-safe translation system
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
`;
  
  fs.writeFileSync('client/src/lib/production-translations.ts', translationContent);
  console.log('   ✅ Creado: client/src/lib/production-translations.ts\n');
};

// 2. Actualizar componente URL Comparison
const updateUrlComparison = () => {
  console.log('2. Actualizando URLComparison...');
  
  const filePath = 'client/src/components/url-comparison-simple.tsx';
  
  // Reemplazar import
  replaceInFile(filePath, 
    "import { useQuery } from '@tanstack/react-query';", 
    "import { useQuery } from '@tanstack/react-query';\nimport { getText } from '@/lib/production-translations';"
  );
  
  // Reemplazar función de traducción
  replaceInFile(filePath, 
    /\/\/ Simple translation object to avoid function call errors[\s\S]*?};/,
    "// Use production translation system"
  );
  
  // Reemplazar llamadas a getText
  replaceInFile(filePath, 
    'const getText = \\(key: string\\) => {[\\s\\S]*?};',
    '// Use production translation system'
  );
  
  // Reemplazar uso de getText con parámetros
  replaceInFile(filePath, 
    'getText\\(([^)]+)\\)',
    'getText($1, language)'
  );
  
  console.log('');
};

// 3. Actualizar componente Rate Limit
const updateRateLimit = () => {
  console.log('3. Actualizando RateLimitNotification...');
  
  const filePath = 'client/src/components/rate-limit-notification.tsx';
  
  // Agregar import
  replaceInFile(filePath, 
    "import { Alert, AlertDescription } from '@/components/ui/alert';", 
    "import { Alert, AlertDescription } from '@/components/ui/alert';\nimport { getText } from '@/lib/production-translations';"
  );
  
  // Reemplazar función de traducción
  replaceInFile(filePath, 
    /\/\/ Simple translations[\s\S]*?};/g,
    "// Use production translation system"
  );
  
  // Reemplazar llamadas a getText
  replaceInFile(filePath, 
    'getText\\(([^)]+)\\)',
    'getText($1, "en")'
  );
  
  console.log('');
};

// 4. Crear build script optimizado
const createBuildScript = () => {
  console.log('4. Creando script de build optimizado...');
  
  const buildScript = `#!/bin/bash
# DLMETRIX - Build script optimizado para producción

set -e

echo "🚀 Iniciando build de DLMETRIX para producción..."

# Limpiar archivos anteriores
echo "🧹 Limpiando archivos anteriores..."
rm -rf dist/
rm -rf node_modules/.vite/

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --legacy-peer-deps

# Verificar archivos críticos
echo "🔍 Verificando archivos críticos..."
if [ ! -f "client/src/lib/production-translations.ts" ]; then
    echo "❌ Falta archivo de traducción para producción"
    exit 1
fi

# Build optimizado
echo "🏗️  Generando build optimizado..."
npm run build

# Verificar build
echo "✅ Verificando build generado..."
if [ ! -f "dist/index.js" ]; then
    echo "❌ Error: Build no generado correctamente"
    exit 1
fi

echo "🎉 Build completado exitosamente!"
echo "📁 Archivos generados en: dist/"
echo "🚀 Listo para despliegue en producción"
`;
  
  fs.writeFileSync('build-production.sh', buildScript);
  fs.chmodSync('build-production.sh', '755');
  console.log('   ✅ Creado: build-production.sh\n');
};

// 5. Ejecutar todas las correcciones
const main = () => {
  console.log('=' .repeat(50));
  console.log('🔧 DLMETRIX - Corrección de Traducciones');
  console.log('=' .repeat(50));
  console.log('');
  
  createProductionTranslations();
  updateUrlComparison();
  updateRateLimit();
  createBuildScript();
  
  console.log('🎉 ¡Corrección completada!');
  console.log('');
  console.log('📋 Próximos pasos:');
  console.log('1. Ejecutar: ./build-production.sh');
  console.log('2. Subir archivos al servidor');
  console.log('3. Ejecutar: ./deploy-production.sh');
  console.log('4. Verificar funcionamiento');
  console.log('');
  console.log('📚 Los archivos están listos para producción');
};

main();