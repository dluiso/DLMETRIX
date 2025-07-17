# 🚀 DLMETRIX - Guía de Despliegue en Producción

## Pasos para Desplegar

### 1. En tu servidor de producción:
```bash
cd /path/to/your/dlmetrix
./deploy-production.sh
```

### 2. Verificar que esté funcionando:
```bash
pm2 status dlmetrix
curl http://localhost:3000
```

### 3. Configurar servidor web (Nginx/Apache):
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Configurar base de datos MySQL:
```bash
# Ejecutar script de configuración de BD
node setup-database.js
```

## Solución de Problemas

### Si aparece "r is not a function":
1. Limpiar caché: `rm -rf dist node_modules/.vite`
2. Reinstalar: `npm install --legacy-peer-deps`
3. Rebuild: `npm run build`

### Si no funciona el análisis:
1. Verificar que Chromium esté instalado: `which chromium-browser`
2. Verificar permisos: `chmod +x /usr/bin/chromium-browser`
3. Verificar logs: `pm2 logs dlmetrix`

## Funcionalidades Incluidas

✅ Rate limiting (30 segundos por URL)
✅ Cola de análisis (máximo 20 simultáneos)
✅ Comparación de URLs
✅ Traducciones español/inglés
✅ Informes compartibles
✅ Análisis Waterfall
✅ Google Analytics integrado
✅ Exportación PDF/CSV
✅ Análisis completo de SEO

## Contacto de Soporte

Si tienes problemas con el despliegue, contacta con el equipo de desarrollo.
