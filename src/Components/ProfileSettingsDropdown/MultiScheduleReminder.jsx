import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Trash2, Edit2, Calendar, RefreshCcw, BellRing, ChevronDown, Check, X } from 'lucide-react';
import axios from 'axios';
import { API } from '../../types';
import { usePersonalization } from '../../context/PersonalizationContext';
import { getUserData } from '../../userStore/userData';
import toast from 'react-hot-toast';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MultiScheduleReminder = () => {
    const { personalizations, updatePersonalization } = usePersonalization();
    const user = getUserData();
    const isGlobalEnabled = personalizations?.personalization?.enableReminders !== false; // default true 
    
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        repeat: 'none',
        customDays: [],
        notificationType: 'in-app',
        voice: 'none'
    });

    useEffect(() => {
        fetchReminders();
        // Check for notifications periodically
        const interval = setInterval(() => {
            if (isGlobalEnabled) {
               checkPreviews();
            }
        }, 60000);
        return () => clearInterval(interval);
    }, [isGlobalEnabled]);

    const fetchReminders = async () => {
        if (!user?.token) return;
        try {
            setLoading(true);
            const res = await axios.get(`${API}/reminders`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.data.success) {
                setReminders(res.data.reminders);
            }
        } catch (error) {
            console.error('Failed to fetch reminders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGlobalToggle = (val) => {
        updatePersonalization('personalization', { enableReminders: val });
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            setReminders(prev => prev.map(r => r._id === id ? { ...r, isActive: !currentStatus } : r));
            await axios.put(`${API}/reminders/${id}`, { isActive: !currentStatus }, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            toast.success(currentStatus ? 'Reminder paused' : 'Reminder activated');
        } catch (error) {
            toast.error('Failed to update status');
            fetchReminders();
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this reminder?')) return;
        try {
            await axios.delete(`${API}/reminders/${id}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            setReminders(prev => prev.filter(r => r._id !== id));
            toast.success('Reminder deleted');
        } catch (error) {
            toast.error('Failed to delete reminder');
        }
    };

    const openModal = (reminder = null) => {
        if (reminder) {
            setEditingId(reminder._id);
            const d = new Date(reminder.datetime);
            setFormData({
                title: reminder.title,
                description: reminder.description || '',
                date: d.toISOString().split('T')[0],
                time: d.toTimeString().slice(0, 5),
                repeat: reminder.repeat || 'none',
                customDays: reminder.customDays || [],
                notificationType: reminder.notificationType || 'in-app',
                voice: reminder.voice || 'none'
            });
        } else {
            setEditingId(null);
            setFormData({
                title: '',
                description: '',
                date: '',
                time: '',
                repeat: 'none',
                customDays: [],
                notificationType: 'in-app',
                voice: 'none'
            });
        }
        setIsModalOpen(true);
    };

    const saveReminder = async () => {
        if (!formData.title || !formData.date || !formData.time) {
            toast.error('Title, Date, and Time are required');
            return;
        }

        try {
            const datetime = new Date(`${formData.date}T${formData.time}`);
            const payload = {
                title: formData.title,
                description: formData.description,
                datetime: datetime.toISOString(),
                repeat: formData.repeat,
                customDays: formData.repeat === 'custom' ? formData.customDays : [],
                notificationType: formData.notificationType,
                voice: formData.voice,
                isActive: true
            };

            if (editingId) {
                const res = await axios.put(`${API}/reminders/${editingId}`, payload, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                setReminders(prev => prev.map(r => r._id === editingId ? res.data.reminder : r));
                toast.success('Reminder updated');
            } else {
                const res = await axios.post(`${API}/reminders`, payload, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                setReminders(prev => [...prev, res.data.reminder]);
                toast.success('Reminder created');
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save reminder');
        }
    };

    const toggleCustomDay = (dayIndex) => {
        setFormData(prev => ({
            ...prev,
            customDays: prev.customDays.includes(dayIndex)
                ? prev.customDays.filter(d => d !== dayIndex)
                : [...prev.customDays, dayIndex].sort()
        }));
    };

    // Calculate next reminder
    const activeReminders = reminders.filter(r => r.isActive && r.status === 'pending');
    let nextReminder = null;
    if (activeReminders.length > 0 && isGlobalEnabled) {
        // Sort by datetime
        const sorted = [...activeReminders].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        const now = new Date();
        nextReminder = sorted.find(r => new Date(r.datetime) >= now) || sorted[0];
    }

    const checkPreviews = () => {
        fetchReminders();
    }

    return (
        <div className="py-6 border-b border-gray-100 dark:border-white/5 space-y-6">
            <div className="flex flex-col gap-1">
                <h3 className="text-[14px] font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Clock size={16} className="text-primary" /> Multi Schedule Reminder
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                    Manage all your repeating schedules and alarms here.
                </p>
            </div>

            {/* Header controls */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleGlobalToggle(!isGlobalEnabled)}
                        className={`w-11 h-6 rounded-full p-1 transition-all duration-300 shrink-0 ${isGlobalEnabled ? 'bg-primary' : 'bg-gray-200 dark:bg-zinc-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full transition-transform duration-300 shadow-sm bg-white ${isGlobalEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <div>
                        <p className="text-sm font-bold">{isGlobalEnabled ? 'Reminders Active' : 'Reminders Paused'}</p>
                        <p className="text-[10px] text-subtext">{isGlobalEnabled ? 'Your schedules will trigger as expected' : 'All schedules are temporarily disabled'}</p>
                    </div>
                </div>

                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                >
                    <Plus size={14} /> Add Reminder
                </button>
            </div>

            {/* Next Reminder Preview */}
            {nextReminder && isGlobalEnabled && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 p-3 bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary rounded-r-xl">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <BellRing size={14} />
                    </div>
                    <div>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Next up</p>
                        <p className="text-sm font-bold">{nextReminder.title}</p>
                        <p className="text-[10px] text-subtext">{new Date(nextReminder.datetime).toLocaleString()}</p>
                    </div>
                </motion.div>
            )}

            {/* Reminders List */}
            <div className={`space-y-3 transition-opacity duration-300 ${!isGlobalEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                {loading ? (
                    <div className="py-10 flex justify-center"><RefreshCcw className="animate-spin text-primary" /></div>
                ) : reminders.length === 0 ? (
                    <div className="py-10 text-center flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-50">
                            <Calendar size={24} />
                        </div>
                        <p className="text-sm font-bold text-gray-400">No reminders yet.</p>
                        <p className="text-xs text-subtext max-w-[200px] mx-auto">Click 'Add Reminder' to get started and manage your schedule.</p>
                    </div>
                ) : (
                    reminders.map(reminder => (
                        <div key={reminder._id} className="relative overflow-hidden group">
                            {/* Glassmorphism background */}
                            <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/5" />
                            
                            <div className="relative z-10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-sm truncate">{reminder.title}</h4>
                                        {reminder.status === 'completed' && <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[9px] font-black rounded-full uppercase tracking-wider">Finished</span>}
                                    </div>
                                    {reminder.description && <p className="text-xs text-subtext truncate mb-2">{reminder.description}</p>}
                                    
                                    <div className="flex items-center gap-4 text-[10px] text-gray-500">
                                        <span className="flex items-center gap-1 font-medium bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">
                                            <Calendar size={10} /> {new Date(reminder.datetime).toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1 font-medium bg-primary/10 text-primary px-2 py-1 rounded-md capitalize">
                                            <RefreshCcw size={10} /> {reminder.repeat}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                    <button
                                        onClick={() => handleToggleActive(reminder._id, reminder.isActive)}
                                        className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 shrink-0 ${reminder.isActive ? 'bg-green-500' : 'bg-gray-200 dark:bg-zinc-700'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full transition-transform duration-300 shadow-sm bg-white ${reminder.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                    
                                    <button onClick={() => openModal(reminder)} className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg border border-transparent">
                                        <Edit2 size={14} />
                                    </button>
                                    
                                    <button onClick={() => handleDelete(reminder._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                            className="relative w-full max-w-md bg-white dark:bg-[#1E2438] rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                                <h3 className="text-lg font-bold">{editingId ? 'Edit Reminder' : 'New Reminder'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-subtext hover:text-red-500 transition-colors"><X size={20} /></button>
                            </div>

                            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                                    <input type="text" value={formData.title} onChange={e => setFormData(prev => ({...prev, title: e.target.value}))} className="w-full mt-1 bg-gray-50 dark:bg-black/20 border border-border rounded-xl p-3 text-sm outline-none focus:border-primary transition-all" placeholder="E.g., Standup Meeting" />
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Description (Optional)</label>
                                    <textarea value={formData.description} onChange={e => setFormData(prev => ({...prev, description: e.target.value}))} className="w-full mt-1 bg-gray-50 dark:bg-black/20 border border-border rounded-xl p-3 text-sm outline-none focus:border-primary transition-all resize-none h-20" placeholder="Add some notes..." />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                                        <input type="date" value={formData.date} onChange={e => setFormData(prev => ({...prev, date: e.target.value}))} className="w-full mt-1 bg-gray-50 dark:bg-black/20 border border-border rounded-xl p-3 text-sm outline-none focus:border-primary transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Time</label>
                                        <input type="time" value={formData.time} onChange={e => setFormData(prev => ({...prev, time: e.target.value}))} className="w-full mt-1 bg-gray-50 dark:bg-black/20 border border-border rounded-xl p-3 text-sm outline-none focus:border-primary transition-all" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Repeat Options</label>
                                    <div className="relative mt-1">
                                        <select value={formData.repeat} onChange={e => setFormData(prev => ({...prev, repeat: e.target.value}))} className="w-full bg-gray-50 dark:bg-black/20 border border-border rounded-xl p-3 text-sm outline-none focus:border-primary transition-all appearance-none pr-10">
                                            <option value="none">None (One time)</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="custom">Custom (Select Days)</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {formData.repeat === 'custom' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Select Days</label>
                                        <div className="flex flex-wrap gap-2">
                                            {DAYS.map((day, idx) => (
                                                <button 
                                                    key={day} 
                                                    onClick={() => toggleCustomDay(idx)}
                                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${formData.customDays.includes(idx) ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-transparent border-gray-200 dark:border-white/10 text-gray-500 hover:border-primary/50'}`}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Notification Type</label>
                                    <div className="grid grid-cols-3 gap-2 mt-1">
                                        {['in-app', 'email', 'both'].map(type => (
                                            <button 
                                                key={type} 
                                                onClick={() => setFormData(prev => ({...prev, notificationType: type}))}
                                                className={`py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${formData.notificationType === type ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-border text-subtext hover:border-primary/40'}`}
                                            >
                                                {formData.notificationType === type && <Check size={12} />}
                                                <span className="capitalize">{type.replace('-', ' ')}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Reminder Voice (AISA)</label>
                                    <div className="relative mt-1">
                                        <select value={formData.voice} onChange={e => setFormData(prev => ({...prev, voice: e.target.value}))} className="w-full bg-gray-50 dark:bg-black/20 border border-border rounded-xl p-3 text-sm outline-none focus:border-primary transition-all appearance-none pr-10">
                                            <option value="none">None (Silent)</option>
                                            <option value="en-US-female">AISA Female (USA)</option>
                                            <option value="en-US-male">AISA Male (USA)</option>
                                            <option value="hi-IN-female">AISA Female (Hindi/India)</option>
                                            <option value="hi-IN-male">AISA Male (Hindi/India)</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                    <p className="text-[9px] text-subtext mt-1">Select a voice to hear your reminder aloud when it triggers.</p>
                                </div>
                            </div>

                            <div className="p-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex justify-end gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-200 dark:hover:bg-white/5 transition-colors">Cancel</button>
                                <button onClick={saveReminder} className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-primary shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity flex items-center gap-2">
                                    <Check size={14} /> Save Reminder
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MultiScheduleReminder;
