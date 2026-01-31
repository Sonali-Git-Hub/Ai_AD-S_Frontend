import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Cpu, Mail, Lock, User, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../services/apiService';
import { AppRoute, apis } from '../types';
import axios from 'axios';
import { setUserData } from '../userStore/userData.js';
import { logo } from '../constants';
import { useLanguage } from '../context/LanguageContext';


const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [passwordError, setPasswordError] = useState(null);

  const payLoad = {
    name, email, password
  }
  const handleSubmit = (e) => {
    setIsLoading(true)
    e.preventDefault();

    // Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError(t('passwordValidation'));
      setIsLoading(false);
      return;
    }

    axios.post(apis.signUp, payLoad).then((res) => {
      setUserData(res.data)
      navigate(AppRoute.E_Verification, { state: location.state });

    }).catch((err) => {
      console.log(err);
      setError(err.response.data.error)
    }).finally(() => {
      setIsLoading(false)

    })

  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-surface">
      <div className="relative z-10 w-full max-w-md">

        {/* Title */}
        <div className=" text-center">
          <div className="inline-block rounded-full  w-25 ">
            {/* <Cpu className="w-8 h-8 text-primary" /> */}
            <img src={logo} alt="" />
          </div>
          <h2 className="text-3xl font-bold text-maintext mb-2">{t('createAccount')}</h2>
          <p className="text-subtext">{t('joinAISA')}</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border p-8 rounded-3xl shadow-xl">

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-maintext ml-1">{t('fullName')}</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-subtext" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-maintext placeholder-subtext focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-maintext ml-1">{t('emailAddress')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-subtext" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-maintext placeholder-subtext focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-maintext ml-1">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-subtext" />
                {passwordError && (
                  <div className="absolute bottom-full mb-2 left-0 w-full p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs shadow-lg z-50">
                    {passwordError}
                    <div className="absolute top-full left-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-red-200"></div>
                  </div>
                )}
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="••••••••"
                  className={`w-full bg-surface border rounded-xl py-3 pl-12 pr-12 text-maintext placeholder-subtext focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${passwordError ? 'border-red-500 focus:ring-red-500' : 'border-border'
                    }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-subtext hover:text-maintext transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary rounded-xl font-bold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('signingUp') : t('createAccount')}
            </button>
          </form>

          {/* Footer Login Link */}
          <div className="mt-8 text-center text-sm text-subtext">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t('logIn')}
            </Link>
          </div>
        </div>

        {/* Back Home */}
        <Link
          to="/"
          className="mt-8 flex items-center justify-center gap-2 text-subtext hover:text-maintext transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('backToHome')}
        </Link>
      </div>
    </div>
  );
};

export default Signup;