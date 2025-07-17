# 🚀 Solución Rápida: Error Waterfall Analysis

## El Error
```
❌ Database insert failed: Unknown column 'waterfall_analysis' in 'INSERT INTO'
```

## Solución en 3 Pasos

### 1. Conéctate a tu servidor
```bash
ssh usuario@tu-servidor
cd /home/dlmetrix/dlplusmetrix/
```

### 2. Ejecuta este comando SQL
```bash
mysql -u plusmitseometrix -p -e "
USE dlmetrix;
ALTER TABLE web_analyses 
ADD COLUMN waterfall_analysis JSON NULL 
AFTER ai_search_analysis;
"
```

### 3. Reinicia la aplicación
```bash
pm2 restart dlmetrix
```

## Verificación
```bash
mysql -u plusmitseometrix -p -e "USE dlmetrix; DESCRIBE web_analyses;" | grep waterfall
```

Deberías ver:
```
waterfall_analysis  json  YES  NULL
```

## ¿Listo?
✅ La aplicación ahora puede almacenar análisis de Waterfall  
✅ No se perderán datos existentes  
✅ El análisis de cascada funcionará correctamente  

---

## Opción Más Simple
Ejecuta directamente:
```bash
./fix-waterfall-now.sh
```

**Nota**: Si prefieres usar los archivos que creé, puedes usar:
- `add-waterfall-column.cjs` (automático, corregido para CommonJS)
- `deploy-waterfall-update.sh` (despliegue completo)
- `update-waterfall-column.sql` (SQL manual)
- `fix-waterfall-now.sh` (solución rápida)