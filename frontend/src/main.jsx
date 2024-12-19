import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './components/AuthContext'; // Ensure the correct path to AuthContext

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> {/* Wrapping App with AuthProvider */}
      <App />
    </AuthProvider>
  </StrictMode>
);
