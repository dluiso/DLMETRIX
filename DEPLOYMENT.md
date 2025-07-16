# DLMETRIX - Guía de Despliegue en Servidor

## Problema Identificado

El problema que experimentas se debe a que los sistemas de obfuscación están ejecutándose en producción y interfiriendo con el renderizado de React. He corregido esto para que solo se ejecuten cuando sea seguro.

## Solución Aplicada

1. **Script de obfuscación simplificado**: Solo elimina source maps y React DevTools en producción
2. **Detección mejorada de entorno**: Verifica hostname para evitar ejecutarse en localhost o replit.app
3. **Error handling**: Manejo de errores para evitar que la obfuscación rompa la aplicación

## Pasos para Desplegar Correctamente

### 1. Limpia la instalación anterior
```bash
rm -rf node_modules
rm package-lock.json
```

### 2. Instala dependencias limpias
```bash
npm install
```

### 3. Ignora las vulnerabilidades de esbuild temporalmente
Las vulnerabilidades de esbuild que ves son relacionadas con el servidor de desarrollo y no afectan producción. Puedes ignorarlas por ahora.

### 4. Construye la aplicación
```bash
npm run build
```

### 5. Inicia la aplicación en producción
```bash
NODE_ENV=production npm start
```

## Variables de Entorno Recomendadas

Crea un archivo `.env` con:
```
NODE_ENV=production
PORT=3000
```

## Si el problema persiste

Si aún ves código en lugar de la interfaz, ejecuta:

```bash
# Limpia completamente
rm -rf dist
rm -rf node_modules
rm package-lock.json

# Reinstala
npm install

# Construye
npm run build

# Inicia sin obfuscación (para debugging)
NODE_ENV=development npm start
```

## Verificación

1. La aplicación debe mostrar la interfaz normal de DLMETRIX
2. No debe verse código o meta tags en la pantalla
3. Los logs deben mostrar "DLMETRIX Security: Protection bypassed for development" si está en modo desarrollo

## Configuración del Servidor

Si usas nginx, asegúrate de proxy hacia el puerto correcto:
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Comandos Útiles

- `npm run dev` - Desarrollo (sin obfuscación)
- `npm run build` - Construir para producción
- `npm start` - Iniciar en producción
- `NODE_ENV=development npm start` - Iniciar sin obfuscación para debugging

La obfuscación se activará automáticamente cuando la aplicación detecte que está en un servidor de producción real (no localhost).