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
if (import.meta.env.PROD) {
  setTimeout(() => {
    initSimpleObfuscation();
    initHostingObfuscation();
    obfuscateUserAgent();
  }, 500);

  // Safe cleanup and storage cleaning
  setTimeout(() => {
    safeCleanup();
    cleanStorageReferences();
  }, 3000);
}
