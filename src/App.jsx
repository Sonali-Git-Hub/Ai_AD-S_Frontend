import './App.css'
import NavigationProvider from './Navigation.Provider'
import { RecoilRoot, useSetRecoilState } from 'recoil'
import { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import axios from 'axios'
import toast from 'react-hot-toast'
import { clearUser, userData } from './userStore/userData'

// Global Interceptor for Session Management
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (error.response.data?.code === 'SESSION_REVOKED') {
        toast.error("Security Alert: You have been logged out remotely.");
        clearUser();
        // Force refresh to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * SSOHandler — mounted inside <RecoilRoot> so it can access Recoil atoms.
 *
 * Detects ?sso_token=...&from=... on the URL (set by the AIMALL toggle),
 * calls the AISA backend to exchange it for a local AISA JWT,
 * stores it in localStorage, hydrates Recoil state, and cleans the URL.
 */
function SSOHandler() {
  const setUserRecoil = useSetRecoilState(userData);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get('sso_token');
    const from = params.get('from');

    if (!ssoToken) return;

    // Strip the sensitive token from the URL immediately
    window.history.replaceState({}, '', window.location.pathname);

    const API =
      import.meta.env.VITE_AISA_BACKEND_API ||
      (window._env_ && window._env_.VITE_AISA_BACKEND_API) ||
      'http://localhost:8080/api';

    axios
      .post(`${API}/auth/sso-handoff`, { sso_token: ssoToken, from: from || 'unknown' })
      .then((res) => {
        if (res.data.token && res.data.user) {
          localStorage.setItem('token', res.data.token);
          setUserRecoil({ user: res.data.user });
          console.log('[SSO] ✅ Auto-logged in to AISA via SSO from', from);
        }
      })
      .catch((err) => {
        console.error('[SSO] Handoff failed:', err.response?.data || err.message);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-quint',
    })
  }, [])

  return (
    <RecoilRoot>
      <SSOHandler />
      <NavigationProvider />
    </RecoilRoot>
  )
}

export default App

