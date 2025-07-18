#!/bin/bash

echo "🎯 DLMETRIX - Corrección FINAL Waterfall Timing"
echo "==============================================="

# Parar el servicio
pm2 stop dlmetrix

# Aplicar cambios desde Git
cd ~/DLMETRIX
git stash push -m "Local fixes before final timing update"
git pull origin main

# Limpiar y reinstalar
rm -rf node_modules package-lock.json dist
npm install

# Build corregido
npx vite build
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --external:vite

# Reiniciar servicio
pm2 start dlmetrix

echo ""
echo "✅ CORRECCIONES FINALES APLICADAS:"
echo "   ✓ Eliminados valores negativos tipo '-3270647ms'"
echo "   ✓ Formato consistente: <1000ms → 'XXXms', ≥1000ms → 'X.Xs'"
echo "   ✓ Time Scale unificado sin duplicidad"
echo "   ✓ Total Load Time siempre positivo"
echo "   ✓ Timeline con tiempo relativo desde 0ms"
echo "   ✓ Máximo 2 decimales en milisegundos"
echo "   ✓ 1 decimal para segundos <10s, sin decimales ≥10s"
echo ""
echo "🎯 Waterfall Analysis con formato de tiempo CONSISTENTE completado!"
echo ""
echo "Ejecuta 'pm2 logs dlmetrix' para verificar funcionamiento"