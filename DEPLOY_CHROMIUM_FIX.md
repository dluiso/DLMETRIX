# DEPLOY CHROMIUM FIX - Comandos para el Servidor

## Paso 1: Actualizar código en el servidor
```bash
cd ~/DLMETRIX
git pull origin main
```

## Paso 2: Verificar navegadores disponibles
```bash
./check-browsers.cjs
```

## Paso 3A: Si NO hay navegadores instalados
```bash
# Instalar Google Chrome (recomendado)
sudo apt update
sudo wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update
sudo apt install -y google-chrome-stable

# O alternativamente instalar Chromium (más ligero)
sudo apt update
sudo apt install -y chromium-browser
```

## Paso 3B: Si ya hay navegadores instalados
Continúa al paso 4 directamente.

## Paso 4: Reiniciar DLMETRIX
```bash
pm2 restart dlmetrix
```

## Paso 5: Verificar funcionamiento
```bash
# Ver logs en tiempo real
pm2 logs dlmetrix

# Debería mostrar:
# ✅ Found executable at: /usr/bin/google-chrome-stable
# Starting manual performance analysis for mobile (ARM64 compatible)
# Starting manual performance analysis for desktop (ARM64 compatible)
```

## Resultado Esperado
Después de estos pasos, DLMETRIX tendrá:
- ✅ Core Web Vitals reales (mobile y desktop)
- ✅ Capturas de pantalla (mobile y desktop)
- ✅ Análisis de cascada (waterfall)
- ✅ Puntuaciones de rendimiento completas

Los análisis tomarán 30-40 segundos en lugar de 1-2 segundos, pero proporcionarán datos reales.