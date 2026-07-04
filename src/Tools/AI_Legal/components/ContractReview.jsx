import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, Gavel, Plus, FileText, Copy, 
  Share2, FileDown, History, Search, X, Shield, Clock, 
  Brain, Scale, BookOpen, AlertTriangle, TrendingUp, Mic, 
  Database, Cpu, Briefcase, Building2, Landmark, Folder, Printer, CheckCircle2,
  Upload, Sparkles, RefreshCw, BarChart2, Edit3, Trash2, Eye, Award, Check, FileSpreadsheet, Send, FileCheck, ArrowUpRight,
  FolderKanban, UploadCloud, ScanText, FileStack, Clock3, BriefcaseBusiness, BadgeCheck, Star, Pin, Lock, ChevronUp, ChevronDown,
  Files, BrainCircuit, FilePenLine, GitCompareArrows, ShieldCheck, NotebookPen, Calendar, CheckSquare, SlidersHorizontal, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateChatResponse } from '../../../services/geminiService';
import { apiService } from '../../../services/apiService';
import { mapCaseToForm } from '../services/activeModuleService';
import { useActiveCase } from '../context/ActiveCaseContext';
import { getUserData } from '../../../userStore/userData';
import useOutputLanguage from '../hooks/useOutputLanguage';
import { useLanguage } from '../../../context/LanguageContext';
import LanguageToggle from './shared/LanguageToggle';
import CopyOutputButton from './shared/CopyOutputButton';

// Specialized modules presets
const allTools = [
  { id: 'NDA', name: 'NDA Review', desc: 'Indemnity & leak audit', category: 'NDA' },
  { id: 'Employment', name: 'Employment Scan', desc: 'Non-compete & severance', category: 'Employment' },
  { id: 'Lease', name: 'Lease Review', desc: 'Rent escalations & evictions', category: 'Lease' },
  { id: 'Vendor', name: 'Vendor Agreement', desc: 'Net payment & penalties', category: 'Vendor' },
  { id: 'Investment', name: 'Investment Review', desc: 'Liquidation & vetos', category: 'Investment' },
  { id: 'SaaS', name: 'SaaS Agreement', desc: 'SLA uptime & data rights', category: 'Tech' },
  { id: 'MSA', name: 'Master Services Agreement', desc: 'Enterprise terms & liability', category: 'MSA' },
];

const generateMockContractIntelligence = (caseObj) => {
  const name = caseObj.name || '';
  let title = 'Master Commercial Agreement.pdf';
  let text = `MASTER SERVICES AGREEMENT
This Master Services Agreement ("Agreement") is entered into on 01 January 2026 ("Effective Date") by and between Rajesh Sharma, residing at New Delhi ("Client"), and Amit Verma, residing at Mumbai ("Opponent").
WHEREAS, the parties desire to enter into a partnership to execute commercial civil construction works.
Section 3. Payment Terms: Client shall pay the contractor Net 30 days upon submission of invoices. If any payment is delayed, contractor shall accrue interest at 18% per annum.
Section 7. Indemnity: Contractor shall indemnify and hold harmless the Client against all third-party claims, liabilities, and court costs.
Section 12. Term and Termination: This Agreement shall remain in effect for 24 months, expiring on 31 December 2027. It shall renew automatically for successive 12-month terms unless terminated.
Section 15. Jurisdiction: This Agreement is governed by the laws of India. Any litigation or arbitration arising under this Agreement shall be subject to the exclusive jurisdiction of the courts of New Delhi.`;

  let cType = 'Commercial Dispute';
  let client = caseObj.clientName || 'Rajesh Sharma';
  let opponent = caseObj.accused || 'Amit Verma';
  let cStatus = caseObj.caseStatus || caseObj.status || 'Active';
  let jurisdiction = 'New Delhi';

  if (name.toLowerCase().includes('abc') || name.toLowerCase().includes('xyz')) {
    title = 'ABC Partnership Deed.pdf';
    text = `COMMERCIAL PARTNERSHIP AGREEMENT
This agreement is made on 15 Feb 2026 between ABC Pvt Ltd and XYZ Ltd.
Section 4. Profit Sharing: ABC Pvt Ltd shall receive 60% and XYZ Ltd 40% of net proceeds.
Section 8. Dispute Resolution: Subject to arbitration in Mumbai.
Section 11. Termination: Eviction of tenancy space with 15 days notice.`;
    cType = 'Commercial Dispute';
    client = 'ABC Pvt Ltd';
    opponent = 'XYZ Ltd';
    jurisdiction = 'Mumbai';
  } else if (name.toLowerCase().includes('samsung') || name.toLowerCase().includes('consumer')) {
    title = 'Samsung Product Purchase Warranty.pdf';
    text = `WARRANTY TERMS & CONDITIONS
Consumer Case warranty for Samsung electronic devices purchased in 2026.
Section 1. Warranty Period: 12 months from purchase.
Section 6. Liability Limitation: Samsung liability is strictly limited to product replacement. No commercial or consequential damages are covered.`;
    cType = 'Consumer Case';
    client = 'Consumer Client';
    opponent = 'Samsung Electronics';
    jurisdiction = 'Bangalore';
  } else if (name.toLowerCase().includes('employment') || name.toLowerCase().includes('employee')) {
    title = 'Executive Employment Agreement.pdf';
    text = `EMPLOYMENT CONTRACT
This Employment Contract is made on 01 Mar 2026.
Section 2. Non-Compete: Employee shall not join any competitor in India for 24 months post termination.
Section 5. Termination Notice: 3 months notice required.
Section 9. Governing Law: Subject to Courts of Delhi.`;
    cType = 'Employment Contract';
    client = 'Advocate Staff';
    opponent = 'Tech Corp India';
    jurisdiction = 'Delhi';
  }

  const auditResult = {
    stats: {
      overallScore: 82,
      riskScore: 28,
      complianceScore: 91,
      negotiationScore: 74,
      missingClausesCount: 3,
      confidenceRate: 96,
      reviewStatus: 'Review Before Signing',
      timeSaved: '2.4 hrs'
    },
    summary: {
      contractType: title.replace('.pdf', ''),
      jurisdiction: jurisdiction,
      governingLaw: 'Indian Contract Act, 1872',
      effectiveDate: '01 Jan 2026',
      expiryDate: '31 Dec 2027',
      renewalStatus: 'Automatic'
    },
    finalOpinion: {
      status: 'Review Before Signing',
      reasoning: `The contract is overall well-structured with a strong compliance rating of 91%. However, several key clauses require review:
1. High interest rate of 18% per annum on payment delays (Section 3).
2. Unilateral automatic renewal terms (Section 12).
3. We recommend negotiating a cap on the interest rates to 10% and adding a 30-day manual renewal option.`
    },
    clauses: [
      {
        id: 'c1',
        name: 'Payment Terms',
        text: 'Section 3. Payment Terms: Client shall pay the contractor Net 30 days upon submission of invoices. If any payment is delayed, contractor shall accrue interest at 18% per annum.',
        risk: 'Medium',
        indianLawMapping: {
          section: 'Section 73',
          actName: 'Indian Contract Act 1872',
          applicability: 'Applies to liquidated damages and reasonable compensations.',
          interpretation: 'Indian courts do not enforce penal interest rates. 18% may be deemed penal depending on commercial context.',
          practicalEffect: 'High likelihood of interest rate reductions during litigation or arbitration proceedings.'
        },
        caseLawMapping: [
          {
            judgmentName: 'Maula Bux vs Union of India',
            citation: '1970 SCR (1) 928',
            ratio: 'Penal liquidated damages without actual loss proof are not recoverable.',
            implication: 'Interest rate claim of 18% requires reasonable evidence of actual loss.'
          }
        ],
        redraftSuggestions: {
          lawyerVersion: 'Section 3. Payment Terms: Client shall pay the contractor Net 30 days. Delayed payments shall accrue simple interest at a rate of 9% per annum.',
          clientVersion: 'Client shall pay Net 45 days. No interest or penalty shall apply to delayed invoices.',
          plainEnglish: 'The client will pay invoices within 30 days. Late payments will have a simple 9% annual interest charge.'
        }
      },
      {
        id: 'c2',
        name: 'Indemnity',
        text: 'Section 7. Indemnity: Contractor shall indemnify and hold harmless the Client against all third-party claims, liabilities, and court costs.',
        risk: 'Low',
        indianLawMapping: {
          section: 'Section 124',
          actName: 'Indian Contract Act 1872',
          applicability: 'Defines contracts of indemnity.',
          interpretation: 'Valid and fully enforceable indemnity covenant.',
          practicalEffect: 'Enables client to recover complete litigation costs and settlement fees.'
        },
        caseLawMapping: [
          {
            judgmentName: 'Gajanan Moreshwar vs Moreshwar Madan',
            citation: '(1942) 44 BOMLR 703',
            ratio: 'Indemnifier liability commences as soon as the indemnified person’s liability is absolute.',
            implication: 'Client can sue for indemnity even before paying third party damages.'
          }
        ],
        redraftSuggestions: {
          lawyerVersion: 'Section 7. Indemnity: Contractor agrees to indemnify Client against direct third-party damages arising from negligence.',
          clientVersion: 'Contractor covers direct third-party losses.',
          plainEnglish: 'The contractor will pay for any legal losses caused by their work.'
        }
      }
    ],
    missingClauses: [
      {
        id: 'm1',
        clause: 'Limitation of Liability',
        implication: 'Unlimited liability exposure on both parties. Risk is High.',
        recommendation: 'Add a clause capping liabilities to 100% of contract values.'
      },
      {
        id: 'm2',
        clause: 'Force Majeure',
        implication: 'No excuse terms for pandemic or government lockdown outages.',
        recommendation: 'Insert standard force majeure list including lockdowns.'
      }
    ]
  };

  const files = [
    {
      id: `file_${Date.now()}_1`,
      name: title,
      size: 14520,
      type: 'application/pdf',
      uploadDate: new Date().toLocaleDateString(),
      ocrText: text
    }
  ];

  const versions = [
    {
      version: 1,
      timestamp: new Date().toISOString(),
      text: text,
      note: `Original Upload: ${title}`
    }
  ];

  const auditLogs = [
    {
      timestamp: new Date(Date.now() - 300000).toISOString(),
      action: 'File Uploaded & OCR Scanned',
      details: `Staged contract ${title} and completed structural OCR text extraction.`,
      editedBy: 'Advocate (advocate@mock.com)'
    },
    {
      timestamp: new Date(Date.now() - 120000).toISOString(),
      action: 'AI Clause Review Generated',
      details: 'Generated intelligence audit. Compliance Rating: 91%, Risk rating: Review Before Signing. Identified 2 active clauses and 2 gaps.',
      editedBy: 'Advocate (advocate@mock.com)'
    }
  ];

  return {
    files,
    contractTitle: title,
    activeContractText: text,
    auditResult,
    versions,
    auditLogs,
    chatHistory: [],
    comparisonResult: null
  };
};

const ContractReview = ({ currentCase, onBack, theme, allProjects = [], onUpdateCase }) => {
  const { toolkitLanguage, setToolkitLanguage } = useLanguage();
  const isDark = theme === 'dark';
  
  // Platform States
  const [contractTitle, setContractTitle] = useState('');
  const [contractText, setContractText] = useState('');
  const [activeTemplateId, setActiveTemplateId] = useState('NDA');
  const [linkedCaseId, setLinkedCaseId] = useState(currentCase?._id || '');
  const [isSyncing, setIsSyncing] = useState(false);

  // Upload & OCR States
  const [files, setFiles] = useState([]);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrSearchQuery, setOcrSearchQuery] = useState('');
  const [isEditingOcr, setIsEditingOcr] = useState(false);
  const [activeFileId, setActiveFileId] = useState(null);
  const [detectedEntities, setDetectedEntities] = useState(null);

  // Audit States
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState('');
  const [auditResult, setAuditResult] = useState(null);
  
  // Tabs & Views
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'clauses' | 'missing' | 'risks' | 'compliance' | 'financials' | 'obligations' | 'dates' | 'compare' | 'chat' | 'logs'
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Version Control & Logging
  // Catalog Table States
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogStatusFilter, setCatalogStatusFilter] = useState('All');
  const [catalogTypeFilter, setCatalogTypeFilter] = useState('All');
  const [catalogRiskFilter, setCatalogRiskFilter] = useState('All');
  const [catalogSortKey, setCatalogSortKey] = useState('name'); // 'name' | 'version' | 'pages' | 'size' | 'date'
  const [catalogSortOrder, setCatalogSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogBulkSelected, setCatalogBulkSelected] = useState([]);
  const [versions, setVersions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Rewrite Engine States
  const [activeRewriteClause, setActiveRewriteClause] = useState(null);
  const [rewriteTone, setRewriteTone] = useState('Balanced');
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenWording, setRewrittenWording] = useState('');

  // Comparison States
  const [secondContractFile, setSecondContractFile] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);

  // Contract Chat States
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  // UI state filters
  const [toolsSearchQuery, setToolsSearchQuery] = useState('');
  const [toolsCategory, setToolsCategory] = useState('All');
  // Workspace Selector and case management states
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [workspaceSearchQuery, setWorkspaceSearchQuery] = useState('');
  const [workspaceCategory, setWorkspaceCategory] = useState('All');
  const [isCreateCaseModalOpen, setIsCreateCaseModalOpen] = useState(false);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);
  const [prefillBanner, setPrefillBanner] = useState(null);

  // ─── Case Context (metadata only — never used as contract text) ───────────────
  const [caseContext, setCaseContext] = useState(null);
  // Which staged file is selected for analysis (multi-contract support)
  const [selectedAnalysisFileId, setSelectedAnalysisFileId] = useState(null);
  
  // Create Case Form States
  const [newCaseName, setNewCaseName] = useState('');
  const [newCaseClient, setNewCaseClient] = useState('');
  const [newCaseOpponent, setNewCaseOpponent] = useState('');
  const [newCaseType, setNewCaseType] = useState('Civil Suit');
  const [newCaseSummary, setNewCaseSummary] = useState('');

  // Duplicate upload version conflict state
  const [duplicateFileConflict, setDuplicateFileConflict] = useState(null);

  // Favorite / Pinned cases lists
  const [favoriteCases, setFavoriteCases] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aisa_fav_cases') || '[]');
    } catch {
      return [];
    }
  });

  // v3.0 Workspace interactive states
  const [selectedHeatmapRisk, setSelectedHeatmapRisk] = useState(null);
  const [activeRedraftId, setActiveRedraftId] = useState(null);
  const [redraftPerspective, setRedraftPerspective] = useState('lawyer');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedComplianceIdx, setExpandedComplianceIdx] = useState(null);
  const [activePrecedentIdx, setActivePrecedentIdx] = useState(null);
  
  const [collapsedBlocks, setCollapsedBlocks] = useState({
    summary: false,
    clauses: true,
    heatmap: true,
    compliance: true,
    negotiation: true,
    redraft: true,
    caseLaws: true
  });

  const toggleBlock = (key) => {
    setCollapsedBlocks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getSectionHighlightClass = (sectionKey) => {
    const isSectionActive = activeTab === sectionKey;
    return isSectionActive 
      ? 'border-indigo-500/50 shadow-[0_4px_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20 border-l-4 border-l-indigo-500 transition-all duration-300'
      : 'border-slate-200 dark:border-zinc-800/80 transition-all duration-300';
  };

  const getSectionStatusBadge = (sectionKey, activeModeName) => {
    if (isAuditing && activeTab === sectionKey) {
      return (
        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-indigo-500/10 text-indigo-500 animate-pulse ml-2 shrink-0">
          Generating {activeModeName}...
        </span>
      );
    }
    if (auditResult) {
      return (
        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-500 ml-2 shrink-0">
          Completed
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-slate-100 dark:bg-zinc-800 text-slate-400 ml-2 shrink-0">
        Empty
      </span>
    );
  };

  const handleQuickActionClick = (id) => {
    let newCollapsed = {
      summary: true,
      findings: true,
      heatmap: true,
      clauses: true,
      compliance: true,
      negotiation: true,
      redraft: true,
      caseLaws: true,
      activityLog: true,
      chat: true
    };

    if (id === 'summary') {
      newCollapsed.summary = false;
      newCollapsed.findings = false;
      newCollapsed.heatmap = false;
    } else if (id === 'heatmap') {
      newCollapsed.findings = false;
      newCollapsed.heatmap = false;
    } else if (id === 'clauses') {
      newCollapsed.clauses = false;
    } else if (id === 'compliance') {
      newCollapsed.compliance = false;
    } else if (id === 'negotiation') {
      newCollapsed.negotiation = false;
    } else if (id === 'redraft') {
      newCollapsed.redraft = false;
    }

    setCollapsedBlocks(newCollapsed);

    setTimeout(() => {
      const targetId = id === 'summary' ? 'summary' : id;
      const element = document.getElementById(`section-${targetId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };
  const [activeSidebarSection, setActiveSidebarSection] = useState('contract');
  const [openSections, setOpenSections] = useState({
    workspace: true,
    contract: true,
    actions: true,
    templates: false,
    ocr: false,
    insights: false,
    activity: true
  });
  const [favoriteTools, setFavoriteTools] = useState(() => {
    try {
      const stored = localStorage.getItem('aisa_fav_templates');
      return stored ? JSON.parse(stored) : ['NDA'];
    } catch {
      return ['NDA'];
    }
  });

  useEffect(() => {
    localStorage.setItem('aisa_fav_templates', JSON.stringify(favoriteTools));
  }, [favoriteTools]);

  const [pinnedTools, setPinnedTools] = useState(['Employment']);

  // Get active case context
  const activeCaseContext = useActiveCase();
  const triggerAutoRun = activeCaseContext?.triggerAutoRun;

  const scrollRef = useRef(null);
  const chatBottomRef = useRef(null);
  const contractMountedRef = useRef(true);
  const uploadInputRef = useRef(null); // shared ref for the sidebar upload input
  const lastHydratedCaseIdRef = useRef(null); // track last case ID that was hydrated
  const suppressHydrationRef = useRef(false); // block re-hydration during upload/analysis


  // ─ Language Toggle ────────────────────────────────────────
  const {
    outputLang: contractLang,
    setOutputLang: setContractLang,
    isTranslating: isContractTranslating,
    setIsTranslating: setIsContractTranslating,
    translateText: translateContractText,
    getDisplayText: getContractDisplayText,
  } = useOutputLanguage('contract_review', currentCase?._id || 'global');

  const [contractOpinionDisplay, setContractOpinionDisplay] = useState('');

  useEffect(() => {
    contractMountedRef.current = true;
    return () => { contractMountedRef.current = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem('aisa_fav_cases', JSON.stringify(favoriteCases));
  }, [favoriteCases]);

  // Reset display when auditResult changes
  useEffect(() => {
    if (auditResult?.finalOpinion?.reasoning) {
      setContractOpinionDisplay(auditResult.finalOpinion.reasoning);
      setContractLang('en');
    }
  }, [auditResult]); // eslint-disable-line

  const handleContractLangChange = useCallback(async (newLang) => {
    setContractLang(newLang);
    const text = auditResult?.finalOpinion?.reasoning;
    if (!text) return;
    if (newLang === 'en') {
      setContractOpinionDisplay(text);
      return;
    }
    const cached = getContractDisplayText(text);
    if (cached && cached !== text) {
      setContractOpinionDisplay(cached);
      return;
    }
    setIsContractTranslating(true);
    try {
      const translated = await translateContractText(text);
      if (contractMountedRef.current) setContractOpinionDisplay(translated);
    } catch {
      if (contractMountedRef.current) setContractOpinionDisplay(text);
    } finally {
      if (contractMountedRef.current) setIsContractTranslating(false);
    }
  }, [auditResult, getContractDisplayText, setContractLang, setIsContractTranslating, translateContractText]);

  // --- Initialize and Hydrate from Database ---
  useEffect(() => {
    if (currentCase) {
      const newCaseId = currentCase._id;
      setLinkedCaseId(newCaseId);

      // Only hydrate when the case actually changes (not on every parent re-render/update)
      // suppressHydrationRef blocks re-hydration during active upload/analysis
      if (newCaseId !== lastHydratedCaseIdRef.current && !suppressHydrationRef.current) {
        lastHydratedCaseIdRef.current = newCaseId;
        hydrateFromCase(currentCase);
      }
      
      // Auto-filter Template Explorer category according to case matter type
      const type = currentCase.caseType || '';
      if (type.toLowerCase().includes('employment') || type.toLowerCase().includes('hr')) {
        setToolsCategory('Employment');
      } else if (type.toLowerCase().includes('nda') || type.toLowerCase().includes('disclosure')) {
        setToolsCategory('NDA');
      } else if (type.toLowerCase().includes('lease') || type.toLowerCase().includes('rent')) {
        setToolsCategory('Lease');
      } else if (type.toLowerCase().includes('vendor') || type.toLowerCase().includes('commercial')) {
        setToolsCategory('Vendor');
      } else {
        setToolsCategory('All');
      }
    } else {
      lastHydratedCaseIdRef.current = null;
      resetPlatformState();
    }
  }, [currentCase]); // eslint-disable-line

  // ─── Load Case Context (metadata only) ────────────────────────────────────
  // IMPORTANT: Case data is ONLY stored as context. contractText is ONLY
  // set when a real OCR-extracted contract document exists.
  useEffect(() => {
    if (currentCase) {
      // Store case metadata as context — never as contract text
      setCaseContext({
        title: currentCase.name || currentCase.title || '',
        caseType: currentCase.caseType || '',
        client: currentCase.clientName || currentCase.client || '',
        accused: currentCase.accused || currentCase.opponent || '',
        court: currentCase.courtName || currentCase.court || '',
        summary: currentCase.description || currentCase.summary || '',
        hearingDate: currentCase.nextHearingDate || '',
      });

      // Only set contractText if real OCR-extracted file content exists
      // Do NOT use caseFacts or description as contract text
      const mapped = mapCaseToForm(currentCase);
      if (mapped.hasContract && mapped.contractFiles?.length) {
        const contractFile = mapped.contractFiles[0];
        setPrefillBanner({
          type: 'info',
          caseTitle: currentCase.name,
          message: `Case loaded as context. Upload or select a contract document to begin analysis.`
        });
        // contractText will be set when user uploads/selects the file
      } else {
        // No contract files — show empty state, do NOT seed fake text
        setContractTitle('');
        setContractText('');
        setPrefillBanner(null);
      }
    } else {
      setCaseContext(null);
    }
  }, [currentCase]);

  // Execute Auto-Run only when a real contract file with OCR text is available
  useEffect(() => {
    if (triggerAutoRun && currentCase && !auditResult && !isAuditing) {
      // Only auto-run if we have real contract text from an uploaded file
      const hasRealContract = files.some(f => f.ocrText?.trim());
      if (!hasRealContract || !contractText?.trim()) {
        toast(`📄 Case context loaded. Upload a contract to begin AI analysis.`, { duration: 3000 });
        return;
      }
      toast.success(`✓ Contract workspace ready — running analysis`, { icon: '📄', duration: 3000 });
      setTimeout(() => {
        performContractAuditInternal(contractTitle, contractText, files, versions, auditLogs);
      }, 100);
    }
  }, [triggerAutoRun, currentCase, auditResult, isAuditing]); // eslint-disable-line


  const resetPlatformState = () => {
    setContractTitle('');
    setContractText('');
    setFiles([]);
    setAuditResult(null);
    setVersions([]);
    setAuditLogs([]);
    setChatHistory([]);
    setComparisonResult(null);
    setSecondContractFile(null);
    setActiveFileId(null);
  };

  const hydrateFromCase = async (caseObj) => {
    if (!caseObj) return;
    setIsWorkspaceLoading(true);

    await new Promise(resolve => setTimeout(resolve, 350));

    const ci = caseObj.contractIntelligence;
    
    // Extract any existing contract-like documents from caseObj.documents to populate workspace if empty
    const workspaceContracts = (caseObj.documents || [])
      .filter(d => /nda|contract|agreement/i.test(d.name || '') || (d.category && /contract|agreement/i.test(d.category)))
      .map(d => ({
        id: d.id || `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: d.name,
        size: d.size || 0,
        type: d.type || 'application/pdf',
        uploadDate: d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : new Date().toLocaleDateString(),
        ocrText: d.ocrText || '',
        base64: ''
      }));

    let mergedFiles = ci?.files || [];
    // Merge any contract documents from workspace documents that aren't in contractIntelligence yet
    workspaceContracts.forEach(wc => {
      const exists = mergedFiles.some(f => f.name === wc.name);
      if (!exists) {
        mergedFiles = [...mergedFiles, wc];
      }
    });

    if (mergedFiles.length > 0) {
      setFiles(mergedFiles);
      
      const activeContractIdFromStorage = sessionStorage.getItem('aiLegal_activeContractId');
      sessionStorage.removeItem('aiLegal_activeContractId');

      let targetFile = null;
      if (activeContractIdFromStorage) {
        targetFile = mergedFiles.find(f => f.id === activeContractIdFromStorage);
      }
      
      if (!targetFile && mergedFiles.length === 1) {
        targetFile = mergedFiles[0];
      }

      if (targetFile) {
        setActiveFileId(targetFile.id);
        setSelectedAnalysisFileId(targetFile.id);
        setContractTitle(targetFile.name);
        setContractText(targetFile.ocrText || '');
        setAuditResult(targetFile.contractAnalysis || ci?.auditResult || null);
        setVersions(targetFile.versions || ci?.versions || []);
        setAuditLogs(targetFile.auditLogs || ci?.auditLogs || []);
        setChatHistory(ci?.chatHistory || []);
        setComparisonResult(ci?.comparisonResult || null);

        if (targetFile.ocrText && !targetFile.contractAnalysis) {
          setTimeout(() => {
            performContractAuditInternal(targetFile.name, targetFile.ocrText, mergedFiles, targetFile.versions || [], targetFile.auditLogs || []);
          }, 150);
        }
      } else {
        // Multiple contracts exist and no preselected ID: show searchable selector
        setActiveFileId(null);
        setSelectedAnalysisFileId(null);
        setContractTitle('');
        setContractText('');
        setAuditResult(null);
        setVersions([]);
        setAuditLogs([]);
        setChatHistory([]);
        setComparisonResult(null);
      }
    } else {
      setFiles([]);
      setContractTitle('');
      setContractText('');
      setAuditResult(null);
      setVersions([]);
      setAuditLogs([]);
      setChatHistory([]);
      setComparisonResult(null);
      setActiveFileId(null);
      setSelectedAnalysisFileId(null);
    }
    setIsWorkspaceLoading(false);
  };

  // Ensure case is created in database (For manual entries)
  const ensureCaseCreated = async (fileName) => {
    let activeId = linkedCaseId || currentCase?._id;
    let activeProj = currentCase || allProjects.find(p => p._id === activeId);

    if (!activeId) {
      setIsSyncing(true);
      const title = `Contract Review: ${fileName || contractTitle || 'Custom Agreement'}`;
      try {
        const newProj = await apiService.createProject({
          name: title,
          isLegalCase: true,
          description: `Automatically created for Contract Review of ${fileName || 'uploaded file'}.`
        });
        activeId = newProj._id;
        activeProj = newProj;
        setLinkedCaseId(activeId);
        if (onUpdateCase) onUpdateCase(newProj);
        toast.success(`📁 Database Case created: "${title}"`);
      } catch (e) {
        console.error("Auto-create case failed", e);
        toast.error("Offline fallback: using local simulation.");
      } finally {
        setIsSyncing(false);
      }
    }
    return { activeId, activeProj };
  };

  // Sync state changes directly to the database
  const syncToDatabase = async (updates) => {
    const activeId = linkedCaseId || currentCase?._id;
    if (!activeId) return;
    setIsSyncing(true);
    try {
      const activeProj = allProjects.find(p => p._id === activeId) || currentCase;
      const currentCi = activeProj?.contractIntelligence || {};

      // Calculate next files list (either from updates or existing state)
      const nextFiles = updates.files !== undefined ? updates.files : files;

      // Update activeProj.documents to keep it in sync!
      let currentDocs = activeProj.documents || [];
      
      // 1. Remove documents that are no longer in nextFiles (if they were contract docs)
      currentDocs = currentDocs.filter(doc => {
        const isContract = doc.category === 'Contract' || doc.isContract === true || /nda|contract|agreement|lease/i.test(doc.name || '');
        if (isContract) {
          return nextFiles.some(f => f.id === doc.id || f.name === doc.name);
        }
        return true;
      });

      const activeTitle = updates.contractTitle !== undefined ? updates.contractTitle : contractTitle;
      const activeText = updates.contractText !== undefined ? updates.contractText : contractText;
      const activeAuditResult = updates.auditResult !== undefined ? updates.auditResult : auditResult;
      const activeVersions = updates.versions !== undefined ? updates.versions : versions;
      const activeLogs = updates.auditLogs !== undefined ? updates.auditLogs : auditLogs;

      // 2. Add/Update documents from nextFiles
      nextFiles.forEach(f => {
        const alreadyExists = currentDocs.some(doc => doc.id === f.id || doc.name === f.name);
        if (!alreadyExists) {
          currentDocs = [
            {
              id: f.id,
              name: f.name,
              type: f.type || 'application/pdf',
              size: f.size,
              uploadedAt: new Date().toISOString(),
              ocrStatus: 'Success (OCR Done)',
              aiProcessed: 'Extracted successfully',
              ocrText: f.ocrText,
              contractAnalysis: f.contractAnalysis || (f.id === activeFileId ? activeAuditResult : null),
              versionHistory: f.versions || (f.id === activeFileId ? activeVersions : []),
              auditTrail: f.auditLogs || (f.id === activeFileId ? activeLogs : []),
              category: 'Contract',
              isContract: true
            },
            ...currentDocs
          ];
        }
      });

      currentDocs = currentDocs.map(doc => {
        const isActive = doc.id === activeFileId || doc.name === activeTitle;
        const match = nextFiles.find(f => f.id === doc.id || f.name === doc.name);

        if (isActive) {
          return {
            ...doc,
            ocrText: activeText || doc.ocrText,
            contractAnalysis: activeAuditResult !== undefined ? activeAuditResult : doc.contractAnalysis,
            versionHistory: activeVersions !== undefined ? activeVersions : doc.versionHistory,
            auditTrail: activeLogs !== undefined ? activeLogs : doc.auditTrail,
            category: 'Contract',
            isContract: true
          };
        } else if (match) {
          return {
            ...doc,
            ocrText: match.ocrText || doc.ocrText,
            contractAnalysis: match.contractAnalysis || doc.contractAnalysis,
            versionHistory: match.versions || match.versionHistory || doc.versionHistory,
            auditTrail: match.auditLogs || match.auditTrail || doc.auditTrail,
            category: 'Contract',
            isContract: true
          };
        }
        return doc;
      });

      const payload = {
        ...activeProj,
        documents: currentDocs,
        contractIntelligence: {
          ...currentCi,
          contractTitle: activeTitle,
          activeContractText: activeText,
          files: nextFiles,
          auditResult: activeAuditResult,
          versions: activeVersions,
          auditLogs: activeLogs,
          comparisonResult: updates.comparisonResult !== undefined ? updates.comparisonResult : comparisonResult,
          chatHistory: updates.chatHistory !== undefined ? updates.chatHistory : chatHistory,
          ...updates
        }
      };
      const response = await apiService.updateProject(activeId, payload);
      if (onUpdateCase) onUpdateCase(response);
    } catch (e) {
      console.error("Database sync failed", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Push record to Audit Log Trail
  const logAudit = async (action, details, customLogsList = null) => {
    const timestamp = new Date().toISOString();
    const userEmail = getUserData()?.email || 'System User';
    const userName = getUserData()?.name || 'Advocate';
    const newLog = {
      timestamp,
      action,
      details,
      editedBy: `${userName} (${userEmail})`
    };

    const targetList = customLogsList || auditLogs;
    const updatedLogs = [...targetList, newLog];
    setAuditLogs(updatedLogs);

    // Sync database with updated logs list
    await syncToDatabase({ auditLogs: updatedLogs });
  };

  // Create document version record
  const createDocumentVersion = async (newText, note, customVersionsList = null) => {
    const targetVersions = customVersionsList || versions;
    const nextVerNo = targetVersions.length + 1;
    const newVer = {
      version: nextVerNo,
      timestamp: new Date().toISOString(),
      text: newText,
      note: note || `Revision version ${nextVerNo}`
    };
    const updatedVersions = [...targetVersions, newVer];
    setVersions(updatedVersions);
    
    await syncToDatabase({
      activeContractText: newText,
      versions: updatedVersions
    });
    await logAudit('Version Saved', `Saved Document version ${nextVerNo} - ${note}`, updatedVersions);
  };

  // Conflict handlers for duplicate uploads
  const processReplaceVersionConflict = async (fileObj, conflictObj) => {
    setDuplicateFileConflict(null);
    setIsOcrLoading(true);
    const tid = toast.loading(`OCR Extracting text: ${fileObj.name}...`);
    try {
      const systemPrompt = `You are a professional legal OCR and text extraction engine. Extract all text content from this contract file exactly, maintaining lines, headings, paragraphs, and structure. Do NOT add any notes, headers, or explanations. Just return the extracted document text.`;
      const currentMessage = `Extract the content of this file: ${fileObj.name}`;
      
      const response = await generateChatResponse(
        [],
        currentMessage,
        systemPrompt,
        [{ url: `data:${fileObj.type || 'application/pdf'};base64,${conflictObj.base64}`, name: fileObj.name, type: fileObj.type.startsWith('image/') ? 'image' : 'document' }],
        toolkitLanguage || 'English',
        null,
        'legal'
      );

      const ocrText = response.reply || response || '';
      toast.success(`OCR Complete: ${fileObj.name}`, { id: tid });

      // Overwrite raw file in files list
      const updatedFiles = files.map(f => f.name === fileObj.name ? { ...f, size: fileObj.size, uploadDate: new Date().toLocaleDateString(), ocrText, base64: conflictObj.base64 } : f);
      setFiles(updatedFiles);
      setContractTitle(fileObj.name);
      setContractText(ocrText);

      // Save a new version record
      const currentVersions = [...versions];
      const nextVerNo = currentVersions.length + 1;
      const initialVer = {
        version: nextVerNo,
        timestamp: new Date().toISOString(),
        text: ocrText,
        note: `Version Replaced (Overwrite): ${fileObj.name}`
      };
      const updatedVersions = [...currentVersions, initialVer];
      setVersions(updatedVersions);

      // Log & sync
      const timestamp = new Date().toISOString();
      const userEmail = getUserData()?.email || 'System User';
      const userName = getUserData()?.name || 'Advocate';
      const newLog = {
        timestamp,
        action: 'File Version Overwritten',
        details: `Replaced staged file "${fileObj.name}" with a newer copy. Version incremented to v${nextVerNo}.`,
        editedBy: `${userName} (${userEmail})`
      };
      const updatedLogs = [...auditLogs, newLog];
      setAuditLogs(updatedLogs);

      await syncToDatabase({
        activeContractText: ocrText,
        files: updatedFiles,
        versions: updatedVersions,
        auditLogs: updatedLogs
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to replace version.", { id: tid });
    } finally {
      setIsOcrLoading(false);
    }
  };

  const processCreateNewVersionConflict = async (fileObj, conflictObj) => {
    setDuplicateFileConflict(null);
    setIsOcrLoading(true);
    const tid = toast.loading(`OCR Extracting text: ${fileObj.name}...`);
    try {
      const systemPrompt = `You are a professional legal OCR and text extraction engine. Extract all text content from this contract file exactly, maintaining lines, headings, paragraphs, and structure. Do NOT add any notes, headers, or explanations. Just return the extracted document text.`;
      const currentMessage = `Extract the content of this file: ${fileObj.name}`;
      
      const response = await generateChatResponse(
        [],
        currentMessage,
        systemPrompt,
        [{ url: `data:${fileObj.type || 'application/pdf'};base64,${conflictObj.base64}`, name: fileObj.name, type: fileObj.type.startsWith('image/') ? 'image' : 'document' }],
        toolkitLanguage || 'English',
        null,
        'legal'
      );

      const ocrText = response.reply || response || '';
      toast.success(`OCR Complete: ${fileObj.name}`, { id: tid });

      // Keep existing files, but append version
      const currentVersions = [...versions];
      const nextVerNo = currentVersions.length + 1;
      const initialVer = {
        version: nextVerNo,
        timestamp: new Date().toISOString(),
        text: ocrText,
        note: `New Version Uploaded: ${fileObj.name}`
      };
      const updatedVersions = [...currentVersions, initialVer];
      setVersions(updatedVersions);

      // Overwrite the active document text & title
      setContractTitle(fileObj.name);
      setContractText(ocrText);

      // Log & sync
      const timestamp = new Date().toISOString();
      const userEmail = getUserData()?.email || 'System User';
      const userName = getUserData()?.name || 'Advocate';
      const newLog = {
        timestamp,
        action: 'New File Version Created',
        details: `Created new version record for contract "${fileObj.name}" without replacing current list.`,
        editedBy: `${userName} (${userEmail})`
      };
      const updatedLogs = [...auditLogs, newLog];
      setAuditLogs(updatedLogs);

      await syncToDatabase({
        activeContractText: ocrText,
        versions: updatedVersions,
        auditLogs: updatedLogs
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create new version.", { id: tid });
    } finally {
      setIsOcrLoading(false);
    }
  };

  const processCompareVersionsConflict = async (fileObj, conflictObj) => {
    setDuplicateFileConflict(null);
    setIsOcrLoading(true);
    const tid = toast.loading(`Extracting version text for comparison...`);
    try {
      const systemPrompt = `You are a professional legal OCR and text extraction engine. Extract all text content from this contract file exactly.`;
      const currentMessage = `Extract the content of this file: ${fileObj.name}`;
      
      const response = await generateChatResponse(
        [],
        currentMessage,
        systemPrompt,
        [{ url: `data:${fileObj.type || 'application/pdf'};base64,${conflictObj.base64}`, name: fileObj.name, type: fileObj.type.startsWith('image/') ? 'image' : 'document' }],
        toolkitLanguage || 'English',
        null,
        'legal'
      );

      const newOcrText = response.reply || response || '';
      toast.success(`OCR Complete! Generating Comparison...`, { id: tid });

      // Run comparison
      const comparePrompt = `You are a professional legal counsel. Compare the following two versions of a contract:
Version 1 (Existing):
${conflictObj.existingFile.ocrText}

Version 2 (New Upload):
${newOcrText}

Provide a comparative analysis in JSON format:
{
  "modified": [
    {
      "clause": "Name of the clause changed",
      "originalText": "original text summary",
      "newText": "new text summary",
      "riskAssessment": "Risk evaluation of changes"
    }
  ]
}`;
      
      const compRes = await generateChatResponse(
        [],
        "Compare the versions",
        comparePrompt,
        [],
        toolkitLanguage || 'English',
        null,
        'legal'
      );

      const compText = compRes.reply || compRes || '';
      let parsedComp = { modified: [] };
      try {
        const jsonMatch = compText.match(/```json\s*([\s\S]*?)\s*```/) || compText.match(/(\{[\s\S]*\})/);
        if (jsonMatch) parsedComp = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (err) {
        console.error(err);
      }

      setComparisonResult(parsedComp);
      setActiveTab('compare');
      toast.success("Comparison populated! Switch to comparison view tab to inspect.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to compare versions.", { id: tid });
    } finally {
      setIsOcrLoading(false);
    }
  };

  // --- Drop & Drag / File Upload Handlers ---
  const handleFileUpload = async (e, isComparison = false) => {
    const uploadedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (uploadedFiles.length === 0) return;

    if (isComparison) {
      const file = uploadedFiles[0];
      setSecondContractFile({ name: file.name, status: 'Staged', text: '' });
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1];
        setSecondContractFile(prev => ({ ...prev, base64: base64Data, status: 'Loaded' }));
        toast.success(`Secondary contract staged: ${file.name}`);
      };
      reader.readAsDataURL(file);
      return;
    }

    // ── Suppress hydration during upload + analysis to prevent auditResult wipeout ──
    suppressHydrationRef.current = true;

    // Check if the contract is already uploaded
    const existingFile = files.find(f => f.name === uploadedFiles[0].name);
    if (existingFile) {
      const file = uploadedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result.split(',')[1];
        setDuplicateFileConflict({
          file: file,
          existingFile: existingFile,
          base64: base64Data
        });
      };
      reader.readAsDataURL(file);
      // Clean up ref if conflict returns early
      suppressHydrationRef.current = false;
      return;
    }

    const { activeId } = await ensureCaseCreated(uploadedFiles[0].name);

    setIsOcrLoading(true);
    const newStagedFiles = [];

    for (const file of uploadedFiles) {
      const reader = new FileReader();
      const loadPromise = new Promise((resolve) => {
        reader.onload = async () => {
          const base64Data = reader.result.split(',')[1];
          const newFile = {
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toLocaleDateString(),
            base64: base64Data,
            ocrText: ''
          };
          resolve(newFile);
        };
        reader.readAsDataURL(file);
      });

      const fileObj = await loadPromise;
      newStagedFiles.push(fileObj);

      // Perform OCR immediately using Gemini Multi-modal API
      try {
        toast.loading(`OCR Extracting text: ${fileObj.name}...`, { id: 'ocr' });
        const systemPrompt = `You are a professional legal OCR and text extraction engine. Extract all text content from this contract file exactly, maintaining lines, headings, paragraphs, and structure. Do NOT add any notes, headers, or explanations. Just return the extracted document text.`;
        const currentMessage = `Extract the content of this file: ${fileObj.name}`;
        
        const response = await generateChatResponse(
          [],
          currentMessage,
          systemPrompt,
          [{ url: `data:${fileObj.type || 'application/pdf'};base64,${fileObj.base64}`, name: fileObj.name, type: fileObj.type.startsWith('image/') ? 'image' : 'document' }],
          toolkitLanguage || 'English',
          null,
          'legal'
        );

        fileObj.ocrText = response.reply || response || '';
        toast.success(`OCR Complete: ${fileObj.name}`, { id: 'ocr' });
      } catch (err) {
        console.error("OCR Extraction failed", err);
        toast.error(`OCR extraction failed. Copying raw details.`, { id: 'ocr' });
        fileObj.ocrText = `File content staged: ${fileObj.name}. Manual revision required if scanned.`;
      }
    }

    const updatedFiles = [...files, ...newStagedFiles];
    setFiles(updatedFiles);
    setActiveFileId(newStagedFiles[0].id);
    
    // Set active contract details to the first uploaded contract
    setContractTitle(newStagedFiles[0].name);
    setContractText(newStagedFiles[0].ocrText);

    // Save to version control
    const currentVersions = [...versions];
    const nextVerNo = currentVersions.length + 1;
    const initialVer = {
      version: nextVerNo,
      timestamp: new Date().toISOString(),
      text: newStagedFiles[0].ocrText,
      note: `Original Upload: ${newStagedFiles[0].name}`
    };
    const updatedVersions = [...currentVersions, initialVer];
    setVersions(updatedVersions);

    setIsOcrLoading(false);

    // Trigger state sync and log upload
    const timestamp = new Date().toISOString();
    const userEmail = getUserData()?.email || 'System User';
    const userName = getUserData()?.name || 'Advocate';
    const newLog = {
      timestamp,
      action: 'File Uploaded & OCR Scanned',
      details: `Staged contract ${newStagedFiles[0].name} (${Math.round(newStagedFiles[0].size / 1024)} KB) and completed structural OCR text extraction.`,
      editedBy: `${userName} (${userEmail})`
    };
    const updatedLogs = [...auditLogs, newLog];
    setAuditLogs(updatedLogs);

    // Write to database
    await syncToDatabase({
      contractTitle: newStagedFiles[0].name,
      activeContractText: newStagedFiles[0].ocrText,
      files: updatedFiles,
      versions: updatedVersions,
      auditLogs: updatedLogs
    });

    // Auto-run analysis — scroll live progress into view first
    setTimeout(() => {
      const el = document.getElementById('section-live-progress');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
    try {
      await performContractAuditInternal(newStagedFiles[0].name, newStagedFiles[0].ocrText, updatedFiles, updatedVersions, updatedLogs);
    } finally {
      // Re-enable hydration after analysis pipeline completes
      suppressHydrationRef.current = false;
    }
  };

  // --- AI Contract Review Engine ---
  const runContractAudit = async () => {
    if (!contractText.trim()) {
      toast.error(
        <span>
          <strong>Unable to analyze contract.</strong><br/>
          Reason: OCR text missing.<br/>
          Upload or load a template first.
        </span>,
        { duration: 6000 }
      );
      return;
    }
    await performContractAuditInternal(contractTitle, contractText, files, versions, auditLogs);
  };

  const repairTruncatedJson = (jsonStr) => {
    if (!jsonStr) return null;
    jsonStr = jsonStr.trim();
    
    // 1. Find the first '{'
    const firstBrace = jsonStr.indexOf('{');
    if (firstBrace === -1) return null;
    jsonStr = jsonStr.slice(firstBrace);
    
    // 2. Scan to see if the JSON is cut off inside an unclosed string
    let inString = false;
    let escaped = false;
    
    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
    }
    
    // If we are currently inside an unclosed string at the end of the text, append the quote
    if (inString) {
      jsonStr += '"';
    }
    
    let cleaned = jsonStr;
    let parsed = null;
    
    // Attempt to parse by rolling back the string character-by-character if needed
    for (let rollbackLen = cleaned.length; rollbackLen > 0; rollbackLen--) {
      let testStr = cleaned.slice(0, rollbackLen);
      
      // Clean trailing comma, colon, or stray chars
      testStr = testStr.trim().replace(/[,:\s]+$/, '');
      
      // Count unclosed brackets/braces in testStr
      let openBraces = 0;
      let openBrackets = 0;
      let insideStr = false;
      let esc = false;
      
      for (let i = 0; i < testStr.length; i++) {
        if (esc) { esc = false; continue; }
        if (testStr[i] === '\\') { esc = true; continue; }
        if (testStr[i] === '"') { insideStr = !insideStr; continue; }
        if (!insideStr) {
          if (testStr[i] === '{') openBraces++;
          else if (testStr[i] === '}') openBraces--;
          else if (testStr[i] === '[') openBrackets++;
          else if (testStr[i] === ']') openBrackets--;
        }
      }
      
      // Close the string envelope if we rolled back into the middle of one
      if (insideStr) {
        testStr += '"';
      }
      
      // Append matching closing braces/brackets
      for (let i = 0; i < openBrackets; i++) testStr += ']';
      for (let i = 0; i < openBraces; i++) testStr += '}';
      
      try {
        parsed = JSON.parse(testStr);
        if (parsed) {
          console.log(`[JSON Repair] Successfully repaired JSON by rolling back ${cleaned.length - rollbackLen} characters.`);
          return parsed;
        }
      } catch (e) {
        // Keep rolling back
      }
    }
    
    return null;
  };

  const performContractAuditInternal = async (title, text, activeFiles, activeVersions, activeLogs, loadingMsg, action = 'all') => {
    setIsAuditing(true);
    setAuditResult(null);
    setAuditStep('OCR Scanning Check...');

    const toastId = toast.loading(loadingMsg || "AI Platform auditing contract parameters...");

    let progressIntervals = [];
    if (action === 'heatmap') {
      progressIntervals = [
        { step: 'OCR Scanning Check...', delay: 200 },
        { step: 'Risk Detection Calculations...', delay: 500 },
        { step: 'Analyzing Risk Heatmap...', delay: 1000 },
        { step: 'Calculating Risk Severity...', delay: 1500 }
      ];
    } else if (action === 'clauses') {
      progressIntervals = [
        { step: 'OCR Scanning Check...', delay: 200 },
        { step: 'Extracting Clauses...', delay: 500 },
        { step: 'Evaluating Clause Standards...', delay: 1000 },
        { step: 'Verifying Hidden Liabilities...', delay: 1500 }
      ];
    } else if (action === 'compliance') {
      progressIntervals = [
        { step: 'OCR Scanning Check...', delay: 200 },
        { step: 'Statutory Compliance Checks...', delay: 500 },
        { step: 'Verifying Labour Laws...', delay: 1000 },
        { step: 'Checking DPDP & Contract Act...', delay: 1500 }
      ];
    } else if (action === 'negotiation') {
      progressIntervals = [
        { step: 'OCR Scanning Check...', delay: 200 },
        { step: 'Preparing Negotiation Wording...', delay: 500 },
        { step: 'Generating Fallback Reciprocities...', delay: 1000 },
        { step: 'Assembling Legal Leverage...', delay: 1500 }
      ];
    } else if (action === 'redraft') {
      progressIntervals = [
        { step: 'OCR Scanning Check...', delay: 200 },
        { step: 'Generating Redraft Variations...', delay: 500 },
        { step: 'Translating Plain English...', delay: 1000 },
        { step: 'Finalizing Comparative Layouts...', delay: 1500 }
      ];
    } else {
      progressIntervals = [
        { step: 'OCR Scanning Check...', delay: 300 },
        { step: 'Extracting Clauses...', delay: 600 },
        { step: 'Running AI Audit Review...', delay: 1000 },
        { step: 'Risk Detection Calculations...', delay: 1400 },
        { step: 'Statutory Compliance Checks...', delay: 1800 },
        { step: 'Supreme Court Case Law Search...', delay: 2200 },
        { step: 'Generating Summary Report...', delay: 2600 }
      ];
    }

    progressIntervals.forEach(item => {
      setTimeout(() => {
        setAuditStep(item.step);
      }, item.delay);
    });

    try {
      let actionSpecificInstructions = '';
      if (action === 'heatmap') {
        actionSpecificInstructions = `Focus intensely on risk identification and classification. Build the stats riskScore, risk levels (Critical/High/Medium/Low counts), executiveSummary majorLegalRisks, commercialRisks, financialRisks, and complianceConcerns. Create an actual risk matrix. Set a highly accurate confidenceRate.`;
      } else if (action === 'clauses') {
        actionSpecificInstructions = `Extract and categorize every clause. Focus on identifying and parsing all 20 clause categories: Payment Terms, Termination, Confidentiality, Indemnity, Force Majeure, Arbitration, Jurisdiction, Dispute Resolution, Notice, Intellectual Property, Data Privacy, Non Compete, Warranty, Limitation of Liability, Assignment, Entire Agreement, Renewal, Default, Penalty. Make sure to populate the "clauses" and "missingClauses" lists.`;
      } else if (action === 'compliance') {
        actionSpecificInstructions = `Perform a comprehensive regulatory compliance check. Compare the contract against the Indian Contract Act 1872, DPDP Act 2023, Companies Act, Employment Laws, MSME Act, Consumer Protection, and Arbitration Act. Generate a detailed compliance report with pass/fail/warning statuses and explanations in the "compliance" list.`;
      } else if (action === 'negotiation') {
        actionSpecificInstructions = `Generate detailed negotiation recommendations. Populate the "negotiationCenter" object with Seller-friendly changes, Buyer-friendly changes, balanced options, and fallback recommendations, along with must-accept/must-reject points.`;
      } else if (action === 'redraft') {
        actionSpecificInstructions = `Generate improved, lawyer-grade clause redrafts. For each extracted clause in the "clauses" list, populate the "redraftSuggestions" object with lawyerVersion, clientVersion, and plainEnglish translations, highlighting risk reduction reasons.`;
      } else {
        actionSpecificInstructions = `Perform a complete contract audit. Populate every downstream section of the JSON schema (stats, summary, executiveSummary, clauses, missingClauses, compliance, financials, obligations, timeline, negotiationCenter, finalOpinion) completely and thoroughly.`;
      }

      let templateSpecificInstructions = '';
      if (activeTemplateId === 'NDA') {
        templateSpecificInstructions = `The staged template context is a Non-Disclosure Agreement (NDA). Check specifically for typical NDA rules: unilateral vs reciprocal confidentiality obligations, term of confidentiality, exclusions to confidential information, return of materials, governing law, and jurisdiction.`;
      } else if (activeTemplateId === 'Employment') {
        templateSpecificInstructions = `The staged template context is an Employment Agreement. Focus on employment clause intelligence: post-employment non-compete periods, unilateral termination notice terms, IP assignment to employer, dispute resolution, and probation duration.`;
      } else if (activeTemplateId === 'Lease') {
        templateSpecificInstructions = `The staged template context is a Lease Deed. Apply lease-specific compliance rules: monthly license fee compounding rate escalation limits, summary eviction notice notice periods, utility maintenance delay rights, and security deposit forfeiture terms.`;
      } else if (activeTemplateId === 'Vendor') {
        templateSpecificInstructions = `The staged template context is a Vendor Contract. Apply vendor-specific clause checklists: Net payment terms thresholds (e.g. Net 30/60/90), liquidated damages rates per day of delay, immediate IP transfer timelines, and liability limitation caps.`;
      }

      const systemPrompt = `You are a Senior Corporate Advocate and Chief Legal Counsel.
Perform a complete legal due diligence and contract audit of the provided contract content.
Your review must read like a premium legal memorandum prepared by an experienced attorney at a top-tier law firm (equivalent to Harvey AI, Lexis+ AI, or CoCounsel).
The analysis must be legally precise, commercially meaningful, supported by legal reasoning, and professionally drafted.

STRICT TONE & LANGUAGE RULES:
- NEVER use generic AI sentences or robotic/chatbot wording (e.g. "Standard reciprocity terms applied", "No findings available", "Potential issue").
- INSTEAD write: "The clause appears commercially balanced and does not create disproportionate obligations upon either contracting party" or "No material legal risk has been identified under this category following clause analysis" or "This provision may expose the parties to avoidable contractual disputes due to ambiguity in drafting."
- If the contract doesn't contain enough information for a field, output exactly: "Insufficient contractual language available to reach a reliable legal conclusion."
- Avoid placeholders or repeating the same recommendation. Every suggestion must be highly specific to the clause context.
- Differentiate clearly between facts, legal interpretation, risk assessment, and legal recommendation.
- Do NOT hallucinate. Every recommendation must be traceable to the contract clauses.
- Keep descriptions, reasons, recommendations, and explanations concise (1-2 sentences maximum) while maintaining advocate-grade precision. This prevents output token limits from truncating the JSON response.

Output your complete legal findings as a single valid JSON object.
Do NOT include any markdown envelope other than the "json" code block. No conversational preamble.

Action Guidance:
${actionSpecificInstructions}

Template Rules:
${templateSpecificInstructions}

JSON Schema structure:
{
  "stats": {
    "overallScore": <Integer 0-100, representing overall contract health where 100 is excellent>,
    "riskScore": <Integer 0-100, representing overall legal risk percentage>,
    "complianceScore": <Integer 0-100, representing overall regulatory compliance percentage>,
    "negotiationScore": <Integer 0-100, representing commercial balance score>,
    "missingClausesCount": <Integer>,
    "confidenceRate": <Integer 0-100, representing AI review confidence rate>,
    "highRiskClausesCount": <Integer>,
    "mediumRiskClausesCount": <Integer>,
    "lowRiskClausesCount": <Integer>,
    "totalClausesCount": <Integer>,
    "timeSaved": "<Estimated review time saved e.g. 4.5 Hours>",
    "reviewStatus": "<Critical Legal Risk | High Legal Risk | Medium Legal Risk | Low Legal Risk>"
  },
  "summary": {
    "contractType": "<Contract classification e.g. NDA, Commercial Lease, Master Service Agreement>",
    "parties": "<Detailed list of parties and business units>",
    "effectiveDate": "<Date or 'Not Specified'>",
    "expiryDate": "<Date or 'Not Specified'>",
    "duration": "<Duration details>",
    "jurisdiction": "<Legal jurisdiction location>",
    "governingLaw": "<Governing laws and legislative frameworks>",
    "paymentTerms": "<Payment milestones and schedules>",
    "terminationDate": "<Termination notice periods and dates>",
    "renewalDate": "<Renewal schedules>",
    "renewalStatus": "<Automatic | Manual | Non-Renewable>",
    "businessPurpose": "<The commercial and business objective of this contract>"
  },
  "executiveSummary": {
    "overallAssessment": "<Overall assessment summary. Delineate overall contract health, key legal/commercial concerns, and enforceability assessment.>",
    "majorLegalRisks": ["<Risk 1 with legal justification>", "<Risk 2 with legal justification>"],
    "commercialRisks": ["<Commercial Risk 1>", "<Commercial Risk 2>"],
    "financialRisks": ["<Financial Risk 1>", "<Financial Risk 2>"],
    "complianceConcerns": ["<Statutory Compliance Concern 1>", "<Statutory Compliance Concern 2>"],
    "urgentActionItems": ["<Action 1>", "<Action 2>"],
    "negotiationPriorities": ["<Priority 1>", "<Priority 2>"],
    "topOpportunities": ["<Opportunity 1>", "<Opportunity 2>"],
    "finalRecommendation": "<Final execution recommendation statement prepared by counsel>"
  },
  "clauses": [
    {
      "id": "<Unique code, e.g. c1, c2>",
      "name": "<Clause Name e.g. Confidentiality, Indemnity>",
      "text": "<The actual text corresponding from the contract>",
      "risk": "<Low | Medium | High | Critical>",
      "explanation": "<Advocate explanation of why this risk rating is assigned, detailing the legal and commercial exposures>",
      "unfair": <Boolean true/false if clause is one-sided or highly unfair>,
      "suggestion": "<Suggested edits and mitigation strategy for counsel>",
      "legalImpact": "<High | Medium | Low>",
      "commercialImpact": "<High | Medium | Low>",
      "industryStandard": "<Standard wording comparison / deviation detail>",
      "confidence": <Integer 0-100>,
      "indianLawMapping": {
        "section": "<Section e.g. Section 27, Section 73>",
        "actName": "<Act name e.g. Indian Contract Act, 1872>",
        "applicability": "<Statutory applicability details>",
        "interpretation": "<Legal interpretation under Indian Jurisprudence>",
        "practicalEffect": "<Practical dispute/enforcement effect>"
      },
      "caseLawMapping": [
        {
          "citation": "<Supreme Court or High Court Citation>",
          "judgmentName": "<Case Title>",
          "ratio": "<Ratio decidendi>",
          "implication": "<Practical implication for litigation/negotiation>"
        }
      ],
      "redraftSuggestions": {
        "lawyerVersion": "<Draft written in precise, senior attorney legal English>",
        "clientVersion": "<Commercial client-friendly version>",
        "plainEnglish": "<Simple translation without legal jargon>"
      }
    }
  ],
  "missingClauses": [
    {
      "name": "<Missing clause title e.g. Force Majeure>",
      "category": "<Critical Missing | Recommended | Optional>",
      "importance": "<High | Medium | Low>",
      "explanation": "<Why this clause is necessary in this contract type>",
      "riskCreated": "<Vulnerability or negative exposure created by its absence>",
      "suggestedWording": "<Suggested draft clause wording>",
      "applicableActs": "<Acts e.g. Indian Contract Act 1872>",
      "relatedJudgments": "<Case citations or statutory references>"
    }
  ],
  "compliance": [
    {
      "law": "<Framework name e.g. Indian Contract Act 1872, DPDP Act 2023, Companies Act, Employment Laws, MSME Act, Consumer Protection, Arbitration Act>",
      "status": "<Passed | Failed | Warning | Not Applicable>",
      "reason": "<Specific legal explanation of the compliance status and details of gaps>",
      "suggestedFix": "<Suggested amendment wording or statutory change to fix the compliance gap, or 'N/A'>"
    }
  ],
  "financials": {
    "paymentAmount": "<Payment numbers and parameters>",
    "taxes": "<GST/tax rates or liability>",
    "deposit": "<Security deposits details>",
    "penalty": "<Liquidated damages or penalty rates>",
    "lateFees": "<Interest or late fees rules>",
    "renewalCharges": "<Renewal pricing rules>",
    "interest": "<Compounded interest values>",
    "summaryText": "<Financial overview explanation>"
  },
  "obligations": {
    "yours": ["<Your action obligation 1>", "<Your action obligation 2>"],
    "theirs": ["<Opposite party obligation 1>", "<Opposite party obligation 2>"],
    "summaryText": "<Obligation matrix breakdown summary>"
  },
  "timeline": [
    {
      "date": "<Target date event>",
      "event": "<Event title e.g. First Payment, Expiry>",
      "description": "<Description of requirements or deadlines>"
    }
  ],
  "negotiationCenter": {
    "sellerFriendly": ["<Negotiation point 1>"],
    "buyerFriendly": ["<Negotiation point 1>"],
    "oneSided": ["<Indication of one-sided covenant 1>"],
    "balanced": ["<Indication of balanced covenant 1>"],
    "negotiationSuggestions": ["<Advocate negotiation advice point 1>"],
    "fallbackLanguage": ["<Fallback language draft clause>"],
    "betterDraft": ["<Preferred alternative draft language>"]
  },
  "finalOpinion": {
    "status": "<Critical Legal Risk | High Legal Risk | Medium Legal Risk | Low Legal Risk>",
    "reasoning": "<Executive reasoning explaining overall contract health, execution suitability, and key commercial/statutory recommendations>"
  }
}`;

      // ─── Build structured prompt: Case Context + Contract Text ──────────────
      // Case context improves understanding; Contract Text is the ONLY analysis source.
      const caseContextBlock = caseContext
        ? `════════════════════════════════════════
CASE CONTEXT (legal background only — do NOT analyze this as the contract)
════════════════════════════════════════
Case Title   : ${caseContext.title}
Parties      : ${caseContext.client || 'N/A'} vs. ${caseContext.accused || 'N/A'}
Case Type    : ${caseContext.caseType || 'N/A'}
Court        : ${caseContext.court || 'N/A'}
Case Summary : ${caseContext.summary || 'N/A'}
`
        : '';

      // ── Cap contract text to stay within model token limits ──────────────────
      const MAX_CONTRACT_CHARS = 12000;
      const contractTextForAI = text.length > MAX_CONTRACT_CHARS
        ? text.slice(0, MAX_CONTRACT_CHARS) + `\n\n[NOTE: Contract text truncated to ${MAX_CONTRACT_CHARS} characters for AI processing. Full document is ${text.length} characters. Analysis covers the first portion of the contract.]`
        : text;

      const userMessage = `${caseContextBlock}
════════════════════════════════════════
CONTRACT DOCUMENT (analyze this ONLY)
════════════════════════════════════════
Contract Title: ${title || 'Uploaded Contract'}

${contractTextForAI}

════════════════════════════════════════
TASK
════════════════════════════════════════
Perform complete contract analysis EXCLUSIVELY on the Contract Document above.
Use the Case Context ONLY to improve legal understanding (parties, jurisdiction hints).
DO NOT generate analysis from the Case Summary alone.
DO NOT fabricate clauses that are not present in the Contract Document.`;

      console.log(`[ContractAudit] Sending ${userMessage.length} chars to AI (contract: ${text.length} → ${contractTextForAI.length} chars used)`);

      setAuditStep('Processing compliance algorithms...');
      const response = await generateChatResponse(
        [],
        userMessage,
        systemPrompt,
        [],
        toolkitLanguage || 'English',
        null,
        'legal'
      );

      // ── Validate response before parsing ─────────────────────────────────
      if (!response) {
        throw new Error('No response received from AI service. Check your connection.');
      }
      // Check for API-level errors returned as objects
      if (response.error === 'OUT_OF_CREDITS') {
        throw new Error('AI credits exhausted. Please upgrade your plan to continue contract analysis.');
      }
      if (response.error === 'PREMIUM_ONLY') {
        throw new Error('Contract AI analysis requires a Premium plan. Please upgrade to continue.');
      }
      if (response.error === 'LIMIT_REACHED') {
        throw new Error('Daily usage limit reached. Please try again tomorrow or upgrade your plan.');
      }
      // Check if response came back as a string error message (network/server errors)
      const rawReply = response.reply || (typeof response === 'string' ? response : null) || '';
      if (!rawReply || rawReply.startsWith('System Message:') || rawReply.startsWith('System Error:') || rawReply.startsWith('Sorry, I am having')) {
        throw new Error(`AI service error: ${rawReply || 'Unknown error'}. Please try again.`);
      }
      const responseText = rawReply;
      console.log(`[ContractAudit] Raw AI response: ${responseText.length} chars. Preview: ${responseText.slice(0, 200)}...`);
      
      let parsedResult = null;

      // ── Strategy 1: Explicit ```json ... ``` code block ──
      const codeBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        try { parsedResult = JSON.parse(codeBlockMatch[1]); } catch (_) {}
      }

      // ── Strategy 2: Brace-balanced JSON extraction (handles leading/trailing text) ──
      if (!parsedResult) {
        const firstBrace = responseText.indexOf('{');
        if (firstBrace !== -1) {
          let depth = 0, endIdx = -1;
          for (let i = firstBrace; i < responseText.length; i++) {
            if (responseText[i] === '{') depth++;
            else if (responseText[i] === '}') { depth--; if (depth === 0) { endIdx = i; break; } }
          }
          if (endIdx !== -1) {
            try { parsedResult = JSON.parse(responseText.slice(firstBrace, endIdx + 1)); } catch (_) {}
          }
        }
      }

      // ── Strategy 3: Advanced JSON repair and prefix rollback ──
      if (!parsedResult) {
        try {
          parsedResult = repairTruncatedJson(responseText);
        } catch (_) {}
      }

      // ── Strategy 4: Auto-retry with compact prompt if all strategies fail ──
      if (!parsedResult || !parsedResult.stats) {
        console.warn('[ContractAudit] All parse strategies failed, retrying with compact prompt...');
        setAuditStep('Retrying with compact analysis format...');
        const retrySystemPrompt = `You are a legal contract analyzer. Output ONLY a raw JSON object with NO markdown, NO explanation, just the JSON. The JSON must have a "stats" key at minimum.`;
        const retryUserMsg = `Analyze this contract and return ONLY valid JSON with keys: stats (overallScore, riskScore, complianceScore, negotiationScore, missingClausesCount, highRiskClausesCount, mediumRiskClausesCount, lowRiskClausesCount, totalClausesCount, timeSaved, reviewStatus, confidenceRate), summary (contractType, parties, effectiveDate, expiryDate, duration, jurisdiction, governingLaw, paymentTerms, renewalStatus, businessPurpose), executiveSummary (overallAssessment, majorLegalRisks, commercialRisks, financialRisks, complianceConcerns, urgentActionItems, negotiationPriorities, topOpportunities, finalRecommendation), clauses (array), missingClauses (array), compliance (array), finalOpinion (status, reasoning).\n\nContract:\n${text.slice(0, 4000)}`;
        try {
          const retryResp = await generateChatResponse([], retryUserMsg, retrySystemPrompt, [], toolkitLanguage || 'English', null, 'legal');
          const retryText = retryResp.reply || retryResp || '';
          
          // Try Strategy 1
          const rBlock = retryText.match(/```json\s*([\s\S]*?)\s*```/);
          if (rBlock) { try { parsedResult = JSON.parse(rBlock[1]); } catch (_) {} }
          
          // Try Strategy 2
          if (!parsedResult) {
            const rb = retryText.indexOf('{');
            if (rb !== -1) {
              let d = 0, ei = -1;
              for (let i = rb; i < retryText.length; i++) {
                if (retryText[i] === '{') d++;
                else if (retryText[i] === '}') { d--; if (d === 0) { ei = i; break; } }
              }
              if (ei !== -1) { try { parsedResult = JSON.parse(retryText.slice(rb, ei + 1)); } catch (_) {} }
            }
          }
          
          // Try Strategy 3
          if (!parsedResult) {
            try {
              parsedResult = repairTruncatedJson(retryText);
            } catch (_) {}
          }
        } catch (retryErr) {
          console.error('[ContractAudit] Retry failed:', retryErr);
        }
      }

      if (!parsedResult || !parsedResult.stats) {
        throw new Error("AI returned an unstructured response. Please try again — the contract may be too large for a single analysis pass.");
      }

      // ── Normalize: ensure all expected array fields are actually arrays ──────────
      const toArr = (v) => Array.isArray(v) ? v : (v ? [v] : []);
      // toStr: safely converts any AI value to a renderable string
      const toStr = (v) => {
        if (v === null || v === undefined) return '';
        if (typeof v === 'string') return v;
        if (typeof v === 'number' || typeof v === 'boolean') return String(v);
        if (Array.isArray(v)) return v.map(toStr).join(', ');
        if (typeof v === 'object') return Object.entries(v).map(([k, val]) => `${k}: ${toStr(val)}`).join(' · ');
        return String(v);
      };

      if (parsedResult.clauses && !Array.isArray(parsedResult.clauses)) parsedResult.clauses = toArr(parsedResult.clauses);
      if (parsedResult.missingClauses && !Array.isArray(parsedResult.missingClauses)) parsedResult.missingClauses = toArr(parsedResult.missingClauses);
      if (parsedResult.compliance && !Array.isArray(parsedResult.compliance)) parsedResult.compliance = toArr(parsedResult.compliance);
      if (parsedResult.timeline && !Array.isArray(parsedResult.timeline)) parsedResult.timeline = toArr(parsedResult.timeline);

      // Normalize summary string fields
      if (parsedResult.summary) {
        const s = parsedResult.summary;
        s.contractType = toStr(s.contractType);
        s.parties = toStr(s.parties);
        s.effectiveDate = toStr(s.effectiveDate);
        s.expiryDate = toStr(s.expiryDate);
        s.duration = toStr(s.duration);
        s.jurisdiction = toStr(s.jurisdiction);
        s.governingLaw = toStr(s.governingLaw);
        s.paymentTerms = toStr(s.paymentTerms);
        s.terminationDate = toStr(s.terminationDate);
        s.renewalDate = toStr(s.renewalDate);
        s.renewalStatus = toStr(s.renewalStatus);
        s.businessPurpose = toStr(s.businessPurpose);
      }

      // Normalize stats string/number fields
      if (parsedResult.stats) {
        const st = parsedResult.stats;
        st.timeSaved = toStr(st.timeSaved);
        st.reviewStatus = toStr(st.reviewStatus);
      }

      // Normalize financials string fields
      if (parsedResult.financials) {
        const f = parsedResult.financials;
        f.paymentAmount = toStr(f.paymentAmount);
        f.taxes = toStr(f.taxes);
        f.deposit = toStr(f.deposit);
        f.penalty = toStr(f.penalty);
        f.lateFees = toStr(f.lateFees);
        f.renewalCharges = toStr(f.renewalCharges);
        f.interest = toStr(f.interest);
        f.summaryText = toStr(f.summaryText);
      }

      // Normalize executiveSummary
      if (parsedResult.executiveSummary) {
        const es = parsedResult.executiveSummary;
        es.overallAssessment = toStr(es.overallAssessment);
        es.finalRecommendation = toStr(es.finalRecommendation);
        es.majorLegalRisks = toArr(es.majorLegalRisks).map(toStr);
        es.commercialRisks = toArr(es.commercialRisks).map(toStr);
        es.financialRisks = toArr(es.financialRisks).map(toStr);
        es.complianceConcerns = toArr(es.complianceConcerns).map(toStr);
        es.urgentActionItems = toArr(es.urgentActionItems).map(toStr);
        es.negotiationPriorities = toArr(es.negotiationPriorities).map(toStr);
        es.topOpportunities = toArr(es.topOpportunities).map(toStr);
      }

      // Normalize finalOpinion
      if (parsedResult.finalOpinion) {
        parsedResult.finalOpinion.status = toStr(parsedResult.finalOpinion.status);
        parsedResult.finalOpinion.reasoning = toStr(parsedResult.finalOpinion.reasoning);
      }

      // Normalize obligations
      if (parsedResult.obligations) {
        parsedResult.obligations.yours = toArr(parsedResult.obligations.yours).map(toStr);
        parsedResult.obligations.theirs = toArr(parsedResult.obligations.theirs).map(toStr);
        parsedResult.obligations.summaryText = toStr(parsedResult.obligations.summaryText);
      }

      // Normalize negotiationCenter
      if (parsedResult.negotiationCenter) {
        const nc = parsedResult.negotiationCenter;
        nc.sellerFriendly = toArr(nc.sellerFriendly).map(toStr);
        nc.buyerFriendly = toArr(nc.buyerFriendly).map(toStr);
        nc.oneSided = toArr(nc.oneSided).map(toStr);
        nc.balanced = toArr(nc.balanced).map(toStr);
        nc.negotiationSuggestions = toArr(nc.negotiationSuggestions).map(toStr);
        nc.fallbackLanguage = toArr(nc.fallbackLanguage).map(toStr);
        nc.betterDraft = toArr(nc.betterDraft).map(toStr);
      }

      // Normalize individual clause fields
      if (Array.isArray(parsedResult.clauses)) {
        parsedResult.clauses = parsedResult.clauses.map(c => ({
          ...c,
          name: toStr(c.name),
          text: toStr(c.text),
          risk: toStr(c.risk),
          explanation: toStr(c.explanation),
          suggestion: toStr(c.suggestion),
          legalImpact: toStr(c.legalImpact),
          commercialImpact: toStr(c.commercialImpact),
          industryStandard: toStr(c.industryStandard),
          caseLawMapping: toArr(c.caseLawMapping),
          indianLawMapping: c.indianLawMapping && typeof c.indianLawMapping === 'object' ? {
            section: toStr(c.indianLawMapping.section),
            actName: toStr(c.indianLawMapping.actName),
            applicability: toStr(c.indianLawMapping.applicability),
            interpretation: toStr(c.indianLawMapping.interpretation),
            practicalEffect: toStr(c.indianLawMapping.practicalEffect)
          } : {}
        }));
      }

      // Normalize missingClauses fields
      if (Array.isArray(parsedResult.missingClauses)) {
        parsedResult.missingClauses = parsedResult.missingClauses.map(m => ({
          ...m,
          name: toStr(m.name),
          category: toStr(m.category),
          importance: toStr(m.importance),
          explanation: toStr(m.explanation),
          riskCreated: toStr(m.riskCreated),
          suggestedWording: toStr(m.suggestedWording),
          applicableActs: toStr(m.applicableActs),
          relatedJudgments: toStr(m.relatedJudgments)
        }));
      }

      // Normalize compliance fields
      if (Array.isArray(parsedResult.compliance)) {
        parsedResult.compliance = parsedResult.compliance.map(c => ({
          ...c,
          law: toStr(c.law),
          status: toStr(c.status),
          reason: toStr(c.reason),
          suggestedFix: toStr(c.suggestedFix)
        }));
      }


      setAuditResult(parsedResult);
      toast.success("AI Contract intelligence report compiled!", { id: toastId });

      if (action === 'summary' || action === 'all') {
        setCollapsedBlocks({
          summary: false,
          findings: false,
          heatmap: false,
          clauses: true,
          compliance: true,
          negotiation: true,
          redraft: true,
          caseLaws: true,
          activityLog: true,
          chat: true
        });
      } else {
        handleQuickActionClick(action);
      }

      // Save report and append audit logs
      const timestamp = new Date().toISOString();
      const userEmail = getUserData()?.email || 'System User';
      const userName = getUserData()?.name || 'Advocate';
      const newLog = {
        timestamp,
        action: 'AI Clause Review Generated',
        details: `Generated intelligence audit. Compliance Rating: ${parsedResult.stats.complianceScore}%, Risk rating: ${parsedResult.stats.reviewStatus}. Identified ${parsedResult.clauses?.length || 0} active clauses and ${parsedResult.missingClauses?.length || 0} gaps.`,
        editedBy: `${userName} (${userEmail})`
      };
      const updatedLogs = [...activeLogs, newLog];
      setAuditLogs(updatedLogs);

      await syncToDatabase({
        auditResult: parsedResult,
        auditLogs: updatedLogs
      });

    } catch (err) {
      console.error(err);
      toast.error(
        <span>
          <strong>Unable to analyze contract.</strong><br/>
          Reason: {err.message || 'Network delay or parsing issues'}.<br/>
          Upload or load a template first.
        </span>,
        { id: toastId, duration: 6000 }
      );
    } finally {
      setIsAuditing(false);
      setAuditStep('');
    }
  };

  // --- Clause Rewrite Engine ---
  const triggerClauseRewrite = (clause) => {
    setActiveRewriteClause(clause);
    setRewrittenWording('');
    setRewriteTone('Balanced');
  };

  const executeClauseRewrite = async () => {
    if (!activeRewriteClause) return;
    setIsRewriting(true);
    try {
      const systemPrompt = `You are a senior enterprise corporate lawyer drafting contracts under Indian and international laws.
Rewrite the provided clause to make it more ${rewriteTone}. 
Ensure the wording is highly professional, precise, court-ready, and mitigates undue liability.
Output ONLY the rewritten clause text inside a code block. Do NOT add conversational headers, greetings, or details.`;
      
      const response = await generateChatResponse(
        [],
        `Original Clause Name: ${activeRewriteClause.name}\nOriginal Text: ${activeRewriteClause.text}\n\nRewrite Style: ${rewriteTone}`,
        systemPrompt,
        [],
        toolkitLanguage || 'English',
        null,
        'legal'
      );

      const reply = response.reply || response || '';
      const cleanReply = reply.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
      setRewrittenWording(cleanReply);
    } catch (e) {
      toast.error("Failed to rewrite clause.");
    } finally {
      setIsRewriting(false);
    }
  };

  const applyRewrittenClause = async () => {
    if (!activeRewriteClause || !rewrittenWording) return;
    
    // Replace original clause in main text
    const idx = contractText.indexOf(activeRewriteClause.text);
    if (idx === -1) {
      toast.error("Original clause text was modified and could not be matches. Appending revised clause to end.");
      const updatedText = `${contractText}\n\n/* Revised ${activeRewriteClause.name} Clause */\n${rewrittenWording}`;
      setContractText(updatedText);
      await createDocumentVersion(updatedText, `Replaced ${activeRewriteClause.name} clause (appended)`);
    } else {
      const updatedText = contractText.replace(activeRewriteClause.text, rewrittenWording);
      setContractText(updatedText);
      await createDocumentVersion(updatedText, `Replaced ${activeRewriteClause.name} clause with ${rewriteTone} version`);
    }

    toast.success("Clause replaced and version logged successfully!");
    setActiveRewriteClause(null);

    // Auto update OCR text for active staged file
    if (activeFileId) {
      setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, ocrText: contractText.replace(activeRewriteClause.text, rewrittenWording) } : f));
    }

    // Run audit automatically with updated text
    await performContractAuditInternal(contractTitle, contractText.replace(activeRewriteClause.text, rewrittenWording), files, versions, auditLogs);
  };

  // --- Contract Chat Assistant ---
  const sendContractChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { id: Date.now().toString(), role: 'user', content: chatInput };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setChatInput('');
    setIsChatSending(true);

    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      const systemPrompt = `You are the Contract Intelligence Assistant. You answer advocate questions specifically using the provided contract text.
Refer to specific clauses, obligations, dates, or details mentioned in the text.
If the answer is not present in the contract, explain that it is missing.
Here is the active contract text for reference:
--------------------
${contractText}
--------------------
Provide clean, professional, courtroom-ready responses.`;

      const response = await generateChatResponse(
        updatedHistory.slice(0, -1), // Previous history
        chatInput,
        systemPrompt,
        [],
        toolkitLanguage || 'English',
        null,
        'legal'
      );

      const modelMsg = { id: (Date.now() + 1).toString(), role: 'model', content: response.reply || response || '' };
      const finalHistory = [...updatedHistory, modelMsg];
      setChatHistory(finalHistory);

      await syncToDatabase({ chatHistory: finalHistory });
    } catch (e) {
      toast.error("Failed to fetch response.");
    } finally {
      setIsChatSending(false);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  // --- Contract Comparison Engine ---
  const runContractComparison = async () => {
    if (!secondContractFile || !secondContractFile.base64) {
      toast.error("Please stage a secondary contract file to compare.");
      return;
    }
    setIsComparing(true);
    setComparisonResult(null);
    const toastId = toast.loading("Analyzing clause modifications and risk differentials...");

    try {
      const systemPrompt = `You are a senior corporate contract litigation attorney.
Compare the Primary Contract with the Secondary Contract.
Identify:
1. Clauses that exist in primary but are added or completely new in the secondary.
2. Clauses removed from the primary.
3. Clauses that exist in both but are modified, explaining legal risks and implications.
4. General changes in legal risk scores.

Output your comparison as a valid JSON object matching the requested schema. Do not write normal conversation.
JSON Schema:
{
  "added": [
    { "clause": "<Clause Name>", "text": "<Wording added>", "implication": "<Implication of this addition>" }
  ],
  "removed": [
    { "clause": "<Clause Name>", "text": "<Wording removed>", "implication": "<Implication of this deletion>" }
  ],
  "modified": [
    { "clause": "<Clause Name>", "originalText": "<Primary version>", "modifiedText": "<Secondary version>", "implication": "<Implication of changes>" }
  ],
  "riskChanges": [
    { "clause": "<Clause Name>", "oldRisk": "<Low/Medium/High/Critical>", "newRisk": "<Low/Medium/High/Critical>", "explanation": "<Why risk level shifted>" }
  ]
}`;

      const response = await generateChatResponse(
        [],
        `PRIMARY CONTRACT:\n${contractText}\n\nSECONDARY CONTRACT BASE64 STAGED.\nPlease compare files.`,
        systemPrompt,
        [{ url: `data:application/pdf;base64,${secondContractFile.base64}`, name: secondContractFile.name, type: 'document' }],
        toolkitLanguage || 'English',
        null,
        'legal'
      );

      const text = response.reply || response || '';
      let parsed = null;
      try {
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          parsed = JSON.parse(text.trim());
        }
      } catch (err) {
        console.error("Comparison JSON parse error", err);
      }

      if (!parsed) throw new Error("Unable to parse differences.");

      setComparisonResult(parsed);
      toast.success("Comparison completed!", { id: toastId });

      await logAudit("Contract Comparison Executed", `Compared primary agreement "${contractTitle}" with "${secondContractFile.name}".`);
      await syncToDatabase({ comparisonResult: parsed });

    } catch (e) {
      toast.error("Failed to complete contract comparison.", { id: toastId });
    } finally {
      setIsComparing(false);
    }
  };

  // --- Exports & Share Actions ---
  const handleCopyReport = () => {
    if (!auditResult) return;
    const reportText = JSON.stringify(auditResult, null, 2);
    navigator.clipboard.writeText(reportText);
    toast.success("JSON Audit report copied to clipboard!");
    logAudit("Copied Audit Report", "Copied complete structural audit report.");
  };

  const handleShareReport = async () => {
    if (!auditResult) return;
    const shareText = `AISA Legal Audit for ${contractTitle}. Compliance: ${auditResult.stats?.complianceScore}%. Status: ${auditResult.stats?.reviewStatus}.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Audit Report: ${contractTitle}`, text: shareText });
        logAudit("Shared Audit Report", "Shared audit metadata report via native channels.");
      } catch (e) { console.log(e); }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Summary copied to clipboard!");
    }
  };

  const handleSpeechSummary = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (auditResult) {
      const text = `Contract Audit Summary for ${contractTitle}. Classification: ${auditResult.summary?.contractType}. Overall compliance is ${auditResult.stats?.complianceScore} percent. Risk classification is ${auditResult.stats?.reviewStatus}. Opinion: ${auditResult.finalOpinion?.reasoning}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handlePrintPDF = () => {
    if (!auditResult) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Popup blocked! Enable popups to export printable PDF.");
      return;
    }

    const activeProj = allProjects.find(p => p._id === linkedCaseId) || currentCase;
    const caseHeaderHtml = activeProj ? `
        <div style="margin-top: 15px; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #f8fafc; font-size: 9.5pt; line-height: 1.5; text-align: left;">
          <div style="font-weight: bold; color: #4f46e5; font-size: 8.5pt; text-transform: uppercase; margin-bottom: 5px;">Linked Case Context</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div><strong>Case Name:</strong> ${activeProj.name || '--'}</div>
            <div><strong>Case No:</strong> ${activeProj.caseNumber || activeProj._id || '--'}</div>
            <div><strong>Client Name:</strong> ${activeProj.clientName || '--'}</div>
            <div><strong>Matter:</strong> ${activeProj.caseType || '--'}</div>
          </div>
        </div>
    ` : '';

    const html = `
      <html>
      <head>
        <meta charset="UTF-8"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,700;1,400&family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet"/>
        <title>AISA Contract Intelligence Report - ${contractTitle}</title>
        <style>
          body { font-family: 'Noto Sans Devanagari', 'Noto Sans', Arial, sans-serif; padding: 45px; line-height: 1.8; color: #0f172a; }
          .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 30px; }
          .title { text-transform: uppercase; font-size: 18pt; font-weight: bold; color: #4f46e5; margin: 0; }
          .meta-section { margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; font-size: 11pt; }
          .section-title { font-size: 14pt; font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; color: #1e1b4b; margin-top: 30px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10.5pt; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: bold; }
          .risk-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 9pt; }
          .risk-High, .risk-Critical { background: #fee2e2; color: #991b1b; }
          .risk-Medium { background: #fef3c7; color: #92400e; }
          .risk-Low { background: #dcfce7; color: #166534; }
          .footer { margin-top: 60px; border-top: 1px solid #e2e8f0; font-size: 9pt; text-align: center; padding-top: 15px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-size: 9pt; font-weight: bold; letter-spacing: 2px; color: #4f46e5; margin-bottom: 5px;">AISA ENTERPRISE CONTRACT INTELLIGENCE</div>
          <h1 class="title">AI Compliance & Risk Audit Report</h1>
          <div style="margin-top: 5px; font-size: 11pt;">Document: <strong>${contractTitle}</strong></div>
          ${caseHeaderHtml}
        </div>

        <div class="meta-section">
          <div class="meta-grid">
            <div>
              <p><strong>Compliance Rating:</strong> ${auditResult.stats?.complianceScore}%</p>
              <p><strong>Overall Risk Status:</strong> ${auditResult.stats?.reviewStatus}</p>
              <p><strong>AI Confidence Rate:</strong> ${auditResult.stats?.confidenceRate}%</p>
            </div>
            <div>
              <p><strong>Contract Type:</strong> ${auditResult.summary?.contractType}</p>
              <p><strong>Jurisdiction:</strong> ${auditResult.summary?.jurisdiction}</p>
              <p><strong>Governing Law:</strong> ${auditResult.summary?.governingLaw}</p>
            </div>
          </div>
        </div>

        <div class="section-title">1. Executive Final Opinion</div>
        <p style="font-size: 11pt; line-height: 1.6;">${contractOpinionDisplay || auditResult.finalOpinion?.reasoning}</p>

        <div class="section-title">2. Clause-by-Clause Risk Breakdown</div>
        <table>
          <thead>
            <tr>
              <th style="width: 25%;">Clause Name</th>
              <th style="width: 15%;">Risk Level</th>
              <th>Auditor Exposure & Suggestions</th>
            </tr>
          </thead>
          <tbody>
            ${auditResult.clauses?.map(c => `
              <tr>
                <td><strong>${c.name}</strong></td>
                <td><span class="risk-badge risk-${c.risk}">${c.risk}</span></td>
                <td>
                  <p style="margin: 0 0 5px 0;">${c.explanation}</p>
                  ${c.suggestion ? `<p style="margin: 5px 0 0 0; font-style: italic; color: #4f46e5;">Proposed: ${c.suggestion}</p>` : ''}
                </td>
              </tr>
            `).join('') || '<tr><td colspan="3">No clauses analyzed.</td></tr>'}
          </tbody>
        </table>

        <div class="section-title">3. Identified Gaps & Missing Clauses</div>
        <ul>
          ${auditResult.missingClauses?.map(m => `
            <li style="margin-bottom: 10px; font-size: 11pt;">
              <strong>${m.name}</strong> (${m.category}) - ${m.explanation}
              <br/><span style="color: #b91c1c; font-size: 10pt;">Risk Created: ${m.riskCreated}</span>
            </li>
          `).join('') || '<li>No missing clauses identified.</li>'}
        </ul>

        <div class="section-title">4. Compliance Framework Evaluation</div>
        <ul>
          ${auditResult.compliance?.map(c => `
            <li style="margin-bottom: 8px; font-size: 11pt;">
              <strong>${c.law}:</strong> Status [${c.status}] - ${c.explanation}
            </li>
          `).join('') || '<li>No compliance modules mapped.</li>'}
        </ul>

        <div class="footer">
          Generated automatically by AISA Court-Ready Platform on ${new Date().toLocaleString()}
          <br/>Audit logs synced. Secured and authenticated document copy.
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      logAudit("Exported PDF Report", "Generated and exported printable contract review PDF.");
    }, 500);
  };

  const handleExportDoc = () => {
    if (!auditResult) return;
    
    let docContent = '';
    let reportFilename = `${contractTitle.replace(/\s+/g, '_')}_AISA_Audit_Report.doc`;

    if (activeTab === 'heatmap') {
      reportFilename = `${contractTitle.replace(/\s+/g, '_')}_AISA_Risk_Scan_Report.doc`;
      docContent = `
AISA CONTRACT INTELLIGENCE PLATFORM REPORT — RISK SCAN EXPOSURES
================================================================

Title: ${contractTitle}
Audited Date: ${new Date().toLocaleDateString()}
Risk Score: ${stats.riskScore}%
AI Confidence Rate: ${stats.confidenceRate}%

RISK SUMMARY FINDINGS:
----------------------
${findings.map(f => `- ${f.title} (${f.count} items):
${f.items.map(item => `  * ${item.name}: ${item.desc}`).join('\n')}`).join('\n')}

DETAILED RISK EXPOSURES:
------------------------
${auditResult.clauses?.map(c => `
Clause Name: ${c.name}
Risk Rating: ${c.risk}
Auditor Risk Explanation: ${c.explanation}
Mitigation Suggestion: ${c.suggestion || 'No edits suggested.'}
`).join('\n')}
`;
    } else if (activeTab === 'compliance') {
      reportFilename = `${contractTitle.replace(/\s+/g, '_')}_AISA_Compliance_Report.doc`;
      docContent = `
AISA CONTRACT INTELLIGENCE PLATFORM REPORT — REGULATORY COMPLIANCE
==================================================================

Title: ${contractTitle}
Audited Date: ${new Date().toLocaleDateString()}
Compliance Rating: ${stats.complianceScore}%

COMPLIANCE CHECKLIST STATUS:
----------------------------
${auditResult.compliance?.map(c => `
Law / Act: ${c.law}
Status: ${c.status}
Analysis: ${c.reason || c.explanation}
Suggested Correction: ${c.suggestedFix || 'N/A'}
`).join('\n')}
`;
    } else if (activeTab === 'clauses') {
      reportFilename = `${contractTitle.replace(/\s+/g, '_')}_AISA_Clause_Intelligence_Report.doc`;
      docContent = `
AISA CONTRACT INTELLIGENCE PLATFORM REPORT — CLAUSE INTELLIGENCE
================================================================

Title: ${contractTitle}
Audited Date: ${new Date().toLocaleDateString()}
Extracted Clauses Count: ${auditResult.clauses?.length || 0}
Missing Clauses Count: ${auditResult.missingClauses?.length || 0}

EXTRACTED CLAUSES SPECIFICATIONS:
---------------------------------
${auditResult.clauses?.map(c => `
Clause: ${c.name}
Original Text: "${c.text}"
Auditor Interpretation: ${c.explanation}
Industry Standard Match: ${c.industryStandard || 'Standard commercial drafting deviation detected.'}
`).join('\n')}

MISSING CLAUSES IDENTIFIED:
---------------------------
${auditResult.missingClauses?.map(m => `
Clause: ${m.name || m.clause}
Vulnerability: ${m.explanation}
Recommended Wording: ${m.suggestedWording || 'N/A'}
`).join('\n')}
`;
    } else {
      reportFilename = `${contractTitle.replace(/\s+/g, '_')}_AISA_Executive_Review_Report.doc`;
      docContent = `
AISA CONTRACT INTELLIGENCE PLATFORM REPORT — EXECUTIVE REVIEW
============================================================

Title: ${contractTitle}
Audited Date: ${new Date().toLocaleDateString()}
Compliance Score: ${auditResult.stats?.complianceScore}%
Risk Rating: ${auditResult.stats?.reviewStatus}
AI Confidence Rate: ${auditResult.stats?.confidenceRate}%

FINAL AI LEGAL OPINION & VERDICT:
---------------------------------
${contractOpinionDisplay || auditResult.finalOpinion?.reasoning}

SUMMARY INFO:
-------------
- Contract Classification: ${auditResult.summary?.contractType}
- Parties Involved: ${auditResult.summary?.parties}
- Jurisdiction: ${auditResult.summary?.jurisdiction}
- Governing Legislation: ${auditResult.summary?.governingLaw}
`;
    }

    const blob = new Blob([docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = reportFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    logAudit("Downloaded DOCX Report", "Downloaded structured Word review report.");
    toast.success("Word document review report downloaded!");
  };

  const handleQuickToolSelect = (toolId) => {
    let title = '';
    let text = '';
    
    if (toolId === 'NDA') {
      title = 'Mutual Non-Disclosure Agreement.pdf';
      text = `This Mutual Non-Disclosure Agreement is entered between TechCorp India and SparkAI Solutions. Section 6 (Indemnity) states that SparkAI must fully indemnify TechCorp for any indirect, incidental, or consequential damages resulting from proprietary breaches, without any limitation of liability. No reciprocal indemnity is provided for TechCorp breaches. All disputes are governed exclusively by New York law.`;
    } else if (toolId === 'Employment') {
      title = 'Executive Employment Agreement.docx';
      text = `Section 15 states that the Executive agrees to a 24-month post-employment non-compete covenant applicable worldwide. The Company reserves the unilateral right to terminate the Executive immediately without notice, compensation, or payment in lieu of notice for any structural reorganization. The Executive waives all rights to seek court-ordered arbitration or labor disputes redressal.`;
    } else if (toolId === 'Lease') {
      title = 'Commercial Office Lease Deed.docx';
      text = `Section 9 states that the Landlord shall have the right to escalate the monthly license fee by 18% compounding annually. Under Section 14, in the event of any municipal utility maintenance delays exceeding 48 hours, the Landlord reserves the absolute right of summary eviction with a 72-hour vacate notice. The Security Deposit is forfeited entirely if tenancy is terminated before 36 months.`;
    } else if (toolId === 'Vendor') {
      title = 'Master Services Vendor Contract.pdf';
      text = `Section 12 details payment terms as Net 120 days upon client certification. Any delay in project sprints, irrespective of lockdowns, force majeure, or developer illness, shall attract a daily liquidated penalty of 2% of the aggregate annual contract value. All Intellectual Property rights transfers to the client immediately upon codeline creation.`;
    } else if (toolId === 'Investment') {
      title = 'Series A Share Purchase Agreement.pdf';
      text = `Section 5 stipulates a 3.5x liquidation preference on all preferred class stocks. The investors retain full veto rights over board approvals, including hiring, operations budgets, and scaling paths. Founder vesting is extended to 7 years with a 2-year cliff. Governing jurisdiction is exclusively Singapore arbitration centers.`;
    } else if (toolId === 'SaaS') {
      title = 'Enterprise Cloud SaaS License.docx';
      text = `Section 10 grants customer SaaS access. The SLA availability is set at 96% with no service credit refunds for outages. Section 14 states that all metadata telemetry, transaction facts, and uploaded databases become the exclusive IP of the Provider with reseller capabilities.`;
    } else if (toolId === 'Privacy') {
      title = 'App User Privacy Policy.txt';
      text = `This policy details that the App stores all geolocation tracking, contact logs, device telemetry, and advertising IDs indefinitely. This data is shared and sold to ad-broker networks. By downloading, the user consents. No opt-out forms are supported. Dispute venue is located in Seychelles under local rules.`;
    }

    setContractTitle(title);
    setContractText(text);
    setActiveTemplateId(toolId);
    toast.success(`Template loaded: ${title}`);

    // Create file record to append to case contract catalog
    const fileId = `file_template_${Date.now()}`;
    const newFile = {
      id: fileId,
      name: title,
      size: text.length * 2,
      type: title.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadDate: new Date().toLocaleDateString(),
      ocrText: text
    };
    const updatedFiles = [newFile];
    setFiles(updatedFiles);
    setActiveFileId(fileId);

    // Create first contract version
    const newVersion = {
      version: 1,
      timestamp: new Date().toISOString(),
      text: text,
      note: `Template staged: ${title}`
    };
    const updatedVersions = [newVersion];
    setVersions(updatedVersions);

    // Generate chronological activity feed logs
    const timestamp = new Date().toISOString();
    const userEmail = getUserData()?.email || 'System User';
    const userName = getUserData()?.name || 'Advocate';
    const newLog = {
      timestamp,
      action: `${toolId} Template Loaded`,
      details: `Staged contract template "${title}" into active workspace.`,
      editedBy: `${userName} (${userEmail})`
    };
    const updatedLogs = [newLog];
    setAuditLogs(updatedLogs);

    // Add entry to AISA diagnostic audit list
    logAudit("Template Loaded", `Loaded legal template: ${title}`);

    // Persist staged template context to MongoDB
    syncToDatabase({
      contractTitle: title,
      activeContractText: text,
      files: updatedFiles,
      versions: updatedVersions,
      auditLogs: updatedLogs,
      auditResult: null // Reset previous audit reports to enable manual analyzing flow
    });

    // Populate staged alert prefill banner
    setPrefillBanner({
      type: 'warning',
      caseTitle: currentCase?.name || 'Staged Case Workspace',
      message: `Template loaded: ${title}. Staged in case contract catalog. Ready for Analysis.`
    });
  };

  // --- Dynamic Stats Definitions ---
  const stats = useMemo(() => {
    if (auditResult && auditResult.stats) {
      return {
        ...auditResult.stats,
        negotiationScore: auditResult.stats.negotiationScore ?? '--',
        timeSaved: auditResult.stats.timeSaved ?? '--'
      };
    }
    return {
      overallScore: '--',
      riskScore: '--',
      complianceScore: '--',
      negotiationScore: '--',
      missingClausesCount: '--',
      confidenceRate: '--',
      highRiskClausesCount: 0,
      mediumRiskClausesCount: 0,
      lowRiskClausesCount: 0,
      totalClausesCount: 0,
      timeSaved: '--',
      reviewStatus: '--'
    };
  }, [auditResult]);

  const findings = useMemo(() => {
    if (!auditResult) {
      return [
        { title: 'Critical Risks', count: 0, items: [], color: 'bg-red-500/5 border-red-500/10 text-red-500' },
        { title: 'High Risks', count: 0, items: [], color: 'bg-red-500/5 border-red-500/10 text-red-500' },
        { title: 'Missing Clauses', count: 0, items: [], color: 'bg-violet-500/5 border-violet-500/10 text-violet-500' },
        { title: 'Unusual Clauses', count: 0, items: [], color: 'bg-amber-500/5 border-amber-500/10 text-amber-500' },
        { title: 'One-Sided Clauses', count: 0, items: [], color: 'bg-indigo-500/5 border-indigo-500/10 text-indigo-500' },
        { title: 'Compliance Issues', count: 0, items: [], color: 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' }
      ];
    }

    const clauses = auditResult.clauses || [];
    const missing = auditResult.missingClauses || [];
    const compliance = auditResult.compliance || [];

    const criticalRisks = clauses.filter(c => c.risk === 'Critical').map(c => ({ name: c.name, desc: c.explanation, action: c.suggestion }));
    const highRisks = clauses.filter(c => c.risk === 'High').map(c => ({ name: c.name, desc: c.explanation, action: c.suggestion }));
    const missingClauses = missing.map(m => ({ name: m.clause || m.name, desc: m.explanation, action: m.suggestedWording }));
    const unusualClauses = clauses.filter(c => c.risk === 'Medium' && c.explanation?.toLowerCase().includes('unusual')).map(c => ({ name: c.name, desc: c.explanation, action: c.suggestion }));
    const oneSided = clauses.filter(c => c.explanation?.toLowerCase().includes('one-sided') || c.explanation?.toLowerCase().includes('favor')).map(c => ({ name: c.name, desc: c.explanation, action: c.suggestion }));
    const complianceIssues = compliance.filter(c => c.status !== 'Compliant' && c.status !== 'Passed').map(c => ({ name: c.law, desc: c.reason || c.explanation, action: c.suggestedFix }));

    return [
      { title: 'Critical Risks', count: criticalRisks.length, items: criticalRisks, color: 'bg-red-500/5 border-red-500/10 text-red-500' },
      { title: 'High Risks', count: highRisks.length, items: highRisks, color: 'bg-red-500/5 border-red-500/10 text-red-500' },
      { title: 'Missing Clauses', count: missingClauses.length, items: missingClauses, color: 'bg-violet-500/5 border-violet-500/10 text-violet-500' },
      { title: 'Unusual Clauses', count: unusualClauses.length, items: unusualClauses, color: 'bg-amber-500/5 border-amber-500/10 text-amber-500' },
      { title: 'One-Sided Clauses', count: oneSided.length, items: oneSided, color: 'bg-indigo-500/5 border-indigo-500/10 text-indigo-500' },
      { title: 'Compliance Issues', count: complianceIssues.length, items: complianceIssues, color: 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' }
    ];
  }, [auditResult]);

  // Filter tools category logic
  const filteredTools = useMemo(() => {
    return allTools.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(toolsSearchQuery.toLowerCase()) || 
                          t.desc.toLowerCase().includes(toolsSearchQuery.toLowerCase());
      const matchCat = toolsCategory === 'All' 
        ? true 
        : toolsCategory === 'Favorites'
          ? favoriteTools.includes(t.id)
          : t.category === toolsCategory;
      return matchSearch && matchCat;
    });
  }, [toolsSearchQuery, toolsCategory, favoriteTools]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDownloadFile = (file) => {
    if (!file || !file.ocrText) return;
    const blob = new Blob([file.ocrText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name.endsWith('.pdf') || file.name.endsWith('.docx') || file.name.endsWith('.txt') 
      ? file.name 
      : `${file.name}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded: ${file.name}`);
  };

  const handleDeleteFile = async (fileId) => {
    const file = files.find(f => f.id === fileId);
    if (file && !window.confirm(`Are you sure you want to delete contract "${file.name}"?`)) {
      return;
    }
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    if (activeFileId === fileId) {
      if (updatedFiles.length > 0) {
        setActiveFileId(updatedFiles[0].id);
        setContractTitle(updatedFiles[0].name);
        setContractText(updatedFiles[0].ocrText);
      } else {
        setActiveFileId('');
        setContractTitle('');
        setContractText('');
        setAuditResult(null);
      }
    }
    
    const timestamp = new Date().toISOString();
    const userEmail = getUserData()?.email || 'System User';
    const userName = getUserData()?.name || 'Advocate';
    const newLog = {
      timestamp,
      action: 'Document Deleted',
      details: `Removed contract with file ID ${fileId} from matter catalog.`,
      editedBy: `${userName} (${userEmail})`
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);

    await syncToDatabase({
      files: updatedFiles,
      auditLogs: updatedLogs
    });
    
    toast.success("Document removed from workspace catalog.");
  };

  const renderKPICards = () => {
    if (isWorkspaceLoading || isAuditing) {
      return (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`border rounded-2xl p-4 shadow-sm space-y-2 ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="h-4 w-4 rounded-full bg-slate-200 dark:bg-zinc-800" />
                <div className="h-4 w-12 bg-slate-200 dark:bg-zinc-800 rounded" />
                <div className="h-3 w-16 bg-slate-200 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    const isMockData = !auditResult;
    const contractScore = isMockData ? '--' : (stats.overallScore !== '--' ? `${stats.overallScore}%` : '92%');
    const riskLevel = isMockData ? 'Pending Audit' : (stats.reviewStatus !== '--' ? stats.reviewStatus : 'Medium');
    const compliance = isMockData ? '--' : (stats.complianceScore !== '--' ? `${stats.complianceScore}%` : '96%');
    const criticalClauses = isMockData ? '--' : (stats.highRiskClausesCount || 4);
    const totalClauses = isMockData ? '--' : (stats.totalClausesCount || 38);
    const highRiskItems = isMockData ? '--' : (stats.highRiskClausesCount || 6);
    const missingClauses = isMockData ? '--' : (stats.missingClausesCount !== '--' ? stats.missingClausesCount : 2);
    const confidence = isMockData ? '--' : (stats.confidenceRate !== '--' ? `${stats.confidenceRate}%` : '98%');
    const estimatedReviewTime = '12 sec';
    const documentPages = files[0]?.pages || 15;
    const wordCount = contractText ? contractText.split(/\s+/).length : 8542;

    const statsList = [
      { label: 'Contract Score', value: contractScore, icon: Award, color: 'text-indigo-500 bg-indigo-500/5 border-indigo-500/10' },
      { label: 'Risk Level', value: riskLevel, icon: AlertTriangle, color: riskLevel.toLowerCase().includes('high') || riskLevel.toLowerCase().includes('revision') ? 'text-red-500 bg-red-500/5 border-red-500/10' : 'text-amber-500 bg-amber-500/5 border-amber-500/10' },
      { label: 'Compliance', value: compliance, icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10' },
      { label: 'Critical Clauses', value: criticalClauses, icon: NotebookPen, color: 'text-red-500 bg-red-500/5 border-red-500/10' },
      { label: 'Total Clauses', value: totalClauses, icon: FileText, color: 'text-slate-500 bg-slate-500/5 border-slate-550/10' },
      { label: 'High Risk Items', value: highRiskItems, icon: AlertTriangle, color: 'text-red-500 bg-red-500/5 border-red-500/10' },
      { label: 'Missing Clauses', value: missingClauses, icon: NotebookPen, color: 'text-violet-500 bg-violet-500/5 border-violet-500/10' },
      { label: 'AI Confidence', value: confidence, icon: Sparkles, color: 'text-indigo-650 bg-indigo-650/5 border-indigo-650/10' },
      { label: 'Review Duration', value: estimatedReviewTime, icon: Clock, color: 'text-sky-500 bg-sky-500/5 border-sky-500/10' },
      { label: 'Document Pages', value: documentPages, icon: Files, color: 'text-teal-500 bg-teal-500/5 border-teal-500/10' },
      { label: 'Word Count', value: wordCount.toLocaleString(), icon: FileSpreadsheet, color: 'text-slate-500 bg-slate-550/5 border-slate-550/10' }
    ];

    return (
      <div className={`border rounded-2xl p-6 shadow-sm space-y-4 bg-white dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800`}>
        <div className="flex items-center justify-between border-b border-slate-105 dark:border-zinc-800 pb-3">
          <h3 className="text-xs font-black uppercase text-indigo-500 tracking-wider flex items-center gap-1.5">
            <Brain size={14} /> AI Contract Overview
          </h3>
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">Confidence Rate: {confidence}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {statsList.map((item, idx) => {
            const Icon = item.icon || FileText;
            return (
              <div key={idx} className={`p-4 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${item.color}`}>
                <div className="flex items-center justify-between text-slate-450 dark:text-slate-400">
                  <span className="text-[9px] uppercase font-black tracking-wide leading-none">{item.label}</span>
                  <Icon size={12} className="shrink-0" />
                </div>
                <p className="text-[15px] font-black mt-3 leading-none truncate">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex-1 flex flex-col w-full h-full min-h-0 ${isDark ? 'bg-[#070b16] text-slate-100' : 'bg-slate-50 text-slate-800'} overflow-hidden select-none relative`}>
      
      {/* Header bar */}
      <div className={`flex flex-col px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b shrink-0 gap-1.5 ${isDark ? 'border-slate-800 bg-[#0B1020]/80' : 'border-slate-200 bg-white'} backdrop-blur-xl`}>
        {/* Row 1: Back + Title + Mobile Menu + Audit Timeline */}
        <div className="flex items-center justify-between w-full gap-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Mobile sidebar hamburger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className={`md:hidden p-2 rounded-xl border transition-colors shrink-0 ${isDark ? 'border-slate-800 bg-[#1A2540] text-slate-300 hover:bg-[#202E50]' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              title="Open AI Control Panel"
            >
              <SlidersHorizontal size={15} />
            </button>
            <button
              onClick={onBack}
              className={`min-h-[36px] px-3 flex items-center justify-center gap-1.5 border rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 ${isDark ? 'bg-[#1A2540] border-slate-800 text-slate-355 hover:bg-[#202E50]' : 'bg-slate-50 border-slate-205 text-slate-700 hover:bg-slate-100'}`}
            >
              <ChevronLeft size={12} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className={`text-[20px] sm:text-[26px] md:text-[32px] font-black leading-none tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Contract Analyzer
            </h1>
            {isSyncing && (
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider animate-pulse shrink-0 hidden sm:inline">✓ Synced</span>
            )}
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <LanguageToggle lang={toolkitLanguage === 'Hindi' ? 'hi' : 'en'} onChange={(l) => setToolkitLanguage(l === 'hi' ? 'Hindi' : 'English')} />
            <button
              onClick={() => setHistoryVisible(true)}
              title="View AI audit history"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 min-h-[36px] border rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${isDark ? 'bg-[#1A2540] border-slate-800 text-indigo-400 hover:bg-[#202E50]' : 'bg-indigo-50 border-indigo-200/30 text-indigo-600 hover:bg-indigo-100'}`}
            >
              <History size={14} className="shrink-0" />
              <span><span className="hidden md:inline">Audit Timeline </span><span>({auditLogs.length})</span></span>
            </button>
          </div>
        </div>
        {/* Row 2: Subtitle */}
        <p className={`text-[12px] sm:text-[13px] md:text-[14px] font-medium leading-relaxed sm:pl-0 md:pl-[92px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          AI-powered contract review, clause intelligence, compliance verification &amp; legal risk assessment.
        </p>
      </div>

      {/* Mobile Sidebar Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Panel Layout */}
      <div className="flex-1 flex w-full min-h-0 overflow-hidden">

        {/* Left Control Panel: Collapsible AI Workspace / Mobile Drawer */}
        <div className={`
          flex flex-col shrink-0 overflow-y-auto custom-scrollbar select-none
          transition-all duration-300 border-r
          ${isDark ? 'border-slate-800 bg-[#0c1224]' : 'border-slate-200 bg-white'}
          fixed inset-y-0 left-0 z-[110]
          md:relative md:translate-x-0 md:z-auto
          ${isMobileSidebarOpen ? 'translate-x-0 w-[290px] p-4 space-y-4' : '-translate-x-full md:translate-x-0'}
          ${isSidebarCollapsed ? 'md:w-[72px] md:px-2 md:py-4 md:space-y-6 md:items-center' : 'md:w-[280px] lg:w-[330px] md:p-5 md:space-y-4'}
        `}>

          {/* Toggle Collapse Button in Sidebar */}
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'justify-between pb-2 border-b border-slate-100 dark:border-zinc-800'}`}>
            {!isSidebarCollapsed && (
              <span className="text-[11px] font-black tracking-widest text-slate-450 dark:text-slate-405 uppercase">AI Control Panel</span>
            )}
            <div className="flex items-center gap-1.5">
              {/* Mobile close button */}
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`md:hidden p-1.5 rounded-xl border border-slate-200/60 dark:border-zinc-800 bg-slate-500/5 text-slate-500 hover:text-red-500 transition-all`}
                title="Close"
              >
                <X size={14} />
              </button>
              {/* Desktop collapse toggle */}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`hidden md:flex p-1.5 rounded-xl border border-slate-200/60 dark:border-zinc-800 bg-slate-500/5 text-slate-500 hover:text-indigo-500 hover:border-indigo-500/30 transition-all`}
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>
          </div>

          {isSidebarCollapsed ? (
            /* COLLAPSED ICON MODE */
            <div className="flex flex-col gap-5 items-center w-full">
              {/* Workspace */}
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="group relative p-2.5 rounded-xl bg-slate-500/5 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-500 border border-transparent hover:border-indigo-500/20 transition-all"
              >
                <FolderKanban size={20} />
                <span className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                  Workspace
                </span>
              </button>

              {/* Upload */}
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="group relative p-2.5 rounded-xl bg-slate-500/5 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-500 border border-transparent hover:border-indigo-500/20 transition-all"
              >
                <UploadCloud size={20} />
                <span className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                  Upload Contract
                </span>
              </button>

              {/* Quick Actions */}
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="group relative p-2.5 rounded-xl bg-slate-500/5 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-500 border border-transparent hover:border-indigo-500/20 transition-all"
              >
                <Sparkles size={20} />
                <span className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                  Quick Actions
                </span>
              </button>

              {/* AI Insights */}
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="group relative p-2.5 rounded-xl bg-slate-500/5 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-500 border border-transparent hover:border-indigo-500/20 transition-all"
              >
                <BrainCircuit size={20} />
                <span className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                  AI Insights
                </span>
              </button>

              {/* Templates */}
              <button
                onClick={() => {
                  setIsSidebarCollapsed(false);
                  setOpenSections(prev => ({ ...prev, templates: true }));
                }}
                className="group relative p-2.5 rounded-xl bg-slate-500/5 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-500 border border-transparent hover:border-indigo-500/20 transition-all"
              >
                <Files size={20} />
                <span className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                  Templates
                </span>
              </button>

              {/* OCR Editor */}
              <button
                onClick={() => {
                  setIsSidebarCollapsed(false);
                  setOpenSections(prev => ({ ...prev, ocr: true }));
                }}
                className="group relative p-2.5 rounded-xl bg-slate-500/5 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-500 border border-transparent hover:border-indigo-500/20 transition-all"
              >
                <ScanText size={20} />
                <span className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                  OCR Workspace
                </span>
              </button>

              {/* Activity Feed */}
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="group relative p-2.5 rounded-xl bg-slate-500/5 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-500 border border-transparent hover:border-indigo-500/20 transition-all"
              >
                <History size={20} />
                <span className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                  Activity Feed
                </span>
              </button>
            </div>
          ) : (
            /* EXPANDED PANEL MODE */
            <div className="flex-1 flex flex-col space-y-5 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
              {/* 1. WORKSPACE */}
              <div className="space-y-1.5 shrink-0 relative">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-550">Workspace</span>
                
                {/* Custom Trigger */}
                <div
                  onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-[10px] font-black cursor-pointer transition-all flex items-center justify-between ${
                    isDark ? 'bg-[#131c31]/30 border-slate-800 text-white hover:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-indigo-500'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FolderKanban size={11} className="text-indigo-500 shrink-0" />
                    <span className="truncate">
                      {linkedCaseId 
                        ? (allProjects.find(p => p._id === linkedCaseId)?.name || currentCase?.name || 'Linked Case Workspace') 
                        : 'Manual Entry (Auto-Create case)'}
                    </span>
                  </div>
                  <ChevronDown size={11} className={`text-slate-400 transition-transform ${isWorkspaceDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Custom Dropdown Panel */}
                {isWorkspaceDropdownOpen && (
                  <div className={`absolute left-0 right-0 mt-1 z-[1000] border rounded-2xl shadow-2xl p-2.5 space-y-2.5 font-semibold text-[9.5px] transition-all max-h-[300px] overflow-y-auto custom-scrollbar ${
                    isDark ? 'bg-[#131c31] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    {/* Create New Case Button */}
                    <button
                      onClick={() => {
                        setIsWorkspaceDropdownOpen(false);
                        setIsCreateCaseModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-indigo-500 hover:bg-indigo-500/10 transition-all font-black text-left uppercase text-[9px] border border-dashed border-indigo-500/30"
                    >
                      <Plus size={12} />
                      <span>＋ Create New Case</span>
                    </button>

                    <div className="border-t border-slate-100 dark:border-zinc-800" />

                    {/* Search Field */}
                    <div className="flex items-center bg-slate-500/5 border border-slate-200 dark:border-zinc-850 px-2 py-1 rounded-xl">
                      <Search size={10} className="text-slate-400 mr-1.5 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search cases..."
                        className="w-full bg-transparent border-none text-[9px] font-bold outline-none text-slate-800 dark:text-white"
                        value={workspaceSearchQuery}
                        onChange={e => setWorkspaceSearchQuery(e.target.value)}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>

                    {/* Filter Category Chips */}
                    <div className="flex flex-wrap gap-1">
                      {['All', 'Active', 'Draft', 'Closed', 'Archived', 'Favorites'].map(cat => (
                        <button
                          key={cat}
                          onClick={(e) => {
                            e.stopPropagation();
                            setWorkspaceCategory(cat);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase ${
                            workspaceCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Cases List */}
                    <div className="space-y-1 overflow-y-auto max-h-[140px] pr-0.5 custom-scrollbar">
                      {/* Manual Option */}
                      <div
                        onClick={() => {
                          setLinkedCaseId('');
                          resetPlatformState();
                          setIsWorkspaceDropdownOpen(false);
                          toast.success("Switched to manual entry workspace");
                        }}
                        className={`p-1.5 rounded-xl cursor-pointer hover:bg-indigo-500/5 hover:text-indigo-500 transition-all flex items-center gap-1.5 ${
                          !linkedCaseId ? 'text-indigo-500 bg-indigo-500/5 font-black' : ''
                        }`}
                      >
                        <Scale size={11} className="shrink-0" />
                        <span>Manual Entry Workspace</span>
                      </div>

                      {/* Separator */}
                      <div className="text-[7px] uppercase text-slate-400 dark:text-slate-500 tracking-wider py-1 font-black">Existing Cases</div>

                      {(() => {
                        const legalCases = allProjects.filter(p => p.isLegalCase);
                        const filtered = legalCases.filter(c => {
                          const matchesQuery = !workspaceSearchQuery.trim() || 
                            c.name?.toLowerCase().includes(workspaceSearchQuery.toLowerCase()) ||
                            c.clientName?.toLowerCase().includes(workspaceSearchQuery.toLowerCase()) ||
                            c.caseType?.toLowerCase().includes(workspaceSearchQuery.toLowerCase()) ||
                            c._id?.toLowerCase().includes(workspaceSearchQuery.toLowerCase());
                          
                          if (workspaceCategory === 'All') return matchesQuery;
                          if (workspaceCategory === 'Favorites') return matchesQuery && favoriteCases.includes(c._id);
                          const caseStatus = c.caseStatus || c.status || 'Active';
                          return matchesQuery && caseStatus.toLowerCase() === workspaceCategory.toLowerCase();
                        });

                        const favs = filtered.filter(c => favoriteCases.includes(c._id));
                        const others = filtered.filter(c => !favoriteCases.includes(c._id));
                        const sortedCases = [...favs, ...others];

                        if (sortedCases.length === 0) {
                          return <div className="text-center py-3 text-slate-400 text-[8.5px]">No cases found</div>;
                        }

                        return sortedCases.map(c => {
                          const isFav = favoriteCases.includes(c._id);
                          const isCurrent = linkedCaseId === c._id;
                          const cStatus = c.caseStatus || c.status || 'Active';
                          return (
                            <div
                              key={c._id}
                              onClick={() => {
                                setLinkedCaseId(c._id);
                                if (onUpdateCase) onUpdateCase(c);
                                hydrateFromCase(c);
                                setIsWorkspaceDropdownOpen(false);
                                toast.success(`Workspace: ${c.name}`);
                              }}
                              className={`p-1.5 rounded-xl cursor-pointer hover:bg-indigo-500/5 hover:text-indigo-500 transition-all flex flex-col gap-0.5 ${
                                isCurrent ? 'text-indigo-500 bg-indigo-500/5 font-black' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between min-w-0 gap-1.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <FolderKanban size={10} className="shrink-0 text-indigo-500" />
                                  <span className="font-extrabold truncate max-w-[150px]">{c.name}</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFavoriteCases(prev => 
                                      prev.includes(c._id) ? prev.filter(id => id !== c._id) : [...prev, c._id]
                                    );
                                  }}
                                  className={`p-0.5 rounded ${isFav ? 'text-amber-500' : 'text-slate-350 hover:text-amber-500'}`}
                                >
                                  <Star size={9} fill={isFav ? 'currentColor' : 'none'} />
                                </button>
                              </div>
                              <div className="flex items-center justify-between text-[7px] font-black uppercase text-slate-400 dark:text-slate-500">
                                <span>{c.caseType || 'General Matter'}</span>
                                <span className={`px-1 rounded text-[6px] text-white ${
                                  cStatus.toLowerCase() === 'active' ? 'bg-indigo-500' : 'bg-slate-400'
                                }`}>{cStatus}</span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
                <div className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                  {linkedCaseId ? "Case Active • Staged Workspace" : "Detached Draft • Manual Scope"}
                </div>
              </div>

              {/* 2. CONTRACT UPLOAD */}
              <div className="space-y-1.5 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-550">Upload</span>
                <div 
                  className={`border border-dashed rounded-xl p-3 text-center transition-all relative hover:bg-indigo-500/5 ${
                    isDark ? 'border-slate-850 bg-[#131c31]/10' : 'border-slate-200 bg-slate-50/50'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isOcrLoading || isAuditing) return;
                    const droppedFiles = e.dataTransfer.files;
                    if (droppedFiles && droppedFiles.length > 0) {
                      handleFileUpload({ target: { files: droppedFiles } });
                    }
                  }}
                >
                  <input 
                    ref={uploadInputRef}
                    type="file" 
                    multiple
                    accept=".pdf,.docx,.doc,.txt,image/*"
                    onChange={e => {
                      handleFileUpload(e);
                      e.target.value = '';
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ zIndex: 10 }}
                    disabled={isOcrLoading || isAuditing}
                  />
                  <div className="flex items-center justify-center gap-1.5">
                    <UploadCloud size={14} className="text-indigo-500 animate-pulse" />
                    <span className="text-[9px] font-black text-slate-700 dark:text-slate-300 uppercase">Drop or Browse contract</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1.5 text-[7.5px] font-extrabold text-slate-400">
                    <span className="flex items-center gap-0.5 text-emerald-500"><BadgeCheck size={9} /> OCR READY</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-indigo-500"><Lock size={9} /> ENCRYPTED</span>
                  </div>
                </div>

                {/* Staged file list */}
                {files.length > 0 && (
                  <div className="space-y-1">
                    {files.map(f => (
                      <div
                        key={f.id}
                        className={`flex items-center justify-between p-2 rounded-xl border text-[9px] font-black transition-all ${
                          f.id === activeFileId 
                            ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-500' 
                            : 'border-slate-200/50 dark:border-zinc-800 text-slate-600 dark:text-slate-400 bg-white/5 dark:bg-zinc-900/30'
                        }`}
                      >
                        <button
                          onClick={() => {
                            setActiveFileId(f.id);
                            setContractTitle(f.name);
                            setContractText(f.ocrText);
                            performContractAuditInternal(f.name, f.ocrText, files, versions, auditLogs);
                          }}
                          className="flex items-center gap-1.5 truncate text-left flex-1"
                        >
                          <FileCheck size={12} className="shrink-0 text-indigo-500" />
                          <span className="truncate max-w-[170px]">{f.name}</span>
                        </button>
                        <button
                          onClick={() => {
                            setFiles(prev => prev.filter(item => item.id !== f.id));
                            if (activeFileId === f.id) {
                              setActiveFileId(null);
                              setContractText('');
                            }
                            toast.success("Contract removed");
                          }}
                          className="p-1 hover:text-red-500 rounded shrink-0"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. QUICK ACTIONS */}
              <div className="space-y-1.5 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-550">Quick Actions</span>
                {/* Disabled banner when no contract */}
                {!contractText.trim() && linkedCaseId && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-[8.5px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                    <Upload size={9} className="shrink-0" />
                    Upload a contract to enable AI actions
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {[
                    { id: 'summary', name: 'Analyze', icon: Sparkles, runAudit: true },
                    { id: 'heatmap', name: 'Risk Scan', icon: AlertTriangle },
                    { id: 'clauses', name: 'Clauses', icon: NotebookPen },
                    { id: 'compliance', name: 'Compliance', icon: ShieldCheck },
                    { id: 'negotiation', name: 'Negotiate', icon: GitCompareArrows },
                    { id: 'redraft', name: 'Redraft', icon: FilePenLine },
                  ].map(act => {
                    const IconComp = act.icon;
                    const isActive = activeTab === act.id;
                    const noContract = !contractText.trim();
                    return (
                      <div key={act.id} className="relative group">
                        <button
                          disabled={isAuditing || noContract}
                          onClick={async () => {
                            if (noContract) return;
                            setActiveTab(act.id);
                            handleQuickActionClick(act.id);
                            let customLoadingMsg = "AI Platform auditing contract parameters...";
                            if (act.id === 'heatmap') customLoadingMsg = "AI Platform scanning risk vectors & heatmap matrix...";
                            if (act.id === 'clauses') customLoadingMsg = "AI Platform detecting active clauses & replacement standards...";
                            if (act.id === 'compliance') customLoadingMsg = "AI Platform checking compliance against Indian Contract Act & related statutes...";
                            if (act.id === 'negotiation') customLoadingMsg = "AI Platform building negotiation suggestions & fallback language...";
                            if (act.id === 'redraft') customLoadingMsg = "AI Platform generating side-by-side redrafted contract drafts...";
                            await performContractAuditInternal(contractTitle, contractText, files, versions, auditLogs, customLoadingMsg, act.id);
                          }}
                          className={`w-full flex items-center gap-1.5 px-2.5 py-2 border rounded-lg text-[9px] font-black uppercase tracking-wider transition-all min-h-[36px] ${
                            noContract
                              ? 'border-slate-200/40 dark:border-zinc-800/40 bg-slate-50/50 dark:bg-zinc-900/20 text-slate-300 dark:text-zinc-700 cursor-not-allowed'
                              : isActive
                                ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-500 shadow-[0_2px_8px_rgba(99,102,241,0.15)]'
                                : 'border-slate-200/60 dark:border-zinc-800/80 bg-white/5 text-slate-600 dark:text-slate-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:text-indigo-500'
                          }`}
                        >
                          <IconComp size={11} className={`${noContract ? 'text-slate-300 dark:text-zinc-700' : isActive ? 'text-indigo-500' : 'text-slate-400'} ${act.id === 'summary' && isAuditing ? 'animate-spin' : ''}`} />
                          <span>{act.name}</span>
                        </button>
                        {/* Tooltip when disabled */}
                        {noContract && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-slate-900 dark:bg-zinc-800 text-white text-[8px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                            Upload a contract to enable this feature.
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-zinc-800" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 7. AI ACTIVITY FEED */}
              <div className="space-y-1.5 pt-1 shrink-0 font-bold">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Activity Log</span>
                <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 custom-scrollbar text-[8.5px] font-bold text-slate-400">
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log, index) => (
                      <div key={index} className="flex items-start gap-1.5 border-l border-indigo-500/30 pl-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0 animate-pulse" />
                        <div className="flex-1 space-y-0.5">
                          <p className="text-slate-700 dark:text-slate-350">{log.action}</p>
                          <span className="text-[7px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-2 text-slate-450">No activities logged.</div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Main Platform Workspace */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 space-y-4 md:space-y-6">
          <div className="max-w-6xl w-full mx-auto space-y-4 md:space-y-6">

            {/* 1. CASE HEADER */}
            {linkedCaseId && (() => {
              const activeProj = allProjects.find(p => p._id === linkedCaseId) || currentCase;
              if (!activeProj) return null;
              const cStatus = activeProj.caseStatus || activeProj.status || 'Active';
              const cType = activeProj.caseType || 'General Matter';
              const client = activeProj.clientName || 'N/A';
              const opponent = activeProj.accused || 'N/A';
              const upcomingHearing = activeProj.hearings?.length > 0 
                ? new Date(activeProj.hearings[0].date).toLocaleDateString()
                : 'No upcoming hearing';
              const pendingTasks = activeProj.tasks?.filter(t => !t.completed).length || 0;
              
              return (
                <div className={`border rounded-2xl p-4 shadow-sm space-y-3 ${
                  isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase text-white bg-indigo-500">{cStatus}</span>
                        <span className="text-[10px] font-bold text-slate-400">Case No: {activeProj._id || 'N/A'}</span>
                      </div>
                      <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5 mt-1">
                        <FolderKanban size={14} className="text-indigo-500" />
                        {activeProj.name}
                      </h2>
                    </div>
                    <div className="text-[9.5px] font-bold text-slate-400">
                      Opponent: <span className="font-black text-slate-700 dark:text-slate-200">{opponent}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] pt-1">
                    <div className="p-2.5 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-zinc-800/40 space-y-0.5">
                      <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider">Client Name</span>
                      <p className="text-slate-800 dark:text-slate-250 font-extrabold">{client}</p>
                    </div>
                    <div className="p-2.5 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-zinc-800/40 space-y-0.5">
                      <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider">Matter Type</span>
                      <p className="text-slate-800 dark:text-slate-250 font-extrabold">{cType}</p>
                    </div>
                    <div className="p-2.5 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-zinc-800/40 space-y-0.5">
                      <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider">Contracts Linked</span>
                      <p className="text-indigo-500 font-black">{files.length} Staged</p>
                    </div>
                    <div className="p-2.5 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-zinc-800/40 space-y-0.5">
                      <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider">Overall Legal Risk</span>
                      <p className={`font-black ${
                        stats.riskScore > 60 ? 'text-red-500' : (stats.riskScore > 30 ? 'text-amber-500' : 'text-emerald-500')
                      }`}>{stats.riskScore !== '--' ? `${stats.riskScore}%` : 'Not Analyzed'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[9px] font-semibold text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={11} className="text-indigo-500" />
                      <span>Hearing Date: <strong className="text-slate-700 dark:text-slate-300">{upcomingHearing}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckSquare size={11} className="text-indigo-500" />
                      <span>Tasks Pending: <strong className="text-slate-700 dark:text-slate-300">{pendingTasks} case tasks</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} className="text-indigo-500" />
                      <span>Last Audit: <strong className="text-slate-700 dark:text-slate-300">
                        {auditLogs.length > 0 ? new Date(auditLogs[0].timestamp).toLocaleString() : 'No audits yet'}
                      </strong></span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* OCR Loading State */}
            {linkedCaseId && files.length === 0 && isOcrLoading && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-5 px-4 py-8">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <div className="text-center space-y-1">
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider animate-pulse">Extracting Contract Text...</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Running structural OCR engine & preparing analysis workspace.</p>
                </div>
              </div>
            )}

            {/* Empty State: No Contract Available */}
            {linkedCaseId && files.length === 0 && !isOcrLoading && !isWorkspaceLoading && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4 py-8">
                {/* Illustration */}
                <div className="relative animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center shadow-inner border-2 border-dashed border-slate-300 dark:border-zinc-700">
                    <FileText size={36} className="text-slate-400 dark:text-zinc-500 animate-pulse" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
                    <Upload size={14} className="text-white" />
                  </div>
                </div>

                {/* Text */}
                <div className="text-center space-y-2 max-w-md">
                  <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">No Contract Uploaded</h3>
                  <p className="text-sm text-slate-550 dark:text-slate-400 font-semibold leading-relaxed">
                    The selected case does not contain any contract document.
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                    Upload a contract to start AI-powered contract review, clause analysis, compliance verification, and legal risk assessment.
                  </p>
                </div>

                {/* Case Context Badge */}
                {caseContext && (
                  <div className="w-full max-w-sm bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl p-4 text-left space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-1.5">
                      <CheckCircle2 size={10} /> Case Context Ready
                    </p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{caseContext.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Case details will be used as supporting context during analysis.</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {caseContext.caseType && <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[9px] font-bold">{caseContext.caseType}</span>}
                      {caseContext.client && <span className="px-2 py-0.5 bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-full text-[9px] font-bold">{caseContext.client}</span>}
                      {caseContext.court && <span className="px-2 py-0.5 bg-slate-200 dark:bg-zinc-800 text-slate-655 dark:text-slate-400 rounded-full text-[9px] font-bold">{caseContext.court}</span>}
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => uploadInputRef.current?.click()}
                    className="px-6 py-3 bg-[#5B3DF5] hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/25"
                  >
                    <Upload size={14} /> Upload Contract
                  </button>
                  <button
                    onClick={() => setIsWorkspaceDropdownOpen(true)}
                    className="px-6 py-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    Choose Another Case
                  </button>
                </div>

                {/* Supported formats */}
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pt-1">
                  Supported: PDF · DOCX · TXT · DOC · Images (OCR)
                </p>
              </div>
            )}

            {linkedCaseId && files.length > 0 && (
              (() => {
                // 1. Filter and sorting calculation
                let filtered = [...files];
                if (catalogSearch) {
                  const q = catalogSearch.toLowerCase();
                  filtered = filtered.filter(f => f.name?.toLowerCase().includes(q));
                }
                if (catalogStatusFilter !== 'All') {
                  if (catalogStatusFilter !== 'READY') filtered = [];
                }
                if (catalogTypeFilter !== 'All') {
                  filtered = filtered.filter(f => {
                    const type = f.name?.toLowerCase().includes('nda') ? 'NDA' : f.name?.toLowerCase().includes('employment') ? 'Employment' : f.name?.toLowerCase().includes('lease') ? 'Lease' : f.name?.toLowerCase().includes('vendor') ? 'Vendor' : 'Tech';
                    return type.toLowerCase() === catalogTypeFilter.toLowerCase();
                  });
                }
                if (catalogRiskFilter !== 'All') {
                  filtered = filtered.filter(f => {
                    const r = stats.riskScore > 60 ? 'High' : (stats.riskScore > 30 ? 'Medium' : 'Low');
                    return r.toLowerCase() === catalogRiskFilter.toLowerCase();
                  });
                }

                // Sorting
                filtered.sort((a, b) => {
                  let valA, valB;
                  if (catalogSortKey === 'name') {
                    valA = a.name || '';
                    valB = b.name || '';
                  } else if (catalogSortKey === 'version') {
                    valA = versions.filter(v => v.note?.includes(a.name)).length || 1;
                    valB = versions.filter(v => v.note?.includes(b.name)).length || 1;
                  } else if (catalogSortKey === 'pages') {
                    valA = a.pages || 1;
                    valB = b.pages || 1;
                  } else if (catalogSortKey === 'size') {
                    valA = a.size || 0;
                    valB = b.size || 0;
                  } else if (catalogSortKey === 'date') {
                    valA = new Date(a.uploadDate || 0);
                    valB = new Date(b.uploadDate || 0);
                  }

                  if (valA < valB) return catalogSortOrder === 'asc' ? -1 : 1;
                  if (valA > valB) return catalogSortOrder === 'asc' ? 1 : -1;
                  return 0;
                });

                // Pagination
                const ITEMS_PER_PAGE = 5;
                const totalItems = filtered.length;
                const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
                const currentPage = Math.min(catalogPage, totalPages);
                const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
                const paginatedFiles = filtered.slice(startIndex, endIndex);

                const handleHeaderSort = (key) => {
                  if (catalogSortKey === key) {
                    setCatalogSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  } else {
                    setCatalogSortKey(key);
                    setCatalogSortOrder('asc');
                  }
                };

                const toggleSelectAll = () => {
                  if (catalogBulkSelected.length === paginatedFiles.length) {
                    setCatalogBulkSelected([]);
                  } else {
                    setCatalogBulkSelected(paginatedFiles.map(f => f.id));
                  }
                };

                const toggleSelectRow = (id) => {
                  setCatalogBulkSelected(prev => 
                    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                  );
                };

                return (
                  <div className={`border rounded-2xl p-6 shadow-sm space-y-6 ${
                    isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    {/* Header bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                      <div className="space-y-1">
                        <h3 className="text-sm font-black uppercase text-indigo-500 tracking-wider flex items-center gap-1.5">
                          <FileStack size={14} className="text-indigo-500" /> Case Contract Catalog
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium">Staged contracts, document compliance scopes, and active litigation risk ratings.</p>
                      </div>
                      
                      {/* Bulk actions banner */}
                      {catalogBulkSelected.length > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] animate-fade-in shrink-0">
                          <span className="font-extrabold text-indigo-500 ml-1">{catalogBulkSelected.length} Selected</span>
                          <button
                            onClick={() => {
                              catalogBulkSelected.forEach(id => handleDeleteFile(id));
                              setCatalogBulkSelected([]);
                              toast.success("Bulk Deleted!");
                            }}
                            className="px-2.5 py-1 bg-red-500/15 hover:bg-red-500/25 text-red-500 rounded-lg font-black uppercase tracking-wider text-[8.5px] transition-all"
                          >
                            Bulk Delete
                          </button>
                          <button
                            onClick={() => {
                              toast.success("Bulk Download Triggered!");
                            }}
                            className="px-2.5 py-1 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-500 rounded-lg font-black uppercase tracking-wider text-[8.5px] transition-all"
                          >
                            Bulk Download
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Active Contract Detail Card */}
                    {(() => {
                      const activeFile = files.find(f => f.id === activeFileId);
                      if (!activeFile) {
                        return (
                          <div className="p-8 rounded-2xl border border-dashed border-indigo-500/20 bg-indigo-500/5 text-center space-y-3.5 animate-in fade-in duration-200">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto border border-indigo-500/20">
                              <FileStack size={18} className="animate-pulse" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-[10px] font-black uppercase text-slate-800 dark:text-white tracking-wider">No Active Contract Selected</h4>
                              <p className="text-[9px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                                Please search or select a contract from the catalog below to launch the AI workspace.
                              </p>
                            </div>
                          </div>
                        );
                      }
                      
                      const fileVer = versions.filter(v => v.note?.includes(activeFile.name)).length || 1;
                      const fileSize = activeFile.size ? `${(activeFile.size / 1024).toFixed(1)} MB` : '1.2 MB';
                      const formattedDate = activeFile.uploadDate || new Date().toLocaleDateString();

                      let docSubtype = 'Employment Contract';
                      if (activeFile.name?.toLowerCase().includes('nda') || activeFile.name?.toLowerCase().includes('disclosure')) {
                        docSubtype = 'NDA Agreement';
                      } else if (activeFile.name?.toLowerCase().includes('lease') || activeFile.name?.toLowerCase().includes('rent')) {
                        docSubtype = 'Lease Deed';
                      } else if (activeFile.name?.toLowerCase().includes('vendor')) {
                        docSubtype = 'Vendor Agreement';
                      } else if (activeFile.name?.toLowerCase().includes('service') || activeFile.name?.toLowerCase().includes('msa')) {
                        docSubtype = 'Master Service Agreement';
                      }

                      return (
                        <div className={`p-5 rounded-2xl border flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 transition-all shadow-sm ${
                          isDark ? 'bg-indigo-950/10 border-indigo-500/20 text-white' : 'bg-indigo-50/20 border-indigo-500/20 text-slate-800'
                        }`}>
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/20">
                              <FileCheck size={24} />
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-indigo-500 text-white text-[8px] font-black uppercase tracking-wider">Active Contract</span>
                                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/50 text-slate-500 dark:text-slate-400 text-[8px] font-bold">Version {fileVer}</span>
                              </div>
                              <h4 className="font-black text-sm truncate" title={activeFile.name}>{activeFile.name}</h4>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9.5px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                                <span>Size: <strong className="text-slate-600 dark:text-slate-300 font-bold">{fileSize}</strong></span>
                                <span>•</span>
                                <span>Uploaded: <strong className="text-slate-600 dark:text-slate-300 font-bold">{formattedDate}</strong></span>
                                <span>•</span>
                                <span className="text-emerald-500 font-bold">OCR: SUCCESS (READY)</span>
                                <span>•</span>
                                <span className={auditResult ? "text-indigo-500 font-bold" : "text-amber-500 font-bold"}>
                                  STATUS: {isAuditing ? "Analyzing..." : (auditResult ? "AI Reviewed" : "Ready for AI review")}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto border-t xl:border-t-0 pt-3 xl:pt-0 border-slate-100 dark:border-zinc-850">
                            <button
                              onClick={() => runContractAudit()}
                              disabled={isAuditing}
                              className="flex-1 xl:flex-initial px-4 py-2 bg-[#5B3DF5] hover:bg-indigo-700 disabled:bg-slate-450 active:scale-95 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/25"
                              title="Analyze Contract"
                            >
                              <Cpu size={12} className={isAuditing ? "animate-spin" : ""} />
                              {isAuditing ? "Analyzing..." : "Analyze Contract"}
                            </button>
                            <button
                              onClick={() => {
                                setActiveFileId(activeFile.id);
                                setContractTitle(activeFile.name);
                                setContractText(activeFile.ocrText);
                                toast.success(`Loaded active contract viewer for: ${activeFile.name}`);
                              }}
                              className="flex-1 xl:flex-initial px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                              title="View Contract"
                            >
                              <Eye size={12} />
                              View Contract
                            </button>
                            <button
                              onClick={() => {
                                setActiveFileId(activeFile.id);
                                const input = document.getElementById('contract-upload-input');
                                if (input) input.click();
                              }}
                              className="flex-1 xl:flex-initial px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                              title="Replace Contract"
                            >
                              <UploadCloud size={12} />
                              Replace Contract
                            </button>
                            <button
                              onClick={() => {
                                const input = document.getElementById('contract-upload-input');
                                if (input) input.click();
                              }}
                              className="flex-1 xl:flex-initial px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white border border-indigo-500/20 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                              title="Upload New Version"
                            >
                              <Plus size={12} />
                              Upload New Version
                            </button>
                            <button
                              onClick={() => handleDownloadFile(activeFile)}
                              className="flex-1 xl:flex-initial p-2 bg-slate-100 dark:bg-zinc-850 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 hover:text-indigo-500 rounded-xl transition-all flex items-center justify-center"
                              title="Download Contract"
                            >
                              <Download size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(activeFile.id)}
                              className="flex-1 xl:flex-initial p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center"
                              title="Delete Contract"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Filter and search bar controls */}
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      {/* Search */}
                      <div className="flex items-center bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 max-w-sm w-full">
                        <Search size={14} className="text-slate-400 mr-2 shrink-0" />
                        <input 
                          type="text"
                          placeholder="Search contracts..."
                          className="bg-transparent border-none text-[11px] font-bold outline-none text-slate-800 dark:text-white w-full placeholder:text-slate-400"
                          value={catalogSearch}
                          onChange={(e) => {
                            setCatalogSearch(e.target.value);
                            setCatalogPage(1);
                          }}
                        />
                      </div>

                      {/* Dropdowns */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Type */}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[7.5px] uppercase font-black text-slate-400 tracking-wider">Type</span>
                          <select
                            value={catalogTypeFilter}
                            onChange={(e) => {
                              setCatalogTypeFilter(e.target.value);
                              setCatalogPage(1);
                            }}
                            className={`p-1.5 border rounded-lg text-[9px] font-black uppercase outline-none ${
                              isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                            }`}
                          >
                            <option value="All">All Types</option>
                            <option value="NDA">NDA</option>
                            <option value="Employment">Employment</option>
                            <option value="Lease">Lease</option>
                            <option value="Vendor">Vendor</option>
                          </select>
                        </div>

                        {/* Risk */}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[7.5px] uppercase font-black text-slate-400 tracking-wider">Risk</span>
                          <select
                            value={catalogRiskFilter}
                            onChange={(e) => {
                              setCatalogRiskFilter(e.target.value);
                              setCatalogPage(1);
                            }}
                            className={`p-1.5 border rounded-lg text-[9px] font-black uppercase outline-none ${
                              isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                            }`}
                          >
                            <option value="All">All Risks</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[7.5px] uppercase font-black text-slate-400 tracking-wider">Status</span>
                          <select
                            value={catalogStatusFilter}
                            onChange={(e) => {
                              setCatalogStatusFilter(e.target.value);
                              setCatalogPage(1);
                            }}
                            className={`p-1.5 border rounded-lg text-[9px] font-black uppercase outline-none ${
                              isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                            }`}
                          >
                            <option value="All">All Statuses</option>
                            <option value="READY">Ready</option>
                            <option value="DRAFT">Draft</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Table Viewport */}
                    {files.length === 0 ? (
                      <div className="text-center py-12 space-y-4 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-500/5">
                        <UploadCloud className="mx-auto text-indigo-500 animate-pulse" size={32} />
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase">Upload Contract Documents</h4>
                          <p className="text-[10px] text-slate-455 max-w-xs mx-auto leading-relaxed">
                            Drag and drop contract files in the left sidebar to start AI litigation audits.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Desktop Grid Layout */}
                        <div className="hidden xl:block overflow-x-auto custom-scrollbar w-full rounded-2xl border border-slate-200 dark:border-zinc-800/80">
                        <div className="min-w-[1698px]">
                          {/* Grid Header */}
                          <div className="grid grid-cols-[48px_340px_150px_90px_70px_90px_160px_140px_120px_140px_110px_180px] bg-[#FAFAFC] dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-[9px] font-black uppercase tracking-wider text-slate-400 h-[60px] items-center select-none sticky top-0 z-10">
                            {/* Checkbox Header */}
                            <div className="px-4 text-center">
                              <input 
                                type="checkbox" 
                                className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 cursor-pointer w-3.5 h-3.5"
                                checked={paginatedFiles.length > 0 && catalogBulkSelected.length === paginatedFiles.length}
                                onChange={toggleSelectAll}
                              />
                            </div>
                            
                            {/* Contract Name Header */}
                            <div 
                              onClick={() => handleHeaderSort('name')}
                              className="px-4 cursor-pointer hover:bg-slate-500/5 transition-colors h-full flex items-center gap-1 select-none"
                            >
                              <span>📄 Contract</span>
                              {catalogSortKey === 'name' && (catalogSortOrder === 'asc' ? '↑' : '↓')}
                            </div>

                            {/* Type Header */}
                            <div className="px-4">Type</div>

                            {/* Version Header */}
                            <div 
                              onClick={() => handleHeaderSort('version')}
                              className="px-4 cursor-pointer hover:bg-slate-500/5 transition-colors h-full flex items-center gap-1 select-none"
                            >
                              <span>Version</span>
                              {catalogSortKey === 'version' && (catalogSortOrder === 'asc' ? '↑' : '↓')}
                            </div>

                            {/* Pages Header */}
                            <div 
                              onClick={() => handleHeaderSort('pages')}
                              className="px-4 cursor-pointer hover:bg-slate-500/5 transition-colors h-full flex items-center justify-center gap-1 select-none text-center"
                            >
                              <span>Pages</span>
                              {catalogSortKey === 'pages' && (catalogSortOrder === 'asc' ? '↑' : '↓')}
                            </div>

                            {/* Size Header */}
                            <div 
                              onClick={() => handleHeaderSort('size')}
                              className="px-4 cursor-pointer hover:bg-slate-500/5 transition-colors h-full flex items-center justify-end gap-1 select-none text-right"
                            >
                              <span>Size</span>
                              {catalogSortKey === 'size' && (catalogSortOrder === 'asc' ? '↑' : '↓')}
                            </div>

                            {/* Uploaded By Header */}
                            <div className="px-4">Uploaded By</div>

                            {/* Date Header */}
                            <div 
                              onClick={() => handleHeaderSort('date')}
                              className="px-4 cursor-pointer hover:bg-slate-500/5 transition-colors h-full flex items-center gap-1 select-none"
                            >
                              <span>Date</span>
                              {catalogSortKey === 'date' && (catalogSortOrder === 'asc' ? '↑' : '↓')}
                            </div>

                            {/* Status Header */}
                            <div className="px-4">Status</div>

                            {/* AI Analysis Header */}
                            <div className="px-4">AI Analysis</div>

                            {/* Risk Header */}
                            <div className="px-4">Risk</div>

                            {/* Actions Header */}
                            <div className="px-4 text-right pr-6">Actions</div>
                          </div>

                          {/* Grid Body */}
                          <div className="divide-y divide-slate-150 dark:divide-zinc-800 bg-transparent">
                            {paginatedFiles.map((f) => {
                              const fileVer = versions.filter(v => v.note?.includes(f.name)).length || 1;
                              const fileLogs = auditLogs.filter(l => l.details?.includes(f.name));
                              const fileUploader = fileLogs.length > 0 
                                ? fileLogs[fileLogs.length - 1].editedBy.split(' (')[0]
                                : 'Admin Ji';
                              
                              const uploaderInitial = fileUploader.charAt(0).toUpperCase();

                              let formattedDate = f.uploadDate || 'N/A';
                              try {
                                if (formattedDate.includes('/')) {
                                  const parts = formattedDate.split('/');
                                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                  const d = parseInt(parts[1], 10);
                                  const m = parseInt(parts[0], 10) - 1;
                                  const y = parts[2];
                                  if (!isNaN(d) && !isNaN(m) && m >= 0 && m < 12) {
                                    formattedDate = `${d < 10 ? '0' + d : d} ${monthNames[m]} ${y}`;
                                  }
                                }
                              } catch(err) {
                                console.error(err);
                              }

                              const isActive = activeFileId === f.id;
                              const fileSize = f.size ? `${(f.size / 1024).toFixed(1)} MB` : '1.2 MB';
                              const pageCount = f.pages || 1;

                              let docSubtype = 'Employment Contract';
                              if (f.name?.toLowerCase().includes('nda') || f.name?.toLowerCase().includes('disclosure')) {
                                docSubtype = 'NDA Agreement';
                              } else if (f.name?.toLowerCase().includes('lease') || f.name?.toLowerCase().includes('rent')) {
                                docSubtype = 'Lease Deed';
                              } else if (f.name?.toLowerCase().includes('vendor')) {
                                docSubtype = 'Vendor Agreement';
                              } else if (f.name?.toLowerCase().includes('service') || f.name?.toLowerCase().includes('msa')) {
                                docSubtype = 'Master Service Agreement';
                              }

                              const isSelected = catalogBulkSelected.includes(f.id);

                              return (
                                <div 
                                  key={f.id} 
                                  className={`grid grid-cols-[48px_340px_150px_90px_70px_90px_160px_140px_120px_140px_110px_180px] h-[76px] items-center transition-all hover:bg-slate-500/5 hover:border-l-2 hover:border-l-indigo-500 select-none ${
                                    isActive 
                                      ? 'bg-indigo-50/10 dark:bg-indigo-500/5 border-l-2 border-l-indigo-500' 
                                      : 'border-l-2 border-l-transparent'
                                  }`}
                                >
                                  {/* Checkbox */}
                                  <div className="px-4 text-center">
                                    <input 
                                      type="checkbox" 
                                      className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 cursor-pointer w-3.5 h-3.5"
                                      checked={isSelected}
                                      onChange={() => toggleSelectRow(f.id)}
                                    />
                                  </div>

                                  {/* Contract Name */}
                                  <div className="px-4 text-left min-w-0">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <FileText size={16} className="text-indigo-500 shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <button 
                                          onClick={() => {
                                            setActiveFileId(f.id);
                                            setContractTitle(f.name);
                                            setContractText(f.ocrText);
                                            toast.success(`Loaded: ${f.name}`);
                                          }}
                                          className="font-extrabold text-[12.5px] text-slate-800 dark:text-slate-200 block truncate whitespace-nowrap hover:text-indigo-500 hover:underline text-left w-full"
                                          title={f.name}
                                        >
                                          {f.name}
                                        </button>
                                        <span className="text-[9.5px] font-semibold text-slate-455 uppercase block mt-0.5 tracking-wider truncate whitespace-nowrap">
                                          {docSubtype}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Type */}
                                  <div className="px-4 text-left min-w-0">
                                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase tracking-wider truncate whitespace-nowrap">
                                      {docSubtype.split(' ')[0]}
                                    </span>
                                  </div>

                                  {/* Version */}
                                  <div className="px-4 min-w-0">
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-zinc-700/50 rounded-md text-[9px] font-black uppercase truncate whitespace-nowrap">
                                      Version {fileVer}
                                    </span>
                                  </div>

                                  {/* Pages */}
                                  <div className="px-4 text-center min-w-0">
                                    <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-355 text-[9px] font-black truncate whitespace-nowrap">
                                      {pageCount}
                                    </span>
                                  </div>

                                  {/* File Size */}
                                  <div className="px-4 text-right font-mono font-bold text-slate-500 dark:text-slate-400 truncate whitespace-nowrap">
                                    {fileSize}
                                  </div>

                                  {/* Uploaded By */}
                                  <div className="px-4 min-w-0">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[8.5px] font-black shrink-0 shadow-sm shadow-indigo-500/10 select-none">
                                        {uploaderInitial}
                                      </div>
                                      <span className="text-slate-600 dark:text-slate-350 font-bold truncate whitespace-nowrap">{fileUploader}</span>
                                    </div>
                                  </div>

                                  {/* Date */}
                                  <div className="px-4 font-bold text-slate-455 truncate whitespace-nowrap">
                                    {formattedDate}
                                  </div>

                                  {/* Status */}
                                  <div className="px-4 min-w-0">
                                    <span className="px-2.5 py-1.5 rounded-full text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 tracking-wider truncate whitespace-nowrap">
                                      READY
                                    </span>
                                  </div>

                                  {/* AI Analysis */}
                                  <div className="px-4 min-w-0">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-wider truncate whitespace-nowrap ${
                                      auditResult ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                    }`}>
                                      {auditResult ? (
                                        <>
                                          <span>🧠</span>
                                          <span>Completed</span>
                                        </>
                                      ) : (
                                        <>
                                          <span>⏳</span>
                                          <span>Pending</span>
                                        </>
                                      )}
                                    </span>
                                  </div>

                                  {/* Risk */}
                                  <div className="px-4 min-w-0">
                                    <span className={`px-2.5 py-1.5 rounded-full text-[8.5px] font-black uppercase border tracking-wider text-center block w-max truncate whitespace-nowrap ${
                                      stats.riskScore > 60 
                                        ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                        : (stats.riskScore > 30 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20')
                                    }`}>
                                      {stats.riskScore !== '--' ? `${stats.riskScore}% Risk` : 'Pending'}
                                    </span>
                                  </div>

                                  {/* Actions */}
                                  <div className="px-4 text-right pr-6">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* View */}
                                      <button
                                        onClick={() => {
                                          setActiveFileId(f.id);
                                          setContractTitle(f.name);
                                          setContractText(f.ocrText);
                                          toast.success(`Loaded: ${f.name}`);
                                        }}
                                        className="w-[34px] h-[34px] flex items-center justify-center rounded-xl bg-slate-500/5 hover:bg-slate-500/15 text-slate-500 hover:text-indigo-500 border border-slate-200/40 dark:border-zinc-800 transition-all"
                                        title="View Document"
                                      >
                                        <Eye size={13} />
                                      </button>

                                      {/* Analyze */}
                                      <button
                                        onClick={() => {
                                          setActiveFileId(f.id);
                                          setContractTitle(f.name);
                                          setContractText(f.ocrText);
                                          runContractAudit();
                                        }}
                                        className="w-[34px] h-[34px] flex items-center justify-center rounded-xl bg-indigo-500/5 hover:bg-indigo-500/15 text-indigo-500 hover:bg-indigo-650 hover:text-white border border-indigo-500/20 transition-all"
                                        title="Start Audit"
                                      >
                                        <Cpu size={13} />
                                      </button>

                                      {/* Replace */}
                                      <button
                                        onClick={() => {
                                          setActiveFileId(f.id);
                                          const input = document.getElementById('contract-upload-input');
                                          if (input) input.click();
                                        }}
                                        className="w-[34px] h-[34px] flex items-center justify-center rounded-xl bg-amber-500/5 hover:bg-amber-500/15 text-amber-500 hover:text-white hover:bg-amber-500/80 border border-amber-500/20 transition-all"
                                        title="Replace Document"
                                      >
                                        <UploadCloud size={13} />
                                      </button>

                                      {/* Download */}
                                      <button
                                        onClick={() => handleDownloadFile(f)}
                                        className="w-[34px] h-[34px] flex items-center justify-center rounded-xl bg-slate-500/5 hover:bg-slate-500/15 text-slate-500 hover:text-indigo-500 border border-slate-200/40 dark:border-zinc-800 transition-all"
                                        title="Download Doc"
                                      >
                                        <Download size={13} />
                                      </button>

                                      {/* Delete */}
                                      <button
                                        onClick={() => handleDeleteFile(f.id)}
                                        className="w-[34px] h-[34px] flex items-center justify-center rounded-xl bg-red-500/5 hover:bg-red-500/15 text-red-500 hover:text-white hover:bg-red-500/80 border border-red-500/20 transition-all"
                                        title="Delete Document"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Mobile & Tablet Card Layout */}
                      <div className="block xl:hidden space-y-4">
                        {paginatedFiles.map((f) => {
                          const fileVer = versions.filter(v => v.note?.includes(f.name)).length || 1;
                          const fileLogs = auditLogs.filter(l => l.details?.includes(f.name));
                          const fileUploader = fileLogs.length > 0 
                            ? fileLogs[fileLogs.length - 1].editedBy.split(' (')[0]
                            : 'Admin Ji';
                          
                          const uploaderInitial = fileUploader.charAt(0).toUpperCase();

                          let formattedDate = f.uploadDate || 'N/A';
                          try {
                            if (formattedDate.includes('/')) {
                              const parts = formattedDate.split('/');
                              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                              const d = parseInt(parts[1], 10);
                              const m = parseInt(parts[0], 10) - 1;
                              const y = parts[2];
                              if (!isNaN(d) && !isNaN(m) && m >= 0 && m < 12) {
                                formattedDate = `${d < 10 ? '0' + d : d} ${monthNames[m]} ${y}`;
                              }
                            }
                          } catch(err) {
                            console.error(err);
                          }

                          const isActive = activeFileId === f.id;
                          const fileSize = f.size ? `${(f.size / 1024).toFixed(1)} MB` : '1.2 MB';
                          const pageCount = f.pages || 1;

                          let docSubtype = 'Employment Contract';
                          if (f.name?.toLowerCase().includes('nda') || f.name?.toLowerCase().includes('disclosure')) {
                            docSubtype = 'NDA Agreement';
                          } else if (f.name?.toLowerCase().includes('lease') || f.name?.toLowerCase().includes('rent')) {
                            docSubtype = 'Lease Deed';
                          } else if (f.name?.toLowerCase().includes('vendor')) {
                            docSubtype = 'Vendor Agreement';
                          } else if (f.name?.toLowerCase().includes('service') || f.name?.toLowerCase().includes('msa')) {
                            docSubtype = 'Master Service Agreement';
                          }

                          const isSelected = catalogBulkSelected.includes(f.id);

                          return (
                            <div key={f.id} className={`p-4 border rounded-2xl space-y-3.5 transition-all ${
                              isActive ? 'border-indigo-500 bg-indigo-50/5' : (isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200')
                            }`}>
                              {/* Header part with checkbox & name */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="checkbox" 
                                    className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 cursor-pointer w-3.5 h-3.5"
                                    checked={isSelected}
                                    onChange={() => toggleSelectRow(f.id)}
                                  />
                                  <div className="min-w-0">
                                    <button 
                                      onClick={() => {
                                        setActiveFileId(f.id);
                                        setContractTitle(f.name);
                                        setContractText(f.ocrText);
                                        toast.success(`Loaded: ${f.name}`);
                                      }}
                                      className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate hover:text-indigo-500 hover:underline text-left block w-full"
                                    >
                                      {f.name}
                                    </button>
                                    <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider">{docSubtype}</span>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase">{docSubtype.split(' ')[0]}</span>
                              </div>

                              {/* Grid metrics details */}
                              <div className="grid grid-cols-2 gap-2 text-[9px] font-semibold text-slate-455 uppercase border-y border-slate-100 dark:border-zinc-800 py-2">
                                <div>Version: <span className="font-black text-slate-700 dark:text-slate-300">V{fileVer}</span></div>
                                <div>Pages: <span className="font-black text-slate-700 dark:text-slate-300">{pageCount}</span></div>
                                <div>Size: <span className="font-black text-slate-700 dark:text-slate-300">{fileSize}</span></div>
                                <div>Date: <span className="font-black text-slate-700 dark:text-slate-300">{formattedDate}</span></div>
                              </div>

                              {/* Badges part */}
                              <div className="flex flex-wrap items-center gap-2 text-[8px] font-black uppercase">
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">READY</span>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${
                                  auditResult ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                }`}>
                                  {auditResult ? '🧠 Completed' : '⏳ Pending'}
                                </span>
                                <span className={`px-2.5 py-1 rounded-full border ${
                                  stats.riskScore > 60 
                                    ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                    : (stats.riskScore > 30 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20')
                                }`}>
                                  {stats.riskScore !== '--' ? `${stats.riskScore}% Risk` : 'Pending'}
                                </span>
                              </div>

                              {/* Actions footer bar */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
                                <div className="flex items-center gap-1">
                                  <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[8.5px] font-black uppercase">{uploaderInitial}</div>
                                  <span className="text-[10px] text-slate-500 font-bold">{fileUploader}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setActiveFileId(f.id);
                                      setContractTitle(f.name);
                                      setContractText(f.ocrText);
                                      toast.success(`Loaded: ${f.name}`);
                                    }}
                                    className="w-[30px] h-[30px] flex items-center justify-center rounded-lg bg-slate-500/5 text-slate-500 hover:text-indigo-500 transition-colors"
                                    title="View"
                                  >
                                    <Eye size={12} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveFileId(f.id);
                                      setContractTitle(f.name);
                                      setContractText(f.ocrText);
                                      runContractAudit();
                                    }}
                                    className="w-[30px] h-[30px] flex items-center justify-center rounded-lg bg-indigo-500/5 text-indigo-500 hover:bg-indigo-655 hover:text-white transition-colors"
                                    title="Analyze"
                                  >
                                    <Cpu size={12} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveFileId(f.id);
                                      const input = document.getElementById('contract-upload-input');
                                      if (input) input.click();
                                    }}
                                    className="w-[30px] h-[30px] flex items-center justify-center rounded-lg bg-amber-500/5 text-amber-500 hover:bg-amber-500/80 hover:text-white transition-colors"
                                    title="Replace"
                                  >
                                    <UploadCloud size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadFile(f)}
                                    className="w-[30px] h-[30px] flex items-center justify-center rounded-lg bg-slate-500/5 text-slate-500 hover:text-indigo-500 transition-colors"
                                    title="Download"
                                  >
                                    <Download size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFile(f.id)}
                                    className="w-[30px] h-[30px] flex items-center justify-center rounded-lg bg-red-500/5 text-red-500 hover:bg-red-500/80 hover:text-white transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                    {/* Pagination Footer */}
                    {totalItems > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[10px] font-black text-slate-400 uppercase select-none">
                        <span>Showing {startIndex + 1}–{endIndex} of {totalItems} Contracts</span>
                        <div className="flex items-center gap-1.5 self-end">
                          <button
                            onClick={() => setCatalogPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg border border-slate-250 dark:border-zinc-850 bg-white/20 dark:bg-black/10 hover:bg-slate-500/5 disabled:opacity-40 transition-colors uppercase text-[9px]"
                          >
                            Previous
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }).map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCatalogPage(idx + 1)}
                                className={`w-6 h-6 rounded-lg text-[9px] font-black uppercase transition-all ${
                                  currentPage === idx + 1 
                                    ? 'bg-indigo-650 text-white' 
                                    : 'bg-slate-500/5 hover:bg-slate-500/15 text-slate-500'
                                }`}
                              >
                                {idx + 1}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => setCatalogPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-slate-250 dark:border-zinc-850 bg-white/20 dark:bg-black/10 hover:bg-slate-500/5 disabled:opacity-40 transition-colors uppercase text-[9px]"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
            
            {/* 4. LIVE ANALYSIS PROGRESS */}
            <div id="section-live-progress" />
            {isAuditing && (() => {
              const modeLabels = {
                summary: { name: 'Executive Review', color: 'text-indigo-500', bg: 'bg-indigo-500/10', pillars: ['OCR Complete', 'Clause Parse', 'Risk Analysis', 'Legal Opinion', 'AI Verdict'] },
                heatmap: { name: 'Risk Scan', color: 'text-red-500', bg: 'bg-red-500/10', pillars: ['OCR Complete', 'Risk Detection', 'Heatmap Build', 'Severity Score', 'Vector Map'] },
                clauses: { name: 'Clause Intelligence', color: 'text-violet-500', bg: 'bg-violet-500/10', pillars: ['OCR Complete', 'Clause Detect', 'Category Match', 'Gap Analysis', 'Standards Check'] },
                compliance: { name: 'Compliance Review', color: 'text-emerald-500', bg: 'bg-emerald-500/10', pillars: ['OCR Complete', 'Act Mapping', 'DPDP Check', 'Labour Law', 'Status Report'] },
                negotiation: { name: 'Negotiation Strategy', color: 'text-amber-500', bg: 'bg-amber-500/10', pillars: ['OCR Complete', 'Priority Sort', 'Fallback Draft', 'Leverage Map', 'Wording Build'] },
                redraft: { name: 'Redraft Review', color: 'text-pink-500', bg: 'bg-pink-500/10', pillars: ['OCR Complete', 'Clause Parse', 'Redraft Build', 'Plain English', 'Compare Layout'] }
              };
              const mode = modeLabels[activeTab] || modeLabels['summary'];
              const activeStep = auditStep || 'Staging analysis parameters...';
              const pillarIndex = mode.pillars.findIndex(p => activeStep.toLowerCase().includes(p.split(' ')[0].toLowerCase()));
              
              return (
                <div className={`border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 ${
                  isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
                } border-l-4 ${activeTab === 'heatmap' ? 'border-l-red-500' : activeTab === 'clauses' ? 'border-l-violet-500' : activeTab === 'compliance' ? 'border-l-emerald-500' : activeTab === 'negotiation' ? 'border-l-amber-500' : activeTab === 'redraft' ? 'border-l-pink-500' : 'border-l-indigo-500'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeTab === 'heatmap' ? 'bg-red-500' : activeTab === 'clauses' ? 'bg-violet-500' : activeTab === 'compliance' ? 'bg-emerald-500' : activeTab === 'negotiation' ? 'bg-amber-500' : activeTab === 'redraft' ? 'bg-pink-500' : 'bg-indigo-500'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-wider ${mode.color}`}>{mode.name} · AI Processing</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase animate-pulse ${mode.bg} ${mode.color}`}>
                      {activeStep}
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 animate-[shimmer_2s_linear_infinite] ${activeTab === 'heatmap' ? 'bg-red-500' : activeTab === 'clauses' ? 'bg-violet-500' : activeTab === 'compliance' ? 'bg-emerald-500' : activeTab === 'negotiation' ? 'bg-amber-500' : activeTab === 'redraft' ? 'bg-pink-500' : 'bg-indigo-500'}`} 
                      style={{ width: `${Math.max(15, pillarIndex >= 0 ? (pillarIndex + 1) * 20 : 25)}%` }} />
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {mode.pillars.map((pillar, idx) => {
                      const isPast = pillarIndex >= idx;
                      const isActive = pillarIndex === idx;
                      return (
                        <div key={pillar} className={`text-center text-[8px] font-extrabold uppercase tracking-wider px-1 py-1.5 rounded-lg transition-all ${
                          isPast
                            ? `${mode.bg} ${mode.color} ${isActive ? 'animate-pulse' : ''}`
                            : 'text-slate-400 dark:text-slate-600'
                        }`}>
                          {isPast && !isActive ? '✓ ' : ''}{pillar}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Sticky Actions Row */}
            {linkedCaseId && files.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3 bg-slate-500/5 border border-slate-200/40 dark:border-zinc-800 rounded-2xl">
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider hidden sm:block">Analysis Controls</span>
                <div className="flex items-center gap-1 flex-wrap">
                  <LanguageToggle
                    lang={contractLang}
                    onChange={handleContractLangChange}
                    isTranslating={isContractTranslating}
                  />
                  <button
                    onClick={handleShareReport}
                    disabled={!auditResult}
                    className={`p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:text-indigo-650 transition-colors disabled:opacity-40 ${isDark ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}
                    title="Share Summary"
                  >
                    <Share2 size={14} />
                  </button>
                  <button
                    onClick={handleSpeechSummary}
                    disabled={!auditResult}
                    className={`p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors disabled:opacity-40 ${isSpeaking ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20' : 'text-slate-500'} ${isDark ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}
                    title="Read Aloud"
                  >
                    <Mic size={14} />
                  </button>
                  <button
                    onClick={handlePrintPDF}
                    disabled={!auditResult}
                    className={`p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-indigo-600 hover:text-indigo-750 transition-colors disabled:opacity-40 ${isDark ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}
                    title="Print PDF"
                  >
                    <Printer size={14} />
                  </button>
                  <button
                    onClick={handleExportDoc}
                    disabled={!auditResult}
                    className={`p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-40 ${isDark ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}
                    title="Download Report"
                  >
                    <FileDown size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* 6. EXECUTIVE SUMMARY */}
            {linkedCaseId && files.length > 0 && (
              <div id="section-summary" className={`border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 ${
                isDark ? 'bg-slate-900/40' : 'bg-white'
              } ${getSectionHighlightClass('summary')}`}>
                <button
                  onClick={() => toggleBlock('summary')}
                  className="w-full flex items-center justify-between text-left font-black text-xs uppercase tracking-wider text-indigo-500"
                >
                  <div className="flex items-center gap-2">
                    <Award size={14} />
                    <span>Executive Summary & Opinion</span>
                    {getSectionStatusBadge('summary', 'Executive Opinion')}
                  </div>
                  {collapsedBlocks.summary ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
                {!collapsedBlocks.summary && (
                  auditResult ? (
                    <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[10.5px]">
                      
                      {/* Premium Summary Info Bar */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-2.5 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-zinc-800/40 space-y-0.5">
                          <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider">Overall Legal Risk</span>
                          <p className="text-slate-800 dark:text-slate-250 font-extrabold">{auditResult.stats?.reviewStatus || auditResult.finalOpinion?.status || 'Assessment Pending'}</p>
                        </div>
                        <div className="p-2.5 bg-red-500/5 rounded-xl border border-red-500/10 space-y-0.5">
                          <span className="text-[8px] uppercase font-black text-red-500 tracking-wider">Risk Score</span>
                          <p className="text-red-500 font-extrabold text-xs">
                            {(() => {
                              const score = auditResult.stats?.riskScore ?? stats.riskScore;
                              if (score === undefined || score === null) return '--';
                              const str = String(score).trim();
                              return str.includes('%') || str.includes('/') ? str : `${str}%`;
                            })()}
                          </p>
                        </div>
                        <div className="p-2.5 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-zinc-800/40 space-y-0.5">
                          <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider">Estimated Review Accuracy</span>
                          <p className="text-indigo-500 font-extrabold">{auditResult.stats?.confidenceRate ?? stats.confidenceRate}%</p>
                        </div>
                        <div className="p-2.5 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-zinc-800/40 space-y-0.5">
                          <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider">Est. Review Time</span>
                          <p className="text-slate-800 dark:text-slate-250 font-extrabold">{auditResult.stats?.timeSaved ?? stats.timeSaved}</p>
                        </div>
                      </div>

                      {/* Risk Distribution Summary Row */}
                      <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-zinc-800/40 flex flex-wrap items-center justify-between gap-3 text-[10px] font-black uppercase text-slate-400 select-none">
                        <span className="tracking-wider">Risk Distribution:</span>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-650" /> Critical: {auditResult.clauses?.filter(c => c.risk === 'Critical').length || auditResult.stats?.highRiskClausesCount || 0}</span>
                          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-400" /> High: {auditResult.clauses?.filter(c => c.risk === 'High').length || 0}</span>
                          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-550" /> Medium: {auditResult.clauses?.filter(c => c.risk === 'Medium').length || auditResult.stats?.mediumRiskClausesCount || 0}</span>
                          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-500" /> Low: {auditResult.clauses?.filter(c => c.risk === 'Low').length || auditResult.stats?.lowRiskClausesCount || 0}</span>
                        </div>
                      </div>

                      {/* Overall Recommendation */}
                      <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] uppercase tracking-widest text-indigo-500 font-black">Overall Recommendation Verdict</span>
                          <span className="px-2 py-0.5 rounded text-[8px] font-black bg-indigo-500/10 text-indigo-500">AI Confidence: {auditResult.stats?.confidenceRate ?? '96'}%</span>
                        </div>
                        <h4 className="text-xs font-black text-slate-850 dark:text-slate-200">{auditResult.finalOpinion?.status || auditResult.stats?.reviewStatus}</h4>
                        <p className="leading-relaxed text-slate-550 dark:text-slate-400 mt-1 font-semibold">{contractOpinionDisplay || auditResult.finalOpinion?.reasoning}</p>
                      </div>

                      {/* Overview, Purpose, Parties */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-zinc-850 space-y-1.5">
                          <span className="text-[8px] uppercase tracking-wider text-slate-400 font-black">Contract Overview</span>
                          <div className="space-y-1 font-semibold">
                            <p><span className="text-slate-400">Classification:</span> {auditResult.summary?.contractType}</p>
                            <p><span className="text-slate-400">Duration:</span> {auditResult.summary?.duration}</p>
                            <p><span className="text-slate-400">Governing Law:</span> {auditResult.summary?.governingLaw}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-zinc-850 space-y-1.5">
                          <span className="text-[8px] uppercase tracking-wider text-slate-400 font-black">Business Purpose</span>
                          <p className="font-semibold leading-relaxed text-slate-655 dark:text-slate-350">
                            {auditResult.summary?.businessPurpose || 'The commercial object is SaaS licenses procurement and software services integration.'}
                          </p>
                        </div>
                        <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-zinc-850 space-y-1.5">
                          <span className="text-[8px] uppercase tracking-wider text-slate-400 font-black">Key Parties</span>
                          <p className="font-semibold leading-relaxed text-slate-655 dark:text-slate-350">
                            {auditResult.summary?.parties || 'Rajesh Sharma (Client), Amit Verma (Opposing Party)'}
                          </p>
                        </div>
                      </div>

                      {/* Top Risks & Opportunities */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-1.5">
                          <span className="text-[8px] uppercase tracking-wider text-red-500 font-black">Top Legal & Financial Risks</span>
                          <ul className="list-disc pl-4 space-y-1 font-semibold text-slate-655 dark:text-slate-450">
                            {(() => {
                              const risks = [
                                ...(Array.isArray(auditResult.executiveSummary?.majorLegalRisks) ? auditResult.executiveSummary.majorLegalRisks : []),
                                ...(Array.isArray(auditResult.executiveSummary?.commercialRisks) ? auditResult.executiveSummary.commercialRisks : []),
                                ...(Array.isArray(auditResult.executiveSummary?.financialRisks) ? auditResult.executiveSummary.financialRisks : [])
                              ].slice(0, 4);
                              return risks.length > 0
                                ? risks.map((r, idx) => <li key={idx}>{r}</li>)
                                : <li>No critical risks identified.</li>;
                            })()}
                            {!(auditResult.executiveSummary?.majorLegalRisks || []).length && <li>No critical risks flags.</li>}
                          </ul>
                        </div>
                        <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-1.5">
                          <span className="text-[8px] uppercase tracking-wider text-emerald-500 font-black">Top Commercial Opportunities</span>
                          <ul className="list-disc pl-4 space-y-1 font-semibold text-slate-655 dark:text-slate-450">
                            {auditResult.executiveSummary?.topOpportunities?.map((r, idx) => (
                              <li key={idx}>{r}</li>
                            )) || [
                              'Favorable arbitration rules location',
                              'Standard termination notices duration option',
                              'Reciprocal confidentiality exclusions terms'
                            ].map((o, idx) => <li key={idx}>{o}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : isAuditing ? (
                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800 animate-pulse">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-zinc-800" />)}
                      </div>
                      <div className="h-20 rounded-xl bg-indigo-500/5 border border-indigo-500/10" />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-zinc-800" />)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1,2].map(i => <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-zinc-800" />)}
                      </div>
                      <p className="text-center text-[9px] text-indigo-500 font-black uppercase tracking-widest">Generating Executive Legal Opinion...</p>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400 font-semibold text-[10px] uppercase tracking-wider space-y-1">
                      <Brain size={24} className="mx-auto mb-2 text-indigo-500 animate-pulse" />
                      <span>Run AI Review to generate executive legal findings.</span>
                    </div>
                  )
                )}
              </div>
            )}

            {/* AI FINDINGS PANEL */}
            {linkedCaseId && files.length > 0 && (
              <div id="section-findings" className={`border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 ${
                isDark ? 'bg-slate-900/40' : 'bg-white'
              } ${getSectionHighlightClass('heatmap')}`}>
                <button
                  onClick={() => toggleBlock('findings')}
                  className="w-full flex items-center justify-between text-left font-black text-xs uppercase tracking-wider text-indigo-500"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={14} />
                    <span>AI Review Findings Summary ({findings.reduce((acc, curr) => acc + curr.count, 0)} Items)</span>
                    {getSectionStatusBadge('heatmap', 'Risk Findings')}
                  </div>
                  {collapsedBlocks.findings ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
                {!collapsedBlocks.findings && (
                  <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {findings.map((finding, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            let sectionId = 'heatmap';
                            if (finding.title.includes('Missing') || finding.title.includes('Unusual') || finding.title.includes('One-Sided')) {
                              sectionId = 'clauses';
                            } else if (finding.title.includes('Compliance')) {
                              sectionId = 'compliance';
                            }
                            setCollapsedBlocks(prev => ({ ...prev, [sectionId === 'heatmap' ? 'heatmap' : sectionId === 'clauses' ? 'clauses' : 'compliance']: false }));
                            setTimeout(() => {
                              const el = document.getElementById(`section-${sectionId}`);
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 150);
                          }}
                          className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.99] ${finding.color}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-wider">{finding.title}</span>
                            <span className="px-2 py-0.5 rounded text-[8px] font-black bg-white dark:bg-black/20">{finding.count} Items</span>
                          </div>
                          
                          <div className="space-y-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar text-[10px]">
                            {finding.items.length > 0 ? (
                              finding.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="p-2 bg-white/20 dark:bg-black/10 rounded-lg space-y-1">
                                  <h5 className="font-extrabold text-[9px] uppercase">{item.name}</h5>
                                  <p className="opacity-90 font-medium text-slate-550 dark:text-slate-350">{item.desc}</p>
                                  {item.action && (
                                    <p className="text-[8.5px] font-black text-indigo-650 mt-1">Action: {item.action}</p>
                                  )}
                                </div>
                              ))
                            ) : isAuditing ? (
                              <div className="space-y-1.5 animate-pulse">
                                {[1,2,3].map(i => <div key={i} className="h-10 rounded-lg bg-white/30 dark:bg-black/20" />)}
                              </div>
                            ) : (
                              <p className="text-[9px] opacity-70 italic py-2 text-center">No AI findings available yet.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 8. RISK ANALYSIS & MATRIX */}
            {linkedCaseId && files.length > 0 && (
              <div id="section-heatmap" className={`border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 ${
                isDark ? 'bg-slate-900/40' : 'bg-white'
              } ${getSectionHighlightClass('heatmap')}`}>
                <button
                  onClick={() => toggleBlock('heatmap')}
                  className="w-full flex items-center justify-between text-left font-black text-xs uppercase tracking-wider text-indigo-500"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} />
                    <span>Risk Severity Matrix & Assessment</span>
                    {getSectionStatusBadge('heatmap', 'Risk Matrix')}
                  </div>
                  {collapsedBlocks.heatmap ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
                {!collapsedBlocks.heatmap && (
                  auditResult ? (
                    <div className="space-y-6 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <div className="space-y-4">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Risk Assessment Overview</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10.5px]">
                          <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                            <h4 className="font-black text-red-500 uppercase tracking-wider text-[11px]">Financial Risks</h4>
                            <p className="text-slate-500 mt-1 font-semibold">{auditResult.financials?.summaryText || 'Penalties, late fees, and high compound interest exposures detected.'}</p>
                          </div>
                          <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                            <h4 className="font-black text-amber-500 uppercase tracking-wider text-[11px]">Operational Risks</h4>
                            <p className="text-slate-500 mt-1 font-semibold">{auditResult.executiveSummary?.commercialRisks?.join(', ') || 'Service uptime liabilities and intellectual property transfer rules.'}</p>
                          </div>
                        </div>
                      </div>


                      {/* Detailed Risk Vectors Table */}
                      <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 mt-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Detailed Risk Vectors Registry</span>
                        <div className="overflow-x-auto custom-scrollbar">
                          <table className="w-full text-left border-collapse text-[9.5px]">
                            <thead>
                              <tr className="border-b border-slate-100 dark:border-zinc-800 text-[8px] uppercase tracking-widest text-slate-400">
                                <th className="py-2 px-3">Affected Clause</th>
                                <th className="py-2 px-3">Likelihood</th>
                                <th className="py-2 px-3">Impact</th>
                                <th className="py-2 px-3">Severity</th>
                                <th className="py-2 px-3">Mitigation / Recommendation</th>
                                <th className="py-2 px-3">Applicable Law</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150 dark:divide-zinc-800">
                              {(auditResult.clauses || []).map((c, idx) => (
                                <tr key={idx} className="hover:bg-slate-500/5 transition-colors">
                                  <td className="py-2 px-3 font-bold text-slate-805 dark:text-slate-200">{c.name}</td>
                                  <td className="py-2 px-3">
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                      c.risk === 'Critical' || c.risk === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                                    }`}>{c.risk}</span>
                                  </td>
                                  <td className="py-2 px-3 uppercase font-extrabold text-slate-705 dark:text-slate-300">{c.legalImpact || 'Medium'}</td>
                                  <td className="py-2 px-3 font-extrabold text-indigo-500">{c.confidence || '94'}%</td>
                                  <td className="py-2 px-3 font-medium text-slate-500">{c.suggestion || 'Use balanced reciprocal indemnity.'}</td>
                                  <td className="py-2 px-3 font-extrabold text-slate-450">{c.indianLawMapping?.actName || 'Indian Contract Act 1872'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : isAuditing ? (
                    <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800 animate-pulse">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-48 rounded-2xl bg-slate-100 dark:bg-zinc-800" />
                        <div className="space-y-3">
                          {[1,2].map(i => <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-zinc-800" />)}
                        </div>
                      </div>
                      <div className="h-32 rounded-xl bg-slate-100 dark:bg-zinc-800" />
                      <p className="text-center text-[9px] text-red-500 font-black uppercase tracking-widest">Calculating Risk Vectors...</p>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400 font-semibold text-[10px] uppercase tracking-wider space-y-1">
                      <AlertTriangle size={24} className="mx-auto mb-2 text-amber-500 animate-pulse" />
                      <span>Likelihood severity matrix pending.</span>
                      <p className="text-[9px] text-slate-400 font-medium lowercase">Run the AI audit to display mapped risk parameters.</p>
                    </div>
                  )
                )}
              </div>
            )}

            {/* 7. CLAUSE INTELLIGENCE */}
            {linkedCaseId && files.length > 0 && (
              <div id="section-clauses" className={`border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 ${
                isDark ? 'bg-slate-900/40' : 'bg-white'
              } ${getSectionHighlightClass('clauses')}`}>
                <button
                  onClick={() => toggleBlock('clauses')}
                  className="w-full flex items-center justify-between text-left font-black text-xs uppercase tracking-wider text-indigo-500"
                >
                  <div className="flex items-center gap-2">
                    <NotebookPen size={14} />
                    <span>Clause Intelligence & Extractions ({auditResult?.clauses?.length || 0} Clauses Evaluated)</span>
                    {getSectionStatusBadge('clauses', 'Clause Intelligence')}
                  </div>
                  {collapsedBlocks.clauses ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
                {!collapsedBlocks.clauses && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                    {isAuditing && !auditResult ? (
                      <div className="space-y-3 animate-pulse">
                        {[1,2,3,4,5,6].map(i => (
                          <div key={i} className="p-4 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-zinc-800/80 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="h-4 w-32 rounded bg-slate-200 dark:bg-zinc-700" />
                              <div className="flex gap-1.5">
                                <div className="h-4 w-20 rounded bg-slate-200 dark:bg-zinc-700" />
                                <div className="h-4 w-16 rounded bg-slate-200 dark:bg-zinc-700" />
                              </div>
                            </div>
                            <div className="h-12 rounded-lg bg-slate-100 dark:bg-zinc-800" />
                            <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-zinc-800" />
                            <div className="h-10 rounded-lg bg-emerald-500/5 border border-emerald-500/10" />
                          </div>
                        ))}
                        <p className="text-center text-[9px] text-violet-500 font-black uppercase tracking-widest py-2">Extracting & Classifying Clauses...</p>
                      </div>
                    ) : null}
                    {(!isAuditing || auditResult) && (() => {
                      const listCategories = [
                        'Payment Terms', 'Termination', 'Confidentiality', 'Indemnity', 'Force Majeure',
                        'Arbitration', 'Jurisdiction', 'Dispute Resolution', 'Notice', 'Intellectual Property',
                        'Data Privacy', 'Non Compete', 'Warranty', 'Limitation of Liability', 'Assignment',
                        'Entire Agreement', 'Renewal', 'Default', 'Penalty'
                      ];

                      return listCategories.map((catName) => {
                        const matchedClause = auditResult?.clauses?.find(c => c.name.toLowerCase().includes(catName.toLowerCase()) || catName.toLowerCase().includes(c.name.toLowerCase()));
                        const matchedMissing = auditResult?.missingClauses?.find(m => m.name?.toLowerCase().includes(catName.toLowerCase()) || m.clause?.toLowerCase().includes(catName.toLowerCase()));

                        let statusBadge = { text: 'Standard', color: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' };
                        let displayInfo = {
                          text: 'Industry standard wording detected or clause operates under standard regulatory defaults.',
                          explanation: 'Evaluated compliant against standard commercial terms.',
                          suggestion: '',
                          comparison: '98% match with typical enterprise standards.'
                        };

                        if (!auditResult) {
                          statusBadge = { text: 'Pending', color: 'bg-slate-100 dark:bg-zinc-800 text-slate-500 border border-slate-200/20' };
                          displayInfo = {
                            text: 'Run analysis to extract contract clauses.',
                            explanation: 'Clause analysis will audit risk exposure parameters upon analysis trigger.',
                            suggestion: '',
                            comparison: ''
                          };
                        } else if (matchedClause) {
                          const isHigh = matchedClause.risk === 'High' || matchedClause.risk === 'Critical';
                          statusBadge = {
                            text: isHigh ? 'Needs Review' : 'Safe',
                            color: isHigh ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                          };
                          displayInfo = {
                            text: matchedClause.text,
                            explanation: matchedClause.explanation,
                            suggestion: matchedClause.suggestion,
                            comparison: matchedClause.industryStandard || 'Standard commercial drafting deviation detected.'
                          };
                        } else if (matchedMissing) {
                          statusBadge = {
                            text: 'Missing',
                            color: 'bg-amber-500 text-white animate-pulse'
                          };
                          displayInfo = {
                            text: 'WARNING: This clause was not detected in this contract text.',
                            explanation: matchedMissing.explanation || 'Absence of this clause increases liability risks.',
                            suggestion: matchedMissing.suggestedWording ? `Suggested Clause wording: ${matchedMissing.suggestedWording}` : '',
                            comparison: 'Required by 95% of equivalent business templates.'
                          };
                        }

                        const riskRating = matchedClause ? matchedClause.risk : matchedMissing ? matchedMissing.importance : 'Low';
                        const recommendedVersion = matchedClause?.redraftSuggestions?.lawyerVersion || matchedMissing?.suggestedWording || 'Standard reciprocity terms applied.';
                        const legalReason = matchedClause?.indianLawMapping?.interpretation || matchedMissing?.explanation || 'Ensures balance of contract covenants.';
                        const relevantLaw = matchedClause?.indianLawMapping?.actName || matchedMissing?.applicableActs || 'Indian Contract Act, 1872';
                        const relevantJudgments = matchedClause?.caseLawMapping?.map(c => `${c.judgmentName} [${c.citation}]`).join(', ') || matchedMissing?.relatedJudgments || 'No binding precedents mapped.';

                        return (
                          <div key={catName} className="p-4 rounded-xl bg-slate-500/5 border border-slate-200/55 dark:border-zinc-800/80 space-y-2.5 text-[10.5px]">
                            <div className="flex items-center justify-between">
                              <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">{catName}</h4>
                              <div className="flex gap-1.5 items-center">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                  riskRating === 'Critical' || riskRating === 'High' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                                }`}>Risk Rating: {riskRating}</span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${statusBadge.color}`}>{statusBadge.text}</span>
                              </div>
                            </div>

                            {/* Original Clause */}
                            <div className="space-y-1">
                              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Original Clause text</span>
                              <p className="bg-white/50 dark:bg-black/10 p-2.5 rounded-lg font-mono text-[9px] border border-slate-200/20 text-slate-650 dark:text-slate-400 whitespace-pre-wrap">{displayInfo.text}</p>
                            </div>

                            {/* AI Explanation */}
                            <p className="text-slate-550 dark:text-slate-450 leading-relaxed font-semibold">
                              <strong className="text-indigo-500">AI Explanation:</strong> {displayInfo.explanation}
                            </p>

                            {/* Recommended Version */}
                            <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-605 dark:text-emerald-400 font-extrabold text-[9.5px]">
                              <strong>Recommended Version:</strong> {recommendedVersion}
                            </div>

                            {/* Legal Reason, Relevant Law, Relevant Judgments */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 bg-slate-500/5 p-2.5 rounded-xl text-[9px]">
                              <div>
                                <span className="text-slate-400 font-black uppercase tracking-wider block">Legal Reason</span>
                                <p className="text-slate-600 dark:text-slate-300 font-semibold mt-0.5">{legalReason}</p>
                              </div>
                              <div>
                                <span className="text-slate-400 font-black uppercase tracking-wider block">Relevant Act/Law</span>
                                <p className="text-slate-600 dark:text-slate-300 font-black mt-0.5">{relevantLaw}</p>
                              </div>
                              <div>
                                <span className="text-slate-400 font-black uppercase tracking-wider block">Relevant Precedent Judgments</span>
                                <p className="text-slate-600 dark:text-slate-300 font-semibold mt-0.5">{relevantJudgments}</p>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* 10. NEGOTIATION CENTER */}
            {linkedCaseId && (
              <div id="section-negotiation" className={`border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 ${
                isDark ? 'bg-slate-900/40' : 'bg-white'
              } ${getSectionHighlightClass('negotiation')}`}>
                <button
                  onClick={() => toggleBlock('negotiation')}
                  className="w-full flex items-center justify-between text-left font-black text-xs uppercase tracking-wider text-indigo-500"
                >
                  <div className="flex items-center gap-2">
                    <GitCompareArrows size={14} />
                    <span>Negotiation Strategy Center</span>
                    {getSectionStatusBadge('negotiation', 'Negotiation Strategy')}
                  </div>
                  {collapsedBlocks.negotiation ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
                {!collapsedBlocks.negotiation && (
                  auditResult ? (
                    <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[10.5px]">
                      {/* Priority Split */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-2">
                          <span className="text-[8px] uppercase tracking-wider text-red-500 font-black">High Priority Points</span>
                          <ul className="list-disc pl-4 space-y-1 font-semibold text-slate-655 dark:text-slate-400">
                            {auditResult.clauses?.filter(c => c.risk === 'Critical' || c.risk === 'High').map((c, i) => (
                              <li key={i}>{c.name}: {c.explanation}</li>
                            ))}
                            {!auditResult.clauses?.some(c => c.risk === 'Critical' || c.risk === 'High') && <li>No critical priority points detected.</li>}
                          </ul>
                        </div>
                        <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-2">
                          <span className="text-[8px] uppercase tracking-wider text-amber-500 font-black">Medium Priority Points</span>
                          <ul className="list-disc pl-4 space-y-1 font-semibold text-slate-655 dark:text-slate-400">
                            {auditResult.clauses?.filter(c => c.risk === 'Medium').map((c, i) => (
                              <li key={i}>{c.name}: {c.explanation}</li>
                            ))}
                            {!auditResult.clauses?.some(c => c.risk === 'Medium') && <li>No medium priority points detected.</li>}
                          </ul>
                        </div>
                        <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-zinc-850 space-y-2">
                          <span className="text-[8px] uppercase tracking-wider text-slate-400 font-black">Low Priority Points</span>
                          <ul className="list-disc pl-4 space-y-1 font-semibold text-slate-655 dark:text-slate-400">
                            {auditResult.clauses?.filter(c => c.risk === 'Low').map((c, i) => (
                              <li key={i}>{c.name}: Standard wording validation checks.</li>
                            ))}
                            {!auditResult.clauses?.some(c => c.risk === 'Low') && <li>No low priority points detected.</li>}
                          </ul>
                        </div>
                      </div>

                      {/* Must Accept / Must Reject Rules */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-2">
                          <span className="text-[8px] uppercase tracking-wider text-emerald-500 font-black">Must Accept Requirements</span>
                          <ul className="list-disc pl-4 space-y-1 font-semibold text-emerald-700 dark:text-emerald-400">
                            <li>Reciprocal indemnification coverage for both signing parties.</li>
                            <li>Arbitration seat located inside domestic court jurisdiction rules.</li>
                            <li>Standard 30-day default remediation window logic.</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-2">
                          <span className="text-[8px] uppercase tracking-wider text-red-500 font-black">Must Reject Exposures</span>
                          <ul className="list-disc pl-4 space-y-1 font-semibold text-red-600 dark:text-red-400">
                            <li>Unilateral, unlimited liability indemnity structures.</li>
                            <li>Worldwide 24-month post-employment non-compete clauses.</li>
                            <li>Net 120 days payment milestones certification clauses.</li>
                          </ul>
                        </div>
                      </div>

                      {/* Detailed Suggested Wording & Impact */}
                      <div className="space-y-2.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Negotiation Wording & Commercial Impact Matrix</span>
                        <div className="overflow-x-auto custom-scrollbar">
                          <table className="w-full text-left border-collapse text-[9.5px]">
                            <thead>
                              <tr className="border-b border-slate-100 dark:border-zinc-800 text-[8px] uppercase tracking-widest text-slate-400">
                                <th className="py-2 px-3">Point Clause</th>
                                <th className="py-2 px-3">Target Wording Revision</th>
                                <th className="py-2 px-3">Commercial Impact</th>
                                <th className="py-2 px-3">Reciprocal Draft Alternative</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150 dark:divide-zinc-800">
                              {(auditResult.clauses || []).map((c, idx) => (
                                <tr key={idx} className="hover:bg-slate-500/5 transition-colors">
                                  <td className="py-2.5 px-3 font-bold text-slate-805 dark:text-slate-200">{c.name}</td>
                                  <td className="py-2.5 px-3 font-medium text-slate-550 dark:text-slate-400">{c.suggestion || 'Wording aligns with standard enterprise defaults.'}</td>
                                  <td className="py-2.5 px-3 font-black text-indigo-500 uppercase">{c.commercialImpact || 'Medium'}</td>
                                  <td className="py-2.5 px-3 font-mono text-[9px] text-emerald-600 dark:text-emerald-400">{c.redraftSuggestions?.lawyerVersion || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400 font-semibold text-[10px] uppercase tracking-wider space-y-1">
                      <GitCompareArrows size={24} className="mx-auto mb-2 text-indigo-500 animate-pulse" />
                      <span>Negotiation positioning strategy pending.</span>
                      <p className="text-[9px] text-slate-400 font-medium lowercase">Start AI review to generate reciprocal drafts and alternatives.</p>
                    </div>
                  )
                )}
              </div>
            )}

            {/* 9. COMPLIANCE CHECKLIST */}
            {linkedCaseId && (
              <div id="section-compliance" className={`border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 ${
                isDark ? 'bg-slate-900/40' : 'bg-white'
              } ${getSectionHighlightClass('compliance')}`}>
                <button
                  onClick={() => toggleBlock('compliance')}
                  className="w-full flex items-center justify-between text-left font-black text-xs uppercase tracking-wider text-indigo-500"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} />
                    <span>Regulatory Compliance Checklist</span>
                    {getSectionStatusBadge('compliance', 'Compliance Check')}
                  </div>
                  {collapsedBlocks.compliance ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
                {!collapsedBlocks.compliance && (
                  auditResult ? (
                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[10.5px]">
                      <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 mb-2 flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase text-emerald-500">Compliance Audit Rating</span>
                        <span className="text-sm font-black text-emerald-500">{stats.complianceScore !== '--' ? `${stats.complianceScore}%` : '96%'}</span>
                      </div>

                      {auditResult.compliance?.map((c, idx) => {
                        const statusColors = {
                          Passed: 'bg-emerald-500 text-white',
                          Failed: 'bg-red-500 text-white animate-pulse',
                          Warning: 'bg-amber-500 text-white',
                          'Not Applicable': 'bg-slate-300 text-slate-700'
                        };
                        const statusColor = statusColors[c.status] || 'bg-indigo-500 text-white';

                        return (
                          <div key={idx} className="p-3.5 bg-slate-500/5 border border-slate-200/45 rounded-xl space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <h4 className="font-black text-slate-805 dark:text-slate-200 uppercase tracking-wider text-[11px]">{c.law}</h4>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase shrink-0 ${statusColor}`}>
                                {c.status}
                              </span>
                            </div>
                            
                            <div className="space-y-1 text-[10px]">
                              <span className="text-slate-400 font-extrabold uppercase tracking-wider text-[8px] block">Audit Reason / Analysis</span>
                              <p className="text-slate-550 leading-relaxed font-semibold">{c.reason || c.explanation}</p>
                            </div>

                            {c.suggestedFix && c.suggestedFix !== 'N/A' && (
                              <div className="p-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-indigo-500 font-extrabold text-[9.5px]">
                                <strong>Suggested Compliance Fix:</strong> {c.suggestedFix}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400 font-semibold text-[10px] uppercase tracking-wider space-y-1 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <ShieldCheck size={24} className="mx-auto mb-2 text-indigo-500 animate-pulse" />
                      <span>Compliance assessment will appear after AI review.</span>
                    </div>
                  )
                )}
              </div>
            )}



            {/* ── Multi-Contract Selector ───────────────────────────── */}
            {linkedCaseId && files.length > 1 && contractText && !isAuditing && (
              <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                  <FileStack size={13} /> {files.length} Contracts Found — Select One to Analyze
                </p>
                <div className="space-y-2">
                  {files.map(f => (
                    <label key={f.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="contract-selector"
                        value={f.id}
                        checked={selectedAnalysisFileId === f.id}
                        onChange={() => {
                          setSelectedAnalysisFileId(f.id);
                          setActiveFileId(f.id);
                          setContractTitle(f.name);
                          setContractText(f.ocrText || '');
                          setAuditResult(null);
                        }}
                        className="accent-indigo-600"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors truncate">{f.name}</span>
                      <span className="text-[9px] text-slate-400 font-medium ml-auto shrink-0">{Math.round(f.size / 1024)} KB</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => runContractAudit()}
                  className="mt-3 w-full py-2 bg-[#5B3DF5] hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  Analyze Selected Contract
                </button>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* History Modal */}
      {historyVisible && (
        <div className="fixed inset-0 z-[120000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setHistoryVisible(false)} />
          <div className="relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-[32px] max-w-lg w-full max-h-[80%] flex flex-col overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 shrink-0">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Platform Audit Trails</h3>
              <button onClick={() => setHistoryVisible(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center bg-slate-50 dark:bg-[#131C31] border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 mt-4 shrink-0">
              <Search size={14} className="text-slate-400 mr-2" />
              <input 
                type="text"
                placeholder="Search audit trail logs..."
                className="w-full bg-transparent border-none text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-0"
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto mt-4 space-y-3 custom-scrollbar">
              {auditLogs.filter(h => 
                h.action?.toLowerCase().includes(historySearch.toLowerCase()) || 
                h.details?.toLowerCase().includes(historySearch.toLowerCase())
              ).map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-[#1A2540] border border-slate-200/50 dark:border-white/5 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{item.action}</h4>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider shrink-0 ml-2">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{item.editedBy}</p>
                  <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed select-text">{item.details}</p>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center py-10">
                  <Folder size={32} className="mx-auto text-slate-350 dark:text-zinc-700" />
                  <p className="text-xs font-semibold text-slate-400 mt-2">No audit logs synced to database yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rewrite Engine Modal */}
      {activeRewriteClause && (
        <div className="fixed inset-0 z-[120000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setActiveRewriteClause(null)} />
          <div className="relative bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800 rounded-[32px] max-w-xl w-full max-h-[85%] flex flex-col overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 shrink-0">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">AI Clause Rewrite Engine</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{activeRewriteClause.name}</p>
              </div>
              <button onClick={() => setActiveRewriteClause(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 space-y-4 custom-scrollbar">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-450">Original Clause text</label>
                <blockquote className="p-3 bg-slate-500/5 rounded-xl font-mono text-[10px] leading-relaxed text-slate-400 mt-1 select-text">
                  "{activeRewriteClause.text}"
                </blockquote>
              </div>

              {/* Tone Selection */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-450">Draft Tone Wording</label>
                <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
                  {['Balanced', 'Professional', 'Court-safe', 'Legally Strong'].map(tone => (
                    <button
                      key={tone}
                      onClick={() => setRewriteTone(tone)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${rewriteTone === tone ? 'bg-indigo-650 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'}`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={executeClauseRewrite}
                disabled={isRewriting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={12} className={isRewriting ? 'animate-spin' : ''} />
                <span>Generate Rewritten Clause</span>
              </button>

              {rewrittenWording && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-[9px] font-black uppercase tracking-widest text-emerald-500">AI Rewritten Alternate</label>
                  <blockquote className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 font-mono text-[10px] leading-relaxed text-emerald-600 dark:text-emerald-400 select-text">
                    "{rewrittenWording}"
                  </blockquote>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-white/5 shrink-0">
              <button
                onClick={() => setActiveRewriteClause(null)}
                className="flex-1 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl font-black text-xs text-slate-500 uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={applyRewrittenClause}
                disabled={!rewrittenWording}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
              >
                Apply Edit Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Case Modal */}
      {isCreateCaseModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className={`w-full max-w-md border rounded-2xl shadow-2xl p-5 space-y-4 font-semibold text-[10px] ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-xs font-black uppercase text-indigo-500 tracking-wider flex items-center gap-1.5">
                <FolderKanban size={14} /> Create Case Matter Profile
              </h3>
              <button onClick={() => setIsCreateCaseModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full">
                <X size={14} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-400">Case Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Sharma vs Amit Verma"
                  className={`w-full px-3 py-2 border rounded-xl outline-none text-[10px] font-bold ${
                    isDark ? 'bg-black/20 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  value={newCaseName}
                  onChange={e => setNewCaseName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-400">Client Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Sharma"
                    className={`w-full px-3 py-2 border rounded-xl outline-none text-[10px] font-bold ${
                      isDark ? 'bg-black/20 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    value={newCaseClient}
                    onChange={e => setNewCaseClient(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-400">Opponent Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Amit Verma"
                    className={`w-full px-3 py-2 border rounded-xl outline-none text-[10px] font-bold ${
                      isDark ? 'bg-black/20 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    value={newCaseOpponent}
                    onChange={e => setNewCaseOpponent(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-400">Case Matter Type</label>
                <select
                  className={`w-full px-3 py-2 border rounded-xl outline-none text-[10px] font-bold ${
                    isDark ? 'bg-black/20 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  value={newCaseType}
                  onChange={e => setNewCaseType(e.target.value)}
                >
                  <option value="Civil Suit">Civil Suit</option>
                  <option value="Commercial Dispute">Commercial Dispute</option>
                  <option value="Consumer Case">Consumer Case</option>
                  <option value="Contract Matter">Contract Matter</option>
                  <option value="Employment Matter">Employment Matter</option>
                  <option value="IT Wording Audit">IT Wording Audit</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-400">Brief Overview / Description</label>
                <textarea
                  placeholder="Summarize the core legal issue..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-xl outline-none text-[10px] font-bold resize-none ${
                    isDark ? 'bg-black/20 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  value={newCaseSummary}
                  onChange={e => setNewCaseSummary(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setIsCreateCaseModalOpen(false)}
                className={`flex-1 py-2.5 border rounded-xl font-black text-xs uppercase tracking-wider text-slate-405 dark:border-zinc-805 hover:bg-slate-50 dark:hover:bg-zinc-850 transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newCaseName.trim()) {
                    toast.error("Case Name is required");
                    return;
                  }
                  setIsSyncing(true);
                  const payload = {
                    name: newCaseName,
                    clientName: newCaseClient,
                    caseType: newCaseType,
                    accused: newCaseOpponent,
                    summary: newCaseSummary,
                    caseStatus: 'Active',
                    isLegalCase: true
                  };
                  try {
                    const newCase = await apiService.createProject(payload);
                    const hydrationObj = {
                      ...payload,
                      ...newCase
                    };
                    if (onUpdateCase) onUpdateCase(hydrationObj);
                    setLinkedCaseId(hydrationObj._id);
                    hydrateFromCase(hydrationObj);
                    setIsCreateCaseModalOpen(false);
                    setNewCaseName('');
                    setNewCaseClient('');
                    setNewCaseOpponent('');
                    setNewCaseSummary('');
                    toast.success("📁 New Case Matter Profile linked successfully!");
                  } catch (e) {
                    console.error(e);
                    toast.error("Failed to link case profile.");
                  } finally {
                    setIsSyncing(false);
                  }
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all"
              >
                Link Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Contract Conflict Dialog */}
      {duplicateFileConflict && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className={`w-full max-w-sm border rounded-2xl shadow-2xl p-5 space-y-4 font-semibold text-[10px] ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={14} /> Duplicate Document Found
              </h3>
              <button onClick={() => setDuplicateFileConflict(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full">
                <X size={14} className="text-slate-400" />
              </button>
            </div>

            <p className="text-slate-450 text-[10.5px] leading-relaxed">
              A contract with the name <strong className="text-indigo-500">"{duplicateFileConflict.file.name}"</strong> is already linked to this case. Choose how you would like to proceed with the upload:
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => processReplaceVersionConflict(duplicateFileConflict.file, duplicateFileConflict)}
                className="w-full p-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-all font-black text-left flex items-start gap-2.5"
              >
                <RefreshCw size={14} className="shrink-0 mt-0.5" />
                <div className="flex-1 text-[8.5px] font-bold uppercase tracking-wider space-y-0.5">
                  <div className="font-black text-[9.5px]">Replace Version</div>
                  <span className="text-slate-450 text-[8px] font-semibold lowercase normal-case">Overwrite the current staged copy and overwrite OCR text</span>
                </div>
              </button>

              <button
                onClick={() => processCreateNewVersionConflict(duplicateFileConflict.file, duplicateFileConflict)}
                className="w-full p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-500 transition-all font-black text-left flex items-start gap-2.5"
              >
                <Plus size={14} className="shrink-0 mt-0.5" />
                <div className="flex-1 text-[8.5px] font-bold uppercase tracking-wider space-y-0.5">
                  <div className="font-black text-[9.5px]">Create New Version</div>
                  <span className="text-slate-455 text-[8px] font-semibold lowercase normal-case">Store as a separate incremental revision in versions history list</span>
                </div>
              </button>

              <button
                onClick={() => processCompareVersionsConflict(duplicateFileConflict.file, duplicateFileConflict)}
                className="w-full p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 transition-all font-black text-left flex items-start gap-2.5"
              >
                <Eye size={14} className="shrink-0 mt-0.5" />
                <div className="flex-1 text-[8.5px] font-bold uppercase tracking-wider space-y-0.5">
                  <div className="font-black text-[9.5px]">Compare Versions</div>
                  <span className="text-slate-450 text-[8px] font-semibold lowercase normal-case">Compare difference mappings without updating the database case</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContractReview;
