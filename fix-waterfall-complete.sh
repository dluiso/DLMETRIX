#!/bin/bash

echo "🚀 DLMETRIX - Solución Completa Waterfall Analysis"
echo "================================================"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json no encontrado. Ejecuta desde el directorio del proyecto."
    exit 1
fi

# Ejecutar el script de actualización de base de datos
echo "🔧 Ejecutando actualización de base de datos..."
node fix-waterfall-auto.cjs

# Verificar que el script anterior fue exitoso
if [ $? -eq 0 ]; then
    echo "✅ Base de datos actualizada correctamente"
    
    echo "🔄 Reiniciando aplicación PM2..."
    pm2 restart dlmetrix
    
    echo "📊 Verificando estado de la aplicación..."
    pm2 show dlmetrix
    
    echo ""
    echo "🎉 ¡Waterfall Analysis instalado y funcionando!"
    echo "✅ La columna waterfall_analysis fue agregada a la base de datos"
    echo "✅ La aplicación PM2 fue reiniciada"
    echo "✅ DLMETRIX ahora puede almacenar análisis de cascada de recursos"
    echo ""
    echo "🌐 Puedes probar el análisis en tu dominio web"
else
    echo "❌ Error al actualizar la base de datos"
    exit 1
fi