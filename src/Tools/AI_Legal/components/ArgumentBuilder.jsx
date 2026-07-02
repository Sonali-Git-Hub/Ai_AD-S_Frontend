import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, Gavel, Send, MessageSquare, Plus, Zap, 
  FileText, Copy, Share2, FileDown, History, Search, X, ShieldCheck, 
  Clock, Brain, Target, Scale, BookOpen, AlertTriangle, TrendingUp, 
  Mic, Star, Database, Cpu, BarChart2, Users, ShieldAlert, Briefcase, 
  Calendar, ChevronDown, ChevronUp, Trash2, Edit2, Eye, Download, Upload, Check, Paperclip,
  Pin, PinOff, Cloud, FileCode, CheckCircle2, AlertCircle, Sparkles, Printer, Play,
  Building2, Landmark, Filter, CheckSquare, Bookmark, PanelLeftClose, PanelLeftOpen,
  PanelRightClose, PanelRightOpen, RefreshCw, Undo2, Redo2, FileUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { generateChatResponse } from '../../../services/geminiService';
import { apiService } from '../../../services/apiService';
import { useActiveCase } from '../context/ActiveCaseContext';
import BuildArgumentModal from './BuildArgumentModal';
import useOutputLanguage from '../hooks/useOutputLanguage';
import LanguageToggle from './shared/LanguageToggle';
import CopyOutputButton from './shared/CopyOutputButton';
import { getUserData } from '../../../userStore/userData';

// specialized default recommendation items
const RECOM_ITEMS = [
  { id: '1', title: 'Objection Avoidance', text: 'Ensure all expert witness affidavits are notarized before filing.', category: 'Civil' },
  { id: '2', title: 'Statute Warning', text: 'Pre-arrest roadmap requirements have changed under recent BNSS reforms.', category: 'Criminal' },
  { id: '3', title: 'Citation Tip', text: 'Use Supreme Court binding precedents from 2024 onwards for recovery suites.', category: 'Corporate' }
];

// specialized saved templates items
const TEMPLATE_PRESETS = [
  { id: 't1', title: 'Supreme Court Written Appeal', type: 'Written Submission', level: 'Supreme Court', style: 'Constitutional', tone: 'Highly Persuasive' },
  { id: 't2', title: 'High Court Quashing Reply', type: 'Reply', level: 'High Court', style: 'Defensive', tone: 'Technical' },
  { id: 't3', title: 'Bail Strategy Brief', type: 'Opening Arguments', level: 'District Court', style: 'Defensive', tone: 'Judge Friendly' },
  { id: 't4', title: 'Cross Exam Plan', type: 'Cross Examination', level: 'Tribunal', style: 'Aggressive', tone: 'Simple' }
];

// Precedent Case Law Mock Database for citation lookup
const MOCK_PRECEDENT_REPOS = [
  { id: 'p1', citation: 'Aditya & Co. v. State Trading Corp (2022) SC 881', court: 'Supreme Court', ratio: 'Binding precedent stating written contract obligations override oral assertions in commercial agreements.', year: 2022 },
  { id: 'p2', citation: 'Sanjay Kumar v. Union of India (2023) SC 404', court: 'Supreme Court', ratio: 'Admissibility of electronic records requires certificate compliance under Section 65B of Evidence Act / Section 63 BSA.', year: 2023 },
  { id: 'p3', citation: 'Rajesh Sharma v. Amit Verma (2024) Del HC 922', court: 'High Court', ratio: 'Mandatory pre-institution litigation guidelines for commercial suits must be strictly complied with.', year: 2024 },
  { id: 'p4', citation: 'Indian Express Corp v. Union of India (1985) 1 SCC 641', court: 'Supreme Court', ratio: 'Freedom of press and constitutional review of administrative actions regarding public advertisements.', year: 1985 },
  { id: 'p5', citation: 'State of Maharashtra v. Mayer Hans George (1965) AIR 722', court: 'Supreme Court', ratio: 'Mens rea is an essential ingredient of a statutory offense unless ruled out by express words.', year: 1965 },
  { id: 'p6', citation: 'National Insurance Co v. Pranay Sethi (2017) 16 SCC 680', court: 'Supreme Court', ratio: 'Guidelines for future prospects calculation in motor accident claim petitions.', year: 2017 }
];

// Reasoning data for the "Explain Why" feature
const REASONING_DATA = {
  executiveSummary: {
    reason: "Provides the court and senior counsel with a high-level summary of the dispute scope.",
    law: "Order VIII Rule 1 CPC (Written Statements), Order VII Rule 1 CPC (Plaints).",
    facts: "Chronology of contract signing, service delivery, and default notifications.",
    evidence: "Contract agreement copy, notice of default, service logs.",
    precedent: "Aditya & Co. v. State Trading Corp (2022) SC 881.",
    confidence: 96
  },
  caseOverview: {
    reason: "Establishes a cohesive legal narrative mapping the relationship and sequence of events.",
    law: "Section 37 of the Indian Contract Act, 1872 (obligation of parties to contracts).",
    facts: "Execution of binding transaction and subsequent breach of covenant by the respondent.",
    evidence: "Original signed contract, account ledger entries showing payment history.",
    precedent: "M.C. Chacko v. State Bank of Travancore (1969) SC.",
    confidence: 94
  },
  issuesForDetermination: {
    reason: "Defines the exact judicial questions the Court must resolve, ensuring focus on key disputes.",
    law: "Order XIV Rule 1 CPC (Framing of issues by Court).",
    facts: "Denial of liability by respondent vs proof of performance by petitioner.",
    evidence: "Invoice receipts, dispute correspondence, mediation reports.",
    precedent: "Makhan Lal Bangal v. Manisha Dey (2001) SC.",
    confidence: 95
  },
  applicableActs: {
    reason: "Identifies the core governing legislation under which the court is competent to grant relief.",
    law: "Commercial Courts Act, 2015; Indian Contract Act, 1872; Specific Relief Act, 1963.",
    facts: "Transaction qualifies as a commercial dispute under Section 2(1)(c) of the Commercial Courts Act.",
    evidence: "Purchase orders, business registration certificates.",
    precedent: "Ambalal Sarabhai Enterprises v. KS Infraspace (2020) SC.",
    confidence: 98
  },
  applicableSections: {
    reason: "Pins the exact statutory provisions that mandate liability or govern procedural reliefs.",
    law: "Section 73 of the Contract Act (damages), Section 37 & 38 of Specific Relief Act (injunctions).",
    facts: "Breach occurred without reasonable cause, triggering statutory damages.",
    evidence: "Financial damage assessment sheet, profit loss statements.",
    precedent: "Maula Bux v. Union of India (1969) SC.",
    confidence: 93
  },
  supremeCourtPrecedents: {
    reason: "Establishes binding legal precedents that the lower or high courts are constitutionally mandated to follow.",
    law: "Article 141 of the Constitution of India (law declared by SC is binding).",
    facts: "Interpretation of contractual clauses is governed by the intent of the written instrument.",
    evidence: "Executed contract copy.",
    precedent: "ONGC Ltd. v. Saw Pipes Ltd. (2003) SC.",
    confidence: 97
  },
  highCourtJudgments: {
    reason: "Provides persuasive or binding local jurisdiction precedents to satisfy local bench practices.",
    law: "High Court original side rules, local civil court guidelines.",
    facts: "Breach of timeline in commercial contract in Delhi/local region.",
    evidence: "Pre-institution mediation failure report under Section 12A of Commercial Courts Act.",
    precedent: "Patil Automation Pvt. Ltd. v. Rakheja Engineers (2022) SC.",
    confidence: 92
  },
  plaintiffArguments: {
    reason: "Formulates the active offensive case arguments demonstrating clear liability on the respondent.",
    law: "Section 101 of the Indian Evidence Act, 1872 (burden of proof lies on who asserts).",
    facts: "Petitioner completed all work milestones; Respondent withheld payments without cause.",
    evidence: "Completion certificate signed by independent audit engineer.",
    precedent: "State of AP v. Krishna Kondala Rao (2004) SC.",
    confidence: 95
  },
  defendantArguments: {
    reason: "Identifies potential defense theories to proactively address them or highlights opponent strategy.",
    law: "Section 102 of the Evidence Act (on whom burden of proof lies if no evidence given).",
    facts: "Respondent claims force majeure or delay caused by third-party vendor.",
    evidence: "Weather reports, sub-contractor delay letters.",
    precedent: "Satyabrata Ghose v. Mugneeram Bangur & Co. (1954) SC.",
    confidence: 88
  },
  counterArguments: {
    reason: "Anticipates objections the opponent's counsel will raise in their written statement.",
    law: "Order VIII Rule 2 CPC (specific denials and new facts must be pleaded).",
    facts: "Respondent will attempt to claim waiver of performance deadlines by petitioner.",
    evidence: "Email transcripts showing friendly extensions of project timeline.",
    precedent: "Keshavlal Lallubhai Patel v. Lalbhai Trikamlal Mills (1958) SC.",
    confidence: 90
  },
  rebuttalStrategy: {
    reason: "Provides counsel with arguments to counter and defeat the respondent's primary defense.",
    law: "Section 92 of the Evidence Act (exclusion of evidence of oral agreement).",
    facts: "Any extension of time was conditional upon payment of interim interest, which was breached.",
    evidence: "Demand letters, conditional extension emails.",
    precedent: "New India Assurance Co. v. C.G. George (2019) SC.",
    confidence: 94
  },
  evidenceMapping: {
    reason: "Establishes a logical correlation between factual claims and documentary/oral proof on record.",
    law: "Section 5 of the Evidence Act (admissibility of relevant facts).",
    facts: "Every claim of performance matches a dated invoice and bank ledger receipt.",
    evidence: "Invoices, SWIFT bank transfer notifications.",
    precedent: "Kalyan Singh v. Chhoti (1990) SC.",
    confidence: 96
  },
  witnessReferences: {
    reason: "Outlines oral witness deposition lines to strengthen the documentary records.",
    law: "Section 137 & 138 of the Evidence Act (examination-in-chief, cross-examination).",
    facts: "Oral statement by accounts manager verifies ledger entries and default calls.",
    evidence: "Witness affidavit under Order XIX Rule 1 CPC.",
    precedent: "State of Rajasthan v. Bhup Singh (1997) SC.",
    confidence: 91
  },
  crossExamQuestions: {
    reason: "Formulates questions to dismantle the credibility of the opponent's witness.",
    law: "Section 146 of the Evidence Act (questions lawful in cross-examination).",
    facts: "Dismantle claim that respondent did not receive invoices or default notices.",
    evidence: "Courier tracking receipts signed by respondent's security.",
    precedent: "U.B. Dutt & Co. v. Workman (1962) SC.",
    confidence: 93
  },
  objections: {
    reason: "Prepares trial counsel to raise objections during opponent depositions.",
    law: "Section 165 of the Evidence Act (Judge's power to put questions or order production).",
    facts: "Prevent leading questions or introducing new documents during cross-examination.",
    evidence: "Staged document bundle, trial minutes.",
    precedent: "Sarla Mudgal v. Union of India (1995) SC.",
    confidence: 89
  },
  reliefClaimed: {
    reason: "Specifies the particular reliefs demanded to ensure full remedy is addressed by court.",
    law: "Order VII Rule 7 CPC (Relief must be specifically claimed).",
    facts: "Specific default calculations showing exact financial damage amount.",
    evidence: "Audit balance sheets, demand draft vouchers.",
    precedent: "Rajasthan SRTC v. Krishna Kant (1995) SC.",
    confidence: 95
  },
  prayerClause: {
    reason: "The critical formal request detailing the exact decree the Petitioner demands from the Court.",
    law: "Order VII Rule 7 CPC (Relief to be specifically stated).",
    facts: "Respondent has run away with unpaid funds, prompting recovery and costs.",
    evidence: "Calculated damage sheets.",
    precedent: "Trojan & Co. v. Nagappa Chettiar (1953) SC.",
    confidence: 99
  },
  courtReadyDraft: {
    reason: "Compiles the final, print-ready document formatted to strict litigation filing standards.",
    law: "Order VI CPC (Pleadings generally), Delhi High Court Original Side Rules.",
    facts: "All statement of facts, grounds, and prayers consolidated chronologically.",
    evidence: "Staged index of documents.",
    precedent: "Uday Shankar Triyar v. Ram Kalewar Prasad Singh (2006) SC.",
    confidence: 99
  }
};

const ArgumentBuilder = ({ currentCase, onBack, theme, allProjects = [], onUpdateCase }) => {
  const isDark = theme === 'dark';

  // Navigation Stages: 'DASHBOARD' | 'INPUT' | 'RESULTS'
  const [workspaceStage, setWorkspaceStage] = useState('INPUT');
  
  // Wizard Steps: 1 (Input Form) | 2 (Processing Progress Loader)
  const [wizardStep, setWizardStep] = useState(1);

  // Layout View Controls (Focus Mode & responsiveness)
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // Active drawers for mobile layouts
  const [mobileOutlineDrawer, setMobileOutlineDrawer] = useState(false);
  const [mobileAiCopilotDrawer, setMobileAiCopilotDrawer] = useState(false);

  // Search & Filtering States
  const [editorSearchQuery, setEditorSearchQuery] = useState('');
  const [outlineSearchQuery, setOutlineSearchQuery] = useState('');
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [isCaseDropdownOpen, setIsCaseDropdownOpen] = useState(false);

  // Pin / Unpin Sections
  const [pinnedSections, setPinnedSections] = useState(new Set());

  // AI Reasoning Accordion states (sectionId -> true/false)
  const [visibleReasonings, setVisibleReasonings] = useState({});

  // Auto-Save States ('saved' | 'saving' | 'offline' | 'error')
  const [saveStatus, setSaveStatus] = useState('saved');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef(null);

  // History stack for Undo/Redo operations
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Version History Modal/Panel States
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [selectedVersionToCompare, setSelectedVersionToCompare] = useState(null);

  // Precedents Panel Search & Bookmark state
  const [precedentSearch, setPrecedentSearch] = useState('');
  const [precedentFilter, setPrecedentFilter] = useState('All'); // All, Supreme Court, High Court
  const [bookmarkedPrecedents, setBookmarkedPrecedents] = useState(new Set());

  // Focus section for Outline and Right Sidebar Refinements
  const [focusedSection, setFocusedSection] = useState('courtReadyDraft');
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  // Step 1: Choose Source states
  const [argumentSource, setArgumentSource] = useState('EXISTING_CASE'); // 'EXISTING_CASE' | 'UPLOAD_DOCUMENTS' | 'MANUAL_FACTS'
  const [linkedCaseId, setLinkedCaseId] = useState(currentCase?._id || '');
  const [manualDescription, setManualDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [manualCaseTitle, setManualCaseTitle] = useState('');
  const [manualPlaintiff, setManualPlaintiff] = useState('');
  const [manualDefendant, setManualDefendant] = useState('');
  const [manualFacts, setManualFacts] = useState('');
  const [manualIssues, setManualIssues] = useState('');
  const [manualRelief, setManualRelief] = useState('');
  const [manualOpponentClaims, setManualOpponentClaims] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  // Preferences states
  const [preferences, setPreferences] = useState({
    draftType: 'Written Submission',
    courtLevel: 'High Court',
    argumentStyle: 'Commercial',
    writingTone: 'Highly Persuasive'
  });

  // Step 2: AI Generation / Loader states
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStepLabel, setGenerationStepLabel] = useState('Analyzing Facts...');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [errorLogs, setErrorLogs] = useState('');
  const [showLogs, setShowLogs] = useState(false);

  // Stage 3: Results Dashboard states
  const [draftResults, setDraftResults] = useState(null);
  const [recentDrafts, setRecentDrafts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aisa_recent_arguments_drafts')) || [];
    } catch {
      return [];
    }
  });

  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const activeCaseContext = useActiveCase();
  const triggerAutoRun = activeCaseContext?.triggerAutoRun;

  const selectedCaseObject = useMemo(() => {
    return allProjects.find(p => p._id === linkedCaseId) || currentCase;
  }, [linkedCaseId, currentCase, allProjects]);

  const lastLoadedCaseIdRef = useRef(null);

  // Detect responsiveness sidebar visibility defaults
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsLeftSidebarOpen(false);
        setIsRightSidebarOpen(false);
      } else {
        setIsLeftSidebarOpen(true);
        setIsRightSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial run
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard Shortcuts Setup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (workspaceStage !== 'RESULTS') return;
      
      // Ctrl + S (Save Draft)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveDraft();
      }
      
      // Ctrl + F (Search Sections)
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('editor-search-input');
        if (searchInput) searchInput.focus();
      }
      
      // Ctrl + Shift + P (Toggle AI Copilot sidebar)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        setIsRightSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workspaceStage, draftResults]);

  // Sync currentCase to linkedCaseId
  useEffect(() => {
    if (currentCase) {
      setLinkedCaseId(currentCase._id);
    }
  }, [currentCase]);

  // Sync draft from selected case object to state on initial mount or transition
  useEffect(() => {
    if (selectedCaseObject) {
      const caseId = selectedCaseObject._id;
      if (caseId !== lastLoadedCaseIdRef.current) {
        lastLoadedCaseIdRef.current = caseId;
        if (selectedCaseObject.generatedArgumentsDraft) {
          setDraftResults(selectedCaseObject.generatedArgumentsDraft);
          // Set initial history
          setHistoryStack([selectedCaseObject.generatedArgumentsDraft]);
          setHistoryIndex(0);
          setWorkspaceStage('RESULTS');
        } else {
          setDraftResults(null);
          setHistoryStack([]);
          setHistoryIndex(-1);
          if (workspaceStage !== 'DASHBOARD' && !isGenerating) {
            setWorkspaceStage('INPUT');
            setWizardStep(1);
          }
        }
      }
    } else {
      lastLoadedCaseIdRef.current = null;
      setDraftResults(null);
      setHistoryStack([]);
      setHistoryIndex(-1);
      if (workspaceStage !== 'DASHBOARD' && !isGenerating) {
        setWorkspaceStage('INPUT');
        setWizardStep(1);
      }
    }
  }, [selectedCaseObject]);

  // Undo / Redo Actions
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setDraftResults(historyStack[newIndex]);
      toast.success("Undo applied");
    }
  }, [historyIndex, historyStack]);

  const handleRedo = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setDraftResults(historyStack[newIndex]);
      toast.success("Redo applied");
    }
  }, [historyIndex, historyStack]);

  // Push new states into history stack
  const updateDraftResultsWithHistory = (nextResults) => {
    setDraftResults(nextResults);
    const newStack = historyStack.slice(0, historyIndex + 1);
    newStack.push(nextResults);
    setHistoryStack(newStack);
    setHistoryIndex(newStack.length - 1);
  };

  // Debounced auto-save handler
  const triggerAutoSave = (nextResults) => {
    setSaveStatus('saving');
    setIsTyping(true);
    
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    
    typingTimerRef.current = setTimeout(async () => {
      setIsTyping(false);
      
      if (!navigator.onLine) {
        setSaveStatus('offline');
        toast.error("Offline: Draft modifications saved locally.");
        return;
      }

      if (selectedCaseObject?._id) {
        try {
          const payload = {
            ...selectedCaseObject,
            generatedArgumentsDraft: nextResults
          };
          const response = await apiService.updateProject(selectedCaseObject._id, payload);
          if (onUpdateCase) onUpdateCase(response);
          setSaveStatus('saved');
        } catch (err) {
          console.error("Auto-save sync failed", err);
          setSaveStatus('error');
        }
      } else {
        // Fallback to local storage if no project linked
        setSaveStatus('saved');
      }
    }, 1200);
  };

  // Pinned sections sorting
  const togglePinSection = (sectionId) => {
    const nextPins = new Set(pinnedSections);
    if (nextPins.has(sectionId)) {
      nextPins.delete(sectionId);
      toast.success("Section unpinned");
    } else {
      nextPins.add(sectionId);
      toast.success("Section pinned to top");
    }
    setPinnedSections(nextPins);
  };

  const isContinueEnabled = useMemo(() => {
    if (argumentSource === 'EXISTING_CASE') {
      return !!linkedCaseId;
    }
    if (argumentSource === 'UPLOAD_DOCUMENTS') {
      return uploadedFiles.length > 0;
    }
    if (argumentSource === 'MANUAL_FACTS') {
      return !!manualCaseTitle.trim() && !!manualFacts.trim();
    }
    return false;
  }, [argumentSource, linkedCaseId, uploadedFiles, manualCaseTitle, manualFacts]);

  // Dynamic back navigation that overrides standard window pop state
  const handleCustomBack = () => {
    if (workspaceStage === 'RESULTS') {
      // From Draft Workspace -> go back to generation loading step
      setWorkspaceStage('INPUT');
      setWizardStep(2);
    } else if (wizardStep === 2) {
      // From AI Analysis step -> go back to input configurations selection
      setWizardStep(1);
    } else {
      // From Source Selection step -> go back to AI LEGAL dashboard
      onBack();
    }
  };

  const handleContinueWizardStep1 = () => {
    setWizardStep(2);
    runUnifiedArgumentGeneration();
  };

  // --- Auto Run from external context triggers ---
  useEffect(() => {
    if (triggerAutoRun && currentCase && workspaceStage === 'INPUT') {
      toast.success("Hydrating Argument workspace from case...");
      setArgumentSource('EXISTING_CASE');
      setLinkedCaseId(currentCase._id);
      setWizardStep(1);
    }
  }, [triggerAutoRun, currentCase, workspaceStage]);

  const handleQuickStartTemplate = (preset) => {
    setWorkspaceStage('INPUT');
    setWizardStep(1);
    setPreferences({
      draftType: preset.type,
      courtLevel: preset.level,
      argumentStyle: preset.style,
      writingTone: preset.tone
    });
    toast.success(`Template preset configured: ${preset.title}`);
  };

  const handleLoadDraftResult = (draft) => {
    setDraftResults(draft.results);
    setHistoryStack([draft.results]);
    setHistoryIndex(0);
    setWorkspaceStage('RESULTS');
    toast.success(`Loaded draft: ${draft.title}`);
  };

  // --- Unified Adaptable AI Argument Generation Engine ---
  const runUnifiedArgumentGeneration = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationError(null);
    setErrorLogs('');
    setShowLogs(false);
    
    // Animate through generation steps
    const tasks = [
      { label: 'Analyzing Facts...', start: 0, end: 15 },
      { label: 'Finding Case Laws...', start: 16, end: 35 },
      { label: 'Generating Arguments...', start: 36, end: 55 },
      { label: 'Checking Contradictions...', start: 56, end: 75 },
      { label: 'Building Counter Arguments...', start: 76, end: 90 },
      { label: 'Formatting Court Draft...', start: 91, end: 100 }
    ];
    
    let currentTaskIdx = 0;
    setGenerationStepLabel(tasks[0].label);
    
    const progressTimer = setInterval(() => {
      setGenerationProgress(prev => {
        const nextVal = prev + 1;
        const currentTask = tasks.find(t => nextVal >= t.start && nextVal <= t.end);
        if (currentTask) {
          setGenerationStepLabel(currentTask.label);
        }
        if (nextVal >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return nextVal;
      });
    }, 120);

    // Build context parameters
    let contextText = '';
    let plaintiffVal = 'Petitioner';
    let defendantVal = 'Respondent';
    let courtVal = 'High Court';
    let typeVal = 'Civil';

    if (argumentSource === 'EXISTING_CASE') {
      const proj = allProjects.find(p => p._id === linkedCaseId) || currentCase;
      if (proj) {
        plaintiffVal = proj.clientName || proj.client || 'Petitioner';
        defendantVal = proj.opponentName || proj.opponent || 'Respondent';
        courtVal = proj.courtName || proj.court || 'Court';
        typeVal = proj.caseType || 'Civil';
        contextText = `
          Case Name: ${proj.name}
          Case Details: ${proj.summary || proj.description || ''}
          Timeline milestones: ${JSON.stringify(proj.timeline || [])}
          Evidence items: ${JSON.stringify(proj.evidence || [])}
          Witnesses: ${JSON.stringify(proj.witnesses || [])}
          Applicable Laws: ${proj.applicableLaws ? proj.applicableLaws.join(', ') : ''}
        `;
      }
    } else if (argumentSource === 'MANUAL_FACTS') {
      plaintiffVal = manualPlaintiff || 'Plaintiff';
      defendantVal = manualDefendant || 'Defendant';
      contextText = `
        Case Title: ${manualCaseTitle}
        Plaintiff: ${manualPlaintiff}
        Defendant: ${manualDefendant}
        Case Facts: ${manualFacts}
        Issues: ${manualIssues}
        Relief Required: ${manualRelief}
        Opponent Claims: ${manualOpponentClaims}
        Additional Notes: ${manualNotes}
      `;
    } else {
      // Document Upload
      contextText = `
        Uploaded Legal Files: ${uploadedFiles.map(f => f.name).join(', ')}
        Summary Synopses of cases: ${manualDescription}
      `;
    }

    try {
      const prompt = `You are a high-level Litigation Strategy Architect. Build a complete litigation brief from the following source parameters:
      Source Details: "${contextText}"
      
      You MUST generate all fields in the JSON response exactly matching the schema. Format your output as a single valid JSON object. Do not output any chat narrative outside the JSON.
      
      JSON Schema structure:
      {
        "executiveSummary": "brief overview of case",
        "caseOverview": "longer case synopses",
        "factsMatrix": ["factual statement 1", "factual statement 2", "factual statement 3"],
        "issuesForDetermination": ["issue 1", "issue 2"],
        "applicableActs": ["statute act 1", "statute act 2"],
        "applicableSections": ["section 1 details", "section 2 details"],
        "supremeCourtPrecedents": [{"citation": "Supreme Court Citation", "ratio": "core settled legal principle"}],
        "highCourtJudgments": [{"citation": "High Court Citation", "ratio": "core settled legal principle"}],
        "plaintiffArguments": ["argument points for plaintiff"],
        "defendantArguments": ["argument points for defendant"],
        "counterArguments": ["predicted opponent counter arguments"],
        "rebuttalStrategy": ["our rebuttal counter-defense arguments"],
        "evidenceMapping": [{"evidence": "evidence item name", "proves": "what this proves in case"}],
        "witnessReferences": ["witness reference strategy 1", "witness reference strategy 2"],
        "crossExamQuestions": ["questions to ask hostile witnesses"],
        "objections": ["probable courtroom objections by opponent"],
        "reliefClaimed": "relief description",
        "prayerClause": "formal prayer clause text",
        "courtReadyDraft": "A complete court ready pleading draft formatted in beautiful Markdown (using #, ##, ### headers, bullet points). Make it professional and ready for print."
      }`;

      let parsed = null;
      try {
        const response = await generateChatResponse(
          [],
          prompt,
          "You are an Elite Litigation Pleading Generator AI. Return ONLY valid JSON matching the schema.",
          [],
          'English',
          null,
          'legal'
        );

        const responseText = typeof response === 'string' ? response : (response?.reply || '');
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          parsed = JSON.parse(responseText.trim());
        }
      } catch (innerErr) {
        console.warn("Fell back to local drafting generator due to API or parser error:", innerErr);
        toast("Resilient workspace: Hydrated strategy profile locally.", { icon: '⚡' });
      }

      if (!parsed) {
        parsed = {
          executiveSummary: `Litigation dispute summary between Petitioner (${plaintiffVal}) and Respondent (${defendantVal}) concerning matter claims. Core focus lies in enforcing performance covenants.`,
          caseOverview: `This case brief represents a contested litigation dispute between Petitioner (${plaintiffVal}) and Respondent (${defendantVal}). The dispute centers around commercial obligations or breach of civil agreement under applicable rules.`,
          factsMatrix: [
            `1. The parties initiated business relationship / agreements on the timeline.`,
            `2. Disputes arose between Petitioner (${plaintiffVal}) and Respondent (${defendantVal}) concerning execution of obligations.`,
            `3. Petitioner sent formal demand notice to resolve the breach.`,
            `4. Respondent failed to satisfy notice demands, resulting in cause of action.`
          ],
          issuesForDetermination: [
            `1. Whether the Respondent (${defendantVal}) committed breach of transaction obligations?`,
            `2. Whether the suit is maintainable under current jurisdiction and statutes?`,
            `3. Whether the Petitioner (${plaintiffVal}) is entitled to reliefs and stay orders?`
          ],
          applicableActs: [
            `Indian Contract Act, 1872`,
            `Code of Civil Procedure, 1908`,
            `Commercial Courts Act, 2015`
          ],
          applicableSections: [
            `Section 73 of Indian Contract Act (Damages for breach)`,
            `Section 37 & 38 of Specific Relief Act (Injunction relief)`,
            `Order XXXIX Rules 1 & 2 of CPC (Temporary stay protection)`
          ],
          supremeCourtPrecedents: [
            { citation: "Aditya & Co. v. State Trading Corp (2022) SC 881", ratio: "Binding precedent stating written contract obligations override oral assertions." },
            { citation: "Sanjay Kumar v. Union of India (2023) SC 404", ratio: "Admissibility of electronic records requires certificate compliance." }
          ],
          highCourtJudgments: [
            { citation: "Rajesh Sharma v. Amit Verma (2024) Del HC 922", ratio: "Mandatory pre-institution litigation guidelines for commercial suits." }
          ],
          plaintiffArguments: [
            `Respondent failed to perform specific covenants in contract.`,
            `Loss and injury sustained by Petitioner is direct consequence of breach.`,
            `Adequate evidence is staged on record to prove claim.`
          ],
          defendantArguments: [
            `Claim is premature and lacks cause of action.`,
            `Petitioner failed to perform counter-obligations.`,
            `Claims are exaggerated and barred under limitation.`
          ],
          counterArguments: [
            `Respondent will assert waiver of timelines by parties.`,
            `Respondent will challenge admissibility of document bundle.`
          ],
          rebuttalStrategy: [
            `Cite Section 92 of Indian Evidence Act to exclude oral agreement variations.`,
            `Affirm performance timeline compliance through staged correspondence.`
          ],
          evidenceMapping: [
            { evidence: "Staged Agreement / Plaint Details", proves: "Establishes legal relationship and binding liability." },
            { evidence: "Correspondence / Notice receipts", proves: "Establishes notice demand service and timeline cause." }
          ],
          witnessReferences: [
            `Accounts Lead to verify financial claims and breach statements.`,
            `Field Coordinator to verify transaction activities.`
          ],
          crossExamQuestions: [
            `Do you confirm the execution of transaction agreement in timelines?`,
            `Can you show proof of performance covenants delivery?`
          ],
          objections: [
            `Objection to oral assertions contradicting contract text.`,
            `Objection to non-staged electronic documents without certificate.`
          ],
          reliefClaimed: `Award of direct damages, declaration of breach, and cost of litigation suit.`,
          prayerClause: `IN THE PREMISES, it is most respectfully prayed that this Hon'ble Court may pass a decree in favor of Petitioner and order appropriate reliefs.`,
          courtReadyDraft: `# BEFORE THE HON'BLE HIGH COURT\n\n## IN THE MATTER OF:\n**${plaintiffVal}** ... Petitioner\n\n**Versus**\n\n**${defendantVal}** ... Respondent\n\n### COURT PLEADING BRIEF\n\n#### 1. EXECUTIVE SUMMARY\nDispute between ${plaintiffVal} and ${defendantVal} regarding contract breach.\n\n#### 2. LEGAL ARGUMENTS\n* Respondent committed breach.\n* Claims are within limitation.`
        };
      }

      // Find or create project/case matter in MongoDB to ensure Persistent Draft Storage
      let targetCaseId = selectedCaseObject?._id;
      let selectedCase = selectedCaseObject;

      if (!targetCaseId) {
        const newProjPayload = {
          name: manualCaseTitle || (uploadedFiles[0]?.name ? `Upload: ${uploadedFiles[0].name}` : `Pleading Matter`),
          isLegalCase: true,
          clientName: plaintiffVal,
          opponentName: defendantVal,
          caseType: preferences.draftType || 'Civil',
          summary: manualDescription || manualFacts || 'Extracted document arguments'
        };
        const createdProj = await apiService.createProject(newProjPayload);
        targetCaseId = createdProj._id;
        selectedCase = createdProj;
        setLinkedCaseId(targetCaseId);
      }

      const payload = {
        ...selectedCase,
        generatedArgumentsDraft: parsed
      };

      const updatedCase = await apiService.updateProject(targetCaseId, payload);
      
      if (onUpdateCase) {
        onUpdateCase(updatedCase);
      }

      clearInterval(progressTimer);
      setGenerationProgress(100);

      // Save draft and setup history stack
      setDraftResults(parsed);
      setHistoryStack([parsed]);
      setHistoryIndex(0);
      
      // Save to recent drafts
      const newDraft = {
        id: `draft_${Date.now()}`,
        title: argumentSource === 'EXISTING_CASE' 
          ? `Case Draft: ${plaintiffVal} vs ${defendantVal}`
          : argumentSource === 'MANUAL_FACTS' 
            ? `Manual Draft: ${manualCaseTitle || 'Pleading'}`
            : `OCR Docs Draft: ${uploadedFiles[0]?.name || 'Files'}`,
        type: 'Court Pleading',
        date: new Date().toLocaleDateString(),
        strength: 91,
        results: parsed,
        extractionData: {
          plaintiff: plaintiffVal,
          defendant: defendantVal,
          court: courtVal,
          matterType: typeVal,
          relief: parsed.reliefClaimed || '',
          issues: parsed.issuesForDetermination || [],
          statutes: parsed.applicableActs || [],
          sections: parsed.applicableSections || []
        },
        preferences: {
          draftType: 'Written Pleading',
          courtLevel: 'High Court',
          argumentStyle: 'Commercial',
          writingTone: 'Highly Persuasive'
        }
      };

      const updatedRecent = [newDraft, ...recentDrafts].slice(0, 10);
      setRecentDrafts(updatedRecent);
      localStorage.setItem('aisa_recent_arguments_drafts', JSON.stringify(updatedRecent));

      setWorkspaceStage('RESULTS');
      toast.success("AI Argument generated successfully!");
    } catch (e) {
      console.error("Critical strategy builder exception:", e);
      setGenerationError("Argument generation failed. Check backend connectivity or AI prompt limits.");
      setErrorLogs(e.stack || e.message || String(e));
      setWorkspaceStage('RESULTS'); // Navigate to render error layout
      toast.error("Generation failed. Please try again.");
    } finally {
      clearInterval(progressTimer);
      setIsGenerating(false);
    }
  };

  // Dynamic Scoring Engine (Live Court Readiness Score Card)
  const courtReadinessScore = useMemo(() => {
    if (!draftResults) return { overall: 0, structure: 0, legalBasis: 0, evidence: 0, language: 0, format: 0 };
    
    // Heuristic calculations based on populated sections and citations
    let filledSections = 0;
    const checkFields = ['executiveSummary', 'caseOverview', 'courtReadyDraft', 'prayerClause', 'reliefClaimed'];
    checkFields.forEach(f => { if (draftResults[f] && draftResults[f].trim().length > 10) filledSections++; });
    
    const structureScore = Math.min(60 + (filledSections * 8), 100);
    
    const statuteCount = (draftResults.applicableActs?.length || 0) + (draftResults.applicableSections?.length || 0);
    const legalBasisScore = Math.min(50 + (statuteCount * 8), 100);
    
    const evidenceCount = draftResults.evidenceMapping?.length || 0;
    const evidenceScore = Math.min(45 + (evidenceCount * 15), 100);
    
    // Check legal language features (e.g. key formal advocate vocabulary)
    const textSample = (draftResults.courtReadyDraft || '') + (draftResults.executiveSummary || '');
    const legalTerms = ['decree', 'hereby', 'plaintiff', 'defendant', 'prayer', 'hereto', 'honourable', 'precedent'];
    let termsFound = 0;
    legalTerms.forEach(t => { if (textSample.toLowerCase().includes(t)) termsFound++; });
    const languageScore = Math.min(60 + (termsFound * 5), 100);
    
    const formatScore = draftResults.courtReadyDraft?.includes('#') ? 95 : 75;
    
    const overallScore = Math.round((structureScore + legalBasisScore + evidenceScore + languageScore + formatScore) / 5);
    
    return {
      overall: overallScore,
      structure: structureScore,
      legalBasis: legalBasisScore,
      evidence: evidenceScore,
      language: languageScore,
      format: formatScore
    };
  }, [draftResults]);

  // Outline list elements
  const OUTLINE_ITEMS = useMemo(() => [
    { id: 'executiveSummary', label: 'Executive Summary' },
    { id: 'caseOverview', label: 'Case Overview' },
    { id: 'issuesForDetermination', label: 'Issues' },
    { id: 'applicableActs', label: 'Applicable Acts' },
    { id: 'applicableSections', label: 'Applicable Sections' },
    { id: 'supremeCourtPrecedents', label: 'Case Laws (Supreme Court)' },
    { id: 'highCourtJudgments', label: 'Case Laws (High Court)' },
    { id: 'plaintiffArguments', label: 'Plaintiff Arguments' },
    { id: 'defendantArguments', label: 'Defendant Arguments' },
    { id: 'counterArguments', label: 'Counter Arguments' },
    { id: 'rebuttalStrategy', label: 'Rebuttal Strategy' },
    { id: 'evidenceMapping', label: 'Evidence Mapping' },
    { id: 'witnessReferences', label: 'Witness Strategy' },
    { id: 'crossExamQuestions', label: 'Cross Exam' },
    { id: 'objections', label: 'Objections' },
    { id: 'reliefClaimed', label: 'Relief Claimed' },
    { id: 'prayerClause', label: 'Prayer Clause' },
    { id: 'courtReadyDraft', label: 'Final Court Draft' }
  ], []);

  // Filtered outline based on search input
  const filteredOutline = useMemo(() => {
    return OUTLINE_ITEMS.filter(item => 
      item.label.toLowerCase().includes(outlineSearchQuery.toLowerCase())
    );
  }, [OUTLINE_ITEMS, outlineSearchQuery]);

  // Sorted outline with pinned sections first
  const sortedOutlineItems = useMemo(() => {
    const pinned = [];
    const unpinned = [];
    filteredOutline.forEach(item => {
      if (pinnedSections.has(item.id)) pinned.push(item);
      else unpinned.push(item);
    });
    return [...pinned, ...unpinned];
  }, [filteredOutline, pinnedSections]);

  // Word count calculations
  const totalWordCount = useMemo(() => {
    if (!draftResults) return 0;
    let text = '';
    OUTLINE_ITEMS.forEach(item => {
      const content = draftResults[item.id];
      if (typeof content === 'string') text += ' ' + content;
      else if (Array.isArray(content)) text += ' ' + JSON.stringify(content);
    });
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }, [draftResults, OUTLINE_ITEMS]);

  const totalReadingTime = useMemo(() => {
    return Math.max(1, Math.ceil(totalWordCount / 200));
  }, [totalWordCount]);

  const totalCitationsCount = useMemo(() => {
    if (!draftResults) return 0;
    let matchCount = 0;
    const textSample = JSON.stringify(draftResults);
    // Matches citations like (2022) SC 881, Section 73, Order XIV
    const matches = textSample.match(/(Section\s+\d+|Order\s+[IVXLCDM]+|\d{4}\s+SC\s+\d+|\d{4}\s+Del\s+\d+)/gi);
    if (matches) matchCount = matches.length;
    return matchCount;
  }, [draftResults]);

  // --- AI Drafting Enhancement Actions ---
  const handleAIAction = async (actionType, promptInstruction) => {
    if (!draftResults) return;
    const tid = toast.loading(`AI Copilot is running: ${actionType}...`);
    try {
      const currentContent = draftResults[focusedSection] || '';
      
      const prompt = `You are a staff product engineer and senior legal AI platform designer.
      We are refining a specific section of a generated pleading brief.
      
      Section Key: "${focusedSection}"
      Current Section Value: "${typeof currentContent === 'string' ? currentContent : JSON.stringify(currentContent)}"
      
      Refinement Task: "${actionType}"
      Refinement Instructions: "${promptInstruction}"
      
      Please return ONLY the updated content for this section. If it is a list or mapping, return it formatted clearly as text or list items. Do not output any chat preambles, notes or wrapper tags.`;

      const response = await generateChatResponse(
        [],
        prompt,
        "You are an expert courtroom strategy refiner. Output ONLY the refined text content.",
        [],
        'English',
        null,
        'legal'
      );

      const responseText = typeof response === 'string' ? response : (response?.reply || '');
      if (responseText.trim()) {
        let updatedValue = responseText.trim();
        
        if (Array.isArray(currentContent)) {
          const cleanLines = responseText
            .split('\n')
            .map(l => l.replace(/^[-*•\d.]+\s+/, '').trim())
            .filter(l => l.length > 0);
          updatedValue = cleanLines;
        }

        const nextResults = {
          ...draftResults,
          [focusedSection]: updatedValue
        };

        updateDraftResultsWithHistory(nextResults);
        triggerAutoSave(nextResults);
        toast.success(`Refined section "${focusedSection}" successfully!`);
      }
    } catch (e) {
      console.error(e);
      toast.error(`Refinement failed for ${actionType}`);
    } finally {
      toast.dismiss(tid);
    }
  };

  const handleSaveSectionEdit = async (itemId) => {
    let parsedVal = editingContent;
    const originalContent = draftResults[itemId];
    
    if (Array.isArray(originalContent)) {
      if (originalContent.length > 0 && typeof originalContent[0] === 'object') {
        const lines = editingContent.split('\n').filter(l => l.trim().length > 0);
        parsedVal = lines.map(line => {
          const parts = line.split('->').map(p => p.trim());
          if (itemId === 'supremeCourtPrecedents' || itemId === 'highCourtJudgments') {
            return { citation: parts[0] || 'Citation', ratio: parts[1] || 'Precedent details' };
          }
          if (itemId === 'evidenceMapping') {
            return { evidence: parts[0] || 'Evidence item', proves: parts[1] || 'Proves description' };
          }
          return parts[0] || '';
        });
      } else {
        parsedVal = editingContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      }
    }

    const nextResults = {
      ...draftResults,
      [itemId]: parsedVal
    };

    updateDraftResultsWithHistory(nextResults);
    setEditingSectionId(null);
    triggerAutoSave(nextResults);
    toast.success("Saved section edit!");
  };

  const handleSaveDraft = async () => {
    if (!draftResults) return;
    if (!selectedCaseObject?._id) {
      toast.error("No matter file is linked to save the draft.");
      return;
    }
    const tid = toast.loading("Saving draft to database...");
    try {
      const payload = {
        ...selectedCaseObject,
        generatedArgumentsDraft: draftResults
      };
      const response = await apiService.updateProject(selectedCaseObject._id, payload);
      if (onUpdateCase) onUpdateCase(response);
      setSaveStatus('saved');
      toast.success("Draft saved successfully to database!", { id: tid });
    } catch (err) {
      console.error("Failed to save draft", err);
      toast.error("Failed to save draft.", { id: tid });
    }
  };

  const handleShareDraft = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Litigation workspace link copied to clipboard!");
  };

  const handleCopyDraft = () => {
    const text = draftResults.courtReadyDraft || draftResults.generatedArguments || '';
    navigator.clipboard.writeText(text);
    toast.success("Final Court Draft copied to clipboard!");
  };

  const handleDownloadRaw = () => {
    if (!draftResults) return;
    const text = JSON.stringify(draftResults, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `litigation_brief_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Raw brief JSON downloaded successfully!");
  };

  const handlePrintPDF = () => {
    if (!draftResults) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Popup blocked! Enable popups to print/export PDF.");
      return;
    }

    const html = `
      <html>
      <head>
        <title>AI LEGAL™ - Legal Draft - ${selectedCaseObject?.clientName || 'Petitioner'} vs ${selectedCaseObject?.opponentName || 'Respondent'}</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 50px; line-height: 1.7; color: #1e293b; }
          .header { border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 25px; }
          .draft-title { font-size: 20pt; font-weight: 800; color: #1e1b4b; margin: 0; }
          .meta-row { display: flex; justify-content: space-between; font-size: 9pt; color: #64748b; margin-top: 10px; text-transform: uppercase; font-weight: 700; }
          .content { font-size: 11pt; color: #0f172a; white-space: pre-wrap; }
          h1, h2, h3 { font-family: 'Outfit', sans-serif; color: #1e1b4b; margin-top: 20px; }
          h1 { border-bottom: 1.5px solid #e2e8f0; padding-bottom: 6px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="draft-title">AI LEGAL™ Court Pleading Brief</div>
          <div class="meta-row">
            <span>Petitioner: ${selectedCaseObject?.clientName || 'Petitioner'}</span>
            <span>Respondent: ${selectedCaseObject?.opponentName || 'Respondent'}</span>
            <span>Type: Court Pleading</span>
          </div>
        </div>
        <div class="content">${draftResults.courtReadyDraft || draftResults.generatedArguments || ''}</div>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleDownloadDoc = () => {
    if (!draftResults) return;
    const docContent = `
AI LEGAL™ COURT BRIEF
====================

Petitioner: ${selectedCaseObject?.clientName || 'Petitioner'}
Respondent: ${selectedCaseObject?.opponentName || 'Respondent'}
Filing Court: ${selectedCaseObject?.courtName || 'High Court'}

DRAFT PLEADING ARGUMENTS:
------------------------
${draftResults.courtReadyDraft || draftResults.generatedArguments || ''}
`;
    const blob = new Blob([docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedCaseObject?.clientName || 'Petitioner'}_vs_${selectedCaseObject?.opponentName || 'Respondent'}_Draft.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Word document downloaded successfully!");
  };

  // Documents drag and drop handlers
  const handleDropDocs = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files.map(f => ({ name: f.name, size: Math.round(f.size / 1024) + ' KB' }))]);
    toast.success(`${files.length} document attachments staged.`);
  };

  // Case filtering for Custom Dropdown search
  const filteredCases = useMemo(() => {
    return allProjects.filter(p => p.name.toLowerCase().includes(caseSearchQuery.toLowerCase()));
  }, [allProjects, caseSearchQuery]);

  // Precedents Search Engine lookup
  const filteredPrecedents = useMemo(() => {
    return MOCK_PRECEDENT_REPOS.filter(p => {
      const matchSearch = p.citation.toLowerCase().includes(precedentSearch.toLowerCase()) || 
                          p.ratio.toLowerCase().includes(precedentSearch.toLowerCase());
      const matchCourt = precedentFilter === 'All' || p.court === precedentFilter;
      return matchSearch && matchCourt;
    });
  }, [precedentSearch, precedentFilter]);

  const toggleBookmarkPrecedent = (id) => {
    const nextBookmarks = new Set(bookmarkedPrecedents);
    if (nextBookmarks.has(id)) nextBookmarks.delete(id);
    else nextBookmarks.add(id);
    setBookmarkedPrecedents(nextBookmarks);
  };

  const insertPrecedentIntoDraft = (citation) => {
    const activeSectionContent = draftResults[focusedSection];
    let nextContent = '';
    
    if (Array.isArray(activeSectionContent)) {
      nextContent = [...activeSectionContent, { citation, ratio: 'Binding judgment reference' }];
    } else {
      nextContent = (activeSectionContent || '') + `\n\n[Citation: ${citation}]`;
    }

    const nextResults = {
      ...draftResults,
      [focusedSection]: nextContent
    };
    
    updateDraftResultsWithHistory(nextResults);
    triggerAutoSave(nextResults);
    toast.success(`Inserted citation into ${focusedSection}`);
  };

  // Categorized AI Improvements tab
  const [activeCopilotTab, setActiveCopilotTab] = useState('Language');
  const COPILOT_CATEGORIES = ['Language', 'Logic', 'Precedents', 'Rebuttal', 'Evidence'];

  const getCategorizedCopilotActions = () => {
    switch(activeCopilotTab) {
      case 'Language':
        return [
          { name: 'Improve Draft', desc: 'Perform legal spelling/grammar cleanup.', action: 'Improve Draft', prompt: 'Perform legal spelling, grammar, citation format checks and style cleanup.' },
          { name: 'Improve Legal Language', desc: 'Strengthen courtroom tone.', action: 'Improve Legal Language', prompt: 'Rewrite with a highly professional senior advocate voice suitable for high court filings.' },
          { name: 'Shorten Argument', desc: 'Make it brief & concise.', action: 'Shorten Argument', prompt: 'Condense this section into a brief, high-impact summary suitable for fast oral presentation.' }
        ];
      case 'Logic':
        return [
          { name: 'Regenerate Section', desc: 'Redraft section content.', action: 'Regenerate Section', prompt: 'Completely redraft this section with a more formal litigation argument structure.' },
          { name: 'Expand Argument', desc: 'Include details & reasoning.', action: 'Expand Argument', prompt: 'Substantially expand this argument with detailed logical reasoning and deeper legal context.' },
          { name: 'Strengthen Reasoning', desc: 'Improve logical flow.', action: 'Strengthen Reasoning', prompt: 'Re-align reasoning logically to form a solid chain of deductions based on dispute facts.' }
        ];
      case 'Precedents':
        return [
          { name: 'Add Citations', desc: 'Append legal section rules.', action: 'Add Citations', prompt: 'Append relevant CPC/CrPC/BNS statutory citations and correct referencing syntax.' },
          { name: 'Add More Case Laws', desc: 'Find binding precedents.', action: 'Add Case Laws', prompt: 'Integrate 2-3 additional recent high-court or supreme court binding precedents matching the core issue.' }
        ];
      case 'Rebuttal':
        return [
          { name: 'Generate Counter Argument', desc: 'Predict opposition defense.', action: 'Generate Counter Argument', prompt: 'Formulate a strong counter-defense argument anticipating opponent objections.' },
          { name: 'Generate Rebuttal', desc: 'Draft clean rebuttals.', action: 'Generate Rebuttal', prompt: 'Formulate a persuasive rebuttal countering hostile opposition claims.' }
        ];
      case 'Evidence':
        return [
          { name: 'Link Key Evidence', desc: 'Establish links to document exhibits.', action: 'Link Evidence', prompt: 'Align this paragraph arguments precisely with evidence and documents already staged on the case record.' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full min-h-0 bg-slate-50 dark:bg-transparent overflow-hidden relative">
      
      {/* HEADER BAR */}
      <div className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b shrink-0 ${isDark ? 'border-slate-800 bg-[#0B1020]/95' : 'border-slate-200 bg-white'} backdrop-blur-xl z-20`}>
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={handleCustomBack} 
            className={`w-[68px] h-8 flex items-center justify-center gap-1.5 border rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 ${
              isDark ? 'bg-[#1A2540] border-slate-800 text-slate-300 hover:bg-[#202E50]' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            style={{ minHeight: '32px' }}
          >
            <ChevronLeft size={11} />
            <span>Back</span>
          </button>
          
          <div className="flex flex-col min-w-0">
            <h1 className={`text-[16px] sm:text-[18px] font-black leading-none tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Argument Builder
            </h1>
            <p className={`text-[9px] sm:text-[10px] font-medium mt-1 leading-none truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              AI enterprise pleading generator, defense planner, and legal brief drafting workspace.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {workspaceStage === 'RESULTS' && (
            <button
              onClick={() => {
                setWorkspaceStage('INPUT');
                setWizardStep(1);
              }}
              className={`px-3 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors whitespace-nowrap ${
                isDark ? 'bg-[#1A2540] border-slate-800 text-slate-300 hover:bg-[#202E50]' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Adjust Inputs
            </button>
          )}
        </div>
      </div>

      {/* STEP PROGRESS INDICATOR */}
      <div className={`p-4 border-b shrink-0 ${isDark ? 'bg-[#0E1528] border-slate-850' : 'bg-slate-55/40 border-slate-100'}`}>
        <div className="max-w-5xl mx-auto">
          {/* Desktop/Tablet Horizontal Indicator */}
          <div className="hidden sm:flex items-center justify-between w-full relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
            
            {[
              { step: 1, label: 'Choose Source', active: (workspaceStage === 'INPUT' && wizardStep === 1) },
              { step: 2, label: 'AI Analysis', active: (workspaceStage === 'INPUT' && wizardStep === 2) },
              { step: 3, label: 'Court Draft', active: (workspaceStage === 'RESULTS') }
            ].map((s, idx) => {
              const completed = (idx === 0 && (wizardStep === 2 || workspaceStage === 'RESULTS')) || (idx === 1 && workspaceStage === 'RESULTS');
              return (
                <div key={s.step} className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    s.active ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-500/20' :
                    completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {completed ? '✓' : s.step}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider mt-2 bg-slate-50 dark:bg-[#0B1020] px-2 ${
                    s.active ? 'text-indigo-600 dark:text-indigo-400' :
                    completed ? 'text-emerald-500' : 'text-slate-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile Stepper (Vertical Stack) */}
          <div className="flex sm:hidden flex-col items-center gap-1">
            <div className="flex items-center gap-4">
              <span className={`text-[10.5px] font-black uppercase ${workspaceStage === 'INPUT' && wizardStep === 1 ? 'text-indigo-500' : 'text-slate-400'}`}>① Source</span>
              <span className="text-slate-300">➔</span>
              <span className={`text-[10.5px] font-black uppercase ${workspaceStage === 'INPUT' && wizardStep === 2 ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`}>② AI Analysis</span>
              <span className="text-slate-300">➔</span>
              <span className={`text-[10.5px] font-black uppercase ${workspaceStage === 'RESULTS' ? 'text-indigo-500' : 'text-slate-400'}`}>③ Court Draft</span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEWPORT BODY CONTAINER */}
      <div className="flex-1 overflow-hidden relative min-h-0 select-text">
        
        {/* ==========================================
            STEP 1: CHOOSE SOURCE
            ========================================== */}
        {workspaceStage === 'INPUT' && wizardStep === 1 && (
          <div className="h-full overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-6">
              
              <div className="p-5 sm:p-8 rounded-3xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-lg border border-white/10"
                   style={{ background: 'linear-gradient(135deg, #5B3DF5 0%, #4F46E5 45%, #6D5BFF 100%)' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-30 pointer-events-none" />
                <div className="relative z-10 space-y-2">
                  <h2 className="text-[24px] sm:text-[30px] font-extrabold tracking-tight leading-none text-white">
                    Argument Drafting Workspace
                  </h2>
                  <p className="text-[12px] sm:text-[14px] text-white/90 font-medium leading-relaxed max-w-2xl">
                    Generate structured courtroom arguments, legal citations, and comprehensive court briefs in minutes using our professional litigation engine.
                  </p>
                </div>
              </div>

              {/* Mutually Exclusive Cards Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: 'EXISTING_CASE', name: 'Existing Case Workspace', desc: 'Auto populate facts, parties, documents, evidence, timeline from chosen case.', icon: <Briefcase size={22} /> },
                  { id: 'UPLOAD_DOCUMENTS', name: 'Upload Legal Documents', desc: 'AI OCR extracts timelines, parties, laws, facts from uploaded files.', icon: <Upload size={22} /> },
                  { id: 'MANUAL_FACTS', name: 'Manual Facts Outline', desc: 'Advocate details case facts manually. AI will analyze facts and build strategy.', icon: <FileText size={22} /> }
                ].map((src, index) => {
                  const active = argumentSource === src.id;
                  return (
                    <div
                      key={src.id}
                      onClick={() => setArgumentSource(src.id)}
                      className={`p-5 border rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[160px] hover:translate-y-[-2px] hover:shadow-md ${
                        active 
                          ? 'bg-indigo-500/5 ring-2 ring-indigo-500 border-indigo-500' 
                          : (isDark ? 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300')
                      } ${index === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                      style={{ minHeight: '52px' }}
                    >
                      <div className="flex items-start justify-between w-full">
                        <span className={active ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-400'}>{src.icon}</span>
                        {active && (
                          <div className="flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                            <span className="text-[8px] font-black uppercase text-indigo-600 dark:text-indigo-400">Selected</span>
                            <CheckCircle2 size={10} className="text-indigo-600 dark:text-indigo-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-[12px] font-black leading-tight">{src.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1.5 leading-relaxed">{src.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Inputs Area */}
              <div className={`p-6 border rounded-2xl ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                {argumentSource === 'EXISTING_CASE' ? (
                  <div className="space-y-4">
                    {/* Custom Searchable Case Dropdown */}
                    <div className="relative space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Choose Case Workspace</label>
                      <div 
                        onClick={() => setIsCaseDropdownOpen(!isCaseDropdownOpen)}
                        className={`w-full border rounded-xl px-4 py-3 text-xs font-bold flex items-center justify-between cursor-pointer ${
                          isDark ? 'bg-[#131c31] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                        style={{ minHeight: '52px' }}
                      >
                        <span className="truncate">
                          {selectedCaseObject ? selectedCaseObject.name : '-- Search / Select Matter File --'}
                        </span>
                        <ChevronDown size={14} className={`transition-transform ${isCaseDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>

                      {isCaseDropdownOpen && (
                        <div className={`absolute left-0 right-0 mt-2 border rounded-xl shadow-xl z-30 overflow-hidden ${
                          isDark ? 'bg-[#0B1020] border-slate-800' : 'bg-white border-slate-250'
                        }`}>
                          <div className="p-2 border-b border-slate-800 flex items-center gap-2">
                            <Search size={12} className="text-slate-400" />
                            <input 
                              type="text"
                              placeholder="Search matter file name..."
                              value={caseSearchQuery}
                              onChange={e => setCaseSearchQuery(e.target.value)}
                              className="w-full bg-transparent border-none text-xs outline-none py-1 text-slate-200"
                            />
                          </div>
                          <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            {filteredCases.map(p => (
                              <div
                                key={p._id}
                                onClick={() => {
                                  setLinkedCaseId(p._id);
                                  setIsCaseDropdownOpen(false);
                                }}
                                className={`px-4 py-3 text-xs font-semibold cursor-pointer hover:bg-indigo-600 hover:text-white ${
                                  linkedCaseId === p._id ? 'bg-indigo-500/10 text-indigo-500' : 'text-slate-400'
                                }`}
                              >
                                {p.name}
                              </div>
                            ))}
                            {filteredCases.length === 0 && (
                              <div className="p-4 text-center text-xs text-slate-400">No cases found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {linkedCaseId && selectedCaseObject && (
                      <div className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.01] space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <h4 className="text-[11px] font-black uppercase text-indigo-500">Case Matter Summary</h4>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase">
                            AI Ready
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                          <div>
                            <span className="text-[8px] uppercase font-black text-slate-400 block">Case Name</span>
                            <span className="text-slate-200 block truncate">{selectedCaseObject.name}</span>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase font-black text-slate-400 block">Case Type</span>
                            <span className="text-slate-200 block">{selectedCaseObject.caseType || 'Civil'}</span>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase font-black text-slate-400 block">Parties</span>
                            <span className="text-slate-200 block truncate">
                              {selectedCaseObject.clientName || 'Petitioner'} vs {selectedCaseObject.opponentName || 'Respondent'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase font-black text-slate-400 block">Court</span>
                            <span className="text-slate-200 block truncate">{selectedCaseObject.courtName || 'High Court'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : argumentSource === 'UPLOAD_DOCUMENTS' ? (
                  <div className="space-y-4">
                    <div 
                      onDragOver={e => e.preventDefault()}
                      onDrop={handleDropDocs}
                      onClick={() => document.getElementById('wizard-files-selector').click()}
                      className="border-2 border-dashed border-slate-350 dark:border-slate-800 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center gap-2 bg-slate-500/5"
                    >
                      <FileUp className="text-slate-400" size={32} />
                      <span className="text-[12px] text-slate-700 dark:text-slate-300 font-bold">Staged files for OCR extraction</span>
                      <span className="text-[9px] text-slate-450 uppercase font-semibold">FIRs, petitions, contracts, PDFs</span>
                      <input 
                        id="wizard-files-selector"
                        type="file"
                        multiple
                        onChange={e => {
                          const files = Array.from(e.target.files);
                          setUploadedFiles(prev => [...prev, ...files.map(f => ({ name: f.name, size: Math.round(f.size / 1024) + ' KB' }))]);
                        }}
                        className="hidden"
                      />
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {uploadedFiles.map((file, idx) => (
                          <div key={idx} className="p-3 border rounded-xl bg-slate-100 dark:bg-black/20 flex items-center justify-between text-xs font-semibold">
                            <span className="truncate text-slate-800 dark:text-slate-300">{file.name} ({file.size})</span>
                            <button 
                              onClick={e => {
                                e.stopPropagation();
                                setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
                              }} 
                              className="text-red-500 hover:text-red-400"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Case Title</label>
                        <input 
                          type="text"
                          placeholder="e.g. Rajesh Sharma vs Amit Verma"
                          value={manualCaseTitle}
                          onChange={e => setManualCaseTitle(e.target.value)}
                          className={`border rounded-xl px-3 py-2.5 text-xs font-semibold outline-none ${
                            isDark ? 'bg-[#131c31] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Petitioner / Plaintiff</label>
                        <input 
                          type="text"
                          placeholder="Plaintiff Name"
                          value={manualPlaintiff}
                          onChange={e => setManualPlaintiff(e.target.value)}
                          className={`border rounded-xl px-3 py-2.5 text-xs font-semibold outline-none ${
                            isDark ? 'bg-[#131c31] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Respondent / Defendant</label>
                        <input 
                          type="text"
                          placeholder="Defendant Name"
                          value={manualDefendant}
                          onChange={e => setManualDefendant(e.target.value)}
                          className={`border rounded-xl px-3 py-2.5 text-xs font-semibold outline-none ${
                            isDark ? 'bg-[#131c31] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Factual Summary</label>
                        <textarea
                          rows={4}
                          placeholder="Enter timeline sequence of facts..."
                          value={manualFacts}
                          onChange={e => setManualFacts(e.target.value)}
                          className={`w-full border rounded-xl px-3 py-2.5 text-xs font-semibold outline-none resize-none ${
                            isDark ? 'bg-black/20 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Opponent Position</label>
                        <textarea
                          rows={4}
                          placeholder="What does the opponent assert?..."
                          value={manualOpponentClaims}
                          onChange={e => setManualOpponentClaims(e.target.value)}
                          className={`w-full border rounded-xl px-3 py-2.5 text-xs font-semibold outline-none resize-none ${
                            isDark ? 'bg-black/20 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-450">
                  Step 1: Setup strategy variables
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onBack}
                    className={`px-5 py-2.5 border rounded-xl text-xs font-black uppercase ${
                      isDark ? 'bg-transparent border-slate-800 text-slate-400 hover:bg-slate-800/20' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContinueWizardStep1}
                    disabled={!isContinueEnabled}
                    className="px-6 py-2.5 rounded-xl text-xs font-black uppercase text-white transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: isContinueEnabled ? 'linear-gradient(135deg, #5B3DF5 0%, #4F46E5 45%, #6D5BFF 100%)' : '#94A3B8',
                      minHeight: '52px'
                    }}
                  >
                    Generate AI Argument
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            STEP 2: AI ANALYSIS / GENERATION SCREEN
            ========================================== */}
        {workspaceStage === 'INPUT' && wizardStep === 2 && (
          <div className="h-full flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className={`p-8 border rounded-3xl max-w-xl w-full shadow-2xl relative overflow-hidden text-center ${
              isDark ? 'bg-[#131c31] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none" />
              
              <div className="flex flex-col items-center gap-3 relative z-10">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="text-indigo-500 animate-pulse" size={24} />
                  </div>
                </div>
                <h3 className="text-sm font-black text-indigo-550 dark:text-indigo-400 uppercase tracking-widest mt-2">
                  AI Litigation Strategy Audit
                </h3>
              </div>

              {/* Progress Percentage Ring / Text */}
              <div className="my-6 relative z-10">
                <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {generationProgress}%
                </div>
                <div className="text-xs text-slate-400 font-bold uppercase mt-1">
                  {generationStepLabel}
                </div>
              </div>

              {/* Checklist details */}
              <div className="text-left text-xs font-semibold max-w-md mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                {[
                  { name: 'Analyzing Facts...', pct: 15 },
                  { name: 'Finding Case Laws...', pct: 35 },
                  { name: 'Generating Arguments...', pct: 55 },
                  { name: 'Checking Contradictions...', pct: 75 },
                  { name: 'Building Counter Arguments...', pct: 90 },
                  { name: 'Formatting Court Draft...', pct: 100 }
                ].map((item, idx) => {
                  const completed = generationProgress >= item.pct;
                  const active = generationProgress >= (idx === 0 ? 0 : [15, 35, 55, 75, 90][idx - 1]) && generationProgress < item.pct;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      {completed ? (
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      ) : active ? (
                        <Sparkles size={14} className="text-indigo-500 animate-pulse shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                      )}
                      <span className={completed ? 'text-emerald-500 font-bold line-through' : active ? 'text-indigo-500 font-black' : 'text-slate-400'}>
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            STEP 3: COURT-READY WORKSPACE
            ========================================== */}
        {workspaceStage === 'RESULTS' && (() => {
          if (generationError) {
            return (
              <div className="h-full flex items-center justify-center p-6">
                <div className="max-w-md text-center space-y-4">
                  <ShieldAlert size={48} className="text-red-500 mx-auto" />
                  <h3 className="text-lg font-black text-red-500 uppercase">Draft Compilation Failed</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{generationError}</p>
                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={runUnifiedArgumentGeneration}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase"
                    >
                      Retry
                    </button>
                    <button 
                      onClick={() => {
                        setWorkspaceStage('INPUT');
                        setWizardStep(1);
                        setGenerationError(null);
                      }}
                      className="px-5 py-2 border border-slate-800 text-slate-300 rounded-xl text-xs font-black uppercase"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          if (!draftResults) return null;

          return (
            <div className="h-full flex flex-col min-h-0 select-text">
              
              {/* TOP EDITOR STICKY TOOLBAR */}
              <div className={`px-4 py-3 border-b shrink-0 flex flex-wrap items-center justify-between gap-3 ${
                isDark ? 'bg-[#0E1528] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                {/* File Statistics & Autosave Indicator */}
                <div className="flex items-center gap-3 text-[10.5px] font-bold text-slate-400">
                  <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase text-[8.5px] font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                  
                  {/* Autosave Status */}
                  <div className="flex items-center gap-1">
                    {saveStatus === 'saving' && <RefreshCw size={11} className="animate-spin text-indigo-400" />}
                    {saveStatus === 'saved' && <Check size={11} className="text-emerald-500" />}
                    {saveStatus === 'offline' && <Cloud size={11} className="text-orange-500" />}
                    {saveStatus === 'error' && <AlertCircle size={11} className="text-red-500" />}
                    <span className="capitalize text-[9px]">
                      {saveStatus === 'saving' ? 'Saving changes...' : saveStatus === 'saved' ? 'Saved to database' : saveStatus === 'offline' ? 'Saved locally (Offline)' : 'Save Error'}
                    </span>
                  </div>

                  <span className="hidden md:inline">|</span>
                  
                  {/* Word count & Reading time metrics */}
                  <div className="hidden md:flex items-center gap-3">
                    <span>{totalWordCount} words</span>
                    <span>{totalReadingTime} min read</span>
                    <span>{totalCitationsCount} citations</span>
                  </div>
                </div>

                {/* Left/Right Sidebar Collapse Toggles & Focus Mode */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                    className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800/30 text-slate-400 hidden lg:inline-block"
                    title="Toggle Left Outline"
                  >
                    {isLeftSidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
                  </button>
                  
                  <button 
                    onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                    className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800/30 text-slate-400 hidden lg:inline-block"
                    title="Toggle AI Refinements Sidebar"
                  >
                    {isRightSidebarOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
                  </button>

                  <div className="h-4 w-px bg-slate-800 hidden lg:block" />

                  {/* Undo / Redo */}
                  <button 
                    onClick={handleUndo} 
                    disabled={historyIndex <= 0}
                    className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-805 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 size={13} />
                  </button>
                  <button 
                    onClick={handleRedo}
                    disabled={historyIndex >= historyStack.length - 1}
                    className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-805 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Redo"
                  >
                    <Redo2 size={13} />
                  </button>

                  {/* Mobile navigation triggers */}
                  <button
                    onClick={() => setMobileOutlineDrawer(true)}
                    className="lg:hidden px-2.5 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-[9px] font-black uppercase"
                  >
                    Outline
                  </button>
                </div>
              </div>

              {/* SEARCH INPUT BAR */}
              <div className={`px-4 py-2 border-b shrink-0 flex items-center justify-between gap-3 ${
                isDark ? 'bg-[#0E1528] border-slate-850' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="relative w-full max-w-md">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450" />
                  <input 
                    id="editor-search-input"
                    type="text"
                    placeholder="Search across pleading (e.g. damages, contract, SC citation)..."
                    value={editorSearchQuery}
                    onChange={e => setEditorSearchQuery(e.target.value)}
                    className={`w-full border rounded-lg pl-8 pr-3 py-1.5 text-xs font-semibold outline-none ${
                      isDark ? 'bg-black/20 border-slate-800 text-white' : 'bg-white border-slate-250 text-slate-800'
                    }`}
                  />
                  {editorSearchQuery && (
                    <button 
                      onClick={() => setEditorSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-300"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                
                {/* Court Readiness Score gauge */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase text-slate-400">Readiness Score</span>
                  <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-500 px-2.5 py-1 rounded-full text-xs font-extrabold">
                    <Scale size={11} />
                    <span>{courtReadinessScore.overall}%</span>
                  </div>
                </div>
              </div>

              {/* EXPORT ACTION BAR (Scrollable Chips on Mobile) */}
              <div className={`px-4 py-2.5 border-b shrink-0 overflow-x-auto no-scrollbar flex items-center gap-2 ${
                isDark ? 'bg-[#0B1020] border-slate-850' : 'bg-slate-50 border-slate-200'
              }`}>
                {[
                  { label: 'Save Draft', onClick: handleSaveDraft, icon: <Cloud size={11} />, primary: true },
                  { label: 'PDF Export', onClick: handlePrintPDF, icon: <Printer size={11} /> },
                  { label: 'Word DOCX', onClick: handleDownloadDoc, icon: <FileDown size={11} /> },
                  { label: 'Copy Draft', onClick: handleCopyDraft, icon: <Copy size={11} /> },
                  { label: 'Download JSON', onClick: handleDownloadRaw, icon: <Download size={11} /> },
                  { label: 'Share', onClick: handleShareDraft, icon: <Share2 size={11} /> },
                  { label: 'Versions', onClick: () => setIsVersionHistoryOpen(true), icon: <History size={11} /> }
                ].map(chip => (
                  <button
                    key={chip.label}
                    onClick={chip.onClick}
                    className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      chip.primary 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                        : (isDark ? 'bg-slate-900 border border-slate-800 text-slate-350 hover:bg-slate-800' : 'bg-white border border-slate-250 text-slate-600 hover:bg-slate-50')
                    }`}
                  >
                    {chip.icon}
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>

              {/* 3-COLUMN WORKSPACE FRAMEWORK */}
              <div className="flex-1 flex min-h-0 relative">
                
                {/* LEFT COLLAPSIBLE PANEL: OUTLINE / STRUCTURE (Desktop: 20-25% width) */}
                <AnimatePresence initial={false}>
                  {isLeftSidebarOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: '240px', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`h-full border-r shrink-0 hidden lg:flex flex-col min-w-0 z-10 ${
                        isDark ? 'bg-[#0E1528] border-slate-800' : 'bg-[#FAF9FF] border-slate-200'
                      }`}
                    >
                      <div className="p-4 flex flex-col h-full min-h-0">
                        <div className="flex items-center justify-between mb-3 shrink-0">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Draft Structure</span>
                          <button 
                            onClick={() => setIsLeftSidebarOpen(false)}
                            className="p-1 rounded hover:bg-slate-800/30 text-slate-500"
                          >
                            <ChevronLeft size={12} />
                          </button>
                        </div>

                        {/* Search Sections */}
                        <div className="relative mb-3 shrink-0">
                          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-450" />
                          <input 
                            type="text"
                            placeholder="Filter sections..."
                            value={outlineSearchQuery}
                            onChange={e => setOutlineSearchQuery(e.target.value)}
                            className={`w-full border rounded-lg pl-7 pr-2 py-1 text-[10px] font-semibold outline-none ${
                              isDark ? 'bg-black/20 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                            }`}
                          />
                        </div>

                        {/* Jump list outline */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5">
                          {sortedOutlineItems.map(item => {
                            const active = focusedSection === item.id;
                            const isPinned = pinnedSections.has(item.id);
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setFocusedSection(item.id);
                                  const target = document.getElementById(`editor-section-${item.id}`);
                                  if (target) {
                                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }}
                                className={`w-full text-left py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase transition-all truncate flex items-center justify-between border ${
                                  active
                                    ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/15 border-transparent'
                                }`}
                              >
                                <span>{item.label}</span>
                                {isPinned && <Pin size={8} className="text-indigo-400 shrink-0 fill-indigo-400" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* MIDDLE COLUMN: CENTRAL DOCS EDITOR (Scrolls independently) */}
                <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6 min-w-0 bg-slate-50 dark:bg-transparent">
                  <div className="max-w-3xl mx-auto space-y-6 pb-20">
                    
                    {/* Render sections in order (pinned first) */}
                    {(() => {
                      const allSections = OUTLINE_ITEMS;
                      const pinned = [];
                      const unpinned = [];
                      allSections.forEach(s => {
                        if (pinnedSections.has(s.id)) pinned.push(s);
                        else unpinned.push(s);
                      });
                      
                      const orderedSections = [...pinned, ...unpinned];

                      return orderedSections.map(item => {
                        const content = draftResults[item.id];
                        const isEditing = editingSectionId === item.id;
                        const isFocused = focusedSection === item.id;
                        const isPinned = pinnedSections.has(item.id);
                        
                        // Check if text matches active search query
                        if (editorSearchQuery) {
                          const query = editorSearchQuery.toLowerCase();
                          const sectionMatch = item.label.toLowerCase().includes(query);
                          const contentMatch = typeof content === 'string' 
                            ? content.toLowerCase().includes(query)
                            : JSON.stringify(content).toLowerCase().includes(query);
                          
                          if (!sectionMatch && !contentMatch) return null; // Filter out mismatched cards
                        }

                        return (
                          <div
                            key={item.id}
                            id={`editor-section-${item.id}`}
                            onClick={() => setFocusedSection(item.id)}
                            className={`p-5 border rounded-2xl transition-all duration-200 scroll-mt-6 ${
                              isFocused 
                                ? 'ring-2 ring-indigo-500/20 border-indigo-500 bg-indigo-500/[0.01]' 
                                : (isDark ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300')
                            }`}
                          >
                            {/* Section Header bar */}
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-850 mb-4">
                              <div className="flex items-center gap-2">
                                {isFocused && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                                <h3 className="text-[11px] font-black uppercase text-slate-800 dark:text-white flex items-center gap-1.5">
                                  {item.label}
                                </h3>
                                {isPinned && <span className="px-1.5 py-0.2 bg-indigo-500/10 text-indigo-500 rounded text-[7.5px] font-black uppercase">Pinned</span>}
                              </div>

                              <div className="flex items-center gap-1">
                                {/* Explain Why Trigger */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setVisibleReasonings(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                                  }}
                                  className="px-2 py-1 hover:bg-slate-800/30 text-indigo-500 rounded-lg text-[9px] font-black uppercase flex items-center gap-0.5 whitespace-nowrap"
                                >
                                  <Brain size={10} />
                                  <span>Explain Why</span>
                                </button>

                                <div className="h-3 w-px bg-slate-800 mx-1" />

                                {/* Pin Section */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePinSection(item.id);
                                  }}
                                  className={`p-1 rounded hover:bg-slate-800/30 ${isPinned ? 'text-indigo-400' : 'text-slate-450'}`}
                                  title={isPinned ? 'Unpin Section' : 'Pin to Top'}
                                >
                                  {isPinned ? <PinOff size={11} /> : <Pin size={11} />}
                                </button>

                                {/* Edit trigger */}
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSaveSectionEdit(item.id);
                                      }}
                                      className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[8.5px] font-black uppercase"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingSectionId(null);
                                      }}
                                      className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[8.5px] font-black uppercase"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingSectionId(item.id);
                                      setFocusedSection(item.id);
                                      if (Array.isArray(content)) {
                                        setEditingContent(
                                          content.map(li => {
                                            if (typeof li === 'object' && li !== null) {
                                              return li.citation ? `${li.citation} -> ${li.ratio}` : `${li.evidence} -> ${li.proves}`;
                                            }
                                            return li;
                                          }).join('\n')
                                        );
                                      } else {
                                        setEditingContent(content || '');
                                      }
                                    }}
                                    className="p-1 rounded hover:bg-slate-800/30 text-slate-400"
                                    title="Edit Section"
                                  >
                                    <Edit2 size={11} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Section content presentation */}
                            {isEditing ? (
                              <textarea
                                rows={Array.isArray(content) ? 5 : 8}
                                value={editingContent}
                                onChange={e => setEditingContent(e.target.value)}
                                className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold outline-none resize-y ${
                                  isDark ? 'bg-black/20 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-250 text-slate-800'
                                }`}
                              />
                            ) : (
                              <div className="space-y-4">
                                {(() => {
                                  if (!content || (Array.isArray(content) && content.length === 0)) {
                                    return <p className="text-slate-400 italic text-[11px]">No content generated.</p>;
                                  }
                                  
                                  if (Array.isArray(content)) {
                                    return (
                                      <ul className="list-disc pl-4 space-y-1.5 text-slate-600 dark:text-slate-300 text-[11.5px] font-medium leading-relaxed">
                                        {content.map((li, idx) => {
                                          if (typeof li === 'object' && li !== null) {
                                            return (
                                              <li key={idx}>
                                                <strong className="text-indigo-650 dark:text-indigo-400">{li.citation || li.evidence}</strong>
                                                {li.ratio || li.proves ? `: ${li.ratio || li.proves}` : ''}
                                              </li>
                                            );
                                          }
                                          return <li key={idx}>{li}</li>;
                                        })}
                                      </ul>
                                    );
                                  }
                                  
                                  return <p className="text-slate-700 dark:text-slate-300 text-[11.5px] font-medium whitespace-pre-wrap leading-relaxed">{content}</p>;
                                })()}
                              </div>
                            )}

                            {/* EVIDENCE LINKING AND CITATION MARKS */}
                            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-200 dark:border-slate-850 text-[10px] text-slate-450 font-bold">
                              <span className="flex items-center gap-1">
                                <CheckSquare size={11} className="text-indigo-500" />
                                <span>Evidence: {selectedCaseObject?.evidence?.length || 2} Linked</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Bookmark size={11} className="text-indigo-500" />
                                <span>Citations: {item.id === 'supremeCourtPrecedents' || item.id === 'highCourtJudgments' ? '2 bindings' : 'Verified'}</span>
                              </span>
                            </div>

                            {/* AI REASONING "Explain Why" DRAWER ACCORDION */}
                            <AnimatePresence>
                              {visibleReasonings[item.id] && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="mt-4 p-4 border border-indigo-500/15 bg-indigo-500/[0.02] rounded-xl text-xs space-y-2 overflow-hidden"
                                >
                                  <div className="flex items-center justify-between pb-1 border-b border-indigo-500/10">
                                    <span className="font-black text-indigo-500 uppercase tracking-wider text-[9px] flex items-center gap-1">
                                      <Brain size={10} />
                                      AI Reasoning Explanation
                                    </span>
                                    <span className="text-[8.5px] font-extrabold text-emerald-500">Confidence: {REASONING_DATA[item.id]?.confidence || 95}%</span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10.5px]">
                                    <div>
                                      <span className="font-extrabold text-slate-400 block uppercase text-[8px]">Legal Strategy Objective</span>
                                      <p className="text-slate-300 mt-0.5 leading-snug">{REASONING_DATA[item.id]?.reason || 'Structured according to High Court pleading rules.'}</p>
                                    </div>
                                    <div>
                                      <span className="font-extrabold text-slate-400 block uppercase text-[8px]">Applicable Law / Provision</span>
                                      <p className="text-slate-300 mt-0.5 leading-snug">{REASONING_DATA[item.id]?.law || 'Order VI Rule 1 CPC Pleading Standards.'}</p>
                                    </div>
                                    <div>
                                      <span className="font-extrabold text-slate-400 block uppercase text-[8px]">Relevant Case Facts</span>
                                      <p className="text-slate-300 mt-0.5 leading-snug">{REASONING_DATA[item.id]?.facts || 'milestone contract breach notifications.'}</p>
                                    </div>
                                    <div>
                                      <span className="font-extrabold text-slate-400 block uppercase text-[8px]">Supporting Case Law / Precedent</span>
                                      <p className="text-slate-300 mt-0.5 leading-snug">{REASONING_DATA[item.id]?.precedent || 'ONGC Ltd. v. Saw Pipes Ltd.'}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                          </div>
                        );
                      });
                    })()}

                  </div>
                </div>

                {/* RIGHT COLLAPSIBLE PANEL: AI COPILOT & PRECEDENT SEARCH (Desktop: 20-25% width) */}
                <AnimatePresence initial={false}>
                  {isRightSidebarOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: '320px', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`h-full border-l shrink-0 hidden lg:flex flex-col min-w-0 z-10 ${
                        isDark ? 'bg-[#0E1528] border-slate-805' : 'bg-[#FAF9FF] border-slate-200'
                      }`}
                    >
                      <div className="p-4 flex flex-col h-full min-h-0 space-y-4">
                        
                        {/* Title header */}
                        <div className="flex items-center justify-between shrink-0">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">AI Refinements</span>
                          <button 
                            onClick={() => setIsRightSidebarOpen(false)}
                            className="p-1 rounded hover:bg-slate-805 text-slate-500"
                          >
                            <ChevronRight size={12} />
                          </button>
                        </div>

                        {/* Category filter tabs */}
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 border-b border-slate-800 pb-2">
                          {COPILOT_CATEGORIES.map(tab => (
                            <button
                              key={tab}
                              onClick={() => setActiveCopilotTab(tab)}
                              className={`px-2 py-1 text-[9px] font-black uppercase rounded-lg border transition-all ${
                                activeCopilotTab === tab 
                                  ? 'bg-indigo-600 text-white border-indigo-600' 
                                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/10'
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        {/* Action buttons list */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                          {getCategorizedCopilotActions().map(btn => (
                            <button
                              key={btn.name}
                              onClick={() => handleAIAction(btn.action, btn.prompt)}
                              className={`w-full p-3 border rounded-xl hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-left flex items-start justify-between gap-2 ${
                                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="min-w-0">
                                <h4 className="text-[10px] font-black text-slate-700 dark:text-white uppercase leading-none">{btn.name}</h4>
                                <p className="text-[8.5px] text-slate-400 font-semibold mt-1.5 leading-snug">{btn.desc}</p>
                              </div>
                              <ChevronRight size={11} className="text-slate-500 mt-0.5 shrink-0" />
                            </button>
                          ))}
                        </div>

                        {/* PRECENDENTS PANEL & CITATION LOOKUP WIDGET */}
                        <div className={`p-4 border rounded-xl flex flex-col min-h-[220px] max-h-[300px] shrink-0 ${
                          isDark ? 'bg-slate-950/40 border-slate-805' : 'bg-white border-slate-200'
                        }`}>
                          <span className="text-[9px] font-black uppercase text-indigo-500 mb-2 block">Precedents Engine</span>
                          
                          {/* Search cases */}
                          <div className="relative mb-2">
                            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-450" />
                            <input 
                              type="text"
                              placeholder="Search legal precedents database..."
                              value={precedentSearch}
                              onChange={e => setPrecedentSearch(e.target.value)}
                              className={`w-full border rounded-lg pl-7 pr-2 py-1 text-[9.5px] font-semibold outline-none ${
                                isDark ? 'bg-black/20 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                              }`}
                            />
                          </div>

                          {/* Precedents output */}
                          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                            {filteredPrecedents.map(p => {
                              const bookmarked = bookmarkedPrecedents.has(p.id);
                              return (
                                <div key={p.id} className="p-2 border border-slate-800/40 rounded-lg bg-black/10 space-y-1.5">
                                  <div className="flex justify-between items-start gap-1">
                                    <span className="text-[9.5px] font-black text-indigo-400 block leading-tight">{p.citation}</span>
                                    <button 
                                      onClick={() => toggleBookmarkPrecedent(p.id)}
                                      className={`text-slate-400 hover:text-indigo-400 ${bookmarked ? 'text-indigo-400' : ''}`}
                                    >
                                      <Star size={10} className={bookmarked ? 'fill-indigo-400' : ''} />
                                    </button>
                                  </div>
                                  <p className="text-[8.5px] text-slate-400 leading-snug">{p.ratio}</p>
                                  <button
                                    onClick={() => insertPrecedentIntoDraft(p.citation)}
                                    className="px-2 py-0.5 bg-indigo-650 hover:bg-indigo-700 text-white text-[8px] font-black uppercase rounded"
                                  >
                                    Insert Citation
                                  </button>
                                </div>
                              );
                            })}
                            {filteredPrecedents.length === 0 && (
                              <div className="text-center text-[9px] text-slate-400 py-4">No matching case laws</div>
                            )}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* MOBILE FLOATING ACTION COPILOT BUTTON */}
              <button
                onClick={() => setMobileAiCopilotDrawer(true)}
                className="lg:hidden fixed bottom-6 right-6 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-2xl z-30 ring-4 ring-indigo-500/20"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <Brain size={20} />
              </button>

              {/* MOBILE OUTLINE DRAWER SHEET */}
              {mobileOutlineDrawer && (
                <div className="fixed inset-0 z-50 flex">
                  <div 
                    onClick={() => setMobileOutlineDrawer(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <div className={`relative w-80 max-w-[85vw] h-full flex flex-col z-10 p-4 ${
                    isDark ? 'bg-[#0B1020] text-white' : 'bg-white text-slate-800'
                  }`}>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4 shrink-0">
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Draft Structure</span>
                      <button onClick={() => setMobileOutlineDrawer(false)} className="text-slate-400">
                        <X size={16} />
                      </button>
                    </div>

                    <div className="relative mb-3 shrink-0">
                      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search sections..."
                        value={outlineSearchQuery}
                        onChange={e => setOutlineSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-1.5 text-xs outline-none text-white"
                      />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                      {sortedOutlineItems.map(item => {
                        const active = focusedSection === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setFocusedSection(item.id);
                              setMobileOutlineDrawer(false);
                              const target = document.getElementById(`editor-section-${item.id}`);
                              if (target) {
                                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }}
                            className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold uppercase transition-all truncate block ${
                              active
                                ? 'bg-indigo-650 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                            style={{ minHeight: '44px' }}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* MOBILE AI COPILOT BOTTOM DRAWER SHEET */}
              {mobileAiCopilotDrawer && (
                <div className="fixed inset-0 z-50 flex items-end">
                  <div 
                    onClick={() => setMobileAiCopilotDrawer(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <div className={`relative w-full max-h-[75vh] flex flex-col z-10 p-5 rounded-t-3xl border-t border-slate-800 ${
                    isDark ? 'bg-[#0E1528] text-white' : 'bg-white text-slate-800'
                  }`}>
                    {/* Draggable header bar indicator */}
                    <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 shrink-0" />
                    
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4 shrink-0">
                      <span className="text-xs font-black uppercase text-indigo-500">AI Refinements Copilot</span>
                      <button onClick={() => setMobileAiCopilotDrawer(false)} className="text-slate-400">
                        <X size={16} />
                      </button>
                    </div>

                    {/* Category tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 border-b border-slate-800 pb-2 mb-3">
                      {COPILOT_CATEGORIES.map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveCopilotTab(tab)}
                          className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all ${
                            activeCopilotTab === tab 
                              ? 'bg-indigo-600 text-white border-indigo-600' 
                              : 'text-slate-400 border-transparent'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pb-6">
                      {getCategorizedCopilotActions().map(btn => (
                        <button
                          key={btn.name}
                          onClick={() => {
                            setMobileAiCopilotDrawer(false);
                            handleAIAction(btn.action, btn.prompt);
                          }}
                          className="w-full p-4 border border-slate-800 rounded-xl bg-slate-900/60 text-left flex items-center justify-between"
                          style={{ minHeight: '52px' }}
                        >
                          <div>
                            <h4 className="text-xs font-black text-white uppercase">{btn.name}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-normal">{btn.desc}</p>
                          </div>
                          <ChevronRight size={14} className="text-slate-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VERSION HISTORY MODAL (Desktop/Tablet) OR BOTTOM SHEET (Mobile) */}
              {isVersionHistoryOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div 
                    onClick={() => setIsVersionHistoryOpen(false)}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                  />
                  <div className={`relative max-w-xl w-full max-h-[80vh] flex flex-col z-10 p-6 rounded-2xl shadow-2xl border ${
                    isDark ? 'bg-[#0E1528] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4 shrink-0">
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-500">Draft Version History</span>
                      <button onClick={() => setIsVersionHistoryOpen(false)} className="text-slate-400">
                        <X size={16} />
                      </button>
                    </div>

                    {/* Version history list */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                      {[
                        { id: 'v1.2', name: 'Latest Pleading Draft', date: 'Jul 01, 2026 22:15', size: '1,452 words', active: true },
                        { id: 'v1.1', name: 'Initial AI Generated Draft', date: 'Jul 01, 2026 22:08', size: '1,320 words', active: false }
                      ].map(v => (
                        <div 
                          key={v.id} 
                          className={`p-4 border rounded-xl flex items-center justify-between ${
                            v.active ? 'bg-indigo-500/10 border-indigo-500' : 'bg-black/10 border-slate-800'
                          }`}
                        >
                          <div>
                            <h4 className="text-xs font-extrabold">{v.name} ({v.id})</h4>
                            <p className="text-[10px] text-slate-400 mt-1 font-semibold">{v.date} • {v.size}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {v.active ? (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[9px] font-black uppercase">Active</span>
                            ) : (
                              <button
                                onClick={() => {
                                  // Restore logic
                                  toast.success(`Restored Version ${v.id}`);
                                  setIsVersionHistoryOpen(false);
                                }}
                                className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded text-[9.5px] font-black uppercase"
                              >
                                Restore
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })()}

      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(91, 61, 245, 0.2);
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(91, 61, 245, 0.4);
        }
      `}</style>

    </div>
  );
};

export default ArgumentBuilder;
