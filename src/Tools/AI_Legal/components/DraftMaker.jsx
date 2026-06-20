import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ChevronLeft, FileText, Download, Copy, Share2, 
  Edit3, CheckCircle2, Search, Gavel, Shield, Landmark, 
  Users, Briefcase, Home, X, ChevronRight, Printer,
  Save, Eye, FileDown, Plus, Layout, Scale, ShieldAlert,
  CreditCard, Laptop, FileCheck, Globe, Lock, Heart, Award, 
  Calendar, Clock, Folder, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateChatResponse } from '../../../services/geminiService';
import { apiService } from '../../../services/apiService';

const categories = [
  {
    title: 'CRIMINAL LAW',
    icon: <Gavel size={16} className="text-indigo-600 dark:text-indigo-400" />,
    items: ['FIR Draft', 'Bail Application', 'Anticipatory Bail', 'Criminal Complaint', 'Police Complaint', 'Cyber Crime FIR', 'Murder Case Draft', 'Assault Complaint', 'Theft Complaint', 'Fraud Complaint', 'Cheating Case', 'Domestic Violence FIR', 'Extortion Complaint', 'Defamation Complaint', 'Harassment Complaint', 'Drug Offense Draft', 'Juvenile Case Draft']
  },
  {
    title: 'CIVIL LAW',
    icon: <Scale size={16} className="text-indigo-600 dark:text-indigo-400" />,
    items: ['Legal Notice', 'Recovery Notice', 'Civil Suit', 'Injunction Petition', 'Property Dispute', 'Compensation Claim', 'Partition Suit', 'Money Recovery Suit', 'Specific Performance Suit', 'Declaration Suit', 'Possession Suit']
  },
  {
    title: 'FAMILY LAW',
    icon: <Users size={16} className="text-indigo-600 dark:text-indigo-400" />,
    items: ['Divorce Petition', 'Mutual Divorce', 'Child Custody', 'Maintenance Petition', 'Domestic Violence Case', 'Adoption Petition', 'Guardianship Petition', 'Marriage Registration', 'Alimony Petition']
  },
  {
    title: 'PROPERTY LAW',
    icon: <Home size={16} className="text-indigo-600 dark:text-indigo-400" />,
    items: ['Sale Agreement', 'Rent Agreement', 'Lease Agreement', 'Tenant Eviction Notice', 'Registry Verification', 'Property Transfer', 'Builder Complaint', 'Encroachment Complaint', 'Land Dispute']
  },
  {
    title: 'CORPORATE LAW',
    icon: <Briefcase size={16} className="text-indigo-600 dark:text-indigo-400" />,
    items: ['NDA Draft', 'Contract Draft', 'Employment Agreement', 'Partnership Agreement', 'Vendor Agreement', 'Startup Compliance', 'Company Registration', 'Shareholder Agreement', 'MoU Draft', 'Privacy Policy', 'Terms & Conditions']
  },
  {
    title: 'BANKING & FINANCE',
    icon: <Landmark size={16} className="text-indigo-600 dark:text-indigo-400" />,
    items: ['Loan Dispute', 'Cheque Bounce Notice', 'Banking Fraud Complaint', 'EMI Settlement', 'Debt Recovery', 'Financial Agreement', 'Insurance Claim']
  },
  {
    title: 'LABOUR LAW',
    icon: <Briefcase size={16} className="text-indigo-600 dark:text-indigo-400" />,
    items: ['Employee Complaint', 'Salary Recovery', 'Wrongful Termination', 'Workplace Harassment', 'PF Dispute', 'Labour Notice']
  },
  {
    title: 'CONSUMER COURT',
    icon: <CreditCard size={16} className="text-indigo-600 dark:text-indigo-400" />,
    items: ['Consumer Complaint', 'Refund Notice', 'Product Defect Case', 'Online Shopping Fraud', 'Service Deficiency Complaint']
  },
  {
    title: 'CYBER LAW',
    icon: <Laptop size={16} className="text-indigo-600 dark:text-indigo-400" />,
    items: ['Social Media Harassment', 'Online Scam Complaint', 'Data Privacy Complaint', 'Hacking Complaint', 'Fake Profile Complaint', 'Cyber Defamation']
  },
  {
    title: 'TAX & GST',
    icon: <FileCheck size={16} className="text-indigo-600 dark:text-indigo-400" />,
    items: ['GST Notice Reply', 'Income Tax Appeal', 'Tax Dispute', 'GST Registration Draft']
  },
  {
    title: 'INTELLECTUAL PROPERTY',
    icon: <Lock size={16} className="text-indigo-600 dark:text-indigo-400" />,
    items: ['Trademark Registration', 'Copyright Complaint', 'Patent Draft', 'IP Infringement Notice']
  },
  {
    title: 'COURT & DOCUMENTS',
    icon: <Copy size={16} className="text-indigo-600 dark:text-indigo-400" />,
    items: ['Affidavit', 'RTI Application', 'Writ Petition', 'Court Argument', 'Evidence Summary', 'Legal Research', 'Case Summary', 'Court Undertaking', 'Undertaking Letter', 'Memo Draft']
  }
];

const FIELDS_CACHE = {};

const DraftMaker = ({ currentCase, onBack, theme, allProjects = [] }) => {
  const isDark = theme === 'dark';
  const [currentStep, setCurrentStep] = useState('CATEGORY_SELECTION'); // CATEGORY_SELECTION, FORM_ENTRY, GENERATING, PREVIEW, SAVED_DRAFTS
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [finalDraft, setFinalDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('Architecting Draft');
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [savedDraftData, setSavedDraftData] = useState(null);
  const [linkedCaseId, setLinkedCaseId] = useState(currentCase?._id || '');
  const [isCasePickerVisible, setIsCasePickerVisible] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      items: cat.items.filter(item => 
        item.toLowerCase().includes(commandSearch.toLowerCase()) || 
        cat.title.toLowerCase().includes(commandSearch.toLowerCase())
      )
    })).filter(cat => cat.items.length > 0);
  }, [commandSearch]);

  const loadSavedDrafts = useCallback(async () => {
    try {
      setLoadingDrafts(true);
      const data = localStorage.getItem('@aisa_drafts');
      if (data) {
        const parsed = JSON.parse(data);
        const filtered = linkedCaseId ? parsed.filter(d => d.caseId === linkedCaseId) : parsed;
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        setSavedDrafts(filtered);
      } else {
        setSavedDrafts([]);
      }
    } catch (e) {
      console.error("Error loading drafts", e);
    } finally {
      setLoadingDrafts(false);
    }
  }, [linkedCaseId]);

  useEffect(() => {
    if (currentStep === 'SAVED_DRAFTS') {
      loadSavedDrafts();
    }
  }, [currentStep, loadSavedDrafts]);

  // Handle MyCase autofill
  const handleCaseSelect = (caseId) => {
    setLinkedCaseId(caseId);
    if (caseId) {
      const selected = allProjects.find(c => c._id === caseId);
      if (selected) {
        const updatedData = { ...formData };
        formFields.forEach(field => {
          const lowerField = field.toLowerCase();
          if (lowerField.includes('party') || lowerField.includes('parties') || lowerField.includes('client') || lowerField.includes('applicant') || lowerField.includes('plaintiff')) {
            updatedData[field] = selected.clientName || '';
          } else if (lowerField.includes('opponent') || lowerField.includes('respondent') || lowerField.includes('defendant') || lowerField.includes('accused')) {
            updatedData[field] = selected.accused || selected.opponentName || '';
          } else if (lowerField.includes('court') || lowerField.includes('jurisdiction')) {
            updatedData[field] = selected.courtName || '';
          } else if (lowerField.includes('description') || lowerField.includes('fact') || lowerField.includes('notes') || lowerField.includes('detail')) {
            updatedData[field] = selected.summary || selected.description || '';
          } else if (lowerField.includes('number') || lowerField.includes('id') || lowerField.includes('reg')) {
            updatedData[field] = selected.regdNo || '';
          } else if (lowerField.includes('type') || lowerField.includes('category')) {
            updatedData[field] = selected.caseType || '';
          }
        });
        setFormData(updatedData);
        toast.success(`Fields populated from case: ${selected.name}`);
      }
    } else {
      setLinkedCaseId('');
    }
  };

  const handleCategorySelect = async (item) => {
    setSelectedCategory(item);
    setFormData({});
    if (FIELDS_CACHE[item]) {
      setFormFields(FIELDS_CACHE[item]);
      setCurrentStep('FORM_ENTRY');
      return;
    }

    setIsLoadingFields(true);
    setCurrentStep('FORM_ENTRY');

    try {
      const prompt = `I want to draft a professional legal document for: ${item}. 
      Identify 5-7 specific data fields needed from the user to generate this draft (e.g. Party Names, Dates, Specific Facts, IPC Sections if applicable). 
      Return ONLY a JSON array of strings containing the field names. No extra text. Example: ["Field 1", "Field 2"]`;

      const response = await generateChatResponse([], prompt, "You are a Legal Data Architect. Output JSON array only.", [], 'English', null, 'legal');
      const text = response?.reply || response || '';
      
      const jsonStr = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);
      const fields = JSON.parse(jsonStr);
      FIELDS_CACHE[item] = fields;
      setFormFields(fields);
    } catch (error) {
      console.error(error);
      const fallback = ['Name of Parties', 'Relevant Dates', 'Location/Court', 'Brief Description of Case', 'Relief/Prayer Sought'];
      FIELDS_CACHE[item] = fallback;
      setFormFields(fallback);
    } finally {
      setIsLoadingFields(false);
    }
  };

  const handleGenerateDraft = async () => {
    // Check missing fields
    const missing = formFields.filter(f => !formData[f] || String(formData[f]).trim() === '');
    if (missing.length > 0) {
      toast.error(`Please fill out: ${missing.join(', ')}`);
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('Preparing Draft...');
    setCurrentStep('GENERATING');

    const cycleMessages = [
      'Architecting Document Structure...',
      'Formatting Legal Paragraphs...',
      'Polishing Citation Logic...',
      'Finalizing Document Preview...'
    ];
    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < cycleMessages.length) {
        setGenerationStatus(cycleMessages[msgIdx++]);
      }
    }, 2000);

    try {
      let caseContext = "";
      if (linkedCaseId) {
        const c = allProjects.find(p => p._id === linkedCaseId);
        if (c) {
          caseContext = `[Active Case Folder: ${c.name} (Client: ${c.clientName || 'N/A'}, Accused/Opponent: ${c.accused || 'N/A'}, Court: ${c.courtName || 'N/A'})]`;
        }
      }

      const prompt = `As a professional Advocate, generate a REAL court-ready ${selectedCategory} document.
      
      ${caseContext}
      
      Format: High-fidelity legal document (Court Name, Case Title, Parties, Facts, Grounds, Prayer, Verification).
      Language: Professional Legal English.
      Details Provided: ${JSON.stringify(formData)}
      
      Return the document in clean Markdown with professional bold headings and clear sections. Include a footer: "Generated by AISA Legal AI - ${new Date().toLocaleDateString()}".`;

      const response = await generateChatResponse([], prompt, "You are an Elite Legal Architect. You generate complete, formal, and legally binding drafts. No conversational filler.", [], 'English', null, 'legal');
      const text = response?.reply || response || '';
      
      setFinalDraft(text);
      setCurrentStep('PREVIEW');
    } catch (e) {
      toast.error("Failed to generate draft");
      setCurrentStep('FORM_ENTRY');
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const getHtmlContent = () => {
    const parsedDraft = finalDraft
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\n/g, '<br/>');

    return `
      <html>
      <head>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; font-size: 14pt; color: #000; }
          h1 { text-align: center; text-transform: uppercase; font-size: 18pt; font-weight: bold; margin-bottom: 24px; }
          h2 { font-size: 16pt; font-weight: bold; margin-top: 20px; margin-bottom: 12px; }
          h3 { font-size: 14pt; font-weight: bold; margin-top: 16px; margin-bottom: 8px; }
          strong { font-weight: bold; }
          .footer { margin-top: 50px; border-top: 1px solid #ccc; font-size: 10pt; text-align: center; padding-top: 15px; color: #555; }
        </style>
      </head>
      <body>
        ${parsedDraft}
        <div class="footer">Generated by AISA Legal AI - ${new Date().toLocaleDateString()}</div>
      </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(getHtmlContent());
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedCategory || 'Legal Draft',
          text: finalDraft
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      navigator.clipboard.writeText(finalDraft);
      toast.success("Markdown copied to clipboard!");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([finalDraft], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeCategory = (selectedCategory || 'Legal_Draft').replace(/[^a-z0-9]/gi, '_');
    a.href = url;
    a.download = `${safeCategory}_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Markdown file downloaded");
  };

  const handleSaveDraft = () => {
    const draftId = `DRAFT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const timestamp = new Date();
    
    const draftObj = {
      id: draftId,
      title: selectedCategory || 'Legal Draft',
      content: finalDraft,
      date: timestamp.toISOString(),
      caseId: linkedCaseId || currentCase?._id
    };

    const existing = localStorage.getItem('@aisa_drafts');
    const drafts = existing ? JSON.parse(existing) : [];
    drafts.push(draftObj);
    localStorage.setItem('@aisa_drafts', JSON.stringify(drafts));

    setSavedDraftData({
      id: draftId,
      location: 'Local Storage Browser Suite',
      date: timestamp.toLocaleDateString(),
      time: timestamp.toLocaleTimeString()
    });
    toast.success("Draft saved successfully");
  };

  const handleDeleteSavedDraft = (id) => {
    const existing = localStorage.getItem('@aisa_drafts');
    const drafts = existing ? JSON.parse(existing) : [];
    const updated = drafts.filter(d => d.id !== id);
    localStorage.setItem('@aisa_drafts', JSON.stringify(updated));
    loadSavedDrafts();
    toast.success("Draft deleted");
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full min-h-0 bg-slate-50 dark:bg-transparent overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight">Drafting Suite</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">AI ACTIVE</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentStep('SAVED_DRAFTS')} 
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/30 rounded-xl text-xs font-black uppercase tracking-wider"
          >
            <Folder size={14} />
            <span>Saved Drafts</span>
          </button>
          <button 
            onClick={() => setCurrentStep('CATEGORY_SELECTION')} 
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200/30 rounded-xl text-xs font-black uppercase tracking-wider"
          >
            <Layout size={14} />
            <span>Templates</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar min-h-0 select-text">
        {/* Step: CATEGORY_SELECTION */}
        {currentStep === 'CATEGORY_SELECTION' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="relative flex items-center bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3.5 shadow-sm">
              <Search className="text-slate-400 mr-3" size={20} />
              <input 
                type="text" 
                placeholder="Search case types (Bail, Notice, NDA, IPC)..." 
                value={commandSearch}
                onChange={e => setCommandSearch(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-800 dark:text-white outline-none"
              />
              {commandSearch && (
                <button onClick={() => setCommandSearch('')} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full">
                  <X size={16} className="text-slate-400" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCategories.map(cat => (
                <div key={cat.title} className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 rounded-[24px] p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    {cat.icon}
                    <h4 className="text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">{cat.title}</h4>
                  </div>
                  <div className="flex flex-col gap-2">
                    {cat.items.map(item => (
                      <button
                        key={item}
                        onClick={() => handleCategorySelect(item)}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#131C31] hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-left border border-slate-200/50 dark:border-white/5 rounded-xl transition-all"
                      >
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item}</span>
                        <ChevronRight size={14} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step: FORM_ENTRY */}
        {currentStep === 'FORM_ENTRY' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 rounded-[28px] p-6 shadow-md">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{selectedCategory}</h3>
              <p className="text-xs text-subtext mt-1 font-semibold">AI has customized the drafting form for your specific case requirements.</p>

              {/* Case autofill sync */}
              {allProjects.length > 0 && (
                <div className="mt-5 pt-5 border-t border-slate-100 dark:border-white/5 space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">LINK TO CASE (AUTO-FILL)</label>
                  <div className="relative">
                    <select
                      value={linkedCaseId}
                      onChange={e => handleCaseSelect(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">Manual Entry (No Sync)</option>
                      {allProjects.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {isLoadingFields ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-black uppercase tracking-widest text-indigo-500 animate-pulse">Building Smart Form...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {formFields.map(field => {
                  const lower = field.toLowerCase();
                  const isDate = lower.includes('date');
                  const isTime = lower.includes('time');
                  const isTextArea = lower.includes('description') || lower.includes('detail') || lower.includes('fact') || lower.includes('summary');

                  return (
                    <div key={field} className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">{field}</label>
                      {isDate ? (
                        <input
                          type="date"
                          value={formData[field] || ''}
                          onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                          className="w-full bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800 dark:text-white"
                        />
                      ) : isTime ? (
                        <input
                          type="time"
                          value={formData[field] || ''}
                          onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                          className="w-full bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800 dark:text-white"
                        />
                      ) : isTextArea ? (
                        <textarea
                          rows={4}
                          placeholder={`Describe ${field}...`}
                          value={formData[field] || ''}
                          onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                          className="w-full bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none text-slate-800 dark:text-white"
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={`Enter ${field}...`}
                          value={formData[field] || ''}
                          onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                          className="w-full bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800 dark:text-white"
                        />
                      )}
                    </div>
                  );
                })}

                <button
                  onClick={handleGenerateDraft}
                  className="w-full py-4.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black text-sm hover:opacity-90 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-6"
                >
                  <FileText size={18} />
                  <span>Generate Court-Ready Draft</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step: GENERATING */}
        {currentStep === 'GENERATING' && (
          <div className="flex flex-col items-center justify-center py-32 gap-6 max-w-md mx-auto text-center">
            <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{generationStatus}</h3>
              <p className="text-xs text-subtext font-semibold">Applying professional legal language and court formatting guidelines.</p>
            </div>
          </div>
        )}

        {/* Step: PREVIEW */}
        {currentStep === 'PREVIEW' && (
          <div className="max-w-4xl mx-auto flex flex-col h-full min-h-0 bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Document Preview</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Formatted for Court Submission</p>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-wider transition-all ${isEditing ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-zinc-700'}`}
              >
                <Edit3 size={14} />
                <span>{isEditing ? 'Preview' : 'Edit'}</span>
              </button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              {isEditing ? (
                <textarea
                  value={finalDraft}
                  onChange={e => setFinalDraft(e.target.value)}
                  className="w-full h-full min-h-[400px] bg-transparent border-none text-slate-800 dark:text-slate-100 outline-none p-0 resize-none font-mono text-sm leading-relaxed focus:ring-0"
                />
              ) : (
                <div className="prose dark:prose-invert max-w-none font-serif leading-relaxed text-slate-800 dark:text-slate-200 text-lg whitespace-pre-wrap select-text">
                  {finalDraft}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-200 dark:border-zinc-800">
              <button 
                onClick={handlePrint}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Printer size={16} />
                <span>Print PDF</span>
              </button>
              <button 
                onClick={handleShare}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
              <button 
                onClick={handleDownload}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Download size={16} />
                <span>Download</span>
              </button>
              <button 
                onClick={handleSaveDraft}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Save size={16} />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}

        {/* Step: SAVED_DRAFTS */}
        {currentStep === 'SAVED_DRAFTS' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Saved Drafts Archive</h3>
            {loadingDrafts ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : savedDrafts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl text-center bg-white dark:bg-zinc-900/30">
                <Folder size={48} className="text-slate-300 dark:text-zinc-700 mb-4" />
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">No saved drafts</h4>
                <p className="text-xs text-subtext mt-1 max-w-[200px] font-semibold">Generate and save your court drafts to see them here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {savedDrafts.map(draft => (
                  <div key={draft.id} className="flex items-center justify-between p-5 bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{draft.title}</h4>
                        <p className="text-[10px] text-subtext font-bold uppercase tracking-widest mt-1">
                          {new Date(draft.date).toLocaleString()} • {draft.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setFinalDraft(draft.content);
                          setSelectedCategory(draft.title);
                          setCurrentStep('PREVIEW');
                        }}
                        className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-black uppercase text-indigo-600 dark:text-indigo-400"
                      >
                        Open
                      </button>
                      <button 
                        onClick={() => handleDeleteSavedDraft(draft.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Modal */}
      {savedDraftData && (
        <div className="fixed inset-0 z-[120000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSavedDraftData(null)} />
          <div className="relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-green-500/30">
              <Check size={28} strokeWidth={3} />
            </div>
            <h3 className="text-lg font-black text-slate-950 dark:text-white">Draft Saved Successfully</h3>
            <p className="text-xs text-subtext font-semibold mt-1">The document is available offline and backed up to cloud.</p>
            
            <div className="w-full mt-6 space-y-2 text-left bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Draft ID:</span>
                <span className="text-slate-800 dark:text-white font-bold">{savedDraftData.id}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold mt-2">
                <span className="text-slate-400">Saved At:</span>
                <span className="text-slate-800 dark:text-white font-bold">{savedDraftData.date} • {savedDraftData.time}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold mt-2">
                <span className="text-slate-400">Location:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{savedDraftData.location}</span>
              </div>
            </div>

            <button 
              onClick={() => setSavedDraftData(null)}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider mt-6 shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftMaker;
