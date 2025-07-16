# DLMETRIX - Resolución de Conflictos Git

## Problema: Conflicto en client/src/main.tsx

Git detectó que tienes cambios locales en `client/src/main.tsx` que entrarían en conflicto con los cambios del repositorio.

## Solución: Ejecuta estos comandos en orden

```bash
cd ~/DLMETRIX

# 1. Hacer backup de tus cambios locales
cp client/src/main.tsx client/src/main.tsx.backup

# 2. Guardar temporalmente los cambios locales
git stash

# 3. Actualizar desde el repositorio
git pull origin main

# 4. Verificar que se actualizó correctamente
git log --oneline -5

# 5. Instalar Chromium si no está instalado
sudo apt install -y chromium-browser

# 6. Instalar dependencias necesarias
sudo apt install -y libnss3 libatk-bridge2.0-0 libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2

# 7. Configurar variable de entorno
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
echo 'export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser' >> ~/.bashrc

# 8. Verificar que Chromium está instalado
chromium-browser --version
which chromium-browser

# 9. Limpiar build anterior
rm -rf dist

# 10. Construir con código actualizado
npm run build

# 11. Reiniciar aplicación con variables de entorno
pm2 stop dlmetrix
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser NODE_ENV=production npm start

# 12. Verificar logs
pm2 logs dlmetrix --lines 10
```

## Verificación de Éxito

Después de estos comandos, cuando analices una URL deberías ver:

✅ **En los logs**:
```
Using browser executable: /usr/bin/chromium-browser
```

✅ **NO debería aparecer**:
```
Lighthouse analysis failed, falling back to SEO-only analysis
```

✅ **En el análisis**:
- Core Web Vitals con valores reales (no null)
- Screenshots en base64 (no null)

## Si algo sale mal

Si hay problemas, revierte los cambios:
```bash
git stash pop  # Restaurar cambios locales
cp client/src/main.tsx.backup client/src/main.tsx  # Restaurar backup
```

## Archivos Críticos Actualizados

Los archivos principales que se actualizaron incluyen:
- `server/routes.ts` - Detección automática de Chromium ARM64
- `client/src/main.tsx` - Simplificado sin obfuscación
- Varios archivos de documentación y guías

El cambio más importante está en `server/routes.ts` que ahora busca automáticamente Chromium en la ubicación correcta para ARM64.