import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, Gavel, Send, MessageSquare, Plus, Zap, 
  FileText, Copy, Share2, FileDown, History, Search, X, ShieldCheck, 
  Clock, Brain, Target, Scale, BookOpen, AlertTriangle, TrendingUp, 
  Mic, Star, Database, Cpu, BarChart2, Users, ShieldAlert, Briefcase, 
  Calendar, ChevronDown, ChevronUp, Trash2, Edit2, Eye, Download, Upload, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateChatResponse } from '../../../services/geminiService';
import { apiService } from '../../../services/apiService';

const WORKFLOW_CATEGORIES = [
  {
    title: 'AI COURTROOM SIMULATION',
    icon: <Gavel size={16} className="text-indigo-600" />,
    items: [
      { name: 'Cross-Examination Simulator', desc: 'Generate targeted lines of questioning for opposing witnesses.' },
      { name: 'Witness Contradiction Finder', desc: 'Expose contradictions in witness depositions.' },
      { name: 'Objection Assistant', desc: 'Simulate courtroom objections and judicial responses.' },
      { name: 'Opposition Strategy Simulator', desc: 'Forecast opposing counsel strategies and build defensive responses.' }
    ]
  },
  {
    title: 'CASE ANALYTICS',
    icon: <BarChart2 size={16} className="text-indigo-600" />,
    items: [
      { name: 'Winning Probability', desc: 'Predict outcome based on case facts and active judge patterns.' },
      { name: 'Evidence Strength Auditor', desc: 'Audit evidence admissibility and relevance scores.' },
      { name: 'Judicial Risk Forecast', desc: 'Scan and calculate potential risk exposure in the active forum.' }
    ]
  },
  {
    title: 'LEGAL RESEARCH ENGINE',
    icon: <Database size={16} className="text-indigo-600" />,
    items: [
      { name: 'IPC & Statutory Interpretations', desc: 'Explore IPC / BNS clauses and legal applicability.' },
      { name: 'Precedent Citation Finder', desc: 'Search and link matching binding precedents.' }
    ]
  },
  {
    title: 'NEGOTIATION & MEDIATION',
    icon: <Scale size={16} className="text-indigo-600" />,
    items: [
      { name: 'Settlement Planner', desc: 'Determine fair valuation terms and draft negotiation stances.' },
      { name: 'Mediation Roadmap Builder', desc: 'Structure step-by-step mediation goals and fallback positions.' }
    ]
  }
];

const ArgumentBuilder = ({ currentCase, onBack, theme, allProjects = [], onUpdateCase }) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('assistant'); // assistant, timeline, form
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'model',
      content: 'Welcome to **AISA Argument Intelligence**. I am your Elite Litigation Architect. Describe your case facts or select a courtroom workflow to build a winning strategy.',
      timestamp: Date.now(),
      isSystemLog: true
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingFactId, setEditingFactId] = useState(null);

  // Form states for proceeding CRUD (timeline/facts)
  const [formEvent, setFormEvent] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formWitnessName, setFormWitnessName] = useState('');
  const [formWitnessType, setFormWitnessType] = useState('Prosecution/Plaintiff');
  const [formMainArgs, setFormMainArgs] = useState('');
  const [formCounterArgs, setFormCounterArgs] = useState('');
  const [formOutcome, setFormOutcome] = useState('');
  const [formNextStep, setFormNextStep] = useState('');
  const [formWitnessQuestions, setFormWitnessQuestions] = useState(['']);

  // Collapse sections
  const [section1Expanded, setSection1Expanded] = useState(true);
  const [section2Expanded, setSection2Expanded] = useState(true);

  // Load chat history for the active case
  useEffect(() => {
    if (currentCase) {
      const stored = localStorage.getItem(`@aisa_arg_chat_${currentCase._id}`);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        setMessages([
          {
            id: '1',
            role: 'model',
            content: `Welcome to **AISA Argument Intelligence** for **${currentCase.name}**. I am your Elite Litigation Architect. Select a courtroom simulation to begin.`,
            timestamp: Date.now(),
            isSystemLog: true
          }
        ]);
      }
    }
  }, [currentCase]);

  const saveChatHistory = (updatedMsgs) => {
    if (currentCase) {
      localStorage.setItem(`@aisa_arg_chat_${currentCase._id}`, JSON.stringify(updatedMsgs));
    }
  };

  const handleSendMessage = async (customPrompt = null) => {
    const text = customPrompt || inputValue;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInputValue('');
    setIsGenerating(true);

    try {
      let caseContext = "";
      if (currentCase) {
        caseContext = `
[Active Case Context]
Case Name: ${currentCase.name}
Client: ${currentCase.clientName || 'N/A'}
Accused/Opponent: ${currentCase.accused || currentCase.opponentName || 'N/A'}
Court: ${currentCase.courtName || 'N/A'}
Summary/Facts: ${currentCase.summary || currentCase.caseSummary || currentCase.description || 'N/A'}
`;
      }

      const systemPrompt = `You are the AISA Enterprise Litigation Strategy War Room. You build courtroom arguments, rebuttals, cross-examination structures, and win probability reports.
      Format response in clean Markdown.
      Use professional Legal English.`;

      const response = await generateChatResponse(
        newMsgs.filter(m => !m.isSystemLog),
        text + (caseContext ? `\n\nContext:\n${caseContext}` : ''),
        systemPrompt,
        [], 'English', null, 'legal'
      );
      const reply = response?.reply || response || '';

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: reply,
        timestamp: Date.now()
      };
      const finalMsgs = [...newMsgs, aiMsg];
      setMessages(finalMsgs);
      saveChatHistory(finalMsgs);
    } catch (e) {
      toast.error("Failed to generate response");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProceeding = async () => {
    if (!formEvent.trim()) {
      toast.error("Event/Proceeding Title is required");
      return;
    }
    if (!currentCase) {
      toast.error("An active case is required to save proceedings timeline.");
      return;
    }

    const tid = toast.loading("Syncing case timeline...");
    try {
      const newFact = {
        id: editingFactId || Date.now().toString(),
        event: formEvent,
        date: formDate || new Date().toISOString(),
        description: formDescription,
        witnessName: formWitnessName,
        witnessType: formWitnessType,
        mainArgs: formMainArgs,
        counterArgs: formCounterArgs,
        outcome: formOutcome,
        nextStep: formNextStep,
        questions: formWitnessQuestions.filter(q => q.trim() !== '')
      };

      const existingFacts = currentCase.facts || [];
      let updatedFacts;
      if (editingFactId) {
        updatedFacts = existingFacts.map(f => f.id === editingFactId || f._id === editingFactId ? { ...f, ...newFact } : f);
      } else {
        updatedFacts = [...existingFacts, newFact];
      }

      const payload = {
        ...currentCase,
        facts: updatedFacts
      };

      const response = await apiService.updateProject(currentCase._id, payload);
      if (onUpdateCase) onUpdateCase(response);

      toast.success(editingFactId ? "Proceeding updated! ✅" : "Proceeding added to timeline! ✅", { id: tid });
      
      // Reset form
      setFormEvent('');
      setFormDate('');
      setFormDescription('');
      setFormWitnessName('');
      setFormWitnessType('Prosecution/Plaintiff');
      setFormMainArgs('');
      setFormCounterArgs('');
      setFormOutcome('');
      setFormNextStep('');
      setFormWitnessQuestions(['']);
      setEditingFactId(null);
      
      setActiveTab('timeline');
    } catch (e) {
      toast.error("Failed to sync case facts", { id: tid });
    }
  };

  const handleEditFact = (fact) => {
    setEditingFactId(fact.id || fact._id);
    setFormEvent(fact.event || '');
    setFormDate(fact.date ? new Date(fact.date).toISOString().split('T')[0] : '');
    setFormDescription(fact.description || '');
    setFormWitnessName(fact.witnessName || '');
    setFormWitnessType(fact.witnessType || 'Prosecution/Plaintiff');
    setFormMainArgs(fact.mainArgs || '');
    setFormCounterArgs(fact.counterArgs || '');
    setFormOutcome(fact.outcome || '');
    setFormNextStep(fact.nextStep || '');
    setFormWitnessQuestions(fact.questions && fact.questions.length > 0 ? fact.questions : ['']);
    setActiveTab('form');
  };

  const handleDeleteFact = async (factId) => {
    if (!currentCase) return;
    if (window.confirm("Are you sure you want to delete this event from the timeline?")) {
      const tid = toast.loading("Syncing case timeline...");
      try {
        const updatedFacts = (currentCase.facts || []).filter(f => f.id !== factId && f._id !== factId);
        const payload = {
          ...currentCase,
          facts: updatedFacts
        };
        const response = await apiService.updateProject(currentCase._id, payload);
        if (onUpdateCase) onUpdateCase(response);
        toast.success("Event removed", { id: tid });
      } catch (e) {
        toast.error("Failed to delete event", { id: tid });
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full min-h-0 bg-slate-50 dark:bg-transparent overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight">Argument Builder</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">COURTROOM INTELLIGENCE ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Tabs switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#131C31] p-1 rounded-xl border border-black/5 dark:border-white/5">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'assistant' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            AI War Room
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'timeline' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Proceedings Timeline
          </button>
          <button
            onClick={() => {
              setEditingFactId(null);
              setActiveTab('form');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'form' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Add Proceeding
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 select-text relative">
        {/* TAB 1: AI ASSISTANT CHAT */}
        {activeTab === 'assistant' && (
          <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-transparent">
            {/* Scrollable messages area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.length === 1 && (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Category selections */}
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">⋄ PRESET SIMULATIONS & ENGINES</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {WORKFLOW_CATEGORIES.map(cat => (
                      <div key={cat.title} className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          {cat.icon}
                          <h4 className="text-xs font-black tracking-widest text-indigo-600 uppercase">{cat.title}</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {cat.items.map(item => (
                            <button
                              key={item.name}
                              onClick={() => handleSendMessage(item.name)}
                              className="text-left p-3.5 bg-slate-50 dark:bg-[#131C31] hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-2xl border border-slate-200/50 dark:border-white/5 transition-all group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-indigo-600">{item.name}</span>
                                <Zap size={12} className="text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
                              </div>
                              <p className="text-[10px] text-subtext font-semibold mt-1 leading-snug">{item.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {messages.length > 1 && messages.map((msg, i) => (
                <div key={msg.id || i} className={`flex max-w-3xl ${msg.role === 'user' ? 'justify-end ml-auto' : 'mr-auto'} gap-4`}>
                  {msg.role !== 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-black tracking-tighter shrink-0 shadow-md">
                      AI
                    </div>
                  )}
                  <div className={`p-5 rounded-3xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-500/10' : 'bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 rounded-tl-none text-slate-800 dark:text-slate-200 shadow-sm'}`}>
                    <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm whitespace-pre-wrap select-text">
                      {msg.content}
                    </div>
                    {msg.role !== 'user' && !msg.isSystemLog && (
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            toast.success("Copied to clipboard");
                          }}
                          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600"
                        >
                          <Copy size={12} />
                          <span>Copy</span>
                        </button>
                        <button 
                          onClick={() => {
                            const blob = new Blob([msg.content], { type: 'text/markdown' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `courtroom_strategy_${Date.now()}.md`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600"
                        >
                          <FileDown size={12} />
                          <span>Download</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex items-center gap-3 mr-auto max-w-3xl">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-black shrink-0 animate-pulse">
                    AI
                  </div>
                  <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 p-4 rounded-3xl rounded-tl-none flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom prompt input for chat */}
            <div className="p-4 bg-white dark:bg-[#0c0c14] border-t border-slate-200 dark:border-white/5 shrink-0 flex items-center gap-2">
              <input 
                type="text"
                placeholder="Describe case details or ask litigation questions..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-full px-5 py-3.5 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-indigo-500 transition-all"
              />
              <button 
                onClick={() => handleSendMessage()}
                className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PROCEEDINGS TIMELINE LIST */}
        {activeTab === 'timeline' && (
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Court Proceedings Log</h3>
            
            {(!currentCase || !currentCase.facts || currentCase.facts.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl text-center bg-white dark:bg-zinc-900/30">
                <History size={48} className="text-slate-300 dark:text-zinc-700 mb-4" />
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">No court events scheduled</h4>
                <p className="text-xs text-subtext mt-1 max-w-[200px] font-semibold">Track witness depositions, cross-examinations, and legal timelines here.</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-indigo-100 dark:before:bg-zinc-800">
                {currentCase.facts.map((fact) => (
                  <div key={fact.id || fact._id} className="relative group">
                    {/* Bullet marker */}
                    <div className="absolute left-[-23px] top-1.5 w-3 h-3 rounded-full bg-indigo-600 border-4 border-slate-50 dark:border-zinc-900 shadow-sm" />
                    
                    <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">{fact.event}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            <Calendar size={12} />
                            <span>{new Date(fact.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditFact(fact)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500 hover:text-indigo-600"
                            title="Edit Event"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteFact(fact.id || fact._id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-500"
                            title="Delete Event"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{fact.description}</p>

                      {fact.witnessName && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Presiding Witness</span>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{fact.witnessName}</p>
                            <span className="text-[9px] text-subtext font-semibold uppercase">{fact.witnessType}</span>
                          </div>
                          {fact.outcome && (
                            <div>
                              <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Judicial Outcome</span>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{fact.outcome}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CRUD PROCEEDING FORM */}
        {activeTab === 'form' && (
          <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 rounded-[28px] p-6 shadow-md">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {editingFactId ? 'Edit Event Details' : 'Add Courtroom Proceeding / Fact'}
              </h3>
              <p className="text-xs text-subtext mt-1 font-semibold">File trial happenings, arguments, and testimonies into the litigation roadmap.</p>
            </div>

            <div className="space-y-6">
              {/* Event title and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Proceeding Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cross Examination of Opponent" 
                    value={formEvent}
                    onChange={e => setFormEvent(e.target.value)}
                    className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold outline-none text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Date *</label>
                  <input 
                    type="date" 
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold outline-none text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Event Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Brief Overview / Factual Log</label>
                <textarea 
                  rows={3} 
                  placeholder="Record summary details..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-medium outline-none text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              {/* Section 1: Witness Profile */}
              <div className="border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden bg-white dark:bg-[#1A2540]">
                <button
                  type="button"
                  onClick={() => setSection1Expanded(!section1Expanded)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-200/50 dark:border-zinc-800"
                >
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Section 1: Witness Examination</span>
                  {section1Expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {section1Expanded && (
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Witness Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Dr. K. Sen" 
                          value={formWitnessName}
                          onChange={e => setFormWitnessName(e.target.value)}
                          className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-xs font-bold outline-none text-slate-800 dark:text-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Affiliation</label>
                        <select 
                          value={formWitnessType}
                          onChange={e => setFormWitnessType(e.target.value)}
                          className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-xs font-bold outline-none text-slate-800 dark:text-white"
                        >
                          <option value="Prosecution/Plaintiff">Prosecution/Plaintiff</option>
                          <option value="Defense/Respondent">Defense/Respondent</option>
                          <option value="Expert Witness">Expert Witness</option>
                          <option value="Official/Third Party">Official/Third Party</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Arguments & Outcomes */}
              <div className="border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden bg-white dark:bg-[#1A2540]">
                <button
                  type="button"
                  onClick={() => setSection2Expanded(!section2Expanded)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-200/50 dark:border-zinc-800"
                >
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Section 2: Arguments & Outcomes</span>
                  {section2Expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {section2Expanded && (
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Our Primary Arguments</label>
                        <textarea 
                          rows={3} 
                          placeholder="Points structured..."
                          value={formMainArgs}
                          onChange={e => setFormMainArgs(e.target.value)}
                          className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-medium outline-none text-slate-800 dark:text-white resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Counterpoints / Rebuttals</label>
                        <textarea 
                          rows={3} 
                          placeholder="Opposition points challenge..."
                          value={formCounterArgs}
                          onChange={e => setFormCounterArgs(e.target.value)}
                          className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-medium outline-none text-slate-800 dark:text-white resize-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Hearing Outcome Summary</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Adjourned to next month"
                          value={formOutcome}
                          onChange={e => setFormOutcome(e.target.value)}
                          className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-xs font-bold outline-none text-slate-800 dark:text-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Next Strategic Step</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Gather document affidavits"
                          value={formNextStep}
                          onChange={e => setFormNextStep(e.target.value)}
                          className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-xs font-bold outline-none text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleSaveProceeding}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
              >
                {editingFactId ? 'Update Proceeding event' : 'Save Proceeding to Case timeline'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArgumentBuilder;
