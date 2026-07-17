import React, { useEffect, useState, useRef, Fragment } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import {
  User,
  LayoutGrid,
  MessageSquare,
  Bot,
  Calendar,
  Settings2,
  LogOut,
  Zap,
  X,
  Video,
  FileText,
  Headphones,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Shield,
  Sparkles,
  ChevronRight,
  Search,
  Trash2,
  Edit2,
  Check,
  Square,
  FolderPlus,
  Folder,
  FolderOpen,
  Share2,
  Briefcase,
  Gavel,
  PlusCircle,
  Database,
  Info,
  Home,
  CreditCard,
  IndianRupee,
  Scale,
  History,
  RefreshCcw
} from 'lucide-react';
import { apis, AppRoute, API } from '../../types';
import ShareModal from '../ShareModal';
import { faqs, logo } from '../../constants';
import NotificationBar from '../NotificationBar/NotificationBar.jsx';
import { useRecoilState } from 'recoil';
import { clearUser, getUserData, setUserData, toggleState, userData, sessionsData, activeProjectIdData, activeModeData, activeLegalToolData, activeProjectsData } from '../../userStore/userData';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme, useIsDark } from '../../context/ThemeContext';
import { usePersonalization } from '../../context/PersonalizationContext';
import { Menu, Transition, Dialog } from '@headlessui/react';


import ProfileSettingsDropdown from '../ProfileSettingsDropdown/ProfileSettingsDropdown.jsx';
import { getSubscriptionDetails } from '../../services/pricingService';
import { apiService } from '../../services/apiService';
import useCreditStore from '../../userStore/useCreditStore';
import ChatSidebar from './ChatSidebar.jsx';


const Sidebar = ({ isOpen, onClose, onOpenSettings }) => {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isDark = useIsDark();
  const { addNotification } = usePersonalization();

  const getFlagUrl = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

  const navigate = useNavigate();
  const [notifiyTgl, setNotifyTgl] = useRecoilState(toggleState);
  const [currentUserData, setUserRecoil] = useRecoilState(userData);
  const user = currentUserData.user || getUserData() || { name: "Loading...", email: "...", role: "user" };
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // New States
  const [isNavigating, setIsNavigating] = useState(false);
  const [isConnectorsOpen, setIsConnectorsOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  
  // Use Global Quota/Credit Store
  const { 
    planKey,
    limits,
    usage,
    renewalDate,
    syncCredits, 
    isLoading: isCreditsLoading 
  } = useCreditStore();


  const [planName, setPlanName] = useState("Free Plan");
  const [, setProjects] = useRecoilState(activeProjectsData);

  // Magic Glow State
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const sidebarRef = useRef(null);

  const handleSidebarMouseMove = (e) => {
    if (!sidebarRef.current) return;
    const rect = sidebarRef.current.getBoundingClientRect();
    glowX.set(e.clientX - rect.left);
    glowY.set(e.clientY - rect.top);
  };

  // Check if current user is admin
  const token = getUserData()?.token || localStorage.getItem('token') || localStorage.getItem('auth_token');
  const userEmail = user?.email || getUserData()?.email;
  const isAdmin = token && userEmail === 'admin@uwo24.com';

  const issueCategories = t('issueCategories') || {};
  const issueOptions = [
    issueCategories.generalInquiry || "General Inquiry",
    issueCategories.paymentIssue || "Payment Issue",
    issueCategories.refundRequest || "Refund Request",
    issueCategories.technicalSupport || "Technical Support",
    issueCategories.accountAccess || "Account Access",
    issueCategories.other || "Other"
  ];

  const handleLogout = () => {
    localStorage.clear();
    setUserRecoil({ user: null }); // Clear Recoil state to ensure UI reacts immediately
    navigate(AppRoute.LANDING);
  };

  useEffect(() => {
    if (token) {
      axios.get(apis.user, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then((res) => {
        if (res.data) {
          const mergedData = setUserData(res.data);
          setUserRecoil({ user: mergedData });
        }
      }).catch((err) => {
        console.error(err);
        if (err.status == 401) clearUser();
      });
    }

    if (token) {
      getSubscriptionDetails().then(data => {
        if (data.founderStatus) {
          setPlanName("Founder");
        } else if (data.subscription?.planId?.planName) {
          setPlanName(data.subscription.planId.planName);
        } else {
          setPlanName("Free Plan");
        }
      }).catch(err => console.log(err));
    }
  }, [token]);

  useEffect(() => {
    if (isCreditsOpen && token) {
      syncCredits();
    }
  }, [isCreditsOpen, token]);

  // Sync credits initially and set up periodic sync
  useEffect(() => {
    if (token) {
      syncCredits();
      const interval = setInterval(syncCredits, 60000); // Every minute
      return () => clearInterval(interval);
    }
  }, [token]);

  // Fetch projects for logged-in users
  useEffect(() => {
    if (token) {
      apiService.getProjects().then(data => {
        const projectsData = Array.isArray(data) ? data : [];
        setProjects(projectsData);

        // Check for hearing reminders
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        projectsData.forEach(p => {
          if (p.isLegalCase && p.hearings) {
            p.hearings.forEach(h => {
              if (h.status !== 'Upcoming') return;
              const hDate = new Date(h.date);
              hDate.setHours(0, 0, 0, 0);

              if (hDate.getTime() === today.getTime()) {
                addNotification({
                  title: `Hearing Today: ${p.name}`,
                  desc: `Scheduled for ${h.time || 'today'} at ${h.courtName || 'Court'}.`,
                  type: 'alert'
                });
              } else if (hDate.getTime() === tomorrow.getTime()) {
                addNotification({
                  title: `Upcoming Hearing Tomorrow`,
                  desc: `Case: ${p.name}. Location: ${h.location || h.courtName || 'Scheduled Court'}.`,
                  type: 'info'
                });
              }
            });
          }
        });
      }).catch(err => console.error("Failed to fetch projects:", err));
    }
  }, [token]);






  return (
    <>
      <AnimatePresence>
        {notifiyTgl.notify && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className='fixed w-full z-10 flex justify-center items-center mt-5 ml-6'
          >
            <NotificationBar msg={"Successfully Owned"} />
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={`fixed inset-0 z-[1990] backdrop-blur-[6px] lg:hidden animate-in fade-in duration-300
            ${isDark ? 'bg-black/60' : 'bg-slate-900/40'}`}
        />
      )}

      <div
        ref={sidebarRef}
        onMouseMove={handleSidebarMouseMove}
        className={`
          fixed inset-y-0 left-0 z-[2000] w-[280px] sm:w-72 lg:w-[280px] 
          sidebar-glass flex flex-col transition-all duration-500 ease-in-out 
          lg:relative lg:translate-x-0 
          bg-white dark:bg-[#0f172a] lg:bg-transparent
          shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]
          lg:shadow-none overflow-hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >

        {/* Animated Background Glow Spots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-20 transition-opacity duration-500">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-primary/30 blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-primary/30 blur-[100px] animate-float-slow" style={{ animationDelay: '-5s' }} />
        </div>
        {/* Brand & Top Actions */}
        <div className="p-5 pb-2 mb-2 flex flex-col gap-4 relative z-10 border-b border-white/5 lg:border-none">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 flex-nowrap">
              <Link to="/" state={{ fromLogo: true }} className="group/logo flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                  <img
                    src={logo}
                    alt="AISA™"
                    className="h-8 w-auto relative z-10 transition-transform duration-500 group-hover/logo:scale-110"
                  />
                </div>
                <span className="text-lg font-black tracking-tighter whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: '"Times New Roman", Times, serif' }}>
                  AISA<span style={{ fontSize: '0.55em', verticalAlign: 'super', marginLeft: '1px' }}>TM</span>
                </span>
              </Link>

              {/* AISA/MALL Toggle - Now side-by-side */}
              <div className="flex items-center relative z-10 bg-black/5 border border-[#9333ea]/30 rounded-full p-0.5 w-fit h-7">
                <motion.div
                  className="absolute top-0.5 bottom-0.5 left-0.5 w-[46px] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.1)] z-0"
                  style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #60a5fa 100%)' }}
                  initial={false}
                  animate={{
                    x: isNavigating ? 46 : 0
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                <button
                  onClick={() => {
                    setIsNavigating(false);
                    navigate('/dashboard/chat/new');
                    if (onClose) onClose();
                  }}
                  className={`relative z-10 w-[46px] flex justify-center items-center text-[10px] font-bold transition-colors ${!isNavigating ? 'text-white' : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-[#8B5CF6]')}`}
                >
                  AISA
                </button>
                <button
                  onClick={async () => {
                    const targetUrl = (window._env_ && window._env_.VITE_AI_MALL) || import.meta.env.VITE_AI_MALL;
                    if (!targetUrl) return;
                    const sessionToken = getUserData()?.token || localStorage.getItem('token');
                    if (!sessionToken) { window.location.href = targetUrl; return; }
                    setIsNavigating(true);
                    try {
                      const { data } = await axios.post(apis.ssoGenerate, {}, { headers: { 'Authorization': `Bearer ${sessionToken}` } });
                      const base = targetUrl.endsWith('/') ? targetUrl.slice(0, -1) : targetUrl;
                      window.location.href = `${base}/dashboard/marketplace?sso_token=${encodeURIComponent(data.sso_token)}&from=aisa`;
                    } catch (err) {
                      setIsNavigating(false);
                      window.location.href = targetUrl;
                    }
                  }}
                  className={`relative z-10 w-[46px] flex justify-center items-center text-[10px] font-bold transition-colors ${isNavigating ? 'text-white' : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-[#8B5CF6]')}`}
                >
                  MALL
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`lg:hidden w-7 h-7 flex items-center justify-center rounded-lg transition-all border shadow-sm active:scale-95 shrink-0
                ${isDark
                  ? 'text-subtext hover:text-white bg-white/5 hover:bg-white/10 border-white/10'
                  : 'text-slate-500 hover:text-primary bg-slate-100 hover:bg-slate-200 border-slate-200'}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>


        {/* Chat History Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatSidebar
            onClose={onClose}
            token={token}
            isAdmin={isAdmin}
          />
        </div>

        {/* Bottom Utils */}
        <div className="px-4 py-4 border-t border-white/5 relative z-20">
          {isAdmin && (
            <button
              onClick={() => { navigate('/dashboard/admin'); onClose(); }}
              className="w-full h-10 flex items-center justify-center gap-2 mb-5 rounded-xl text-primary bg-primary/10 hover:bg-primary/20 transition-all text-[12px] font-black uppercase tracking-widest border border-primary/20 active:scale-95"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t('admin')}</span>
            </button>
          )}

          <div className={`grid ${token ? 'grid-cols-3' : 'grid-cols-2'} gap-1 px-1`}>
            {token ? (
              <>
                <button
                  onClick={() => setIsConnectorsOpen(true)}
                  className="flex flex-col items-center gap-2 transition-all active:scale-95 group/fbtn"
                >
                  <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/10 transition-all hover:bg-primary/30 hover:scale-110 active:scale-90 shadow-sm">
                    <LayoutGrid className="w-4 h-4 text-primary transition-colors" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] whitespace-nowrap break-normal font-black text-primary/70 uppercase tracking-tighter group-hover/fbtn:text-primary transition-colors">Connectors</span>
                </button>

                <button
                  onClick={() => setIsCreditsOpen(true)}
                  className="flex flex-col items-center gap-2 transition-all active:scale-95 group/fbtn"
                >
                  <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/10 transition-all hover:bg-primary/30 hover:scale-110 active:scale-90 shadow-sm">
                    <CreditCard className="w-4 h-4 text-primary transition-colors" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] whitespace-nowrap break-normal font-black text-primary/70 uppercase tracking-tighter group-hover/fbtn:text-primary transition-colors">Plan</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/pricing')}
                className="flex flex-col items-center gap-2 transition-all active:scale-95 group/fbtn"
              >
                <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/10 transition-all hover:bg-primary/30 hover:scale-110 active:scale-90 shadow-sm">
                  <IndianRupee className="w-4 h-4 text-primary transition-colors" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] whitespace-nowrap break-normal font-black text-primary/70 uppercase tracking-tighter group-hover/fbtn:text-primary transition-colors">Pricing</span>
              </button>
            )}

            <button
              onClick={onOpenSettings}
              className="flex flex-col items-center gap-2 transition-all active:scale-95 group/fbtn"
            >
              <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/10 transition-all hover:bg-primary/30 hover:scale-110 active:scale-90 shadow-sm">
                <Settings2 className="w-4 h-4 text-primary transition-colors" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] whitespace-nowrap break-normal font-black text-primary/70 uppercase tracking-tighter group-hover/fbtn:text-primary transition-colors">Settings</span>
            </button>
          </div>
        </div>
      </div>




      {/* Credits Modal (Plan & Quotas) */}
      <Transition appear show={isCreditsOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[2000]" onClose={() => setIsCreditsOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 p-8 text-left align-middle shadow-2xl transition-all border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-maintext">Plan & Quotas</h3>
                    <button onClick={() => setIsCreditsOpen(false)} className="text-subtext hover:text-maintext p-1 rounded-lg hover:bg-black/5 transition-all"><X size={20} /></button>
                  </div>
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{t('currentPlan')}</h4>
                      <h2 className="text-3xl font-black mb-4">{planName.replace(' Plan', '')}</h2>
                      
                      {renewalDate && (
                        <p className="text-xs text-subtext mb-4 font-semibold">
                          Renewal/Expiry: {new Date(renewalDate).toLocaleDateString()}
                        </p>
                      )}

                      <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/20 space-y-3">
                        <h4 className="text-[10px] font-bold text-subtext uppercase tracking-widest border-b border-white/10 pb-1.5">Usage & Quotas</h4>
                        
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-subtext">Chat:</span>
                          <span className="font-black text-maintext">
                            {limits?.chat === -1 ? 'Unlimited' : `${usage?.chat || 0} / ${limits?.chat || 100} msgs`}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-subtext">AI Images:</span>
                          <span className="font-black text-maintext">
                            {limits?.images === 0 ? 'Not Included' : `${usage?.images || 0} / ${limits?.images || 0} per day`}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-subtext">AI Carousels:</span>
                          <span className="font-black text-maintext">
                            {limits?.carousels === 0 ? 'Not Included' : `${usage?.carousels || 0} / ${limits?.carousels || 0} per day`}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-subtext">AI Videos:</span>
                          <span className="font-black text-maintext">
                            {limits?.videos === 0 ? 'Not Included' : `${usage?.videos || 0} / ${limits?.videos || 0} per day`}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-subtext">Image Editing:</span>
                          <span className={`font-black uppercase text-[10px] ${limits?.editImage ? 'text-green-500' : 'text-subtext'}`}>
                            {limits?.editImage ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-subtext">CashFlow:</span>
                          <span className={`font-black uppercase text-[10px] ${limits?.cashflow ? 'text-green-500' : 'text-subtext'}`}>
                            {limits?.cashflow ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-center">
                        <button onClick={() => { window.location.href = '/pricing'; }} className="w-full py-2 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all">Upgrade Plan</button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Plan Rules & Reset</h4>
                      <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-border/50 text-xs text-subtext space-y-2">
                        <p>• Daily quotas (images, carousels, videos) reset every day at midnight IST.</p>
                        <p>• Free tier chat limit of 100 messages is a lifetime total cap across all your sessions.</p>
                        <p>• Premium plans unlock features like high-definition visual models, image editing, and CashFlow.</p>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Connectors Modal */}
      <Transition appear show={isConnectorsOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[2000]" onClose={() => setIsConnectorsOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 text-left align-middle shadow-2xl transition-all border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-maintext">Apps & Connectors</h3>
                    <button onClick={() => setIsConnectorsOpen(false)} className="text-subtext hover:text-maintext p-1 rounded-lg hover:bg-black/5 transition-all"><X size={20} /></button>
                  </div>
                  <div className="space-y-6">
                    {(() => {
                      const gmailApp = user?.personalizations?.apps?.find(a => a.name === 'Gmail');
                      return (
                        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${gmailApp ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
                          <div className="flex items-center justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#1E2438] border border-border flex items-center justify-center shadow-sm shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-8 h-8">
                                  <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z" />
                                  <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z" />
                                  <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17" />
                                  <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0 C4.924,8,3,9.924,3,12.298z" />
                                  <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0 C43.076,8,45,9.924,45,12.298z" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm truncate">Gmail</h4>
                                <p className="text-[10px] text-subtext truncate" title={gmailApp ? (gmailApp.tokens?.email_address || 'Connected') : 'Connect your Gmail'}>
                                  {gmailApp ? (gmailApp.tokens?.email_address || 'Connected') : 'Connect your Gmail'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={async () => {
                                if (gmailApp) {
                                  // Disconnect
                                  const tid = toast.loading("Disconnecting...");
                                  try {
                                    await axios.delete(`${API}/connectors/gmail/disconnect`, { headers: { Authorization: `Bearer ${token}` } });
                                    const updatedUser = { ...user, personalizations: { ...user.personalizations, apps: user.personalizations.apps.filter(a => a.name !== 'Gmail') } };
                                    setUserRecoil({ user: updatedUser });
                                    toast.success("Disconnected!", { id: tid });
                                  } catch (e) { toast.error("Failed", { id: tid }); }
                                } else {
                                  // Connect
                                  try {
                                    const res = await axios.get(`${API}/connectors/gmail/auth`, { headers: { Authorization: `Bearer ${token}` } });
                                    if (res.data.url) window.location.href = res.data.url;
                                  } catch (e) { toast.error("Failed to initiate"); }
                                }
                              }}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all shrink-0 whitespace-nowrap ${gmailApp ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-primary text-white hover:opacity-90'}`}
                            >
                              {gmailApp ? 'Disconnect' : 'Connect'}
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="rounded-2xl border border-dashed border-primary/20 p-5 text-center opacity-60">
                      <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">More coming soon</p>
                      <p className="text-[9px] text-subtext mt-1">Drive · Notion · Slack · Calendar</p>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

    </>
  );
};

export default Sidebar;
