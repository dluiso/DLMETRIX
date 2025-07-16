# Solución para Conflictos de Dependencias en Producción

## **Problema Identificado:**
- Vite se actualizó a v7.0.4 (breaking change)
- @tailwindcss/vite incompatible con Vite v7
- @types/node conflictos de versión
- esbuild vulnerabilidad persiste

## **Solución Inmediata:**

### 1. **Aumentar Memoria en PM2**
```bash
# Parar procesos actuales
pm2 stop all

# Reiniciar con más memoria (recomendado 2GB mínimo)
pm2 start ecosystem.config.js --max-memory-restart 2G

# O si usas comando directo:
pm2 start npm --name "dlmetrix" -- start --max-memory-restart 2048M

# Verificar configuración:
pm2 info dlmetrix
```

### 2. **Downgrade Controlado** (Recomendado)
```bash
# Volver a versiones estables compatibles:
npm install vite@^5.4.19 --save-dev
npm install @types/node@^20.16.11 --save-dev
npm install drizzle-kit@^0.30.0 --save-dev

# Verificar compatibilidad:
npm install
```

### 2. **Fix Específico para Technical SEO**
```bash
# Verificar que estas dependencias críticas estén bien:
npm list axios cheerio
npm install axios@^1.10.0 cheerio@^1.1.0
```

### 3. **Verificación Post-Fix**
```bash
# Test del endpoint debug:
curl "http://localhost:5000/api/debug/technical/https%3A%2F%2Fsmartfiche.com"

# Si funciona localmente, test completo:
curl -X POST http://localhost:5000/api/web/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://smartfiche.com"}'
```

## **Si Persisten Problemas:**

### Alternativa: Lock a Versiones Estables
```json
// En package.json, fijar versiones específicas:
{
  "devDependencies": {
    "vite": "5.4.19",
    "@types/node": "20.16.11",
    "drizzle-kit": "0.30.0",
    "@tailwindcss/vite": "4.1.3"
  }
}
```

### Comando de Instalación Limpia:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## **Verificación de Technical SEO:**

**Después de los fixes, probar:**
1. Debug endpoint debe retornar `success: true`
2. Analysis completo debe incluir `technicalChecks` con datos reales
3. Twitter Cards/Open Graph deben evaluar correctamente

**Si aún falla, reportar:**
- Output exacto del debug endpoint
- Errores específicos en logs
- Node version: `node --version`