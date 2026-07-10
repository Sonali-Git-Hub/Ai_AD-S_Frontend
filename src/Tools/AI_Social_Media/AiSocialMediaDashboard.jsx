import React, { useState, useEffect, Fragment, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  X, Upload, FileText, Calendar, Image as ImageIcon, Video, Layers,
  ChevronDown, ChevronUp, Check, Play, Download, RefreshCw, ChevronLeft,
  Settings, CreditCard, Sparkles, BarChart3, Trash2, ExternalLink,
  LayoutDashboard, Palette, CalendarRange, Library, CheckSquare, Clock, Monitor,
  ChevronRight, Plus, HelpCircle, AlertCircle, Info, Filter, Search,
  Instagram, Facebook, Linkedin, Twitter, Youtube, Send, Save, Globe, CheckCircle2, Mic2,
  Eye, Target, Zap, Hash, Copy, Sparkle, User, User2, Briefcase, History, Activity, Tag,
  Server, BrainCircuit, AlertTriangle, Building2, ShoppingBag, Cpu, Utensils, Camera, HeartPulse, UserCircle, ShoppingCart, ArrowRight, AlignLeft, Lock, Crown
} from 'lucide-react';
import { Dialog, Transition, Menu, Listbox } from '@headlessui/react';
import toast from 'react-hot-toast';
import { apiService } from '../../services/apiService';
import { API } from '../../types.js';
import { getUserData, updateUser } from '../../userStore/userData';
import GeneratePostModal from './GeneratePostModal';
import BrandWorkspace from './BrandWorkspace';

/**
 * Safely wraps a URL through the backend media proxy.
 * If the URL is already a proxy URL (contains /api/media/proxy?url=), it is returned as-is
 * to prevent double-proxying which causes "Cannot read properties of undefined (reading 'split')" errors.
 */
const toProxyUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  // Already routed through the proxy — don't wrap again
  if (url.includes('/api/media/proxy')) return url;
  // Only proxy absolute http(s) URLs
  if (!url.startsWith('http')) return url;
  return `${API}/media/proxy?url=${encodeURIComponent(url)}`;
};

const TwitterXIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const ThreadsIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.5 13.5c-.8 0-1.5-.3-2-1-.4-.6-.5-1.4-.5-2.2v-.1c0-.8.1-1.6.5-2.2.5-.7 1.2-1 2-1s1.5.3 2 1c.4.6.5 1.4.5 2.2v.1c0 .8-.1 1.6-.5 2.2-.5.7-1.2 1-2 1zm-5-3.5c0-.8.1-1.6.5-2.2.5-.7 1.2-1 2-1s1.5.3 2 1c.4.6.5 1.4.5 2.2v.1c0 .8-.1 1.6-.5 2.2-.5.7-1.2 1-2 1s-1.5-.3-2-1c-.4-.6-.5-1.4-.5-2.2v-.1z" />
  </svg>
);

const TikTokIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.29-1.25 4.87 4.87 0 0 1-1.3-3.25h-3.41v13.59a3.22 3.22 0 1 1-3.22-3.22c.2 0 .39.02.58.05V9.16a6.6 6.6 0 1 0 6.05 6.55V6.69a8.21 8.21 0 0 0 4.59 1.4V4.71a4.82 4.82 0 0 1-3-1.02z" />
  </svg>
);

const PinterestIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.27 2.68 7.91 6.46 9.38-.09-.8-.17-2.02.03-2.89.19-.83 1.25-5.3 1.25-5.3s-.32-.64-.32-1.59c0-1.49.86-2.6 1.94-2.6.91 0 1.36.69 1.36 1.51 0 .92-.58 2.3-.89 3.57-.25 1.07.54 1.93 1.59 1.93 1.91 0 3.38-2.01 3.38-4.92 0-2.57-1.85-4.37-4.49-4.37-3.06 0-4.86 2.3-4.86 4.67 0 .93.36 1.92.8 2.46.09.1.1.19.07.31l-.3 1.2c-.05.21-.16.25-.37.15-1.41-.65-2.29-2.7-2.29-4.35 0-3.54 2.57-6.79 7.42-6.79 3.9 0 6.93 2.78 6.93 6.49 0 3.88-2.45 7-5.84 7-1.14 0-2.21-.59-2.58-1.29l-.7 2.68c-.25.97-.94 2.19-1.4 2.94 1.12.33 2.3.51 3.52.51 6.52 0 11.8-5.28 11.8-11.8S18.52 2 12 2z" />
  </svg>
);

const ensureStringId = (id) => {
  if (!id) return id;
  if (typeof id === 'object') return id._id || id.id || String(id);
  return String(id);
};

// Mock/Initial state for usage
const INITIAL_USAGE = {
  imageUsed: 0,
  carouselUsed: 0,
  videoUsed: 0,
  imageLimit: 30,
  carouselLimit: 0,
  videoLimit: 0,
  billingMonth: new Date().toISOString().slice(0, 7)
};
const CustomSelect = ({ value, onChange, options, color = 'indigo', className = '', multiple = false }) => {
  const colorMap = {
    indigo: 'focus:border-indigo-500 text-indigo-500 bg-indigo-500/10 text-indigo-500',
    amber: 'focus:border-amber-500 text-amber-500 bg-amber-500/10 text-amber-500',
    primary: 'focus:border-primary text-primary bg-primary/10 text-primary',
  };

  const getLabel = (val) => {
    const opt = options.find(o => (o.value !== undefined ? o.value : o) === val);
    return opt?.label || val;
  };

  const selectedLabel = multiple
    ? (Array.isArray(value) && value.length > 0
        ? (value.length > 2 ? `${value.length} SELECTED` : value.map(v => getLabel(v)).join(', '))
        : 'SELECT MULTIPLE')
    : options.find(o => (o.value !== undefined ? o.value : o) === value)?.label || value;

  return (
    <Listbox value={multiple ? (Array.isArray(value) ? value : (value ? [value] : [])) : value} onChange={(val) => {
      if (multiple) {
        onChange(val);
      } else {
        const opt = options.find(o => (o.value !== undefined ? o.value : o) === val);
        if (opt?.disabled) return;
        onChange(val);
      }
    }} multiple={multiple}>
      <div className="relative w-full overflow-visible">
        <Listbox.Button className={`w-full flex items-center justify-between text-left cursor-pointer outline-none transition-all shadow-inner hover:shadow-md hover:bg-white dark:hover:bg-white/5 truncate pr-10 border border-slate-200 dark:border-white/10 hover:border-primary/40 ${className}`}>
          <span className="block truncate font-black text-[10px] sm:text-xs uppercase tracking-tight">{selectedLabel}</span>
          <span className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Listbox.Options className="absolute z-[2000] mt-3 max-h-72 w-full overflow-auto rounded-[24px] bg-white/95 dark:bg-[#1E2438]/95 backdrop-blur-2xl py-3 text-sm shadow-[0_30px_70px_-10px_rgba(0,0,0,0.4)] dark:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.7)] ring-1 ring-black/5 dark:ring-white/10 focus:outline-none border border-slate-100/50 dark:border-white/10 animate-in fade-in slide-in-from-top-2 custom-scrollbar">
            {options.map((option, idx) => {
              const optValue = typeof option === 'string' ? option : option.value;
              const optLabel = typeof option === 'string' ? option : option.label;
              const isDisabled = option.disabled === true;
              return (
                <Listbox.Option
                  key={idx}
                  value={optValue}
                  disabled={isDisabled}
                  className={({ active, selected }) => `relative select-none py-3.5 pl-11 pr-4 transition-all duration-200 font-bold mx-2 rounded-xl mb-1 last:mb-0 ${isDisabled
                      ? 'opacity-30 cursor-not-allowed'
                      : `cursor-pointer ${active || selected ? `${colorMap[color].split(' ').slice(2).join(' ')} translate-x-1` : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`
                    }`}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-black' : 'font-bold'}`}>
                        {optLabel}
                      </span>
                      {selected && (
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-4 ${colorMap[color].split(' ')[1]}`}>
                          <Check className="w-4 h-4" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

const AiSocialMediaDashboard = ({ isOpen, onClose, userPlan, isPremium, isAdmin }) => {
  const [currentUser, setCurrentUser] = useState(getUserData());
  const [searchParams, setSearchParams] = useSearchParams();

  // Single source of truth: URL determines the active tab
  const activeTab = searchParams.get('tab') || 'overview';

  const setActiveTab = (tabId) => {
    if (tabId !== 'generation') {
      // Clear the row-level generation view so the useEffect doesn't override the URL back
      setActiveGenerationRowId(null);
    }
    setSearchParams({ tab: tabId }, { replace: true });
  };

  const [urlHistory, setUrlHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('aisa_aiads_url_history');
      return stored ? JSON.parse(stored) : [];
    } catch (_) {
      return [];
    }
  });
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [dropdownSelectedIndex, setDropdownSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  const normalizeUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    let clean = url.trim().toLowerCase();
    clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '');
    clean = clean.replace(/\/$/, '');
    return clean;
  };

  const saveToUrlHistory = (url) => {
    if (!url) return;
    const cleanUrl = url.trim();
    const now = Date.now();
    setUrlHistory(prev => {
      const filtered = prev.filter(item => normalizeUrl(item.url) !== normalizeUrl(cleanUrl));
      const updated = [{ url: cleanUrl, timestamp: now }, ...filtered].slice(0, 4);
      localStorage.setItem('aisa_aiads_url_history', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromUrlHistory = (urlToRemove) => {
    setUrlHistory(prev => {
      const updated = prev.filter(item => normalizeUrl(item.url) !== normalizeUrl(urlToRemove));
      localStorage.setItem('aisa_aiads_url_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearUrlHistory = () => {
    setUrlHistory([]);
    localStorage.removeItem('aisa_aiads_url_history');
  };

  const formatLastUsed = (timestamp) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `Last used ${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `Last used ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Last used Yesterday';
    return `Last used ${diffDays} days ago`;
  };

  const getFaviconUrl = (url) => {
    try {
      let temp = url.trim();
      if (!temp.startsWith('http')) temp = 'https://' + temp;
      const parsed = new URL(temp);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`;
    } catch (_) {
      return '';
    }
  };

  const selectHistoryUrl = async (url) => {
    setBrandProfile(prev => ({ ...prev, website: url }));
    setShowHistoryDropdown(false);
    setDropdownSelectedIndex(-1);

    const cleanUrl = normalizeUrl(url);
    const matchingWorkspace = allWorkspaces.find(ws => normalizeUrl(ws.brandProfile?.website) === cleanUrl);
    if (matchingWorkspace) {
      toast.success(`Restoring session for ${matchingWorkspace.brandProfile?.companyName || url}...`);
      await initWorkspace(false, matchingWorkspace._id);
    }
  };

  const handleInputKeyDown = (e) => {
    if (!showHistoryDropdown || urlHistory.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDropdownSelectedIndex(prev => (prev + 1) % urlHistory.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDropdownSelectedIndex(prev => (prev - 1 + urlHistory.length) % urlHistory.length);
    } else if (e.key === 'Enter') {
      if (dropdownSelectedIndex >= 0 && dropdownSelectedIndex < urlHistory.length) {
        e.preventDefault();
        selectHistoryUrl(urlHistory[dropdownSelectedIndex].url);
      }
    } else if (e.key === 'Escape') {
      setShowHistoryDropdown(false);
    }
  };

  // Click outside dropdown handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowHistoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Data State
  const [workspace, setWorkspace] = useState(null);
  const [allWorkspaces, setAllWorkspaces] = useState([]);
  const [brandProfile, setBrandProfile] = useState({
    companyName: '',
    brandColors: [],
    toneOfVoice: [],
    ctaStyle: [],
    website: '',
    targetEthnicity: [],
    extractedBrandSummary: '',
    logoUrl: null,
    targetIndustry: '',
    targetAudience: [],
    contentObjective: [],
    campaignMonth: 'January',
    postingFrequency: isPremium ? '3x per week' : '7 Days'
  });
  const [activeProfile, setActiveProfile] = useState(null);
  const [calendarEntries, setCalendarEntries] = useState([]);
  const [usage, setUsage] = useState(INITIAL_USAGE);
  const [hashtagTopic, setHashtagTopic] = useState('');
  const fileInputRef = useRef(null);
  const [hashtagInsights, setHashtagInsights] = useState({});
  const [isHashtagLoading, setIsHashtagLoading] = useState(false);

  const [loading, setLoading] = useState(true);

  // Phase 2 Generated Data
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeGenerationRowId, setActiveGenerationRowId] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [genSubTab, setGenSubTab] = useState('feed');
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState('');
  const [pipelineRows, setPipelineRows] = useState([]);
  const [pipelineFilters, setPipelineFilters] = useState({
    dateRange: 'this-week',
    platforms: [],
    contentTypes: [],
    statuses: [],
    search: ''
  });
  const [selectionMode, setSelectionMode] = useState('all');
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());
  const [aiOverrides, setAiOverrides] = useState({
    tone: 'Professional',
    creativity: 'Medium',
    ctaType: 'Direct'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPipelineLoading, setIsPipelineLoading] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardConfig, setWizardConfig] = useState({ mode: 'today', count: 1, platform: ['Instagram'], contentType: ['Professional'], schedule: 'Daily' });
  const [stagedCalendarCount, setStagedCalendarCount] = useState(0);

  // AI Ads™ Agent — Visual Post Generation state
  const [visualGenRowId, setVisualGenRowId] = useState(null); // tracks which card is actively generating

  // Gen Post Format Modal
  const [genPostModal, setGenPostModal] = useState({ open: false, entry: null, format: 'single', aspectRatio: '1:1', carouselCount: 3 });

  // Generate Post Manually State
  const [showManualGenModal, setShowManualGenModal] = useState(false);
  const [manualPlatform, setManualPlatform] = useState('');
  const [manualContentType, setManualContentType] = useState('');
  const [manualCustomContentType, setManualCustomContentType] = useState('');
  const [manualTargetAudience, setManualTargetAudience] = useState('General Audience');
  const [manualCustomTargetAudience, setManualCustomTargetAudience] = useState('');
  const [manualTone, setManualTone] = useState([]);
  const [manualDescription, setManualDescription] = useState('');
  const [manualUploadedFiles, setManualUploadedFiles] = useState([]);
  const [manualLanguage, setManualLanguage] = useState('English');
  const [manualCta, setManualCta] = useState('Learn More');
  const [manualContentLength, setManualContentLength] = useState('Medium');
  const [manualEnhancements, setManualEnhancements] = useState({
    generateCaption: true,
    generateHashtags: true,
    generateCTA: true,
    generateEmojiSuggestions: true,
    generateSEOKeywords: true,
    generateImagePrompt: true,
    generateAltText: true,
    suggestBestPostingTime: true,
    generateMultipleVariations: true,
    repurposeForOtherPlatforms: true,
  });
  const [isGeneratingManual, setIsGeneratingManual] = useState(false);
  const [manualValidationErrors, setManualValidationErrors] = useState({});

  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [visionAnalysisResult, setVisionAnalysisResult] = useState(null);
  const [visionAnalysisError, setVisionAnalysisError] = useState('');
  const [createdPostId, setCreatedPostId] = useState('');

  const [generationStep, setGenerationStep] = useState(0); // 0 = idle, 1 = Uploading, 2 = Analyzing, 3 = Generating, 4 = Finalizing
  const [manualGeneratedContent, setManualGeneratedContent] = useState(null);
  const [isRegeneratingSection, setIsRegeneratingSection] = useState(null);

  const [manualUploadProgress, setManualUploadProgress] = useState(0);
  const [manualPostSaved, setManualPostSaved] = useState(false);

  const triggerVisionAnalysis = async (postId, imageUrl) => {
    setIsAnalyzingImage(true);
    setVisionAnalysisError('');
    setVisionAnalysisResult(null);
    setCreatedPostId(postId);

    try {
      const res = await apiService.analyzeManualPostImage(postId, workspace._id, imageUrl);
      if (res.success) {
        setVisionAnalysisResult(res.visionAnalysis);
        toast.success("Image analyzed successfully.");
      } else {
        setVisionAnalysisError("AI analysis failed. Please try again.");
        toast.error("AI analysis failed. Please try again.");
      }
    } catch (err) {
      setVisionAnalysisError("AI analysis failed. Please try again.");
      toast.error("AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const triggerSectionRegeneration = async (section) => {
    setIsRegeneratingSection(section);
    try {
      const res = await apiService.generateManualPostContent(createdPostId, workspace._id, section);
      if (res.success) {
        setManualGeneratedContent(res.generatedContent);
        toast.success(`${section.toUpperCase()} regenerated successfully!`);
      } else {
        toast.error("Failed to regenerate section.");
      }
    } catch (err) {
      toast.error("Failed to regenerate section.");
    } finally {
      setIsRegeneratingSection(null);
    }
  };

  const openManualModal = () => {
    setManualPlatform('');
    setManualContentType('');
    setManualCustomContentType('');
    setManualTargetAudience('General Audience');
    setManualCustomTargetAudience('');
    setManualTone([]);
    setManualDescription('');
    setManualUploadedFiles([]);
    setManualLanguage('English');
    setManualCta('Learn More');
    setManualContentLength('Medium');
    setManualUploadProgress(0);
    setManualPostSaved(false);
    setIsAnalyzingImage(false);
    setVisionAnalysisResult(null);
    setVisionAnalysisError('');
    setCreatedPostId('');
    setGenerationStep(0);
    setManualGeneratedContent(null);
    setIsRegeneratingSection(null);
    setShowManualGenModal(true);
  };

  // Escape key listener to close manual post modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showManualGenModal && !isGeneratingManual) {
        setShowManualGenModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showManualGenModal, isGeneratingManual]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (isGeneratingManual) return;
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  };

  const handleFileChange = (e) => {
    if (isGeneratingManual) return;
    const files = Array.from(e.target.files);
    handleFileSelection(files);
  };

  const handleFileSelection = (files) => {
    if (isGeneratingManual) return;
    const validFiles = files.filter(file => {
      const isImage = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'].includes(file.type);
      const isVideo = ['video/mp4', 'video/quicktime', 'video/webm'].includes(file.type);
      if (!isImage && !isVideo) {
        toast.error(`${file.name} has an invalid file type`);
        return false;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 50MB size limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    if (manualUploadedFiles.length + validFiles.length > 10) {
      toast.error("Maximum 10 files allowed");
      return;
    }

    const newUploads = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      uploading: false,
      url: URL.createObjectURL(file),
      mimetype: file.type,
      file: file
    }));

    setManualUploadedFiles(prev => [...prev, ...newUploads]);
  };

  const handleReplaceFile = (id) => {
    if (isGeneratingManual) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const isImage = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'].includes(file.type);
      const isVideo = ['video/mp4', 'video/quicktime', 'video/webm'].includes(file.type);
      if (!isImage && !isVideo) {
        toast.error("Invalid file type");
        return;
      }

      setManualUploadedFiles(prev => prev.map(item => 
        item.id === id ? {
          ...item,
          uploading: false,
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          mimetype: file.type,
          file: file
        } : item
      ));
    };
    input.click();
  };

  const handleDeleteUploadedFile = (id) => {
    if (isGeneratingManual) return;
    setManualUploadedFiles(prev => prev.filter(item => item.id !== id));
  };

  const handleGenerateManualContent = async () => {
    const errors = {};
    if (!manualPlatform) {
      errors.platform = "Please select a platform";
    }
    if (!manualContentType) {
      errors.contentType = "Please select a content type";
    } else if (manualContentType === 'Custom' && !manualCustomContentType.trim()) {
      errors.contentType = "Please enter your custom content type";
    }
    if (!manualDescription.trim()) {
      errors.description = "Description is required";
    } else if (manualDescription.trim().length < 20) {
      errors.description = `Description must be at least 20 characters (current: ${manualDescription.trim().length})`;
    } else if (manualDescription.trim().length > 3000) {
      errors.description = `Description must not exceed 3000 characters (current: ${manualDescription.trim().length})`;
    }

    const hasImage = manualUploadedFiles.some(f => f.url?.match(/\.(png|jpe?g|webp|gif)$/i) || f.file);
    if (!hasImage) {
      errors.media = "Please upload at least one image";
    }

    if (Object.keys(errors).length > 0) {
      setManualValidationErrors(errors);
      toast.error(errors.media || "Please fix the validation errors before generating");
      return;
    }

    setManualValidationErrors({});
    setIsGeneratingManual(true);
    setManualUploadProgress(0);
    setManualPostSaved(false);
    setGenerationStep(1); // Step 1: Uploading...

    try {
      const formData = new FormData();
      formData.append('workspaceId', workspace._id);
      formData.append('platform', manualPlatform);
      formData.append('contentType', manualContentType === 'Custom' ? manualCustomContentType : manualContentType);
      formData.append('targetAudience', manualTargetAudience === 'Custom' ? manualCustomTargetAudience : manualTargetAudience);
      formData.append('tone', JSON.stringify(manualTone));
      formData.append('description', manualDescription);
      formData.append('language', manualLanguage);
      formData.append('cta', manualCta);
      formData.append('contentLength', manualContentLength);
      formData.append('enhancements', JSON.stringify(manualEnhancements));

      manualUploadedFiles.forEach(fileObj => {
        if (fileObj.file) {
          formData.append('uploadedFiles', fileObj.file);
        }
      });

      const res = await apiService.createManualPost(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setManualUploadProgress(percentCompleted);
      });

      if (res.success) {
        setManualPostSaved(true);

        const hasUploadedMedia = res.uploadedMedia && res.uploadedMedia.length > 0;
        let savedUploadedMedia = [];

        if (hasUploadedMedia) {
          savedUploadedMedia = res.uploadedMedia;
          setManualUploadedFiles(prev => prev.map((item, idx) => {
            if (res.uploadedMedia[idx]) {
              return { ...item, url: res.uploadedMedia[idx] };
            }
            return item;
          }));
        }

        let firstImage = null;
        if (hasUploadedMedia) {
          firstImage = savedUploadedMedia.find(url => url.match(/\.(png|jpe?g|webp|gif)$/i));
        }

        if (!firstImage) {
          throw new Error("No valid image file found for analysis.");
        }

        // Step 2: Analyzing Image...
        setGenerationStep(2);
        const visionRes = await apiService.analyzeManualPostImage(res.postId, workspace._id, firstImage);
        if (!visionRes.success) {
          throw new Error("AI Vision Analysis failed.");
        }
        setVisionAnalysisResult(visionRes.visionAnalysis);

        // Step 3: Generating AI Content...
        setGenerationStep(3);
        const genRes = await apiService.generateManualPostContent(res.postId, workspace._id);
        if (!genRes.success) {
          throw new Error("AI Content Generation failed.");
        }

        // Step 4: Finalizing...
        setGenerationStep(4);
        setManualGeneratedContent(genRes.generatedContent);
        setCreatedPostId(res.postId);

        toast.success("Manual post created successfully.");
      } else {
        toast.error(`Generation failed: ${res.message || 'Unknown error'}`);
      }
    } catch (err) {
      toast.error(`Generation failed: ${err.message}`);
    } finally {
      setIsGeneratingManual(false);
      setGenerationStep(0);
    }
  };

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showGeneratorOptions, setShowGeneratorOptions] = useState(false);
  const [showContentLibrary, setShowContentLibrary] = useState(false);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [assetSearchQuery, setAssetSearchQuery] = useState('');

  // Phase 3 Collaboration & Scheduling Data
  const [reviewQueue, setReviewQueue] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postHistory, setPostHistory] = useState({ actions: [], comments: [] });
  const [showHistory, setShowHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Cancellation refs for background tasks
  const cancelJobRef = useRef(false);
  const cancelRegenRef = useRef(false);
  const activeJobIdRef = useRef(null); // stores the backend jobId for instant cancel signal

  // Phase 2 Add-on: One-off Asset Generation
  const [showOneOffModal, setShowOneOffModal] = useState(false);
  const [oneOffPrompt, setOneOffPrompt] = useState("");
  const [isOneOffGenerating, setIsOneOffGenerating] = useState(false);

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    customName: '', role: '', industry: '',
    contentCreationTime: '', postingFrequency: '',
    biggestChallenge: '', adsComfortLevel: '',
    website: '', noWebsite: false,
    brandName: '', businessDescription: '',
    brandColors: [], fontFamily: 'Inter',
    brandLogo: null, brandLogoPreview: null
  });
  const [isOnboardingSaving, setIsOnboardingSaving] = useState(false);
  const [isOnboardingFetching, setIsOnboardingFetching] = useState(false);
  const [showOnboardingGuide, setShowOnboardingGuide] = useState(false);
  const [isRapidTestingEnabled, setIsRapidTestingEnabled] = useState(false);

  useEffect(() => {
    if (showOnboarding && !localStorage.getItem('aisa_guide_v3_shown')) {
      const timer = setTimeout(() => {
        setShowOnboardingGuide(true);
        // We set it here so it doesn't pop up again even if they refresh before closing
        localStorage.setItem('aisa_guide_v3_shown', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showOnboarding]);

  // ── Local Premium Modal (embedded inside Dialog to fix stacking context) ─────
  const [localPremiumModal, setLocalPremiumModal] = useState({ open: false, toolName: '', customMessage: '' });

  useEffect(() => {
    const handler = (e) => {
      setLocalPremiumModal({
        open: true,
        toolName: e.detail?.toolName || 'Premium Feature',
        customMessage: e.detail?.customMessage || ''
      });
    };
    window.addEventListener('premium_required', handler);
    return () => window.removeEventListener('premium_required', handler);
  }, []);

  // Form State
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [downloadedPostsCount, setDownloadedPostsCount] = useState(() => parseInt(localStorage.getItem('downloadedPostsCount') || '0', 10));
  const [selectedBrandView, setSelectedBrandView] = useState(null);
  const [currentEditingBrandId, setCurrentEditingBrandId] = useState(null); // NULL = ADDING NEW
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false); // Unified loading state
  const [lastFetchedData, setLastFetchedData] = useState(null);
  const [calendarFile, setCalendarFile] = useState(null);
  const [brandLogo, setBrandLogo] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
  const [overviewFiles, setOverviewFiles] = useState([]); // Support multiple docs
  const [onboardingFiles, setOnboardingFiles] = useState([]); // Isolated onboarding docs
  const [syncedLogos, setSyncedLogos] = useState([]);

  // Defensive fallbacks for legacy/hidden references
  if (typeof window !== 'undefined' && !window.overviewFile) {
    window.overviewFile = null;
  }

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [showCompanyInfoPanel, setShowCompanyInfoPanel] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dashboardRef = useRef(null); // Ref to stop Headless UI FocusTrap from stealing focus on keystrokes

  const handleSyncProfile = async () => {
    const toastId = toast.loading('Syncing with social profile...');
    try {
      const res = await apiService.syncSocialProfile();
      if (res.avatar) {
        // Update local user store and state
        const updated = updateUser({ avatar: res.avatar });
        setCurrentUser(updated);

        // Refresh all workspaces to catch the updated profile image across the UI
        initWorkspace(true);

        toast.success(res.message || 'Profile synchronized!', { id: toastId });
      } else {
        toast.error(res.message || 'No new photo found.', { id: toastId });
      }
    } catch (error) {
      console.error("Sync failed:", error);
      const errMsg = error.response?.data?.error || error.message || "Sync failed";
      toast.error(`${errMsg}. Ensure you are logged in with Google/Microsoft.`, { id: toastId });
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'brand', name: 'Brand WorkSpace', icon: Palette },
    { id: 'calendar', name: 'Content Generator', icon: CalendarRange },
    { id: 'generation', name: 'Content Calendar', icon: Sparkles },
    { id: 'assets', name: 'Post Generation', icon: Library }
  ];

  // Derived state for the "Content Calendar" brands - Used in both Calendar tab and Generation tab
  const calendarWorkspaces = React.useMemo(() => {
    return allWorkspaces.filter(ws =>
      !ws.isPersonalProfile && (
        (ws.calendarEntryCount > 0) ||
        (ws.onboarding?.calendarCount > 0) ||
        (ws._id === workspace?._id && (calendarEntries.length > 0 || (pipelineRows && pipelineRows.length > 0)))
      )
    );
  }, [allWorkspaces, workspace?._id, calendarEntries.length, pipelineRows?.length]);

  // Real-time synchronization is now handled via the calendarWorkspaces memo which reacts to allWorkspaces changes.

  // Cleanup Logo Preview URL & Real Magic Analysis
  useEffect(() => {
    if (brandLogo) {
      const url = URL.createObjectURL(brandLogo);
      setLogoPreviewUrl(url);

      const analyzeLogo = async () => {
        try {
          const res = await apiService.quickAnalysis(brandLogo, workspace?._id);
          if (res.success && res.brandColors?.length > 0) {
            setBrandProfile(prev => ({ ...prev, brandColors: res.brandColors }));
            toast.success("AI Generation: Colors extracted from logo!");
          }
        } catch (e) { console.warn("Logo analysis failed"); }
      };
      analyzeLogo();
      return () => URL.revokeObjectURL(url);
    } else {
      setLogoPreviewUrl(null);
    }
  }, [brandLogo, workspace?._id]);

  // Documents are staged locally and uploaded to GCS silently when the user clicks Save.
  // No auto-analysis or toast fires on file selection.


  // --- 1. Dashboard Initialization ---
  useEffect(() => {
    if (isOpen) {
      initWorkspace();
    }
  }, [isOpen]);

  useEffect(() => {
    setShowGeneratorOptions(false);
    setShowContentLibrary(false);
    setLibrarySearchQuery('');
  }, [activeTab]);

  // --- 2. Active Job Polling (Decoupled) ---
  useEffect(() => {
    let jobPolling;
    if (isOpen && activeJob) {
      jobPolling = setInterval(async () => {
        try {
          const res = await apiService.getSocialAgentJobStatus(activeJob._id);
          if (res.success) {
            // Only update if status changed or progress significantly moved
            if (res.job.status !== activeJob.status || Math.abs((res.job.progress || 0) - (activeJob.progress || 0)) > 5) {
              setActiveJob(res.job);
            }

            if (res.job.status === 'completed' || res.job.status === 'failed') {
              setActiveJob(null);
              // Await the critical data refresh before updating the UI table
              await initWorkspace();
              if (selectedPipelineId) await fetchPipelineRows(selectedPipelineId);

              if (res.job.status === 'completed') toast.success("AI Generation Complete!");
              else toast.error("Some tasks failed in the generation job.");
            }
          } else if (res.status === 404) {
            setActiveJob(null);
          }
        } catch (err) {
          console.error("Poll Error:", err);
        }
      }, 3000);
    }

    return () => {
      if (jobPolling) clearInterval(jobPolling);
    };
  }, [isOpen, activeJob?._id, activeJob?.status]); // Stable dependencies


  // --- 3. Background Data Refresh (Real-time Overview) ---
  useEffect(() => {
    let statsInterval;
    if (isOpen) {
      // Poll overview stats less aggressively than active jobs
      statsInterval = setInterval(() => {
        // Only refresh if not already loading and tab is visible
        if (!loading && activeTab === 'overview') {
          initWorkspace(true); // Background refresh
        }
      }, 10000); // 10 seconds refresh
    }
    return () => {
      if (statsInterval) clearInterval(statsInterval);
    };
  }, [isOpen, activeTab, loading]);

  // ── Scroll Lock: freeze page scroll while AI extraction overlay is shown ──
  useEffect(() => {
    const mainContainer = document.getElementById('main-scroll-container');
    if (isExtracting) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      // Lock the dashboard's own Dialog scroll container
      if (mainContainer) mainContainer.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (mainContainer) mainContainer.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      if (mainContainer) mainContainer.style.overflow = '';
    };
  }, [isExtracting]);



  const handleDownloadMedia = async (url, filename) => {

    if (!url) return;
    const downloadToast = toast.loading("Preparing download...");

    try {
      // Use proxy to avoid CORS when fetching for blob
      const proxyUrl = toProxyUrl(url);
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || `AISA_Gen_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Download started!", { id: downloadToast });
      setDownloadedPostsCount(prev => {
        const next = prev + 1;
        localStorage.setItem('downloadedPostsCount', next.toString());
        return next;
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast.error("Download failed. Opening in new tab...", { id: downloadToast });
      window.open(url, '_blank');
    }
  };

  const handleCopyImageToClipboard = async (url) => {
    try {
      let blob;
      try {
        const proxyUrl = toProxyUrl(url);
        const response = await fetch(proxyUrl);
        blob = await response.blob();
      } catch (e) {
        const response = await fetch(url);
        blob = await response.blob();
      }

      // AISA standard: Convert to PNG if not already, for clipboard compatibility
      const pngBlob = blob.type === 'image/png' ? blob : await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Canvas failed')), 'image/png');
          } catch(err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error('Image failed'));
        img.src = URL.createObjectURL(blob);
      });

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob })
      ]);
      toast.success("Image copied to clipboard!");
    } catch (err) {
      console.error("[CopyImage] Error:", err);
      navigator.clipboard.writeText(url);
      toast.info("Link copied (Image copy restricted)");
    }
  };

  useEffect(() => {
    if (workspace && activeTab === 'generation') {
      fetchPipelines(workspace._id);
      const rowId = searchParams.get('rowId');
      if (rowId) setActiveGenerationRowId(rowId);
    }
  }, [workspace, activeTab, searchParams]);

  useEffect(() => {
    // Only sync the URL when the user is actually on the generation tab
    if (activeTab !== 'generation') return;
    if (activeGenerationRowId) {
      setSearchParams({ tab: 'generation', rowId: activeGenerationRowId });
    } else {
      setSearchParams({ tab: 'generation' });
    }
  }, [activeGenerationRowId, activeTab]);

  const fetchWorkspaceData = async (wsId, isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      // 3. Fetch Brand Profile
      const brandData = await apiService.getSocialAgentBrand(wsId);
      if (brandData.success && brandData.brandProfile) {
        setActiveProfile(brandData.brandProfile);
      } else {
        setActiveProfile(null);
      }

      // 4. Fetch Usage
      const usageData = await apiService.getSocialAgentUsage(wsId);
      if (usageData.success) setUsage(usageData.usage);

      // 5. Fetch Calendar
      const calData = await apiService.getSocialAgentCalendar(wsId);
      if (calData.success) setCalendarEntries(calData.entries);

      // 6. Fetch Generated Posts
      const postData = await apiService.getSocialAgentPosts(wsId);
      if (postData.success) setGeneratedPosts(postData.posts);

      // 7. Fetch Assets
      const assetData = await apiService.getSocialAgentAssets(wsId);
      if (assetData.success) setAssets(assetData.assets);

      // 8. Fetch Review Queue & Schedule
      const reviewData = await apiService.getSocialReviewQueue(wsId);
      if (reviewData.success) setReviewQueue(reviewData.posts);

      const scheduleData = await apiService.getSocialSchedule(wsId);
      if (scheduleData.success) setScheduleItems(scheduleData.items);

      // 9. Fetch Pipelines (for real-time stats)
      await fetchPipelines(wsId);
    } catch (err) {
      console.error("Fetch WS Data Error:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const initWorkspace = async (isBackground = false, targetId = null) => {
    try {
      if (!isBackground) setLoading(true);
      // 1. Get All Workspaces
      const wsList = await apiService.getSocialAgentWorkspaces();
      if (wsList.success) {
        console.log("Fetched workspaces:", wsList.workspaces);
        setAllWorkspaces(wsList.workspaces);
      }

      // 2. Load latest or create
      // Try to load the target workspace (or the latest one)
      let wsData = await apiService.getSocialAgentWorkspace(targetId);
      // If we couldn't load a workspace and there are no workspaces at all, create a default one
      if ((!wsData || !wsData.success) && (wsList.workspaces || []).length === 0) {
        wsData = await apiService.createSocialAgentWorkspace({
          workspaceName: `${currentUser?.name || 'My'} Brand`,
          planType: 'Low'
        });
        if (wsData.success) {
          // Replace the empty list with the newly created workspace
          setAllWorkspaces([wsData.workspace]);
        }
      }

      if (wsData.success) {
        setWorkspace(wsData.workspace);
        const wsId = wsData.workspace._id;

        const anyOnboarded = (wsList.workspaces || []).some(w => w.onboarding?.completed);

        // Onboarding wizard removed

        setIsCheckingOnboarding(false);

        await fetchWorkspaceData(wsId.toString(), isBackground);
        return wsData.workspace; // Return for reuse
      }
      return null;
    } catch (error) {
      console.error("Dashboard Init Error:", error);
      setIsCheckingOnboarding(false);
      return null;
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const renderModuleGuard = (title, description) => {
    if (workspace?.isPersonalProfile) {
      return (
        <div className="flex flex-col items-center justify-center p-20 bg-slate-50 dark:bg-white/5 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-white/10 text-center space-y-8 min-h-[500px]">
          <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <ShieldAlert className="w-12 h-12 text-indigo-500" />
          </div>
          <div className="space-y-4 max-w-lg">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{title} Restricted</h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{description || "This module is only accessible for active Brand Workspaces. Please connect a business or create a brand identity using the Brand Setup tab first."}</p>
          </div>
          <button
            onClick={() => setActiveTab('brand')}
            className="px-10 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[3px] shadow-2xl shadow-indigo-600/30 hover:scale-105 transition-all"
          >
            Start Brand Setup
          </button>
        </div>
      );
    }
    return null;
  };

  const handleAiFetch = async (url, target = 'brandProfile') => {
    if (!url) return;
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

    setIsExtracting(true);
    setIsSyncing(true);
    setIsOnboardingFetching(true); // Sync both states
    const toastId = toast.loading('⚡ AI Ads™ is scanning your brand identity...');

    console.log("[Magic Auto-Pilot] Request Sent: Scanning URL:", targetUrl);

    try {
      const json = await apiService.fetchBrandAssets(targetUrl, workspace?._id);
      console.log("[Magic Auto-Pilot] Response Received:", json);

      // Prepare the new profile data from AI response
      const newProfile = {
        companyName: json.brandName || (target === 'brandProfile' ? brandProfile.companyName : ''),
        logoUrl: json.logoUrl || (target === 'brandProfile' ? brandProfile.logoUrl : null),
        brandColors: Array.from(new Set([
          ...(target === 'brandProfile' ? brandProfile.brandColors : []),
          ...(json.brandColors || [])
        ])),
        faviconUrl: json.faviconUrl || (target === 'brandProfile' ? brandProfile.faviconUrl : null),
        extractedBrandSummary: [
          (target === 'brandProfile' ? brandProfile.extractedBrandSummary : ''),
          json.description
        ].filter(Boolean).join('\n\n---\n\n ANALYSIS: [Website Data] \n'),
        toneOfVoice: json.toneOfVoice || (target === 'brandProfile' ? brandProfile.toneOfVoice : 'Professional'),
        ctaStyle: json.ctaStyle || (target === 'brandProfile' ? brandProfile.ctaStyle : 'Direct'),
        targetEthnicity: json.targetRegion || (target === 'brandProfile' ? brandProfile.targetEthnicity : 'Global'),
        targetIndustry: json.industry || (target === 'brandProfile' ? brandProfile.targetIndustry : ''),
        targetAudience: json.targetAudience || (target === 'brandProfile' ? brandProfile.targetAudience : 'Business Owner'),
        domain: json.domain || (target === 'brandProfile' ? brandProfile.domain : ''),
        website: targetUrl
      };

      console.log("[Magic Auto-Pilot] Parsed Data Model:", newProfile);

      if (target === 'brandProfile') {
        console.log("[Magic Auto-Pilot] UI State Update: Populating Brand Profile");
        setBrandProfile(prev => ({ ...prev, ...newProfile }));
        // Store for success banner
        setLastFetchedData({
          brandName: newProfile.companyName,
          logoUrl: newProfile.logoUrl,
          faviconUrl: newProfile.faviconUrl,
          brandColors: newProfile.brandColors,
          description: newProfile.extractedBrandSummary,
          domain: newProfile.domain || (typeof targetUrl === 'string' ? targetUrl.replace(/^https?:\/\//, '').split('/')[0] : 'brand'),
        });
        // Also update active profile if this is the current workspace
        if (activeProfile) setActiveProfile(prev => ({ ...prev, ...newProfile }));
      } else {
        console.log("[Magic Auto-Pilot] UI State Update: Populating Onboarding Profile");
        // Update onboarding state specifically
        setOnboardingData(prev => ({
          ...prev,
          brandName: newProfile.companyName,
          businessDescription: newProfile.extractedBrandSummary,
          brandLogoPreview: newProfile.logoUrl,
          brandColors: newProfile.brandColors,
          website: targetUrl
        }));
      }

      toast.success(`✅ Extracted identity for ${newProfile.companyName || 'your brand'}!`, { id: toastId });
      saveToUrlHistory(targetUrl);
    } catch (err) {
      console.error('[Magic Auto-Pilot] AI Fetch Error:', err);
      toast.error(err.message || 'Could not fetch brand data automatically.', { id: toastId });
    } finally {
      setIsExtracting(false);
      setIsOnboardingFetching(false);
    }
  };

  useEffect(() => {
    // Only populate Brand Setup form if there is an explicitly saved brand profile.
    // Onboarding data is shown in Company Info, NOT in Brand Setup.
    if (workspace?.brandProfile?.companyName) {
      const bp = workspace.brandProfile;
      setBrandProfile({
        companyName: bp.companyName || '',
        brandColors: bp.brandColors?.length ? bp.brandColors : ['#3b82f6', '#8b5cf6'],
        toneOfVoice: bp.toneOfVoice ? (typeof bp.toneOfVoice === 'string' ? bp.toneOfVoice.split(', ') : bp.toneOfVoice) : [],
        ctaStyle: bp.ctaStyle ? (typeof bp.ctaStyle === 'string' ? bp.ctaStyle.split(', ') : bp.ctaStyle) : [],
        website: bp.website || '',
        targetEthnicity: bp.targetEthnicity ? (typeof bp.targetEthnicity === 'string' ? bp.targetEthnicity.split(', ') : bp.targetEthnicity) : [],
        extractedBrandSummary: bp.extractedBrandSummary || bp.companyOverviewText || '',
        logoUrl: bp.logoUrl || null,
        targetIndustry: bp.targetIndustry || '',
        targetAudience: bp.targetAudience ? (typeof bp.targetAudience === 'string' ? bp.targetAudience.split(', ') : bp.targetAudience) : [],
        contentObjective: bp.contentObjective ? (typeof bp.contentObjective === 'string' ? bp.contentObjective.split(', ') : bp.contentObjective) : [],
        campaignMonth: bp.campaignMonth || 'January',
        postingFrequency: bp.postingFrequency || (isPremium ? '3x per week' : '7 Days')
      });
      setCurrentEditingBrandId(workspace._id);
    }
    // If no explicit brand profile yet (fresh after onboarding), keep Brand Setup blank.
  }, [workspace]);

  const switchWorkspace = (ws) => {
    setActiveProfile(null); // Reset profile state to trigger re-load visibility
    setWorkspace(ws);
    setCurrentEditingBrandId(ws._id);
    setIsWorkspaceMenuOpen(false);
    fetchWorkspaceData(ws._id);
    toast.success(`Viewing Profile: ${ws.workspaceName}`);
  };

  const handleHardDeleteWorkspace = async (wsId) => {
    if (!window.confirm("⚠️ WARNING: This will permanently delete this Brand Profile and ALL associated content, calendars, and generated posts. This cannot be undone. Proceed?")) return;

    const toastId = toast.loading("Permanently removing brand workspace...");
    try {
      const res = await apiService.deleteSocialAgentWorkspace(wsId);
      if (res.success) {
        // Refresh all workspaces to update calendar counts
        await initWorkspace();

        if (workspace?._id === wsId) {
          const nextWs = allWorkspaces.find(w => w._id !== wsId);
          if (nextWs) {
            switchWorkspace(nextWs);
          } else {
            setWorkspace(null);
            // Onboarding removed
          }
        }

        toast.success("Brand Profile fully deleted", { id: toastId });
      } else {
        toast.error("Deletion failed", { id: toastId });
      }
    } catch (error) {
      toast.error("Error during deletion", { id: toastId });
    }
  };



  const handleCompleteOnboarding = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    let targetWs = workspace;
    if (!targetWs) {
      setIsOnboardingSaving(true);
      targetWs = await initWorkspace();
    }

    if (!targetWs) {
      toast.error("Cloud synchronization pending. Please wait 3 seconds and click Launch again.");
      setIsOnboardingSaving(false);
      return;
    }

    setIsOnboardingSaving(true);
    try {
      const res = await apiService.completeSocialOnboarding({
        workspaceId: targetWs._id,
        ...onboardingData,
        logoUrl: onboardingData.brandLogoPreview
      });
      if (res.success) {
        setWorkspace(res.workspace);
        setShowOnboarding(false);
        toast.success("Workspace setup complete! Launching Strategy Engine...");

        // Final Sync: Trigger workspace refresh
        // NOTE: Brand Setup (brandProfile state) is intentionally NOT seeded from onboarding data.
        // Brand Setup is a separate tool that starts clean. Onboarding data only appears in Company Info.
        fetchWorkspaceData(res.workspace._id);
        initWorkspace(true);
      }
    } catch (error) {
      toast.error("Setup sync failed. Please click Launch once more.");
    } finally {
      setIsOnboardingSaving(false);
    }
  };

  const ensureStringId = (id) => {
    if (!id) return id;
    if (typeof id === 'object') return id._id || id.id || String(id);
    return String(id);
  };

  const handleRegeneratePost = async (entryId, toneNudge = "") => {
    cancelRegenRef.current = false;
    setIsProcessing(true);
    const toastId = toast.loading("AI is rethinking this post...");
    try {
      const res = await apiService.regenerateSocialAgentPost({
        workspaceId: workspace?._id,
        entryId,
        toneNudge
      });

      if (cancelRegenRef.current) {
        toast.dismiss(toastId);
        return;
      }

      if (res.success) {
        setCalendarEntries(prev => prev.map(e =>
          (e._id === entryId || e.idx === entryId) ? res.entry : e
        ));
        toast.success("Post refreshed with new AI energy!", { id: toastId });
      } else {
        toast.error("Regeneration failed", { id: toastId });
      }
    } catch (error) {
      if (!cancelRegenRef.current) toast.error("AI rethinking failed", { id: toastId });
      else toast.dismiss(toastId);
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchPipelines = async (wsId) => {
    try {
      const res = await apiService.getSocialAgentPipelines(wsId);
      if (res.success) {
        setPipelines(res.pipelines);
        if (res.pipelines.length > 0) {
          setSelectedPipelineId(res.pipelines[0]._id);
          fetchPipelineRows(res.pipelines[0]._id);
        } else {
          setPipelineRows([]);
          setSelectedPipelineId('');
        }
      }
    } catch (error) {
      console.error("Fetch Pipelines Error:", error);
    }
  };

  const fetchPipelineRows = async (pipelineId) => {
    setIsPipelineLoading(true);
    try {
      const res = await apiService.getSocialAgentPipelineRows(pipelineId);
      if (res.success) {
        setPipelineRows(res.rows);
      }
    } catch (error) {
      console.error("Fetch Pipeline Rows Error:", error);
    } finally {
      setIsPipelineLoading(false);
    }
  };

  const handleBulkAction = async (type) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setActiveJob({ progress: 10, status: 'initializing' });
    try {
      toast.success(`Orchestrating ${type} generation...`);
      // Simulating job progress for the UI requirement
      let p = 10;
      const interval = setInterval(() => {
        p += 20;
        setActiveJob(prev => prev ? { ...prev, progress: p } : null);
        if (p >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setActiveJob(null);
          toast.success("Bulk Sequence Complete");
          if (selectedPipelineId) fetchPipelineRows(selectedPipelineId);
        }
      }, 1000);
    } catch (e) {
      console.error("Bulk synthesis failed:", e);
      setIsProcessing(false);
      setActiveJob(null);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm("Are you sure you want to permanently delete this scheduled post?")) return;

    const toastId = toast.loading("Removing entry from pipeline...");
    try {
      const res = await apiService.deleteSocialAgentCalendarEntry(entryId);
      if (res.success) {
        setCalendarEntries(prev => prev.filter(e => e._id !== entryId));
        toast.success("Entry hard deleted", { id: toastId });
        // Refresh allWorkspaces so the brand switcher count stays in sync
        const wsList = await apiService.getSocialAgentWorkspaces();
        if (wsList.success) setAllWorkspaces(wsList.workspaces);
      } else {
        toast.error("Failed to delete entry", { id: toastId });
      }
    } catch (error) {
      toast.error("Error removing entry", { id: toastId });
    }
  };

  const handleToneNudge = (entryId, nudge) => {
    const label = nudge === 'bold' ? 'Bold/Edgy' : 'Friendly/Informative';
    toast(`Nudging AI towards a ${label} tone...`, { icon: '🤔' });
    handleRegeneratePost(entryId, nudge);
  };

  const handleExportExcel = async (specificWsId = null) => {
    // If called from onClick directly, specificWsId might be an Event object - ignore it
    const inputId = (specificWsId && typeof specificWsId === 'string') ? specificWsId : (specificWsId && typeof specificWsId === 'object' && specificWsId._id) ? specificWsId._id : null;
    const wsId = inputId || workspace?._id;
    if (!wsId || typeof wsId !== 'string') return toast.error("Select a brand first");

    setIsDownloadingExcel(true);
    const toastId = toast.loading("📊 Generating your Excel strategy...");
    try {
      const finalWsId = typeof wsId === 'object' ? (wsId._id || wsId.id || String(wsId)) : String(wsId);
      const blob = await apiService.exportSocialAgentCalendar(finalWsId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AI_Content_Calendar_${brandProfile.companyName || 'Campaign'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("✅ Excel Strategy Downloaded!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Cloud Excel generation failed. Try again in a moment.", { id: toastId });
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  const handleGenerateFromCalendar = async (entryId) => {
    setIsProcessing(true);
    const toastId = toast.loading("🤔 Crafting high-converting social copy...");
    try {
      const res = await apiService.generateFromCalendar(workspace?._id, entryId);
      if (res.success) {
        // Add the new post to the feed
        setGeneratedPosts(prev => [res.post, ...prev]);
        // Update calendar entry status locally
        setCalendarEntries(prev => prev.map(e => e._id === entryId ? { ...e, status: 'generated' } : e));

        // Refresh library and artifacts to sync content everywhere
        await fetchWorkspaceData(workspace?._id, true);

        toast.success("Content Synthesized! Find it in your feed.", { id: toastId });
      } else {
        toast.error(res.error || "Generation failed", { id: toastId });
      }
    } catch (error) {
      toast.error("AI engine encounterd an error", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveBrand = async (e = null) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    // ── PARALLEL-USE GUARD ───────────────────────────────────────────────────
    if (isExtracting) {
      toast.error('AI extraction is still running. Please wait for it to finish before activating.');
      return;
    }

    // ── REQUIRED FIELDS VALIDATION ──────────────────────────────────────────
    const missing = [];
    if (!brandProfile.companyName) missing.push('Brand Name');
    if (!brandProfile.targetIndustry) missing.push('Target Industry');
    if (!brandProfile.targetAudience || (Array.isArray(brandProfile.targetAudience) && brandProfile.targetAudience.length === 0)) missing.push('Target Audience');
    if (!brandProfile.toneOfVoice || (Array.isArray(brandProfile.toneOfVoice) && brandProfile.toneOfVoice.length === 0)) missing.push('Voice / Tone');
    if (!brandProfile.contentObjective || (Array.isArray(brandProfile.contentObjective) && brandProfile.contentObjective.length === 0)) missing.push('Content Objective');
    if (!brandProfile.campaignMonth) missing.push('Campaign Month');
    if (!brandProfile.postingFrequency) missing.push('Posting Frequency');

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(', ')}`, { duration: 5000 });
      return;
    }

    setIsSaving(true);

    const isNew = !currentEditingBrandId;
    let targetWorkspaceId = ensureStringId(currentEditingBrandId || workspace?._id);

    try {
      if (isNew) {
        const wsRes = await apiService.createSocialAgentWorkspace({
          workspaceName: brandProfile.companyName,
          planType: 'Low'
        });
        if (wsRes.success) {
          targetWorkspaceId = wsRes.workspace._id;
        } else {
          toast.error("Failed to initialize workspace record.");
          setIsSaving(false);
          return;
        }
      }

      if (!targetWorkspaceId) {
        toast.error("Initialization error. Please refresh.");
        setIsSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append('workspaceId', targetWorkspaceId);
      formData.append('companyName', brandProfile.companyName);
      formData.append('toneOfVoice', Array.isArray(brandProfile.toneOfVoice) ? JSON.stringify(brandProfile.toneOfVoice) : (brandProfile.toneOfVoice || ''));
      formData.append('ctaStyle', Array.isArray(brandProfile.ctaStyle) ? JSON.stringify(brandProfile.ctaStyle) : (brandProfile.ctaStyle || ''));
      formData.append('website', brandProfile.website || '');
      formData.append('targetEthnicity', Array.isArray(brandProfile.targetEthnicity) ? JSON.stringify(brandProfile.targetEthnicity) : (brandProfile.targetEthnicity || 'Global'));
      formData.append('extractedBrandSummary', brandProfile.extractedBrandSummary || '');

      // NEW STRATEGIC FIELDS
      formData.append('targetIndustry', brandProfile.targetIndustry || '');
      formData.append('targetAudience', Array.isArray(brandProfile.targetAudience) ? JSON.stringify(brandProfile.targetAudience) : (brandProfile.targetAudience || ''));
      formData.append('contentObjective', Array.isArray(brandProfile.contentObjective) ? JSON.stringify(brandProfile.contentObjective) : (brandProfile.contentObjective || ''));

      // SOCIAL LINKS
      if (brandProfile.socialMediaLinks) {
        formData.append('socialMediaLinks', JSON.stringify(brandProfile.socialMediaLinks));
      }
      formData.append('campaignMonth', brandProfile.campaignMonth || '');
      formData.append('postingFrequency', brandProfile.postingFrequency || '');

      if (brandProfile.brandColors && brandProfile.brandColors.length > 0) {
        formData.append('brandColors', JSON.stringify(brandProfile.brandColors));
      }

      if (brandLogo) {
        formData.append('logo', brandLogo);
      } else if (brandProfile.logoUrl) {
        formData.append('logoUrl', brandProfile.logoUrl);
      }

      if (overviewFiles && overviewFiles.length > 0) {
        overviewFiles.forEach(file => {
          formData.append('overview', file);
        });
      }

      const res = await apiService.uploadSocialAgentBrand(formData);

      if (res && res.success) {
        toast.success(isNew ? "✨ Brand DNA Synchronized!" : "🚀 Strategy Hub Updated!");

        // --- STEP 0: AUTOMATED AI ACTIVATION CHAIN ---
        const wsId = ensureStringId(isNew ? res.brandProfile.workspaceId : (workspace?._id || currentEditingBrandId));

        // Re-fetch all immediately to show the new card in the grid/sidebar right away
        await initWorkspace(true, wsId);

        let activeToast = toast.loading("⚡ Phase 1/3: Synchronizing Brand DNA...", { duration: 10000 });

        try {
          // Pulse effect for normalization
          setTimeout(() => {
            toast.loading("🧠 Phase 2/3: AI Strategist is building your monthly roadmap...", { id: activeToast });
          }, 2500);

          const genRes = await apiService.generateSocialAgentCalendar(wsId);
          if (genRes.success) {
            toast.loading("🚀 Phase 3/3: Finalizing Social Engine & Asset Sync...", { id: activeToast });

            setTimeout(async () => {
              toast.success("✨ Content Calendar successfully generated. Check the Content Studio tab for full view!", { id: activeToast });
              setCalendarEntries(genRes.calendar || []);
              await initWorkspace(false, wsId);
              setActiveTab('calendar');
              setShowPreviewModal(true);

              // Automatically trigger Excel Download for the user's records
              await handleExportExcel(wsId);
            }, 1000);
          }
        } catch (genErr) {
          console.error("AI Generation Chain Failed:", genErr);
          if (genErr.message?.includes('unlimited strategies')) {
            toast.dismiss(activeToast);
          } else {
            toast.error("Strategist encountered an error. Please try again in the Content Calendar tab.", { id: activeToast });
          }
        }

        // Clear inputs AFTER saving to ensure the form is blank for new entry
        setCurrentEditingBrandId(null);
        setBrandLogo(null);
        setOverviewFiles([]);
        setCalendarFile(null);
        setStagedCalendarCount(0);
        setBrandProfile({
          companyName: '',
          brandColors: ['#3b82f6', '#8b5cf6'],
          toneOfVoice: 'Professional',
          ctaStyle: 'Direct',
          targetEthnicity: 'Global',
          extractedBrandSummary: '',
          targetIndustry: '',
          targetAudience: '',
          contentObjective: 'Awareness',
          campaignMonth: 'January',
          postingFrequency: '3x per week'
        });
      }
    } catch (error) {
      toast.error(error.message || "Failed to activate strategy hub");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBrand = async (wsId, wsName) => {
    // SECURITY: Ensure we have a valid, full-length ObjectId (24 chars)
    console.log(`[handleDeleteBrand] Initializing deletion for: ${wsName} (ID: ${wsId})`);

    if (!wsId || wsId.length !== 24) {
      console.warn(`[handleDeleteBrand] Suspicious or truncated ID detected: ${wsId}`);
      toast.error("Invalid brand ID. This brand may already be deleted or data is corrupted.");
      return;
    }

    if (!window.confirm(`Permanently delete "${wsName}"?\n\nThis will remove:\n- All GCS files (logo, overview, calendar, generated images)\n- All MongoDB records for this brand\n\nThis action CANNOT be undone.`)) return;

    const toastId = toast.loading(`Deleting ${wsName}...`);
    try {
      // 1. Clear the calendar specifically for this workspace first (clean-up)
      try {
        await apiService.clearCalendarForWorkspace(wsId);
      } catch (e) { console.warn("Calendar clear skipped during delete:", e.message); }

      const res = await apiService.deleteSocialAgentWorkspace(wsId);
      if (res.success) {
        toast.success(`"${wsName}" deleted permanently`, { id: toastId });

        // Optimistic local update for instant UI response
        const updatedList = allWorkspaces.filter(w => ensureStringId(w._id) !== ensureStringId(wsId));
        setAllWorkspaces(updatedList);

        if (ensureStringId(workspace?._id) === ensureStringId(wsId)) {
          if (updatedList.length > 0) {
            await switchWorkspace(updatedList[0]);
          } else {
            setWorkspace(null);
            setBrandProfile({ companyName: '', brandColors: ['#3b82f6', '#8b5cf6'], toneOfVoice: 'Professional', ctaStyle: 'Direct', website: '', targetEthnicity: 'Global', extractedBrandSummary: '' });
          }
        }

        // Re-fetch from server to get the ground-truth list & correct counts
        try {
          const freshList = await apiService.getSocialAgentWorkspaces();
          if (freshList.success) setAllWorkspaces(freshList.workspaces);
        } catch (_) {}
      } else {
        toast.error(res.message || 'Delete failed', { id: toastId });
      }
    } catch (err) {
      console.error("[handleDeleteBrand] Error executing delete:", err);
      toast.error(err.status === 404 ? "Brand not found on server (may already be deleted)" : "Delete failed. Check console for details.", { id: toastId });
    }
  };




  const handleUploadCalendar = async () => {
    if (!calendarFile || !workspace) return;

    setIsSaving(true);
    const formData = new FormData();
    formData.append('workspaceId', workspace._id);
    formData.append('file', calendarFile);

    try {
      const res = await apiService.uploadSocialAgentCalendar(formData);
      if (res.success) {
        toast.success(`Parsed ${res.entryCount} entries from calendar!`);
        // Refresh calendar
        const calData = await apiService.getSocialAgentCalendar(workspace._id);
        if (calData.success) {
          setCalendarEntries(calData.entries);
          setStagedCalendarCount(calData.entries.length);
        }
        setCalendarFile(null);
      }
    } catch (error) {
      toast.error("Failed to upload calendar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDirectSynthesis = async (entryId) => {
    if (!workspace || !entryId) return;
    setIsGenerating(true);
    setActiveGenerationRowId(entryId); // Pivot to synthesis view immediately

    try {
      const row = calendarEntries.find(r => ensureStringId(r._id) === ensureStringId(entryId));
      const topic = row?.title || row?.rawData?.Title || "Content Strategy";

      // Step 1: Trigger Direct LLM Synthesis
      const res = await apiService.generateFromCalendar(workspace._id, entryId);

      if (res.success) {
        toast.success("Neural Content Synthesized!");

        // Step 2: Refresh local data to show the new variations in the table
        await fetchWorkspaceData(workspace._id);
      }
    } catch (err) {
      console.error("[DirectSynthesis] Failed:", err);
      toast.error(err.message || "Generation failed");
      setActiveGenerationRowId(null); // Return to table if failed
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateContent = async (customMode = null, customCount = null, entryIds = null, customConfig = null) => {
    if (!workspace || !workspace._id) {
      toast.error('Select a brand workspace before generating content.');
      return;
    }

    // If the selected brand workspace has no current company name, warn the user.
    if (!brandProfile?.companyName && !workspace?.workspaceName) {
      toast.error('Brand profile is missing. Please complete the brand setup first.');
      return;
    }

    // Check if we should use the Direct Synthesis flow for single rows
    if (entryIds && entryIds.length === 1 && activeTab === 'generation') {
      return handleDirectSynthesis(entryIds[0]);
    }

    setIsGenerating(true);
    try {
      const mode = customMode || wizardConfig.mode;
      const count = (mode === 'today' && !customCount) ? 1 : (customCount || wizardConfig.count);

      const res = await apiService.triggerSocialAgentGeneration({
        workspaceId: workspace._id,
        mode,
        count,
        platform: customConfig ? [customConfig.platform] : wizardConfig.platform,
        contentType: customConfig ? [customConfig.contentType] : wizardConfig.contentType,
        schedule: wizardConfig.schedule,
        entryIds: entryIds || [],
        brandMetadata: {
          companyName: brandProfile?.companyName || workspace?.workspaceName || '',
          overview: customConfig?.postTopic ? `${customConfig.postTopic}. ${customConfig.keyMessage || ''}` : (brandProfile?.extractedBrandSummary || brandProfile?.companyOverviewText || ''),
          toneOfVoice: customConfig?.tones?.length ? customConfig.tones.join(', ') : (brandProfile?.toneOfVoice || ''),
          targetIndustry: brandProfile?.targetIndustry || '',
          targetAudience: brandProfile?.targetAudience || '',
          contentObjective: brandProfile?.contentObjective || '',
          website: brandProfile?.website || ''
        }
      });

      if (res.success) {
        if (entryIds && entryIds.length === 1) {
          setActiveGenerationRowId(entryIds[0]);
          // Also trigger hashtags for this row's context
          const row = calendarEntries.find(r => r._id === entryIds[0]);
          if (row && (row.title || row.rawData?.Title)) {
            setHashtagTopic(row.title || row.rawData?.Title);
            handleGenerateHashtags();
          }
        }
        setActiveJob(res.job || { _id: res.jobId });
        setShowWizard(false);
        setActiveTab('generation');
        toast.success(entryIds ? "Generation Pipeline Triggered!" : "AI Generation Pipeline Started!");
      }
    } catch (err) {
      toast.error("Generation failed to start");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAiWizardContent = async (config) => {
    if (!workspace || !workspace._id) {
      toast.error('Select a brand workspace before generating content.');
      return;
    }

    const toastId = toast.loading("Uploading reference files & generating post with AI...");
    try {
      // 1. Upload reference media files if any
      const uploadedFiles = [];
      if (config.referenceMedia && config.referenceMedia.length > 0) {
        for (const file of config.referenceMedia) {
          try {
            const uploadRes = await apiService.uploadMediaFile(file);
            if (uploadRes.success) {
              uploadedFiles.push({
                url: uploadRes.data.url,
                mimetype: file.type,
                filename: file.name,
                size: file.size
              });
            } else {
              throw new Error(`Failed to upload ${file.name}`);
            }
          } catch (uploadErr) {
            console.error("Reference media upload failed:", uploadErr);
            toast.error(`Failed to upload reference media: ${file.name}`, { id: toastId });
            return;
          }
        }
      }

      // 2. Prepare description/prompt
      let description = config.postTopic;
      if (config.keyMessage && config.keyMessage.trim()) {
        description += `\nKey Message: ${config.keyMessage}`;
      }

      // 3. Map tones to array/string format expected by backend (which accepts array of tones)
      const tone = config.tones || [];

      // 4. Construct enhancements payload
      const enhancements = {
        generateCaption: config.aiEnhancements?.caption !== false,
        generateHashtags: config.aiEnhancements?.hashtags !== false,
        generateCTA: config.aiEnhancements?.cta !== false,
        generateImagePrompt: config.aiEnhancements?.imagePrompt !== false,
        generateMultipleVariations: config.aiEnhancements?.multipleVariations !== false,
        generateEmojiSuggestions: true,
        generateSEOKeywords: true,
        generateAltText: true,
        suggestBestPostingTime: true,
        repurposeForOtherPlatforms: false
      };

      // 5. Construct payload for generateManualSocialPost
      const payload = {
        workspaceId: workspace._id,
        platform: config.platform,
        contentType: config.contentType,
        targetAudience: config.audience,
        tone: tone,
        description: description,
        uploadedFiles: uploadedFiles,
        language: config.language,
        contentLength: config.contentLength,
        cta: config.aiEnhancements?.cta ? "Learn More" : "None",
        enhancements: enhancements
      };

      // 6. Call endpoint
      const res = await apiService.generateManualSocialPost(payload);
      if (res.success) {
        toast.success("AI Post generated successfully!", { id: toastId });
        setShowWizard(false);

        // Refresh posts list
        const postData = await apiService.getSocialAgentPosts(workspace._id);
        if (postData.success) setGeneratedPosts(postData.posts);

        // Refresh assets list
        const assetData = await apiService.getSocialAgentAssets(workspace._id);
        if (assetData.success) setAssets(assetData.assets);

        // Switch tab to assets (Post Generation)
        setActiveTab('assets');
      } else {
        toast.error(`Generation failed: ${res.error || 'Unknown error'}`, { id: toastId });
      }
    } catch (err) {
      console.error("AI Wizard Generation failed:", err);
      toast.error(`Generation failed: ${err.response?.data?.error || err.message}`, { id: toastId });
    }
  };

  /**
   * AI Ads™ Agent - Visual Post Generation Pipeline
   * 1. Calls GPT-4 to craft a brand-aware Imagen prompt from the calendar card
   * 2. Vertex AI Imagen 3/4 renders the high-quality visual
   * 3. Polls for completion, then auto-redirects to Post Generation tab
   */
  const handleVisualPostGeneration = async (entry, postFormat = 'single', aspectRatio = '1:1', carouselCount = 3) => {
    if (!workspace || !entry) return;

    console.log("[AISA] Visual Gen - Plan check:", { isPremium, userPlan });

    // Centralized Frontend Premium Gate for Visual Generation
    if (!isPremium && !isAdmin) {
      console.log("[AISA] Blocking visual gen - Premium required");
      window.dispatchEvent(new CustomEvent('premium_required', {
        detail: {
          toolName: 'AI Ads Visuals',
          customMessage: 'Visual post rendering is a premium feature. Upgrade to Pro to generate stunning AI assets for your brand.'
        }
      }));
      return;
    }

    const entryId = String(entry._id);
    setVisualGenRowId(entryId);
    cancelJobRef.current = false;

    const toastId = toast.loading(
      `🖼️ Engineering prompt for "${entry.title || 'Post'}" [${aspectRatio}]...`,
      { duration: 30000 }
    );

    try {
      // Step 1: Kick off the backend pipeline
      const res = await apiService.generateVisualPost(
        workspace._id,
        entryId,
        undefined,   // modelId — use backend default
        postFormat,  // 'single' | 'carousel'
        aspectRatio, // '1:1' | '4:3' | '16:9' | '9:16'
        carouselCount
      );

      if (!res?.success || !res?.jobId) {
        throw new Error(res?.error || 'Failed to start generation');
      }

      const toastDuration = postFormat === 'carousel' ? 360000 : 120000;
      toast.loading(`🤔 AISA™ generating post visual...${postFormat === 'carousel' ? ` (0/${carouselCount})` : ''}`, { id: toastId, duration: toastDuration });

      // Step 2: Poll for job completion (max 9 mins for single, 12 mins for carousel)
      const jobId = res.jobId;
      activeJobIdRef.current = jobId;
      let attempts = 0;
      const maxAttempts = postFormat === 'carousel' ? 240 : 180; // 240 * 3s = 720s (12 mins), 180 * 3s = 540s (9 mins)
      let jobResult = null;

      while (attempts < maxAttempts) {
        if (cancelJobRef.current) {
          toast.dismiss(toastId);
          throw new Error('CANCELLED_BY_USER');
        }
        await new Promise(r => setTimeout(r, 3000));
        const statusRes = await apiService.getSocialAgentJobStatus(jobId);

        if (postFormat === 'carousel' && statusRes?.job) {
          const completed = statusRes.job.completedCount || 0;
          const requested = statusRes.job.requestedCount || carouselCount;
          toast.loading(`🖼️ Generating carousel slides... (${completed}/${requested})`, { id: toastId, duration: toastDuration });
        }

        if (statusRes?.job?.status === 'completed') {
          jobResult = statusRes.job;
          break;
        }
        if (statusRes?.job?.status === 'failed') {
          throw new Error(statusRes.job.errorSummary || 'Generation job failed');
        }
        attempts++;
      }

      if (!jobResult) throw new Error('Generation timed out. Please try again.');

      // Step 3: Success — refresh assets and navigate to Post Generation
      toast.success('✨ Visual post created! Redirecting to Creative Studio...', { id: toastId, duration: 4000 });

      // Visual generation no longer marks entry as 'generated' locally to keep workflows isolated
      // setCalendarEntries(prev => prev.map(r => r._id === entryId ? { ...r, status: 'generated' } : r));

      // Refresh assets in background
      if (workspace?._id) {
        apiService.getSocialAgentAssets(workspace._id)
          .then(data => { if (data?.assets) setAssets(data.assets); })
          .catch(() => { });
      }

      // Auto-redirect to Post Generation tab after short delay
      setTimeout(() => setActiveTab('assets'), 1500);

    } catch (err) {
      console.error('[VisualPost] Error:', err);
      // Suppress toast if it's a premium restriction (modal will handle it)
      if (err.message === 'CANCELLED_BY_USER') {
        toast.dismiss(toastId);
      } else if (err.message?.includes('paid plans') || err.message?.includes('premium') || err.message?.includes('PLAN_RESTRICTED')) {
        toast.dismiss(toastId);
      } else {
        toast.error(`Generation failed: ${err.message}`, { id: toastId });
      }
    } finally {
      setVisualGenRowId(null);
      activeJobIdRef.current = null;
    }
  };

  const handleGenerateOneOffAsset = async () => {
    if (!workspace || !oneOffPrompt) return;
    setIsOneOffGenerating(true);
    try {
      const res = await apiService.generateSocialAgentOneOffAsset({
        workspaceId: workspace._id,
        prompt: oneOffPrompt
      });
      if (res.success) {
        toast.success("Magic asset created!");
        setShowOneOffModal(false);
        setOneOffPrompt("");
        // Refresh library
        const assetData = await apiService.getSocialAgentAssets(workspace._id);
        if (assetData.success) setAssets(assetData.assets);
      }
    } catch (error) {
      toast.error("Asset generation failed");
    } finally {
      setIsOneOffGenerating(false);
    }
  };


  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setIsProcessing(true);
    try {
      const res = await apiService.deleteSocialAgentPost(postId);
      if (res.success) {
        setGeneratedPosts(prev => prev.filter(p => p._id !== postId));
        setReviewQueue(prev => prev.filter(p => p._id !== postId));
        toast.success("Post removed");
      }
    } catch (err) {
      toast.error("Failed to delete post");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateHashtags = async () => {
    if (!workspace || !hashtagTopic) return;
    setIsHashtagLoading(true);
    try {
      const res = await apiService.getSocialHashtagInsights(workspace._id, hashtagTopic);
      if (res.success) {
        setHashtagInsights(res.insights);
        toast.success("Viral Clusters Discovered!");
      }
    } catch (err) {
      toast.error("Hashtag analysis failed");
    } finally {
      setIsHashtagLoading(false);
    }
  };


  // Phase 3 Actions
  const handleSendForReview = async (postId, note = "") => {
    try {
      setIsProcessing(true);
      const res = await apiService.submitPostForReview(postId, { workspaceId: workspace._id, note });
      if (res.success) {
        setGeneratedPosts(prev => prev.map(p => p._id === postId ? res.post : p));
        setReviewQueue(prev => [...prev, res.post]);
        toast.success("Submitted for review!");
      }
    } catch (err) { toast.error("Submission failed"); } finally { setIsProcessing(false); }
  };

  const handleApprove = async (postId, note = "") => {
    try {
      setIsProcessing(true);
      const res = await apiService.approveSocialPost(postId, { workspaceId: workspace._id, note });
      if (res.success) {
        setReviewQueue(prev => prev.filter(p => p._id !== postId));
        toast.success("Post Approved!");
        initWorkspace();
      }
    } catch (err) { toast.error("Approval failed"); } finally { setIsProcessing(false); }
  };

  const handleReject = async (postId, note = "") => {
    try {
      setIsProcessing(true);
      const res = await apiService.rejectSocialPost(postId, { workspaceId: workspace._id, note });
      if (res.success) {
        setReviewQueue(prev => prev.filter(p => p._id !== postId));
        toast.success("Post Rejected");
      }
    } catch (err) { toast.error("Rejection failed"); } finally { setIsProcessing(false); }
  };

  const handleAddComment = async (postId, message) => {
    try {
      const res = await apiService.addSocialPostComment(postId, { workspaceId: workspace._id, message });
      if (res.success) {
        setPostHistory(prev => ({ ...prev, comments: [res.comment, ...prev.comments] }));
        toast.success("Comment added");
      }
    } catch (err) { toast.error("Comment failed"); }
  };

  const fetchPostHistory = async (post) => {
    setSelectedPost(post);
    setShowHistory(true);
    try {
      const res = await apiService.getSocialPostHistory(post._id);
      if (res.success) setPostHistory({ actions: res.actions, comments: res.comments });
    } catch (err) { toast.error("History failed to load"); }
  };

  const handleSchedulePost = async (postId, platform, date) => {
    try {
      setIsProcessing(true);
      const res = await apiService.scheduleSocialPost(postId, { workspaceId: workspace._id, platform, scheduledFor: date });
      if (res.success) {
        toast.success("Post Scheduled!");
        initWorkspace();
      }
    } catch (err) { toast.error("Scheduling failed"); } finally { setIsProcessing(false); }
  };

  const renderOverview = () => {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 flex flex-col space-y-12 pb-20">
        {/* ── SECTION 1: Strategic Command Stats ─────────────────────────────────────────── */}


        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
          {[
            {
              id: 'brands',
              label: 'Active Brands',
              val: allWorkspaces.filter(ws => !ws.isPersonalProfile && ws.brandProfile?.companyName).length,
              icon: Palette,
              color: 'text-indigo-500',
              bg: 'bg-indigo-500/10'
            },
            { id: 'downloaded', label: 'Downloaded Posts', val: downloadedPostsCount, icon: Download, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { id: 'totalposts', label: 'Total Posts', val: generatedPosts.length, icon: Library, color: 'text-primary', bg: 'bg-primary/10' }
          ].map((stat, i) => (
            <div key={stat.id} className="p-4 rounded-[20px] bg-white dark:bg-[#1E2438] border border-slate-100 dark:border-white/5 flex items-center gap-4 transition-all shadow-sm relative overflow-hidden">
              <div className={`w-10 h-10 rounded-[14px] ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-start">
                <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight">{stat.val}</h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>


        {/* ── SECTION 6: Intelligence & Visual Vault ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Content Pipeline Status */}
          <div className="p-5 md:p-6 rounded-[24px] bg-white dark:bg-[#1E2438] border border-slate-100 dark:border-white/5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white leading-tight">Recent Drafts</h3>
              </div>
              <button onClick={() => { setActiveTab('generation'); document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-[9px] font-black text-primary uppercase tracking-widest text-right shrink-0">Review all &rarr;</button>
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-center">
              {(generatedPosts || []).slice(0, 2).map((post, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 transition-all">
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 line-clamp-2 italic mb-2">"{post.hook || post.captionLong?.slice(0, 40) + '...'}"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-primary uppercase tracking-[2px]">{post.platform}</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>
              ))}
              {generatedPosts.length === 0 && <p className="text-[10px] font-black text-slate-400 uppercase text-center py-6 opacity-40">No drafts in laboratory.</p>}
            </div>
          </div>

          {/* Post Generation QuickView */}
          <div className="p-5 md:p-6 rounded-[24px] bg-white dark:bg-[#1E2438] border border-slate-100 dark:border-white/5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Library className="w-5 h-5 text-primary shrink-0" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white leading-tight">Recent Visuals</h3>
              </div>
              <button onClick={() => { setActiveTab('assets'); document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-[9px] font-black text-primary uppercase tracking-widest text-right shrink-0">Open Vault &rarr;</button>
            </div>

            <div className="flex-1 flex items-center">
              <div className="grid grid-cols-3 gap-2 w-full">
                {(assets || []).filter(a => a.assetSource === 'generated').slice(0, 6).map((asset, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-[#161B2E] border border-slate-200 dark:border-white/5 relative">
                    <img src={asset.gcsUrl} className="w-full h-full object-cover transition-transform duration-700" alt="Artifact" />
                  </div>
                ))}
                {(assets || []).filter(a => a.assetSource === 'generated').length === 0 && Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/5" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBrandSetup = () => {
    const completionSteps = [
      { label: 'Brand Identity', done: !!(brandProfile.companyName && brandProfile.website) },
      { label: 'Voice & Strategy', done: !!(brandProfile.toneOfVoice && brandProfile.ctaStyle) },
      { label: 'Visual Identity', done: !!(brandProfile.brandColors?.length > 0 || brandLogo || brandProfile.logoUrl) },
    ];
    const completionPct = Math.round((completionSteps.filter(s => s.done).length / completionSteps.length) * 100);


    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col space-y-8 sm:space-y-16 pb-24 sm:pb-72">
        <AnimatePresence>
          {isExtracting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[500] flex items-center justify-center min-h-[100dvh]"
              style={{ pointerEvents: 'all' }}
            >
              {/* Full-screen blur layer — covers entire viewport including scroll-offset content */}
              <div className="absolute inset-0 bg-white/70 dark:bg-[#080808]/80 backdrop-blur-3xl" style={{ WebkitBackdropFilter: 'blur(40px)', backdropFilter: 'blur(40px)' }} />


              {/* Animated card */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="relative z-10 bg-white dark:bg-[#141824] rounded-[28px] shadow-2xl border border-slate-100 dark:border-white/10 px-10 py-8 flex flex-col items-center gap-5 min-w-[280px]"
              >
                {/* Glowing ring behind icon */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-20 h-20 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '1.4s' }} />
                  <div className="absolute w-16 h-16 rounded-full bg-primary/10 animate-pulse" />
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" style={{ animationDuration: '1s' }} />
                  </div>
                </div>

                {/* Text */}
                <div className="text-center space-y-1.5">
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[3px]">AI Extraction Active</p>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-widest animate-pulse">Analyzing Brand DNA...</p>
                </div>

                {/* Animated progress bar */}
                <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary via-indigo-500 to-purple-500 rounded-full"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  />
                </div>

                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">This may take a few seconds</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── HEADER & MAGIC ACTION ─────────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-6 xl:gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-[3px] border border-primary/20">AI Ads™ Intelligence</div>
              <div className="h-px w-12 bg-primary/30" />
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-[0.9]">
              Build Your <br /><span className="text-primary">Brand</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-400 font-bold max-w-xl">
              Define your brand DNA, sync your digital footprint, and let AI Ads™ build your professional social presence.
            </p>
          </div>

          <div className="w-full xl:w-[500px] group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-indigo-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-white dark:bg-[#1E2438] rounded-[24px] p-5 border border-slate-100 dark:border-white/5 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Magic Auto-Pilot</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Sync EVERYTHING in one click</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div ref={dropdownRef} className="relative w-full sm:flex-1">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={brandProfile.website || ''}
                    onChange={(e) => {
                      setBrandProfile({ ...brandProfile, website: e.target.value });
                      setShowHistoryDropdown(true);
                    }}
                    onFocus={() => setShowHistoryDropdown(true)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Enter Brand URL"
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:border-primary transition-all"
                  />

                  {showHistoryDropdown && urlHistory.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-white/95 dark:bg-[#1E2438]/95 backdrop-blur-xl border border-slate-150 dark:border-white/10 rounded-2xl shadow-xl z-[999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                        {urlHistory.map((item, idx) => (
                          <div
                            key={item.url}
                            onClick={() => selectHistoryUrl(item.url)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                              idx === dropdownSelectedIndex
                                ? 'bg-slate-100 dark:bg-white/10'
                                : 'hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {getFaviconUrl(item.url) && (
                                <img
                                  src={getFaviconUrl(item.url)}
                                  alt=""
                                  className="w-4 h-4 rounded-sm object-contain shrink-0 bg-white"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              )}
                              <div className="flex flex-col text-left min-w-0">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[280px]">
                                  {item.url}
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                  {formatLastUsed(item.timestamp)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromUrlHistory(item.url);
                              }}
                              className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                              title="Remove from history"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-slate-100 dark:border-white/5 p-2 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.01]">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2">Recent Brands</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearUrlHistory();
                            setShowHistoryDropdown(false);
                          }}
                          className="text-[8px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest px-2"
                        >
                          Clear History
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleAiFetch(brandProfile.website)}
                  disabled={!brandProfile.website || isExtracting || isSaving}
                  className="w-full sm:w-auto h-11 px-6 bg-primary text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  Activate
                </button>
              </div>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 relative z-[10]">



          {/* ── CENTER: FORM SECTIONS ─────────────────────────────────────────────────────────────────── */}
          <div className="space-y-5 min-w-0 flex flex-col">


            {/* ROW 1: CORE & VOICE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CARD 1: CORE IDENTITY */}
              <div className="bg-white dark:bg-[#1E2438] rounded-xl p-4 border border-slate-100 dark:border-white/5 shadow-sm space-y-3 transition-all duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-indigo-500/10 flex items-center justify-center transition-all duration-500 relative">
                      <User2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 text-white text-[6px] font-bold rounded-full flex items-center justify-center shadow-md border border-white dark:border-zinc-900">1</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Core Identity</h3>
                  </div>
                  {completionSteps[0].done && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>

                <div className="space-y-2.5">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Brand Name</label>
                    <input
                      value={brandProfile.companyName || ''}
                      onChange={(e) => setBrandProfile({ ...brandProfile, companyName: e.target.value })}
                      placeholder="e.g. Tesla Inc"
                      autoComplete="off"
                      className="w-full h-8 px-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-md text-xs font-black outline-none focus:border-indigo-500 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Industry</label>
                    <input
                      value={brandProfile.targetIndustry || ''}
                      onChange={(e) => setBrandProfile({ ...brandProfile, targetIndustry: e.target.value })}
                      placeholder="e.g. Tech & AI"
                      autoComplete="off"
                      className="w-full h-8 px-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-md text-xs font-bold outline-none focus:border-indigo-500 transition-all shadow-inner"
                    />
                  </div>

                </div>
              </div>

              {/* CARD 2: VOICE & PERSONALITY */}
              <div className="bg-white dark:bg-[#1E2438] rounded-xl p-4 border border-slate-100 dark:border-white/5 shadow-sm space-y-3 transition-all duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-amber-500/10 flex items-center justify-center transition-all duration-500 relative">
                      <Mic2 className="w-3.5 h-3.5 text-amber-500" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 text-white text-[6px] font-bold rounded-full flex items-center justify-center shadow-md border border-white dark:border-zinc-900">2</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Content Preferences</h3>
                  </div>
                  {completionSteps[1].done && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>

                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                    <CustomSelect
                      value={brandProfile.targetAudience || []}
                      multiple={true}
                      onChange={(val) => setBrandProfile({ ...brandProfile, targetAudience: val })}
                      options={[
                        { label: 'STARTUP FOUNDERS', value: 'Startup Founders' },
                        { label: 'SMALL BUSINESS OWNERS', value: 'Small Business Owners' },
                        { label: 'FREELANCERS & SOLOPRENEURS', value: 'Freelancers' },
                        { label: 'CORPORATE PROFESSIONALS', value: 'Corporate Professionals' },
                        { label: 'STUDENTS & GEN Z', value: 'Students' },
                        { label: 'PARENTS & FAMILIES', value: 'Parents' },
                        { label: 'TECH ENTHUSIASTS', value: 'Tech Enthusiasts' },
                        { label: 'CREative PROFESSIONALS', value: 'Creative Professionals' },
                        { label: 'HIGH NET-WORTH INDIVIDUALS', value: 'Luxury Seekers' },
                        { label: 'GOVT EMPLOYEES', value: 'Govt Employee' },
                        { label: 'RETIRED & SENIORS', value: 'Retired' }
                      ]}
                      color="amber"
                      className="h-8 px-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-md text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Content Objective</label>
                    <CustomSelect
                      value={brandProfile.contentObjective || []}
                      multiple={true}
                      onChange={(val) => setBrandProfile({ ...brandProfile, contentObjective: val })}
                      options={[
                        { label: 'BRAND AWARENESS & REACH', value: 'Awareness' },
                        { label: 'LEAD GENERATION', value: 'Leads' },
                        { label: 'SALES & CONVERSIONS', value: 'Sales' },
                        { label: 'VIRAL ENGAGEMENT', value: 'Viral' },
                        { label: 'EDUCATIONAL AUTHORITY', value: 'Educational' },
                        { label: 'COMMUNITY BUILDING', value: 'Community' },
                        { label: 'WEBSITE TRAFFIC', value: 'Traffic' },
                        { label: 'PRODUCT LAUNCH', value: 'Launch' }
                      ]}
                      color="amber"
                      className="h-8 px-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-md text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Tone</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['Professional', 'Casual', 'Bold', 'Friendly', 'Luxury', 'Witty', 'Empathetic', 'Minimalist'].map(tone => {
                        const isSelected = Array.isArray(brandProfile.toneOfVoice) ? brandProfile.toneOfVoice.includes(tone) : brandProfile.toneOfVoice === tone;
                        return (
                          <button
                            key={tone}
                            onClick={() => {
                              const current = Array.isArray(brandProfile.toneOfVoice) ? brandProfile.toneOfVoice : [brandProfile.toneOfVoice].filter(Boolean);
                              const updated = current.includes(tone) ? current.filter(t => t !== tone) : [...current, tone];
                              setBrandProfile({ ...brandProfile, toneOfVoice: updated });
                            }}
                            className={`h-7 rounded text-[8px] font-black uppercase tracking-wider border transition-all ${isSelected ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5'}`}
                          >
                            {tone}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            </div>


          </div>

          <div className="space-y-6 w-full xl:min-w-[350px]">

            {/* THE BRAND CARTRIDGE (PASSPORT) */}
            <div className="relative group perspective-1000">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-[20px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative holographic-card rounded-[20px] overflow-hidden bg-white/10 backdrop-blur-3xl border border-white/20 p-1">
                <div className="p-5 space-y-4 bg-zinc-900/40 rounded-[16px] border border-white/5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="w-5 h-5 rounded-full border border-primary/40 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    </div>
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-[2px]">Verified DNA</span>
                  </div>

                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto bg-white/10 backdrop-blur-2xl rounded-[16px] border border-white/20 flex items-center justify-center p-3 shadow-lg group-hover:rotate-6 transition-transform duration-1000 relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-[16px]" />
                      {logoPreviewUrl || brandProfile.logoUrl ? (
                        <img
                          src={logoPreviewUrl || toProxyUrl(brandProfile.logoUrl)}
                          className="w-full h-full object-contain relative z-10"
                        />
                      ) : (
                        <Palette className="w-6 h-6 text-white/20 relative z-10" />
                      )}
                    </div>

                    <div className="text-center">
                      <h2 className="text-lg font-black text-white uppercase tracking-tighter leading-none">{brandProfile.companyName || 'Awaiting Sync'}</h2>
                      <p className="text-[8px] text-primary font-bold uppercase tracking-widest mt-1">{brandProfile.website || 'No Source connected'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-[12px] bg-white/5 border border-white/10">
                      <p className="text-[6px] font-black text-white/30 uppercase tracking-widest mb-1">Vocal Tone</p>
                      <p className="text-[10px] font-bold text-white uppercase truncate">{brandProfile.toneOfVoice || 'Neutral'}</p>
                    </div>
                    <div className="p-2.5 rounded-[12px] bg-white/5 border border-white/10">
                      <p className="text-[6px] font-black text-white/30 uppercase tracking-widest mb-1">Engagement</p>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase truncate">{brandProfile.ctaStyle || 'Dynamic'}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 text-center">
                    <div className="flex justify-center gap-1.5">
                      {(brandProfile.brandColors || []).slice(0, 5).map((c, i) => (
                        <div key={i} className="w-4 h-4 rounded-md shadow-sm" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 pt-3">
                      <Zap className="w-2 h-2 text-primary" />
                      <span className="text-[6px] font-black text-white/40 uppercase tracking-widest">Autonomous Core Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* STEP 4: INTELLIGENCE CORE (MATCHED TO REFERENCE) */}
            <div className="p-4 rounded-[16px] bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-4 hover:border-emerald-500/20 transition-all duration-500 group overflow-visible">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-[2px]">Intelligence Core</h4>
                  </div>
                  <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-1">Strategy Evolution Hub</p>
                </div>

                {/* Action Hub */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
                    <button
                      onClick={() => document.getElementById('overview-upload-core').click()}
                      disabled={isSaving || isExtracting}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[7px] font-black uppercase tracking-[1px] text-slate-600 dark:text-slate-300 hover:border-primary/40 hover:text-primary transition-all shadow-sm active:scale-95 w-full sm:w-auto disabled:opacity-50"
                    >
                      <Upload className="w-2.5 h-2.5" />
                      {overviewFiles.length > 0 ? `${overviewFiles.length} Docs Ready` : 'Upload Docs'}
                    </button>
                    <input
                      type="file"
                      id="overview-upload-core"
                      className="hidden"
                      multiple
                      onChange={(e) => setOverviewFiles(prev => [...prev, ...Array.from(e.target.files)])}
                      accept=".pdf,.doc,.docx"
                    />

                    <button
                      onClick={() => handleAiFetch(brandProfile.website)}
                      disabled={isSyncing || !brandProfile.website}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-[7px] font-black uppercase tracking-[1px] transition-all shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 w-full sm:w-auto"
                    >
                      <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Syncing...' : 'Fetch Web'}
                    </button>
                  </div>

                  {/* File List for Visual Feedback */}
                  {overviewFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {overviewFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                          <FileText className="w-2 h-2 text-emerald-500" />
                          <span className="text-[6px] font-black text-emerald-600 dark:text-emerald-400 truncate max-w-[50px]">{f.name}</span>
                          <X
                            className="w-2 h-2 text-emerald-500 cursor-pointer hover:scale-125"
                            onClick={() => setOverviewFiles(prev => prev.filter((_, idx) => idx !== i))}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    value={brandProfile.extractedBrandSummary || ''}
                    onChange={(e) => setBrandProfile({ ...brandProfile, extractedBrandSummary: e.target.value })}
                    placeholder="Type manual brand notes / USP / mission... (OR use the 'Fetch Web' button to automatically synthesize from your URL)"
                    className="w-full h-40 md:h-48 px-4 py-3 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-[12px] text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500 transition-all leading-relaxed resize-y min-h-[120px] shadow-[0_10px_30px_rgba(0,0,0,0.02)]"
                  />
                  <div className="absolute bottom-3 right-5 flex items-center gap-1 opacity-30 pointer-events-none">
                    <span className="text-[6px] font-black uppercase tracking-widest">Global DNA Bank</span>
                    <Target className="w-2 h-2" />
                  </div>
                </div>
              </div>



              {/* SOCIAL ENGINE CONFIG (NEW) */}
              <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Social Engine</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-[1000]">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Month</label>
                    <CustomSelect
                      value={brandProfile.campaignMonth || 'April'}
                      onChange={(val) => setBrandProfile({ ...brandProfile, campaignMonth: val })}
                      options={['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => ({ label: m.toUpperCase(), value: m }))}
                      color="primary"
                      className="h-11 px-4 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-primary shadow-sm hover:border-primary/30 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Posting Frequency</label>
                    <CustomSelect
                      value={brandProfile.postingFrequency || (isPremium ? '3x per week' : '7 Days')}
                      onChange={(val) => setBrandProfile({ ...brandProfile, postingFrequency: val })}
                      options={[
                        { label: '7 Days (Starter)', value: '7 Days' },
                        { label: '1x per week', value: '1x per week', disabled: !isPremium },
                        { label: '3x per week', value: '3x per week', disabled: !isPremium },
                        { label: 'Daily', value: 'Daily', disabled: !isPremium },
                        { label: '2x Daily (High Growth)', value: '2x Daily', disabled: !isPremium }
                      ]}
                      color="primary"
                      className="h-11 px-4 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl text-[10px] font-black outline-none focus:border-primary shadow-sm hover:border-primary/30 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REDESIGNED MASTER SAVE BUTTON */}
        <div className="pt-4 pb-16 sm:pb-32 space-y-6 max-w-5xl mx-auto w-full relative z-0">
          {calendarEntries.length === 0 && (
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[24px] blur opacity-75"></div>
              <div className="relative p-6 bg-white dark:bg-[#1E2438] rounded-[24px] border border-primary/20 flex flex-col md:flex-row gap-5 items-center shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 w-full">
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-1">Optional: Deep Brand Extraction</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-3">Sync visuals & strategy directly from your URL</p>
                  <div className="relative">
                    <input
                      placeholder="https://yourbrand.com"
                      autoComplete="off"
                      className="w-full h-11 pl-4 pr-32 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:border-primary transition-all"
                      value={brandProfile.website || ''}
                      onChange={(e) => setBrandProfile({ ...brandProfile, website: e.target.value })}
                    />
                    <button
                      onClick={() => handleAiFetch(brandProfile.website)}
                      disabled={!brandProfile.website || isExtracting || isSaving}
                      className="absolute right-1.5 top-1.5 h-8 px-4 bg-primary text-white rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isExtracting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Sync Brand
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(() => {
            // Compute missing required fields for the button state
            const missingFields = [];
            if (!brandProfile.companyName) missingFields.push('Brand Name');
            if (!brandProfile.targetIndustry) missingFields.push('Target Industry');
            if (!brandProfile.targetAudience || (Array.isArray(brandProfile.targetAudience) && brandProfile.targetAudience.length === 0)) missingFields.push('Target Audience');
            if (!brandProfile.toneOfVoice || (Array.isArray(brandProfile.toneOfVoice) && brandProfile.toneOfVoice.length === 0)) missingFields.push('Voice / Tone');
            if (!brandProfile.contentObjective || (Array.isArray(brandProfile.contentObjective) && brandProfile.contentObjective.length === 0)) missingFields.push('Content Objective');
            if (!brandProfile.campaignMonth) missingFields.push('Campaign Month');
            if (!brandProfile.postingFrequency) missingFields.push('Posting Frequency');
            const isBlocked = isSaving || isExtracting || missingFields.length > 0;
            return (
              <div className="relative group/btn">
                <button
                  onClick={handleSaveBrand}
                  disabled={isBlocked}
                  className="group relative w-full h-14 sm:h-16 overflow-hidden rounded-[20px] sm:rounded-[24px] bg-zinc-900 shadow-xl transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 opacity-90 transition-all group-hover:scale-110"></div>
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    {(isSaving || isExtracting) ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin" />
                        <span className="text-sm font-black text-white uppercase tracking-widest">
                          {isExtracting ? 'AI Extraction Running...' : 'Generating Strategy...'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-pulse" />
                          <span className="text-sm sm:text-base font-black text-white uppercase tracking-[1px] sm:tracking-[2px]">Setup Your Brand</span>
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-pulse" />
                        </div>
                        <p className="text-[7px] sm:text-[8px] text-white/60 font-black uppercase tracking-[1px] sm:tracking-[2px] mt-0.5">Save & Activate Your Brand Profile</p>
                      </>
                    )}
                  </div>
                </button>
                {/* Missing fields tooltip — only shown when there are missing fields and not loading */}
                {missingFields.length > 0 && !isSaving && !isExtracting && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-xs opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-slate-900 dark:bg-white/10 backdrop-blur-xl text-white rounded-2xl px-4 py-3 shadow-2xl border border-white/10">
                      <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-2">⚠ Complete these fields first:</p>
                      <ul className="space-y-1">
                        {missingFields.map(f => (
                          <li key={f} className="text-[9px] font-bold text-white/70 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Tooltip arrow */}
                    <div className="w-2.5 h-2.5 bg-slate-900 dark:bg-white/10 rotate-45 mx-auto -mt-1.5 border-r border-b border-white/10" />
                  </div>
                )}
              </div>
            );
          })()}
        </div>
        {/* Brand Detail Modal */}
        {selectedBrandView && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-20">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-500" onClick={() => setSelectedBrandView(null)} />
            <div className="relative w-full max-w-4xl bg-white dark:bg-[#0c0c0c] rounded-[48px] overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 flex flex-col md:flex-row">
              <div className="p-10 md:p-16 flex-1 space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-[32px] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center p-4">
                    {selectedBrandView.logoUrl ? <img src={toProxyUrl(selectedBrandView.logoUrl)} className="w-full h-full object-contain" alt="Logo" /> : <Globe className="w-10 h-10 text-slate-300" />}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">{selectedBrandView.companyName || 'Brand'}</h2>
                    <p className="text-sm font-bold text-primary tracking-[3px] uppercase mt-1">{selectedBrandView.domain || selectedBrandView.website?.replace(/^https?:\/\//, '').split('/')[0] || ''}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-100 dark:border-white/5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Voice</span>
                    <p className="text-xl font-bold dark:text-white uppercase">{selectedBrandView.toneOfVoice || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement Style</span>
                    <p className="text-xl font-bold dark:text-white uppercase">{selectedBrandView.ctaStyle || '—'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Overview</span>
                  <p className="text-sm text-slate-500 leading-relaxed">{selectedBrandView.extractedBrandSummary || 'No description provided.'}</p>
                </div>
                {selectedBrandView?.brandColors?.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Color Palette</span>
                    <div className="flex gap-4">
                      {selectedBrandView.brandColors.map((c, i) => (
                        <div key={i} className="group relative">
                          <div className="w-14 h-14 rounded-2xl border-4 border-white dark:border-zinc-800 shadow-xl hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="w-full md:w-56 bg-slate-50 dark:bg-white/[0.03] border-l border-slate-100 dark:border-white/5 p-10 flex flex-col justify-between items-center text-center">
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black dark:text-white uppercase">Profile Active</h4>
                    <p className="text-[10px] text-slate-400 uppercase mt-1">Ready for generation</p>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  <button
                    onClick={async () => {
                      const targetWs = allWorkspaces.find(w => w._id === selectedBrandView._workspaceId);
                      if (targetWs && workspace?._id !== targetWs._id) {
                        await switchWorkspace(targetWs);
                      }
                      setSelectedBrandView(null);
                      setActiveTab('calendar');
                      setShowPreviewModal(true);
                    }}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <CalendarRange className="w-4 h-4" /> View Calendar
                  </button>
                  <button onClick={() => setSelectedBrandView(null)} className="w-full py-4 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };




  const renderContentCalendar = () => {
    const guard = renderModuleGuard("Content Studio");
    if (guard) return guard;
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
        {(() => {
          if (!showPreviewModal) {
            if (showGeneratorOptions) {
              return (
                <div className="flex-1 overflow-y-auto w-full space-y-8 p-4 pb-24 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowGeneratorOptions(false)}
                      className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-all flex items-center justify-center shadow-sm"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Content Generator</h3>
                      <p className="text-xs text-slate-500 font-medium">Select your preferred method to generate social media content</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl pt-4">
                    {/* Generate by AI Card */}
                    <div onClick={() => setShowWizard(true)} className="bg-gradient-to-br from-primary/10 to-transparent dark:from-primary/20 dark:to-transparent rounded-[32px] border border-primary/20 p-8 flex flex-col justify-center items-center w-full shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 cursor-pointer group min-h-[260px]">
                      <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
                        <Sparkles className="w-10 h-10" />
                      </div>
                      <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white tracking-widest text-center">Generate Post by AI</h3>
                      <p className="text-[10px] text-slate-500 text-center mt-2 font-black uppercase tracking-wider opacity-70">Automated Content Plan</p>
                    </div>

                    {/* Generate Manually Card */}
                    <div onClick={() => setShowManualGenModal(true)} className="bg-slate-50 dark:bg-[#1E2438] rounded-[32px] border border-slate-200 dark:border-white/10 p-8 flex flex-col justify-center items-center w-full shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 cursor-pointer group min-h-[260px]">
                      <div className="w-20 h-20 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-sm">
                        <Palette className="w-10 h-10" />
                      </div>
                      <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white tracking-widest text-center">Generate Post Manually</h3>
                      <p className="text-[10px] text-slate-500 text-center mt-2 font-black uppercase tracking-wider opacity-70">Create from scratch</p>
                    </div>
                  </div>
                </div>
              );
            }

            if (showContentLibrary) {
              const allLibraryEntries = calendarEntries.filter(e => {
                if (!librarySearchQuery) return true;
                const q = librarySearchQuery.toLowerCase().trim();
                return (
                  (e.title || '').toLowerCase().includes(q) ||
                  (e.heading_hook || '').toLowerCase().includes(q) ||
                  (e.captionShort || e.short_caption || '').toLowerCase().includes(q) ||
                  (e.captionLong || e.long_caption || '').toLowerCase().includes(q) ||
                  (e.platform || '').toLowerCase().includes(q) ||
                  (Array.isArray(e.hashtags) ? e.hashtags.join(' ') : String(e.hashtags || '')).toLowerCase().includes(q)
                );
              });
              const libraryAssets = (assets || []).filter(a => a.assetSource === 'generated');

              return (
                <div className="flex-1 overflow-y-auto w-full space-y-8 p-4 pb-24 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setShowContentLibrary(false); setLibrarySearchQuery(''); }}
                      className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-all flex items-center justify-center shadow-sm"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Content Library</h3>
                      <p className="text-xs text-slate-500 font-medium">All your generated images, captions & hashtags in one place</p>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative max-w-lg">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={librarySearchQuery}
                      onChange={(e) => setLibrarySearchQuery(e.target.value)}
                      placeholder="Search by title, caption, platform, hashtag..."
                      className="h-12 pl-12 pr-10 bg-white dark:bg-[#1E2438] border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all w-full"
                    />
                    {librarySearchQuery && (
                      <button onClick={() => setLibrarySearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 max-w-2xl">
                    <div className="bg-white dark:bg-[#1E2438] rounded-2xl border border-slate-100 dark:border-white/5 p-4 text-center">
                      <p className="text-2xl font-black text-primary">{allLibraryEntries.length}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Posts</p>
                    </div>
                    <div className="bg-white dark:bg-[#1E2438] rounded-2xl border border-slate-100 dark:border-white/5 p-4 text-center">
                      <p className="text-2xl font-black text-emerald-500">{libraryAssets.length}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Images</p>
                    </div>
                    <div className="bg-white dark:bg-[#1E2438] rounded-2xl border border-slate-100 dark:border-white/5 p-4 text-center">
                      <p className="text-2xl font-black text-violet-500">{allLibraryEntries.filter(e => e.hashtags).length}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">With Hashtags</p>
                    </div>
                  </div>

                  {/* Generated Images Section */}
                  {libraryAssets.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-white/5">
                        <div className="h-5 w-1 bg-emerald-500 rounded-full" />
                        <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-[3px]">Generated Images</h3>
                        <span className="ml-auto text-[9px] font-black text-slate-400 uppercase tracking-widest">{libraryAssets.length} assets</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {libraryAssets.map(asset => {
                          const isCarousel = asset.assetType === 'carousel';
                          const slideCount = isCarousel && Array.isArray(asset.metadata?.slides) ? asset.metadata.slides.length : 0;
                          const thumbUrl = asset.gcsUrl || (isCarousel && asset.metadata?.slides?.[0]) || '';
                          return (
                            <div key={asset._id} onClick={() => setSelectedAsset(asset)} className="group relative cursor-pointer">
                              <div className="aspect-square rounded-[24px] overflow-hidden border-2 border-white dark:border-zinc-900 shadow-lg group-hover:scale-[1.03] active:scale-95 transition-all duration-500">
                                {thumbUrl ? (
                                  <img src={toProxyUrl(thumbUrl)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Asset" onError={e => { e.currentTarget.style.display = 'none'; }} />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-zinc-900"><Layers className="w-8 h-8 text-zinc-600" /></div>
                                )}
                                {isCarousel && slideCount > 0 && (
                                  <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 bg-black/70 backdrop-blur-md text-white text-[7px] font-black uppercase tracking-[1.5px] rounded-lg border border-white/20">
                                    <Layers className="w-2.5 h-2.5" /> {slideCount} Slides
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                  <Download className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Captions & Hashtags Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-white/5">
                      <div className="h-5 w-1 bg-primary rounded-full" />
                      <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-[3px]">Captions & Hashtags</h3>
                      <span className="ml-auto text-[9px] font-black text-slate-400 uppercase tracking-widest">{allLibraryEntries.length} entries</span>
                    </div>

                    {allLibraryEntries.length === 0 ? (
                      <div className="text-center py-20">
                        <Library className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No content found</p>
                        <p className="text-xs text-slate-400 mt-2">Generate content using the Content Generator to populate your library</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {allLibraryEntries.map((entry, idx) => (
                          <div key={entry._id || idx} className="bg-white dark:bg-[#1E2438] rounded-[24px] border border-slate-100 dark:border-white/5 p-5 shadow-sm hover:shadow-lg transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight line-clamp-1">
                                  {entry.heading_hook || entry.title || 'Untitled'}
                                </h4>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-[9px] font-black text-slate-400 uppercase">{entry.format || entry.postType || 'Post'}</span>
                                  <span className="text-slate-300 dark:text-white/10">·</span>
                                  <span className="text-[9px] font-black text-slate-400 uppercase">{entry.platform || 'Multi'}</span>
                                  {entry.dateString && (
                                    <>
                                      <span className="text-slate-300 dark:text-white/10">·</span>
                                      <span className="text-[9px] font-bold text-slate-400">{entry.dateString}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {['instagram', 'twitter', 'linkedin', 'facebook'].map(p => {
                                  const ep = (entry.platform || '').toLowerCase();
                                  if (!ep.includes(p)) return null;
                                  return (
                                    <div key={p} className="text-primary">
                                      {p === 'instagram' && <Instagram className="w-3.5 h-3.5" />}
                                      {p === 'twitter' && <TwitterXIcon className="w-3.5 h-3.5" />}
                                      {p === 'linkedin' && <Linkedin className="w-3.5 h-3.5" />}
                                      {p === 'facebook' && <Facebook className="w-3.5 h-3.5" />}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Captions */}
                            <div className="space-y-2">
                              {(entry.captionShort || entry.short_caption) && (
                                <div className="bg-slate-50 dark:bg-white/[0.02] rounded-xl p-3 border border-slate-100 dark:border-white/5">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Short Caption</p>
                                    <button onClick={() => { navigator.clipboard.writeText(entry.captionShort || entry.short_caption || ''); toast.success('Copied!'); }} className="text-slate-400 hover:text-primary transition-colors">
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{entry.captionShort || entry.short_caption}</p>
                                </div>
                              )}
                              {(entry.captionLong || entry.long_caption) && (
                                <div className="bg-slate-50 dark:bg-white/[0.02] rounded-xl p-3 border border-slate-100 dark:border-white/5">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-[8px] font-black text-violet-500 uppercase tracking-widest">Full Caption</p>
                                    <button onClick={() => { navigator.clipboard.writeText(entry.captionLong || entry.long_caption || ''); toast.success('Copied!'); }} className="text-slate-400 hover:text-primary transition-colors">
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">{entry.captionLong || entry.long_caption}</p>
                                </div>
                              )}
                            </div>

                            {/* Hashtags */}
                            {entry.hashtags && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                    <Hash className="w-3 h-3" /> Hashtags
                                  </p>
                                  <button onClick={() => {
                                    const tags = Array.isArray(entry.hashtags) ? entry.hashtags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ') : String(entry.hashtags);
                                    navigator.clipboard.writeText(tags); toast.success('Hashtags copied!');
                                  }} className="text-slate-400 hover:text-primary transition-colors">
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {(Array.isArray(entry.hashtags) ? entry.hashtags : String(entry.hashtags).split(/[\s,]+/)).filter(Boolean).map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-black">
                                      {tag.startsWith('#') ? tag : `#${tag}`}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div className="flex-1 overflow-y-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 pb-24 items-start animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Content Generator Card */}
                <div onClick={() => setShowGeneratorOptions(true)} className="bg-gradient-to-br from-primary/10 to-transparent dark:from-primary/20 dark:to-transparent rounded-[32px] border border-primary/20 p-6 flex flex-col justify-center items-center w-full shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 cursor-pointer group min-h-[220px]">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white tracking-widest text-center">Content Generator</h3>
                  <p className="text-[10px] text-slate-500 text-center mt-2 font-black uppercase tracking-wider opacity-70">Create automated or manual posts</p>
                </div>

                {/* Content Library Card */}
                <div onClick={() => setShowContentLibrary(true)} className="bg-gradient-to-br from-emerald-500/10 to-transparent dark:from-emerald-500/20 dark:to-transparent rounded-[32px] border border-emerald-500/20 p-6 flex flex-col justify-center items-center w-full shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 cursor-pointer group min-h-[220px]">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-inner">
                    <Library className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white tracking-widest text-center">Content Library</h3>
                  <p className="text-[10px] text-slate-500 text-center mt-2 font-black uppercase tracking-wider opacity-70">Images, captions & hashtags</p>
                </div>

                {calendarWorkspaces.map(ws => {
                  const profile = ws.brandProfile || {};
                  const isCurrent = ws._id === workspace?._id;
                  const entriesCount = isCurrent ? calendarEntries.length : (ws.calendarEntryCount || ws.onboarding?.calendarCount || 0);

                  return (
                    <div key={ws._id} className={`bg-white dark:bg-[#1E2438] rounded-[32px] border p-6 flex flex-col w-full shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 group animate-in slide-in-from-left-4 ${isCurrent ? 'border-primary shadow-primary/10' : 'border-slate-100 dark:border-white/5'}`}>
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 overflow-hidden border border-slate-100 dark:border-white/10 flex-shrink-0 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                          {(() => {
                            const rawUrl = (isCurrent ? activeProfile?.logoUrl : profile.logoUrl) || ws.onboarding?.profileImageUrl;
                            const name = (isCurrent ? activeProfile?.companyName : profile.companyName) || ws.workspaceName || 'B';

                            if (!rawUrl) {
                              return (
                                <div className="w-full h-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center text-xl font-black uppercase">
                                  {name.charAt(0)}
                                </div>
                              );
                            }

                            const finalUrl = toProxyUrl(rawUrl);

                            return (
                              <img
                                src={finalUrl}
                                className="w-full h-full object-contain p-1"
                                alt="Logo"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                  if (target.parentElement) {
                                    const fallback = document.createElement('div');
                                    fallback.className = "w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl uppercase";
                                    fallback.textContent = name.charAt(0);
                                    target.parentElement.appendChild(fallback);
                                  }
                                }}
                              />
                            );
                          })()}
                        </div>
                        <div className="flex-1 overflow-hidden pt-1">
                          <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-widest truncate mb-0.5">
                            {(isCurrent ? activeProfile?.companyName : profile.companyName) || ws.workspaceName || 'Brand'}
                          </h3>
                          <div className="flex items-center gap-1.5 opacity-50">
                            <History className="w-3 h-3 text-slate-400" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{new Date(ws.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
                          <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[2px] text-slate-400"><Calendar className="w-3.5 h-3.5 opacity-50" /> Monthly Plan</span>
                          <span className={`px-2 py-0.5 font-black rounded-lg text-[9px] ${isCurrent ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
                            {entriesCount} Slots
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: entriesCount > 0 ? '100%' : '0%' }} title="Plan Confidence" />
                        </div>
                      </div>

                      <div className="flex gap-2.5 mt-auto">
                        <button
                          onClick={() => {
                            if (!isCurrent) switchWorkspace(ws);
                            setShowPreviewModal(true);
                          }}
                          className="flex-1 h-11 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
                        >
                          <Eye className="w-4 h-4" /> Preview
                        </button>

                        {isCurrent && (
                          <button
                            onClick={() => handleExportExcel(ws._id)}
                            title="Download Excel"
                            className="h-11 w-11 bg-slate-50 dark:bg-white/5 hover:bg-green-500/10 text-slate-400 hover:text-green-500 rounded-xl flex items-center justify-center transition-all border border-slate-100 dark:border-white/5 hover:border-green-500/20"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={async () => {
                            const wsName = ws.workspaceName || 'this brand';
                            if (!window.confirm(`Clear all calendar entries for "${wsName}"?\n\nThis removes the content calendar only. The brand and its settings will be kept.`)) return;
                            const toastId = toast.loading(`Clearing calendar for ${wsName}...`);
                            try {
                              const res = await apiService.clearCalendarForWorkspace(ws._id);
                              if (res.success) {
                                toast.success(`Calendar cleared for ${wsName}`, { id: toastId });
                                // Update local state immediately
                                if (ws._id === workspace?._id) setCalendarEntries([]);
                                // Refresh allWorkspaces so the switcher count resets to 0
                                const wsList = await apiService.getSocialAgentWorkspaces();
                                if (wsList.success) setAllWorkspaces(wsList.workspaces);
                              } else {
                                toast.error('Clear failed', { id: toastId });
                              }
                            } catch (err) {
                              toast.error('Error clearing calendar', { id: toastId });
                            }
                          }}
                          title="Clear Content Calendar"
                          className="h-11 w-11 bg-slate-50 dark:bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-all border border-slate-100 dark:border-white/5 hover:border-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }

          return (
            <div className="flex-1 overflow-hidden flex flex-col space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end px-2 gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-1">Imported Schedule</h3>
                  <p className="text-xs text-slate-500 font-medium lowercase italic">Total of {calendarEntries.length} potential posts detected across platforms.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
                  <button onClick={() => setShowPreviewModal(false)} className="flex-1 sm:flex-none justify-center px-4 sm:px-6 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-slate-300">
                    <X className="w-4 h-4" /> Exit Preview
                  </button>

                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
                  {calendarEntries.map((entry, idx) => (
                    <div key={entry._id || idx} className="bg-white dark:bg-[#1E2438] rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden flex flex-col shadow-sm animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 50}ms` }}>
                      <div className="p-4 flex-1 flex flex-col">
                        {/* Header Row */}
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex flex-wrap gap-1.5">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20">
                              <Calendar className="w-2.5 h-2.5" />
                              <span className="text-[9px] font-black uppercase tracking-widest">{new Date(entry.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${entry.postType === 'Video' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 border-amber-200' : entry.postType === 'Carousel' ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 border-indigo-200' : 'bg-blue-100 dark:bg-primary/10 text-primary border-blue-200'}`}>
                              {entry.postType}
                            </span>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry._id); }} className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex-1">
                          {/* HEADING */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight line-clamp-2 flex-1">
                              {entry.heading_hook || entry.title || 'Strategizing...'}
                            </h4>
                            <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(entry.heading_hook || entry.title || ''); toast.success('Copied!'); }} className="shrink-0 mt-0.5">
                              <Copy className="w-3 h-3 text-slate-400" />
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-400 italic mb-3 line-clamp-1">
                            "{entry.subHeading || entry.sub_heading || entry.hook || ''}"
                          </p>

                          {/* METADATA COMPACT ROW */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 p-2 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                            <span className="text-[9px] font-black text-slate-500 uppercase">{entry.format || entry.postType || 'N/A'}</span>
                            <span className="text-slate-300 dark:text-white/10">·</span>
                            <span className="text-[9px] font-black text-slate-500 uppercase">{entry.phase || 'N/A'}</span>
                            <span className="text-slate-300 dark:text-white/10">·</span>
                            <div className="flex gap-1">
                              {['instagram', 'twitter', 'linkedin', 'facebook'].map(p => {
                                const ep = entry.platform?.toLowerCase() || '';
                                const rawP = (entry.rawData?.Platform || entry.rawData?.platform || '').toLowerCase();
                                if (!ep.includes(p) && !rawP.includes(p)) return null;
                                return (
                                  <div key={p} className="text-primary">
                                    {p === 'instagram' && <Instagram className="w-3 h-3" />}
                                    {p === 'twitter' && <TwitterXIcon className="w-3 h-3" />}
                                    {p === 'linkedin' && <Linkedin className="w-3 h-3" />}
                                    {p === 'facebook' && <Facebook className="w-3 h-3" />}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* CONTENT BLOCKS */}
                          <div className="space-y-2 max-h-[100px] overflow-y-auto pr-1 custom-scrollbar">
                            {/* SHORT CA */}
                            {(entry.captionShort || entry.short_caption) && (
                              <div className="group/field relative">
                                <div className="flex items-center justify-between mb-1.5">
                                  <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Zap className="w-3 h-3" /> SHORT CA
                                  </p>
                                  <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(entry.captionShort || entry.short_caption || ''); toast.success('Copied!'); }} className="transition-opacity focus:outline-none">
                                    <Copy className="w-3 h-3 text-slate-400 hover:text-indigo-500 transition-colors" />
                                  </button>
                                </div>
                                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-bold">
                                  {entry.captionShort || entry.short_caption}
                                </p>
                              </div>
                            )}

                            {/* LONG CAP */}
                            {(entry.captionLong || entry.long_caption) && (
                              <div className="group/field relative">
                                <div className="flex items-center justify-between mb-1.5">
                                  <p className="text-[8px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                                    <FileText className="w-3 h-3" /> LONG CAP
                                  </p>
                                  <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(entry.captionLong || entry.long_caption || ''); toast.success('Copied!'); }} className="transition-opacity focus:outline-none">
                                    <Copy className="w-3 h-3 text-slate-400 hover:text-primary transition-colors" />
                                  </button>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                  {entry.captionLong || entry.long_caption}
                                </p>
                              </div>
                            )}

                            {/* HASHTAGS */}
                            {entry.hashtags && (
                              <div className="group/field relative">
                                <div className="flex items-center justify-between mb-1.5">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Hash className="w-3 h-3" /> HASHTAGS
                                  </p>
                                  <button onClick={(e) => {
                                    e.stopPropagation();
                                    const tags = Array.isArray(entry.hashtags) ? entry.hashtags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ') : String(entry.hashtags);
                                    navigator.clipboard.writeText(tags || '');
                                    toast.success('Copied!');
                                  }} className="transition-opacity focus:outline-none">
                                    <Copy className="w-3 h-3 text-slate-400 hover:text-primary transition-colors" />
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {(Array.isArray(entry.hashtags) ? entry.hashtags : String(entry.hashtags).split(/[\s,]+/)).filter(Boolean).map((tag, i) => (
                                    <span key={i} className="text-[9px] font-bold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded-md">
                                      {tag.startsWith('#') ? tag : `#${tag}`}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* SLIDE / REEL BREAKDOWN */}
                            {entry.breakdown && (
                              <div>
                                <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                  <Layers className="w-3 h-3" /> SLIDE / REEL BREAKDOWN
                                </p>
                                <p className="text-[9px] text-slate-400 font-medium italic bg-slate-50 dark:bg-white/[0.01] p-2 rounded-xl border border-slate-100 dark:border-white/5">
                                  {typeof entry.breakdown === 'string' ? entry.breakdown : JSON.stringify(entry.breakdown)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                          {/* DYNAMIC ISOLATION: Check for visual artifacts separately from content status */}
                          {(assets && assets.some(a => a.calendarEntryId === entry._id)) ? (
                            <>
                              <button
                                onClick={() => {
                                  const generatedAsset = assets?.find(a => a.calendarEntryId === entry._id);
                                  if (generatedAsset) setSelectedAsset(generatedAsset);
                                  setActiveTab('assets');
                                }}
                                disabled={!!visualGenRowId}
                                className="h-9 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-500 text-white"
                              >
                                {visualGenRowId === String(entry._id) ? (
                                  <><RefreshCw className="w-3 h-3 animate-spin" /> Generating...</>
                                ) : (
                                  <><Layers className="w-3 h-3" /> View Post</>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  if (visualGenRowId === String(entry._id)) {
                                    cancelJobRef.current = true;
                                    setVisualGenRowId(null);
                                    if (activeJobIdRef.current) {
                                      apiService.cancelSocialAgentJob(activeJobIdRef.current);
                                      activeJobIdRef.current = null;
                                    }
                                    toast.error("Visual regeneration stopped.");
                                    return;
                                  }
                                  if (!isPremium && !isAdmin) {
                                    window.dispatchEvent(new CustomEvent('premium_required', {
                                      detail: {
                                        toolName: 'AI Ads Visuals',
                                        customMessage: 'Regenerating visual posts is a premium feature. Upgrade to Pro to re-generate AI-powered brand visuals.'
                                      }
                                    }));
                                    return;
                                  }
                                  setGenPostModal({ open: true, entry, format: 'single' });
                                }}
                                disabled={(!!visualGenRowId && visualGenRowId !== String(entry._id)) || isProcessing}
                                className={`h-9 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 ${visualGenRowId === String(entry._id) ? 'bg-indigo-600 text-white' : 'bg-slate-800 dark:bg-white/10 text-white'}`}
                              >
                                {visualGenRowId === String(entry._id) ? (
                                  <><RefreshCw className="w-3 h-3 animate-spin" /> Regen...</>
                                ) : (
                                  <><RefreshCw className="w-3 h-3" /> {!isPremium && !isAdmin ? <Lock className="w-2.5 h-2.5 inline ml-0.5" /> : null} Regen Visual</>
                                )}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  if (visualGenRowId === String(entry._id)) {
                                    cancelJobRef.current = true;
                                    setVisualGenRowId(null);
                                    if (activeJobIdRef.current) {
                                      apiService.cancelSocialAgentJob(activeJobIdRef.current);
                                      activeJobIdRef.current = null;
                                    }
                                    toast.error("Visual generation stopped.");
                                    return;
                                  }
                                  setGenPostModal({ open: true, entry, format: 'single' });
                                }}
                                disabled={(!!visualGenRowId && visualGenRowId !== String(entry._id)) || isProcessing}
                                className={`col-span-1 h-9 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 ${visualGenRowId === String(entry._id) ? 'bg-indigo-600 text-white' : 'bg-primary text-white'}`}
                              >
                                {visualGenRowId === String(entry._id) ? (
                                  <><RefreshCw className="w-3 h-3 animate-spin" /> Generating...</>
                                ) : (
                                  <><Sparkles className="w-3 h-3" /> Gen Post</>
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  if (isProcessing) {
                                    cancelRegenRef.current = true;
                                    setIsProcessing(false);
                                    toast.error("Regeneration stopped.");
                                    return;
                                  }
                                  if (!isPremium && !isAdmin) {
                                    window.dispatchEvent(new CustomEvent('premium_required', {
                                      detail: {
                                        toolName: 'AI Content Regeneration',
                                        customMessage: 'Regenerating post content is a premium feature. Upgrade to Pro to refresh your AI-generated copy with a single click.'
                                      }
                                    }));
                                    return;
                                  }
                                  handleRegeneratePost(entry._id);
                                }}
                                disabled={!!visualGenRowId}
                                className="col-span-1 h-9 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all bg-slate-800 dark:bg-white/10 text-white disabled:opacity-50"
                                title={!isPremium && !isAdmin ? 'Upgrade to Pro to regenerate post content' : 'Regenerate the text content for this post'}
                              >
                                {isProcessing ? (
                                  <><RefreshCw className="w-3 h-3 animate-spin" /> Regen...</>
                                ) : (
                                  <><RefreshCw className="w-3 h-3" /> {!isPremium && !isAdmin ? <Lock className="w-2.5 h-2.5 inline ml-0.5" /> : null} Regenerate</>
                                )}
                              </button>
                            </>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2 px-0.5">
                          <button
                            onClick={() => { setHashtagTopic(entry.title || entry.hook); setActiveTab('hashtags'); }}
                            className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                          >
                            <Hash className="w-2.5 h-2.5" /> Viral Tags
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  const renderUsageBilling = () => {
    const remainingVideos = usage.videoLimit - usage.videoUsed;
    const remainingCarousels = usage.carouselLimit - usage.carouselUsed;
    const nearQuota = (usage.imageUsed / usage.imageLimit) > 0.8;

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-[#1E2438] rounded-[40px] border border-slate-100 dark:border-white/5 p-12 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <BarChart3 className="w-64 h-64 text-primary" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center border border-primary/20">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Plan Quotas</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest">Cycle: {usage.billingMonth}</p>
                </div>
              </div>

              <div className="space-y-12">
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Image Generation</p>
                      <h4 className="text-4xl font-black text-slate-800 dark:text-white">{usage.imageUsed} / {usage.imageLimit}</h4>
                    </div>
                    <span className={`text-xs font-black uppercase ${nearQuota ? 'text-red-500' : 'text-primary'}`}>
                      {nearQuota ? '⚠️ Near Limit' : `${((usage.imageUsed / usage.imageLimit) * 100).toFixed(0)}% Used`}
                    </span>
                  </div>
                  <div className="h-4 bg-slate-100 dark:bg-white/[0.03] rounded-full overflow-hidden border border-slate-200 dark:border-white/5 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(usage.imageUsed / usage.imageLimit) * 100}%` }}
                      className={`h-full ${nearQuota ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-primary to-indigo-600 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="p-6 rounded-[28px] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                    <div className="flex justify-between items-center mb-4">
                      <Layers className={`w-5 h-5 ${remainingCarousels > 0 ? 'text-indigo-500' : 'text-slate-400'}`} />
                      <span className="px-2 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg text-[8px] font-black uppercase tracking-widest">Carousels</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Remaining</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{remainingCarousels}</p>
                  </div>

                  <div className="p-6 rounded-[28px] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                    <div className="flex justify-between items-center mb-4">
                      <Video className={`w-5 h-5 ${remainingVideos > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                      <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[8px] font-black uppercase tracking-widest">Videos</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Remaining</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{remainingVideos}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E2438] rounded-[40px] border border-slate-100 dark:border-white/5 p-8 flex flex-col shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles className="w-12 h-12 text-primary" /></div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">Plan Intelligence</h3>
            <div className="ads-badge-small !bg-primary/10 !text-primary mb-8 w-fit">RULE-BASED RECOMMENDATIONS</div>

            <div className="space-y-6 flex-1">
              {remainingVideos > 0 && (
                <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0"><Video className="w-5 h-5 text-amber-500" /></div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 leading-relaxed mb-1">
                      You have <span className="text-amber-600">{remainingVideos} videos</span> left. Consider using them for high-engagement product demos.
                    </p>
                    <span className="text-[8px] font-black text-amber-500 uppercase">Priority Rec</span>
                  </div>
                </div>
              )}
              {remainingCarousels > 0 && (
                <div className="p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0"><Layers className="w-5 h-5 text-indigo-500" /></div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 leading-relaxed mb-1">
                      <span className="text-indigo-600">{remainingCarousels} Multi-slide posts</span> available. Perfect for "Step-by-step" educational content.
                    </p>
                    <span className="text-[8px] font-black text-indigo-500 uppercase">Maximize engagement</span>
                  </div>
                </div>
              )}
              {nearQuota && (
                <div className="p-5 rounded-3xl bg-red-500/5 border border-red-500/10 flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0"><AlertCircle className="w-5 h-5 text-red-500" /></div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 leading-relaxed mb-1">
                      Running low on image quota. Save remaining for your most critical announcements.
                    </p>
                    <span className="text-[8px] font-black text-red-500 uppercase">Quota Warning</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderApprovalQueue = () => {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col space-y-8">
        <div className="flex justify-between items-end bg-white/50 dark:bg-white/[0.02] p-8 rounded-[40px] border border-slate-100 dark:border-white/5 mt-0">
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">Review Queue</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">Verify AI drafts before they hit the schedule.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="ads-badge-small !bg-indigo-500/10 !text-indigo-500 uppercase">{reviewQueue.length} Pending Review</div>
          </div>
        </div>

        {reviewQueue.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-40">
            <div className="w-20 h-20 rounded-[32px] bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
              <CheckSquare className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Queue is Clear</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">All caught up! Start a new generation job to fill the queue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {reviewQueue.map(post => (
              <div key={post._id} className="bg-white dark:bg-[#1E2438] rounded-[40px] border border-slate-100 dark:border-white/5 overflow-hidden flex flex-col shadow-sm">
                <div className="aspect-video relative bg-slate-50 dark:bg-black/20">
                  <img src={post.primaryAssetId?.gcsUrl} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="ads-badge-small !bg-black/60 !backdrop-blur-md !text-white !border-white/10 uppercase">{post.platform}</div>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex-1 mb-8">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest block mb-2">{post.type} Hook</span>
                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4 line-clamp-2">{post.hook}</h4>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                      <p className="text-[11px] text-slate-400 font-bold leading-relaxed line-clamp-3">{post.captionLong}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleApprove(post._id)}
                      disabled={isProcessing}
                      className="h-12 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve
                    </button>
                    <button
                      onClick={() => handleReject(post._id)}
                      disabled={isProcessing}
                      className="h-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />} Reject
                    </button>
                  </div>
                  <button
                    onClick={() => fetchPostHistory(post)}
                    className="mt-4 w-full h-12 bg-slate-50 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-indigo-600/10 hover:text-indigo-600 transition-all"
                  >
                    Compare & Comment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderScheduler = () => {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col space-y-8">
        <div className="flex justify-between items-end bg-white/50 dark:bg-white/[0.02] p-8 rounded-[40px] border border-slate-100 dark:border-white/5 mt-0">
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">Publishing Hub</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">Manage your approved posts queue and schedule.</p>
          </div>
          <div className="flex gap-3">
            <button className="h-12 px-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-primary transition-all">List View</button>
            <button className="h-12 px-6 bg-primary text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-primary/20">Calendar View</button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E2438] rounded-[40px] border border-slate-100 dark:border-white/5 overflow-hidden flex flex-col shadow-sm">
          <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Approved & Scheduled Queue</h3>
            <span className="text-[10px] font-black text-slate-400">Showing {scheduleItems.length} tasks</span>
          </div>

          <div className="p-4">
            {scheduleItems.length === 0 ? (
              <div className="p-20 text-center opacity-30">
                <Clock className="w-16 h-16 mx-auto mb-6 text-slate-400" />
                <p className="text-[10px] font-black uppercase tracking-[4px]">Nothing scheduled yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduleItems.map(item => (
                  <div key={item._id} className="p-6 rounded-[32px] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center justify-between hover:border-primary/40 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 dark:bg-[#161B2E]">
                        <img src={item.postId?.primaryAssetId?.gcsUrl} className="w-full h-full object-cover" alt="Thumb" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase line-clamp-1 mb-1">{item.postId?.hook}</h4>
                        <div className="flex items-center gap-3">
                          <div className="ads-badge-small !bg-black !text-white !border-none text-[8px]">{item.platform}</div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(item.scheduledFor).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest block mb-1">Status: {item.publishStatus}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase">{item.timezone || 'UTC'}</span>
                      </div>
                      <button className="w-12 h-12 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"><X className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-[#1E2438] rounded-[40px] border border-slate-100 dark:border-white/5 p-10 space-y-10 shadow-sm">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-1">Workspace Config</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global preferences for AI orchestration</p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-slate-100 dark:border-white/5">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-700 dark:text-zinc-300 mb-1">Approval Requirement</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Always review posts manually</p>
                </div>
                <div className="w-14 h-8 bg-primary rounded-full relative p-1 cursor-pointer">
                  <div className="w-6 h-6 bg-white rounded-full absolute right-1" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">Default Logo Placement</label>
                <div className="grid grid-cols-2 gap-4">
                  {['Top-Right', 'Bottom-Right', 'Top-Left', 'Bottom-Left'].map(pos => (
                    <button key={pos} className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${pos === 'Top-Right' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-white/5 text-slate-400'}`}>
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">Default Scheduling Time</label>
                <input type="text" value="10:00 AM" readOnly className="w-full h-14 bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/10 rounded-2xl px-6 text-xs font-bold font-mono outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-[#1E2438] rounded-[40px] border border-slate-100 dark:border-white/5 p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20"><HelpCircle className="w-6 h-6 text-indigo-500" /></div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Platform Integration</h3>
              </div>
              <div className="space-y-4">
                {['Instagram', 'Facebook', 'LinkedIn', 'YouTube'].map(plat => (
                  <div key={plat} className="p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                    <span className="text-[10px] font-black uppercase">{plat}</span>
                    <span className="text-[8px] font-black bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">Connect</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-red-500/5 border border-red-500/10 rounded-[32px] p-8">
              <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-2">Danger Zone</h4>
              <p className="text-[10px] text-slate-500 font-bold mb-6">Irreversibly delete this workspace and all associated AI artifacts.</p>
              <button
                onClick={() => handleDeleteBrand(workspace?._id, workspace?.workspaceName)}
                disabled={isProcessing}
                className="w-full h-14 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
              >
                {isProcessing ? "Cleaning Core..." : "Destroy Workspace"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComingSoon = (tabId) => {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center opacity-40 animate-in fade-in duration-1000">
        <div className="w-24 h-24 rounded-[32px] bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-8 border border-white/5">
          <Layers className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4">Module: {tabId.toUpperCase()}</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm max-w-sm">
          This advanced capability is currently being calibrated in Phase 2 development. Check back soon for full integration.
        </p>
        <button onClick={() => setActiveTab('overview')} className="mt-12 text-xs font-black text-primary uppercase tracking-[4px] border-b-2 border-primary pb-1">Return to Overview</button>
      </div>
    );
  };

  const renderContentOrchestration = () => {
    const guard = renderModuleGuard("Content Calendar");
    if (guard) return guard;
    const finalRows = (pipelineRows?.length || 0) > 0 ? pipelineRows : calendarEntries;

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-auto flex flex-col space-y-6 pb-32">
        {/* Step 1: Strategy Context Selector */}
        <div className="bg-white dark:bg-[#080808] p-6 lg:p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-md w-full">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] block mb-4">Select Target Brand Strategy</label>
              <CustomSelect
                value={calendarWorkspaces.some(w => w._id === workspace?._id) ? workspace?._id : ''}
                onChange={(val) => {
                  const ws = allWorkspaces.find(b => b._id === val);
                  if (ws) {
                    switchWorkspace(ws);
                    fetchPipelines(ws._id);
                  }
                }}
                options={calendarWorkspaces.length === 0 ? [{ value: '', label: 'Discovery: No Content Calendars Found' }] : [
                  ...(calendarWorkspaces.some(w => w._id === workspace?._id) ? [] : [{ value: '', label: 'Select a brand with a calendar...' }]),
                  ...calendarWorkspaces.map(b => ({
                    value: b._id,
                    label: b.workspaceName || b.brandProfile?.companyName || "Untitled Brand"
                  }))
                ]}
                className="h-16 pl-6 pr-12 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl text-xs"
                color="primary"
              />
            </div>

            {workspace && (
              <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-slate-100 dark:border-white/5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-[#161B2E] border border-slate-200 dark:border-white/10 flex items-center justify-center p-2">
                  {(activeProfile?.logoUrl || workspace?.brandProfile?.logoUrl || workspace?.onboarding?.profileImageUrl) ? (
                    <img
                      src={toProxyUrl(activeProfile?.logoUrl || workspace?.brandProfile?.logoUrl || workspace?.onboarding?.profileImageUrl)}
                      className="w-full h-full object-contain"
                      alt="Logo"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary text-white flex items-center justify-center text-xl font-black">
                      {(activeProfile?.companyName || workspace?.workspaceName || 'B').charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none mb-1">{workspace.workspaceName}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Brand Ecosystem</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>



        {/* Dynamic Content Generation Pipeline */}
        {isPipelineLoading ? (
          <div className="flex flex-col items-center justify-center p-32 bg-white dark:bg-[#080808]/50 rounded-[40px] border border-slate-100 dark:border-white/5 space-y-6">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] animate-pulse">Establishing Secure Brand Connection...</p>
          </div>
        ) : finalRows.length > 0 ? (
          <div className="bg-white dark:bg-[#080808]/50 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-xl animate-in slide-in-from-bottom-8 duration-700 min-h-[400px] sm:min-h-[500px] flex flex-col">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Server className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Orchestration Pipeline: {workspace?.workspaceName}</h3>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase mt-1">{finalRows.length} Strategized Rows Detected</p>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full overflow-y-auto custom-scrollbar">
              {/* Desktop View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse table-auto">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phase</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategy / Hook</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Type</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {finalRows.map((row, idx) => (
                      <tr key={row._id || idx} className="group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3 whitespace-nowrap">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex flex-col items-center justify-center border border-slate-200 dark:border-white/10 group-hover:border-primary/30 transition-colors">
                              <span className="text-[9px] font-black text-primary leading-none">{new Date(row.scheduledDate).getDate()}</span>
                              <span className="text-[6px] font-black text-slate-400 uppercase tracking-tighter">{new Date(row.scheduledDate).toLocaleString('default', { month: 'short' })}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {['instagram', 'linkedin', 'x', 'facebook', 'youtube'].map(p => {
                              const active = (row.platform || row.rawData?.Platform || '').toLowerCase().includes(p) || (p === 'x' && (row.platform || row.rawData?.Platform || '').toLowerCase().includes('twitter'));
                              if (!active) return null;
                              return (
                                <div key={p} className="p-1.5 rounded-lg bg-primary/5 text-primary border border-primary/10 group-hover:border-primary/30 transition-all">
                                  {p === 'instagram' && <Instagram className="w-3 h-3" />}
                                  {p === 'linkedin' && <Linkedin className="w-3 h-3" />}
                                  {p === 'x' && <TwitterXIcon className="w-3 h-3" />}
                                  {p === 'facebook' && <Facebook className="w-3 h-3" />}
                                  {p === 'youtube' && <Youtube className="w-3 h-3" />}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10">
                            {row.phase || row.rawData?.Phase || "Awareness"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="max-w-[200px] xl:max-w-[350px]">
                            <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight mb-0.5 truncate group-hover:text-primary transition-colors">
                              {row.heading_hook || row.title || row.rawData?.Title}
                            </p>
                            <p className="text-[9px] text-slate-400 font-medium truncate italic opacity-60">
                              {row.sub_heading || row.hook || row.rawData?.Hook || "Defining direction..."}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${(row.postType || row.format || row.rawData?.Format) === 'Video' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 border-amber-200/50' :
                            (row.postType || row.format || row.rawData?.Format) === 'Carousel' ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 border-indigo-200/50' :
                              'bg-blue-100 dark:bg-primary/10 text-primary border-blue-200/50'
                            }`}>
                            {row.postType || row.format || row.rawData?.Format}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {row.status === 'generated' ? (
                              <button
                                onClick={() => {
                                  const post = generatedPosts.find(p => ensureStringId(p.calendarEntryId) === ensureStringId(row._id));
                                  const asset = assets?.find(a =>
                                    (post && ensureStringId(a.postId) === ensureStringId(post._id)) ||
                                    ensureStringId(a.calendarEntryId) === ensureStringId(row._id)
                                  );
                                  if (asset) {
                                    setSelectedAsset(asset);
                                  } else {
                                    // Navigate to Direct Synthesis view (text content)
                                    setActiveGenerationRowId(ensureStringId(row._id));
                                  }
                                }}
                                className="h-9 px-4 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2"
                              >
                                <Eye className="w-3 h-3" /> View
                              </button>
                            ) : (
                              <button
                                onClick={() => handleGenerateContent('single', 1, [row._id])}
                                disabled={isGenerating}
                                className="h-9 px-4 bg-primary text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2"
                              >
                                <Sparkle className="w-3 h-3" /> Gen Content
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="lg:hidden p-4 space-y-4">
                {finalRows.map((row, idx) => (
                  <div key={row._id || idx} className="p-5 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex flex-col items-center justify-center border border-primary/20">
                          <span className="text-[11px] font-black text-primary leading-none">{new Date(row.scheduledDate).getDate()}</span>
                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">{new Date(row.scheduledDate).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">
                            {row.heading_hook || row.title || row.rawData?.Title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1.5 py-0.5 bg-white dark:bg-[#161B2E] rounded border border-slate-200 dark:border-white/10">
                              {row.phase || row.rawData?.Phase || "Awareness"}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${(row.postType || row.format || row.rawData?.Format) === 'Video' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 border-amber-200/50' :
                              (row.postType || row.format || row.rawData?.Format) === 'Carousel' ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 border-indigo-200/50' :
                                'bg-blue-100 dark:bg-primary/10 text-primary border-blue-200/50'
                              }`}>
                              {row.postType || row.format || row.rawData?.Format}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {['instagram', 'linkedin', 'x', 'facebook', 'youtube'].map(p => {
                          const active = (row.platform || row.rawData?.Platform || '').toLowerCase().includes(p) || (p === 'x' && (row.platform || row.rawData?.Platform || '').toLowerCase().includes('twitter'));
                          if (!active) return null;
                          return (
                            <div key={p} className="p-1 rounded-lg bg-primary/5 text-primary border border-primary/10">
                              {p === 'instagram' && <Instagram className="w-3 h-3" />}
                              {p === 'linkedin' && <Linkedin className="w-3 h-3" />}
                              {p === 'x' && <TwitterXIcon className="w-3 h-3" />}
                              {p === 'facebook' && <Facebook className="w-3 h-3" />}
                              {p === 'youtube' && <Youtube className="w-3 h-3" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic border-l-2 border-primary/20 pl-3">
                      {row.sub_heading || row.hook || row.rawData?.Hook || "Defining direction..."}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'generated' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {row.status === 'generated' ? 'Ready' : 'Pending Gen'}
                        </span>
                      </div>

                      {row.status === 'generated' ? (
                        <button
                          onClick={() => {
                            const post = generatedPosts.find(p => ensureStringId(p.calendarEntryId) === ensureStringId(row._id));
                            const asset = assets?.find(a =>
                              (post && ensureStringId(a.postId) === ensureStringId(post._id)) ||
                              ensureStringId(a.calendarEntryId) === ensureStringId(row._id)
                            );
                            if (asset) {
                              setSelectedAsset(asset);
                            } else {
                              // Navigate to Direct Synthesis view (text content)
                              setActiveGenerationRowId(ensureStringId(row._id));
                            }
                          }}
                          className="h-10 px-6 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGenerateContent('single', 1, [row._id])}
                          disabled={isGenerating}
                          className="h-10 px-6 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2"
                        >
                          <Sparkle className="w-3.5 h-3.5" /> Gen Content
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-20 bg-white dark:bg-[#080808]/50 rounded-[60px] border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 mb-6">
              <Layers className="w-8 h-8 opacity-20" />
            </div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[4px]">Awaiting Pipeline Connection</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Select a brand strategy above to view and orchestrate content rows.</p>
          </div>
        )}
      </div>
    );
  };

  const renderHashtagStudio = () => {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col space-y-10">
        <div className="relative p-12 rounded-[50px] bg-gradient-to-br from-[#0A2342] to-[#123C69] overflow-hidden group border border-white/10 shadow-2xl shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="w-24 h-24 rounded-[32px] bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-white shrink-0">
              <Hash className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-3 leading-none">Hashtag Intelligence Studio</h2>
              <p className="text-blue-100/60 font-semibold text-sm max-w-xl">
                Stop guessing. Our AI scans millions of trending conversations to identify high-converting tags for {brandProfile.companyName || 'your brand'}.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 glass-morphism p-8 rounded-[40px] border border-slate-100 dark:border-white/5 space-y-8">
            <div className="space-y-4">
              <label htmlFor="hashtagNiche" className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 cursor-pointer">Target Niche / Content Topic</label>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="hashtagNiche"
                  className="w-full h-16 pl-14 pr-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary/20 transition-all"
                  placeholder="e.g. Sustainable Fashion, AI Tech..."
                  value={hashtagTopic || ''}
                  onChange={(e) => setHashtagTopic(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={handleGenerateHashtags}
              disabled={isHashtagLoading || !hashtagTopic}
              className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isHashtagLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkle className="w-4 h-4 fill-current" />}
              Generate Viral Cluster
            </button>

            <div className="pt-8 border-t border-slate-100 dark:border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-6">Discovery Presets</h4>
              <div className="flex flex-wrap gap-2">
                {['#growth', '#marketing', '#aiagent', '#innovation', '#saas', '#b2b'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setHashtagTopic(tag.replace('#', ''))}
                    className="px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-[10px] font-bold text-slate-500 whitespace-nowrap cursor-pointer hover:border-primary/30 transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 glass-morphism p-10 rounded-[40px] border border-slate-100 dark:border-white/5 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
            {!hashtagInsights ? (
              <>
                <div className="w-20 h-20 rounded-[28px] bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-200 mb-8">
                  <Copy className="w-8 h-8 opacity-20" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-3">No Cluster Ready</h3>
                <p className="text-xs font-medium text-slate-400 max-w-sm text-center">Enter a topic on the left to activate the AI scanning engine and generate optimized hash-groups.</p>
              </>
            ) : (
              <div className="w-full text-left space-y-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(hashtagInsights.viralClusters || []).map((cluster, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-white/[0.02] p-8 rounded-3xl border border-slate-100 dark:border-white/5 group/cluster relative overflow-hidden">
                      <div className="ads-badge-small mb-4 !bg-primary/10 !text-primary !border-primary/20 uppercase">{cluster.category}</div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {(cluster.tags || []).map(tag => (
                          <button
                            key={tag}
                            onClick={() => {
                              navigator.clipboard.writeText(tag);
                              toast.success(`Copied ${tag}`);
                            }}
                            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors hover:scale-110"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(cluster.tags.join(' '));
                          toast.success("Cluster copied!");
                        }}
                        className="absolute top-6 right-6 transition-opacity text-slate-400 hover:text-primary"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 rounded-[36px] text-white">
                  <h4 className="text-[10px] font-black uppercase tracking-[4px] mb-6 opacity-60">Brand Personalized Tags</h4>
                  <div className="flex flex-wrap gap-3">
                    {(hashtagInsights.brandSpecific || []).map(tag => (
                      <div key={tag} className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs font-black tracking-widest hover:bg-white/20 transition-all cursor-pointer">
                        {tag}
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase opacity-60">Strategy: {hashtagInsights.recommendedVolume}</span>
                    <button
                      onClick={() => {
                        const all = [...(hashtagInsights.viralClusters || []).flatMap(c => c.tags || []), ...(hashtagInsights.brandSpecific || [])].join(' ');
                        navigator.clipboard.writeText(all);
                        toast.success("Full Intelligence Suite Copied!");
                      }}
                      className="flex items-center gap-2 text-[10px] font-black uppercase bg-white text-indigo-900 px-5 py-2 rounded-xl"
                    >
                      <Copy className="w-3 h-3" />
                      Copy All Intelligence
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    );
  };

  const renderAssetLibrary = () => {
    const generatedAssets = (assets || []).filter(a => {
      const isGenerated = a.assetSource === 'generated';
      if (!isGenerated) return false;

      if (!assetSearchQuery) return true;

      const query = assetSearchQuery.toLowerCase().trim();
      const assetType = (a.assetType || '').toLowerCase().replace('_', ' ');
      const dateStr = (a.dateString || '').toLowerCase();
      const originalName = (a.originalName || '').toLowerCase();

      // Keywords mapping for easier search
      const isSingleQuery = query === 'single' || query === 'post' || query === 'single post';
      const isCarouselQuery = query === 'carousel' || query === 'multi';

      if (isSingleQuery) return assetType.includes('single') || assetType === 'image';
      if (isCarouselQuery) return assetType.includes('carousel');

      return (
        assetType.includes(query) ||
        dateStr.includes(query) ||
        originalName.includes(query)
      );
    });

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col space-y-6 pb-20">


        {/* ── Studio Toolbox ────────────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-3 bg-white dark:bg-[#080808]/80 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl flex items-center">
            <div className="relative group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={assetSearchQuery}
                onChange={(e) => setAssetSearchQuery(e.target.value)}
                placeholder="Search by date, single post, or carousel..."
                className="h-14 pl-12 pr-6 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all w-full md:w-80"
              />
              {assetSearchQuery && (
                <button
                  onClick={() => setAssetSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[40px] shadow-xl shadow-indigo-500/20 flex items-center justify-between group cursor-pointer overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-20" />
            <div className="relative z-10">
              <h4 className="text-white font-black uppercase text-[10px] tracking-widest mb-1">Total Assets</h4>
              <p className="text-3xl font-black text-white">{assets?.length || 0}</p>
            </div>
            <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:rotate-12 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ── Neural Vault Explorer ────────────────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[4px]">Neural Vault Artifacts</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">All Assets Synchronized</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-6">
            {generatedAssets.map((asset) => {
              // For carousel assets, prefer first slide as thumbnail if gcsUrl is empty
              const isCarouselAsset = asset.assetType === 'carousel';
              const slideCount = isCarouselAsset && Array.isArray(asset.metadata?.slides) ? asset.metadata.slides.length : 0;
              const thumbnailUrl = asset.gcsUrl || (isCarouselAsset && asset.metadata?.slides?.[0]) || '';

              return (
                <div
                  key={asset._id}
                  onClick={() => setSelectedAsset(asset)}
                  className="group relative"
                >
                  <div className="aspect-square rounded-[24px] sm:rounded-[36px] overflow-hidden relative cursor-pointer border-2 sm:border-4 border-white dark:border-zinc-900 shadow-xl group-hover:scale-[1.03] active:scale-95 transition-all duration-500">
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />

                    {thumbnailUrl ? (
                      <img
                        src={toProxyUrl(thumbnailUrl)}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        alt={isCarouselAsset ? `Carousel (${slideCount} slides)` : 'Generated Asset'}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                        <Layers className="w-8 h-8 text-zinc-600" />
                      </div>
                    )}

                    {/* Carousel slide-count badge */}
                    {isCarouselAsset && slideCount > 0 && (
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-black/70 backdrop-blur-md text-white text-[7px] sm:text-[8px] font-black uppercase tracking-[1.5px] rounded-lg border border-white/20">
                        <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {slideCount} Slides
                      </div>
                    )}

                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 flex flex-col gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadMedia(thumbnailUrl);
                        }}
                        title="Download Artifact"
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-black/90 text-primary flex items-center justify-center shadow-2xl hover:bg-primary hover:text-white transition-all transform hover:rotate-6 active:scale-90"
                      >
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyImageToClipboard(thumbnailUrl);
                        }}
                        title="Copy Image to Clipboard"
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-black/90 text-indigo-600 flex items-center justify-center shadow-2xl hover:bg-indigo-600 hover:text-white transition-all transform hover:-rotate-6 active:scale-90"
                      >
                        <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    {/* Magic Create Label Badge (Top Left — only when not a carousel) */}
                    {asset.metadata?.isMagicCreate && !isCarouselAsset && (
                      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 px-2 py-0.5 sm:px-3 sm:py-1 bg-primary text-white text-[7px] sm:text-[8px] font-black uppercase tracking-[2px] rounded-lg shadow-lg shadow-primary/30">
                        Magic
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col z-20">
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                        <span className="text-[7px] sm:text-[10px] font-black text-white uppercase tracking-widest truncate mr-1">
                          {asset.metadata?.isMagicCreate ? 'Neural' : (asset.assetType?.replace('_', ' ') || 'AI ART')}
                        </span>
                        {asset.dateString && <span className="text-[6px] sm:text-[8px] font-bold text-primary bg-white/90 px-1.5 py-0.5 rounded sm:rounded-md uppercase tracking-widest flex-shrink-0">{asset.dateString}</span>}
                      </div>
                      <p className="text-[6px] sm:text-[8px] font-bold text-white/60 uppercase tracking-wider truncate">{asset.originalName || 'Visual Artifact'}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {generatedAssets.length === 0 && Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-[36px] bg-white dark:bg-[#080808] border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center opacity-30 group hover:opacity-50 transition-opacity border-dashed">
                <Sparkles className="w-8 h-8 text-slate-200 dark:text-zinc-800 mb-3 group-hover:animate-spin transition-all" />
                <span className="text-[9px] font-black text-slate-300 dark:text-zinc-700 uppercase tracking-widest leading-none">Studio Slot {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAssetPreviewModal = () => {
    if (!selectedAsset) return null;

    const post = generatedPosts.find(p =>
      ensureStringId(p._id) === ensureStringId(selectedAsset.postId) ||
      ensureStringId(p.calendarEntryId) === ensureStringId(selectedAsset.calendarEntryId)
    );
    const variations = post?.variations || [];
    const livePrompt = post?.metadata?.originalPrompt || selectedAsset.metadata?.prompt || "Neural Synthesized Content Artifact";
    const rowId = ensureStringId(selectedAsset.calendarEntryId);
    const safeInsights = hashtagInsights || {};
    const currentInsights = Array.isArray(safeInsights[rowId]) ? safeInsights[rowId] : (safeInsights[rowId]?.hashtags || []);
    const suggestedTags = [...new Set([...(post?.hashtags || []), ...currentInsights])];
    const brandTags = safeInsights[rowId]?.brandSpecific || [workspace?.workspaceName?.toLowerCase()?.replace(/\s+/g, '') || 'brand'];

    return (
      <Dialog open={!!selectedAsset} onClose={() => setSelectedAsset(null)} className="relative z-[200]">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-7xl h-[90vh] flex flex-col bg-white rounded-2xl md:rounded-[48px] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            {/* Modal Header */}
            <div className="px-4 py-3 md:p-8 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-slate-50/50">
              {/* Logo */}
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-sm overflow-hidden shrink-0">
                {activeProfile?.logoUrl ? (
                  <img src={toProxyUrl(activeProfile.logoUrl)} className="w-full h-full object-contain p-1" alt="Brand Logo" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center text-base md:text-xl font-black uppercase">
                    {(brandProfile?.companyName || workspace?.workspaceName || 'B').charAt(0)}
                  </div>
                )}
              </div>
              {/* Title */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm md:text-xl font-black text-slate-800 uppercase tracking-tighter truncate max-w-[160px] sm:max-w-xs md:max-w-md">{selectedAsset?.originalName || 'AI Masterpiece'}</h3>
                  <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[7px] md:text-[8px] font-black text-emerald-600 uppercase tracking-widest shrink-0">Post Synchronized</div>
                </div>
              </div>
              {/* Close Button — always visible */}
              <button
                onClick={() => setSelectedAsset(null)}
                className="shrink-0 w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200"
              >
                <X className="w-4 h-4 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Neural Content Hub Body */}
            <div className="flex-1 overflow-y-auto bg-slate-50/30 p-12 custom-scrollbar">
              {/* Visual Identity Hero */}
              {selectedAsset?.assetType === 'carousel' && selectedAsset?.metadata?.slides?.length ? (
                <div className="w-full relative py-4">
                  <div className="flex items-center justify-between mb-4 px-4">
                    <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">Carousel Sequence</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedAsset.metadata.slides.length} Slides</span>
                  </div>
                  <div className="flex gap-6 overflow-x-auto snap-x custom-scrollbar pb-6 px-4">
                    {selectedAsset.metadata.slides.map((url, i) => (
                      <div key={i} className="snap-center relative shrink-0 w-80 group/slide rounded-[32px] overflow-hidden border-4 border-white shadow-xl aspect-square bg-zinc-900 flex items-center justify-center">
                        <img
                          src={toProxyUrl(url)}
                          className="w-full h-full object-contain cursor-zoom-in transition-transform duration-700 group-hover/slide:scale-[1.05]"
                          alt={`Slide ${i + 1}`}
                          onClick={() => setExpandedImage(toProxyUrl(url))}
                        />
                        {/* Slide number badge */}
                        <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/60 text-white font-black flex items-center justify-center text-xs backdrop-blur-md">
                          {i + 1}
                        </div>
                        {/* Per-slide action buttons Ã¢â‚¬â€ visible on hover */}
                        <div className="absolute bottom-4 right-4 flex flex-col gap-2 transition-all duration-300">
                          {/* Download */}
                          <button
                            title="Download Slide"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const response = await fetch(toProxyUrl(url));
                                const blob = await response.blob();
                                const blobUrl = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = blobUrl;
                                a.download = `carousel_slide_${i + 1}.png`;
                                a.click();
                                URL.revokeObjectURL(blobUrl);
                                toast.success(`Slide ${i + 1} downloaded!`);
                                setDownloadedPostsCount(prev => {
                                  const next = prev + 1;
                                  localStorage.setItem('downloadedPostsCount', next.toString());
                                  return next;
                                });
                              } catch { toast.error('Download failed'); }
                            }}
                            className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-slate-800 transition-all shadow-lg"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {/* Copy image to clipboard */}
                          <button
                            title="Copy Image to Clipboard"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const response = await fetch(toProxyUrl(url));
                                const blob = await response.blob();
                                await navigator.clipboard.write([
                                  new ClipboardItem({ 'image/png': blob })
                                ]);
                                toast.success(`Slide ${i + 1} copied to clipboard!`);
                              } catch {
                                navigator.clipboard.writeText(url);
                                toast.success(`Slide ${i + 1} URL copied!`);
                              }
                            }}
                            className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-primary hover:border-primary transition-all shadow-lg"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative group/hero rounded-[40px] overflow-hidden border-4 border-white shadow-2xl aspect-[16/10] bg-zinc-900 flex items-center justify-center">
                  {selectedAsset.gcsUrl ? (
                    <>
                      <img
                        src={toProxyUrl(selectedAsset.gcsUrl)}
                        className="w-full h-full object-contain cursor-zoom-in transition-transform duration-700 group-hover/hero:scale-[1.02]"
                        alt="Artifact Full Preview"
                        onClick={() => setExpandedImage(toProxyUrl(selectedAsset.gcsUrl))}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                        <div className="px-6 py-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white font-black text-xs uppercase tracking-[4px]">Click for Full Dimension</div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-6 text-center p-12">
                      <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                        <Layers className="w-10 h-10 text-slate-500" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Visual Core Pending</h4>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-xs">
                          Textual content has been synthesized. Generate a Post Visual to activate the primary artifact layer.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="max-w-6xl mx-auto space-y-12">

                {/* Ã¢â€â‚¬Ã¢â€â‚¬ GENERATED CONTENT PANEL Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
                {(() => {
                  const ce = selectedAsset?.calendarEntry || calendarEntries.find(e => ensureStringId(e._id) === ensureStringId(selectedAsset?.calendarEntryId));
                  // Dynamic Content Visibility: Ensure space is empty if content isn't yet synthesized
                  const isGenerated = ce?.status === 'generated' || post;

                  if (!ce) return null;
                  if (!isGenerated) return null; // Empty as requested

                  // Priority Data Binding: Check post (fresh state) first, fallback to ce (db sync)
                  const hook = post?.hook || ce.hook || ce.heading_hook || ce.title || '';
                  const subHeading = ce.sub_heading || ce.subHeading || '';
                  const shortCaption = post?.captionShort || ce.short_caption || ce.captionShort || '';
                  const longCaption = post?.captionLong || ce.long_caption || ce.captionLong || ce.postContent || '';
                  const hashtags = post?.hashtags || (Array.isArray(ce.hashtags) ? ce.hashtags : (ce.hashtags ? ce.hashtags.split(/[\s,#]+/).filter(Boolean) : []));
                  const breakdown = post?.onAssetText || ce.breakdown || '';
                  const platform = ce.platform || '';
                  const phase = ce.phase || '';
                  const format = ce.format || ce.postType || ce.post_type || '';

                  return (
                    <div className="bg-white rounded-[24px] md:rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
                      {/* Header */}
                      <div className="p-4 md:p-8 border-b border-slate-100 flex items-start gap-3">
                        <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shrink-0">
                          <FileText className="w-4 h-4 md:w-6 md:h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base md:text-xl font-black text-slate-800 uppercase tracking-tight truncate">Generated Content</h4>
                          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Hook · Captions · Hashtags</p>
                          {(platform || phase || format) && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {platform && <span className="px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10 text-[8px] font-black text-primary uppercase tracking-widest">{platform}</span>}
                              {phase && <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-600 uppercase tracking-widest">{phase}</span>}
                              {format && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-600 uppercase tracking-widest">{format}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 md:p-8 space-y-5 md:space-y-8">
                        {/* Hook */}
                        {hook && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[4px]">✦ Hook / Headline</span>
                              <button onClick={() => { navigator.clipboard.writeText(hook); toast.success('Hook copied!'); }} className="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-lg md:text-2xl font-black text-slate-800 leading-snug select-all">{hook}</p>
                            {subHeading && <p className="text-sm font-semibold text-slate-500 mt-1 select-all">{subHeading}</p>}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                          {/* Short Caption */}
                          {shortCaption && (
                            <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-[24px] border border-slate-100">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[3px]">Short Caption</span>
                                <button onClick={() => { navigator.clipboard.writeText(shortCaption); toast.success('Short caption copied!'); }} className="w-6 h-6 rounded-md bg-white text-slate-400 flex items-center justify-center shadow-sm">
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-sm text-slate-600 font-medium leading-relaxed select-all">{shortCaption}</p>
                            </div>
                          )}

                          {/* Long Caption */}
                          {longCaption && (
                            <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-[24px] border border-slate-100">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[3px]">Long Caption</span>
                                <button onClick={() => { navigator.clipboard.writeText(longCaption); toast.success('Long caption copied!'); }} className="w-6 h-6 rounded-md bg-white text-slate-400 flex items-center justify-center shadow-sm">
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-sm text-slate-600 font-medium leading-relaxed select-all line-clamp-6">{longCaption}</p>
                            </div>
                          )}
                        </div>

                        {/* Carousel Breakdown */}
                        {breakdown && selectedAsset?.assetType === 'carousel' && (
                          <div className="group bg-indigo-50/60 p-6 rounded-[24px] border border-indigo-100">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[3px]">Slide Breakdown</span>
                              <button onClick={() => { navigator.clipboard.writeText(String(breakdown)); toast.success('Breakdown copied!'); }} className="w-7 h-7 rounded-lg bg-white text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center shadow-sm">
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-sm text-indigo-700 font-medium leading-relaxed select-all whitespace-pre-line">{String(breakdown)}</p>
                          </div>
                        )}

                        {/* Hashtags */}
                        {hashtags.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[4px]">Hashtags</span>
                              <button
                                onClick={() => { navigator.clipboard.writeText(hashtags.map(h => `#${h.replace('#', '')}`).join(' ')); toast.success('All hashtags copied!'); }}
                                className="px-4 h-8 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-sm flex items-center gap-2"
                              >
                                <Copy className="w-3 h-3" /> Copy All
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {hashtags.map((tag, i) => (
                                <button
                                  key={i}
                                  onClick={() => { navigator.clipboard.writeText(`#${String(tag).replace('#', '')}`); toast.success(`Copied!`); }}
                                  className="px-4 py-2 bg-slate-50 hover:bg-primary/5 border border-slate-100 hover:border-primary/30 rounded-xl text-[10px] font-bold text-slate-500 hover:text-primary transition-all"
                                >
                                  #{String(tag).replace('#', '')}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Variant Orchestration Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-sm">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">AI Content Studio</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Creative Variations & Angles</p>
                    </div>
                  </div>

                </div>

                {/* Variations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {isGenerating ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-64 bg-white border border-slate-100 rounded-[32px] animate-pulse flex flex-col p-8 space-y-4">
                        <div className="w-24 h-4 bg-slate-100 rounded-md" />
                        <div className="flex-1 bg-slate-50 rounded-2xl" />
                      </div>
                    ))
                  ) : variations.length > 0 ? variations.map((v, i) => (
                    <div key={i} className="group bg-white p-8 rounded-[40px] border border-slate-100 hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-xl relative flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <span className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                          {v.type || `Variation ${i + 1}`}
                        </span>
                          <button
                            onClick={() => { navigator.clipboard.writeText(v.text); toast.success("Variation Copied!"); }}
                            className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-sm"
                          >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed flex-1 select-all">
                        {v.text || v}
                      </p>
                      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between opacity-40">
                        <span className="text-[9px] font-black uppercase tracking-widest">Optimized for Platform</span>
                        <Sparkles className="w-3 h-3" />
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full p-20 bg-white border border-dashed border-slate-200 rounded-[50px] text-center">
                      <div className="w-20 h-20 rounded-full bg-slate-50 mx-auto flex items-center justify-center text-slate-300 mb-6">
                        <BrainCircuit className="w-10 h-10 opacity-20" />
                      </div>
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-[4px]">Awaiting Content Generation</h3>
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Trigger regeneration to see fresh angles.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  };

  const renderGenerationWizard = () => {
    return (
      <GeneratePostModal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onGenerate={async (config) => {
          await handleGenerateAiWizardContent(config);
        }}
      />
    );
  };



  const renderPostHistoryDrawer = () => (
    <Transition show={showHistory} as={Fragment}>
      <Dialog as="div" className="relative z-[200]" onClose={() => setShowHistory(false)}>
        <Transition.Child as={Fragment} enter="ease-in-out duration-500" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in-out duration-500" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child as={Fragment} enter="transform transition ease-in-out duration-500 sm:duration-700" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in-out duration-500 sm:duration-700" leaveFrom="translate-x-0" leaveTo="translate-x-full">
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-zinc-950 shadow-2xl">
                    <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/[0.02]">
                      <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Audit & Collaborate</h2>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Post ID: {selectedPost?._id.substring(0, 8)}</p>
                      </div>
                      <button onClick={() => setShowHistory(false)} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="p-8 flex-1 space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Collaboration</label>
                        <div className="flex gap-2">
                          <input
                            id="post-comment-input"
                            placeholder="Add a remark..."
                            className="flex-1 h-12 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl px-4 text-xs font-bold outline-none focus:border-primary transition-all"
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById('post-comment-input');
                              if (input.value) { handleAddComment(selectedPost._id, input.value); input.value = ''; }
                            }}
                            className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Timeline & Audit</label>
                        <div className="space-y-6 relative ml-4 border-l border-slate-100 dark:border-white/5 pl-8">
                          {postHistory.comments.map(c => (
                            <div key={c._id} className="relative">
                              <div className="absolute -left-[37px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white dark:border-zinc-950" />
                              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                <p className="text-[11px] font-bold text-slate-800 dark:text-white leading-relaxed">{c.message}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-[8px] font-black text-primary uppercase">{c.userId?.name || 'Reviewer'}</span>
                                  <span className="text-[8px] font-black text-slate-400 uppercase">{new Date(c.createdAt).toLocaleTimeString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {postHistory.actions.map(a => (
                            <div key={a._id} className="relative opacity-60">
                              <div className="absolute -left-[37px] top-0 w-4 h-4 rounded-full bg-slate-200 dark:bg-[#161B2E] border-4 border-white dark:border-zinc-950" />
                              <div>
                                <p className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">{a.actionType.replace(/_/g, ' ')}</p>
                                {a.actionNote && <p className="text-[9px] font-medium text-slate-400 italic mt-1">{a.actionNote}</p>}
                                <p className="text-[8px] font-black text-slate-300 dark:text-zinc-600 mt-2">{new Date(a.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01]">
                      {selectedPost?.status === 'draft' && (
                        <button
                          onClick={() => { handleSendForReview(selectedPost._id); setShowHistory(false); }}
                          disabled={isProcessing}
                          className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                          Submit Post for Final Review
                        </button>
                      )}
                      {selectedPost?.status === 'approved' && (
                        <button
                          className="w-full h-14 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                        >
                          <Clock className="w-4 h-4" /> Schedule Outgoing Feed
                        </button>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );

  const renderGenPostModal = () => {
    const { open, entry, format } = genPostModal;
    if (!open || !entry) return null;

    const isGeneratingThis = visualGenRowId === String(entry._id);

    const ASPECT_RATIOS = [
      { id: '1:1', label: '1:1', desc: 'Square', note: 'Instagram / Facebook Feed' },
      { id: '4:3', label: '4:3', desc: 'Standard', note: 'Presentations / Facebook' },
      { id: '16:9', label: '16:9', desc: 'Landscape', note: 'LinkedIn / YouTube' },
      { id: '9:16', label: '9:16', desc: 'Portrait', note: 'Reels / TikTok / Stories' },
    ];

    const postFormats = [
      {
        id: 'single',
        label: 'Single Post',
        desc: 'One high-impact visual optimised for your platform',
        icon: <ImageIcon className="w-8 h-8 text-primary" />,
      },
      {
        id: 'carousel',
        label: 'Carousel Post',
        desc: 'Multi-slide storytelling format (Instagram / LinkedIn)',
        icon: <Library className="w-8 h-8 text-primary" />,
      },
    ];

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={() => !isGeneratingThis && setGenPostModal({ open: false, entry: null, format: 'single', aspectRatio: '1:1', carouselCount: 3 })}
        />

        {/* Modal Card */}
        <div className="relative w-full max-w-md bg-white dark:bg-[#0e0e14] rounded-[36px] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-white/5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[9px] font-black text-primary uppercase tracking-[3px]">AI Post Generator</span>
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                {entry.title || entry.heading_hook || 'Generate Visual Post'}
              </h3>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {entry.platform && (
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-widest">{entry.platform}</span>
                )}
                {entry.phase && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest">{entry.phase}</span>
                )}
                {(entry.postType || entry.format) && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest">{entry.postType || entry.format}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setGenPostModal({ open: false, entry: null, format: 'single', aspectRatio: '1:1', carouselCount: 3 })}
              disabled={isGeneratingThis}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all hover:scale-110 disabled:opacity-40 flex-shrink-0 mt-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Format Selector */}
          <div className="px-8 pt-6 pb-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[3px] mb-4">Choose Post Format</p>
            <div className="grid grid-cols-2 gap-3">
              {postFormats.map(f => (
                <button
                  key={f.id}
                  onClick={() => setGenPostModal(prev => ({ ...prev, format: f.id }))}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 ${format === f.id
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/10'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] hover:border-primary/40'
                    }`}
                >
                  <span className="text-2xl block mb-2">{f.icon}</span>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${format === f.id ? 'text-primary' : 'text-slate-700 dark:text-white'
                    }`}>{f.label}</p>
                  <p className="text-[9px] font-medium text-slate-400 leading-relaxed">{f.desc}</p>
                  {format === f.id && (
                    <div className="mt-2 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-[8px] font-black text-primary uppercase tracking-widest">Selected</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {format === 'carousel' && (
              <div className="mt-4 animate-in slide-in-from-top-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[3px] mb-2">Number of Images</p>
                <CustomSelect
                  value={genPostModal.carouselCount || 3}
                  onChange={(val) => setGenPostModal(prev => ({ ...prev, carouselCount: val }))}
                  options={[
                    { value: 2, label: '2 Images' },
                    { value: 3, label: '3 Images' },
                    { value: 4, label: '4 Images' }
                  ]}
                  color="primary"
                />
              </div>
            )}
          </div>

          {/* Aspect Ratio Selector */}
          <div className="px-8 pt-5 pb-6">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[3px] mb-3">Image Aspect Ratio</p>
            <div className="grid grid-cols-4 gap-2">
              {ASPECT_RATIOS.map(r => (
                <button
                  key={r.id}
                  onClick={() => setGenPostModal(prev => ({ ...prev, aspectRatio: r.id }))}
                  title={r.note}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.03] active:scale-95 ${genPostModal.aspectRatio === r.id
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md shadow-primary/10'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] hover:border-primary/40'
                    }`}
                >
                  {/* Visual preview of the ratio */}
                  <div className="flex items-center justify-center h-7 w-full">
                    {r.id === '1:1' && <div className={`w-6 h-6 rounded border-2 ${genPostModal.aspectRatio === r.id ? 'border-primary' : 'border-slate-400'}`} />}
                    {r.id === '4:3' && <div className={`w-7 h-5 rounded border-2 ${genPostModal.aspectRatio === r.id ? 'border-primary' : 'border-slate-400'}`} />}
                    {r.id === '16:9' && <div className={`w-8 h-[18px] rounded border-2 ${genPostModal.aspectRatio === r.id ? 'border-primary' : 'border-slate-400'}`} />}
                    {r.id === '9:16' && <div className={`w-[18px] h-7 rounded border-2 ${genPostModal.aspectRatio === r.id ? 'border-primary' : 'border-slate-400'}`} />}
                  </div>
                  <p className={`text-[9px] font-black tracking-widest ${genPostModal.aspectRatio === r.id ? 'text-primary' : 'text-slate-600 dark:text-slate-300'
                    }`}>{r.label}</p>
                  <p className="text-[7px] font-bold text-slate-400 leading-tight text-center">{r.desc}</p>
                </button>
              ))}
            </div>
            <p className="text-[8px] font-bold text-slate-400 mt-2 text-center">
              {ASPECT_RATIOS.find(r => r.id === genPostModal.aspectRatio)?.note}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="px-8 pb-8 flex gap-3">
            <button
              onClick={() => setGenPostModal({ open: false, entry: null, format: 'single', aspectRatio: '1:1', carouselCount: 3 })}
              disabled={isGeneratingThis}
              className="flex-1 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-black text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const currentEntry = genPostModal.entry;
                const currentFormat = genPostModal.format;
                const currentAspectRatio = genPostModal.aspectRatio || '1:1';
                const currentCarouselCount = genPostModal.carouselCount || 3;
                setGenPostModal({ open: false, entry: null, format: 'single', aspectRatio: '1:1', carouselCount: 3 });
                handleVisualPostGeneration(currentEntry, currentFormat, currentAspectRatio, currentCarouselCount);
              }}
              disabled={isGeneratingThis}
              className="flex-1 h-12 bg-primary text-white rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isGeneratingThis ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate Post</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderManualGenModal = () => {
    if (!showManualGenModal) return null;

    const PLATFORMS = [
      { id: 'Instagram', name: 'Instagram', icon: <Instagram className="w-5 h-5" />, color: 'text-[#E1306C]' },
      { id: 'Facebook', name: 'Facebook', icon: <Facebook className="w-5 h-5" />, color: 'text-[#1877F2]' },
      { id: 'LinkedIn', name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, color: 'text-[#0077B5]' },
      { id: 'Twitter', name: 'Twitter (X)', icon: <TwitterXIcon className="w-5 h-5" />, color: 'text-slate-800 dark:text-white' },
      { id: 'Threads', name: 'Threads', icon: <ThreadsIcon className="w-5 h-5" />, color: 'text-slate-800 dark:text-white' },
      { id: 'TikTok', name: 'TikTok', icon: <TikTokIcon className="w-5 h-5" />, color: 'text-slate-800 dark:text-white' },
      { id: 'Pinterest', name: 'Pinterest', icon: <PinterestIcon className="w-5 h-5" />, color: 'text-[#BD081C]' },
      { id: 'YouTube', name: 'YouTube Community', icon: <Youtube className="w-5 h-5" />, color: 'text-[#FF0000]' }
    ];

    const CONTENT_TYPES = [
      'Professional', 'Marketing', 'Educational', 'Product Promotion', 'Sales',
      'Announcement', 'Launch', 'Brand Awareness', 'Customer Story', 'Case Study',
      'Fun / Humorous', 'Inspirational', 'Motivational', 'Trending', 'Festival',
      'Event Promotion', 'Behind The Scenes', 'Tips & Tricks', 'FAQ', 'Poll',
      'Question', 'Testimonial', 'Success Story', 'News Update', 'Offer / Discount',
      'Giveaway', 'Recruitment', 'Custom'
    ];

    const AUDIENCES = [
      'General Audience', 'Students', 'Professionals', 'Business Owners', 'Startups',
      'Developers', 'Designers', 'Creators', 'Marketing Teams', 'Investors',
      'Customers', 'Healthcare', 'Finance', 'Real Estate', 'E-commerce', 'Custom'
    ];

    const TONES = [
      'Professional', 'Friendly', 'Corporate', 'Luxury', 'Minimal', 'Creative',
      'Bold', 'Confident', 'Funny', 'Playful', 'Casual', 'Formal', 'Persuasive',
      'Emotional', 'Storytelling', 'Modern', 'Gen-Z', 'Premium', 'Trustworthy'
    ];

    const ENHANCEMENTS_LIST = [
      { id: 'generateCaption', label: 'Generate Caption' },
      { id: 'generateHashtags', label: 'Generate Hashtags' },
      { id: 'generateCTA', label: 'Generate CTA' },
      { id: 'generateEmojiSuggestions', label: 'Generate Emoji Suggestions' },
      { id: 'generateSEOKeywords', label: 'Generate SEO Keywords' },
      { id: 'generateImagePrompt', label: 'Generate Image Prompt' },
      { id: 'generateAltText', label: 'Generate Alt Text' },
      { id: 'suggestBestPostingTime', label: 'Suggest Best Posting Time' },
      { id: 'generateMultipleVariations', label: 'Generate Multiple Variations' },
      { id: 'repurposeForOtherPlatforms', label: 'Repurpose For Other Platforms' }
    ];

    const toggleEnhancement = (id) => {
      setManualEnhancements(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    };

    const handleDragStart = (e, index) => {
      if (isGeneratingManual) return;
      e.dataTransfer.setData('text/plain', index);
    };

    const handleDragDrop = (e, targetIndex) => {
      if (isGeneratingManual) return;
      e.preventDefault();
      const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
      if (sourceIndex === targetIndex) return;

      const list = [...manualUploadedFiles];
      const [removed] = list.splice(sourceIndex, 1);
      list.splice(targetIndex, 0, removed);

      setManualUploadedFiles(list);
    };

    const formatBytes = (bytes, decimals = 2) => {
      if (!bytes) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
          onClick={() => !isGeneratingManual && setShowManualGenModal(false)}
        />

        {/* Modal Card */}
        <div className="relative w-full max-w-6xl bg-white dark:bg-[#0c0c12] rounded-[40px] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-[3px] block">Premium Creator Suite</span>
                <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Generate Post Manually</h3>
              </div>
            </div>
            <button
              onClick={() => !isGeneratingManual && setShowManualGenModal(false)}
              disabled={isGeneratingManual}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all hover:scale-110 disabled:opacity-40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Form Column */}
            <div className="lg:col-span-2 space-y-8 pr-2">
              
              {/* SECTION 1 — SOCIAL MEDIA PLATFORM */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Section 1 &mdash; Social Media Platform</h4>
                  {manualValidationErrors.platform && (
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{manualValidationErrors.platform}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PLATFORMS.map(p => {
                    const isSelected = manualPlatform === p.id;
                    return (
                      <button
                        key={p.id}
                        disabled={isGeneratingManual}
                        onClick={() => {
                          setManualPlatform(p.id);
                          setManualValidationErrors(prev => ({ ...prev, platform: null }));
                        }}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 relative group ${
                          isSelected
                            ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/10'
                            : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] hover:border-primary/40'
                        }`}
                      >
                        <div className={`mb-2 transition-transform duration-300 group-hover:scale-115 ${p.color}`}>
                          {p.icon}
                        </div>
                        <span className={`text-[10px] font-black tracking-wider uppercase ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                          {p.name}
                        </span>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-slate-100 dark:border-white/5" />

              {/* SECTION 2 — CONTENT TYPE */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Section 2 &mdash; Content Type</h4>
                  {manualValidationErrors.contentType && (
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{manualValidationErrors.contentType}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 dark:border-white/5 rounded-2xl bg-slate-50/50 dark:bg-white/[0.01]">
                  {CONTENT_TYPES.map(t => {
                    const isSelected = manualContentType === t;
                    return (
                      <button
                        key={t}
                        disabled={isGeneratingManual}
                        onClick={() => {
                          setManualContentType(t);
                          setManualValidationErrors(prev => ({ ...prev, contentType: null }));
                        }}
                        className={`py-2.5 px-3 text-left rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all truncate ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
                {manualContentType === 'Custom' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Custom Content Type</label>
                    <input
                      type="text"
                      disabled={isGeneratingManual}
                      value={manualCustomContentType}
                      onChange={(e) => {
                        setManualCustomContentType(e.target.value);
                        setManualValidationErrors(prev => ({ ...prev, contentType: null }));
                      }}
                      placeholder="e.g. Meme, Quote, Announcement Story..."
                      className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-800 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <hr className="border-slate-100 dark:border-white/5" />

              {/* SECTION 3 — TARGET AUDIENCE */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Section 3 &mdash; Target Audience</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Select Audience</label>
                    <CustomSelect
                      value={manualTargetAudience}
                      disabled={isGeneratingManual}
                      onChange={(val) => setManualTargetAudience(val)}
                      options={AUDIENCES.map(a => ({ value: a, label: a }))}
                      color="primary"
                      className="rounded-xl h-12"
                    />
                  </div>
                  {manualTargetAudience === 'Custom' && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Custom Audience Description</label>
                      <input
                        type="text"
                        disabled={isGeneratingManual}
                        value={manualCustomTargetAudience}
                        onChange={(e) => setManualCustomTargetAudience(e.target.value)}
                        placeholder="e.g. Remote Product Managers in Tech startups..."
                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-800 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-slate-100 dark:border-white/5" />

              {/* SECTION 4 — TONE OF VOICE */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Section 4 &mdash; Tone Of Voice</h4>
                <div className="flex flex-wrap gap-2">
                  {TONES.map(toneName => {
                    const isSelected = manualTone.includes(toneName);
                    return (
                      <button
                        key={toneName}
                        disabled={isGeneratingManual}
                        onClick={() => {
                          if (isSelected) {
                            setManualTone(prev => prev.filter(t => t !== toneName));
                          } else {
                            setManualTone(prev => [...prev, toneName]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${
                          isSelected
                            ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 scale-[1.05]'
                            : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:border-primary/40'
                        }`}
                      >
                        {toneName}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-slate-100 dark:border-white/5" />

              {/* SECTION 5 — DESCRIPTION */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Section 5 &mdash; Describe Your Post</h4>
                  {manualValidationErrors.description && (
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{manualValidationErrors.description}</span>
                  )}
                </div>
                <div className="relative">
                  <textarea
                    disabled={isGeneratingManual}
                    value={manualDescription}
                    onChange={(e) => {
                      setManualDescription(e.target.value);
                      setManualValidationErrors(prev => ({ ...prev, description: null }));
                      // Auto-expand logic
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    placeholder="Describe exactly what you want AI to generate. e.g. Create an Instagram promotional post announcing our new AI-powered CRM software for startups. Highlight automation, productivity and ease of use with an engaging CTA."
                    className="w-full min-h-[120px] max-h-[300px] px-4 py-3 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-800 dark:text-white placeholder-slate-400 resize-y overflow-y-auto"
                    style={{ height: 'auto' }}
                  />
                  <div className="flex justify-between items-center mt-2 px-1">
                    <span className="text-[8px] font-black uppercase text-slate-400">Min 20 | Max 3000 chars</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      manualDescription.length < 20 || manualDescription.length > 3000 ? 'text-red-500' : 'text-primary'
                    }`}>
                      {manualDescription.length} / 3000
                    </span>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100 dark:border-white/5" />

              {/* SECTION 6 — MEDIA UPLOAD */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Section 6 &mdash; Reference Images / Videos</h4>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-white/[0.01] hover:bg-slate-100/50 dark:hover:bg-white/[0.02] cursor-pointer transition-all relative group"
                  onClick={() => {
                    if (isGeneratingManual) return;
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.accept = 'image/*,video/*';
                    input.onchange = handleFileChange;
                    input.click();
                  }}
                >
                  <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:scale-110 transition-transform text-primary/70" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Drag & drop files here, or <span className="text-primary hover:underline">browse</span></span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">PNG, JPG, JPEG, WEBP, GIF, MP4, MOV, WEBM (Max 10 files)</span>
                </div>

                {manualUploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Drag files to reorder priority:</p>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                      {manualUploadedFiles.map((file, idx) => (
                        <div
                          key={file.id}
                          draggable={!isGeneratingManual}
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDragDrop(e, idx)}
                          className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm relative group cursor-move hover:border-primary/30 transition-all select-none"
                        >
                          {/* File Preview */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex-shrink-0 flex items-center justify-center relative">
                            {file.uploading ? (
                              <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                            ) : file.mimetype?.startsWith('video/') ? (
                              <Video className="w-6 h-6 text-slate-400" />
                            ) : (
                              <img src={file.url} className="w-full h-full object-cover" alt="Preview" />
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 pr-12">
                            <p className="text-[10px] font-black text-slate-800 dark:text-white truncate uppercase tracking-tight">{file.name}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase">{formatBytes(file.size)}</p>
                          </div>

                          {/* Actions */}
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              disabled={isGeneratingManual}
                              onClick={(e) => { e.stopPropagation(); handleReplaceFile(file.id); }}
                              className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center active:scale-90"
                              title="Replace file"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={isGeneratingManual}
                              onClick={(e) => { e.stopPropagation(); handleDeleteUploadedFile(file.id); }}
                              className="w-6 h-6 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center active:scale-90"
                              title="Delete file"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 6.5 — AI IMAGE ANALYSIS */}
              {(isAnalyzingImage || visionAnalysisResult || visionAnalysisError) && (
                <>
                  <hr className="border-slate-100 dark:border-white/5" />
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">AI Image Analysis</h4>
                      {isAnalyzingImage && (
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-wider animate-pulse">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                          <span>Analyzing image with AI...</span>
                        </div>
                      )}
                      {visionAnalysisResult && !isAnalyzingImage && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                          Image analyzed successfully
                        </span>
                      )}
                      {visionAnalysisError && !isAnalyzingImage && (
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">{visionAnalysisError}</span>
                          <button
                            onClick={() => {
                              const img = manualUploadedFiles.find(f => f.url?.match(/\.(png|jpe?g|webp|gif)$/i) || f.file);
                              if (img) triggerVisionAnalysis(createdPostId, img.url);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-primary text-white text-[8px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                          >
                            Retry
                          </button>
                        </div>
                      )}
                    </div>

                    {visionAnalysisResult && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Detected Scene</span>
                          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate" title={visionAnalysisResult.scene}>
                            {visionAnalysisResult.scene || 'N/A'}
                          </span>
                        </div>

                        <div className="p-3 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Detected Objects</span>
                          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate" title={visionAnalysisResult.objects?.join(', ')}>
                            {visionAnalysisResult.objects?.length > 0 ? visionAnalysisResult.objects.join(', ') : 'None'}
                          </span>
                        </div>

                        <div className="p-3 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Detected Colors</span>
                          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate" title={visionAnalysisResult.colors?.join(', ')}>
                            {visionAnalysisResult.colors?.length > 0 ? visionAnalysisResult.colors.join(', ') : 'None'}
                          </span>
                        </div>

                        <div className="p-3 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Detected Mood</span>
                          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                            {visionAnalysisResult.mood || 'N/A'}
                          </span>
                        </div>

                        <div className="p-3 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Industry</span>
                          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                            {visionAnalysisResult.industry || 'N/A'}
                          </span>
                        </div>

                        <div className="p-3 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Logo Detection</span>
                          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                            {visionAnalysisResult.logoDetected ? `Yes (${visionAnalysisResult.brandName || 'Unknown'})` : 'No logo'}
                          </span>
                        </div>

                        <div className="p-3 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl space-y-1 col-span-2">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Detected Text</span>
                          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate" title={visionAnalysisResult.detectedText}>
                            {visionAnalysisResult.detectedText || 'None detected'}
                          </span>
                        </div>

                        <div className="p-3 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Environment</span>
                          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                            {visionAnalysisResult.environment || 'N/A'}
                          </span>
                        </div>

                        <div className="p-3 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Confidence Score</span>
                          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                            {typeof visionAnalysisResult.confidence === 'number' ? `${(visionAnalysisResult.confidence * 100).toFixed(0)}%` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <hr className="border-slate-100 dark:border-white/5" />

              {/* SECTION 7 — AI ENHANCEMENT OPTIONS */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Section 7 &mdash; AI Enhancement Options</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ENHANCEMENTS_LIST.map(opt => {
                    const isEnabled = manualEnhancements[opt.id];
                    return (
                      <button
                        key={opt.id}
                        disabled={isGeneratingManual}
                        onClick={() => toggleEnhancement(opt.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                          isEnabled
                            ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                            : 'border-slate-200 dark:border-white/10 hover:border-primary/20 bg-slate-50/50 dark:bg-white/[0.01]'
                        }`}
                      >
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isEnabled ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                          {opt.label}
                        </span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                          isEnabled ? 'bg-primary text-white' : 'border border-slate-300 dark:border-white/10 bg-white dark:bg-transparent'
                        }`}>
                          {isEnabled && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-slate-100 dark:border-white/5" />

              {/* SECTION 8 — CONTENT LENGTH */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Section 8 &mdash; Content Length</h4>
                <div className="flex gap-4">
                  {['Short', 'Medium', 'Long', 'Carousel', 'Thread'].map(len => {
                    const isSelected = manualContentLength === len;
                    return (
                      <button
                        key={len}
                        disabled={isGeneratingManual}
                        onClick={() => setManualContentLength(len)}
                        className="flex items-center gap-2 group cursor-pointer"
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'border-primary' : 'border-slate-300 dark:border-white/10'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          isSelected ? 'text-slate-800 dark:text-white' : 'text-slate-400 group-hover:text-slate-600'
                        }`}>
                          {len}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-slate-100 dark:border-white/5" />

              {/* SECTION 9 — LANGUAGE */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Section 9 &mdash; Language</h4>
                <div className="max-w-xs">
                  <CustomSelect
                    value={manualLanguage}
                    disabled={isGeneratingManual}
                    onChange={(val) => setManualLanguage(val)}
                    options={['English', 'Hindi', 'Hinglish', 'Spanish', 'French', 'German', 'Arabic', 'Japanese', 'Auto Detect'].map(l => ({ value: l, label: l }))}
                    color="primary"
                    className="rounded-xl h-12"
                  />
                </div>
              </div>

              <hr className="border-slate-100 dark:border-white/5" />

              {/* SECTION 10 — CTA STYLE */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Section 10 &mdash; CTA Style</h4>
                <div className="max-w-xs">
                  <CustomSelect
                    value={manualCta}
                    disabled={isGeneratingManual}
                    onChange={(val) => setManualCta(val)}
                    options={[
                      'Shop Now', 'Learn More', 'Visit Website', 'Book Demo', 'Register',
                      'Contact Us', 'Read More', 'Download', 'Apply Now', 'Follow Us',
                      'Comment Below', 'Share This', 'No CTA'
                    ].map(c => ({ value: c, label: c }))}
                    color="primary"
                    className="rounded-xl h-12"
                  />
                </div>
              </div>

            </div>

            {/* SECTION 11 — LIVE PREVIEW / GENERATED CONTENT PANEL */}
            <div className="lg:col-span-1">
              <div className="sticky top-0 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-[32px] p-6 shadow-sm space-y-6 max-h-[80vh] overflow-y-auto">
                <div>
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-[3px]">
                    {manualGeneratedContent ? "Generated Content Preview" : "Section 11 — Live Preview"}
                  </h4>
                  <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 block">
                    {manualGeneratedContent ? "Copy or regenerate sections below" : "Summary updating in real-time"}
                  </span>
                </div>

                {!manualGeneratedContent ? (
                  <>
                    <div className="space-y-3.5 border-t border-slate-200 dark:border-white/5 pt-4 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      <div className="flex justify-between">
                        <span className="opacity-60">Platform:</span>
                        <span className="text-slate-800 dark:text-white font-black">{manualPlatform || 'Not Selected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">Content Type:</span>
                        <span className="text-slate-800 dark:text-white font-black truncate max-w-[140px] text-right">
                          {manualContentType === 'Custom' ? (manualCustomContentType || 'Custom') : (manualContentType || 'Not Selected')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">Audience:</span>
                        <span className="text-slate-800 dark:text-white font-black truncate max-w-[140px] text-right">
                          {manualTargetAudience === 'Custom' ? (manualCustomTargetAudience || 'Custom') : manualTargetAudience}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">Tones ({manualTone.length}):</span>
                        <span className="text-slate-800 dark:text-white font-black truncate max-w-[140px] text-right">
                          {manualTone.length > 0 ? manualTone.join(', ') : 'None'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">Language:</span>
                        <span className="text-slate-800 dark:text-white font-black">{manualLanguage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">CTA Style:</span>
                        <span className="text-slate-800 dark:text-white font-black">{manualCta}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">Length:</span>
                        <span className="text-slate-800 dark:text-white font-black">{manualContentLength}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">Uploads:</span>
                        <span className="text-slate-800 dark:text-white font-black">{manualUploadedFiles.filter(f => !f.uploading).length} files</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">Prompt characters:</span>
                        <span className="text-slate-800 dark:text-white font-black">{manualDescription.length} / 3000</span>
                      </div>
                    </div>

                    {/* Uploaded Images Preview inside Live Preview Panel */}
                    {manualUploadedFiles.length > 0 && (
                      <div className="p-4 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl space-y-2">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 dark:border-white/5 pb-2">Uploaded Files Preview</span>
                        <div className="grid grid-cols-4 gap-2">
                          {manualUploadedFiles.map((file, idx) => {
                            const isImage = file.mimetype?.startsWith('image/') || file.name?.match(/\.(png|jpe?g|webp|gif)$/i);
                            const serverUrl = API.replace('/api', '');
                            const imageUrl = file.url?.startsWith('blob:') || file.url?.startsWith('http') ? file.url : `${serverUrl}${file.url}`;
                            return (
                              <div key={file.id || idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                                {isImage ? (
                                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white/50">
                                    <Video className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Estimated AI Output */}
                    <div className="p-4 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl space-y-3">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 dark:border-white/5 pb-2">Estimated AI Output</span>
                      <div className="space-y-2 text-[9px] font-medium leading-relaxed text-slate-500">
                        <div className="font-bold text-slate-800 dark:text-slate-300">
                          {`[AI will generate a punchy ${manualTone.slice(0, 2).join('/') || 'engaging'} hook for ${manualPlatform || 'social media'} here]`}
                        </div>
                        <div>
                          {`[AI will generate a ${manualContentLength} length caption targeting ${manualTargetAudience} in ${manualLanguage}. It will highlight: "${manualDescription.slice(0, 50) || 'your description'}..." and include strategic emoji suggestions]`}
                        </div>
                        {manualCta !== 'No CTA' && (
                          <div className="text-primary font-black uppercase tracking-widest">
                            {`[CTA: ${manualCta}]`}
                          </div>
                        )}
                        <div className="text-indigo-500 font-bold">
                          {`[Hashtags: AI will generate custom viral tags for ${manualPlatform || 'your platform'}]`}
                        </div>
                      </div>
                    </div>

                    {manualPostSaved && (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-wider rounded-2xl flex items-center gap-2">
                        <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-500" />
                        <span>Your request has been saved and is ready for AI generation.</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    {/* Generated Title */}
                    <div className="p-4 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl space-y-2 relative group">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Generated Title</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(manualGeneratedContent.title);
                            toast.success("Title copied!");
                          }}
                          className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:scale-105 active:scale-95 transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                      </div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-white leading-snug">{manualGeneratedContent.title}</h3>
                    </div>

                    {/* Generated Caption */}
                    <div className="p-4 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl space-y-2 relative group">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Generated Caption</span>
                        <div className="flex gap-2">
                          <button
                            disabled={isRegeneratingSection !== null}
                            onClick={() => triggerSectionRegeneration('caption')}
                            className="text-[9px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingSection === 'caption' ? 'animate-spin' : ''}`} /> Regenerate
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(manualGeneratedContent.caption);
                              toast.success("Caption copied!");
                            }}
                            className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:scale-105 active:scale-95 transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">{manualGeneratedContent.caption}</p>
                    </div>

                    {/* Generated Hashtags */}
                    <div className="p-4 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl space-y-2 relative group">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Generated Hashtags</span>
                        <div className="flex gap-2">
                          <button
                            disabled={isRegeneratingSection !== null}
                            onClick={() => triggerSectionRegeneration('hashtags')}
                            className="text-[9px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingSection === 'hashtags' ? 'animate-spin' : ''}`} /> Regenerate
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(manualGeneratedContent.hashtags?.join(' '));
                              toast.success("Hashtags copied!");
                            }}
                            className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:scale-105 active:scale-95 transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {manualGeneratedContent.hashtags?.map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 text-[9px] font-black tracking-wider uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Generated CTA */}
                    <div className="p-4 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl space-y-2 relative group">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Generated CTA</span>
                        <div className="flex gap-2">
                          <button
                            disabled={isRegeneratingSection !== null}
                            onClick={() => triggerSectionRegeneration('cta')}
                            className="text-[9px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingSection === 'cta' ? 'animate-spin' : ''}`} /> Regenerate
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(manualGeneratedContent.cta);
                              toast.success("CTA copied!");
                            }}
                            className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:scale-105 active:scale-95 transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </button>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider block">{manualGeneratedContent.cta}</span>
                    </div>

                    {/* SEO Keywords */}
                    <div className="p-4 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl space-y-2 relative group">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">SEO Keywords</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(manualGeneratedContent.seoKeywords?.join(', '));
                            toast.success("SEO Keywords copied!");
                          }}
                          className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:scale-105 active:scale-95 transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {manualGeneratedContent.seoKeywords?.map((kw, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Alt Text */}
                    <div className="p-4 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl space-y-2 relative group">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Image Alt Text</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(manualGeneratedContent.altText);
                            toast.success("Alt Text copied!");
                          }}
                          className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:scale-105 active:scale-95 transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-normal">{manualGeneratedContent.altText}</p>
                    </div>

                    {/* Image Prompt */}
                    <div className="p-4 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl space-y-2 relative group">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Generated Image Prompt</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(manualGeneratedContent.imagePrompt);
                            toast.success("Image Prompt copied!");
                          }}
                          className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:scale-105 active:scale-95 transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-normal italic">"{manualGeneratedContent.imagePrompt}"</p>
                    </div>

                    {/* Best Posting Time */}
                    <div className="p-4 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl space-y-2 relative group">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Best Posting Time</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(manualGeneratedContent.bestPostingTime);
                            toast.success("Posting Time copied!");
                          }}
                          className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:scale-105 active:scale-95 transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                      </div>
                      <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider block">{manualGeneratedContent.bestPostingTime}</span>
                    </div>

                    {/* Variations */}
                    <div className="p-4 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl space-y-4">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 dark:border-white/5 pb-2">Alternative Variations</span>
                      <div className="space-y-4">
                        {manualGeneratedContent.variations?.map((variant, idx) => (
                          <div key={idx} className="space-y-1.5 border-l-2 border-primary/20 pl-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black text-primary uppercase tracking-wider">Variation {idx + 1}: {variant.title}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(`${variant.title}\n\n${variant.caption}\n\n${variant.hashtags?.join(' ')}`);
                                  toast.success(`Variation ${idx + 1} copied!`);
                                }}
                                className="text-[8px] font-black text-slate-400 hover:text-primary uppercase tracking-widest flex items-center gap-1 hover:scale-105 active:scale-95 transition-all"
                              >
                                <Copy className="w-3 h-3" /> Copy
                              </button>
                            </div>
                            <p className="text-[9px] font-bold text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">{variant.caption}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {variant.hashtags?.map((tag, tIdx) => (
                                <span key={tIdx} className="text-[8px] font-medium text-indigo-400 uppercase">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-6 border-t border-slate-100 dark:border-white/5 flex gap-4 bg-slate-50 dark:bg-white/[0.02]">
            <button
              onClick={() => !isGeneratingManual && setShowManualGenModal(false)}
              disabled={isGeneratingManual}
              className="flex-1 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateManualContent}
              disabled={isGeneratingManual || isAnalyzingImage || !manualPlatform || !manualContentType || manualDescription.length < 20 || manualDescription.length > 3000}
              className="flex-1 h-12 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50"
            >
              {isGeneratingManual ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {generationStep === 1 && <span>Uploading... {manualUploadProgress}%</span>}
                  {generationStep === 2 && <span>Analyzing Image...</span>}
                  {generationStep === 3 && <span>Generating AI Content...</span>}
                  {generationStep === 4 && <span>Finalizing...</span>}
                </div>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate Content</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderOneOffAssetModal = () => {
    return (
      <Dialog open={showOneOffModal} onClose={() => setShowOneOffModal(false)} className="relative z-[160]">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
        <div className="fixed inset-0 flex items-center justify-center p-8">
          <Dialog.Panel className="w-full max-w-lg bg-white dark:bg-[#1E2438] rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/[0.02]">
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-1">Branded Magic Create</h3>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Generate assets directly into your vault</p>
              </div>
              <button onClick={() => setShowOneOffModal(false)} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-4">
                <label htmlFor="oneOffAssetPrompt" className="text-xs font-black uppercase tracking-widest text-slate-400 block px-1 cursor-pointer">What should we create?</label>
                <textarea
                  id="oneOffAssetPrompt"
                  rows={4}
                  value={oneOffPrompt}
                  onChange={(e) => setOneOffPrompt(e.target.value)}
                  placeholder="e.g. A minimalist workspace with our brand colors featuring our logo on a laptop screen..."
                  className="w-full p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-3xl text-sm font-bold outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="p-6 bg-indigo-50 dark:bg-indigo-500/5 rounded-3xl border border-indigo-100 dark:border-indigo-500/10">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <p className="text-[10px] font-bold text-indigo-600/80 leading-relaxed">
                    This will use your established **Brand Voice** and **Color Palette** automatically to ensure the generated asset stays consistent with your identity.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-10 bg-slate-50/50 dark:bg-white/[0.01] border-t border-slate-100 dark:border-white/5">
              <button
                onClick={() => handleGenerateOneOffAsset()}
                disabled={isOneOffGenerating || !oneOffPrompt}
                className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isOneOffGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                Confirm & Create Asset
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  };

  const renderCompanyInfoPanel = () => {
    const ow = allWorkspaces.find(w => w.onboarding?.completed) || workspace;
    const bp = ow?.brandProfile;
    const brandName = bp?.companyName || ow?.onboarding?.brandName || ow?.workspaceName || '—';
    const logoUrl = bp?.logoUrl || null;
    const colors = bp?.brandColors?.length ? bp.brandColors : (ow?.onboarding?.brandColors || []);
    const desc = bp?.extractedBrandSummary || bp?.companyOverviewText || ow?.onboarding?.businessDescription || '';
    const site = bp?.website || (ow?.onboarding?.noWebsite ? null : ow?.onboarding?.website) || '';
    const role = ow?.onboarding?.role || '';
    const industry = ow?.onboarding?.industry || bp?.targetIndustry || '';

    // User data
    const personalWs = allWorkspaces.find(w => w.isPersonalProfile) || workspace;
    const userName = personalWs?.onboarding?.customName || currentUser?.name || 'User Profile';
    const userAvatar = currentUser?.avatar || null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[160] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
        onClick={() => setShowCompanyInfoPanel(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-3xl bg-white dark:bg-[#1E2438] rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Top Section: User Profile */}
          <div className="bg-slate-50 dark:bg-zinc-950 p-8 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between relative">
            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                {userAvatar ? (
                  <img src={toProxyUrl(userAvatar)} alt="User" className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-zinc-800 shadow-lg" onError={e => e.target.style.display = 'none'} />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white dark:border-zinc-800 shadow-lg flex items-center justify-center text-3xl font-black text-white">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[4px] text-indigo-500 mb-1">User Profile</p>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white">{userName}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full">Active</span>
                  <span className="text-xs text-slate-400 font-bold">{currentUser?._id?.substring(0, 8) || 'Member'}</span>
                  <button
                    onClick={handleSyncProfile}
                    className="ml-2 flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full transition-all group/sync"
                    title="Sync with social profile"
                  >
                    <RefreshCw className="w-3 h-3 group-hover/sync:rotate-180 transition-transform duration-700" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Sync</span>
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => setShowCompanyInfoPanel(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-200/50 dark:bg-[#161B2E] hover:bg-slate-300 dark:hover:bg-zinc-700 flex items-center justify-center transition-all z-20">
              <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Body Section: Company Details */}
          <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-[#1E2438] custom-scrollbar">
            <h3 className="text-xs font-black uppercase tracking-[5px] text-slate-400 mb-6 flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-indigo-500" /> Company Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Brand Overview Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/10 dark:to-transparent border border-indigo-100 dark:border-indigo-500/10 p-6 rounded-[24px]">
                <div className="flex items-center gap-4 mb-6">
                  {logoUrl ? (
                    <img src={toProxyUrl(logoUrl)} alt="Logo" className="w-16 h-16 rounded-2xl object-contain bg-white p-1 border border-slate-100 dark:border-white/10 shadow-sm" onError={e => e.target.style.display = 'none'} />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {brandName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{brandName}</h2>
                    {site && (
                      <a href={site} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1 mt-1">
                        <Globe className="w-3 h-3" />
                        {site.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                </div>

                {colors.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[3px] mb-2">Brand Colors</p>
                    <div className="flex gap-2 flex-wrap">
                      {colors.map((c, i) => (
                        <div key={i} className="w-10 h-10 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-sm" style={{ backgroundColor: c }} title={c} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Info Grid */}
              <div className="space-y-4">
                {role && (
                  <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-[24px] border border-slate-100 dark:border-white/5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                      <User2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-[3px] mb-1">Primary Role</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">{role.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                )}
                {industry && (
                  <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-[24px] border border-slate-100 dark:border-white/5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[3px] mb-1">Industry</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{industry}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {desc && (
              <div className="mt-8 p-6 bg-slate-50 dark:bg-white/5 rounded-[24px] border border-slate-100 dark:border-white/5">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[3px] mb-3">About the Brand</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{desc}</p>
              </div>
            )}

            {!brandName && !desc && (
              <p className="text-sm text-slate-400 italic text-center py-8">Complete the onboarding wizard to populate your brand profile.</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderOnboardingGuideModal = () => {
    const guideSteps = [
      {
        title: "Step 1: Introduction",
        desc: "Initially, AI Ads™ needs to know who you are and your business name. This is the foundation of your content.",
        icon: User
      },
      {
        title: "Step 2: AI Identity Fetch",
        desc: "Simply enter your website URL, and AI Ads™ will automatically scan it to extract your logo, brand colors, and company description. No manual entry needed!",
        icon: Zap
      },
      {
        title: "Step 3: Define Goals",
        desc: "Tell us what you want to achieve (e.g., brand awareness, sales) and who your target audience is. This helps AI Ads™ write posts that actually work.",
        icon: Target
      },
      {
        title: "Step 4: AI Generation",
        desc: "Once setup is complete, our AI begins creating high-quality social media posts, images, and videos specifically for your brand.",
        icon: Sparkles
      }
    ];

    return (
      <Dialog open={showOnboardingGuide} onClose={() => setShowOnboardingGuide(false)} className="relative z-[200]">
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" />
        <div className="fixed inset-0 flex items-center justify-center p-8">
          <Dialog.Panel className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">User Quick-Start Guide</h3>
                  <p className="text-[10px] font-black text-primary tracking-widest mt-0.5">EVERYTHING YOU NEED TO KNOW ABOUT AI Ads™ SETUP</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowOnboardingGuide(false);
                  localStorage.setItem('aisa_guide_v3_shown', 'true');
                }}
                className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guideSteps.map((s, i) => (
                  <div key={i} className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 group hover:border-primary/30 transition-all">
                    <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <s.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-2">{s.title}</h4>
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wide opacity-80">{s.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-[32px] p-6 flex gap-5 items-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-8 h-8" />
                </div>
                <p className="text-[11px] font-bold text-indigo-600 leading-relaxed uppercase tracking-wider">
                  <span className="font-black">Pro Tip:</span> Even if you don't have a website, you can fill in details manually. AI Ads™ will still create professional content based on what you describe!
                </p>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowOnboardingGuide(false);
                  localStorage.setItem('aisa_onboarding_guide_shown', 'true');
                }}
                className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                I Understand, Let's Start
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  };


  const renderOnboardingUI = () => {
    // New streamlined 6-step onboarding: User + Brand Setup
    // Steps: 0=Name, 1=Company, 2=Website+AI, 3=Description, 4=Visual, 5=Role&Goal
    const TOTAL_STEPS = 6;

    const stepTitles = [
      "Let's get introduced.",
      "Tell us about your company.",
      "Magic Website Setup",
      "Explain your vision.",
      "Your Brand's Look.",
      "What's your main goal?"
    ];
    const stepSubtitles = [
      "What should your AI Social Agent call you?",
      "Enter your brand or business name.",
      "Provide your website, and we'll build your strategy automatically.",
      "Help our AI understand what your brand is all about.",
      "Your logo and colors make your AI-generated posts look professional.",
      "Tell us what you want to achieve with AI content."
    ];

    const goNext = () => {
      if (onboardingStep === 0 && !onboardingData.customName.trim()) return toast.error('Please enter your name');
      if (onboardingStep === 1 && !onboardingData.brandName.trim()) return toast.error('Please enter your company or brand name');
      if (onboardingStep === 2 && !onboardingData.website && !onboardingData.noWebsite) return toast.error('Please enter your website or check "No website"');
      if (onboardingStep === 3 && !onboardingData.businessDescription.trim()) return toast.error('Please describe your brand');
      if (onboardingStep === 4) { /* colors/logo optional */ }
      if (onboardingStep >= TOTAL_STEPS - 1) {
        // Last step - submit
        handleCompleteOnboarding({ preventDefault: () => { } });
        if (onboardingData.brandLogo && workspace) {
          const fd = new FormData();
          fd.append('workspaceId', workspace._id);
          fd.append('logo', onboardingData.brandLogo);
          try { apiService.uploadSocialAgentBrand(fd); } catch (_) { }
        }
        return;
      }
      setOnboardingStep(prev => prev + 1);
    };

    return (
      <motion.div
        key={`onboarding-step-${onboardingStep}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 z-[105] bg-gradient-to-br from-slate-50 to-white flex flex-col items-center justify-start overflow-y-auto"
      >
        {/* Top Brand Bar */}
        <div className="w-full shrink-0 px-8 py-5 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <button
            onClick={() => setShowOnboardingGuide(true)}
            className="flex items-center gap-3 group cursor-help transition-all"
            title="Open User Manual"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-all">
              <Sparkles className="w-4 h-4 text-primary group-hover:text-white" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-black text-slate-800 tracking-widest leading-none">AI Ads™ SETUP</span>
              <div className="flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-pulse">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest">See User Guide</span>
              </div>
            </div>
          </button>
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-300 ${i < onboardingStep ? 'w-5 h-1.5 bg-primary' :
                i === onboardingStep ? 'w-5 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-slate-200'
                }`} />
            ))}
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{onboardingStep + 1} / {TOTAL_STEPS}</span>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-lg px-8 py-12 flex flex-col gap-8 pb-40">
          {/* Heading */}
          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[4px] mb-2">Step {onboardingStep + 1}</p>
            <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">{stepTitles[onboardingStep]}</h1>
            <p className="text-sm text-slate-500 font-medium">{stepSubtitles[onboardingStep]}</p>
          </div>

          {/* -- STEP 0: Name -- */}
          {onboardingStep === 0 && (
            <div className="space-y-2">
              <label htmlFor="customName" className="text-xs font-black uppercase tracking-widest text-slate-500 cursor-pointer">Your Full Name</label>
              <input
                id="customName"
                autoFocus
                type="text"
                autoComplete="off"
                placeholder="e.g. Ravi Sharma"
                value={onboardingData.customName || ''}
                onChange={e => setOnboardingData({ ...onboardingData, customName: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && goNext()}
                className="w-full h-14 px-5 rounded-2xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-base font-semibold text-slate-800 transition-all bg-white shadow-sm"
              />
              <p className="text-xs text-slate-400">This is how AI Ads™ will address you throughout the platform.</p>
            </div>
          )}

          {/* -- STEP 1: Company -- */}
          {onboardingStep === 1 && (
            <div className="space-y-2">
              <label htmlFor="brandName" className="text-xs font-black uppercase tracking-widest text-slate-500 cursor-pointer">Company / Brand Name</label>
              <input
                id="brandName"
                autoFocus
                type="text"
                autoComplete="off"
                placeholder="e.g. FitFuel India"
                value={onboardingData.brandName || ''}
                onChange={e => setOnboardingData({ ...onboardingData, brandName: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && goNext()}
                className="w-full h-14 px-5 rounded-2xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-base font-semibold text-slate-800 transition-all bg-white shadow-sm"
              />
              <p className="text-xs text-slate-400">This will be the primary name for your AI agent's workspace.</p>
            </div>
          )}

          {/* -- STEP 2: Website + AI Fetch -- */}
          {onboardingStep === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="onboardingWebsite" className="text-xs font-black uppercase tracking-widest text-slate-500 cursor-pointer">Your Website URL</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="onboardingWebsite"
                    type="url"
                    autoComplete="off"
                    placeholder="https://yourbrand.com"
                    value={onboardingData.website || ''}
                    disabled={onboardingData.noWebsite || isOnboardingFetching}
                    onChange={e => setOnboardingData({ ...onboardingData, website: e.target.value })}
                    className="w-full sm:flex-1 h-14 px-5 rounded-2xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm font-semibold text-slate-800 transition-all bg-white shadow-sm disabled:opacity-50"
                  />
                  <button
                    type="button"
                    disabled={!onboardingData.website || onboardingData.noWebsite || isExtracting}
                    onClick={() => handleAiFetch(onboardingData.website, 'onboarding')}
                    className="w-full sm:w-auto h-14 px-6 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-lg shadow-primary/20 active:scale-95 shrink-0"
                  >
                    {isExtracting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isExtracting ? 'Scanning...' : 'Auto Fill'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Click <span className="font-bold text-primary">Auto Fill</span> to build your entire brand profile instantly.</p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all bg-white">
                <input
                  type="checkbox"
                  checked={onboardingData.noWebsite}
                  onChange={e => setOnboardingData({ ...onboardingData, noWebsite: e.target.checked, website: '' })}
                  className="w-5 h-5 rounded border-2 border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-semibold text-slate-700">I don't have a website yet</span>
              </label>

              {/* Preview of fetched brand data */}
              {(onboardingData.brandName || onboardingData.brandLogoPreview || onboardingData.brandColors?.length > 0) && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">Brand Data Detected</p>
                  <div className="flex items-center gap-4">
                    {onboardingData.brandLogoPreview && (
                      <img src={toProxyUrl(onboardingData.brandLogoPreview)} className="w-12 h-12 object-contain rounded-xl border border-emerald-200 bg-white p-1" alt="Logo" onError={e => e.target.style.display = 'none'} />
                    )}
                    <div className="flex-1 min-w-0">
                      {onboardingData.brandName && <p className="text-sm font-black text-slate-800 truncate">{onboardingData.brandName}</p>}
                      {onboardingData.brandColors?.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                          {onboardingData.brandColors.slice(0, 5).map((c, i) => (
                            <div key={i} className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* -- STEP 3: Brand Description & Strategy Documents -- */}
          {onboardingStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="businessDescription" className="text-xs font-black uppercase tracking-widest text-slate-500">Business Description</label>
                <textarea
                  id="businessDescription"
                  rows={5}
                  placeholder={`Describe what ${onboardingData.brandName || 'your company'} does, who you serve, and what makes you unique...\n\ne.g. We are a health supplement brand focused on Indian athletes and fitness enthusiasts...`}
                  value={onboardingData.businessDescription || ''}
                  onChange={e => setOnboardingData({ ...onboardingData, businessDescription: e.target.value })}
                  className="w-full p-5 rounded-2xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm font-semibold text-slate-800 transition-all bg-white shadow-sm resize-none leading-relaxed"
                />
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Brand Guidelines / Documents</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">PDF or Word (More docs = Better AI)</p>
                  </div>
                  <button
                    onClick={() => document.getElementById('onboarding-docs').click()}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all shadow-sm"
                  >
                    + Add Documents
                  </button>
                  <input
                    type="file"
                    id="onboarding-docs"
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setOnboardingFiles(prev => [...prev, ...files]);
                      // This triggers the useEffect global scan
                    }}
                    accept=".pdf,.doc,.docx"
                  />
                </div>

                {onboardingFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {onboardingFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl">
                        <FileText className="w-3 h-3 text-primary" />
                        <span className="text-[8px] font-black text-primary truncate max-w-[100px]">{f.name}</span>
                        <X
                          className="w-3 h-3 text-primary cursor-pointer hover:scale-120"
                          onClick={() => setOnboardingFiles(prev => prev.filter((_, idx) => idx !== i))}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-400 font-medium italic">AI Ads™ uses these documents to extract your brand's unique voice, unique selling points, and target demographics automatically.</p>
            </div>
          )}

          {/* -- STEP 4: Visual Identity -- */}
          {onboardingStep === 4 && (
            <div className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Brand Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center hover:border-primary hover:bg-indigo-50/50 transition-all cursor-pointer group shadow-sm bg-white overflow-hidden relative shrink-0">
                    {onboardingData.brandLogoPreview ? (
                      <img
                        src={toProxyUrl(onboardingData.brandLogoPreview)}
                        className="w-full h-full object-contain p-2"
                        alt="Logo"
                      />
                    ) : (
                      <Upload className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={e => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        setOnboardingData({ ...onboardingData, brandLogo: file, brandLogoPreview: URL.createObjectURL(file) });
                      }
                    }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Brand identity symbol</p>
                    <p className="text-xs text-slate-400 mt-1">Found on your site or manual upload · Used in AI Creatives</p>
                    {onboardingData.brandLogoPreview && <p className="text-[10px] font-bold text-emerald-600 mt-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Identity Synced</p>}
                  </div>
                </div>
              </div>

              {/* Brand Colors */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Brand Colors</label>
                <div className="flex flex-wrap gap-3 items-center">
                  {(onboardingData?.brandColors || []).map((col, idx) => (
                    <div key={idx} className="relative group">
                      <label className="w-11 h-11 rounded-2xl cursor-pointer shadow-md inline-flex items-center justify-center border-2 border-white ring-1 ring-slate-200 hover:scale-110 transition-transform" style={{ backgroundColor: col }}>
                        <input type="color" value={col} onChange={e => {
                          const nc = [...onboardingData.brandColors]; nc[idx] = e.target.value;
                          setOnboardingData({ ...onboardingData, brandColors: nc });
                        }} className="opacity-0 absolute w-full h-full cursor-pointer" />
                      </label>
                      {idx > 0 && (
                        <button onClick={() => setOnboardingData({ ...onboardingData, brandColors: onboardingData.brandColors.filter((_, i) => i !== idx) })} className="absolute -top-1 -right-1 w-4 h-4 bg-slate-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {(onboardingData.brandColors?.length || 0) < 5 && (
                    <button onClick={() => setOnboardingData({ ...onboardingData, brandColors: [...(onboardingData.brandColors || []), '#4f46e5'] })} className="w-11 h-11 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all bg-white">
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400">These colors will be used in all AI-generated posts and visuals.</p>
              </div>
            </div>
          )}

          {/* -- STEP 5: Role & Goal -- */}
          {onboardingStep === 5 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Your Role</label>
                <div className="space-y-2">
                  {['Small Business Owner', 'Marketing Manager', 'Agency Owner / Freelancer', 'E-commerce Store Owner', 'Content Creator / Influencer', 'Other'].map(role => (
                    <label key={role} className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${onboardingData.role === role ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                      <input type="radio" className="w-4 h-4 text-primary focus:ring-primary border-slate-300" name="role" checked={onboardingData.role === role} onChange={() => setOnboardingData({ ...onboardingData, role })} />
                      <span className="text-sm font-semibold text-slate-700">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Biggest Social Media Challenge</label>
                <div className="space-y-2">
                  {['Generating consistent content ideas', 'Creating professional visuals', 'Managing multiple platforms', 'Converting followers into customers'].map(challenge => (
                    <label key={challenge} className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${onboardingData.biggestChallenge === challenge ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                      <input type="radio" className="w-4 h-4 text-primary focus:ring-primary border-slate-300" name="biggestChallenge" checked={onboardingData.biggestChallenge === challenge} onChange={() => setOnboardingData({ ...onboardingData, biggestChallenge: challenge })} />
                      <span className="text-sm font-semibold text-slate-700">{challenge}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] py-5 px-8 flex flex-col items-center gap-3 z-[115]">
          <div className="w-full max-w-lg flex flex-col gap-3 items-center">
            <button
              onClick={goNext}
              disabled={isOnboardingSaving || isOnboardingFetching}
              className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 bg-primary text-white shadow-xl shadow-primary/30 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60"
            >
              {isOnboardingSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              {onboardingStep < TOTAL_STEPS - 1
                ? (onboardingStep === 0 && onboardingData.customName ? `Continue as ${onboardingData.customName}` : 'Continue')
                : `Launch ${onboardingData.brandName || onboardingData.customName || 'My'}'s Workspace`
              }
              <ArrowRight className="w-4 h-4" />
            </button>
            {onboardingStep > 0 && (
              <button onClick={() => setOnboardingStep(prev => prev - 1)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };


  const renderDirectSynthesisPage = () => {
    const row = calendarEntries.find(r => ensureStringId(r._id) === ensureStringId(activeGenerationRowId));
    const associatedPost = generatedPosts.find(p => ensureStringId(p.calendarEntryId) === ensureStringId(activeGenerationRowId));
    const isDone = associatedPost && !isGenerating;
    const isFailed = !isGenerating && !associatedPost && activeJob?.status === 'failed';

    if (!row) return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 opacity-50">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-black uppercase tracking-[3px]">Loading...</p>
      </div>
    );

    const rowId = ensureStringId(activeGenerationRowId);
    const safeInsights = hashtagInsights || {};
    const currentInsights = Array.isArray(safeInsights[rowId]) ? safeInsights[rowId] : (safeInsights[rowId]?.hashtags || []);
    const postTags = (associatedPost?.hashtags || []).slice(0, 30);
    const allTags = [...new Set([...currentInsights, ...postTags])];

    return (
      <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setActiveGenerationRowId(null); setActiveJob(null); }}
              className="w-9 h-9 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest truncate max-w-[400px]">
                {row?.heading_hook || row?.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-emerald-500' : isFailed ? 'bg-red-400' : 'bg-primary animate-pulse'}`} />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {isDone ? 'Content Ready' : isFailed ? 'Generation Failed' : 'Generating...'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Moved Regenerate Button to AI Content Studio */}
            {isGenerating && (
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left: Hook + Hashtags */}
          <div className="space-y-4">
            {/* Hook Card */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-100 dark:border-white/5 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[3px]">Hook</span>
              </div>
              <p className="text-sm font-black text-slate-800 dark:text-white uppercase leading-snug border-l-2 border-primary pl-3">
                {row?.heading_hook || row?.title}
              </p>
              {row?.sub_heading && (
                <p className="text-[11px] text-slate-400 font-medium mt-3 pl-3 italic leading-relaxed">"{row.sub_heading}"</p>
              )}
            </div>

            {/* Hashtags Card */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-100 dark:border-white/5 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Hash className="w-3.5 h-3.5 text-purple-500" />
                  </div>
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[3px]">Hashtags</span>
                  <span className="text-[8px] text-slate-300 font-bold">({allTags.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const text = allTags.map(tag => `#${typeof tag === 'object' ? (tag.name || tag.hashtag || 'viral') : tag.replace('#', '')}`).join(' ');
                      navigator.clipboard.writeText(text);
                      toast.success('All Hashtags Copied!');
                    }}
                    className="h-6 px-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-400 hover:text-primary text-[8px] font-black uppercase tracking-widest flex items-center gap-1 hover:border-primary/20 transition-all"
                  >
                    <Copy className="w-2.5 h-2.5" /> Copy All
                  </button>
                  <button
                    onClick={async () => {
                      const topic = row?.title || row?.heading_hook || 'social media';
                      const loadingToast = toast.loading('Generating fresh hashtags...');
                      try {
                        const res = await apiService.getSocialHashtagInsights(workspace._id, topic);
                        if (res.success && res.hashtags) {
                          const newTags = Array.isArray(res.hashtags)
                            ? res.hashtags.slice(0, 30)
                            : [
                              ...(res.hashtags?.viralClusters || []).flatMap(c => c.tags || []),
                              ...(res.hashtags?.brandSpecific || [])
                            ].slice(0, 30);
                          setHashtagInsights(prev => {
                            const existing = Array.isArray(prev?.[rowId]) ? prev[rowId] : (prev?.[rowId]?.hashtags || []);
                            return {
                              ...(prev || {}),
                              [rowId]: [...existing, ...newTags]
                            };
                          });
                          toast.success("Hashtags Regenerated!", { id: loadingToast });
                        } else {
                          throw new Error("No hashtags returned");
                        }
                      } catch (err) {
                        toast.error("Failed to regenerate hashtags", { id: loadingToast });
                      }
                    }}
                    className="h-6 px-2.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 text-purple-500 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Regenerate
                  </button>
                </div>
              </div>
              {allTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag, i) => (
                    <span
                      key={i}
                      onClick={() => { navigator.clipboard.writeText(`#${typeof tag === 'object' ? (tag.name || 'viral') : tag.replace('#', '')}`); toast.success('Copied!'); }}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[9px] font-bold text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/5 hover:border-primary/20 cursor-pointer transition-all"
                    >
                      #{typeof tag === 'object' ? (tag.name || tag.hashtag || 'viral') : tag.replace('#', '')}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 opacity-40 py-2">
                  <Search className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Generating...</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Generated Content (2-col span) */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[3px]">AI Content Studio</span>
                </div>
                <div className="flex items-center gap-2">
                  {isDone && (
                    <button
                      onClick={() => handleDirectSynthesis(activeGenerationRowId)}
                      className="h-7 px-3 rounded-lg bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-sm shadow-amber-500/20 flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" /> Regenerate
                    </button>
                  )}

                </div>
              </div>

              <div className="p-6">
                {isGenerating ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 animate-pulse p-6 min-h-[120px] flex flex-col gap-3">
                        <div className="w-16 h-2 bg-slate-200 dark:bg-white/10 rounded-full" />
                        <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full" />
                        <div className="w-3/4 h-2 bg-slate-100 dark:bg-white/5 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : associatedPost ? (
                  <div className="flex flex-col gap-6 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Variations & Captions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {associatedPost.variations?.length > 0 && associatedPost.variations.map((v, i) => (
                        <div key={i} className="group relative bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-5 hover:border-primary/20 hover:bg-white dark:hover:bg-white/[0.05] transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-2 py-0.5 rounded-md bg-primary/5 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/10">
                              {v.type || `Variation ${i + 1}`}
                            </span>
                            <button
                              onClick={() => { navigator.clipboard.writeText(v.text || v); toast.success('Copied!'); }}
                              className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 text-slate-300 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center border border-slate-100 dark:border-white/5"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed select-all">{v.text || v}</p>
                        </div>
                      ))}

                      {/* Consolidated Captions Card */}
                      {(associatedPost.captionLong || associatedPost.captionShort) && (
                        <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-5 relative group hover:border-primary/20 hover:bg-white dark:hover:bg-white/[0.05] transition-all flex flex-col justify-center gap-5">

                          {associatedPost.captionLong && (
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-primary dark:text-indigo-400 uppercase tracking-[3px]">Main Caption</span>
                                <button onClick={() => { navigator.clipboard.writeText(associatedPost.captionLong); toast.success('Copied!'); }} className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 text-slate-300 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center border border-slate-100 dark:border-white/5">
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed select-all font-medium">{associatedPost.captionLong}</p>
                            </div>
                          )}

                          {associatedPost.captionLong && associatedPost.captionShort && (
                            <div className="w-full h-px bg-slate-200/60 dark:bg-white/10" />
                          )}

                          {associatedPost.captionShort && (
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[3px]">Sub Caption</span>
                                <button onClick={() => { navigator.clipboard.writeText(associatedPost.captionShort); toast.success('Copied!'); }} className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 text-slate-300 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center border border-slate-100 dark:border-white/5">
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed select-all font-medium">{associatedPost.captionShort}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 opacity-30">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center animate-pulse">
                      <Zap className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[3px] text-slate-400">Awaiting Generation...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };


  const renderContent = () => {
    if (activeGenerationRowId && activeTab === 'generation') {
      return renderDirectSynthesisPage();
    }

    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'brand': return <BrandWorkspace workspaceId={workspace?._id} />;
      case 'calendar': return renderContentCalendar();
      case 'generation': return renderContentOrchestration();
      case 'assets': return renderAssetLibrary();
      case 'hashtags':
        return renderContentOrchestration();
      case 'usage': return renderUsageBilling();
      case 'settings': return renderSettings();
      default: return renderComingSoon(activeTab);
    }
  };

  return (
    <>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
          </Transition.Child>

          <div id="main-scroll-container" className="fixed inset-0 z-[110] overflow-y-auto overflow-x-hidden custom-scrollbar">
            <div className="flex min-h-full">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                  <Dialog.Panel
                    ref={dashboardRef}
                    className="relative transform bg-background dark:bg-[#161B2E] text-foreground shadow-2xl transition-all w-full min-h-[100dvh] flex"
                  style={{
                    '--background': '45 26% 91%',
                    '--primary': '216 39% 48%',
                    '--accent': '216 46% 70%',
                    '--secondary': '0 0% 100%'
                  }}
                >

                  <AnimatePresence mode="wait">
                    {showOnboarding && renderOnboardingUI()}
                  </AnimatePresence>

                  {/* Always allow onboarding guide to show */}
                  {showOnboardingGuide && renderOnboardingGuideModal()}

                  {/* Dashboard UI - Only show if onboarding is not active and check is done */}
                  {!showOnboarding && !isCheckingOnboarding && (
                    <>
                      {/* Mobile Overlay */}
                      {isMobileMenuOpen && (
                        <div
                          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[130] lg:hidden"
                          onClick={() => setIsMobileMenuOpen(false)}
                        />
                      )}

                      {/* Dashboard Sidebar */}
                      <div className={`
                      fixed lg:sticky lg:top-0 inset-y-0 left-0 z-[140] transform transition-transform duration-500 ease-in-out
                      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                      ${isSidebarCollapsed ? 'lg:w-24' : 'lg:w-[280px]'}
                      w-[280px] h-[100dvh] flex bg-white dark:bg-[#080808] border-r border-slate-200 dark:border-white/5 flex-col shrink-0 group/sidebar
                    `}>
                        {/* Collapse Toggle (Desktop Only) */}
                        <button
                          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                          className="hidden lg:flex absolute -right-3 top-28 w-6 h-6 bg-primary text-white rounded-full items-center justify-center shadow-lg border border-white dark:border-zinc-800 z-50 transition-all"
                        >
                          {isSidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                        </button>

                        {/* Inner Scrollable Content */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col p-6 lg:p-8">

                        {(() => {
                          const onboardedWs = allWorkspaces.find(w => w.onboarding?.completed);
                          const companyName = onboardedWs?.onboarding?.customName || currentUser?.name || 'My Company';
                          const companyAvatarUrl = onboardedWs?.onboarding?.profileImageUrl || currentUser?.avatar;
                          const activeBrandName = activeProfile?.companyName || workspace?.workspaceName || '';
                          return (
                            <Menu as="div" className="relative mb-8">
                              <Menu.Button
                                className={`w-full flex items-center gap-3 p-2.5 rounded-2xl group/ws hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-start ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                                title={isSidebarCollapsed ? companyName : ''}
                              >
                                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-md shadow-primary/5 shrink-0 overflow-hidden">
                                  {companyAvatarUrl ? (
                                    <img src={toProxyUrl(companyAvatarUrl)} alt={companyName} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center text-lg font-black uppercase">
                                      {companyName.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                {!isSidebarCollapsed && (
                                  <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2">
                                    <p className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-tight break-words group-hover/ws:text-primary transition-colors">
                                      {companyName}
                                    </p>
                                    {activeBrandName && (
                                      <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 truncate mt-0.5 leading-none">
                                        {activeBrandName}
                                      </p>
                                    )}
                                  </div>
                                )}
                                {!isSidebarCollapsed && (
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover/ws:text-primary transition-all" />
                                )}
                              </Menu.Button>
                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                              >
                                <Menu.Items className="absolute left-0 mt-1 w-[270px] origin-top-left bg-white dark:bg-[#1E2438] rounded-[24px] shadow-2xl ring-1 ring-black/5 dark:ring-white/5 focus:outline-none z-[130] p-3 border border-slate-100 dark:border-white/5 animate-in slide-in-from-top-2">
                                  <div className="flex items-center gap-3 px-4 py-2.5 mb-1">
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                                      {companyAvatarUrl ? (
                                        <img src={toProxyUrl(companyAvatarUrl)} alt={companyName} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
                                      ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center text-xs font-black uppercase">
                                          {companyName.charAt(0)}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight truncate">{companyName}</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{allWorkspaces.filter(ws => !ws.isPersonalProfile && ws.brandProfile?.companyName).length} {allWorkspaces.filter(ws => !ws.isPersonalProfile && ws.brandProfile?.companyName).length === 1 ? 'Brand' : 'Brands'}</p>
                                    </div>
                                  </div>
                                  <div className="h-px bg-slate-100 dark:bg-white/5 mx-4 mb-2" />
                                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-[2px] px-4 mb-1.5">Switch Brand</p>
                                  <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-0.5 px-1">
                                    {allWorkspaces.map(ws => {
                                      const wsLogo = ws.brandProfile?.logoUrl;
                                      const isActive = workspace?._id === ws._id;
                                      return (
                                        <Menu.Item key={ws._id}>
                                          {({ active }) => (
                                            <button
                                              onClick={() => switchWorkspace(ws)}
                                              className={`w-full flex items-center justify-between gap-3 px-3 h-11 rounded-2xl text-[10px] font-black uppercase tracking-wide transition-all ${active || isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400'}`}
                                            >
                                              <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                                  {wsLogo ? (
                                                    <img src={toProxyUrl(wsLogo)} alt="" className="w-full h-full object-contain p-0.5" onError={e => { e.currentTarget.style.display = 'none'; }} />
                                                  ) : (
                                                    <span className="text-[9px] font-black">{ws.workspaceName?.charAt(0) || 'B'}</span>
                                                  )}
                                                </div>
                                                <span className="truncate">{ws.workspaceName}</span>
                                              </div>
                                              <div className="flex items-center gap-1.5 shrink-0">
                                                {ws.calendarEntryCount > 0 && (
                                                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">{ws.calendarEntryCount}</span>
                                                )}
                                                {isActive && <Check className="w-3 h-3 text-primary" />}
                                              </div>
                                            </button>
                                          )}
                                        </Menu.Item>
                                      );
                                    })}
                                  </div>

                                  <div className="h-px bg-slate-100 dark:bg-white/5 mx-4 my-2" />
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => setShowCompanyInfoPanel(true)}
                                        className={`w-full flex items-center gap-3 px-4 h-10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-indigo-500/5 text-indigo-500' : 'text-slate-500 dark:text-slate-400'}`}
                                      >
                                        <User2 className="w-3.5 h-3.5" />
                                        Company Info
                                      </button>
                                    )}
                                  </Menu.Item>
                                </Menu.Items>
                              </Transition>
                            </Menu>
                          );
                        })()}

                        <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
                          {tabs.map((tab, idx) => {
                            const isPast = tabs.findIndex(t => t.id === activeTab) > idx;
                            const isActive = activeTab === tab.id;

                            return (
                              <button
                                key={tab.id}
                                onClick={() => {
                                  if (!tab.comingSoon) {
                                    setActiveTab(tab.id);
                                    setIsMobileMenuOpen(false);
                                  }
                                }}
                                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center py-5' : 'justify-between px-4 py-3'} rounded-2xl transition-all group ${isActive
                                  ? 'bg-primary/10 border border-primary/20 shadow-sm'
                                  : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                  } ${tab.comingSoon ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                title={isSidebarCollapsed ? tab.name : ''}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 flex items-center justify-center rounded-full border text-[9px] font-black shrink-0 transition-all ${isActive
                                    ? 'bg-primary text-white border-primary shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                                    : isPast
                                      ? 'bg-emerald-500 text-white border-emerald-500'
                                      : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'
                                    }`}>
                                    {isPast ? <Check className="w-3 h-3" /> : (idx + 1)}
                                  </div>
                                  {!isSidebarCollapsed && (
                                    <tab.icon className={`w-4 h-4 ${isActive ? 'text-primary' : isPast ? 'text-emerald-500' : 'text-slate-400 group-hover:text-primary'} transition-colors shrink-0`} />
                                  )}
                                  {!isSidebarCollapsed && (
                                    <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-2 ${isActive ? 'text-primary' : isPast ? 'text-emerald-500' : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                                      }`}>
                                      {tab.name}
                                    </span>
                                  )}
                                </div>
                                {(!tab.comingSoon || !isSidebarCollapsed) && tab.comingSoon && <span className="text-[7px] font-black bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-500 uppercase">Soon</span>}
                              </button>
                            );
                          })}
                        </div>

                        {/* ── ACTIVE BRANDS CARD ─────────────────────── */}
                        {(() => {
                          const activeBrands = allWorkspaces.filter(ws => !ws.isPersonalProfile && ws.brandProfile?.companyName);
                          if (activeBrands.length === 0) return null;
                          return (
                            <div className={`mt-4 ${isSidebarCollapsed ? 'px-1' : 'px-0'}`}>
                              {!isSidebarCollapsed && (
                                <div className="flex items-center gap-2 mb-2.5 px-1">
                                  <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <Palette className="w-3 h-3 text-emerald-500" />
                                  </div>
                                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[2px]">Active Brands</span>
                                  <span className="ml-auto text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-lg border border-emerald-500/10">{activeBrands.length}</span>
                                </div>
                              )}
                              <div className={`rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 ${isSidebarCollapsed ? 'p-1.5' : 'p-2'} space-y-1 max-h-44 overflow-y-auto custom-scrollbar`}>
                                {activeBrands.map(ws => {
                                  const wsLogo = ws.brandProfile?.logoUrl;
                                  const isCurrent = workspace?._id === ws._id;
                                  const brandName = ws.brandProfile?.companyName || ws.workspaceName || 'Brand';
                                  return (
                                    <button
                                      key={ws._id}
                                      onClick={() => switchWorkspace(ws)}
                                      title={isSidebarCollapsed ? brandName : ''}
                                      className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'} rounded-xl transition-all group/brand ${isCurrent
                                        ? 'bg-primary/10 border border-primary/20 shadow-sm'
                                        : 'hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
                                      }`}
                                    >
                                      <div className={`${isSidebarCollapsed ? 'w-7 h-7' : 'w-7 h-7'} rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 overflow-hidden ring-2 ${isCurrent ? 'ring-primary/30' : 'ring-transparent'} transition-all`}>
                                        {wsLogo ? (
                                          <img src={toProxyUrl(wsLogo)} alt="" className="w-full h-full object-contain p-0.5" onError={e => { e.currentTarget.style.display = 'none'; }} />
                                        ) : (
                                          <div className={`w-full h-full flex items-center justify-center text-[9px] font-black uppercase ${isCurrent ? 'bg-gradient-to-br from-primary to-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {brandName.charAt(0)}
                                          </div>
                                        )}
                                      </div>
                                      {!isSidebarCollapsed && (
                                        <div className="flex-1 min-w-0 text-left">
                                          <p className={`text-[10px] font-black uppercase tracking-wide truncate ${isCurrent ? 'text-primary' : 'text-slate-600 dark:text-slate-300 group-hover/brand:text-slate-800 dark:group-hover/brand:text-white'} transition-colors`}>
                                            {brandName}
                                          </p>
                                        </div>
                                      )}
                                      {!isSidebarCollapsed && (
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${isCurrent ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-slate-300 dark:bg-white/20'}`} />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        </div>
                      </div>

                      {/* Main Content Area */}
                      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-zinc-950 relative">
                        {/* Header */}
                        <header className="sticky top-0 h-16 lg:h-24 bg-white/80 dark:bg-[#080808]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-4 lg:px-10 flex items-center justify-between z-[100] shrink-0">
                          <div className="flex items-center gap-2 lg:gap-4">
                            <button
                              onClick={() => setIsMobileMenuOpen(true)}
                              className="lg:hidden w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all text-slate-800 dark:text-white shrink-0"
                            >
                              <AlignLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <h2 className="text-sm sm:text-xl lg:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter truncate max-w-[80px] xs:max-w-[100px] sm:max-w-none">
                              {tabs.find(t => t.id === activeTab)?.name}
                            </h2>

                          </div>

                          <div className="flex items-center gap-2 lg:gap-4 shrink-0">
                            <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-200 transition-all active:scale-95 shadow-sm">
                              <X className="w-4 h-4 lg:w-5 lg:h-5 text-slate-600 dark:text-slate-400" />
                            </button>
                          </div>
                        </header>


                        {/* Scrollable Content */}
                        <main className={`flex-1 ${activeTab === 'generation' ? 'p-4 lg:p-10' : 'p-6 lg:p-12 pb-32'} relative mesh-bg`} data-lenis-prevent>
                          {renderContent()}
                        </main>
                      </div>

                      {renderGenerationWizard()}
                      {renderPostHistoryDrawer()}
                      {renderOneOffAssetModal()}
                      {renderGenPostModal()}
                      {renderManualGenModal()}



                      <AnimatePresence>
                        {showCompanyInfoPanel && renderCompanyInfoPanel()}
                      </AnimatePresence>



                      {activeJob && (
                        <div className="fixed bottom-10 right-10 z-[120] w-80 bg-white dark:bg-[#1E2438] rounded-[32px] border border-slate-100 dark:border-white/5 shadow-2xl p-6 overflow-hidden animate-in slide-in-from-right-10 duration-500">
                          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Sparkles className="w-20 h-20 text-primary" /></div>
                          <div className="relative z-10">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Pipeline Active</span>
                              <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                            </div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4">Synthesizing {activeJob.count} Content DNAs...</h4>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${activeJob.progress || 10}%` }}
                                className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                              />
                            </div>
                            <div className="flex justify-between mt-3">
                              <span className="text-[8px] font-black text-slate-400 uppercase">Calibrating Neural Variations...</span>
                              <span className="text-[8px] font-black text-primary uppercase">{activeJob.progress || 10}% Complete</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {renderAssetPreviewModal()}

                      {/* ── Embedded Premium Upsell Modal (fixes Headless UI stacking context) ── */}
                      {localPremiumModal.open && (
                        <div
                          className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex justify-center items-center p-4"
                          onClick={() => setLocalPremiumModal({ open: false, toolName: '', customMessage: '' })}
                        >
                          <div
                            className="relative bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
                            <button
                              onClick={() => setLocalPremiumModal({ open: false, toolName: '', customMessage: '' })}
                              className="absolute top-4 right-4 p-1.5 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-full transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30 mb-5 relative">
                              <Lock className="w-7 h-7 text-white" />
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-300 flex items-center justify-center border-2 border-[#0f0f0f]">
                                <Crown className="w-2.5 h-2.5 text-amber-800" />
                              </div>
                            </div>
                            <h3 className="text-xl font-black text-white mb-1">Premium Feature</h3>
                            <p className="text-white/50 text-sm mb-1 capitalize font-semibold">{localPremiumModal.toolName}</p>
                            <p className="text-white/40 text-sm mb-6 leading-relaxed">
                              {localPremiumModal.customMessage || (
                                <>This magic tool is only available for <span className="text-amber-400 font-bold">paid plan users</span>. Upgrade your plan to unlock all AI magic tools.</>
                              )}
                            </p>
                            <div className="flex flex-col gap-2 mb-6">
                              {['Generate Images & Videos', 'Web & Deep Search', 'Convert to Audio & Doc', 'Code Writer Mode'].map(f => (
                                <div key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                                  <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                    <Zap className="w-2.5 h-2.5 text-amber-400" />
                                  </div>
                                  {f}
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => { setLocalPremiumModal({ open: false, toolName: '', customMessage: '' }); window.location.href = '/pricing'; }}
                              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black text-sm hover:shadow-lg hover:shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                              <Sparkles className="w-4 h-4" />
                              Upgrade Now
                            </button>
                            <button
                              onClick={() => setLocalPremiumModal({ open: false, toolName: '', customMessage: '' })}
                              className="w-full mt-3 py-2.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors"
                            >
                              Maybe Later
                            </button>
                          </div>
                        </div>
                      )}

                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Full Screen Image Viewer - Rendered via Portal to bypass Dialog stacking context */}
      {typeof document !== 'undefined' && ReactDOM.createPortal(
        <AnimatePresence>
          {expandedImage && (
            <motion.div
              key="img-viewer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 999999, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', cursor: 'zoom-out' }}
              onClick={() => setExpandedImage(null)}
            >
              <button
                style={{ position: 'absolute', top: '24px', right: '24px', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }}
              >
                <X size={24} />
              </button>
              <motion.img
                key={expandedImage}
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.88, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                src={expandedImage}
                alt="Full Size Preview"
                style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};





export default AiSocialMediaDashboard;

