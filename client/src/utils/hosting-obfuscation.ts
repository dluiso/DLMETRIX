// Hosting & Development Environment Obfuscation
// Hides information about Replit, development tools, and hosting environment

export function initHostingObfuscation() {
  // Only run in production builds
  if (!import.meta.env.PROD) {
    return;
  }

  try {
    // Hide Replit-specific environment variables and indicators
    const replitIndicators = [
      'REPLIT_CLUSTER',
      'REPLIT_DOMAIN', 
      'REPLIT_DB_URL',
      'REPLIT_ENVIRONMENT',
      'REPL_ID',
      'REPL_SLUG',
      'REPL_OWNER',
      '__REPLIT__',
      'replit'
    ];

    replitIndicators.forEach(indicator => {
      try {
        if (window[indicator]) {
          delete window[indicator];
        }
        if (process?.env?.[indicator]) {
          delete process.env[indicator];
        }
      } catch (e) {
        // Silently handle access errors
      }
    });

    // Override common development detection methods
    const hideDevEnvironment = () => {
      try {
        // Hide development server indicators
        if (window.location.port === '5000' || window.location.port === '3000') {
          Object.defineProperty(window.location, 'port', {
            value: '443',
            writable: false
          });
        }

        // Hide .replit.app domain references
        if (window.location.hostname.includes('replit.app')) {
          // Create fake location object
          const fakeLocation = {
            ...window.location,
            hostname: 'dlmetrix.com',
            host: 'dlmetrix.com',
            origin: 'https://dlmetrix.com',
            href: window.location.href.replace(/.*replit\.app/, 'https://dlmetrix.com')
          };

          try {
            Object.defineProperty(window, 'location', {
              value: fakeLocation,
              writable: false
            });
          } catch (e) {
            // Location might not be configurable
          }
        }

        // Override console methods to hide development logs
        const originalConsoleInfo = console.info;
        console.info = (...args) => {
          const message = args.join(' ');
          if (message.toLowerCase().includes('replit') || 
              message.toLowerCase().includes('development') ||
              message.toLowerCase().includes('dev server')) {
            return; // Hide development-related logs
          }
          originalConsoleInfo.apply(console, args);
        };

        // Hide network requests that reveal hosting
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
          const url = typeof input === 'string' ? input : input.url;
          if (url.includes('replit.app') || url.includes('replit.co')) {
            // Redirect to fake domain
            const newUrl = url.replace(/.*replit\.(app|co)/, 'https://dlmetrix.com');
            return originalFetch(newUrl, init);
          }
          return originalFetch(input, init);
        };

      } catch (e) {
        // Silently handle errors
      }
    };

    // Clean DOM of hosting indicators
    const cleanHostingIndicators = () => {
      try {
        // Remove or modify elements that reveal hosting
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
          try {
            // Check text content for replit references
            if (el.textContent && el.textContent.toLowerCase().includes('replit')) {
              el.textContent = el.textContent.replace(/replit/gi, 'DLMETRIX');
            }

            // Check attributes for hosting indicators
            ['src', 'href', 'action', 'data-url'].forEach(attr => {
              if (el.hasAttribute(attr)) {
                const value = el.getAttribute(attr);
                if (value && value.includes('replit')) {
                  el.setAttribute(attr, value.replace(/replit\.app/g, 'dlmetrix.com'));
                }
              }
            });

            // Remove development-specific attributes
            ['data-replit', 'data-dev', 'data-development'].forEach(attr => {
              if (el.hasAttribute(attr)) {
                el.removeAttribute(attr);
              }
            });

          } catch (e) {
            // Skip problematic elements
          }
        });
      } catch (e) {
        // Silent fail
      }
    };

    // Add fake hosting information
    try {
      window.DLMETRIX_HOSTING = {
        provider: 'Private Cloud Infrastructure',
        region: 'Global CDN',
        environment: 'Production Enterprise',
        version: '2.5.0'
      };
    } catch (e) {
      // Might not be definable
    }

    // Execute obfuscation methods
    hideDevEnvironment();
    cleanHostingIndicators();

    // Periodic cleanup for dynamic content
    setInterval(() => {
      cleanHostingIndicators();
    }, 15000);

    console.log('🔐 DLMETRIX Hosting Obfuscation: Active protection');

  } catch (e) {
    // Complete silent fail for any major errors
  }
}

// Override user agent to hide development tools
export function obfuscateUserAgent() {
  // Only run in production builds
  if (!import.meta.env.PROD) {
    return;
  }
  
  try {
    if (navigator.userAgent.includes('Chrome')) {
      Object.defineProperty(navigator, 'userAgent', {
        value: navigator.userAgent.replace(/Chrome\/[\d.]+/, 'DLMETRIX-Browser/2.5'),
        writable: false
      });
    }
  } catch (e) {
    // Navigator properties might not be configurable
  }
}

// Clean any references to development or hosting in localStorage/sessionStorage
export function cleanStorageReferences() {
  // Only run in production builds
  if (!import.meta.env.PROD) {
    return;
  }
  
  try {
    ['localStorage', 'sessionStorage'].forEach(storageType => {
      const storage = window[storageType];
      if (storage) {
        Object.keys(storage).forEach(key => {
          if (key.toLowerCase().includes('replit') || 
              key.toLowerCase().includes('dev') ||
              key.toLowerCase().includes('development')) {
            try {
              storage.removeItem(key);
            } catch (e) {}
          }
        });
      }
    });
  } catch (e) {
    // Storage might not be accessible
  }
}