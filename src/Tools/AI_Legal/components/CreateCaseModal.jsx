import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  X, Calendar, User, Users, Gavel, FileText, Upload, Plus, Shield, 
  List, ChevronDown, Phone, Globe, Search, Hash, AlertTriangle, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../../services/apiService';

// --- Full Country Dataset ---
const COUNTRIES = [
  { flag: '🇮🇳', name: 'India', iso: 'IN', dial: '+91' },
  { flag: '🇺🇸', name: 'United States', iso: 'US', dial: '+1' },
  { flag: '🇬🇧', name: 'United Kingdom', iso: 'GB', dial: '+44' },
  { flag: '🇦🇺', name: 'Australia', iso: 'AU', dial: '+61' },
  { flag: '🇨🇦', name: 'Canada', iso: 'CA', dial: '+1' },
  { flag: '🇩🇪', name: 'Germany', iso: 'DE', dial: '+49' },
  { flag: '🇫🇷', name: 'France', iso: 'FR', dial: '+33' },
  { flag: '🇯🇵', name: 'Japan', iso: 'JP', dial: '+81' },
  { flag: '🇨🇳', name: 'China', iso: 'CN', dial: '+86' },
  { flag: '🇧🇷', name: 'Brazil', iso: 'BR', dial: '+55' },
  { flag: '🇲🇽', name: 'Mexico', iso: 'MX', dial: '+52' },
  { flag: '🇷🇺', name: 'Russia', iso: 'RU', dial: '+7' },
  { flag: '🇰🇷', name: 'South Korea', iso: 'KR', dial: '+82' },
  { flag: '🇮🇹', name: 'Italy', iso: 'IT', dial: '+39' },
  { flag: '🇪🇸', name: 'Spain', iso: 'ES', dial: '+34' },
  { flag: '🇸🇦', name: 'Saudi Arabia', iso: 'SA', dial: '+966' },
  { flag: '🇦🇪', name: 'UAE', iso: 'AE', dial: '+971' },
  { flag: '🇵🇰', name: 'Pakistan', iso: 'PK', dial: '+92' },
  { flag: '🇧🇩', name: 'Bangladesh', iso: 'BD', dial: '+880' },
  { flag: '🇳🇬', name: 'Nigeria', iso: 'NG', dial: '+234' },
  { flag: '🇿🇦', name: 'South Africa', iso: 'ZA', dial: '+27' },
  { flag: '🇪🇬', name: 'Egypt', iso: 'EG', dial: '+20' },
  { flag: '🇮🇩', name: 'Indonesia', iso: 'ID', dial: '+62' },
  { flag: '🇹🇷', name: 'Turkey', iso: 'TR', dial: '+90' },
  { flag: '🇦🇷', name: 'Argentina', iso: 'AR', dial: '+54' },
  { flag: '🇵🇭', name: 'Philippines', iso: 'PH', dial: '+63' },
  { flag: '🇳🇱', name: 'Netherlands', iso: 'NL', dial: '+31' },
  { flag: '🇧🇪', name: 'Belgium', iso: 'BE', dial: '+32' },
  { flag: '🇸🇪', name: 'Sweden', iso: 'SE', dial: '+46' },
  { flag: '🇳🇴', name: 'Norway', iso: 'NO', dial: '+47' },
  { flag: '🇩🇰', name: 'Denmark', iso: 'DK', dial: '+45' },
  { flag: '🇫🇮', name: 'Finland', iso: 'FI', dial: '+358' },
  { flag: '🇵🇱', name: 'Poland', iso: 'PL', dial: '+48' },
  { flag: '🇨🇭', name: 'Switzerland', iso: 'CH', dial: '+41' },
  { flag: '🇦🇹', name: 'Austria', iso: 'AT', dial: '+43' },
  { flag: '🇵🇹', name: 'Portugal', iso: 'PT', dial: '+351' },
  { flag: '🇬🇷', name: 'Greece', iso: 'GR', dial: '+30' },
  { flag: '🇮🇱', name: 'Israel', iso: 'IL', dial: '+972' },
  { flag: '🇸🇬', name: 'Singapore', iso: 'SG', dial: '+65' },
  { flag: '🇲🇾', name: 'Malaysia', iso: 'MY', dial: '+60' },
  { flag: '🇹🇭', name: 'Thailand', iso: 'TH', dial: '+66' },
  { flag: '🇻🇳', name: 'Vietnam', iso: 'VN', dial: '+84' },
  { flag: '🇳🇿', name: 'New Zealand', iso: 'NZ', dial: '+64' }
];

// --- Case Categories ---
const ALL_CATEGORIES = [
  'Civil', 'Criminal', 'Family', 'Property', 'Corporate', 'Cyber Crime',
  'Consumer', 'Banking', 'Tax', 'Labour', 'Arbitration', 'Immigration',
  'Constitutional', 'Environment', 'Intellectual Property', 'Contract',
  'Insurance', 'Real Estate', 'Employment', 'Company', 'Consumer Protection',
  'Medical Negligence', 'Domestic Violence', 'Bail', 'Appeal', 'Other'
];

const CLIENT_ROLES = ['Petitioner', 'Appellant', 'Applicant', 'Plaintiff'];
const OPPONENT_ROLES = ['Respondent', 'Non-Applicant', 'Opposite Party'];

const CreateCaseModal = ({ isDark, isVisible, onClose, onSave, editingCase }) => {
  const [caseData, setCaseData] = useState({
    title: '',
    clientRole: '',
    clientName: '',
    opponentRole: '',
    opponentName: '',
    courtName: '',
    courtType: '',
    caseCategories: [],
    priority: 'Standard',
    state: '',
    district: '',
    city: '',
    filingDate: '',
    incidentDate: '',
    status: 'Active',
    caseSummary: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(null);

  const [categorySearch, setCategorySearch] = useState('');

  // Sub-picker toggles
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showClientRolePicker, setShowClientRolePicker] = useState(false);
  const [showOpponentRolePicker, setShowOpponentRolePicker] = useState(false);

  const loadCaseFromApi = (caseId, active) => {
    setIsLoading(true);
    setLoadingError(null);
    apiService.getProject(caseId)
      .then(fullCase => {
        if (!active) return;
        console.log("Loaded Full Case Details:", fullCase);
        const categories = fullCase.caseCategories || (fullCase.caseType ? (Array.isArray(fullCase.caseType) ? fullCase.caseType : fullCase.caseType.split(', ')) : []);
        setCaseData({
          id: fullCase._id || fullCase.id || '',
          title: fullCase.title || fullCase.name || '',
          clientRole: fullCase.clientRole || '',
          clientName: fullCase.clientName || '',
          opponentRole: fullCase.opponentRole || '',
          opponentName: fullCase.opponentName || '',
          courtName: fullCase.courtName || fullCase.court || '',
          caseCategories: categories,
          priority: fullCase.priority || 'Standard',
          courtType: fullCase.courtType || '',
          state: fullCase.state || '',
          district: fullCase.district || '',
          city: fullCase.city || '',
          filingDate: fullCase.filingDate || '',
          incidentDate: fullCase.incidentDate || '',
          status: fullCase.status || 'Active',
          caseSummary: fullCase.caseSummary || fullCase.summary || ''
        });
        setIsLoading(false);
      })
      .catch(err => {
        if (!active) return;
        console.error("Failed to fetch case details:", err);
        setLoadingError("Unable to load case details.");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let active = true;
    if (editingCase && isVisible) {
      const caseId = editingCase._id || editingCase.id || (typeof editingCase === 'string' ? editingCase : '');
      if (caseId) {
        loadCaseFromApi(caseId, active);
      }
    } else {
      setIsLoading(false);
      setLoadingError(null);
      setCaseData({
        title: '',
        clientRole: '',
        clientName: '',
        opponentRole: '',
        opponentName: '',
        courtName: '',
        courtType: '',
        caseCategories: [],
        priority: 'Standard',
        state: '',
        district: '',
        city: '',
        filingDate: '',
        incidentDate: '',
        status: 'Active',
        caseSummary: ''
      });
    }
    return () => {
      active = false;
    };
  }, [editingCase, isVisible]);

  const filteredCategories = useMemo(() => {
    const q = categorySearch.toLowerCase().trim();
    if (!q) return ALL_CATEGORIES;
    return ALL_CATEGORIES.filter(c => c.toLowerCase().includes(q));
  }, [categorySearch]);

  const toggleCategory = (cat) => {
    setCaseData(prev => {
      const cats = prev.caseCategories || [];
      if (cats.includes(cat)) {
        return { ...prev, caseCategories: cats.filter(c => c !== cat) };
      }
      if (cats.length >= 10) {
        alert('Maximum 10 categories allowed.');
        return prev;
      }
      return { ...prev, caseCategories: [...cats, cat] };
    });
  };

  const handleSave = () => {
    if (!caseData.title.trim()) {
      alert('Please enter a Case Title before saving.');
      return;
    }
    if (!caseData.caseCategories || caseData.caseCategories.length === 0) {
      alert('Please select at least 1 case category.');
      return;
    }
    if (!caseData.clientRole) {
      alert('Please select a Client Role.');
      return;
    }
    if (!caseData.clientName.trim()) {
      alert(`Please enter the ${caseData.clientRole} Name.`);
      return;
    }
    if (!caseData.caseSummary.trim()) {
      alert('Please enter a Case Summary.');
      return;
    }

    const savedPayload = {
      ...caseData,
      name: caseData.title,
      caseType: caseData.caseCategories.join(', ')
    };
    onSave(savedPayload);
    
    // Reset form
    setCaseData({
      title: '',
      clientRole: '',
      clientName: '',
      opponentRole: '',
      opponentName: '',
      courtName: '',
      courtType: '',
      caseCategories: [],
      priority: 'Standard',
      state: '',
      district: '',
      city: '',
      filingDate: '',
      incidentDate: '',
      status: 'Active',
      caseSummary: ''
    });
  };

  return (
    <Transition.Root show={isVisible} as={Fragment}>
      <Dialog as="div" className="relative z-[120000]" onClose={onClose}>
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

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-8"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-8"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-900 p-6 sm:p-8 text-left align-middle shadow-2xl transition-all border border-slate-200 dark:border-zinc-800">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4 mb-6">
                  <div>
                    <Dialog.Title as="h3" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {editingCase ? 'Edit Case Intelligence' : 'New Case Intelligence'}
                    </Dialog.Title>
                    <p className="text-[10px] sm:text-xs text-subtext font-semibold mt-0.5">
                      {editingCase ? 'Modify professional legal case details' : 'Enter professional legal case details'}
                    </p>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <X size={20} className="text-slate-500 dark:text-slate-400" />
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest animate-pulse">Loading case data...</p>
                    </div>
                  ) : loadingError ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                      <AlertTriangle size={40} className="text-rose-500 animate-bounce" />
                      <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{loadingError}</p>
                      <button
                        type="button"
                        onClick={() => {
                          const caseId = editingCase._id || editingCase.id || (typeof editingCase === 'string' ? editingCase : '');
                          if (caseId) {
                            loadCaseFromApi(caseId, true);
                          }
                        }}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* SECTION 1: Case Identity */}
                      <div className="border-b border-slate-100 dark:border-zinc-800/80 pb-5">
                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                          SECTION 1 — Case Identity
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Case Title */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">Case Title *</label>
                            <div className="flex items-center bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3">
                              <FileText size={18} className="text-indigo-600 dark:text-indigo-400 mr-2 shrink-0" />
                              <input
                                type="text"
                                placeholder="e.g. Smith vs Matrix Corp"
                                value={caseData.title}
                                onChange={e => setCaseData({ ...caseData, title: e.target.value })}
                                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-bold text-slate-800 dark:text-white"
                              />
                            </div>
                          </div>

                          {/* Case Status */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">Case Status</label>
                            <div className="relative">
                              <select
                                value={caseData.status}
                                onChange={e => setCaseData({ ...caseData, status: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 dark:text-white outline-none cursor-pointer appearance-none pr-10"
                              >
                                <option value="Active">Active</option>
                                <option value="Pending">Pending</option>
                                <option value="Closed">Closed</option>
                                <option value="Archived">Archived</option>
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* Priority */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">Priority</label>
                            <div className="relative">
                              <select
                                value={caseData.priority}
                                onChange={e => setCaseData({ ...caseData, priority: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 dark:text-white outline-none cursor-pointer appearance-none pr-10"
                              >
                                <option value="Standard">Standard</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* Case Category Selection */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">Case Category *</label>
                            <button
                               type="button"
                               onClick={() => setShowCategoryPicker(true)}
                               className="w-full flex items-center justify-between bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-left min-h-[52px]"
                            >
                              <div className="flex items-center gap-2 flex-wrap max-w-[85%]">
                                <List size={18} className="text-indigo-600 dark:text-indigo-400 mr-1 shrink-0" />
                                {caseData.caseCategories && caseData.caseCategories.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {caseData.caseCategories.slice(0, 2).map(cat => (
                                      <span key={cat} className="bg-indigo-600 text-white rounded-md text-[9px] font-black uppercase px-2 py-0.5 shrink-0">
                                        {cat}
                                      </span>
                                    ))}
                                    {caseData.caseCategories.length > 2 && (
                                      <span className="bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 rounded-md text-[9px] font-black px-1.5 py-0.5">
                                        +{caseData.caseCategories.length - 2}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm font-bold text-slate-400">Select categories...</span>
                                )}
                              </div>
                              <ChevronDown size={16} className="text-slate-400 shrink-0" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 2: Participants */}
                      <div className="border-b border-slate-100 dark:border-zinc-800/80 pb-5">
                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                          SECTION 2 — Participants
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Client Role */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">Client Role *</label>
                            <button
                              type="button"
                              onClick={() => setShowClientRolePicker(true)}
                              className="w-full flex items-center justify-between bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-left"
                            >
                              <div className="flex items-center gap-2">
                                <User size={18} className="text-indigo-600 dark:text-indigo-400" />
                                <span className={`text-sm font-bold ${caseData.clientRole ? 'text-slate-850 dark:text-white' : 'text-slate-400'}`}>
                                  {caseData.clientRole || 'Select Client Role'}
                                </span>
                              </div>
                              <ChevronDown size={16} className="text-slate-400" />
                            </button>
                          </div>

                          {/* Opponent Role */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">Opponent Role</label>
                            <button
                              type="button"
                              onClick={() => setShowOpponentRolePicker(true)}
                              className="w-full flex items-center justify-between bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-left"
                            >
                              <div className="flex items-center gap-2">
                                <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
                                <span className={`text-sm font-bold ${caseData.opponentRole ? 'text-slate-850 dark:text-white' : 'text-slate-400'}`}>
                                  {caseData.opponentRole || 'Select Opponent Role'}
                                </span>
                              </div>
                              <ChevronDown size={16} className="text-slate-400" />
                            </button>
                          </div>

                          {/* Client Name */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">Client Name *</label>
                            <div className="flex items-center bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3">
                              <User size={18} className="text-indigo-600 dark:text-indigo-400 mr-2 shrink-0" />
                              <input
                                type="text"
                                placeholder="Enter Client Name"
                                value={caseData.clientName}
                                onChange={e => setCaseData({ ...caseData, clientName: e.target.value })}
                                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-bold text-slate-800 dark:text-white"
                              />
                            </div>
                          </div>

                          {/* Opponent Name */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">Opponent Name</label>
                            <div className="flex items-center bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3">
                              <Users size={18} className="text-indigo-600 dark:text-indigo-400 mr-2 shrink-0" />
                              <input
                                type="text"
                                placeholder="Enter Opponent Name"
                                value={caseData.opponentName}
                                onChange={e => setCaseData({ ...caseData, opponentName: e.target.value })}
                                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-bold text-slate-800 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 3: Court Details */}
                      <div className="border-b border-slate-100 dark:border-zinc-800/80 pb-5">
                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                          SECTION 3 — Court Details
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Court */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">Court</label>
                            <div className="flex items-center bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3">
                              <Gavel size={18} className="text-indigo-600 dark:text-indigo-400 mr-2 shrink-0" />
                              <input
                                type="text"
                                placeholder="Supreme Court, etc."
                                value={caseData.courtName}
                                onChange={e => setCaseData({ ...caseData, courtName: e.target.value })}
                                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-bold text-slate-800 dark:text-white"
                              />
                            </div>
                          </div>

                          {/* Court Type */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">Court Type</label>
                            <div className="flex items-center bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3">
                              <input
                                type="text"
                                placeholder="e.g. High Court, District Court"
                                value={caseData.courtType}
                                onChange={e => setCaseData({ ...caseData, courtType: e.target.value })}
                                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-bold text-slate-800 dark:text-white"
                              />
                            </div>
                          </div>

                          {/* State */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">State</label>
                            <div className="flex items-center bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3">
                              <input
                                type="text"
                                placeholder="e.g. Delhi, Maharashtra"
                                value={caseData.state}
                                onChange={e => setCaseData({ ...caseData, state: e.target.value })}
                                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-bold text-slate-800 dark:text-white"
                              />
                            </div>
                          </div>

                          {/* District */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">District</label>
                            <div className="flex items-center bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3">
                              <input
                                type="text"
                                placeholder="e.g. Central Delhi"
                                value={caseData.district}
                                onChange={e => setCaseData({ ...caseData, district: e.target.value })}
                                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-bold text-slate-800 dark:text-white"
                              />
                            </div>
                          </div>

                          {/* City */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">City</label>
                            <div className="flex items-center bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3">
                              <input
                                type="text"
                                placeholder="e.g. New Delhi"
                                value={caseData.city}
                                onChange={e => setCaseData({ ...caseData, city: e.target.value })}
                                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-bold text-slate-800 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 4: Important Dates */}
                      <div className="border-b border-slate-100 dark:border-zinc-800/80 pb-5">
                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                          SECTION 4 — Important Dates
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Filing Date */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">Filing Date</label>
                            <div className="flex items-center bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3">
                              <Calendar size={18} className="text-indigo-600 dark:text-indigo-400 mr-2 shrink-0" />
                              <input
                                type="date"
                                value={caseData.filingDate}
                                onChange={e => setCaseData({ ...caseData, filingDate: e.target.value })}
                                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-bold text-slate-855 dark:text-white cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* Incident Date */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">Incident Date</label>
                            <div className="flex items-center bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3">
                              <Calendar size={18} className="text-indigo-600 dark:text-indigo-400 mr-2 shrink-0" />
                              <input
                                type="date"
                                max={new Date().toISOString().split('T')[0]}
                                value={caseData.incidentDate}
                                onChange={e => setCaseData({ ...caseData, incidentDate: e.target.value })}
                                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-bold text-slate-855 dark:text-white cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 5: Case Summary */}
                      <div className="pb-2">
                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                          SECTION 5 — Case Summary
                        </h4>
                        
                        {/* Case Summary */}
                        <div className="space-y-1.5 mb-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-subtext ml-1">Case Summary *</label>
                          <div className="flex items-start bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3">
                            <textarea
                              rows={5}
                              placeholder="Describe the timeline, facts, claims, important events, and relief sought..."
                              value={caseData.caseSummary}
                              onChange={e => setCaseData({ ...caseData, caseSummary: e.target.value })}
                              className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-bold text-slate-850 dark:text-white resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer Save Button */}
                <div className="flex items-center justify-end border-t border-slate-100 dark:border-zinc-800 pt-4 mt-6">
                  <button
                    onClick={handleSave}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
                  >
                    {editingCase ? 'Update Case' : 'Create Case'}
                  </button>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        {/* --- Sub-picker Modals --- */}

        {/* Category Picker Modal */}
        <Transition.Root show={showCategoryPicker} as={Fragment}>
          <Dialog as="div" className="relative z-[130000]" onClose={() => setShowCategoryPicker(false)}>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="fixed inset-0 overflow-y-auto flex items-end justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="transition ease-out duration-300 transform"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transition ease-in duration-200 transform"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <Dialog.Panel className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl p-6 text-left shadow-2xl border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-1">
                    <Dialog.Title className="text-md font-extrabold text-slate-900 dark:text-white">Case Categories</Dialog.Title>
                    <button onClick={() => setShowCategoryPicker(false)} className="p-1"><X size={18} className="text-slate-400" /></button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mb-4">{caseData.caseCategories.length} selected · max 10</p>
                  <div className="flex items-center bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 mb-4">
                    <Search size={14} className="text-slate-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Search category..."
                      value={categorySearch}
                      onChange={e => setCategorySearch(e.target.value)}
                      className="bg-transparent border-none outline-none focus:ring-0 text-xs w-full text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-zinc-800">
                    {filteredCategories.map(cat => {
                      const isActive = caseData.caseCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`w-full flex items-center gap-3 px-3 py-3.5 text-left text-xs font-bold transition-all ${
                            isActive ? 'bg-indigo-50/50 dark:bg-indigo-950/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-zinc-700'}`}>
                            {isActive && <span className="text-[10px]">✓</span>}
                          </div>
                          <span className={isActive ? 'text-indigo-650' : 'text-slate-850 dark:text-slate-250'}>{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
                    <button
                      onClick={() => setCaseData(prev => ({ ...prev, caseCategories: [] }))}
                      className="flex-1 py-3 text-center border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowCategoryPicker(false)}
                      className="flex-[2] py-3 text-center bg-indigo-600 rounded-xl text-xs font-black text-white hover:opacity-90"
                    >
                      {caseData.caseCategories.length === 0 ? 'Skip' : `Confirm ${caseData.caseCategories.length}`}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Client Role Picker Modal */}
        <Transition.Root show={showClientRolePicker} as={Fragment}>
          <Dialog as="div" className="relative z-[130000]" onClose={() => setShowClientRolePicker(false)}>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="fixed inset-0 overflow-y-auto flex items-end justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="transition ease-out duration-300 transform"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transition ease-in duration-200 transform"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <Dialog.Panel className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl p-6 text-left shadow-2xl border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title className="text-md font-extrabold text-slate-900 dark:text-white">Select Client Role</Dialog.Title>
                    <button onClick={() => setShowClientRolePicker(false)} className="p-1"><X size={18} className="text-slate-400" /></button>
                  </div>
                  <div className="space-y-1">
                    {CLIENT_ROLES.map(role => (
                      <button
                        key={role}
                        onClick={() => {
                          setCaseData(prev => ({ ...prev, clientRole: role }));
                          setShowClientRolePicker(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left text-xs font-bold transition-all rounded-xl ${
                          caseData.clientRole === role ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span>{role}</span>
                        {caseData.clientRole === role && <span className="text-indigo-600 text-[10px]">✓ Selected</span>}
                      </button>
                    ))}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Opponent Role Picker Modal */}
        <Transition.Root show={showOpponentRolePicker} as={Fragment}>
          <Dialog as="div" className="relative z-[130000]" onClose={() => setShowOpponentRolePicker(false)}>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="fixed inset-0 overflow-y-auto flex items-end justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="transition ease-out duration-300 transform"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transition ease-in duration-200 transform"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <Dialog.Panel className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl p-6 text-left shadow-2xl border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title className="text-md font-extrabold text-slate-900 dark:text-white">Select Objector Type</Dialog.Title>
                    <button onClick={() => setShowOpponentRolePicker(false)} className="p-1"><X size={18} className="text-slate-400" /></button>
                  </div>
                  <div className="space-y-1">
                    {OPPONENT_ROLES.map(role => (
                      <button
                        key={role}
                        onClick={() => {
                          setCaseData(prev => ({ ...prev, opponentRole: role }));
                          setShowOpponentRolePicker(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left text-xs font-bold transition-all rounded-xl ${
                          caseData.opponentRole === role ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span>{role}</span>
                        {caseData.opponentRole === role && <span className="text-indigo-600 text-[10px]">✓ Selected</span>}
                      </button>
                    ))}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

      </Dialog>
    </Transition.Root>
  );
};

export default CreateCaseModal;
