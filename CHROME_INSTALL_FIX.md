# DLMETRIX - Instalación de Chrome Corregida

## Comandos Corregidos para Instalar Chrome

Ejecuta estos comandos EN ORDEN en tu servidor como root:

### 1. Método Principal - Google Chrome Oficial

```bash
# Limpiar repositorios anteriores
sudo rm -f /etc/apt/sources.list.d/google-chrome.list

# Descargar e instalar la clave GPG correcta
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -

# Agregar repositorio correctamente
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list

# Actualizar lista de paquetes
sudo apt update

# Instalar Chrome
sudo apt install -y google-chrome-stable
```

### 2. Método Alternativo - Descargar .deb directamente

Si el repositorio falla, descarga directamente:

```bash
# Descargar el paquete .deb
cd /tmp
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

# Instalar el paquete
sudo dpkg -i google-chrome-stable_current_amd64.deb

# Resolver dependencias si hay errores
sudo apt-get install -f
```

### 3. Método Alternativo - Chromium

Si Google Chrome no funciona, usa Chromium:

```bash
sudo apt update
sudo apt install -y chromium-browser
```

### 4. Instalar dependencias necesarias

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
  libxrandr2 \
  libasound2 \
  libpangocairo-1.0-0 \
  libatk1.0-0 \
  libcairo-gobject2 \
  libgtk-3-0 \
  libgdk-pixbuf2.0-0
```

### 5. Configurar variables de entorno

```bash
# Para Google Chrome
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# O para Chromium
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Agregar al .bashrc para que persista
echo 'export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable' >> ~/.bashrc
```

### 6. Verificar instalación

```bash
# Verificar que Chrome está instalado
google-chrome-stable --version

# O para Chromium
chromium-browser --version

# Verificar que el archivo existe
ls -la /usr/bin/google-chrome-stable
# O
ls -la /usr/bin/chromium-browser
```

### 7. Probar Puppeteer

```bash
cd ~/DLMETRIX
node -e "
const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome-stable',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✅ Chrome funciona con Puppeteer');
    await browser.close();
  } catch(e) {
    console.log('❌ Error:', e.message);
  }
})();
"
```

### 8. Reiniciar aplicación

```bash
cd ~/DLMETRIX
pm2 stop dlmetrix
NODE_ENV=production npm start
```

## Verificación Final

Después de la instalación, probar un análisis:

```bash
curl -X POST http://localhost:3000/api/web/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' \
  | grep -o '"lcp":[^,]*' 
```

Si ves valores numéricos en lugar de `null`, ¡Core Web Vitals está funcionando!

## Solución de Problemas

### Error: Chrome crashed
```bash
# Añadir más argumentos de seguridad
export PUPPETEER_ARGS="--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu"
```

### Error: No display
```bash
# Instalar Xvfb para entorno headless
sudo apt install -y xvfb
```

### Error: Permisos
```bash
# Dar permisos correctos
sudo chmod +x /usr/bin/google-chrome-stable
```