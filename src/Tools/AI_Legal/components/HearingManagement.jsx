import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, Calendar, Clock, MapPin, User, ChevronRight, 
  Plus, Search, AlertCircle, CheckCircle2, Briefcase, FileText, 
  Bell, Trash2, Edit3, Scale, Gavel, X, Download, Share2, 
  ExternalLink, Paperclip, Upload, Save, Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../../../services/apiService';

const HearingManagement = ({ currentCase, onBack, theme, allProjects = [], onUpdateCase }) => {
  const isDark = theme === 'dark';
  
  // Hearings State
  const [hearings, setHearings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHearing, setSelectedHearing] = useState(null);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formId, setFormId] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formBench, setFormBench] = useState('');
  const [formOpponentCounsel, setFormOpponentCounsel] = useState('');
  const [formNotes, setFormNotes] = useState('');
  
  // Linked Document Upload State
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    if (currentCase) {
      setHearings(currentCase.hearings || []);
    } else {
      setHearings([]);
    }
  }, [currentCase]);

  const handleSaveHearing = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate || !formTime) {
      toast.error("Please fill in Title, Date, and Time.");
      return;
    }
    if (!currentCase) {
      toast.error("An active case is required to save hearings.");
      return;
    }

    const tid = toast.loading("Syncing case hearings...");
    try {
      const hearingObj = {
        id: formId || Date.now().toString(),
        title: formTitle,
        date: formDate,
        time: formTime,
        location: formLocation,
        bench: formBench,
        opponentCounsel: formOpponentCounsel,
        notes: formNotes,
        documents: selectedHearing?.documents || []
      };

      let updatedHearings;
      if (formId) {
        updatedHearings = hearings.map(h => h.id === formId ? hearingObj : h);
      } else {
        updatedHearings = [...hearings, hearingObj];
      }

      const payload = {
        ...currentCase,
        hearings: updatedHearings
      };

      const response = await apiService.updateProject(currentCase._id, payload);
      if (onUpdateCase) onUpdateCase(response);
      setHearings(updatedHearings);
      
      toast.success(formId ? "Hearing updated! ✅" : "Hearing scheduled! 📅", { id: tid });
      
      // Reset Form
      setFormId(null);
      setFormTitle('');
      setFormDate('');
      setFormTime('');
      setFormLocation('');
      setFormBench('');
      setFormOpponentCounsel('');
      setFormNotes('');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save hearing.", { id: tid });
    }
  };

  const handleDeleteHearing = async (hearingId) => {
    if (!currentCase) return;
    if (window.confirm("Are you sure you want to delete this hearing schedule?")) {
      const tid = toast.loading("Removing hearing...");
      try {
        const updatedHearings = hearings.filter(h => h.id !== hearingId);
        const payload = {
          ...currentCase,
          hearings: updatedHearings
        };

        const response = await apiService.updateProject(currentCase._id, payload);
        if (onUpdateCase) onUpdateCase(response);
        setHearings(updatedHearings);
        
        toast.success("Hearing deleted.", { id: tid });
        if (selectedHearing?.id === hearingId) {
          setSelectedHearing(null);
        }
      } catch (err) {
        toast.error("Failed to delete hearing.", { id: tid });
      }
    }
  };

  const handleEditHearing = (hearing) => {
    setFormId(hearing.id);
    setFormTitle(hearing.title);
    setFormDate(hearing.date);
    setFormTime(hearing.time);
    setFormLocation(hearing.location || '');
    setFormBench(hearing.bench || '');
    setFormOpponentCounsel(hearing.opponentCounsel || '');
    setFormNotes(hearing.notes || '');
    setIsEditing(true);
  };

  // Generate .ics calendar invite
  const handleAddToCalendar = (hearing) => {
    try {
      const title = hearing.title.replace(/,/g, '\\,');
      const notes = (hearing.notes || '').replace(/\n/g, '\\n').replace(/,/g, '\\,');
      const location = (hearing.location || '').replace(/,/g, '\\,');
      
      const dateParts = hearing.date.split('-'); // YYYY-MM-DD
      const timeParts = hearing.time.split(':'); // HH:MM
      
      const startDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1]);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
      
      const formatICSDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const icsMsg = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${title}`,
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
      
      toast.success("iCalendar invite downloaded! Click to add to Google/Apple Calendar.");
    } catch (e) {
      toast.error("Failed to generate calendar file.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedHearing || !currentCase) return;

    setUploadingDoc(true);
    const sizeKB = Math.round(file.size / 1024);
    
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64String = reader.result.split(',')[1];
        
        const newDoc = {
          id: Date.now().toString(),
          name: file.name,
          size: `${sizeKB} KB`,
          type: file.type,
          date: new Date().toLocaleDateString(),
          uri: URL.createObjectURL(file)
        };

        const updatedHearingDocs = [...(selectedHearing.documents || []), newDoc];
        const updatedHearing = {
          ...selectedHearing,
          documents: updatedHearingDocs
        };

        const updatedHearings = hearings.map(h => h.id === selectedHearing.id ? updatedHearing : h);

        const payload = {
          ...currentCase,
          hearings: updatedHearings
        };

        const response = await apiService.updateProject(currentCase._id, payload);
        if (onUpdateCase) onUpdateCase(response);
        
        setHearings(updatedHearings);
        setSelectedHearing(updatedHearing);
        toast.success("Document attached to hearing!");
      } catch (err) {
        toast.error("Failed to save document.");
      } finally {
        setUploadingDoc(false);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file.");
      setUploadingDoc(false);
    };
    reader.readAsDataURL(file);
  };

  const filteredHearings = useMemo(() => {
    return hearings.filter(h => 
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (h.location || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [hearings, searchQuery]);

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
            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight">Hearing Management</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">COURT CALENDAR ACTIVE</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => {
            setFormId(null);
            setFormTitle('');
            setFormDate('');
            setFormTime('');
            setFormLocation('');
            setFormBench('');
            setFormOpponentCounsel('');
            setFormNotes('');
            setIsEditing(true);
          }} 
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all"
        >
          <Plus size={14} />
          <span>Schedule Hearing</span>
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        
        {/* Left Side: Schedulers Form / List */}
        <div className="flex-1 flex flex-col overflow-y-auto px-6 py-6 custom-scrollbar min-h-0 select-text border-r border-slate-200 dark:border-white/5">
          <div className="max-w-3xl w-full mx-auto space-y-6">
            
            {isEditing ? (
              <div className="bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-md space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                    {formId ? 'Edit Hearing Schedule' : 'Schedule Court Hearing'}
                  </h3>
                  <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full">
                    <X size={16} className="text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSaveHearing} className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Hearing Title *</label>
                    <input 
                      type="text"
                      placeholder="e.g. Adjourned Cross-Examination"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-800 dark:text-white"
                      required
                    />
                  </div>

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
                        type="time"
                        value={formTime}
                        onChange={e => setFormTime(e.target.value)}
                        className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-800 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Courtroom / Location</label>
                    <input 
                      type="text"
                      placeholder="e.g. Courtroom 3, Delhi High Court"
                      value={formLocation}
                      onChange={e => setFormLocation(e.target.value)}
                      className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Presiding Bench / Judge</label>
                      <input 
                        type="text"
                        placeholder="e.g. Hon'ble Justice Sen"
                        value={formBench}
                        onChange={e => setFormBench(e.target.value)}
                        className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Opposing Counsel</label>
                      <input 
                        type="text"
                        placeholder="e.g. Adv. R. Sharma"
                        value={formOpponentCounsel}
                        onChange={e => setFormOpponentCounsel(e.target.value)}
                        className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Notes & Objectives</label>
                    <textarea 
                      rows={3}
                      placeholder="Objectives, questions to raise, details to review..."
                      value={formNotes}
                      onChange={e => setFormNotes(e.target.value)}
                      className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium outline-none text-slate-800 dark:text-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all"
                  >
                    Save Hearing Schedule
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search */}
                <div className="flex items-center bg-white dark:bg-[#1A2540] border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 shadow-sm">
                  <Search size={18} className="text-slate-400 mr-2 shrink-0" />
                  <input 
                    type="text"
                    placeholder="Search hearings calendar..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-0"
                  />
                </div>

                {/* Hearings List */}
                <div className="space-y-3">
                  {filteredHearings.map(hearing => (
                    <div 
                      key={hearing.id}
                      onClick={() => setSelectedHearing(hearing)}
                      className={`p-5 bg-white dark:bg-[#1A2540] border rounded-3xl shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-start gap-4 ${selectedHearing?.id === hearing.id ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-white/5'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{hearing.title}</h4>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
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
                            <span className="truncate">{hearing.location || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => handleAddToCalendar(hearing)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500 hover:text-indigo-600"
                          title="Add to System Calendar"
                        >
                          <Bell size={14} />
                        </button>
                        <button 
                          onClick={() => handleEditHearing(hearing)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500 hover:text-indigo-600"
                          title="Edit Schedule"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteHearing(hearing.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-500"
                          title="Delete Schedule"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredHearings.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-zinc-850 rounded-3xl bg-white dark:bg-zinc-900/30">
                      <Calendar size={48} className="mx-auto text-slate-300 dark:text-zinc-700 mb-2" />
                      <p className="text-xs font-bold text-slate-400">No scheduled hearings found.</p>
                      <button 
                        onClick={() => setIsEditing(true)} 
                        className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mt-2 block mx-auto hover:underline"
                      >
                        Schedule First hearing
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed Hearing Panel */}
        <div className="w-full md:w-[350px] shrink-0 bg-white dark:bg-[#0c0c14] border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/5 flex flex-col min-h-0 overflow-hidden">
          {selectedHearing ? (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6 space-y-6">
              
              <div className="flex items-center justify-between shrink-0">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Hearing Parameters</h3>
                <button onClick={() => setSelectedHearing(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full">
                  <X size={16} className="text-slate-400" />
                </button>
              </div>

              {/* General details */}
              <div className="space-y-4 overflow-y-auto pr-1 custom-scrollbar flex-1 min-h-0 select-text">
                <div className="bg-slate-50 dark:bg-[#1A2540] border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 space-y-3">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{selectedHearing.title}</h4>
                  <div className="h-[1px] bg-slate-200/50 dark:bg-white/5" />
                  
                  <div className="space-y-2 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Judge / Bench:</span>
                      <span className="text-slate-800 dark:text-white font-bold">{selectedHearing.bench || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Opponent Counsel:</span>
                      <span className="text-slate-800 dark:text-white font-bold">{selectedHearing.opponentCounsel || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {selectedHearing.notes && (
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Objectives & Notes</span>
                    <p className="text-xs text-subtext leading-relaxed font-semibold">{selectedHearing.notes}</p>
                  </div>
                )}

                {/* Hearing Documents Section */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5 shrink-0">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Hearing Documents</span>
                    <label className="flex items-center gap-1 text-[9px] font-black text-indigo-600 hover:text-indigo-700 cursor-pointer">
                      <Upload size={12} />
                      <span>Upload</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileUpload}
                        disabled={uploadingDoc}
                      />
                    </label>
                  </div>

                  {uploadingDoc && (
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] text-indigo-500 font-semibold animate-pulse">Uploading file...</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {(selectedHearing.documents || []).map(doc => (
                      <div 
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-[#1A2540] border border-slate-200/50 dark:border-white/5 rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText size={16} className="text-indigo-500 shrink-0" />
                          <span className="text-slate-800 dark:text-white font-semibold truncate flex-1">{doc.name}</span>
                        </div>
                        <a 
                          href={doc.uri} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg text-indigo-500 shrink-0 ml-1.5"
                          title="Open Document"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    ))}
                    {(selectedHearing.documents || []).length === 0 && (
                      <p className="text-[10px] text-slate-400 font-bold text-center py-4 bg-slate-50 dark:bg-[#131C31] border border-slate-200/50 dark:border-white/5 rounded-xl">No documents linked to this hearing.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <Calendar size={36} className="text-slate-300 dark:text-zinc-700" />
              <p className="text-xs font-bold text-slate-400">Select a scheduled hearing to see courtroom details.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HearingManagement;
