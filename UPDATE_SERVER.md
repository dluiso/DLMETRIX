# Comandos para Actualizar Tu Servidor

## **Pasos para Aplicar el Fix de Debug:**

### 1. **Sincronizar el archivo actualizado:**
```bash
# En tu servidor DLMETRIX:
git add server/routes.ts
git commit -m "Add debug logging to fetchBasicSeoData"
git push origin main

# O copiar manualmente el archivo server/routes.ts actualizado
```

### 2. **Reiniciar el servidor:**
```bash
pm2 restart dlmetrix
```

### 3. **Test con debug completo:**
```bash
# Ejecutar análisis:
curl -X POST http://localhost:5000/api/web/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://smartfiche.com"}' > /dev/null 2>&1

# Ver todos los logs de debug:
pm2 logs dlmetrix --lines 50 | grep DEBUG
```

### 4. **Verificar resultado final:**
```bash
# Test del resultado específico:
curl -X POST http://localhost:5000/api/web/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://smartfiche.com"}' | grep -o '"hasH1Tag":[^,]*'
```

## **Lo que los logs DEBUG deben mostrar:**

```
DEBUG fetchBasicSeoData - Starting analysis for URL: https://smartfiche.com
DEBUG fetchBasicSeoData - Response status: 200
DEBUG fetchBasicSeoData - Content length: 214990
DEBUG fetchBasicSeoData - Basic meta extracted: { title: 'SmartFiche - Laserfiche & IT Services Solutions', description: true, viewportMeta: true }
DEBUG fetchBasicSeoData - Headings extracted: { h1Count: 1, h2Count: 7, h3Count: 10, h1Text: 'Smartfiche' }
DEBUG fetchBasicSeoData - Analysis complete, returning result with keys: [title, description, keywords, ...]
DEBUG fetchBasicSeoData - Headings in final result: { h1Count: 1, h1First: 'Smartfiche', structureCount: 18 }
DEBUG generateBasicTechnicalChecks - seoData keys: [title, description, keywords, headings, ...]
DEBUG generateBasicTechnicalChecks - Headings data: { h1: ['Smartfiche'], h2: [...], h3: [...] }
DEBUG heading analysis: { hasH1: true, hasMultipleHeadingTypes: true, h1Count: 1 }
```

## **Resultado Esperado:**
- `"hasH1Tag":true` en lugar de `"hasH1Tag":false`
- Technical SEO Analysis mostrará datos reales del sitio web

**Los logs de debug te dirán exactamente dónde está fallando el análisis.**