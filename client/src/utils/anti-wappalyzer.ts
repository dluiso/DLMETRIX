// Anti-Wappalyzer Detection System
// Specifically designed to prevent Wappalyzer and similar tools from detecting technologies

export function initAntiWappalyzer() {
  // Only run in production
  if (import.meta.env.NODE_ENV === 'development') {
    console.log('🔓 DLMETRIX Anti-Detection: Bypassed for development');
    return;
  }

  // Remove technology-specific patterns that Wappalyzer looks for
  const obfuscatePatterns = () => {
    // Hide React patterns
    const reactElements = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
    reactElements.forEach(el => {
      el.removeAttribute('data-reactroot');
      el.removeAttribute('data-react-helmet');
    });

    // Hide Vite patterns
    const viteElements = document.querySelectorAll('[data-vite-dev-id]');
    viteElements.forEach(el => el.removeAttribute('data-vite-dev-id'));

    // Remove framework-specific script tags
    const scripts = document.querySelectorAll('script[src*="react"], script[src*="vite"], script[src*="node_modules"]');
    scripts.forEach(script => script.remove());

    // Obfuscate CSS class names that reveal frameworks
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      try {
        if (el.className && typeof el.className === 'string') {
          // Replace framework-specific class patterns
          el.className = el.className
            .replace(/\breact-\w+/g, 'dlm-component')
            .replace(/\bvite-\w+/g, 'dlm-build')
            .replace(/\btailwind/g, 'dlm-style')
            .replace(/\b(tw-|css-)\w+/g, 'dlm-util');
        }
      } catch (e) {
        // Silently handle className access errors
      }
    });
  };

  // Override document.querySelector to hide framework elements during scans
  const originalQuerySelector = document.querySelector.bind(document);
  const originalQuerySelectorAll = document.querySelectorAll.bind(document);

  document.querySelector = function(selector: string) {
    if (selector.includes('react') || selector.includes('vite') || selector.includes('data-react')) {
      return null;
    }
    return originalQuerySelector(selector);
  };

  document.querySelectorAll = function(selector: string): NodeListOf<Element> {
    if (selector.includes('react') || selector.includes('vite') || selector.includes('data-react')) {
      return document.createDocumentFragment().querySelectorAll(selector);
    }
    const result = originalQuerySelectorAll(selector);
    
    // Filter out framework elements
    const filtered = Array.from(result).filter(el => {
      const hasFrameworkAttributes = el.hasAttribute('data-reactroot') || 
                                   el.hasAttribute('data-vite-dev-id') ||
                                   (typeof el.className === 'string' && el.className.includes('react-')) ||
                                   (typeof el.className === 'string' && el.className.includes('vite-'));
      return !hasFrameworkAttributes;
    });
    
    // Return as NodeListOf<Element>
    const fragment = document.createDocumentFragment();
    filtered.forEach(el => fragment.appendChild(el.cloneNode(true)));
    return fragment.querySelectorAll('*');
  };

  // Hide technology-specific HTTP headers from client-side requests
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (init && init.headers) {
      // Remove headers that could reveal technology
      const headers = new Headers(init.headers);
      headers.delete('x-requested-with');
      headers.delete('x-framework');
      headers.delete('user-agent');
      init.headers = headers;
    }
    return originalFetch(input, init);
  };

  // Mask window properties that Wappalyzer checks
  const maskWindowProperties = () => {
    // List of properties Wappalyzer commonly checks
    const propsToMask = [
      'React', 'ReactDOM', '__REACT_DEVTOOLS_GLOBAL_HOOK__',
      'Vue', 'Angular', 'jQuery', '$',
      '__vite__', '__VITE_HMR_PORT__',
      'webpack', 'Babel', 'TypeScript'
    ];

    propsToMask.forEach(prop => {
      try {
        Object.defineProperty(window, prop, {
          value: undefined,
          writable: false,
          enumerable: false,
          configurable: false
        });
      } catch (e) {
        // Some properties might not be configurable
      }
    });

    // Add fake technology indicators (only if not already defined)
    if (!window.DLMETRIX) {
      try {
        Object.defineProperty(window, 'DLMETRIX', {
          value: { version: '2.5.0', framework: 'Custom' },
          writable: false,
          enumerable: true,
          configurable: false
        });
      } catch (e) {
        // Property might already exist
      }
    }
  };

  // Override navigator properties
  const obfuscateNavigator = () => {
    try {
      Object.defineProperty(navigator, 'userAgent', {
        value: navigator.userAgent.replace(/Chrome\/[\d.]+/, 'DLMETRIX-Browser/2.5'),
        writable: false
      });
    } catch (e) {
      // Navigator properties might not be configurable
    }
  };

  // Hide network requests that reveal technology
  const hideNetworkRequests = () => {
    // Override XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
      const urlStr = url.toString();
      // Block requests that reveal technology
      if (urlStr.includes('react') || urlStr.includes('vite') || urlStr.includes('node_modules')) {
        console.log('Blocked technology detection request:', urlStr);
        return;
      }
      return originalXHROpen.apply(this, [method, url, ...args]);
    };
  };

  // Execute all obfuscation methods
  maskWindowProperties();
  obfuscateNavigator();
  hideNetworkRequests();
  obfuscatePatterns();

  // Continuous monitoring and cleanup
  const intervalId = setInterval(() => {
    obfuscatePatterns();
    maskWindowProperties();
  }, 3000);

  // Clean up after 5 minutes (most scans happen quickly)
  setTimeout(() => {
    clearInterval(intervalId);
  }, 300000);

  console.log('🔐 DLMETRIX Anti-Detection: Wappalyzer protection active');
}

// Additional method to clean specific Wappalyzer detection vectors
export function cleanWappalyzerFootprints() {
  // Remove common technology indicators from DOM
  const indicators = [
    'script[src*="react"]',
    'script[src*="vite"]', 
    'link[href*="react"]',
    'link[href*="vite"]',
    '[data-reactroot]',
    '[data-react-helmet]',
    '[data-vite-dev-id]'
  ];

  indicators.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (el.hasAttribute('data-reactroot')) el.removeAttribute('data-reactroot');
      if (el.hasAttribute('data-react-helmet')) el.removeAttribute('data-react-helmet');
      if (el.hasAttribute('data-vite-dev-id')) el.removeAttribute('data-vite-dev-id');
      
      // For script/link tags, modify their src/href to hide technology
      if (el instanceof HTMLScriptElement && el.src) {
        if (el.src.includes('react') || el.src.includes('vite')) {
          el.src = el.src.replace(/react|vite/g, 'dlm');
        }
      }
      if (el instanceof HTMLLinkElement && el.href) {
        if (el.href.includes('react') || el.href.includes('vite')) {
          el.href = el.href.replace(/react|vite/g, 'dlm');
        }
      }
    });
  });
}