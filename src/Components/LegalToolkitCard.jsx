import React, { useEffect, useState } from 'react';
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
    desc: 'Notice, Affidavit & Legal Agreements Architect', 
    price: '₹599' 
  },
  { 
    id: 'legal_contract_analyzer', 
    name: 'Contract Analyzer', 
    icon: FileCheck, 
    desc: 'Risk Scanning & Protective Clause Rewriter', 
    price: '₹799' 
  },
  { 
    id: 'legal_case_predictor', 
    name: 'Case Predictor', 
    icon: Scale, 
    desc: 'Outcome Probability & Case Strength Analyst', 
    price: '₹999' 
  },
  { 
    id: 'legal_strategy_engine', 
    name: 'Strategy Engine', 
    icon: Brain, 
    desc: 'Tactical Planning & Case Journey Timeline', 
    price: '₹899' 
  },
  { 
    id: 'legal_evidence_checker', 
    name: 'Evidence Analyst', 
    icon: Binary, 
    desc: 'Professional Strengths, Admissibility & Risk Reporting', 
    price: '₹599' 
  },
  { 
    id: 'legal_research_assistant', 
    name: 'Research Assistant', 
    icon: Library, 
    desc: 'Statutory Interpetation & Case Law CITATIONS', 
    price: '₹699' 
  },
  { 
    id: 'legal_argument_builder', 
    name: 'Argument Builder', 
    icon: Gavel, 
    desc: 'Structure Courtroom-Ready Arguments & Cross-Exams', 
    price: '₹999' 
  }
];

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

  const ToolCard = ({ tool, isPrimary = false, size = 'md' }) => {
    const isUnlocked = isAdmin || unlockedTools.includes(tool.id);
    const Icon = tool.icon;

    return (
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        onClick={() => { onSelect(tool, isUnlocked); if (isUnlocked) onClose(); }}
        className={`group relative cursor-pointer rounded-[1.4rem] p-4 transition-all duration-300 border`}
        style={{
          background: 'rgba(255,255,255,0.65)',
          border: '1px solid rgba(255,255,255,0.75)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 16px rgba(99,102,241,0.06)',
        }}
      >
        {/* Hover shimmer */}
        <motion.div
          className="absolute inset-0 rounded-[1.4rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)' }}
        />
        <div className="flex flex-col gap-3.5 relative z-10">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${isUnlocked ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_6px_16px_rgba(99,102,241,0.35)]' : 'bg-white/80 border border-white/80 shadow-sm'}`}>
            <Icon className={`w-5 h-5 ${isUnlocked ? 'text-white' : 'text-slate-400'}`} />
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

  const SectionTitle = ({ children }) => (
    <div className="flex items-center gap-4 mb-5 mt-8 first:mt-0">
      <div className="w-1 h-1 rounded-full bg-slate-500" />
      <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.28em] whitespace-nowrap">{children}</h4>
      <div className="h-[1px] flex-1 bg-black/[0.06]" />
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-[10px]"
          />

          {/* Outer wrapper for animated border + halo */}
          <div className={`relative z-10 w-full ${isMaximized ? 'max-w-full h-full' : 'max-w-3xl'}`}>

            {/* Animated color-cycling outer halo */}
            <motion.div
              animate={{
                background: [
                  'radial-gradient(ellipse at 50% 0%,   rgba(99,102,241,0.60) 0%, transparent 65%)',
                  'radial-gradient(ellipse at 100% 50%, rgba(59,130,246,0.60) 0%, transparent 65%)',
                  'radial-gradient(ellipse at 50% 100%,rgba(139,92,246,0.60) 0%, transparent 65%)',
                  'radial-gradient(ellipse at 0% 50%,   rgba(79,70,229,0.55)  0%, transparent 65%)',
                  'radial-gradient(ellipse at 50% 0%,   rgba(99,102,241,0.60) 0%, transparent 65%)'
                ]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-[14px] rounded-[42px] pointer-events-none z-0 blur-[22px]"
            />

            {/* Animated color-cycling border */}
            <motion.div
              animate={{
                background: [
                  'linear-gradient(0deg,   #6366f1, #4f46e5, #3b82f6, #8b5cf6)',
                  'linear-gradient(90deg,  #3b82f6, #6366f1, #7c3aed, #4338ca)',
                  'linear-gradient(180deg, #8b5cf6, #3b82f6, #4f46e5, #6366f1)',
                  'linear-gradient(270deg, #4338ca, #7c3aed, #6366f1, #2563eb)',
                  'linear-gradient(360deg, #6366f1, #4f46e5, #3b82f6, #8b5cf6)'
                ]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              className={`absolute -inset-[1.5px] pointer-events-none z-[1] opacity-80 ${isMaximized ? 'rounded-[28px]' : 'rounded-[29px]'}`}
            />

            {/* Main card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              layout
              transition={{ 
                layout: { duration: 0.3, ease: 'easeInOut' },
                opacity: { duration: 0.2 },
                scale: { duration: 0.3 }
              }}
              className={`relative z-[2] flex flex-col overflow-hidden ${isMaximized ? 'modal-maximized rounded-[27px]' : 'modal-default rounded-[28px]'}`}
              style={{
                boxShadow: '0 40px 80px -15px rgba(79,70,229,0.32), inset 0 2px 4px rgba(255,255,255,0.85)',
              }}
            >
              {/* Frosted glass base */}
              <div className="absolute inset-0 bg-white/82 backdrop-blur-[60px] z-0 rounded-[28px]" />

              {/* Color-cycling cinematic blobs */}
              <motion.div
                animate={{
                  backgroundColor: ['#3730a3','#4338ca','#6366f1','#4f46e5','#3730a3'],
                  x: ['0%','35%','0%'], y: ['0%','20%','0%'], scale: [1, 1.25, 1]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-[20%] -left-[15%] w-[60%] h-[75%] rounded-full opacity-[0.38] mix-blend-multiply pointer-events-none z-[1] blur-[80px]"
              />
              <motion.div
                animate={{
                  backgroundColor: ['#4c1d95','#6d28d9','#7c3aed','#8b5cf6','#4c1d95'],
                  x: ['0%','-30%','0%'], y: ['0%','25%','0%'], scale: [1, 1.3, 1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                className="absolute -bottom-[25%] -right-[20%] w-[65%] h-[80%] rounded-full opacity-[0.32] mix-blend-multiply pointer-events-none z-[1] blur-[80px]"
              />
              <motion.div
                animate={{
                  backgroundColor: ['#1e3a8a','#2563eb','#3b82f6','#1d4ed8','#1e3a8a'],
                  x: ['0%','20%','0%'], y: ['0%','-20%','0%'], scale: [1, 1.15, 1]
                }}
                transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
                className="absolute top-[25%] right-[5%] w-[50%] h-[55%] rounded-full opacity-[0.22] mix-blend-multiply pointer-events-none z-[1] blur-[70px]"
              />

              {/* Glass border shine */}
              <div className="absolute inset-0 rounded-[28px] border border-white/55 z-[3] pointer-events-none shadow-[inset_0_1px_3px_rgba(255,255,255,0.8)]" />

              {/* Header */}
              <div 
                className="relative z-[8] flex items-center justify-between px-8 sm:px-10 py-5 border-b border-black/[0.05] bg-white/35 backdrop-blur-md cursor-default select-none"
                onDoubleClick={() => setIsMaximized(!isMaximized)}
              >
                <div className="flex items-center gap-3.5">
                  <motion.div
                    whileHover={{ rotate: 180, scale: 1.08 }}
                    className="w-[38px] h-[38px] rounded-[12px] bg-gradient-to-br from-indigo-500 via-[#4F46E5] to-[#3B82F6] flex items-center justify-center shadow-[0_6px_15px_rgba(99,102,241,0.35)] border border-white/30"
                  >
                    <Scale className="w-[18px] h-[18px] text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-[16px] font-black text-slate-900 leading-tight tracking-tight">AI Legal</h1>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-500 animate-pulse" />
                      <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-[0.22em]">Professional Toolkit</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMaximized(!isMaximized)}
                    title={isMaximized ? 'Restore' : 'Maximize'}
                    className="w-7 h-7 rounded-full bg-white/50 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:shadow-md transition-all shadow-sm border border-white/60"
                  >
                    {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    title="Close"
                    className="w-7 h-7 rounded-full bg-white/50 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:shadow-md transition-all shadow-sm border border-white/60"
                  >
                    <X size={15} strokeWidth={2.5} />
                  </motion.button>
                </div>
              </div>

              {/* Body */}
              <div className="relative z-[8] flex-1 overflow-y-auto px-8 sm:px-10 py-6 custom-scrollbar">
                
                {!isMaximized && (
                  <div className="mb-5">
                    <p className="text-[12px] text-slate-500 font-semibold">Advanced AI-driven professional suites for legal mastery.</p>
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
                  className="group relative cursor-pointer rounded-[1.8rem] p-7 mb-8 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #7c3aed 100%)',
                    boxShadow: '0 20px 50px -10px rgba(79,70,229,0.45)',
                  }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* Animated shimmer sweep */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
                    className="absolute top-0 bottom-0 w-[40%] bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none"
                  />
                  <div className="absolute top-0 right-0 w-52 h-52 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse" />
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-400/20 rounded-full -ml-8 -mb-8 blur-2xl" />
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-[1.4rem] flex items-center justify-center border border-white/25 shadow-xl group-hover:scale-105 transition-transform duration-500 shrink-0">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-1.5">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="px-2.5 py-1 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-[8px] font-black text-white uppercase tracking-widest">Always Free</span>
                        <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      </div>
                      <h2 className="text-2xl font-extrabold text-white tracking-tight">💬 General Legal Chat</h2>
                      <p className="text-indigo-100 text-[12px] font-medium leading-relaxed">
                        Professional legal discourse, simple guidance, and Q&A.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-white text-indigo-700 font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all text-[11px] uppercase tracking-[0.15em] shrink-0"
                    >
                      Start Chat →
                    </motion.button>
                  </div>
                </motion.div>

                {/* Professional Legal Engines */}
                <SectionTitle>Professional Legal Engines</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PREMIUM_TOOLS.map((tool, idx) => (
                    <ToolCard key={tool.id} tool={tool} index={idx} />
                  ))}
                </div>

                {/* Upgrade Banner */}
                {!isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-10 p-6 rounded-[1.6rem] flex flex-col sm:flex-row items-center justify-between gap-5"
                    style={{
                      background: 'rgba(255,255,255,0.55)',
                      border: '1px solid rgba(255,255,255,0.70)',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 4px 20px rgba(99,102,241,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(99,102,241,0.3)]">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h6 className="font-extrabold text-slate-900 text-[15px]">Secure Full Toolkit Access</h6>
                        <p className="text-[11px] text-slate-500 font-semibold">Unlock all 15+ premium legal generators and predictors.</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                      className="relative px-7 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] text-white overflow-hidden shrink-0 shadow-[0_8px_20px_rgba(99,102,241,0.35)]"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
                    >
                      <motion.div
                        animate={{ backgroundPosition: ['0% center', '200% center'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 bg-[length:200%_auto]"
                      />
                      <span className="relative z-10">Unlock All Now</span>
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LegalToolkitCard;
