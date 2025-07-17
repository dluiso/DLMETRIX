#!/bin/bash

# DLMETRIX - Build optimizado para producción
# Soluciona problemas de traducciones y genera build limpio

set -e

echo "🚀 Construyendo DLMETRIX para producción..."
echo "=========================================="

# 1. Limpiar archivos anteriores
echo "🧹 Limpiando archivos anteriores..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf client/dist/

# 2. Verificar sistema de traducción
echo "🔍 Verificando sistema de traducción..."
if [ ! -f "client/src/lib/production-translations.ts" ]; then
    echo "❌ Sistema de traducción no encontrado"
    exit 1
fi

# 3. Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --legacy-peer-deps

# 4. Preparar configuración de producción
echo "⚙️  Preparando configuración..."
node prepare-production.cjs

# 5. Construir aplicación
echo "🏗️  Construyendo aplicación..."
npm run build

# 6. Verificar build
echo "✅ Verificando build..."
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build falló: archivo principal no encontrado"
    exit 1
fi

if [ ! -d "dist/public" ]; then
    echo "❌ Build falló: archivos públicos no encontrados"
    exit 1
fi

echo ""
echo "🎉 ¡Build completado exitosamente!"
echo "📁 Archivos listos en: dist/"
echo "🚀 Listo para despliegue"
echo ""
echo "📋 Próximos pasos:"
echo "1. Subir archivos al servidor"
echo "2. Ejecutar: chmod +x deploy-production.sh"
echo "3. Ejecutar: ./deploy-production.sh"
echo "4. Verificar funcionamiento"