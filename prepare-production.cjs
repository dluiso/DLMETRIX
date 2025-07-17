#!/usr/bin/env node

// Script para preparar la aplicación para producción
// Soluciona problemas comunes con traducciones y componentes

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando DLMETRIX para producción...\n');

// 1. Verificar que no haya referencias a funciones de traducción problemáticas
const checkTranslationUsage = () => {
  console.log('1. Verificando uso de traducciones...');
  
  const filesToCheck = [
    'client/src/components/url-comparison-simple.tsx',
    'client/src/pages/home.tsx',
    'client/src/components/rate-limit-notification.tsx'
  ];
  
  let hasErrors = false;
  
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Buscar patrones problemáticos como t('key') en lugar de t.key
      const problematicPatterns = [
        /getTranslations\(/g
      ];
      
      problematicPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          console.log(`   ❌ ${file}: Encontrado patrón problemático: ${matches[0]}`);
          hasErrors = true;
        }
      });
    }
  });
  
  if (!hasErrors) {
    console.log('   ✅ Uso de traducciones correcto\n');
  }
  
  return !hasErrors;
};

// 2. Limpiar archivos de caché y build
const cleanBuildFiles = () => {
  console.log('2. Limpiando archivos de build...');
  
  const foldersToClean = [
    'dist',
    'node_modules/.vite',
    'client/dist'
  ];
  
  foldersToClean.forEach(folder => {
    if (fs.existsSync(folder)) {
      fs.rmSync(folder, { recursive: true, force: true });
      console.log(`   ✅ Eliminado: ${folder}`);
    }
  });
  
  console.log('');
};

// 3. Verificar configuración de producción
const checkProductionConfig = () => {
  console.log('3. Verificando configuración de producción...');
  
  // Verificar package.json
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.build) {
      console.log('   ✅ Script de build disponible');
    } else {
      console.log('   ❌ Falta script de build');
    }
    
    if (packageJson.scripts && packageJson.scripts.start) {
      console.log('   ✅ Script de start disponible');
    } else {
      console.log('   ❌ Falta script de start');
    }
  }
  
  // Verificar vite.config.ts
  if (fs.existsSync('vite.config.ts')) {
    console.log('   ✅ Configuración de Vite disponible');
  } else {
    console.log('   ❌ Falta configuración de Vite');
  }
  
  console.log('');
};

// 4. Crear archivo de configuración para producción
const createProductionConfig = () => {
  console.log('4. Creando configuración para producción...');
  
  const productionScript = `#!/bin/bash
# Script de despliegue para producción DLMETRIX

echo "🚀 Iniciando despliegue de DLMETRIX..."

# Detener procesos anteriores
echo "Deteniendo procesos anteriores..."
pkill -f "node.*dlmetrix" || true
pm2 delete dlmetrix || true

# Actualizar repositorio
echo "Actualizando código..."
git pull origin main

# Instalar dependencias
echo "Instalando dependencias..."
npm install --legacy-peer-deps

# Build para producción
echo "Generando build de producción..."
npm run build

# Verificar que existe el build
if [ ! -f "dist/index.js" ]; then
    echo "❌ Error: No se generó el build correctamente"
    exit 1
fi

# Configurar variables de entorno
export NODE_ENV=production
export PORT=3000

# Iniciar con PM2
echo "Iniciando aplicación con PM2..."
pm2 start dist/index.js --name dlmetrix --max-memory-restart 2048M

# Verificar estado
pm2 status dlmetrix

echo "✅ Despliegue completado!"
echo "📊 DLMETRIX ejecutándose en puerto 3000"
`;
  
  fs.writeFileSync('deploy-production.sh', productionScript);
  fs.chmodSync('deploy-production.sh', '755');
  console.log('   ✅ Creado: deploy-production.sh');
  
  console.log('');
};

// 5. Generar instrucciones de despliegue
const generateDeploymentInstructions = () => {
  console.log('5. Generando instrucciones de despliegue...');
  
  const instructions = `# 🚀 DLMETRIX - Guía de Despliegue en Producción

## Pasos para Desplegar

### 1. En tu servidor de producción:
\`\`\`bash
cd /path/to/your/dlmetrix
./deploy-production.sh
\`\`\`

### 2. Verificar que esté funcionando:
\`\`\`bash
pm2 status dlmetrix
curl http://localhost:3000
\`\`\`

### 3. Configurar servidor web (Nginx/Apache):
\`\`\`nginx
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
\`\`\`

### 4. Configurar base de datos MySQL:
\`\`\`bash
# Ejecutar script de configuración de BD
node setup-database.js
\`\`\`

## Solución de Problemas

### Si aparece "r is not a function":
1. Limpiar caché: \`rm -rf dist node_modules/.vite\`
2. Reinstalar: \`npm install --legacy-peer-deps\`
3. Rebuild: \`npm run build\`

### Si no funciona el análisis:
1. Verificar que Chromium esté instalado: \`which chromium-browser\`
2. Verificar permisos: \`chmod +x /usr/bin/chromium-browser\`
3. Verificar logs: \`pm2 logs dlmetrix\`

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
`;
  
  fs.writeFileSync('DEPLOYMENT_GUIDE.md', instructions);
  console.log('   ✅ Creado: DEPLOYMENT_GUIDE.md');
  
  console.log('');
};

// Ejecutar todas las verificaciones
const main = () => {
  console.log('=' .repeat(50));
  console.log('🔧 DLMETRIX - Preparación para Producción');
  console.log('=' .repeat(50));
  console.log('');
  
  const translationsOk = checkTranslationUsage();
  cleanBuildFiles();
  checkProductionConfig();
  createProductionConfig();
  generateDeploymentInstructions();
  
  if (translationsOk) {
    console.log('🎉 ¡Preparación completada exitosamente!');
    console.log('');
    console.log('📋 Próximos pasos:');
    console.log('1. Ejecutar: npm run build');
    console.log('2. Subir archivos al servidor');
    console.log('3. Ejecutar: ./deploy-production.sh');
    console.log('4. Verificar funcionamiento');
    console.log('');
    console.log('📚 Ver DEPLOYMENT_GUIDE.md para más detalles');
  } else {
    console.log('❌ Se encontraron problemas que deben solucionarse primero');
    process.exit(1);
  }
};

main();