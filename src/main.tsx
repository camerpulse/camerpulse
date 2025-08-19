import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/poll-templates.css'
import { initializeSecurity } from './utils/cspConfig'
import { setupCSPReporting } from './utils/security'

// Initialize security configuration
initializeSecurity();

// Setup CSP violation reporting
setupCSPReporting();

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
