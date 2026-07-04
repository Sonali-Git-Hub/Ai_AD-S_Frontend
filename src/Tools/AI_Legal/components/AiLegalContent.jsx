import React, { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { 
  Scale, X, MessageSquare, Search, 
  ChevronRight, Clock, CheckCircle, TrendingUp, FileSearch, 
  Bookmark, Share2, Download, Plus, History, Filter, Sparkles,
  Gavel, Landmark, ScrollText, FileScan, Swords, Target, FileCheck, Waypoints,
  Folder, Library, Fingerprint, Radar, Network, MessageCircle,
  FolderKanban, BookOpen, ScanText, BarChart3, ShieldCheck, Workflow, NotebookPen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transition, Dialog } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { legalService } from '../services/legalService';
import { apiService } from '../../../services/apiService';
import { setActiveModule as saveActiveModule, getActiveModule, MODULE_NAMES, setPrefillIntent, mapCaseToForm } from '../services/activeModuleService';
import CreateCaseModal from './CreateCaseModal';
import SavedToolsModal from './SavedToolsModal';
import LegalDashboard from './LegalDashboard';
import HearingManagement from './HearingManagement';
import ComplianceCenter from './ComplianceCenter';
import CaseContextModal from './CaseContextModal';
import { useLanguage } from '../../../context/LanguageContext';
import LanguageToggle from './shared/LanguageToggle';


const ArrowLeft = ({ size = 20, className = '' }) => (
  <ChevronRight size={size} className={`transform rotate-180 ${className}`} />
);

const AiLegalContent = ({
  isDark,
  setSelectedLegalTool,
  currentCase,
  setCurrentCase,
  allProjects,
  setAllProjects,
  setCurrentProjectId,
  setMessages,
  setLegalView,
  onBack
}) => {
  const navigate = useNavigate();
  const { toolkitLanguage, setToolkitLanguage, tLegal: t } = useLanguage();

  const [activeModule, setActiveModule] = useState(null); // 'CASE_MANAGEMENT', 'HEARING_MANAGEMENT', 'COMPLIANCE_CENTER'
  const [selectedTool, setSelectedTool] = useState(null);
  const [isCreateCaseVisible, setIsCreateCaseVisible] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [savedTools, setSavedTools] = useState([]);
  const [isSavedToolsVisible, setIsSavedToolsVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [caseRefreshKey, setCaseRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedChip, setSelectedChip] = useState('All');

  // ─── FAB + Onboarding State ─────────────────────────────────────────────────
  const [showFabOnboarding, setShowFabOnboarding] = useState(() => {
    try { return !localStorage.getItem('aiLegal.caseOnboardingCompleted'); } catch { return false; }
  });

  const dismissFabOnboarding = useCallback((openCreate = false) => {
    try { localStorage.setItem('aiLegal.caseOnboardingCompleted', 'true'); } catch {}
    setShowFabOnboarding(false);
    if (openCreate) setIsCreateCaseVisible(true);
  }, []);

  // ESC key closes FAB onboarding
  useEffect(() => {
    if (!showFabOnboarding) return;
    const onKey = (e) => { if (e.key === 'Escape') dismissFabOnboarding(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showFabOnboarding, dismissFabOnboarding]);

  // --- Case Management Local State (for LegalDashboard sub-view) ---
  const [isRenamingCase, setIsRenamingCase] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [editingCaseId, setEditingCaseId] = useState(null);
  const [editingCase, setEditingCase] = useState(null);
  const [newCaseForm, setNewCaseForm] = useState({ clientName: '', caseType: '', otherCaseType: '', accused: '', summary: '' });
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [localCases, setLocalCases] = useState([]);
  const [caseManagementFilter, setCaseManagementFilter] = useState('All');

  // --- Case Context Modal (Active Module Detection) ---
  const [caseContextModal, setCaseContextModal] = useState({
    isOpen: false,
    moduleId: null,
    moduleName: null,
    caseData: null,
  });

  // --- Case Management Handlers (for LegalDashboard sub-view) ---
  const handleOpenCase = useCallback((c) => {
    const caseId = c.id || c._id;
    if (setCurrentCase) setCurrentCase(c);
    if (setCurrentProjectId) setCurrentProjectId(caseId);
    if (setLegalView) setLegalView('CHAT');
    if (setSelectedLegalTool) setSelectedLegalTool({ id: 'legal_my_case', name: 'My Case Assistant' });
    navigate(`/dashboard/legal/cases/${caseId}/chat`, { replace: true });
  }, [setCurrentCase, setCurrentProjectId, setLegalView, setSelectedLegalTool, navigate]);

  const handleOpenEditModal = useCallback((c) => {
    const caseId = c.id || c._id;
    setEditingCase(c);
    setEditingCaseId(caseId);
    setIsNewCaseModalOpen(true);
  }, []);

  const handleDeleteCase = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this case? All data and history will be lost.')) {
      try {
        await legalService.deleteCase(id);
        showToast('Case deleted');
        setCaseRefreshKey(prev => prev + 1);
      } catch (err) {
        console.error('[AiLegalContent] Delete failed:', err);
        showToast('Delete failed');
      }
    }
  }, []);

  const handleRenameCase = useCallback(async (id) => {
    if (!renameValue.trim()) {
      setIsRenamingCase(null);
      return;
    }
    try {
      await legalService.updateCase(id, { title: renameValue });
      setIsRenamingCase(null);
      showToast('Case renamed');
      setCaseRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('[AiLegalContent] Rename failed:', err);
      showToast('Rename failed');
    }
  }, [renameValue]);

  // Fetch cases when entering CASE_MANAGEMENT module
  const loadLocalCases = useCallback(async () => {
    try {
      const cases = await legalService.getCases();
      setLocalCases(cases || []);
    } catch (e) {
      console.error('[AiLegalContent] Failed to fetch local cases:', e);
    }
  }, []);

  useEffect(() => {
    if (activeModule === 'CASE_MANAGEMENT') {
      loadLocalCases();
    }
  }, [activeModule, caseRefreshKey, loadLocalCases]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const legalSubTools = useMemo(() => [
    {
      id: 'legal_my_case',
      icon: <FolderKanban size={26} strokeWidth={1.8} />,
      iconBg: '#EEF2FF',
      iconColor: '#5B5FEF',
      title: t('myCase') || 'My Case',
      desc: t('myCaseDesc') || 'Personal Legal CRM & Case Intelligence System',
      prompt: 'Show me my case intelligence for: ',
      features: ["Create case", "Upload files", "Hearing timeline", "Case notes", "AI summary", "Legal reminders", "Advocate details", "Evidence manager"],
      badge: 'LIVE AI',
      confidence: 99,
      quality: 'High',
      supportedTypes: ['PDF', 'DOCX', 'JPG', 'PNG'],
      estTime: 'Instant',
      useCases: ['Case tracking', 'Document organization', 'Timeline management'],
      sampleOutput: 'Summary: Case No. 452/2024 - Property Dispute. Next hearing: June 12.'
    },
    {
      id: 'legal_research_assistant',
      icon: <Landmark size={26} strokeWidth={1.8} />,
      iconBg: '#EEF2FF',
      iconColor: '#5B5FEF',
      title: t('legalPrecedent') || 'Legal Precedent',
      desc: t('legalPrecedentDesc') || 'Searchable Case Laws, Judgments & Citation Intelligence',
      prompt: 'Find legal precedents for: ',
      features: ["Searchable case laws", "Court filtering", "Citation generator", "AI legal interpretation", "Related judgments", "Bookmark system"],
      badge: 'VERIFIED',
      confidence: 98,
      quality: 'High',
      supportedTypes: ['Citations', 'Keywords'],
      estTime: '15-30s',
      useCases: ['Court preparation', 'Case research', 'Citation building'],
      sampleOutput: 'Judgment: Kesavananda Bharati v. State of Kerala (1973) - Basic Structure Doctrine.'
    },
    {
      id: 'legal_draft_maker',
      icon: <NotebookPen size={26} strokeWidth={1.8} />,
      iconBg: '#EEF2FF',
      iconColor: '#5B5FEF',
      title: t('draftMaker') || 'Draft Maker',
      desc: t('draftMakerDesc') || 'Notice, Affidavit, FIR & Legal Agreements Architect',
      prompt: 'I need to draft a legal document for: ',
      features: ["FIR", "Affidavit", "Legal Notice", "Agreement", "NDA", "Employment Contract", "Rent Agreement", "Export PDF", "AI Rewrite"],
      badge: 'PRO',
      confidence: 97,
      quality: 'Enterprise',
      supportedTypes: ['PDF', 'DOCX'],
      estTime: '30-60s',
      useCases: ['Quick drafting', 'Document revision', 'Legal tone adjustment'],
      sampleOutput: 'Drafted: Non-Disclosure Agreement for Tech Partnership...'
    },
    {
      id: 'legal_evidence_checker',
      icon: <ScanText size={26} strokeWidth={1.8} />,
      iconBg: '#EEF2FF',
      iconColor: '#5B5FEF',
      title: t('evidenceAnalysis') || 'Evidence Analysis',
      desc: t('evidenceAnalysisDesc') || 'OCR Scanning, Evidence Verification & Authenticity Scoring',
      prompt: 'Analyze this evidence for admissibility and risk: ',
      features: ["OCR scanning", "Image evidence review", "PDF analysis", "AI inconsistency detection", "Timeline extraction", "Authenticity scoring"],
      badge: 'MOST USED',
      confidence: 95,
      quality: 'High',
      supportedTypes: ['PDF', 'Image', 'Video'],
      estTime: '1m',
      useCases: ['Evidence validation', 'Discrepancy detection', 'Strength analysis'],
      sampleOutput: 'Inconsistency detected: Timestamp on Image A does not match Log B.'
    },
    {
      id: 'legal_argument_builder',
      icon: <Gavel size={26} strokeWidth={1.8} />,
      iconBg: '#EEF2FF',
      iconColor: '#5B5FEF',
      title: t('argumentBuilder') || 'Argument Builder',
      desc: t('argumentBuilderDesc') || 'Structure Courtroom-Ready Arguments & Cross-Examinations',
      prompt: 'Help me build a courtroom argument for: ',
      features: ["Courtroom arguments", "Opposition counterpoints", "Judge-perspective analysis", "Persuasive drafting", "Legal strategy suggestions"],
      badge: 'NEW',
      confidence: 94,
      quality: 'Professional',
      supportedTypes: ['Case Brief', 'Facts'],
      estTime: '2m',
      useCases: ['Trial preparation', 'Opposition analysis', 'Strategy formulation'],
      sampleOutput: 'Counterpoint: The precedent cited by opposition is non-binding in this jurisdiction.'
    },
    {
      id: 'legal_case_predictor',
      icon: <Target size={26} strokeWidth={1.8} />,
      iconBg: '#EEF2FF',
      iconColor: '#5B5FEF',
      title: t('casePredictor') || 'Case Predictor',
      desc: t('casePredictorDesc') || 'Outcome Probability & Case Strength Analysis',
      prompt: 'Predict the outcome for this legal case: ',
      features: ["Success probability", "AI risk analysis", "Outcome simulation", "Estimated legal strength", "Timeline prediction"],
      badge: 'BETA',
      confidence: 92,
      quality: 'High',
      supportedTypes: ['PDF', 'Text'],
      estTime: '2m',
      useCases: ['Risk assessment', 'Client expectation management', 'Settlement evaluation'],
      sampleOutput: 'Outcome Simulation: 78% Probability of favorable ruling based on recent 12 judgments.'
    },
    {
      id: 'legal_contract_analyzer',
      icon: <FileCheck size={26} strokeWidth={1.8} />,
      iconBg: '#EEF2FF',
      iconColor: '#5B5FEF',
      title: t('contractReview') || 'Contract Review',
      desc: t('contractReviewDesc') || 'Clause Detection, Compliance Review & Risk Alerts',
      prompt: 'Please analyze this contract for: ',
      features: ["Clause detection", "Risky term alerts", "AI recommendations", "Contract simplification", "Missing clause detection"],
      badge: 'RECOMMENDED',
      confidence: 98,
      quality: 'Enterprise',
      supportedTypes: ['PDF', 'DOCX'],
      estTime: '45s',
      useCases: ['Contract auditing', 'Risk mitigation', 'Simplification'],
      sampleOutput: 'Alert: Indemnity clause on Page 4 is unusually broad. Missing: Dispute Resolution clause.'
    },
    {
      id: 'legal_strategy_engine',
      icon: <Waypoints size={26} strokeWidth={1.8} />,
      iconBg: '#EEF2FF',
      iconColor: '#5B5FEF',
      title: t('strategyEngine') || 'Strategy Engine',
      desc: t('strategyEngineDesc') || 'Litigation Strategy, Tactical Planning & Case Journey Intelligence',
      prompt: 'Develop a legal strategy for: ',
      features: ["Litigation roadmap", "Tactical suggestions", "Hearing preparation", "Legal action sequencing"],
      badge: 'AI ACTIVE',
      confidence: 96,
      quality: 'Expert',
      supportedTypes: ['Text', 'Case Brief'],
      estTime: '3m',
      useCases: ['Case planning', 'Tactical maneuvering', 'Step-by-step guidance'],
      sampleOutput: 'Roadmap: Step 1 - Filing Interlocutory Application. Step 2 - Notice to Respondent.'
    }
  ], [t]);


  const loadSavedTools = useCallback(async () => {
    try {
      const saved = localStorage.getItem('aisa_legal_saved_tools');
      if (saved) {
        setSavedTools(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved tools:', error);
    }
  }, []);

  const toggleSavedTool = async (tool) => {
    try {
      const isSaved = savedTools.some(t => t.toolId === tool.id);
      let updatedSavedTools = [];
      if (isSaved) {
        updatedSavedTools = savedTools.filter(t => t.toolId !== tool.id);
        showToast('Removed from saved');
      } else {
        updatedSavedTools = [...savedTools, {
          toolId: tool.id,
          title: tool.title,
          timestamp: new Date().toISOString(),
          category: 'AI Legal'
        }];
        showToast('Saved');
      }
      setSavedTools(updatedSavedTools);
      localStorage.setItem('aisa_legal_saved_tools', JSON.stringify(updatedSavedTools));
    } catch (error) {
      console.error('Error toggling saved tool:', error);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const purgeLegacyMockData = async () => {
    const migrationKey = 'aisa_legal_mock_purge_v1';
    try {
      const done = localStorage.getItem(migrationKey);
      if (done) return;

      const rawCases = localStorage.getItem('aisa_legal_cases');
      if (rawCases) {
        const cases = JSON.parse(rawCases);
        const hasMock = cases.some(c => c.id === '1' || c.id === '2');
        if (hasMock) {
          localStorage.removeItem('aisa_legal_cases');
          localStorage.removeItem('aisa_legal_hearings');
          localStorage.removeItem('aisa_legal_compliance');
          localStorage.removeItem('aisa_legal_activity');
        }
      }
      localStorage.setItem(migrationKey, 'true');
    } catch (e) {
      console.warn('[AiLegalContent] Migration warning:', e);
    }
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      await purgeLegacyMockData();
      const [dashboardStats, activity] = await Promise.all([
        legalService.getDashboardStats(),
        legalService.getRecentActivity()
      ]);
      setStats(dashboardStats);
      setRecentActivity(activity || []);
    } catch (e) {
      console.error('[AiLegalContent] Error loading dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateCase = async (caseData) => {
    try {
      if (editingCaseId) {
        console.log("Updating Case ID:", editingCaseId);
        await legalService.updateCase(editingCaseId, caseData);
        console.log("Case Updated Successfully");
        
        if (currentCase?.id === editingCaseId || currentCase?._id === editingCaseId) {
          const refreshed = await apiService.getProject(editingCaseId);
          if (refreshed && setCurrentCase) {
            setCurrentCase(refreshed);
          }
        }
        
        await loadDashboardData();
        setCaseRefreshKey(prev => prev + 1);
        setIsNewCaseModalOpen(false);
        setIsCreateCaseVisible(false);
        setEditingCaseId(null);
        setEditingCase(null);
        showToast('Case updated successfully');
      } else {
        const created = await legalService.createCase(caseData);
        const createdId = created?._id || created?.id;
        if (createdId) {
          if (setCurrentCase) setCurrentCase(created);
          if (setCurrentProjectId) setCurrentProjectId(createdId);
        }
        await loadDashboardData();
        setCaseRefreshKey(prev => prev + 1);
        setIsCreateCaseVisible(false);
        setIsNewCaseModalOpen(false);
        showToast('Case created successfully');
      }
    } catch (e) {
      console.error('[AiLegalContent] handleCreateCase/Update failed:', e);
      showToast('Action failed');
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadSavedTools();
    try {
      const caseId = currentCase?._id || currentCase?.id || 'general';
      localStorage.removeItem(`aisa_active_legal_chat_session_id_${caseId}`);
    } catch (e) {
      console.error(e);
    }
  }, [loadDashboardData, loadSavedTools, currentCase]);

  const handleToolPress = (tool) => {
    setSelectedTool(tool);
    launchModule(tool);
  };

  const launchModule = async (tool) => {
    try {
      await legalService.addActivity(tool.title, 'tool');
      const updated = await legalService.getRecentActivity();
      setRecentActivity(updated || []);
    } catch (e) {
      console.warn('[AiLegalContent] Failed to add activity log:', e);
    }

    if (tool.id === 'legal_my_case') {
      console.log("Loading AISA-Mobile Active Cases Module");
      setCaseManagementFilter('All');
      setActiveModule('CASE_MANAGEMENT');
    } else {
      // Set the selected tool and transition from DASHBOARD to CHAT view
      setSelectedLegalTool({ id: tool.id, name: tool.title });
      if (setLegalView) setLegalView('CHAT');
      if (setMessages) setMessages([]); // Fresh chat — matches AISA-Mobile behavior
      const toolRoutes = {
        'legal_draft_maker': '/dashboard/legal/draft',
        'legal_argument_builder': '/dashboard/legal/arguments',
        'legal_research_assistant': '/dashboard/legal/precedents',
        'legal_evidence_checker': '/dashboard/legal/evidence',
        'legal_contract_analyzer': '/dashboard/legal/contracts',
        'legal_case_predictor': '/dashboard/legal/predictor',
        'legal_strategy_engine': '/dashboard/legal/strategy',
        'legal_compliance_checker': '/dashboard/legal/compliance',
        'legal_hearings': '/dashboard/legal/hearings',
        'legal_general_chat': '/dashboard/legal/chat'
      };
      const targetRoute = toolRoutes[tool.id] || '/dashboard/legal';
      if (tool.id === 'legal_general_chat') {
        navigate(targetRoute, { state: { newChat: true } });
      } else {
        navigate(targetRoute);
      }
    }
  };

  const filteredTools = useMemo(() => {
    const toolOrder = [
      'legal_my_case',
      'legal_draft_maker',
      'legal_argument_builder',
      'legal_research_assistant',
      'legal_evidence_checker',
      'legal_contract_analyzer',
      'legal_case_predictor',
      'legal_strategy_engine'
    ];

    const filtered = legalSubTools.filter(tool => {
      // Search query filter
      let matchesSearch = true;
      if (debouncedQuery.trim() !== '') {
        const q = debouncedQuery.toLowerCase();
        const searchableText = [
          tool.title,
          tool.desc,
          ...(tool.features || []),
          ...(tool.useCases || [])
        ].join(' ').toLowerCase();
        matchesSearch = searchableText.includes(q);
      }

      if (!matchesSearch) return false;

      // Chip filter
      if (selectedChip === 'All') return true;
      if (selectedChip === 'Drafting') return tool.id === 'legal_draft_maker' || tool.id === 'legal_argument_builder';
      if (selectedChip === 'Research') return tool.id === 'legal_research_assistant' || tool.id === 'legal_contract_analyzer';
      if (selectedChip === 'Evidence') return tool.id === 'legal_evidence_checker';
      if (selectedChip === 'Arguments') return tool.id === 'legal_argument_builder';
      if (selectedChip === 'Cases') return tool.id === 'legal_my_case' || tool.id === 'legal_case_predictor';
      if (selectedChip === 'Contracts') return tool.id === 'legal_contract_analyzer';

      return true;
    });

    return [...filtered].sort((a, b) => {
      const idxA = toolOrder.indexOf(a.id);
      const idxB = toolOrder.indexOf(b.id);
      return idxA - idxB;
    });
  }, [debouncedQuery, legalSubTools, selectedChip]);

  const showHeroCard = useMemo(() => {
    if (!debouncedQuery.trim()) return true;
    const q = debouncedQuery.toLowerCase();
    return 'general legal chat'.includes(q) || 'advice situational Q&A'.includes(q);
  }, [debouncedQuery]);

  // --- Sub views ---
  if (activeModule === 'CASE_MANAGEMENT') {
    return (
      <div className="flex-1 flex flex-col w-full h-full min-h-0 bg-transparent overflow-hidden relative">
        <LegalDashboard 
          legalCases={localCases}
          currentProjectId={currentCase?.id || currentCase?._id || null}
          handleOpenCase={handleOpenCase}
          handleOpenEditModal={handleOpenEditModal}
          handleDeleteCase={handleDeleteCase}
          isRenamingCase={isRenamingCase}
          renameValue={renameValue}
          setRenameValue={setRenameValue}
          handleRenameCase={handleRenameCase}
          setIsRenamingCase={setIsRenamingCase}
          setIsNewCaseModalOpen={setIsNewCaseModalOpen}
          setEditingCaseId={setEditingCaseId}
          setNewCaseForm={setNewCaseForm}
          setActiveLegalToolkit={() => {}}
          onBack={() => {
            setActiveModule(null);
            loadDashboardData();
          }}
          onAskStrategy={(caseData) => {
            if (setCurrentCase) setCurrentCase(caseData);
            if (setCurrentProjectId) setCurrentProjectId(caseData.id || caseData._id);
            setSelectedLegalTool({ id: 'legal_strategy_engine', name: 'Strategy Engine' });
            if (setLegalView) setLegalView('CHAT');
            if (setMessages) setMessages([]);
            navigate('/dashboard/chat/new', { replace: true, state: { fromTool: true } });
          }}
          onViewRoadmap={(caseData) => {
            if (setCurrentCase) setCurrentCase(caseData);
            if (setCurrentProjectId) setCurrentProjectId(caseData.id || caseData._id);
            setSelectedLegalTool({ id: 'legal_strategy_engine', name: 'Strategy Engine' });
            if (setLegalView) setLegalView('CHAT');
            if (setMessages) setMessages([]);
            navigate('/dashboard/chat/new', { replace: true, state: { fromTool: true } });
          }}
          onLaunchModuleWithCase={async (moduleId, caseItem) => {
            const names = {
              'legal_argument_builder': 'Argument Builder',
              'legal_precedents': 'Legal Precedent',
              'legal_draft_maker': 'Draft Maker',
              'legal_evidence_checker': 'Evidence Analysis',
              'legal_case_predictor': 'Case Predictor',
              'legal_contract_analyzer': 'Contract Review',
              'legal_strategy_engine': 'Strategy Engine'
            };
            const moduleName = names[moduleId] || moduleId;

            // Persist active module to localStorage + database
            try {
              await saveActiveModule(
                caseItem?.id || caseItem?._id,
                caseItem?.title || caseItem?.name,
                moduleId,
                moduleName,
                'case'
              );
            } catch (e) {
              console.warn('[AiLegalContent] setActiveModule failed:', e);
            }

            // Set current case immediately
            if (setCurrentCase) setCurrentCase(caseItem);
            if (setCurrentProjectId) setCurrentProjectId(caseItem?.id || caseItem?._id);

            // Show Case Context Modal before routing
            setCaseContextModal({
              isOpen: true,
              moduleId,
              moduleName,
              caseData: caseItem,
            });
          }}
          initialFilter={caseManagementFilter}
        />
        <CreateCaseModal 
          isDark={isDark}
          isVisible={isCreateCaseVisible || isNewCaseModalOpen}
          onClose={() => {
            setIsCreateCaseVisible(false);
            setIsNewCaseModalOpen(false);
            setEditingCase(null);
            setEditingCaseId(null);
          }}
          onSave={handleCreateCase}
          editingCase={editingCase}
        />

        {/* ── CASE CONTEXT MODAL ─────────────────────────────────── */}
        <CaseContextModal
          isOpen={caseContextModal.isOpen}
          onClose={() => setCaseContextModal(prev => ({ ...prev, isOpen: false }))}
          caseData={caseContextModal.caseData}
          moduleId={caseContextModal.moduleId}
          moduleName={caseContextModal.moduleName}
          onUseCase={(cd) => {
            setCaseContextModal(prev => ({ ...prev, isOpen: false }));
            // ── Store prefill intent — each module reads this on mount ──
            setPrefillIntent(cd, caseContextModal.moduleId);
            // Route to module WITH active case data
            setSelectedLegalTool({ id: caseContextModal.moduleId, name: caseContextModal.moduleName });
            if (setLegalView) setLegalView('CHAT');
            if (setMessages) setMessages([]);
            navigate('/dashboard/chat/new', { replace: true, state: { fromTool: true, activeCase: true } });
          }}
          onManualMode={() => {
            setCaseContextModal(prev => ({ ...prev, isOpen: false }));
            // Clear any existing prefill — start fresh
            try { localStorage.removeItem('@aisa_case_prefill_intent'); } catch {}
            // Route to module WITHOUT case — clear current case context
            setSelectedLegalTool({ id: caseContextModal.moduleId, name: caseContextModal.moduleName });
            if (setMessages) setMessages([]);
            if (setLegalView) setLegalView('CHAT');
            navigate('/dashboard/chat/new', { replace: true, state: { fromTool: true, manualMode: true } });
          }}
        />
      </div>

    );
  }

  if (activeModule === 'HEARING_MANAGEMENT') {
    return (
      <HearingManagement 
        isDark={isDark}
        onBack={() => {
          setActiveModule(null);
          loadDashboardData();
        }}
      />
    );
  }

  if (activeModule === 'COMPLIANCE_CENTER') {
    return (
      <ComplianceCenter 
        isDark={isDark}
        onBack={() => {
          setActiveModule(null);
          loadDashboardData();
        }}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar bg-transparent aisa-scalable-text">
      {/* Main Header */}
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-12 pt-5 sm:pt-6 pb-4 sm:pb-5 flex items-center justify-between shrink-0 border-b border-slate-200/60 dark:border-white/5 bg-white/70 dark:bg-[#0B1020]/70 backdrop-blur-xl z-10 sticky top-0">
        <div className="flex items-center gap-3.5">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ArrowLeft className="text-slate-600 dark:text-slate-400" />
          </button>
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.30)'
            }}
          >
            <Scale size={20} strokeWidth={1.8} className="text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">AI Legal™</h1>
            <p className="text-[10px] sm:text-[11px] text-[#8B95A7] font-semibold uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              {t('legalPoweredSubtitle') || 'AI-POWERED LEGAL INTELLIGENCE PLATFORM'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-12 py-5 sm:py-6 space-y-5 sm:space-y-6">


        {/* Hero Card - General Legal Chat */}
        {showHeroCard && (
          <button
            onClick={() => {
              handleToolPress({
                id: 'legal_general_chat',
                title: t('generalLegalChat') || 'General Legal Chat',
                desc: t('generalLegalChatDesc') || 'Professional legal discourse, situational guidance, and citation Q&A.',
                icon: <MessageSquare size={24} />,
                badge: 'LIVE AI',
                confidence: 99,
                quality: 'Elite',
                supportedTypes: ['Voice', 'Text', 'Files'],
                estTime: 'Instant',
                useCases: ['Legal advice', 'Question answering', 'Citation search'],
                sampleOutput: 'According to Section 420 of IPC, the punishment for cheating is...'
              });
            }}
            className="w-full relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 overflow-hidden text-left bg-gradient-to-br from-indigo-600 via-[#5f5ce6] to-[#7c3aed] text-white shadow-2xl shadow-indigo-500/35 hover:scale-[1.005] transition-all group active:scale-[0.99]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-[2.5s] ease-in-out" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
                <div
                  className="w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-[16px] sm:rounded-[18px] flex items-center justify-center shrink-0 transition-all duration-300 ease-out group-hover:-translate-y-1 mt-0.5 sm:mt-0"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.30)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
                  }}
                >
                  <MessageCircle size={26} strokeWidth={1.8} className="text-white" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="hidden sm:flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-semibold uppercase tracking-widest shrink-0">Enterprise Elite</span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 shrink-0"><CheckCircle size={10} className="fill-current text-white" /> SECURE</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:block text-left">
                    <h3 className="text-lg sm:text-[24px] font-bold tracking-tight leading-tight truncate sm:whitespace-normal">{t('generalLegalChat') || 'General Legal Chat'}</h3>
                    <div className="sm:hidden shrink-0">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-indigo-700 font-semibold text-[11px] uppercase tracking-widest rounded-lg shadow-md shrink-0">
                        {t('start') || 'START'}
                        <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-[13px] text-indigo-100 font-medium leading-normal sm:leading-relaxed max-w-md text-left">
                    {t('generalLegalChatDesc') || 'Professional legal discourse, situational guidance, and citation Q&A.'}
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex w-full sm:w-auto shrink-0 justify-end">
                <span className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-indigo-700 font-semibold text-[13px] uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-lg shadow-black/10 shrink-0 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  {t('start') || 'START'}
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </button>
        )}

        {/* Grid Tools Section */}
        <div className="space-y-6">
          {filteredTools.length === 0 && !showHeroCard ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
              <Search size={32} className="opacity-30 mb-3" />
              <span className="text-xs font-bold">No templates match "{searchQuery}"</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredTools.map(tool => {
                const isSaved = savedTools.some(t => t.toolId === tool.id);
                return (
                  <div 
                    key={tool.id}
                    className="group relative bg-white dark:bg-zinc-900 border border-[#ECECEC] dark:border-zinc-850 rounded-[18px] p-4 sm:p-5 flex flex-col justify-between h-auto sm:h-[208px] cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:border-violet-500 dark:hover:border-violet-500 hover:shadow-[0_8px_24px_rgba(124,58,237,0.08)] transition-all duration-300 ease-out select-none"
                    onClick={() => handleToolPress(tool)}
                    onMouseEnter={() => {
                      if (typeof window.__preloadLegalModules === 'function') {
                        window.__preloadLegalModules();
                      }
                    }}
                  >
                    {/* Desktop Layout Wrapper */}
                    <div className="hidden sm:block">
                      {/* Premium Icon Container */}
                      <div
                        className="w-[56px] h-[56px] rounded-[18px] flex items-center justify-center mb-4 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_8px_24px_rgba(99,102,241,0.22)] shrink-0"
                        style={{
                          backgroundColor: '#F5F4FF',
                          color: '#5B5FEF',
                          border: '1px solid rgba(99,102,241,0.12)',
                          boxShadow: '0 4px 14px rgba(99,102,241,0.10)'
                        }}
                      >
                        {tool.icon}
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <h4 className="font-bold text-[17px] text-slate-900 dark:text-white leading-[1.25] transition-colors">
                          {tool.title}
                        </h4>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-normal leading-[1.55] line-clamp-2">
                          {tool.desc}
                        </p>
                      </div>
                    </div>

                    {/* Desktop Action: Open → */}
                    <div className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold text-violet-600 dark:text-violet-400 mt-2">
                      <span>Open</span>
                      <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </div>

                    {/* Mobile Compact Layout Wrapper (< sm) */}
                    <div className="block sm:hidden flex items-start justify-between gap-3 w-full pr-4">
                      {/* Left Column */}
                      <div className="flex-1 min-w-0 flex items-start gap-3">
                        <div
                          className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 transition-all duration-300"
                          style={{
                            backgroundColor: '#F5F4FF',
                            color: '#5B5FEF',
                            border: '1px solid rgba(99,102,241,0.12)',
                            boxShadow: '0 2px 8px rgba(99,102,241,0.10)'
                          }}
                        >
                          {tool.icon}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="font-bold text-base text-slate-900 dark:text-white leading-tight truncate">
                            {tool.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-normal line-clamp-2">
                            {tool.desc}
                          </p>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 shrink-0 pt-1 self-start">
                        <span>Open</span>
                        <span>→</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>


      {/* Saved Tools Modal */}
      <SavedToolsModal 
        isDark={isDark}
        isVisible={isSavedToolsVisible}
        onClose={() => setIsSavedToolsVisible(false)}
        savedTools={savedTools}
        onRemoveTool={(toolId) => toggleSavedTool({ id: toolId })}
        onLaunchTool={(toolId) => {
          const tool = legalSubTools.find(t => t.id === toolId);
          if (tool) handleToolPress(tool);
        }}
      />

      {/* Shared Tool Preview Modal */}
      <Transition.Root show={showPreview} as={Fragment}>
        <Dialog as="div" className="relative z-[120000]" onClose={() => setShowPreview(false)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-900 p-6 sm:p-8 text-left align-middle shadow-2xl transition-all border border-slate-200 dark:border-zinc-800 relative">
                <button 
                  onClick={() => setShowPreview(false)} 
                  className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors z-10"
                >
                  <X size={20} className="text-slate-500 dark:text-slate-400" />
                </button>

                <div className="flex items-center gap-3.5 mb-5 mt-2">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                    {selectedTool?.icon}
                  </div>
                  <div>
                    <Dialog.Title as="h3" className="text-md font-black text-slate-900 dark:text-white leading-tight">
                      {selectedTool?.title}
                    </Dialog.Title>
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mt-1 inline-block">
                      {selectedTool?.quality || 'Expert'} Grade AI
                    </span>
                  </div>
                </div>

                <p className="text-xs text-subtext leading-relaxed font-semibold mb-6">
                  {selectedTool?.desc}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6 border-y border-slate-100 dark:border-zinc-800 py-4">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 block mb-1">EST. TIME</span>
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-white">
                      <Clock size={14} className="text-indigo-650 dark:text-indigo-400" />
                      <span>{selectedTool?.estTime}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 block mb-1">SUPPORTED</span>
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-white">
                      <FileSearch size={14} className="text-indigo-650 dark:text-indigo-400" />
                      <span className="truncate">{selectedTool?.supportedTypes?.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <span className="text-[8px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 block">BEST FOR</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTool?.useCases?.map((uc, i) => (
                      <span key={i} className="bg-indigo-600/5 dark:bg-indigo-600/15 text-indigo-650 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase px-2.5 py-1 border border-indigo-100/50 dark:border-indigo-950/20">
                        {uc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sample output */}
                <div className="p-4 bg-slate-50 dark:bg-black/25 rounded-2xl mb-6">
                  <div className="flex items-center gap-1.5 mb-2 text-indigo-650 dark:text-indigo-400">
                    <Sparkles size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">AI SAMPLE OUTPUT</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic line-clamp-2">
                    "{selectedTool?.sampleOutput}"
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setShowPreview(false);
                    handleToolPress(selectedTool);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20"
                >
                  <span>Launch Enterprise Engine</span>
                  <ChevronRight size={18} />
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>


      {/* Create Case Modal */}
      <CreateCaseModal 
        isDark={isDark}
        isVisible={isCreateCaseVisible}
        onClose={() => {
          setIsCreateCaseVisible(false);
          setEditingCase(null);
          setEditingCaseId(null);
        }}
        onSave={handleCreateCase}
        editingCase={editingCase}
      />

      {/* Save Toast popup */}
      {toastMsg && (
        <div className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider z-[120000] pointer-events-none shadow-xl border border-white/10 max-w-[90vw] text-center">
          {toastMsg}
        </div>
      )}

      {/* ─── FLOATING ACTION BUTTON (FAB) ──────────────────────────────── */}
      <div
        className="fixed bottom-6 right-6 z-[9999]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <button
          id="legal-fab-create-case"
          type="button"
          title="Create New Case"
          aria-label="Create New Case"
          onClick={() => {
            if (showFabOnboarding) dismissFabOnboarding(true);
            else setIsCreateCaseVisible(true);
          }}
          className="relative w-14 h-14 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-2xl shadow-indigo-500/40 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 group"
        >
          {/* Pulse rings during onboarding */}
          {showFabOnboarding && (
            <>
              <span className="absolute inset-0 rounded-full bg-[#4F46E5] opacity-20 animate-ping" style={{ animationDuration: '1.4s' }} />
              <span className="absolute inset-0 rounded-full bg-[#4F46E5] opacity-10 animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }} />
            </>
          )}
          <Plus size={22} className="relative z-10 transition-transform duration-200 group-hover:rotate-90" />
          {/* Hover tooltip */}
          <span className="absolute right-full mr-3 whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none select-none shadow-xl">
            Create New Case
          </span>
        </button>
      </div>

      {/* ─── FIRST-TIME ONBOARDING COACH MARK ────────────────────────────── */}
      <AnimatePresence>
        {showFabOnboarding && (
          <>
            {/* Dimmed backdrop */}
            <motion.div
              key="fab-onboarding-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-[2px]"
              onClick={() => dismissFabOnboarding(false)}
              aria-hidden="true"
            />

            {/* Tooltip card above the FAB */}
            <motion.div
              key="fab-onboarding-card"
              role="dialog"
              aria-modal="true"
              aria-label="Create Your First Case"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-[92px] right-6 z-[10000] w-[300px] sm:w-[340px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-5 flex flex-col gap-4"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#4F46E5] flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/30">
                    <Scale size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5]">AI Legal</p>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">Create Your First Case</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dismissFabOnboarding(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer shrink-0 mt-0.5"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Welcome to AI Legal. Start by creating a case.
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Click the <strong className="text-[#4F46E5]">+</strong> button to add your first legal matter, upload documents, and unlock AI-powered tools like:
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
                  {['Contract Review', 'Evidence Analysis', 'Case Prediction', 'Strategy Engine'].map(tool => (
                    <div key={tool} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] shrink-0" />
                      {tool}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => dismissFabOnboarding(true)}
                  className="flex-1 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 active:scale-95"
                >
                  Create Case
                </button>
                <button
                  type="button"
                  onClick={() => dismissFabOnboarding(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-slate-200 active:scale-95"
                >
                  Got it
                </button>
              </div>

              {/* Arrow pointing to FAB */}
              <div
                className="absolute -bottom-2.5 right-8 w-5 h-5 bg-white rotate-45 border-r border-b border-slate-200/80"
                aria-hidden="true"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AiLegalContent;
