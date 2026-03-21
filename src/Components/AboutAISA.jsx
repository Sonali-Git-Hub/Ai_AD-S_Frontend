import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bot, X, Sparkles, MessageSquare, FileText, Image, Cloud, 
    Camera, Mic, Share2, Scan, FileDiff, FileType, Search, 
    Video, Code, Globe,Bell, Smartphone, Zap, Database, Wand2, Edit3 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const AboutAISA = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    if (!isOpen) return null;

    const categories = [
        {
            name: "Intelligence & Search",
            color: "blue",
            features: [
                { title: t('smartChat'), icon: <MessageSquare className="w-5 h-5" />, desc: "Context-aware, human-like reasoning and creative writing." },
                { title: t('deepSearch'), icon: <Search className="w-5 h-5" />, desc: "Multi-layered web analysis for complex technical queries." },
                { title: "Real-time Search", icon: <Globe className="w-5 h-5" />, desc: "Instant access to live news, trends, and real-time data." },
                { title: "Multimodal AI", icon: <Zap className="w-5 h-5" />, desc: "Switch seamlessly between text, voice, and visual inputs." }
            ]
        },
        {
            name: "Visual & Digital Creation",
            color: "purple",
            features: [
                { title: t('imageGen'), icon: <Image className="w-5 h-5" />, desc: "Studio-quality AI imagery generated from your descriptions." },
                { title: "AI Video Magic", icon: <Video className="w-5 h-5" />, desc: "Bring static images to life with cinematic AI video motion." },
                { title: "Magic Image Editor", icon: <Edit3 className="w-5 h-5" />, desc: "Modify specific parts of images using natural language." },
                { title: "Code Writer Pro", icon: <Code className="w-5 h-5" />, desc: "Generate complete project structures and expert-level code." }
            ]
        },
        {
            name: "File Analysis & Extraction",
            color: "emerald",
            features: [
                { title: t('docAnalysis'), icon: <FileText className="w-5 h-5" />, desc: "Summarize PDFs, extract data from DOCX, and identify themes." },
                { title: t('smartScan'), icon: <Scan className="w-5 h-5" />, desc: "Scan physical documents and convert them to digital assets." },
                { title: "File Conversion", icon: <FileType className="w-5 h-5" />, desc: "Convert PDF to Word, Images to Excel, and target formats." },
                { title: t('imageUnderstanding'), icon: <Wand2 className="w-5 h-5" />, desc: "Describe and interpret contents of images and screenshots." }
            ]
        },
        {
            name: "Productivity & Knowledge",
            color: "orange",
            features: [
                { title: "Reminders & Tasks", icon: <Bell className="w-5 h-5" />, desc: "Set persistent alarms and manage your daily routine via AI." },
                { title: "Vertex RAG", icon: <Database className="w-5 h-5" />, desc: "Integrate your company knowledge base for private insights." },
                { title: t('voiceAssistant'), icon: <Mic className="w-5 h-5" />, desc: "Full hands-free interaction with multi-voice AI playback." },
                { title: "Social Sharing", icon: <Smartphone className="w-5 h-5" />, desc: "Direct integration for sharing AI insights to WhatsApp." }
            ]
        }
    ];

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="relative bg-white/95 dark:bg-[#0F111A]/95 w-full max-w-6xl max-h-[92vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-primary/20 dark:border-white/10 backdrop-blur-3xl"
            >
                {/* Close Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-all z-50 group active:scale-95"
                >
                    <X className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                </button>

                {/* AISA Signature Header - Premium Mesh Gradient Theme */}
                <div className="relative h-64 bg-[#D1D9FF]/40 dark:bg-[#0B0F1A] flex flex-col items-center justify-center shrink-0 overflow-hidden border-b border-primary/10 dark:border-white/5 backdrop-blur-xl">
                    {/* Animated Background Accents for Dark Mode */}
                    <div className="absolute inset-0 overflow-hidden">
                        {/* Light Mode Accents */}
                        <div className="absolute top-[-50%] left-[-10%] w-[500px] h-[500px] bg-white/40 rounded-full blur-[100px] dark:hidden" />
                        <div className="absolute bottom-[-50%] right-[-10%] w-[400px] h-[400px] bg-white/30 rounded-full blur-[100px] dark:hidden" />
                         
                        {/* Dark Mode Mesh Accents */}
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                            className="hidden dark:block absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" 
                        />
                        <motion.div 
                            animate={{ scale: [1, 1.3, 1], x: [0, -60, 0], y: [0, 40, 0] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                            className="hidden dark:block absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" 
                        />
                        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.6)_100%)]" />
                    </div>

                    <div className="relative z-10 text-center px-6">
                        <motion.div 
                            initial={{ y: -5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-primary/10 backdrop-blur-sm border border-primary/20 dark:border-primary/20 mb-5 shadow-lg shadow-primary/5"
                        >
                            <Sparkles className="w-3 h-3 text-primary dark:text-primary-light" />
                            <span className="text-[8px] font-black tracking-[0.2em] uppercase text-primary dark:text-primary-light">Intelligence Reinvented</span>
                        </motion.div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 text-slate-900 dark:text-white leading-none">
                            AISA <span className="text-primary font-bold">™</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-black tracking-[0.4em] uppercase opacity-80">
                            Think, Create, and Command.
                        </p>
                    </div>
                </div>

                {/* Main Content Areas */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-16 custom-scrollbar bg-transparent">
                    
                    {/* Core Intelligence Section - More Structured with Custom Color */}
                    <div className="grid lg:grid-cols-3 gap-8 items-stretch">
                        <div className="lg:col-span-2 p-8 rounded-[2rem] bg-[#D1D9FF]/30 dark:bg-white/5 border border-primary/10 dark:border-white/5 flex flex-col justify-center backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <Bot className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                    {t('coreIntelligence')}
                                </h3>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm font-semibold opacity-90 max-w-2xl">
                                {t('coreIntelligenceDesc')}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-6">
                                {['Neural Processing', 'Contextual Memory', 'Ethics Verified'].map(tag => (
                                    <span key={tag} className="text-[8px] uppercase font-black tracking-widest px-3 py-1.5 bg-white/60 dark:bg-white/5 border border-primary/5 dark:border-white/10 rounded-lg text-primary/60">{tag}</span>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-indigo-50 dark:bg-[#121624] border border-primary/10 dark:border-white/5 flex flex-col justify-center">
                            <h3 className="text-sm font-black text-primary dark:text-white mb-3 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                Our Vision
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-bold italic">
                                "{t('whyAisaExistsDesc')}"
                            </p>
                        </div>
                    </div>

                    {/* Features Universe Container */}
                    <div className="space-y-16">
                        {categories.map((cat, cIdx) => (
                            <div key={cat.name} className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary whitespace-nowrap">{cat.name}</h4>
                                    <div className="h-[1px] flex-1 bg-primary/10 dark:bg-white/10" />
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {cat.features.map((feat, fIdx) => (
                                        <motion.div 
                                            key={feat.title}
                                            whileHover={{ y: -5 }}
                                            className="p-6 rounded-[1.5rem] bg-[#D1D9FF]/20 dark:bg-[#161B2E]/40 border border-primary/5 dark:border-white/5 shadow-sm hover:shadow-2xl hover:bg-[#D1D9FF]/50 dark:hover:bg-primary/20 transition-all cursor-default group backdrop-blur-sm"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white/60 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                <div className="text-primary group-hover:text-white transition-colors">
                                                    {React.cloneElement(feat.icon, { className: "w-4 h-4" })}
                                                </div>
                                            </div>
                                            <h5 className="text-slate-800 dark:text-white text-[15px] font-black mb-2 group-hover:text-primary dark:group-hover:text-primary transition-colors leading-tight uppercase tracking-tight">{feat.title}</h5>
                                            <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed font-bold opacity-70">
                                                {feat.desc}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Community Focus - Compact */}
                    <div className="bg-slate-50 dark:bg-[#121624] rounded-[2rem] p-10 border border-slate-200 dark:border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{t('builtForEveryone')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mb-8 leading-relaxed font-bold">
                                AISA bridges the gap between state-of-the-art AI and accessibility for all.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {[t('students'), t('professionals'), t('businesses'), t('creators')].map((target, i) => (
                                    <span key={i} className="px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-400 shadow-sm transition-all hover:border-primary/50 cursor-default">
                                        {target}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center rotate-6">
                                <Bot className="w-16 h-16 text-primary flex-shrink-0" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer CTA Section - Compact */}
                <div className="px-10 py-8 border-t border-slate-100 dark:border-white/10 bg-white/80 dark:bg-black/80 flex flex-col sm:flex-row justify-between items-center gap-6 shrink-0 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(idx => (
                                <div key={idx} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-900 dark:text-white shadow-sm">
                                    {String.fromCharCode(64 + idx)}
                                </div>
                            ))}
                        </div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
                            TRUSTED BY 50K+ USERS
                        </p>
                    </div>
                    
                    <div className="flex gap-4 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-black text-xs text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
                        >
                            {t('close')}
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                navigate('/dashboard/chat/new');
                            }}
                            className="flex-1 sm:flex-none px-10 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-[11px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-[0.15em]"
                        >
                            {t('exploreAisa')}
                        </button>
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export default AboutAISA;

