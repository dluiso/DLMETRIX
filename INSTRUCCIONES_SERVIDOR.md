# 📋 INSTRUCCIONES PARA TU SERVIDOR

## PROBLEMA ACTUAL:
Tu aplicación no puede conectarse a MySQL, por eso los reportes compartidos se pierden en memoria.

## SOLUCIÓN PASO A PASO:

### 1. Actualizar archivos en tu servidor
```bash
cd ~/DLMETRIX
git pull origin main
npm install
```

### 2. Ejecutar script de reparación MySQL
```bash
chmod +x fix-servidor-bd.sh
./fix-servidor-bd.sh
```

### 3. Hacer build y reiniciar
```bash
npm run build
pm2 restart dlmetrix
```

### 4. Verificar funcionamiento
```bash
pm2 logs dlmetrix --lines 10
```

## QUÉ VA A PASAR:

**ANTES (Actual):**
- ❌ Database not available
- ❌ Los reportes compartidos se pierden
- ⚠️ Solo funciona en memoria temporal

**DESPUÉS (Con MySQL):**
- ✅ Conexión MySQL establecida
- ✅ Reportes compartidos persisten permanentemente
- ✅ Enlaces compartidos funcionan correctamente
- ✅ Sin mensajes de error de base de datos

## SI ALGO FALLA:

### Verificar MySQL manualmente:
```bash
# Probar conexión
mysql -u plusmitseometrix -pPxwjcJDm9cgBG7ZHa8uQ dbmpltrixseo -e "SHOW TABLES;"

# Si falla, verificar usuario y contraseña en CloudPanel
```

### Verificar archivo .env:
```bash
cat .env
# Debe contener:
# NODE_ENV=production
# DATABASE_URL=mysql://plusmitseometrix:PxwjcJDm9cgBG7ZHa8uQ@localhost:3306/dbmpltrixseo
```

### Logs de aplicación:
```bash
pm2 logs dlmetrix --lines 20
```

## RESULTADO ESPERADO:
Una vez configurado correctamente, los logs mostrarán:
```
✅ Database connection established
💾 Saving shared report to database with token: xxxxx
✅ Shared report saved to database with ID: x
```

En lugar de:
```
❌ Database not available for shared reports, using memory fallback
```

¿Ejecutaste estos comandos? ¿Qué resultado obtuviste?