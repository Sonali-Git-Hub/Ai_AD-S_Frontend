import React, { useState, useEffect, useMemo, useRef, Fragment } from 'react';
import { 
  ChevronLeft, Calendar, Clock, MapPin, User, ChevronRight, 
  Plus, Search, AlertCircle, CheckCircle2, Briefcase, FileText, 
  Bell, Trash2, Edit3, Scale, Gavel, X, Download, Share2, 
  ExternalLink, Paperclip, Upload, Save, Play, ChevronDown, Check,
  Filter, History
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { legalService } from '../services/legalService';

const getCaseContext = (hearing) => {
  if (!hearing) return null;
  return {
    title: hearing.caseTitle || "Unnamed Case",
    type: (hearing.type || "General Hearing").toLowerCase(),
    court: hearing.court || "the designated court",
    status: (hearing.status || "Scheduled").toLowerCase(),
    date: hearing.date || "an upcoming date",
    advocate: hearing.advocate || "the presiding advocate",
    notes: hearing.notes || "",
    room: hearing.room || "TBD"
  };
};

const generateCaseSummary = (hearing) => {
  if (!hearing) return "No case summary available";
  
  const ctx = getCaseContext(hearing);
  if (!ctx) return "No case summary available";
  
  const overview = `This hearing concerns "${ctx.title}" and is currently ${ctx.status}. It will be presented before ${ctx.court}, Room ${ctx.room}.`;
  
  let keyFocus = "";
  const typeStr = ctx.type.toLowerCase();
  const titleStr = ctx.title.toLowerCase();
  
  if (typeStr.includes('property') || typeStr.includes('real estate') || titleStr.includes('property')) {
    keyFocus = "The primary focus will be on ownership verification, land registry reviews, and property documents assessment.";
  } else if (typeStr.includes('criminal') || titleStr.includes('state') || typeStr.includes('bail')) {
    keyFocus = "The primary focus involves reviewing witness testimonies, analyzing prosecution evidence, and bail considerations.";
  } else if (typeStr.includes('civil') || titleStr.includes('vs')) {
    keyFocus = "The primary focus will be on civil dispute resolution, examining contractual obligations, and damage assessment.";
  } else if (typeStr.includes('family') || typeStr.includes('divorce') || typeStr.includes('matrimonial')) {
    keyFocus = "The primary focus involves addressing family matters, evaluating custody arrangements, and settlement agreements.";
  } else if (typeStr.includes('corporate') || typeStr.includes('business')) {
    keyFocus = "The primary focus is on regulatory compliance, shareholder agreements, and corporate governance review.";
  } else {
    keyFocus = `The primary focus will be on addressing the core legal issues of this ${ctx.type} matter and examining submitted evidence.`;
  }

  if (ctx.notes) {
    keyFocus += ` Key notes indicate: ${ctx.notes}.`;
  }
  
  const nextStep = `Next step requires ${ctx.advocate} to prepare for proceedings scheduled on ${ctx.date}.`;
  
  return `Overview:\n${overview}\n\nKey Focus:\n${keyFocus}\n\nNext Step:\n${nextStep}`;
};

const HearingManagement = ({ onBack, isDark, theme }) => {
  const isDarkMode = isDark || theme === 'dark';

  // --- Core State ---
  const [hearings, setHearings] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Upcoming'); // 'Upcoming', 'Calendar', 'History'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced filters
  const [filters, setFilters] = useState({ priority: 'All', status: 'All' });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Selection for Detail Sidebar / Modal
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [selectedHearingDocs, setSelectedHearingDocs] = useState([]);
  const [selectedHearingReminder, setSelectedHearingReminder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Statistics selection filter
  const [selectedStat, setSelectedStat] = useState(null);

  // Calendar parameters
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Form states (Add/Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formId, setFormId] = useState(null);
  const [formCaseTitle, setFormCaseTitle] = useState('');
  const [formCourt, setFormCourt] = useState('');
  const [formType, setFormType] = useState('General Hearing');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('10:00 AM');
  const [formAdvocate, setFormAdvocate] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState('scheduled');
  
  // Upload attachment in schedule form
  const [formAttachment, setFormAttachment] = useState(null);

  // Documents modal / upload state in details panel
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Reminder Configuration Modal
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderOption, setReminderOption] = useState('1 Hour Before');
  const [isReminderCustom, setIsReminderCustom] = useState(false);
  const [reminderCustomNum, setReminderCustomNum] = useState('');
  const [reminderCustomUnit, setReminderCustomUnit] = useState('Minutes');

  // Load hearings & cases
  const loadHearingsData = async () => {
    try {
      setLoading(true);
      const allHearings = await legalService.getHearings();
      setHearings(allHearings || []);
      const localCases = await legalService.getCases();
      setCases(localCases || []);
    } catch (e) {
      console.error('[HearingManagement] Failed to fetch hearings', e);
      toast.error('Failed to load hearings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Hearings Dashboard Mounted");
    console.log("Hearings Data Loaded");
    loadHearingsData();
  }, []);

  // Sync detailed docs & reminders
  useEffect(() => {
    if (selectedHearing) {
      loadSelectedHearingDetails();
    } else {
      setSelectedHearingDocs([]);
      setSelectedHearingReminder(null);
    }
  }, [selectedHearing]);

  const loadSelectedHearingDetails = async () => {
    try {
      const docs = await legalService.getHearingDocuments(selectedHearing.id);
      setSelectedHearingDocs(docs || []);
      const rem = await legalService.getHearingReminder(selectedHearing.id);
      setSelectedHearingReminder(rem);
    } catch (err) {
      console.error(err);
    }
  };

  // Switch statistics filter
  const handleStatSelect = (statName) => {
    if (selectedStat === statName) {
      setSelectedStat(null);
    } else {
      setSelectedStat(statName);
    }
  };

  // Tab Stats computation
  const next7DaysCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next7 = new Date(today);
    next7.setDate(today.getDate() + 7);
    
    return hearings.filter(h => {
      if (h.status?.toLowerCase() === 'completed' || !h.date) return false;
      const hDate = new Date(h.date);
      return hDate >= today && hDate <= next7;
    }).length;
  }, [hearings]);

  const actionCount = useMemo(() => {
    return hearings.filter(h => ['scheduled', 'pending'].includes(h.status?.toLowerCase())).length;
  }, [hearings]);

  const completedCount = useMemo(() => {
    return hearings.filter(h => h.status?.toLowerCase() === 'completed').length;
  }, [hearings]);

  // Main Filtered Hearings list (Upcoming / History / Filters / Search)
  const filteredHearings = useMemo(() => {
    return hearings.filter(h => {
      // Search matches
      const matchesSearch = 
        h.caseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.advocate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.court?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // Stat strips filters
      if (selectedStat === 'Next7') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const next7 = new Date(today);
        next7.setDate(today.getDate() + 7);
        const hDate = new Date(h.date);
        if (h.status?.toLowerCase() === 'completed' || hDate < today || hDate > next7) return false;
      } else if (selectedStat === 'Action') {
        if (!['scheduled', 'pending'].includes(h.status?.toLowerCase())) return false;
      } else if (selectedStat === 'Completed') {
        if (h.status?.toLowerCase() !== 'completed') return false;
      }

      // Tab scoping
      if (activeTab === 'Upcoming') {
        if (h.status?.toLowerCase() === 'completed') return false;
      } else if (activeTab === 'History') {
        if (h.status?.toLowerCase() !== 'completed' && h.status?.toLowerCase() !== 'adjourned') return false;
      }

      // Advanced filters dropdown
      if (filters.priority !== 'All' && h.priority !== filters.priority) return false;
      if (filters.status !== 'All' && h.status?.toLowerCase() !== filters.status.toLowerCase()) return false;

      return true;
    });
  }, [hearings, searchQuery, activeTab, selectedStat, filters]);

  // Calendar dates
  const calendarHearings = useMemo(() => {
    return hearings.filter(h => h.date === selectedDate);
  }, [hearings, selectedDate]);

  // Monthly Calendar parameters
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();

    const arr = [];
    for (let i = 0; i < startDay; i++) arr.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      arr.push({ day: i, date: dateStr });
    }
    return arr;
  }, [currentMonth]);

  // Add/Edit Hearing Save Handler
  const handleSaveHearing = async (e) => {
    e.preventDefault();
    if (!formCaseTitle.trim() || !formDate || !formTime) {
      toast.error('Case Title, Date and Time are required.');
      return;
    }

    const loadId = toast.loading(formId ? 'Updating hearing schedule...' : 'Creating hearing schedule...');
    try {
      const hearingObj = {
        caseTitle: formCaseTitle,
        court: formCourt,
        type: formType,
        date: formDate,
        time: formTime,
        advocate: formAdvocate,
        room: formRoom,
        priority: formPriority,
        notes: formNotes,
        status: formStatus
      };

      if (formAttachment) {
        hearingObj.attachmentName = formAttachment.name;
        hearingObj.attachmentSize = formAttachment.size;
        hearingObj.attachmentType = formAttachment.type;
        hearingObj.attachmentUrl = formAttachment.url;
      }

      if (formId) {
        hearingObj.id = formId;
        await legalService.updateHearing(formId, hearingObj);
      } else {
        await legalService.addHearing(hearingObj);
      }

      toast.success(formId ? 'Hearing updated successfully! 📅' : 'Hearing scheduled successfully! 🗓️', { id: loadId });
      setIsFormOpen(false);
      resetHearingForm();
      loadHearingsData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save hearing schedule', { id: loadId });
    }
  };

  const handleEditHearing = (h) => {
    setFormId(h.id);
    setFormCaseTitle(h.caseTitle || '');
    setFormCourt(h.court || '');
    setFormType(h.type || 'General Hearing');
    setFormDate(h.date || '');
    setFormTime(h.time || '10:00 AM');
    setFormAdvocate(h.advocate || '');
    setFormRoom(h.room || '');
    setFormPriority(h.priority || 'Medium');
    setFormNotes(h.notes || '');
    setFormStatus(h.status || 'scheduled');
    if (h.attachmentUrl) {
      setFormAttachment({
        name: h.attachmentName,
        size: h.attachmentSize,
        type: h.attachmentType,
        url: h.attachmentUrl
      });
    } else {
      setFormAttachment(null);
    }
    setIsFormOpen(true);
  };

  const handleDeleteHearing = async (hearingId) => {
    if (window.confirm('Are you sure you want to delete this hearing schedule? All associated documents and notifications will be removed.')) {
      const loadId = toast.loading('Deleting hearing...');
      try {
        await legalService.deleteHearing(hearingId);
        toast.success('Hearing deleted.', { id: loadId });
        if (selectedHearing?.id === hearingId) {
          setSelectedHearing(null);
          setIsDetailModalOpen(false);
        }
        loadHearingsData();
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete hearing.', { id: loadId });
      }
    }
  };

  const resetHearingForm = () => {
    setFormId(null);
    setFormCaseTitle('');
    setFormCourt('');
    setFormType('General Hearing');
    setFormDate('');
    setFormTime('10:00 AM');
    setFormAdvocate('');
    setFormRoom('');
    setFormPriority('Medium');
    setFormNotes('');
    setFormStatus('scheduled');
    setFormAttachment(null);
  };

  // Form optional attachment handler
  const handleFormAttachmentChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error('File exceeds 20MB limit.');
      return;
    }

    setFormAttachment({
      name: file.name,
      size: `${Math.round(file.size / 1024)} KB`,
      type: file.type,
      url: URL.createObjectURL(file)
    });
  };

  // System Calendar ICS invite download
  const handleAddToCalendar = (hearing) => {
    try {
      const title = hearing.caseTitle.replace(/,/g, '\\,');
      const notes = (hearing.notes || '').replace(/\n/g, '\\n').replace(/,/g, '\\,');
      const location = (hearing.court || '').replace(/,/g, '\\,');
      
      const dateParts = hearing.date.split('-'); // YYYY-MM-DD
      
      // Parse 12-hour AM/PM format to 24-hour time
      const timeStr = hearing.time;
      let hours = 10;
      let minutes = 0;
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const period = match[3].toUpperCase();
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
      }
      
      const startDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], hours, minutes);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour
      
      const formatICSDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const icsMsg = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${title} - ${hearing.type}`,
        `DESCRIPTION:${notes}`,
        `LOCATION:${location}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsMsg], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hearing_${hearing.id}.ics`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('iCalendar invite downloaded! Click to add to your calendar.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate calendar file.');
    }
  };

  // Detailed Document uploads inside detailed view sidebar
  const handleDetailFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedHearing) return;

    setIsUploadingDoc(true);
    const sizeKB = Math.round(file.size / 1024);

    try {
      const newDoc = {
        hearingId: selectedHearing.id,
        name: file.name,
        size: `${sizeKB} KB`,
        type: file.type || 'Document',
        format: file.name.split('.').pop() || 'file',
        date: new Date().toLocaleDateString(),
        uri: URL.createObjectURL(file)
      };

      await legalService.saveHearingDocument(newDoc);
      toast.success('Document uploaded and attached successfully!');
      loadSelectedHearingDetails();
    } catch (err) {
      console.error(err);
      toast.error('Failed to attach document.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDetailDoc = async (docId) => {
    if (window.confirm('Delete this document?')) {
      try {
        await legalService.deleteHearingDocument(docId);
        toast.success('Document removed.');
        loadSelectedHearingDetails();
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete document.');
      }
    }
  };

  // Reminders configurations inside details panel
  const handleSaveReminder = async () => {
    if (!selectedHearing) return;

    try {
      let timeStr = reminderOption;
      if (reminderOption === 'Custom') {
        if (!reminderCustomNum.trim()) {
          toast.error('Please specify the custom amount');
          return;
        }
        timeStr = `${reminderCustomNum} ${reminderCustomUnit} Before`;
      }

      // Construct reminder payload
      const reminderObj = {
        hearingId: selectedHearing.id,
        title: selectedHearing.caseTitle,
        hearingDateTime: `${selectedHearing.date} ${selectedHearing.time}`,
        reminderOffset: timeStr,
        timeStr: timeStr,
        createdAt: new Date().toISOString()
      };

      await legalService.saveHearingReminder(reminderObj);
      
      // Save notification log
      await legalService.saveNotification({
        title: 'Hearing Reminder Scheduled',
        message: `Reminder set for ${selectedHearing.caseTitle} at ${timeStr.replace(' Before', ' before')}. Hearing is on ${selectedHearing.date} ${selectedHearing.time}.`,
        type: 'legal_reminder',
        hearingTitle: selectedHearing.caseTitle,
        reminderTime: timeStr,
        hearingDate: `${selectedHearing.date} ${selectedHearing.time}`
      });

      toast.success(`Reminder scheduled successfully: ${timeStr}`);
      setIsReminderModalOpen(false);
      loadSelectedHearingDetails();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save reminder notification.');
    }
  };

  const handleRemoveReminder = async () => {
    if (!selectedHearing || !selectedHearingReminder) return;

    try {
      await legalService.deleteHearingReminder(selectedHearing.id);
      toast.success('Reminder notification cleared.');
      setIsReminderModalOpen(false);
      loadSelectedHearingDetails();
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove reminder.');
    }
  };

  // Open detailed panels
  const openHearingDetails = (h) => {
    setSelectedHearing(h);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full min-h-0 bg-slate-50 dark:bg-transparent overflow-hidden">
      
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight">Hearing Management</h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">
                {hearings.filter(h => h.status?.toLowerCase() !== 'completed').length} UPCOMING SESSIONS
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => {
            resetHearingForm();
            setIsFormOpen(true);
          }} 
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all"
        >
          <Plus size={14} />
          <span>Schedule Hearing</span>
        </button>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative select-text">
        <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
          
          {/* Left panel: List / Tabs */}
          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar min-h-0 px-4 sm:px-6 py-6 pb-20 bg-slate-50/30 dark:bg-transparent">
            <div className="max-w-4xl w-full mx-auto space-y-6">
              

              {/* Tabs */}
              <div className="flex gap-2 border-b border-slate-200 dark:border-white/5 pb-0">
                {['Upcoming', 'Calendar', 'History'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setSelectedHearing(null);
                    }}
                    className={`px-4 py-2.5 font-black text-xs uppercase tracking-wider border-b-2 transition-all ${
                      activeTab === tab 
                        ? 'border-indigo-600 text-indigo-650 dark:text-indigo-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search & Filter - (Not displayed in Calendar view) */}
              {activeTab !== 'Calendar' && (
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center bg-white dark:bg-[#1A2540] rounded-2xl px-4 py-3 shadow-sm">
                    <Search size={16} className="text-slate-400 mr-2.5 shrink-0" />
                    <input 
                      type="text"
                      placeholder="Search hearings by case, court, counsel..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-none text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-0"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  
                  {/* Advanced Filters Button */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                      className={`h-11 px-4 rounded-2xl border flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all bg-white dark:bg-[#1A2540] ${
                        filters.priority !== 'All' || filters.status !== 'All' 
                          ? 'border-indigo-500 text-indigo-600' 
                          : 'border-slate-250 dark:border-white/5 text-slate-655 dark:text-slate-300'
                      }`}
                    >
                      <Filter size={14} />
                      <span>Filter</span>
                    </button>

                    {/* Filter Popup Menu */}
                    {isFilterMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-4 z-40 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
                          <span className="text-[10px] font-black uppercase text-slate-500">Filter parameters</span>
                          <button onClick={() => setIsFilterMenuOpen(false)}><X size={14} className="text-slate-400" /></button>
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-black uppercase tracking-wider text-slate-400">Priority</label>
                            <select 
                              value={filters.priority}
                              onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                              className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-white"
                            >
                              <option value="All">All Priorities</option>
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-black uppercase tracking-wider text-slate-400">Status</label>
                            <select 
                              value={filters.status}
                              onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                              className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-white"
                            >
                              <option value="All">All Statuses</option>
                              <option value="Scheduled">Scheduled</option>
                              <option value="Pending">Pending</option>
                              <option value="Completed">Completed</option>
                              <option value="Adjourned">Adjourned</option>
                            </select>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setFilters({ priority: 'All', status: 'All' });
                            setIsFilterMenuOpen(false);
                          }}
                          className="w-full py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider"
                        >
                          Reset Filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 1: Upcoming hearings */}
              {activeTab === 'Upcoming' && (
                <div className="space-y-3">
                  {filteredHearings.map(hearing => (
                    <div 
                      key={hearing.id}
                      onClick={() => openHearingDetails(hearing)}
                      className={`p-5 bg-white dark:bg-[#1A2540] rounded-3xl shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-start gap-4 ${
                        selectedHearing?.id === hearing.id 
                          ? 'ring-2 ring-indigo-500/50' 
                          : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        {/* Header details */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight">
                            {hearing.type}
                          </span>
                          <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-400">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              hearing.status === 'completed' 
                                ? 'bg-emerald-500' 
                                : (hearing.status === 'adjourned' ? 'bg-amber-500' : 'bg-indigo-550')
                            }`} />
                            <span className="capitalize">{hearing.status}</span>
                          </span>
                          <span className={`text-[8px] font-black px-1.5 py-0.2 border rounded-md uppercase shrink-0 ${
                            hearing.priority === 'High' 
                              ? 'border-rose-500/30 text-rose-500 bg-rose-500/5' 
                              : (hearing.priority === 'Medium' ? 'border-amber-500/30 text-amber-500 bg-amber-500/5' : 'border-slate-300 text-slate-400')
                          }`}>
                            {hearing.priority}
                          </span>
                        </div>

                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{hearing.caseTitle}</h4>
                        
                        {/* Meta Grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-indigo-500 shrink-0" />
                            <span className="truncate">{new Date(hearing.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-indigo-500 shrink-0" />
                            <span className="truncate">{hearing.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5 col-span-2">
                            <MapPin size={12} className="text-indigo-500 shrink-0" />
                            <span className="truncate">{hearing.court || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Operations */}
                      <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => handleAddToCalendar(hearing)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
                          title="Download Calendar Invite"
                        >
                          <Bell size={14} />
                        </button>
                        <button 
                          onClick={() => handleEditHearing(hearing)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
                          title="Edit Schedule"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteHearing(hearing.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-500 transition-colors"
                          title="Delete Schedule"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredHearings.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900/30">
                      <Calendar size={48} className="mx-auto text-slate-300 dark:text-zinc-700 mb-2" />
                      <p className="text-xs font-bold text-slate-400">No scheduled hearings found.</p>
                      <button 
                        onClick={() => {
                          resetHearingForm();
                          setIsFormOpen(true);
                        }} 
                        className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mt-2 block mx-auto hover:underline"
                      >
                        Schedule First hearing
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Calendar layout */}
              {activeTab === 'Calendar' && (
                <div className="max-w-2xl mx-auto bg-white dark:bg-[#1A2540] rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
                  
                  {/* Calendar Month Header */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">
                      {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg"
                      >
                        <ChevronLeft size={16} className="text-slate-600 dark:text-slate-450" />
                      </button>
                      <button 
                        onClick={() => {
                          setCurrentMonth(new Date());
                          setSelectedDate(new Date().toISOString().split('T')[0]);
                        }}
                        className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400"
                      >
                        Today
                      </button>
                      <button 
                        onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg"
                      >
                        <ChevronRight size={16} className="text-slate-600 dark:text-slate-450" />
                      </button>
                    </div>
                  </div>

                  {/* Weekday Labels */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {weekDays.map((d, index) => (
                      <span key={`${d}-${index}`} className="text-[10px] font-black text-slate-400 py-1">{d}</span>
                    ))}
                  </div>

                  {/* Monthly Days Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {monthDays.map((item, idx) => {
                      if (!item) return <div key={`null-${idx}`} className="aspect-square md:aspect-auto md:h-12" />;

                      const isSelected = item.date === selectedDate;
                      const hasHearings = hearings.some(h => h.date === item.date);
                      const isToday = item.date === new Date().toISOString().split('T')[0];

                      return (
                        <button
                          key={item.date}
                          onClick={() => setSelectedDate(item.date)}
                          className={`aspect-square md:aspect-auto md:h-12 flex flex-col items-center justify-center rounded-xl transition-all relative ${
                            isSelected 
                              ? 'bg-indigo-650 text-white font-black' 
                              : isToday 
                                ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-150' 
                                : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-slate-800 dark:text-slate-350'
                          }`}
                        >
                          <span className="text-xs">{item.day}</span>
                          {hasHearings && (
                            <span className={`w-1 h-1 rounded-full absolute bottom-1.5 ${isSelected ? 'bg-white' : 'bg-indigo-500'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Day agenda header */}
                  <div className="border-t border-slate-150 dark:border-white/5 pt-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                        Agenda for {new Date(selectedDate).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </h4>
                      <span className="bg-indigo-100 dark:bg-indigo-500/10 text-indigo-750 dark:text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                        {calendarHearings.length}
                      </span>
                    </div>

                    {/* Day agenda items */}
                    <div className="space-y-3">
                      {calendarHearings.map(hearing => (
                        <div 
                          key={hearing.id}
                          onClick={() => openHearingDetails(hearing)}
                          className={`p-4 bg-slate-50 dark:bg-zinc-800/20 rounded-2xl cursor-pointer hover:scale-[1.005] transition-all flex justify-between items-center gap-4 ${
                            selectedHearing?.id === hearing.id ? 'ring-2 ring-indigo-500' : ''
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight block mb-1">
                              {hearing.type}
                            </span>
                            <h5 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{hearing.caseTitle}</h5>
                            <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">
                              {hearing.time} • {hearing.court || 'Room TBD'}
                            </span>
                          </div>
                          
                          <ChevronRight size={16} className="text-slate-400" />
                        </div>
                      ))}

                      {calendarHearings.length === 0 && (
                        <div className="text-center py-10 opacity-60">
                          <Calendar size={32} className="mx-auto text-slate-300 dark:text-zinc-700 mb-2" />
                          <p className="text-xs font-bold text-slate-450">No hearings scheduled for this day.</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: History View */}
              {activeTab === 'History' && (
                <div className="space-y-4">
                  {filteredHearings.map(hearing => (
                    <div 
                      key={hearing.id}
                      onClick={() => openHearingDetails(hearing)}
                      className={`p-5 bg-white dark:bg-[#1A2540] rounded-3xl shadow-sm hover:shadow-md cursor-pointer transition-all ${
                        selectedHearing?.id === hearing.id 
                          ? 'ring-2 ring-indigo-500/50' 
                          : ''
                      }`}
                    >
                      {/* History header */}
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div>
                          <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight block mb-1">
                            {hearing.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{hearing.date}</span>
                        </div>
                        
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${
                          hearing.outcome === 'Won' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100' 
                            : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100'
                        }`}>
                          {hearing.outcome || 'Completed'}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3">{hearing.caseTitle}</h4>

                      {/* AI summary box */}
                      <div className="flex gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/30 mb-4 text-xs font-semibold">
                        <Scale size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                        <p className="text-slate-600 dark:text-slate-450 leading-relaxed text-[11px] line-clamp-2">
                          {hearing.summary || 'Case proceeded with preliminary arguments regarding jurisdiction.'}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3.5 mt-1 text-[10px] font-bold text-slate-450 uppercase tracking-wider" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-4">
                          <button onClick={() => openHearingDetails(hearing)} className="flex items-center gap-1 hover:text-indigo-600">
                            <FileText size={12} />
                            <span>Documents</span>
                          </button>
                          <button onClick={() => toast.success('Hearing schedule exported to PDF successfully!')} className="flex items-center gap-1 hover:text-indigo-600">
                            <Download size={12} />
                            <span>Export PDF</span>
                          </button>
                        </div>

                        <button 
                          onClick={() => openHearingDetails(hearing)}
                          className="flex items-center gap-1 text-indigo-650 dark:text-indigo-400 font-black"
                        >
                          <span>View Result</span>
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredHearings.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900/30">
                      <History size={48} className="mx-auto text-slate-300 dark:text-zinc-700 mb-2" />
                      <p className="text-xs font-bold text-slate-400">No completed hearing records found.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Detailed parameters Dialog Modal (Open on all screens) */}
      <Transition.Root show={isDetailModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100000]" onClose={setIsDetailModalOpen}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="fixed inset-0 overflow-y-auto flex items-end lg:items-center justify-center lg:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-10 lg:scale-95"
              enterTo="opacity-100 translate-y-0 lg:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 lg:scale-100"
              leaveTo="opacity-0 translate-y-10 lg:scale-95"
            >
              <Dialog.Panel className="w-full max-w-md max-h-[85vh] bg-white dark:bg-zinc-900 border-t lg:border border-slate-200 dark:border-zinc-800 rounded-t-[2.5rem] lg:rounded-[2.5rem] p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4 shrink-0">
                  <Dialog.Title className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">
                    Hearing Details
                  </Dialog.Title>
                  <button onClick={() => setIsDetailModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full">
                    <X size={18} className="text-slate-400" />
                  </button>
                </div>

                {selectedHearing && (
                  <div className="space-y-5 flex-1 min-h-0 overflow-y-auto select-text pr-1 custom-scrollbar">
                    <div className="bg-slate-50 dark:bg-[#1A2540] rounded-2xl p-4 space-y-3">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{selectedHearing.caseTitle}</h4>
                      <div className="h-[1px] bg-slate-250/50 dark:bg-white/5" />
                      
                      <div className="space-y-2 text-xs font-semibold text-slate-655 dark:text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Hearing Type:</span>
                          <span className="font-bold">{selectedHearing.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Court / Bench:</span>
                          <span className="font-bold truncate max-w-[200px]">{selectedHearing.court || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Lead Advocate:</span>
                          <span className="font-bold">{selectedHearing.advocate || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Courtroom Room:</span>
                          <span className="font-bold">{selectedHearing.room || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Status:</span>
                          <span className="capitalize font-bold text-indigo-650 dark:text-indigo-400">{selectedHearing.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Alarm config status */}
                    <div className="bg-indigo-50/30 dark:bg-indigo-950/10 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Bell size={14} className="text-indigo-500" />
                        <div>
                          <span className="font-extrabold text-slate-800 dark:text-white block">Reminders Status</span>
                          <span className="text-[10px] text-slate-400 font-semibold block">
                            {selectedHearingReminder 
                              ? `Scheduled ${selectedHearingReminder.reminderOffset}` 
                              : 'No alarm reminder scheduled'}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (selectedHearingReminder) {
                            setReminderOption(selectedHearingReminder.timeStr || '1 Hour Before');
                          } else {
                            setReminderOption('1 Hour Before');
                          }
                          setIsReminderModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-850 rounded-xl text-[10px] font-black uppercase text-indigo-650 dark:text-indigo-400 shadow-sm"
                      >
                        Configure
                      </button>
                    </div>

                    {/* AI summary */}
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800/10 rounded-2xl space-y-2">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-white">AI CASE SUMMARY</h5>
                      <p className="text-xs text-subtext font-semibold leading-relaxed whitespace-pre-line">
                        {selectedHearing.summary || generateCaseSummary(selectedHearing)}
                      </p>
                    </div>

                    {/* Documents attachment */}
                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Hearing Documents</span>
                        <label className="flex items-center gap-1 text-[9px] font-black text-indigo-650 hover:text-indigo-700 cursor-pointer">
                          <Upload size={12} />
                          <span>Upload</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={handleDetailFileUpload}
                            disabled={isUploadingDoc}
                          />
                        </label>
                      </div>

                      <div className="space-y-2">
                        {selectedHearingDocs.map(doc => (
                          <div 
                            key={doc.id}
                            className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-[#1A2540] rounded-xl text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <FileText size={16} className="text-indigo-500 shrink-0" />
                              <span className="text-slate-800 dark:text-white font-semibold truncate flex-1">{doc.name}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setActiveDoc(doc);
                                  setIsDocViewerOpen(true);
                                }}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg text-indigo-500"
                              >
                                <ExternalLink size={13} />
                              </button>
                              <button 
                                onClick={() => handleDeleteDetailDoc(doc.id)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-950/20 rounded-lg text-rose-500"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                        {selectedHearingDocs.length === 0 && (
                          <p className="text-[10px] text-slate-400 font-bold text-center py-4 bg-slate-50/50 dark:bg-[#131C31] rounded-xl">
                            No documents linked.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Operations footer */}
                {selectedHearing && (
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800 mt-4 shrink-0">
                    <button 
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        handleEditHearing(selectedHearing);
                      }}
                      className="flex items-center justify-center gap-1.5 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-850 dark:text-white rounded-xl text-xs font-black uppercase tracking-wider"
                    >
                      <Edit3 size={14} />
                      <span>Edit Schedule</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteHearing(selectedHearing.id)}
                      className="flex items-center justify-center gap-1.5 py-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-black uppercase tracking-wider"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* DIALOG/MODAL: Schedule / Edit Hearing Form */}
      <Transition.Root show={isFormOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[105000]" onClose={setIsFormOpen}>
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-900 p-6 sm:p-8 text-left align-middle shadow-2xl transition-all border border-slate-200 dark:border-zinc-800 relative">
                <button 
                  onClick={() => setIsFormOpen(false)} 
                  className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors z-10"
                >
                  <X size={18} className="text-slate-550 dark:text-slate-400" />
                </button>

                <Dialog.Title as="h3" className="text-md font-black uppercase tracking-widest text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 mb-5 mt-2">
                  {formId ? 'Edit Court Hearing' : 'Schedule Court Hearing'}
                </Dialog.Title>

                <form onSubmit={handleSaveHearing} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                  
                  {/* Case selection input with dropdown options */}
                  <div className="flex flex-col gap-1 relative">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Case Title *</label>
                    <input 
                      type="text"
                      list="case-options"
                      placeholder="Type case name or select matching..."
                      value={formCaseTitle}
                      onChange={e => setFormCaseTitle(e.target.value)}
                      className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none text-slate-800 dark:text-white w-full"
                      required
                    />
                    <datalist id="case-options">
                      {cases.map(c => (
                        <option key={c.id} value={c.title} />
                      ))}
                    </datalist>
                  </div>

                  {/* Date & Time grids */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Hearing Date *</label>
                      <input 
                        type="date"
                        value={formDate}
                        onChange={e => setFormDate(e.target.value)}
                        className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-800 dark:text-white"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Hearing Time *</label>
                      <input 
                        type="text"
                        placeholder="e.g. 10:00 AM"
                        value={formTime}
                        onChange={e => setFormTime(e.target.value)}
                        className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-800 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Court name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Courtroom Name / Location</label>
                    <input 
                      type="text"
                      placeholder="e.g. Courtroom 3, Delhi High Court"
                      value={formCourt}
                      onChange={e => setFormCourt(e.target.value)}
                      className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none text-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Advocate name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Lead Advocate</label>
                    <input 
                      type="text"
                      placeholder="Presiding advocate name..."
                      value={formAdvocate}
                      onChange={e => setFormAdvocate(e.target.value)}
                      className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none text-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Room & Priorities */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Room No.</label>
                      <input 
                        type="text"
                        placeholder="e.g. 104"
                        value={formRoom}
                        onChange={e => setFormRoom(e.target.value)}
                        className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Priority</label>
                      <div className="flex gap-1.5 mt-0.5">
                        {['Low', 'Medium', 'High'].map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setFormPriority(p)}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all ${
                              formPriority === p 
                                ? 'bg-indigo-600 text-white border-indigo-650' 
                                : 'bg-slate-50 dark:bg-black/20 text-slate-400 border-slate-200 dark:border-zinc-800'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Optional File Attachment */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Attach File (Optional)</span>
                    {formAttachment ? (
                      <div className="p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-850 rounded-xl flex items-center justify-between gap-3 text-xs font-bold">
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={16} className="text-indigo-500" />
                          <span className="truncate">{formAttachment.name}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setFormAttachment(null)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-full text-rose-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="border border-dashed border-slate-300 dark:border-zinc-750 hover:bg-slate-50 dark:hover:bg-zinc-850/30 rounded-xl py-3 text-center cursor-pointer flex items-center justify-center gap-1.5 text-xs text-slate-500 font-extrabold uppercase tracking-wide">
                        <Paperclip size={14} />
                        <span>Upload PDF or Image</span>
                        <input 
                          type="file" 
                          accept="application/pdf, image/*"
                          className="hidden" 
                          onChange={handleFormAttachmentChange}
                        />
                      </label>
                    )}
                  </div>

                  {/* Optional Notes */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Notes & Objectives</label>
                    <textarea 
                      rows={3}
                      placeholder="Write goals, specific questions, or notes..."
                      value={formNotes}
                      onChange={e => setFormNotes(e.target.value)}
                      className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium outline-none text-slate-800 dark:text-white resize-none"
                    />
                  </div>

                  {/* Status Selection (only visible in edit mode) */}
                  {formId && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Session Status</label>
                      <select 
                        value={formStatus}
                        onChange={e => setFormStatus(e.target.value)}
                        className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-850 dark:text-white"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="adjourned">Adjourned</option>
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/25 mt-4"
                  >
                    Save Hearing Parameters
                  </button>

                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* DIALOG/MODAL: Reminder configurations overlay */}
      <Transition.Root show={isReminderModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[110000]" onClose={setIsReminderModalOpen}>
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
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-900 p-6 text-left align-middle shadow-2xl transition-all border border-slate-200 dark:border-zinc-800 relative">
                <button onClick={() => setIsReminderModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full z-10">
                  <X size={16} className="text-slate-400" />
                </button>

                <Dialog.Title as="h3" className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4">
                  Set Notification Reminder
                </Dialog.Title>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                  <div className="flex flex-wrap gap-2">
                    {[
                      '10 Minutes Before', '15 Minutes Before', '30 Minutes Before', 
                      '1 Hour Before', '2 Hours Before', '1 Day Before', 'Custom'
                    ].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setReminderOption(opt);
                          setIsReminderCustom(opt === 'Custom');
                        }}
                        className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                          reminderOption === opt 
                            ? 'bg-indigo-650 border-indigo-650 text-white font-extrabold' 
                            : 'bg-slate-50 dark:bg-black/20 text-slate-500 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-850'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {isReminderCustom && (
                    <div className="p-3.5 bg-slate-50 dark:bg-black/25 rounded-2xl mt-3 space-y-2">
                      <span className="text-[9px] font-black uppercase text-slate-450 block">Custom Alarm Duration</span>
                      <div className="flex gap-2">
                        <input 
                          type="number"
                          placeholder="e.g. 5"
                          value={reminderCustomNum}
                          onChange={e => setReminderCustomNum(e.target.value)}
                          className="bg-white dark:bg-zinc-850 border border-slate-250 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-850 dark:text-white w-20 outline-none"
                        />
                        <div className="flex gap-1">
                          {['Minutes', 'Hours', 'Days'].map(unit => (
                            <button
                              key={unit}
                              type="button"
                              onClick={() => setReminderCustomUnit(unit)}
                              className={`px-2.5 py-1.5 text-[10px] font-extrabold uppercase rounded-lg border transition-all ${
                                reminderCustomUnit === unit 
                                  ? 'bg-indigo-600 text-white border-indigo-650' 
                                  : 'bg-white dark:bg-zinc-800 text-slate-450 border-slate-200 dark:border-zinc-800'
                              }`}
                            >
                              {unit}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleSaveReminder}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all mt-4"
                  >
                    Save Reminder
                  </button>

                  {selectedHearingReminder && (
                    <button 
                      onClick={handleRemoveReminder}
                      className="w-full py-3.5 bg-transparent hover:bg-rose-500/5 text-rose-500 border border-rose-500 rounded-2xl font-black text-xs uppercase tracking-wider transition-all mt-2"
                    >
                      Remove Alarm
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* DIALOG/MODAL: Document Previewer */}
      <Transition.Root show={isDocViewerOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[120000]" onClose={setIsDocViewerOpen}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-900 p-6 text-left align-middle shadow-2xl transition-all border border-slate-200 dark:border-zinc-800 relative flex flex-col max-h-[85vh]">
                <button 
                  onClick={() => {
                    setIsDocViewerOpen(false);
                    setActiveDoc(null);
                  }} 
                  className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full z-10"
                >
                  <X size={18} className="text-slate-400" />
                </button>

                <Dialog.Title as="h3" className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4 pr-6 truncate">
                  {activeDoc?.name || 'Document'}
                </Dialog.Title>

                {activeDoc && (
                  <div className="flex-1 flex flex-col min-h-0 items-center justify-center bg-slate-50 dark:bg-black/30 border border-slate-200/50 dark:border-zinc-800/40 rounded-2xl overflow-hidden p-4 relative min-h-[350px]">
                    {activeDoc.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(activeDoc.format.toLowerCase()) ? (
                      <img src={activeDoc.uri} alt={activeDoc.name} className="max-w-full max-h-[50vh] object-contain rounded-lg" />
                    ) : activeDoc.format.toLowerCase() === 'pdf' ? (
                      <iframe src={activeDoc.uri} title={activeDoc.name} className="w-full h-[50vh] border-none rounded-lg" />
                    ) : (
                      <div className="text-center p-8">
                        <FileText size={64} className="text-slate-350 dark:text-zinc-700 mx-auto mb-3" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{activeDoc.format} File</span>
                        <p className="text-[11px] text-slate-400 mt-2 max-w-xs">Inline previews aren't supported for this format. Download the document to view contents.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Doc preview actions */}
                {activeDoc && (
                  <div className="flex justify-center gap-4 pt-4 border-t border-slate-100 dark:border-zinc-850 mt-4 shrink-0">
                    <a
                      href={activeDoc.uri}
                      download={activeDoc.name}
                      className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider"
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </a>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

    </div>
  );
};

export default HearingManagement;
