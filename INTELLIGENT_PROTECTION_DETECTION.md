# Sistema Inteligente de Detección de Protecciones - DLMETRIX

## **Problema Resuelto:**
En lugar de intentar bypasear protecciones indefinidamente, DLMETRIX ahora detecta específicamente qué sistema está bloqueando el acceso y proporciona recomendaciones claras.

## **Sistemas de Protección Detectados:**

### 1. **Cloudflare Bot Protection**
- **Detecta**: "Just a moment", "checking your browser", Ray ID
- **Tipo**: Bot Protection
- **Recomendación**: Desactivar "Bot Fight Mode" o agregar DLMETRIX a bots permitidos

### 2. **Google reCAPTCHA**
- **Detecta**: `.g-recaptcha`, `#recaptcha`, iframes de reCAPTCHA
- **Tipo**: Human Verification
- **Recomendación**: Desactivar temporalmente reCAPTCHA durante análisis

### 3. **hCaptcha**
- **Detecta**: `.h-captcha`, iframes de hCaptcha
- **Tipo**: Human Verification
- **Recomendación**: Desactivar temporalmente hCaptcha durante análisis

### 4. **Sucuri WAF**
- **Detecta**: "sucuri", "website firewall", "access denied"
- **Tipo**: Web Application Firewall
- **Recomendación**: Agregar IP de DLMETRIX a whitelist o desactivar WAF

### 5. **WordFence (WordPress)**
- **Detecta**: "wordfence", "security plugin", bloqueos de seguridad
- **Tipo**: WordPress Security Plugin
- **Recomendación**: Agregar DLMETRIX a whitelist de WordFence

### 6. **Protección Genérica de Bots**
- **Detecta**: "bot detected", "automated traffic", "verify you are human"
- **Tipo**: Anti-Bot System
- **Recomendación**: Desactivar protección de bots o agregar user-agent whitelist

## **Respuesta de la API:**

### ✅ **Análisis Exitoso (200)**
```json
{
  "url": "https://example.com",
  "title": "Example Site",
  // ... datos del análisis completo
}
```

### ⚠️ **Protección Detectada (423 - Locked)**
```json
{
  "error": "SITE_PROTECTION_ACTIVE",
  "message": "El sitio web tiene protecciones activas que impiden el análisis automatizado",
  "protections": [
    {
      "name": "Cloudflare",
      "type": "Bot Protection", 
      "description": "Cloudflare bot protection is active",
      "action": "Disable 'Bot Fight Mode' or add DLMETRIX to allowed bots"
    }
  ],
  "pageInfo": {
    "title": "Just a moment...",
    "snippet": "Checking your browser before accessing..."
  },
  "recommendations": [
    "Desactiva temporalmente las protecciones anti-bot durante el análisis",
    "Agrega la IP de DLMETRIX a la lista blanca de tu firewall",
    "Configura excepciones para herramientas de análisis SEO",
    "Contacta al administrador del sitio para permitir el análisis"
  ]
}
```

## **Beneficios del Sistema:**

✅ **Transparencia**: Usuario sabe exactamente qué está bloqueando  
✅ **Recomendaciones específicas**: Pasos claros para resolver el problema  
✅ **Profesionalidad**: No intenta bypasear sin permiso  
✅ **Eficiencia**: No pierde tiempo en intentos fallidos  
✅ **Seguridad**: Respeta las medidas de protección del sitio  

## **Para Aplicar:**
```bash
git pull origin main
pm2 restart dlmetrix
```

**Ahora DLMETRIX identifica inteligentemente las protecciones activas y guía al usuario hacia la solución correcta.**