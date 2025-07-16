# DLMETRIX - Guía para Commit y Deployment

## Preparación del Commit

### 1. Verificar Estado del Repositorio

```bash
# Ver archivos modificados
git status

# Ver diferencias
git diff
```

### 2. Agregar Archivos al Commit

```bash
# Agregar todos los cambios
git add .

# O agregar archivos específicos
git add client/src/components/performance-overview.tsx
git add client/src/pages/home.tsx
git add server/routes.ts
git add shared/schema.ts
git add server/storage.ts
git add setup-database.js
git add DEPLOYMENT_GUIDE.md
git add install-production.sh
```

### 3. Hacer el Commit

```bash
git commit -m "feat: implement complete shareable reports system with 12-hour expiration

🔗 Shareable Reports System:
- Add database-driven sharing with PostgreSQL storage
- Implement unique token generation for secure URL access
- Create automatic 12-hour expiration with cleanup
- Add dedicated /share/:token page with full report interface

🎨 UI/UX Improvements:
- Move Share Report button to Performance Overview header for clarity
- Create elegant share dialog with copy link and social media buttons
- Add real-time countdown showing remaining link validity
- Complete Spanish and English multilingual support

🗄️ Database Architecture:
- Create shared_reports table with proper indexing and constraints
- Extend storage interface with share methods
- Add comprehensive Drizzle schema and Zod validation
- Implement automatic cleanup of expired reports

🚀 Production Ready:
- Create interactive database setup script (setup-database.js)
- Add comprehensive deployment guide with step-by-step instructions
- Include production installation script (install-production.sh)
- Support for PM2, Nginx, and various deployment scenarios

🔧 Technical Implementation:
- RESTful API endpoints: POST /api/share/create, GET /api/share/:token
- Secure token generation using nanoid
- Error handling for expired/invalid shared reports
- Complete type safety with TypeScript schemas

User Impact: Users can now share complete DLMETRIX analysis reports 
with colleagues and clients via secure, time-limited URLs that expire 
automatically after 12 hours for security."
```

### 4. Push al Repositorio

```bash
# Push a la rama principal
git push origin main

# Si es la primera vez
git push -u origin main
```

## Deployment en Servidor

### Opción 1: Deployment Automático (Recomendado)

```bash
# 1. Clonar en el servidor
git clone [tu-repositorio-url] dlmetrix
cd dlmetrix

# 2. Ejecutar script de instalación
./install-production.sh

# 3. Configurar base de datos
node setup-database.js

# 4. Iniciar aplicación
npm start
```

### Opción 2: Deployment Manual

```bash
# 1. Instalar dependencias
npm install

# 2. Build de producción
npm run build

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de base de datos

# 4. Configurar base de datos
npm run db:push

# 5. Iniciar
npm start
```

## Variables de Entorno Requeridas

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/dlmetrix"
PGHOST="localhost"
PGPORT="5432"
PGDATABASE="dlmetrix"
PGUSER="tu_usuario"
PGPASSWORD="tu_contraseña"
NODE_ENV="production"
```

## Verificación del Deployment

### 1. Verificar Servidor

```bash
curl http://localhost:5000
```

### 2. Verificar Base de Datos

```bash
# Verificar que las tablas existen
npm run db:push
```

### 3. Verificar Funcionalidad

1. Abrir la aplicación en el navegador
2. Realizar un análisis de cualquier sitio web
3. Hacer clic en "Share Report" en el Performance Overview
4. Verificar que se genera el enlace compartible
5. Probar acceder al enlace en una ventana de incógnito

## Comandos de Producción con PM2

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start npm --name "dlmetrix" -- start

# Ver estado
pm2 status

# Ver logs
pm2 logs dlmetrix

# Reiniciar
pm2 restart dlmetrix

# Configurar inicio automático
pm2 startup
pm2 save
```

## Estructura de Archivos Agregados/Modificados

```
dlmetrix/
├── setup-database.js          # Script interactivo para configurar DB
├── install-production.sh      # Script de instalación en servidor
├── DEPLOYMENT_GUIDE.md        # Guía completa de deployment
├── GIT_COMMIT_GUIDE.md        # Esta guía
├── client/src/
│   ├── components/
│   │   └── performance-overview.tsx  # Botón Share Report agregado
│   └── pages/
│       ├── home.tsx           # Share dialog y funcionalidad
│       └── share.tsx          # Página para reportes compartidos
├── server/
│   ├── routes.ts             # APIs de sharing
│   ├── storage.ts            # Métodos de DB para sharing
│   └── db.ts                 # Configuración de base de datos
└── shared/
    └── schema.ts             # Esquemas de shared_reports
```

## Notas Importantes

- Los enlaces compartidos expiran automáticamente después de 12 horas
- La base de datos limpia reportes expirados automáticamente
- El sistema soporta tanto inglés como español
- El botón "Share Report" está ubicado en Performance Overview para claridad
- El sistema es completamente seguro con tokens únicos por reporte

¡Tu aplicación DLMETRIX está lista para producción! 🚀