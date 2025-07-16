# DLMETRIX - Comandos para Actualizar Servidor con Cambios

## Archivos Modificados que Necesitas Actualizar

### 1. server/routes.ts (CRÍTICO - Contiene la detección automática de Chromium)

El archivo `server/routes.ts` fue modificado para detectar automáticamente Chromium en ARM64. Necesitas reemplazar este archivo en tu servidor.

### 2. Opciones para Actualizar tu Servidor

#### Opción A: Si usas Git (Recomendado)

```bash
cd ~/DLMETRIX
git pull origin main
npm run build
pm2 restart dlmetrix
```

#### Opción B: Actualizar manualmente server/routes.ts

Si no usas Git, necesitas reemplazar el archivo `server/routes.ts` en tu servidor con la versión actualizada.

### 3. Cambios Específicos Implementados

Los cambios principales están en las líneas 65-110 de `server/routes.ts`:

- **Detección automática de Chromium**: Busca en múltiples rutas ARM64
- **Mejor manejo de errores**: Mensajes más claros cuando falla
- **Argumentos optimizados**: Para servidores ARM64
- **Logging mejorado**: Muestra qué ejecutable está usando

### 4. Comandos Completos para Actualizar

```bash
# Ir al directorio
cd ~/DLMETRIX

# Si usas Git
git pull origin main

# Si NO usas Git, descarga server/routes.ts actualizado desde Replit
# y reemplázalo en tu servidor

# Instalar Chromium si no está instalado
sudo apt install -y chromium-browser libnss3 libatk-bridge2.0-0 libdrm2 libxcomposite1

# Configurar variable de entorno
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
echo 'export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser' >> ~/.bashrc

# Limpiar build anterior
rm -rf dist

# Construir con cambios actualizados
npm run build

# Reiniciar aplicación
pm2 stop dlmetrix
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser NODE_ENV=production npm start
```

### 5. Verificación de Éxito

Después de actualizar, cuando analices una URL deberías ver en los logs:

```
Using browser executable: /usr/bin/chromium-browser
```

Y NO deberías ver:
```
Lighthouse analysis failed, falling back to SEO-only analysis
```

### 6. Archivo server/routes.ts Actualizado

El cambio principal está en la función `performLighthouseAnalysis` (líneas 65-110) que ahora incluye:

```javascript
// Detect Chromium executable path for ARM64
const chromiumPaths = [
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
];

let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

if (!executablePath) {
  // Try to find Chromium automatically
  const fs = require('fs');
  for (const path of chromiumPaths) {
    try {
      if (fs.existsSync(path)) {
        executablePath = path;
        break;
      }
    } catch (e) {
      // Continue to next path
    }
  }
}
```

### 7. Sin estos cambios

Sin actualizar server/routes.ts, tu aplicación seguirá usando el código anterior que no sabe cómo encontrar Chromium en ARM64, por eso sigue fallando al modo SEO.