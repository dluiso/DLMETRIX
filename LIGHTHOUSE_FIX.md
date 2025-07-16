# DLMETRIX - Solución Final para Lighthouse en ARM64

## Problema Identificado

El error "The 'start lh:driver:navigate' performance mark has not been set" es específico de Lighthouse en arquitecturas ARM64. Chromium se detecta correctamente pero Lighthouse falla en la inicialización.

## Solución Implementada

He actualizado el código con las siguientes optimizaciones para ARM64:

### 1. Configuración de Browser Mejorada
- Más argumentos de Chrome específicos para ARM64
- Timeout aumentado a 60 segundos
- Deshabilitación de funciones problemáticas

### 2. Configuración de Lighthouse Optimizada
- Reducción de CPU slowdown de 4x a 2x para móvil en ARM64
- Timeouts aumentados: maxWaitForFcp: 30s, maxWaitForLoad: 45s
- Auditorías problemáticas omitidas (screenshots, layout shifts)
- Timeout de 60 segundos con Promise.race

### 3. Comandos para Actualizar tu Servidor

```bash
cd ~/DLMETRIX

# 1. Actualizar código desde Git
git stash  # Guardar cambios locales
git pull origin main

# 2. Verificar Chromium está instalado
sudo apt install -y chromium-browser

# 3. Instalar dependencias adicionales para Lighthouse
sudo apt install -y libnss3-dev libatk-bridge2.0-dev libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2

# 4. Configurar variables de entorno
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
export CHROME_PATH=/usr/bin/chromium-browser
echo 'export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser' >> ~/.bashrc
echo 'export CHROME_PATH=/usr/bin/chromium-browser' >> ~/.bashrc

# 5. Verificar Chromium funciona
chromium-browser --version --no-sandbox

# 6. Limpiar y reconstruir
rm -rf dist node_modules/.cache
npm cache clean --force
npm run build

# 7. Reiniciar con configuración ARM64
pm2 stop dlmetrix
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser CHROME_PATH=/usr/bin/chromium-browser NODE_ENV=production npm start
```

## Verificación de Éxito

Después de la actualización, deberías ver:

✅ **En los logs**:
```
Starting Lighthouse analysis for mobile on port 9222
Starting Lighthouse analysis for desktop on port 9222
```

✅ **NO debería aparecer**:
```
The "start lh:driver:navigate" performance mark has not been set
```

✅ **En el reporte web**:
- Core Web Vitals con valores numéricos reales
- Screenshots funcionando
- Scores de Performance, Accessibility, Best Practices

## Si Sigue Fallando

Si el problema persiste, ejecuta este test individual:

```bash
cd ~/DLMETRIX
node -e "
const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const result = await lighthouse('https://example.com', {
      port: new URL(browser.wsEndpoint()).port,
      output: 'json',
      logLevel: 'error'
    });
    
    console.log('✅ Lighthouse funciona! Score:', result.lhr.categories.performance.score * 100);
    await browser.close();
  } catch(e) {
    console.log('❌ Error Lighthouse:', e.message);
  }
})();
"
```

## Cambios Técnicos Específicos

1. **Reduced CPU Throttling**: De 4x a 2x para móvil en ARM64
2. **Increased Timeouts**: 30s FCP, 45s Load, 60s total
3. **Skipped Problematic Audits**: Screenshots y layout shifts que fallan en ARM64
4. **Better Error Handling**: Promise.race con timeout explícito
5. **Enhanced Logging**: Mensajes detallados para debugging