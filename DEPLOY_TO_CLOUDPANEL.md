# 🚀 Guía de Despliegue en CloudPanel

## Pasos para Configurar en tu Servidor

### 1. Subir los Archivos Actualizados

```bash
# En tu servidor CloudPanel, ve al directorio DLMETRIX
cd ~/DLMETRIX

# Haz pull de los cambios más recientes
git pull origin main

# Instala las nuevas dependencias
npm install
```

### 2. Configurar la Base de Datos MySQL

```bash
# Ejecuta el script de configuración automática
node setup-cloudpanel.js
```

**Datos que necesitarás:**
- Host: `localhost`
- Puerto: `3306` 
- Base de datos: `dbmpltrixseo`
- Usuario: `plusmitseometrix`
- Contraseña: `PxwjcJDm9cgBG7ZHa8uQ`

Este script:
- Creará el archivo `.env` con la configuración correcta
- Probará la conexión a MySQL
- Creará las tablas `web_analyses` y `shared_reports`

### 3. Verificar las Tablas Creadas

```bash
# Verificar que las tablas se crearon correctamente
node setup-tables.js
```

### 4. Hacer Build y Reiniciar

```bash
# Compilar la aplicación
npm run build

# Reiniciar con PM2
pm2 restart dlmetrix

# Verificar que esté corriendo
pm2 status
```

### 5. Probar el Sistema

1. Ve a tu aplicación DLMETRIX
2. Haz un análisis de cualquier URL
3. Haz clic en "Share Report" 
4. Verifica que se genere el enlace sin errores
5. Abre el enlace en una nueva pestaña/ventana
6. Confirma que el reporte se muestra completamente

### 6. Verificar Base de Datos (Opcional)

```bash
# Conectar a MySQL y verificar datos
mysql -u plusmitseometrix -pPxwjcJDm9cgBG7ZHa8uQ dbmpltrixseo

# Ver las tablas
SHOW TABLES;

# Ver reportes compartidos (si has creado alguno)
SELECT id, share_token, url, created_at, expires_at FROM shared_reports;

# Salir
exit;
```

## Características del Sistema Actualizado

### 🔗 Reportes Compartibles
- **Enlaces únicos**: Cada reporte genera un token de 20 caracteres
- **Expiración automática**: 12 horas exactas
- **Datos optimizados**: Screenshots comprimidos para reducir tamaño
- **Base de datos persistente**: Los enlaces se guardan en MySQL

### 📊 Optimizaciones de Rendimiento
- **Límite de payload**: Aumentado a 50MB para análisis grandes
- **Compresión automática**: Screenshots reducidos para sharing
- **Datos limitados**: Solo los insights más importantes se incluyen
- **Limpieza automática**: Reportes expirados se eliminan automáticamente

### 🛠️ Configuración Dual
- **Desarrollo**: Usa almacenamiento en memoria (temporal)
- **Producción**: Usa MySQL persistente (permanente)

## Solución de Problemas

### Si el setup-cloudpanel.js falla:
```bash
# Instalar mysql2 manualmente
npm install mysql2

# Verificar credenciales de MySQL en CloudPanel
# Revisar que la base de datos dbmpltrixseo exista
```

### Si PM2 no reinicia:
```bash
# Verificar logs de error
pm2 logs dlmetrix

# Reiniciar forzado
pm2 delete dlmetrix
pm2 start npm --name "dlmetrix" -- start
```

### Si los enlaces compartidos no funcionan:
- Verificar que las tablas estén creadas
- Confirmar que el archivo `.env` existe
- Revisar logs con `pm2 logs dlmetrix`

## ✅ Confirmación de Éxito

Sabrás que todo funciona cuando:
1. El script de configuración se ejecute sin errores
2. Las tablas aparezcan en MySQL
3. El botón "Share Report" genere enlaces sin errores
4. Los enlaces compartidos muestren el análisis completo
5. Los datos persistan en la base de datos

¡Tu sistema DLMETRIX ahora tiene reportes compartibles completamente funcionales!