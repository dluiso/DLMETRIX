# SOLUCIÓN RÁPIDA PARA OFFPAGE ANALYSIS - PRODUCCIÓN

## Error Actual
```
❌ Database insert failed: Unknown column 'off_page_data' in 'INSERT INTO'
```

## Solución Inmediata

### 1. Añadir la columna a MySQL
```sql
ALTER TABLE web_analyses ADD COLUMN off_page_data JSON NULL;
```

### 2. Verificar la columna se añadió
```sql
DESCRIBE web_analyses;
```

### 3. Comandos para el servidor
```bash
# Entrar a MySQL
mysql -u root -p

# Seleccionar base de datos
USE dlmetrix;

# Añadir columna
ALTER TABLE web_analyses ADD COLUMN off_page_data JSON NULL;

# Verificar
DESCRIBE web_analyses;

# Salir
exit;
```

### 4. Reiniciar PM2
```bash
pm2 restart dlmetrix
```

## Verificación
1. Hacer un análisis de prueba en DLMETRIX
2. Verificar que aparece la sección "OffPage Analysis" 
3. Debe mostrar Domain Authority, Backlinks, Wikipedia Links, etc.

## Características del OffPage Analysis
- ✅ Domain Authority Score (0-100)
- ✅ Backlinks Analysis con dominios referentes
- ✅ Wikipedia Verification en múltiples idiomas
- ✅ Trust Metrics (HTTPS, certificados, edad dominio)
- ✅ Social Presence tracking
- ✅ UI profesional con soporte bilingüe

## Resultado Esperado
Después de ejecutar estos comandos, el análisis OffPage funcionará completamente y se guardará en la base de datos MySQL sin errores.