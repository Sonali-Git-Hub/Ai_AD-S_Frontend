import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Briefcase, Users, Scale, Calendar, FileText, CheckCircle2, 
  AlertCircle, TrendingUp, ShieldAlert, Gavel, FileSearch, 
  MessageSquare, Brain, Save, Trash2, Plus, ArrowRight,
  ShieldCheck, AlertTriangle, Info, Download, Upload, Search,
  ClipboardList, BookOpen, UserMinus, UserPlus, ListTodo, History,
  LayoutDashboard, FileDigit, Target, Flame, Lightbulb, Check,
  Clock, MapPin
} from 'lucide-react';
import { 
  PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';
import { apiService } from '../../services/apiService';

const CaseIntelligencePanel = ({ isOpen, onClose, currentCase, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [caseData, setCaseData] = useState(currentCase);

  useEffect(() => {
    if (currentCase) {
      // Auto-update past hearings status
      if (currentCase.hearings) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let hasChanges = false;
        
        const updatedHearings = currentCase.hearings.map(h => {
          const hDate = new Date(h.date);
          hDate.setHours(0, 0, 0, 0);
          
          if (h.status === 'Upcoming' && hDate < today) {
            hasChanges = true;
            return { ...h, status: 'Missed' };
          }
          return h;
        });

        if (hasChanges) {
          setCaseData({ ...currentCase, hearings: updatedHearings });
          return;
        }
      }
      setCaseData(currentCase);
    }
  }, [currentCase]);

  if (!caseData || !isOpen) return null;

  const handleAutoAnalyze = async () => {
    setIsAnalyzing(true);
    const tid = toast.loading("⚖️ AI Legal Brain is analyzing your case...");
    try {
      console.log(`[Panel] Triggering auto-analyze for: ${caseData._id}`);
      // Use the dedicated /api/cases/:id/auto-analyze endpoint
      const analyzed = await apiService.autoAnalyzeCase(
        caseData._id,
        caseData.caseSummary || caseData.name
      );
      console.log('[Panel] Analysis result:', analyzed);
      setCaseData(analyzed);
      if (onUpdate) onUpdate(analyzed);
      toast.success("✅ Intelligence report generated!", { id: tid });
    } catch (err) {
      console.error('[Panel] Auto-analyze error:', err);
      toast.error("Analysis failed. Check console for details.", { id: tid });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    const tid = toast.loading("Syncing case folder...");
    try {
      const updated = await apiService.updateProject(caseData._id, caseData);
      if (onUpdate) onUpdate(updated);
      toast.success("Changes saved successfully!", { id: tid });
    } catch (err) {
      toast.error("Failed to save changes.", { id: tid });
    }
  };

  // Robust mapping to handle both DB fields and potential raw AI keys
  const rawStrength = caseData.intelligence?.strengthScore ?? caseData.case_strength ?? 0;
  const rawWinProb = caseData.intelligence?.winProbability ?? caseData.win_probability ?? 0;

  // Normalize scores: if they are <= 1 and > 0, assume they are decimals (e.g., 0.85 -> 85)
  // This handles AI models that return normalized floats instead of percentages.
  const strengthScore = (rawStrength > 0 && rawStrength <= 1) ? Math.round(rawStrength * 100) : rawStrength;
  const winProbability = (rawWinProb > 0 && rawWinProb <= 1) ? Math.round(rawWinProb * 100) : rawWinProb;

  const strengthData = [
    { name: 'Strength', value: strengthScore },
    { name: 'Remaining', value: 100 - strengthScore }
  ];

  const winProbData = [
    { name: 'Win Prob', value: winProbability },
    { name: 'Risk', value: 100 - winProbability }
  ];

  const COLORS = ['#6366f1', 'rgba(128,128,128,0.1)'];
  const WIN_COLORS = ['#10b981', 'rgba(128,128,128,0.1)'];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'communication', name: 'Communication', icon: MessageSquare },
    { id: 'hearings', name: 'Hearings', icon: Gavel },
    { id: 'parties', name: 'Parties', icon: Users },
    { id: 'timeline', name: 'Timeline', icon: History },
    { id: 'evidence', name: 'Evidence', icon: FileSearch },
    { id: 'tasks', name: 'Process', icon: ListTodo },
    { id: 'intelligence', name: 'AI Strategy', icon: Brain },
    { id: 'research', name: 'Research', icon: BookOpen },
  ];

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Summary Card */}
      <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-5 border border-slate-200 dark:border-zinc-700/50">
        <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400">
          <FileText size={18} />
          <h4 className="text-xs font-black uppercase tracking-wider">Case Summary</h4>
        </div>
        <textarea
          value={caseData.caseSummary || ''}
          onChange={(e) => setCaseData({ ...caseData, caseSummary: e.target.value })}
          className="w-full bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-0 resize-none min-h-[100px]"
          placeholder="No summary provided yet. Click Auto-Analyze to generate one."
        />
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {isAnalyzing && (
            <div className="absolute inset-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <div className="relative" style={{width: 96, height: 96}}>
            <PieChart width={96} height={96}>
              <Pie data={strengthData} cx={48} cy={48} innerRadius={30} outerRadius={42} paddingAngle={0} dataKey="value" startAngle={90} endAngle={-270}>
                {strengthData.map((entry, index) => <Cell key={`s-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-none">
                {isAnalyzing ? '--' : `${strengthScore}%`}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-subtext mt-2">Case Strength</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {isAnalyzing && (
            <div className="absolute inset-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <div className="relative" style={{width: 96, height: 96}}>
            <PieChart width={96} height={96}>
              <Pie data={winProbData} cx={48} cy={48} innerRadius={30} outerRadius={42} paddingAngle={0} dataKey="value" startAngle={90} endAngle={-270}>
                {winProbData.map((entry, index) => <Cell key={`w-${index}`} fill={WIN_COLORS[index % WIN_COLORS.length]} />)}
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-emerald-500 leading-none">
                {isAnalyzing ? '--' : `${winProbability}%`}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-2">Win Probability</span>
        </div>
      </div>

      {/* Case Details Grid */}
      <div className="grid grid-cols-1 gap-4">
         <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">Current Stage</label>
           <select 
             value={caseData.stage}
             onChange={(e) => setCaseData({...caseData, stage: e.target.value})}
             className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-indigo-500/20"
           >
             <option value="Pre-litigation">Pre-litigation</option>
             <option value="Notice">Notice Stage</option>
             <option value="Court">Court Proceedings</option>
             <option value="Judgment">Judgment Pending</option>
             <option value="Settled">Settled / Closed</option>
           </select>
         </div>

         <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">Priority Level</label>
           <div className="flex gap-2">
             {['Low', 'Medium', 'High', 'Urgent'].map(p => (
               <button
                 key={p}
                 onClick={() => setCaseData({...caseData, priority: p})}
                 className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                   caseData.priority === p 
                   ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                   : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-subtext hover:border-indigo-500/50'
                 }`}
               >
                 {p}
               </button>
             ))}
           </div>
         </div>
      </div>

      {/* Relief/Goals */}
      <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl p-4 sm:p-5 border border-amber-200/50 dark:border-amber-900/20 overflow-hidden">
        <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400">
          <Target size={18} />
          <h4 className="text-xs font-black uppercase tracking-wider">Your Claim</h4>
        </div>
        <textarea
          value={caseData.reliefGoals || ''}
          onChange={(e) => setCaseData({ ...caseData, reliefGoals: e.target.value })}
          className="w-full bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-0 resize-none overflow-wrap-anywhere"
          placeholder="What does the client want to achieve?"
          rows={3}
        />
      </div>

    </div>
  );

  const renderCommunication = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-2 px-1">
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white">Communication Dashboard</h3>
          <p className="text-[10px] font-bold text-subtext uppercase tracking-widest mt-1">Track all client interactions and internal case notes</p>
        </div>
        <button 
          onClick={() => setCaseData({...caseData, communicationLogs: [{type: 'Note', date: new Date().toISOString(), summary: ''}, ...(caseData.communicationLogs || [])]})}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={14} />
          Add New Log
        </button>
      </div>

      <div className="space-y-4">
        {(caseData.communicationLogs || []).map((log, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${
              log.type === 'Call' ? 'bg-blue-500' : 
              log.type === 'Email' ? 'bg-amber-500' : 
              log.type === 'Meeting' ? 'bg-emerald-500' : 'bg-indigo-500'
            }`} />
            
            <div className="flex justify-between items-center mb-4">
               <div className="flex items-center gap-3">
                  <select 
                    value={log.type}
                    onChange={(e) => {
                      const newLogs = [...caseData.communicationLogs];
                      newLogs[i].type = e.target.value;
                      setCaseData({...caseData, communicationLogs: newLogs});
                    }}
                    className="bg-slate-100 dark:bg-black/40 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border-none outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Note">Internal Note</option>
                  </select>
                  <span className="text-[10px] text-subtext font-black uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-2 py-1 rounded border border-slate-100 dark:border-white/5">
                    {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
               </div>
               <button 
                 onClick={() => setCaseData({...caseData, communicationLogs: caseData.communicationLogs.filter((_, idx) => idx !== i)})}
                 className="p-2 text-subtext hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
               >
                 <Trash2 size={14} />
               </button>
            </div>
            
            <textarea
              value={log.summary}
              onChange={(e) => {
                 const newLogs = [...caseData.communicationLogs];
                 newLogs[i].summary = e.target.value;
                 setCaseData({...caseData, communicationLogs: newLogs});
              }}
              className="w-full bg-slate-50/50 dark:bg-black/20 border border-slate-100 dark:border-zinc-800/50 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 p-4 min-h-[80px] resize-none"
              placeholder="What was discussed? Enter details here..."
            />
          </div>
        ))}

        {(!caseData.communicationLogs || caseData.communicationLogs.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-zinc-800">
            <div className="p-5 bg-slate-50 dark:bg-zinc-800 rounded-full mb-4">
              <MessageSquare size={32} className="text-subtext opacity-40" />
            </div>
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Logs Found</h4>
            <p className="text-[11px] text-subtext mt-2 max-w-[240px] text-center font-medium">Start tracking your case communications by clicking the 'Add New Log' button above.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderParties = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <UserPlus size={20} />
              </div>
              <h4 className="text-sm font-black text-slate-800 dark:text-white">Client / Complainant</h4>
           </div>
           <input
             type="text"
             value={caseData.clientName || ''}
             onChange={(e) => setCaseData({...caseData, clientName: e.target.value})}
             className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold outline-none"
             placeholder="Name of client"
           />
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                <UserMinus size={20} />
              </div>
              <h4 className="text-sm font-black text-slate-800 dark:text-white">Opponent / Accused</h4>
           </div>
           <input
             type="text"
             value={caseData.opponentName || ''}
             onChange={(e) => setCaseData({...caseData, opponentName: e.target.value})}
             className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold outline-none"
             placeholder="Name of opponent"
           />
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Briefcase size={20} />
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white">Associated Lawyers</h4>
              </div>
              <button 
                onClick={() => setCaseData({...caseData, lawyers: [...(caseData.lawyers || []), {name: '', role: ''}]})}
                className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-primary"
              >
                <Plus size={18} />
              </button>
           </div>
           <div className="space-y-3">
              {(caseData.lawyers || []).map((l, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    value={l.name}
                    onChange={(e) => {
                      const newL = [...caseData.lawyers];
                      newL[idx].name = e.target.value;
                      setCaseData({...caseData, lawyers: newL});
                    }}
                    placeholder="Lawyer Name"
                    className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-[11px] font-bold outline-none"
                  />
                  <input
                    value={l.role}
                    onChange={(e) => {
                      const newL = [...caseData.lawyers];
                      newL[idx].role = e.target.value;
                      setCaseData({...caseData, lawyers: newL});
                    }}
                    placeholder="Role"
                    className="w-24 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-[11px] font-bold outline-none"
                  />
                  <button 
                    onClick={() => setCaseData({...caseData, lawyers: caseData.lawyers.filter((_, i) => i !== idx)})}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );

  const renderHearings = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const hToday = (caseData.hearings || []).find(h => new Date(h.date).toDateString() === today.toDateString() && h.status === 'Upcoming');
    const hTomorrow = (caseData.hearings || []).find(h => new Date(h.date).toDateString() === tomorrow.toDateString() && h.status === 'Upcoming');

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
         {/* 🔔 REMINDER ALERTS */}
         {(hToday || hTomorrow) && (
            <div className="space-y-3">
              {hToday && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-2xl flex items-center gap-4 animate-pulse">
                  <div className="p-2.5 bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20">
                     <Gavel size={20} />
                  </div>
                  <div>
                     <h5 className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">🚨 Hearing Today</h5>
                     <p className="text-sm font-black text-slate-800 dark:text-white">{hToday.time || 'Scheduled'} @ {hToday.courtName || 'the Court'}</p>
                  </div>
                </div>
              )}
              {hTomorrow && !hToday && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20">
                     <Clock size={20} />
                  </div>
                  <div>
                     <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">📅 Upcoming Tomorrow</h5>
                     <p className="text-sm font-black text-slate-800 dark:text-white">{hTomorrow.time || 'Scheduled'} @ {hTomorrow.courtName || 'the Court'}</p>
                  </div>
                </div>
              )}
            </div>
         )}

         {/* ⚖️ HEARINGS & SCHEDULE */}
         <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Scale size={18} />
              <h4 className="text-xs font-black uppercase tracking-wider">⚖️ Case Hearings & Court Schedule</h4>
            </div>
            <button 
              onClick={() => {
                const newHearing = {
                  date: new Date().toISOString().split('T')[0],
                  time: '',
                  courtName: '',
                  location: '',
                  notes: '',
                  status: 'Upcoming'
                };
                const updatedHearings = [...(caseData.hearings || []), newHearing];
                // Also sync to timeline
                const newFacts = [...(caseData.facts || []), {
                  event: '⚖️ Hearing',
                  date: newHearing.date,
                  description: 'New court hearing scheduled.'
                }];
                setCaseData({ ...caseData, hearings: updatedHearings, facts: newFacts });
                toast.success("Hearing added and pushed to timeline!");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
            >
              <Plus size={12} /> Add Hearing
            </button>
          </div>

          <div className="space-y-4">
            {/* Upcoming Hearings */}
            {(() => {
              const upcoming = (caseData.hearings || [])
                .filter(h => h.status === 'Upcoming')
                .sort((a, b) => new Date(a.date) - new Date(b.date));
              
              if (upcoming.length === 0) return null;

              return (
                <div className="space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-1">Upcoming Hearings</div>
                  {upcoming.map((h, i) => (
                    <div key={`up-${i}`} className="bg-slate-50 dark:bg-black/20 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 relative group">
                      <div className="flex justify-between items-start mb-3">
                         <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-indigo-500" />
                              <input 
                                type="date" 
                                value={h.date ? new Date(h.date).toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  const newH = [...caseData.hearings];
                                  const idx = newH.indexOf(h);
                                  newH[idx].date = e.target.value;
                                  setCaseData({...caseData, hearings: newH});
                                }}
                                className="bg-transparent border-none p-0 text-sm font-black text-slate-800 dark:text-white focus:ring-0"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                               <Clock size={12} className="text-subtext" />
                               <input 
                                 type="text" 
                                 placeholder="Time (e.g. 10:30 AM)"
                                 value={h.time || ''}
                                 onChange={(e) => {
                                   const newH = [...caseData.hearings];
                                   const idx = newH.indexOf(h);
                                   newH[idx].time = e.target.value;
                                   setCaseData({...caseData, hearings: newH});
                                 }}
                                 className="bg-transparent border-none p-0 text-[11px] font-bold text-subtext focus:ring-0 w-32"
                               />
                            </div>
                         </div>
                         <div className="flex flex-col items-end gap-2">
                            <select 
                              value={h.status}
                              onChange={(e) => {
                                const newH = [...caseData.hearings];
                                const idx = newH.indexOf(h);
                                newH[idx].status = e.target.value;
                                setCaseData({...caseData, hearings: newH});
                              }}
                              className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border-none outline-none"
                            >
                              <option value="Upcoming">Upcoming</option>
                              <option value="Completed">Completed</option>
                              <option value="Missed">Missed</option>
                            </select>
                            <button 
                              onClick={() => {
                                const newH = caseData.hearings.filter(item => item !== h);
                                setCaseData({...caseData, hearings: newH});
                              }}
                              className="p-1 text-subtext hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={14} />
                            </button>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                         <div className="flex items-center gap-2">
                            <Scale size={12} className="text-subtext" />
                            <input 
                              type="text" 
                              placeholder="Court Name"
                              value={h.courtName || ''}
                              onChange={(e) => {
                                const newH = [...caseData.hearings];
                                const idx = newH.indexOf(h);
                                newH[idx].courtName = e.target.value;
                                setCaseData({...caseData, hearings: newH});
                              }}
                              className="bg-transparent border-none p-0 text-[11px] font-bold text-slate-700 dark:text-slate-300 focus:ring-0 w-full"
                            />
                         </div>
                         <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-subtext" />
                            <input 
                              type="text" 
                              placeholder="Location"
                              value={h.location || ''}
                              onChange={(e) => {
                                const newH = [...caseData.hearings];
                                const idx = newH.indexOf(h);
                                newH[idx].location = e.target.value;
                                setCaseData({...caseData, hearings: newH});
                              }}
                              className="bg-transparent border-none p-0 text-[11px] font-bold text-slate-700 dark:text-slate-300 focus:ring-0 w-full"
                            />
                         </div>
                         <div className="flex items-start gap-2 mt-1">
                            <Info size={12} className="text-subtext mt-0.5" />
                            <textarea 
                              placeholder="Add hearing notes..."
                              value={h.notes || ''}
                              onChange={(e) => {
                                const newH = [...caseData.hearings];
                                const idx = newH.indexOf(h);
                                newH[idx].notes = e.target.value;
                                setCaseData({...caseData, hearings: newH});
                              }}
                              className="bg-transparent border-none p-0 text-[11px] font-medium text-subtext focus:ring-0 w-full resize-none min-h-[32px]"
                            />
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Past Hearings */}
            {(() => {
              const past = (caseData.hearings || [])
                .filter(h => h.status !== 'Upcoming')
                .sort((a, b) => new Date(b.date) - new Date(a.date));
              
              if (past.length === 0) return null;

              return (
                <div className="space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1 opacity-60">Past Hearings</div>
                  {past.map((h, i) => (
                    <div key={`past-${i}`} className="bg-slate-50/50 dark:bg-black/10 rounded-xl p-3 border border-slate-100 dark:border-zinc-800 opacity-80 group">
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${h.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                               {h.status === 'Completed' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                            </div>
                            <div>
                               <p className="text-xs font-black text-slate-800 dark:text-white">
                                 {new Date(h.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                 {h.time && ` • ${h.time}`}
                               </p>
                               <p className="text-[10px] font-bold text-subtext uppercase tracking-tight">
                                 {h.courtName || 'Court Hearing'} • {h.status}
                               </p>
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <select 
                              value={h.status}
                              onChange={(e) => {
                                const newH = [...caseData.hearings];
                                const idx = newH.indexOf(h);
                                newH[idx].status = e.target.value;
                                setCaseData({...caseData, hearings: newH});
                              }}
                              className="bg-transparent text-[9px] font-black uppercase tracking-widest text-subtext outline-none cursor-pointer"
                            >
                              <option value="Upcoming">Set Upcoming</option>
                              <option value="Completed">Completed</option>
                              <option value="Missed">Missed</option>
                            </select>
                            <button 
                              onClick={() => {
                                const newH = caseData.hearings.filter(item => item !== h);
                                setCaseData({...caseData, hearings: newH});
                              }}
                              className="p-1 text-subtext hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {(!caseData.hearings || caseData.hearings.length === 0) && (
              <div className="text-center py-8 text-subtext italic text-[11px] bg-slate-50/50 dark:bg-zinc-800/20 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                No hearings scheduled yet.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTimeline = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
       <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-indigo-100 dark:before:bg-zinc-800">
          {(caseData.facts || []).map((f, idx) => (
             <div key={idx} className="relative">
                <div className="absolute left-[-23px] top-1 w-3 h-3 rounded-full bg-indigo-600 border-4 border-white dark:border-zinc-900 shadow-sm" />
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                     <input
                       type="text"
                       value={f.event}
                       onChange={(e) => {
                         const newF = [...caseData.facts];
                         newF[idx].event = e.target.value;
                         setCaseData({...caseData, facts: newF});
                       }}
                       className="text-xs font-black text-slate-800 dark:text-white bg-transparent border-none p-0 focus:ring-0 w-full"
                       placeholder="Event Title"
                     />
                     <button onClick={() => setCaseData({...caseData, facts: caseData.facts.filter((_, i) => i !== idx)})} className="text-subtext hover:text-red-500"><X size={14}/></button>
                  </div>
                  <div className="flex items-center gap-2 mb-2 text-[10px] text-indigo-500 font-bold">
                     <Calendar size={12} />
                     <input 
                       type="date"
                       value={f.date ? new Date(f.date).toISOString().split('T')[0] : ''}
                       onChange={(e) => {
                          const newF = [...caseData.facts];
                          newF[idx].date = e.target.value;
                          setCaseData({...caseData, facts: newF});
                       }}
                       className="bg-transparent border-none p-0 focus:ring-0 text-[10px]"
                     />
                  </div>
                  <textarea
                    value={f.description}
                    onChange={(e) => {
                      const newF = [...caseData.facts];
                      newF[idx].description = e.target.value;
                      setCaseData({...caseData, facts: newF});
                    }}
                    className="w-full bg-transparent border-none text-[11px] text-subtext focus:ring-0 p-0 resize-none min-h-[40px]"
                    placeholder="Describe what happened..."
                  />
                </div>
             </div>
          ))}
          <button 
            onClick={() => setCaseData({...caseData, facts: [...(caseData.facts || []), {event: 'New Event', date: new Date().toISOString(), description: ''}]})}
            className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-subtext hover:border-indigo-500 hover:text-indigo-500 transition-all"
          >
            + Add Timeline Event
          </button>
       </div>
    </div>
  );

  const renderIntelligence = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
       {/* Risk Level Indicator */}
       <div className={`p-5 rounded-2xl border flex items-center justify-between ${
         caseData.intelligence?.riskLevel === 'High' || caseData.intelligence?.riskLevel === 'Critical'
         ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400'
         : caseData.intelligence?.riskLevel === 'Medium'
         ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400'
         : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'
       }`}>
          <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-current bg-opacity-10`}>
                 <ShieldAlert size={20} />
              </div>
              <div>
                 <h4 className="text-sm font-black tracking-tight">Case Risk Assessment</h4>
                 <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Currently flagged as {caseData.intelligence?.riskLevel || 'Medium'} Risk</p>
                 {caseData.intelligence?.weakPoints?.[0] && (
                   <p className="text-[11px] mt-1 opacity-70 font-medium leading-snug">{caseData.intelligence.weakPoints[0]}</p>
                 )}
              </div>
           </div>
           <div className="text-xl font-black">{caseData.intelligence?.riskLevel || 'Medium'}</div>
       </div>

       {/* Weak Points & Missing Evidence */}
       <div className="grid grid-cols-1 gap-6">
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Flame size={18} />
                <h4 className="text-xs font-black uppercase tracking-wider">Critical Vulnerabilities</h4>
             </div>
             <div className="space-y-2">
                {(caseData.intelligence?.weakPoints || []).map((w, i) => (
                  <div key={i} className="flex gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-sm font-medium text-slate-700 dark:text-slate-300">
                     <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                     {w}
                  </div>
                ))}
                {(!caseData.intelligence?.weakPoints || caseData.intelligence?.weakPoints.length === 0) && (
                  <div className="text-center py-6 text-subtext italic text-[11px] bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">No vulnerabilities identified yet.</div>
                )}
             </div>
          </div>

          <div className="space-y-3">
             <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Lightbulb size={18} />
                <h4 className="text-xs font-black uppercase tracking-wider">Opponent Strategy Prediction</h4>
             </div>
             <div className="space-y-2">
                {(caseData.intelligence?.opponentStrategies || []).map((s, i) => (
                  <div key={i} className="flex gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-sm font-medium text-slate-700 dark:text-slate-300">
                     <ShieldCheck size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                     {s}
                  </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );

  const renderResearch = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
       <div className="space-y-4">
          {(caseData.research || []).map((r, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm group">
               <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                     <div className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md text-[10px] font-black uppercase tracking-wider">{r.lawName || 'Law Reference'}</div>
                     {r.section && <span className="text-sm font-black text-slate-800 dark:text-white">Section {r.section}</span>}
                  </div>
                  <button onClick={() => setCaseData({...caseData, research: caseData.research.filter((_, idx) => idx !== i)})} className="text-subtext hover:text-red-500"><X size={14} /></button>
               </div>
               <p className="text-xs text-subtext leading-relaxed mb-3">{r.description}</p>
               {r.referenceUrl && (
                 <a href={r.referenceUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 hover:underline">
                    <BookOpen size={10} /> View Official Text
                 </a>
               )}
            </div>
          ))}
          <button 
            onClick={() => setCaseData({...caseData, research: [...(caseData.research || []), {lawName: 'New Act', section: '', description: ''}]})}
            className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-subtext hover:border-indigo-500 hover:text-indigo-500 transition-all"
          >
            + Add Legal Reference
          </button>
       </div>
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] pointer-events-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        />

        {/* Panel */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, x: '-50%', y: '-50%' }}
          animate={{ scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
          exit={{ scale: 0.9, opacity: 0, x: '-50%', y: '-50%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed left-1/2 top-1/2 w-[98%] sm:w-[95%] max-w-5xl h-[85vh] sm:h-[90vh] bg-white dark:bg-[#0b0c15] shadow-2xl flex flex-col pointer-events-auto rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden border border-white/10"
        >
          {/* Header */}
          <div className="relative shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-600/90 z-0" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 z-0" />
            
            <div className="relative z-10 p-3 sm:p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                <div className="p-1.5 sm:p-3 bg-white/20 backdrop-blur-md rounded-lg sm:rounded-2xl border border-white/20 shrink-0">
                  <Briefcase className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div className="overflow-hidden">
                  <h2 className="text-sm sm:text-xl font-black tracking-tight leading-tight uppercase truncate max-w-[160px] sm:max-w-[280px]">{caseData.name}</h2>
                  <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1 overflow-hidden">
                    <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[0.2em] opacity-80 whitespace-nowrap">AI Intelligence</span>
                    <span className="w-1 h-1 bg-white/40 rounded-full shrink-0" />
                    <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[0.2em] opacity-80 truncate">{caseData.caseType || 'Legal'}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-full transition-all active:scale-90 shrink-0"
              >
                <X size={18} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 overflow-x-auto custom-scrollbar no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]' 
                  : 'text-subtext hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <tab.icon size={14} />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 pb-64 sm:pb-80 bg-slate-50/30 dark:bg-transparent">
             {activeTab === 'overview' && renderOverview()}
             {activeTab === 'communication' && renderCommunication()}
             {activeTab === 'hearings' && renderHearings()}
             {activeTab === 'parties' && renderParties()}
             {activeTab === 'timeline' && renderTimeline()}
             {activeTab === 'intelligence' && renderIntelligence()}
             {activeTab === 'research' && renderResearch()}
             {activeTab === 'evidence' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <ShieldCheck size={18} />
                      <h4 className="text-xs font-black uppercase tracking-wider">Evidence Vault</h4>
                    </div>
                    <button 
                      onClick={() => document.getElementById('evidence-upload').click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                    >
                      <Upload size={12} />
                      Upload
                    </button>
                    <input 
                      id="evidence-upload" 
                      type="file" 
                      multiple 
                      className="hidden" 
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        const newDocs = files.map(f => ({
                          name: f.name,
                          type: 'Document',
                          uploadDate: new Date().toISOString(),
                          status: 'Verified'
                        }));
                        setCaseData({...caseData, evidence: [...(caseData.evidence || []), ...newDocs]});
                        toast.success(`${files.length} documents added to vault!`);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    {(caseData.evidence || []).map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 dark:bg-black/20 rounded-xl text-subtext group-hover:text-indigo-500 transition-colors">
                            <FileDigit size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[180px]">{doc.name}</p>
                            <p className="text-[9px] font-bold text-subtext uppercase tracking-wider mt-0.5">{doc.type} • {new Date(doc.uploadDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                             (doc.status || '').toLowerCase() === 'strong'
                               ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                               : (doc.status || '').toLowerCase() === 'weak'
                               ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
                               : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                           }`}>
                             {doc.status || 'Moderate'}
                           </span>
                           <button onClick={() => setCaseData({...caseData, evidence: caseData.evidence.filter((_, idx) => idx !== i)})} className="p-1.5 text-subtext hover:text-red-500 transition-colors">
                             <Trash2 size={14} />
                           </button>
                        </div>
                      </div>
                    ))}
                    {(!caseData.evidence || caseData.evidence.length === 0) && (
                      <div className="text-center py-12 bg-slate-50/50 dark:bg-zinc-800/10 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800">
                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-full w-fit mx-auto mb-3 shadow-sm">
                          <FileSearch className="w-6 h-6 text-subtext" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-subtext">Vault is Empty</p>
                        <p className="text-[9px] text-subtext/60 mt-1">Upload relevant documents, proofs, or notices.</p>
                      </div>
                    )}
                  </div>
               </div>
             )}
             {activeTab === 'tasks' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <ListTodo size={18} />
                      <h4 className="text-xs font-black uppercase tracking-wider">Legal Process Tracker</h4>
                    </div>
                    <button 
                      onClick={() => setCaseData({...caseData, tasks: [...(caseData.tasks || []), {title: 'New Task', status: 'Pending', priority: 'Medium'}]})}
                      className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                    >
                      + Add Step
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(caseData.tasks || []).map((task, i) => (
                      <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between group">
                        <div className="flex items-center gap-4 flex-1">
                          <button 
                            onClick={() => {
                              const newTasks = [...caseData.tasks];
                              newTasks[i].status = newTasks[i].status === 'Completed' ? 'Pending' : 'Completed';
                              setCaseData({...caseData, tasks: newTasks});
                            }}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              task.status === 'Completed' 
                              ? 'bg-indigo-600 border-indigo-600 text-white' 
                              : 'border-slate-200 dark:border-zinc-700 hover:border-indigo-400'
                            }`}
                          >
                            {task.status === 'Completed' && <Check size={12} />}
                          </button>
                          <div>
                            <input 
                              value={task.title}
                              onChange={(e) => {
                                const newTasks = [...caseData.tasks];
                                newTasks[i].title = e.target.value;
                                setCaseData({...caseData, tasks: newTasks});
                              }}
                              className={`text-xs font-black bg-transparent border-none p-0 focus:ring-0 ${task.status === 'Completed' ? 'line-through text-subtext opacity-50' : 'text-slate-800 dark:text-white'}`}
                            />
                            {task.deadline && (
                              <p className="text-[9px] font-bold text-indigo-500 mt-0.5">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                             task.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-subtext border border-slate-100'
                           }`}>
                             {task.priority || 'Medium'}
                           </span>
                           <button onClick={() => setCaseData({...caseData, tasks: caseData.tasks.filter((_, idx) => idx !== i)})} className="p-1 text-subtext hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Trash2 size={14} />
                           </button>
                        </div>
                      </div>
                    ))}
                    {(!caseData.tasks || caseData.tasks.length === 0) && (
                      <div className="text-center py-12 bg-slate-50/50 dark:bg-zinc-800/10 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-subtext">No Process Steps</p>
                        <p className="text-[9px] text-subtext/60 mt-1">Auto-Analyze to generate a legal timeline.</p>
                      </div>
                    )}
                  </div>
               </div>
             )}
          </div>

          {/* Quick Actions & Footer */}
          <div className="p-3 sm:p-6 border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0b0c15]/80 backdrop-blur-xl absolute bottom-0 left-0 right-0 z-[210] safe-area-bottom">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-4">
                <button 
                  onClick={handleAutoAnalyze}
                  disabled={isAnalyzing}
                  className="flex items-center justify-center gap-2 py-3 sm:py-3.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-indigo-200/50 dark:border-indigo-500/20 w-full"
                >
                  <Brain size={16} className={isAnalyzing ? 'animate-pulse' : ''} />
                  {isAnalyzing ? 'Processing...' : 'AI Auto-Analyze'}
                </button>
                <button 
                  onClick={() => {
                    onClose();
                    // We call a function passed from Chat.jsx or trigger handleAisaAction
                    if (window.handleAisaAction) {
                      window.handleAisaAction('DRAFT NOTICE');
                    }
                  }}
                  className="flex items-center justify-center gap-2 py-3 sm:py-3.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-emerald-200/50 dark:border-emerald-500/20 w-full"
                >
                  <FileText size={16} />
                  Draft Notice
                </button>
             </div>
             <button
               onClick={handleSave}
               className="w-full py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-sm shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
             >
               <Save size={20} />
               Synchronize Case Folder
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CaseIntelligencePanel;
