# DLMETRIX - Solución de Emergencia

## Problema Crítico
La aplicación muestra código HTML en lugar de la interfaz debido a scripts de obfuscación interfiriendo con React.

## Solución INMEDIATA

### 1. Comandos para ejecutar EN TU SERVIDOR:

```bash
# Detener aplicación
pm2 stop dlmetrix

# Ir al directorio
cd ~/DLMETRIX

# Crear main.tsx limpio SIN obfuscación
cat > client/src/main.tsx << 'EOF'
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root container missing in index.html");

const root = createRoot(container);
root.render(<App />);
EOF

# Limpiar dist
rm -rf dist

# Construir
npm run build

# Iniciar
NODE_ENV=production npm start
```

### 2. Si aún no funciona, modo debugging:

```bash
# Iniciar en modo desarrollo para ver qué pasa
NODE_ENV=development npm start
```

## Qué hice

1. **Eliminé TODOS los scripts de obfuscación** del HTML
2. **Simplifiqué main.tsx** a solo lo esencial para React
3. **Sin imports de seguridad** que puedan interferir

## Resultado esperado

Después de estos comandos debes ver:
- Interfaz normal de DLMETRIX
- No código HTML en pantalla
- Aplicación funcionando completamente

## Si persiste

Si después de esto aún ves código, el problema puede ser:

1. **Caché del navegador**: Ctrl+F5 para refrescar
2. **Archivos no actualizados**: Verifica que main.tsx se creó correctamente
3. **Proceso zombie**: `pkill -f node` para matar todos los procesos

## Verificación rápida

Después de aplicar la solución, ejecuta:
```bash
# Ver si el archivo está correcto
cat client/src/main.tsx

# Debe mostrar solo 8 líneas, sin imports de obfuscación
```

Esta es la solución más simple y directa para que React funcione sin interferencias.