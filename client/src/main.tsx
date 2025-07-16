import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./utils/security";
import { initSimpleObfuscation, safeCleanup } from './utils/simple-obfuscation';
import { initHostingObfuscation, obfuscateUserAgent, cleanStorageReferences } from './utils/hosting-obfuscation';

// Initialize React App First - Critical for proper rendering
const container = document.getElementById("root");
if (!container) throw new Error("Root container missing in index.html");

const root = createRoot(container);
root.render(<App />);

// Initialize obfuscation systems only in production
if (import.meta.env.PROD && window.location.hostname !== 'localhost') {
  setTimeout(() => {
    try {
      initSimpleObfuscation();
      initHostingObfuscation();
      obfuscateUserAgent();
    } catch (e) {
      console.error('Obfuscation init failed:', e);
    }
  }, 1000);

  // Safe cleanup and storage cleaning
  setTimeout(() => {
    try {
      safeCleanup();
      cleanStorageReferences();
    } catch (e) {
      console.error('Cleanup failed:', e);
    }
  }, 3000);
}
