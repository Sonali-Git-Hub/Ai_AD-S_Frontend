import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './dashboard-dark.css'
import App from './App.jsx'
import { ToastProvider } from './Components/Toast/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { PersonalizationProvider } from './context/PersonalizationContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';

import ErrorBoundary from './Components/ErrorBoundary';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  || import.meta.env.AISA_GOOGLE_CLIENT_ID
  || (typeof window !== 'undefined' && window._env_?.AISA_GOOGLE_CLIENT_ID)
  || 'dummy_client_id_to_prevent_crash';

import { MotionConfig } from 'framer-motion';

const AppTree = (
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <MotionConfig transition={{ ease: [0.22, 1, 0.36, 1] }} reducedMotion="user">
          <ToastProvider>
            <PersonalizationProvider>
              <ThemeProvider>
                <LanguageProvider>
                  <App />
                </LanguageProvider>
              </ThemeProvider>
            </PersonalizationProvider>
          </ToastProvider>
        </MotionConfig>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
);

// High-performance scroll listener to optimize heavy glassmorphic effects while scrolling
let scrollTimeout;
window.addEventListener('scroll', () => {
  if (!document.documentElement.classList.contains('is-scrolling')) {
    document.documentElement.classList.add('is-scrolling');
  }
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    document.documentElement.classList.remove('is-scrolling');
  }, 150);
}, { passive: true });

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    {AppTree}
  </GoogleOAuthProvider>
);
