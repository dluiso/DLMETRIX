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

// Only run minimal obfuscation in production if explicitly enabled
if (import.meta.env.PROD && window.location.hostname === 'dlmetrix.com') {
  setTimeout(() => {
    try {
      // Only basic cleanup, nothing that could break React
      safeCleanup();
    } catch (e) {
      // Silent fail
    }
  }, 5000);
}
