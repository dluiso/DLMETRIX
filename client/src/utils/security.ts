// Security utilities for protecting source code inspection
export class SecurityProtection {
  private static instance: SecurityProtection;
  private devToolsOpen = false;
  private debuggerTrap = false;

  constructor() {
    this.initProtection();
  }

  static getInstance(): SecurityProtection {
    if (!SecurityProtection.instance) {
      SecurityProtection.instance = new SecurityProtection();
    }
    return SecurityProtection.instance;
  }

  private initProtection(): void {
    // Skip protection in development environment
    if (window.location.hostname === 'localhost' || 
        window.location.hostname.includes('replit') ||
        window.location.hostname.includes('127.0.0.1') ||
        (window as any).__DEVELOPMENT__) {
      console.log('%c🔓 DLMETRIX Security: Development mode detected - protection disabled', 
        'color: orange; font-size: 14px; font-weight: bold;');
      return;
    }

    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Disable common keyboard shortcuts for dev tools
    document.addEventListener('keydown', (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+A, Ctrl+P
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'a') ||
        (e.ctrlKey && e.key === 'p') ||
        (e.key === 'F1' || e.key === 'F3' || e.key === 'F5')
      ) {
        e.preventDefault();
        this.showWarning();
        return false;
      }
    });

    // Detect dev tools
    this.detectDevTools();
    
    // Clear console periodically
    this.clearConsole();
    
    // Disable text selection
    this.disableTextSelection();

    // Obfuscate source detection
    this.addAntiDebugging();
  }

  private detectDevTools(): void {
    const threshold = 160;
    
    const detectSize = () => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!this.devToolsOpen) {
          this.devToolsOpen = true;
          this.handleDevToolsDetected();
        }
      } else {
        this.devToolsOpen = false;
      }
    };

    // Check every 500ms
    setInterval(detectSize, 500);

    // Alternative detection method
    const devtools = {
      open: false,
      orientation: null
    };

    const setDevToolsOpen = (state: boolean) => {
      devtools.open = state;
      if (state) {
        this.handleDevToolsDetected();
      }
    };

    setInterval(() => {
      if (window.devtools) {
        setDevToolsOpen(true);
      }
    }, 500);
  }

  private handleDevToolsDetected(): void {
    // Clear the page content
    document.body.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: #1f2937;
        color: white;
        font-family: Arial, sans-serif;
        text-align: center;
        flex-direction: column;
      ">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">🔒 Access Restricted</h1>
        <p style="font-size: 1.2rem; margin-bottom: 1rem;">Developer tools are not allowed on this application.</p>
        <p style="font-size: 1rem; color: #9ca3af;">Please close developer tools and refresh the page.</p>
        <button onclick="window.location.reload()" style="
          margin-top: 2rem;
          padding: 1rem 2rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
        ">Reload Page</button>
      </div>
    `;
  }

  private showWarning(): void {
    // Create a temporary warning overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      font-family: Arial, sans-serif;
      text-align: center;
    `;
    
    overlay.innerHTML = `
      <div>
        <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">⚠️ Action Not Allowed</h2>
        <p>This action is restricted for security purposes.</p>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 2000);
  }

  private clearConsole(): void {
    // Don't interfere with development environment
    if (window.location.hostname === 'localhost' || 
        window.location.hostname.includes('replit') ||
        window.location.hostname.includes('127.0.0.1') ||
        (window as any).__DEVELOPMENT__) {
      return;
    }

    const clearInterval = setInterval(() => {
      if (typeof console.clear === 'function') {
        console.clear();
      }
      console.log('%c🔒 DLMETRIX - Unauthorized access attempt detected', 
        'color: red; font-size: 20px; font-weight: bold;');
    }, 1000);

    // Store interval for cleanup if needed
    (window as any).__clearInterval = clearInterval;
  }

  private disableTextSelection(): void {
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);
  }

  private addAntiDebugging(): void {
    // Anti-debugging techniques
    setInterval(() => {
      debugger;
    }, 100);

    // Override toString methods
    const originalToString = Function.prototype.toString;
    Function.prototype.toString = function() {
      if (this === SecurityProtection.getInstance) {
        return 'function() { [native code] }';
      }
      return originalToString.call(this);
    };

    // Disable save page functionality
    window.addEventListener('beforeunload', (e) => {
      e.preventDefault();
      e.returnValue = '';
    });

    // Override print functionality
    window.print = () => {
      this.showWarning();
    };
  }

  // Method to temporarily disable protection for legitimate users
  public temporaryDisable(password: string): boolean {
    const correctPassword = 'DLMETRIX_ADMIN_2025';
    if (password === correctPassword) {
      // Disable protection for 5 minutes
      const disableTime = 5 * 60 * 1000;
      (window as any).__securityDisabled = true;
      
      setTimeout(() => {
        (window as any).__securityDisabled = false;
        window.location.reload();
      }, disableTime);
      
      return true;
    }
    return false;
  }
}

// Initialize protection when module loads (only in production)
if (typeof window !== 'undefined' && 
    !(window as any).__securityDisabled &&
    window.location.hostname !== 'localhost' && 
    !window.location.hostname.includes('replit') &&
    !window.location.hostname.includes('127.0.0.1')) {
  SecurityProtection.getInstance();
} else if (typeof window !== 'undefined') {
  console.log('%c🔓 DLMETRIX Security: Protection bypassed for development environment', 
    'color: green; font-size: 14px; font-weight: bold;');
}