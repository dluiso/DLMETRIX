# DLMETRIX - Instalación Chrome para ARM64

## Tu servidor es ARM64 - Solución Específica

### Método 1: Chromium para ARM64 (Recomendado)

```bash
# Limpiar intentos anteriores
sudo rm -f /tmp/google-chrome-stable_current_amd64.deb

# Instalar Chromium nativo para ARM64
sudo apt update
sudo apt install -y chromium-browser

# Verificar instalación
chromium-browser --version
which chromium-browser
```

### Método 2: Chrome ARM64 (Si está disponible)

```bash
# Intentar Chrome para ARM64
cd /tmp
wget https://dl.google.com/linux/direct/google-chrome-stable_current_arm64.deb

# Si el archivo existe, instalarlo
sudo dpkg -i google-chrome-stable_current_arm64.deb
sudo apt-get install -f
```

### Instalar dependencias ARM64

```bash
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
  libpangocairo-1.0-0 \
  libatk1.0-0 \
  libcairo-gobject2 \
  libgtk-3-0 \
  libgdk-pixbuf2.0-0 \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libnspr4 \
  libu2f-udev \
  libvulkan1 \
  xdg-utils
```

### Configurar para Chromium

```bash
# Configurar variable de entorno para Chromium
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
echo 'export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser' >> ~/.bashrc

# Verificar ubicación
ls -la /usr/bin/chromium-browser
```

### Probar instalación

```bash
cd ~/DLMETRIX
node -e "
const puppeteer = require('puppeteer');
(async () => {
  try {
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
    console.log('✅ Chromium ARM64 funciona correctamente');
    const page = await browser.newPage();
    await page.goto('https://example.com');
    console.log('✅ Navegación exitosa');
    await browser.close();
  } catch(e) {
    console.log('❌ Error:', e.message);
  }
})();
"
```

### Reiniciar aplicación

```bash
pm2 stop dlmetrix
NODE_ENV=production npm start
```

## Verificación de Funcionamiento

Después de configurar Chromium, probar análisis:

```bash
curl -X POST http://localhost:3000/api/web/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' \
  | grep -E '"lcp"|"fcp"|"cls"'
```

Si ves valores numéricos en lugar de `null`, Core Web Vitals funciona.

## Alternativa: Análisis sin navegador

Si no puedes instalar navegador, la aplicación funciona perfectamente con:
- ✅ Análisis SEO completo
- ✅ Meta tags analysis  
- ✅ Technical checks
- ✅ AI content analysis
- ✅ Keyword analysis
- ❌ Core Web Vitals (mostrará "N/A")
- ❌ Screenshots (mostrará "Not Available")

El análisis seguirá siendo muy útil y completo.