# Fix Definitivo para Vulnerabilidad esbuild

## **Problema:**
- esbuild <=0.24.2 vulnerabilidad de seguridad
- npm audit fix --force rompe compatibilidad (Vite v7)
- 5 vulnerabilidades moderadas persistentes

## **Solución Segura sin Breaking Changes:**

### 1. **Solución Simple (Sin Overrides)**
```bash
# Remover override conflictivo:
npm pkg delete overrides

# Actualizar solo esbuild a versión segura:
npm install esbuild@latest --save-dev

# Reinstalar sin conflictos:
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 2. **Alternativa: Actualización Manual Controlada**
```bash
# Solo actualizar esbuild sin afectar Vite:
npm install esbuild@^0.24.3 --save-dev

# Verificar que Vite sigue en v5:
npm list vite
```

### 3. **Verificación Post-Fix**
```bash
# Comprobar vulnerabilidades resueltas:
npm audit

# Test de funcionalidad:
npm run dev
curl "http://localhost:5000/api/debug/technical/https%3A%2F%2Fsmartfiche.com"
```

## **Configuración de Memoria Optimizada:**

```bash
# Para Technical SEO Analysis pesado:
pm2 stop all
pm2 start npm --name "dlmetrix" -- start \
  --max-memory-restart 2048M \
  --node-args="--max-old-space-size=2048"

# Verificar configuración:
pm2 show dlmetrix
```

## **Si Persisten Problemas de Memoria:**

### Añadir al ecosystem.config.js:
```javascript
module.exports = {
  apps: [{
    name: 'dlmetrix',
    script: 'npm',
    args: 'start',
    max_memory_restart: '2048M',
    node_args: '--max-old-space-size=2048',
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=2048'
    }
  }]
}
```

## **Orden de Aplicación:**

1. ✅ **Fix esbuild security (arriba)**
2. ✅ **Configurar memoria PM2**  
3. ✅ **Actualizar código servidor (server/routes.ts)**
4. ✅ **Probar debug endpoint**
5. ✅ **Verificar Technical SEO funciona**

**Valor memoria específico: `2048M` (2GB) mínimo recomendado**