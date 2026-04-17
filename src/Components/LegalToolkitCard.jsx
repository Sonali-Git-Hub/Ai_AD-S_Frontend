import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Shield, FileCheck, Scale, Binary, 
  Mail, PenTool, AlertTriangle, Edit3, Brain, 
  Library, Clock, CheckCircle, ArrowLeftRight, Lock, Sparkles,
  MessageCircle, ArrowRight, X, ChevronDown, Zap, Maximize2, Minimize2, Gavel
} from 'lucide-react';
import toast from 'react-hot-toast';

const SECTIONS = {
  CORE: ['legal_draft_maker', 'legal_contract_analyzer', 'legal_case_predictor'],
  ADVANCED: ['legal_strategy_engine', 'legal_evidence_checker', 'legal_research_assistant', 'legal_argument_builder']
};

const PREMIUM_TOOLS = [
  { 
    id: 'legal_draft_maker', 
    name: 'Draft Maker', 
    icon: FileText, 
    desc: 'Notice, Affidavit, FIR & Legal Agreements Architect', 
    price: '₹599',
    workflow: [
      'Describe the document you need (FIR, Notice, Agreement, etc.).',
      'Provide key names, dates, and factual background.',
      'AI generates a litigation-ready professional draft.'
    ]
  },
  { 
    id: 'legal_contract_analyzer', 
    name: 'Contract Analyzer', 
    icon: FileCheck, 
    desc: 'Risk Scanning & Protective Clause Rewriter', 
    price: '₹799',
    workflow: [
      'Upload or paste your contract/agreement text.',
      'AI scans for hidden risks, liabilities, and unfair clauses.',
      'Get professional rewrites to protect your interests.'
    ]
  },
  { 
    id: 'legal_case_predictor', 
    name: 'Case Predictor', 
    icon: Scale, 
    desc: 'Outcome Probability & Case Strength Analyst', 
    price: '₹999',
    workflow: [
      'Input case facts, evidence, and legal claims.',
      'AI evaluates scenarios against legal precedents.',
      'Receive success probability and predicted judicial verdict.'
    ]
  },
  { 
    id: 'legal_strategy_engine', 
    name: 'Strategy Engine', 
    icon: Brain, 
    desc: 'Tactical Planning & Case Journey Timeline', 
    price: '₹899',
    workflow: [
      'Brief the AI on your current legal dispute.',
      'AI simulates opponent moves and creates counter-strategies.',
      'Get aggressive, balanced, and safe tactical options.'
    ]
  },
  { 
    id: 'legal_evidence_checker', 
    name: 'Evidence Analyst', 
    icon: Binary, 
    desc: 'Professional Strengths, Admissibility & Risk Reporting', 
    price: '₹599',
    workflow: [
      'Submit a list or description of your evidence.',
      'AI checks admissibility under Section 65B and other laws.',
      'AI identifies gaps and suggests ways to strengthen proof.'
    ]
  },
  { 
    id: 'legal_research_assistant', 
    name: 'Research Assistant', 
    icon: Library, 
    desc: 'Statutory Interpetation & Case Law CITATIONS', 
    price: '₹699',
    workflow: [
      'Ask any complex legal query or situational question.',
      'AI searches relevant statutes (IPC, BNS) and case laws.',
      'Receive citations and strategic summaries for court use.'
    ]
  },
  { 
    id: 'legal_argument_builder', 
    name: 'Argument Builder', 
    icon: Gavel, 
    desc: 'Structure Courtroom-Ready Arguments & Cross-Exams', 
    price: '₹999',
    workflow: [
      'Provide brief facts and the core dispute.',
      'AI structures primary arguments and secondary rebuttals.',
      'AI generates targeted cross-examination questions.'
    ]
  }
];

const ToolCard = ({ tool, isPrimary = false, size = 'md', onClose, onSelect }) => {
  const isUnlocked = true; // All legal tools are now available for ALL tiers (Free included)
  const Icon = tool.icon;
  const [showWorkflow, setShowWorkflow] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={() => { if (isUnlocked) { onClose(); onSelect(tool, isUnlocked); } }}
      className={`group relative cursor-pointer rounded-[1.4rem] p-4 transition-all duration-300 border overflow-hidden`}
      style={{
        background: 'rgba(255,255,255,0.65)',
        border: '1px solid rgba(255,255,255,0.75)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 16px rgba(99,102,241,0.06)',
      }}
    >
      {/* Workflow Overlay */}
      <AnimatePresence>
        {showWorkflow && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="absolute inset-0 z-20 bg-indigo-600/95 rounded-[1.4rem] p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h6 className="text-white font-black text-[12px] uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-white" /> Workflow
                </h6>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowWorkflow(false); }}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="space-y-2.5">
                {tool.workflow.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-white/90 text-[11px] leading-snug font-medium pt-0.5">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); if (isUnlocked) onClose(); onSelect(tool, isUnlocked); }}
              className="w-full py-2 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Launch Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover shimmer */}
      <motion.div
        className="absolute inset-0 rounded-[1.4rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)' }}
      />

      <div className="flex flex-col gap-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${isUnlocked ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_6px_16px_rgba(99,102,241,0.35)]' : 'bg-white/80 border border-white/80 shadow-sm'}`}>
            <Icon className={`w-5.5 h-5.5 ${isUnlocked ? 'text-white' : 'text-slate-400'}`} />
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowWorkflow(true); }}
            className="p-2 transition-all text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg"
            title="How it works"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors tracking-tight text-[14px]">
              {tool.name}
            </h5>
            {isUnlocked ? (
              <span className="text-[7.5px] font-black text-indigo-600 bg-indigo-50/80 px-1.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-tighter">Unlocked</span>
            ) : (
              <span className="text-[7.5px] font-black text-slate-400 bg-white/70 px-1.5 py-0.5 rounded-full border border-white/80 uppercase tracking-tighter">Pro</span>
            )}
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed font-medium line-clamp-2">
            {tool.desc}
          </p>
        </div>

        {!isUnlocked && (
          <div className="pt-2.5 border-t border-white/60 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">{tool.price}</span>
            <div className="flex items-center gap-1 text-indigo-600 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all">
              Upgrade <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const LegalToolkitCard = ({ isOpen, onClose, onSelect, unlockedTools = [], isAdmin = false }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => { 
      if (e.key === 'Escape') {
        if (isMaximized) {
          setIsMaximized(false);
        } else {
          onClose(); 
        }
      } 
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, isMaximized]);

  useEffect(() => {
    if (!isOpen) setIsMaximized(false);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden'; } 
    else { document.body.style.overflow = 'unset'; }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const SectionTitle = ({ children }) => (
    <div className="flex items-center gap-4 mb-5 mt-8 first:mt-0">
      <div className="w-1 h-1 rounded-full bg-slate-500" />
      <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.28em] whitespace-nowrap">{children}</h4>
      <div className="h-[1px] flex-1 bg-black/[0.06]" />
    </div>
  );

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="legal-toolkit-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="fixed inset-0 z-[110000] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div 
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[12px]"
          />

          {/* Outer wrapper */}
          <div className={`relative z-10 w-full flex items-center justify-center ${isMaximized ? 'h-full' : 'max-w-5xl'}`}>

            {/* Main card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, transition: { duration: 0.12 } }}
              layout
              transition={{ 
                layout: { duration: 0.25, ease: 'easeInOut' },
                opacity: { duration: 0.18 },
                scale: { duration: 0.22 }
              }}
              className={`relative z-[2] flex flex-col overflow-hidden w-full ${isMaximized ? 'modal-maximized rounded-[27px]' : 'modal-default rounded-[28px]'}`}
              style={{
                boxShadow: '0 40px 80px -15px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1)',
                maxHeight: '90vh'
              }}
            >
              {/* Clean frosted glass base */}
              <div className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-[40px] z-0 rounded-[28px]" />

              {/* Header */}
              <div 
                className="relative z-[8] flex items-center justify-between px-8 sm:px-10 py-5 border-b border-black/[0.05] dark:border-white/[0.05] bg-white/40 dark:bg-zinc-800/40 backdrop-blur-md cursor-default select-none"
                onDoubleClick={() => setIsMaximized(!isMaximized)}
              >
                <div className="flex items-center gap-3.5">
                  <motion.div
                    whileHover={{ rotate: 180, scale: 1.08 }}
                    className="w-[42px] h-[42px] rounded-[14px] bg-gradient-to-br from-indigo-500 via-[#4F46E5] to-[#3B82F6] flex items-center justify-center shadow-[0_6px_15px_rgba(99,102,241,0.35)] border border-white/30"
                  >
                    <Scale className="w-[20px] h-[20px] text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-[17px] font-black text-slate-900 dark:text-white leading-tight tracking-tight">AI Legal</h1>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-500 animate-pulse" />
                      <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.22em]">Professional Toolkit</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <motion.button 
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMaximized(!isMaximized)}
                    title={isMaximized ? 'Restore' : 'Maximize'}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:shadow-md transition-all shadow-sm border border-black/5 dark:border-white/10"
                  >
                    {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    title="Close"
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:shadow-md transition-all shadow-sm border border-black/5 dark:border-white/10"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </motion.button>
                </div>
              </div>

              {/* Body */}
              <div className="relative z-[8] flex-1 overflow-y-auto px-8 sm:px-11 py-7 custom-scrollbar">
                
                {!isMaximized && (
                  <div className="mb-6">
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-semibold">Advanced AI-driven professional suites for legal mastery.</p>
                  </div>
                )}

                {/* Hero — General Legal Chat */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => { 
                    onSelect({ id: 'legal_chat', name: 'General Legal Chat' }, true); 
                    onClose(); 
                    toast.success('Legal Chat Activated ⚖️', {
                      style: { background: '#F8FAFC', color: '#1E293B', fontWeight: 'bold' }
                    });
                  }}
                  className="group relative cursor-pointer rounded-[2rem] p-8 mb-10 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #7c3aed 100%)',
                    boxShadow: '0 25px 60px -10px rgba(79,70,229,0.5)',
                  }}
                  whileHover={{ scale: 1.015, y: -3 }}
                  whileTap={{ scale: 0.985 }}
                >
                  {/* Animated shimmer sweep */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2.5 }}
                    className="absolute top-0 bottom-0 w-[45%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
                  />
                  <div className="absolute top-0 right-0 w-60 h-60 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-400/25 rounded-full -ml-10 -mb-10 blur-2xl" />
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-center gap-7">
                    <div className="w-18 h-18 bg-white/20 backdrop-blur-2xl rounded-[1.6rem] flex items-center justify-center border border-white/30 shadow-2xl group-hover:scale-105 transition-transform duration-500 shrink-0">
                      <MessageCircle className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div className="flex items-center justify-center sm:justify-start gap-2.5">
                        <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/25 rounded-full text-[9px] font-black text-white uppercase tracking-widest">Premium Elite</span>
                        <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">💬 General Legal Chat</h2>
                      <p className="text-indigo-50/90 text-[13px] font-semibold leading-relaxed">
                        Professional legal discourse, situational guidance, and citation Q&A.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-white text-indigo-700 font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all text-[12px] uppercase tracking-[0.18em] shrink-0"
                    >
                      Launch Chat →
                    </motion.button>
                  </div>
                </motion.div>

                {/* Professional Legal Engines */}
                <SectionTitle>Professional Legal Engines</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {PREMIUM_TOOLS.map((tool, idx) => (
                    <ToolCard key={tool.id} tool={tool} index={idx} onClose={onClose} onSelect={onSelect} />
                  ))}
                </div>

                {/* Upgrade Banner */}
                {!isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 p-8 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[1.2rem] flex items-center justify-center shadow-lg">
                        <Shield className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h6 className="font-extrabold text-slate-900 dark:text-white text-[17px]">Full Legal Suite Access</h6>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold">Unlock 20+ advanced draft makers, predictors, and research tools.</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                      className="relative px-8 py-3.5 rounded-2.5xl font-black text-[12px] uppercase tracking-[0.2em] text-white overflow-hidden shrink-0 shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
                    >
                      <motion.div
                        animate={{ backgroundPosition: ['0% center', '200% center'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 bg-[length:200%_auto]"
                      />
                      <span className="relative z-10">Access Pro Suite</span>
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LegalToolkitCard;
