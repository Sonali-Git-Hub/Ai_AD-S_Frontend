import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, Plus, Folder, FolderOpen, ChevronDown, Edit2, Trash2, Check, PlusCircle,
  MessageSquare, Gavel, FileText, Scale, Briefcase, Square, X, User, Zap, FolderPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

import { apis, AppRoute } from '../../types';
import { chatStorageService } from '../../services/chatStorageService';
import { apiService } from '../../services/apiService';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useGenerationStore, selectGeneratingChatIds } from '../../userStore/useGenerationStore';
import { useShallow } from 'zustand/react/shallow';
import {
  sessionsData,
  activeProjectIdData,
  activeModeData,
  activeLegalToolData,
  activeProjectsData
} from '../../userStore/userData';

import DeleteConfirmModal from '../DeleteConfirmModal.jsx';
import ShareModal from '../ShareModal';

const ChatSidebar = ({ onClose, token, isAdmin }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const isDark = theme === 'dark';

  // --- Recoil States ---
  const [sessions, setSessions] = useRecoilState(sessionsData);
  const [projects, setProjects] = useRecoilState(activeProjectsData);
  const [currentProjectId, setCurrentProjectId] = useRecoilState(activeProjectIdData);
  const [currentMode, setMode] = useRecoilState(activeModeData);
  const [, setLegalTool] = useRecoilState(activeLegalToolData);

  // --- Local UI States ---
  const [currentSessionId, setCurrentSessionId] = useState(sessionId || 'new');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  // --- Project State ---
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [renameProjectName, setRenameProjectName] = useState('');
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
  const [isCasesExpanded, setIsCasesExpanded] = useState(false);

  // --- Modals State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isChatDeleteModalOpen, setIsChatDeleteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentShareId, setCurrentShareId] = useState('');
  const [sessionToShare, setSessionToShare] = useState(null);

  // --- Live Generation status ---
  const generatingChatIds = useGenerationStore(useShallow(selectGeneratingChatIds));

  // Sync currentSessionId with route parameter
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

  // Fetch chat sessions — re-fetch when projectId or searchQuery changes
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await chatStorageService.getSessions(searchQuery ? null : currentProjectId);
        setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      }
    };

    if (searchQuery) {
      const timer = setTimeout(fetchSessions, 400); // 400ms debounce
      return () => clearTimeout(timer);
    } else {
      fetchSessions();
    }

    const handleMergeComplete = () => {
      console.log("[SIDEBAR] Merge complete event received, refetching sessions...");
      fetchSessions();
    };
    window.addEventListener('chat-merge-complete', handleMergeComplete);
    return () => window.removeEventListener('chat-merge-complete', handleMergeComplete);
  }, [token, sessionId, setSessions, currentProjectId, searchQuery]);

  // Auto-expand projects if search matches a project name
  useEffect(() => {
    if (searchQuery && projects.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
      setIsProjectsExpanded(true);
    }
  }, [searchQuery, projects]);

  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-primary/20 text-primary border-b border-primary/50 rounded-sm px-0.5">{part}</mark>
      ) : (
        part
      )
    );
  };

  const handleCreateProject = async (isLegal = false) => {
    if (!newProjectName.trim()) {
      setIsCreatingProject(false);
      setIsCreatingCase(false);
      return;
    }

    try {
      const newCase = await apiService.createProject({
        name: newProjectName.trim(),
        isLegalCase: isLegal
      });
      setProjects(prev => [newCase, ...prev]);
      setCurrentProjectId(newCase._id);

      if (isLegal) {
        setIsCasesExpanded(true);
      } else {
        setIsProjectsExpanded(true);
      }

      setIsCreatingProject(false);
      setIsCreatingCase(false);
      setNewProjectName('');
      toast.success(isLegal ? t('caseCreated') : t('projectCreated'));
      navigate('/dashboard/chat/new');
    } catch (err) {
      console.error("Failed to create:", err);
      toast.error(isLegal ? t('failedToCreateCase') : t('failedToCreateProject'));
    }
  };

  const handleNewChat = () => {
    setCurrentProjectId('default');
    setMode('NORMAL_CHAT');
    setLegalTool(null);
    navigate('/dashboard/chat/new', { state: { forceGlobal: true } });
    if (onClose) onClose();
  };

  const handleDeleteSession = (e, sessionIdToDelete) => {
    e.stopPropagation();
    e.preventDefault();
    setChatToDelete(sessionIdToDelete);
    setIsChatDeleteModalOpen(true);
  };

  const confirmDeleteSession = async () => {
    if (!chatToDelete) return;
    try {
      await chatStorageService.deleteSession(chatToDelete);
      useGenerationStore.getState().clearGeneration(chatToDelete);
      
      const updatedSessions = await chatStorageService.getSessions(currentProjectId);
      setSessions(updatedSessions);
      if (currentSessionId === chatToDelete) {
        navigate('/dashboard/chat/new');
      }
      toast.success(t('chatDeleted') || 'Chat deleted successfully');
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Failed to delete chat');
    } finally {
      setIsChatDeleteModalOpen(false);
      setChatToDelete(null);
    }
  };

  const startRename = (e, session) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingSessionId(session.sessionId);
    setNewTitle(session.title || "New Chat");
  };

  const handleRename = async (e, sessionId) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (editingSessionId !== sessionId) return;

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
        toast.success(t('chatRenamed'));
      } else {
        throw new Error("Failed to sync rename to server");
      }
    } catch (err) {
      console.error("Rename failed:", err);
      toast.error(t('couldNotRenameChat'));
      setSessions(oldSessions);
    } finally {
      setEditingSessionId(null);
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
      const isCase = projects.find(p => p._id === projectId)?.isLegalCase;
      toast.success(isCase ? t('caseRenamedSuccessfully') : t('projectRenamedSuccessfully'));
    } catch (error) {
      console.error("Failed to rename project:", error);
      const isCase = projects.find(p => p._id === projectId)?.isLegalCase;
      toast.error(isCase ? t('failedToRenameCase') : t('failedToRenameProject'));
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

    const isCase = projects.find(p => p._id === projectToDelete)?.isLegalCase;
    try {
      await apiService.deleteProject(projectToDelete);
      setProjects(prev => prev.filter(p => p._id !== projectToDelete));
      if (currentProjectId === projectToDelete) {
        handleSwitchProject(null);
      }
      toast.success(isCase ? t('caseDeletedSuccessfully') : t('projectDeletedSuccessfully'));
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error(isCase ? t('failedToDeleteCase') : t('failedToDeleteProject'));
    } finally {
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleSwitchProject = (projectId) => {
    setCurrentProjectId(projectId);
    const p = projects.find(proj => proj._id === projectId);
    if (p?.isLegalCase) {
      navigate(`/dashboard/legal/cases/${projectId}/chat`);
    } else {
      navigate('/dashboard/chat/new');
    }
    if (onClose) onClose();
  };

  const hasHistory = Array.isArray(sessions) && sessions.length > 0;

  return (
    <>
      {/* Search Bar */}
      <div className="px-5 pt-2 relative z-10">
        <div className="relative group/search">
          <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-focus-within/search:opacity-100 transition-opacity pointer-events-none" />
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-subtext/60' : 'text-slate-500'} group-focus-within/search:text-primary group-focus-within/search:scale-110 transition-all duration-300`} />
          <input
            type="text"
            placeholder={t('findASession')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full backdrop-blur-3xl border focus:ring-[6px] rounded-[20px] py-3 pl-11 pr-4 text-sm outline-none transition-all font-semibold shadow-sm 
              ${isDark
                ? 'bg-black/40 border-white/10 focus:border-primary/50 focus:bg-black/60 focus:ring-primary/10 placeholder:text-subtext/40 text-white'
                : 'bg-white/80 border-slate-200 focus:border-primary/40 focus:bg-white focus:ring-primary/10 placeholder:text-slate-500 text-slate-900 shadow-inner'}`}
          />
        </div>
      </div>

      {/* New Chat Button */}
      <div className="px-5 pt-3 pb-2 relative z-10">
        <button
          onClick={handleNewChat}
          className="w-full relative overflow-hidden group p-[1px] rounded-[16px] transition-all duration-500 hover:scale-[1.03] active:scale-[0.97] bg-[#a78bfa] shadow-[0_10px_25px_rgba(167,139,250,0.25),0_0_15px_rgba(96,165,250,0.15)]"
        >
          <div 
            className="absolute inset-0 transition-opacity duration-500 bg-gradient-to-br from-[#a78bfa] via-[#8b5cf6] to-[#60a5fa]" 
            style={{ backgroundSize: '100% 100%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-70 pointer-events-none" />
          <div className="relative flex items-center justify-center gap-2 px-4 py-3 backdrop-blur-sm rounded-[15px] group-hover:bg-white/10 transition-all duration-500">
            <Plus className="w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-700" strokeWidth={3} />
            <span className="font-black text-[13px] tracking-wide text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">{t('newChat')}</span>
          </div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] translate-x-[-100%] group-hover:translate-x-[100%] transform" style={{ transitionDuration: '1.2s' }} />
        </button>
      </div>

      {/* Personal Space & Projects Section */}
      {token && (
        <div className="flex flex-col">
          <div
            onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
            className="px-5 pt-4 pb-2 flex items-center justify-between cursor-pointer group/header select-none relative z-10"
          >
            <div className="flex items-center gap-2">
              <h3 className={`text-[12px] font-black uppercase tracking-[0.2em] group-hover/header:text-primary transition-colors 
                ${isDark ? 'text-subtext/60' : 'text-slate-900'}`}>PROJECTS</h3>
              <div className={`h-[1px] w-8 transition-all group-hover/header:w-12 group-hover/header:bg-primary/30 
                ${isDark ? 'bg-subtext/20' : 'bg-slate-300'}`}></div>
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
                <button
                  onClick={() => setIsCreatingProject(true)}
                  className={`mx-3 px-3 py-2 rounded-lg flex items-center gap-2.5 cursor-pointer transition-all w-[calc(100%-24px)] mb-1 group/create ${isDark ? 'hover:bg-primary/10 text-primary' : 'hover:bg-primary/5 text-primary'}`}
                >
                  <span className="text-[13px] font-bold">Create New Project</span>
                </button>

                {/* Regular Projects List */}
                {projects.filter(p => !p.isLegalCase).map((p, idx) => (
                  <div key={p._id} className="relative group/proj flex items-center mx-3">
                    {editingProjectId === p._id ? (
                      <div className="flex w-full items-center gap-2 px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          autoFocus
                          value={renameProjectName}
                          onChange={e => setRenameProjectName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleRenameProject(e, p._id); if (e.key === 'Escape') setEditingProjectId(null); }}
                          className="flex-1 min-w-0 bg-transparent border-b border-primary outline-none text-xs text-maintext py-1"
                        />
                        <button onClick={(e) => handleRenameProject(e, p._id)} className="text-primary"><Check className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSwitchProject(p._id)}
                          className={`flex-1 flex items-center min-w-0 gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${currentProjectId === p._id ? 'bg-primary/10 text-primary font-bold' : 'text-subtext hover:bg-white/10 hover:text-maintext'}`}
                        >
                          <Folder className="w-4 h-4 shrink-0" />
                          <span className="truncate text-[13px]">{p.name}</span>
                        </button>
                        <div className="absolute right-1 opacity-0 group-hover/proj:opacity-100 flex items-center gap-0.5">
                          <button onClick={(e) => { e.stopPropagation(); setEditingProjectId(p._id); setRenameProjectName(p.name); }} className="p-1 hover:text-primary"><Edit2 className="w-3 h-3" /></button>
                          <button onClick={(e) => handleDeleteProject(e, p._id)} className="p-1 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Cases Nested Folder */}
                <div
                  onClick={(e) => { e.stopPropagation(); setIsCasesExpanded(!isCasesExpanded); }}
                  className={`mx-3 px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${isDark ? 'hover:bg-white/5 text-subtext/80' : 'hover:bg-slate-100 text-slate-900 border border-transparent shadow-sm'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <FolderOpen className={`w-4 h-4 text-primary transition-transform duration-300 ${isCasesExpanded ? 'scale-110' : ''}`} />
                    <span className={`text-[13px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-subtext/90' : 'text-slate-900'}`}>CASES</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isCasesExpanded ? '' : '-rotate-90'} ${isDark ? 'text-subtext/40' : 'text-slate-400'}`} />
                </div>

                <AnimatePresence>
                  {isCasesExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="pl-6 space-y-1 overflow-hidden"
                    >
                      <button
                        onClick={() => setIsCreatingCase(true)}
                        className={`px-3 py-2 rounded-lg flex items-center gap-2.5 cursor-pointer transition-all w-full mb-1 group/createCase ${isDark ? 'hover:bg-primary/10 text-primary' : 'hover:bg-primary/5 text-primary'}`}
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span className="text-[12px] font-bold">Create New Case</span>
                      </button>

                      {isCreatingCase && (
                        <div className="px-3 py-2 bg-primary/5 rounded-lg border border-primary/20 mb-2 mr-3">
                          <input
                            autoFocus
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCreateProject(true);
                              if (e.key === 'Escape') {
                                setIsCreatingCase(false);
                                setNewProjectName('');
                              }
                            }}
                            onBlur={() => {
                              if (!newProjectName.trim()) setIsCreatingCase(false);
                            }}
                            placeholder="Case name..."
                            className="w-full bg-transparent border-0 outline-none text-[12px] text-maintext py-1"
                          />
                        </div>
                      )}

                      {projects
                        .filter(p => p.isLegalCase && (!searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())))
                        .map((p, idx) => (
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
                                  className={`flex-1 flex items-center min-w-0 gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${currentProjectId === p._id ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-subtext hover:bg-white/20 dark:hover:bg-white/10 hover:text-maintext'}`}
                                >
                                  <Folder className={`w-4 h-4 shrink-0 transition-transform duration-300 ${currentProjectId === p._id ? 'scale-110 text-primary ring-4 ring-primary/10 rounded-full' : 'group-hover/proj:scale-110'}`} />
                                  <div className="flex flex-col items-start min-w-0 pr-4">
                                    <span className="truncate font-bold text-[13px] text-left">{highlightMatch(p.name, searchQuery)}</span>
                                    {(() => {
                                      const today = new Date(); today.setHours(0, 0, 0, 0);
                                      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
                                      const hasToday = p.hearings?.some(h => new Date(h.date).toDateString() === today.toDateString() && h.status === 'Upcoming');
                                      if (hasToday) return <span className="text-[8px] font-black uppercase text-red-500 animate-pulse">🔴 Hearing Today</span>;
                                      const hasTomorrow = p.hearings?.some(h => new Date(h.date).toDateString() === tomorrow.toDateString() && h.status === 'Upcoming');
                                      if (hasTomorrow) return <span className="text-[8px] font-black uppercase text-amber-500">🟠 Tomorrow</span>;
                                      return null;
                                    })()}
                                  </div>
                                </button>
                                <div className="absolute right-2 opacity-0 group-hover/proj:opacity-100 flex items-center gap-1 transition-all duration-300 translate-x-2 group-hover/proj:translate-x-0">
                                  <button onClick={(e) => { e.stopPropagation(); setEditingProjectId(p._id); setRenameProjectName(p.name); }} className="p-1.5 text-subtext hover:text-primary transition-all bg-white/10 rounded-lg border border-white/5 shadow-sm"><Edit2 className="w-3 h-3" /></button>
                                  <button onClick={(e) => handleDeleteProject(e, p._id)} className="p-1.5 text-subtext hover:text-red-500 transition-all bg-white/10 rounded-lg border border-white/5 shadow-sm"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              </>
                            )}
                          </motion.div>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Chat Sessions List */}
      <div className="flex-1 overflow-y-auto px-5 space-y-1 relative z-10 custom-scrollbar mt-2">
        <div className="px-1 py-4 flex items-center justify-between">
          <h3 className={`text-[12px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-subtext/40' : 'text-slate-500'}`}>
            {token ? t('activityLog') : 'Guest History'}
          </h3>
          <div className={`h-[1px] flex-1 ml-4 ${isDark ? 'bg-gradient-to-r from-subtext/10 to-transparent' : 'bg-gradient-to-r from-slate-300 to-transparent'}`}></div>
        </div>

        {!hasHistory && !token && (
          <div className="flex flex-col items-center justify-center py-8 opacity-50 px-6 text-center">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <User className="w-5 h-5 text-primary" />
            </div>
            <p className="text-[11px] text-subtext">{t('loginToSaveHistory')}</p>
          </div>
        )}

        {!hasHistory && token && (
          <div className="px-4 text-xs text-subtext italic">{t('noRecentChats') || 'No recent chats'}</div>
        )}

        {hasHistory && (
          (() => {
            const filteredSessions = sessions.filter(session =>
              session.title?.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredSessions.length === 0) return null;

            return filteredSessions.map((session, idx) => (
              <motion.div
                key={session.sessionId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.015, duration: 0.25 }}
                className="group relative"
              >
                {editingSessionId === session.sessionId ? (
                  <div
                    className="flex items-center gap-3 px-4 py-4 bg-white/5 rounded-2xl border border-primary/40 shadow-2xl mx-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      autoFocus
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onBlur={(e) => handleRename(e, session.sessionId)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(e, session.sessionId);
                        if (e.key === 'Escape') setEditingSessionId(null);
                      }}
                      className="bg-transparent text-[14px] font-bold text-maintext w-full outline-none"
                    />
                    <button
                      onMouseDown={(e) => { e.preventDefault(); }}
                      onClick={(e) => handleRename(e, session.sessionId)}
                      className="text-primary hover:scale-125 transition-transform shrink-0"
                    >
                      <Check className="w-5 h-5" strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <div className="sidebar-chat-container relative">
                    <NavLink
                      to={`/dashboard/chat/${session.sessionId}`}
                      onClick={onClose}
                    >
                      {({ isActive }) => (
                        <div className={`sidebar-chat-item group/item transition-all duration-500 mx-2 cursor-pointer
                          ${isActive
                            ? (isDark ? 'bg-white/[0.08] text-white border border-white/10 shadow-2xl backdrop-blur-3xl' : 'bg-white text-primary border border-primary/20 shadow-lg shadow-primary/10 backdrop-blur-3xl ring-4 ring-primary/5')
                            : (isDark ? 'text-subtext/60 hover:bg-white/[0.04] hover:text-white border border-transparent' : 'text-slate-700 hover:bg-white hover:text-slate-900 border border-transparent hover:shadow-md hover:scale-[1.01]')
                          }
                        `}>
                          {isActive ? (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute left-1 top-3 bottom-3 w-[3px] bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]"
                            />
                          ) : (
                            <div
                              className={`absolute left-1 top-3 bottom-3 w-[3px] rounded-full transition-all duration-300 group-hover/item:opacity-60 ${isDark ? 'bg-white/10 opacity-20' : 'bg-slate-300/80 opacity-30'}`}
                            />
                          )}
                          <div className="sidebar-chat-title-group text-left flex-1 min-w-0">
                            <div className="sidebar-chat-title flex items-center gap-1.5">
                              {session.activeTool?.startsWith('legal_') ? (() => {
                                const tool = session.activeTool.toLowerCase();
                                if (tool.includes('precedent') || tool.includes('gavel')) return <Gavel className="w-3.5 h-3.5 text-purple-500 shrink-0" strokeWidth={2.5} />;
                                if (tool.includes('draft') || tool.includes('agreement')) return <FileText className="w-3.5 h-3.5 text-purple-500 shrink-0" strokeWidth={2.5} />;
                                if (tool.includes('evidence')) return <Search className="w-3.5 h-3.5 text-purple-500 shrink-0" strokeWidth={2.5} />;
                                if (tool.includes('case')) return <Briefcase className="w-3.5 h-3.5 text-purple-500 shrink-0" strokeWidth={2.5} />;
                                return <Scale className="w-3.5 h-3.5 text-purple-500 shrink-0" strokeWidth={2.5} />;
                              })() : (
                                <MessageSquare className="w-3.5 h-3.5 text-primary/50 shrink-0" strokeWidth={2} />
                              )}
                              
                              {generatingChatIds.includes(session.sessionId) && (
                                <span
                                  title="Generating response..."
                                  className="flex items-center gap-[3px] shrink-0"
                                >
                                  <span className="w-[5px] h-[5px] rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <span className="w-[5px] h-[5px] rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '120ms' }} />
                                  <span className="w-[5px] h-[5px] rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '240ms' }} />
                                </span>
                              )}
                              <span className="truncate">
                                {highlightMatch(session.title || "Untitled Intelligence", searchQuery)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              {session.activeTool?.startsWith('legal_') && (
                                <div className="flex items-center gap-1 px-1.5 py-[1px] rounded-md bg-purple-500/10 border border-purple-500/20">
                                  <span className="text-[8px] font-black text-purple-500 uppercase tracking-tighter">AI LEGAL</span>
                                  <span className="text-[8px] font-bold text-purple-400/70 truncate max-w-[80px]">
                                    {session.activeTool.replace('legal_', '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                  </span>
                                </div>
                              )}

                              {session.projectId && (
                                <div className="flex items-center gap-1 px-1.5 py-[1px] rounded-md bg-primary/10 border border-primary/20">
                                  <Folder className="w-2.5 h-2.5 text-primary" />
                                  <span className="text-[9px] font-bold text-primary truncate max-w-[60px]">
                                    {projects.find(p => p._id === session.projectId)?.name || "Personal"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="sidebar-chat-actions">
                            {generatingChatIds.includes(session.sessionId) ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  useGenerationStore.getState().abortGeneration(session.sessionId);
                                }}
                                className="sidebar-chat-action-btn stop-btn text-red-500 hover:text-red-600 bg-red-500/10 rounded-lg p-1 animate-pulse"
                                title="Stop Generation"
                              >
                                <Square className="w-2.5 h-2.5 fill-current" />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  startRename(e, session);
                                }}
                                className="sidebar-chat-action-btn"
                                title="Rename Chat"
                              >
                                <Edit2 />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleDeleteSession(e, session.sessionId);
                              }}
                              className="sidebar-chat-action-btn delete"
                              title="Delete Chat"
                            >
                              <X />
                            </button>
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </div>
                )}
              </motion.div>
            ))
          })()
        )}
      </div>

      {/* Confirmation and Share Modals */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteProject}
        title={projects.find(p => p._id === projectToDelete)?.isLegalCase ? t('deleteCaseTitle') : t('deleteProjectTitle')}
        description={projects.find(p => p._id === projectToDelete)?.isLegalCase ? t('deleteCaseDesc') : t('deleteProjectDesc')}
        confirmText={projects.find(p => p._id === projectToDelete)?.isLegalCase ? t('deleteCaseLabel') : t('deleteProjectLabel')}
      />

      <DeleteConfirmModal
        isOpen={isChatDeleteModalOpen}
        onClose={() => setIsChatDeleteModalOpen(false)}
        onConfirm={confirmDeleteSession}
        title={t('deleteChatTitle') === 'deleteChatTitle' ? "Delete Chat?" : t('deleteChatTitle')}
        description={t('deleteChatDesc') === 'deleteChatDesc' ? `This will delete "${sessions.find(s => s.sessionId === chatToDelete)?.title || 'this chat'}". Visit settings to delete any memories saved during this chat.` : t('deleteChatDesc')}
        confirmText={t('deleteChatLabel') === 'deleteChatLabel' ? "Delete" : t('deleteChatLabel')}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareId={currentShareId}
        sessionTitle={sessionToShare?.title || "Shared Chat"}
      />

      <AnimatePresence>
        {isCreatingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
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
                  <h3 className="font-bold text-lg text-maintext">{t('newProject')}</h3>
                  <p className="text-xs text-subtext">{t('organizeChatsByProject')}</p>
                </div>
              </div>
              <input
                type="text"
                autoFocus
                placeholder={t('projectName')}
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject(false);
                  if (e.key === 'Escape') setIsCreatingProject(false);
                }}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-subtext/50 text-maintext"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setIsCreatingProject(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-subtext hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={() => handleCreateProject(false)}
                  disabled={!newProjectName.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('create')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatSidebar;
