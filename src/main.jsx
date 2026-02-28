import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './Components/Toast/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { PersonalizationProvider } from './context/PersonalizationContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';

import ErrorBoundary from './Components/ErrorBoundary';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <ErrorBoundary>
          <ToastProvider>
            <PersonalizationProvider>
              <ThemeProvider>
                <LanguageProvider>
                  <App />
                </LanguageProvider>
              </ThemeProvider>
            </PersonalizationProvider>
          </ToastProvider>
        </ErrorBoundary>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
