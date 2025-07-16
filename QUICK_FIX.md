# DLMETRIX - Solución Rápida para el Problema de Código en Pantalla

## Problema
La aplicación muestra código/texto en lugar de la interfaz debido a scripts de obfuscación interfiriendo con React.

## Solución Inmediata

Ejecuta estos comandos EN ORDEN en tu servidor:

```bash
# 1. Detener aplicación
pm2 stop dlmetrix
# O si no usas PM2:
pkill -f "node dist/index.js"

# 2. Ir al directorio
cd ~/DLMETRIX

# 3. Actualizar archivos corregidos (necesario)
# Descarga los archivos corregidos desde Replit:
# - client/index.html
# - client/src/main.tsx

# 4. Limpiar build anterior
rm -rf dist

# 5. Construir sin interferencias
npm run build

# 6. Iniciar aplicación
NODE_ENV=production npm start
```

## Cambios Aplicados

1. **Script HTML simplificado**: Solo elimina source maps, no toca React
2. **Main.tsx corregido**: Obfuscación solo en dlmetrix.com exacto
3. **Sin interferencia**: React se renderiza normalmente

## Verificación

Después de ejecutar los comandos:
- Ve a tu dominio en el navegador
- Debes ver la interfaz normal de DLMETRIX
- No debe aparecer código en pantalla

## Si persiste el problema

Si aún ves código, ejecuta esto para debugging:

```bash
NODE_ENV=development npm start
```

Esto deshabilitará completamente cualquier obfuscación.

## Archivos que necesitas actualizar

Los archivos críticos corregidos son:
- `client/index.html` (script simplificado)
- `client/src/main.tsx` (condiciones más estrictas)

Asegúrate de tener las versiones más recientes antes de construir.