# 🚨 COMANDOS URGENTES PARA TU SERVIDOR

## El problema actual:
Tu aplicación está en modo producción pero no puede conectarse a la base de datos MySQL, por eso aparece el error "Database not available".

## Solución INMEDIATA en tu servidor:

### 1. Ir al directorio y obtener archivos actualizados
```bash
cd ~/DLMETRIX
git pull origin main
npm install
```

### 2. Ejecutar script de actualización de base de datos
```bash
node update-existing-database.js
```

### 3. Hacer build y reiniciar
```bash
npm run build
pm2 restart dlmetrix
```

### 4. Verificar estado
```bash
pm2 logs dlmetrix --lines 20
```

## Si el script falla:

### Verificar MySQL manualmente:
```bash
# Probar conexión MySQL
mysql -u plusmitseometrix -pPxwjcJDm9cgBG7ZHa8uQ dbmpltrixseo -e "SHOW TABLES;"
```

### Si MySQL no funciona, crear tabla manualmente:
```bash
mysql -u plusmitseometrix -pPxwjcJDm9cgBG7ZHa8uQ dbmpltrixseo -e "
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
"
```

### Crear archivo .env manualmente:
```bash
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=mysql://plusmitseometrix:PxwjcJDm9cgBG7ZHa8uQ@localhost:3306/dbmpltrixseo
EOF
```

## Después de esto:
1. `npm run build`
2. `pm2 restart dlmetrix`
3. Probar crear un reporte compartible
4. El error debería desaparecer

¿Qué comando ejecutaste y qué resultado obtuviste?