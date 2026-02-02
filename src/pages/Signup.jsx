import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Key, User, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AppRoute, apis } from '../types';
import axios from 'axios';
import { setUserData, userData as userDataAtom } from '../userStore/userData';
import { useSetRecoilState } from 'recoil';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
// RobotMascot import removed

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const setUserRecoil = useSetRecoilState(userDataAtom);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // Mascot Interaction states removed

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPasswordError(null);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError(t('passwordValidation'));
      setIsLoading(false);
      return;
    }

    try {
      const payLoad = { name, email, password };
      const res = await axios.post(apis.signUp, payLoad);

      setUserData(res.data);
      setUserRecoil({ user: res.data });

      navigate(AppRoute.E_Verification, { state: location.state });
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans selection:bg-cyan-100 bg-[#f8fafc] dark:bg-[#020617]">
      {/* Background Blobs for Glassmorphism Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-5%] right-[-5%] w-[50%] h-[50%] bg-cyan-400/20 dark:bg-cyan-500/10 blur-[140px] rounded-full"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] bg-purple-400/20 dark:bg-purple-500/10 blur-[140px] rounded-full"
        />
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-400/10 dark:bg-blue-600/5 blur-[160px] rounded-full"
        />
      </div>

      {/* Content Container */}
      <div className="relative w-full max-w-5xl flex flex-col items-center p-4">
        {/* Robot Mascot removed */}

        {/* SMALL FLOATING GLASS PANEL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-50 w-full max-w-[420px]"
        >
          {/* Main Glass Card */}
          <div className="relative overflow-hidden bg-white/10 dark:bg-white/[0.02] backdrop-blur-[32px] border border-white/40 dark:border-white/10 p-10 rounded-[3.5rem] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.1)] text-center ring-1 ring-white/20 transition-all hover:bg-white/20 dark:hover:bg-white/[0.04] group/card">
            {/* Glossy Reflection Effect */}
            <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] bg-gradient-to-br from-white/10 via-transparent to-transparent rotate-45 pointer-events-none transition-transform duration-1000 group-hover/card:translate-x-1/2 group-hover/card:translate-y-1/2" />

            <div className="text-center mb-10 relative">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-1.5 tracking-tighter uppercase italic">{t('createAccount')}</h2>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">{t('joinAISA')}</p>
            </div>

            <AnimatePresence mode="wait">
              {(error || passwordError) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 justify-center backdrop-blur-md"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error || passwordError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field - Glassy Style */}
              <div className="relative group">
                <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/40 rounded-2xl blur-sm transition-all group-focus-within:bg-white/50 dark:group-focus-within:bg-slate-900/60" />
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-cyan-500 transition-colors z-10" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="relative w-full bg-white/20 dark:bg-slate-800/20 border border-white/30 dark:border-white/5 rounded-2xl py-4.5 pl-14 pr-4 text-slate-700 dark:text-white placeholder-slate-400/70 focus:outline-none focus:ring-1 focus:ring-white/50 dark:focus:ring-white/10 transition-all font-medium text-sm backdrop-blur-md"
                  required
                />
              </div>

              {/* Email Field - Glassy Style */}
              <div className="relative group">
                <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/40 rounded-2xl blur-sm transition-all group-focus-within:bg-white/50 dark:group-focus-within:bg-slate-900/60" />
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-cyan-500 transition-colors z-10" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="relative w-full bg-white/20 dark:bg-slate-800/20 border border-white/30 dark:border-white/5 rounded-2xl py-4.5 pl-14 pr-4 text-slate-700 dark:text-white placeholder-slate-400/70 focus:outline-none focus:ring-1 focus:ring-white/50 dark:focus:ring-white/10 transition-all font-medium text-sm backdrop-blur-md"
                  required
                />
              </div>

              {/* Password Field - Glassy Style */}
              <div className="relative group">
                <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/40 rounded-2xl blur-sm transition-all group-focus-within:bg-white/50 dark:group-focus-within:bg-slate-900/60" />
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-cyan-500 transition-colors z-10" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Secure Password"
                  className="relative w-full bg-white/20 dark:bg-slate-800/20 border border-white/30 dark:border-white/5 rounded-2xl py-4.5 pl-14 pr-12 text-slate-700 dark:text-white placeholder-slate-400/70 focus:outline-none focus:ring-1 focus:ring-white/50 dark:focus:ring-white/10 transition-all font-medium tracking-[0.4em] text-sm backdrop-blur-md"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>

              {/* Signup Button - Vibrant Blue Style */}
              <motion.button
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 rounded-2xl font-bold text-lg text-white shadow-xl shadow-blue-600/30 transition-all duration-300 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>{t('createAccount')}</span>
                )}
              </motion.button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/10 dark:border-slate-800/50 text-center text-xs font-bold text-slate-400 tracking-wide uppercase relative">
              {t('alreadyHaveAccount')}? <Link to="/login" className="text-blue-600 hover:underline ml-1 uppercase tracking-widest font-black">{t('logIn')}</Link>
            </div>
          </div>

          <Link to="/" className="mt-12 mb-20 flex items-center justify-center gap-2 text-slate-300 hover:text-slate-500 font-black text-[10px] uppercase tracking-widest transition-all group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            {t('backToHome')}
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;