import React, { useEffect, useState, useRef } from 'react';
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
  Bell,
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
  FolderPlus,
  Folder,
  FolderOpen
} from 'lucide-react';
import { apis, AppRoute } from '../../types';
import { faqs } from '../../constants';
import NotificationBar from '../NotificationBar/NotificationBar.jsx';
import { useRecoilState } from 'recoil';
import { clearUser, getUserData, setUserData, toggleState, userData, sessionsData, activeProjectIdData } from '../../userStore/userData';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { chatStorageService } from '../../services/chatStorageService';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProfileSettingsDropdown from '../ProfileSettingsDropdown/ProfileSettingsDropdown.jsx';
import { getSubscriptionDetails } from '../../services/pricingService';
import FaqModal from '../FaqModal.jsx';
import apiService from '../../services/apiService';
import DeleteConfirmModal from '../DeleteConfirmModal.jsx';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const getFlagUrl = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

  const navigate = useNavigate();
  const [notifiyTgl, setNotifyTgl] = useRecoilState(toggleState);
  const [currentUserData, setUserRecoil] = useRecoilState(userData);
  const user = currentUserData.user || getUserData() || { name: "Loading...", email: "...", role: "user" };
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [sessions, setSessions] = useRecoilState(sessionsData);
  const { sessionId } = useParams();
  const [currentSessionId, setCurrentSessionId] = useState(sessionId || 'new');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [planName, setPlanName] = useState("Free Plan");

  // --- Project State ---
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useRecoilState(activeProjectIdData);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [renameProjectName, setRenameProjectName] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
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
  const token = getUserData()?.token;
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

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(apis.notifications, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setNotifications(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Notifications fetch failed", err);
      }
    };

    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5 * 60 * 1000);

      getSubscriptionDetails().then(data => {
        if (data.founderStatus) {
          setPlanName("Founder");
        } else if (data.subscription?.planId?.planName) {
          setPlanName(data.subscription.planId.planName);
        } else {
          setPlanName("Free Plan");
        }
      }).catch(err => console.log(err));

      return () => clearInterval(interval);
    }
  }, [token]);

  // Fetch projects for logged-in users
  useEffect(() => {
    if (token) {
      apiService.getProjects().then(data => {
        setProjects(Array.isArray(data) ? data : []);
      }).catch(err => console.error("Failed to fetch projects:", err));
    }
  }, [token]);

  // Fetch chat sessions — re-fetch when projectId changes
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await chatStorageService.getSessions(currentProjectId);
        setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      }
    };
    fetchSessions();
  }, [token, sessionId, setSessions, currentProjectId]);

  useEffect(() => {
    setCurrentSessionId(sessionId || 'new');
  }, [sessionId]);

  // Persist currentProjectId to localStorage
  useEffect(() => {
    if (currentProjectId) {
      localStorage.setItem('currentProjectId', currentProjectId);
    } else {
      localStorage.removeItem('currentProjectId');
    }
  }, [currentProjectId]);

  const handleNewChat = () => {
    navigate('/dashboard/chat/new');
    onClose();
  };

  const handleDeleteSession = async (e, sessionIdToDelete) => {
    e.stopPropagation();
    try {
      await chatStorageService.deleteSession(sessionIdToDelete);
      const updatedSessions = await chatStorageService.getSessions(currentProjectId);
      setSessions(updatedSessions);
      if (currentSessionId === sessionIdToDelete) {
        navigate('/dashboard/chat/new');
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const startRename = (e, session) => {
    e.stopPropagation();
    setEditingSessionId(session.sessionId);
    setNewTitle(session.title || "New Chat");
  };

  const handleRename = async (e, sessionId) => {
    e.stopPropagation();
    if (!newTitle.trim()) {
      setEditingSessionId(null);
      return;
    }

    const oldSessions = Array.isArray(sessions) ? [...sessions] : [];
    const renamedTitle = newTitle.trim();

    setSessions(prev => (Array.isArray(prev) ? prev : []).map(s =>
      s.sessionId === sessionId
        ? { ...s, title: renamedTitle, lastModified: Date.now() }
        : s
    ).sort((a, b) => b.lastModified - a.lastModified));

    try {
      const success = await chatStorageService.updateSessionTitle(sessionId, renamedTitle);
      if (success) {
        toast.success("Chat renamed");
      } else {
        throw new Error("Failed to sync rename to server");
      }
    } catch (err) {
      console.error("Rename failed:", err);
      toast.error("Could not rename chat on server");
      setSessions(oldSessions);
    } finally {
      setEditingSessionId(null);
    }
  };

  // --- Project Handlers ---
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      const project = await apiService.createProject(newProjectName.trim());
      setProjects(prev => [project, ...prev]);
      setCurrentProjectId(project._id);
      setNewProjectName('');
      setIsCreatingProject(false);
      toast.success(`Project "${project.name}" created!`);
      navigate('/dashboard/chat/new');
    } catch (err) {
      console.error("Failed to create project:", err);
      toast.error("Failed to create project");
    }
  };

  const handleRenameProject = async (e, projectId) => {
    e.stopPropagation();
    if (!renameProjectName.trim()) {
      setEditingProjectId(null);
      return;
    }

    try {
      const updated = await apiService.renameProject(projectId, renameProjectName.trim());
      setProjects(prev => prev.map(p => p._id === projectId ? { ...p, name: updated.name } : p));
      toast.success("Project renamed successfully");
    } catch (error) {
      console.error("Failed to rename project:", error);
      toast.error("Failed to rename project");
    } finally {
      setEditingProjectId(null);
    }
  };

  const handleDeleteProject = (e, projectId) => {
    e.stopPropagation();
    setProjectToDelete(projectId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      await apiService.deleteProject(projectToDelete);
      setProjects(prev => prev.filter(p => p._id !== projectToDelete));
      if (currentProjectId === projectToDelete) {
        handleSwitchProject(null);
      }
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project");
    } finally {
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleSwitchProject = (projectId) => {
    setCurrentProjectId(projectId);
    navigate('/dashboard/chat/new');
  };

  const currentProject = projects.find(p => p._id === currentProjectId);

  if (notifiyTgl.notify) {
    setTimeout(() => {
      setNotifyTgl(prev => ({ ...prev, notify: false }));
    }, 2000);
  }

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium border border-transparent ${isActive
      ? 'bg-primary/10 text-primary border-primary/10'
      : 'text-subtext hover:bg-surface hover:text-maintext'
    }`;

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
        <div
          className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      <div
        ref={sidebarRef}
        onMouseMove={handleSidebarMouseMove}
        className={`
          fixed inset-y-0 left-0 z-[100] w-[280px] sm:w-72 lg:w-64 
          sidebar-glass flex flex-col transition-all duration-500 ease-in-out 
          lg:relative lg:translate-x-0 
          shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]
          lg:shadow-none overflow-hidden group
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Interactive Mouse Glow Tracker */}
        <motion.div 
          className="absolute w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ x: useSpring(glowX, { damping: 20, stiffness: 100 }), y: useSpring(glowY, { damping: 20, stiffness: 100 }), left: '-150px', top: '-150px' }}
        />

        {/* Animated Background Glow Spots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-20 transition-opacity duration-500 group-hover:opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-primary/20 blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 blur-[100px] animate-float-slow" style={{ animationDelay: '-5s' }} />
        </div>
        {/* Brand & Top Actions */}
        <div className="p-6 pb-2 flex items-center justify-between relative z-10">
          <Link to="/" state={{ fromLogo: true }} className="group/logo flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse opacity-0 group-hover/logo:opacity-100 transition-opacity" />
              <img 
                 src={"/logo/Logo.svg"} 
                alt="AISA" 
                className="h-10 w-auto relative z-10 transition-transform duration-500 group-hover/logo:scale-110 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
              />
            </div>
            <span className="text-xl font-black text-maintext tracking-tighter group-hover/logo:text-primary transition-colors">AISA <span className="text-primary">™</span></span>
          </Link>
          
          <button
            onClick={onClose}
            className={`lg:hidden p-2.5 rounded-2xl transition-all border shadow-sm active:scale-95
              ${theme === 'dark' 
                ? 'text-subtext hover:text-white bg-white/5 hover:bg-white/10 border-white/10' 
                : 'text-slate-500 hover:text-primary bg-slate-100 hover:bg-slate-200 border-slate-200'}`}
          >
            <X className="w-5.5 h-5.5" />
          </button>
        </div>


        {/* Chat History Section */}
        <div className="flex-1 flex flex-col overflow-hidden">


          <AnimatePresence>
            {isCreatingProject && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setIsCreatingProject(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 w-full max-w-sm p-6"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                      <FolderPlus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-maintext">New Project</h3>
                      <p className="text-xs text-subtext">Organize your chats by project</p>
                    </div>
                  </div>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Project name..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateProject();
                      if (e.key === 'Escape') setIsCreatingProject(false);
                    }}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-subtext/50 text-maintext"
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setIsCreatingProject(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-subtext hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateProject}
                      disabled={!newProjectName.trim()}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Create
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>


          {/* Search Bar */}
          <div className="px-5 pt-4 relative z-10">
            <div className="relative group/search">
              <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-focus-within/search:opacity-100 transition-opacity pointer-events-none" />
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-subtext/60' : 'text-slate-500'} group-focus-within/search:text-primary group-focus-within/search:scale-110 transition-all duration-300`} />
              <input
                type="text"
                placeholder="Find a session..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full backdrop-blur-3xl border focus:ring-[6px] rounded-[20px] py-3 pl-11 pr-4 text-sm outline-none transition-all font-semibold shadow-sm 
                  ${theme === 'dark' 
                    ? 'bg-black/40 border-white/10 focus:border-primary/50 focus:bg-black/60 focus:ring-primary/10 placeholder:text-subtext/40 text-white' 
                    : 'bg-white/80 border-slate-200 focus:border-primary/40 focus:bg-white focus:ring-primary/10 placeholder:text-slate-500 text-slate-900 shadow-inner'}`}
              />
            </div>
          </div>

          {/* New Chat Button */}
          <div className="px-5 pt-4 pb-2 relative z-10">
            <button
              onClick={handleNewChat}
              className={`w-full relative overflow-hidden group p-[1px] rounded-[14px] transition-all duration-500 hover:scale-[1.03] active:scale-[0.97]
                ${theme === 'dark' 
                  ? 'bg-primary shadow-[0_8px_20px_rgba(var(--primary),0.3)] hover:shadow-[0_12px_30px_rgba(var(--primary),0.5)]' 
                  : 'bg-primary shadow-[0_6px_15px_rgba(var(--primary),0.2)] hover:shadow-[0_10px_20px_rgba(var(--primary),0.3)]'}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-primary to-purple-600 animate-gradient bg-[length:300%_auto]" />
              <div className={`relative flex items-center justify-center gap-2 px-4 py-2.5 backdrop-blur-md rounded-[13px] group-hover:bg-transparent transition-all duration-500
                ${theme === 'dark' ? 'bg-[#0a0c1a]/80' : 'bg-white/10'}`}>
                <Plus className="w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-700" strokeWidth={3} />
                <span className="font-extrabold text-white text-[13px] tracking-wide">{t('newChat')}</span>
              </div>
            </button>
          </div>

          {/* Personal Space & Projects Section */}
          {token && (
            <div className="flex flex-col">

              {/* Personal Chat - Standalone Top Space */}
              <div className="px-3 pt-1">
                <button
                  onClick={() => handleSwitchProject(null)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all border ${!currentProjectId
                    ? 'bg-primary/10 text-primary border-primary/20 shadow-md ring-1 ring-primary/20'
                    : 'bg-white/20 dark:bg-white/5 border-white/20 dark:border-white/10 hover:bg-white/30 dark:hover:bg-white/10 text-maintext'}`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="truncate font-semibold text-sm">Personal Chat</span>
                </button>
              </div>

              {/* Projects Section Header */}
              <div
                onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                className="px-5 pt-4 pb-2 flex items-center justify-between cursor-pointer group/header select-none relative z-10"
              >
                <div className="flex items-center gap-2">
                  <h3 className={`text-[11px] font-bold uppercase tracking-[0.1em] group-hover/header:text-primary transition-colors 
                    ${theme === 'dark' ? 'text-subtext/60' : 'text-slate-600'}`}>Projects</h3>
                  <div className={`h-[1px] w-8 transition-all group-hover/header:w-12 group-hover/header:bg-primary/30 
                    ${theme === 'dark' ? 'bg-subtext/20' : 'bg-slate-300'}`}></div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-subtext/40 transition-transform duration-300 ${isProjectsExpanded ? '' : '-rotate-90'}`} />
              </div>

              <AnimatePresence>
                {isProjectsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "circOut" }}
                    className="space-y-1 relative z-10"
                  >
                    {/* New Project Integrated Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsCreatingProject(true); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all group/newproj ${theme === 'dark' ? 'text-subtext/70 hover:bg-white/5 hover:text-maintext' : 'text-slate-600 hover:bg-black/5 hover:text-slate-900'}`}
                    >
                      <FolderPlus className="w-4 h-4 shrink-0 group-hover/newproj:scale-110 group-hover/newproj:text-primary transition-all" />
                      <span className="truncate font-medium text-[14px]">New project</span>
                    </button>

                    {projects.length>0 && projects.map((p, idx) => (
                      <motion.div 
                        key={p._id} 
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative group/proj flex items-center"
                      >
                        {editingProjectId === p._id ? (
                          <div className="flex w-full items-center gap-2 px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              autoFocus
                              value={renameProjectName}
                              onChange={e => setRenameProjectName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleRenameProject(e, p._id); if (e.key === 'Escape') setEditingProjectId(null); }}
                              className="flex-1 min-w-0 bg-transparent border-b border-primary outline-none text-xs text-maintext py-1"
                            />
                            <button onClick={(e) => handleRenameProject(e, p._id)} className="text-primary hover:opacity-80 shrink-0"><Check className="w-4 h-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); setEditingProjectId(null); }} className="text-subtext hover:text-red-500 shrink-0"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleSwitchProject(p._id)}
                              className={`flex-1 flex items-center min-w-0 gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${currentProjectId === p._id
                                ? 'bg-primary/10 text-primary font-bold shadow-sm'
                                : 'text-subtext hover:bg-white/20 dark:hover:bg-white/10 hover:text-maintext'}`}
                            >
                              <Folder className={`w-4 h-4 shrink-0 transition-transform duration-300 ${currentProjectId === p._id ? 'scale-110 text-primary ring-4 ring-primary/10 rounded-full' : 'group-hover/proj:scale-110'}`} />
                              <span className="truncate font-medium text-[14px] text-left pr-8">{p.name}</span>
                            </button>
                            <div className="absolute right-2 opacity-0 group-hover/proj:opacity-100 flex items-center gap-1 transition-all duration-300 translate-x-2 group-hover/proj:translate-x-0">
                              <button onClick={(e) => { e.stopPropagation(); setEditingProjectId(p._id); setRenameProjectName(p.name); }} className="p-1.5 text-subtext hover:text-primary transition-all bg-white/10 rounded-lg border border-white/5 shadow-sm">
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button onClick={(e) => handleDeleteProject(e, p._id)} className="p-1.5 text-subtext hover:text-red-500 transition-all bg-white/10 rounded-lg border border-white/5 shadow-sm">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Chat Sessions List */}
          <div className="flex-1 overflow-y-auto px-5 space-y-1 relative z-10 custom-scrollbar mt-2">
            {(token || (Array.isArray(sessions) && sessions.length > 0)) ? (
              <>
                <div className="px-1 py-4 flex items-center justify-between">
                  <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-subtext/40' : 'text-slate-500'}`}>Activity Log</h3>
                  <div className={`h-[1px] flex-1 ml-4 ${theme === 'dark' ? 'bg-gradient-to-r from-subtext/10 to-transparent' : 'bg-gradient-to-r from-slate-300 to-transparent'}`}></div>
                </div>

                {(Array.isArray(sessions) ? sessions : [])
                  .filter(session => session.title?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((session, idx) => (
                    <motion.div 
                      key={session.sessionId} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.5 }}
                      className="group relative"
                    >
                      {editingSessionId === session.sessionId ? (
                        <div className="flex items-center gap-3 px-4 py-4 bg-white/5 rounded-2xl border border-primary/40 shadow-2xl">
                          <input
                            autoFocus
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename(e, session.sessionId);
                              if (e.key === 'Escape') setEditingSessionId(null);
                            }}
                            className="bg-transparent text-[14px] font-bold text-maintext w-full outline-none"
                          />
                          <button
                            onClick={(e) => handleRename(e, session.sessionId)}
                            className="text-primary hover:scale-125 transition-transform"
                          >
                            <Check className="w-5 h-5" strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <button
                            onClick={() => {
                              navigate(`/dashboard/chat/${session.sessionId}`);
                              onClose();
                            }}
                            className={`w-full text-left px-5 py-4 rounded-2xl text-sm transition-all duration-500 truncate pr-20 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]
                            ${currentSessionId === session.sessionId
                                ? (theme === 'dark' ? 'bg-white/[0.08] text-white border border-white/10 shadow-2xl backdrop-blur-3xl' : 'bg-primary/10 text-primary border border-primary/20 shadow-sm backdrop-blur-3xl')
                                : (theme === 'dark' ? 'text-subtext/60 hover:bg-white/[0.04] hover:text-white border border-transparent' : 'text-slate-600 hover:bg-black/[0.04] hover:text-slate-900 border border-transparent')
                              }
                          `}
                          >
                            {currentSessionId === session.sessionId && (
                              <motion.div 
                                layoutId="activeIndicator"
                                className="absolute left-1 top-4 bottom-4 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                              />
                            )}
                            <div className="font-bold truncate text-[14px] tracking-tight mb-1">{session.title || "Untitled Intelligence"}</div>
                            <div className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${theme === 'dark' ? 'text-subtext/40' : 'text-slate-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${currentSessionId === session.sessionId ? 'bg-primary animate-pulse' : (theme === 'dark' ? 'bg-white/20' : 'bg-slate-300')}`}></span>
                              {new Date(session.lastModified).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                          </button>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                            <button
                              onClick={(e) => startRename(e, session)}
                              className="p-2 text-subtext hover:text-primary transition-all bg-white/5 hover:bg-white/10 rounded-xl border border-white/5"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteSession(e, session.sessionId)}
                              className="p-2 text-subtext hover:text-red-500 transition-all bg-white/5 hover:bg-white/10 rounded-xl border border-white/5"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}

                {(!Array.isArray(sessions) || sessions.length === 0) && (
                  <div className="px-4 text-xs text-subtext italic">{t('noRecentChats') || 'No recent chats'}</div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 opacity-50 px-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <p className="text-xs text-subtext mb-2">Login to save your chat history</p>
                <button
                  onClick={() => navigate('/login')}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Log In Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Utils */}
        <div className="p-4 border-t border-white/5 relative z-20 space-y-3">
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`flex-1 h-10 rounded-xl border transition-all duration-300 group/theme flex items-center justify-center
                ${theme === 'dark' 
                  ? 'bg-white/5 border-white/5 text-subtext hover:text-primary hover:bg-primary/10' 
                  : 'bg-black/5 border-black/5 text-slate-800 hover:text-primary hover:bg-primary/5'}`}
              title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            >
              {theme === 'dark' ? <Sun className="w-[18px] h-[18px] group-hover/theme:rotate-90 transition-transform duration-500" /> : <Moon className="w-[18px] h-[18px] group-hover/theme:-rotate-12 transition-transform duration-500" />}
            </button>

            {/* Profile Action - Repositioned to bottom - Only show if logged in */}
            {token && (
              <div className="relative profile-menu-container flex-1">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`w-full h-10 rounded-xl border transition-all duration-300 flex items-center justify-center
                    ${theme === 'dark' 
                      ? 'bg-white/5 border-white/5 text-subtext hover:text-primary hover:bg-primary/10' 
                      : 'bg-black/5 border-black/5 text-slate-800 hover:text-primary hover:bg-primary/5'}`}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="P" className="w-[22px] h-[22px] object-cover rounded-md" />
                  ) : (
                    <User className="w-[18px] h-[18px]" />
                  )}
                </button>
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <ProfileSettingsDropdown
                      onClose={() => setIsProfileMenuOpen(false)}
                      onLogout={() => {
                        handleLogout();
                        setIsProfileMenuOpen(false);
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {!token && (
            <div
              onClick={() => navigate(AppRoute.LOGIN)}
              className="rounded-xl border border-transparent hover:bg-white/20 dark:hover:bg-white/10 transition-all cursor-pointer flex items-center gap-3 px-3 py-2 group relative z-10"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0 border border-primary/10 group-hover:bg-primary/20 transition-colors">
                <User className="w-4 h-4" />
              </div>
              <div className="font-bold text-maintext text-xs group-hover:text-primary transition-colors">
                {t('logIn')}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {isAdmin && (
              <button
                onClick={() => { navigate('/dashboard/admin'); onClose(); }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-white bg-primary hover:opacity-90 transition-all text-[10px] font-bold border border-white/10 shadow-lg shadow-primary/20"
              >
                <Shield className="w-3 h-3" />
                <span>Admin</span>
              </button>
            )}
            <button
              onClick={() => setIsFaqOpen(true)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl transition-all text-[10px] font-bold border ${!isAdmin ? 'col-span-2' : ''} 
                ${theme === 'dark' 
                  ? 'text-white bg-white/5 border-white/5 hover:bg-white/10' 
                  : 'text-slate-800 bg-black/5 border-black/5 hover:bg-black/10'}`}
            >
              <HelpCircle className={`w-3 h-3 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`} />
              <span>{t('helpFaq')}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
