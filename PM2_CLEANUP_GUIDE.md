# Limpiar Múltiples Procesos PM2

## **Problema Identificado:**
- 4 procesos dlmetrix ejecutándose simultáneamente
- Consumo excesivo de memoria (total: ~268MB)
- Posibles conflictos entre procesos

## **Solución Inmediata:**

### 1. **Detener Todos los Procesos**
```bash
pm2 stop all
```

### 2. **Eliminar Procesos Duplicados**
```bash
pm2 delete all
```

### 3. **Iniciar UN SOLO Proceso Optimizado**
```bash
pm2 start npm --name "dlmetrix" -- start --max-memory-restart 2048M
```

### 4. **Guardar Configuración**
```bash
pm2 save
pm2 startup
```

### 5. **Verificar que Solo Hay 1 Proceso**
```bash
pm2 list
```

**Resultado esperado:**
```
┌─────┬──────────┬─────────┬─────────┬─────────┬──────────┐
│ id  │ name     │ mode    │ ↺      │ status  │ memory   │
├─────┼──────────┼─────────┼─────────┼─────────┼──────────┤
│ 0   │ dlmetrix │ fork    │ 0       │ online  │ 51.0mb   │
└─────┴──────────┴─────────┴─────────┴─────────┴──────────┘
```

## **Configuración Avanzada (Opcional):**

### Crear ecosystem.config.js para evitar duplicados:
```javascript
module.exports = {
  apps: [{
    name: 'dlmetrix',
    script: 'npm',
    args: 'start',
    instances: 1,
    max_memory_restart: '2048M',
    node_args: '--max-old-space-size=2048',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

### Usar el archivo de configuración:
```bash
pm2 start ecosystem.config.js
```

## **Comandos de Monitoreo:**
```bash
# Ver estado en tiempo real:
pm2 monit

# Ver logs:
pm2 logs dlmetrix

# Verificar memoria:
pm2 info dlmetrix
```

**Con un solo proceso optimizado tendrás mejor rendimiento y menor consumo de recursos.**