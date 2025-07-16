# DLMETRIX - Configuración Final de Chromium para ARM64

## Solución Definitiva

He modificado el código para detectar automáticamente Chromium en tu servidor ARM64. Ejecuta estos comandos:

### 1. Instalar Chromium y dependencias

```bash
# Instalar Chromium
sudo apt update
sudo apt install -y chromium-browser

# Instalar todas las dependencias necesarias
sudo apt install -y \
  libnss3 \
  libatk-bridge2.0-0 \
  libdrm2 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libxss1 \
  libasound2 \
  libxtst6 \
  libatspi2.0-0 \
  libgtk-3-0 \
  fonts-liberation
```

### 2. Verificar instalación

```bash
# Verificar que Chromium está instalado
chromium-browser --version
which chromium-browser
ls -la /usr/bin/chromium-browser
```

### 3. Configurar variables de entorno

```bash
# Configurar variable permanente
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
echo 'export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser' >> ~/.bashrc
source ~/.bashrc

# Verificar que está configurada
echo $PUPPETEER_EXECUTABLE_PATH
```

### 4. Reconstruir y reiniciar aplicación

```bash
cd ~/DLMETRIX
pm2 stop dlmetrix

# Limpiar build anterior
rm -rf dist

# Construir con cambios
npm run build

# Iniciar con variable de entorno
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser NODE_ENV=production npm start
```

### 5. Probar funcionamiento

```bash
# Probar Puppeteer directamente
cd ~/DLMETRIX
node -e "
const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✅ Chromium funciona correctamente');
    
    const page = await browser.newPage();
    await page.goto('https://example.com');
    const screenshot = await page.screenshot({ encoding: 'base64' });
    console.log('✅ Screenshot capturado:', screenshot.length, 'caracteres');
    
    await browser.close();
  } catch(e) {
    console.log('❌ Error:', e.message);
  }
})();
"
```

### 6. Verificar análisis completo

Una vez reiniciada la aplicación, analiza una URL y deberías ver:

- ✅ **Core Web Vitals con valores reales**:
  - LCP: 1234ms (ejemplo)
  - FID: 67ms (ejemplo)
  - CLS: 0.12 (ejemplo)

- ✅ **Screenshots**:
  - Mobile screenshot: data:image/png;base64,iVBORw0KGgoAAAANS...
  - Desktop screenshot: data:image/png;base64,iVBORw0KGgoAAAANS...

## Solución de Problemas

### Si Chromium no se encuentra:
```bash
sudo apt install -y chromium-browser
sudo ln -sf /usr/bin/chromium-browser /usr/bin/chromium
```

### Si hay errores de permisos:
```bash
sudo chmod +x /usr/bin/chromium-browser
```

### Si faltan fuentes:
```bash
sudo apt install -y fonts-liberation fonts-dejavu-core fontconfig
```

### Para ver logs detallados:
```bash
pm2 logs dlmetrix --lines 100
```

## Verificación Final

Después de seguir estos pasos, cuando analices una URL:

1. **NO debería aparecer**: "Lighthouse analysis failed, falling back to SEO-only analysis"
2. **SÍ debería aparecer**: Valores numéricos en Core Web Vitals
3. **SÍ debería aparecer**: Screenshots en base64

Si sigues viendo "Could not find Chrome", ejecuta:
```bash
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser pm2 restart dlmetrix
```