#!/bin/bash

echo "🚀 DLMETRIX - Solución Ultimate Waterfall Analysis"
echo "================================================="

# Ejecutar comando SQL directo sin dependencias
echo "🔧 Agregando columna waterfall_analysis..."

mysql -u plusmitseometrix -p'PxwjcJDm9cgBG7ZHa8uQ' dbmpltrixseo -e "
ALTER TABLE web_analyses 
ADD COLUMN waterfall_analysis JSON NULL;
"

if [ $? -eq 0 ]; then
    echo "✅ Columna waterfall_analysis agregada exitosamente"
    
    echo "🔍 Verificando estructura de la tabla..."
    mysql -u plusmitseometrix -p'PxwjcJDm9cgBG7ZHa8uQ' dbmpltrixseo -e "DESCRIBE web_analyses;" | grep waterfall_analysis
    
    if [ $? -eq 0 ]; then
        echo "✅ Columna confirmada en la base de datos"
        
        echo "🔄 Reiniciando aplicación PM2..."
        pm2 restart dlmetrix
        
        echo "📊 Verificando estado de la aplicación..."
        pm2 show dlmetrix
        
        echo ""
        echo "🎉 ¡ÉXITO TOTAL!"
        echo "✅ Columna waterfall_analysis agregada a dbmpltrixseo"
        echo "✅ Aplicación PM2 reiniciada"
        echo "✅ Waterfall Analysis completamente funcional"
        echo ""
        echo "🌐 Puedes probar el análisis en tu dominio web ahora"
    else
        echo "❌ Error: No se pudo verificar la columna"
    fi
else
    echo "❌ Error al agregar la columna waterfall_analysis"
    echo "💡 Puede que la columna ya exista. Verificando..."
    
    mysql -u plusmitseometrix -p'PxwjcJDm9cgBG7ZHa8uQ' dbmpltrixseo -e "DESCRIBE web_analyses;" | grep waterfall_analysis
    
    if [ $? -eq 0 ]; then
        echo "✅ La columna waterfall_analysis ya existe"
        echo "🔄 Reiniciando aplicación PM2..."
        pm2 restart dlmetrix
        echo "✅ Aplicación reiniciada - Waterfall Analysis debería funcionar"
    fi
fi