-- Comando SQL directo para agregar columna waterfall_analysis
-- Base de datos: dbmpltrixseo
-- Usuario: plusmitseometrix

USE dbmpltrixseo;

-- Agregar columna waterfall_analysis
ALTER TABLE web_analyses 
ADD COLUMN waterfall_analysis JSON NULL 
AFTER ai_search_analysis;

-- Verificar que se agregó correctamente
DESCRIBE web_analyses;

-- Mostrar confirmación
SELECT 'Columna waterfall_analysis agregada exitosamente' AS status;