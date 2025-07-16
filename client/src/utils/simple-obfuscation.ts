// Simplified Technology Obfuscation System
// Safer approach to prevent technology detection

export function initSimpleObfuscation() {
  // Check if running in development mode
  const isDev = import.meta.env.NODE_ENV === 'development';
  
  if (isDev) {
    console.log('🔓 DLMETRIX Simple Obfuscation: Bypassed for development');
    return;
  }

  try {
    // Remove obvious framework indicators from window
    const frameworkProps = [
      '__REACT_DEVTOOLS_GLOBAL_HOOK__',
      'React', 
      'ReactDOM',
      '__vite__',
      '__VITE_HMR_PORT__',
      'Vue',
      'Angular'
    ];

    frameworkProps.forEach(prop => {
      try {
        if (window[prop]) {
          delete window[prop];
        }
      } catch (e) {
        // Property might not be deletable
      }
    });

    // Add fake framework indicator and hide hosting info
    try {
      window.DLMETRIX = { 
        version: '2.5.0', 
        framework: 'Custom Enterprise',
        engine: 'Proprietary',
        hosting: 'Private Cloud Infrastructure',
        environment: 'Production Enterprise'
      };
    } catch (e) {
      // Might already exist
    }

    // Hide Replit and development environment indicators
    const devIndicators = [
      'REPLIT_CLUSTER',
      'REPLIT_DOMAIN', 
      'REPLIT_DB_URL',
      'replit',
      '__REPLIT__'
    ];

    devIndicators.forEach(indicator => {
      try {
        if (window[indicator]) {
          delete window[indicator];
        }
      } catch (e) {}
    });

    // Override location properties to hide .replit.app domain
    try {
      if (window.location.hostname.includes('replit.app')) {
        Object.defineProperty(window.location, 'hostname', {
          value: 'dlmetrix.com',
          writable: false
        });
        Object.defineProperty(window.location, 'host', {
          value: 'dlmetrix.com',
          writable: false
        });
      }
    } catch (e) {
      // Location properties might not be configurable
    }

    // Simple DOM cleanup
    const cleanDOM = () => {
      try {
        // Remove framework attributes
        const attributesToRemove = ['data-reactroot', 'data-vite-dev-id', 'data-react-helmet'];
        attributesToRemove.forEach(attr => {
          const elements = document.querySelectorAll(`[${attr}]`);
          elements.forEach(el => {
            try {
              el.removeAttribute(attr);
            } catch (e) {}
          });
        });

        // Hide source maps
        const maps = document.querySelectorAll('script[src*=".map"], link[href*=".map"]');
        maps.forEach(el => {
          try {
            el.remove();
          } catch (e) {}
        });
      } catch (e) {
        // Silent fail
      }
    };

    // Run cleanup
    cleanDOM();
    
    // Periodic cleanup (less frequent to avoid errors)
    setInterval(cleanDOM, 10000);

    console.log('🔐 DLMETRIX Simple Obfuscation: Active');
  } catch (e) {
    // Silently handle all errors
  }
}

// Safe DOM cleanup
export function safeCleanup() {
  try {
    // Basic cleanup without complex operations
    const viteElements = document.querySelectorAll('[data-vite-dev-id]');
    if (viteElements.length > 0) {
      viteElements.forEach(el => {
        try {
          el.removeAttribute('data-vite-dev-id');
        } catch (e) {}
      });
    }

    const reactElements = document.querySelectorAll('[data-reactroot]');
    if (reactElements.length > 0) {
      reactElements.forEach(el => {
        try {
          el.removeAttribute('data-reactroot');
        } catch (e) {}
      });
    }
  } catch (e) {
    // Complete silent fail
  }
}