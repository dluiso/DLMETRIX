import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./utils/security";
import { initSimpleObfuscation, safeCleanup } from './utils/simple-obfuscation';

// Initialize simplified obfuscation (safer approach)
initSimpleObfuscation();

// Safe cleanup without complex operations
setTimeout(() => {
  safeCleanup();
}, 2000);

createRoot(document.getElementById("root")!).render(<App />);
