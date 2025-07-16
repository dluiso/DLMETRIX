#!/bin/bash

echo "🚀 DLMETRIX - Instalación en Servidor de Producción"
echo "=================================================="
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ primero."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Se requiere Node.js 18+. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL no detectado. Asegúrate de que esté instalado y accesible."
fi

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo "✅ Dependencias instaladas"

# Hacer build de producción
echo ""
echo "🏗️  Construyendo aplicación para producción..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en build de producción"
    exit 1
fi

echo "✅ Build de producción completado"

# Configurar base de datos
echo ""
echo "🗄️  Configurando base de datos..."
echo "Por favor ejecuta manualmente: node setup-database.js"
echo "Esto configurará tu base de datos PostgreSQL interactivamente."

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Ejecuta: node setup-database.js"
echo "   2. Para iniciar: npm start"
echo "   3. Para usar PM2: pm2 start npm --name dlmetrix -- start"
echo ""
echo "📖 Ver DEPLOYMENT_GUIDE.md para instrucciones completas"