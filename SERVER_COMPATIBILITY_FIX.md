# Fix de Compatibilidad: Servidor de Producción

## **Problema Identificado:**
- DOM extraction funciona correctamente en Replit
- Technical SEO Analysis retorna `"hasH1Tag":false` en tu servidor
- Necesitamos verificar si axios/cheerio funciona en tu servidor Node.js v22.17.1

## **Test Inmediato en Tu Servidor:**

### 1. **Copiar archivo de test:**
```bash
# En tu servidor DLMETRIX, ejecutar:
node test-dom-production.cjs
```

### 2. **Si el test falla, verificar dependencias:**
```bash
# Verificar que axios y cheerio estén instalados:
npm list axios cheerio

# Si faltan, instalar:
npm install axios cheerio
```

### 3. **Si el test funciona, el problema es en server/routes.ts:**

**Agregar más debug logging a la función fetchBasicSeoData:**

Localizar línea ~420 en server/routes.ts y agregar debug:

```javascript
async function fetchBasicSeoData(url: string) {
  try {
    console.log('DEBUG fetchBasicSeoData - Starting for URL:', url);
    
    const response = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DLMETRIX/1.0)'
      }
    });
    
    console.log('DEBUG fetchBasicSeoData - Response status:', response.status);
    console.log('DEBUG fetchBasicSeoData - Content length:', response.data.length);
    
    const $ = cheerio.load(response.data);
    
    // Extract headings with debug
    const headings = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
    $('h1, h2, h3, h4, h5, h6').each((_, elem) => {
      const tag = elem.name.toLowerCase();
      const text = $(elem).text().trim();
      if (text && headings[tag]) {
        headings[tag].push(text);
      }
    });
    
    console.log('DEBUG fetchBasicSeoData - Extracted headings:', headings);
    console.log('DEBUG fetchBasicSeoData - H1 count:', headings.h1.length);
    
    // ... resto de la función
    
    const result = {
      // ... otros campos
      headings,
      // ... resto de campos
    };
    
    console.log('DEBUG fetchBasicSeoData - Final result keys:', Object.keys(result));
    return result;
    
  } catch (error) {
    console.error('DEBUG fetchBasicSeoData - Error:', error.message);
    throw error;
  }
}
```

### 4. **Test después de agregar debug:**
```bash
pm2 restart dlmetrix

curl -X POST http://localhost:5000/api/web/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://smartfiche.com"}' > /dev/null 2>&1

pm2 logs dlmetrix --lines 30 | grep DEBUG
```

## **Resultados Esperados:**

### ✅ **Si test-dom-production.cjs funciona:**
- axios/cheerio están funcionando correctamente
- El problema está en la implementación de server/routes.ts
- Necesitamos el debug logging para identificar el punto de falla

### ❌ **Si test-dom-production.cjs falla:**
- Problema de dependencias en tu servidor
- Posible problema de red/firewall
- Problema de compatibilidad Node.js v22.17.1

**Ejecuta primero el test y comparte el resultado para identificar exactamente dónde está el problema.**