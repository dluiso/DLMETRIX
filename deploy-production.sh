#!/bin/bash
# Script de despliegue para producción DLMETRIX

echo "🚀 Iniciando despliegue de DLMETRIX..."

# Detener procesos anteriores
echo "Deteniendo procesos anteriores..."
pkill -f "node.*dlmetrix" || true
pm2 delete dlmetrix || true

# Actualizar repositorio
echo "Actualizando código..."
git pull origin main

# Instalar dependencias
echo "Instalando dependencias..."
npm install --legacy-peer-deps

# Build para producción
echo "Generando build de producción..."
npm run build

# Verificar que existe el build
if [ ! -f "dist/index.js" ]; then
    echo "❌ Error: No se generó el build correctamente"
    exit 1
fi

# Configurar variables de entorno
export NODE_ENV=production
export PORT=3000

# Iniciar con PM2
echo "Iniciando aplicación con PM2..."
pm2 start dist/index.js --name dlmetrix --max-memory-restart 2048M

# Verificar estado
pm2 status dlmetrix

echo "✅ Despliegue completado!"
echo "📊 DLMETRIX ejecutándose en puerto 3000"
