# Actualizar Base de Datos para Waterfall Analysis

## Problema
La base de datos de producción no tiene la columna `waterfall_analysis` que necesita DLMETRIX para almacenar el análisis de cascada de recursos.

## Solución

### Opción 1: Script JavaScript Automático (Recomendado)

1. **Subir archivo al servidor**:
   ```bash
   scp add-waterfall-column.js usuario@tu-servidor:/home/dlmetrix/
   ```

2. **Conectar al servidor**:
   ```bash
   ssh usuario@tu-servidor
   cd /home/dlmetrix/
   ```

3. **Ejecutar script**:
   ```bash
   node add-waterfall-column.js
   ```

4. **Seguir las instrucciones**:
   - Host: localhost
   - Usuario: dlmetrix
   - Contraseña: [tu contraseña de MySQL]
   - Base de datos: dlmetrix

### Opción 2: SQL Manual

1. **Conectar a MySQL**:
   ```bash
   mysql -u dlmetrix -p dlmetrix
   ```

2. **Ejecutar comando**:
   ```sql
   ALTER TABLE web_analyses 
   ADD COLUMN waterfall_analysis JSON NULL 
   AFTER ai_search_analysis;
   ```

3. **Verificar**:
   ```sql
   DESCRIBE web_analyses;
   ```

### Opción 3: Subir archivo SQL

1. **Subir archivo**:
   ```bash
   scp update-waterfall-column.sql usuario@tu-servidor:/home/dlmetrix/
   ```

2. **Ejecutar**:
   ```bash
   mysql -u dlmetrix -p dlmetrix < update-waterfall-column.sql
   ```

## Verificación

Después de ejecutar cualquiera de las opciones, la tabla debe tener la nueva columna:

```sql
DESCRIBE web_analyses;
```

Debe aparecer la columna `waterfall_analysis` de tipo `JSON`.

## Reiniciar Aplicación

Después de actualizar la base de datos:

```bash
cd /home/dlmetrix/dlplusmetrix/
pm2 restart dlmetrix
```

## Resultado

✅ DLMETRIX podrá almacenar análisis de Waterfall Analysis
✅ No se perderán datos existentes
✅ La aplicación funcionará normalmente