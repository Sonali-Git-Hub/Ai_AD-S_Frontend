import React, { useState, useEffect, Fragment, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  X, Upload, FileText, Calendar, Image as ImageIcon, Video, Layers,
  ChevronDown, ChevronUp, Check, Play, Download, RefreshCw, ChevronLeft,
  Settings, CreditCard, Sparkles, BarChart3, Trash2, ExternalLink,
  LayoutDashboard, Palette, CalendarRange, Library, CheckSquare, Clock,
  ChevronRight, Plus, HelpCircle, AlertCircle, Info, Filter, Search,
  Instagram, Facebook, Linkedin, Twitter, Youtube, Send, Save, Globe, CheckCircle2, Mic2,
  Eye, Target, Zap, Hash, Copy, Sparkle, User, User2, Briefcase, History, Activity, Tag, 
  Server, BrainCircuit, AlertTriangle
} from 'lucide-react';
import { Dialog, Transition, Menu } from '@headlessui/react';
import toast from 'react-hot-toast';
import { apiService } from '../services/apiService';
import { API } from '../types.js';
import { getUserData, updateUser } from '../userStore/userData';

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

const AiSocialMediaDashboard = ({ isOpen, onClose }) => {
  const [currentUser, setCurrentUser] = useState(getUserData());
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Single source of truth: URL determines the active tab
  const activeTab = searchParams.get('tab') || 'overview';

  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId }, { replace: true });
  };

  const [showSplash, setShowSplash] = useState(true);

  // Data State
  const [workspace, setWorkspace] = useState(null);
  const [allWorkspaces, setAllWorkspaces] = useState([]);
  const [brandProfile, setBrandProfile] = useState({
    companyName: '',
    brandColors: [],
    toneOfVoice: '',
    ctaStyle: '',
    website: '',
    targetEthnicity: '',
    extractedBrandSummary: '',
    logoUrl: null,
    targetIndustry: '',
    targetAudience: '',
    contentObjective: 'Awareness',
    campaignMonth: 'January',
    postingFrequency: '3x per week'
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
  const [wizardConfig, setWizardConfig] = useState({ mode: 'today', count: 1 });
  const [stagedCalendarCount, setStagedCalendarCount] = useState(0);

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Phase 3 Collaboration & Scheduling Data
  const [reviewQueue, setReviewQueue] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postHistory, setPostHistory] = useState({ actions: [], comments: [] });
  const [showHistory, setShowHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Phase 2 Add-on: One-off Asset Generation
  const [showOneOffModal, setShowOneOffModal] = useState(false);
  const [oneOffPrompt, setOneOffPrompt] = useState("");
  const [isOneOffGenerating, setIsOneOffGenerating] = useState(false);

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);
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
  const [showOnboardingGuide, setShowOnboardingGuide] = useState(false);
  const [isRapidTestingEnabled, setIsRapidTestingEnabled] = useState(false);

  // Form State
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [selectedBrandView, setSelectedBrandView] = useState(null);
  const [currentEditingBrandId, setCurrentEditingBrandId] = useState(null); // NULL = ADDING NEW
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false); // Unified loading state
  const [lastFetchedData, setLastFetchedData] = useState(null);
  const [calendarFile, setCalendarFile] = useState(null);
  const [brandLogo, setBrandLogo] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
  const [overviewFile, setOverviewFile] = useState(null);

  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editableProfileData, setEditableProfileData] = useState({});
  const profileImageRef = useRef(null);
  const dashboardRef = useRef(null); // Ref to stop Headless UI FocusTrap from stealing focus on keystrokes
  
  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading('Uploading profile picture...');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('workspaceId', workspace?._id);

      const res = await apiService.uploadProfileImage(formData);
      if (res.success) {
        setWorkspace(res.workspace);
        // Sync with AI Ads Core Profile
        const updated = updateUser({ avatar: res.url });
        setCurrentUser(updated);
        toast.success('Profile picture updated!', { id: toastId });
      }
    } catch (error) {
      toast.error('Failed to upload image', { id: toastId });
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'brand', name: 'Brand Setup', icon: Palette },
    { id: 'calendar', name: 'Content Calendar', icon: CalendarRange },
    { id: 'generation', name: 'Content Generation', icon: Sparkles },
    { id: 'assets', name: 'Post Generation', icon: Library }
  ];

  // Derived state for the "Content Calendar" brands - Used in both Calendar tab and Generation tab
  const calendarWorkspaces = React.useMemo(() => {
    return allWorkspaces.filter(ws => 
      (ws.calendarEntryCount > 0) || 
      (ws.onboarding?.calendarCount > 0) || 
      (ws._id === workspace?._id && calendarEntries.length > 0)
    );
  }, [allWorkspaces, workspace?._id, calendarEntries.length]);

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
            toast.success("AI Synthesis: Colors extracted from logo!");
          }
        } catch (e) { console.warn("Logo analysis failed"); }
      };
      analyzeLogo();
      return () => URL.revokeObjectURL(url);
    } else {
      setLogoPreviewUrl(null);
    }
  }, [brandLogo, workspace?._id]);

  // REAL MAGIC: Auto-extract DNA from PDF
  useEffect(() => {
    if (overviewFile) {
      const analyzeDoc = async () => {
        const toastId = toast.loading("AI Synthesis: Distilling brand DNA...");
        try {
          const res = await apiService.quickAnalysis(overviewFile, workspace?._id);
          if (res.success) {
            setBrandProfile(prev => ({
              ...prev,
              companyName: res.brandName || prev.companyName,
              extractedBrandSummary: res.extractedBrandSummary || prev.extractedBrandSummary,
              toneOfVoice: res.toneOfVoice || prev.toneOfVoice
            }));
            toast.success("AI Synthesis: Identity synchronized!", { id: toastId });
          } else {
            toast.error(res.error || "AI could not read this document format.", { id: toastId });
          }
        } catch (e) {
          toast.error("AI engine is currently busy. Please try manual entry.", { id: toastId });
        }
      };
      analyzeDoc();
    }
  }, [overviewFile, workspace?._id]);


  // --- 1. Dashboard Initialization & Splash ---
  useEffect(() => {
    if (isOpen) {
      // Reset and show splash only on initial open
      setShowSplash(true);
      initWorkspace();
    }
  }, [isOpen]);

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


  const handleDownloadMedia = (url) => {
    if (!url) return;

    // Safety check: if the URL is already a proxy URL, extract the inner destination
    let target = url;
    if (url.includes('/api/media/proxy')) {
      try {
        const urlObj = new URL(url);
        const extracted = urlObj.searchParams.get('url');
        if (extracted) target = extracted;
      } catch (e) {
        // Fallback for relative paths or malformed URLs
        const match = url.match(/url=([^&]+)/);
        if (match && match[1]) target = decodeURIComponent(match[1]);
      }
    }

    const proxyUrl = `${API}/media/proxy?url=${encodeURIComponent(target)}&download=true`;
    window.location.href = proxyUrl;
  };

  useEffect(() => {
    if (workspace && activeTab === 'generation') {
      fetchPipelines(workspace._id);
      const rowId = searchParams.get('rowId');
      if (rowId) setActiveGenerationRowId(rowId);
    }
  }, [workspace, activeTab, searchParams]);

  useEffect(() => {
    if (activeGenerationRowId) {
      setSearchParams({ tab: 'generation', rowId: activeGenerationRowId });
    } else if (activeTab === 'generation') {
      setSearchParams({ tab: 'generation' });
    }
  }, [activeGenerationRowId, activeTab]);

  const fetchWorkspaceData = async (wsId) => {
    try {
      setLoading(true);
      // 3. Fetch Brand Profile
      const brandData = await apiService.getSocialAgentBrand(wsId);
      if (brandData.success && brandData.brandProfile) {
        setActiveProfile(brandData.brandProfile);
        // We no longer auto-fill brandProfile form state here to keep it initially empty for the user.
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
    } catch (err) {
      console.error("Fetch WS Data Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const initWorkspace = async () => {
    try {
      setLoading(true);
      // 1. Get All Workspaces
      const wsList = await apiService.getSocialAgentWorkspaces();
      if (wsList.success) setAllWorkspaces(wsList.workspaces);

      // 2. Load latest or create
      let wsData = await apiService.getSocialAgentWorkspace();
      if (!wsData || !wsData.success) {
        wsData = await apiService.createSocialAgentWorkspace({
          workspaceName: `${currentUser?.name || 'My'} Brand`,
          planType: 'Low'
        });
        if (wsData.success) {
          setAllWorkspaces([wsData.workspace]);
        }
      }

      if (wsData.success) {
        setWorkspace(wsData.workspace);
        const wsId = wsData.workspace._id;

        // NEW: Check if ANY workspace has completed onboarding.
        // Onboarding should only appear ONCE for the user across their entire brand agency.
        const anyOnboarded = (wsList.workspaces || []).some(w => w.onboarding?.completed);

        if (!anyOnboarded && !wsData.workspace.onboarding?.completed) {
          setShowOnboarding(true);
          // Also show the guide automatically for new users
          setShowOnboardingGuide(true);
        }

        await fetchWorkspaceData(wsId.toString());
      }
      
      // Removed redundant fetch as allWorkspaces now contains calendarEntryCount
    } catch (error) {
      console.error("Dashboard Init Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiFetch = async (url, target = 'brandProfile') => {
    if (!url) return;
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

    setIsExtracting(true);
    setIsSyncing(true);
    setIsOnboardingFetching(true); // Sync both states
    if (target === 'brandProfile') setLastFetchedData(null); // clear old banner
    const toastId = toast.loading('🔍 AISA is scanning your brand identity...');

    try {
      const json = await apiService.fetchBrandAssets(targetUrl, workspace?._id);

      // Prepare the new profile data from AI response
      const newProfile = {
        companyName: json.brandName || (target === 'brandProfile' ? brandProfile.companyName : ''),
        logoUrl: json.logoUrl || (target === 'brandProfile' ? brandProfile.logoUrl : null),
        brandColors: (json.brandColors && json.brandColors.length > 0) ? json.brandColors : (target === 'brandProfile' ? brandProfile.brandColors : []),
        faviconUrl: json.faviconUrl || (target === 'brandProfile' ? brandProfile.faviconUrl : null),
        extractedBrandSummary: json.description || (target === 'brandProfile' ? brandProfile.extractedBrandSummary : ''),
        toneOfVoice: json.toneOfVoice || (target === 'brandProfile' ? brandProfile.toneOfVoice : 'Professional'),
        ctaStyle: json.ctaStyle || (target === 'brandProfile' ? brandProfile.ctaStyle : 'Direct'),
        targetEthnicity: json.targetRegion || (target === 'brandProfile' ? brandProfile.targetEthnicity : 'Global'),
        targetIndustry: json.industry || (target === 'brandProfile' ? brandProfile.targetIndustry : ''),
        targetAudience: json.targetAudience || (target === 'brandProfile' ? brandProfile.targetAudience : 'Business Owner'),
        domain: json.domain || (target === 'brandProfile' ? brandProfile.domain : ''),
        website: targetUrl
      };

      if (target === 'brandProfile') {
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
    } catch (err) {
      console.error('AI Fetch Error:', err);
      toast.error(err.message || 'Could not fetch brand data automatically.', { id: toastId });
    } finally {
      setIsExtracting(false);
      setIsOnboardingFetching(false);
    }
  };

  useEffect(() => {
    if (workspace?.brandProfile) {
      setBrandProfile({
        companyName: workspace.brandProfile.companyName || '',
        brandColors: workspace.brandProfile.brandColors || ['#3b82f6', '#8b5cf6'],
        toneOfVoice: workspace.brandProfile.toneOfVoice || 'Professional',
        ctaStyle: workspace.brandProfile.ctaStyle || 'Direct',
        website: workspace.brandProfile.website || '',
        targetEthnicity: workspace.brandProfile.targetEthnicity || 'Global',
        extractedBrandSummary: workspace.brandProfile.extractedBrandSummary || '',
        logoUrl: workspace.brandProfile.logoUrl || null,
        targetIndustry: workspace.brandProfile.targetIndustry || '',
        targetAudience: workspace.brandProfile.targetAudience || '',
        contentObjective: workspace.brandProfile.contentObjective || 'Awareness',
        campaignMonth: workspace.brandProfile.campaignMonth || 'January',
        postingFrequency: workspace.brandProfile.postingFrequency || '3x per week'
      });
      setCurrentEditingBrandId(workspace._id);
    }
  }, [workspace]);

  const switchWorkspace = (ws) => {
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
            setShowOnboarding(true);
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
    e.preventDefault();
    if (!workspace) return;
    setIsOnboardingSaving(true);
    try {
      const res = await apiService.completeSocialOnboarding({
        workspaceId: workspace._id,
        ...onboardingData,
        logoUrl: onboardingData.brandLogoPreview
      });
      if (res.success) {
        setWorkspace(res.workspace);
        setShowOnboarding(false);
        toast.success("Workspace setup complete!");
      }
    } catch (error) {
      toast.error("Failed to complete setup");
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
    setIsProcessing(true);
    const toastId = toast.loading("AI is rethinking this post...");
    try {
      const res = await apiService.regenerateSocialAgentPost({
        workspaceId: workspace?._id,
        entryId,
        toneNudge
      });

      if (res.success) {
        setCalendarEntries(prev => prev.map(e =>
          (e._id === entryId || e.idx === entryId) ? res.entry : e
        ));
        toast.success("Post refreshed with new AI energy!", { id: toastId });
      } else {
        toast.error("Regeneration failed", { id: toastId });
      }
    } catch (error) {
      toast.error("AI rethinking failed", { id: toastId });
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
      toast.success(`Orchestrating ${type} synthesis...`);
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
      } else {
        toast.error("Failed to delete entry", { id: toastId });
      }
    } catch (error) {
      toast.error("Error removing entry", { id: toastId });
    }
  };

  const handleToneNudge = (entryId, nudge) => {
    const label = nudge === 'bold' ? 'Bold/Edgy' : 'Friendly/Informative';
    toast(`Nudging AI towards a ${label} tone...`, { icon: '🤖' });
    handleRegeneratePost(entryId, nudge);
  };

  const handleExportExcel = async (specificWsId = null) => {
    const wsId = specificWsId || workspace?._id;
    if (!wsId) return toast.error("Select a brand first");

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
    const toastId = toast.loading("🤖 Crafting high-converting social copy...");
    try {
      const res = await apiService.generateFromCalendar(workspace?._id, entryId);
      if (res.success) {
        // Add the new post to the feed
        setGeneratedPosts(prev => [res.post, ...prev]);
        // Update calendar entry status locally
        setCalendarEntries(prev => prev.map(e => e._id === entryId ? { ...e, status: 'generated' } : e));
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
    if (!brandProfile.companyName) {
      toast.error("Please enter a Brand Name first.");
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
      formData.append('toneOfVoice', brandProfile.toneOfVoice);
      formData.append('ctaStyle', brandProfile.ctaStyle);
      formData.append('website', brandProfile.website || '');
      formData.append('targetEthnicity', brandProfile.targetEthnicity || 'Global');
      formData.append('extractedBrandSummary', brandProfile.extractedBrandSummary || '');
      
      // NEW STRATEGIC FIELDS
      formData.append('targetIndustry', brandProfile.targetIndustry || '');
      formData.append('targetAudience', brandProfile.targetAudience || '');
      formData.append('contentObjective', brandProfile.contentObjective || '');
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
      
      if (overviewFile) formData.append('overview', overviewFile);

      const res = await apiService.uploadSocialAgentBrand(formData);

      if (res && res.success) {
        toast.success(isNew ? "✨ Brand DNA Synchronized!" : "🚀 Strategy Hub Updated!");

        // --- STEP 0: AUTOMATED AI ACTIVATION CHAIN ---
        const wsId = ensureStringId(isNew ? res.brandProfile.workspaceId : (workspace?._id || currentEditingBrandId));

        let activeToast = toast.loading("🔐 Phase 1/3: Synchronizing Brand DNA...", { duration: 10000 });

        try {
          // Pulse effect for normalization
          setTimeout(() => {
            toast.loading("🧠 Phase 2/3: AI Strategist is building your 30-day roadmap...", { id: activeToast });
          }, 2500);

          const genRes = await apiService.generateSocialAgentCalendar(wsId);
          if (genRes.success) {
            toast.loading("🚀 Phase 3/3: Finalizing Social Engine & Asset Sync...", { id: activeToast });

            setTimeout(async () => {
              toast.success("✨ Content Calendar successfully generated. Check the Content Calendar tab for full view!", { id: activeToast });
              setCalendarEntries(genRes.calendar || []);
              await initWorkspace();
              setActiveTab('calendar');
              setShowPreviewModal(true);
              
              // Automatically trigger Excel Download for the user's records
              await handleExportExcel(wsId);
            }, 1000);
          }
        } catch (genErr) {
          console.error("AI Generation Chain Failed:", genErr);
          toast.error("Strategist encountered an error. Please try again in the Content Generation tab.", { id: activeToast });
        }

        // Re-fetch all to show the new card in the grid
        await initWorkspace();

        // Clear inputs AFTER re-fetching to ensure the form is blank for new entry
        setCurrentEditingBrandId(null);
        setBrandLogo(null);
        setOverviewFile(null);
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
      const res = await apiService.deleteSocialAgentWorkspace(wsId);
      if (res.success) {
        toast.success(`"${wsName}" deleted permanently`, { id: toastId });

        // Update local state without whole page refresh
        const updatedList = allWorkspaces.filter(w => w._id !== wsId);
        setAllWorkspaces(updatedList);

        if (workspace?._id === wsId) {
          if (updatedList.length > 0) {
            await switchWorkspace(updatedList[0]);
          } else {
            setWorkspace(null);
            setBrandProfile({ companyName: '', brandColors: ['#3b82f6', '#8b5cf6'], toneOfVoice: 'Professional', ctaStyle: 'Direct', website: '', targetEthnicity: 'Global', extractedBrandSummary: '' });
          }
        }
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
        
        // Step 2: Sync Hashtags to Local State for immediate view
        setHashtagTopic(topic);
        const tagsRes = await apiService.getSocialHashtagInsights(workspace._id, topic);
        if (tagsRes.success) {
          setHashtagInsights(prev => ({
            ...prev,
            [entryId]: tagsRes.hashtags
          }));
        }

        // Step 3: Refresh local data to show the new variations in the table
        await fetchWorkspaceData(workspace._id);
      }
    } catch (err) {
      console.error("[DirectSynthesis] Failed:", err);
      toast.error(err.message || "Synthesis failed");
      setActiveGenerationRowId(null); // Return to table if failed
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateContent = async (customMode = null, customCount = null, entryIds = null) => {
    if (!workspace) return;
    
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
        entryIds: entryIds || []
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
        toast.success(entryIds ? "Synthesis Pipeline Triggered!" : "AI Generation Pipeline Started!");
      }
    } catch (err) {
      toast.error("Generation failed to start");
    } finally {
      setIsGenerating(false);
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

        {/* ── SECTION 1: Strategic Command Stats ─────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Active Brands', val: allWorkspaces.length, icon: Palette, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            { label: 'Strategy Flow', val: calendarEntries.length, icon: CalendarRange, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'AI Post Drafts', val: generatedPosts.length, icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Assets in Vault', val: (assets || []).filter(a => a.assetSource === 'generated').length, icon: Library, color: 'text-primary', bg: 'bg-primary/10' }
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-[32px] bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 flex flex-col items-center text-center group hover:border-primary/30 transition-all shadow-sm">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{stat.val}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── SECTION 2: Hero & Resource Quota ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Banner Section */}
          <div className="lg:col-span-3 p-8 md:p-10 rounded-[48px] bg-gradient-to-br from-[#0A2342] via-[#123C69] to-[#0A2342] text-white relative overflow-hidden group shadow-2xl shadow-blue-900/40 flex flex-col justify-center min-h-[320px] border border-white/10">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white opacity-[0.03] rotate-12 translate-x-1/2 translate-y-1/2 pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-8 right-8 opacity-10 group-hover:opacity-20 transition-opacity duration-1000 pointer-events-none">
              <Sparkles className="w-32 h-32 rotate-12" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="ads-badge-small !bg-white/10 !text-white !border-white/20 uppercase tracking-[4px]">AI ADS ENGINE</div>
              </div>

              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-black leading-[1.1] tracking-[-0.04em] mb-4 drop-shadow-sm">
                  Struggling to come up with <br className="hidden md:block" />
                  daily social posts? <span className="text-blue-400">Not Anymore.</span>
                </h2>
                <p className="text-blue-100/60 font-semibold text-sm md:text-lg leading-relaxed max-w-xl">
                  Introducing <span className="text-white underline decoration-blue-500/50 underline-offset-8">AI Ads™</span> Generator to Create Ready-To-Post Creatives in Seconds!
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <button onClick={() => setActiveTab('calendar')} className="px-8 h-14 bg-white text-[#0A2342] rounded-2xl font-black uppercase text-[10px] tracking-[2px] hover:bg-blue-50 transition-all shadow-xl active:scale-95 flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-[#0A2342]" />
                  Ignite Content
                </button>
                <button onClick={() => setActiveTab('calendar')} className="px-8 h-14 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-2xl font-black uppercase text-[10px] tracking-[2px] hover:bg-white/10 transition-all flex items-center gap-2">
                  View Roadmap
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-8 border-t border-white/10 mt-6 max-w-2xl">
                <div className="flex items-center bg-white/10 backdrop-blur-md rounded-[24px] border border-white/20 p-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                  <input
                    type="text"
                    value={oneOffPrompt}
                    onChange={(e) => setOneOffPrompt(e.target.value)}
                    placeholder="e.g. Generate a minimalist product shot..."
                    className="flex-1 bg-transparent text-white font-bold placeholder:text-white/40 px-4 outline-none text-sm"
                  />
                  <button
                    onClick={() => { if (!oneOffPrompt) return; setShowOneOffModal(true); }}
                    disabled={!oneOffPrompt}
                    className="h-12 px-6 bg-primary rounded-[18px] text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/30 hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 fill-white" /> Run AI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: Dual Monitor (Pulse & Tasks) ────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agent Brain Pulse */}
          <div className="col-span-1 p-8 rounded-[40px] bg-slate-900 border border-slate-800 flex flex-col justify-between overflow-hidden relative group shadow-sm min-h-[400px]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none -z-10" />
            <div className="relative z-10 flex-1">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                  <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Agent Brain Pulse</span>
                </div>
                <div className="text-[8px] font-black text-primary uppercase tracking-[2px]">Real-time</div>
              </div>
              <div className="space-y-6 font-mono text-[10px] sm:text-xs">
                <div className="flex gap-3 text-slate-500 animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <span className="text-primary shrink-0 opacity-50">[{new Date().getHours()}:41]</span>
                  <p className="leading-relaxed">Scanning calendar for optimal post windows...</p>
                </div>
                <div className="flex gap-3 text-slate-400 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <span className="text-primary shrink-0 opacity-50">[{new Date().getHours()}:42]</span>
                  <p className="leading-relaxed">Synthesizing visual prompts based on '{brandProfile.companyName || 'Brand'}' master palette...</p>
                </div>
                <div className="flex gap-3 text-white animate-in fade-in slide-in-from-bottom-6 duration-1000">
                  <span className="text-green-400 shrink-0 font-bold">[{new Date().getHours()}:{new Date().getMinutes()}]</span>
                  <p className="leading-relaxed">System ready. Standing by for {currentUser?.name || 'User'} commands.</p>
                </div>
              </div>
            </div>
            <div className="relative z-10 mt-8 pt-6 border-t border-slate-800 flex items-center justify-between opacity-50 font-mono">
              <span className="text-[8px] uppercase tracking-widest text-slate-500">Autonomous Core v3.0</span>
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Action Tasks (Matches Sidebar Options) */}
          <div className="lg:col-span-2 space-y-8">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Agent Tasks for {currentUser?.name || 'AISA Agent'}</h3>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: 'Brand Setup', val: activeProfile ? '1 Optimized' : '0 Connected', desc: 'Identity Snapshot', icon: Palette, tab: 'brand', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                  { title: 'Content Calendar', val: `${calendarEntries.length} In Queue`, desc: '30-Day Strategy', icon: CalendarRange, tab: 'calendar', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  { title: 'Content Generation', val: `${generatedPosts.length} Drafts`, desc: 'AI Creative Hub', icon: Sparkles, tab: 'generation', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { title: 'Post Generation', val: `${(assets || []).filter(a => a.assetSource === 'generated').length} Artifacts`, desc: 'Generated Media', icon: Library, tab: 'assets', color: 'text-primary', bg: 'bg-primary/10' },
                  { title: 'Hashtag Studio', val: 'Viral Clusters', desc: 'Trending Insights', icon: Hash, tab: 'hashtags', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(action.tab)}
                    className="p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 hover:border-primary transition-all text-left shadow-sm flex flex-col justify-between group h-full"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-sm`}>
                        <action.icon className="w-7 h-7" />
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <ChevronRight className={`w-6 h-6 ${action.color}`} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{action.title}</h4>
                      <p className="text-lg font-black text-slate-800 dark:text-white">{action.val}</p>
                      <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest opacity-60">{action.desc}</p>
                    </div>
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* ── SECTION 5: Live Module Intelligence ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Brand Identity Monitor */}
          <div className="p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Brand identity Monitor</h3>
              </div>
              <button onClick={() => setActiveTab('brand')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">DNA Source &rarr;</button>
            </div>
            
            {activeProfile?.companyName ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
                      {activeProfile.logoUrl ? <img src={activeProfile.logoUrl} className="w-full h-full object-contain p-2" /> : <Palette className="w-6 h-6 text-slate-400" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{activeProfile.companyName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic leading-none">{activeProfile.toneOfVoice || 'Professional'} Tone • {activeProfile.ctaStyle || 'Direct'} CTA</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Ethnicity</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{activeProfile.targetEthnicity || 'Global'}</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Brand DNA</p>
                      <div className="flex gap-1">
                        {(activeProfile.brandColors || []).slice(0, 4).map((c, i) => (
                          <div key={i} className="w-3 h-3 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 col-span-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Strategic Vision Summary</p>
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 italic">
                        {activeProfile.extractedBrandSummary || activeProfile.companyOverviewText || 'Awaiting AI Synthesis...'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <AlertCircle className="w-10 h-10 text-slate-300 mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Configure Identity in Brand Setup</p>
                </div>
              )}
          </div>

          {/* Strategy Roadmap Preview */}
          <div className="p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <CalendarRange className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Strategy Roadmap</h3>
              </div>
              <button onClick={() => setActiveTab('calendar')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Full Strategy &rarr;</button>
            </div>

            <div className="space-y-4">
              {calendarEntries.slice(0, 3).length > 0 ? (
                calendarEntries.slice(0, 3).map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-xs shrink-0">{idx + 1}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight truncate group-hover:text-amber-600 transition-colors">{entry.title}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">{entry.platform} • Scheduled Pipeline</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <Calendar className="w-10 h-10 text-slate-300 mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Initialize Roadmap in Calendar</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION 6: Intelligence & Visual Vault ────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Hashtag Intelligence Summary */}
           <div className="p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Hashtag Intelligence</h3>
                </div>
                <button onClick={() => setActiveTab('hashtags')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Scan topics &rarr;</button>
             </div>
             
             {hashtagInsights?.brandSpecific?.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                 {hashtagInsights.brandSpecific.slice(0, 10).map(tag => (
                   <span key={tag} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">{tag}</span>
                 ))}
               </div>
             ) : (
                <div className="opacity-40 text-center py-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No insights scanned yet.</p>
                </div>
             )}
           </div>

           {/* Content Pipeline Status */}
           <div className="p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Recent Drafts</h3>
                </div>
                <button onClick={() => setActiveTab('generation')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Review all &rarr;</button>
             </div>
             
             <div className="space-y-4">
                {(generatedPosts || []).slice(0, 2).map((post, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group hover:border-primary/20 transition-all">
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
           <div className="p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Library className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Recent Visuals</h3>
                </div>
                <button onClick={() => setActiveTab('assets')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Open Vault &rarr;</button>
             </div>
             
             <div className="grid grid-cols-3 gap-2">
               {(assets || []).filter(a => a.assetSource === 'generated').slice(0, 6).map((asset, i) => (
                 <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-white/5 group relative">
                   <img src={asset.gcsUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Artifact" />
                 </div>
               ))}
               {(assets || []).filter(a => a.assetSource === 'generated').length === 0 && Array.from({ length: 6 }).map((_, i) => (
                 <div key={i} className="aspect-square rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/5" />
               ))}
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
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col space-y-10 pb-20">
        <AnimatePresence>
          {isExtracting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-white/40 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-none"
            >
              <div className="bg-white dark:bg-zinc-900 px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-primary/20 scale-110">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">AI Extraction Active</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Analyzing Brand DNA...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── HEADER & MAGIC ACTION ──────────────────────────────── */}
        <div className="flex flex-col xl:flex-row items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[3px] border border-primary/20">AISA™ Intelligence</div>
              <div className="h-px w-12 bg-primary/30" />
            </div>
            <h2 className="text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-[0.9]">
              Design Your <br /><span className="text-primary italic">Identity</span>
            </h2>
            <p className="text-lg text-slate-400 font-bold max-w-xl">
              Define your brand DNA, sync your digital footprint, and let AISA™ build your professional social presence.
            </p>
          </div>

          <div className="w-full xl:w-[500px] group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-indigo-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden">
               <div className="flex items-center gap-4 mb-5">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Magic Auto-Pilot</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sync EVERYTHING in one click</p>
                 </div>
               </div>
               
               <div className="flex gap-2">
                 <div className="relative flex-1">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      value={brandProfile.website || ''}
                      onChange={(e) => setBrandProfile({ ...brandProfile, website: e.target.value })}
                      placeholder="Enter Brand URL"
                      className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
                    />
                 </div>
                 <button 
                   onClick={() => handleAiFetch(brandProfile.website)}
                   disabled={!brandProfile.website || isExtracting}
                   className="h-14 px-8 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                 >
                   Activate
                 </button>
               </div>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-10 items-start">



          {/* ── CENTER: FORM SECTIONS ──────────────────────────────── */}
          <div className="space-y-8 min-w-0">


            {/* ROW 1: CORE & VOICE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* CARD 1: CORE IDENTITY */}
              <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-10 border border-slate-100 dark:border-white/5 shadow-sm space-y-8 hover:border-primary/20 transition-all duration-500 group">
               <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:rotate-[10deg] transition-all duration-500 relative">
                        <User2 className="w-6 h-6 text-indigo-500 group-hover:text-white" />
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-900">1</span>
                     </div>
                     <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Core Identity</h3>
                   </div>
                   {completionSteps[0].done && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                </div>

                <div className="space-y-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Legal Brand Name</label>
                    <input 
                      value={brandProfile.companyName || ''}
                      onChange={(e) => setBrandProfile({ ...brandProfile, companyName: e.target.value })}
                      placeholder="e.g. Tesla Inc"
                      className="w-full h-16 px-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-3xl text-lg font-black outline-none focus:border-indigo-500 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Target Industry</label>
                    <input 
                      value={brandProfile.targetIndustry || ''}
                      onChange={(e) => setBrandProfile({ ...brandProfile, targetIndustry: e.target.value })}
                      placeholder="e.g. Tech & AI"
                      className="w-full h-14 px-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-3xl text-sm font-bold outline-none focus:border-indigo-500 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Priority Region</label>
                    <div className="relative group/select-region">
                      <select 
                        value={brandProfile.targetEthnicity || 'Global'}
                        onChange={(e) => setBrandProfile({ ...brandProfile, targetEthnicity: e.target.value })}
                        className="w-full h-14 px-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-3xl text-sm font-bold outline-none focus:border-indigo-500 cursor-pointer appearance-none shadow-inner transition-all hover:bg-white dark:hover:bg-white/5"
                      >
                         <option value="Global">Global</option>
                         <option value="Indian">Indian</option>
                         <option value="American">American</option>
                         <option value="European">European</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none group-hover/select-region:scale-110 transition-transform">
                         <ChevronDown className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: VOICE & PERSONALITY */}
              <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-10 border border-slate-100 dark:border-white/5 shadow-sm space-y-8 hover:border-primary/20 transition-all duration-500 group">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:rotate-[-10deg] transition-all duration-500 relative">
                        <Mic2 className="w-6 h-6 text-amber-500 group-hover:text-white" />
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-900">2</span>
                     </div>
                     <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Vocal Signature</h3>
                   </div>
                   {completionSteps[1].done && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Target Audience</label>
                    <div className="relative group/select">
                      <select 
                        value={brandProfile.targetAudience || 'Business Owner'}
                        onChange={(e) => setBrandProfile({ ...brandProfile, targetAudience: e.target.value })}
                        className="w-full h-16 px-10 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-[32px] text-base font-black outline-none focus:border-amber-500 cursor-pointer appearance-none shadow-inner transition-all hover:bg-white dark:hover:bg-white/5"
                      >
                         <option value="Business Owner">BUSINESS OWNER</option>
                         <option value="Students">STUDENTS</option>
                         <option value="Professional (Dr, Advocate, etc.)">PROFESSIONAL (DR, ADVOCATE, ETC.)</option>
                         <option value="Govt Employee">GOVT EMPLOYEE</option>
                         <option value="Retired">RETIRED</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none group-hover/select:scale-110 transition-transform">
                         <ChevronDown className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Content Objective</label>
                    <div className="relative group/select-obj scroll-mt-20">
                      <select 
                        value={brandProfile.contentObjective || 'Awareness'}
                        onChange={(e) => setBrandProfile({ ...brandProfile, contentObjective: e.target.value })}
                        className="w-full h-16 px-10 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-[32px] text-base font-black outline-none focus:border-amber-500 cursor-pointer appearance-none shadow-inner transition-all hover:bg-white dark:hover:bg-white/5"
                      >
                         <option value="Awareness">BRAND AWARENESS</option>
                         <option value="Leads">LEADS</option>
                         <option value="Engagement">ENGAGEMENT</option>
                         <option value="Sales">SALES</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none group-hover/select-obj:scale-110 transition-transform">
                         <ChevronUp className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Archetype (Voice)</label>
                    <div className="grid grid-cols-2 gap-2">
                       {['Professional', 'Casual', 'Bold', 'Friendly'].map(tone => (
                         <button 
                           key={tone}
                           onClick={() => setBrandProfile({ ...brandProfile, toneOfVoice: tone })}
                           className={`h-11 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${brandProfile.toneOfVoice === tone ? 'bg-amber-500 text-white border-amber-600 shadow-md' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-amber-500/30'}`}
                         >
                           {tone}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Conversion CTA Style</label>
                    <select 
                      value={brandProfile.ctaStyle || 'Direct'}
                      onChange={(e) => setBrandProfile({ ...brandProfile, ctaStyle: e.target.value })}
                      className="w-full h-14 px-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-3xl text-sm font-bold outline-none focus:border-amber-500 cursor-pointer appearance-none shadow-inner"
                    >
                      <option value="Direct">Direct & Authoritative</option>
                      <option value="Engagement">Engagement & Community</option>
                      <option value="Storytelling">Narrative & Educational</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: VISUAL IDENTITY (FULL WIDTH) */}
            <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-10 border border-slate-100 dark:border-white/5 shadow-sm space-y-10 hover:border-primary/20 transition-all duration-500 group">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-500 relative">
                        <Palette className="w-6 h-6 text-primary group-hover:text-white" />
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-900">3</span>
                     </div>
                     <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Visual Artifacts</h3>
                   </div>
                   {completionSteps[2].done && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   {/* Logo Upload */}
                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Brand Symbol (Logo)</label>
                       <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black">AI extracted prefered</span>
                     </div>
                     <input type="file" id="logo-upload" className="hidden" onChange={(e) => setBrandLogo(e.target.files[0])} accept="image/*" />
                     <label 
                       htmlFor="logo-upload"
                       className="w-full aspect-video rounded-[36px] bg-slate-50 dark:bg-black/20 border-2 border-dashed border-slate-200 dark:border-white/5 hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group/logo shadow-inner relative"
                     >
                       <AnimatePresence>
                         {(logoPreviewUrl || brandProfile.logoUrl) ? (
                           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-4">
                              <img 
                                src={logoPreviewUrl || (brandProfile.logoUrl?.startsWith('http') ? `${API}/media/proxy?url=${encodeURIComponent(brandProfile.logoUrl)}` : brandProfile.logoUrl)} 
                                className="w-full h-full object-contain p-6 group-hover/logo:scale-105 transition-transform duration-700" 
                              />
                           </motion.div>
                         ) : (
                           <div className="flex flex-col items-center gap-4">
                             <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-lg group-hover/logo:scale-110 transition-all">
                                <Upload className="w-7 h-7 text-slate-400 group-hover/logo:text-primary" />
                             </div>
                             <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 group-hover/logo:text-primary">Click to Deploy Logo</p>
                           </div>
                         )}
                       </AnimatePresence>
                     </label>
                   </div>

                   {/* Color Palette */}
                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Master Palette</label>
                       <button 
                         onClick={() => setBrandProfile({ ...brandProfile, brandColors: [...(brandProfile.brandColors || []), '#3B82F6'] })}
                         className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                       >
                         <Plus className="w-4 h-4" />
                       </button>
                     </div>
                     <div className="grid grid-cols-4 gap-4 p-8 bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-[40px] shadow-inner min-h-[200px] content-start">
                        {(!brandProfile.brandColors || brandProfile.brandColors.length === 0) ? (
                          <div className="col-span-4 flex flex-col items-center justify-center py-6 opacity-30 italic text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                             Awaiting AI chromatic extraction...
                          </div>
                        ) : (
                          brandProfile.brandColors.map((color, i) => (
                            <div key={i} className="group/color relative aspect-square">
                               <div 
                                 className="w-full h-full rounded-[20px] shadow-xl border-4 border-white dark:border-zinc-800 group-hover/color:scale-110 group-hover/color:rotate-[5deg] transition-all cursor-pointer flex items-center justify-center overflow-hidden" 
                                 style={{ backgroundColor: color }}
                               >
                                  <input 
                                    type="color" 
                                    value={color}
                                    onChange={(e) => {
                                      const newColors = [...brandProfile.brandColors];
                                      newColors[i] = e.target.value;
                                      setBrandProfile({ ...brandProfile, brandColors: newColors });
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                               </div>
                               <button 
                                 onClick={() => {
                                   const newColors = brandProfile.brandColors.filter((_, idx) => idx !== i);
                                   setBrandProfile({ ...brandProfile, brandColors: newColors });
                                 }}
                                 className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-all scale-75 group-hover/color:scale-100 shadow-md"
                               >
                                 <X className="w-3 h-3" />
                               </button>
                            </div>
                          ))
                        )}
                     </div>
                   </div>
                </div>
            </div>


            {/* REDESIGNED MASTER SAVE BUTTON */}
            <div className="pt-4">
               <button 
                 onClick={handleSaveBrand}
                 disabled={isSaving}
                 className="group relative w-full h-24 overflow-hidden rounded-[40px] bg-zinc-900 shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
               >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 opacity-90 transition-all group-hover:scale-110"></div>
                  <div className="relative z-10 flex flex-col items-center justify-center">
                     {isSaving ? (
                       <RefreshCw className="w-8 h-8 text-white animate-spin" />
                     ) : (
                       <>
                         <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-white animate-pulse" />
                            <span className="text-xl font-black text-white uppercase tracking-[4px]">Activate Strategy Hub</span>
                            <Sparkles className="w-5 h-5 text-white animate-pulse" />
                         </div>
                         <p className="text-[10px] text-white/60 font-black uppercase tracking-[3px] mt-1">Initiating AI Generation Pulse</p>
                       </>
                     )}
                  </div>
               </button>
            </div>

          </div>

          <div className="sticky top-8 space-y-6 min-w-[350px]">
            
            {/* THE BRAND CARTRIDGE (PASSPORT) */}
            <div className="relative group perspective-1000">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-[50px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative holographic-card rounded-[48px] overflow-hidden bg-white/10 backdrop-blur-3xl border border-white/20 p-1">
                <div className="p-8 space-y-8 bg-zinc-900/40 rounded-[44px] border border-white/5 shadow-2xl">
                   <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-full border-2 border-primary/40 flex items-center justify-center">
                         <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      </div>
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-[4px]">Verified DNA</span>
                   </div>

                   <div className="space-y-6">
                      <div className="w-28 h-28 mx-auto bg-white/10 backdrop-blur-2xl rounded-[40px] border border-white/20 flex items-center justify-center p-6 shadow-3xl group-hover:rotate-6 transition-transform duration-1000 relative">
                         <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-[40px]" />
                         {logoPreviewUrl || brandProfile.logoUrl ? (
                           <img 
                             src={logoPreviewUrl || (brandProfile.logoUrl?.startsWith('http') ? `${API}/media/proxy?url=${encodeURIComponent(brandProfile.logoUrl)}` : brandProfile.logoUrl)} 
                             className="w-full h-full object-contain relative z-10" 
                           />
                         ) : (
                           <Palette className="w-10 h-10 text-white/20 relative z-10" />
                         )}
                      </div>

                      <div className="text-center">
                         <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{brandProfile.companyName || 'Awaiting Sync'}</h2>
                         <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-2">{brandProfile.website || 'No Source connected'}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
                         <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-2">Vocal Tone</p>
                         <p className="text-sm font-bold text-white uppercase truncate">{brandProfile.toneOfVoice || 'Neutral'}</p>
                      </div>
                      <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
                         <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-2">Engagement</p>
                         <p className="text-sm font-bold text-indigo-400 uppercase truncate">{brandProfile.ctaStyle || 'Dynamic'}</p>
                      </div>
                   </div>

                   <div className="pt-4 border-t border-white/5 text-center">
                      <div className="flex justify-center gap-2">
                        {(brandProfile.brandColors || []).slice(0, 5).map((c, i) => (
                           <div key={i} className="w-6 h-6 rounded-lg shadow-xl" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-6">
                        <Zap className="w-3 h-3 text-primary" />
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Autonomous Core Active</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>


             {/* STEP 4: INTELLIGENCE CORE (MATCHED TO REFERENCE) */}
             <div className="p-10 rounded-[48px] bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-8 hover:border-emerald-500/20 transition-all duration-500 group">
                <div className="flex items-center justify-between">
                   <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         <h4 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-[2px]">Intelligence Core</h4>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Strategy Evolution Hub</p>
                   </div>
                   
                   {/* Action Hub */}
                   <div className="flex items-center gap-3">
                      <button 
                        onClick={() => document.getElementById('overview-upload-core').click()}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[9px] font-black uppercase tracking-[2px] text-slate-600 dark:text-slate-300 hover:border-primary/40 hover:text-primary transition-all shadow-sm active:scale-95"
                      >
                         <Upload className="w-3.5 h-3.5" />
                         {overviewFile ? `Ready: ${overviewFile.name.substring(0, 10)}...` : 'Upload Doc'}
                      </button>
                      <input type="file" id="overview-upload-core" className="hidden" onChange={(e) => setOverviewFile(e.target.files[0])} accept=".pdf,.doc,.docx" />
                      
                      <button 
                        onClick={() => handleAiFetch(brandProfile.website)}
                        disabled={isSyncing || !brandProfile.website}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary text-white text-[9px] font-black uppercase tracking-[2px] transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                      >
                         <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                         {isSyncing ? 'Syncing...' : 'Fetch Web'}
                      </button>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="relative">
                      <textarea 
                        value={brandProfile.extractedBrandSummary || ''}
                        onChange={(e) => setBrandProfile({ ...brandProfile, extractedBrandSummary: e.target.value })}
                        placeholder="Type manual brand notes / USP / mission... (OR use the 'Fetch Web' button to automatically synthesize from your URL)"
                        className="w-full h-48 px-8 py-8 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-[40px] text-[13px] font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500 transition-all leading-relaxed resize-none shadow-[0_10px_30px_rgba(0,0,0,0.02)]"
                      />
                      <div className="absolute bottom-6 right-8 flex items-center gap-2 opacity-30">
                        <span className="text-[8px] font-black uppercase tracking-widest">Global DNA Bank</span>
                        <Target className="w-3 h-3" />
                      </div>
                   </div>
                </div>

                {/* SOCIAL ENGINE CONFIG (NEW) */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-4">
                   <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Social Engine</span>
                   </div>
                   <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                         <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Month</label>
                         <div className="relative group/select-month">
                            <select 
                              value={brandProfile.campaignMonth || 'April'}
                              onChange={(e) => setBrandProfile({ ...brandProfile, campaignMonth: e.target.value })}
                              className="w-full h-12 px-6 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-primary transition-all cursor-pointer appearance-none shadow-inner"
                            >
                               {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover/select-month:scale-110 transition-transform">
                               <ChevronDown className="w-4 h-4 text-slate-400" />
                            </div>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Posting Frequency</label>
                         <select 
                           value={brandProfile.postingFrequency || '3x per week'}
                           onChange={(e) => setBrandProfile({ ...brandProfile, postingFrequency: e.target.value })}
                           className="w-full h-10 px-4 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-bold outline-none focus:border-primary transition-all"
                         >
                            <option value="1x per week">1x per week</option>
                            <option value="3x per week">3x per week</option>
                            <option value="Daily">Daily</option>
                            <option value="2x Daily">2x Daily (High Growth)</option>
                         </select>
                      </div>
                   </div>
                </div>
            </div>


            {/* AI SYSTEM INSIGHT */}
            <div className="p-8 rounded-[40px] bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-6">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                 </div>
                 <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Strategist Insights</h4>
               </div>
               
               <div className="space-y-4">
                  <div className="flex items-start gap-3">
                     <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${completionSteps[0].done ? 'bg-emerald-500' : 'bg-slate-300 animate-pulse'}`} />
                     <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        {completionSteps[0].done ? 'Brand Identity core has been established. Foundation is stable.' : 'Link your website to allow AI to analyze your competitor landscape.'}
                     </p>
                  </div>
               </div>

               <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-[9px] font-black text-primary uppercase tracking-widest">Maturity</span>
                     <span className="text-[10px] font-black text-primary">{completionPct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${completionPct}%` }} />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Brand Detail Modal */}
        {selectedBrandView && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-20">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-500" onClick={() => setSelectedBrandView(null)} />
            <div className="relative w-full max-w-4xl bg-white dark:bg-[#0c0c0c] rounded-[48px] overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 flex flex-col md:flex-row">
              <div className="p-10 md:p-16 flex-1 space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-[32px] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center p-4">
                    {selectedBrandView.logoUrl ? <img src={selectedBrandView.logoUrl.startsWith('http') ? `${API}/media/proxy?url=${encodeURIComponent(selectedBrandView.logoUrl)}` : selectedBrandView.logoUrl} className="w-full h-full object-contain" alt="Logo" /> : <Globe className="w-10 h-10 text-slate-300" />}
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
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
        {(() => {
          const hasNoCalendars = calendarWorkspaces.length === 0;

          if (calendarWorkspaces.length === 0 || (!activeProfile && !workspace?.workspaceName)) {
            return (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 rounded-[40px] border border-slate-100 dark:border-white/5 border-dashed opacity-50">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[4px]">
                  {!activeProfile && !workspace?.workspaceName ? 'Setup brand details first' : 'Pipeline Empty'}
                </p>
              </div>
            );
          }

          if (!showPreviewModal) {
            return (
              <div className="flex-1 overflow-y-auto w-full flex items-start justify-start flex-wrap gap-6 p-4">
                {calendarWorkspaces.map(ws => {
                  const profile = ws.brandProfile || {};
                  const isCurrent = ws._id === workspace?._id;
                  const entriesCount = isCurrent ? calendarEntries.length : (ws.calendarEntryCount || ws.onboarding?.calendarCount || 0);

                  return (
                    <div key={ws._id} className={`bg-white dark:bg-zinc-900 rounded-[32px] border p-6 flex flex-col w-[280px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 group animate-in slide-in-from-left-4 ${isCurrent ? 'border-primary shadow-primary/10' : 'border-slate-100 dark:border-white/5'}`}>
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

                            const finalUrl = (typeof rawUrl === 'string' && rawUrl.startsWith('http'))
                              ? `${API}/media/proxy?url=${encodeURIComponent(rawUrl)}`
                              : rawUrl;

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
                          <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[2px] text-slate-400"><Calendar className="w-3.5 h-3.5 opacity-50" /> 30-Day Plan</span>
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
                            onClick={handleExportExcel}
                            title="Download Excel"
                            className="h-11 w-11 bg-slate-50 dark:bg-white/5 hover:bg-green-500/10 text-slate-400 hover:text-green-500 rounded-xl flex items-center justify-center transition-all border border-slate-100 dark:border-white/5 hover:border-green-500/20"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleHardDeleteWorkspace(ws._id)}
                          title="Permanently Delete Brand"
                          className="h-11 w-11 bg-slate-50 dark:bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-all border border-slate-100 dark:border-white/5 hover:border-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[20px] p-5 flex flex-col items-center justify-center w-[260px] h-[190px] text-slate-400 hover:border-primary/50 hover:bg-primary/5 hover:text-primary cursor-pointer transition-all duration-300 opacity-60 hover:opacity-100 group animate-in slide-in-from-left-4" style={{ animationDelay: '100ms' }}>
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Add Pipeline</span>
                </div>
              </div>
            );
          }

          return (
            <div className="flex-1 overflow-hidden flex flex-col space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end px-2">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-1">Imported Schedule</h3>
                  <p className="text-xs text-slate-500 font-medium lowercase italic">Total of {calendarEntries.length} potential posts detected across platforms.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportExcel}
                    disabled={isDownloadingExcel}
                    className="px-6 h-12 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all hover:scale-105 shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {isDownloadingExcel ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4" /> GENERATE EXCEL</>}
                  </button>
                  <button onClick={() => setShowPreviewModal(false)} className="px-6 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-slate-300">
                    <X className="w-4 h-4" /> Exit Preview
                  </button>
                  <label htmlFor="cal-upload-refresh" className="px-6 h-12 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all hover:scale-105 shadow-xl shadow-primary/20">
                    <RefreshCw className="w-4 h-4" /> RE-IMPORT
                    <input type="file" id="cal-upload-refresh" className="hidden" onChange={(e) => { setCalendarFile(e.target.files[0]); handleUploadCalendar(); }} />
                  </label>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
                  {calendarEntries.map((entry, idx) => (
                    <div key={entry._id || idx} className="bg-white dark:bg-zinc-900 rounded-[32px] border border-slate-100 dark:border-white/5 overflow-hidden group hover:shadow-xl transition-all hover:border-primary/20 flex flex-col shadow-sm animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 50}ms` }}>
                      <div className="p-8 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex flex-wrap gap-2">
                             <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                               <Calendar className="w-3 h-3" />
                               <span className="text-[10px] font-black uppercase tracking-widest">{new Date(entry.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                             </div>
                             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${entry.postType === 'Video' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 border-amber-200' :
                               entry.postType === 'Carousel' ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 border-indigo-200' :
                                 'bg-blue-100 dark:bg-primary/10 text-primary border-blue-200'
                               }`}>
                               {entry.postType}
                             </span>
                           </div>
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry._id); }}
                             className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                             title="Hard Delete"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>

                        <div className="flex-1 mb-8">
                          {/* HEADING / HOOK */}
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">HEADING / HOOK</p>
                            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                              {entry.heading_hook || entry.title || 'Strategizing...'}
                            </h4>
                          </div>
                          
                          {/* SUB-HEADING */}
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">SUB-HEADING</p>
                            <p className="text-[10px] text-slate-400 font-bold leading-relaxed mb-6 italic">
                              "{entry.subHeading || entry.sub_heading || entry.hook || 'No sub-heading provided'}"
                            </p>
                          </div>
                          
                          {/* METADATA GRID */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-8 p-5 bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-slate-100 dark:border-white/5">
                            <div className="overflow-hidden">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">PHASE</p>
                              <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 truncate">{entry.phase || 'N/A'}</p>
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">FORMAT</p>
                              <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 truncate">{entry.format || entry.postType || 'N/A'}</p>
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">POST TYPE</p>
                              <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 truncate">{entry.post_type || entry.postType || 'Social'}</p>
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">PLATFORM</p>
                              <div className="flex gap-1.5 mt-1">
                                {['instagram', 'twitter', 'linkedin', 'facebook'].map(p => {
                                  const ep = entry.platform?.toLowerCase() || '';
                                  const rawP = (entry.rawData?.Platform || entry.rawData?.platform || '').toLowerCase();
                                  const isActive = ep.includes(p) || rawP.includes(p);
                                  if (!isActive) return null;
                                  return (
                                    <div key={p} className="text-primary">
                                      {p === 'instagram' && <Instagram className="w-3.5 h-3.5" />}
                                      {p === 'twitter' && <Twitter className="w-3.5 h-3.5" />}
                                      {p === 'linkedin' && <Linkedin className="w-3.5 h-3.5" />}
                                      {p === 'facebook' && <Facebook className="w-3.5 h-3.5" />}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* CONTENT BLOCKS */}
                          <div className="space-y-6 mb-8 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                            {/* SHORT CA */}
                            {(entry.captionShort || entry.short_caption) && (
                              <div>
                                <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                  <Zap className="w-3 h-3" /> SHORT CA
                                </p>
                                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-bold">
                                  {entry.captionShort || entry.short_caption}
                                </p>
                              </div>
                            )}

                            {/* LONG CAP */}
                            {(entry.captionLong || entry.long_caption) && (
                              <div>
                                <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                  <FileText className="w-3 h-3" /> LONG CAP
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                  {entry.captionLong || entry.long_caption}
                                </p>
                              </div>
                            )}

                            {/* HASHTAGS */}
                            {entry.hashtags && (
                              <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                  <Hash className="w-3 h-3" /> HASHTAGS
                                </p>
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

                        <div className="grid grid-cols-2 gap-3 mt-auto pt-6 border-t border-slate-100 dark:border-white/5">
                          <button
                            onClick={() => {
                              handleGenerateContent('today', 1, [entry._id]);
                              setActiveTab('generation');
                            }}
                            disabled={isGenerating}
                            className="h-11 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
                          >
                            {isGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} Gen Post
                          </button>
                          
                          <button
                            onClick={() => handleRegeneratePost(entry._id || idx)}
                            disabled={isProcessing}
                            className="h-11 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-400 hover:text-primary hover:border-primary/20 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                          >
                            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                            <span className="ml-2 text-[9px] font-black uppercase tracking-widest hidden sm:inline">Rethink</span>
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 px-1">
                           <button
                             onClick={() => {
                               setHashtagTopic(entry.title || entry.hook);
                               setActiveTab('hashtags');
                             }}
                             className="text-[8px] font-black text-slate-400 hover:text-indigo-500 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                           >
                             <Hash className="w-3 h-3" /> Viral Tags
                           </button>
                           <button
                             onClick={() => {
                               setOneOffPrompt(`A branded social media image for: ${entry.title}. It should be ${entry.postType} style with a focus on: ${entry.hook}`);
                               setShowOneOffModal(true);
                               setActiveTab('assets');
                             }}
                             className="text-[8px] font-black text-slate-400 hover:text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                           >
                             <Sparkles className="w-3 h-3" /> Magic Asset
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
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-[40px] border border-slate-100 dark:border-white/5 p-12 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <BarChart3 className="w-64 h-64 text-primary" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center border border-primary/20">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">AI Credits</h2>
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

          <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-slate-100 dark:border-white/5 p-8 flex flex-col shadow-sm relative overflow-hidden">
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
                      Running low on image credits. Save remaining for your most critical announcements.
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
              <div key={post._id} className="bg-white dark:bg-zinc-900 rounded-[40px] border border-slate-100 dark:border-white/5 overflow-hidden flex flex-col shadow-sm">
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

        <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-slate-100 dark:border-white/5 overflow-hidden flex flex-col shadow-sm">
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
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 dark:bg-zinc-800">
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
          <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-slate-100 dark:border-white/5 p-10 space-y-10 shadow-sm">
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
            <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-slate-100 dark:border-white/5 p-10 shadow-sm">
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
    const finalRows = (pipelineRows?.length || 0) > 0 ? pipelineRows : calendarEntries;

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col space-y-10 pb-20">
        {/* Step 1: Strategy Context Selector */}
        <div className="bg-white dark:bg-[#080808] p-10 rounded-[50px] border border-slate-100 dark:border-white/5 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-md w-full">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] block mb-4">Select Target Brand Strategy</label>
              <div className="relative group">
                <select 
                  value={workspace?._id}
                  onChange={(e) => {
                    const ws = calendarWorkspaces.find(b => b._id === e.target.value);
                    if (ws) {
                      switchWorkspace(ws);
                      fetchPipelines(ws._id);
                    }
                  }}
                  className="w-full h-16 pl-6 pr-12 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-black uppercase outline-none focus:ring-4 focus:ring-primary/10 appearance-none transition-all cursor-pointer group-hover:border-primary/30"
                >
                  {calendarWorkspaces.length === 0 && <option disabled>Discovery: No Strategy Maps Found</option>}
                  {calendarWorkspaces.map(b => (
                    <option key={b._id} value={b._id}>{b.workspaceName}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-hover:text-primary transition-colors" />
              </div>
            </div>

            {workspace && (
              <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-slate-100 dark:border-white/5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 flex items-center justify-center p-2">
                  {workspace.brandProfile?.logoUrl || workspace.onboarding?.profileImageUrl ? (
                    <img 
                      src={workspace.brandProfile?.logoUrl || workspace.onboarding?.profileImageUrl} 
                      className="w-full h-full object-contain" 
                      alt="Logo" 
                    />
                  ) : (
                    <div className="w-full h-full bg-primary text-white flex items-center justify-center text-xl font-black">
                      {workspace.workspaceName?.charAt(0)}
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

        {/* Step 2: Integrated Brand Dashboard Summary */}
        {workspace && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            <div className="bg-white dark:bg-[#080808] p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Narrative</span>
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase mb-2">Content Objective</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed italic line-clamp-2">
                  {brandProfile?.contentObjective || workspace?.currentStrategy?.summary || "Define your brand narrative in Settings to unlock deep strategy."}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#080808] p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Channels</span>
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase mb-2">Platform Mix</h4>
                <div className="flex gap-2 mt-3">
                  {['Instagram', 'LinkedIn', 'Twitter', 'Facebook'].map(p => {
                    const isActive = workspace?.currentStrategy?.platform_plan?.some(pp => pp.platform === p);
                    return (
                      <div key={p} className={`w-8 h-8 rounded-full flex items-center justify-center border ${isActive ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-300'}`}>
                        {p === 'Instagram' && <Instagram className="w-3.5 h-3.5" />}
                        {p === 'LinkedIn' && <Linkedin className="w-3.5 h-3.5" />}
                        {p === 'Twitter' && <Twitter className="w-3.5 h-3.5" />}
                        {p === 'Facebook' && <Facebook className="w-3.5 h-3.5" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#080808] p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                    <History className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategy Themes</span>
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase mb-2">Weekly Topics</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(workspace?.currentStrategy?.weekly_themes || []).slice(0, 3).map((theme, i) => (
                    <span key={i} className="text-[8px] font-black bg-slate-100 dark:bg-white/5 text-slate-500 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10">
                      {typeof theme === 'object' ? (theme.theme || theme.content_focus || `Week ${theme.week || i+1}`) : theme}
                    </span>
                  ))}
                  {(!workspace?.currentStrategy?.weekly_themes || workspace.currentStrategy.weekly_themes.length === 0) && (
                    <span className="text-[9px] font-bold text-slate-400 italic">No themes mapped yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Content Generation Pipeline */}
        {isPipelineLoading ? (
          <div className="flex flex-col items-center justify-center p-32 bg-white dark:bg-[#080808]/50 rounded-[40px] border border-slate-100 dark:border-white/5 space-y-6">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] animate-pulse">Establishing Secure Brand Connection...</p>
          </div>
        ) : finalRows.length > 0 ? (
          <div className="bg-white dark:bg-[#080808]/50 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl animate-in slide-in-from-bottom-8 duration-700 min-h-[500px] flex flex-col">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Orchestration Pipeline: {workspace?.workspaceName}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{finalRows.length} Strategized Rows Detected</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <button 
                    onClick={() => handleGenerateContent('selected', finalRows.length, finalRows.map(r => r._id))}
                    disabled={isGenerating}
                    className="h-12 px-8 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 relative z-10 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} 
                    Generate Full Plan
                  </button>
                  
                  {/* Premium Hover Card */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 p-5 bg-slate-900/95 backdrop-blur-xl rounded-[24px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-[100]">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                        <BrainCircuit className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-[2px] mb-1.5 bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">Full Plan Synthesis</p>
                        <p className="text-[9px] font-semibold text-slate-400 leading-relaxed uppercase tracking-widest italic">
                          Orchestrate AI to automatically draft captions, creative angles, and platform-specific hashtags for every post in your currently visible plan.
                        </p>
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Optimized for: {workspace?.workspaceName}</span>
                        </div>
                      </div>
                    </div>
                    {/* Decorative Triangle */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900/95" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phase</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategy / Hook</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Type</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {finalRows.map((row, idx) => (
                    <tr key={row._id || idx} className="group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-3 whitespace-nowrap">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex flex-col items-center justify-center border border-slate-200 dark:border-white/10 group-hover:border-primary/30 transition-colors">
                            <span className="text-[10px] font-black text-primary leading-none">{new Date(row.scheduledDate).getDate()}</span>
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">{new Date(row.scheduledDate).toLocaleString('default', { month: 'short' })}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{new Date(row.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex gap-1.5">
                          {['instagram', 'linkedin', 'twitter', 'facebook', 'youtube'].map(p => {
                            const active = (row.platform || row.rawData?.Platform || '').toLowerCase().includes(p);
                            if (!active) return null;
                            return (
                              <div key={p} className="p-2 rounded-lg bg-primary/5 text-primary border border-primary/10 group-hover:border-primary/30 transition-all">
                                {p === 'instagram' && <Instagram className="w-3.5 h-3.5" />}
                                {p === 'linkedin' && <Linkedin className="w-3.5 h-3.5" />}
                                {p === 'twitter' && <Twitter className="w-3.5 h-3.5" />}
                                {p === 'facebook' && <Facebook className="w-3.5 h-3.5" />}
                                {p === 'youtube' && <Youtube className="w-3.5 h-3.5" />}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2 py-1 rounded border border-slate-200 dark:border-white/10">
                          {row.phase || row.rawData?.Phase || "Awareness"}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="max-w-[300px]">
                          <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight mb-1 truncate group-hover:text-primary transition-colors">
                            {row.heading_hook || row.title || row.rawData?.Title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium truncate italic opacity-60">
                            {row.sub_heading || row.hook || row.rawData?.Hook || "Defining direction..."}
                          </p>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                          (row.postType || row.format || row.rawData?.Format) === 'Video' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 border-amber-200/50' :
                          (row.postType || row.format || row.rawData?.Format) === 'Carousel' ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 border-indigo-200/50' :
                          'bg-blue-100 dark:bg-primary/10 text-primary border-blue-200/50'
                        }`}>
                          {row.postType || row.format || row.rawData?.Format}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'generated' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {row.status === 'generated' ? 'Asset Ready' : 'Pending AI'}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        {row.status === 'generated' ? (
                          <button 
                            onClick={() => {
                              const post = generatedPosts.find(p => ensureStringId(p.calendarEntryId) === ensureStringId(row._id));
                              if (post) {
                                const asset = assets.find(a => 
                                  ensureStringId(a.postId) === ensureStringId(post._id) || 
                                  ensureStringId(a._id) === ensureStringId(post.primaryAssetId)
                                );
                                if (asset) {
                                  setSelectedAsset(asset);
                                } else {
                                  toast.error("Visual asset final sync in progress...");
                                }
                              } else {
                                toast.error("Finalizing AI data synchronization...");
                              }
                            }}
                            className="h-10 px-5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10"
                          >
                            <div className="flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Content</span>
                            </div>
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleGenerateContent('today', 1, [row._id])}
                            disabled={isGenerating}
                            className={`h-10 px-5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                              isGenerating 
                              ? 'bg-slate-50 dark:bg-white/5 text-slate-400 border border-slate-100 dark:border-white/5 cursor-not-allowed'
                              : 'bg-primary text-white hover:scale-105 shadow-lg shadow-primary/20 hover:shadow-primary/40'
                            }`}
                          >
                            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto" /> : (
                              <div className="flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5" />
                                <span>Gen Content</span>
                              </div>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                        className="absolute top-6 right-6 opacity-0 group-hover/cluster:opacity-100 transition-opacity text-slate-400 hover:text-primary"
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
                        const all = [...hashtagInsights.viralClusters.flatMap(c => c.tags), ...hashtagInsights.brandSpecific].join(' ');
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
    const generatedAssets = (assets || []).filter(a => a.assetSource === 'generated');

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col space-y-8">
        <div className="flex justify-between items-end bg-white/50 dark:bg-white/[0.02] p-8 rounded-[40px] border border-slate-100 dark:border-white/5">
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">Post Generation</h2>
            <div className="flex items-center gap-6">
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">Manage your library of AI-generated media artifacts.</p>
              <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
              <div className="ads-badge-small !bg-primary/10 !text-primary !border-primary/20 uppercase">{generatedAssets.length} Artifacts</div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input placeholder="Search vault..." className="h-14 pl-12 pr-6 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all w-64" />
            </div>
            <button
              onClick={() => setShowOneOffModal(true)}
              className="h-14 px-6 bg-primary text-white rounded-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              Magic Create
            </button>
            <button className="h-14 w-14 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm"><Filter className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {generatedAssets.map((asset) => (
            <div
              key={asset._id}
              onClick={() => setSelectedAsset(asset)}
              className="aspect-square rounded-3xl overflow-hidden relative group cursor-pointer border-4 border-transparent hover:border-primary/40 transition-all shadow-sm"
            >
              <img src={asset.gcsUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Generated Asset" />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform flex justify-between items-center z-10">
                <span className="text-[8px] font-black text-white uppercase tracking-widest">{asset.assetType?.replace('_', ' ') || 'AI ART'}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadMedia(asset.gcsUrl);
                  }}
                  className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-all text-white border border-white/10"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {generatedAssets.length === 0 && Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-3xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center opacity-40">
              <Sparkles className="w-6 h-6 text-slate-300 mb-2" />
              <span className="text-[8px] font-black text-slate-400 uppercase">Slot {i + 1}</span>
            </div>
          ))}
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
    const currentInsights = Array.isArray(hashtagInsights[rowId]) ? hashtagInsights[rowId] : (hashtagInsights[rowId]?.hashtags || []);
    const suggestedTags = [...new Set([...(post?.hashtags || []), ...currentInsights])];
    const brandTags = hashtagInsights[rowId]?.brandSpecific || [workspace?.workspaceName?.toLowerCase().replace(/\s+/g, '')];

    return (
      <Dialog open={!!selectedAsset} onClose={() => setSelectedAsset(null)} className="relative z-[200]">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-7xl h-[90vh] flex flex-col bg-white rounded-[48px] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-sm overflow-hidden">
                  {activeProfile?.logoUrl ? (
                    <img 
                      src={`${API}/media/proxy?url=${encodeURIComponent(activeProfile.logoUrl)}`} 
                      className="w-full h-full object-contain p-2" 
                      alt="Brand Logo" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center text-xl font-black uppercase">
                      {(brandProfile?.companyName || workspace?.workspaceName || 'B').charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter truncate max-w-md">{selectedAsset?.originalName || 'AI Masterpiece'}</h3>
                    <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-600 uppercase tracking-widest">Post Synchronized</div>
                  </div>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedAsset(null)} 
                  className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Neural Content Hub Body */}
            <div className="flex-1 overflow-y-auto bg-slate-50/30 p-12 custom-scrollbar">
              <div className="max-w-6xl mx-auto space-y-12">
                
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
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[9px] font-black text-primary uppercase tracking-widest">GPT-4 Turbo Enabled</div>
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
                          {v.type || `Variation ${i+1}`}
                        </span>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(v.text); toast.success("Variation Copied!"); }}
                          className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm"
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
                       <h3 className="text-sm font-black text-slate-400 uppercase tracking-[4px]">Awaiting Synthesis Data</h3>
                       <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Trigger regeneration to see fresh angles.</p>
                    </div>
                  )}
                </div>

                {/* Viral Intelligence Lab (Full Width Bottom) */}
                <div className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
                        <Hash className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-800 uppercase tracking-widest">Viral Hashtag Lab</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Topic Contextual Intelligence</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const all = [...new Set([...suggestedTags, ...brandTags])].join(' ');
                        navigator.clipboard.writeText(all);
                        toast.success("Intelligence Suite Copied!");
                      }}
                      className="px-8 h-12 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center gap-3"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Full Cluster
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {[...new Set([...suggestedTags, ...brandTags])].map((tag, i) => (
                      <button 
                        key={i}
                        onClick={() => {
                          navigator.clipboard.writeText(tag);
                          toast.success(`Copied ${tag}`);
                        }}
                        className="px-5 py-3 bg-slate-50 hover:bg-white border border-slate-100 hover:border-primary/30 rounded-2xl text-[10px] font-bold text-slate-500 hover:text-primary transition-all shadow-sm"
                      >
                        #{tag.replace('#', '')}
                      </button>
                    ))}
                  </div>
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
      <Dialog open={showWizard} onClose={() => setShowWizard(false)} className="relative z-[150]">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
        <div className="fixed inset-0 flex items-center justify-center p-8">
          <Dialog.Panel className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-1">Create My Content Plan</h3>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Orchestrate your next move</p>
              </div>
              <button onClick={() => setShowWizard(false)} className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Select Mode</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'today', name: "Today's Post", desc: 'Generate 1 daily entry' },
                    { id: 'bulk', name: 'Bulk Batch', desc: 'Generate next N days' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setWizardConfig({ ...wizardConfig, mode: m.id })}
                      className={`p-6 rounded-3xl border-2 text-left transition-all ${wizardConfig.mode === m.id ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]'
                        }`}
                    >
                      <h4 className="font-black text-xs uppercase tracking-widest mb-1">{m.name}</h4>
                      <p className="text-[10px] font-medium text-slate-400">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {wizardConfig.mode === 'bulk' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-4">Number of days</label>
                  <input
                    type="range" min="1" max="14"
                    value={wizardConfig.count}
                    onChange={(e) => setWizardConfig({ ...wizardConfig, count: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full appearance-none accent-primary mb-2"
                  />
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                    <span>1 Day</span>
                    <span className="text-primary">{wizardConfig.count} DAYS SELECTED</span>
                    <span>14 Days</span>
                  </div>
                </div>
              )}

              <div className="p-6 bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center"><Check className="w-4 h-4 text-green-500" /></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quota Validated</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan: {workspace?.planType}</span>
              </div>
            </div>

            <div className="p-10 bg-slate-50/50 dark:bg-white/[0.01] border-t border-slate-100 dark:border-white/5">
              <button
                onClick={() => handleGenerateContent()}
                disabled={isGenerating}
                className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                Confirm & Deploy Pipeline
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
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
                              <div className="absolute -left-[37px] top-0 w-4 h-4 rounded-full bg-slate-200 dark:bg-zinc-800 border-4 border-white dark:border-zinc-950" />
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

  const renderOneOffAssetModal = () => {
    return (
      <Dialog open={showOneOffModal} onClose={() => setShowOneOffModal(false)} className="relative z-[160]">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
        <div className="fixed inset-0 flex items-center justify-center p-8">
          <Dialog.Panel className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
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

  const renderOnboardingGuideModal = () => {
    const guideSteps = [
      {
        title: "Step 1: Introduction",
        desc: "Initially, AI Ads needs to know who you are and your business name. This is the foundation of your content.",
        icon: User
      },
      {
        title: "Step 2: AI Identity Fetch",
        desc: "Simply enter your website URL, and AI Ads will automatically scan it to extract your logo, brand colors, and company description. No manual entry needed!",
        icon: Zap
      },
      {
        title: "Step 3: Define Goals",
        desc: "Tell us what you want to achieve (e.g., brand awareness, sales) and who your target audience is. This helps AI Ads write posts that actually work.",
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
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">Everything you need to know about AI Ads Setup</p>
                </div>
              </div>
              <button
                onClick={() => setShowOnboardingGuide(false)}
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
                  <span className="font-black">Pro Tip:</span> Even if you don't have a website, you can fill in details manually. AI Ads will still create professional content based on what you describe!
                </p>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setShowOnboardingGuide(false)}
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

  const [isOnboardingFetching, setIsOnboardingFetching] = useState(false);

  const renderOnboardingUI = () => {
    // New streamlined 6-step onboarding: User + Brand Setup
    // Steps: 0=Name, 1=Company, 2=Website+AI, 3=Description, 4=Visual, 5=Role&Goal
    const TOTAL_STEPS = 6;

    const stepTitles = [
      "Let's get introduced.",
      "Tell us about your company.",
      "✨ Magic Website Setup",
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
        // Last step — submit
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
            className="flex items-center gap-2 group cursor-help transition-all"
            title="Open User Manual"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-all">
              <Sparkles className="w-4 h-4 text-primary group-hover:text-white" />
            </div>
            <span className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">AI Ads Setup</span>
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

          {/* ── STEP 0: Your Name ── */}
          {onboardingStep === 0 && (
            <div className="space-y-4">
              <label htmlFor="userName" className="sr-only">Your Name</label>
              <input
                id="userName"
                type="text"
                placeholder="e.g. Ravi Sharma"
                value={onboardingData.customName}
                onChange={e => setOnboardingData({ ...onboardingData, customName: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && goNext()}
                className="w-full h-14 px-5 rounded-2xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-base font-semibold text-slate-800 transition-all bg-white shadow-sm"
              />
              <p className="text-xs text-slate-400">This is how AI Ads will address you throughout the platform.</p>
            </div>
          )}

          {/* ── STEP 1: Company Name ── */}
          {onboardingStep === 1 && (
            <div className="space-y-4">
              <label htmlFor="brandName" className="sr-only">Company Name</label>
              <input
                id="brandName"
                type="text"
                placeholder="e.g. Zeta Health Labs"
                value={onboardingData.brandName}
                onChange={e => setOnboardingData({ ...onboardingData, brandName: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && goNext()}
                className="w-full h-14 px-5 rounded-2xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-base font-semibold text-slate-800 transition-all bg-white shadow-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '💪', label: 'Health & Wellness' },
                  { icon: '🛍️', label: 'E-commerce' },
                  { icon: '💻', label: 'Technology' },
                  { icon: '🍽️', label: 'Food & Lifestyle' },
                  { icon: '📱', label: 'Creator / Personal Brand' },
                  { icon: '🏢', label: 'Agency / Services' },
                ].map(ind => (
                  <label key={ind.label} className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${onboardingData.industry === ind.label ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                    <input type="radio" className="sr-only" name="industry" checked={onboardingData.industry === ind.label} onChange={() => setOnboardingData({ ...onboardingData, industry: ind.label })} />
                    <span className="text-xl">{ind.icon}</span>
                    <span className="text-xs font-bold text-slate-700">{ind.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: Website + AI Fetch ── */}
          {onboardingStep === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="onboardingWebsite" className="text-xs font-black uppercase tracking-widest text-slate-500 cursor-pointer">Your Website URL</label>
                <div className="flex gap-2">
                  <input
                    id="onboardingWebsite"
                    type="url"
                    placeholder="https://yourbrand.com"
                    value={onboardingData.website || ''}
                    disabled={onboardingData.noWebsite || isOnboardingFetching}
                    onChange={e => setOnboardingData({ ...onboardingData, website: e.target.value })}
                    className="flex-1 h-14 px-5 rounded-2xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm font-semibold text-slate-800 transition-all bg-white shadow-sm disabled:opacity-50"
                  />
                  <button
                    type="button"
                    disabled={!onboardingData.website || onboardingData.noWebsite || isExtracting}
                    onClick={() => handleAiFetch(onboardingData.website, 'onboarding')}
                    className="h-14 px-5 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-lg shadow-primary/20 active:scale-95 shrink-0"
                  >
                    {isExtracting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isExtracting ? 'Scanning...' : '✨ Auto Fill'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Click <span className="font-bold text-primary">✨ Auto Fill</span> to build your entire brand profile instantly.</p>
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
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">✅ Brand Data Detected</p>
                  <div className="flex items-center gap-4">
                    {onboardingData.brandLogoPreview && (
                      <img src={onboardingData.brandLogoPreview} className="w-12 h-12 object-contain rounded-xl border border-emerald-200 bg-white p-1" alt="Logo" onError={e => e.target.style.display = 'none'} />
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

          {/* ── STEP 3: Brand Description ── */}
          {onboardingStep === 3 && (
            <div className="space-y-4">
              <label htmlFor="businessDescription" className="sr-only">Business Description</label>
              <textarea
                id="businessDescription"
                rows={6}
                placeholder={`Describe what ${onboardingData.brandName || 'your company'} does, who you serve, and what makes you unique...\n\ne.g. We are a health supplement brand focused on Indian athletes and fitness enthusiasts...`}
                value={onboardingData.businessDescription || ''}
                onChange={e => setOnboardingData({ ...onboardingData, businessDescription: e.target.value })}
                className="w-full p-5 rounded-2xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm font-semibold text-slate-800 transition-all bg-white shadow-sm resize-none leading-relaxed"
              />
              <p className="text-xs text-slate-400">AI Ads uses this to generate contextually relevant posts, captions, and creatives for your brand.</p>
            </div>
          )}

          {/* ── STEP 4: Visual Identity ── */}
          {onboardingStep === 4 && (
            <div className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Brand Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center hover:border-primary hover:bg-indigo-50/50 transition-all cursor-pointer group shadow-sm bg-white overflow-hidden relative shrink-0">
                    {onboardingData.brandLogoPreview ? (
                      <>
                        <img src={onboardingData.brandLogoPreview} alt="Logo Preview" className="w-full h-full object-contain p-2" onError={e => e.target.style.display = 'none'} />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">Change</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-primary">
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-[9px] font-bold">Upload</span>
                      </div>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={e => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        setOnboardingData({ ...onboardingData, brandLogo: file, brandLogoPreview: URL.createObjectURL(file) });
                      }
                    }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Upload your logo</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG or SVG · Used in all AI-generated posts</p>
                    {onboardingData.brandLogoPreview && <p className="text-[10px] font-bold text-emerald-600 mt-2">✓ Logo ready</p>}
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

          {/* ── STEP 5: Role & Goal ── */}
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
                ? (onboardingStep === 0 && onboardingData.customName ? `Continue as ${onboardingData.customName}` : 'Continue →')
                : `Launch ${onboardingData.brandName || onboardingData.customName || 'My'}'s Workspace 🚀`
              }
            </button>
            {onboardingStep > 0 && (
              <button onClick={() => setOnboardingStep(prev => prev - 1)} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                ← Back
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderUserProfileModal = () => {
    const handleEditProfileClick = () => {
      setEditableProfileData({
        customName: workspace?.onboarding?.customName || '',
        role: workspace?.onboarding?.role || '',
        industry: workspace?.onboarding?.industry || '',
        postingFrequency: workspace?.onboarding?.postingFrequency || '',
        website: workspace?.onboarding?.website || '',
        biggestChallenge: workspace?.onboarding?.biggestChallenge || '',
        contentCreationTime: workspace?.onboarding?.contentCreationTime || '',
        adsComfortLevel: workspace?.onboarding?.adsComfortLevel || '',
        selectedPlatforms: workspace?.selectedPlatforms || [],
      });
      setIsEditingProfile(true);
    };

    const calculateProfileCompleteness = () => {
      const fields = [
        workspace?.onboarding?.customName,
        workspace?.onboarding?.role,
        workspace?.onboarding?.industry,
        workspace?.onboarding?.postingFrequency,
        workspace?.onboarding?.website,
        workspace?.onboarding?.biggestChallenge,
        workspace?.onboarding?.contentCreationTime,
        workspace?.onboarding?.adsComfortLevel,
      ];
      const filled = fields.filter(f => f && f !== '' && f !== 'Setup Required').length;
      return Math.round((filled / fields.length) * 100);
    };

    const handleSaveProfile = async () => {
      try {
        setIsSaving(true);
        const res = await apiService.completeSocialOnboarding({
          workspaceId: workspace._id,
          ...editableProfileData
        });
        if (res.success) {
          setWorkspace(res.workspace);
          setIsEditingProfile(false);
          toast.success("Profile updated successfully!");
        }
      } catch (error) {
        toast.error("Failed to update profile");
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[160] bg-white dark:bg-[#080808] flex flex-col overflow-y-auto custom-scrollbar"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex-1 flex flex-col relative"
        >
          <button
            onClick={() => {
              setShowUserProfileModal(false);
              setIsEditingProfile(false);
            }}
            className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-20 backdrop-blur-md border border-white/20"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Premium Header */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-primary p-12 sm:p-20 text-white flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <input
              type="file"
              ref={profileImageRef}
              onChange={handleProfileImageUpload}
              className="hidden"
              accept="image/*"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-32 h-32 rounded-full bg-white/20 border-4 border-white/20 flex items-center justify-center text-6xl font-black shadow-2xl relative z-10 mb-6 backdrop-blur-xl ring-8 ring-white/5 cursor-pointer group/avatar overflow-hidden"
              onClick={() => profileImageRef.current?.click()}
            >
              {(() => {
                // Priority for User Profile: 1. User Avatar -> 2. Saved Multi-brand Onboarding Image -> 3. Brand Logo (Fallback)
                const rawUrl = currentUser?.avatar || workspace?.onboarding?.profileImageUrl || activeProfile?.logoUrl;
                if (rawUrl) {
                  const finalUrl = (typeof rawUrl === 'string' && rawUrl.startsWith('http'))
                    ? `${API}/media/proxy?url=${encodeURIComponent(rawUrl)}`
                    : rawUrl;
                  return <img src={finalUrl} alt="User Profile" className="w-full h-full object-cover" onError={e => e.target.src = "/social_media_3d_logo.png"} />;
                }
                const nameToUse = workspace?.onboarding?.customName || currentUser?.name || activeProfile?.companyName || 'U';
                return (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center text-4xl font-black uppercase">
                    {nameToUse.charAt(0)}
                  </div>
                );
              })()}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                <Upload className="w-8 h-8 text-white rotate-180" />
              </div>
            </motion.div>

            <div className="flex flex-col items-center gap-1 relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black tracking-tight"
              >
                {workspace?.onboarding?.customName || currentUser?.name || 'User Profile'}
              </motion.h1>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <span className="text-[10px] font-black uppercase tracking-[3px] text-indigo-200/60 bg-white/5 px-3 py-1 rounded-full border border-white/10 italic">
                  ID: {currentUser?._id?.substring(0, 8) || 'Anonymous'}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[10px] font-black uppercase tracking-[5px] text-indigo-100">
                  {workspace?.onboarding?.role ? workspace.onboarding.role.replace(/_/g, ' ') : 'Agitator'}
                </span>
              </div>
            </div>

            {/* Profile Completeness Insight */}
            {!isEditingProfile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-10 w-full max-w-sm relative z-10 p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-indigo-100 uppercase tracking-[4px]">Profile Vitality</span>
                  <span className="text-[10px] font-black text-emerald-400">{calculateProfileCompleteness()}%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-[1px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateProfileCompleteness()}%` }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.4)]"
                  />
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-8 sm:p-20 space-y-16 flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Side: Deep Profile Details */}
              <div className="lg:col-span-2 space-y-10">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[5px] flex items-center gap-3">
                      <Target className="w-5 h-5 text-indigo-500" /> Identity Blueprint
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: 'My Industry', key: 'industry', type: 'text', icon: Palette },
                      { label: 'Post Volume', key: 'postingFrequency', type: 'select', options: ['daily', 'weekly', 'monthly'], icon: CalendarRange },
                      { label: 'Nexus URL', key: 'website', type: 'url', icon: Globe },
                      { label: 'Agitator', key: 'biggestChallenge', type: 'text', icon: Sparkles },
                      { label: 'Grind Time', key: 'contentCreationTime', type: 'select', options: ['1_hour', '5_hours', '10_hours', '10_plus', 'too_much'], icon: Clock },
                      { label: 'Advocacy', key: 'adsComfortLevel', type: 'select', options: ['comfortable', 'neutral', 'uncomfortable'], icon: CheckSquare }
                    ].filter(f => workspace?.onboarding?.[f.key] && workspace?.onboarding?.[f.key] !== '' && workspace?.onboarding?.[f.key] !== 'Awaiting Definition')
                      .map((field, idx) => (
                        <motion.div
                          key={field.key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + (idx * 0.05) }}
                          className="bg-slate-50/50 dark:bg-white/[0.02] p-5 rounded-3xl border border-slate-200/50 dark:border-white/5 hover:border-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/[0.02] transition-all group relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <field.icon className="w-12 h-12" />
                          </div>
                          <label htmlFor={`profile-${field.key}`} className="text-[10px] font-black text-indigo-500/80 uppercase tracking-[3px] block mb-2 cursor-pointer">{field.label}</label>
                          {isEditingProfile ? (
                            field.type === 'select' ? (
                              <select
                                id={`profile-${field.key}`}
                                value={editableProfileData[field.key] || ''}
                                onChange={e => setEditableProfileData({ ...editableProfileData, [field.key]: e.target.value })}
                                className="w-full text-sm font-bold bg-white dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700/50 rounded-2xl p-3 focus:ring-4 focus:ring-indigo-50/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                              >
                                <option value="">Select Option...</option>
                                {field.options.map(opt => <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>)}
                              </select>
                            ) : (
                              <input
                                id={`profile-${field.key}`}
                                type={field.type}
                                value={editableProfileData[field.key] || ''}
                                onChange={e => setEditableProfileData({ ...editableProfileData, [field.key]: e.target.value })}
                                placeholder={`Enter ${field.label}...`}
                                className="w-full text-sm font-bold bg-white dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700/50 rounded-2xl p-3 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                              />
                            )
                          ) : (
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 capitalize truncate">
                              {(() => {
                                const ow = allWorkspaces.find(w => w.onboarding?.completed) || workspace;
                                if (field.key === 'website' && ow?.onboarding?.[field.key]) {
                                  return <a href={ow.onboarding[field.key]} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">{ow.onboarding[field.key].replace(/^https?:\/\//, '')}</a>;
                                }
                                return ow?.onboarding?.[field.key]?.replace(/_/g, ' ') || 'Awaiting Definition';
                              })()}
                            </p>
                          )}
                        </motion.div>
                      ))}
                  </div>
                </div>

                {/* Extended Road Map Feature */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-br from-indigo-600/10 via-indigo-600/5 to-transparent p-8 rounded-[32px] border border-indigo-600/10 backdrop-blur-sm group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-500">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[4px] mb-2">Social HQ Roadmap</h3>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
                        We are evolving your profile into a <strong className="text-indigo-600 dark:text-indigo-400">Content Command Center</strong>. Soon, you'll be able to sync Social OAuth for direct publishing, define multi-persona audiences, and configure real-time AI approval triggers.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Side: Social Grid & Preferences */}
              <div className="space-y-12">
                <div>
                  <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[5px] flex items-center gap-3 mb-8">
                    <Layers className="w-5 h-5 text-emerald-500" /> Active Echoes
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {isEditingProfile ? (
                      ['instagram', 'tiktok', 'linkedin', 'twitter', 'facebook'].map(plat => {
                        const isSelected = editableProfileData.selectedPlatforms?.includes(plat);
                        return (
                          <button
                            key={plat}
                            onClick={() => {
                              const current = editableProfileData.selectedPlatforms || [];
                              const next = isSelected
                                ? current.filter(p => p !== plat)
                                : [...current, plat];
                              setEditableProfileData({ ...editableProfileData, selectedPlatforms: next });
                            }}
                            className={`p-4 rounded-[24px] border-2 transition-all flex flex-col items-center gap-2 ${isSelected ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5'}`}
                          >
                            <span className={`text-xs font-black uppercase tracking-widest ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`}>{plat}</span>
                          </button>
                        );
                      })
                    ) : (
                      (() => {
                        const ow = allWorkspaces.find(w => w.onboarding?.completed) || workspace;
                        return (ow?.selectedPlatforms && ow.selectedPlatforms.length > 0 ? ow.selectedPlatforms : ['instagram', 'tiktok']).map((platform, idx) => (
                          <motion.div
                            key={platform}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 + (idx * 0.1) }}
                            className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 p-4 rounded-[24px] flex flex-col items-center justify-center text-center group hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all font-black text-[10px] uppercase text-slate-400 tracking-widest"
                          >
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-100 dark:border-white/10 flex items-center justify-center mb-3 shadow-sm group-hover:shadow-lg transition-all group-hover:-translate-y-1">
                              <span className="text-emerald-500">{platform.charAt(0).toUpperCase()}</span>
                            </div>
                            {platform}
                          </motion.div>
                        ));
                      })()
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[5px] flex items-center gap-3 mb-8">
                    <Settings className="w-5 h-5 text-slate-500" /> Core Toggles
                  </h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Weekly Performance', desc: 'AI-driven growth digests' },
                      { label: 'Autonomous Queue', desc: 'Auto-pilot day-by-day runs' }
                    ].map((pref, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + (idx * 0.1) }}
                        className="group flex items-center justify-between p-5 bg-slate-50/50 dark:bg-white/[0.02] rounded-[24px] border border-slate-200/5 dark:border-white/5 hover:bg-white transition-all shadow-sm"
                      >
                        <div className="pr-4">
                          <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-[2px]">{pref.label}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{pref.desc}</p>
                        </div>
                        <div className="w-10 h-5 bg-slate-200 dark:bg-white/10 rounded-full relative cursor-not-allowed opacity-40">
                          <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-20 pt-12 border-t border-slate-200/10 flex flex-col sm:flex-row justify-between items-center gap-6 pb-20">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px]">Verified AI Ads Core • Version 1.0.4</p>

              <div className="flex gap-4">
                {isEditingProfile ? (
                  <>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-8 py-3.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-black text-xs uppercase hover:bg-slate-200 transition-all active:scale-95"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-10 py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase transition-all shadow-[0_15px_30px_rgba(79,70,229,0.3)] hover:shadow-indigo-600/50 hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? 'Syncing...' : 'Commit Settings'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEditProfileClick}
                      className="px-8 py-3.5 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase border border-indigo-600/20 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                    >
                      Precision Adjust
                    </button>
                    <button
                      onClick={() => setShowUserProfileModal(false)}
                      className="px-12 py-3.5 rounded-2xl bg-primary text-white font-black text-xs uppercase hover:bg-primary/90 transition-all shadow-[0_15px_30px_rgba(var(--primary-rgb),0.3)] hover:shadow-primary/50 active:scale-95"
                    >
                      Finalize View
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderDirectSynthesisPage = () => {
    const row = calendarEntries.find(r => ensureStringId(r._id) === ensureStringId(activeGenerationRowId));
    const associatedPost = generatedPosts.find(p => ensureStringId(p.calendarEntryId) === ensureStringId(activeGenerationRowId));
    const isDone = associatedPost && !isGenerating;
    const isFailed = !isGenerating && !associatedPost && activeJob?.status === 'failed';

    if (!row) return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 opacity-60">
        <RefreshCw className="w-12 h-12 text-primary animate-spin" />
        <p className="text-xs font-black uppercase tracking-[4px]">Neural Context Recovery...</p>
      </div>
    );

    return (
      <div className="flex flex-col h-full bg-[#f8fafc] animate-in fade-in zoom-in-95 duration-500 overflow-hidden rounded-[40px] border border-slate-100">
        {/* Header Navigation */}
        <div className="p-8 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => { setActiveGenerationRowId(null); setActiveJob(null); }}
              className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200 hover:bg-slate-100 transition-all text-slate-500"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-[4px]">Direct Synthesis Page</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row?.title || "Targeted Orchestration"}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {isDone && (
               <button 
                 onClick={() => handleDirectSynthesis(activeGenerationRowId)}
                 className="h-12 px-6 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
               >
                 Regenerate Variations
               </button>
             )}
             <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
               <Zap className={`w-5 h-5 ${isGenerating ? 'text-primary animate-pulse' : 'text-slate-400'}`} />
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-[1700px] mx-auto min-h-full items-start">
            
            {/* Sidebar: Strategic Framework & Intelligence */}
            <div className="lg:col-span-4 space-y-10 h-full">
              {/* Strategic DNA Card */}
              <div className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-12 translate-x-12" />
                <div className="flex justify-between items-center mb-10 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                      <Target className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-[3px]">Strategic DNA</span>
                  </div>
                </div>
                <h4 className="text-lg font-black text-slate-800 uppercase mb-10 leading-relaxed border-l-4 border-primary pl-6 py-2">{row?.heading_hook || row?.title}</h4>
                
                <div className="space-y-4">
                  {[
                    { label: 'Platform', value: row?.platform || 'Multi', icon: Globe },
                    { label: 'Strategy Phase', value: row?.phase || 'Awareness', icon: Zap },
                    { label: 'Format Mix', value: row?.format || 'Social Post', icon: Layers }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl group-hover:bg-white transition-all">
                      <div className="flex items-center gap-4">
                        <item.icon className="w-5 h-5 text-slate-400" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hashtag Hub Card */}
              <div className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
                      <Hash className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-[3px]">Viral Intelligence</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {(() => {
                    const rowId = ensureStringId(activeGenerationRowId);
                    const currentInsights = Array.isArray(hashtagInsights[rowId]) ? hashtagInsights[rowId] : (hashtagInsights[rowId]?.hashtags || []);
                    const postTags = associatedPost?.hashtags || [];
                    const allTags = [...new Set([...currentInsights, ...postTags])];
                    
                    if (allTags.length > 0) {
                      return allTags.map((tag, i) => (
                        <span key={i} className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 hover:text-primary hover:bg-white hover:border-primary/30 transition-all cursor-pointer">
                          #{typeof tag === 'object' ? (tag.name || tag.hashtag || 'viral') : tag.replace('#', '')}
                        </span>
                      ));
                    }
                    return (
                      <div className="flex flex-col items-center justify-center w-full p-10 text-center space-y-4 opacity-30">
                        <div className="p-4 rounded-full border border-dashed border-slate-400 animate-pulse"><Search className="w-6 h-6" /></div>
                        <p className="text-[9px] font-black uppercase tracking-[3px]">Mapping Context...</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Main Workspace: Evolution variations */}
            <div className="lg:col-span-8 flex flex-col h-full space-y-10">
              <div className="bg-white p-12 rounded-[60px] border border-slate-100 flex flex-col h-full shadow-2xl relative overflow-hidden min-h-[85vh]">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl text-primary" />
                
                <div className="flex items-center justify-between mb-12 relative z-10 p-4 border-b border-slate-50 pb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-sm">
                      <Layers className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight">AI Content Studio</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <div className={`w-2 h-2 rounded-full ${isDone ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : 'bg-primary animate-pulse'}`} />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isDone ? 'Variations Ready' : isFailed ? 'Failed to Generate' : 'Generating creative angles...'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {isGenerating && (
                    <div className="flex items-center gap-8 pr-6">
                       <div className="flex flex-col items-end">
                         <span className="text-[9px] font-black text-primary uppercase tracking-[3px]">Synthesis Active</span>
                         <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">Optimizing Variation Logic</span>
                       </div>
                       <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                    </div>
                  )}
                </div>

                {/* Evolution Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-y-auto pr-4 custom-scrollbar">
                  {isGenerating ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200 animate-pulse flex flex-col items-center justify-center p-12 min-h-[300px]">
                        <RefreshCw className="w-10 h-10 text-primary/10 animate-spin mb-4" />
                        <div className="w-32 h-2 bg-slate-200 rounded-full" />
                      </div>
                    ))
                  ) : associatedPost?.variations?.length > 0 ? (
                    associatedPost.variations.map((v, i) => (
                      <div key={i} className="group bg-white p-12 rounded-[50px] border border-slate-100 hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-2xl relative flex flex-col">
                        <div className="flex justify-between items-start mb-8">
                          <span className="px-4 py-2 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                            {v.type || `Variation ${i+1}`}
                          </span>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(v.text); toast.success("Variation Copied!"); }}
                            className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-[15px] text-slate-600 font-medium leading-[1.8] flex-1 select-all">
                          {v.text || v}
                        </p>
                        <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between opacity-30">
                          <span className="text-[10px] font-black uppercase tracking-widest italic">{row?.platform?.toUpperCase()} OPTIMIZED</span>
                          <Sparkles className="w-4 h-4" />
                        </div>
                      </div>
                    ))
                  ) : associatedPost ? (
                    <div className="space-y-10 group/card">
                      <div className="p-10 bg-slate-50 border border-slate-100 rounded-[45px] shadow-sm">
                         <div className="flex justify-between items-center mb-6">
                           <span className="text-[9px] font-black text-primary uppercase tracking-[4px]">Synthesized Content</span>
                           <button onClick={() => { navigator.clipboard.writeText(associatedPost.captionLong || associatedPost.hook); toast.success("Primary Content Copied!"); }}>
                             <Copy className="w-4 h-4 text-slate-400 hover:text-primary transition-colors" />
                           </button>
                         </div>
                         <p className="text-[15px] text-slate-600 font-medium leading-relaxed italic">{associatedPost.captionLong || associatedPost.hook}</p>
                      </div>
                      <div className="p-10 bg-primary/[0.03] rounded-[45px] border border-primary/10 shadow-inner">
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-6 block px-2">Social Master Hashtags</span>
                        <div className="flex flex-wrap gap-2.5">
                          {(associatedPost.hashtags || []).map((tag, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white rounded-xl text-[11px] font-black text-primary border border-primary/10 shadow-sm">#{tag.replace('#', '')}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-12 opacity-30 py-24">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-dashed border-slate-300 flex items-center justify-center animate-spin-slow-reverse">
                          <Globe className="w-16 h-16 text-slate-300" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Zap className="w-8 h-8 text-primary animate-bounce shadow-glow shadow-primary/40" />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <h5 className="text-[14px] font-black uppercase tracking-[6px] text-slate-600">Awaiting GPT-4 Pulse...</h5>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                          Decoding Strategy Row DNA<br />Generating Professional Variations
                        </p>
                      </div>
                    </div>
                  )}
                </div>
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
      case 'brand': return renderBrandSetup();
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
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
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

<div className="fixed inset-0 z-[110] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center">
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
                className="relative transform overflow-hidden bg-background text-foreground shadow-2xl transition-all w-full h-screen flex"
                style={{
                  '--background': '45 26% 91%',
                  '--primary': '216 39% 48%',
                  '--accent': '216 46% 70%',
                  '--secondary': '0 0% 100%'
                }}
              >

                <AnimatePresence mode="wait">
                  {showSplash && (
                    <DashboardSplash
                      onComplete={() => setShowSplash(false)}
                    />
                  )}
                  {showOnboarding && !showSplash && renderOnboardingUI()}
                </AnimatePresence>

                {/* Dashboard Sidebar */}
                <div className={`${isSidebarCollapsed ? 'w-24' : 'w-[280px]'} hidden lg:flex bg-white dark:bg-[#080808] border-r border-slate-200 dark:border-white/5 flex-col p-8 shrink-0 transition-all duration-500 ease-in-out relative group/sidebar`}>

                  {/* Collapse Toggle */}
                  <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute -right-3 top-28 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border border-white dark:border-zinc-800 z-50 hover:scale-110 transition-all opacity-0 group-hover/sidebar:opacity-100"
                  >
                    {isSidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                  </button>

                  <div className={`relative flex items-center gap-3 mb-10 ${isSidebarCollapsed ? 'px-0 justify-center' : 'px-2'}`}>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5 shrink-0 overflow-hidden">
                      {(() => {
                        const isEditingActive = workspace?._id === currentEditingBrandId;
                        const rawUrl = activeProfile?.logoUrl || (isEditingActive ? (logoPreviewUrl || brandProfile?.logoUrl) : null) || workspace?.onboarding?.profileImageUrl || currentUser?.avatar;
                        const nameToUse = activeProfile?.companyName || (isEditingActive ? brandProfile?.companyName : null) || workspace?.workspaceName || currentUser?.name || 'B';

                        if (rawUrl) {
                          const finalUrl = (typeof rawUrl === 'string' && rawUrl.startsWith('http'))
                            ? `${API}/media/proxy?url=${encodeURIComponent(rawUrl)}`
                            : rawUrl;
                          return (
                            <img
                              src={finalUrl}
                              alt="Logo"
                              className="w-full h-full object-contain p-1"
                              onError={e => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent && !parent.querySelector('.fallback-avatar')) {
                                  const fallback = document.createElement('div');
                                  fallback.className = "fallback-avatar w-full h-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center text-xl font-black uppercase";
                                  fallback.textContent = (nameToUse || 'B').charAt(0);
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          );
                        }

                        return (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center text-xl font-black uppercase">
                            {nameToUse.charAt(0)}
                          </div>
                        );
                      })()}
                    </div>
                    {!isSidebarCollapsed && (
                      <Menu as="div" className="flex-1 min-w-0 relative">
                        <Menu.Button
                          className={`w-full flex items-center justify-between gap-2 p-2 rounded-xl group/profile hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-start`}
                        >
                          <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2">
                            <h1 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none truncate group-hover/profile:text-primary transition-colors">
                              {activeProfile?.companyName || (workspace?._id === currentEditingBrandId ? brandProfile?.companyName : '') || workspace?.workspaceName || currentUser?.name || 'My Profile'}
                            </h1>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{allWorkspaces.length} BRANDS</span>
                              <ChevronDown className="w-3 h-3 text-slate-400 group-hover/profile:text-primary transition-all" />
                            </div>
                          </div>
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
                          <Menu.Items className="absolute left-0 mt-2 w-[280px] origin-top-left bg-white dark:bg-zinc-900 rounded-[28px] shadow-2xl ring-1 ring-black/5 dark:ring-white/5 focus:outline-none z-[130] p-3 overflow-hidden border border-slate-100 dark:border-white/5 animate-in slide-in-from-top-2">
                             <div className="space-y-1">
                                <div className="max-h-64 overflow-y-auto custom-scrollbar px-1 py-1">
                                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-[2px] px-6 mb-2 mt-2">Switch Brand Intelligence</p>
                                  {allWorkspaces
                                    .filter(ws => ws.calendarEntryCount > 0 || ws._id === workspace?._id)
                                    .map(ws => (
                                    <Menu.Item key={ws._id}>
                                      {({ active }) => (
                                        <button
                                          onClick={() => switchWorkspace(ws)}
                                          className={`${active || workspace?._id === ws._id ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400'
                                            } w-full flex items-center justify-between gap-3 px-6 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all mb-1`}
                                        >
                                          <div className="flex items-center gap-3 truncate">
                                            <div className="w-7 h-7 rounded-xl bg-primary/20 flex items-center justify-center text-[10px] font-black shrink-0">
                                              {ws.workspaceName?.charAt(0) || 'B'}
                                            </div>
                                            <span className="truncate">{ws.workspaceName}</span>
                                          </div>
                                          {ws.calendarEntryCount > 0 && (
                                            <div className="px-1.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[8px] flex items-center gap-1 border border-emerald-500/10">
                                              <Layers className="w-2.5 h-2.5" />
                                              {ws.calendarEntryCount}
                                            </div>
                                          )}
                                        </button>
                                      )}
                                    </Menu.Item>
                                  ))}
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-white/5 my-2 mx-6" />
                                
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => setShowUserProfileModal(true)}
                                      className={`${active ? 'bg-indigo-500/5 text-indigo-500' : 'text-slate-600 dark:text-slate-400'
                                        } w-full flex items-center gap-3 px-6 h-12 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl`}
                                    >
                                      <User2 className="w-4 h-4 shadow-sm" />
                                      Profile Info
                                    </button>
                                  )}
                                </Menu.Item>
                              </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          if (!tab.comingSoon) {
                            setActiveTab(tab.id);
                          }
                        }}
                        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center py-5' : 'justify-between px-5 py-4'} rounded-2xl transition-all group ${activeTab === tab.id
                          ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                          } ${tab.comingSoon ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                        title={isSidebarCollapsed ? tab.name : ''}
                      >
                        <div className="flex items-center gap-4">
                          <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary' : 'group-hover:text-primary transition-colors'} shrink-0`} />
                          {!isSidebarCollapsed && <span className="text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-2">{tab.name}</span>}
                        </div>
                        {(!tab.comingSoon || !isSidebarCollapsed) && tab.comingSoon && <span className="text-[7px] font-black bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-500 uppercase">Soon</span>}
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                    <button className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} w-full px-5 py-4 rounded-2xl bg-indigo-600/5 text-indigo-600 border border-indigo-600/10 hover:bg-indigo-600/10 transition-all`}>
                      <HelpCircle className="w-5 h-5" />
                      {!isSidebarCollapsed && <span className="text-xs font-black uppercase tracking-widest">Documentation</span>}
                    </button>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-zinc-950 overflow-hidden">
                  {/* Header */}
                  <header className="h-24 bg-white/80 dark:bg-[#080808]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-10 flex items-center justify-between z-20 shrink-0">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                        {tabs.find(t => t.id === activeTab)?.name}
                      </h2>
                      <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-2" />
                      <div className="flex -space-x-2 ml-2">
                        {[
                          { Icon: Instagram, color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' },
                          { Icon: Linkedin, color: 'bg-blue-600' },
                          { Icon: Twitter, color: 'bg-black' },
                          { Icon: Facebook, color: 'bg-blue-500' }
                        ].map((item, idx) => (
                          <div key={idx} className={`w-8 h-8 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center text-white p-1.5 shadow-sm ${item.color} hover:scale-110 transition-transform cursor-pointer`}>
                            <item.Icon className="w-full h-full" />
                          </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-950 bg-primary/10 flex items-center justify-center text-[7px] font-black text-primary backdrop-blur-md">
                          +2
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-200 transition-all active:scale-95 shadow-sm">
                        <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </button>
                    </div>
                  </header>

                  {/* Scrollable Content */}
                  <main className="flex-1 overflow-y-auto p-12 custom-scrollbar relative mesh-bg" data-lenis-prevent>
                    {renderContent()}
                  </main>
                </div>

                {renderGenerationWizard()}
                {renderPostHistoryDrawer()}
                {renderOneOffAssetModal()}

                <AnimatePresence>
                  {showUserProfileModal && renderUserProfileModal()}
                </AnimatePresence>

                {showOnboardingGuide && renderOnboardingGuideModal()}

                {activeJob && (
                  <div className="fixed bottom-10 right-10 z-[120] w-80 bg-white dark:bg-zinc-900 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-2xl p-6 overflow-hidden animate-in slide-in-from-right-10 duration-500">
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

// --- Sub-Components for Performance ---

const DashboardSplash = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + 2;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, pointerEvents: 'none' }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="absolute inset-0 z-[110] bg-white dark:bg-[#080808] flex flex-col items-center justify-center p-12 pointer-events-none select-none"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-80 h-80 relative group mb-12 rounded-full overflow-hidden border-2 border-primary/20 bg-zinc-950/20 backdrop-blur-sm shadow-[0_0_80px_rgba(var(--primary-rgb),0.1)]"
      >
        <img
          src="/ai_ads_logo_circular.png"
          alt="AI Ads™ Circular Logo"
          className="w-full h-full object-cover animate-float"
        />
      </motion.div>

      <div className="w-full max-w-md space-y-4">
        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-indigo-500 to-primary bg-[length:200%_100%] shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-black text-primary uppercase tracking-[4px]">
          <span>PERSONALIZING YOUR AI ADS™ EXPERIENCE</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </motion.div>
  );
};



export default AiSocialMediaDashboard;
