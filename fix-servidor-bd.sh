#!/bin/bash

echo "🔧 Script de reparación MySQL para DLMETRIX"
echo "=========================================="

# Verificar conexión MySQL básica
echo "🔍 Verificando conexión MySQL..."
mysql -u plusmitseometrix -pPxwjcJDm9cgBG7ZHa8uQ -e "SELECT 1;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ MySQL funciona"
else
    echo "❌ Error de conexión MySQL - verificar credenciales"
    exit 1
fi

# Verificar base de datos
echo "🗄️ Verificando base de datos dbmpltrixseo..."
mysql -u plusmitseometrix -pPxwjcJDm9cgBG7ZHa8uQ dbmpltrixseo -e "SELECT 1;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Base de datos accesible"
else
    echo "❌ Error accediendo a dbmpltrixseo"
    exit 1
fi

# Crear tabla shared_reports
echo "📋 Creando tabla shared_reports..."
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

if [ $? -eq 0 ]; then
    echo "✅ Tabla shared_reports creada/verificada"
else
    echo "❌ Error creando tabla"
    exit 1
fi

# Verificar tablas existentes
echo "📊 Tablas en la base de datos:"
mysql -u plusmitseometrix -pPxwjcJDm9cgBG7ZHa8uQ dbmpltrixseo -e "SHOW TABLES;"

# Crear archivo .env
echo "📝 Creando archivo .env..."
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=mysql://plusmitseometrix:PxwjcJDm9cgBG7ZHa8uQ@localhost:3306/dbmpltrixseo
EOF

echo "✅ Archivo .env creado"

# Mostrar contenido de .env
echo "📄 Contenido de .env:"
cat .env

echo ""
echo "🎉 Configuración completada"
echo "👉 Próximos pasos:"
echo "   1. npm run build"
echo "   2. pm2 restart dlmetrix"
echo "   3. pm2 logs dlmetrix --lines 10"