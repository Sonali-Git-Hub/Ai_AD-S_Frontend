import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Upload, Check, Image as ImageIcon, Video, Layers, 
    Palette, FileText, Calendar, Globe, Trash2, Zap, 
    Smartphone, Monitor, Layout, Crown, Sparkles, Send, Loader2, Maximize2, Minimize2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../services/apiService';

const AiAdDashboard = ({ isOpen, onClose, userPlan }) => {
    const [plan, setPlan] = useState('medium'); // Default to medium
    const [companyInfo, setCompanyInfo] = useState(null);
    const [contentCalendar, setContentCalendar] = useState(null);
    const [brandLogo, setBrandLogo] = useState(null);
    const [colorTheme, setColorTheme] = useState('');
    const [platforms, setPlatforms] = useState(['Instagram', 'Facebook']);
    const [isGenerating, setIsGenerating] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ company: 0, calendar: 0, logo: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);

    const fileInputRef = {
        company: useRef(null),
        calendar: useRef(null),
        logo: useRef(null)
    };

    if (!isOpen) return null;

    const plans = [
        { 
            id: 'low', 
            name: 'Basic / Low', 
            desc: '30 AI Images', 
            icon: ImageIcon,
            credits: '30 Assets',
            color: 'from-blue-500 to-indigo-600'
        },
        { 
            id: 'medium', 
            name: 'Growth / Medium', 
            desc: '15 Images + 15 Carousels', 
            icon: Layers,
            credits: '30 Assets',
            color: 'from-purple-500 to-pink-600',
            popular: true
        },
        { 
            id: 'high', 
            name: 'Elite / High', 
            desc: '10 Images + 10 Carousels + 10 Videos', 
            icon: Crown,
            credits: '30 Assets',
            color: 'from-amber-500 to-orange-600'
        }
    ];

    const platformsList = [
        { id: 'Instagram', icon: Globe },
        { id: 'Facebook', icon: Globe },
        { id: 'LinkedIn', icon: Globe },
        { id: 'Twitter', icon: Globe },
        { id: 'Thread', icon: Globe },
        { id: 'YouTube', icon: Video, size: '1:1' },
        { id: 'Pinterest', icon: Globe }
    ];

    const handleFileUpload = async (type, e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const loadingToast = toast.loading(`Uploading ${type}...`);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', 'AiAdAsset');
            formData.append('assetType', type); // 'logo', 'company', or 'calendar'

            const response = await apiService.uploadKnowledgeDocument(formData, (progress) => {
                setUploadProgress(prev => ({ ...prev, [type]: progress }));
            });

            if (response.success) {
                const gcsUri = response.data.gcsUri;
                if (type === 'company') setCompanyInfo(gcsUri);
                if (type === 'calendar') setContentCalendar(gcsUri);
                if (type === 'logo') setBrandLogo(gcsUri);
                
                toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded!`, { id: loadingToast });
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            toast.error(`Upload failed: ${err.message}`, { id: loadingToast });
        }
    };

    const togglePlatform = (id) => {
        setPlatforms(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        if (!companyInfo || !contentCalendar || !brandLogo) {
            toast.error('Please upload all required documents (Logo, Info, Calendar)');
            return;
        }

        setIsGenerating(true);
        const mainToast = toast.loading('Orchestrating AI Ad Agent... Designing your 30-day campaign.');

        try {
            const response = await apiService.configureAiAdAgent({
                plan,
                companyOverview: companyInfo,
                contentCalendar,
                brandLogo,
                colorTheme,
                platforms
            });

            if (response.success) {
                toast.success('Agent Initialized! Your social media campaign is being generated.', { id: mainToast });
                setTimeout(() => onClose(), 2000);
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            toast.error(`Failed to initialize: ${err.message}`, { id: mainToast });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xl overflow-y-auto transition-all duration-500 ${isFullscreen ? 'p-0' : 'p-4'}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className={`relative w-full transition-all duration-500 bg-zinc-950 border border-white/10 shadow-2xl my-auto ${
                    isFullscreen 
                    ? 'h-screen rounded-none max-w-none overflow-y-auto' 
                    : 'max-w-4xl rounded-[40px] max-h-[90vh] overflow-y-auto'
                }`}
            >
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
                <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="absolute top-8 right-8 flex items-center gap-3 z-[100]">
                    <button 
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-all"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
                    >
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                    <button 
                        onClick={onClose}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative p-8 sm:p-12">
                    {/* Title */}
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">
                                Magic Tools Pro
                            </span>
                            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                            AI Social Media <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                                Post Generator Agent
                            </span>
                        </h1>
                        <p className="mt-4 text-zinc-400 font-medium max-w-xl text-lg">
                            Automate your entire brand presence for 30 days. One-click campaign orchestration across all platforms.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Column: Configs */}
                        <div className="space-y-10">
                            {/* Pick a Plan */}
                            <section>
                                <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Zap size={14} className="text-primary" /> Select Generation Plan
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {plans.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setPlan(p.id)}
                                            className={`relative flex items-center gap-5 p-5 rounded-[24px] border-2 transition-all group overflow-hidden ${
                                                plan === p.id 
                                                ? 'bg-zinc-900 border-primary ring-4 ring-primary/10' 
                                                : 'bg-zinc-900/50 border-white/5 hover:border-white/20'
                                            }`}
                                        >
                                            {p.popular && (
                                                <div className="absolute top-0 right-10 px-3 py-1 bg-primary text-[9px] font-black text-white rounded-b-lg uppercase tracking-tighter">
                                                    Most Popular
                                                </div>
                                            )}
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center shrink-0 shadow-lg`}>
                                                <p.icon className="w-7 h-7 text-white" />
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="text-white font-bold text-lg leading-tight mb-1">{p.name}</p>
                                                <p className="text-zinc-500 font-medium text-xs">{p.desc}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-primary font-black text-xs uppercase">{p.credits}</span>
                                            </div>
                                            {plan === p.id && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white scale-125 shadow-lg shadow-primary/20">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Brand Assets */}
                            <section>
                                <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Crown size={14} className="text-amber-500" /> Brand Identity & Context
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div 
                                            onClick={() => fileInputRef.company.current.click()}
                                            className={`cursor-pointer p-5 rounded-[24px] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${companyInfo ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white/5 border-white/10 hover:border-primary/40 hover:bg-white/10'}`}
                                        >
                                            <input type="file" ref={fileInputRef.company} hidden onChange={(e) => handleFileUpload('company', e)} accept=".pdf" />
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${companyInfo ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                                {companyInfo ? <Check size={20} /> : <FileText size={20} />}
                                            </div>
                                            <p className="text-xs font-bold text-center text-white/80">{companyInfo ? 'Info Uploaded' : 'Company Overview (PDF)'}</p>
                                        </div>
                                        <div 
                                            onClick={() => fileInputRef.calendar.current.click()}
                                            className={`cursor-pointer p-5 rounded-[24px] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${contentCalendar ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white/5 border-white/10 hover:border-primary/40 hover:bg-white/10'}`}
                                        >
                                            <input type="file" ref={fileInputRef.calendar} hidden onChange={(e) => handleFileUpload('calendar', e)} accept=".pdf,.json,.xlsx" />
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${contentCalendar ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                                {contentCalendar ? <Check size={20} /> : <Calendar size={20} />}
                                            </div>
                                            <p className="text-xs font-bold text-center text-white/80">{contentCalendar ? 'Calendar Ready' : 'Content Calendar'}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div 
                                            onClick={() => fileInputRef.logo.current.click()}
                                            className={`cursor-pointer flex-1 p-5 rounded-[24px] border-2 border-dashed flex items-center gap-4 transition-all ${brandLogo ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white/5 border-white/10 hover:border-primary/40 hover:bg-white/10'}`}
                                        >
                                            <input type="file" ref={fileInputRef.logo} hidden onChange={(e) => handleFileUpload('logo', e)} accept="image/*" />
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${brandLogo ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                                {brandLogo ? <Check size={20} /> : <ImageIcon size={20} />}
                                            </div>
                                            <p className="text-xs font-bold text-white/80">{brandLogo ? 'Logo Uploaded' : 'Official Brand Logo'}</p>
                                        </div>
                                        
                                        <div className="flex-[0.8] bg-white/5 border-2 border-white/10 rounded-[24px] p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                                                <Palette size={18} className="text-orange-500" />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={colorTheme}
                                                onChange={(e) => setColorTheme(e.target.value)}
                                                placeholder="Theme (e.g. Minimalist Dark)" 
                                                className="bg-transparent border-none outline-none text-xs text-white placeholder:text-zinc-600 font-bold w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Platforms & Action */}
                        <div className="flex flex-col">
                            <section className="flex-1">
                                <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Globe size={14} className="text-sky-500" /> Targeted Platforms
                                </h3>
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    {platformsList.map((plt) => (
                                        <button
                                            key={plt.id}
                                            onClick={() => togglePlatform(plt.id)}
                                            className={`flex items-center gap-3 px-4 py-4 rounded-[20px] border transition-all ${
                                                platforms.includes(plt.id)
                                                ? 'bg-primary/10 border-primary/40 text-primary'
                                                : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/10 hover:text-white'
                                            }`}
                                        >
                                            <div className={`p-2 rounded-lg ${platforms.includes(plt.id) ? 'bg-primary text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                                <plt.icon size={14} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-black leading-none">{plt.id}</p>
                                                <p className="text-[9px] font-bold opacity-50 mt-1 uppercase tracking-tighter">
                                                    {plt.size || '4:5 Output'}
                                                </p>
                                            </div>
                                            {platforms.includes(plt.id) && <Check size={14} className="ml-auto" />}
                                        </button>
                                    ))}
                                </div>

                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-4">
                                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                                    <p className="text-[11px] text-amber-200/60 leading-relaxed font-medium">
                                        Note: All platforms will receive <b className="text-amber-500">4:5</b> vertical posts optimized for engagement, while <b className="text-amber-500">YouTube</b> posts will be rendered in <b className="text-amber-500">1:1</b> square format.
                                    </p>
                                </div>
                            </section>

                            <div className="mt-12 space-y-4">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="w-full h-20 rounded-[28px] bg-gradient-to-r from-primary via-purple-600 to-pink-600 p-[2px] transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary/30 disabled:opacity-50"
                                >
                                    <div className="w-full h-full bg-zinc-950/20 backdrop-blur-sm rounded-[26px] flex items-center justify-center gap-4">
                                        <Send className={`w-6 h-6 text-white ${isGenerating ? 'animate-ping' : ''}`} />
                                        <span className="text-xl font-black text-white uppercase tracking-widest">
                                            {isGenerating ? 'Orchestrating AI...' : 'Initialize AI Ad Agent'}
                                        </span>
                                    </div>
                                </button>
                                <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                    30 Days of content will be generated across {platforms.length} platforms.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AiAdDashboard;
