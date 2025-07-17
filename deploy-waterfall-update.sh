#!/bin/bash

# Script de despliegue para actualización de Waterfall Analysis
# Ejecutar en el servidor de producción

echo "🚀 DLMETRIX - Despliegue de Waterfall Analysis"
echo "============================================="

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "package.json no encontrado. Ejecuta este script desde el directorio del proyecto."
    exit 1
fi

# 1. Hacer backup de la base de datos
log_info "Creando backup de la base de datos..."
mysqldump -u dlmetrix -p dlmetrix > backup_antes_waterfall_$(date +%Y%m%d_%H%M%S).sql

# 2. Actualizar código desde git
log_info "Actualizando código desde git..."
git pull origin main

# 3. Instalar dependencias si es necesario
log_info "Verificando dependencias..."
npm install

# 4. Actualizar base de datos
log_info "Actualizando estructura de base de datos..."
if [ -f "add-waterfall-column.js" ]; then
    node add-waterfall-column.js
else
    log_warning "add-waterfall-column.js no encontrado. Ejecutando SQL manual..."
    mysql -u dlmetrix -p -e "
    USE dlmetrix;
    ALTER TABLE web_analyses 
    ADD COLUMN IF NOT EXISTS waterfall_analysis JSON NULL 
    AFTER ai_search_analysis;
    "
fi

# 5. Verificar estructura de base de datos
log_info "Verificando estructura de base de datos..."
mysql -u dlmetrix -p -e "USE dlmetrix; DESCRIBE web_analyses;" | grep waterfall_analysis

if [ $? -eq 0 ]; then
    log_info "Columna waterfall_analysis agregada correctamente"
else
    log_error "Error al agregar columna waterfall_analysis"
    exit 1
fi

# 6. Compilar aplicación
log_info "Compilando aplicación..."
npm run build

# 7. Reiniciar aplicación
log_info "Reiniciando aplicación con PM2..."
pm2 restart dlmetrix

# 8. Verificar estado
log_info "Verificando estado de la aplicación..."
pm2 show dlmetrix

# 9. Limpiar archivos temporales
log_info "Limpiando archivos temporales..."
rm -f add-waterfall-column.js update-waterfall-column.sql

log_info "🎉 Despliegue completado exitosamente!"
log_info "✅ Waterfall Analysis está ahora disponible en DLMETRIX"
log_info "🔍 Verifica que la aplicación funcione correctamente"

echo ""
echo "📋 Resumen del despliegue:"
echo "- ✅ Código actualizado desde git"
echo "- ✅ Base de datos actualizada con columna waterfall_analysis"
echo "- ✅ Aplicación compilada y reiniciada"
echo "- ✅ Backup creado"
echo ""
echo "🌐 La aplicación debería estar disponible en tu dominio"