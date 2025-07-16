import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./utils/security";
import { initTechnologyObfuscation, cleanBuildArtifacts } from './utils/technology-obfuscation';
import { initAntiWappalyzer, cleanWappalyzerFootprints } from './utils/anti-wappalyzer';

// Initialize all obfuscation systems
initTechnologyObfuscation();
initAntiWappalyzer();

// Clean build artifacts and wappalyzer footprints
setTimeout(() => {
  cleanBuildArtifacts();
  cleanWappalyzerFootprints();
}, 1000);

createRoot(document.getElementById("root")!).render(<App />);
