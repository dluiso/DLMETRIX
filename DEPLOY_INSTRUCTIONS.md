# DLMETRIX DEPLOY INSTRUCTIONS - Separación Root/App User

## Problema Identificado
Los logs muestran que el código no se actualizó correctamente en el servidor. Sigue usando rutas viejas de Chromium que no existen.

## Solución en 2 Pasos

### PASO 1: Comandos de ROOT (Administrador)
```bash
# Conectar como root
su root
# o
sudo su

# Ejecutar script de root
cd /home/dlplusmetrix/DLMETRIX
./SETUP_ROOT_COMMANDS.sh
```

**Lo que hace:**
- Elimina instalaciones previas de Chromium/Chrome
- Instala Google Chrome estable
- Verifica la instalación
- **NO toca archivos de la aplicación**

### PASO 2: Comandos de APP USER (dlplusmetrix)
```bash
# Salir de root y conectar como usuario de app
exit
# o conectar directamente como dlplusmetrix

# Ejecutar script de app
cd ~/DLMETRIX
./SETUP_APP_COMMANDS.sh
```

**Lo que hace:**
- Para el servicio DLMETRIX
- Actualiza el código con git reset --hard
- Actualiza dependencias Node.js
- Reinicia el servicio
- Verifica el estado

## Resultado Esperado
Después de ambos pasos, los logs deberían mostrar:
```
✅ Found executable at: /usr/bin/google-chrome-stable
✅ Using browser executable: /usr/bin/google-chrome-stable
Starting manual performance analysis for mobile (ARM64 compatible)
Starting manual performance analysis for desktop (ARM64 compatible)
```

## Verificación Final
```bash
# Como usuario de app
pm2 logs dlmetrix --lines 20
```

## Archivos Creados
- ✅ `SETUP_ROOT_COMMANDS.sh` - Para ejecutar como root
- ✅ `SETUP_APP_COMMANDS.sh` - Para ejecutar como usuario de app
- ✅ `DEPLOY_INSTRUCTIONS.md` - Este archivo con instrucciones