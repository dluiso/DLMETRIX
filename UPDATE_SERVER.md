# DLMETRIX - Comandos para Actualizar el Servidor

## Pasos Exactos para Aplicar las Correcciones

### 1. Detener la aplicación actual
```bash
# Si está corriendo con pm2
pm2 stop dlmetrix
# O si está corriendo directamente
pkill -f "node dist/index.js"
```

### 2. Ir al directorio de la aplicación
```bash
cd ~/DLMETRIX
```

### 3. Hacer backup del directorio actual (opcional pero recomendado)
```bash
cp -r . ../DLMETRIX_backup
```

### 4. Actualizar el código desde tu repositorio
```bash
# Si usas git
git pull origin main

# O si copias los archivos manualmente, asegúrate de copiar:
# - client/index.html (corregido)
# - client/src/main.tsx (corregido)
# - client/src/utils/simple-obfuscation.ts
# - client/src/utils/hosting-obfuscation.ts
# - DEPLOYMENT.md (nuevo)
# - README.md (nuevo)
```

### 5. Limpiar instalación anterior
```bash
rm -rf node_modules
rm -rf dist
rm package-lock.json
```

### 6. Reinstalar dependencias
```bash
npm install
```

### 7. Construir la aplicación con las correcciones
```bash
npm run build
```

### 8. Iniciar en modo producción
```bash
NODE_ENV=production npm start
```

## Verificación

Después de ejecutar estos comandos:

1. Ve a tu dominio en el navegador
2. Deberías ver la interfaz normal de DLMETRIX (no código)
3. La aplicación debe funcionar completamente
4. Los sistemas de obfuscación estarán activos pero no interferirán con React

## Si algo sale mal

Si hay problemas, puedes ejecutar en modo debugging:
```bash
NODE_ENV=development npm start
```

Esto deshabilitará la obfuscación para identificar cualquier problema.

## Comandos de Mantenimiento

```bash
# Ver logs en tiempo real
tail -f logs/app.log

# Reiniciar la aplicación
pm2 restart dlmetrix

# Ver estado
pm2 status

# Parar completamente
pm2 stop dlmetrix
```

## Variables de Entorno Recomendadas

Crea o actualiza tu archivo `.env`:
```
NODE_ENV=production
PORT=3000
```

## Configuración PM2 (Recomendada)

Si usas PM2, crea `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'dlmetrix',
    script: 'dist/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    exec_mode: 'fork'
  }]
}
```

Luego ejecuta:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```