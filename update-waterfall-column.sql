-- Script para agregar la columna waterfall_analysis a la tabla web_analyses existente
-- Ejecutar en la base de datos de producción

USE dlmetrix;

-- Agregar la columna waterfall_analysis como JSON
ALTER TABLE web_analyses 
ADD COLUMN waterfall_analysis JSON NULL 
AFTER ai_search_analysis;

-- Verificar que la columna fue creada correctamente
DESCRIBE web_analyses;

-- Mostrar confirmación
SELECT 'Columna waterfall_analysis agregada exitosamente' AS status;