// Technology Obfuscation System
// Prevents technology detection by browser addons like Wappalyzer

export function initTechnologyObfuscation() {
  // Only run in production or when not in development
  if (import.meta.env.NODE_ENV === 'development') {
    console.log('🔓 DLMETRIX Tech Obfuscation: Bypassed for development environment');
    return;
  }

  // Remove React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    delete window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  }

  // Remove Vite indicators
  if (window.__vite__) {
    delete window.__vite__;
  }
  if (window.__VITE_HMR_PORT__) {
    delete window.__VITE_HMR_PORT__;
  }

  // Hide framework globals
  const frameworksToHide = [
    'React', 'ReactDOM', 'Vue', 'Angular', 'jQuery', '$', 
    'Vite', 'webpack', 'Babel', 'TypeScript', 'PostCSS',
    'TailwindCSS', 'Tailwind', 'SWC', 'ESBuild'
  ];

  frameworksToHide.forEach(framework => {
    if (window[framework]) {
      try {
        Object.defineProperty(window, framework, {
          value: undefined,
          writable: false,
          enumerable: false,
          configurable: false
        });
      } catch (e) {
        // Silently fail if property can't be overridden
      }
    }
  });

  // Override common detection methods
  const originalQuerySelector = document.querySelector;
  const originalQuerySelectorAll = document.querySelectorAll;
  const originalGetElementsByTagName = document.getElementsByTagName;

  // Temporarily hide framework-specific attributes during detection scans
  const hideFrameworkAttributes = () => {
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      // Hide React-specific attributes
      if (el.hasAttribute('data-reactroot')) {
        el.removeAttribute('data-reactroot');
      }
      if (el.hasAttribute('data-react-helmet')) {
        el.removeAttribute('data-react-helmet');
      }
      
      // Hide Vite-specific attributes
      if (el.hasAttribute('data-vite-dev-id')) {
        el.removeAttribute('data-vite-dev-id');
      }
      
      // Hide common framework classes
      const classesToHide = ['react-', 'vue-', 'ng-', 'vite-', 'tailwind'];
      classesToHide.forEach(prefix => {
        if (el.className && typeof el.className === 'string') {
          try {
            const classes = el.className.split(' ');
            const filteredClasses = classes.filter(cls => !cls.startsWith(prefix));
            if (filteredClasses.length !== classes.length) {
              el.className = filteredClasses.join(' ');
            }
          } catch (e) {
            // Silently handle className errors
          }
        }
      });
    });
  };

  // Override console methods to hide framework logs
  const originalConsoleLog = console.log;
  const originalConsoleInfo = console.info;
  const originalConsoleWarn = console.warn;
  
  console.log = (...args) => {
    const message = args.join(' ');
    if (message.includes('React') || message.includes('Vite') || message.includes('HMR')) {
      return; // Hide framework logs
    }
    originalConsoleLog.apply(console, args);
  };

  console.info = (...args) => {
    const message = args.join(' ');
    if (message.includes('React') || message.includes('Vite') || message.includes('HMR')) {
      return;
    }
    originalConsoleInfo.apply(console, args);
  };

  console.warn = (...args) => {
    const message = args.join(' ');
    if (message.includes('React') || message.includes('Vite') || message.includes('HMR')) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };

  // Hide source map comments
  const hideSourceMaps = () => {
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      if (script.src && script.src.includes('.map')) {
        script.remove();
      }
    });

    const links = document.querySelectorAll('link');
    links.forEach(link => {
      if (link.href && link.href.includes('.map')) {
        link.remove();
      }
    });
  };

  // Override XMLHttpRequest to hide framework requests
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    // Block requests that could reveal technology stack
    if (url.includes('/@vite') || url.includes('__vite') || url.includes('.map')) {
      return;
    }
    return originalXHROpen.call(this, method, url, ...args);
  };

  // Override fetch to hide framework requests
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    const url = typeof input === 'string' ? input : input.url;
    if (url.includes('/@vite') || url.includes('__vite') || url.includes('.map')) {
      return Promise.reject(new Error('Request blocked'));
    }
    return originalFetch.call(this, input, init);
  };

  // Hide performance entries that reveal technology
  if (window.performance && window.performance.getEntriesByType) {
    const originalGetEntriesByType = window.performance.getEntriesByType;
    window.performance.getEntriesByType = function(type) {
      const entries = originalGetEntriesByType.call(this, type);
      return entries.filter(entry => {
        if (entry.name) {
          return !entry.name.includes('react') && 
                 !entry.name.includes('vite') && 
                 !entry.name.includes('vue') &&
                 !entry.name.includes('angular');
        }
        return true;
      });
    };
  }

  // Run cleanup functions
  hideFrameworkAttributes();
  hideSourceMaps();

  // Periodic cleanup to handle dynamic content
  setInterval(() => {
    hideFrameworkAttributes();
    hideSourceMaps();
  }, 5000);

  console.log('🔐 DLMETRIX Tech Obfuscation: Active protection enabled');
}

// Additional HTTP header obfuscation
export function setCustomHeaders() {
  // This would be implemented server-side
  return {
    'X-Powered-By': 'DLMETRIX Engine',
    'Server': 'DLM-Server/1.0',
    'X-Framework': 'Custom',
    'X-Runtime': 'DLM-Runtime',
    'X-Version': '1.0.0'
  };
}

// Remove build artifacts and development indicators
export function cleanBuildArtifacts() {
  try {
    // Remove Vite client indicators
    const viteElements = document.querySelectorAll('[data-vite-dev-id]');
    viteElements.forEach(el => {
      try {
        el.removeAttribute('data-vite-dev-id');
      } catch (e) {}
    });

    // Remove React indicators
    const reactElements = document.querySelectorAll('[data-reactroot]');
    reactElements.forEach(el => {
      try {
        el.removeAttribute('data-reactroot');
      } catch (e) {}
    });

    // Clean up class names that reveal technology - simplified and safer
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      try {
        if (el && el.className && typeof el.className === 'string') {
          // Remove technology-specific classes while preserving functionality
          el.className = el.className
            .replace(/\b(react-|vue-|ng-|vite-)\w*/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        }
      } catch (e) {
        // Skip elements that cause errors
      }
    });
  } catch (e) {
    // Silently handle any cleanup errors
  }
}