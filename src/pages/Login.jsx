import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Key, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { apis, AppRoute } from '../types';
import { setUserData, userData as userDataAtom } from '../userStore/userData';
import { useSetRecoilState } from 'recoil';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

import loginBg from './login_bg.gif';


const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const setUserRecoil = useSetRecoilState(userDataAtom);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    setError(false);

    try {
      const payload = { email, password };
      const res = await axios.post(apis.logIn, payload);

      toast.success(t('successLogin'));
      const from = location.state?.from || AppRoute.DASHBOARD;

      setUserData(res.data);
      setUserRecoil({ user: res.data });
      localStorage.setItem("userId", res.data.id);
      localStorage.setItem("token", res.data.token);

      navigate(from, { replace: true });
    } catch (err) {
      setError(true);
      const errorMessage = err.response?.data?.error || err.message || t('serverError');
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#f8fafc] dark:bg-[#020617] aisa-scalable-text">
      {/* Top Background GIF - Robot */}
      <div className="absolute top-0 left-0 w-full h-[45vh] pointer-events-none overflow-hidden z-0 flex justify-center items-center">
        <img
          src={loginBg}
          alt=""
          className="h-full object-contain opacity-[1] brightness-110 scale-[0.85]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f8fafc]/5 dark:via-[#020617]/5 to-[#f8fafc] dark:to-[#020617]" />
      </div>

      {/* Background Blobs - STATIC */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden text-black dark:text-white">
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-primary/20 dark:bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary/20 dark:bg-primary/10 blur-[100px] rounded-full" />
      </div>

      {/* Content Container - Centered and Compact */}
      <div className="relative w-full max-w-[400px] flex flex-col items-center pt-[20vh] z-50">
        {/* Main Glass Card */}
        <div className="relative w-full overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-[64px] border border-white/60 dark:border-white/10 p-6 rounded-[2rem] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.12)] text-center ring-1 ring-white/30 group/card">
          {/* Glossy Reflection Effect */}
          <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] bg-gradient-to-br from-white/10 via-transparent to-transparent rotate-45 pointer-events-none" />

          <div className="text-center mb-6 relative">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1 tracking-tighter uppercase">{t('welcomeBack')}</h2>
            <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">{t('signInToContinue')}</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 justify-center"
              >
                <AlertCircle className="w-3 h-3" />
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-white/20 dark:bg-slate-800/20 border border-white/30 dark:border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-slate-700 dark:text-white placeholder-slate-400/70 focus:outline-none transition-all font-medium text-xs backdrop-blur-md"
                required
              />
            </div>

            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-white/20 dark:bg-slate-800/20 border border-white/30 dark:border-white/5 rounded-xl py-3.5 pl-11 pr-11 text-slate-700 dark:text-white placeholder-slate-400/70 focus:outline-none transition-all font-medium text-xs tracking-[0.3em] backdrop-blur-md"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 transition-colors z-10"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary rounded-xl font-bold text-sm text-white shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "LOGIN"
              )}
            </motion.button>
          </form>

          <div className="mt-4">
            <Link to="/forgot-password" opacity={0.6} className="text-[9px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors uppercase tracking-widest">
              Forgot Password?
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 dark:border-slate-800/50 text-[10px] font-bold text-slate-400 tracking-wide uppercase">
            No account? <Link to="/signup" className="text-primary hover:underline ml-1 uppercase font-black">Create Now</Link>
          </div>
        </div>

        <Link to="/" className="mt-6 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-[9px] uppercase tracking-widest transition-all">
          <ArrowLeft className="w-3 h-3" />
          {t('backToHome')}
        </Link>
      </div>
    </div>
  );
};

export default Login;