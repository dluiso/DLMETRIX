# Detección Específica de Cloudflare - DLMETRIX

## **Cambio Implementado:**
El sistema ahora **SOLO** detecta específicamente Cloudflare como protección que bloquea el análisis. Todos los demás sistemas (reCAPTCHA, hCaptcha, Sucuri, etc.) permiten que el análisis continúe normalmente.

## **Detección Cloudflare:**

### ✅ **Se Detecta y Bloquea:**
```javascript
// Solo estos casos específicos de Cloudflare
- title.includes('just a moment')
- bodyText.includes('checking your browser') 
- bodyText.includes('verify you are human')
- (bodyText.includes('cloudflare') && bodyText.includes('security'))
- document.querySelector('[data-ray]')
- (title.includes('attention required') && bodyText.includes('cloudflare'))
```

### ❌ **NO Se Detecta (Continúa Análisis):**
- reCAPTCHA
- hCaptcha  
- Sucuri WAF
- WordFence
- Otros sistemas anti-bot genéricos

## **Respuesta API para Cloudflare (423):**
```json
{
  "error": "SITE_PROTECTION_ACTIVE",
  "message": "Cloudflare está bloqueando el análisis automatizado y requiere verificación humana",
  "protections": [
    {
      "name": "Cloudflare",
      "type": "Bot Protection",
      "description": "Cloudflare bot protection is active and requires human verification",
      "action": "Disable 'Bot Fight Mode' or add DLMETRIX to allowed bots in Cloudflare dashboard"
    }
  ],
  "pageInfo": {
    "title": "Just a moment...",
    "snippet": "Checking your browser before accessing..."
  },
  "recommendations": [
    "Desactiva temporalmente 'Bot Fight Mode' en Cloudflare durante el análisis",
    "Agrega DLMETRIX a la lista de bots permitidos en tu panel de Cloudflare",
    "Configura una regla de página para permitir herramientas de análisis SEO",
    "Contacta al administrador para configurar excepciones de Cloudflare"
  ]
}
```

## **Comportamiento:**

### 🟢 **Sitios SIN Cloudflare:**
- Análisis completo normal
- Core Web Vitals
- Screenshots  
- SEO Analysis
- Technical Checks

### 🟡 **Sitios CON Cloudflare:**
- Detección inmediata
- Error 423 específico
- Recomendaciones de Cloudflare
- No intenta bypass

## **Para Aplicar:**
```bash
git pull origin main
pm2 restart dlmetrix
```

**Ahora solo Cloudflare bloquea el análisis. Todos los demás sitios funcionan normalmente.**