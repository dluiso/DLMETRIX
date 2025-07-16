# DLMETRIX - Comandos de Despliegue Exitoso

## Problema: pm2 no está instalado

El comando `pm2` no se encuentra en tu servidor. Aquí están los comandos correctos para instalar pm2 y actualizar la aplicación:

## Solución Completa

Ejecuta estos comandos en orden en tu servidor:

```bash
# 1. Ir al directorio del proyecto
cd ~/DLMETRIX

# 2. Actualizar código desde Git
git stash
git pull origin main

# 3. Instalar pm2 globalmente
npm install -g pm2

# 4. Limpiar y reconstruir
rm -rf dist
npm run build

# 5. Detener cualquier proceso Node.js existente
pkill -f "npm start" || true
pkill -f "node" || true

# 6. Iniciar con pm2 y configuración ARM64
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser NODE_ENV=production pm2 start npm --name "dlmetrix" -- start

# 7. Configurar pm2 para autostart
pm2 startup
pm2 save
```

## Alternativa sin pm2

Si prefieres no usar pm2, puedes ejecutar directamente:

```bash
cd ~/DLMETRIX
git stash
git pull origin main
rm -rf dist
npm run build

# Detener procesos existentes
pkill -f "npm start" || true

# Ejecutar en background
nohup bash -c 'PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser NODE_ENV=production npm start' > dlmetrix.log 2>&1 &
```

## Verificación

Después de cualquiera de los dos métodos:

1. **Verificar que la aplicación está corriendo**:
```bash
# Con pm2:
pm2 status

# Sin pm2:
ps aux | grep npm
```

2. **Ver logs**:
```bash
# Con pm2:
pm2 logs dlmetrix

# Sin pm2:
tail -f dlmetrix.log
```

3. **Probar la aplicación**:
   - Accede a tu dominio
   - Analiza una URL
   - Verifica que obtienes Core Web Vitals y Screenshots

## Logs Esperados

Deberías ver:
```
Starting manual performance analysis for mobile (ARM64 compatible)
Starting manual performance analysis for desktop (ARM64 compatible)
```

Y NO deberías ver:
```
Lighthouse analysis failed, falling back to SEO-only analysis
```

## Comandos de Gestión

### Con pm2:
```bash
pm2 start dlmetrix    # Iniciar
pm2 stop dlmetrix     # Detener
pm2 restart dlmetrix  # Reiniciar
pm2 logs dlmetrix     # Ver logs
pm2 delete dlmetrix   # Eliminar proceso
```

### Sin pm2:
```bash
pkill -f "npm start"  # Detener
nohup bash -c 'PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser NODE_ENV=production npm start' > dlmetrix.log 2>&1 &  # Iniciar
tail -f dlmetrix.log  # Ver logs
```

## Resultado Final

Después de estos comandos:
- ✅ Core Web Vitals con valores reales
- ✅ Screenshots funcionando
- ✅ Sin errores de Lighthouse 
- ✅ Aplicación corriendo en producción
- ✅ Performance analysis optimizado para ARM64