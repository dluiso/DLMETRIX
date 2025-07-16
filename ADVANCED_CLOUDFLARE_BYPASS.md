# Sistema Avanzado de Bypass Cloudflare - DLMETRIX

## **Funcionamiento del Sistema:**

### 1. **Detección Inteligente de Cloudflare**
```javascript
// Detecta múltiples indicadores de Cloudflare
if (html.includes('Just a moment') || 
    html.includes('checking your browser') || 
    html.includes('cloudflare') ||
    html.includes('cf-browser-verification') ||
    response.status === 403 ||
    response.status === 503) {
  // Cambiar automáticamente a Puppeteer
}
```

### 2. **Flujo de Análisis en Cascada**
```
1. ️axios → Intento rápido con headers realistas
2. Si detecta Cloudflare → fetchSeoDataWithPuppeteer()
3. Si falla axios (403/503) → fetchSeoDataWithPuppeteer()
4. Si todo falla → getFallbackSeoData()
```

### 3. **Puppeteer Anti-Detección Avanzado**
```javascript
// Argumentos anti-detección
'--disable-blink-features=AutomationControlled',
'--disable-automation',
'--exclude-switches=enable-automation',
'--disable-browser-side-navigation',
'--disable-client-side-phishing-detection'

// JavaScript en página
Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
delete window.navigator.__proto__.webdriver;
Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
```

### 4. **Sistema de Espera Inteligente**
```javascript
// Ciclo de verificación con máximo 3 intentos
while (attempts < maxAttempts) {
  await page.waitForTimeout(3000); // Espera inicial
  
  const pageContent = await page.evaluate(() => {
    return {
      isCloudflare: document.title.includes('Just a moment') || 
                   document.body?.textContent?.includes('checking your browser')
    };
  });
  
  if (pageContent.isCloudflare) {
    console.log('Cloudflare challenge detected, waiting...');
    await page.waitForTimeout(15000); // Espera extendida
    
    // Espera hasta que el contenido real cargue
    await page.waitForFunction(() => {
      return !document.title.includes('Just a moment') && 
             document.body &&
             document.body.children.length > 2 &&
             document.body.textContent.length > 500;
    }, { timeout: 30000 });
  }
}
```

## **Timeouts Optimizados:**
- **axios inicial**: 15 segundos
- **Puppeteer navegación**: 60 segundos
- **Espera por challenge**: 15 segundos × 3 intentos
- **Verificación de contenido**: 30 segundos

## **Verificación de Contenido Real:**
```javascript
// No se considera válido hasta que:
- !document.title.includes('Just a moment')
- !document.body.textContent.includes('checking your browser')  
- document.body existe
- document.body.children.length > 2
- document.body.textContent.length > 500
```

## **Logs de Debug:**
```
DEBUG fetchBasicSeoData - Cloudflare detected, switching to Puppeteer bypass
DEBUG fetchSeoDataWithPuppeteer - Launching browser for Cloudflare bypass
DEBUG fetchSeoDataWithPuppeteer - Cloudflare challenge detected (attempt 1), waiting...
DEBUG fetchSeoDataWithPuppeteer - Cloudflare challenge completed, content loaded
DEBUG fetchSeoDataWithPuppeteer - Content extracted, length: 45632
```

## **Para Probar:**
```bash
# Actualizar servidor
git pull origin main
pm2 restart dlmetrix

# Test con sitio Cloudflare
curl -X POST http://localhost:5000/api/web/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.adondevivir.com"}' | grep -o '"title":[^,]*'
```

**Resultado Esperado:** Extracción exitosa del título real del sitio en lugar de null o página de Cloudflare.