# Guía de Actualización en Producción - Technical SEO Fix

## **Pasos Inmediatos para Tu Servidor**

### 1. **Corregir Vulnerabilidades de Seguridad**
```bash
# Corregir vulnerabilidades automáticamente
npm audit fix

# Si hay breaking changes críticos:
npm audit fix --force
```

### 2. **Verificar Technical SEO Analysis**

**A. Endpoint de Debug (temporal):**
```bash
# Probar con tu dominio específico:
curl "http://tu-servidor.com/api/debug/technical/https%3A%2F%2Fsmartfiche.com"
```

**B. Verificar respuesta esperada:**
```json
{
  "success": true,
  "sampleChecks": {
    "hasViewportMeta": true,
    "hasH1Tag": true,
    "hasSSL": true,
    "hasOpenGraph": false,
    "hasTwitterCards": false
  }
}
```

### 3. **Si el Debug Falla**

**A. Verificar logs específicos:**
```bash
# Ver errores en tiempo real:
tail -f logs/error.log | grep -i "technical\|cheerio\|axios"

# Verificar memory issues:
free -h && df -h
```

**B. Posibles soluciones:**
```bash
# 1. Increase timeout for axios (si hay timeouts)
# 2. Restart with more memory:
pm2 restart all --max-memory-restart 2G

# 3. Verify dependencies:
npm list axios cheerio
```

### 4. **Archivos Críticos Actualizados**

**Backend:**
- ✅ `server/routes.ts` - línea ~10: nuevo endpoint debug
- ✅ `server/routes.ts` - líneas 1744-1837: generateBasicTechnicalChecks actualizado
- ✅ `server/routes.ts` - líneas 1010-1030: evaluación consistente Open Graph/Twitter

**Frontend:**
- ✅ `client/src/components/twitter-cards-analysis.tsx` - líneas 36-42: evaluación estricta
- ✅ `client/src/components/meta-tag-analysis.tsx` - líneas 52-69: evaluación consistente
- ✅ `client/src/components/open-graph-analysis.tsx` - líneas 36-44: evaluación actualizada

### 5. **Testing en Producción**

**A. Test completo:**
```bash
# Analyze a known site:
curl -X POST http://tu-servidor.com/api/web/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://smartfiche.com"}' | jq '.technicalChecks | keys'
```

**B. Verificar resultados esperados:**
- Technical SEO Analysis debe mostrar resultados reales (no todos en false)
- Twitter Cards debe mostrar "PARTIAL" si faltan tags (no "GOOD")
- Open Graph debe mostrar "PARTIAL" si faltan tags requeridos

### 6. **Cleanup Post-Testing**

Una vez confirmado que funciona:
```bash
# Remover endpoint de debug temporal si lo deseas:
# Comentar líneas 10-50 en server/routes.ts
```

## **Verificación de Éxito**

✅ **Technical SEO Analysis muestra datos reales**
✅ **Twitter Cards evalúa correctamente (PARTIAL vs GOOD)**  
✅ **Open Graph evalúa correctamente (requiere 5 tags para GOOD)**
✅ **No hay errores 500 en análisis**
✅ **Vulnerabilidades de npm corregidas**

## **Si Aún Hay Problemas**

Reporta exactamente:
1. Resultado del endpoint debug
2. Errores específicos en logs
3. Versiones: `node --version && npm --version`
4. Tipo de servidor (VPS, shared hosting, etc.)

Esto me permitirá crear una solución específica para tu entorno.