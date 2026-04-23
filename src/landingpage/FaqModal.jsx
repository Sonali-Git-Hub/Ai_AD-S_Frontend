import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, ChevronRight, Search, ChevronDown, MessageSquare, Send, Zap } from 'lucide-react';
import { faqs } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { apis } from '../types';
import toast from 'react-hot-toast';
import { getUserData } from '../userStore/userData';

const FaqModal = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const user = getUserData();
    const [selectedFaqCategory, setSelectedFaqCategory] = useState(0);
    const [faqSearchQuery, setFaqSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('faq');
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [issueType, setIssueType] = useState('General Inquiry');
    const [isIssueDropdownOpen, setIsIssueDropdownOpen] = useState(false);
    const [issueText, setIssueText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendStatus, setSendStatus] = useState(null);

    const issueOptions = [
        "General Inquiry",
        "Payment Issue",
        "Refund Request",
        "Technical Support",
        "Account Access",
        "Other"
    ];

    const handleSupportSubmit = async () => {
        if (!issueText.trim()) return;
        setIsSending(true);
        setSendStatus(null);
        try {
            await axios.post(apis.support, {
                name: user?.name || "AISA User",
                email: user?.email || "guest@uwo24.com",
                issueType,
                message: issueText,
                userId: user?.id || null
            });
            setSendStatus('success');
            setIssueText('');
            toast.success('Message sent successfully!');
            setTimeout(() => setSendStatus(null), 3000);
        } catch (error) {
            console.error("Support submission failed", error);
            setSendStatus('error');
            toast.error('Failed to send message.');
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-[#0F111A] rounded-[2.5rem] w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-white/10"
            >
                {/* Modal Header */}
                <div className="px-10 py-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0E1220]">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                            <HelpCircle className="w-6 h-6 text-primary" />
                            {t('helpCenter') || 'Help Center'}
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-70">Knowledge Base & FAQ</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-slate-400 transition-all hover:rotate-90"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Side Navigation - Categories */}
                    <div className="w-72 border-r border-gray-100 dark:border-white/5 bg-[#FBFCFE] dark:bg-[#0E1220]/50 p-6 space-y-2 overflow-y-auto hidden md:block">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-4">Categories</div>
                        {faqs.map((cat, idx) => (
                            <button
                                key={cat.category}
                                onClick={() => {
                                    setSelectedFaqCategory(idx);
                                    setOpenFaqIndex(null);
                                    setActiveTab('faq');
                                }}
                                className={`w-full text-left px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between group ${
                                    selectedFaqCategory === idx && activeTab === 'faq'
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                    : 'text-slate-500 hover:bg-primary/5 dark:hover:bg-white/5'
                                }`}
                            >
                                {cat.category}
                                <ChevronRight className={`w-4 h-4 transition-transform ${selectedFaqCategory === idx && activeTab === 'faq' ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                            </button>
                        ))}
                        
                        <div className="pt-10">
                            <button
                                onClick={() => setActiveTab('help')}
                                className={`w-full text-left px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-3 ${
                                    activeTab === 'help' 
                                    ? 'text-primary' 
                                    : 'text-slate-400'
                                }`}
                            >
                                <MessageSquare className="w-4 h-4" />
                                Submit Ticket
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-[#0F111A]">
                        {/* Search Bar */}
                        <div className="p-8 border-b border-gray-50 dark:border-white/5">
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="Search for questions..."
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-5 pl-14 rounded-2xl outline-none focus:border-primary/50 text-sm font-semibold transition-all"
                                    onChange={(e) => setFaqSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                            {activeTab === 'faq' ? (
                                <div className="max-w-3xl mx-auto space-y-12">
                                    {/* Category Title for Mobile */}
                                    <div className="md:hidden mb-8">
                                        <select 
                                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                                            value={selectedFaqCategory}
                                            onChange={(e) => setSelectedFaqCategory(Number(e.target.value))}
                                        >
                                            {faqs.map((cat, i) => (
                                                <option key={i} value={i}>{cat.category}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-8">{faqs[selectedFaqCategory].category} Questions</h3>
                                        {faqs[selectedFaqCategory].questions
                                            .filter(q => !faqSearchQuery || q.question.toLowerCase().includes(faqSearchQuery.toLowerCase()))
                                            .map((faq, index) => (
                                            <div key={index} className="border-b border-gray-100 dark:border-white/5 last:border-0">
                                                <button
                                                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                                    className="w-full flex justify-between items-center py-6 text-left focus:outline-none group"
                                                >
                                                    <span className="font-bold text-slate-800 dark:text-white text-[15px] group-hover:text-primary transition-colors">{faq.question}</span>
                                                    <div className={`p-2 rounded-lg transition-all ${openFaqIndex === index ? 'bg-primary/10 text-primary rotate-180' : 'bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:text-primary'}`}>
                                                        <ChevronDown className="w-4 h-4" />
                                                    </div>
                                                </button>
                                                <motion.div
                                                    initial={false}
                                                    animate={{ height: openFaqIndex === index ? "auto" : 0, opacity: openFaqIndex === index ? 1 : 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pb-8 text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                                                        {faq.answer}
                                                    </div>
                                                </motion.div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-xl mx-auto py-10 space-y-8">
                                    <div className="text-center space-y-3 mb-10">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Submit a Request</h3>
                                        <p className="text-sm text-slate-500 font-semibold italic">Our team typically responds within 24 hours.</p>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Category</label>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setIsIssueDropdownOpen(!isIssueDropdownOpen)}
                                                    className="w-full p-5 pr-12 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 outline-none flex items-center justify-between text-slate-900 dark:text-white font-bold hover:border-primary/50 transition-all shadow-sm"
                                                >
                                                    <span className="truncate">{issueType}</span>
                                                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isIssueDropdownOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                <AnimatePresence>
                                                    {isIssueDropdownOpen && (
                                                        <>
                                                            <div 
                                                                className="fixed inset-0 z-[120]" 
                                                                onClick={() => setIsIssueDropdownOpen(false)} 
                                                            />
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                className="absolute top-full left-0 right-0 mt-3 z-[130] bg-white dark:bg-[#1A1F33] border border-slate-100 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden py-3"
                                                            >
                                                                {issueOptions.map((opt) => (
                                                                    <button
                                                                        key={opt}
                                                                        onClick={() => {
                                                                            setIssueType(opt);
                                                                            setIsIssueDropdownOpen(false);
                                                                        }}
                                                                        className={`w-full text-left px-6 py-4 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between ${
                                                                            issueType === opt 
                                                                            ? 'bg-primary text-white' 
                                                                            : 'text-slate-500 hover:bg-primary/5 dark:hover:bg-white/5'
                                                                        }`}
                                                                    >
                                                                        {opt}
                                                                        {issueType === opt && <Zap className="w-3 h-3 fill-current" />}
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Message</label>
                                            <textarea
                                                className="w-full p-5 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 outline-none focus:border-primary/50 resize-none text-slate-800 dark:text-white min-h-[180px] font-semibold"
                                                placeholder="How can we help you today?"
                                                value={issueText}
                                                onChange={(e) => setIssueText(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={handleSupportSubmit}
                                            disabled={isSending || !issueText.trim()}
                                            className={`w-full flex items-center justify-center gap-3 bg-primary text-white py-5 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 ${isSending || !issueText.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
                                        >
                                            {isSending ? (
                                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    Send Message
                                                </>
                                            )}
                                        </button>
                                        
                                        {sendStatus === 'success' && (
                                            <div className="p-4 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl text-center font-bold border border-green-500/10">
                                                Message sent successfully!
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="pt-10 border-t border-gray-50 dark:border-white/5 text-center">
                                        <p className="text-xs text-slate-400 font-bold">
                                            Direct Email: <a href="mailto:admin@uwo24.com" className="text-primary hover:underline">admin@uwo24.com</a>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="p-8 border-t border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0E1220] flex justify-between items-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        AISA Platform Documentation v2.0
                    </div>
                    <div className="flex gap-4">
                        {activeTab === 'help' && (
                            <button
                                onClick={() => setActiveTab('faq')}
                                className="px-8 py-3 bg-white dark:bg-white/5 text-slate-600 dark:text-white rounded-xl font-bold border border-slate-200 dark:border-white/10"
                            >
                                Back to FAQ
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-10 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
                        >
                            {t('close') || 'Close'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FaqModal;
