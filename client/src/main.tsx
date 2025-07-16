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

// Initialize obfuscation systems after React renders (only in production)
setTimeout(() => {
  if (import.meta.env.NODE_ENV !== 'development') {
    initSimpleObfuscation();
    initHostingObfuscation();
    obfuscateUserAgent();
  }
}, 500);

// Safe cleanup and storage cleaning (only in production)
setTimeout(() => {
  if (import.meta.env.NODE_ENV !== 'development') {
    safeCleanup();
    cleanStorageReferences();
  }
}, 3000);
