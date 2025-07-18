# COMANDOS MANUALES DE BUILD PARA DLMETRIX

Si el script automático falla, ejecuta estos comandos uno por uno:

## 1. Parar servicio
```bash
pm2 stop dlmetrix
```

## 2. Limpiar instalación previa
```bash
cd ~/DLMETRIX
rm -rf node_modules package-lock.json dist
```

## 3. Instalar dependencias
```bash
npm install
```

## 4. Verificar que Vite se instaló
```bash
ls node_modules/.bin/vite
```

## 5. Build frontend con npx
```bash
npx vite build
```

## 6. Build backend con npx
```bash
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

## 7. Verificar archivos de build
```bash
ls -la dist/
```

Deberías ver:
- `dist/index.js` (servidor)
- `dist/public/` (frontend)

## 8. Reiniciar servicio
```bash
pm2 restart dlmetrix
```

## 9. Verificar logs
```bash
pm2 logs dlmetrix --lines 20
```

## Resultado esperado en logs:
```
✅ Found executable at: /usr/bin/google-chrome-stable
📡 Using individual MySQL parameters
✅ Database connection established successfully
3:46:33 AM [express] serving on port 5000
```