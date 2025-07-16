# Solución Rápida - Solo Memoria

## **Enfoque Simple (Evitar Conflictos npm):**

### 1. **Ignorar Vulnerabilidades Temporalmente**
```bash
# No hacer npm audit fix --force (causa problemas)
# Enfocarse solo en memoria para Technical SEO
```

### 2. **Configurar Memoria PM2 (Valor Específico)**
```bash
# Parar procesos:
pm2 stop all

# Reiniciar con 2GB memoria:
pm2 start npm --name "dlmetrix" -- start --max-memory-restart 2048M

# Verificar aplicado:
pm2 info dlmetrix | grep memory
```

### 3. **Test Inmediato**
```bash
# Probar debug endpoint:
curl "http://localhost:5000/api/debug/technical/https%3A%2F%2Fsmartfiche.com"

# Debería retornar: {"success": true, ...}
```

### 4. **Si Funciona, Test Completo**
```bash
curl -X POST http://localhost:5000/api/web/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://smartfiche.com"}'
```

## **Archivos Que Necesitas Actualizar:**
- ✅ `server/routes.ts` (líneas 14-58: debug endpoint)
- ✅ No tocar package.json por ahora

**El valor exacto de memoria es: `2048M`**

**Orden:** Memoria primero → Test debug → Si funciona, vulnerabilidades después