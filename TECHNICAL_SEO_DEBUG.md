# Technical SEO Analysis - Diagnóstico

## Problemas Comunes en Producción

### 1. **Timeout de Axios**
```bash
# Verificar en logs del servidor:
grep "timeout" /var/log/your-app.log
```

### 2. **Cheerio/DOM Analysis**
Verificar si las funciones de análisis DOM están funcionando:
- `fetchBasicSeoData()` - extrae datos del HTML
- `generateBasicTechnicalChecks()` - procesa los datos

### 3. **Dependencias Faltantes**
```bash
# Verificar que estén instaladas:
npm list axios cheerio
```

### 4. **Script de Verificación Rápida**

Agregar al final de `server/routes.ts` para debug:

```javascript
// DEBUG ENDPOINT - TEMPORAL
app.get('/debug/seo/:url', async (req, res) => {
  try {
    const url = decodeURIComponent(req.params.url);
    console.log('DEBUG: Analyzing URL:', url);
    
    const seoData = await fetchBasicSeoData(url);
    console.log('DEBUG: SEO Data extracted:', Object.keys(seoData));
    
    const technicalChecks = generateBasicTechnicalChecks(seoData, url);
    console.log('DEBUG: Technical checks:', technicalChecks);
    
    res.json({
      success: true,
      seoData,
      technicalChecks,
      extraction: {
        title: !!seoData.title,
        description: !!seoData.description,
        headings: Object.keys(seoData.headings || {}),
        images: seoData.imageAnalysis || 'missing',
        technical: seoData.technicalAnalysis || 'missing'
      }
    });
  } catch (error) {
    console.error('DEBUG ERROR:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});
```

### 5. **Verificaciones en Producción**

1. **Probar endpoint de debug:**
```bash
curl "http://tu-servidor.com/debug/seo/https%3A//smartfiche.com"
```

2. **Verificar logs específicos:**
```bash
# Buscar errores relacionados con Technical SEO:
grep -i "technical\|cheerio\|axios\|timeout" logs/*.log
```

3. **Verificar memoria y recursos:**
```bash
free -h
df -h
```

### 6. **Posibles Soluciones**

#### **Si falla `fetchBasicSeoData`:**
- Aumentar timeout de axios de 15s a 30s
- Verificar User-Agent y headers
- Comprobar conectividad a sitios externos

#### **Si falla `generateBasicTechnicalChecks`:**
- Verificar que `seoData` contiene las propiedades esperadas
- Revisar funciones de análisis de imágenes y contenido

#### **Si todo funciona pero no se ve en frontend:**
- Verificar que `technicalChecks` se incluye en la respuesta
- Comprobar el componente `TechnicalSeo` en frontend

### 7. **Archivos Críticos para Technical SEO**

**Backend:**
- `server/routes.ts` - líneas 1744-1837 (generateBasicTechnicalChecks)
- `server/routes.ts` - líneas 665-850 (fetchBasicSeoData)

**Frontend:**
- `client/src/components/technical-seo.tsx`

### 8. **Test Manual Rápido**

En el navegador, en la consola de tu aplicación:
```javascript
// Verificar si technicalChecks existe en los datos
console.log(window.lastAnalysisData?.technicalChecks);
```

## Pasos para Resolver

1. Agrega el endpoint de debug temporalmente
2. Prueba con una URL conocida
3. Revisa los logs para errores específicos
4. Reporta qué parte específica está fallando