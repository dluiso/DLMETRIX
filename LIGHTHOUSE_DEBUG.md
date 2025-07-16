# DLMETRIX - Debug Lighthouse y Screenshots

## Comandos de Diagnóstico

Ejecuta estos comandos en tu servidor para verificar el estado:

### 1. Verificar si Chromium está instalado

```bash
# Verificar instalación
chromium-browser --version
which chromium-browser
ls -la /usr/bin/chromium-browser

# Verificar variable de entorno
echo $PUPPETEER_EXECUTABLE_PATH
```

### 2. Probar Puppeteer manualmente

```bash
cd ~/DLMETRIX
node -e "
const puppeteer = require('puppeteer');
(async () => {
  try {
    console.log('Intentando lanzar browser...');
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    console.log('✅ Browser lanzado correctamente');
    
    const page = await browser.newPage();
    console.log('✅ Página creada');
    
    await page.goto('https://example.com', { waitUntil: 'networkidle0' });
    console.log('✅ Navegación exitosa');
    
    const screenshot = await page.screenshot({ encoding: 'base64' });
    console.log('✅ Screenshot capturado, tamaño:', screenshot.length);
    
    await browser.close();
    console.log('✅ Todo funciona correctamente');
  } catch(e) {
    console.log('❌ Error:', e.message);
    console.log('Stack:', e.stack);
  }
})();
"
```

### 3. Verificar logs de la aplicación

```bash
# Ver logs en tiempo real
pm2 logs dlmetrix --lines 50

# O si no usas PM2
tail -f ~/DLMETRIX/logs/app.log
```

### 4. Probar análisis y ver errores detallados

```bash
curl -X POST http://localhost:3000/api/web/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' \
  -v
```

### 5. Verificar puerto correcto

```bash
# Verificar qué puerto usa la aplicación
ps aux | grep node
netstat -tlnp | grep node
```

### 6. Si Chromium no está instalado correctamente

```bash
# Reinstalar Chromium
sudo apt remove chromium-browser
sudo apt update
sudo apt install -y chromium-browser

# Verificar ubicación después de reinstalar
which chromium-browser
chromium-browser --version
```

### 7. Configurar variables de entorno correctamente

```bash
# Configurar y persistir la variable
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
echo 'export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser' >> ~/.bashrc
source ~/.bashrc

# Verificar que se guardó
echo $PUPPETEER_EXECUTABLE_PATH
```

### 8. Reiniciar aplicación con variables

```bash
cd ~/DLMETRIX
pm2 stop dlmetrix
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
NODE_ENV=production npm start
```

## Solución si persiste el problema

Si sigue sin funcionar, puede ser que necesites instalar dependencias adicionales:

```bash
sudo apt install -y \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxi6 \
  libxtst6 \
  libgconf-2-4 \
  libxrandr2 \
  libasound2 \
  libpangocairo-1.0-0 \
  libatk1.0-0 \
  libcairo-gobject2 \
  libgtk-3-0 \
  libgdk-pixbuf2.0-0
```