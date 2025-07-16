# DLMETRIX - Solución para Core Web Vitals y Screenshots

## Problema Identificado

Las secciones de Core Web Vitals y Screenshots no funcionan porque:
1. Lighthouse requiere Chrome/Chromium en el servidor
2. Lighthouse es un módulo ESM que requiere configuración especial
3. Puppeteer necesita dependencias del sistema

## Solución para tu Servidor

### 1. Instalar Chrome/Chromium en tu servidor Ubuntu/Debian:

```bash
# Actualizar sistema
sudo apt update

# Instalar Chrome
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
sudo apt update
sudo apt install -y google-chrome-stable

# O instalar Chromium (alternativa más ligera)
sudo apt install -y chromium-browser

# Instalar dependencias necesarias para Puppeteer
sudo apt install -y \
  libnss3 \
  libatk-bridge2.0-0 \
  libdrm2 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libxss1 \
  libasound2
```

### 2. Verificar instalación:

```bash
# Verificar que Chrome está instalado
google-chrome --version
# O para Chromium:
chromium-browser --version
```

### 3. Configurar variables de entorno:

```bash
# Añadir a tu archivo .bashrc o .env
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=$(which google-chrome-stable)
# O para Chromium:
# export PUPPETEER_EXECUTABLE_PATH=$(which chromium-browser)
```

### 4. Reiniciar la aplicación:

```bash
cd ~/DLMETRIX
pm2 stop dlmetrix
npm run build
NODE_ENV=production npm start
```

## Verificación del Funcionamiento

Después de instalar Chrome, las siguientes funciones deberían funcionar:

✅ **Core Web Vitals**:
- LCP (Largest Contentful Paint)
- FID (First Input Delay) 
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

✅ **Screenshots**:
- Vista móvil (375×667)
- Vista desktop (1350×940)
- Captura automática durante análisis

✅ **Performance Scores**:
- Performance, Accessibility, Best Practices, SEO
- Métricas reales de Lighthouse

## Si no puedes instalar Chrome

Si no puedes instalar Chrome en tu servidor, la aplicación seguirá funcionando con:
- Análisis SEO básico
- Meta tags analysis
- Technical SEO checks
- Pero SIN Core Web Vitals ni Screenshots

## Comandos de Debugging

Para verificar si está funcionando:

```bash
# Ver logs de la aplicación
pm2 logs dlmetrix

# Probar manualmente Puppeteer
node -e "
const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch({headless: true});
    console.log('✅ Puppeteer funciona');
    await browser.close();
  } catch(e) {
    console.log('❌ Error:', e.message);
  }
})();
"
```

## Recursos del Sistema

Chrome/Chromium requiere:
- **RAM**: Mínimo 1GB libre
- **CPU**: Moderado durante análisis
- **Espacio**: ~200MB para instalación

Si tu servidor tiene recursos limitados, considera usar solo el análisis SEO básico que ya funciona perfectamente.