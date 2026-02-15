import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './ErrorBoundary';

// ⚠️ SECURITY NOTE: In a real production app, this key should ONLY exist in the backend environment variables.
// We inject it here to allow the "Mock Backend" to function in this preview environment.

(window as any).process = {
  env: {
    // Updated to user provided key
    API_KEY: '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' 
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);