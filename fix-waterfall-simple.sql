-- Comando SQL directo para agregar columna waterfall_analysis
-- Sin depender de columnas específicas

USE dbmpltrixseo;

-- Agregar columna waterfall_analysis al final de la tabla
ALTER TABLE web_analyses 
ADD COLUMN waterfall_analysis JSON NULL;

-- Verificar que se agregó correctamente
DESCRIBE web_analyses;

-- Mostrar confirmación
SELECT 'Columna waterfall_analysis agregada exitosamente' AS status;