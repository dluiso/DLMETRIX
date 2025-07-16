
# 🚀 DLMETRIX SEO Tool - Guía de Instalación

## Requisitos Previos

- Node.js 18+ (Recomendado: Node.js 22 LTS)
- Base de datos PostgreSQL (opcional: usar Replit integrada)

## Instalación Rápida

### 1. Ejecutar Script de Instalación

```bash
node setup.js
```

El script te guiará a través de las siguientes opciones:

### 2. Opciones de Base de Datos

#### Opción 1: PostgreSQL Externa
- Ideal para producción
- Requiere: host, puerto, base de datos, usuario, contraseña
- Genera automáticamente la URL de conexión

#### Opción 2: Base de Datos Integrada de Replit
- Más fácil para desarrollo
- Configuración automática
- Requiere configurar `DATABASE_URL` en Secrets

#### Opción 3: Configuración Manual
- Para configuraciones avanzadas
- Introduce directamente la URL de conexión

### 3. Variables de Entorno

El script puede configurar automáticamente:

```env
NODE_ENV=development
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/database
```

### 4. Para Replit Deployments

1. Ve a **Secrets** en tu Repl
2. Agrega:
   - **Clave**: `DATABASE_URL`
   - **Valor**: Tu URL de base de datos PostgreSQL

### 5. Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Producción
npm start

# Migrar base de datos
npm run db:push
```

## Configuración Manual (Alternativa)

Si prefieres configurar manualmente:

1. Instala dependencias:
```bash
npm install
```

2. Configura variables de entorno:
```bash
export DATABASE_URL="postgresql://usuario:contraseña@host:puerto/database"
```

3. Configura la base de datos:
```bash
npm run db:push
```

4. Inicia la aplicación:
```bash
npm run dev
```

## Solución de Problemas

### Error: "DATABASE_URL not found"
- Asegúrate de configurar `DATABASE_URL` en Secrets (Replit)
- O ejecuta: `export DATABASE_URL="tu-url-aqui"`

### Error de conexión a la base de datos
- Verifica que PostgreSQL esté ejecutándose
- Confirma las credenciales de acceso
- Asegúrate de que el puerto esté abierto

### Dependencias faltantes
- Ejecuta: `npm install`
- Verifica la versión de Node.js: `node --version`

## Características

✅ **Análisis SEO Completo**: Meta tags, Open Graph, Twitter Cards  
✅ **Core Web Vitals**: Métricas de rendimiento (requiere entorno de producción)  
✅ **Screenshots**: Capturas móvil y escritorio (requiere entorno de producción)  
✅ **Análisis de Keywords**: Densidad y oportunidades  
✅ **Análisis Técnico**: Estructura HTML, accesibilidad  
✅ **Análisis con IA**: Recomendaciones inteligentes  
✅ **Exportación PDF**: Reportes completos  

## Soporte

- **Documentación**: Revisa los comentarios en el código
- **Issues**: Reporta problemas en el repositorio
- **Updates**: Mantén las dependencias actualizadas con `npm update`
