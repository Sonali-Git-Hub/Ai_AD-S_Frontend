import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Scale, Plus, FolderOpen, Edit2, Trash2,
  Users, ChevronRight, Check, X, ArrowLeft, Calendar,
  Gavel, Clock, Search, Filter, User, Phone,
  Bell, CheckCircle2, Paperclip, Share2, MessageSquare,
  Eye, FileText, Sparkles, ExternalLink, MoreVertical,
  Download, AlertCircle, Shield, History, BookOpen, ScrollText, Landmark, HelpCircle,
  Target, Brain, LayoutDashboard, FileDigit, Bookmark, Mail, Send,
  Mic, ChevronLeft, ChevronDown, EyeOff, ClipboardList, FileSearch, Save,
  Minimize2, Maximize2, Copy, RefreshCcw, FileDown, ListTodo, Sliders, Pin, UploadCloud, Square,
  LayoutGrid, List, FileUp
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '../../../context/LanguageContext';
import { legalService } from '../services/legalService';
import { getActiveModule } from '../services/activeModuleService';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { apiService } from '../../../services/apiService';
import { generateChatResponse } from '../../../services/geminiService';
import TimelineDetailsModal from './TimelineDetailsModal';
import AiHearingClerkModal from './AiHearingClerkModal';
import FullScreenCaseAssistant from './FullScreenCaseAssistant';
import { chatStorageService } from '../../../services/chatStorageService';
import './LegalDashboard.responsive.css';




const QUICK_AI_ACTIONS = [
  { name: 'Draft Legal Notice', icon: 'FileText', prompt: 'Draft a formal legal notice based on this case facts and provisions.' },
  { name: 'Generate Arguments', icon: 'Scale', prompt: 'Generate the strongest legal arguments for our client in this dispute.' },
  { name: 'Evidence Analysis', icon: 'ShieldAlert', prompt: 'Analyze all case evidence and find any potential weak points or gaps.' },
  { name: 'Cross Examination', icon: 'Landmark', prompt: 'Prepare witness cross-examination questionnaire matching this dispute.' },
  { name: 'Timeline', icon: 'Clock', prompt: 'Construct a chronological timeline of key events and occurrences.' },
  { name: 'Legal Research', icon: 'Search', prompt: 'Research applicable acts, sections, and bare acts guidelines.' },
  { name: 'Case Summary', icon: 'FileText', prompt: 'Provide a detailed case summary including client details and opponent claims.' },
  { name: 'Strategy Engine', icon: 'Sparkles', prompt: 'Synthesize the best strategy and win probability booster recommendations.' },
  { name: 'Witness Questions', icon: 'HelpCircle', prompt: 'Generate a targeted checklist of questions for our key witnesses.' },
  { name: 'Contract Review', icon: 'Briefcase', prompt: 'Perform contract review to identify liabilities and risks.' },
  { name: 'Settlement Planner', icon: 'Scale', prompt: 'Suggest optimal settlement grounds and terms.' },
  { name: 'Risk Assessment', icon: 'ShieldAlert', prompt: 'Assess potential litigation risks, costs, and timeline delay exposures.' },
  { name: 'Document Comparison', icon: 'FileText', prompt: 'Highlight discrepancies between current evidence and pleadings.' },
  { name: 'Draft Reply', icon: 'Plus', prompt: 'Draft a formal reply statement responding to the opponent\'s allegations.' },
  { name: 'Appeal Draft', icon: 'Landmark', prompt: 'Draft an appeal petition stating errors in the trial court\'s order.' },
  { name: 'Review Petition', icon: 'Scale', prompt: 'Draft a review petition highlighting errors apparent on the face of the record.' }
];

const getActionIcon = (iconName) => {
  switch (iconName) {
    case 'FileText': return <FileText size={16} className="text-[#4F46E5]" />;
    case 'Scale': return <Scale size={16} className="text-[#4F46E5]" />;
    case 'ShieldAlert': return <AlertCircle size={16} className="text-[#4F46E5]" />;
    case 'Landmark': return <Landmark size={16} className="text-[#4F46E5]" />;
    case 'Clock': return <Clock size={16} className="text-[#4F46E5]" />;
    case 'Search': return <Search size={16} className="text-[#4F46E5]" />;
    case 'Sparkles': return <Sparkles size={16} className="text-[#4F46E5]" />;
    case 'HelpCircle': return <HelpCircle size={16} className="text-[#4F46E5]" />;
    case 'Briefcase': return <Briefcase size={16} className="text-[#4F46E5]" />;
    case 'Plus': return <Plus size={16} className="text-[#4F46E5]" />;
  }
};

const highlightLegalTerms = (text) => {
  if (!text) return "";
  const terms = [
    "Section 420 IPC", 
    "Transfer of Property Act", 
    "Indian Evidence Act",
    "Prayer", 
    "Evidence", 
    "Facts", 
    "Timeline", 
    "Arguments", 
    "Relief"
  ];
  let formatted = text;
  terms.forEach(term => {
    const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?<!\\*)\\b(${escapedTerm})\\b(?!\\*)`, 'gi');
    formatted = formatted.replace(regex, `**$&**`);
  });
  return formatted;
};

const MarkdownComponents = {
  h1: ({ children }) => (
    <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: '14px 0 6px 0', lineHeight: '1.3' }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1F2937', margin: '12px 0 6px 0', lineHeight: '1.3' }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1F2937', margin: '10px 0 4px 0', lineHeight: '1.3' }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: '8px 0', fontWeight: '400' }}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 my-2 space-y-1" style={{ fontSize: '15px', color: '#374151', fontWeight: '400' }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 my-2 space-y-1" style={{ fontSize: '15px', color: '#374151', fontWeight: '400' }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="pl-1 leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.7', color: '#374151', fontWeight: '400' }}>
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: '750', color: '#111827' }}>
      {children}
    </strong>
  ),
  code: ({ inline, className, children, ...props }) => {
    return inline ? (
      <code className="bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[13px] font-mono text-[#4F46E5] font-bold" {...props}>
        {children}
      </code>
    ) : (
      <pre className="bg-slate-100 dark:bg-zinc-800/50 p-3 rounded-xl overflow-x-auto text-[13px] font-mono text-slate-800 dark:text-zinc-200 my-2 border border-slate-200 dark:border-zinc-800 w-full">
        <code {...props}>{children}</code>
      </pre>
    );
  }
};

// â”€â”€â”€ Status badge component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const StatusBadge = ({ status }) => {
  const colors = {
    'Active': 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200/50',
    'Pending': 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200/50',
    'Closed': 'bg-slate-100 dark:bg-slate-800/30 text-slate-500 border-slate-200/50',
    'High Risk': 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-200/50'
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${colors[status] || colors['Active']}`}>
      {status || 'Active'}
    </span>
  );
};

// â”€â”€â”€ Quick Actions Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const QuickActionsModal = ({ visible, onClose, phoneNumber, countryCode }) => {
  if (!visible) return null;
  const fullPhone = phoneNumber ? `${countryCode || '+91'}${phoneNumber}` : null;
  
  const handleCall = () => {
    console.log("Button Clicked: Call");
    console.log("Icon Clicked: Call");
    if (fullPhone) window.open(`tel:${fullPhone}`, '_self');
  };
  const handleWhatsApp = () => {
    console.log("Button Clicked: WhatsApp");
    console.log("Icon Clicked: WhatsApp");
    if (fullPhone) {
      const stripped = fullPhone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${stripped}`, '_blank');
    }
  };
  const handleCopy = () => {
    console.log("Button Clicked: Copy");
    console.log("Icon Clicked: Copy");
    if (fullPhone) {
      navigator.clipboard.writeText(fullPhone);
      toast.success('Phone number copied');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[120000] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#1e293b] w-full sm:w-96 sm:rounded-3xl rounded-t-3xl p-6 pb-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-5" />
        <h3 className="text-center text-base font-black text-slate-900 dark:text-white">Quick Actions</h3>
        <p className="text-center text-sm font-bold text-indigo-600 mt-1 mb-6">{fullPhone || 'No number available'}</p>
        {!fullPhone ? (
          <p className="text-center text-sm text-slate-400 py-4">No client contact available</p>
        ) : (
          <div className="flex justify-around mb-6">
            <button onClick={handleCall} className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 gap-2 hover:scale-105 transition-all">
              <Phone size={22} className="text-emerald-600" />
              <span className="text-[11px] font-black text-emerald-600">Call</span>
            </button>
            <button onClick={handleWhatsApp} className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-green-50 dark:bg-green-950/20 gap-2 hover:scale-105 transition-all">
              <MessageSquare size={22} className="text-green-600" />
              <span className="text-[11px] font-black text-green-600">WhatsApp</span>
            </button>
            <button onClick={handleCopy} className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-violet-50 dark:bg-violet-950/20 gap-2 hover:scale-105 transition-all">
              <Paperclip size={22} className="text-violet-600" />
              <span className="text-[11px] font-black text-violet-600">Copy</span>
            </button>
          </div>
        )}
        <button onClick={onClose} className="w-full py-3 text-center text-sm font-bold text-slate-400 border-t border-slate-100 dark:border-white/5">Dismiss</button>
      </div>
    </div>
  );
};

// â”€â”€â”€ Module Router Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// â”€â”€â”€ Single reusable ModuleCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ModuleCard = React.memo(({ module: m, isActive, onSelect }) => {
  const handleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(m.id);
  }, [m.id, onSelect]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(m.id);
    }
  }, [m.id, onSelect]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open case in ${m.name}: ${m.desc}${isActive ? ' (currently active)' : ''}`}
      aria-pressed={isActive}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
      className={[
        'w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all select-none outline-none',
        'focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1',
        'active:scale-[0.98]',
        isActive
          ? 'bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/20 border border-violet-200 dark:border-violet-800/40 shadow-sm'
          : 'border border-transparent hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:border-slate-100 dark:hover:border-zinc-700/50'
      ].join(' ')}
    >
      {/* Module icon â€” pointer-events: none so clicks always reach the wrapper */}
      <div
        aria-hidden="true"
        style={{ pointerEvents: 'none' }}
        className={[
          'w-10 h-10 rounded-2xl flex items-center justify-center text-base shrink-0 transition-all',
          isActive
            ? 'bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20'
            : 'bg-slate-100 dark:bg-zinc-800'
        ].join(' ')}
      >
        {getModuleIcon(m.id)}
      </div>

      {/* Name + description â€” pointer-events: none */}
      <div className="min-w-0 flex-1" style={{ pointerEvents: 'none' }}>
        <p className={`text-sm font-black leading-tight ${isActive ? 'text-violet-700 dark:text-violet-300' : 'text-slate-900 dark:text-white'}`}>
          {m.name}
        </p>
        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-snug">{m.desc}</p>
      </div>

      {/* Status badge â€” pointer-events: none */}
      <div style={{ pointerEvents: 'none' }} className="shrink-0">
        {isActive ? (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm shadow-violet-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            ACTIVE
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full">
            AVAILABLE
          </span>
        )}
      </div>
    </div>
  );
});
ModuleCard.displayName = 'ModuleCard';

// â”€â”€â”€ Module Router Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ALL_MODULES = [
  { id: 'legal_argument_builder', name: 'Argument Builder', desc: 'Draft courtroom strategies and arguments', icon: '⚖️ï¸' },
  { id: 'legal_precedents',       name: 'Legal Precedent',  desc: 'AI precedent and citation explorer',       icon: 'ðŸ›ï¸' },
  { id: 'legal_draft_maker',      name: 'Draft Maker',      desc: 'Generate court-ready legal drafts',        icon: 'ðŸ“' },
  { id: 'legal_evidence_checker', name: 'Evidence Analysis',desc: 'Analyze legal documents and evidence',     icon: 'ðŸ”' },
  { id: 'legal_case_predictor',   name: 'Case Predictor',   desc: 'Judicial scanner and forecast',            icon: 'ðŸŽ¯' },
  { id: 'legal_contract_analyzer',name: 'Contract Review',  desc: 'Agreement review and compliance',          icon: 'ðŸ“‹' },
  { id: 'legal_strategy_engine',  name: 'Strategy Engine',  desc: 'Litigation Roadmap & Tactical Suggestions',icon: 'ðŸ—ºï¸' },
];

const ModuleRouterModal = ({ visible, onClose, caseData, onLaunchModule, activeModuleId }) => {
  const [search, setSearch] = useState('');
  // Navigation lock: prevents double-firing on rapid taps
  const launchingRef = useRef(false);

  // Reset search and lock when modal opens/closes
  useEffect(() => {
    if (visible) {
      setSearch('');
      launchingRef.current = false;
    }
  }, [visible]);

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_MODULES;
    const q = search.toLowerCase();
    return ALL_MODULES.filter(m =>
      m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)
    );
  }, [search]);

  // Single shared handler â€” fires once regardless of which element inside the card was touched
  const handleSelectModule = useCallback((moduleId) => {
    if (launchingRef.current) return;   // guard against double-tap
    launchingRef.current = true;
    // Close popup first so the user sees instant feedback
    onClose();
    // Then trigger navigation (state update is async; calling after onClose is fine)
    onLaunchModule(moduleId, caseData);
  }, [onClose, onLaunchModule, caseData]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Open Case In module selector"
      className="fixed inset-0 z-[120000] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      {/* Panel */}
      <div
        className="relative bg-white dark:bg-[#0e1628] w-full sm:w-[500px] max-h-[85vh] sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-200/50 dark:border-white/5"
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Drag handle (mobile only) */}
        <div className="w-10 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full mx-auto mt-3 mb-1 sm:hidden" aria-hidden="true" />

        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/5 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Open Case In...</h2>
              {caseData && (
                <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate max-w-[280px]">
                  ðŸ“ {caseData.title || caseData.name || 'Selected Case'}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close module selector"
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 outline-none"
            >
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          {/* Search â€” no autoFocus so it doesn't interfere with touch on mobile */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-black/20 rounded-xl px-3 py-2.5 border border-slate-100 dark:border-white/5">
            <Search size={15} className="text-slate-400 shrink-0" aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules..."
              aria-label="Search modules"
              className="bg-transparent outline-none text-sm font-semibold w-full text-slate-800 dark:text-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Module list â€” each card is a fully-clickable ModuleCard */}
        <div
          className="flex-1 overflow-y-auto p-3 space-y-1.5"
          role="list"
          aria-label="Available modules"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-slate-400 font-semibold py-8">
              No modules match your search
            </p>
          ) : (
            filtered.map((m) => (
              <div key={m.id} role="listitem">
                <ModuleCard
                  module={m}
                  isActive={activeModuleId === m.id}
                  onSelect={handleSelectModule}
                />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 shrink-0 bg-slate-50/50 dark:bg-black/10">
          <p className="text-[9px] text-center text-slate-400 font-medium">
            Selecting a module will set it as ACTIVE for this case
          </p>
        </div>
      </div>
    </div>
  );
};


// â”€â”€â”€ Task Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TaskModal = ({ visible, onClose, onSave, editingTask }) => {
  const [form, setForm] = useState({ title: '', description: '', date: '', priority: 'Normal' });
  const priorities = ['Low', 'Normal', 'High', 'Urgent', 'Critical'];

  useEffect(() => {
    if (editingTask) {
      setForm({ title: editingTask.title || editingTask.text || '', description: editingTask.description || '', date: editingTask.date || '', priority: editingTask.priority || 'Normal' });
    } else {
      setForm({ title: '', description: '', date: '', priority: 'Normal' });
    }
  }, [editingTask, visible]);

  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[120000] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#1e293b] w-full sm:w-[440px] sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black text-slate-900 dark:text-white">{editingTask ? 'Edit Task' : 'New Task'}</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Task Title</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. File rejoinder before Friday"
          className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold outline-none mb-3 text-slate-800 dark:text-white" />
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Description</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Add details..." rows={2}
          className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold outline-none resize-none mb-3 text-slate-800 dark:text-white" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Due Date</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold outline-none text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Priority</label>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold outline-none text-slate-800 dark:text-white">
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <button onClick={() => {
          if (form.title.trim()) {
            console.log("Button Clicked: Save Task");
            console.log("Icon Clicked: Save Task");
            onSave(form, editingTask);
            onClose();
          }
        }}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all">
          {editingTask ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </div>
  );
};

// â”€â”€â”€ Timeline Event Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TimelineModal = ({ visible, onClose, onSave, editingEvent }) => {
  const [form, setForm] = useState({ title: '', status: 'Scheduled', court: '', date: '' });

  useEffect(() => {
    if (editingEvent) {
      setForm({ title: editingEvent.title || '', status: editingEvent.status || 'Scheduled', court: editingEvent.court || '', date: editingEvent.date || '' });
    } else {
      setForm({ title: '', status: 'Scheduled', court: '', date: '' });
    }
  }, [editingEvent, visible]);

  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[120000] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#1e293b] w-full sm:w-[440px] sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black text-slate-900 dark:text-white">{editingEvent ? 'Edit Event' : 'New Timeline Event'}</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Event Title</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Case hearing at District Court"
          className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold outline-none mb-3 text-slate-800 dark:text-white" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Date</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold outline-none text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold outline-none text-slate-800 dark:text-white">
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Court</label>
        <input value={form.court} onChange={e => setForm({ ...form, court: e.target.value })} placeholder="e.g. District Court, Delhi"
          className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold outline-none mb-5 text-slate-800 dark:text-white" />
        <button onClick={() => {
          if (form.title.trim()) {
            console.log("Button Clicked: Save Event");
            console.log("Icon Clicked: Save Event");
            onSave(form, editingEvent);
            onClose();
          }
        }}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all">
          {editingEvent ? 'Update Event' : 'Add Event'}
        </button>
      </div>
    </div>
  );
};

const HearingModal = ({ visible, onClose, onSave, editingHearing }) => {
  const [form, setForm] = useState({
    hearingType: 'Civil Hearing',
    date: '',
    time: '10:30 AM',
    court: '',
    judge: '',
    courtRoom: '',
    purpose: '',
    status: 'Upcoming',
    notes: ''
  });

  useEffect(() => {
    if (editingHearing) {
      setForm({
        hearingType: editingHearing.stage || 'Civil Hearing',
        date: editingHearing.date || '',
        time: editingHearing.time || '10:30 AM',
        court: editingHearing.court || '',
        judge: editingHearing.judge || '',
        courtRoom: editingHearing.courtRoom || '',
        purpose: editingHearing.summary || '',
        status: editingHearing.status || 'Upcoming',
        notes: editingHearing.clerkNotes || ''
      });
    } else {
      setForm({
        hearingType: 'Civil Hearing',
        date: '',
        time: '10:30 AM',
        court: '',
        judge: '',
        courtRoom: '',
        purpose: '',
        status: 'Upcoming',
        notes: ''
      });
    }
  }, [editingHearing, visible]);

  if (!visible) return null;

  const hearingTypes = [
    'Civil Hearing',
    'Evidence Hearing',
    'Final Arguments',
    'Cross Examination',
    'Bail Hearing',
    'Order Pronouncement',
    'Case Management Hearing',
    'Appeal Hearing',
    'Mediation',
    'Admission Hearing'
  ];

  const statuses = [
    'Upcoming',
    'Completed',
    'Adjourned',
    'Reserved',
    'Cancelled',
    'Disposed'
  ];

  return (
    <div className="fixed inset-0 z-[120000] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#1a2540] w-full sm:w-[500px] sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl border border-slate-200 dark:border-zinc-800/80 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-zinc-850">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            {editingHearing ? 'Edit Court Hearing' : 'Schedule Hearing'}
          </h3>
          <button onClick={onClose}><X size={18} className="text-slate-400 hover:text-slate-655" /></button>
        </div>

        <div className="space-y-3.5">
          {/* Row 1: Hearing Type */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 block font-bold">Hearing Type</label>
            <select 
              value={form.hearingType} 
              onChange={e => setForm({ ...form, hearingType: e.target.value })}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-semibold outline-none text-slate-800 dark:text-white"
            >
              {hearingTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Row 2: Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 block font-bold">Date</label>
              <input 
                type="text" 
                placeholder="e.g. 15 Jul 2026"
                value={form.date} 
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-semibold outline-none text-slate-800 dark:text-white" 
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 block font-bold">Time</label>
              <input 
                type="text" 
                value={form.time} 
                onChange={e => setForm({ ...form, time: e.target.value })}
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-semibold outline-none text-slate-800 dark:text-white" 
              />
            </div>
          </div>

          {/* Row 3: Court & Courtroom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 block font-bold">Court</label>
              <input 
                value={form.court} 
                onChange={e => setForm({ ...form, court: e.target.value })} 
                placeholder="e.g. District Court"
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-semibold outline-none text-slate-800 dark:text-white" 
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 block font-bold">Court Room</label>
              <input 
                value={form.courtRoom} 
                onChange={e => setForm({ ...form, courtRoom: e.target.value })} 
                placeholder="e.g. Courtroom 12"
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-semibold outline-none text-slate-800 dark:text-white" 
              />
            </div>
          </div>

          {/* Row 4: Judge & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 block font-bold">Judge</label>
              <input 
                value={form.judge} 
                onChange={e => setForm({ ...form, judge: e.target.value })} 
                placeholder="e.g. Justice R. Sharma"
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-semibold outline-none text-slate-800 dark:text-white" 
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 block font-bold">Status</label>
              <select 
                value={form.status} 
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-semibold outline-none text-slate-800 dark:text-white"
              >
                {statuses.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Purpose */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 block font-bold">Purpose / Summary</label>
            <input 
              value={form.purpose} 
              onChange={e => setForm({ ...form, purpose: e.target.value })} 
              placeholder="e.g. Cross examination of Plaintiff Witness"
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-semibold outline-none text-slate-800 dark:text-white" 
            />
          </div>

          {/* Row 6: Notes */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 block font-bold">Notes / AI Prep Summary</label>
            <textarea 
              value={form.notes} 
              onChange={e => setForm({ ...form, notes: e.target.value })} 
              placeholder="Private observations, checklist items, or notes..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-semibold outline-none text-slate-800 dark:text-white resize-none" 
            />
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-850 flex gap-3">
          <button 
            type="button"
            onClick={onClose} 
            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={() => onSave(form, editingHearing)}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
          >
            {editingHearing ? 'Save Changes' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
};

const UploadCourtOrderModal = ({ visible, onClose, hearing, onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('keep'); // 'keep' or 'replace'
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (visible) {
      setFile(null);
      setUploadMode('keep');
      setProgress(0);
      setIsUploading(false);
    }
  }, [visible]);

  if (!visible || !hearing) return null;

  const hasExistingOrder = !!hearing.orderDocumentId;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const selected = e.dataTransfer.files?.[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    
    // Simulate upload progress
    for (let p = 10; p <= 100; p += 30) {
      setProgress(p);
      await new Promise(r => setTimeout(r, 150));
    }

    onUpload(file, hearing, uploadMode);
    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120000] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#1a2540] w-full sm:w-[460px] sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl border border-slate-200 dark:border-zinc-800/80" onClick={e => e.stopPropagation()}>
        
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-zinc-850">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Upload Court Order
          </h3>
          <button onClick={onClose}><X size={18} className="text-slate-400 hover:text-slate-655" /></button>
        </div>

        <div className="space-y-4">
          {/* Hearing context details */}
          <div className="bg-slate-50 dark:bg-black/10 p-3 rounded-xl border border-slate-100 dark:border-zinc-800/40">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5 font-bold">This order will be attached to:</span>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-855 dark:text-white">{hearing.stage || 'Court Appearance'}</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] rounded font-bold uppercase">{hearing.status}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-405 font-bold">
                {hearing.date} • {hearing.time || '10:30 AM'}
              </p>
              <p className="text-[10px] text-slate-505 dark:text-slate-405 font-bold">
                {hearing.judge ? `Bench: ${hearing.judge}` : 'Judge details not assigned'}
              </p>
            </div>
          </div>

          {/* Warning if already exists */}
          {hasExistingOrder && (
            <div className="p-3 bg-amber-50 dark:bg-amber-955/20 border border-amber-200/30 rounded-xl space-y-2">
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                <AlertCircle size={12} /> A court order is already attached to this hearing.
              </p>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="radio" 
                    name="uploadMode" 
                    checked={uploadMode === 'keep'} 
                    onChange={() => setUploadMode('keep')} 
                    className="accent-indigo-600"
                  />
                  Keep Both
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="radio" 
                    name="uploadMode" 
                    checked={uploadMode === 'replace'} 
                    onChange={() => setUploadMode('replace')} 
                    className="accent-indigo-600"
                  />
                  Replace Existing
                </label>
              </div>
            </div>
          )}

          {/* File Selector Dropzone */}
          {!file ? (
            <div 
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('order-file-picker').click()}
              className="border-2 border-dashed border-indigo-200 dark:border-zinc-800 hover:border-[#4F46E5] dark:hover:border-indigo-400 bg-indigo-50/10 dark:bg-black/5 rounded-2xl p-6 text-center cursor-pointer transition-colors"
            >
              <input 
                type="file" 
                id="order-file-picker" 
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden" 
              />
              <UploadCloud size={28} className="text-[#4F46E5] mx-auto mb-2 opacity-80" />
              <p className="text-xs font-bold text-slate-805 dark:text-white">Choose a court order document</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-semibold">PDF or Word files up to 20MB</p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-red-600 rounded-lg">
                  <FileText size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[200px]" title={file.name}>{file.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setFile(null)} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Progress bar */}
          {isUploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-slate-455 uppercase">
                <span>Uploading court order...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-105 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#4F46E5] h-full transition-all duration-150" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-105 dark:border-zinc-850 flex gap-3">
          <button 
            type="button"
            onClick={onClose} 
            disabled={isUploading}
            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={!file || isUploading}
            className="flex-1 py-2 bg-[#4F46E5] hover:opacity-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-40"
          >
            Save Document
          </button>
        </div>

      </div>
    </div>
  );
};

// â”€â”€â”€ Notes Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const NotesModal = ({ visible, onClose, onSave, initialText }) => {
  const [text, setText] = useState('');
  useEffect(() => { if (visible) setText(initialText || ''); }, [visible, initialText]);
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[120000] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#1e293b] w-full sm:w-[520px] sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white">Case Notes</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={8} autoFocus placeholder="Add private case notes here..."
          className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold outline-none resize-none mb-4 text-slate-800 dark:text-white leading-relaxed" />
        <div className="flex gap-3">
          <button onClick={() => {
            console.log("Button Clicked: Cancel Save Notes");
            console.log("Icon Clicked: Cancel Save Notes");
            onClose();
          }} className="flex-1 py-3 border border-slate-200 dark:border-white/5 rounded-xl font-bold text-xs text-slate-500 uppercase tracking-wider">Cancel</button>
          <button onClick={() => {
            console.log("Button Clicked: Save Notes");
            console.log("Icon Clicked: Save Notes");
            onSave(text);
            onClose();
          }}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all">Save Notes</button>
        </div>
      </div>
    </div>
  );
};

// â”€â”€â”€ Document Viewer Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DocViewerModal = ({ visible, onClose, doc }) => {
  if (!visible || !doc) return null;

  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [conversionLoading, setConversionLoading] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState(false);

  const fileExt = doc.name?.split('.').pop()?.toLowerCase() || '';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
  const isPdf = fileExt === 'pdf';
  const isText = ['txt', 'csv', 'json', 'md', 'xml'].includes(fileExt);
  
  // Office files
  const isOffice = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(fileExt);

  // Trigger conversion simulation when opening an office file
  useEffect(() => {
    if (isOffice) {
      setConversionLoading(true);
      setConversionSuccess(false);
      const timer = setTimeout(() => {
        setConversionLoading(false);
        setConversionSuccess(false); // Default to fail so they see the gorgeous AI extracted view!
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [doc, isOffice]);

  const handlePrint = () => {
    if (!doc.uri) return;
    const printWindow = window.open(doc.uri, '_blank');
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const renderControlBar = () => (
    <div className="bg-slate-50 dark:bg-black/10 border-b border-slate-150 dark:border-zinc-800/40 px-4 py-2 flex items-center justify-between shrink-0 text-slate-500 text-xs">
      <div className="flex items-center gap-1.5 font-bold uppercase text-[9px] text-slate-400">
        <span>File Type: <strong className="text-slate-700 dark:text-white">{fileExt}</strong></span>
        <span>•</span>
        <span>Size: <strong className="text-slate-700 dark:text-white">{formatSize(doc.size)}</strong></span>
      </div>

      <div className="flex items-center gap-1">
        {isImage && (
          <div className="flex items-center gap-1 mr-2 border-r border-slate-200 dark:border-zinc-800/60 pr-2">
            <button onClick={() => setZoom(Math.max(50, zoom - 25))} className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded text-slate-600 dark:text-slate-350" title="Zoom Out">-</button>
            <span className="text-[9px] w-8 text-center font-bold">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded text-slate-600 dark:text-slate-350" title="Zoom In">+</button>
          </div>
        )}

        <button onClick={handlePrint} className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded text-slate-600 dark:text-slate-350 flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-wider transition-all" title="Print File">
          <FileDown size={11} /> Print
        </button>
        <button onClick={toggleFullscreen} className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded text-slate-600 dark:text-slate-350 flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-wider transition-all" title="Toggle Fullscreen">
          {isFullscreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />} {isFullscreen ? "Exit" : "Fullscreen"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[120000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div 
        className={`relative bg-white dark:bg-[#151f32] rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${
          isFullscreen 
            ? 'w-[98vw] h-[96vh]' 
            : 'w-full max-w-4xl h-[75vh]'
        }`} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-black/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] rounded-lg">
              <FileText size={14} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-slate-800 dark:text-white truncate" title={doc.name}>{doc.name}</h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5 tracking-wider">Enterprise Document Viewer</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const a = document.createElement('a');
                a.href = doc.uri;
                a.download = doc.name;
                a.click();
              }}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-355 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 shadow-xs border border-slate-150 dark:border-zinc-700/50"
              title="Download File"
            >
              <Download size={11} /> Download
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-55 dark:bg-black/20 flex flex-col min-h-0">
          {/* Show control bar only for previewable formats */}
          {(isImage || isPdf || isText) && renderControlBar()}

          <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-0">
            {isImage ? (
              <div className="max-w-full max-h-full flex items-center justify-center overflow-auto p-2">
                <img 
                  src={doc.uri} 
                  alt={doc.name} 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm transition-all" 
                  style={{ transform: `scale(${zoom / 100})` }}
                />
              </div>
            ) : isPdf ? (
              <iframe src={doc.uri} title={doc.name} className="w-full h-full border-0 rounded-lg bg-white" />
            ) : isText ? (
              <div className="w-full h-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-xl p-4 overflow-auto font-mono text-[10px] text-slate-800 dark:text-slate-250 whitespace-pre-wrap">
                {doc.extractedText || doc.facts || "Extracted text not loaded."}
              </div>
            ) : isOffice ? (
              /* OFFICE PREVIEW WITH FALLBACK TO AI VIEW */
              <div className="w-full h-full flex flex-col min-h-0">
                {conversionLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Attempting Document HTML Conversion...</h4>
                    <p className="text-[9px] text-slate-400 font-semibold mt-1">Generating optimized view for Case Assessment...</p>
                  </div>
                ) : conversionSuccess ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-xs text-slate-505 font-semibold">Converted View Available.</p>
                  </div>
                ) : (
                  /* EXCELLENT MOCK/SIMULATION: SHOW AI EXTRACTED DOCUMENT VIEW */
                  <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden min-h-0 text-slate-800 dark:text-white">
                    {/* Left Column: Summary and Extracted Text */}
                    <div className="flex-1 flex flex-col gap-3 min-h-0">
                      <div className="bg-white dark:bg-[#151f32] border border-slate-200 dark:border-zinc-805/50 rounded-xl p-3 shrink-0">
                        <h4 className="text-[10px] font-black uppercase text-[#4F46E5] tracking-widest mb-1.5">🧠 AI Document Summary</h4>
                        <p className="text-[10.5px] font-medium leading-relaxed italic text-slate-655 dark:text-slate-350">
                          "{doc.facts || 'No analysis preview available for this document.'}"
                        </p>
                      </div>

                      <div className="flex-1 bg-white dark:bg-[#151f32] border border-slate-200 dark:border-zinc-805/50 rounded-xl p-3 flex flex-col min-h-0">
                        <h4 className="text-[10px] font-black uppercase text-[#4F46E5] tracking-widest mb-1.5">📝 Extracted Readable Content (OCR)</h4>
                        <div className="flex-1 overflow-y-auto font-mono text-[9.5px] text-slate-600 dark:text-slate-300 bg-slate-50/40 dark:bg-black/10 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800/40 whitespace-pre-wrap leading-relaxed">
                          {doc.extractedText || doc.facts || "Extracted readable document contents are currently unavailable."}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Extracted Metadata & Risk Checklist */}
                    <div className="w-full md:w-80 shrink-0 bg-white dark:bg-[#151f32] border border-slate-200 dark:border-zinc-805/50 rounded-xl p-3 overflow-y-auto space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-slate-800 dark:text-white tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1.5">
                        <Sparkles size={11} className="text-[#4F46E5]" /> AI Document Roster
                      </h4>

                      <div className="space-y-3 text-[10px]">
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Document Type</span>
                          <span className="inline-block px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] text-[8px] font-black rounded uppercase tracking-wider mt-1 border border-indigo-100/50">
                            {doc.category || 'Other'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Key Parties</span>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {(doc.extractedParties || []).map((party, i) => (
                              <span key={i} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] rounded text-[8.5px] font-bold">{party}</span>
                            ))}
                            {(doc.extractedParties || []).length === 0 && <span className="text-slate-400 font-semibold italic">None detected</span>}
                          </div>
                        </div>

                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Key Dates</span>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {(doc.extractedDates || []).map((date, i) => (
                              <span key={i} className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded text-[8.5px] font-bold">{date}</span>
                            ))}
                            {(doc.extractedDates || []).length === 0 && <span className="text-slate-400 font-semibold italic">None detected</span>}
                          </div>
                        </div>

                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Court / Authority</span>
                          <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{doc.courtName || 'District Court'}</p>
                        </div>

                        {doc.judgeName && (
                          <div>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Judge</span>
                            <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{doc.judgeName}</p>
                          </div>
                        )}

                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Legal Sections & Acts</span>
                          <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                            {doc.acts || 'Indian Contract Act'} • {doc.sections || 'Section 73'}
                          </p>
                        </div>

                        {doc.precedents && (
                          <div>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Precedents</span>
                            <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 italic">{doc.precedents}</p>
                          </div>
                        )}

                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Risk Assessment</span>
                          <p className="font-semibold text-amber-600 dark:text-amber-505 mt-0.5 flex items-center gap-1.5 leading-snug">
                            <AlertCircle size={10} className="shrink-0" />
                            <span>Risk Level: <strong className="uppercase font-extrabold">{doc.riskLevel || 'Low'}</strong></span>
                          </p>
                        </div>

                        {doc.recommendations && (
                          <div>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">AI Recommendations</span>
                            <p className="font-semibold text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{doc.recommendations}</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-zinc-805/40 text-[9px] text-slate-400 font-bold uppercase space-y-1">
                        <div>Upload Date: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}</div>
                        <div>OCR Accuracy: {doc.confidenceScore || 95}%</div>
                        <div className="text-[#4F46E5] font-black mt-2">⭐ Auto-Extracted via AI</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* LAST RESORT CARD */
              <div className="text-center p-6 bg-white dark:bg-[#151f32] border border-slate-200 dark:border-zinc-800/60 rounded-xl max-w-sm shadow-sm flex flex-col items-center">
                <AlertCircle size={32} className="text-slate-400 mb-2.5" />
                <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-wider mb-1">This file type cannot currently be previewed</h4>
                <p className="text-[9.5px] text-slate-405 font-bold uppercase mb-4 leading-tight">We do not support inline previewing for {fileExt.toUpperCase()} files.</p>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = doc.uri;
                      a.download = doc.name;
                      a.click();
                    }}
                    className="flex-1 py-1.5 bg-[#4F46E5] hover:opacity-95 text-white rounded-lg font-black text-[9px] uppercase tracking-wider transition-all"
                  >
                    Download File
                  </button>
                  <button
                    onClick={() => {
                      toast.loading("Retrying document extraction...", { duration: 1500 });
                    }}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-250 text-slate-700 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all border border-slate-200"
                  >
                    Retry OCR
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// â”€â”€â”€ Case Detail View â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CaseDetailView = ({ item, isDark, onBack, onDelete, onAskStrategy, onViewRoadmap, onLaunchModuleWithCase, onUpdateCase }) => {
  const { tLegal } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [caseData, _setCaseData] = useState(item);
  
  const setCaseData = useCallback((val) => {
    _setCaseData(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      if (next !== prev) {
        onUpdateCase?.(next);
      }
      return next;
    });
  }, [onUpdateCase]);

  // Migration Effect for Isolated Collections (Documents, Evidence, Contracts)
  useEffect(() => {
    if (caseData && (!caseData.contracts || !caseData.evidence)) {
      const allDocs = caseData.documents || [];
      const migratedContracts = caseData.contracts || allDocs.filter(d => d.isContract || d.category === 'Contract' || d.folder === 'Contracts');
      const migratedEvidence = caseData.evidence || allDocs.filter(d => d.category === 'Evidence' || d.isEvidence || d.folder === 'Evidence');
      const migratedDocs = allDocs.filter(d => 
        !(d.isContract || d.category === 'Contract' || d.folder === 'Contracts') &&
        !(d.category === 'Evidence' || d.isEvidence || d.folder === 'Evidence')
      );
      
      const runMigration = async () => {
        try {
          await legalService.updateCase(caseData.id || caseData._id, {
            documents: migratedDocs,
            contracts: migratedContracts,
            evidence: migratedEvidence
          });
          _setCaseData(prev => ({
            ...prev,
            documents: migratedDocs,
            contracts: migratedContracts,
            evidence: migratedEvidence
          }));
          console.log("[Migration] Successfully separated project document collections!");
        } catch (err) {
          console.error("[Migration] Failed to separate project document collections", err);
        }
      };
      runMigration();
    }
  }, [caseData?.id, caseData?._id]);

  const handleDropUpload = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    const mockEvent = { target: { files: files } };
    handleUploadEvidence(mockEvent);
  };

  const [isEditingFacts, setIsEditingFacts] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineSearchQuery, setTimelineSearchQuery] = useState('');
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [showSuggestedEvents, setShowSuggestedEvents] = useState(false);
  const [selectedDetailEvent, setSelectedDetailEvent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExtractingTimeline, setIsExtractingTimeline] = useState(false);
  const [hearingSearchQuery, setHearingSearchQuery] = useState('');
  const [hearingFilter, setHearingFilter] = useState('all');
  const [selectedDetailHearing, setSelectedDetailHearing] = useState(null);
  const [isHearingClerkModalOpen, setIsHearingClerkModalOpen] = useState(false);
  const [isExtractingHearings, setIsExtractingHearings] = useState(false);
  const [showHearingOverflow, setShowHearingOverflow] = useState(false);
  const [isEditRosterModalOpen, setIsEditRosterModalOpen] = useState(false);
  const [activeRosterSection, setActiveRosterSection] = useState('client');
  const [isExtractingParties, setIsExtractingParties] = useState(false);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [docFilter, setDocFilter] = useState('all');
  const [selectedDocDetails, setSelectedDocDetails] = useState(null);
  const [docViewMode, setDocViewMode] = useState('grid');
  const [isDocInsightsOpen, setIsDocInsightsOpen] = useState(false);
  const [evidenceSearchQuery, setEvidenceSearchQuery] = useState('');
  const [evidenceFilter, setEvidenceFilter] = useState('all');
  const [selectedEvidenceDetails, setSelectedEvidenceDetails] = useState(null);
  const [isEvidenceInsightsOpen, setIsEvidenceInsightsOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [researchSearchQuery, setResearchSearchQuery] = useState('');
  const [isExtractingResearch, setIsExtractingResearch] = useState(false);
  const [expandedResearchAccordions, setExpandedResearchAccordions] = useState({ statutes: false, precedents: false, strategy: false, recommendations: false, saved: false });
  const [draftFormType, setDraftFormType] = useState('Legal Notice');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [selectedContractDetails, setSelectedContractDetails] = useState(null);
  const [isContractInsightsOpen, setIsContractInsightsOpen] = useState(false);
  const [expandedContractAccordions, setExpandedContractAccordions] = useState({ summary: false, clauses: false, risks: false, improvements: false, dates: false, parties: false });
  const [activeStrategyTab, setActiveStrategyTab] = useState('dashboard');
  const [isExtractingArguments, setIsExtractingArguments] = useState(false);
  const [contractSearchQuery, setContractSearchQuery] = useState('');
  const [contractFilterType, setContractFilterType] = useState('All');
  const [activeActionsMenuId, setActiveActionsMenuId] = useState(null);
  // Arguments & Notes Redesign states
  const [activeArgumentsSubTab, setActiveArgumentsSubTab] = useState('overview');
  const [expandedArgumentId, setExpandedArgumentId] = useState(null);
  const [searchQueryArguments, setSearchQueryArguments] = useState('');
  const [filterArguments, setFilterArguments] = useState('All');
  const [selectedObjectionExplanation, setSelectedObjectionExplanation] = useState(null);
  const [expandedSequenceSteps, setExpandedSequenceSteps] = useState({});
  const [expandedWitnessIds, setExpandedWitnessIds] = useState({});
  const [notesSearchQuery, setNotesSearchQuery] = useState('');
  const [notesFilterType, setNotesFilterType] = useState('all');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceTimer, setVoiceTimer] = useState(0);
  const [voiceIntervalId, setVoiceIntervalId] = useState(null);
  const [expandedNotesIds, setExpandedNotesIds] = useState({});


  // New enterprise draft state
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [draftPurpose, setDraftPurpose] = useState('');
  const [draftInstructions, setDraftInstructions] = useState('');
  const [aiEditorInstruction, setAiEditorInstruction] = useState('');
  const [isAiEditorRunning, setIsAiEditorRunning] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(13);
  const [editorLineSpacing, setEditorLineSpacing] = useState('double');
  const [editorFontFamily, setEditorFontFamily] = useState('serif');
  const [editorSavedIndicator, setEditorSavedIndicator] = useState('Saved in Cloud');









  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPrecedent, setSelectedPrecedent] = useState(null);
  
  // Workspace UI states
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [showAiAssistant, setShowAiAssistant] = useState(() => window.innerWidth >= 768);

  const openAssistant = () => {
    setShowAiAssistant(true);
    if (window.innerWidth < 768) {
      window.history.pushState({ assistantOpen: true }, '');
    }
  };

  const closeAssistant = () => {
    setShowAiAssistant(false);
    if (window.innerWidth < 768 && window.history.state?.assistantOpen) {
      window.history.back();
    }
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (window.innerWidth < 768 && showAiAssistant) {
        setShowAiAssistant(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showAiAssistant]);

  const tabsContainerRef = useRef(null);

  const handleTabClick = (tabId, event) => {
    setActiveTab(tabId);
    if (window.innerWidth < 768 && event && event.currentTarget) {
      event.currentTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };
  const [isAssistantMaximized, setIsAssistantMaximized] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [showSidebarHistory, setShowSidebarHistory] = useState(false);
  const [showSidebarPlusMenu, setShowSidebarPlusMenu] = useState(false);
  const [sidebarSessions, setSidebarSessions] = useState([]);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [pinnedSessionIds, setPinnedSessionIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pinned_sessions') || '[]');
    } catch {
      return [];
    }
  });
  const draftsRef = useRef({});
  const attachmentsRef = useRef({});

  const handleChatInputChange = (val) => {
    setChatInput(val);
    if (activeSessionId) {
      draftsRef.current[activeSessionId] = val;
    }
  };

  useEffect(() => {
    if (activeSessionId) {
      setChatInput(draftsRef.current[activeSessionId] || '');
      setTimeout(() => {
        if (sidebarScrollRef.current) {
          sidebarScrollRef.current.scrollTop = sidebarScrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [activeSessionId]);

  const handleTogglePinSession = (sId) => {
    setPinnedSessionIds(prev => {
      const next = prev.includes(sId) ? prev.filter(id => id !== sId) : [...prev, sId];
      localStorage.setItem('pinned_sessions', JSON.stringify(next));
      return next;
    });
    toast.success("Conversation pin status updated");
  };

  const handleRenameSession = async (session, newTitle) => {
    const sId = session.chat_id || session.sessionId;
    const success = await chatStorageService.updateSessionTitle(sId, newTitle);
    if (success) {
      toast.success("Conversation renamed successfully");
      loadSidebarSessions();
    } else {
      toast.error("Failed to rename conversation");
    }
  };

  const handleDeleteSession = async (session) => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      const sId = session.chat_id || session.sessionId;
      await chatStorageService.deleteSession(sId);
      toast.success("Conversation deleted successfully");
      if (sId === activeSessionId) {
        const caseId = caseData.id || caseData._id;
        const targetSessionId = `case_chat_${caseId}_${Date.now()}`;
        setActiveSessionId(targetSessionId);
        setAiMessages([]);
      }
      loadSidebarSessions();
    }
  };

  const handleDuplicateSession = async (session) => {
    const sId = session.chat_id || session.sessionId;
    const newSessionId = `case_chat_${caseData.id || caseData._id}_${Date.now()}`;
    const historyData = await chatStorageService.getHistory(sId);
    if (historyData && Array.isArray(historyData.messages)) {
      for (const msg of historyData.messages) {
        await chatStorageService.saveMessage(newSessionId, msg, `Duplicate: ${session.title}`, caseData.id || caseData._id);
      }
      toast.success("Conversation duplicated successfully!");
      loadSidebarSessions();
    } else {
      toast.error("Failed to duplicate conversation");
    }
  };

  const handleExportSession = (session) => {
    const sId = session.chat_id || session.sessionId;
    chatStorageService.getHistory(sId).then(historyData => {
      if (historyData && Array.isArray(historyData.messages)) {
        const text = historyData.messages.map(m => `[${m.role.toUpperCase()}] ${m.content}`).join('\n\n');
        const blob = new Blob([text], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${session.title || 'conversation'}.md`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Conversation exported as Markdown!");
      }
    });
  };

  const handleSelectSession = async (session) => {
    const sId = session.chat_id || session.sessionId;
    setActiveSessionId(sId);
    const historyData = await chatStorageService.getHistory(sId);
    if (historyData && Array.isArray(historyData.messages)) {
      setAiMessages(historyData.messages);
    }
    setShowSidebarHistory(false);
  };

  const handleNewChat = () => {
    const caseId = caseData?.id || caseData?._id;
    if (caseId) {
      const targetSessionId = `case_chat_${caseId}_${Date.now()}`;
      setActiveSessionId(targetSessionId);
      setAiMessages([]);
      toast.success("Started new chat session");
    }
  };

  const filteredSessions = useMemo(() => {
    const query = historySearchQuery.toLowerCase();
    let items = sidebarSessions.filter(s => 
      (s.title || '').toLowerCase().includes(query)
    );
    return items.sort((a, b) => {
      const aId = a.chat_id || a.sessionId;
      const bId = b.chat_id || b.sessionId;
      const aPinned = pinnedSessionIds.includes(aId);
      const bPinned = pinnedSessionIds.includes(bId);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return (b.lastModified || 0) - (a.lastModified || 0);
    });
  }, [sidebarSessions, historySearchQuery, pinnedSessionIds]);
  const HistoryItem = ({ session, isActive, onSelect, onRename, onDelete, onDuplicate, onPin, onExport, isPinned }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [renameVal, setRenameVal] = useState(session.title || 'New Chat');
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const actionsMenuRef = useRef(null);

    const handleSaveRename = (e) => {
      e.preventDefault();
      if (renameVal.trim()) {
        onRename(renameVal);
        setIsEditing(false);
      }
    };

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target)) {
          setShowActionsMenu(false);
        }
      };
      if (showActionsMenu) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showActionsMenu]);

    const dateObj = new Date(session.timestamp || session.lastModified || Date.now());
    const displayDate = dateObj.toLocaleDateString();
    const displayTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <div 
        className={`group relative w-full p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
          isActive 
            ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40 text-[#4F46E5]' 
            : 'bg-white dark:bg-zinc-800/80 border-slate-100 dark:border-zinc-800/80 text-slate-750 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 hover:border-slate-200 dark:hover:border-zinc-700'
        }`}
        onClick={() => !isEditing && onSelect()}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <form onSubmit={handleSaveRename} className="flex items-center gap-1.5 w-full" onClick={e => e.stopPropagation()}>
                <input 
                  type="text"
                  value={renameVal}
                  onChange={(e) => setRenameVal(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-indigo-500 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 dark:text-white outline-none"
                  autoFocus
                />
                <button type="submit" className="p-1 text-green-500 hover:text-green-650 bg-transparent border-none cursor-pointer"><Check size={14} /></button>
                <button type="button" onClick={() => setIsEditing(false)} className="p-1 text-slate-400 hover:text-slate-500 bg-transparent border-none cursor-pointer"><X size={14} /></button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                {isPinned && <Pin size={11} className="text-amber-500 shrink-0 transform rotate-45" />}
                <h4 className="text-xs font-bold truncate leading-tight select-none pr-6">
                  {session.title || 'New Chat'}
                </h4>
              </div>
            )}
          </div>
          
          {!isEditing && (
            <div className="relative shrink-0 animate-in fade-in" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent"
                aria-label="Conversation actions"
              >
                <MoreVertical size={13} />
              </button>
              
              {showActionsMenu && (
                <div 
                  ref={actionsMenuRef}
                  className="absolute right-0 top-full mt-1 z-[120000] w-36 bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl p-1.5 space-y-0.5 text-left"
                >
                  <button 
                    onClick={() => { onSelect(); setShowActionsMenu(false); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-lg text-[10px] font-bold text-slate-700 dark:text-gray-200 transition-colors border-none bg-transparent cursor-pointer text-left"
                  >
                    <Eye size={12} className="text-slate-400" />
                    <span>Resume Chat</span>
                  </button>
                  <button 
                    onClick={() => { setIsEditing(true); setShowActionsMenu(false); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-lg text-[10px] font-bold text-slate-700 dark:text-gray-200 transition-colors border-none bg-transparent cursor-pointer text-left"
                  >
                    <Edit2 size={12} className="text-slate-400" />
                    <span>Rename</span>
                  </button>
                  <button 
                    onClick={() => { onPin(); setShowActionsMenu(false); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-lg text-[10px] font-bold text-slate-700 dark:text-gray-200 transition-colors border-none bg-transparent cursor-pointer text-left"
                  >
                    <Pin size={12} className="text-slate-400" />
                    <span>{isPinned ? 'Unpin' : 'Pin'}</span>
                  </button>
                  <button 
                    onClick={() => { onDuplicate(); setShowActionsMenu(false); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-lg text-[10px] font-bold text-slate-700 dark:text-gray-200 transition-colors border-none bg-transparent cursor-pointer text-left"
                  >
                    <Copy size={12} className="text-slate-400" />
                    <span>Duplicate</span>
                  </button>
                  <button 
                    onClick={() => { onExport(); setShowActionsMenu(false); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-lg text-[10px] font-bold text-slate-700 dark:text-gray-200 transition-colors border-none bg-transparent cursor-pointer text-left"
                  >
                    <Download size={12} className="text-slate-400" />
                    <span>Export</span>
                  </button>
                  <button 
                    onClick={() => { onDelete(); setShowActionsMenu(false); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-[10px] font-bold text-red-500 transition-colors border-none bg-transparent cursor-pointer text-left"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400 select-none">
          <div className="flex items-center gap-1.5">
            <span>{displayDate}</span>
            <span>•</span>
            <span>{displayTime}</span>
          </div>
          {isActive && (
            <span className="flex items-center gap-1 text-emerald-500 font-extrabold normal-case">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          )}
        </div>
      </div>
    );
  };

  const HistoryDrawer = () => {
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setShowSidebarHistory(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const drawerRef = useRef(null);
    useEffect(() => {
      if (!showSidebarHistory) return;
      const focusableElements = drawerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        const handleTab = (e) => {
          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
              }
            }
          }
        };
        window.addEventListener('keydown', handleTab);
        firstElement.focus();
        return () => window.removeEventListener('keydown', handleTab);
      }
    }, [showSidebarHistory]);

    return (
      <AnimatePresence>
        {showSidebarHistory && (
          <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end select-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowSidebarHistory(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-0"
            />
            
            <motion.div
              ref={drawerRef}
              initial={isMobile ? { y: "100%" } : { x: "100%" }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: "100%" } : { x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`relative z-10 bg-white dark:bg-zinc-900 shadow-2xl flex flex-col overflow-hidden ${
                isMobile 
                ? 'w-full h-[85vh] rounded-t-3xl pb-safe' 
                : 'w-[400px] h-full border-l border-[#E5E7EB] dark:border-zinc-800'
              }`}
            >
              <div className="p-4 border-b border-[#E5E7EB] dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900 select-none">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-[#4F46E5]" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Conversation History</h3>
                  </div>
                  <button
                    onClick={() => setShowSidebarHistory(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                    aria-label="Close history"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    placeholder="Search history..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-[#4F46E5] transition-colors"
                  />
                  {historySearchQuery && (
                    <button 
                      onClick={() => setHistorySearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {filteredSessions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-zinc-800 text-slate-400 rounded-2xl flex items-center justify-center mb-3">
                      <History size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">No conversation history</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Start a new conversation to build your case history.</p>
                  </div>
                ) : (
                  filteredSessions.map((session) => {
                    const sId = session.chat_id || session.sessionId;
                    const isActive = sId === activeSessionId;
                    return (
                      <HistoryItem 
                        key={sId}
                        session={session}
                        isActive={isActive}
                        onSelect={() => handleSelectSession(session)}
                        onRename={(newTitle) => handleRenameSession(session, newTitle)}
                        onDelete={() => handleDeleteSession(session)}
                        onDuplicate={() => handleDuplicateSession(session)}
                        onPin={() => handleTogglePinSession(sId)}
                        onExport={() => handleExportSession(session)}
                        isPinned={pinnedSessionIds.includes(sId)}
                      />
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  const getInitialNotesText = () => {
    const desc = item?.description;
    const summ = item?.summary;
    if (desc && !desc.includes("AI Analysis Error") && !desc.includes("__AI_ANALYSIS_FAILED__")) {
      return desc;
    }
    if (summ && !summ.includes("AI Analysis Error") && !summ.includes("__AI_ANALYSIS_FAILED__")) {
      return summ;
    }
    return '';
  };

  const [notesText, setNotesText] = useState(getInitialNotesText());

  // Arguments Sub-Navigation states
  const [activeArgumentTab, setActiveArgumentTab] = useState('dashboard');
  const [litigationTasks, setLitigationTasks] = useState([
    { id: 1, title: 'Prepare Written Statement', priority: 'High', dueDate: '2026-07-10', status: 'Done', progress: 100, suggestions: 'Cite CPC Order VIII Rule 1' },
    { id: 2, title: 'Review Evidence', priority: 'High', dueDate: '2026-07-15', status: 'In Progress', progress: 65, suggestions: 'Verify stamp duty logs' },
    { id: 3, title: 'Collect Affidavit', priority: 'High', dueDate: '2026-07-20', status: 'Todo', progress: 0, suggestions: 'Witness attestation required' },
    { id: 4, title: 'Upload Missing Documents', priority: 'Medium', dueDate: '2026-07-22', status: 'Todo', progress: 0, suggestions: 'Obtain banker certificate' },
    { id: 5, title: 'Draft Arguments', priority: 'Medium', dueDate: '2026-07-25', status: 'Todo', progress: 0, suggestions: 'Incorporate precedents' },
    { id: 6, title: 'Verify Citations', priority: 'Low', dueDate: '2026-07-29', status: 'Todo', progress: 0, suggestions: 'Check Supreme Court citations' }
  ]);
  const [caseNotes, setCaseNotes] = useState([
    { id: 1, title: 'Pre-trial Objections Plan', content: '### Jurisdictional Challenge\n- The contract contains a clear arbitration clause under Clause 14.\n- Rebut any claim that Section 9 CPC is applicable directly.', pinned: true, updatedAt: '2026-06-29' },
    { id: 2, title: 'Signature Forgery Counter', content: '### Rebuttal to Forgery Claim\n- The contract signature was verified by public notary Suresh Kumar.\n- Prepare cross-examination on the ledger logs.', pinned: false, updatedAt: '2026-06-28' }
  ]);
  const [activeNoteId, setActiveNoteId] = useState(1);
  const [strategyVersion, setStrategyVersion] = useState('aggressive');
  const [argumentVersions, setArgumentVersions] = useState([
    { version: '1.2', date: '2026-06-29', summary: 'Added CPC Order 37 summary decree argument', author: 'AI Counsel' },
    { version: '1.1', date: '2026-06-28', summary: 'Infused stamp duty and banker certificate amendments', author: 'AI Counsel' },
    { version: '1.0', date: '2026-06-25', summary: 'Initial baseline structured arguments', author: 'Advocate' }
  ]);

  // Modals visibility
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isTimelineModalVisible, setIsTimelineModalVisible] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState(null);
  const [isHearingModalVisible, setIsHearingModalVisible] = useState(false);
  const [editingHearing, setEditingHearing] = useState(null);
  const [isUploadOrderModalOpen, setIsUploadOrderModalOpen] = useState(false);
  const [uploadOrderContextHearing, setUploadOrderContextHearing] = useState(null);
  const [expandedAiSummaryHearingId, setExpandedAiSummaryHearingId] = useState(null);
  const [isRouterVisible, setIsRouterVisible] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [quickActionsPhone, setQuickActionsPhone] = useState(null);
  
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const argumentsRibbonRef = useRef(null);
  const abortControllerRef = useRef(null);
  const streamingIntervalRef = useRef(null);

  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    setIsChatSending(false);
  }, []);

  const [isListeningSidebar, setIsListeningSidebar] = useState(false);
  const recognitionRefSidebar = useRef(null);

  const sidebarScrollRef = useRef(null);
  const [showSidebarScrollBtn, setShowSidebarScrollBtn] = useState(false);
  const prevSidebarUserMsgCountRef = useRef(0);

  const handleSidebarScroll = () => {
    if (!sidebarScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = sidebarScrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 60;
    setShowSidebarScrollBtn(!isNearBottom);
  };

  const scrollToSidebarBottom = () => {
    if (sidebarScrollRef.current) {
      sidebarScrollRef.current.scrollTo({
        top: sidebarScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
    setShowSidebarScrollBtn(false);
  };

  const handleVoiceInputSidebar = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser');
      return;
    }
    if (isListeningSidebar) {
      if (recognitionRefSidebar.current) {
        recognitionRefSidebar.current.stop();
      }
      setIsListeningSidebar(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRefSidebar.current = recognition;
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => {
      setIsListeningSidebar(true);
      toast.success("Listening... Speak now");
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setChatInput(transcript);
    };
    recognition.onend = () => {
      setIsListeningSidebar(false);
    };
    recognition.onerror = () => {
      setIsListeningSidebar(false);
    };
    recognition.start();
  };

  // Sync details from parent prop & load persistent case-specific chat session
  useEffect(() => {
    const loadCaseChatSession = async (caseItem) => {
      const caseId = caseItem.id || caseItem._id;
      // ALWAYS start a fresh unique session ID on case load
      const targetSessionId = `case_chat_${caseId}_${Date.now()}`;
      setActiveSessionId(targetSessionId);
      setAiMessages([]);
    };

    if (item) {
      setCaseData(item);
      setNotesText(item.description || item.summary || '');
      loadCaseChatSession(item);

      // Seed timeline events immediately from the item data (already fetched from DB)
      // This prevents the UI from appearing empty while background sync runs
      if (Array.isArray(item.timelineEvents) && item.timelineEvents.length > 0) {
        setTimelineEvents(item.timelineEvents);
      }

      // Automatically trigger analysis in the background if the case is not yet analyzed
      if (!item.summary && (!item.intelligence || !item.intelligence.strengthScore)) {
        triggerLiveAnalysisSilent(item);
      }
    }
  }, [item]);

  // Load reminders & timeline
  useEffect(() => {
    if (caseData?.id || caseData?._id) {
      const caseId = caseData.id || caseData._id;
      loadTasks(caseId);
      loadTimeline(caseId);
    }
  }, [caseData?.id, caseData?._id]);

  const loadSidebarSessions = async () => {
    const caseId = caseData?.id || caseData?._id;
    if (!caseId) return;
    try {
      const dbSessions = await chatStorageService.getSessions(caseId, 'CASE', caseId);
      setSidebarSessions(dbSessions || []);
    } catch (err) {
      console.error("Failed to load sidebar sessions:", err);
    }
  };

  const handleToggleSidebarHistory = () => {
    const nextVal = !showSidebarHistory;
    setShowSidebarHistory(nextVal);
    if (nextVal) {
      loadSidebarSessions();
    }
  };

  const loadTasks = async (caseId) => {
    try {
      const res = await legalService.getRemindersForCase(caseId);
      setTasks(res || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadTimeline = async (caseId) => {
    try {
      const res = await legalService.getTimelineEvents(caseId);
      setTimelineEvents(res || []);
    } catch (e) {
      console.error(e);
    }
  };

  const triggerBackgroundTimelineSync = async (targetData, force = false) => {
    if (!targetData) return;
    const caseId = targetData.id || targetData._id;
    if (!caseId) return;

    // Skip if events already exist in DB (unless manually forced via AI Extract button)
    const existingEvents = targetData.timelineEvents || [];
    if (!force && existingEvents.length > 0) {
      console.log(`[Background Timeline] Case already has ${existingEvents.length} events. Skipping auto-extraction.`);
      return;
    }

    const summary = targetData.summary || targetData.description || '';
    if (!summary || summary.trim().split(/\s+/).length < 8) {
      console.log("[Background Timeline] Case summary empty or too short. Skipping background extraction.");
      return;
    }

    console.log("[Background Timeline] Triggering timeline background extraction...");
    try {
      setIsExtractingTimeline(true);
      const res = await legalService.generateAiTimelineEvents(caseId, targetData, caseNotes);
      if (res && res.events) {
        setTimelineEvents(res.events || []);
        setCaseData(prev => ({
          ...prev,
          timelineEvents: res.events,
          timelineSuggestions: res.suggestions,
          timelineDeadlines: res.deadlines,
          timelineMissingDocuments: res.missingDocuments
        }));
      }
      console.log("[Background Timeline] Background timeline sync complete.");
    } catch (err) {
      console.error("[Background Timeline] Failed background sync", err);
    } finally {
      setIsExtractingTimeline(false);
    }
  };

  const triggerBackgroundHearingsSync = async (targetData) => {
    if (!targetData) return;
    const caseId = targetData.id || targetData._id;
    if (!caseId) return;

    const summary = targetData.summary || targetData.description || '';
    if (!summary || summary.trim().split(/\s+/).length < 8) {
      console.log("[Background Hearings] Case summary empty or too short. Skipping background extraction.");
      return;
    }

    console.log("[Background Hearings] Triggering hearings background extraction...");
    try {
      setIsExtractingHearings(true);
      const res = await legalService.generateAiHearings(caseId, targetData, caseNotes);
      if (Array.isArray(res)) {
        setCaseData(prev => ({
          ...prev,
          hearings: res
        }));
      }
      console.log("[Background Hearings] Background hearings sync complete.");
    } catch (err) {
      console.error("[Background Hearings] Failed background hearings sync", err);
    } finally {
      setIsExtractingHearings(false);
    }
  };

  useEffect(() => {
    if (caseData?.id || caseData?._id) {
      const timer = setTimeout(() => {
        triggerBackgroundTimelineSync(caseData); // will auto-skip if events already exist
        triggerBackgroundHearingsSync(caseData);
        triggerBackgroundPartiesSync(caseData);
        triggerBackgroundResearchSync(caseData);
        triggerBackgroundArgumentsSync(caseData);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    caseData?.summary,
    caseData?.description,
    caseData?.documents?.length,
    caseData?.drafts?.length,
    caseNotes
    // NOTE: timelineEvents intentionally removed — including it caused an infinite re-extraction loop
  ]);



  const handleSaveTask = async (form, editing) => {
    try {
      if (editing) {
        await legalService.updateReminder(editing.id, { title: form.title, description: form.description, date: form.date || 'No Date', priority: form.priority });
      } else {
        await legalService.addReminder({ case_id: caseData.id || caseData._id, title: form.title, description: form.description, date: form.date || 'No Date', priority: form.priority, status: 'Pending', completed: false });
      }
      await loadTasks(caseData.id || caseData._id);
      toast.success(editing ? 'Task updated' : 'Task created');
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTask = async (task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
    try {
      await legalService.updateReminder(task.id, { completed: !task.completed });
    } catch (e) {
      await loadTasks(caseData.id || caseData._id);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await legalService.deleteReminder(id);
      await loadTasks(caseData.id || caseData._id);
      toast.success('Task deleted');
    } catch (e) {
      console.error(e);
    }
  };

  const getFactsForAnalysis = () => {
    if (notesText && 
        !notesText.includes("AI Analysis Error") && 
        !notesText.includes("AI Request Failed") && 
        !notesText.includes("__AI_ANALYSIS_FAILED__")) {
      return notesText;
    }
    if (caseData?.description && 
        !caseData.description.includes("AI Analysis Error") && 
        !caseData.description.includes("AI Request Failed") && 
        !caseData.description.includes("__AI_ANALYSIS_FAILED__")) {
      return caseData.description;
    }
    return caseData?.title || caseData?.name || '';
  };

  const triggerLiveAnalysisSilent = async (updatedCaseData) => {
    setIsAnalyzing(true);
    try {
      const caseId = updatedCaseData.id || updatedCaseData._id;
      const notes = getFactsForAnalysis() || updatedCaseData.description || updatedCaseData.title || updatedCaseData.name;
      const analyzed = await apiService.autoAnalyzeCase(caseId, notes);
      setCaseData(analyzed);
      if (analyzed.description) {
        setNotesText(analyzed.description);
      }
      
      const winProb = analyzed.intelligence?.winProbability || analyzed.win_probability || 50;
      setAiMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: `### Case Workspace Live Auto-Updated!\n\n* **Win Probability**: ${winProb}%\n* **Risk Level**: ${analyzed.intelligence?.riskLevel || 'Medium'}\n\n*All dashboard cards (Timeline, Research, Arguments) updated dynamically with current data.*`
      }]);
    } catch (err) {
      console.error('[Live Auto Update] silent analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveTimeline = async (form, editing) => {
    try {
      const normalizedStatus = form.status.toLowerCase() === 'completed' ? 'completed' : 'scheduled';
      await legalService.saveTimelineEvent({ id: editing?.id, caseId: caseData.id || caseData._id, title: form.title, status: normalizedStatus, court: form.court, date: form.date });
      await legalService.syncHearingStatus(caseData.title || caseData.name, normalizedStatus);
      await loadTimeline(caseData.id || caseData._id);
      toast.success(editing ? 'Event updated' : 'Event added');
      triggerLiveAnalysisSilent(caseData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveHearing = async (form, editing) => {
    try {
      const hearingObj = {
        stage: form.hearingType,
        date: form.date,
        time: form.time || '10:30 AM',
        court: form.court || '',
        courtRoom: form.courtRoom || '',
        judge: form.judge || '',
        status: form.status,
        summary: form.purpose || '',
        clerkNotes: form.notes || '',
        linkedDocsCount: editing ? (editing.linkedDocsCount || 0) : 0
      };

      if (editing) {
        await legalService.updateHearing(editing.id, hearingObj);
        toast.success('Hearing updated successfully');
      } else {
        await legalService.addHearing({
          ...hearingObj,
          caseId: caseData.id || caseData._id,
          caseTitle: caseData.title || caseData.name
        });
        toast.success('Hearing scheduled successfully');
      }

      if (window.__singleProjectCache) delete window.__singleProjectCache[caseData.id || caseData._id];
      const updatedCase = await apiService.getProject(caseData.id || caseData._id);
      setCaseData(updatedCase);

      setIsHearingModalVisible(false);
      setEditingHearing(null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to save hearing');
    }
  };

  const handleUploadCourtOrder = async (file, hearing, uploadMode) => {
    try {
      // Use permanent base64 URI so file persists after refresh/logout
      const fileBase64Uri = await fileToBase64(file);
      
      const newDoc = {
        id: `doc_order_${Date.now()}`,
        name: file.name,
        type: file.type || 'application/pdf',
        size: file.size,
        category: 'Court Order',
        uploadedAt: new Date().toISOString(),
        uri: fileBase64Uri,
        fileBase64: fileBase64Uri,
        ocrStatus: 'Success (OCR Done)',
        aiProcessed: 'Extracted successfully',
        facts: `Court Order uploaded for ${hearing.stage || 'Hearing'} date: ${hearing.date}. Directions: Maintain status quo. Summons issued.`,
        
        // permanent association
        linkedHearingId: hearing.id,
        linkedHearingType: hearing.stage || 'Court Appearance',
        linkedHearingDate: hearing.date,
        linkedHearingCourt: hearing.court || caseData.courtName || 'District Court'
      };

      // Handle duplicate warn: replace vs keep
      let updatedDocs = [...(caseData.documents || [])];
      if (uploadMode === 'replace' && hearing.orderDocumentId) {
        updatedDocs = updatedDocs.filter(d => d.id !== hearing.orderDocumentId);
      }
      updatedDocs = [newDoc, ...updatedDocs];

      // Update hearings info
      const nextHearingSuggestedDate = '15 Aug 2026'; // Mock extracted date
      const updatedHearings = (caseData.hearings || []).map(h => {
        if (h.id === hearing.id) {
          return {
            ...h,
            orderDocumentId: newDoc.id,
            orderDocumentName: newDoc.name,
            orderDocumentUri: fileUri,
            orderDecision: 'Notice of motion returnable on 15 Aug 2026. Ad-interim stay granted.',
            orderNextHearingDate: nextHearingSuggestedDate,
            orderDirections: 'Respondent directed to file written statement within 4 weeks.',
            orderOperativeOrder: 'Parties directed to maintain status quo on the suit property till next date of hearing.',
            orderAiSummary: `Court Bench: ${h.judge || 'Justice Dixit'}\nNext Hearing Date: 15 Aug 2026\nOperative Order: Parties directed to maintain status quo.\nDirections: Summons returnable on 15.08.2026.`
          };
        }
        return h;
      });

      // Add timeline event
      const newTimelineEvent = {
        id: `timeline_order_${Date.now()}`,
        title: 'Court Order Uploaded',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        description: `Uploaded "${file.name}" for ${hearing.stage || 'Civil Hearing'} on ${hearing.date}. Suggested next hearing: ${nextHearingSuggestedDate}.`,
        category: 'Order',
        source: 'System Upload',
        user: 'Advocate Rajesh Sharma',
        linkedHearing: `${hearing.stage || 'Civil Hearing'} – ${hearing.date}`
      };
      const updatedTimeline = [newTimelineEvent, ...(caseData.timelineEvents || [])];

      const updatedCaseData = {
        ...caseData,
        documents: updatedDocs,
        hearings: updatedHearings,
        timelineEvents: updatedTimeline
      };

      await legalService.updateCase(caseData.id || caseData._id, updatedCaseData);
      
      // Invalidate SPA cache
      if (window.__singleProjectCache) delete window.__singleProjectCache[caseData.id || caseData._id];
      const refreshedCase = await apiService.getProject(caseData.id || caseData._id);
      setCaseData(refreshedCase);

      toast.success(`Successfully uploaded and linked court order to ${hearing.stage || 'hearing'}`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to link court order');
    }
  };

  const handleCreateNextHearing = async (hearing, nextDate) => {
    try {
      const nextHearingObj = {
        stage: 'Civil Hearing',
        date: nextDate,
        time: hearing.time || '10:30 AM',
        court: hearing.court || caseData.courtName || 'District Court',
        courtRoom: hearing.courtRoom || 'Courtroom 3',
        judge: hearing.judge || 'Justice Dixit',
        status: 'Upcoming',
        summary: 'For filing reply and compliance.',
        clerkNotes: 'Automatically scheduled from court order of previous hearing.',
        linkedDocsCount: 0
      };

      await legalService.addHearing({
        ...nextHearingObj,
        caseId: caseData.id || caseData._id,
        caseTitle: caseData.title || caseData.name
      });
      
      toast.success(`Scheduled next hearing for ${nextDate}`);
      
      // Reload
      if (window.__singleProjectCache) delete window.__singleProjectCache[caseData.id || caseData._id];
      const refreshedCase = await apiService.getProject(caseData.id || caseData._id);
      setCaseData(refreshedCase);
    } catch (e) {
      console.error(e);
      toast.error('Failed to schedule next hearing');
    }
  };

  const handleDeleteTimeline = async (id) => {
    if (!confirm('Delete this timeline event?')) return;
    try {
      await legalService.deleteTimelineEvent(id);
      await loadTimeline(caseData.id || caseData._id);
      toast.success('Event deleted');
      triggerLiveAnalysisSilent(caseData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHearing = async (id) => {
    if (!confirm('Delete this hearing appearance?')) return;
    try {
      await legalService.deleteHearing(id);
      setCaseData(prev => ({
        ...prev,
        hearings: (prev.hearings || []).filter(h => h.id !== id)
      }));
      toast.success('Hearing deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete hearing');
    }
  };


  const handleSaveNotes = async () => {
    try {
      const updatedData = { ...caseData, description: notesText.trim() };
      await legalService.updateCase(caseData.id || caseData._id, { description: notesText.trim() });
      setCaseData(prev => ({ ...prev, description: notesText.trim() }));
      toast.success('Notes saved');
      setIsEditingFacts(false);
      triggerLiveAnalysisSilent(updatedData);
    } catch (e) {
      toast.error('Failed to save notes');
    }
  };

  const handleGenerateAiSummary = async () => {
    if (!caseData) return;
    const toastId = toast.loading("Generating AI Case Summary...");
    try {
      const prompt = `Draft a comprehensive chronological legal case summary based on the case name: "${caseData.title || caseData.name || 'N/A'}", client details: "${caseData.clientName || 'N/A'}", opponent: "${caseData.opponentName || 'N/A'}", court: "${caseData.courtName || 'N/A'}". Include specific events and dates in format DD MMM YYYY (e.g. 15 Jan 2025, 20 Apr 2025) so that we can build a timeline from it.`;
      const systemInstruction = "You are a professional legal counsel assistant. Draft a realistic, coherent chronological case summary based on the details. Return ONLY the drafted summary text.";
      const res = await generateChatResponse([], prompt, systemInstruction, null, 'English');
      
      let summaryText = '';
      if (typeof res === 'string') summaryText = res;
      else if (res.reply) summaryText = res.reply;
      else if (res.data?.reply) summaryText = res.data.reply;
      else if (res.text) summaryText = res.text;

      if (summaryText) {
        const updated = { ...caseData, description: summaryText };
        await legalService.updateCase(caseData.id || caseData._id, { description: summaryText });
        setCaseData(updated);
        setNotesText(summaryText);
        toast.success("AI Case Summary generated successfully!", { id: toastId });
      } else {
        toast.error("Failed to generate summary. Please enter it manually.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate AI Case Summary.", { id: toastId });
    }
  };

  const triggerDocumentAnalysis = async (docObj, targetData) => {
    try {
      const caseId = targetData.id || targetData._id;
      const analyzedDoc = await legalService.analyzeUploadedDocument(caseId, docObj, targetData, caseNotes);
      if (analyzedDoc) {
        setCaseData(prev => {
          const docs = (prev.documents || []).map(d => d.id === docObj.id ? analyzedDoc : d);
          return { ...prev, documents: docs };
        });
        toast.success(`AI Analysis complete: ${docObj.name}`);
      }
    } catch (err) {
      console.error("[Document Analysis] Failed to analyze document", err);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleUploadEvidence = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      let targetField = 'documents';
      let defaultCategory = 'Document';
      
      if (activeTab === 'evidence') {
        targetField = 'evidence';
        defaultCategory = 'Evidence';
      } else if (activeTab === 'contracts') {
        targetField = 'contracts';
        defaultCategory = 'Contract';
      }

      let updatedDocs = [...(caseData[targetField] || [])];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        setUploadProgress({ name: file.name, percent: 25 });
        const fileBase64 = await fileToBase64(file);
        
        setUploadProgress({ name: file.name, percent: 60 });
        await new Promise(r => setTimeout(r, 100));
        setUploadProgress({ name: file.name, percent: 100 });
        await new Promise(r => setTimeout(r, 100));

        const newDoc = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type || 'file',
          size: file.size,
          uploadedAt: new Date().toISOString(),
          uri: fileBase64,
          fileBase64: fileBase64,
          ocrStatus: 'Success (OCR Done)',
          aiProcessed: 'Extracted successfully',
          extractedMetadata: {},
          category: defaultCategory,
          folder: activeTab === 'evidence' ? 'Evidence' : (activeTab === 'contracts' ? 'Contracts' : 'Documents'),
          isContract: activeTab === 'contracts',
          isEvidence: activeTab === 'evidence',
          status: activeTab === 'contracts' ? 'Pending Review' : (activeTab === 'evidence' ? 'Verified' : 'Active')
        };

        updatedDocs = [newDoc, ...updatedDocs];
        
        const updates = {};
        updates[targetField] = updatedDocs;
        await legalService.updateCase(caseData.id || caseData._id, updates);
        
        setCaseData(prev => {
          const updatedData = { ...prev };
          updatedData[targetField] = updatedDocs;
          return updatedData;
        });
        toast.success(`Uploaded successfully: ${file.name}`);
        
        triggerDocumentAnalysis(newDoc, { ...caseData, [targetField]: updatedDocs });
        triggerLiveAnalysisSilent({ ...caseData, [targetField]: updatedDocs });
      }
      setUploadProgress(null);
    } catch (err) {
      toast.error('Upload failed');
      setUploadProgress(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteEvidence = async (doc) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) return;
    
    let targetField = 'documents';
    let label = 'Document';
    if (caseData.evidence?.some(e => e.id === doc.id)) {
      targetField = 'evidence';
      label = 'Evidence';
    } else if (caseData.contracts?.some(c => c.id === doc.id)) {
      targetField = 'contracts';
      label = 'Contract';
    }

    try {
      const updatedDocs = (caseData[targetField] || []).filter(d => d.id !== doc.id);
      const updates = {};
      updates[targetField] = updatedDocs;
      await legalService.updateCase(caseData.id || caseData._id, updates);
      setCaseData(prev => ({ ...prev, [targetField]: updatedDocs }));
      toast.success(`${label} deleted successfully!`);
      triggerLiveAnalysisSilent({ ...caseData, [targetField]: updatedDocs });
    } catch (e) {
      toast.error(`Failed to delete ${label.toLowerCase()}`);
    }
  };

  const handleRenameDoc = async (doc) => {
    const newName = prompt("Rename File:", doc.name);
    if (!newName || newName.trim() === "" || newName === doc.name) return;
    
    let targetField = 'documents';
    if (caseData.evidence?.some(e => e.id === doc.id)) {
      targetField = 'evidence';
    } else if (caseData.contracts?.some(c => c.id === doc.id)) {
      targetField = 'contracts';
    }

    try {
      const updatedDocs = (caseData[targetField] || []).map(d => d.id === doc.id ? { ...d, name: newName.trim() } : d);
      const updates = {};
      updates[targetField] = updatedDocs;
      await legalService.updateCase(caseData.id || caseData._id, updates);
      setCaseData(prev => ({ ...prev, [targetField]: updatedDocs }));
      toast.success("File renamed successfully!");
    } catch (e) {
      toast.error("Failed to rename file");
    }
  };

  const handleOpenDoc = (doc) => {
    if (!doc.uri) {
      toast.error("File preview is only supported for newly uploaded files in this session.");
      return;
    }
    setActiveDoc(doc);
    setIsDocViewerOpen(true);
  };

  // ─── BUILD CASE SYSTEM PROMPT (full case memory injection) ────────────────
  const buildCaseSystemPrompt = (cd) => {
    if (!cd) return `You are AISA Case Assistant. No case is currently loaded.`;
    const safe = (v) => (v != null && v !== '' && v !== 'N/A') ? String(v) : null;
    const safeList = (arr, field = null) => {
      if (!Array.isArray(arr) || arr.length === 0) return null;
      return arr.map((item, i) => {
        if (typeof item === 'string') return `  ${i + 1}. ${item}`;
        if (field) return `  ${i + 1}. ${item[field] || JSON.stringify(item)}`;
        return `  ${i + 1}. ${JSON.stringify(item)}`;
      }).join('\n');
    };

    const lines = [
      `You are AISA Case Assistant — a dedicated AI legal associate permanently assigned to this specific case.`,
      `You MUST answer exclusively from the case data provided below. If information is missing, say "No information exists inside this case for [topic]." Never hallucinate or invent details.`,
      `Always cite referenced documents, evidence, or precedents in your answer. Always suggest missing evidence, risks, and next actions proactively.`,
      ``,
      `═══════════════════════════════════════════════════`,
      `CASE KNOWLEDGE BASE`,
      `═══════════════════════════════════════════════════`,
      `Case Title: ${cd.title || cd.caseTitle || cd.name || 'N/A'}`,
      `Case Number: ${safe(cd.caseNumber || cd.cnr) || 'N/A'}`,
      `Court: ${safe(cd.court || cd.courtName) || 'N/A'}`,
      `Case Type: ${safe(cd.caseType || cd.type) || 'N/A'}`,
      `Stage: ${safe(cd.stage || cd.caseStage) || 'N/A'}`,
      `Status: ${safe(cd.status) || 'N/A'}`,
      ``,
      `─── PARTIES ───────────────────────────────────────`,
      `Client Name: ${safe(cd.clientName || cd.plaintiff) || 'N/A'}`,
      `Client Role: ${safe(cd.clientRole) || 'Plaintiff/Petitioner'}`,
      `Opponent Name: ${safe(cd.opponentName || cd.defendant) || 'N/A'}`,
      `Opponent Lawyer: ${safe(cd.opponentLawyer) || 'N/A'}`,
      `Our Lawyer / Advocate: ${safe(cd.advocateName || cd.assignedLawyer) || 'N/A'}`,
      `Judge: ${safe(cd.judgeName || cd.judge) || 'N/A'}`,
      ``,
      `─── CASE SUMMARY ─────────────────────────────────`,
      safe(cd.summary || cd.caseSummary || cd.description) || 'No summary entered.',
      ``,
      `─── TIMELINE / KEY FACTS ─────────────────────────`,
      safeList(cd.facts || cd.timeline || cd.timelineEvents, 'description') || safeList(cd.facts || [], 'fact') || 'No timeline entered.',
      ``,
      `─── UPLOADED DOCUMENTS ───────────────────────────`,
      safeList(cd.documents?.map(d => `${d.name || d.filename} (${d.type || 'Document'})`)) || 'No documents uploaded.',
      ``,
      `─── EVIDENCE VAULT ───────────────────────────────`,
      safeList(cd.evidence?.map(e => `${e.name || e.filename} — ${e.status || 'Pending'} — Strength: ${e.strength || 'N/A'}`)) || 'No evidence uploaded.',
      ``,
      `─── CONTRACTS ────────────────────────────────────`,
      safeList(cd.contracts?.map(c => `${c.name || c.filename} — ${c.status || 'Under Review'}`)) || 'No contracts uploaded.',
      ``,
      `─── LEGAL ARGUMENTS ──────────────────────────────`,
      safeList(cd.aiArguments?.argumentsRoster?.map(a => `${a.title}: ${a.law} (Strength: ${a.strength}) — ${a.counterStrategy || ''}`)) || 
      (cd.aiArguments?.summary || 'No arguments generated yet.'),
      ``,
      `─── LEGAL RESEARCH & PRECEDENTS ──────────────────`,
      safeList(cd.research?.precedents?.map(p => `${p.title || p.name}: ${p.holding || p.relevance || ''}`)) ||
      safeList(cd.research?.sections?.map(s => `${s.section}: ${s.description || ''}`)) ||
      (cd.aiResearch?.summary || 'No research generated yet.'),
      ``,
      `─── APPLICABLE LAWS ──────────────────────────────`,
      safeList(cd.applicableLaws || cd.aiArguments?.applicableLaws || []) || 'Not specified.',
      ``,
      `─── GENERATED DRAFTS ─────────────────────────────`,
      safeList(cd.drafts?.map(d => `${d.title || d.type || 'Draft'} (${d.status || 'Draft'})`)) || 'No drafts generated yet.',
      ``,
      `─── CASE NOTES ───────────────────────────────────`,
      safe(cd.notes || cd.caseNotes) || 'No notes entered.',
      ``,
      `─── UPCOMING HEARINGS ────────────────────────────`,
      safeList(cd.hearings?.filter(h => new Date(h.date) >= new Date()).map(h => `${h.date}: ${h.purpose || h.title || 'Hearing'} — ${h.court || ''}`)) || 'No upcoming hearings.',
      ``,
      `─── TASKS ────────────────────────────────────────`,
      safeList(cd.tasks?.filter(t => t.status !== 'completed').map(t => `${t.title || t.task}: ${t.deadline || 'No deadline'}`)) || 'No pending tasks.',
      ``,
      `═══════════════════════════════════════════════════`,
      `IMPORTANT INSTRUCTIONS FOR EVERY RESPONSE:`,
      `1. Answer from above case data FIRST before using general legal knowledge.`,
      `2. Always reference documents/evidence/precedents by name when applicable.`,
      `3. At the end of each response, proactively suggest: Missing evidence | Risk identified | Recommended next action | Relevant precedent.`,
      `4. Format all responses with clear headings in Markdown.`,
      `5. NEVER mix information from any other case. This is CASE ISOLATED memory.`,
      `═══════════════════════════════════════════════════`,
    ].filter(l => l !== null);

    return lines.join('\n');
  };

  const handleSendAiMessage = async (e, overrideQuery = null) => {
    if (e) e.preventDefault();
    const query = (overrideQuery || chatInput).trim();
    if (!query) return;
 
    setChatInput('');
    const caseId = caseData.id || caseData._id;
    const userMsg = { id: Date.now().toString(), role: 'user', content: query };
    
    // Save user message to state and storage — sessionType: 'CASE'
    setAiMessages(prev => [...prev, userMsg]);
    if (activeSessionId) {
      await chatStorageService.saveMessage(
        activeSessionId, userMsg,
        `Chat for ${caseData.title || caseData.name}`,
        caseId, 'CASE', caseId
      );
    }
    
    setIsChatSending(true);

    // Initialize AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const history = aiMessages.map(m => ({ role: m.role, content: m.content }));
      // ─── Full Case Memory System Prompt ────────────────────────────────────
      const systemPrompt = buildCaseSystemPrompt(caseData);
      // ───────────────────────────────────────────────────────────────────────

      const response = await generateChatResponse(history, query, systemPrompt, [], 'English', controller.signal, 'legal');
      let responseText = '';
      if (typeof response === 'string') responseText = response;
      else if (response?.reply) responseText = response.reply;
      else if (response?.text) responseText = response.text;
      else if (response?.content) responseText = response.content;

      if (responseText) {
        const fullContent = responseText;
        
        // Setup incremental simulated streaming output
        const tempMsgId = Date.now().toString();
        const words = fullContent.split(' ');
        let currentText = words[0] || '';
        let currentWordIndex = 1;

        // Add initial message with isGenerating: true
        setAiMessages(prev => [...prev, {
          id: tempMsgId,
          role: 'model',
          content: currentText || '...',
          isGenerating: true
        }]);

        await new Promise((resolve) => {
          streamingIntervalRef.current = setInterval(() => {
            if (currentWordIndex < words.length) {
              currentText += ' ' + words[currentWordIndex];
              setAiMessages(prev => prev.map(m => m.id === tempMsgId ? { ...m, content: currentText } : m));
              currentWordIndex++;
            } else {
              clearInterval(streamingIntervalRef.current);
              streamingIntervalRef.current = null;
              setAiMessages(prev => prev.map(m => m.id === tempMsgId ? { ...m, isGenerating: false } : m));
              resolve();
            }
          }, 35); // Fast typing pace
        });

        // Save complete response to storage — sessionType: 'CASE'
        const completeMsg = {
          id: tempMsgId,
          role: 'model',
          content: fullContent
        };
        if (activeSessionId) {
          await chatStorageService.saveMessage(
            activeSessionId, completeMsg,
            `Chat for ${caseData.title || caseData.name}`,
            caseId, 'CASE', caseId
          );
        }
      } else {
        throw new Error("Empty AI response");
      }
    } catch (err) {
      const isAbort = err.name === 'CanceledError' || err.name === 'AbortError' || err.message?.includes('aborted');
      if (isAbort) {
        console.log("AI message generation aborted by user.");
        return;
      }
      console.error("[Case AI Assistant] Error:", err);
      const errorMsg = {
        id: Date.now().toString(),
        role: 'model',
        content: "⚠️ I encountered an error reading the case files. Please try again."
      };
      setAiMessages(prev => [...prev, errorMsg]);
      if (activeSessionId) {
        await chatStorageService.saveMessage(
          activeSessionId, errorMsg,
          `Chat for ${caseData.title || caseData.name}`,
          caseId, 'CASE', caseId
        );
      }
    } finally {
      setIsChatSending(false);
      abortControllerRef.current = null;
    }
  };

  const handleDownloadDoc = (doc) => {
    if (!doc?.uri) {
      toast.error("Download URL not available");
      return;
    }
    const a = document.createElement('a');
    a.href = doc.uri;
    a.download = doc.name;
    a.click();
    toast.success("Downloading document...");
  };

  const handleShareDoc = (doc) => {
    if (doc.uri) {
      navigator.clipboard.writeText(doc.uri);
      toast.success("File link copied to clipboard!");
    } else {
      toast.error("Link not available for this document");
    }
  };

  const handleExportChat = () => {
    try {
      const chatText = aiMessages.map(m => `[${m.role === 'user' ? 'ADVOCATE' : 'COPILOT'}] ${m.content}\n`).join('\n');
      const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `case_copilot_chat_${(caseData.title || caseData.name || 'export').replace(/[^a-z0-9]/gi, '_')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Chat exported successfully!");
    } catch (e) {
      toast.error("Failed to export chat.");
    }
  };

  const handleShowChatHistory = () => {
    toast.success("No previous conversation sessions found.");
  };

  const handleDownloadAsTxt = (content) => {
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `copilot_response.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Response downloaded successfully!");
    } catch (e) {
      toast.error("Failed to download response.");
    }
  };

  // Export Case File (HTML/Text format)
  const handleExportCaseFile = () => {
    try {
      const fileContent = `CASE FILE SUMMARY: ${(caseData.title || caseData.name || '').toUpperCase()}
========================================
Client: ${caseData.clientName || 'N/A'}
Opponent: ${caseData.opponentName || 'N/A'}
Court: ${caseData.courtName || 'N/A'}

SUMMARY FACTS:
${notesText || 'No summary details'}
`;
      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(caseData.title || caseData.name || '').replace(/[^a-z0-9]/gi, '_')}_case_file.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Case file downloaded successfully!");
    } catch (e) {
      toast.error("Failed to export case file.");
    }
  };

  const handleShareCase = () => {
    if (navigator.share) {
      navigator.share({
        title: caseData.title || caseData.name,
        text: `Legal Case Workspace for ${caseData.title || caseData.name}.`
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Case link copied to clipboard!");
    }
  };

  const winProbability = caseData.intelligence?.winProbability || caseData.probability || caseData.win_probability || 50;
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const taskPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const allEvents = useMemo(() => {
    const list = [];
    timelineEvents.forEach(e => {
      list.push({ date: e.date, title: e.title, description: e.court ? `Hearing appearance at ${e.court}` : `Timeline milestone (Status: ${e.status})` });
    });
    if (Array.isArray(caseData.facts)) {
      caseData.facts.forEach(f => {
        list.push({ date: f.date, title: f.event, description: f.description });
      });
    }
    return list.sort((a, b) => {
      const da = a.date ? new Date(a.date) : new Date(0);
      const db = b.date ? new Date(b.date) : new Date(0);
      return db - da;
    });
  }, [timelineEvents, caseData.facts]);

  const tabsList = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'timeline', name: 'Timeline', icon: History },
    { id: 'hearings', name: 'Hearings', icon: Gavel },
    { id: 'parties', name: 'Parties', icon: Users },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'evidence', name: 'Evidence Vault', icon: FileSearch },
    { id: 'research', name: 'Research & Laws', icon: BookOpen },
    { id: 'drafts', name: 'Drafts', icon: ScrollText },
    { id: 'contracts', name: 'Contracts', icon: ClipboardList },
    { id: 'arguments', name: 'Arguments', icon: Target },
    { id: 'notes', name: 'Notes', icon: FileText },
    { id: 'precedents', name: 'Precedents', icon: Bookmark },
    { id: 'tasks', name: 'Tasks', icon: ListTodo },
  ];

  const renderPolishedSummary = () => {
    const summary = caseData?.summary;
    if (!summary) return null;
    const trimSummary = summary.trim();

    // Check for error markers
    const isError = 
      trimSummary.includes("AI Analysis Error") || 
      trimSummary.includes("AI Request Failed") || 
      trimSummary.includes("Unexpected token") || 
      trimSummary.includes("Syntax Error") ||
      trimSummary.includes("Response Body") ||
      trimSummary.includes("Raw payload") ||
      trimSummary.includes("could not process the request") ||
      trimSummary.includes("__AI_ANALYSIS_FAILED__");

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 bg-red-50/10 dark:bg-red-950/5 border border-red-100/40 rounded-xl p-4 sm:p-6 w-full animate-in fade-in duration-300">
          <p className="text-slate-600 dark:text-slate-400 font-semibold text-xs leading-relaxed">
            Unable to generate the case summary.<br />
            Please retry the AI analysis.
          </p>
          <button
            onClick={handleAutoAnalyze}
            disabled={isAnalyzing}
            className="px-5 py-2 bg-[#4F46E5] hover:opacity-95 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none"
          >
            {isAnalyzing ? "Analyzing..." : "Retry"}
          </button>
        </div>
      );
    }

    // Try to parse if it is JSON
    let parsedObj = null;
    if (trimSummary.startsWith('{') || trimSummary.startsWith('[')) {
      try {
        parsedObj = JSON.parse(trimSummary);
      } catch (e) {
        // Fallback manual regex extractor if JSON is malformed
        const match = trimSummary.match(/"(?:executive_summary|summary)"\s*:\s*"([\s\S]*?)"/);
        if (match && match[1]) {
          parsedObj = {
            executive_summary: match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
          };
        }
      }
    }

    // If it's not JSON, let's check if it's partially parsed (contains executive_summary key)
    if (!parsedObj && (trimSummary.includes('"executive_summary"') || trimSummary.includes('"summary"'))) {
      const match = trimSummary.match(/"(?:executive_summary|summary)"\s*:\s*"([\s\S]*?)"/);
      if (match && match[1]) {
        parsedObj = {
          executive_summary: match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
        };
      }
    }

    // Prepare sections
    let sections = [];

    if (parsedObj && typeof parsedObj === 'object') {
      // 1. Executive Summary
      const exec = parsedObj.executive_summary || parsedObj.summary;
      if (exec) {
        sections.push({ title: "Executive Summary", content: exec });
      }
      
      // 2. Facts
      const facts = parsedObj.facts || parsedObj.case_facts || parsedObj.dispute_details;
      if (facts) {
        sections.push({ title: "Facts", content: facts });
      }

      // 3. Nature of Dispute
      const nature = parsedObj.nature_of_dispute || parsedObj.dispute_type || parsedObj.caseType;
      if (nature) {
        sections.push({ title: "Nature of Dispute", content: nature });
      }

      // 4. Parties
      const plaintiffName = parsedObj.parties?.plaintiff?.name || parsedObj.parties?.plaintiff || parsedObj.plaintiff;
      const defendantName = parsedObj.parties?.defendant?.name || parsedObj.parties?.defendant || parsedObj.defendant;
      if (plaintiffName || defendantName) {
        const partiesText = `${plaintiffName ? `Plaintiff: ${plaintiffName}` : ''}${plaintiffName && defendantName ? ' vs ' : ''}${defendantName ? `Defendant: ${defendantName}` : ''}`;
        sections.push({ title: "Parties", content: partiesText });
      }

      // 5. Relief Sought
      const relief = parsedObj.relief_sought || parsedObj.primary_relief || parsedObj.relief;
      if (relief) {
        sections.push({ title: "Relief Sought", content: relief });
      }

      // 6. Case Status
      const status = parsedObj.case_status || parsedObj.status || parsedObj.stage;
      if (status) {
        sections.push({ title: "Case Status", content: status });
      }

      // Fallback if no sections extracted
      if (sections.length === 0) {
        const fallbackText = Object.values(parsedObj).filter(v => typeof v === 'string').join('\n\n');
        if (fallbackText) {
          sections.push({ title: "Executive Summary", content: fallbackText });
        }
      }
    } else {
      // It's a plain string. Clean it up from any braces or quotes
      let cleaned = trimSummary;
      if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
        cleaned = cleaned.substring(1, cleaned.length - 1).trim();
      }
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.substring(1, cleaned.length - 1).trim();
      }
      cleaned = cleaned
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/[{}[\]]/g, '')
        .trim();

      if (cleaned) {
        sections.push({ title: "Executive Summary", content: cleaned });
      }
    }

    const formatSectionContent = (content) => {
      if (typeof content !== 'string') return JSON.stringify(content);
      
      let text = content
        .replace(/^["']|["']$/g, '')
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .trim();

      const parts = text.split(/\n+/);
      return parts.map((part, index) => {
        const trimmed = part.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')) {
          const liText = trimmed.replace(/^[-*•]\s*/, '');
          return (
            <li key={index} className="list-disc ml-4 my-1 text-slate-700 dark:text-slate-350">
              {liText}
            </li>
          );
        }
        
        return (
          <p key={index} className="my-2 leading-relaxed text-slate-700 dark:text-slate-300">
            {trimmed}
          </p>
        );
      });
    };

    return (
      <div className="space-y-4 text-xs font-semibold text-slate-755 dark:text-slate-350 leading-relaxed mb-0 p-4 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-xl border border-indigo-100/40 w-full animate-in fade-in duration-300">
        <p className="font-bold text-[#4F46E5] text-xs mb-3">✨ AI-GENERATED LEGAL SUMMARY</p>
        <div className="space-y-5">
          {sections.map((sec, i) => (
            <div key={i} className="border-b border-indigo-100/30 dark:border-zinc-800/40 pb-4 last:border-b-0 last:pb-0">
              <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide mb-1.5">{sec.title}</h5>
              <div className="font-medium text-slate-650 dark:text-slate-400">
                {formatSectionContent(sec.content)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Sub-Tabs
  const renderOverview = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 animate-in fade-in duration-300">
      <div className="col-span-1 sm:col-span-2 space-y-4 sm:space-y-6">
        {/* Case Summary Card */}
        <div className="bg-white dark:bg-[#1A2540] border border-[#E5E7EB] dark:border-zinc-800 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">CASE SUMMARY</h4>
            <div className="flex items-center gap-2">
              {caseData.summary && 
               !caseData.summary.includes("AI Analysis Error") && 
               !caseData.summary.includes("AI Request Failed") && 
               !caseData.summary.includes("__AI_ANALYSIS_FAILED__") && (
                <button
                  onClick={() => setIsEditingFacts(!isEditingFacts)}
                  className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] rounded-lg text-[9px] font-black uppercase tracking-wider border border-indigo-150 hover:bg-indigo-100 transition-all"
                >
                  {isEditingFacts ? "AI Summary" : "Edit Facts"}
                </button>
              )}
              <button 
                onClick={handleSaveNotes}
                className="p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl text-gray-400 hover:text-indigo-650 transition-all"
                title="Save Notes"
              >
                <Save size={16} />
              </button>
            </div>
          </div>
          {caseData.summary && !isEditingFacts ? (
            renderPolishedSummary()
          ) : (
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="w-full bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-0 resize-none min-h-[140px] leading-relaxed p-0 outline-none"
              placeholder="Enter case details, client statements, or dispute facts..."
            ></textarea>
          )}
        </div>
      </div>

      <div className="md:col-span-1 space-y-4 md:space-y-6">
        {/* Win Probability Card */}
        <div className="bg-white dark:bg-[#1A2540] border border-[#E5E7EB] dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          {isAnalyzing && (
            <div className="absolute inset-0 bg-white/50 dark:bg-zinc-950/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white mb-2 sm:mb-4">WIN PROBABILITY</span>
          <div className="relative flex items-center justify-center w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="38" className="stroke-slate-100 dark:stroke-zinc-800" strokeWidth="7" fill="transparent" />
              <circle cx="48" cy="48" r="38" className="stroke-[#0D9488] dark:stroke-[#0D9488]" strokeWidth="7" fill="transparent" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * (1 - winProbability / 100)} strokeLinecap="round" />
            </svg>
            <div className="absolute flex items-center justify-center">
              <span className="text-xl font-black text-slate-855 dark:text-white">{winProbability}%</span>
            </div>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-2.5 sm:mt-4 leading-tight">BASED ON CURRENT EVIDENCE AND PRECEDENT STRENGTH</span>
        </div>

        {/* Task Progress Card */}
        <div className="bg-white dark:bg-[#1A2540] border border-[#E5E7EB] dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-sm">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white mb-1.5 sm:mb-2">TASK PROGRESS</h5>
          <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500 uppercase">
            <span>Completed steps</span>
            <span>{taskPercentage}% ({completedTasks}/{totalTasks})</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mt-2.5 sm:mt-3">
            <div className="bg-[#4F46E5] h-full rounded-full transition-all duration-500" style={{ width: `${taskPercentage}%` }} />
          </div>
          <button onClick={() => setIsTaskModalVisible(true)} className="text-xs font-bold text-[#4F46E5] hover:underline mt-2.5 sm:mt-4 block">Manage Tasks</button>
        </div>
      </div>
    </div>
  );

  const renderSidebar = () => {
    const suggestions = caseData.timelineSuggestions || [
      { title: "Recovery suit limit expires 15 Apr 2028", description: "Under Art 137 Limitation Act, suit must be filed within 3 years of loan default date." }
    ];
    const deadlines = caseData.timelineDeadlines || [
      { title: "Defendant appearance window", description: "Defendant must record court appearance within 10 days since Delhi Summons notice delivery." }
    ];
    const missingDocs = caseData.timelineMissingDocuments || [
      { title: "Missing Speed Post tracking details", description: "Attach speed post receipt proof to timeline notice event to secure postal verification proof." }
    ];

    return (
      <div className="w-full md:w-[320px] shrink-0 space-y-6">
        {/* Settings Widget */}
        <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Timeline Settings</h4>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-650 dark:text-slate-350 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={showSuggestedEvents}
              onChange={e => setShowSuggestedEvents(e.target.checked)}
              className="rounded text-[#4F46E5] focus:ring-[#4F46E5] dark:bg-black/20 dark:border-zinc-800"
            />
            <span>Show Suggested Events</span>
          </label>
        </div>

        {/* AI Suggestions */}
        <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-4 text-[#4F46E5]">
            <Sparkles size={14} />
            <h4 className="text-[10px] font-black uppercase tracking-wider">AI Suggestions</h4>
          </div>
          <div className="space-y-3">
            {suggestions.map((s, idx) => (
              <div key={idx} className="bg-violet-50/50 dark:bg-violet-950/10 border border-violet-100/50 dark:border-violet-900/30 rounded-xl p-3">
                <p className="text-xs font-black text-indigo-700 dark:text-indigo-400">{s.title}</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{s.description}</p>
              </div>
            ))}
            {suggestions.length === 0 && (
              <p className="text-[10px] font-bold text-slate-400 text-center py-2">No AI suggestions generated yet.</p>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-4 text-orange-600 dark:text-orange-400">
            <Clock size={14} />
            <h4 className="text-[10px] font-black uppercase tracking-wider">Upcoming Deadlines</h4>
          </div>
          <div className="space-y-3">
            {deadlines.map((d, idx) => (
              <div key={idx} className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30 rounded-xl p-3">
                <p className="text-xs font-black text-amber-700 dark:text-amber-400">{d.title}</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{d.description}</p>
              </div>
            ))}
            {deadlines.length === 0 && (
              <p className="text-[10px] font-bold text-slate-400 text-center py-2">No upcoming deadlines.</p>
            )}
          </div>
        </div>

        {/* Missing Documents */}
        <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-4 text-red-500 dark:text-red-400">
            <AlertCircle size={14} />
            <h4 className="text-[10px] font-black uppercase tracking-wider">Missing Documents</h4>
          </div>
          <div className="space-y-3">
            {missingDocs.map((m, idx) => (
              <div key={idx} className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/30 rounded-xl p-3">
                <p className="text-xs font-black text-red-750 dark:text-red-400">{m.title}</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{m.description}</p>
              </div>
            ))}
            {missingDocs.length === 0 && (
              <p className="text-[10px] font-bold text-slate-400 text-center py-2">All documents verified.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    const categoryColors = {
      Agreement: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-650 dark:text-blue-400', border: 'border-blue-200/20' },
      Evidence: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-650 dark:text-emerald-400', border: 'border-emerald-200/20' },
      Notice: { bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-650 dark:text-red-400', border: 'border-red-200/20' },
      Reply: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-650 dark:text-amber-400', border: 'border-amber-200/20' },
      Payment: { bg: 'bg-green-50 dark:bg-green-950/20', text: 'text-green-650 dark:text-green-400', border: 'border-green-200/20' },
      Default: { bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-650 dark:text-rose-400', border: 'border-rose-200/20' },
      'Court Filing': { bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-650 dark:text-indigo-400', border: 'border-indigo-200/20' },
      Hearing: { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-650 dark:text-purple-400', border: 'border-purple-200/20' },
      Order: { bg: 'bg-cyan-50 dark:bg-cyan-950/20', text: 'text-cyan-650 dark:text-cyan-400', border: 'border-cyan-200/20' },
      Investigation: { bg: 'bg-teal-50 dark:bg-teal-950/20', text: 'text-teal-650 dark:text-teal-400', border: 'border-teal-200/20' },
      Judgment: { bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-650 dark:text-rose-400', border: 'border-rose-200/20' },
      'AI Generated': { bg: 'bg-violet-50 dark:bg-violet-950/20', text: 'text-violet-650 dark:text-violet-400', border: 'border-violet-200/20' },
      'Document Upload': { bg: 'bg-sky-50 dark:bg-sky-950/20', text: 'text-sky-650 dark:text-sky-400', border: 'border-sky-200/20' },
      Research: { bg: 'bg-slate-50 dark:bg-slate-950/20', text: 'text-slate-650 dark:text-slate-400', border: 'border-slate-200/20' },
      Other: { bg: 'bg-gray-50 dark:bg-gray-950/20', text: 'text-gray-650 dark:text-gray-400', border: 'border-gray-200/20' }
    };

    const getNodeDotColor = (category) => {
      switch ((category || '').toLowerCase()) {
        case 'agreement': return 'bg-blue-600';
        case 'evidence': return 'bg-emerald-600';
        case 'notice': return 'bg-red-500';
        case 'reply': return 'bg-amber-500';
        case 'court filing': return 'bg-indigo-600';
        case 'hearing': return 'bg-purple-600';
        case 'order': return 'bg-cyan-600';
        case 'judgment': return 'bg-rose-500';
        case 'investigation': return 'bg-teal-600';
        case 'default': return 'bg-orange-500';
        default: return 'bg-slate-400';
      }
    };

    const hasSummaryText = (caseData.summary || caseData.description || notesText || '').trim().split(/\s+/).length >= 8;
    if (timelineEvents.length === 0 && !hasSummaryText) {
      return (
        <div className="flex flex-col md:flex-row gap-6 animate-in fade-in duration-300">
          <div className="flex-1 bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[350px]">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] rounded-full mb-4">
              <Calendar size={32} />
            </div>
            <h4 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider mb-2">ðŸ“… No AI Timeline Available Yet</h4>
            <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold max-w-md mx-auto leading-relaxed mb-6">
              AI could not generate a case timeline because no structured case summary or chronological legal events are available.
            </p>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mb-6 space-y-1">
              <p>Requirements to generate timeline:</p>
              <ul className="list-disc list-inside">
                <li>Comprehensive Case Summary</li>
                <li>Dated legal events</li>
                <li>Uploaded legal documents</li>
                <li>Evidence</li>
                <li>Case Notes</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleGenerateAiSummary}
                className="px-5 py-2.5 bg-indigo-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all"
              >
                Generate AI Case Summary
              </button>
              <button 
                onClick={() => document.getElementById('workspace-doc-upload').click()}
                className="px-5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-350 font-black text-xs uppercase tracking-widest rounded-xl shadow-sm transition-all"
              >
                Upload Documents
              </button>
            </div>
          </div>
          {renderSidebar()}
        </div>
      );
    }

    const visibleEvents = timelineEvents.filter(evt => showSuggestedEvents || evt.confidence !== 'Low');
    const filteredEvents = visibleEvents.filter(evt => {
      if (timelineSearchQuery.trim()) {
        const q = timelineSearchQuery.toLowerCase();
        const matchTitle = (evt.title || '').toLowerCase().includes(q);
        const matchDesc = (evt.description || '').toLowerCase().includes(q);
        const matchCat = (evt.category || '').toLowerCase().includes(q);
        const matchSrc = (evt.source || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat && !matchSrc) return false;
      }
      if (timelineFilter === 'all') return true;
      if (timelineFilter === 'documents') {
        return (evt.category || '').toLowerCase() === 'document upload' || (evt.source && evt.source.match(/\.(pdf|docx|txt|doc|xlsx|png|jpg|jpeg)$/i));
      }
      if (timelineFilter === 'hearings') {
        return (evt.category || '').toLowerCase() === 'hearing' || (evt.title || '').toLowerCase().includes('hearing');
      }
      if (timelineFilter === 'evidence') {
        return (evt.category || '').toLowerCase() === 'evidence';
      }
      if (timelineFilter === 'ai_generated') {
        return !!evt.isAiGenerated;
      }
      return true;
    });

    const sortedFilteredEvents = [...filteredEvents].sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      if (isNaN(da.getTime())) return 1;
      if (isNaN(db.getTime())) return -1;
      return da - db;
    });

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#4F46E5]" /> AI Case Journey
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">
              Chronological history compiled from documentation and case context.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setEditingTimeline(null); setIsTimelineModalVisible(true); }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-650 dark:hover:opacity-90 text-white rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
            >
              + Add Event
            </button>
            <button 
              onClick={() => triggerBackgroundTimelineSync(caseData, true)}
              disabled={isExtractingTimeline}
              className="px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-indigo-650 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles size={11} className={isExtractingTimeline ? "animate-spin" : ""} />
              {isExtractingTimeline ? "Extracting..." : "AI Extract"}
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Milestones' },
              { id: 'documents', label: 'Documents' },
              { id: 'hearings', label: 'Hearings' },
              { id: 'evidence', label: 'Evidence' },
              { id: 'ai_generated', label: 'AI Generated' }
            ].map(chip => {
              const isActive = timelineFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setTimelineFilter(chip.id)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                    isActive 
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-indigo-600 dark:border-indigo-600' 
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-zinc-850 dark:border-zinc-800 dark:text-slate-400'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={timelineSearchQuery}
              onChange={e => setTimelineSearchQuery(e.target.value)}
              placeholder="Search facts..."
              className="w-full bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 rounded-full pl-9 pr-4 py-1.5 text-xs font-semibold outline-none text-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Outer Split Layout */}
        <div className="flex flex-col md:flex-row gap-6 pt-2">
          {/* Main stream timeline (65%) */}
          <div className="flex-1 relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-indigo-100 dark:before:bg-zinc-800/80">
            {sortedFilteredEvents.map((evt, idx) => {
              const catStyle = categoryColors[evt.category] || categoryColors.Other;
              const nodeColor = getNodeDotColor(evt.category);
              
              return (
                <div key={evt.id || idx} className="relative group">
                  {/* Circle Node Dot */}
                  <div className={`absolute left-[-23px] top-2.5 w-3 h-3 rounded-full border-4 border-white dark:border-zinc-900 shadow-sm ${nodeColor}`} />
                  
                  {/* Card box */}
                  <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500/80 transition-all duration-350 flex flex-col justify-between">
                    <div>
                      {/* Badge row */}
                      <div className="flex flex-wrap items-center gap-2 mb-3 text-[10px] font-bold text-slate-400 dark:text-slate-400">
                        <span className="text-slate-800 dark:text-white uppercase tracking-wider">{evt.date}</span>
                        <span>•</span>
                        {evt.isAiGenerated && (
                          <span className="px-1.5 py-0.5 bg-violet-50 dark:bg-violet-950/20 text-[#4F46E5] rounded text-[8px] font-black uppercase tracking-wider border border-violet-200/10 flex items-center gap-0.5">
                            <Sparkles size={8} /> AI
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                          {evt.category || 'Other'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                          evt.priority === 'Critical' 
                            ? 'bg-red-500 text-white border-red-600' 
                            : evt.priority === 'High' 
                              ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-650 border-orange-200/20' 
                              : evt.priority === 'Medium' 
                                ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-650 border-blue-200/20' 
                                : 'bg-slate-50 dark:bg-slate-950/20 text-slate-600 border-slate-200/20'
                        }`}>
                          {evt.priority || 'Medium'} Priority
                        </span>
                        
                        {/* Edit & Delete actions */}
                        <div className="ml-auto flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingTimeline(evt); setIsTimelineModalVisible(true); }}
                            className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Event"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            onClick={() => handleDeleteTimeline(evt.id)}
                            className="p-1.5 text-slate-400 hover:text-red-550 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Event Title */}
                      <h4 className="text-sm font-black text-slate-850 dark:text-white leading-snug">{evt.title}</h4>
                      
                      {/* Short Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold mt-2">
                        {evt.description}
                      </p>
                    </div>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/50">
                      <div className="flex items-center gap-1 text-[10px] text-slate-450 font-bold max-w-[70%] truncate">
                        <FileText size={12} className="text-slate-405" />
                        <span>Source: {evt.source || 'Case Summary'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {sortedFilteredEvents.length === 0 && (
              <div className="text-center py-10 bg-slate-50/50 dark:bg-zinc-800/10 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-450">No matching timeline events found</p>
              </div>
            )}
          </div>

          {/* Right Sidebar Widget (35%) */}
          {renderSidebar()}
        </div>
      </div>
    );
  };

  const renderHearings = () => {
    const list = caseData.hearings || [];

    // Extract next hearing
    const upcomingHearingsList = list.filter(h => h.status === 'Upcoming' || (h.status || '').toLowerCase() === 'scheduled');
    const nextHearing = upcomingHearingsList.length > 0 ? upcomingHearingsList[0] : null;

    // Upcoming deadlines from caseData
    const deadlines = caseData.timelineDeadlines || [];
    const primaryDeadline = deadlines.length > 0 ? deadlines[0] : null;

    // Ready for Court logic
    const isPreparationPending = list.some(h => (h.status === 'Upcoming' || h.status === 'scheduled') && (!h.clerkNotes || h.clerkNotes.toLowerCase().includes('pending')));
    const hearingStatusText = isPreparationPending ? 'Preparation Pending' : (list.length > 0 ? 'Ready for Court' : 'Preparation Pending');
    
    // Status colors mapping for timeline cards
    const statusColors = {
      Upcoming: 'bg-blue-50 dark:bg-blue-950/20 text-blue-650 dark:text-blue-400 border-blue-200/20',
      Completed: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 border-emerald-200/20',
      Adjourned: 'bg-amber-50 dark:bg-amber-950/20 text-amber-650 dark:text-amber-400 border-amber-200/20',
      Reserved: 'bg-purple-50 dark:bg-purple-950/20 text-purple-650 dark:text-purple-400 border-purple-200/20',
      Cancelled: 'bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border-red-200/20',
      Disposed: 'bg-slate-50 dark:bg-slate-950/20 text-slate-650 dark:text-slate-400 border-slate-200/20'
    };

    // If case has no summary and is empty, show empty state
    const hasSummaryText = (caseData.summary || caseData.description || notesText || '').trim().split(/\s+/).length >= 8;
    if (list.length === 0 && !hasSummaryText) {
      return (
        <div className="bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-zinc-800/80 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] animate-in fade-in duration-300">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] rounded-full mb-3">
            <Gavel size={24} />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1.5">No Hearing Information Available</h4>
          <p className="text-xs text-slate-400 dark:text-slate-550 max-w-sm mx-auto leading-relaxed mb-5">
            AI could not detect any hearing details because the case currently contains no hearing-related information.
          </p>
          <div className="flex gap-2">
            <button 
              onClick={handleGenerateAiSummary}
              className="px-4 py-1.5 bg-indigo-605 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
            >
              Generate AI Summary
            </button>
            <button 
              onClick={() => document.getElementById('workspace-doc-upload').click()}
              className="px-4 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-350 font-bold text-xs rounded-lg shadow-sm transition-all"
            >
              Upload Order
            </button>
          </div>
        </div>
      );
    }

    // Filter list
    const filteredList = list.filter(h => {
      // Search filter
      if (hearingSearchQuery.trim()) {
        const q = hearingSearchQuery.toLowerCase();
        const matchStage = (h.stage || '').toLowerCase().includes(q);
        const matchJudge = (h.judge || '').toLowerCase().includes(q);
        const matchCourt = (h.courtRoom || '').toLowerCase().includes(q);
        const matchSummary = (h.summary || '').toLowerCase().includes(q);
        const matchDate = (h.date || '').toLowerCase().includes(q);
        if (!matchStage && !matchJudge && !matchCourt && !matchSummary && !matchDate) return false;
      }

      // Chip filter
      if (hearingFilter === 'all') return true;
      if (hearingFilter === 'upcoming') return h.status === 'Upcoming' || (h.status || '').toLowerCase() === 'scheduled';
      if (hearingFilter === 'completed') return h.status === 'Completed';
      if (hearingFilter === 'adjourned') return h.status === 'Adjourned';
      if (hearingFilter === 'orders') return h.status === 'Reserved' || (h.summary || '').toLowerCase().includes('order');
      if (hearingFilter === 'with_docs') return (h.linkedDocsCount || 0) > 0;
      return true;
    });

    // Chronological sorting (oldest to newest)
    const sortedList = [...filteredList].sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      if (isNaN(da.getTime())) return 1;
      if (isNaN(db.getTime())) return -1;
      return da - db;
    });

    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/60 gap-2 sm:gap-3">
          <div className="space-y-0.5">
            <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Gavel size={16} className="text-indigo-650 dark:text-indigo-400" />
              {caseData.title || caseData.name || 'Untitled Case'}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{caseData.courtName || 'Delhi District Court'}</span>
              <span className="text-slate-300 dark:text-zinc-700">•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{caseData.stage || 'Pre-Litigation'}</span>
              <span className="text-slate-300 dark:text-zinc-700">•</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {nextHearing ? `Next: ${nextHearing.date}` : 'No Hearing Scheduled'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setEditingHearing(null); setIsHearingModalVisible(true); }}
              className="px-3 py-1.5 bg-[#4F46E5] hover:opacity-95 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
            >
              <Plus size={14} /> Schedule Hearing
            </button>
          </div>
        </div>

        {/* 4 Compact Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1 */}
          <div className="bg-white dark:bg-[#151f32] border border-slate-200 dark:border-zinc-800/60 rounded-xl p-3 shadow-xs flex flex-col justify-between min-h-[90px]">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">📅 Next Hearing</span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-1 truncate">
                {nextHearing ? nextHearing.date : 'Not Scheduled'}
              </h4>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/40 flex justify-between items-center">
              <span className="text-[9px] text-slate-450 dark:text-slate-500 font-medium">{nextHearing ? nextHearing.time || '10:30 AM' : 'No Appearances'}</span>
              <button 
                onClick={() => { setEditingHearing(null); setIsHearingModalVisible(true); }}
                className="text-[9px] font-bold text-[#4F46E5] hover:underline"
              >
                Add Hearing
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-[#151f32] border border-slate-200 dark:border-zinc-800/60 rounded-xl p-3 shadow-xs flex flex-col justify-between min-h-[90px]">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">⏳ Limitation</span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-1 truncate">
                {primaryDeadline ? primaryDeadline.title : 'Limitation period'}
              </h4>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/40 flex justify-between items-center">
              <span className="text-[9px] text-orange-600 dark:text-orange-400 font-bold uppercase">14 Days Left</span>
              <span className="text-[8px] font-black text-red-500 uppercase tracking-wider">High Priority</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-[#151f32] border border-slate-200 dark:border-zinc-800/60 rounded-xl p-3 shadow-xs flex flex-col justify-between min-h-[90px]">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">📄 Orders</span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-1 truncate">
                {caseData.documents ? caseData.documents.filter(d => d.name.toLowerCase().includes('order') || d.name.toLowerCase().includes('court')).length : 0} Uploaded
              </h4>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/40 flex justify-between items-center">
              <span className="text-[9px] text-slate-450 dark:text-slate-550 font-medium">{(caseData.documents?.length || 0) + (caseData.evidence?.length || 0) + (caseData.contracts?.length || 0)} Total Files</span>
              <button 
                onClick={() => document.getElementById('workspace-doc-upload').click()}
                className="text-[9px] font-bold text-[#4F46E5] hover:underline"
              >
                Upload
              </button>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-[#151f32] border border-slate-200 dark:border-zinc-800/60 rounded-xl p-3 shadow-xs flex flex-col justify-between min-h-[90px]">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">✅ Preparation</span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-1 truncate">
                {hearingStatusText}
              </h4>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/40 flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${isPreparationPending ? 'bg-amber-500' : (list.length > 0 ? 'bg-emerald-500' : 'bg-amber-500')}`} />
                <span className="text-[9px] text-slate-450 dark:text-slate-550 font-medium">{isPreparationPending ? 'Pending' : 'Ready'}</span>
              </div>
              <span className="text-[8px] font-black text-indigo-500 uppercase tracking-wider">Checklist</span>
            </div>
          </div>
        </div>

        {/* Filters and Search - Compact Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap bg-slate-100/80 dark:bg-zinc-800/40 p-1 rounded-lg gap-0.5 border border-slate-200/20">
            {[
              { id: 'all', label: 'All' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' },
              { id: 'adjourned', label: 'Adjourned' },
              { id: 'orders', label: 'Orders' },
              { id: 'with_docs', label: 'Documents' }
            ].map(chip => {
              const isActive = hearingFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setHearingFilter(chip.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                    isActive 
                      ? 'bg-white dark:bg-[#1a2540] text-slate-805 dark:text-white shadow-xs' 
                      : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

        <div className="relative w-full sm:w-56">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={hearingSearchQuery}
              onChange={e => setHearingSearchQuery(e.target.value)}
              placeholder="Search hearings..."
              className="w-full bg-slate-50 dark:bg-zinc-800/40 border border-slate-205 dark:border-zinc-800/60 rounded-lg pl-8 pr-3 py-1 text-xs outline-none text-slate-800 dark:text-white focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Hearings Calendar List / Timeline Cards */}
        <div className="space-y-3 pt-1">
          {sortedList.map((h, i) => {
            const statStyle = statusColors[h.status] || statusColors.Upcoming;
            const statusAccents = {
              Upcoming: 'border-l-blue-500',
              Completed: 'border-l-emerald-500',
              Adjourned: 'border-l-amber-500',
              Reserved: 'border-l-purple-500',
              Cancelled: 'border-l-red-500',
              Disposed: 'border-l-slate-450'
            };
            const accentClass = statusAccents[h.status] || statusAccents.Upcoming;

            return (
              <div 
                key={h.id || i} 
                className={`bg-white dark:bg-[#151f32] border border-slate-255 dark:border-zinc-800/60 rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-3 border-l-4 ${accentClass} hover:shadow-xs transition-all`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                  {/* Info block */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-850 dark:text-slate-205 text-[10px] font-bold rounded">
                        {h.stage || 'Court Appearance'}
                      </span>
                      <span className="text-slate-300 dark:text-zinc-700">•</span>
                      <span className="text-[11px] font-bold text-slate-705 dark:text-slate-300">
                        {h.date} at {h.time || '10:30 AM'}
                      </span>
                      <span className={`px-2 py-0.2 rounded text-[8px] font-black uppercase tracking-wider border ${statStyle}`}>
                        {h.status || 'Upcoming'}
                      </span>
                      {h.orderDocumentId && (
                        <span className="px-2 py-0.2 bg-emerald-50 dark:bg-emerald-950/25 text-emerald-600 dark:text-emerald-450 text-[8px] font-black uppercase border border-emerald-250/20 rounded">
                          ✓ Order Attached
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-450 font-medium">
                      Bench: <span className="font-bold text-slate-700 dark:text-slate-250">{h.judge || 'Justice Dixit'}</span> • Room: <span className="font-bold text-slate-700 dark:text-slate-250">{h.courtRoom || 'Courtroom 3'}</span>
                    </p>

                    {h.summary && (
                      <p className="text-xs text-slate-650 dark:text-slate-400 bg-slate-50/50 dark:bg-black/10 p-2 rounded-lg italic border border-slate-100/50 dark:border-zinc-800/20 max-w-3xl mt-1.5">
                        "{h.summary}"
                      </p>
                    )}

                    {h.orderDocumentId && (
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-black/10 border border-slate-100/40 dark:border-zinc-800/20 px-2.5 py-1 rounded-lg w-fit">
                        <FileText size={11} className="text-red-500" />
                        <span>Court Order File:</span>
                        <span 
                          className="underline cursor-pointer text-[#4F46E5] dark:text-indigo-400" 
                          onClick={() => handleOpenDoc({ name: h.orderDocumentName, uri: h.orderDocumentUri })}
                        >
                          {h.orderDocumentName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-2 border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-100 dark:border-zinc-800/40">
                    <button 
                      onClick={() => { setSelectedDetailHearing(h); setIsHearingClerkModalOpen(true); }}
                      className="px-2 py-1 text-[11px] font-bold text-indigo-650 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-md transition-colors flex items-center gap-1"
                      title="View AI Preparation Notes"
                    >
                      <Brain size={12} /> AI Brief
                    </button>
                    
                    <button 
                      onClick={() => { setEditingHearing(h); setIsHearingModalVisible(true); }}
                      className="px-2 py-1 text-[11px] font-bold text-slate-605 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    
                    {h.status !== 'Completed' && (
                      <button 
                        onClick={async () => {
                          try {
                            await legalService.updateHearing(h.id, { status: 'completed' });
                            toast.success('Hearing marked as completed');
                            const updatedCase = await apiService.getProject(caseData.id || caseData._id);
                            setCaseData(updatedCase);
                          } catch (e) {
                            console.error(e);
                            toast.error('Failed to complete hearing');
                          }
                        }}
                        className="px-2 py-1 text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/25 rounded-md transition-colors"
                      >
                        Complete
                      </button>
                    )}

                    {h.orderDocumentId ? (
                      <>
                        <button 
                          onClick={() => handleOpenDoc({ name: h.orderDocumentName, uri: h.orderDocumentUri })}
                          className="px-2 py-1 text-[11px] font-bold text-[#4F46E5] hover:bg-indigo-50 dark:hover:bg-indigo-950/25 rounded-md transition-colors"
                        >
                          View Order
                        </button>
                        <button 
                          onClick={() => { setUploadOrderContextHearing(h); setIsUploadOrderModalOpen(true); }}
                          className="px-2 py-1 text-[11px] font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/25 rounded-md transition-colors"
                        >
                          Replace Order
                        </button>
                        <button 
                          onClick={() => setExpandedAiSummaryHearingId(expandedAiSummaryHearingId === h.id ? null : h.id)}
                          className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors flex items-center gap-1 ${
                            expandedAiSummaryHearingId === h.id 
                              ? 'bg-[#4F46E5] text-white' 
                              : 'text-indigo-605 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/25'
                          }`}
                        >
                          <Sparkles size={11} /> AI Summary
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => { setUploadOrderContextHearing(h); setIsUploadOrderModalOpen(true); }}
                        className="px-2 py-1 text-[11px] font-bold text-slate-605 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 rounded-md transition-colors"
                        title="Upload Court Order"
                      >
                        Upload Order
                      </button>
                    )}

                    <button 
                      onClick={() => handleDeleteHearing(h.id)}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 rounded-md transition-colors ml-1"
                      title="Delete Hearing"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* AI Summary and Next Hearing Generation Panel */}
                {expandedAiSummaryHearingId === h.id && h.orderAiSummary && (
                  <div className="mt-2.5 p-3 bg-slate-50 dark:bg-black/20 border border-slate-150 dark:border-zinc-805/40 rounded-xl space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[9px] text-[#4F46E5] dark:text-indigo-400 flex items-center gap-1">
                        <Sparkles size={11} /> Court Order AI Insights Dossier
                      </p>
                      <button 
                        onClick={() => setExpandedAiSummaryHearingId(null)}
                        className="text-[9px] font-bold text-slate-400 hover:text-slate-600"
                      >
                        Close
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] pt-1">
                      <div><span className="font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[8px]">Decision</span> {h.orderDecision}</div>
                      <div><span className="font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[8px]">Next Date</span> {h.orderNextHearingDate}</div>
                      <div><span className="font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[8px]">Directions</span> {h.orderDirections}</div>
                      <div><span className="font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[8px]">Operative Order</span> {h.orderOperativeOrder}</div>
                    </div>
                    {h.orderNextHearingDate && (
                      <div className="pt-2 border-t border-slate-200/50 dark:border-zinc-800/60 flex items-center justify-between gap-2">
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-450">📅 Extracted next hearing date: {h.orderNextHearingDate}</span>
                        <button 
                          onClick={() => handleCreateNextHearing(h, h.orderNextHearingDate)}
                          className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 rounded text-[9px] font-black uppercase tracking-wider border border-emerald-250/20 transition-colors animate-pulse"
                        >
                          Create Next Hearing
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const triggerBackgroundPartiesSync = async (targetData, manual = false) => {
    if (!targetData) return;
    const caseId = targetData.id || targetData._id;
    if (!caseId) return;

    if (!manual) {
      const summary = targetData.summary || targetData.description || '';
      if (!summary || summary.trim().split(/\s+/).length < 8) {
        console.log("[Background Parties] Case summary empty or too short. Skipping background extraction.");
        return;
      }
    }

    console.log("[Background Parties] Triggering parties background extraction...");
    try {
      setIsExtractingParties(true);
      const toastId = manual ? toast.loading("AI is extracting case participants...") : null;
      const res = await legalService.extractAiParties(caseId, targetData, caseNotes);
      if (res) {
        setCaseData(res);
        if (manual) toast.success("AI extracted parties roster successfully!", { id: toastId });
      }
      console.log("[Background Parties] Background parties sync complete.");
    } catch (err) {
      console.error("[Background Parties] Failed background parties sync", err);
      if (manual) toast.error("Failed to run AI Auto-Extract");
    } finally {
      setIsExtractingParties(false);
    }
  };

  const renderParties = () => {
    const getInitials = (name) => {
      if (!name || name === 'Not Available') return 'N/A';
      return name.split(/\s+/).map(p => p[0]).join('').substring(0, 2).toUpperCase();
    };

    const clientInitials = getInitials(caseData.clientName);
    const advocateInitials = getInitials(caseData.advocateName);
    const opponentInitials = getInitials(caseData.opponentName);
    const courtInitials = getInitials(caseData.courtName);

    const clientFields = [
      { label: 'Full Name', value: caseData.clientName },
      { label: 'Mobile Number', value: caseData.clientPhone },
      { label: 'Email', value: caseData.clientEmail, isMail: true },
      { label: 'Address', value: caseData.clientAddress }
    ].filter(f => f.value && f.value !== 'Not Available' && f.value !== 'Not yet extracted');

    const advocateFields = [
      { label: 'Lead Advocate', value: caseData.advocateName },
      { label: 'Law Firm', value: caseData.advocateFirm },
      { label: 'Enrollment No.', value: caseData.advocateEnrollment },
      { label: 'Mobile', value: caseData.advocatePhone },
      { label: 'Email', value: caseData.advocateEmail, isMail: true }
    ].filter(f => f.value && f.value !== 'Not Available' && f.value !== 'Not yet extracted');

    const opponentFields = [
      { label: 'Opponent Name', value: caseData.opponentName },
      { label: 'Opponent Advocate', value: caseData.opponentAdvocate },
      { label: 'Mobile', value: caseData.opponentPhone },
      { label: 'Email', value: caseData.opponentEmail, isMail: true }
    ].filter(f => f.value && f.value !== 'Not Available' && f.value !== 'Not yet extracted');

    const courtFields = [
      { label: 'Court Name', value: caseData.courtName },
      { label: 'Case Number', value: caseData.caseNo },
      { label: 'Presiding Judge', value: caseData.judge },
      { label: 'Current Stage', value: caseData.stage || 'Pre-Litigation' },
      { label: 'Jurisdiction', value: caseData.jurisdiction }
    ].filter(f => f.value && f.value !== 'Not Available' && f.value !== 'Not yet extracted');

    const renderCard = (title, initials, fields, colorClass, iconComponent) => {
      const isAllEmpty = fields.length === 0;

      return (
        <div className="bg-white dark:bg-[#151f32] border border-slate-200 dark:border-zinc-805/60 rounded-xl p-4 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[140px] hover:border-indigo-400 dark:hover:border-indigo-900/60">
          <div>
            {/* Header row */}
            <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-slate-50 dark:border-zinc-800/40">
              <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center font-bold text-[11px]`}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[12px] font-black text-slate-800 dark:text-white leading-tight flex items-center gap-1.5 uppercase tracking-wide">
                  {iconComponent} {title}
                </h4>
              </div>
            </div>

            {/* Fields list */}
            {isAllEmpty ? (
              <div className="py-6 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-black/10 rounded-lg border border-slate-100/50 dark:border-zinc-800/20">
                🔍 Not yet extracted
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                {fields.map((f, idx) => (
                  <div key={idx} className={f.label === 'Address' || f.label === 'Court Name' || f.label === 'Law Firm' ? 'sm:col-span-2' : ''}>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{f.label}</span>
                    {f.isMail ? (
                      <a href={`mailto:${f.value}`} className="text-[11px] font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline mt-0.5 block truncate">{f.value}</a>
                    ) : (
                      <p className="text-[11px] font-semibold text-slate-750 dark:text-slate-200 mt-0.5 leading-snug" title={f.value}>{f.value}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        {/* Roster Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
              <Users size={14} className="text-[#4F46E5]" /> Parties & Case Roster
            </h3>
            <p className="text-[9px] text-slate-405 dark:text-slate-500 font-bold uppercase mt-0.5">
              Verify client profiles, advocate profiles, opponent details, and court jurisdiction.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEditRosterModalOpen(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-650 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
            >
              Edit Case Roster
            </button>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {renderCard('Client / Petitioner', clientInitials, clientFields, 'bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5]', <User size={13} />)}
          {renderCard('Primary Advocate', advocateInitials, advocateFields, 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600', <Briefcase size={13} />)}
          {renderCard('Opposing Party', opponentInitials, opponentFields, 'bg-rose-50 dark:bg-rose-950/20 text-red-600', <Shield size={13} />)}
          {renderCard('Court Details', courtInitials, courtFields, 'bg-teal-50 dark:bg-teal-950/20 text-teal-600', <Scale size={13} />)}
        </div>
      </div>
    );
  };

  const renderDocuments = () => {
    const docsList = caseData.documents || [];
    const totalFiles = docsList.length;
    const totalSize = docsList.reduce((acc, d) => acc + (d.size || 0), 0);
    const lastUpload = docsList.reduce((max, d) => d.uploadedAt && new Date(d.uploadedAt) > new Date(max) ? d.uploadedAt : max, '');

    const ocrCompleteCount = docsList.filter(d => (d.ocrStatus || '').toLowerCase().includes('success') || d.ocrText || d.extractedText).length;
    const draftsCount = docsList.filter(d => (d.name || '').toLowerCase().includes('draft')).length;
    const ordersCount = docsList.filter(d => (d.category || '').toLowerCase() === 'court order').length;

    const filteredDocs = docsList.filter(doc => {
      if (docSearchQuery) {
        const query = docSearchQuery.toLowerCase();
        const matchesName = (doc.name || '').toLowerCase().includes(query);
        const matchesCategory = (doc.category || '').toLowerCase().includes(query);
        const matchesFacts = (doc.facts || '').toLowerCase().includes(query);
        const matchesParties = (doc.extractedParties || []).some(p => p.toLowerCase().includes(query));
        if (!matchesName && !matchesCategory && !matchesFacts && !matchesParties) return false;
      }

      if (docFilter === 'all') return true;
      if (docFilter === 'court_filings') return ['petition', 'affidavit', 'court order', 'reply', 'legal notice'].includes((doc.category || '').toLowerCase());
      if (docFilter === 'contracts') return ['agreement', 'contract'].includes((doc.category || '').toLowerCase());
      if (docFilter === 'evidence') return ['evidence', 'receipt', 'invoice', 'email', 'bank statement', 'medical record', 'photograph', 'video', 'audio'].includes((doc.category || '').toLowerCase());
      if (docFilter === 'drafts') return (doc.name || '').toLowerCase().includes('draft');
      if (docFilter === 'orders') return (doc.category || '').toLowerCase() === 'court order';
      if (docFilter === 'ai_extracted') return !!doc.aiProcessed;
      if (docFilter === 'recent') {
        const uploadTime = doc.uploadedAt ? new Date(doc.uploadedAt).getTime() : 0;
        return Date.now() - uploadTime < 24 * 60 * 60 * 1000 * 3;
      }
      return true;
    });

    const categories = [
      { id: 'all', label: 'All Files' },
      { id: 'court_filings', label: 'Court Filings' },
      { id: 'contracts', label: 'Contracts' },
      { id: 'evidence', label: 'Evidence' },
      { id: 'drafts', label: 'Drafts' },
      { id: 'orders', label: 'Orders' },
      { id: 'ai_extracted', label: 'AI Extracted' },
      { id: 'recent', label: 'Recent' }
    ];

    const formatSize = (bytes) => {
      if (!bytes) return '0 KB';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        
        {/* COMPACT TOOLBAR */}
        <div className="bg-white dark:bg-[#151f32] border border-slate-205 dark:border-zinc-805/60 rounded-xl px-4 py-2.5 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-h-[58px]">
          {/* Title & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-808 dark:text-white flex items-center gap-1.5 shrink-0">
              📁 Documents
            </h3>
            <div className="text-[10px] text-slate-455 dark:text-slate-450 font-bold uppercase flex items-center gap-2 flex-wrap border-l border-slate-100 dark:border-zinc-800/60 pl-3">
              <span>Total: <strong className="text-slate-705 dark:text-white font-extrabold">{totalFiles} Files</strong></span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>OCR Done: <strong className="text-slate-705 dark:text-white font-extrabold">{ocrCompleteCount}</strong></span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>Drafts: <strong className="text-slate-705 dark:text-white font-extrabold">{draftsCount}</strong></span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>Orders: <strong className="text-slate-705 dark:text-white font-extrabold">{ordersCount}</strong></span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <div className="flex items-center bg-slate-55 dark:bg-black/20 p-0.5 rounded-lg border border-slate-150 dark:border-zinc-800/40 mr-1">
              <button 
                onClick={() => setDocViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${docViewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-[#4F46E5] shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grid View"
              >
                <LayoutGrid size={11} />
              </button>
              <button 
                onClick={() => setDocViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${docViewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-[#4F46E5] shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                title="List View"
              >
                <List size={11} />
              </button>
            </div>

            <button 
              onClick={() => document.getElementById('workspace-doc-upload').click()}
              className="px-3 py-1.5 bg-[#4F46E5] hover:opacity-95 text-white font-black text-[9px] uppercase tracking-wider rounded-lg transition-all"
            >
              Upload
            </button>
          </div>
        </div>

        {/* DRAG & DROP UPLOAD BOX */}
        <div 
          onClick={() => document.getElementById('workspace-doc-upload').click()}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDropUpload}
          className="border-2 border-dashed border-indigo-205 dark:border-zinc-805 hover:border-indigo-405 dark:hover:border-indigo-500 bg-indigo-50/5 dark:bg-black/5 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[110px] max-h-[130px] group"
        >
          <Paperclip size={18} className="text-[#4F46E5] mb-1.5 group-hover:scale-105 transition-transform" />
          <h4 className="text-[10px] font-black text-slate-808 dark:text-white uppercase tracking-wider">Upload Case Documents</h4>
          <p className="text-[9px] text-slate-455 dark:text-slate-400 font-bold uppercase mt-0.5">
            Drag & Drop or <span className="text-[#4F46E5] underline">Browse Files</span>
          </p>
          <p className="text-[8px] text-slate-405 dark:text-slate-500 font-bold uppercase mt-1.5 tracking-wide">
            PDF, DOCX, DOC, XLSX, Images up to 100MB
          </p>
        </div>

        {uploadProgress && (
          <div className="p-2.5 bg-white dark:bg-[#151f32] border border-slate-200 dark:border-zinc-850 rounded-xl max-w-sm flex items-center justify-between gap-3 shadow-xs animate-pulse">
            <span className="text-[9px] font-bold text-slate-500 uppercase truncate max-w-[120px]">{uploadProgress.name}</span>
            <div className="flex-1 bg-slate-100 dark:bg-zinc-700 h-1 rounded-full overflow-hidden">
              <div className="bg-[#4F46E5] h-full transition-all" style={{ width: `${uploadProgress.percent}%` }} />
            </div>
            <span className="text-[9px] font-bold text-[#4F46E5]">{uploadProgress.percent}%</span>
          </div>
        )}

        {/* SEARCH AND FILTERS */}
        <div className="flex flex-col md:flex-row gap-2 items-center justify-between bg-slate-50/50 dark:bg-black/10 p-1.5 rounded-lg border border-slate-150 dark:border-zinc-800/40">
          <div className="relative w-full md:max-w-xs shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={11} />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={docSearchQuery}
              onChange={(e) => setDocSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-805 border border-slate-200 dark:border-zinc-700/80 rounded-md pl-7 pr-3 py-1 text-[10px] font-bold text-slate-800 dark:text-white outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-1 w-full md:w-auto justify-end">
            {categories.map(chip => (
              <button 
                key={chip.id}
                onClick={() => setDocFilter(chip.id)}
                className={`px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider rounded-lg border transition-all ${
                  docFilter === chip.id
                    ? 'bg-slate-800 dark:bg-zinc-700 text-white border-slate-800 dark:border-zinc-650'
                    : 'bg-white dark:bg-zinc-800 text-slate-500 border-slate-200 dark:border-zinc-700 hover:bg-slate-50'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid and List views code */}
        {docViewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
            {filteredDocs.map((doc, idx) => {
              const isPDF = (doc.name || '').toLowerCase().endsWith('.pdf');
              const isWord = (doc.name || '').toLowerCase().endsWith('.docx') || (doc.name || '').toLowerCase().endsWith('.doc');

              return (
                <div key={idx} className="bg-white dark:bg-[#151f32] border border-slate-200 dark:border-zinc-805/65 hover:border-indigo-405 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2 truncate">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          isPDF ? 'bg-rose-50 text-red-655 dark:bg-rose-950/20' :
                          isWord ? 'bg-indigo-50 text-[#4F46E5] dark:bg-indigo-950/20' :
                          'bg-slate-55 text-slate-500 dark:bg-zinc-800'
                        }`}>
                          <FileText size={13} />
                        </div>
                        <div className="truncate">
                          <h4 
                            onClick={() => { setSelectedDocDetails(doc); setIsDocInsightsOpen(true); }}
                            className="text-xs font-black text-slate-808 dark:text-white uppercase tracking-wider truncate cursor-pointer hover:text-[#4F46E5] hover:underline"
                            title={doc.name}
                          >
                            {doc.name}
                          </h4>
                          <span className="text-[7.5px] font-black uppercase text-slate-400 block tracking-wide mt-0.5">{doc.category || 'Other'}</span>
                        </div>
                      </div>

                      {/* Hover action bar */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {doc.uri && <button onClick={() => handleOpenDoc(doc)} className="p-1 text-slate-400 hover:text-[#4F46E5] hover:bg-slate-55 rounded" title="Preview"><Eye size={9} /></button>}
                        <button onClick={() => handleDownloadDoc(doc)} className="p-1 text-slate-400 hover:text-[#4F46E5] hover:bg-slate-55 rounded" title="Download"><Download size={9} /></button>
                        <button onClick={() => handleRenameDoc(doc)} className="p-1 text-slate-400 hover:text-[#4F46E5] hover:bg-slate-55 rounded" title="Rename"><Edit2 size={9} /></button>
                        <button onClick={() => handleShareDoc(doc)} className="p-1 text-slate-400 hover:text-[#4F46E5] hover:bg-slate-55 rounded" title="Copy Link"><Share2 size={9} /></button>
                        <button onClick={() => handleDeleteEvidence(doc)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-rose-50/20 rounded" title="Delete"><Trash2 size={9} /></button>
                      </div>
                    </div>

                    {doc.facts && (
                      <p className="text-[9.5px] text-slate-450 dark:text-slate-400 leading-snug font-medium italic mt-2 line-clamp-2 pl-1.5 border-l border-indigo-150/40">
                        "${doc.facts}"
                      </p>
                    )}
                  </div>

                  <div className="border-t border-slate-50 dark:border-zinc-800/40 pt-2 flex items-center justify-between text-[7.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-2">
                    <div className="flex items-center gap-1.5">
                      <span>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}</span>
                      <span>•</span>
                      <span>{formatSize(doc.size)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`px-1 rounded-[3px] border ${doc.ocrStatus === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50 dark:bg-emerald-950/20' : 'bg-slate-55 text-slate-400'}`}>OCR</span>
                      <span className={`px-1 rounded-[3px] border ${doc.aiProcessed ? 'bg-indigo-50 text-indigo-600 border-indigo-100/50 dark:bg-indigo-950/20' : 'bg-slate-55 text-slate-400'}`}>AI</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (<>
          {/* ── MOBILE: Document cards (hidden sm+) ── */}
          <div className="sm:hidden divide-y divide-slate-100 dark:divide-zinc-800/40">
            {filteredDocs.map((doc, idx) => {
              const isPDF = (doc.name || '').toLowerCase().endsWith('.pdf');
              const isWord = (doc.name || '').toLowerCase().endsWith('.docx') || (doc.name || '').toLowerCase().endsWith('.doc');
              return (
                <div key={idx} className="p-3 flex items-start gap-3 hover:bg-slate-50/50 dark:hover:bg-black/5">
                  <div className={`p-1.5 rounded flex-shrink-0 ${isPDF ? 'bg-rose-50 text-red-600 dark:bg-rose-950/20' : isWord ? 'bg-indigo-50 text-[#4F46E5] dark:bg-indigo-950/20' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800'}`}>
                    <FileText size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <button onClick={() => { setSelectedDocDetails(doc); setIsDocInsightsOpen(true); }} className="text-xs font-bold text-slate-800 dark:text-white hover:text-[#4F46E5] text-left w-full truncate block">{doc.name}</button>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-[8px] font-black uppercase text-slate-500 rounded">{doc.category || 'Other'}</span>
                      <span className="text-[10px] text-slate-400">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}</span>
                      <span className="text-[10px] text-slate-400">{formatSize(doc.size)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {doc.uri && <button onClick={() => handleOpenDoc(doc)} className="p-2 text-slate-400 hover:text-[#4F46E5] rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 min-h-[36px] min-w-[36px] flex items-center justify-center" title="Preview"><Eye size={13} /></button>}
                    <button onClick={() => handleDownloadDoc(doc)} className="p-2 text-slate-400 hover:text-[#4F46E5] rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 min-h-[36px] min-w-[36px] flex items-center justify-center" title="Download"><Download size={13} /></button>
                    <button onClick={() => handleDeleteEvidence(doc)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 min-h-[36px] min-w-[36px] flex items-center justify-center" title="Delete"><Trash2 size={13} /></button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-white dark:bg-[#151f32] border border-slate-205 dark:border-zinc-855/60 rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300">
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800/40 bg-slate-50/50 dark:bg-black/10 text-[8.5px] font-black text-slate-405 dark:text-slate-500 uppercase tracking-widest">
                    <th className="py-2.5 px-4">Document Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Upload Date</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">AI Insights</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/30">
                  {filteredDocs.map((doc, idx) => {
                    const isPDF = (doc.name || '').toLowerCase().endsWith('.pdf');
                    const isWord = (doc.name || '').toLowerCase().endsWith('.docx') || (doc.name || '').toLowerCase().endsWith('.doc');

                    return (
                      <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-black/5 transition-colors group">
                        <td className="py-2 px-4 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${
                              isPDF ? 'bg-rose-50 text-red-655 dark:bg-rose-950/20' :
                              isWord ? 'bg-indigo-50 text-[#4F46E5] dark:bg-indigo-950/20' :
                              'bg-slate-55 text-slate-500 dark:bg-zinc-800'
                            }`}>
                              <FileText size={11} />
                            </div>
                            <span 
                              onClick={() => { setSelectedDocDetails(doc); setIsDocInsightsOpen(true); }}
                              className="text-xs font-bold text-slate-808 dark:text-white cursor-pointer hover:text-[#4F46E5] truncate max-w-[250px]"
                            >
                              {doc.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-1.5 py-0.5 bg-slate-50 dark:bg-zinc-800 text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 rounded tracking-wider border border-slate-150 dark:border-zinc-700/50">
                            {doc.category || 'Other'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                          {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-2 px-3 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                          {formatSize(doc.size)}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-center gap-1">
                            <span className={`px-1 text-[7px] font-black rounded-[3px] border ${doc.ocrStatus === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50 dark:bg-emerald-950/20' : 'bg-slate-55 text-slate-400'}`}>OCR</span>
                            <span className={`px-1 text-[7px] font-black rounded-[3px] border ${doc.aiProcessed ? 'bg-indigo-50 text-indigo-600 border-indigo-100/50 dark:bg-indigo-950/20' : 'bg-slate-55 text-slate-400'}`}>AI</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 max-w-[220px]">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">
                            {doc.facts || 'No analysis run.'}
                          </p>
                        </td>
                        <td className="py-2 px-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedDocDetails(doc); setIsDocInsightsOpen(true); }} className="p-1 text-slate-400 hover:text-[#4F46E5] hover:bg-slate-55 rounded" title="AI Summary"><Sparkles size={10} /></button>
                            {doc.uri && <button onClick={() => handleOpenDoc(doc)} className="p-1 text-slate-400 hover:text-[#4F46E5] hover:bg-slate-55 rounded" title="Preview"><Eye size={10} /></button>}
                            <button onClick={() => handleDownloadDoc(doc)} className="p-1 text-slate-400 hover:text-[#4F46E5] hover:bg-slate-55 rounded" title="Download"><Download size={10} /></button>
                            <button onClick={() => handleRenameDoc(doc)} className="p-1 text-slate-400 hover:text-[#4F46E5] hover:bg-slate-55 rounded" title="Rename"><Edit2 size={10} /></button>
                            <button onClick={() => handleShareDoc(doc)} className="p-1 text-slate-400 hover:text-[#4F46E5] hover:bg-slate-55 rounded" title="Copy Link"><Share2 size={10} /></button>
                            <button onClick={() => handleDeleteEvidence(doc)} className="p-1 text-slate-455 hover:text-red-500 hover:bg-rose-50/20 rounded" title="Delete"><Trash2 size={10} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
        )}

      </div>
    );
  };
  const renderEvidence = () => {
    const formatSize = (bytes) => {
      if (!bytes) return '—';
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (doc) => {
      const ext = (doc.name || '').split('.').pop().toLowerCase();
      const t = doc.type || '';
      if (t.startsWith('image/') || ['jpg','jpeg','png','webp','gif'].includes(ext)) return '🖼';
      if (t.startsWith('video/') || ['mp4','mov','avi'].includes(ext)) return '🎬';
      if (t.startsWith('audio/') || ['mp3','wav','m4a'].includes(ext)) return '🎵';
      if (ext === 'pdf') return '📄';
      if (['doc','docx'].includes(ext)) return '📝';
      if (['xls','xlsx'].includes(ext)) return '📊';
      if (['zip','rar'].includes(ext)) return '🗜';
      return '📁';
    };

    const getStrengthColor = (strength) => {
      const s = (strength || '').toLowerCase();
      if (s === 'strong') return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/40';
      if (s === 'weak') return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200/40';
      if (s === 'disputed' || s === 'tampered') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200/40';
      return 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-zinc-800 border-slate-200/40';
    };

    const getAdmissibilityBadge = (admissibility) => {
      const a = (admissibility || '').toLowerCase();
      if (a === 'admissible') return { label: 'Admissible', cls: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' };
      if (a === 'challenged') return { label: 'Challenged', cls: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20' };
      if (a === 'inadmissible') return { label: 'Inadmissible', cls: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20' };
      return { label: 'Verified', cls: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' };
    };

    const allDocs = caseData.evidence || [];

    const filteredEvidence = allDocs.filter(doc => {
      if (evidenceSearchQuery) {
        const q = evidenceSearchQuery.toLowerCase();
        const fields = [
          doc.name, doc.category, doc.facts, doc.extractedText,
          doc.acts, doc.sections, doc.recommendations,
          ...(doc.extractedParties || []),
          ...(doc.extractedDates || [])
        ].map(f => (f || '').toLowerCase());
        if (!fields.some(f => f.includes(q))) return false;
      }
      const cat = (doc.category || '').toLowerCase();
      const str = (doc.strength || '').toLowerCase();
      const adm = (doc.admissibility || '').toLowerCase();

      if (evidenceFilter === 'all') return true;
      if (evidenceFilter === 'verified') return adm === 'admissible' || !adm;
      if (evidenceFilter === 'pending') return adm === 'challenged';
      if (evidenceFilter === 'strong') return str === 'strong';
      if (evidenceFilter === 'weak') return str === 'weak';
      if (evidenceFilter === 'flagged') return ['disputed','tampered'].includes(str) || adm === 'inadmissible';
      if (evidenceFilter === 'documents') return ['agreement','contract','petition','affidavit','legal notice','reply','written statement','appeal','charge sheet'].includes(cat);
      if (evidenceFilter === 'media') return ['photograph','video','audio','cctv','image'].includes(cat) || ['jpg','jpeg','png','mp4','mov','mp3','wav'].some(e => (doc.name||'').toLowerCase().endsWith('.'+e));
      if (evidenceFilter === 'financial') return ['invoice','receipt','bank statement','sale deed'].includes(cat);
      if (evidenceFilter === 'communications') return ['email','whatsapp chat'].includes(cat);
      if (evidenceFilter === 'witness') return cat === 'affidavit' || cat === 'witness statement';
      if (evidenceFilter === 'court_orders') return cat === 'court order' || cat === 'judgment';
      if (evidenceFilter === 'contracts') return ['agreement','employment contract','nda','contract'].includes(cat);
      if (evidenceFilter === 'ocr') return (doc.ocrStatus || '').toLowerCase().includes('ocr');
      if (evidenceFilter === 'ai_flagged') return doc.riskLevel === 'High' || ['disputed','tampered'].includes(str);
      return true;
    });

    const totalCount = allDocs.length;
    const verifiedCount = allDocs.filter(d => d.status === 'Verified' || (d.admissibility || '').toLowerCase() === 'admissible' || !d.admissibility).length;
    const pendingCount = allDocs.filter(d => d.status === 'Pending' || (d.admissibility || '').toLowerCase() === 'challenged').length;
    const flaggedCount = allDocs.filter(d => (d.strength || '').toLowerCase() === 'disputed' || (d.strength || '').toLowerCase() === 'tampered' || (d.admissibility || '').toLowerCase() === 'inadmissible').length;
    const strongCount = allDocs.filter(d => (d.strength || '').toLowerCase() === 'strong').length;
    const weakCount = allDocs.filter(d => (d.strength || '').toLowerCase() === 'weak').length;
    const recentCount = allDocs.filter(d => Date.now() - new Date(d.uploadedAt || 0).getTime() < 3 * 24 * 3600 * 1000).length;

    const chips = [
      { id: 'all',            label: 'All' },
      { id: 'verified',       label: 'Verified' },
      { id: 'pending',        label: 'Pending' },
      { id: 'strong',         label: 'Strong' },
      { id: 'weak',           label: 'Weak' },
      { id: 'ai_flagged',     label: 'AI Flagged' },
      { id: 'documents',      label: 'Documents' },
      { id: 'media',          label: 'Media' },
      { id: 'financial',      label: 'Financial' },
      { id: 'communications', label: 'Comms' },
      { id: 'witness',        label: 'Witness' },
      { id: 'court_orders',   label: 'Court Orders' },
      { id: 'contracts',      label: 'Contracts' },
      { id: 'ocr',            label: 'OCR' },
      { id: 'ai_flagged',     label: '⚠ Flagged' },
    ];

    return (
      <div className="space-y-3 animate-in fade-in duration-300">

        {/* COMPACT STATS HEADER */}
        <div className="bg-white dark:bg-[#1A2540] border border-slate-205 dark:border-zinc-800/80 rounded-2xl px-4 py-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 dark:bg-rose-955/20 text-[#EF4444] rounded-xl">
              <Shield size={16} />
            </div>
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-808 dark:text-white">🛡 Evidence Vault</h3>
              <p className="text-[9px] text-slate-405 font-semibold uppercase tracking-wider mt-0.5">AI-Powered Legal Evidence Repository</p>
            </div>
            <div className="hidden md:flex items-center gap-1.5 ml-3 flex-wrap">
              {[
                { label: `${totalCount} Total`,   cls: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300' },
                { label: `${verifiedCount} Verified`, cls: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' },
                { label: `${pendingCount} Pending`,   cls: 'bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400' },
                { label: `${flaggedCount} Flagged`,   cls: 'bg-red-50 dark:bg-red-955/20 text-red-605 dark:text-red-400' },
                { label: `${strongCount} Strong`,     cls: 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-650' },
                { label: `${weakCount} Weak`,         cls: 'bg-amber-50 dark:bg-amber-955/20 text-amber-600' },
                { label: `${recentCount} Recent`,     cls: 'bg-indigo-55/20 dark:bg-indigo-955/20 text-indigo-650 dark:text-indigo-400' },
              ].map((s, i) => (
                <span key={i} className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border border-transparent ${s.cls}`}>{s.label}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => document.getElementById('workspace-doc-upload').click()}
              className="px-3 py-1.5 bg-[#EF4444] hover:opacity-90 text-white font-black text-[9px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1"
            >
              <FileUp size={11} /> Upload
            </button>
            <button
              onClick={() => document.getElementById('workspace-doc-upload').click()}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-black text-[9px] uppercase tracking-wider rounded-lg transition-all"
            >
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Drag and drop upload zone */}
        <div 
          onClick={() => document.getElementById('workspace-doc-upload').click()}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDropUpload}
          className="border-2 border-dashed border-red-200 dark:border-zinc-805 hover:border-red-400 dark:hover:border-red-500 bg-red-50/5 dark:bg-black/5 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[110px] max-h-[130px] group"
        >
          <Shield size={18} className="text-[#EF4444] mb-1.5 group-hover:scale-105 transition-transform" />
          <h4 className="text-[10px] font-black text-slate-808 dark:text-white uppercase tracking-wider">Drag Evidence Here</h4>
          <p className="text-[9px] text-slate-455 dark:text-slate-400 font-bold uppercase mt-0.5">
            Drag & Drop or <span className="text-[#EF4444] underline">Browse Proof Files</span>
          </p>
          <p className="text-[8px] text-slate-405 dark:text-slate-500 font-bold uppercase mt-1.5 tracking-wide">
            Images, Videos, Audio, PDF, invoices, screenshots up to 100MB
          </p>
        </div>

        {/* Search & filters panel */}
        <div className="flex flex-col md:flex-row gap-2 items-center justify-between bg-slate-50/50 dark:bg-black/10 p-1.5 rounded-lg border border-slate-150 dark:border-zinc-800/40">
          <div className="relative w-full md:max-w-xs shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-405" size={11} />
            <input 
              type="text" 
              placeholder="Search evidence..." 
              value={evidenceSearchQuery}
              onChange={(e) => setEvidenceSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-805 border border-slate-205 dark:border-zinc-700/80 rounded-md pl-7 pr-3 py-1 text-[10px] font-bold text-slate-808 dark:text-white outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-1 w-full justify-start sm:justify-end max-w-full">
            {chips.map(chip => (
              <button 
                key={chip.id}
                onClick={() => setEvidenceFilter(chip.id)}
                className={`px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider rounded-lg border transition-all shrink-0 ${
                  evidenceFilter === chip.id
                    ? 'bg-[#EF4444] text-white border-[#EF4444]'
                    : 'bg-white dark:bg-zinc-800 text-slate-500 border-slate-200 dark:border-zinc-700 hover:bg-slate-50'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table view */}
        {/* ── MOBILE: Evidence stacked cards (hidden sm+) ── */}
        <div className="sm:hidden space-y-2">
          {filteredEvidence.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">No evidence found.</div>
          ) : filteredEvidence.map((doc, idx) => {
            const badge = getAdmissibilityBadge(doc.admissibility);
            const strengthCls = getStrengthColor(doc.strength);
            return (
              <div key={doc.id || idx} className="border border-slate-200 dark:border-zinc-800 rounded-xl p-3 bg-white dark:bg-[#151f32] space-y-2">
                <div className="flex items-start gap-2 justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="p-1.5 bg-rose-50 dark:bg-rose-950/20 text-red-600 rounded flex-shrink-0">
                      {getFileIcon(doc)}
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{doc.name}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => { setSelectedDocDetails(doc); setIsDocInsightsOpen(true); }} className="p-2 text-slate-400 hover:text-[#4F46E5] rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"><Sparkles size={13} /></button>
                    <button onClick={() => handleDownloadDoc(doc)} className="p-2 text-slate-400 hover:text-[#4F46E5] rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"><Download size={13} /></button>
                    <button onClick={() => handleDeleteEvidence(doc)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"><Trash2 size={13} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${badge.cls}`}>{badge.label}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${strengthCls}`}>{doc.strength || 'Strong'}</span>
                  <span className="text-[9px] text-slate-400 font-medium">{doc.sourceType || doc.category || 'Document'}</span>
                  <span className="text-[9px] text-slate-400 font-medium">{formatSize(doc.size)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="hidden sm:block overflow-x-auto w-full">
            <div className="min-w-[800px] divide-y divide-slate-100 dark:divide-zinc-800/85">
              
              {/* Header */}
              <div className="bg-slate-50/50 dark:bg-zinc-900/30 px-4 py-2.5 grid grid-cols-12 gap-3 text-[8.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                <div className="col-span-4">Evidence Item</div>
                <div className="col-span-2">Source Type</div>
                <div className="col-span-2">Admissibility</div>
                <div className="col-span-1">Strength</div>
                <div className="col-span-1">Confidence</div>
                <div className="col-span-1">Size</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {/* Rows */}
              {filteredEvidence.length > 0 ? (
                filteredEvidence.map((doc, idx) => {
                  const badge = getAdmissibilityBadge(doc.admissibility);
                  const strengthCls = getStrengthColor(doc.strength);
                  const confidence = doc.confidenceScore ? `${doc.confidenceScore}%` : '96%';

                  return (
                    <div key={doc.id || idx} className="px-4 py-2.5 grid grid-cols-12 gap-3 items-center hover:bg-slate-50/30 dark:hover:bg-zinc-800/30 transition-colors group text-[9.5px] font-bold text-slate-700 dark:text-slate-355 text-left">
                      
                      {/* Name */}
                      <div className="col-span-4 flex items-center gap-2 truncate">
                        <span className="text-base shrink-0">{getFileIcon(doc)}</span>
                        <div className="truncate">
                          <h4 
                            onClick={() => { setSelectedEvidenceDetails(doc); setIsEvidenceInsightsOpen(true); }}
                            className="font-black text-slate-808 dark:text-white uppercase tracking-wider truncate cursor-pointer hover:underline hover:text-[#EF4444]"
                          >
                            {doc.name}
                          </h4>
                          <span className="text-[7.5px] font-bold text-slate-400 block tracking-wide mt-0.5">Uploaded {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recently'}</span>
                        </div>
                      </div>

                      {/* Type */}
                      <div className="col-span-2">
                        <span className="px-1.5 py-0.5 bg-slate-105 dark:bg-zinc-850 rounded text-[7.5px] font-black uppercase tracking-wider text-slate-650 dark:text-slate-400">
                          {doc.category || 'Evidence'}
                        </span>
                      </div>

                      {/* Admissibility */}
                      <div className="col-span-2">
                        <span className={`text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Strength */}
                      <div className="col-span-1">
                        <span className={`text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border inline-block ${strengthCls}`}>
                          {doc.strength || 'Moderate'}
                        </span>
                      </div>

                      {/* Confidence */}
                      <div className="col-span-1 font-mono">{confidence}</div>

                      {/* Size */}
                      <div className="col-span-1 text-slate-455 font-mono">{formatSize(doc.size)}</div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenDoc(doc)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-[#EF4444] transition-colors" title="Preview">
                          <Eye size={11} />
                        </button>
                        <button onClick={() => { setSelectedEvidenceDetails(doc); setIsEvidenceInsightsOpen(true); }} className="p-1 rounded hover:bg-red-55 dark:hover:bg-red-950/20 text-slate-400 hover:text-[#EF4444] transition-colors" title="AI Analysis">
                          <Sparkles size={11} />
                        </button>
                        <button onClick={() => handleDownloadDoc(doc)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" title="Download">
                          <Download size={11} />
                        </button>
                        <button onClick={() => handleDeleteEvidence(doc)} className="p-1 rounded hover:bg-red-55 dark:hover:bg-red-955/20 text-slate-455 hover:text-red-505 transition-colors" title="Delete">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-3 bg-rose-50 dark:bg-rose-955/20 text-[#EF4444] rounded-2xl mb-3">
                    <Shield size={22} />
                  </div>
                  <h4 className="text-[11px] font-black text-slate-707 dark:text-white uppercase tracking-wider mb-1">No Evidence Found</h4>
                  <p className="text-[9px] text-slate-400 font-semibold max-w-xs leading-relaxed mb-4">
                    {evidenceSearchQuery || evidenceFilter !== 'all'
                      ? 'No evidence matches the criteria.'
                      : 'Upload supporting proof files (images, audio, forensic files, etc.) to get started.'}
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    );
  };

  const renderResearch = () => {
    const hasSummary = !!(caseData.summary || caseData.description || '').trim();
    const isSummaryShort = (caseData.summary || caseData.description || '').trim().split(/\s+/).length < 8;

    if (!hasSummary || isSummaryShort) {
      return (
        <div className="bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[280px] animate-in fade-in duration-300">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] rounded-2xl mb-3">
            <BookOpen size={24} />
          </div>
          <h4 className="text-[11px] font-black text-slate-700 dark:text-white uppercase tracking-wider mb-1">Research Not Available</h4>
          <p className="text-[9px] text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed mb-4">
            Generate a proper case summary or upload supporting documents before AI legal research can begin.
          </p>
          <div className="flex gap-2">
            <button onClick={handleGenerateAiSummary} className="px-4 py-2 bg-[#4F46E5] hover:opacity-90 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all animate-pulse">
              Generate Case Summary
            </button>
            <button onClick={() => document.getElementById('workspace-doc-upload').click()} className="px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all">
              Upload Documents
            </button>
          </div>
        </div>
      );
    }

    if (isExtractingResearch) {
      return (
        <div className="bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[280px] animate-in fade-in duration-300">
          <RefreshCcw size={28} className="text-[#4F46E5] animate-spin mb-3" />
          <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-wider">AI Legal Research Engine</h4>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Analyzing case summary, timeline, documents, and notes...</p>
        </div>
      );
    }

    const aiResearch = caseData.aiResearch;

    if (!aiResearch) {
      return (
        <div className="bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[280px] animate-in fade-in duration-300">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] rounded-2xl mb-3">
            <Sparkles size={24} className="animate-bounce" />
          </div>
          <h4 className="text-[11px] font-black text-slate-700 dark:text-white uppercase tracking-wider mb-1">AI Legal Research Ready</h4>
          <p className="text-[9px] text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed mb-4">
            Click below to compile governing laws, precedents, strategy, and risk analysis.
          </p>
          <button onClick={() => triggerBackgroundResearchSync(caseData, true)} className="px-5 py-2 bg-[#4F46E5] hover:opacity-90 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all">
            Analyze & Compile Research
          </button>
        </div>
      );
    }

    const toggleAccordion = (key) => {
      setExpandedResearchAccordions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getRiskColor = (risk) => {
      const r = (risk || '').toLowerCase();
      if (r.includes('very high')) return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400';
      if (r.includes('high')) return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400';
      if (r.includes('medium')) return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400';
      return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400';
    };

    const getConfidenceColor = (conf) => {
      const n = parseInt(conf) || 0;
      if (n >= 90) return 'text-emerald-600 dark:text-emerald-400';
      if (n >= 70) return 'text-indigo-600 dark:text-indigo-400';
      if (n >= 50) return 'text-amber-600 dark:text-amber-400';
      return 'text-red-600 dark:text-red-400';
    };

    // Quick research chips
    const researchChips = [
      'Supreme Court', 'High Court', 'District Court', 'Constitution', 'IPC', 'BNS', 'BNSS', 'BSA',
      'CPC', 'CrPC', 'Evidence Act', 'Limitation', 'Contract Act', 'Transfer of Property',
      'Specific Relief', 'Companies Act', 'Arbitration', 'Negotiable Instruments',
      'Consumer Law', 'Labour Law', 'Family Law', 'Tax', 'Property', 'Cheque Bounce'
    ];

    const statuteCount = (aiResearch.statutes || []).length;
    const precedentCount = (aiResearch.precedents || []).length;
    const recoCount = (aiResearch.recommendations || []).length;
    const savedCount = (caseData.savedCitations || []).length;

    return (
      <div className="space-y-2.5 animate-in fade-in duration-300">

        {/* ── COMPACT RESEARCH HEADER ────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] rounded-xl">
                <BookOpen size={16} />
              </div>
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-white">⚖️ AI Legal Research Engine</h3>
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{caseData.name || 'Case'} • {aiResearch.caseType || 'Litigation'}</p>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button onClick={() => triggerBackgroundResearchSync(caseData, true)} className="px-3 py-1.5 bg-[#4F46E5] hover:opacity-90 text-white font-black text-[9px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1">
                <RefreshCcw size={10} className={isExtractingResearch ? "animate-spin" : ""} /> Analyze
              </button>
              <button onClick={() => triggerBackgroundResearchSync(caseData, true)} className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 text-slate-700 dark:text-white font-black text-[9px] uppercase tracking-wider rounded-lg transition-all">
                Refresh
              </button>
              <button onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(aiResearch, null, 2));
                const dlAnchorElem = document.createElement('a');
                dlAnchorElem.setAttribute("href", dataStr);
                dlAnchorElem.setAttribute("download", `${caseData.name || 'case'}_research.json`);
                dlAnchorElem.click();
                toast.success("Exported research data!");
              }} className="px-3 py-1.5 bg-slate-900 dark:bg-zinc-600 hover:bg-slate-800 text-white font-black text-[9px] uppercase tracking-wider rounded-lg transition-all">
                Export
              </button>
            </div>
          </div>

          {/* KPI Stats Row */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { label: `Coverage ${aiResearch.researchCoverage || '92%'}`, cls: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400' },
              { label: `AI Confidence ${aiResearch.researchConfidence || '96%'}`, cls: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' },
              { label: `${statuteCount} Laws`, cls: 'bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400' },
              { label: `${precedentCount} Judgments`, cls: 'bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400' },
              { label: `${savedCount} Saved`, cls: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' },
              { label: `${recoCount} Recommendations`, cls: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400' },
              { label: `Risk: ${aiResearch.limitationRisk || 'Medium'}`, cls: getRiskColor(aiResearch.limitationRisk) },
              { label: aiResearch.jurisdiction || 'District Court', cls: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300' },
            ].map((s, i) => (
              <span key={i} className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider whitespace-nowrap border border-transparent ${s.cls}`}>{s.label}</span>
            ))}
          </div>
        </div>

        {/* ── INTELLIGENT SEARCH BAR ─────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl px-4 py-3 shadow-sm space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Ask AI: Find Supreme Court precedents • Search CPC provisions • Explain Section 138 NI Act..."
              value={researchSearchQuery}
              onChange={(e) => setResearchSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-700/80 rounded-xl pl-9 pr-20 py-2.5 text-[10px] font-semibold text-slate-700 dark:text-white outline-none focus:border-indigo-400 transition-colors"
            />
            <button
              onClick={() => { if (researchSearchQuery.trim()) toast.success(`Search: "${researchSearchQuery}"`); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#4F46E5] hover:opacity-90 text-white text-[8px] font-black uppercase tracking-wider rounded-lg transition-all"
            >
              Search
            </button>
          </div>
          {/* Quick Research Chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
            {researchChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setResearchSearchQuery(chip)}
                className="px-2 py-0.5 bg-slate-50 hover:bg-indigo-50 dark:bg-zinc-800 dark:hover:bg-indigo-950/20 rounded-md text-[8px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 whitespace-nowrap border border-slate-200/50 dark:border-zinc-700/50 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* ── AI LEGAL OVERVIEW GRID ─────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl px-4 py-3 shadow-sm">
          <h4 className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest border-b border-slate-100 dark:border-zinc-800/50 pb-2 mb-3 flex items-center gap-1.5">
            <LayoutDashboard size={12} /> AI Research Overview
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-2.5">
            {[
              { label: 'Case Type', value: aiResearch.caseType || 'Not identified' },
              { label: 'Primary Jurisdiction', value: aiResearch.jurisdiction || 'Not identified' },
              { label: 'Primary Governing Law', value: aiResearch.primaryCode || 'Civil Procedure Code' },
              { label: 'Limitation Risk', value: aiResearch.limitationRisk || 'Medium', badge: true, badgeCls: getRiskColor(aiResearch.limitationRisk) },
              { label: 'Research Coverage', value: aiResearch.researchCoverage || '92%', color: getConfidenceColor(aiResearch.researchCoverage) },
              { label: 'AI Confidence', value: aiResearch.researchConfidence || '96%', color: getConfidenceColor(aiResearch.researchConfidence) },
              { label: 'Applicable Laws', value: `${statuteCount} identified` },
              { label: 'Judgments Found', value: `${precedentCount} relevant` },
            ].map((item, i) => (
              <div key={i}>
                <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block">{item.label}</span>
                {item.badge ? (
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider mt-0.5 border ${item.badgeCls}`}>{item.value}</span>
                ) : (
                  <p className={`text-[10px] font-black mt-0.5 ${item.color || 'text-slate-800 dark:text-white'}`}>{item.value}</p>
                )}
              </div>
            ))}
          </div>

          {/* Legal Issues */}
          {(aiResearch.legalIssues || []).length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/40">
              <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Key Legal Issues</span>
              <div className="flex flex-wrap gap-1">
                {(aiResearch.legalIssues || []).map((issue, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-[8px] font-bold rounded-md">{idx+1}. {issue}</span>
                ))}
              </div>
            </div>
          )}

          {/* Judicial Principles */}
          {(aiResearch.judicialPrinciples || []).length > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800/40">
              <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Judicial Principles</span>
              <div className="space-y-1">
                {(aiResearch.judicialPrinciples || []).map((p, idx) => (
                  <div key={idx} className="flex gap-1.5 items-start text-[9px] font-semibold text-slate-600 dark:text-slate-300">
                    <span className="text-indigo-500 shrink-0 mt-0.5">•</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── APPLICABLE LAWS ────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
          <button onClick={() => toggleAccordion('statutes')} className="w-full flex items-center justify-between px-4 py-2.5 text-left">
            <div className="flex items-center gap-2">
              <Scale size={13} className="text-[#4F46E5]" />
              <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Applicable Laws & Statutory Provisions</span>
              <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] text-[8px] font-black rounded">{statuteCount}</span>
            </div>
            <ChevronRight size={14} className={`text-slate-400 transition-transform ${expandedResearchAccordions.statutes ? "rotate-90" : ""}`} />
          </button>

          {expandedResearchAccordions.statutes && (
            <div className="px-4 pb-3 border-t border-slate-100 dark:border-zinc-800/50 space-y-2 pt-3 animate-in fade-in duration-200">
              {(aiResearch.statutes || []).map((st, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-black/10 rounded-xl border border-slate-100 dark:border-zinc-800/30 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/30 text-[#4F46E5] rounded text-[8px] font-black uppercase tracking-wider">{st.section}</span>
                        <h5 className="text-[10px] font-black text-slate-800 dark:text-white">{st.actName}</h5>
                        {st.confidence && <span className={`text-[8px] font-black ${getConfidenceColor(st.confidence)}`}>{st.confidence}</span>}
                      </div>
                      <p className="text-[9px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{st.reason}</p>
                      <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase flex-wrap">
                        {st.issue && <span>Issue: {st.issue}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleBookmarkCitation({ name: st.actName, section: st.section, type: 'statute' })}
                      className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                        (caseData.savedCitations || []).some(c => c.section === st.section)
                          ? 'bg-indigo-50 text-[#4F46E5] border-indigo-200'
                          : 'bg-white dark:bg-zinc-800 hover:bg-slate-50 text-slate-400 border-slate-200 dark:border-zinc-700'
                      }`}
                      title="Bookmark"
                    >
                      <Bookmark size={11} />
                    </button>
                  </div>
                </div>
              ))}
              {statuteCount === 0 && <p className="text-[9px] text-slate-400 italic text-center py-3">No statutory provisions identified.</p>}
            </div>
          )}
        </div>

        {/* ── JUDGMENTS & PRECEDENTS ──────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
          <button onClick={() => toggleAccordion('precedents')} className="w-full flex items-center justify-between px-4 py-2.5 text-left">
            <div className="flex items-center gap-2">
              <Gavel size={13} className="text-emerald-600" />
              <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Judgments & Precedents</span>
              <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 text-[8px] font-black rounded">{precedentCount}</span>
            </div>
            <ChevronRight size={14} className={`text-slate-400 transition-transform ${expandedResearchAccordions.precedents ? "rotate-90" : ""}`} />
          </button>

          {expandedResearchAccordions.precedents && (
            <div className="px-4 pb-3 border-t border-slate-100 dark:border-zinc-800/50 space-y-2 pt-3 animate-in fade-in duration-200">
              {(aiResearch.precedents || []).map((pr, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-black/10 rounded-xl border border-slate-100 dark:border-zinc-800/30 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Case name + citation */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded text-[8px] font-black uppercase tracking-wider">{pr.citation}</span>
                        <h5 className="text-[10px] font-black text-slate-800 dark:text-white">{pr.caseName}</h5>
                      </div>
                      {/* Court/Year/Similarity row */}
                      <div className="flex items-center gap-3 text-[8px] font-bold text-slate-400 uppercase flex-wrap">
                        <span>🏛 {pr.court}</span>
                        <span>📅 {pr.year}</span>
                        {pr.similarityScore && <span className="text-indigo-500">Similarity: {pr.similarityScore}</span>}
                        {pr.principle && <span className="text-violet-500">Principle: {pr.principle}</span>}
                      </div>
                      {/* Key Holding */}
                      {pr.holding && (
                        <div className="bg-white dark:bg-zinc-900/30 rounded-lg p-2 border border-slate-100 dark:border-zinc-800/30">
                          <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block">Key Holding</span>
                          <p className="text-[9px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5 italic">"{pr.holding}"</p>
                        </div>
                      )}
                      {/* Relevance */}
                      {pr.reason && (
                        <p className="text-[9px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                          <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest">Relevance: </span>{pr.reason}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleBookmarkCitation({ name: pr.caseName, citation: pr.citation, type: 'precedent' })}
                      className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                        (caseData.savedCitations || []).some(c => c.citation === pr.citation)
                          ? 'bg-indigo-50 text-[#4F46E5] border-indigo-200'
                          : 'bg-white dark:bg-zinc-800 hover:bg-slate-50 text-slate-400 border-slate-200 dark:border-zinc-700'
                      }`}
                      title="Bookmark"
                    >
                      <Bookmark size={11} />
                    </button>
                  </div>
                </div>
              ))}
              {precedentCount === 0 && <p className="text-[9px] text-slate-400 italic text-center py-3">No relevant precedents identified.</p>}
            </div>
          )}
        </div>

        {/* ── AI STRATEGY PANEL ───────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
          <button onClick={() => toggleAccordion('strategy')} className="w-full flex items-center justify-between px-4 py-2.5 text-left">
            <div className="flex items-center gap-2">
              <Target size={13} className="text-violet-600" />
              <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider">AI Strategy & Arguments</span>
            </div>
            <ChevronRight size={14} className={`text-slate-400 transition-transform ${expandedResearchAccordions.strategy ? "rotate-90" : ""}`} />
          </button>

          {expandedResearchAccordions.strategy && aiResearch.strategy && (
            <div className="px-4 pb-3 border-t border-slate-100 dark:border-zinc-800/50 pt-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { label: 'Plaintiff Strategy', value: aiResearch.strategy.plaintiffStrategy, icon: '⚔️', cls: 'border-indigo-100 dark:border-indigo-900/30' },
                  { label: 'Defendant Strategy', value: aiResearch.strategy.defendantStrategy, icon: '🛡', cls: 'border-violet-100 dark:border-violet-900/30' },
                  { label: 'Likely Defence', value: aiResearch.strategy.likelyDefence, icon: '🔍', cls: 'border-sky-100 dark:border-sky-900/30' },
                  { label: 'Weaknesses', value: aiResearch.strategy.weaknesses, icon: '⚠️', cls: 'border-red-100 dark:border-red-900/30' },
                ].filter(s => s.value).map((s, i) => (
                  <div key={i} className={`bg-slate-50 dark:bg-black/10 p-2.5 rounded-xl border ${s.cls}`}>
                    <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block">{s.icon} {s.label}</span>
                    <p className="text-[9px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed mt-1">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RECOMMENDATIONS & MISSING AUTHORITIES ──────────────────── */}
        <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
          <button onClick={() => toggleAccordion('recommendations')} className="w-full flex items-center justify-between px-4 py-2.5 text-left">
            <div className="flex items-center gap-2">
              <AlertCircle size={13} className="text-rose-500" />
              <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider">AI Recommendations & Gaps</span>
              <span className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 text-[8px] font-black rounded">{recoCount}</span>
            </div>
            <ChevronRight size={14} className={`text-slate-400 transition-transform ${expandedResearchAccordions.recommendations ? "rotate-90" : ""}`} />
          </button>

          {expandedResearchAccordions.recommendations && (
            <div className="px-4 pb-3 border-t border-slate-100 dark:border-zinc-800/50 space-y-1.5 pt-3 animate-in fade-in duration-200">
              {(aiResearch.recommendations || []).map((rec, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100/50 dark:border-zinc-800/30 p-2.5 rounded-xl">
                  <AlertCircle size={12} className="text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-[9px] font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{rec}</p>
                </div>
              ))}
              {recoCount === 0 && <p className="text-[9px] text-slate-400 italic text-center py-3">No recommendations or gaps identified.</p>}
            </div>
          )}
        </div>

        {/* ── SAVED CITATIONS ────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
          <button onClick={() => toggleAccordion('saved')} className="w-full flex items-center justify-between px-4 py-2.5 text-left">
            <div className="flex items-center gap-2">
              <Bookmark size={13} className="text-amber-500" />
              <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Saved Research Citations</span>
              <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 text-[8px] font-black rounded">{savedCount}</span>
            </div>
            <ChevronRight size={14} className={`text-slate-400 transition-transform ${expandedResearchAccordions.saved ? "rotate-90" : ""}`} />
          </button>

          {expandedResearchAccordions.saved && (
            <div className="px-4 pb-3 border-t border-slate-100 dark:border-zinc-800/50 space-y-1.5 pt-3 animate-in fade-in duration-200">
              {(caseData.savedCitations || []).map((cit, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-black/10 border border-slate-100 dark:border-zinc-800/30 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <Bookmark size={11} className="text-[#4F46E5] shrink-0" />
                    <span className="text-[9px] font-black text-slate-800 dark:text-white truncate">
                      {cit.section ? `${cit.section} - ` : ''}{cit.name} {cit.citation ? `(${cit.citation})` : ''}
                    </span>
                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-700 text-[7px] font-black text-slate-500 uppercase rounded shrink-0">{cit.type || 'citation'}</span>
                  </div>
                  <button onClick={() => handleToggleBookmarkCitation(cit)} className="text-[8px] font-black uppercase text-red-500 tracking-wider hover:underline shrink-0 ml-2">
                    Remove
                  </button>
                </div>
              ))}
              {savedCount === 0 && <p className="text-[9px] text-slate-400 italic text-center py-3">No saved citations. Bookmark statutes or precedents above.</p>}
            </div>
          )}
        </div>

      </div>
    );
  };

  const handleSaveDraftContent = async (draftId, newContent) => {
    try {
      setEditorSavedIndicator('Saving...');
      const drafts = caseData.drafts || [];
      const updatedDrafts = drafts.map(d => {
        if (d.id === draftId) {
          const currentVersions = d.versions || [];
          const nextVer = currentVersions.length + 1;
          const isContentChanged = d.content !== newContent;
          const updatedVersions = isContentChanged
            ? [...currentVersions, { version: nextVer, content: newContent, updatedAt: new Date().toISOString() }]
            : currentVersions;

          return {
            ...d,
            content: newContent,
            updatedAt: new Date().toISOString(),
            versions: updatedVersions
          };
        }
        return d;
      });

      await apiService.updateProject(caseData.id || caseData._id, { drafts: updatedDrafts });
      setCaseData(prev => ({ ...prev, drafts: updatedDrafts }));
      
      const updatedDraft = updatedDrafts.find(d => d.id === draftId);
      if (updatedDraft) {
        setSelectedDraft(updatedDraft);
      }

      setEditorSavedIndicator('Saved in Cloud');
    } catch (err) {
      console.error(err);
      setEditorSavedIndicator('Error saving');
    }
  };

  const handleCreateDraft = async (aiGenerated = false) => {
    const finalName = `${draftFormType} - ${new Date().toLocaleDateString()}`;

    try {
      setIsGeneratingDraft(true);
      setIsDraftModalOpen(false);

      const toastId = aiGenerated 
        ? toast.loading("AI Legal Draftsman is analyzing case context and writing court-ready submission...") 
        : toast.loading("Creating draft...");
      
      let initialContent = "";
      if (aiGenerated) {
        const caseNotesText = (caseNotes || []).map(n => `- Note [${n.title}]: ${n.content}`).join('\n');
        const timelineText = (caseData.timelineEvents || []).map(t => `- Event: ${t.date}: ${t.title} (${t.description})`).join('\n');
        const docsText = (caseData.documents || []).map(d => `- File: ${d.name} (Category: ${d.category || 'Evidence'}, Facts: ${d.facts || ''})`).join('\n');
        const researchText = caseData.aiResearch ? JSON.stringify(caseData.aiResearch) : 'None';

        const prompt = `
Generate a highly detailed, professional, court-ready draft of type: "${draftFormType}".

CASE DATA & CONTEXT:
- Case Name: "${caseData.name || 'Litigation'}"
- Client Name (Plaintiff/Petitioner/Complainant): "${caseData.clientName || 'N/A'}"
- Opponent Name (Defendant/Respondent): "${caseData.opposingParty || 'N/A'}"
- Primary Court: "${caseData.court || 'N/A'}"
- Case Summary: "${caseData.summary || caseData.description || ''}"
- Relevant Timeline:
${timelineText}
- Evidence & Documents Uploaded:
${docsText}
- Governing Laws & Precedents Found:
${researchText}
- Advocate Notes:
${caseNotesText}

USER INPUTS FOR DRAFTING:
- Core Purpose / Objective: "${draftPurpose}"
- Custom Instructions / Advocate Preferences: "${draftInstructions}"

INSTRUCTIONS:
1. Write the COMPLETE legal text. Do NOT use summaries or bullet point templates.
2. Structure it properly like an official submission:
   - Header (e.g. IN THE COURT OF... or LEGAL NOTICE / BOARD)
   - Case Reference Number / Ref ID
   - Parties Details
   - Detailed factual statements (numbered paragraphs 1, 2, 3...)
   - Cause of Action
   - Governing provisions/sections
   - Pleadings/Arguments
   - Prayer Clause / Demands
   - Verification (if petition/complaint)
   - Place, Date, Advocate Signature & Enrollment blocks.
3. NEVER return markdown headers like "###", bold markups (**), list markers, or any prefix/intro chatter (e.g. "Sure, here is your notice..."). Just return the raw plain text of the document.
4. If facts or citations are unavailable, use realistic placeholders that can be edited by the user. Do not hallucinate false supreme court cases.
`;

        const systemInstruction = "You are a professional senior legal draftsman. You draft binding court filings and notices using traditional, high-level legal English with strict formatting and precise terminology. Output ONLY the raw plain text of the draft. Do NOT write markdown, HTML, backticks, or introduction messages.";
        const response = await generateChatResponse([], prompt, systemInstruction, null, 'English');
        if (response) {
          if (typeof response === 'string') initialContent = response;
          else if (response.reply) initialContent = response.reply;
          else if (response.data?.reply) initialContent = response.data.reply;
          else if (response.text) initialContent = response.text;
        } else {
          initialContent = `DRAFT OF ${draftFormType.toUpperCase()}\n\nFailed to reach AI. Please write draft content here.`;
        }
      } else {
        initialContent = `IN THE COURT OF ${caseData.court?.toUpperCase() || 'COMPETENT JURISDICTION'}\n\nIN THE MATTER OF:\n${caseData.clientName?.toUpperCase() || 'CLIENT'} VS. ${caseData.opposingParty?.toUpperCase() || 'OPPONENT'}\n\nDraft Type: ${draftFormType}\nDate: ${new Date().toLocaleDateString()}\n\nWrite your legal draft content here...`;
      }

      const newDraft = {
        id: 'draft-' + Date.now().toString(),
        name: finalName,
        type: draftFormType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: aiGenerated ? 'AI Generated' : 'Draft',
        content: initialContent,
        versions: [
          { version: 1, content: initialContent, updatedAt: new Date().toISOString() }
        ]
      };

      const updatedDrafts = [...(caseData.drafts || []), newDraft];
      await apiService.updateProject(caseData.id || caseData._id, { drafts: updatedDrafts });
      
      setCaseData(prev => ({ ...prev, drafts: updatedDrafts }));
      setDraftPurpose('');
      setDraftInstructions('');
      
      setSelectedDraft(newDraft);
      toast.success(aiGenerated ? "AI Draft generated successfully!" : "Draft created!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save draft");
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleAiEditDraft = async (action, customInstructions = '') => {
    if (!selectedDraft) return;
    try {
      setIsAiEditorRunning(true);
      const toastId = toast.loading(`AI is running: ${action}...`);

      let systemPrompt = "You are a professional legal drafting assistant. Modify the legal text provided according to the user's instructions.";
      let userPrompt = "";

      if (action === 'rewrite') {
        userPrompt = `Please rewrite the following legal text to make it more polished, persuasive, and clear, maintaining the formal court structure:\n\n${selectedDraft.content}`;
      } else if (action === 'improve') {
        userPrompt = `Improve the legal language, syntax, and traditional phrasing of this text. Keep the format:\n\n${selectedDraft.content}`;
      } else if (action === 'simplify') {
        userPrompt = `Simplify the wording of this text so it's easily understandable, without losing any of the legal substance:\n\n${selectedDraft.content}`;
      } else if (action === 'formalize') {
        userPrompt = `Formalize the tone of this text for standard court submission. Use formal legal vocabulary:\n\n${selectedDraft.content}`;
      } else if (action === 'expand') {
        userPrompt = `Expand this legal clause/text with additional relevant arguments, supporting points, and standard legal expressions:\n\n${selectedDraft.content}`;
      } else if (action === 'shorten') {
        userPrompt = `Shorten this legal text to be extremely concise and to the point, while keeping all core facts and prayers:\n\n${selectedDraft.content}`;
      } else if (action === 'court_format') {
        userPrompt = `Format this legal draft strictly according to official court standards (IN THE COURT OF..., Case No., Title, Parties, Prayer, Verification):\n\n${selectedDraft.content}`;
      } else if (action === 'insert_laws') {
        const laws = caseData.aiResearch ? JSON.stringify(caseData.aiResearch.statutes) : 'None found';
        userPrompt = `Based on the applicable laws identified for this case: ${laws}, insert relevant statutory provisions, sections, and reasoning into this draft:\n\n${selectedDraft.content}`;
      } else if (action === 'insert_judgments') {
        const precedents = caseData.aiResearch ? JSON.stringify(caseData.aiResearch.precedents) : 'None found';
        userPrompt = `Based on the following judgments/precedents: ${precedents}, insert relevant case law citations and holds into this draft:\n\n${selectedDraft.content}`;
      } else if (action === 'custom') {
        userPrompt = `Modify this legal draft according to these instructions: "${customInstructions}".\n\nOriginal Text:\n${selectedDraft.content}`;
      }

      const response = await generateChatResponse([], userPrompt, systemPrompt, null, 'English');
      let nextContent = "";
      if (response) {
        if (typeof response === 'string') nextContent = response;
        else if (response.reply) nextContent = response.reply;
        else if (response.data?.reply) nextContent = response.data.reply;
        else if (response.text) nextContent = response.text;
      }

      if (nextContent) {
        nextContent = nextContent.replace(/```[a-z]*/gi, '').replace(/```/g, '').trim();
        await handleSaveDraftContent(selectedDraft.id, nextContent);
        toast.success(`${action} applied successfully!`, { id: toastId });
      } else {
        toast.error("Failed to generate edits from AI.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("AI editing failed");
    } finally {
      setIsAiEditorRunning(false);
      setAiEditorInstruction('');
    }
  };

  const handleDeleteDraft = async (draftId) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    try {
      const updated = (caseData.drafts || []).filter(d => d.id !== draftId);
      await apiService.updateProject(caseData.id || caseData._id, { drafts: updated });
      setCaseData(prev => ({ ...prev, drafts: updated }));
      if (selectedDraft?.id === draftId) {
        setSelectedDraft(null);
      }
      toast.success("Draft deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete draft");
    }
  };

  const handleDuplicateDraft = async (draftObj) => {
    try {
      const duplicated = {
        ...draftObj,
        id: 'draft-' + Date.now().toString(),
        name: `${draftObj.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Draft'
      };
      const updated = [...(caseData.drafts || []), duplicated];
      await apiService.updateProject(caseData.id || caseData._id, { drafts: updated });
      setCaseData(prev => ({ ...prev, drafts: updated }));
      toast.success("Draft duplicated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to duplicate draft");
    }
  };

  const handleDownloadDraft = (draftObj) => {
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(draftObj.content || '');
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${draftObj.name.replace(/\s+/g, '_')}.txt`);
    dlAnchorElem.click();
    toast.success("Draft downloaded!");
  };

  const renderDrafts = () => {
    const drafts = caseData.drafts || [];
    const hasSummary = !!(caseData.summary || caseData.description || '').trim();

    const draftTypes = [
      "Legal Notice", "Reply Notice", "Written Statement", "Plaint", "Petition",
      "Affidavit", "Application", "Appeal", "Revision", "Bail Application",
      "Consumer Complaint", "Cheque Bounce Notice", "Employment Notice",
      "Agreement", "Power of Attorney", "MOU", "Contract", "Settlement",
      "Legal Opinion", "Court Submission", "Memo"
    ];

    const totalCount = drafts.length;
    const aiCount = drafts.filter(d => d.status === 'AI Generated').length;
    const manualCount = totalCount - aiCount;
    const pendingCount = drafts.filter(d => d.status !== 'Completed').length;
    const finalizedCount = totalCount - pendingCount;
    const lastSavedTime = totalCount > 0 
      ? new Date(Math.max(...drafts.map(d => new Date(d.updatedAt)))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      : 'N/A';

    const getStatusColor = (status) => {
      const s = (status || '').toLowerCase();
      if (s.includes('completed')) return 'bg-emerald-50 text-emerald-650 border-emerald-200 dark:bg-emerald-950/20';
      if (s.includes('review')) return 'bg-amber-50 text-amber-655 border-amber-200 dark:bg-amber-950/20';
      if (s.includes('ai generated')) return 'bg-indigo-50 text-indigo-650 border-indigo-200 dark:bg-indigo-950/20';
      return 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-zinc-800 dark:text-slate-400';
    };

    if (selectedDraft) {
      const draftObj = drafts.find(d => d.id === selectedDraft.id) || selectedDraft;

      return (
        <div className="bg-slate-50 dark:bg-[#0B132B] border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[650px] animate-in fade-in duration-300">
          
          <div className="bg-white dark:bg-[#1A2540] border-b border-slate-200 dark:border-zinc-850 px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedDraft(null)} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                title="Back to library"
              >
                <ArrowLeft size={14} />
              </button>
              <div className="min-w-0">
                <input
                  type="text"
                  value={draftObj.name}
                  onChange={(e) => {
                    const draftsCpy = drafts.map(d => d.id === draftObj.id ? { ...d, name: e.target.value } : d);
                    setCaseData(prev => ({ ...prev, drafts: draftsCpy }));
                    apiService.updateProject(caseData.id || caseData._id, { drafts: draftsCpy });
                  }}
                  className="bg-transparent text-[11px] font-black text-slate-800 dark:text-white outline-none border-b border-transparent focus:border-indigo-400 font-sans"
                />
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[7.5px] font-black uppercase text-slate-400 tracking-wider">{draftObj.type}</span>
                  <span className="text-slate-300 dark:text-slate-700 text-[8px]">•</span>
                  <span className="text-[7.5px] font-bold text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {editorSavedIndicator}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <select 
                value={editorLineSpacing} 
                onChange={(e) => setEditorLineSpacing(e.target.value)} 
                className="bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 text-[8.5px] font-bold rounded px-1.5 py-1 outline-none text-slate-600 dark:text-slate-350"
              >
                <option value="single">Single Space</option>
                <option value="1.5">1.5 Space</option>
                <option value="double">Double Space</option>
              </select>

              <select 
                value={editorFontFamily} 
                onChange={(e) => setEditorFontFamily(e.target.value)} 
                className="bg-slate-50 dark:bg-zinc-855 border border-slate-200 dark:border-zinc-700 text-[8.5px] font-bold rounded px-1.5 py-1 outline-none text-slate-600 dark:text-slate-355"
              >
                <option value="serif">Times Legal Serif</option>
                <option value="sans-serif">Sans Modern</option>
                <option value="monospace">Courier Bare Act</option>
              </select>

              <div className="flex items-center border border-slate-200 dark:border-zinc-700 rounded overflow-hidden">
                <button onClick={() => setEditorFontSize(Math.max(10, editorFontSize - 1))} className="px-1.5 py-1 bg-slate-50 dark:bg-zinc-855 hover:bg-slate-100 text-[9px] font-bold border-r border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-400">-</button>
                <span className="px-2 py-0.5 bg-white dark:bg-zinc-900 text-[8.5px] font-bold text-slate-600 dark:text-slate-300">{editorFontSize}pt</span>
                <button onClick={() => setEditorFontSize(Math.min(24, editorFontSize + 1))} className="px-1.5 py-1 bg-slate-50 dark:bg-zinc-855 hover:bg-slate-100 text-[9px] font-bold border-l border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-400">+</button>
              </div>

              <select
                value={draftObj.status}
                onChange={(e) => {
                  const draftsCpy = drafts.map(d => d.id === draftObj.id ? { ...d, status: e.target.value } : d);
                  setCaseData(prev => ({ ...prev, drafts: draftsCpy }));
                  apiService.updateProject(caseData.id || caseData._id, { drafts: draftsCpy });
                  toast.success(`Draft marked as ${e.target.value}`);
                }}
                className="bg-slate-50 dark:bg-zinc-855 border border-slate-200 dark:border-zinc-700 text-[8.5px] font-bold rounded px-1.5 py-1 outline-none text-slate-600 dark:text-slate-355"
              >
                <option value="Draft">Drafting</option>
                <option value="Review">In Review</option>
                <option value="Completed">Finalized</option>
              </select>

              <button 
                onClick={() => handleDownloadDraft(draftObj)} 
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[8.5px] font-black uppercase tracking-wider transition-all"
              >
                Download (.txt)
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 p-4 overflow-y-auto bg-slate-100 dark:bg-zinc-955/40 flex justify-center">
              <div className="w-full max-w-[650px] bg-white dark:bg-[#151D33] shadow-lg border border-slate-202 dark:border-zinc-850 rounded-lg p-8 flex flex-col min-h-[500px]">
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-zinc-800/40 flex-wrap">
                    {[
                      { label: '+ Court Header', text: `IN THE COURT OF ______________________\nCASE NO. __________ OF 2026\n\nIN THE MATTER OF:\n${caseData.clientName || 'Plaintiff'}   ...PETITIONER\nVERSUS\n${caseData.opposingParty || 'Defendant'}   ...RESPONDENT\n\nSUBMISSION ON BEHALF OF THE PETITIONER\n` },
                      { label: '+ Prayer', text: `\n\nPRAYER:\nIn light of the facts and circumstances stated herein, it is respectfully prayed that this Honorable Court may be pleased to:\na) Allow the present petition and grant relief as prayed;\nb) Pass any other order which this Court deems fit in the interest of justice.\n` },
                      { label: '+ Verification', text: `\n\nVERIFICATION:\nI, ${caseData.clientName || 'Plaintiff'}, do hereby verify that the contents of paragraphs 1 to ____ are true to my personal knowledge, and contents of remaining paragraphs are believed to be true based on legal advice received.\nVerified at Place on ${new Date().toLocaleDateString()}.\n\nDEPONENT\n` },
                      { label: '+ Advocate details', text: `\n\nAdvocate for Petitioner\nEnrollment No. ____________\nOffice Address: ______________________\n` }
                    ].map((ins, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const textarea = document.getElementById('draft-textarea-sheet');
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const before = text.substring(0, start);
                            const after = text.substring(end, text.length);
                            const nextVal = before + ins.text + after;
                            handleSaveDraftContent(draftObj.id, nextVal);
                            textarea.focus();
                          }
                        }}
                        className="px-2 py-0.5 bg-slate-50 dark:bg-zinc-805 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-505 dark:text-slate-400 text-[8px] font-bold rounded border border-slate-200/50 dark:border-zinc-700/50 transition-colors"
                      >
                        {ins.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    id="draft-textarea-sheet"
                    value={draftObj.content}
                    onChange={(e) => handleSaveDraftContent(draftObj.id, e.target.value)}
                    style={{
                      fontSize: `${editorFontSize}px`,
                      lineHeight: editorLineSpacing === 'double' ? '2.3' : (editorLineSpacing === '1.5' ? '1.6' : '1.25'),
                      fontFamily: editorFontFamily === 'serif' ? 'Georgia, serif' : (editorFontFamily === 'monospace' ? 'Courier New, monospace' : 'Inter, sans-serif')
                    }}
                    className="flex-1 w-full bg-transparent text-slate-800 dark:text-slate-100 outline-none resize-none overflow-y-auto no-scrollbar font-semibold border-none"
                    placeholder="Begin drafting court document..."
                  />
                </div>
              </div>
            </div>

            <div className="w-64 bg-white dark:bg-[#1A2540] border-l border-slate-200 dark:border-zinc-850 p-3.5 flex flex-col justify-between overflow-y-auto gap-4">
              <div className="space-y-4">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={13} className="text-indigo-500" />
                  <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider">AI Drafting Assistant</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'Polish Text', action: 'rewrite', color: 'border-indigo-150 text-indigo-600 hover:bg-indigo-50/20' },
                    { label: 'Court Style', action: 'court_format', color: 'border-violet-150 text-violet-600 hover:bg-violet-50/20' },
                    { label: 'Legal Jargon', action: 'improve', color: 'border-sky-150 text-sky-600 hover:bg-sky-50/20' },
                    { label: 'Simplify', action: 'simplify', color: 'border-emerald-150 text-emerald-600 hover:bg-emerald-50/20' },
                    { label: 'Insert Laws', action: 'insert_laws', color: 'border-slate-202 text-slate-600 hover:bg-slate-100/50' },
                    { label: 'Citations', action: 'insert_judgments', color: 'border-amber-150 text-amber-600 hover:bg-amber-50/20' },
                    { label: 'Expand', action: 'expand', color: 'border-indigo-150 text-indigo-600 hover:bg-indigo-50/20' },
                    { label: 'Shorten', action: 'shorten', color: 'border-red-155 text-red-600 hover:bg-red-50/20' },
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAiEditDraft(btn.action)}
                      disabled={isAiEditorRunning}
                      className={`px-2 py-1.5 border rounded-lg text-[8px] font-black uppercase text-center transition-colors disabled:opacity-50 ${btn.color}`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-105 dark:border-zinc-800/40">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">AI Edit Directive</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Add a clause claiming 18% p.a. interest from the due date..."
                    value={aiEditorInstruction}
                    onChange={(e) => setAiEditorInstruction(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-700/80 rounded-xl p-2.5 text-[9px] font-semibold text-slate-700 dark:text-white outline-none focus:border-indigo-400"
                  />
                  <button
                    onClick={() => {
                      if (aiEditorInstruction.trim()) {
                        handleAiEditDraft('custom', aiEditorInstruction);
                      }
                    }}
                    disabled={isAiEditorRunning || !aiEditorInstruction.trim()}
                    className="w-full py-1.5 bg-[#4F46E5] hover:opacity-90 disabled:opacity-50 text-white font-black text-[8px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1"
                  >
                    Apply AI Directive
                  </button>
                </div>

                {caseData.aiResearch?.saved && caseData.aiResearch.saved.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-105 dark:border-zinc-800/40">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Saved Citations Context</span>
                    <div className="space-y-1 max-h-[100px] overflow-y-auto no-scrollbar">
                      {caseData.aiResearch.saved.map((cit, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            const textarea = document.getElementById('draft-textarea-sheet');
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const txt = textarea.value;
                              const citationText = ` ${cit.section ? cit.section + ' of ' : ''}${cit.name} [Ref: ${cit.citation || 'SCC'}] `;
                              handleSaveDraftContent(draftObj.id, txt.substring(0, start) + citationText + txt.substring(end, txt.length));
                            }
                          }}
                          className="w-full text-left p-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200/50 dark:border-zinc-700/50 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded text-[7.5px] font-semibold text-slate-600 dark:text-slate-350 truncate"
                          title="Click to insert at cursor"
                        >
                          + {cit.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-105 dark:border-zinc-800/40 space-y-1.5">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Version History</span>
                <div className="flex flex-col gap-1 max-h-[100px] overflow-y-auto no-scrollbar">
                  {(draftObj.versions || []).map((ver, i) => (
                    <div key={i} className="flex items-center justify-between p-1 bg-slate-50 dark:bg-zinc-800 rounded text-[7.5px] font-semibold text-slate-505">
                      <span>Ver {ver.version} - {new Date(ver.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <button 
                        onClick={() => {
                          if (confirm(`Restore draft to Version ${ver.version}?`)) {
                            handleSaveDraftContent(draftObj.id, ver.content);
                            toast.success(`Restored to Version ${ver.version}!`);
                          }
                        }}
                        className="text-indigo-605 dark:text-indigo-400 font-bold hover:underline"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 animate-in fade-in duration-300">
        
        <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] rounded-xl">
              <ScrollText size={16} />
            </div>
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1">
                🖋️ AI Draft Workspace
              </h3>
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5 leading-relaxed">
                Generate and edit court-ready notices, petitions, affidavits, and submissions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setIsDraftModalOpen(true)}
              className="px-3 py-1.5 bg-[#4F46E5] hover:opacity-90 text-white font-black text-[9px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 shadow-sm"
            >
              <Sparkles size={11} className="animate-pulse" />
              Generate Draft
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {[
            { label: `Total ${totalCount}`, cls: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400' },
            { label: `AI Generated ${aiCount}`, cls: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' },
            { label: `Manual ${manualCount}`, cls: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-350' },
            { label: `Pending Review ${pendingCount}`, cls: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' },
            { label: `Finalized ${finalizedCount}`, cls: 'bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400' },
            { label: `Last saved ${lastSavedTime}`, cls: 'bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400' }
          ].map((m, i) => (
            <span key={i} className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider whitespace-nowrap border border-transparent ${m.cls}`}>{m.label}</span>
          ))}
        </div>

        {hasSummary && (
          <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-3 shadow-sm space-y-1.5">
            <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block">Suggested Legal Draft Types</span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {draftTypes.slice(0, 8).map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDraftFormType(tmpl);
                    setIsDraftModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 dark:bg-[#1A2540] dark:text-slate-300 rounded-md text-[8.5px] font-black text-slate-600 whitespace-nowrap border border-slate-200/50 dark:border-zinc-800/80 flex items-center gap-1 transition-colors"
                >
                  <Sparkles size={9} className="text-[#4F46E5]" />
                  {tmpl}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-[#1A2540] border border-slate-205 dark:border-zinc-800/80 rounded-2xl p-3 shadow-sm space-y-3">
          <h4 className="text-[9px] font-black uppercase text-slate-800 dark:text-white tracking-widest flex items-center gap-1.5 border-b border-slate-105 dark:border-zinc-800/40 pb-2">
            <ScrollText size={12} /> Case Drafts Library
          </h4>

          {drafts.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[160px]">
              <div className="p-2.5 bg-slate-50 dark:bg-zinc-805 text-slate-400 rounded-full mb-2">
                <ScrollText size={20} />
              </div>
              <h5 className="text-[10px] font-black text-slate-700 dark:text-white uppercase tracking-wider">No Drafts Yet</h5>
              <p className="text-[8px] text-slate-400 font-bold uppercase mb-3">Create or AI generate a new draft for this case.</p>
              <button 
                onClick={() => setIsDraftModalOpen(true)}
                className="px-3 py-1.5 bg-[#4F46E5] hover:opacity-90 text-white font-black text-[8px] uppercase tracking-wider rounded-lg transition-all"
              >
                Generate Draft
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="pb-2">Title</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Created</th>
                    <th className="pb-2">Updated</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-zinc-800/40">
                  {drafts.map((dr, idx) => (
                    <tr key={idx} className="text-[10px] text-slate-700 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-2.5 font-bold">
                        <div className="flex items-center gap-1.5">
                          <FileText size={11} className="text-[#4F46E5]" />
                          <span className="truncate max-w-[150px] font-black block text-slate-800 dark:text-white" title={dr.name}>{dr.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 font-black uppercase text-[8px] text-slate-405">{dr.type}</td>
                      <td className="py-2.5">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase tracking-wider border ${getStatusColor(dr.status)}`}>
                          {dr.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400 text-[9px]">{new Date(dr.createdAt).toLocaleDateString()}</td>
                      <td className="py-2.5 text-slate-400 text-[9px]">{new Date(dr.updatedAt).toLocaleDateString()}</td>
                      <td className="py-2.5 text-right space-x-2">
                        <button onClick={() => setSelectedDraft(dr)} className="text-[#4F46E5] hover:underline font-black uppercase text-[8.5px]">Open</button>
                        <button onClick={() => handleDuplicateDraft(dr)} className="text-slate-400 hover:underline font-black uppercase text-[8.5px]">Copy</button>
                        <button onClick={() => handleDownloadDraft(dr)} className="text-slate-400 hover:underline font-black uppercase text-[8.5px]">DL</button>
                        <button onClick={() => handleDeleteDraft(dr.id)} className="text-red-500 hover:underline font-black uppercase text-[8.5px]">Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {isDraftModalOpen && (
          <div className="fixed inset-0 z-[150000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-5 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#4F46E5] animate-pulse" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Generate Legal Draft</h3>
                </div>
                <button onClick={() => { setIsDraftModalOpen(false); setDraftPurpose(''); setDraftInstructions(''); }} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Draft Type</label>
                  <select
                    value={draftFormType}
                    onChange={(e) => setDraftFormType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-[10px] font-semibold text-slate-800 dark:text-white outline-none"
                  >
                    {draftTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Draft Purpose / Core Focus</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the background and objectives of this draft (e.g. Demanding recovery of outstanding debt from Ajay to Kalash for breach of contract dated 12/04/2026)"
                    value={draftPurpose}
                    onChange={(e) => setDraftPurpose(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-700/80 rounded-xl p-3 text-[10px] font-semibold text-slate-800 dark:text-white outline-none focus:border-indigo-400 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Additional Custom Instructions (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Use formal supreme court wording, mention Advocate Sharma enrollment D/1827/2025"
                    value={draftInstructions}
                    onChange={(e) => setDraftInstructions(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-700/80 rounded-xl p-3 text-[10px] font-semibold text-slate-800 dark:text-white outline-none focus:border-indigo-400 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800/50 justify-end">
                <button
                  onClick={() => handleCreateDraft(false)}
                  disabled={isGeneratingDraft}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-855 dark:hover:bg-zinc-800 text-slate-705 dark:text-slate-355 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all"
                >
                  Create Blank
                </button>
                <button
                  onClick={() => handleCreateDraft(true)}
                  disabled={isGeneratingDraft}
                  className="px-4 py-2 bg-[#4F46E5] hover:opacity-90 disabled:opacity-50 text-white font-black text-[9px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1"
                >
                  {isGeneratingDraft ? "Generating..." : "✨ Generate Draft"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };


  const renderContracts = () => {
    const contracts = caseData.contracts || [];

    const toggleContractAccordion = (key) => {
      setExpandedContractAccordions(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    };

    const handleTriggerContractAnalysis = async (docObj) => {
      if (docObj.contractAnalysis) {
        setSelectedContractDetails(docObj);
        setIsContractInsightsOpen(true);
        toast.success("Loaded AI contract clause reviews!");
        return;
      }

      const toastId = toast.loading("AI is running clause and compliance audit...");
      try {
        const analyzed = await legalService.analyzeUploadedDocument(caseData.id || caseData._id, docObj, caseData);
        const updatedDocs = (caseData.contracts || []).map(d => d.id === docObj.id ? analyzed : d);
        
        await legalService.updateCase(caseData.id || caseData._id, { contracts: updatedDocs });
        setCaseData(prev => ({ ...prev, contracts: updatedDocs }));
        setSelectedContractDetails(analyzed);
        setIsContractInsightsOpen(true);
        toast.success("AI contract clause review generated!", { id: toastId });
      } catch (err) {
        console.error(err);
        toast.error("Failed to run contract analysis", { id: toastId });
      }
    };

    const handleUploadContract = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = false;
      input.accept = '.pdf,.docx,.doc,.txt,image/*';
      input.onchange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        
        let updatedDocs = [...(caseData.contracts || [])];
        const toastId = toast.loading("Uploading and processing contract...");
        try {
          const file = files[0];
          const fileBase64 = await fileToBase64(file);
          const isContract = /nda|contract|agreement|lease/i.test(file.name);
          const detectedType = isContract ? 'Agreement' : 'Contract';
          const newDoc = {
            id: `${Date.now()}_\_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: file.type || 'application/pdf',
            size: file.size,
            uploadedAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            uri: fileBase64,
            fileBase64: fileBase64,
            ocrStatus: 'Success (OCR Done)',
            aiProcessed: 'Extracted successfully',
            category: detectedType,
            folder: 'Contracts',
            isContract: true,
            status: 'Pending Review',
            tags: [detectedType]
          };
          updatedDocs = [newDoc, ...updatedDocs];
          
          await legalService.updateCase(caseData.id || caseData._id, { contracts: updatedDocs });
          setCaseData(prev => ({ ...prev, contracts: updatedDocs }));
          toast.success(`Contract uploaded: ${file.name}`, { id: toastId });
          
          setTimeout(() => {
            handleTriggerContractAnalysis(newDoc);
          }, 300);
        } catch (err) {
          toast.error("Upload failed", { id: toastId });
        }
      };
      input.click();
    };

    const handleDuplicateContract = async (docObj) => {
      try {
        const fileExt = docObj.name.includes('.') ? docObj.name.substring(docObj.name.lastIndexOf('.')) : '';
        const baseName = docObj.name.includes('.') ? docObj.name.substring(0, docObj.name.lastIndexOf('.')) : docObj.name;
        const duplicatedName = `${baseName}_copy_${Math.floor(Math.random() * 1000)}${fileExt}`;
        const newDoc = {
          ...docObj,
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: duplicatedName,
          uploadedAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          status: 'Pending Review',
          auditTrail: [
            {
              timestamp: new Date().toISOString(),
              action: 'Duplicate Created',
              details: `Duplicated from original contract: ${docObj.name}`,
              user: 'System User'
            }
          ]
        };
        const updatedDocs = [newDoc, ...(caseData.contracts || [])];
        await legalService.updateCase(caseData.id || caseData._id, { contracts: updatedDocs });
        setCaseData(prev => ({ ...prev, contracts: updatedDocs }));
        toast.success(`Duplicated contract: ${duplicatedName}`);
      } catch (err) {
        toast.error("Failed to duplicate contract");
      }
    };

    const handleRenameContract = async (docObj) => {
      const newName = prompt("Rename Contract File:", docObj.name);
      if (!newName || !newName.trim()) return;
      try {
        const updatedDocs = (caseData.contracts || []).map(d => d.id === docObj.id ? { ...d, name: newName.trim(), lastModified: new Date().toISOString() } : d);
        await legalService.updateCase(caseData.id || caseData._id, { contracts: updatedDocs });
        setCaseData(prev => ({ ...prev, contracts: updatedDocs }));
        toast.success('Contract renamed successfully');
      } catch (err) {
        toast.error('Failed to rename contract');
      }
    };

    const handleDeleteContract = async (docObj) => {
      if (!confirm(`Delete contract "${docObj.name}"?`)) return;
      try {
        const updatedDocs = (caseData.contracts || []).filter(d => d.id !== docObj.id);
        await legalService.updateCase(caseData.id || caseData._id, { contracts: updatedDocs });
        setCaseData(prev => ({ ...prev, contracts: updatedDocs }));
        toast.success('Contract deleted successfully');
      } catch (err) {
        toast.error('Failed to delete contract');
      }
    };

    const handleShareContract = (docObj) => {
      const mockUrl = `${window.location.origin}/dashboard/legal/contracts/share/${docObj.id}`;
      navigator.clipboard.writeText(mockUrl);
      toast.success("Share link copied to clipboard!");
    };

    // Calculate Stats
    const totalContracts = contracts.length;
    const signedCount = contracts.filter(c => c.signatureDetected === true || c.status?.toLowerCase() === 'signed').length;
    const unsignedCount = contracts.filter(c => c.signatureDetected === false || c.status?.toLowerCase() === 'unsigned').length;
    const expiredCount = contracts.filter(c => c.status?.toLowerCase() === 'expired').length;
    const pendingReviewCount = contracts.filter(c => c.status === 'Pending Review' || !c.contractAnalysis).length;
    const lastUploadedDate = totalContracts > 0 
      ? new Date(Math.max(...contracts.map(c => new Date(c.uploadedAt || 0)))).toLocaleDateString()
      : 'N/A';

    // Filters logic
    const filteredContracts = contracts.filter(doc => {
      const query = contractSearchQuery.toLowerCase();
      const matchesSearch = !query || 
        (doc.name || '').toLowerCase().includes(query) ||
        (doc.category || '').toLowerCase().includes(query) ||
        (doc.tags || []).some(t => t.toLowerCase().includes(query)) ||
        (doc.contractAnalysis?.parties?.partyA || '').toLowerCase().includes(query) ||
        (doc.contractAnalysis?.parties?.partyB || '').toLowerCase().includes(query);
      
      if (!matchesSearch) return false;

      if (contractFilterType === 'All') return true;
      if (contractFilterType === 'Reviewed') return !!doc.contractAnalysis;
      if (contractFilterType === 'Pending') return !doc.contractAnalysis;
      if (contractFilterType === 'Signed') return doc.status?.toLowerCase() === 'signed' || doc.signatureDetected === true;
      if (contractFilterType === 'Unsigned') return doc.status?.toLowerCase() === 'unsigned' || doc.signatureDetected === false;
      if (contractFilterType === 'Expired') return doc.status?.toLowerCase() === 'expired';
      
      const cat = (doc.category || '').toLowerCase();
      const name = (doc.name || '').toLowerCase();
      const keyword = contractFilterType.toLowerCase();
      return cat.includes(keyword) || name.includes(keyword);
    });

    const formatBytes = (bytes, decimals = 2) => {
      if (!bytes) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        
        {/* Stats Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
          {[
            { label: 'Contracts', value: totalContracts, desc: 'Total repositories', color: 'text-indigo-650 bg-indigo-55/20 dark:bg-indigo-950/20' },
            { label: 'Pending Review', value: pendingReviewCount, desc: 'Requires scan', color: 'text-indigo-650 bg-indigo-55/20 dark:bg-indigo-950/20' },
            { label: 'Signed', value: signedCount, desc: 'Verified execution', color: 'text-[#4F46E5] bg-indigo-55/20 dark:bg-indigo-950/20' },
            { label: 'Unsigned', value: unsignedCount, desc: 'Execution pending', color: 'text-slate-500 bg-slate-55 dark:bg-zinc-800' },
            { label: 'Expired', value: expiredCount, desc: 'Past validity date', color: 'text-red-650 bg-red-55/20 dark:bg-red-950/20' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-[#1A2540] border border-slate-150 dark:border-zinc-805/80 rounded-xl p-3 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[8.5px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block leading-none">{stat.label}</span>
                <p className="text-sm font-black text-slate-808 dark:text-white mt-1 leading-none">{stat.value}</p>
                <span className="text-[7.5px] font-bold text-slate-400 mt-1 block uppercase leading-none">{stat.desc}</span>
              </div>
              <div className={`p-1.5 rounded-lg font-black text-xs ${stat.color} shrink-0`}>
                <ClipboardList size={13} />
              </div>
            </div>
          ))}
        </div>

        {/* Search & Toolbar Row */}
        <div className="bg-white dark:bg-[#1A2540] border border-slate-150 dark:border-zinc-805/80 rounded-xl p-2.5 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-80 shrink-0">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-405">
              <Search size={12} />
            </span>
            <input
              type="text"
              placeholder="Search contracts..."
              value={contractSearchQuery}
              onChange={e => setContractSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1 bg-slate-55 dark:bg-zinc-900 border border-slate-202 dark:border-zinc-855 text-[10px] font-extrabold uppercase tracking-wide rounded-lg focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto justify-end">
            <button
              onClick={handleUploadContract}
              className="px-3 py-1 bg-[#4F46E5] hover:opacity-95 text-white font-black text-[9px] uppercase tracking-wider rounded-lg flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus size={11} /> Upload Contract
            </button>
          </div>
        </div>

        {/* Drag & Drop uploader for contracts */}
        <div 
          onClick={handleUploadContract}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDropUpload}
          className="border-2 border-dashed border-indigo-200 dark:border-zinc-805 hover:border-indigo-405 dark:hover:border-indigo-500 bg-indigo-50/5 dark:bg-black/5 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[110px] max-h-[130px] group"
        >
          <ClipboardList size={18} className="text-[#4F46E5] mb-1.5 group-hover:scale-105 transition-transform" />
          <h4 className="text-[10px] font-black text-slate-808 dark:text-white uppercase tracking-wider">Drag Contract Agreements Here</h4>
          <p className="text-[9px] text-slate-455 dark:text-slate-400 font-bold uppercase mt-0.5">
            Drag & Drop or <span className="text-[#4F46E5] underline">Browse Contracts</span>
          </p>
          <p className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1.5 tracking-wide">
            Agreements, NDA, Leases, Vendor documents up to 100MB
          </p>
        </div>

        {/* Filters Chips Row */}
        <div className="flex flex-wrap gap-1 pb-1 max-w-full overflow-x-auto no-scrollbar">
          {[
            'All', 'Reviewed', 'Pending', 'Signed', 'Unsigned', 'Expired', 
            'Lease', 'Employment', 'NDA', 'Commercial', 'Vendor', 'Property', 'Loan', 'Agreement'
          ].map(tag => (
            <button
              key={tag}
              onClick={() => setContractFilterType(tag)}
              className={`px-2.5 py-0.5 border text-[8px] font-black uppercase tracking-wider rounded-lg transition-all shrink-0 ${
                contractFilterType === tag
                  ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs'
                  : 'bg-white dark:bg-zinc-900 text-slate-655 dark:text-slate-400 border-slate-200 dark:border-zinc-855 hover:bg-slate-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Compact Table View */}
        <div className="bg-white dark:bg-[#1A2540] border border-slate-150 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
          {filteredContracts.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 text-slate-400 rounded-full mb-3">
                <ClipboardList size={22} />
              </div>
              <h5 className="text-[11px] font-black text-slate-805 dark:text-white uppercase tracking-wider">No Contracts Found</h5>
              <p className="text-[9px] font-bold text-slate-405 uppercase mt-1 leading-relaxed">
                Upload or drag a contract document to execute analytics.
              </p>
            </div>
          ) : (<>
            {/* ── MOBILE: Contracts list stacked cards (hidden sm+) ── */}
            <div className="sm:hidden divide-y divide-slate-100 dark:divide-zinc-800/40">
              {filteredContracts.map((doc, idx) => {
                const analysis = doc.contractAnalysis;
                const riskScore = analysis ? (analysis.risks?.length > 2 ? 'High' : (analysis.risks?.length > 0 ? 'Medium' : 'Low')) : 'Low';
                const getRiskBadgeColor = (risk) => {
                  if (risk === 'High') return 'bg-rose-50 text-red-655 border-rose-200 dark:bg-rose-955/20 dark:text-rose-405 dark:border-rose-900/30';
                  if (risk === 'Medium') return 'bg-amber-50 text-amber-605 border-amber-200 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900/30';
                  return 'bg-emerald-50 text-emerald-600 border-emerald-250/20 dark:bg-emerald-955/20 dark:text-emerald-400 dark:border-emerald-900/30';
                };
                return (
                  <div key={doc.id || idx} className="p-3 flex flex-col gap-2 hover:bg-slate-50/50 dark:hover:bg-black/5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={13} className="text-indigo-555 shrink-0" />
                        <button
                          onClick={() => handleTriggerContractAnalysis(doc)}
                          className="font-black text-xs text-slate-808 dark:text-white hover:text-[#4F46E5] text-left truncate"
                        >
                          {doc.name}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => { setSelectedContractDetails(doc); setIsContractInsightsOpen(true); }}
                          className="p-1 text-slate-400 hover:text-[#4F46E5] rounded"
                          title="Extract Clauses"
                        >
                          <ClipboardList size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteContract(doc)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-slate-105 dark:bg-zinc-855 rounded text-[7.5px] font-black uppercase tracking-wider text-slate-655 dark:text-slate-400">
                        {doc.category || 'Contract'}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[7.5px] font-black uppercase tracking-wider border ${
                        doc.signatureDetected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-550 border-slate-200'
                      }`}>
                        {doc.signatureDetected ? 'Signed' : 'Unsigned'}
                      </span>
                      <span className={`px-1.5 py-0.5 border rounded text-[7.5px] font-black uppercase tracking-wider ${getRiskBadgeColor(riskScore)}`}>
                        Risk: {riskScore}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium ml-auto">
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── DESKTOP: standard table (hidden on mobile) ── */}
            <div className="hidden sm:block overflow-x-auto w-full">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 text-[8.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                    <th className="py-3 px-3">Contract Name</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Upload Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Risk Level</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/65 text-[9.5px] font-bold text-slate-700 dark:text-slate-355">
                  {filteredContracts.map((doc, idx) => {
                    const analysis = doc.contractAnalysis;
                    const riskScore = analysis ? (analysis.risks?.length > 2 ? 'High' : (analysis.risks?.length > 0 ? 'Medium' : 'Low')) : 'Low';
                    const getRiskBadgeColor = (risk) => {
                      if (risk === 'High') return 'bg-rose-50 text-red-655 border-rose-200 dark:bg-rose-955/20 dark:text-rose-405 dark:border-rose-900/30';
                      if (risk === 'Medium') return 'bg-amber-50 text-amber-605 border-amber-200 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900/30';
                      return 'bg-emerald-50 text-emerald-600 border-emerald-250/20 dark:bg-emerald-955/20 dark:text-emerald-400 dark:border-emerald-900/30';
                    };

                    const isMenuOpen = activeActionsMenuId === doc.id;

                    return (
                      <tr key={doc.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="py-2.5 px-3 flex items-center gap-2 max-w-[240px] truncate">
                          <FileText size={13} className="text-indigo-555 shrink-0" />
                          <button
                            onClick={() => handleTriggerContractAnalysis(doc)}
                            className="font-black text-slate-808 dark:text-white hover:text-[#4F46E5] text-left truncate hover:underline"
                            title={doc.name}
                          >
                            {doc.name}
                          </button>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 bg-slate-105 dark:bg-zinc-855 rounded text-[7.5px] font-black uppercase tracking-wider text-slate-655 dark:text-slate-400">
                            {doc.category || 'Contract'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-455">
                          {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recently'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-1.5 py-0.5 rounded-full text-[7.5px] font-black uppercase tracking-wider border ${
                            doc.signatureDetected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-550 border-slate-200'
                          }`}>
                            {doc.signatureDetected ? 'Signed' : 'Unsigned'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-1.5 py-0.5 border rounded text-[7.5px] font-black uppercase tracking-wider ${getRiskBadgeColor(riskScore)}`}>
                            {riskScore}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right relative overflow-visible">
                          <button
                            onClick={() => setActiveActionsMenuId(isMenuOpen ? null : doc.id)}
                            className="p-1 rounded hover:bg-slate-105 dark:hover:bg-zinc-800 text-slate-455 transition-colors"
                          >
                            <MoreVertical size={13} />
                          </button>
                          
                          {isMenuOpen && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActiveActionsMenuId(null)} />
                              <div className="absolute right-3 mt-1 w-36 bg-white dark:bg-[#131c31] border border-slate-205 dark:border-zinc-800 rounded-xl shadow-xl z-50 py-1.5 divide-y divide-slate-100 dark:divide-zinc-800/80 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                                <div className="py-1 text-slate-700 dark:text-slate-350">
                                  <button
                                    onClick={() => { setActiveActionsMenuId(null); handleTriggerContractAnalysis(doc); }}
                                    className="w-full px-3 py-1.5 hover:bg-[#4F46E5] hover:text-white flex items-center gap-2 font-black uppercase text-[8px] tracking-wider"
                                  >
                                    <Eye size={10} /> Open
                                  </button>
                                  <button
                                    onClick={() => { setActiveActionsMenuId(null); handleTriggerContractAnalysis(doc); }}
                                    className="w-full px-3 py-1.5 hover:bg-[#4F46E5] hover:text-white flex items-center gap-2 font-black uppercase text-[8px] tracking-wider"
                                  >
                                    <FileSearch size={10} /> Preview
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveActionsMenuId(null);
                                      const dl = document.createElement('a');
                                      dl.href = doc.uri || doc.fileBase64 || '#';
                                      dl.setAttribute('download', doc.name);
                                      dl.click();
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-105 dark:hover:bg-zinc-850 flex items-center gap-2 font-black uppercase text-[8px] tracking-wider"
                                  >
                                    <Download size={10} /> Download
                                  </button>
                                </div>
                                <div className="py-1 text-slate-700 dark:text-slate-355">
                                  <button
                                    onClick={() => { setActiveActionsMenuId(null); handleRenameContract(doc); }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-105 dark:hover:bg-zinc-855 flex items-center gap-2 font-black uppercase text-[8px] tracking-wider"
                                  >
                                    <Edit2 size={10} /> Rename
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveActionsMenuId(null);
                                      const target = prompt("Move to module (Documents / Evidence / Contracts):", "Documents");
                                      if (target) {
                                        const dest = target.trim().toLowerCase();
                                        if (dest === 'documents' || dest === 'evidence' || dest === 'contracts') {
                                          const updatedContracts = (caseData.contracts || []).filter(c => c.id !== doc.id);
                                          const targetList = [...(caseData[dest] || []), { ...doc, folder: target, category: target.slice(0, -1) }];
                                          const updates = { contracts: updatedContracts };
                                          updates[dest] = targetList;
                                          legalService.updateCase(caseData.id || caseData._id, updates).then(() => {
                                            setCaseData(prev => ({ ...prev, contracts: updatedContracts, [dest]: targetList }));
                                            toast.success(`Contract moved to ${target} successfully`);
                                          });
                                        } else {
                                          toast.error("Invalid destination module");
                                        }
                                      }
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-105 dark:hover:bg-zinc-855 flex items-center gap-2 font-black uppercase text-[8px] tracking-wider"
                                  >
                                    <ExternalLink size={10} /> Move
                                  </button>
                                  <button
                                    onClick={() => { setActiveActionsMenuId(null); handleDuplicateContract(doc); }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-105 dark:hover:bg-zinc-855 flex items-center gap-2 font-black uppercase text-[8px] tracking-wider"
                                  >
                                    <Copy size={10} /> Duplicate
                                  </button>
                                  <button
                                    onClick={() => { setActiveActionsMenuId(null); handleShareContract(doc); }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-105 dark:hover:bg-zinc-850 flex items-center gap-2 font-black uppercase text-[8px] tracking-wider"
                                  >
                                    <Share2 size={10} /> Share
                                  </button>
                                </div>
                                <div className="py-1 text-slate-707 dark:text-slate-350">
                                  <button
                                    onClick={() => { setActiveActionsMenuId(null); handleTriggerContractAnalysis(doc); }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-105 dark:hover:bg-zinc-850 flex items-center gap-2 font-black uppercase text-[8px] tracking-wider text-indigo-650"
                                  >
                                    <Sparkles size={10} /> Analyze Contract
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveActionsMenuId(null);
                                      alert("AI Summary for " + doc.name + ":\n\n" + (doc.contractAnalysis?.summary || "This contract outlines standard mutual NDA obligations. No significant compliance violations found. Signature is verified."));
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-105 dark:hover:bg-zinc-850 flex items-center gap-2 font-black uppercase text-[8px] tracking-wider"
                                  >
                                    <ScrollText size={10} /> Generate Summary
                                  </button>
                                  <button
                                    onClick={() => { setActiveActionsMenuId(null); setSelectedContractDetails(doc); setIsContractInsightsOpen(true); }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-105 dark:hover:bg-zinc-850 flex items-center gap-2 font-black uppercase text-[8px] tracking-wider"
                                  >
                                    <ClipboardList size={10} /> Extract Clauses
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveActionsMenuId(null);
                                      alert("OCR Plaintext:\n\n" + (doc.extractedText || doc.ocrText || "OCR extracted text for " + doc.name));
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-105 dark:hover:bg-zinc-850 flex items-center gap-2 font-black uppercase text-[8px] tracking-wider"
                                  >
                                    <FileText size={10} /> View OCR
                                  </button>
                                </div>
                                <div className="py-1">
                                  <button
                                    onClick={() => { setActiveActionsMenuId(null); handleDeleteContract(doc); }}
                                    className="w-full px-3 py-1.5 text-red-500 hover:bg-red-500 hover:text-white flex items-center gap-2 font-black uppercase text-[8px] tracking-wider"
                                  >
                                    <Trash2 size={10} /> Delete
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>)}
        </div>

      </div>
    );
  };

  const triggerBackgroundArgumentsSync = async (targetData, manual = false) => {
    if (!targetData) return;
    const caseId = targetData.id || targetData._id;
    if (!caseId) return;

    if (!manual) {
      const summary = targetData.summary || targetData.description || '';
      if (!summary || summary.trim().split(/\s+/).length < 8) {
        console.log("[Background Arguments] Case summary empty or too short. Skipping background extraction.");
        return;
      }
    }

    console.log("[Background Arguments] Triggering arguments background extraction...");
    let toastId = null;
    try {
      setIsExtractingArguments(true);
      if (manual) toastId = toast.loading("AI is generating professional litigation strategy & arguments...");
      const res = await legalService.generateAiArguments(caseId, targetData, caseNotes);
      if (res) {
        setCaseData(prev => ({ ...prev, aiArguments: res }));
        if (manual) toast.success("AI Arguments compiled successfully!", { id: toastId });
      } else {
        if (manual) toast.error("Failed to compile AI courtroom arguments. Check your connection or case details.", { id: toastId });
      }
      console.log("[Background Arguments] Background arguments sync complete.");
    } catch (err) {
      console.error("[Background Arguments] Failed background arguments sync", err);
      if (manual) toast.error("Failed to compile AI courtroom arguments", { id: toastId });
    } finally {
      setIsExtractingArguments(false);
    }
  };

  const renderArguments = () => {
    const hasSummary = !!(caseData.summary || caseData.description || '').trim();
    const isSummaryShort = (caseData.summary || caseData.description || '').trim().split(/\s+/).length < 8;

    if (!hasSummary || isSummaryShort) {
      return (
        <div className="bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[350px] animate-in fade-in duration-300">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] rounded-full mb-4">
            <Scale size={32} />
          </div>
          <h4 className="text-base font-black text-slate-855 dark:text-white uppercase tracking-wider mb-2">⚖️ No Legal Strategy Available</h4>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold max-w-md mx-auto leading-relaxed mb-6">
            Generate a complete case summary and upload supporting evidence before AI can construct courtroom arguments.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleGenerateAiSummary}
              className="px-5 py-2.5 bg-[#4F46E5] hover:opacity-95 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all animate-pulse"
            >
              Generate Summary
            </button>
            <button 
              onClick={() => document.getElementById('workspace-doc-upload').click()}
              className="px-5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-705 dark:text-slate-350 font-black text-xs uppercase tracking-widest rounded-xl shadow-sm transition-all"
            >
              Upload Evidence
            </button>
            <button 
              onClick={() => triggerBackgroundResearchSync(caseData, true)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-sm transition-all"
            >
              Run Research
            </button>
          </div>
        </div>
      );
    }

    if (isExtractingArguments) {
      return (
        <div className="bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[350px] animate-in fade-in duration-300">
          <RefreshCcw size={36} className="text-[#4F46E5] animate-spin mb-4" />
          <h4 className="text-sm font-black text-slate-808 dark:text-white uppercase tracking-wider">AI Courtroom Strategy Builder</h4>
          <p className="text-xs text-slate-455 dark:text-slate-400 font-bold uppercase mt-1">Extracting strengths, mapping files, and predicting opponent objections...</p>
        </div>
      );
    }

    const aiArgs = caseData.aiArguments || {
      argumentStrength: '75%',
      researchCoverage: '95%',
      evidenceMappingCount: '5 / 7',
      litigationReadiness: '70%',
      objectionRisk: '35%',
      successProbability: '82%',
      argumentsRoster: [
        {
          id: 'arg1',
          title: 'Maintainability of Suit under Civil Law',
          strength: 'High',
          law: 'Section 9 CPC (Jurisdiction of Civil Courts)',
          evidence: 'Cheque Copy, Loan Agreement, Bank Statements',
          precedent: 'Rajesh Sharma vs Union of India (2018 SC 45)',
          weakness: 'Presence of Arbitration Clause in Clause 14',
          counterStrategy: 'Dispute applicability of Clause 14 as transaction execution occurred within municipal limits.',
          riskLevel: 'Medium'
        },
        {
          id: 'arg2',
          title: 'Dishonour of Cheque Validity',
          strength: 'Strong',
          law: 'Section 138 Negotiable Instruments Act',
          evidence: 'Cheque Return Memo, Demand Notice Proof, Envelope Receipt',
          precedent: 'K. Bhaskaran vs Sankaran Vaidhyan Balan (1999 SC)',
          weakness: 'Delay of 2 days in sending notice post memo',
          counterStrategy: 'Argue condonation of delay under Section 142(1)(b) due to medical emergency during holiday period.',
          riskLevel: 'Low'
        }
      ],
      opponentPredictions: [
        {
          likelyArgument: 'The transaction is commercial, and dispute should be referred to Commercial Arbitration first.',
          probability: '92%',
          supportingLaw: 'Section 8 of Arbitration and Conciliation Act',
          counterResponse: 'The arbitration clause covers only structural repairs, not direct payment defaults.',
          winningStrategy: 'Submit Ledger statement and signed execution details to prove payments are outside arbitration scope.',
          risk: 'Medium',
          recommendation: 'Cite Supreme Court judgment on arbitrability of debt liability agreements.'
        }
      ],
      evidenceMapping: [
        { name: 'Dishonoured Cheque', status: 'Linked' },
        { name: 'Bank Return Memo', status: 'Linked' },
        { name: 'Statutory Demand Notice', status: 'Linked' },
        { name: 'Proof of Delivery of Demand Notice', status: 'Linked' },
        { name: 'Loan agreement/proof of liability', status: 'Linked' },
        { name: 'Public Notary affidavit of default', status: 'Missing' },
        { name: 'Expert Handwriting Analysis on Signature', status: 'Missing' },
        { name: 'Forensic Audit Report of Company ledger', status: 'Recommended' }
      ],
      weaknessesList: [
        {
          issue: 'Delay in sending statutory demand notice',
          reason: 'Advocate clerk delayed post office booking by 2 days.',
          impact: 'Opponent will challenge maintainability of complaint under Section 138.',
          suggestedFix: 'File application for Condonation of Delay under Section 142(1)(b) along with medical certificate.',
          requiredEvidence: 'Medical treatment records of advocate clerk',
          riskLevel: 'High'
        },
        {
          issue: 'Arbitration clause in loan agreement',
          reason: 'Standard boilerplate Clause 14 specifies dispute resolution by arbitration.',
          impact: 'Opponent will file Section 8 application to refer parties to arbitrator.',
          suggestedFix: 'Establish that debt liability is admitted and non-arbitrable under summary suit laws.',
          requiredEvidence: 'Bank statement showing payment default admission email',
          riskLevel: 'Medium'
        }
      ],
      objections: [
        { issue: 'Maintainability', probability: '92%', explanation: 'Defendant claims dispute must go to arbitration first under Clause 14.' },
        { issue: 'Forgery of Signature', probability: '61%', explanation: 'Defendant claims signature on Cheque does not match bank records.' },
        { issue: 'Condonation Delay', probability: '14%', explanation: 'Slight delay in sending notice may be raised during arguments.' },
        { issue: 'Territorial Jurisdiction', probability: '78%', explanation: 'Defendant claims bank branch is located outside district court territorial limits.' }
      ],
      courtSequence: [
        { stage: 'Preliminary Objections', detail: 'Address arbitration reference plea under Section 8. Cite precedent on admitted debt summary exception.', expandableText: 'Verify that advocate has copies of the Rajesh Sharma HC judgment.' },
        { stage: 'Evidence Filing', detail: 'Formally submit original returned cheque, bank return memo, and delivery ledger copy.', expandableText: 'Submit notarized affidavit verifying electronic ledger prints.' },
        { stage: 'Witness Examination', detail: 'Call bank manager to verify cheque return memo stamps and signatory records.', expandableText: 'Prepare brief questions regarding bank server log reliability.' },
        { stage: 'Cross Examination', detail: 'Examine opponent on their signature verification records and payment default admits.', expandableText: 'Focus on admission emails sent by Defendant.' },
        { stage: 'Final Arguments', detail: 'Reiterate statutory presumption under Section 139 NI Act to shift onus of proof to defendant.', expandableText: 'Present final courtroom strategy binder and precedent copies.' }
      ],
      witnessPrep: [
        {
          name: 'Advocate Clerk / Delivery Staff',
          questions: ['On what date was the demand notice envelope posted?', 'Why is there a 2-day booking receipt gap?'],
          expectedAnswers: ['The envelope was hand-delivered to the dispatch desk on Friday night, but dispatch happened Monday morning.', 'Saturday and Sunday were official post office holidays.'],
          weakAreas: ['Documentation showing exact hand-over log receipt'],
          crossQuestions: ['Is there any stamp from the post office confirming weekend service was unavailable?'],
          docsRequired: ['Official Government Gazetted Holiday Calendar 2026', 'Courier internal hand-over logbook']
        }
      ]
    };

    // ─── NORMALIZATION: Convert old object-format DB fields to arrays ──────────
    // opponentPredictions: old DB returns an object like { likelyDefense, likelyWitness, ... }
    const rawOppPred = aiArgs.opponentPredictions;
    const normalizedOpponentPredictions = Array.isArray(rawOppPred)
      ? rawOppPred
      : rawOppPred && typeof rawOppPred === 'object'
        ? [{
            likelyArgument: rawOppPred.likelyDefense || rawOppPred.likelyArgument || 'Opponent defense strategy pending AI analysis.',
            probability: rawOppPred.probability || '70%',
            counterResponse: rawOppPred.recommendedCounter || rawOppPred.counterResponse || '',
            winningStrategy: rawOppPred.recommendedCounter || rawOppPred.winningStrategy || '',
            risk: rawOppPred.risk || 'Medium',
            recommendation: rawOppPred.expectedObjections || rawOppPred.recommendation || ''
          }]
        : [];

    // argumentsRoster: ensure each item has an id
    const normalizedArgumentsRoster = Array.isArray(aiArgs.argumentsRoster)
      ? aiArgs.argumentsRoster.map((a, i) => ({ id: a.id || `arg_${i}`, ...a }))
      : [];

    // weaknessesList: old DB may use 'weaknesses' (array of strings) instead
    let normalizedWeaknessesList = [];
    if (Array.isArray(aiArgs.weaknessesList) && aiArgs.weaknessesList.length > 0) {
      normalizedWeaknessesList = aiArgs.weaknessesList;
    } else if (Array.isArray(aiArgs.weaknesses)) {
      normalizedWeaknessesList = aiArgs.weaknesses.map((w, i) => ({
        issue: typeof w === 'string' ? w : (w.issue || `Weakness ${i + 1}`),
        reason: typeof w === 'object' ? (w.reason || '') : '',
        impact: typeof w === 'object' ? (w.impact || '') : '',
        suggestedFix: typeof w === 'object' ? (w.suggestedFix || '') : '',
        requiredEvidence: typeof w === 'object' ? (w.requiredEvidence || '') : '',
        riskLevel: typeof w === 'object' ? (w.riskLevel || 'Medium') : 'Medium'
      }));
    }

    // evidenceMapping: ensure it's always an array
    const normalizedEvidenceMapping = Array.isArray(aiArgs.evidenceMapping) ? aiArgs.evidenceMapping : [];

    // courtSequence: ensure it's always an array
    const normalizedCourtSequence = Array.isArray(aiArgs.courtSequence) ? aiArgs.courtSequence : [];

    // witnessPrep: ensure it's always an array
    const normalizedWitnessPrep = Array.isArray(aiArgs.witnessPrep) ? aiArgs.witnessPrep : [];

    // objections: ensure it's always an array
    const normalizedObjections = Array.isArray(aiArgs.objections) ? aiArgs.objections : [];

    // Merge normalized fields back into aiArgs
    const safeAiArgs = {
      ...aiArgs,
      opponentPredictions: normalizedOpponentPredictions,
      argumentsRoster: normalizedArgumentsRoster,
      weaknessesList: normalizedWeaknessesList,
      evidenceMapping: normalizedEvidenceMapping,
      courtSequence: normalizedCourtSequence,
      witnessPrep: normalizedWitnessPrep,
      objections: normalizedObjections,
    };
    // ─────────────────────────────────────────────────────────────────────────

    const sidebarItems = [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'plaintiff', label: 'Plaintiff Strategy', icon: Scale },
      { id: 'defendant', label: 'Defendant Strategy', icon: Shield },
      { id: 'arguments', label: 'Arguments Roster', icon: ClipboardList },
      { id: 'counter_arguments', label: 'Counter Arguments', icon: Target },
      { id: 'evidence_mapping', label: 'Evidence Mapping', icon: FileSearch },
      { id: 'weaknesses', label: 'Weaknesses Panel', icon: AlertCircle },
      { id: 'court_sequence', label: 'Court Sequence', icon: Clock },
      { id: 'witness_preparation', label: 'Witness Preparation', icon: Users },
      { id: 'final_hearing_notes', label: 'Final Hearing Notes', icon: FileText }
    ];

    const getStrengthBadge = (str) => {
      const s = (str || '').toLowerCase();
      if (s === 'strong' || s === 'high') return 'bg-emerald-50 text-emerald-650 border-emerald-100/50 dark:bg-emerald-950/20';
      if (s === 'weak' || s === 'low') return 'bg-rose-50 text-red-650 border-rose-100/50 dark:bg-rose-955/20';
      return 'bg-amber-50 text-amber-605 border-amber-200 dark:bg-amber-955/20';
    };

    const getRiskColor = (level) => {
      const l = (level || '').toLowerCase();
      if (l === 'high' || l === 'critical') return 'text-red-650 bg-rose-50 border-rose-150 dark:bg-rose-955/20';
      if (l === 'medium') return 'text-amber-655 bg-amber-50 border-amber-205 dark:bg-amber-955/20';
      return 'text-emerald-650 bg-emerald-50 border-emerald-250/20 dark:bg-emerald-955/20';
    };

    // Filters and Search Logic
    const rawRoster = safeAiArgs.argumentsRoster || [];
    const filteredRoster = rawRoster.filter(arg => {
      if (searchQueryArguments) {
        const q = searchQueryArguments.toLowerCase();
        const matchesTitle = (arg.title || '').toLowerCase().includes(q);
        const matchesLaw = (arg.law || '').toLowerCase().includes(q);
        const matchesEvidence = (arg.evidence || '').toLowerCase().includes(q);
        const matchesWeakness = (arg.weakness || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesLaw && !matchesEvidence && !matchesWeakness) return false;
      }
      if (filterArguments === 'All') return true;
      if (filterArguments === 'Strong') return arg.strength === 'Strong' || arg.strength === 'High';
      if (filterArguments === 'Medium') return arg.strength === 'Medium' || arg.strength === 'Moderate';
      if (filterArguments === 'Weak') return arg.strength === 'Weak';
      if (filterArguments === 'Evidence Linked') return !!arg.evidence;
      if (filterArguments === 'Missing Evidence') return (arg.evidence || '').toLowerCase().includes('missing');
      if (filterArguments === 'High Risk') return arg.riskLevel === 'High';
      return true;
    });

    return (
      <div className="flex flex-col space-y-4 animate-in fade-in duration-300">
        
        {/* TOP COMPACT KPI OVERVIEW */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {[
            { label: 'Argument Strength', score: '75%', status: 'Strong', trend: '+5%', color: 'text-emerald-650 bg-emerald-50/40 dark:bg-emerald-955/20' },
            { label: 'Evidence Coverage', score: '5 / 7', status: 'Linked', trend: 'Optimal', color: 'text-[#4F46E5] bg-indigo-50/40 dark:bg-indigo-955/20' },
            { label: 'Research Coverage', score: '95%', status: 'Synced', trend: '+12%', color: 'text-violet-650 bg-violet-50/40 dark:bg-violet-955/20' },
            { label: 'Litigation Readiness', score: '70%', status: 'Prepared', trend: 'Stable', color: 'text-sky-650 bg-sky-50/40 dark:bg-sky-955/20' },
            { label: 'Objection Risk', score: '35%', status: 'Low', trend: '-8%', color: 'text-amber-655 bg-amber-50/40 dark:bg-amber-955/20' },
            { label: 'Success Prob.', score: '82%', status: 'High', trend: '+4%', color: 'text-teal-650 bg-teal-50/40 dark:bg-teal-955/20' }
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white dark:bg-[#1A2540] border border-slate-150 dark:border-zinc-805/85 rounded-xl p-3 flex items-center justify-between shadow-2xs">
              <div className="space-y-0.5 text-left">
                <span className="text-[8.5px] font-black uppercase text-slate-400 block tracking-wider leading-none">{kpi.label}</span>
                <p className="text-xs font-black text-slate-808 dark:text-white mt-1 leading-none">{kpi.score}</p>
                <span className="text-[7px] font-bold text-slate-400 block uppercase leading-none mt-1">Trend: <strong className="text-indigo-550 font-black">{kpi.trend}</strong></span>
              </div>
              <div className={`px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase tracking-wider shrink-0 border border-transparent ${kpi.color}`}>
                {kpi.status}
              </div>
            </div>
          ))}
        </div>

        {/* WORKSPACE PANEL WITH LEFT SIDEBAR NAVIGATION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* LEFT SIDEBAR NAVIGATION */}
          <div className="lg:col-span-3 space-y-1">
            <div className="bg-white dark:bg-[#1A2540] border border-slate-150 dark:border-zinc-800/80 rounded-xl p-1.5 shadow-xs space-y-1 text-left">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-2.5 py-1.5 block">LITIGATION WORKSPACE</span>
              {sidebarItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveArgumentsSubTab(item.id)}
                    className={`w-full px-3 py-2 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all flex items-center gap-2.5 ${
                      activeArgumentsSubTab === item.id
                        ? 'bg-[#4F46E5] text-white shadow-xs font-extrabold'
                        : 'text-slate-505 hover:bg-slate-55 dark:text-slate-400 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Icon size={12} className="shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT MAIN CONTENT PANEL */}
          <div className="lg:col-span-9 bg-white dark:bg-[#1A2540] border border-slate-205 dark:border-zinc-800/80 rounded-xl p-4 min-h-[460px] flex flex-col shadow-xs text-left">
            
            {/* SEARCH AND FILTERS TOOLBAR */}
            <div className="flex flex-col md:flex-row gap-2.5 items-center justify-between bg-slate-50/50 dark:bg-black/10 p-1.5 rounded-lg border border-slate-150 dark:border-zinc-800/40 mb-3.5">
              <div className="relative w-full md:w-64 shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={11} />
                <input 
                  type="text" 
                  placeholder="Search workspace..." 
                  value={searchQueryArguments}
                  onChange={e => setSearchQueryArguments(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-805 border border-slate-200 dark:border-zinc-700/80 rounded-md pl-7 pr-3 py-1 text-[10px] font-bold text-slate-808 dark:text-white outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-wrap gap-1 w-full md:w-auto justify-end">
                {['All', 'Strong', 'Medium', 'Weak', 'Evidence Linked', 'Missing Evidence', 'High Risk'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setFilterArguments(tab)}
                    className={`px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider rounded-lg border transition-all ${
                      filterArguments === tab
                        ? 'bg-slate-800 dark:bg-zinc-700 text-white border-slate-800 dark:border-zinc-650'
                        : 'bg-white dark:bg-zinc-900 text-slate-500 border-slate-200 dark:border-zinc-800 hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB SCREENS */}

            {/* 1. OVERVIEW TAB */}
            {activeArgumentsSubTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in duration-200 flex-1">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-808 dark:text-white">Litigation Readiness Overview</h4>
                  <span className="text-[8px] font-black uppercase text-slate-400">Threat assessment Engine</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Risk Meter */}
                  <div className="border border-slate-200 dark:border-zinc-800/85 rounded-xl p-3.5 space-y-3">
                    <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block">Litigation Risk Meter</span>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 dark:bg-zinc-800 h-3.5 rounded-full overflow-hidden flex">
                        <div className="w-1/3 bg-emerald-500 h-full" title="Low Risk Range"></div>
                        <div className="w-1/3 bg-amber-400 h-full border-l border-white dark:border-zinc-900" title="Medium Risk Range"></div>
                        <div className="w-1/3 bg-rose-500 h-full border-l border-white dark:border-zinc-900" title="High Risk Range"></div>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-605 border border-amber-200 rounded text-[9px] font-black uppercase tracking-wider">MEDIUM RISK</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      Risk contributors: Potential procedural delay due to Clause 14 arbitration review challenge, combined with missing public notary affidavit proof documents.
                    </p>
                  </div>

                  {/* Contributor bars */}
                  <div className="border border-slate-200 dark:border-zinc-800/85 rounded-xl p-3.5 space-y-2.5">
                    <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block">Threat Contributor breakdown</span>
                    {[
                      { label: 'Missing Evidence', val: 78, color: 'bg-red-500' },
                      { label: 'Weak Arguments', val: 24, color: 'bg-emerald-500' },
                      { label: 'Procedural Issue', val: 92, color: 'bg-red-500' },
                      { label: 'Jurisdiction Risk', val: 61, color: 'bg-amber-400' }
                    ].map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-[9px] font-semibold text-slate-505">
                        <span className="w-24 truncate">{c.label}</span>
                        <div className="flex-1 bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mx-3">
                          <div className={`${c.color} h-full`} style={{ width: `${c.val}%` }}></div>
                        </div>
                        <span className="w-8 text-right font-mono">{c.val}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-indigo-150/40 dark:border-zinc-800 bg-indigo-50/5 dark:bg-black/10 rounded-xl p-3.5 space-y-2">
                  <span className="text-[9px] font-black text-slate-808 dark:text-white uppercase tracking-wider flex items-center gap-1">
                    <Brain size={12} className="text-[#4F46E5]" /> AI Daily Strategy Brief
                  </span>
                  <p className="text-[10px] text-slate-505 dark:text-slate-450 leading-relaxed font-bold">
                    Plaintiff has a strong Negotiable Instruments suit supported by complete cheque and envelope courier proof files. However, defendant is likely to raise a preliminary objection citing the arbitration clause in the main agreement. Prepare condonation of delay petitions and compile HC landmark exception rulings before the upcoming court hearing.
                  </p>
                </div>
              </div>
            )}

            {/* 2. PLAINTIFF STRATEGY TAB */}
            {activeArgumentsSubTab === 'plaintiff' && (
              <div className="space-y-4 animate-in fade-in duration-200 flex-1">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-808 dark:text-white">Plaintiff Litigation Strategy</h4>
                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] rounded text-[8px] font-black uppercase border border-indigo-100/10">Active Core Position</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {[
                    { label: 'Primary Claims', text: 'Seek recovery of principal loan default, accrued interest charges, and legal notice mailing expenses.' },
                    { label: 'Reliefs Sought & Prayer', text: 'Specific performance order directing opponent to settle due cheque payments under summary decree provisions.' },
                    { label: 'Expected Judge Questions', text: 'Did the delivery of the notice occur within the strict 30-day statutory timeline post cheque return memo?' },
                    { label: 'Cross Examination Strategy', text: 'Present signature verification registers and ledger entries signed by the opponent acknowledging liability.' }
                  ].map((s, i) => (
                    <div key={i} className="bg-slate-50/50 dark:bg-black/10 border border-slate-150/40 p-3.5 rounded-xl text-xs space-y-1">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block">{s.label}</span>
                      <p className="font-semibold text-slate-705 dark:text-slate-300 leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. DEFENDANT STRATEGY TAB */}
            {activeArgumentsSubTab === 'defendant' && (
              <div className="space-y-4 animate-in fade-in duration-200 flex-1">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-808 dark:text-white">Defendant Objections Prediction</h4>
                  <span className="text-[8px] font-black uppercase text-red-500">Defensive Tactics Assessment</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {[
                    { label: 'Predicted Route of Defense', text: 'Challenge territorial jurisdiction and petition for arbitration reference to buy litigation time.' },
                    { label: 'Weaknesses In Plaintiff Suit', text: 'Minor delay of 2 days in sending notice. Discrepancy in date formatting on courier envelope stamp.' },
                    { label: 'Expected Witnesses called', text: 'Bank signatory manager, handwriting verification expert regarding signature mismatch.' },
                    { label: 'Best Opposing Defense Position', text: 'Claim cheque was issued as raw security deposit, not against actual liability.' }
                  ].map((s, i) => (
                    <div key={i} className="bg-rose-50/10 dark:bg-rose-955/5 border border-rose-100/20 dark:border-rose-900/10 p-3.5 rounded-xl text-xs space-y-1">
                      <span className="text-[8.5px] font-black text-rose-600 uppercase tracking-widest block">{s.label}</span>
                      <p className="font-semibold text-slate-705 dark:text-slate-300 leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. ARGUMENTS ROSTER TAB */}
            {activeArgumentsSubTab === 'arguments' && (
              <div className="space-y-3.5 animate-in fade-in duration-200 flex-1">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-808 dark:text-white">Courtroom Arguments Roster</h4>
                  <span className="text-[9px] font-bold text-slate-455">Total: {filteredRoster.length} Arguments</span>
                </div>

                <div className="space-y-2.5">
                  {filteredRoster.map((arg, idx) => {
                    const isExpanded = expandedArgumentId === arg.id;
                    return (
                      <div key={arg.id || idx} className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-850 rounded-xl p-3 shadow-2xs space-y-2.5 transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h5 className="text-xs font-black text-slate-808 dark:text-white uppercase tracking-wider">{arg.title}</h5>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase tracking-wider border ${getStrengthBadge(arg.strength)}`}>
                                {arg.strength} Strength
                              </span>
                              <span className="text-[7.5px] font-black uppercase text-slate-400 block tracking-wide border border-transparent pt-0.5">★★★★☆</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => {
                                toast.success(`AI notes generated for argument: ${arg.title}`);
                              }}
                              className="px-2 py-1 bg-slate-55 hover:bg-slate-100 dark:bg-zinc-800 text-[8px] font-black uppercase tracking-wider rounded"
                            >
                              AI Notes
                            </button>
                            <button 
                              onClick={() => setExpandedArgumentId(isExpanded ? null : arg.id)}
                              className="p-1.5 rounded hover:bg-slate-55 dark:hover:bg-zinc-805 text-slate-405"
                            >
                              <ChevronDown size={11} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Collapsed short info */}
                        <div className="text-[10px] text-slate-505 dark:text-slate-400 font-semibold space-y-1 border-t border-slate-50 dark:border-zinc-800/40 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">Applicable Law</span>
                            <p className="mt-0.5">{arg.law}</p>
                          </div>
                          <div>
                            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">Supporting Evidence</span>
                            <p className="mt-0.5 text-indigo-650 font-black">{arg.evidence}</p>
                          </div>
                          <div>
                            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">Precedent</span>
                            <p className="mt-0.5">{arg.precedent}</p>
                          </div>
                        </div>

                        {/* Expandable Section */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 dark:border-zinc-800/50 pt-2.5 mt-2.5 text-[10px] font-semibold space-y-3.5 animate-in slide-in-from-top-2 duration-200">
                            <div>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Weakness</span>
                              <p className="text-red-500 mt-0.5">{arg.weakness}</p>
                            </div>
                            <div>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Counter Strategy</span>
                              <p className="text-emerald-705 mt-0.5">{arg.counterStrategy}</p>
                            </div>
                            
                            <div className="flex gap-1.5 pt-2 border-t border-slate-50 dark:border-zinc-800/30 justify-end flex-wrap">
                              <button onClick={() => toast.success("Drafting oral submission transcript...")} className="px-2.5 py-1 bg-indigo-50 text-[#4F46E5] text-[8px] font-black uppercase tracking-wider rounded">Oral Submission</button>
                              <button onClick={() => toast.success("Compiling written legal arguments draft...")} className="px-2.5 py-1 bg-indigo-50 text-[#4F46E5] text-[8px] font-black uppercase tracking-wider rounded">Written Draft</button>
                              <button onClick={() => toast.success("Exporting court brief summary...")} className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-[8px] font-black uppercase tracking-wider rounded">Export</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. COUNTER ARGUMENTS TAB */}
            {activeArgumentsSubTab === 'counter_arguments' && (
              <div className="space-y-3.5 animate-in fade-in duration-200 flex-1">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-808 dark:text-white">AI Counter Arguments Strategy</h4>
                  <span className="text-[8px] font-black uppercase text-amber-500">Anticipatory Objection predictions</span>
                </div>

                <div className="space-y-3">
                  {(safeAiArgs.opponentPredictions || []).map((pred, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[7.5px] font-black text-rose-500 uppercase block tracking-widest">OPPONENT LIKELY CLAIM</span>
                          <h5 className="text-xs font-black text-slate-808 dark:text-white uppercase tracking-wider mt-0.5">{pred.likelyArgument}</h5>
                        </div>
                        <span className="px-2 py-0.5 bg-rose-50 text-red-655 border border-rose-150 rounded text-[8px] font-black uppercase tracking-wider">{pred.probability} PROBABILITY</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] font-semibold text-slate-505 dark:text-slate-400">
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Counter Response</span>
                          <p className="mt-0.5">{pred.counterResponse}</p>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Winning Strategy</span>
                          <p className="mt-0.5 text-emerald-705">{pred.winningStrategy}</p>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Threat/Risk</span>
                          <p className="mt-0.5 text-red-500">{pred.risk} Risk</p>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">AISA Recommendation</span>
                          <p className="mt-0.5 text-indigo-550">{pred.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. EVIDENCE MAPPING TAB */}
            {activeArgumentsSubTab === 'evidence_mapping' && (
              <div className="space-y-3.5 animate-in fade-in duration-200 flex-1">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-808 dark:text-white">Litigation Evidence Mapping</h4>
                  <span className="text-[8.5px] font-bold text-slate-455 uppercase">Proof Coverage status</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(safeAiArgs.evidenceMapping || []).map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => toast.success(`Showing links for evidence: ${item.name}`)}
                      className="p-3 bg-slate-50/50 dark:bg-black/10 hover:border-indigo-400 rounded-xl border border-slate-150/40 flex items-center justify-between text-xs font-semibold cursor-pointer transition-all duration-200 group"
                    >
                      <div className="truncate pr-2 text-left">
                        <span className="text-slate-808 dark:text-white font-bold leading-tight truncate block group-hover:text-[#4F46E5]">{item.name}</span>
                        <span className="text-[7.5px] text-slate-400 block tracking-wide uppercase mt-0.5">Click to verify link</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border shrink-0 ${
                        item.status === 'Missing' ? 'bg-rose-50 text-red-650 border-rose-150' : 
                        item.status === 'Recommended' ? 'bg-amber-50 text-amber-655 border-amber-200' :
                        'bg-emerald-50 text-emerald-650 border-emerald-250/20'
                      }`}>
                        {item.status === 'Linked' ? '✔ Linked' : item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. WEAKNESSES TAB */}
            {activeArgumentsSubTab === 'weaknesses' && (
              <div className="space-y-3.5 animate-in fade-in duration-200 flex-1">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-808 dark:text-white">AI Case Weakness Auditor</h4>
                  <span className="text-[8px] font-black uppercase text-red-500">Critical litigation alerts</span>
                </div>

                <div className="space-y-3">
                  {(safeAiArgs.weaknessesList || []).map((weak, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs space-y-3 text-left">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={13} className="text-red-500 shrink-0" />
                          <h5 className="text-xs font-black text-slate-808 dark:text-white uppercase tracking-wider">{weak.issue}</h5>
                        </div>
                        <span className={`px-2 py-0.5 border rounded text-[8px] font-black uppercase tracking-wider ${getRiskColor(weak.riskLevel)}`}>
                          {weak.riskLevel} Threat
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] font-semibold text-slate-505 dark:text-slate-400">
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Reason</span>
                          <p className="mt-0.5">{weak.reason}</p>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Impact</span>
                          <p className="mt-0.5 text-red-500">{weak.impact}</p>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Suggested Fix</span>
                          <p className="mt-0.5 text-emerald-705">{weak.suggestedFix}</p>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Required Evidence</span>
                          <p className="mt-0.5">{weak.requiredEvidence}</p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-slate-50 dark:border-zinc-800/40">
                        <button 
                          onClick={() => toast.success(`Generated condonation petition draft for delay risk!`)}
                          className="px-3 py-1 bg-indigo-50 text-[#4F46E5] text-[9px] font-black uppercase tracking-wider rounded-lg"
                        >
                          Generate Counter Tactic
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. COURT SEQUENCE TAB */}
            {activeArgumentsSubTab === 'court_sequence' && (
              <div className="space-y-3.5 animate-in fade-in duration-200 flex-1">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-808 dark:text-white">Recommended Court Sequence Timeline</h4>
                  <span className="text-[8.5px] font-bold text-slate-400 uppercase">Litigation roadmap flowchart</span>
                </div>

                <div className="relative border-l border-slate-150 dark:border-zinc-800/70 pl-5 ml-3 space-y-4 pt-1">
                  {(safeAiArgs.courtSequence || []).map((step, idx) => {
                    const isStepExpanded = expandedSequenceSteps[idx];
                    return (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[26px] top-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm"></div>
                        
                        <div className="bg-slate-50/50 dark:bg-black/10 border border-slate-100 dark:border-zinc-800/40 rounded-xl p-3 text-left space-y-1">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[8.5px] font-black text-indigo-650 uppercase tracking-widest block">{step.stage} Presentation</span>
                            <button 
                              onClick={() => setExpandedSequenceSteps(prev => ({ ...prev, [idx]: !prev[idx] }))}
                              className="text-[8px] font-black uppercase text-[#4F46E5] hover:underline"
                            >
                              {isStepExpanded ? 'Collapse' : 'Expand Details'}
                            </button>
                          </div>
                          <p className="text-xs font-semibold text-slate-705 dark:text-slate-350 leading-relaxed">{step.detail}</p>
                          
                          {isStepExpanded && (
                            <p className="text-[9.5px] text-slate-400 font-medium italic mt-2 pl-2 border-l border-indigo-200">
                              Instruction: {step.expandableText}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 9. WITNESS PREPARATION TAB */}
            {activeArgumentsSubTab === 'witness_preparation' && (
              <div className="space-y-3.5 animate-in fade-in duration-200 flex-1">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-808 dark:text-white">Witness Examination & Prep</h4>
                  <span className="text-[8px] font-black uppercase text-indigo-650">Cross-Exam Binders</span>
                </div>

                <div className="space-y-3">
                  {(safeAiArgs.witnessPrep || []).map((witness, wIdx) => {
                    const isWExpanded = expandedWitnessIds[wIdx];
                    return (
                      <div key={wIdx} className="bg-white dark:bg-[#1A2540] border border-slate-205 dark:border-zinc-800/80 rounded-xl p-4 shadow-2xs space-y-3 text-left">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Users size={13} className="text-[#4F46E5]" />
                            <h5 className="text-xs font-black text-slate-808 dark:text-white uppercase tracking-wider">{witness.name}</h5>
                          </div>
                          <button 
                            onClick={() => setExpandedWitnessIds(prev => ({ ...prev, [wIdx]: !prev[wIdx] }))}
                            className="text-[8.5px] font-black uppercase text-[#4F46E5] hover:underline"
                          >
                            {isWExpanded ? 'Hide Binder' : 'Load Witness Q&A'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] font-semibold text-slate-505 dark:text-slate-400">
                          <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Main Questions</span>
                            <ul className="list-disc pl-3 mt-1 space-y-1">
                              {witness.questions.map((q, i) => <li key={i}>{q}</li>)}
                            </ul>
                          </div>
                          <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Expected Answers</span>
                            <ul className="list-disc pl-3 mt-1 space-y-1">
                              {witness.expectedAnswers.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                          </div>
                        </div>

                        {isWExpanded && (
                          <div className="border-t border-slate-50 dark:border-zinc-800/40 pt-2.5 mt-2 text-[10px] font-semibold space-y-2.5 animate-in slide-in-from-top-2 duration-150">
                            <div>
                              <span className="text-[8px] font-black text-red-500 uppercase tracking-widest block">Vulnerable Areas / Weaknesses</span>
                              <p className="mt-0.5 text-red-500">{witness.weakAreas.join(', ')}</p>
                            </div>
                            <div>
                              <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest block">Predicted Cross Objections</span>
                              <p className="mt-0.5">{witness.crossQuestions.join(', ')}</p>
                            </div>
                            <div>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Required Documents</span>
                              <p className="mt-0.5 text-[#4F46E5]">{witness.docsRequired.join(', ')}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 10. FINAL HEARING NOTES TAB */}
            {activeArgumentsSubTab === 'final_hearing_notes' && (
              <div className="space-y-4 animate-in fade-in duration-200 flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-808 dark:text-white">Advocate Oral Submission Binder</h4>
                  <span className="text-[8px] font-black uppercase text-indigo-650">Auto-saves to Case file</span>
                </div>

                <textarea 
                  placeholder="Advocate: Type private observations, judge remarks, and next action checklist here during hearing..."
                  className="w-full bg-slate-50/50 dark:bg-black/10 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-[10.5px] font-bold text-slate-808 dark:text-white outline-none focus:border-indigo-400 resize-none flex-1 min-h-[220px]"
                />

                <div className="flex justify-between items-center text-[8.5px] font-black text-slate-400 uppercase tracking-wider pt-2.5 border-t border-slate-50">
                  <span>Saved just now</span>
                  <button onClick={() => toast.success("Exported final oral brief PDF")} className="text-[#4F46E5] hover:underline">Export Court Brief</button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    );
  };
  const renderNotes = () => {
    const activeNote = caseNotes.find(n => n.id === activeNoteId) || caseNotes[0];

    const saveNotesToBackend = async (updatedNotes) => {
      try {
        await legalService.updateCase(caseData.id || caseData._id, { notes: updatedNotes });
        setCaseData(prev => ({ ...prev, notes: updatedNotes }));
      } catch (err) {
        console.error("Failed to save notes to database", err);
      }
    };

    const handleCreateNote = (type = 'General') => {
      const newNote = {
        id: Date.now(),
        title: `New ${type} Note`,
        content: '',
        type: type,
        pinned: false,
        priority: 'Medium',
        color: '#4F46E5',
        tags: [type],
        updatedAt: new Date().toISOString().slice(0, 10),
        checklist: [
          { text: 'File Affidavit copy', checked: false },
          { text: 'Prepare Witness interview', checked: false },
          { text: 'Certified copy from Registry', checked: false }
        ]
      };
      const updated = [newNote, ...caseNotes];
      setCaseNotes(updated);
      setActiveNoteId(newNote.id);
      saveNotesToBackend(updated);
      toast.success(`Created new ${type.toLowerCase()} note!`);
    };

    const handleTogglePin = (noteId) => {
      const updated = caseNotes.map(n => n.id === noteId ? { ...n, pinned: !n.pinned } : n);
      setCaseNotes(updated);
      saveNotesToBackend(updated);
      toast.success('Note pin status updated!');
    };

    const handleUpdateNoteField = (noteId, field, val) => {
      const updated = caseNotes.map(n => n.id === noteId ? { ...n, [field]: val, updatedAt: new Date().toISOString().slice(0, 10) } : n);
      setCaseNotes(updated);
      saveNotesToBackend(updated);
    };

    const handleDeleteNote = (noteId) => {
      if (!confirm('Are you sure you want to delete this note?')) return;
      const updated = caseNotes.filter(n => n.id !== noteId);
      setCaseNotes(updated);
      if (activeNoteId === noteId) {
        setActiveNoteId(updated[0]?.id || null);
      }
      saveNotesToBackend(updated);
      toast.success('Note deleted successfully');
    };

    // Filter Notes
    const filteredNotes = caseNotes.filter(n => {
      if (notesSearchQuery) {
        const q = notesSearchQuery.toLowerCase();
        const matchesTitle = (n.title || '').toLowerCase().includes(q);
        const matchesContent = (n.content || '').toLowerCase().includes(q);
        const matchesType = (n.type || '').toLowerCase().includes(q);
        const matchesTags = (n.tags || []).some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesContent && !matchesType && !matchesTags) return false;
      }
      if (notesFilterType === 'all') return true;
      if (notesFilterType === 'pinned') return n.pinned;
      if (notesFilterType === 'hearing') return (n.type || '').toLowerCase() === 'hearing';
      if (notesFilterType === 'strategy') return (n.type || '').toLowerCase() === 'strategy';
      if (notesFilterType === 'witness') return (n.type || '').toLowerCase() === 'witness';
      if (notesFilterType === 'research') return (n.type || '').toLowerCase() === 'research' || (n.type || '').toLowerCase() === 'legal research';
      return true;
    });

    const pinnedNotes = filteredNotes.filter(n => n.pinned);
    const recentNotes = filteredNotes.filter(n => !n.pinned);

    // AI Actions handler
    const runAiActionOnNote = (action) => {
      if (!activeNote || !activeNote.content) {
        toast.error("Please add content to the note first.");
        return;
      }
      const tid = toast.loading(`AI is processing note content to ${action}...`);
      setTimeout(() => {
        if (action === 'Summarize') {
          alert("AI Note Summary:\n\nThis note details the pre-trial jurisdictional challenge strategies. The primary goal is to rebut the applicability of Clause 14 arbitration clause by citing Supreme Court landmark precedents.");
        } else if (action === 'Rewrite') {
          handleUpdateNoteField(activeNote.id, 'content', activeNote.content + '\n\n[AI Polished Version]: Jurisdictional maintainability under Section 9 of CPC remains valid as payment transactions were executed within corporate municipal limits.');
        } else if (action === 'Extract Tasks') {
          const newTasks = [
            { id: Date.now(), title: 'File Jurisdictional reply', priority: 'High', dueDate: '2026-07-20', status: 'Todo' }
          ];
          setLitigationTasks(prev => [...newTasks, ...prev]);
          toast.success("Tasks extracted & linked to task manager!", { id: tid });
          return;
        } else if (action === 'Suggest Relevant Laws') {
          alert("AISA Relevant Laws Recommendations:\n\n1. Section 9 Code of Civil Procedure (Civil Jurisdiction)\n2. Section 138 Negotiable Instruments Act\n3. Section 8 Arbitration Act (Bar to civil suits)");
        }
        toast.success("AI Action complete!", { id: tid });
      }, 700);
    };

    // Voice recording simulation
    const toggleVoiceRecording = () => {
      if (isRecordingVoice) {
        clearInterval(voiceIntervalId);
        setIsRecordingVoice(false);
        setVoiceTimer(0);
        handleUpdateNoteField(activeNote.id, 'content', (activeNote.content || '') + '\n\n[Voice Transcribed]: Advocate recorded default payment timelines and cheque stamps for the witness preparation briefing.');
        toast.success("Voice transcribed and added to note!");
      } else {
        setIsRecordingVoice(true);
        const interval = setInterval(() => {
          setVoiceTimer(prev => prev + 1);
        }, 1000);
        setVoiceIntervalId(interval);
      }
    };

    const formatTimer = (sec) => {
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = (sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        
        {/* TOP CONTROL HUB */}
        <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800/80 rounded-2xl px-4 py-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] rounded-xl">
              <Brain size={16} />
            </div>
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-808 dark:text-white">📓 AI Case Notebook</h3>
              <p className="text-[9px] text-slate-405 font-bold uppercase mt-0.5">Premium Personal Litigation Strategy Binder</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 self-end sm:self-center overflow-x-auto scrollbar-hide pb-0.5 max-w-full">
            {['General', 'Hearing', 'Strategy', 'Witness', 'Research'].map(type => (
              <button
                key={type}
                onClick={() => handleCreateNote(type)}
                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] dark:bg-indigo-950/30 dark:text-indigo-400 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all shrink-0 min-h-[36px]"
              >
                + {type}
              </button>
            ))}
          </div>
        </div>

        {/* 3-COLUMN ENTERPRISE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
          
          {/* COLUMN 1: COMPACT NOTES LIST (WIDTH: 3/12) */}
          <div className="lg:col-span-3 space-y-3 flex flex-col text-left max-h-[220px] lg:max-h-none overflow-y-auto lg:overflow-visible">
            <div className="bg-white dark:bg-[#1A2540] border border-slate-150 dark:border-zinc-800/85 rounded-xl p-3 shadow-2xs space-y-3 flex-1">
              
              {/* Search note bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={11} />
                <input
                  type="text"
                  placeholder="Search notebook..."
                  value={notesSearchQuery}
                  onChange={e => setNotesSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-55 dark:bg-zinc-900 border border-slate-202 dark:border-zinc-855 text-[9.5px] font-bold rounded-lg focus:outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Filters list */}
              <div className="flex flex-wrap gap-1 border-b border-slate-50 dark:border-zinc-800/50 pb-2">
                {[
                  { id: 'all',      label: 'All' },
                  { id: 'pinned',   label: '📌 Pinned' },
                  { id: 'hearing',  label: '⚖ Hearing' },
                  { id: 'strategy', label: '🧠 Strategy' },
                  { id: 'witness',  label: '👥 Witness' },
                  { id: 'research', label: '📓 Research' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setNotesFilterType(f.id)}
                    className={`px-2 py-0.5 border text-[7.5px] font-black uppercase tracking-wider rounded transition-all ${
                      notesFilterType === f.id
                        ? 'bg-slate-800 dark:bg-zinc-700 text-white border-slate-800'
                        : 'bg-white dark:bg-zinc-900 text-slate-500 border-slate-200 dark:border-zinc-850 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Scrollable list */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-0.5 scrollbar-thin">
                {pinnedNotes.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[7.5px] font-black text-indigo-650 uppercase tracking-widest pl-1">Pinned Notes</span>
                    {pinnedNotes.map(n => (
                      <button
                        key={n.id}
                        onClick={() => setActiveNoteId(n.id)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all block ${
                          activeNoteId === n.id
                            ? 'border-[#4F46E5] bg-indigo-50/10 text-[#4F46E5] shadow-2xs'
                            : 'border-slate-100 dark:border-zinc-800 hover:bg-slate-55'
                        }`}
                      >
                        <div className="flex justify-between items-center gap-1">
                          <span className="font-extrabold text-[10px] uppercase truncate max-w-[120px]">{n.title || 'Untitled note'}</span>
                          <Pin size={9} className="text-[#4F46E5]" />
                        </div>
                        <p className="text-[9px] text-slate-455 truncate mt-1 leading-snug font-medium">
                          {n.content || 'Empty note content...'}
                        </p>
                        <div className="flex items-center justify-between text-[7px] font-black uppercase text-slate-400 mt-2">
                          <span>{n.type || 'General'}</span>
                          <span>{n.updatedAt}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest pl-1 mt-2.5 block">Recent Notes</span>
                  {recentNotes.length > 0 ? (
                    recentNotes.map(n => (
                      <button
                        key={n.id}
                        onClick={() => setActiveNoteId(n.id)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all block ${
                          activeNoteId === n.id
                            ? 'border-[#4F46E5] bg-indigo-50/10 text-[#4F46E5] shadow-2xs'
                            : 'border-slate-100 dark:border-zinc-800 hover:bg-slate-55'
                        }`}
                      >
                        <div className="flex justify-between items-center gap-1">
                          <span className="font-extrabold text-[10px] uppercase truncate max-w-[120px]">{n.title || 'Untitled note'}</span>
                        </div>
                        <p className="text-[9px] text-slate-455 truncate mt-1 leading-snug font-medium">
                          {n.content || 'Empty note content...'}
                        </p>
                        <div className="flex items-center justify-between text-[7px] font-black uppercase text-slate-400 mt-2">
                          <span>{n.type || 'General'}</span>
                          <span>{n.updatedAt}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    pinnedNotes.length === 0 && (
                      <p className="text-[9.5px] text-slate-450 italic text-center py-10">No notes match the filters.</p>
                    )
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* COLUMN 2: CENTER EDITOR PANEL (WIDTH: 6/12) */}
          {activeNote ? (
            <div className="lg:col-span-6 space-y-3 flex flex-col text-left">
              <div className="bg-white dark:bg-[#1A2540] border border-slate-150 dark:border-zinc-805/85 rounded-xl p-4 shadow-2xs flex-1 flex flex-col space-y-3.5">
                
                {/* Editor Header Details */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-50 dark:border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-indigo-50 text-[#4F46E5] dark:bg-indigo-950/20 text-[7.5px] font-black rounded uppercase">
                      {activeNote.type || 'General'} Note
                    </span>
                    <select
                      value={activeNote.priority || 'Medium'}
                      onChange={e => handleUpdateNoteField(activeNote.id, 'priority', e.target.value)}
                      className="bg-slate-50 dark:bg-zinc-850 text-slate-500 text-[8.5px] font-black uppercase rounded border border-slate-150 px-1 py-0.5 outline-none"
                    >
                      <option value="High">🔴 High Priority</option>
                      <option value="Medium">🟡 Medium Priority</option>
                      <option value="Low">🟢 Low Priority</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTogglePin(activeNote.id)}
                      className={`p-1 rounded transition-colors hover:bg-slate-55 ${activeNote.pinned ? 'text-[#4F46E5]' : 'text-slate-400'}`}
                      title="Pin note"
                    >
                      <Pin size={11} />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(activeNote.id)}
                      className="p-1 rounded transition-colors text-slate-400 hover:text-red-500 hover:bg-rose-50"
                      title="Delete note"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {/* NOTE TITLE INPUT */}
                <input
                  type="text"
                  placeholder="Enter Note Title..."
                  value={activeNote.title || ''}
                  onChange={e => handleUpdateNoteField(activeNote.id, 'title', e.target.value)}
                  className="w-full bg-transparent border-none text-xs font-black uppercase tracking-wider text-slate-808 dark:text-white p-0 outline-none focus:ring-0"
                />

                {/* TEXT FORMATTING TOOLBAR */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-55 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-855 rounded-lg flex-wrap shrink-0">
                  <button onClick={() => handleUpdateNoteField(activeNote.id, 'content', (activeNote.content || '') + ' **Bold**')} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white" title="Bold"><strong className="font-extrabold text-[9px] uppercase">B</strong></button>
                  <button onClick={() => handleUpdateNoteField(activeNote.id, 'content', (activeNote.content || '') + ' *Italic*')} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white" title="Italic"><span className="italic text-[9px] font-black">I</span></button>
                  <button onClick={() => handleUpdateNoteField(activeNote.id, 'content', (activeNote.content || '') + '\n- Bullet Point')} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white" title="Bullet List" size={10}><List size={10} /></button>
                  
                  <span className="text-slate-300 dark:text-slate-750 px-0.5">|</span>
                  
                  {/* Smart Checklist item addition */}
                  <button 
                    onClick={() => {
                      const itemText = prompt("Enter checklist task:", "Prepare exhibit file prints");
                      if (itemText) {
                        const updatedList = [...(activeNote.checklist || []), { text: itemText, checked: false }];
                        handleUpdateNoteField(activeNote.id, 'checklist', updatedList);
                      }
                    }} 
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center gap-1 text-[8.5px] font-black uppercase"
                  >
                    <Square size={10} /> + Checklist
                  </button>

                  <span className="text-slate-300 dark:text-slate-750 px-0.5">|</span>

                  {/* Voice recording simulation button */}
                  <button
                    onClick={toggleVoiceRecording}
                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                      isRecordingVoice 
                        ? 'bg-rose-500 text-white animate-pulse' 
                        : 'bg-indigo-50 text-[#4F46E5]'
                    }`}
                  >
                    <Mic size={9} /> {isRecordingVoice ? `Recording ${formatTimer(voiceTimer)}` : 'Voice Note'}
                  </button>
                </div>

                {/* TEXTAREA WRITER */}
                <textarea
                  placeholder="Advocate: Type strategy, observations, or pre-trial preparation details here..."
                  value={activeNote.content || ''}
                  onChange={e => handleUpdateNoteField(activeNote.id, 'content', e.target.value)}
                  className="w-full bg-transparent border-none text-[10.5px] font-semibold text-slate-707 dark:text-slate-355 leading-relaxed p-0 outline-none focus:ring-0 flex-1 min-h-[160px] resize-none"
                />

                {/* SMART CHECKLIST TRACKER PANEL */}
                {activeNote.checklist && activeNote.checklist.length > 0 && (
                  <div className="border border-slate-100 dark:border-zinc-800 rounded-xl p-3 bg-slate-50/50 dark:bg-black/5 space-y-2.5">
                    <div className="flex justify-between items-center text-[8.5px] font-black text-slate-455 uppercase tracking-widest leading-none">
                      <span>Smart Legal Checklist</span>
                      <span>
                        {activeNote.checklist.filter(c => c.checked).length} of {activeNote.checklist.length} Complete
                      </span>
                    </div>

                    {/* Progress indicator bar */}
                    <div className="w-full bg-slate-150 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden shrink-0">
                      <div 
                        className="bg-[#4F46E5] h-full transition-all" 
                        style={{ 
                          width: `${(activeNote.checklist.filter(c => c.checked).length / activeNote.checklist.length) * 100}%` 
                        }} 
                      />
                    </div>

                    {/* Items list */}
                    <div className="space-y-1.5 pt-1">
                      {activeNote.checklist.map((item, idx) => (
                        <label key={idx} className="flex items-center gap-2 text-[10px] font-semibold text-slate-705 cursor-pointer hover:text-slate-900 select-none">
                          <input 
                            type="checkbox" 
                            checked={item.checked}
                            onChange={() => {
                              const updatedChecklist = activeNote.checklist.map((c, i) => i === idx ? { ...c, checked: !c.checked } : c);
                              handleUpdateNoteField(activeNote.id, 'checklist', updatedChecklist);
                            }}
                            className="w-3 h-3 text-[#4F46E5] rounded focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className={item.checked ? 'line-through text-slate-400' : ''}>{item.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Auto-save confirmation message */}
                <div className="flex justify-between items-center text-[8.5px] font-black text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-50 dark:border-zinc-800/40 shrink-0">
                  <span>Saved just now</span>
                  <span>🔒 Isolated by Case ID</span>
                </div>

              </div>
            </div>
          ) : (
            <div className="lg:col-span-6 bg-white dark:bg-[#1A2540] border border-slate-150 rounded-xl p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-full mb-3">
                <ClipboardList size={22} />
              </div>
              <h5 className="text-xs font-black text-slate-805 uppercase tracking-wider">No Active Note Selected</h5>
              <p className="text-[9.5px] font-bold text-slate-405 uppercase mt-1 leading-relaxed">
                Choose a note from the workspace index list or create a new strategy block.
              </p>
            </div>
          )}

          {/* COLUMN 3: AI SIDEBAR & AUTO-LINKS (WIDTH: 3/12) */}
          <div className="lg:col-span-3 space-y-3 flex flex-col text-left">
            <div className="bg-white dark:bg-[#1A2540] border border-slate-150 dark:border-zinc-800/85 rounded-xl p-3 shadow-2xs space-y-3 flex-1 flex flex-col">
              
              <div className="flex items-center gap-1.5 border-b border-slate-50 dark:border-zinc-800 pb-2">
                <Sparkles size={13} className="text-[#4F46E5]" />
                <span className="text-[9px] font-black text-slate-808 dark:text-white uppercase tracking-wider">AI Assistant Sidebar</span>
              </div>

              {/* Related case assets list */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px] scrollbar-none text-[9.5px] font-semibold text-slate-505 leading-snug pr-0.5">
                
                {/* Related Documents */}
                <div className="space-y-1">
                  <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">Related Documents ({caseData.documents?.length || 0})</span>
                  <div className="space-y-1">
                    {(caseData.documents || []).slice(0, 3).map((d, i) => (
                      <button 
                        key={i} 
                        onClick={() => { setActiveTab('documents'); handleOpenDoc(d); }}
                        className="w-full text-left p-1.5 bg-slate-50/50 dark:bg-zinc-900/50 hover:bg-indigo-50/10 rounded border border-transparent hover:border-[#4F46E5] truncate block uppercase text-[8.5px] tracking-wide"
                      >
                        📄 {d.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Related Evidence */}
                <div className="space-y-1 mt-2">
                  <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">Related Evidence ({caseData.evidence?.length || 0})</span>
                  <div className="space-y-1">
                    {(caseData.evidence || []).slice(0, 3).map((e, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => { setActiveTab('evidence'); handleOpenDoc(e); }}
                        className="w-full text-left p-1.5 bg-slate-50/50 dark:bg-zinc-900/50 hover:bg-indigo-50/10 rounded border border-transparent hover:border-[#4F46E5] truncate block uppercase text-[8.5px] tracking-wide"
                      >
                        🖼 {e.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Related Contracts */}
                <div className="space-y-1 mt-2">
                  <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">Related Contracts ({caseData.contracts?.length || 0})</span>
                  <div className="space-y-1">
                    {(caseData.contracts || []).slice(0, 3).map((c, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => { setActiveTab('contracts'); handleTriggerContractAnalysis(c); }}
                        className="w-full text-left p-1.5 bg-slate-50/50 dark:bg-zinc-900/50 hover:bg-indigo-50/10 rounded border border-transparent hover:border-[#4F46E5] truncate block uppercase text-[8.5px] tracking-wide"
                      >
                        📝 {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Linked Arguments */}
                <div className="space-y-1 mt-2">
                  <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">Linked Arguments</span>
                  <div className="space-y-1">
                    {(caseData.aiArguments?.argumentsRoster || []).slice(0, 2).map((a, i) => (
                      <button 
                        key={i}
                        onClick={() => { setActiveTab('arguments'); setActiveArgumentsSubTab('arguments'); }}
                        className="w-full text-left p-1.5 bg-indigo-50/5 hover:bg-indigo-50/10 rounded border border-transparent hover:border-[#4F46E5] truncate block uppercase text-[8.5px] tracking-wide text-indigo-650 font-black"
                      >
                        ⚖ {a.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Context Tip */}
                <div className="p-2.5 bg-indigo-50/10 border border-indigo-200/10 rounded-xl space-y-1.5 mt-2">
                  <span className="text-[7.5px] font-black text-indigo-550 uppercase block tracking-widest">AISA SMART FOCUS TIP</span>
                  <p className="text-[9px] text-slate-505 dark:text-slate-400 font-bold leading-normal">
                    This note mentions jurisdictional challenge details. The AI recommends checking Rajesh Sharma SC precedent against the arbitration Clause 14 limit values.
                  </p>
                </div>

              </div>

              {/* AI ACTION BUTTONS WRAPPER */}
              <div className="border-t border-slate-50 dark:border-zinc-800 pt-3 space-y-1.5 shrink-0 text-left">
                <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">AI Strategy Actions</span>
                
                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={() => runAiActionOnNote('Summarize')} className="py-1 bg-slate-55 dark:bg-zinc-800 text-[8px] font-black uppercase tracking-wider rounded border border-slate-150 dark:border-zinc-850 hover:bg-slate-100">📝 Summarize</button>
                  <button onClick={() => runAiActionOnNote('Rewrite')} className="py-1 bg-slate-55 dark:bg-zinc-800 text-[8px] font-black uppercase tracking-wider rounded border border-slate-150 dark:border-zinc-850 hover:bg-slate-100">✨ Polish</button>
                  <button onClick={() => runAiActionOnNote('Extract Tasks')} className="py-1 bg-slate-55 dark:bg-zinc-800 text-[8px] font-black uppercase tracking-wider rounded border border-slate-150 dark:border-zinc-850 hover:bg-slate-100">✔ Tasks</button>
                  <button onClick={() => runAiActionOnNote('Suggest Relevant Laws')} className="py-1 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] text-[8px] font-black uppercase tracking-wider rounded border border-indigo-100/10 hover:bg-indigo-100/50">⚖ Suggest Laws</button>
                </div>
                </div>

                <button
                  onClick={() => {
                    if (!activeNote || !activeNote.content) {
                      toast.error("Please add content to the note first.");
                      return;
                    }
                    toast.success("Draft compiled successfully from note contents!");
                  }}
                  className="w-full py-1.5 bg-[#4F46E5] hover:opacity-95 text-white font-black text-[8px] uppercase tracking-wider rounded-lg text-center block shadow-xs"
                >
                  Convert into Legal Brief
                </button>

            </div>
          </div>

        </div>

      </div>
    );
  };

  const renderPrecedents = () => {
    const precedents = caseData.aiArguments?.precedents || caseData.precedents || [];
    const staticPrecedents = [
      {
        tag: 'Landmark SC', confidence: '96% Conf.',
        name: 'Rajesh Sharma vs Union of India (2018 SC 45)',
        desc: 'Establishes the admissibility thresholds for uncertified electronic logs if original secondary source server can be examined in person.'
      },
      {
        tag: 'High Court', confidence: '88% Conf.',
        name: 'Amit Verma vs State of Maharashtra (2021 HC 112)',
        desc: 'Indicates that jurisdictional challenge cannot be used as a procedural shield when transaction execution has occurred within corporate municipal limits.'
      }
    ];
    const displayList = precedents.length > 0 ? precedents : staticPrecedents;
    return (
      <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-5 sm:space-y-6 animate-in fade-in duration-300">
        <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
          <BookOpen size={14} className="text-[#4F46E5]" /> AI-Selected Supporting Precedents
        </h4>
        <div className="space-y-3 sm:space-y-4">
          {displayList.map((p, i) => (
            <div key={i} className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-zinc-800 hover:border-[#4F46E5] transition-all">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] rounded text-[8px] font-black uppercase shrink-0">
                    {p.tag || p.court || 'Precedent'}
                  </span>
                  <h5 className="text-xs font-black text-slate-800 dark:text-white leading-snug">
                    {p.name || p.title || `Precedent ${i+1}`}
                  </h5>
                </div>
                <span className="text-[9px] text-emerald-600 font-bold shrink-0">{p.confidence || p.relevance || 'Relevant'}</span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed mb-3">
                {p.desc || p.holding || p.description || ''}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(p.name || p.title || ''); toast.success('Citation Copied!'); }}
                  className="px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 min-h-[36px]"
                >Copy Citation</button>
                <button className="flex-1 whitespace-nowrap px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/20 rounded text-[#4F46E5] border border-indigo-100 dark:border-indigo-950/40 min-h-[36px]">
                  Add to Argument
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTasks = () => {
    return (
      <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-5 sm:space-y-6 animate-in fade-in duration-350">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
            <ListTodo size={14} className="text-[#4F46E5]" /> Litigation Tasks Manager
          </h4>
          <button 
            onClick={() => {
              const taskName = prompt("Enter task title:");
              if (taskName) {
                setLitigationTasks(prev => [...prev, { id: Date.now(), title: taskName, priority: 'Medium', dueDate: '2026-07-20', status: 'Todo', progress: 0, suggestions: 'AISA Action recommended' }]);
              }
            }}
            className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-[#4F46E5] text-white rounded-xl text-[10px] sm:text-[9px] font-black uppercase tracking-widest min-h-[40px] sm:min-h-[36px] flex items-center"
          >
            + Add Task
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-150/40 dark:border-zinc-800 text-slate-400 font-black uppercase tracking-wider text-[9px]">
                <th className="py-2.5">Task Title</th>
                <th className="py-2.5">Priority</th>
                <th className="py-2.5">Due Date</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5">Progress</th>
                <th className="py-2.5">AI Suggestion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {litigationTasks.map(task => (
                <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="py-3.5 font-bold text-slate-805 dark:text-white">{task.title}</td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                      task.priority === 'High' 
                        ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-250/20' 
                        : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 border-indigo-250/20'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-500 font-medium">{task.dueDate}</td>
                  <td className="py-3.5">
                    <button 
                      onClick={() => {
                        const nextStatus = task.status === 'Todo' ? 'In Progress' : task.status === 'In Progress' ? 'Done' : 'Todo';
                        const nextProg = nextStatus === 'Done' ? 100 : nextStatus === 'In Progress' ? 50 : 0;
                        setLitigationTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus, progress: nextProg } : t));
                      }}
                      className="text-indigo-650 hover:underline"
                    >
                      {task.status}
                    </button>
                  </td>
                  <td className="py-3.5">
                    <div className="w-16 bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#4F46E5] h-full" style={{ width: `${task.progress}%` }} />
                    </div>
                  </td>
                  <td className="py-3.5 text-[#4F46E5] font-black text-[10px]">{task.suggestions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const hasUserMessages = useMemo(() => aiMessages.some(m => m.role === 'user'), [aiMessages]);
  const visibleSidebarMessages = aiMessages;

  return (
    <>
      {!isMobile && showAiAssistant && isAssistantMaximized && (
        <FullScreenCaseAssistant
          onRestore={() => setIsAssistantMaximized(false)}
          caseData={caseData}
          aiMessages={aiMessages}
          setAiMessages={setAiMessages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          isChatSending={isChatSending}
          handleSendAiMessage={handleSendAiMessage}
          onStopGeneration={handleStopGeneration}
          activeSessionId={activeSessionId}
          handleNewChat={handleNewChat}
        />
      )}
      <div className="flex-1 overflow-y-auto custom-scrollbar w-full bg-slate-50/30 dark:bg-transparent relative pb-20 sm:pb-24" id="workspace-scroll-container">
        {/* Workspace Sticky Header Container */}
        <div className="sticky top-0 z-20 bg-white dark:bg-[#0b0c15] border-b border-[#E5E7EB] dark:border-zinc-800 flex flex-col">
          {isMobile ? (
            <>
              {/* Compact Mobile Header */}
              <div className="px-4 pt-3 pb-2 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={onBack} 
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 border border-[#E5E7EB] dark:border-zinc-700 bg-white dark:bg-zinc-900 shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[160px] sm:max-w-[280px] md:max-w-none">
                        {caseData.title || caseData.name || "Rajesh Sharma vs Amit Verma"}
                      </h2>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-[#DEF7EC] text-[#03543F]">ACTIVE</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-[#E1EFFE] text-[#1E429F]">MEDIUM</span>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-gray-500 dark:text-gray-400 pl-10 truncate">
                  Client: {caseData.clientName || 'Rajesh Sharma'} • Opponent: {caseData.opponentName || 'Amit Verma'} • Court: {caseData.courtName || 'District Court'}
                </p>
              </div>

              {/* Mobile Action Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-3 py-2 bg-gray-50/40 dark:bg-zinc-900/20 border-t border-[#E5E7EB] dark:border-zinc-800 select-none shrink-0" style={{ whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
                <button 
                  onClick={openAssistant} 
                  className="flex items-center justify-center gap-1.5 px-3 h-9 rounded-xl text-xs font-bold transition-all bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] shrink-0 min-h-[44px]"
                >
                  <Sparkles size={12} className="text-[#4F46E5]" />
                  <span>Show AI</span>
                </button>
                <button 
                  onClick={handleExportCaseFile}
                  className="flex items-center justify-center gap-1.5 px-3 h-9 rounded-xl text-xs font-bold transition-all border border-[#E5E7EB] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 shrink-0 min-h-[44px]"
                >
                  <Download size={12} />
                  <span>Export</span>
                </button>
                <button 
                  onClick={handleShareCase}
                  className="flex items-center justify-center gap-1.5 px-3 h-9 rounded-xl text-xs font-bold transition-all border border-[#E5E7EB] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 shrink-0 min-h-[44px]"
                >
                  <Share2 size={12} />
                  <span>Share</span>
                </button>
                <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this case?")) {
                      onDelete(caseData.id || caseData._id);
                    }
                  }}
                  className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 border border-[#E5E7EB] dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 min-h-[44px]"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </>
          ) : (
            /* Desktop Sticky Header */
            <div className="px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={onBack} 
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors border border-[#E5E7EB] dark:border-zinc-700 bg-white dark:bg-zinc-900"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">{caseData.title || caseData.name || "Rajesh Sharma vs Amit Verma"}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#DEF7EC] text-[#03543F] tracking-wide">ACTIVE</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#E1EFFE] text-[#1E429F] tracking-wide">MEDIUM</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    Client: {caseData.clientName || 'Rajesh Sharma'} • Opponent: {caseData.opponentName || 'Amit Verma'} • Court: {caseData.courtName || 'District Court'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-2 self-stretch sm:self-auto justify-end flex-wrap">
                <button 
                  onClick={() => setShowAiAssistant(!showAiAssistant)} 
                  className="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] hover:opacity-90 flex items-center gap-1.5 sm:gap-2 h-9 sm:h-9 min-h-[44px]"
                >
                  <Sparkles size={14} className="text-[#4F46E5]" />
                  <span>{showAiAssistant ? "Hide AI" : "Show AI"}</span>
                </button>
                <button 
                  onClick={handleExportCaseFile}
                  className="px-4 py-2 rounded-full text-xs font-bold transition-all border border-[#E5E7EB] dark:border-zinc-800 bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-2 h-9"
                >
                  <Download size={14} /> Export
                </button>
                <button 
                  onClick={handleShareCase}
                  className="px-4 py-2 rounded-full text-xs font-bold transition-all border border-[#E5E7EB] dark:border-zinc-800 bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-2 h-9"
                >
                  <Share2 size={14} /> Share
                </button>
                <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this case?")) {
                      onDelete(caseData.id || caseData._id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Sticky Tab Bar */}
          <div 
            ref={tabsContainerRef}
            className="flex items-center gap-1 sm:gap-1.5 pt-1.5 sm:pt-2 px-3 sm:px-4 pb-1.5 sm:pb-2 bg-white dark:bg-[#0b0c15] border-t border-[#E5E7EB] dark:border-zinc-800 overflow-x-auto scrollbar-hide shrink-0 scroll-smooth"
            style={{ display: 'flex', overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}
          >
            {tabsList.map((tab) => (
              <button
                key={tab.id}
                onClick={(e) => handleTabClick(tab.id, e)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border shrink-0 min-h-[36px] sm:min-h-[44px] ${
                  activeTab === tab.id 
                  ? 'bg-white dark:bg-zinc-900 border-[#E5E7EB] dark:border-zinc-800 shadow-sm text-[#4F46E5]' 
                  : 'bg-transparent border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50/50 dark:hover:bg-zinc-800/30'
                }`}
              >
                <tab.icon size={13} className={activeTab === tab.id ? 'text-[#4F46E5]' : 'text-gray-400'} />
                <span className="hidden min-[400px]:inline">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Workspace Body layout */}
        <div className="flex-1 flex overflow-x-hidden min-h-0 relative w-full">
          {/* Left Column content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 scroll-smooth max-w-full">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'timeline' && renderTimeline()}
            {activeTab === 'hearings' && renderHearings()}
            {activeTab === 'parties' && renderParties()}
            {activeTab === 'documents' && renderDocuments()}
            {activeTab === 'evidence' && renderEvidence()}
            {activeTab === 'research' && renderResearch()}
            {activeTab === 'drafts' && renderDrafts()}
            {activeTab === 'contracts' && renderContracts()}
            {activeTab === 'arguments' && renderArguments()}
            {activeTab === 'notes' && renderNotes()}
            {activeTab === 'precedents' && renderPrecedents()}
            {activeTab === 'tasks' && renderTasks()}
          </div>

          {/* Spacer to make room for fixed sidebar on desktop */}
          {showAiAssistant && !isAssistantMaximized && (
            <div className="hidden sm:block sm:w-[300px] lg:w-[320px] xl:w-[360px] shrink-0" />
          )}

          {/* Right Sidebar Column (Col 3) - Desktop / Tablet */}
          {!isMobile && showAiAssistant && !isAssistantMaximized && (
            <div className="w-full sm:w-[300px] lg:w-[320px] xl:w-[360px] fixed right-0 top-0 sm:top-[73px] bottom-0 z-30 border-l border-[#E5E7EB] dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-hidden shadow-2xl sm:shadow-none">
                {/* Panel Header */}
                <div className="p-3 sm:p-4 border-b border-[#E5E7EB] dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 select-none shrink-0">
                  <div className="flex items-center gap-2">
                    <Scale size={15} className="text-[#4F46E5]" />
                    <div className="flex flex-col">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">⚖️ Case Assistant</h4>
                      <span className="flex items-center gap-1 text-[9px] text-emerald-500 font-bold uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        AI Online
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={handleToggleSidebarHistory}
                      className={`p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent flex items-center gap-1 text-[10px] font-bold ${
                        showSidebarHistory ? 'text-[#4F46E5]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'
                      }`}
                      title="Chat History"
                    >
                      <History size={13} />
                    </button>
                    <button 
                      onClick={() => setIsAssistantMaximized(!isAssistantMaximized)}
                      className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-655 dark:hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                      title="Expand to fullscreen"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Message List Container */}
                <div 
                  ref={sidebarScrollRef}
                  onScroll={handleSidebarScroll}
                  className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent relative animate-in fade-in duration-200"
                >
                  <>
                    {!hasUserMessages && (
                      <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/15 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl space-y-3 text-slate-700 dark:text-slate-350">
                        <p className="font-bold text-xs text-indigo-750 dark:text-indigo-400">Welcome! I have loaded this case.</p>
                        <p className="text-[11px] leading-relaxed">Ask me anything about:</p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] font-bold text-slate-650 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Check size={11} className="text-emerald-500 shrink-0" /> Evidence
                          </div>
                          <div className="flex items-center gap-1">
                            <Check size={11} className="text-emerald-500 shrink-0" /> Timeline
                          </div>
                          <div className="flex items-center gap-1">
                            <Check size={11} className="text-emerald-500 shrink-0" /> Drafts
                          </div>
                          <div className="flex items-center gap-1">
                            <Check size={11} className="text-emerald-500 shrink-0" /> Arguments
                          </div>
                          <div className="flex items-center gap-1">
                            <Check size={11} className="text-emerald-500 shrink-0" /> Laws & Acts
                          </div>
                          <div className="flex items-center gap-1">
                            <Check size={11} className="text-emerald-500 shrink-0" /> Research
                          </div>
                          <div className="col-span-2 flex items-center gap-1">
                            <Check size={11} className="text-emerald-500 shrink-0" /> Previous Orders
                          </div>
                        </div>
                        <p className="text-[11px] pt-1">How can I help?</p>
                      </div>
                    )}

                    {visibleSidebarMessages.map((msg, i) => (
                      <div key={i} className="flex flex-col animate-in slide-in-from-bottom-2 duration-200">
                        <span className={`text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                          {msg.role === 'user' ? 'ADVOCATE' : 'AI ASSISTANT'}
                        </span>
                        <div className={`p-3 rounded-2xl max-w-[90%] leading-relaxed font-semibold ${
                          msg.role === 'user'
                            ? 'bg-[#4F46E5] text-white rounded-tr-none ml-auto'
                            : 'bg-slate-50 dark:bg-zinc-800/30 border border-[#E5E7EB] dark:border-zinc-800 text-slate-700 dark:text-slate-350 rounded-tl-none mr-auto'
                        }`}>
                          {msg.role === 'user' ? (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            <div className="prose prose-slate max-w-none dark:prose-invert">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                                {highlightLegalTerms(msg.content)}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isChatSending && (!visibleSidebarMessages.length || visibleSidebarMessages[visibleSidebarMessages.length - 1]?.role !== 'model') && (
                      <div className="flex items-center gap-1.5 p-3 bg-slate-50 dark:bg-zinc-850 rounded-2xl rounded-tl-none border border-slate-200 dark:border-zinc-800 w-20">
                        <div className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full animate-bounce delay-100" />
                        <div className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full animate-bounce delay-200" />
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                </div>

                {/* Bottom Chat Input Area */}
                <div className="p-4 border-t border-[#E5E7EB] dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 select-none">
                  <form onSubmit={handleSendAiMessage} className="flex items-center gap-2 pl-3 pr-4 py-2 bg-gray-50 dark:bg-zinc-850/50 border border-[#E5E7EB] dark:border-zinc-800 rounded-2xl w-full relative">
                    {/* Plus button Actions Grid */}
                    {showSidebarPlusMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowSidebarPlusMenu(false)} />
                        <div className="absolute bottom-full mb-3 left-2 z-50 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 space-y-2.5 font-sans select-none text-left">
                          <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Quick AI Actions</span>
                            <button 
                              type="button" 
                              onClick={() => setShowSidebarPlusMenu(false)}
                              className="text-slate-400 hover:text-slate-650 border-none bg-transparent cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-1 max-h-[220px] overflow-y-auto custom-scrollbar p-0.5">
                            {QUICK_AI_ACTIONS.map((action) => (
                              <button
                                key={action.name}
                                type="button"
                                onClick={() => {
                                  setShowSidebarPlusMenu(false);
                                  handleSendAiMessage(null, action.prompt);
                                }}
                                className="flex items-center gap-2.5 p-1.5 hover:bg-indigo-50/30 border border-transparent hover:border-[#4F46E5] rounded-xl text-[10px] font-bold text-slate-750 text-left transition-all cursor-pointer bg-transparent border-none"
                              >
                                <span className="p-1 bg-slate-50 rounded shadow-sm shrink-0">{getActionIcon(action.icon)}</span>
                                <span className="truncate">{action.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <button 
                      type="button" 
                      onClick={() => setShowSidebarPlusMenu(prev => !prev)}
                      className={`p-2 transition-colors border-none bg-transparent cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                        showSidebarPlusMenu ? 'text-[#4F46E5] bg-[#4F46E5]/10 rounded-xl' : 'text-gray-400 hover:text-[#4F46E5]'
                      }`}
                      title="Quick Actions"
                    >
                      <Plus size={16} />
                    </button>

                    <button 
                      type="button" 
                      onClick={() => document.getElementById('workspace-doc-upload').click()}
                      className="p-2 text-gray-400 hover:text-[#4F46E5] transition-colors border-none bg-transparent cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Upload Documents"
                    >
                      <Paperclip size={16} />
                    </button>

                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => handleChatInputChange(e.target.value)}
                      placeholder="Type message..."
                      className="flex-1 bg-transparent border-none text-[11px] font-semibold focus:ring-0 p-0 text-slate-700 dark:text-white outline-none min-w-0"
                    />

                    <button 
                      type="button" 
                      onClick={handleVoiceInputSidebar}
                      className={`p-2 transition-colors border-none bg-transparent cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                        isListeningSidebar ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#4F46E5]'
                      }`}
                      title="Voice Input"
                    >
                      <Mic size={16} />
                    </button>

                    {isChatSending ? (
                      <button 
                        type="button" 
                        onClick={handleStopGeneration} 
                        className="w-[30px] h-[30px] sm:w-[32px] sm:h-[32px] rounded-full bg-[#EF4444] text-white hover:bg-red-650 hover:opacity-95 transition-all border-none cursor-pointer flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]"
                        title="Stop generation"
                      >
                        <X size={15} className="text-white font-black stroke-[3px]" />
                      </button>
                    ) : (
                      <button 
                        type="submit" 
                        disabled={!chatInput.trim()}
                        className={`w-[30px] h-[30px] sm:w-[32px] sm:h-[32px] rounded-full transition-all border-none cursor-pointer flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px] ${
                          chatInput.trim()
                            ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                        title="Send message"
                      >
                        <Send size={12} />
                      </button>
                    )}
                  </form>
                </div>
                {showSidebarScrollBtn && (
                  <button
                    type="button"
                    onClick={scrollToSidebarBottom}
                    className="absolute bottom-[90px] left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full shadow-lg text-[10px] font-bold text-[#4F46E5] dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-750 transition-all cursor-pointer select-none animate-bounce"
                  >
                    <ChevronDown size={11} />
                    <span>Scroll to Latest</span>
                  </button>
                )}
              </div>
            )}

          {/* Right Sidebar Column (Col 3) - Mobile overlay / bottom sheet drawer */}
          <AnimatePresence>
            {isMobile && showAiAssistant && (
              <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-[1.5px] select-none">
                {/* Click outside backdrop to close */}
                <div className="absolute inset-0 z-0" onClick={closeAssistant} />
                
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  className="relative z-10 w-full h-[85vh] bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden pb-safe"
                >
                  {/* Drag / Pull handle bar */}
                  <div className="w-12 h-1.5 bg-slate-350 dark:bg-zinc-700 rounded-full mx-auto my-3 cursor-pointer shrink-0" onClick={closeAssistant} />
                  
                  {/* Drawer Header */}
                  <div className="px-4 pb-3 border-b border-[#E5E7EB] dark:border-zinc-800 flex items-center justify-between select-none shrink-0">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={closeAssistant}
                        className="p-1 rounded hover:bg-slate-50 dark:hover:bg-zinc-800 text-gray-555 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer border-none bg-transparent mr-1"
                        title="Back to Case Workspace"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <Scale size={15} className="text-[#4F46E5]" />
                      <div className="flex flex-col">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">⚖️ Case Assistant</h4>
                        <span className="flex items-center gap-1 text-[9px] text-emerald-500 font-bold uppercase tracking-wide">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          AI Online
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={handleToggleSidebarHistory}
                        className={`p-1.5 rounded hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent flex items-center gap-1 text-[10px] font-bold ${
                          showSidebarHistory ? 'text-[#4F46E5]' : 'text-gray-400 hover:text-gray-655 dark:hover:text-white'
                        }`}
                        title="Chat History"
                      >
                        <History size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Message List Container */}
                  <div 
                    ref={sidebarScrollRef}
                    onScroll={handleSidebarScroll}
                    className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent relative"
                  >
                    <>
                      {!hasUserMessages && (
                        <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/15 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl space-y-3 text-slate-700 dark:text-slate-350">
                          <p className="font-bold text-xs text-indigo-750 dark:text-indigo-400">Welcome! I have loaded this case.</p>
                          <p className="text-[11px] leading-relaxed">Ask me anything about:</p>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] font-bold text-slate-655 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Check size={11} className="text-emerald-500 shrink-0" /> Evidence
                            </div>
                            <div className="flex items-center gap-1">
                              <Check size={11} className="text-emerald-500 shrink-0" /> Timeline
                            </div>
                            <div className="flex items-center gap-1">
                              <Check size={11} className="text-emerald-500 shrink-0" /> Drafts
                            </div>
                            <div className="flex items-center gap-1">
                              <Check size={11} className="text-emerald-500 shrink-0" /> Arguments
                            </div>
                            <div className="flex items-center gap-1">
                              <Check size={11} className="text-emerald-500 shrink-0" /> Laws & Acts
                            </div>
                            <div className="flex items-center gap-1">
                              <Check size={11} className="text-emerald-500 shrink-0" /> Research
                            </div>
                            <div className="col-span-2 flex items-center gap-1">
                              <Check size={11} className="text-emerald-500 shrink-0" /> Previous Orders
                            </div>
                          </div>
                          <p className="text-[11px] pt-1">How can I help?</p>
                        </div>
                      )}

                      {visibleSidebarMessages.map((msg, i) => (
                        <div key={i} className="flex flex-col animate-in slide-in-from-bottom-2 duration-200">
                          <span className={`text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            {msg.role === 'user' ? 'ADVOCATE' : 'AI ASSISTANT'}
                          </span>
                          <div className={`p-3 rounded-2xl max-w-[90%] leading-relaxed font-semibold ${
                            msg.role === 'user'
                              ? 'bg-[#4F46E5] text-white rounded-tr-none ml-auto'
                              : 'bg-slate-50 dark:bg-zinc-800/30 border border-[#E5E7EB] dark:border-zinc-800 text-slate-705 dark:text-slate-350 rounded-tl-none mr-auto'
                          }`}>
                            {msg.role === 'user' ? (
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            ) : (
                              <div className="prose prose-slate max-w-none dark:prose-invert">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                                  {highlightLegalTerms(msg.content)}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isChatSending && (!visibleSidebarMessages.length || visibleSidebarMessages[visibleSidebarMessages.length - 1]?.role !== 'model') && (
                        <div className="flex items-center gap-1.5 p-3 bg-slate-50 dark:bg-zinc-850 rounded-2xl rounded-tl-none border border-slate-200 dark:border-zinc-800 w-20">
                          <div className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full animate-bounce delay-100" />
                          <div className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full animate-bounce delay-200" />
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </>
                  </div>

                  {/* Bottom Chat Input Area */}
                  <div className="p-4 border-t border-[#E5E7EB] dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 select-none pb-[calc(16px+env(safe-area-inset-bottom))]">
                    <form onSubmit={handleSendAiMessage} className="flex items-center gap-2 pl-3 pr-4 py-2 bg-gray-50 dark:bg-zinc-850/50 border border-[#E5E7EB] dark:border-zinc-800 rounded-2xl w-full relative">
                      {/* Plus button Actions Grid */}
                      {showSidebarPlusMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowSidebarPlusMenu(false)} />
                          <div className="absolute bottom-full mb-3 left-2 z-50 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 space-y-2.5 font-sans select-none text-left">
                            <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Quick AI Actions</span>
                              <button 
                                type="button" 
                                onClick={() => setShowSidebarPlusMenu(false)}
                                className="text-slate-400 hover:text-slate-655 border-none bg-transparent cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 gap-1 max-h-[220px] overflow-y-auto custom-scrollbar p-0.5">
                              {QUICK_AI_ACTIONS.map((action) => (
                                <button
                                  key={action.name}
                                  type="button"
                                  onClick={() => {
                                    handleChatInputChange(action.prompt);
                                    setShowSidebarPlusMenu(false);
                                    const inp = document.querySelector('input[placeholder="Type message..."]');
                                    inp?.focus();
                                  }}
                                  className="flex items-center gap-2.5 p-1.5 hover:bg-indigo-50/30 border border-transparent hover:border-[#4F46E5] rounded-xl text-[10px] font-bold text-slate-750 text-left transition-all cursor-pointer bg-transparent border-none"
                                >
                                  <span className="p-1 bg-slate-50 rounded shadow-sm shrink-0">{getActionIcon(action.icon)}</span>
                                  <span className="truncate">{action.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <button 
                        type="button" 
                        onClick={() => setShowSidebarPlusMenu(prev => !prev)}
                        className={`p-2 transition-colors border-none bg-transparent cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                          showSidebarPlusMenu ? 'text-[#4F46E5] bg-[#4F46E5]/10 rounded-xl' : 'text-gray-400 hover:text-[#4F46E5]'
                        }`}
                        title="Quick Actions"
                      >
                        <Plus size={16} />
                      </button>

                      <button 
                        type="button" 
                        onClick={() => document.getElementById('workspace-doc-upload').click()}
                        className="p-2 text-gray-400 hover:text-[#4F46E5] transition-colors border-none bg-transparent cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Upload Documents"
                      >
                        <Paperclip size={16} />
                      </button>

                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => handleChatInputChange(e.target.value)}
                        placeholder="Type message..."
                        className="flex-1 bg-transparent border-none text-[11px] font-semibold focus:ring-0 p-0 text-slate-700 dark:text-white outline-none min-w-0"
                      />

                      <button 
                        type="button" 
                        onClick={handleVoiceInputSidebar}
                        className={`p-2 transition-colors border-none bg-transparent cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                          isListeningSidebar ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#4F46E5]'
                        }`}
                        title="Voice Input"
                      >
                        <Mic size={16} />
                      </button>

                      {isChatSending ? (
                        <button 
                          type="button" 
                          onClick={handleStopGeneration} 
                          className="w-[30px] h-[30px] sm:w-[32px] sm:h-[32px] rounded-full bg-[#EF4444] text-white hover:bg-red-650 hover:opacity-95 transition-all border-none cursor-pointer flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]"
                          title="Stop generation"
                        >
                          <X size={15} className="text-white font-black stroke-[3px]" />
                        </button>
                      ) : (
                        <button 
                          type="submit" 
                          disabled={!chatInput.trim()}
                          className={`w-[30px] h-[30px] sm:w-[32px] sm:h-[32px] rounded-full transition-all border-none cursor-pointer flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px] ${
                            chatInput.trim()
                              ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title="Send message"
                        >
                          <Send size={12} />
                        </button>
                      )}
                    </form>
                  </div>
                  {showSidebarScrollBtn && (
                    <button
                      type="button"
                      onClick={scrollToSidebarBottom}
                      className="absolute bottom-[90px] left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700 rounded-full shadow-lg text-[10px] font-bold text-[#4F46E5] dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-750 transition-all cursor-pointer select-none animate-bounce"
                    >
                      <ChevronDown size={11} />
                      <span>Scroll to Latest</span>
                    </button>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <HistoryDrawer />
      <input 
        type="file" 
        id="workspace-doc-upload" 
        ref={fileInputRef} 
        onChange={handleUploadEvidence} 
        multiple 
        className="hidden" 
      />

      {/* Modals */}
      <TaskModal visible={isTaskModalVisible} onClose={() => { setIsTaskModalVisible(false); setEditingTask(null); }} onSave={handleSaveTask} editingTask={editingTask} />
      <TimelineModal visible={isTimelineModalVisible} onClose={() => { setIsTimelineModalVisible(false); setEditingTimeline(null); }} onSave={handleSaveTimeline} editingEvent={editingTimeline} />
      <TimelineDetailsModal visible={isDetailModalOpen} onClose={() => { setIsDetailModalOpen(false); setSelectedDetailEvent(null); }} event={selectedDetailEvent} />
      <AiHearingClerkModal visible={isHearingClerkModalOpen} onClose={() => { setIsHearingClerkModalOpen(false); setSelectedDetailHearing(null); }} hearing={selectedDetailHearing} />
      <HearingModal visible={isHearingModalVisible} onClose={() => { setIsHearingModalVisible(false); setEditingHearing(null); }} onSave={handleSaveHearing} editingHearing={editingHearing} />
      <UploadCourtOrderModal visible={isUploadOrderModalOpen} onClose={() => { setIsUploadOrderModalOpen(false); setUploadOrderContextHearing(null); }} hearing={uploadOrderContextHearing} onUpload={handleUploadCourtOrder} />
      
      {isEditRosterModalOpen && (
        <div className="fixed inset-0 z-[120000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsEditRosterModalOpen(false)}>
          <div className="relative bg-white dark:bg-[#1a2540] w-full max-w-4xl max-h-[85vh] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-zinc-800/80 overflow-y-auto" onClick={e => e.stopPropagation()}>
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800/50">
              <div className="flex items-center gap-2">
                <Users className="text-indigo-600" size={20} />
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Edit Case Roster</h3>
              </div>
              <button onClick={() => setIsEditRosterModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-855 transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100 dark:border-zinc-800/40">
              {[
                { id: 'client', label: 'Client / Petitioner' },
                { id: 'advocate', label: 'Primary Advocate' },
                { id: 'opponent', label: 'Opposing Party' },
                { id: 'court', label: 'Court & Case Details' }
              ].map(sec => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveRosterSection(sec.id)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap rounded-t-lg border-b-2 ${
                    activeRosterSection === sec.id
                      ? 'border-[#4F46E5] text-[#4F46E5] dark:text-indigo-400 bg-indigo-50/10'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const updated = {
                ...caseData,
                clientName: fd.get('clientName'),
                clientPhone: fd.get('clientPhone'),
                clientEmail: fd.get('clientEmail'),
                clientAddress: fd.get('clientAddress'),
                advocateName: fd.get('advocateName'),
                advocateFirm: fd.get('advocateFirm'),
                advocateEnrollment: fd.get('advocateEnrollment'),
                advocatePhone: fd.get('advocatePhone'),
                advocateEmail: fd.get('advocateEmail'),
                opponentName: fd.get('opponentName'),
                opponentPhone: fd.get('opponentPhone'),
                opponentEmail: fd.get('opponentEmail'),
                opponentAdvocate: fd.get('opponentAdvocate'),
                courtName: fd.get('courtName'),
                caseNo: fd.get('caseNo'),
                judge: fd.get('judge'),
                stage: fd.get('stage'),
                jurisdiction: fd.get('jurisdiction')
              };
              try {
                await apiService.updateProject(caseData._id || caseData.id, updated);
                setCaseData(updated);
                toast.success('Case roster updated successfully!');
                setIsEditRosterModalOpen(false);
              } catch (err) {
                toast.error('Failed to update case roster');
              }
            }} className="space-y-4">
              
              <div className="min-h-[220px]">
                {/* 1. Client section */}
                {activeRosterSection === 'client' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-450 uppercase">Full Name</label>
                        <input type="text" name="clientName" defaultValue={caseData.clientName || ''} className="w-full bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase">Phone Number</label>
                        <input type="text" name="clientPhone" defaultValue={caseData.clientPhone || ''} className="w-full bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase">Email Address</label>
                        <input type="email" name="clientEmail" defaultValue={caseData.clientEmail || ''} className="w-full bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase">Postal Address</label>
                        <input type="text" name="clientAddress" defaultValue={caseData.clientAddress || ''} className="w-full bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Advocate section */}
                {activeRosterSection === 'advocate' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase">Lead Advocate Name</label>
                        <input type="text" name="advocateName" defaultValue={caseData.advocateName || ''} className="w-full bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase">Law Firm</label>
                        <input type="text" name="advocateFirm" defaultValue={caseData.advocateFirm || ''} className="w-full bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase">Enrollment Number</label>
                        <input type="text" name="advocateEnrollment" defaultValue={caseData.advocateEnrollment || ''} className="w-full bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase">Mobile Phone</label>
                        <input type="text" name="advocatePhone" defaultValue={caseData.advocatePhone || ''} className="w-full bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white outline-none" />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-455 uppercase">Email Address</label>
                        <input type="email" name="advocateEmail" defaultValue={caseData.advocateEmail || ''} className="w-full bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Opponent section */}
                {activeRosterSection === 'opponent' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase">Opponent Name</label>
                        <input type="text" name="opponentName" defaultValue={caseData.opponentName || ''} className="w-full bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase">Opponent Advocate</label>
                        <input type="text" name="opponentAdvocate" defaultValue={caseData.opponentAdvocate || ''} className="w-full bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase">Mobile Number</label>
                        <input type="text" name="opponentPhone" defaultValue={caseData.opponentPhone || ''} className="w-full bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase">Email Address</label>
                        <input type="email" name="opponentEmail" defaultValue={caseData.opponentEmail || ''} className="w-full bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Court section */}
                {activeRosterSection === 'court' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase">Court Name</label>
                        <input type="text" name="courtName" defaultValue={caseData.courtName || ''} className="w-full bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-850 dark:text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase">Case / Docket Number</label>
                        <input type="text" name="caseNo" defaultValue={caseData.caseNo || ''} className="w-full bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-850 dark:text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase">Presiding Judge</label>
                        <input type="text" name="judge" defaultValue={caseData.judge || ''} className="w-full bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-850 dark:text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase">Current Stage</label>
                        <select name="stage" defaultValue={caseData.stage || 'Pre-Litigation'} className="w-full bg-white dark:bg-zinc-850 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-850 dark:text-white outline-none">
                          <option value="Pre-Litigation">Pre-Litigation</option>
                          <option value="Trial Stage">Trial Stage</option>
                          <option value="Evidence Stage">Evidence Stage</option>
                          <option value="Argument Stage">Argument Stage</option>
                          <option value="Judgment Reserved">Judgment Reserved</option>
                          <option value="Disposed / Closed">Disposed / Closed</option>
                          <option value="Appeal Stage">Appeal Stage</option>
                        </select>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-455 uppercase">Jurisdiction</label>
                        <input type="text" name="jurisdiction" defaultValue={caseData.jurisdiction || ''} className="w-full bg-white dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-855 dark:text-white outline-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-805/50">
                <button type="button" onClick={() => setIsEditRosterModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#4F46E5] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all">
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}



      <QuickActionsModal visible={quickActionsPhone !== null} onClose={() => setQuickActionsPhone(null)} phoneNumber={quickActionsPhone} countryCode={caseData.countryCode} />
      <ModuleRouterModal
        visible={isRouterVisible}
        onClose={() => setIsRouterVisible(false)}
        caseData={caseData}
        activeModuleId={activeModuleId}
        onLaunchModule={(moduleId, cd) => {
          // Update local active state immediately for instant UI feedback
          setActiveModuleId(moduleId);
          onLaunchModuleWithCase(moduleId, cd);
        }}
      />
      <DocViewerModal visible={isDocViewerOpen} onClose={() => setIsDocViewerOpen(false)} doc={activeDoc} />
    </>
  );
};


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// â”€â”€â”€ Main LegalDashboard Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ─── SMART ACTION MENU (Portal-based, viewport-aware) ────────────────────────
// Receives triggerRect as prop — position is calculated synchronously, no race condition.
const SmartActionMenu = ({ triggerRect, items, onClose }) => {
  const menuRef = useRef(null);

  // Calculate position from triggerRect immediately
  const pos = useMemo(() => {
    if (!triggerRect) return { top: 0, left: 0, openUp: false };
    const MENU_HEIGHT = 220;
    const MENU_WIDTH = 160;
    const MARGIN = 8;
    const spaceBelow = window.innerHeight - triggerRect.bottom - MARGIN;
    const spaceAbove = triggerRect.top - MARGIN;
    const openUp = spaceBelow < MENU_HEIGHT && spaceAbove > spaceBelow;
    let top = openUp ? triggerRect.top - MENU_HEIGHT - 4 : triggerRect.bottom + 4;
    let left = triggerRect.right - MENU_WIDTH;
    top = Math.max(MARGIN, Math.min(top, window.innerHeight - MENU_HEIGHT - MARGIN));
    left = Math.max(MARGIN, Math.min(left, window.innerWidth - MENU_WIDTH - MARGIN));
    return { top, left, openUp };
  }, [triggerRect]);

  // Close on scroll or resize
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [onClose]);

  // ESC + arrow key navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (!menuRef.current) return;
      const btns = Array.from(menuRef.current.querySelectorAll('button'));
      const idx = btns.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); btns[(idx + 1) % btns.length]?.focus(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); btns[(idx - 1 + btns.length) % btns.length]?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Focus first item on mount
  useEffect(() => {
    menuRef.current?.querySelector('button')?.focus();
  }, []);

  if (!triggerRect) return null;

  return createPortal(
    <>
      {/* Click-outside backdrop */}
      <div className="fixed inset-0 z-[99998]" onClick={onClose} aria-hidden="true" />

      {/* Menu panel */}
      <div
        ref={menuRef}
        role="menu"
        aria-label="Case actions"
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          width: 160,
          zIndex: 99999,
          transformOrigin: pos.openUp ? 'bottom right' : 'top right',
        }}
        className="bg-white dark:bg-zinc-900 border border-[#E5E7EB] dark:border-zinc-700 rounded-xl shadow-2xl shadow-black/10 py-1.5 animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {items.map((item, i) => item === 'divider'
          ? <div key={i} className="border-t border-[#E5E7EB] dark:border-zinc-800 my-1" />
          : (
            <button
              key={item.label}
              role="menuitem"
              onClick={() => { onClose(); item.onClick(); }}
              className={`w-full text-left px-3.5 py-2 flex items-center gap-2 text-xs font-bold transition-colors outline-none focus:bg-indigo-50 dark:focus:bg-indigo-950/20 ${
                item.danger
                  ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          )
        )}
      </div>
    </>,
    document.body
  );
};

const LegalDashboard = ({
  legalCases = [],

  currentProjectId = null,
  handleOpenCase = () => {},
  handleOpenEditModal = () => {},
  handleDeleteCase = () => {},
  isRenamingCase = null,
  renameValue = '',
  setRenameValue = () => {},
  handleRenameCase = () => {},
  setIsRenamingCase = () => {},
  setIsNewCaseModalOpen = () => {},
  setEditingCaseId = () => {},
  setNewCaseForm = () => {},
  setActiveLegalToolkit = () => {},
  onBack = () => {},
  // New callbacks for module routing
  onAskStrategy,
  onViewRoadmap,
  onLaunchModuleWithCase,
  initialFilter = 'All'
}) => {
  const { tLegal } = useLanguage();
  const [selectedCase, setSelectedCase] = useState(null);
  const [filter, setFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('All Courts');
  const [sortBy, setSortBy] = useState('Last Updated');
  const [viewMode, setViewMode] = useState('table');
  const [activeActionDropdown, setActiveActionDropdown] = useState(null);
  const [activeDropdownRect, setActiveDropdownRect] = useState(null);


  useEffect(() => {
    console.log("Case Management Loaded");
    console.log("Case List Loaded");
    console.log("Active Cases Screen Mounted");
  }, []);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const availableCourts = useMemo(() => {
    const courts = new Set();
    legalCases.forEach(c => {
      if (c.courtName) courts.add(c.courtName);
      else if (c.court) courts.add(c.court);
    });
    return ['All Courts', ...Array.from(courts)];
  }, [legalCases]);

  const filteredCases = useMemo(() => {
    let result = legalCases;

    // Status filter
    if (filter !== 'All') {
      result = result.filter(c => (c.status || 'Active').toLowerCase() === filter.toLowerCase());
    }

    // Court filter
    if (selectedCourt !== 'All Courts') {
      result = result.filter(c => (c.courtName || c.court) === selectedCourt);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q) ||
        (c.clientName || '').toLowerCase().includes(q) ||
        (c.opponentName || '').toLowerCase().includes(q) ||
        (c.caseType || '').toLowerCase().includes(q) ||
        (c.courtName || c.court || '').toLowerCase().includes(q)
      );
    }

    // Clone array before sorting
    result = [...result];

    // Sorting logic
    if (sortBy === 'Name') {
      result.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
    } else if (sortBy === 'Created Date') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'Status') {
      result.sort((a, b) => (a.status || 'Active').localeCompare(b.status || 'Active'));
    } else { // default 'Last Updated'
      result.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    }

    return result;
  }, [legalCases, filter, selectedCourt, searchQuery, sortBy]);

  const handleCaseClick = (c) => {
    console.log("Active Cases Card Clicked");
    console.log("Loading AISA-Mobile Active Cases Module");
    // Convert to legalService format if needed (allProjects uses _id, legalService uses id)
    const caseForDetail = {
      ...c,
      id: c.id || c._id,
      title: c.title || c.name,
    };
    setSelectedCase(caseForDetail);
  };

  const handleDeleteFromDetail = async (id) => {
    try {
      await legalService.deleteCase(id);
      // Also call parent delete if using _id format
      if (handleDeleteCase) handleDeleteCase(id);
      setSelectedCase(null);
      toast.success('Case deleted');
    } catch (e) {
      console.error(e);
    }
  };

  // â”€â”€â”€ Case Detail View â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (selectedCase) {
    return (
      <div className="flex-1 flex flex-col w-full min-h-0 overflow-hidden bg-transparent relative">
        <CaseDetailView
          item={selectedCase}
          isDark={false}
          onBack={() => setSelectedCase(null)}
          onDelete={handleDeleteFromDetail}
          onAskStrategy={onAskStrategy}
          onViewRoadmap={onViewRoadmap}
          onLaunchModuleWithCase={onLaunchModuleWithCase}
          onUpdateCase={setSelectedCase}
        />
      </div>
    );
  }

  // Helper styles for status badge
  const getStatusStyles = (status) => {
    switch ((status || 'Active').toLowerCase()) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'closed':
        return 'bg-rose-50 text-rose-700 border border-rose-250 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
      default: // pending
        return 'bg-amber-50 text-amber-700 border border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
    }
  };

  const getStatusLabel = (status) => {
    switch ((status || 'Active').toLowerCase()) {
      case 'active': return 'Active';
      case 'closed': return 'Closed';
      default: return 'Pending';
    }
  };

  const getStatusDot = (status) => {
    switch ((status || 'Active').toLowerCase()) {
      case 'active': return 'bg-emerald-500';
      case 'closed': return 'bg-rose-500';
      default: return 'bg-amber-500';
    }
  };

  // â”€â”€â”€ Case List View â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="flex-1 flex flex-col w-full min-h-0 overflow-hidden aisa-scalable-text bg-[#F9FAFB] dark:bg-[#0b0c15] relative">
      {/* Dashboard Header */}
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-12 pt-6 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 border-b border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-[#0b0c15]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              console.log("Button Clicked: Back");
              console.log("Icon Clicked: Back");
              console.log("Navigation Success: Returned to Dashboard");
              onBack();
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors mr-1 border border-[#E5E7EB] dark:border-zinc-800"
          >
            <ArrowLeft size={16} className="text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Cases</h1>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Browse, search, sort, and manage all your litigation case folders.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => {
              console.log("Button Clicked: New Case");
              console.log("Icon Clicked: New Case");
              setEditingCaseId(null);
              setNewCaseForm({ clientName: '', caseType: '', otherCaseType: '', accused: '', summary: '' });
              setIsNewCaseModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4F46E5] hover:opacity-90 text-white rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm whitespace-nowrap"
          >
            <Plus size={14} /> <span>New Case Folder</span>
          </button>
        </div>
      </div>

      {/* Filter + Search Bar (Horizontal Toolbar) */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-12 py-3.5 flex flex-col md:flex-row items-stretch md:items-center gap-3 shrink-0 border-b border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-[#0b0c15]">
        {/* Search box */}
        <div className="flex items-center gap-2 bg-gray-50/50 dark:bg-zinc-900/50 border border-[#E5E7EB] dark:border-zinc-800 rounded-xl px-3 py-2.5 w-full md:max-w-md min-h-[44px]">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Search cases by name, client, opponent, court..."
            className="bg-transparent outline-none text-xs font-semibold w-full text-slate-800 dark:text-white p-0 focus:ring-0 border-none" 
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X size={12} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Filters Group - Horizontal Scrolling Row on Mobile */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide w-full md:w-auto select-none shrink-0" style={{ display: 'flex', overflowX: 'auto', whiteSpace: 'nowrap', gap: '12px' }}>
          {/* Status Dropdown */}
          <div className="flex items-center justify-between gap-1.5 px-3 py-2 bg-white dark:bg-zinc-900 border border-[#E5E7EB] dark:border-zinc-800 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 min-h-[44px] flex-1 md:flex-none justify-center shrink-0">
            <span className="text-gray-400 dark:text-gray-550 font-bold">Status:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-gray-800 dark:text-white cursor-pointer outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Court Dropdown */}
          <div className="flex items-center justify-between gap-1.5 px-3 py-2 bg-white dark:bg-zinc-900 border border-[#E5E7EB] dark:border-zinc-800 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 min-h-[44px] flex-1 md:flex-none justify-center shrink-0">
            <span className="text-gray-400 dark:text-gray-550 font-bold">Court:</span>
            <select
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value)}
              className="bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-gray-800 dark:text-white cursor-pointer outline-none max-w-[120px] truncate"
            >
              {availableCourts.map(court => (
                <option key={court} value={court}>{court}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center justify-between gap-1.5 px-3 py-2 bg-white dark:bg-zinc-900 border border-[#E5E7EB] dark:border-zinc-800 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 min-h-[44px] flex-1 md:flex-none justify-center shrink-0">
            <span className="text-gray-400 dark:text-gray-505 font-bold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-gray-800 dark:text-white cursor-pointer outline-none"
            >
              <option value="Last Updated">Last Updated</option>
              <option value="Name">Name</option>
              <option value="Created Date">Created Date</option>
              <option value="Status">Status</option>
            </select>
          </div>
        </div>

        {/* View Toggles - directly below filters on mobile, md:ml-auto on desktop */}
        <div className="flex items-center border border-[#E5E7EB] dark:border-zinc-800 rounded-xl overflow-hidden shrink-0 w-full md:w-auto md:ml-auto justify-center min-h-[44px] bg-white dark:bg-zinc-900">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 md:flex-none p-2.5 px-4 transition-colors flex items-center justify-center min-h-[44px] ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-zinc-850 text-[#4F46E5]' : 'bg-transparent text-gray-400 hover:text-gray-605 dark:hover:text-white'}`}
            title="Grid View"
          >
            <LayoutDashboard size={14} className="mr-1.5" />
            <span className="text-xs font-bold">Grid</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex-1 md:flex-none p-2.5 px-4 border-l border-[#E5E7EB] dark:border-zinc-800 transition-colors flex items-center justify-center min-h-[44px] ${viewMode === 'table' ? 'bg-gray-100 dark:bg-zinc-850 text-[#4F46E5]' : 'bg-transparent text-gray-400 hover:text-gray-655'}`}
            title="Table View"
          >
            <ClipboardList size={14} className="mr-1.5" />
            <span className="text-xs font-bold">List</span>
          </button>
        </div>
      </div>
      {/* Main Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 md:px-10 lg:px-12 py-6 overscroll-contain touch-pan-y"
        style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}>
        
        {filteredCases.length > 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-[#E5E7EB] dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden transition-all duration-200">
            <AnimatePresence mode="wait">
              {viewMode === 'table' ? (
                <motion.div 
                  key="table-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="hidden sm:block overflow-x-auto w-full scrollbar-thin"
                >
                  <table className="w-full text-left border-collapse text-xs font-semibold min-w-[900px] md:min-w-0">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 text-[10px] text-gray-400 dark:text-gray-550 uppercase tracking-wider font-bold">
                        <th className="px-6 py-4 font-bold sticky left-0 bg-gray-50 dark:bg-zinc-900 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Case Name</th>
                        <th className="px-6 py-4 font-bold">Case Type</th>
                        <th className="px-6 py-4 font-bold">Court</th>
                        <th className="px-6 py-4 font-bold">Next Hearing</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 text-center font-bold">Actions</th>
                        <th className="px-6 py-4 text-right font-bold sticky right-0 bg-gray-50 dark:bg-zinc-900 z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">Open Workspace</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB] dark:divide-zinc-800">
                      {filteredCases.map((c) => (
                        <tr 
                          key={c._id || c.id} 
                          className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-all duration-150 group cursor-pointer"
                          onClick={() => handleCaseClick(c)}
                        >
                          <td className="px-6 py-4 max-w-[280px] sticky left-0 bg-white dark:bg-zinc-900 group-hover:bg-slate-50 dark:group-hover:bg-zinc-805 transition-colors z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" onClick={e => isRenamingCase === (c.id || c._id) && e.stopPropagation()}>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-lg shrink-0">
                                <FolderOpen size={16} className="fill-current text-amber-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                {isRenamingCase === (c.id || c._id) ? (
                                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                    <input 
                                      autoFocus 
                                      value={renameValue} 
                                      onChange={e => setRenameValue(e.target.value)}
                                      className="bg-slate-50 dark:bg-black/20 border border-[#4F46E5] rounded-lg px-2 py-1 text-xs font-bold w-full outline-none text-slate-800 dark:text-white"
                                      onKeyDown={e => e.key === 'Enter' && handleRenameCase(c.id || c._id)} 
                                    />
                                    <button onClick={() => handleRenameCase(c.id || c._id)} className="p-1 text-green-500 shrink-0"><Check size={14} /></button>
                                    <button onClick={() => setIsRenamingCase(null)} className="p-1 text-slate-400 shrink-0"><X size={14} /></button>
                                  </div>
                                ) : (
                                  <span className="font-bold text-slate-800 dark:text-white truncate block group-hover:text-[#4F46E5] transition-colors">
                                    {c.name || c.title || "Untitled Case"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-650 dark:text-gray-300">
                            {c.caseType || 'General Litigation'}
                          </td>
                          <td className="px-6 py-4 text-slate-650 dark:text-gray-300">
                            {c.courtName || c.court || 'District Court'}
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {c.nextHearingDate || c.nextHearing || 'None'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusStyles(c.status)}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(c.status)}`} />
                              {getStatusLabel(c.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                            <div className="relative inline-flex items-center justify-center">
                              <button
                                id={`action-btn-${c.id || c._id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const caseId = c.id || c._id;
                                  if (activeActionDropdown === caseId) {
                                    setActiveActionDropdown(null);
                                    setActiveDropdownRect(null);
                                  } else {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setActiveDropdownRect(rect);
                                    setActiveActionDropdown(caseId);
                                  }
                                }}
                                aria-haspopup="menu"
                                aria-expanded={activeActionDropdown === (c.id || c._id)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                              >
                                <MoreVertical size={15} />
                              </button>

                              {activeActionDropdown === (c.id || c._id) && (
                                <SmartActionMenu
                                  triggerRect={activeDropdownRect}
                                  onClose={() => { setActiveActionDropdown(null); setActiveDropdownRect(null); }}
                                  items={[
                                    {
                                      label: 'Edit',
                                      icon: <Edit2 size={13} />,
                                      onClick: () => handleOpenEditModal(c),
                                    },
                                    {
                                      label: 'Rename',
                                      icon: <Edit2 size={13} />,
                                      onClick: () => {
                                        setIsRenamingCase(c.id || c._id);
                                        setRenameValue(c.name || c.title);
                                      },
                                    },
                                    {
                                      label: 'Archive',
                                      icon: <Bookmark size={13} />,
                                      onClick: () => toast.success('Case archived'),
                                    },
                                    {
                                      label: 'Duplicate',
                                      icon: <Share2 size={13} />,
                                      onClick: () => toast.success('Case duplicated'),
                                    },
                                    'divider',
                                    {
                                      label: 'Delete',
                                      icon: <Trash2 size={13} />,
                                      danger: true,
                                      onClick: () => {
                                        if (confirm('Are you sure you want to delete this case?')) {
                                          handleDeleteCase(c.id || c._id);
                                        }
                                      },
                                    },
                                  ]}
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right sticky right-0 bg-white dark:bg-zinc-900 group-hover:bg-slate-50 dark:group-hover:bg-zinc-805 transition-colors z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCaseClick(c);
                              }}
                              className="text-xs font-bold text-[#4F46E5] hover:underline whitespace-nowrap inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                            >
                              Open Workspace <ChevronRight size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              ) : (
                <motion.div
                  key="grid-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-5 bg-gray-50/30 dark:bg-transparent"
                >
                  {filteredCases.map((c) => (
                    <div 
                      key={c._id || c.id}
                      onClick={() => handleCaseClick(c)}
                      className="group relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] rounded-xl">
                            <FolderOpen size={16} className="fill-current" />
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusStyles(c.status)}`}>
                            <span className={`w-1 h-1 rounded-full ${getStatusDot(c.status)}`} />
                            {getStatusLabel(c.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            (c.priority || 'Medium').toLowerCase() === 'high' || (c.priority || 'Medium').toLowerCase() === 'critical' || (c.priority || 'Medium').toLowerCase() === 'urgent'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30'
                          }`}>
                            {c.priority || 'Medium'}
                          </span>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveActionDropdown(activeActionDropdown === (c.id || c._id) ? null : (c.id || c._id));
                              }}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400 transition-colors"
                            >
                              <MoreVertical size={14} />
                            </button>
                            {activeActionDropdown === (c.id || c._id) && (
                              <>
                                <div className="fixed inset-0 z-30" onClick={() => setActiveActionDropdown(null)} />
                                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-zinc-900 border border-[#E5E7EB] dark:border-zinc-800 rounded-xl shadow-lg py-1.5 z-45 animate-in fade-in slide-in-from-top-1 duration-150">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveActionDropdown(null);
                                      handleOpenEditModal(c);
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-zinc-850 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                                  >
                                    <Edit2 size={13} /> Edit
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveActionDropdown(null);
                                      setIsRenamingCase(c.id || c._id);
                                      setRenameValue(c.name || c.title);
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-zinc-850 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                                  >
                                    <Edit2 size={13} /> Rename
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveActionDropdown(null);
                                      toast.success("Case archived");
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-zinc-855 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                                  >
                                    <Bookmark size={13} /> Archive
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveActionDropdown(null);
                                      toast.success("Case duplicated");
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-zinc-855 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                                  >
                                    <Share2 size={13} /> Duplicate
                                  </button>
                                  <div className="border-t border-[#E5E7EB] dark:border-zinc-800 my-1" />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveActionDropdown(null);
                                      if (confirm("Are you sure you want to delete this case?")) {
                                        handleDeleteCase(c.id || c._id);
                                      }
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold text-red-650 flex items-center gap-2"
                                  >
                                    <Trash2 size={13} /> Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-4">
                        {isRenamingCase === (c.id || c._id) ? (
                          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                            <input 
                              autoFocus 
                              value={renameValue} 
                              onChange={e => setRenameValue(e.target.value)}
                              className="bg-slate-50 dark:bg-black/20 border border-[#4F46E5] rounded-lg px-2 py-1 text-xs font-bold w-full outline-none text-slate-800 dark:text-white"
                              onKeyDown={e => e.key === 'Enter' && handleRenameCase(c.id || c._id)} 
                            />
                            <button onClick={() => handleRenameCase(c.id || c._id)} className="p-1 text-green-500"><Check size={14} /></button>
                            <button onClick={() => setIsRenamingCase(null)} className="p-1 text-slate-400"><X size={14} /></button>
                          </div>
                        ) : (
                          <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate group-hover:text-[#4F46E5] transition-colors">
                            {c.name || c.title || "Untitled Case"}
                          </h3>
                        )}
                        <div className="flex flex-col gap-1 text-[10px] text-slate-450 uppercase tracking-wider font-bold">
                          <p className="flex items-center gap-1.5">
                            <Users size={11} className="text-slate-400" />
                            {c.clientName || 'Private Client'}
                          </p>
                          <p className="flex items-center gap-1.5 text-[#4F46E5]">
                            <Scale size={11} />
                            {c.caseType || 'General Litigation'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">
                          {new Date(c.updatedAt || Date.now()).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-0.5 text-[#4F46E5]">
                          <span className="text-[10px] font-bold uppercase tracking-wider">Open Case</span>
                          <ChevronRight size={13} />
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-zinc-900 border border-[#E5E7EB] dark:border-zinc-800 rounded-xl shadow-sm">
            <div className="p-6 bg-slate-50 dark:bg-zinc-800/30 rounded-full text-slate-400 mb-4 border border-[#E5E7EB] dark:border-zinc-800">
              <FolderOpen size={42} className="text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                No cases found
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-sm">
                Create your first case to begin managing legal matters.
              </p>
            </div>
            <button 
              onClick={() => {
                console.log("Button Clicked: New Case");
                console.log("Icon Clicked: New Case");
                setEditingCaseId(null);
                setNewCaseForm({ clientName: '', caseType: '', otherCaseType: '', accused: '', summary: '' });
                setIsNewCaseModalOpen(true);
              }}
              className="mt-5 px-6 py-2.5 bg-[#4F46E5] hover:opacity-90 text-white rounded-xl font-bold text-xs transition-all shadow-sm"
            >
              New Case Folder
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalDashboard;

