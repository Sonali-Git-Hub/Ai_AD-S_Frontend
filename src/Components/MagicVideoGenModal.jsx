import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion';
import { X, Upload, Wand2, Download, Video as VideoIcon, Loader2, History, ArrowLeft, RotateCw, ChevronDown, Check } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import CustomVideoPlayer from './CustomVideoPlayer';

const baseURL = window._env_?.VITE_AISA_BACKEND_API || import.meta.env.VITE_AISA_BACKEND_API || "http://localhost:8080/api";

const CinematicParticles = ({ count = 20 }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const actualCount = isMobile ? Math.floor(count / 2) : count;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen z-0">
      {[...Array(actualCount)].map((_, i) => {
        const size = Math.random() * 3 + 1;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-indigo-400/40"
            style={{ width: size, height: size, filter: 'blur(1px)' }}
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              scale: 0,
              opacity: 0
            }}
            animate={{
              y: [`${Math.random() * 100}%`, `${Math.random() * 100 - 20}%`],
              scale: [0, 1, 1.5, 0],
              opacity: [0, 0.8, 0.4, 0]
            }}
            transition={{
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 3
            }}
          />
        );
      })}
    </div>
  );
};

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
                className={`w-full flex items-center justify-between bg-black/5 dark:bg-white/5 border ${isOpen ? 'border-primary ring-1 ring-primary/50' : 'border-black/10 dark:border-white/10'} rounded-xl px-4 py-2.5 text-sm text-maintext outline-none transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-white/30 hover:bg-black/10 dark:hover:bg-white/10'}`}
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
                        className="absolute z-50 w-full mt-2 py-2 bg-white/90 dark:bg-[#1a1a1a]/95 border border-black/10 dark:border-white/10 rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] overflow-y-auto custom-scrollbar max-h-[135px] backdrop-blur-2xl"
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
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${option.disabled ? 'opacity-50 cursor-not-allowed text-subtext' : 'text-maintext hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer'} ${value === option.value ? 'bg-primary/20 text-primary font-bold' : ''}`}
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

    // Spotlight Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [isHovering, setIsHovering] = useState(false);
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current || (typeof window !== 'undefined' && window.innerWidth < 768)) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    const backgroundSpotlight = useMotionTemplate`radial-gradient(
      600px circle at ${mouseX}px ${mouseY}px,
      rgba(139, 92, 246, 0.15),
      transparent 80%
    )`;

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

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <motion.div
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    initial={{ opacity: 0, scale: 0.9, y: 40, rotateX: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20, rotateX: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="relative w-full max-w-3xl bg-white/10 dark:bg-black/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]"
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {/* Cinematic Backgrounds */}
                    <motion.div 
                        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-500"
                        style={{ background: isHovering && (typeof window !== 'undefined' && window.innerWidth >= 768) ? backgroundSpotlight : 'transparent' }}
                    />
                    <div className="absolute inset-x-0 -top-40 h-[300px] bg-gradient-to-b from-indigo-500/20 to-transparent blur-[80px] pointer-events-none z-0"></div>
                    <div className="absolute inset-x-0 -bottom-40 h-[300px] bg-gradient-to-t from-purple-500/20 to-transparent blur-[80px] pointer-events-none z-0"></div>
                    <CinematicParticles count={30} />

                    {/* Header */}
                    <div className="px-6 py-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/5 dark:bg-white/5 backdrop-blur-xl z-20 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Wand2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-maintext">
                                    {showHistory ? 'Your Video History' : 'Image to Video Magic'}
                                </h2>
                                <p className="text-xs text-subtext font-medium">
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
                        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar relative z-10">
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
                        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar flex flex-col gap-6 relative z-10">

                            {/* Preview Area */}
                            <div className={`grid grid-cols-1 ${isGenerating || resultVideoUrl ? 'md:grid-cols-2' : ''} gap-4`}>
                                {/* Source Image */}
                                <div className={`flex flex-col gap-2 ${!isGenerating && !resultVideoUrl ? 'max-w-sm mx-auto w-full' : ''}`}>
                                    <span className="text-xs font-bold text-maintext uppercase tracking-wider backdrop-blur-md px-2 py-0.5 rounded shadow-sm self-start">Source Image</span>
                                    {previewUrl ? (
                                        <div className="relative group w-full aspect-square bg-black/10 dark:bg-white/5 rounded-[20px] overflow-hidden border border-black/10 dark:border-white/10">
                                            <img src={previewUrl} alt="Original" className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100">
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white/90 text-black rounded-full font-semibold text-sm transform scale-95 group-hover:scale-100 transition-all shadow-lg"
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
                                            className={`w-full aspect-square bg-black/10 dark:bg-white/5 border-2 border-dashed ${isDragging ? 'border-primary bg-primary/10' : 'border-black/20 dark:border-white/10'} rounded-[20px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-black/5 dark:hover:bg-white/10 transition-all text-maintext group`}
                                        >
                                            <div className={`w-12 h-12 rounded-full ${isDragging ? 'bg-primary/20' : 'bg-black/10 dark:bg-white/10'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <Upload className={`w-6 h-6 ${isDragging ? 'text-primary' : ''}`} />
                                            </div>
                                            <div className="text-center px-4">
                                                <p className="text-sm font-bold text-maintext">
                                                    {isDragging ? 'Drop Image Here' : 'Click or Drag Image'}
                                                </p>
                                                <p className="text-xs mt-1 text-subtext">First frame of the video</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Result Video */}
                                {(isGenerating || resultVideoUrl) && (
                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-maintext uppercase tracking-wider backdrop-blur-md px-2 py-0.5 rounded shadow-sm self-start">Video Result</span>
                                        <div className={`relative w-full aspect-square rounded-[20px] overflow-hidden border ${isGenerating ? 'border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'border-black/10 dark:border-white/10'} flex items-center justify-center bg-black/10 dark:bg-white/5`}>
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
                                <label className="text-xs font-bold text-maintext uppercase tracking-wider backdrop-blur-md px-2 py-0.5 rounded shadow-sm self-start">Animation Prompt</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={prompt}
                                        onChange={e => setPrompt(e.target.value)}
                                        disabled={!selectedImage || isGenerating}
                                        placeholder="e.g. A cluster of vibrant wildflowers swaying gently in a sun-drenched meadow"
                                        className="w-full bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3.5 pl-4 pr-12 text-sm text-maintext outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 bg-black/10 dark:bg-white/5 flex items-center justify-between shrink-0 relative z-20">
                            <button
                                onClick={handleReset}
                                className="text-sm font-semibold text-maintext/70 hover:text-maintext transition-colors"
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
                                    className={`relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm overflow-hidden transition-all duration-300 ${(!selectedImage || !prompt.trim() || isGenerating)
                                        ? 'bg-black/10 dark:bg-white/5 text-subtext cursor-not-allowed border border-black/10 dark:border-white/10'
                                        : 'text-white border border-transparent shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transform hover:scale-[1.02] active:scale-[0.98]'
                                        }`}
                                >
                                    {(!(!selectedImage || !prompt.trim() || isGenerating)) && (
                                        <motion.div 
                                          className="absolute inset-0 z-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto]"
                                          animate={{ backgroundPosition: ['0% center', '200% center'] }}
                                          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                        />
                                    )}
                                    <div className="relative z-10 flex items-center gap-2">
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin text-white" /> Generating...
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
                                    </div>
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
                </motion.div>
            </div>
            )}
        </AnimatePresence>
    );
};

export default MagicVideoGenModal;
