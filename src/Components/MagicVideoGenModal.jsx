import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion';
import { X, Upload, Wand2, Download, Video as VideoIcon, Loader2, History, ArrowLeft, RotateCw, ChevronDown, Check, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import CustomVideoPlayer from './CustomVideoPlayer';

const baseURL = window._env_?.VITE_AISA_BACKEND_API || import.meta.env.VITE_AISA_BACKEND_API || "http://localhost:8080/api";

// High-end Floating Particles (Bokeh & Stardust)
const PremiumEnvironment = () => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        // Deep magical colors + pure black for stardust feeling under light frost
        const palettes = ['bg-slate-900', 'bg-indigo-900', 'bg-violet-950', 'bg-[#0f172a]', 'bg-blue-900'];
        const particleCount = window.innerWidth < 768 ? 20 : 35;
        
        const generated = Array.from({ length: particleCount }).map((_, i) => ({
            id: i,
            size: Math.random() > 0.8 ? Math.random() * 6 + 3 : Math.random() * 2 + 1,
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: Math.random() * 15 + 10,
            delay: Math.random() * 5,
            xMove: (Math.random() - 0.5) * 50,
            yMove: -Math.random() * 120 - 40,
            colorClass: palettes[Math.floor(Math.random() * palettes.length)],
            blur: Math.random() > 0.8 ? 'blur-[2px] md:blur-[3px]' : 'blur-[0px] md:blur-[1px]'
        }));
        setParticles(generated);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden rounded-[27px] pointer-events-none z-[1] opacity-70">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className={`absolute ${p.colorClass} rounded-full ${p.blur} shadow-md sm:shadow-lg`}
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                    }}
                    animate={{
                        y: [0, p.yMove],
                        x: [0, p.xMove],
                        opacity: [0, Math.random() * 0.8 + 0.2, 0],
                        scale: [0, 1.2, 0],
                        rotate: [0, 180]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay,
                    }}
                />
            ))}
        </div>
    );
};

// Deep cinematic shadows rotating
const CinematicShadows = () => (
    <div className="absolute inset-0 overflow-hidden rounded-[27px] pointer-events-none opacity-[0.25] mix-blend-multiply z-0">
        <motion.div animate={{ x: ["0%", "50%", "0%"], y: ["0%", "20%", "0%"], scale: [1, 1.2, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[10%] -left-[10%] w-[80%] h-[80%] bg-indigo-800 rounded-full filter blur-[40px] md:blur-[70px]" />
        <motion.div animate={{ x: ["0%", "-40%", "0%"], y: ["0%", "30%", "0%"], scale: [1, 1.3, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-[30%] -right-[20%] w-[90%] h-[90%] bg-blue-900 rounded-full filter blur-[40px] md:blur-[60px]" />
        <motion.div animate={{ x: ["0%", "30%", "0%"], y: ["0%", "-40%", "0%"], scale: [1, 1.1, 1] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }} className="absolute -bottom-[20%] left-[20%] w-[80%] h-[60%] bg-violet-900 rounded-full filter blur-[40px] md:blur-[70px]" />
    </div>
);

const CustomSelect = ({ value, onChange, options, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div ref={selectRef} className="relative w-full">
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-black/5 dark:bg-white/5 border ${isOpen ? 'border-primary ring-1 ring-primary/50' : 'border-border'} rounded-xl px-4 py-2.5 text-sm text-maintext outline-none transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}`}
                disabled={disabled}
            >
                <span className="truncate">{selectedOption?.label || value}</span>
                <ChevronDown className={`w-4 h-4 text-subtext transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-50 w-full mt-2 py-2 bg-white dark:bg-[#2a2a2a] border border-black/10 dark:border-white/10 rounded-xl shadow-2xl overflow-y-auto custom-scrollbar max-h-[135px] backdrop-blur-xl"
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    if (!option.disabled) {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }
                                }}
                                disabled={option.disabled}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${option.disabled ? 'opacity-50 cursor-not-allowed text-subtext' : 'text-maintext hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer'} ${value === option.value ? 'bg-primary/10 text-primary font-medium' : ''}`}
                            >
                                <span className="truncate block pr-4">{option.label}</span>
                                {value === option.value && <Check className="w-4 h-4 shrink-0" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MagicVideoGenModal = ({ isOpen, onClose, onCreditDeduction }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultVideoUrl, setResultVideoUrl] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [resolution, setResolution] = useState("1080p");
    const [aspectRatio, setAspectRatio] = useState("16:9");
    const [modelId, setModelId] = useState("veo-3.1-fast-generate-001");
    const [historyVideos, setHistoryVideos] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const token = JSON.parse(localStorage.getItem('user') || '{}')?.token;
            const res = await axios.get(`${baseURL}/video/history?type=imageToVideo`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                setHistoryVideos(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
            toast.error("Failed to load history.");
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (showHistory) {
            fetchHistory();
        }
    }, [showHistory]);

    useEffect(() => {
        if (modelId.includes('fast') && resolution === '4k') {
            setResolution('1080p');
            toast('4K resolution requires Veo 3.1 Pro', { icon: 'ℹ️', style: { borderRadius: '10px', background: '#333', color: '#fff' }});
        }
    }, [modelId, resolution]);

    const getCreditCost = (modId = modelId, res = resolution) => {
        let multiplier = 525;
        if (modId === 'veo-3.1-fast-generate-001') {
            multiplier = res === '4k' ? 525 : 225;
        } else {
            multiplier = res === '4k' ? 900 : 600;
        }
        return multiplier * 5; 
    };
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    const processFile = (file) => {
        if (!file) return;

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            toast.error("Please select a valid image (JPG, PNG)");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }

        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResultVideoUrl(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleGenerate = async () => {
        if (!selectedImage) {
            toast.error("Please select an image first");
            return;
        }
        if (!prompt.trim()) {
            toast.error("Please describe what to animate");
            return;
        }

        setIsGenerating(true);
        setResultVideoUrl(null);

        const formData = new FormData();
        formData.append("image", selectedImage);
        formData.append("prompt", prompt);
        formData.append("resolution", resolution);
        formData.append("aspectRatio", aspectRatio);
        formData.append("modelId", modelId);
        formData.append("isImageToVideo", "true");

        const token = JSON.parse(localStorage.getItem('user') || '{}')?.token;

        try {
            const response = await axios.post(`${baseURL}/video/generate`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setResultVideoUrl(response.data.videoUrl);
                if (onCreditDeduction) onCreditDeduction(getCreditCost());
                toast.success("Video generated successfully!");
            }
        } catch (error) {
            console.error("Video Generation Error:", error);
            if (error.response?.data?.error === "Insufficient credits") {
                toast.error(`Insufficient credits (Need ${getCreditCost()} credits)`);
            } else {
                toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to generate video");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        if (!resultVideoUrl) return;
        try {
            const token = JSON.parse(localStorage.getItem('user') || '{}')?.token;
            const response = await axios.post(`${baseURL}/video/download`, { videoUrl: resultVideoUrl }, {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: 'video/mp4' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `aisa-animated-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error("Failed to download video");
        }
    };

    const handleReset = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setPrompt("");
        setResultVideoUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Spotlight Effect logic
    let mouseX = useMotionValue(0);
    let mouseY = useMotionValue(0);
    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const spotlightBackground = useMotionTemplate`
        radial-gradient(
            350px circle at ${mouseX}px ${mouseY}px,
            rgba(0,0,0,0.12),
            transparent 80%
        )
    `;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div 
                className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/60 sm:bg-black/70 backdrop-blur-[8px] sm:backdrop-blur-[16px]"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                {/* Main animated container */}
                <motion.div
                    onMouseMove={handleMouseMove}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ 
                        opacity: 1, 
                        scale: [1, 1.01, 1], 
                        y: 0,
                    }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ 
                        scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                        default: { type: "spring", stiffness: 350, damping: 28, mass: 1 }
                    }}
                    className="relative w-full max-w-2xl rounded-[28px] overflow-visible shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] sm:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] group ring-1 ring-white/30 sm:ring-white/50"
                >
                    {/* Pulsing Backlight */}
                    <div className="absolute inset-0 rounded-[28px] overflow-hidden pointer-events-none">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-[60%] z-0 bg-[conic-gradient(from_0deg,transparent_0%,rgba(255,255,255,0.7)_15%,transparent_30%,rgba(0,0,0,0.1)_50%,rgba(255,255,255,0.6)_85%,transparent_100%)] sm:bg-[conic-gradient(from_0deg,transparent_0%,rgba(255,255,255,1)_15%,transparent_30%,rgba(0,0,0,0.2)_50%,rgba(255,255,255,0.8)_85%,transparent_100%)] opacity-20 blur-[8px]"
                        />
                    </div>

                    {/* Main Content Glass Layer */}
                    <div className="relative z-10 w-full h-full rounded-[27px] flex flex-col overflow-hidden bg-white/80 sm:bg-white/75 backdrop-blur-[20px] sm:backdrop-blur-[50px] shadow-[inset_0_1px_3px_rgba(255,255,255,0.9)] sm:shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] border border-white/50 sm:border-white/60 max-h-[90vh]">
                        
                        {/* Dynamic Interactive Spotlight overlay */}
                        <motion.div
                            className="pointer-events-none hidden md:block absolute -inset-px z-[2000] rounded-[27px] opacity-0 transition duration-500 group-hover:opacity-100 mix-blend-soft-light"
                            style={{ background: spotlightBackground }}
                        />

                        {/* Background Animations */}
                        <CinematicShadows />
                        <PremiumEnvironment />

                        {/* Soft Noise Texture */}
                        <div className="absolute inset-0 z-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

                        <div className="relative z-10 w-full h-full flex flex-col flex-1 overflow-hidden">
                    {/* ── Header ── */}
                    <div className="relative z-20 px-5 sm:px-6 pt-6 pb-4 border-b border-black/[0.04] bg-white/40">
                        <div className="absolute top-0 right-8 w-[150px] h-full bg-gradient-to-l from-white/30 to-transparent pointer-events-none blur-xl" />

                        <div className="flex items-center justify-between relative">
                            <div className="flex items-center gap-3.5">
                                <div className="relative">
                                    <motion.div 
                                        animate={{ rotate: 360 }} 
                                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset--1.5 bg-primary/20 sm:bg-primary/30 rounded-full blur-md opacity-70"
                                    />
                                    <motion.div 
                                        whileHover={{ rotate: 180, scale: 1.08 }}
                                        className="w-[34px] sm:w-[38px] h-[34px] sm:h-[38px] relative z-10 rounded-[10px] sm:rounded-xl bg-gradient-to-br from-primary via-[#4F46E5] to-[#3B82F6] flex items-center justify-center shadow-[0_6px_15px_rgba(var(--primary-rgb),0.3)] border border-white/30"
                                    >
                                        <Wand2 className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px] text-white" />
                                    </motion.div>
                                </div>
                                <div>
                                    <h3 className="text-[15px] sm:text-[16px] font-black text-slate-900 tracking-tight leading-none mb-1 shadow-sm">
                                        {showHistory ? 'Your Video History' : 'Image to Video Magic'}
                                    </h3>
                                    <p className="text-[8.5px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] flex items-center gap-1 opacity-90">
                                        <Sparkles className="w-2.5 h-2.5 text-primary animate-pulse" />
                                        {showHistory ? 'Previously generated videos' : `Google Vertex AI Veo ⚡ ${getCreditCost()} Credits`}
                                    </p>
                                </div>
                            </div>
                        <div className="flex items-center gap-2">
                            {!showHistory ? (
                                <button
                                    onClick={() => setShowHistory(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-subtext hover:text-maintext hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <History className="w-4 h-4" /> History
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-subtext hover:text-maintext hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Generator
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-subtext hover:bg-black/5 dark:hover:bg-white/5 hover:text-maintext transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {showHistory ? (
                        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                            {isLoadingHistory ? (
                                <div className="flex justify-center items-center h-40">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : historyVideos.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {historyVideos.map(video => (
                                        <div key={video._id} className="bg-black/5 dark:bg-white/5 rounded-xl overflow-hidden border border-border flex flex-col group">
                                            <div className="relative aspect-video bg-black/10 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                                                {video.videoUrl ? (
                                                    <video src={video.videoUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline preload="metadata" />
                                                ) : (
                                                    <VideoIcon className="w-8 h-8 text-subtext/50" />
                                                )}
                                            </div>
                                            <div className="p-3 flex-1 flex flex-col justify-between">
                                                <p className="text-xs font-medium text-maintext line-clamp-2" title={video.prompt}>{video.prompt}</p>
                                                <div className="flex justify-between items-center mt-3">
                                                    <span className="text-[10px] text-subtext">{new Date(video.createdAt).toLocaleDateString()}</span>
                                                    <a href={video.videoUrl} download target="_blank" rel="noreferrer" className="text-primary hover:opacity-80 transition-opacity p-1 bg-primary/10 rounded-md">
                                                        <Download className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-subtext">
                                    <VideoIcon className="w-10 h-10 mb-2 opacity-50" />
                                    <p>No generated videos yet.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar flex flex-col gap-6">

                            {/* Preview Area */}
                            <div className={`grid grid-cols-1 ${isGenerating || resultVideoUrl ? 'md:grid-cols-2' : ''} gap-4`}>
                                {/* Source Image */}
                                <div className={`flex flex-col gap-2 ${!isGenerating && !resultVideoUrl ? 'max-w-sm mx-auto w-full' : ''}`}>
                                    <span className="text-xs font-bold text-subtext uppercase tracking-wider">Source Image</span>
                                    {previewUrl ? (
                                        <div className="relative group w-full aspect-square bg-black/5 dark:bg-white/5 rounded-2xl overflow-hidden border border-border">
                                            <img src={previewUrl} alt="Original" className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-4 py-2 bg-white/90 text-black rounded-full font-semibold text-sm transform scale-95 group-hover:scale-100 transition-all shadow-lg"
                                                >
                                                    <Upload className="w-4 h-4" /> Change Frame
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            className={`w-full aspect-square bg-black/5 dark:bg-white/5 border-2 border-dashed ${isDragging ? 'border-primary bg-primary/10' : 'border-border'} rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-subtext hover:text-primary group`}
                                        >
                                            <div className={`w-12 h-12 rounded-full ${isDragging ? 'bg-primary/20' : 'bg-black/5 dark:bg-white/5'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <Upload className={`w-6 h-6 ${isDragging ? 'text-primary' : ''}`} />
                                            </div>
                                            <div className="text-center px-4">
                                                <p className="text-sm font-semibold text-maintext">
                                                    {isDragging ? 'Drop Image Here' : 'Click or Drag Image'}
                                                </p>
                                                <p className="text-xs mt-1">First frame of the video</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Result Video */}
                                {(isGenerating || resultVideoUrl) && (
                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-subtext uppercase tracking-wider">Video Result</span>
                                        <div className={`relative w-full aspect-square rounded-2xl overflow-hidden border ${isGenerating ? 'border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'border-border'} flex items-center justify-center bg-black/5 dark:bg-white/5`}>
                                            {isGenerating ? (
                                                <div className="flex flex-col items-center gap-4 text-primary animate-in fade-in duration-500">
                                                    <Loader2 className="w-8 h-8 animate-spin" />
                                                    <p className="text-sm font-semibold animate-pulse text-center px-4">Veo is animating...<br /><span className="text-xs font-medium opacity-75">This usually takes ~30 seconds</span></p>
                                                </div>
                                            ) : resultVideoUrl ? (
                                                <div className="w-full h-full animate-in zoom-in-95 duration-500 flex items-center justify-center bg-black">
                                                    <CustomVideoPlayer src={resultVideoUrl} compact={true} />
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex flex-wrap gap-4 shrink-0">
                                <div className="flex flex-col gap-2 w-full sm:w-auto flex-1 text-left">
                                    <label className="text-xs font-bold text-subtext uppercase tracking-wider">Quality Core</label>
                                    <CustomSelect 
                                        value={modelId} 
                                        onChange={setModelId} 
                                        disabled={isGenerating}
                                        options={[
                                            { value: "veo-3.1-fast-generate-001", label: `Veo 3.1 Fast (${getCreditCost('veo-3.1-fast-generate-001', resolution)}/gen)` },
                                            { value: "veo-3.1-generate-001", label: `Veo 3.1 Pro (${getCreditCost('veo-3.1-generate-001', resolution)}/gen)` }
                                        ]} 
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full sm:w-auto flex-1 text-left">
                                    <label className="text-xs font-bold text-subtext uppercase tracking-wider">Resolution</label>
                                    <CustomSelect 
                                        value={resolution} 
                                        onChange={setResolution} 
                                        disabled={isGenerating}
                                        options={[
                                            { value: "720p", label: `720p (${getCreditCost(modelId, '720p')} cr)` },
                                            { value: "1080p", label: `1080p (${getCreditCost(modelId, '1080p')} cr)` },
                                            { value: "4k", label: `4K ${modelId.includes('fast') ? '(Pro Only)' : '(' + getCreditCost(modelId, '4k') + ' cr)'}`, disabled: modelId.includes('fast') }
                                        ]} 
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full sm:w-auto flex-1 text-left">
                                    <label className="text-xs font-bold text-subtext uppercase tracking-wider">Video Ratio</label>
                                    <CustomSelect 
                                        value={aspectRatio} 
                                        onChange={setAspectRatio} 
                                        disabled={isGenerating}
                                        options={[
                                            { value: "16:9", label: "16:9 (Landscape)" },
                                            { value: "9:16", label: "9:16 (Portrait)" },
                                            { value: "1:1", label: "1:1 (Square)" },
                                            { value: "4:3", label: "4:3 (Classic)" },
                                            { value: "3:4", label: "3:4 (Vertical)" }
                                        ]} 
                                    />
                                </div>
                            </div>
                            
                            {/* Input Field */}
                            <div className="flex flex-col gap-2 shrink-0">
                                <label className="text-xs font-bold text-subtext uppercase tracking-wider">Animation Prompt</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={prompt}
                                        onChange={e => setPrompt(e.target.value)}
                                        disabled={!selectedImage || isGenerating}
                                        placeholder="e.g. A cluster of vibrant wildflowers swaying gently in a sun-drenched meadow"
                                        className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-2xl py-3.5 pl-4 pr-12 text-sm text-maintext outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && !isGenerating && selectedImage && prompt.trim()) {
                                                e.preventDefault();
                                                handleGenerate();
                                            }
                                        }}
                                    />
                                </div>
                                <p className="text-[11px] text-subtext ml-1">Be descriptive. Use phrases like "swaying gently", "camera pans left", "zooms in slowly".</p>
                            </div>

                        </div>
                    )}

                    {/* Footer Actions */}
                    {!showHistory && (
                        <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-[#1a1a1a] flex items-center justify-between shrink-0">
                            <button
                                onClick={handleReset}
                                className="text-sm font-semibold text-subtext hover:text-maintext transition-colors"
                            >
                                Reset
                            </button>

                            <div className="flex items-center gap-3">
                                {resultVideoUrl && (
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-maintext rounded-xl font-semibold text-sm transition-all"
                                    >
                                        <Download className="w-4 h-4" /> Download
                                    </button>
                                )}

                                <button
                                    onClick={handleGenerate}
                                    disabled={!selectedImage || !prompt.trim() || isGenerating}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all ${(!selectedImage || !prompt.trim() || isGenerating)
                                        ? 'bg-purple-500/50 text-white/70 cursor-not-allowed shadow-none'
                                        : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]'
                                        }`}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                                        </>
                                    ) : resultVideoUrl ? (
                                        <>
                                            <RotateCw className="w-4 h-4" /> Regenerate
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-4 h-4" /> Generate Video
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Hidden input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg, image/png"
                        className="hidden"
                        onChange={handleImageSelect}
                    />
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence >
    );
};

export default MagicVideoGenModal;
