# Sistema Anti-Cloudflare Mejorado - DLMETRIX

## **Problema Identificado:**
Sitios protegidos por Cloudflare (como www.adondevivir.com) bloquean requests HTTP normales con error 403, impidiendo el análisis completo.

## **Solución Implementada:**

### 1. **Sistema de Fallback Inteligente**
```
1. fetchBasicSeoData intenta con axios (rápido)
2. Si falla con 403 → fetchSeoDataWithPuppeteer (anti-bot)
3. Si ambos fallan → datos de fallback
```

### 2. **Puppeteer Anti-Detección**
- **Headers realistas**: Accept, Accept-Language, Accept-Encoding
- **User-Agent actualizado**: Chrome 120.0.0.0
- **Propiedades ocultas**: `navigator.webdriver = undefined`
- **Args especiales**: `--disable-blink-features=AutomationControlled`

### 3. **Manejo de Cloudflare Challenge**
- **Detección automática**: "Just a moment", "checking your browser"
- **Espera extendida**: 15 segundos + wait hasta 25 segundos
- **Verificación de contenido**: Espera hasta que el challenge desaparezca

### 4. **Extracción Completa en Browser Context**
```javascript
// Extrae datos directamente del DOM renderizado:
- title, meta tags, headings
- Conteo de imágenes y links
- Open Graph y Twitter Cards
- Schema markup detection
- robots.txt y sitemap.xml checks
```

## **Comportamiento Mejorado:**

### ✅ **Para sitios normales (como plusmit.com):**
- Análisis rápido con axios
- Todos los datos extraídos correctamente
- Screenshots y Core Web Vitals funcionando

### ✅ **Para sitios con Cloudflare (como adondevivir.com):**
- Fallback automático a Puppeteer
- Bypass del challenge de Cloudflare
- Extracción de datos reales del DOM renderizado
- Screenshots cuando el browser puede acceder

## **Logs Esperados:**
```bash
# Sitio normal:
DEBUG fetchBasicSeoData - Response status: 200
DEBUG fetchBasicSeoData - Content length: 148328

# Sitio con Cloudflare:
DEBUG fetchBasicSeoData - Site blocked access: 403
DEBUG fetchBasicSeoData - Attempting Puppeteer fallback for blocked site
DEBUG fetchSeoDataWithPuppeteer - Navigating to: https://www.adondevivir.com/
DEBUG fetchSeoDataWithPuppeteer - Cloudflare challenge detected, waiting...
DEBUG fetchSeoDataWithPuppeteer - Extracted data: { title: "...", h1Count: 1, imageCount: 15 }
```

## **Para Aplicar:**
```bash
git pull origin main
pm2 restart dlmetrix
```

**Ahora DLMETRIX puede analizar tanto sitios normales como sitios protegidos por Cloudflare, proporcionando datos reales en ambos casos.**