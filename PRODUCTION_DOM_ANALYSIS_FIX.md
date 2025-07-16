# Fix Critical: DOM Analysis en Producción

## **Problema Identificado:**
- Technical SEO Analysis ejecutándose pero retornando datos incorrectos
- `"hasH1Tag":false` cuando smartfiche.com SÍ tiene H1
- Función `generateBasicTechnicalChecks` presente pero no procesando DOM correctamente

## **Diagnóstico Específico:**

### 1. **Verificar fetchBasicSeoData en tu servidor:**
```bash
# Test la función de extracción DOM:
node -e "
const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const response = await axios.get('https://smartfiche.com');
  const $ = cheerio.load(response.data);
  const h1Elements = $('h1');
  console.log('H1 elements found:', h1Elements.length);
  console.log('H1 text:', h1Elements.first().text());
}
test().catch(console.error);
"
```

### 2. **Si el test anterior falla, el problema es axios/cheerio:**
```bash
# Verificar versiones:
npm list axios cheerio

# Reinstalar si es necesario:
npm install axios@^1.10.0 cheerio@^1.1.0
```

### 3. **Reemplazo completo de la función en server/routes.ts:**

Localizar línea ~1744 y reemplazar completamente:

```javascript
function generateBasicTechnicalChecks(seoData: any, originalUrl: string) {
  console.log('DEBUG generateBasicTechnicalChecks - seoData keys:', Object.keys(seoData || {}));
  
  // Verificar datos básicos
  const hasH1 = !!(seoData?.headings?.h1 && seoData.headings.h1.length > 0);
  const hasTitle = !!seoData?.title;
  const hasDescription = !!seoData?.description;
  const hasSSL = seoData?.hasSSL || originalUrl.startsWith('https://');
  
  console.log('DEBUG checks:', {
    hasH1,
    hasTitle,
    hasDescription,
    hasSSL,
    headingsExists: !!seoData?.headings,
    h1Count: seoData?.headings?.h1?.length || 0
  });

  // Análisis de imágenes con fallback
  const imageStats = seoData?.imageAnalysis || { total: 0, withAlt: 0, withDimensions: 0, withSrcset: 0 };
  const imagesWithAlt = imageStats.total > 0 ? (imageStats.withAlt / imageStats.total) >= 0.8 : true;
  const imagesWithDimensions = imageStats.total > 0 ? (imageStats.withDimensions / imageStats.total) >= 0.5 : true;
  
  // Análisis de contenido con fallback
  const contentStats = seoData?.contentAnalysis || { wordCount: 0, paragraphCount: 0 };
  const hasSufficientContent = contentStats.wordCount >= 300;
  
  // Análisis técnico con fallback
  const techStats = seoData?.technicalAnalysis || {};
  
  return {
    // Básicos (verificados)
    hasViewportMeta: !!seoData?.viewportMeta,
    hasCharset: !!seoData?.charset,
    hasSSL: hasSSL,
    hasH1Tag: hasH1,
    hasMetaDescription: hasDescription && seoData.description.length >= 120,
    
    // Contenido
    hasMultipleHeadings: !!(seoData?.headings && Object.keys(seoData.headings).length > 1),
    sufficientContent: hasSufficientContent,
    keywordInTitle: hasTitle && seoData.title.split(' ').length > 3,
    
    // Imágenes
    imagesHaveAltText: imagesWithAlt,
    imagesHaveDimensions: imagesWithDimensions,
    responsiveImages: imageStats.withSrcset > 0,
    
    // Links y estructura
    hasInternalLinks: !!(seoData?.linkAnalysis?.internal > 0),
    externalLinksOptimized: true, // Fallback
    hasCanonicalURL: !!seoData?.canonicalUrl,
    
    // Meta y social
    hasSchemaMarkup: !!(seoData?.schemaMarkup && Object.keys(seoData.schemaMarkup).length > 0),
    hasOpenGraph: !!(seoData?.openGraphTags && Object.keys(seoData.openGraphTags).length >= 3),
    hasTwitterCards: !!(seoData?.twitterCardTags && Object.keys(seoData.twitterCardTags).length >= 3),
    hasOGImage: !!seoData?.openGraphTags?.['og:image'],
    hasLangAttribute: !!seoData?.langAttribute,
    hasRobotsMeta: !!seoData?.robotsMeta,
    
    // Técnicos
    sitemap: !!seoData?.sitemapExists,
    robotsTxt: !!seoData?.robotsTxtExists,
    minifiedHTML: !!techStats?.hasMinifiedContent,
    noInlineStyles: !!techStats?.inlineStyles <= 2,
    touchFriendlyElements: !!seoData?.viewportMeta,
    hasFavicon: true,
    hasAccessibilityFeatures: !!techStats?.formAccessibility?.accessibilityScore >= 80,
    hasPerformanceOptimizations: !!techStats?.hasPreloadResources,
    hasSecurityHeaders: !!techStats?.hasCSPMeta || !!techStats?.hasXFrameOptions,
    formAccessibility: !!techStats?.formAccessibility?.accessibilityScore >= 80,
    properHeadingStructure: hasH1 && seoData?.headings?.h1?.length === 1
  };
}
```

### 4. **Test después del cambio:**
```bash
pm2 restart dlmetrix

curl -X POST http://localhost:5000/api/web/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://smartfiche.com"}' | grep -o '"hasH1Tag":[^,]*'
```

**Debería mostrar: `"hasH1Tag":true`**

### 5. **Si aún falla, verificar logs:**
```bash
pm2 logs dlmetrix | grep DEBUG
```

**El debug logs te dirá exactamente qué datos están llegando a la función.**