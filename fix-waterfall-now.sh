#!/bin/bash

# Comando directo para agregar columna waterfall_analysis

echo "🔧 Agregando columna waterfall_analysis a la base de datos..."

mysql -u plusmitseometrix -p -e "
USE dlmetrix;
ALTER TABLE web_analyses 
ADD COLUMN waterfall_analysis JSON NULL 
AFTER ai_search_analysis;
"

echo "✅ Verificando que la columna se agregó correctamente..."

mysql -u plusmitseometrix -p -e "USE dlmetrix; DESCRIBE web_analyses;" | grep waterfall_analysis

if [ $? -eq 0 ]; then
    echo "✅ ¡Columna waterfall_analysis agregada exitosamente!"
    echo "🔄 Reiniciando aplicación..."
    pm2 restart dlmetrix
    echo "🎉 ¡Listo! El Waterfall Analysis ahora funciona correctamente"
else
    echo "❌ Error al agregar la columna"
fi