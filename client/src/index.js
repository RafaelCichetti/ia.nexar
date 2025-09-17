import React from 'react';
// Compat: tentar usar createRoot se disponível; caso contrário, usar ReactDOM.render (React 17)
import * as ReactDOMCompat from 'react-dom/client';
import * as ReactDOMLegacy from 'react-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

const container = document.getElementById('root');
if (ReactDOMCompat && typeof ReactDOMCompat.createRoot === 'function') {
  const root = ReactDOMCompat.createRoot(container);
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
} else if (ReactDOMLegacy && typeof ReactDOMLegacy.render === 'function') {
  ReactDOMLegacy.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>,
    container
  );
} else {
  throw new Error('Nenhuma API de montagem ReactDOM disponível. Verifique versões de react e react-dom.');
}
