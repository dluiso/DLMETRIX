# Sistema Anti-Detección Cloudflare - DLMETRIX

## **Problema:**
Sitios como www.adondevivir.com usan Cloudflare para detectar bots y mostrar páginas de verificación "Just a moment".

## **Solución Implementada:**

### 1. **Headers HTTP Realistas (axios)**
```javascript
headers: {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Cache-Control': 'max-age=0'
}
```

### 2. **Puppeteer Anti-Detección**
```javascript
// Argumentos del navegador anti-detección
'--disable-blink-features=AutomationControlled',
'--disable-automation',
'--exclude-switches=enable-automation',
'--disable-browser-side-navigation',
'--disable-client-side-phishing-detection'

// JavaScript anti-detección
Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
delete window.navigator.__proto__.webdriver;
```

### 3. **Detección y Manejo de Challenges**
```javascript
// Detecta páginas de Cloudflare
const isCloudflareChallenge = await page.evaluate(() => {
  return document.title.includes('Just a moment') || 
         document.body.textContent.includes('Cloudflare') ||
         document.body.textContent.includes('checking your browser');
});

// Espera a que termine el challenge
if (isCloudflareChallenge) {
  await page.waitForTimeout(12000);
  await page.waitForFunction(() => {
    return !document.title.includes('Just a moment') && 
           !document.body.textContent.includes('checking your browser');
  }, { timeout: 20000 });
}
```

### 4. **Timeouts Extendidos**
- axios: 20 segundos (era 15)
- Puppeteer navigation: 45 segundos (era 30)
- Challenge wait: 12 segundos + 20 segundos de verificación

## **Para Aplicar:**
```bash
git pull origin main
pm2 restart dlmetrix
```

## **Test con Sitio Cloudflare:**
```bash
curl -X POST http://localhost:5000/api/web/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.adondevivir.com"}' | grep -o '"title":[^,]*'
```

**Resultado Esperado:** Extracción exitosa de datos reales del sitio en lugar de errores 403.

## **Beneficios:**
- ✅ Bypass de Cloudflare en la mayoría de casos
- ✅ Headers HTTP indistinguibles de navegador real
- ✅ User-Agents actualizados (Chrome 120, iOS 17)
- ✅ Detección automática de challenges
- ✅ Timeouts optimizados para challenges
- ✅ Fallback elegante si el bypass falla

**Nota:** Algunos sitios con protección muy agresiva pueden seguir bloqueando, pero la mayoría funcionará correctamente.