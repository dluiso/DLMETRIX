# 🚨 SOLUCIÓN INMEDIATA - Base de Datos MySQL

## PROBLEMA ACTUAL:
Tus reportes compartidos desaparecen porque están usando memoria temporal. Los logs muestran:
- ✅ Análisis funcionando (con respaldo en memoria)  
- ✅ Reporte creado: `rg8mfK6uxP-YQvBLI3km`
- ❌ Al abrir enlace: "Shared report not found" (perdido en memoria)

## SOLUCIÓN (Ejecutar en tu servidor):

### Paso 1: Ir al directorio
```bash
cd ~/DLMETRIX
```

### Paso 2: Obtener archivos actualizados
```bash
git pull origin main
npm install
```

### Paso 3A: Configurar base de datos automáticamente
```bash
node update-existing-database.js
```

### Si el Paso 3A falla, hacer manualmente (3B):
```bash
# Verificar que MySQL funciona
mysql -u plusmitseometrix -pPxwjcJDm9cgBG7ZHa8uQ dbmpltrixseo -e "SHOW TABLES;"

# Crear tabla shared_reports
mysql -u plusmitseometrix -pPxwjcJDm9cgBG7ZHa8uQ dbmpltrixseo << 'EOF'
CREATE TABLE IF NOT EXISTS shared_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  share_token VARCHAR(191) NOT NULL UNIQUE,
  url TEXT NOT NULL,
  analysis_data LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_share_token (share_token),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
EOF
```

### Paso 4: Crear archivo .env
```bash
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=mysql://plusmitseometrix:PxwjcJDm9cgBG7ZHa8uQ@localhost:3306/dbmpltrixseo
EOF
```

### Paso 5: Build y reiniciar
```bash
npm run build
pm2 restart dlmetrix
```

### Paso 6: Verificar funcionamiento
```bash
pm2 logs dlmetrix --lines 10
```

## DESPUÉS DE ESTOS PASOS:
1. Los análisis seguirán funcionando normal
2. Los reportes compartidos se guardarán en MySQL permanentemente
3. Los enlaces compartidos funcionarán correctamente
4. No más mensaje "Database not available"

## ¿Qué comando ejecutaste y qué resultado obtuviste?