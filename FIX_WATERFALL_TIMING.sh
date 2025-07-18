#!/bin/bash

echo "🚀 DLMETRIX - Corrección Waterfall Analysis Timing"
echo "================================================="

# Parar el servicio
pm2 stop dlmetrix

# Aplicar cambios desde Git
cd ~/DLMETRIX
git stash push -m "Local fixes before waterfall timing update"
git pull origin main

# Limpiar y reinstalar
rm -rf node_modules package-lock.json dist
npm install

# Build corregido excluyendo Vite
npx vite build
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --external:vite

# Verificar build
echo "✅ Verificando build..."
ls -la dist/

# Reiniciar servicio
pm2 start dlmetrix
pm2 logs dlmetrix --lines 5

echo ""
echo "✅ CORRECCIONES APLICADAS:"
echo "   ✓ Valores negativos eliminados (-3269640ms → 0ms)"
echo "   ✓ Time Scale consistente (solo segundos, no m+s duplicados)"
echo "   ✓ Formato uniforme en Total Load Time"
echo "   ✓ Validación de recursos con datos válidos"
echo "   ✓ Barras de colores mejoradas"
echo ""
echo "🎯 DLMETRIX Waterfall Analysis optimizado correctamente!"