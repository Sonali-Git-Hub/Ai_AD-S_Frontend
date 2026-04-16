import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup, useMotionTemplate, useMotionValue } from 'framer-motion';
import { X, Layout, Monitor, Smartphone, Check, Zap, Shield, Rocket, Sparkles, Wand2, Brain } from 'lucide-react';
import PromptLibraryModal from './PromptLibraryModal';

// Wave fill animation for Active Aspect Ratio
const WaveFill = () => (
    <div className="absolute inset-0 overflow-hidden rounded-[10px] z-0 pointer-events-none">
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="absolute inset-0 bg-primary/95"
        >
            <motion.div
                animate={{ x: ["0%", "-50%", "0%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0 right-0 h-[250%] w-[200%] opacity-40 mix-blend-overlay"
                style={{
                    background: "radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 70%)"
                }}
            />
        </motion.div>
    </div>
);

// High-end Floating Particles (Bokeh & Stardust)
const PremiumEnvironment = () => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        // Deep magical colors + pure black for stardust feeling under light frost
        const palettes = ['bg-slate-900', 'bg-indigo-900', 'bg-violet-950', 'bg-[#0f172a]', 'bg-blue-900'];
        // Reduced particle count slightly for mobile performance
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

// Deep cinematic shadows rotating — cool indigo/blue/violet palette
const CinematicShadows = () => (
    <div className="absolute inset-0 overflow-hidden rounded-[27px] pointer-events-none opacity-[0.28] mix-blend-multiply z-0">
        <motion.div
            animate={{
                x: ["0%", "50%", "0%"],
                y: ["0%", "20%", "0%"],
                scale: [1, 1.2, 1],
                backgroundColor: ["#3730a3", "#4338ca", "#6366f1", "#4f46e5", "#3730a3"]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[10%] -left-[10%] w-[80%] h-[80%] rounded-full filter blur-[40px] md:blur-[70px]"
        />
        <motion.div
            animate={{
                x: ["0%", "-40%", "0%"],
                y: ["0%", "30%", "0%"],
                scale: [1, 1.3, 1],
                backgroundColor: ["#1e3a8a", "#2563eb", "#3b82f6", "#1d4ed8", "#1e3a8a"]
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[30%] -right-[20%] w-[90%] h-[90%] rounded-full filter blur-[40px] md:blur-[60px]"
        />
        <motion.div
            animate={{
                x: ["0%", "30%", "0%"],
                y: ["0%", "-40%", "0%"],
                scale: [1, 1.1, 1],
                backgroundColor: ["#4c1d95", "#6d28d9", "#7c3aed", "#8b5cf6", "#4c1d95"]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute -bottom-[20%] left-[20%] w-[80%] h-[60%] rounded-full filter blur-[40px] md:blur-[70px]"
        />
    </div>
);

const MagicToolSettingsCard = ({ isOpen, onClose, toolType, config, onChange, pricing, onContentSelect, referenceImage }) => {
    const [hoveredModel, setHoveredModel] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    
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

    const toolPricingBase = pricing[toolType === 'edit' ? 'image' : toolType] || { models: [], editModels: [] };
    const toolPricing = { models: toolType === 'edit' ? (toolPricingBase.editModels || []) : (toolPricingBase.models || []) };
    
    const aspectRatios = toolType === 'video' ? [
        { id: '16:9', label: '16:9', icon: Monitor, w: 14, h: 8 },
        { id: '9:16', label: '9:16', icon: Smartphone, w: 8, h: 14 },
        { id: '1:1', label: '1:1', icon: Layout, w: 1, h: 1 },
    ] : [
        { id: '1:1', label: '1:1', icon: Layout, w: 1, h: 1 },
        { id: '16:9', label: '16:9', icon: Monitor, w: 14, h: 8 },
        { id: '9:16', label: '9:16', icon: Smartphone, w: 8, h: 14 },
        { id: '4:5', label: '4:5', icon: Layout, w: 4, h: 5 },
    ];

    const modelHoverColors = ["bg-blue-50/90", "bg-indigo-50/90", "bg-violet-50/90", "bg-purple-50/90"];

    return (
        <AnimatePresence>
            <div 
                className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/60 sm:bg-black/70 backdrop-blur-[8px] sm:backdrop-blur-[16px]"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                {/* Main animated container */}
                <motion.div
                    onMouseMove={handleMouseMove}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ 
                        opacity: 1, 
                        scale: isHovered ? 1.005 : [1, 1.01, 1], 
                        y: 0,
                    }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ 
                        scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                        default: { type: "spring", stiffness: 350, damping: 28, mass: 1 }
                    }}
                    className="relative w-full max-w-[320px] sm:max-w-[340px] rounded-[28px] overflow-visible shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] sm:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] group ring-1 ring-white/30 sm:ring-white/50"
                >
                    {/* ── Animated Color-Cycling Outer Halo — cool blue/indigo/violet ── */}
                    <motion.div
                        animate={{
                            background: [
                                "radial-gradient(ellipse at 50% 0%,   rgba(99,102,241,0.60) 0%, transparent 65%)",
                                "radial-gradient(ellipse at 100% 50%, rgba(59,130,246,0.60) 0%, transparent 65%)",
                                "radial-gradient(ellipse at 50% 100%,rgba(139,92,246,0.60) 0%, transparent 65%)",
                                "radial-gradient(ellipse at 0% 50%,   rgba(79,70,229,0.55)  0%, transparent 65%)",
                                "radial-gradient(ellipse at 50% 0%,   rgba(99,102,241,0.60) 0%, transparent 65%)"
                            ],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -inset-[12px] rounded-[40px] pointer-events-none z-0 blur-[18px]"
                    />

                    {/* ── Animated Color-Cycling Border Gradient — indigo/blue/violet only ── */}
                    <motion.div
                        animate={{
                            background: [
                                "linear-gradient(0deg,   #6366f1, #4f46e5, #3b82f6, #8b5cf6)",
                                "linear-gradient(90deg,  #3b82f6, #6366f1, #7c3aed, #4338ca)",
                                "linear-gradient(180deg, #8b5cf6, #3b82f6, #4f46e5, #6366f1)",
                                "linear-gradient(270deg, #4338ca, #7c3aed, #6366f1, #2563eb)",
                                "linear-gradient(360deg, #6366f1, #4f46e5, #3b82f6, #8b5cf6)"
                            ],
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-[1.5px] rounded-[29px] pointer-events-none z-[1] opacity-80"
                        style={{ padding: "1.5px" }}
                    />

                    {/* Pulsing Backlight */}
                    <div className="absolute inset-0 rounded-[28px] overflow-hidden pointer-events-none">
                        <motion.div
                            animate={{
                                rotate: 360,
                                filter: [
                                    "hue-rotate(0deg) blur(8px)",
                                    "hue-rotate(120deg) blur(10px)",
                                    "hue-rotate(240deg) blur(8px)",
                                    "hue-rotate(360deg) blur(8px)"
                                ]
                            }}
                            transition={{
                                rotate: { duration: 12, repeat: Infinity, ease: "linear" },
                                filter: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="absolute -inset-[60%] z-0 bg-[conic-gradient(from_0deg,transparent_0%,rgba(255,255,255,0.7)_15%,transparent_30%,rgba(0,0,0,0.1)_50%,rgba(255,255,255,0.6)_85%,transparent_100%)] sm:bg-[conic-gradient(from_0deg,transparent_0%,rgba(255,255,255,1)_15%,transparent_30%,rgba(0,0,0,0.2)_50%,rgba(255,255,255,0.8)_85%,transparent_100%)] opacity-25"
                        />
                    </div>

                    {/* Main Content Glass Layer */}
                    <div className="relative z-10 w-full h-full rounded-[27px] flex flex-col overflow-hidden bg-white/80 sm:bg-white/75 backdrop-blur-[20px] sm:backdrop-blur-[50px] shadow-[inset_0_1px_3px_rgba(255,255,255,0.9)] sm:shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] border border-white/50 sm:border-white/60">
                        
                        {/* Dynamic Interactive Spotlight overlay (Hidden on pure mobile since no hover) */}
                        <motion.div
                            className="pointer-events-none hidden md:block absolute -inset-px z-20 rounded-[27px] opacity-0 transition duration-500 group-hover:opacity-100 mix-blend-soft-light"
                            style={{ background: spotlightBackground }}
                        />

                        {/* Background Animations */}
                        <CinematicShadows />
                        <PremiumEnvironment />

                        {/* Soft Noise Texture */}
                        <div className="absolute inset-0 z-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

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
                                            {toolType === 'video' ? 'Video Settings' : toolType === 'edit' ? 'Image Editing' : 'Image Generation'}
                                        </h3>
                                        <p className="text-[8.5px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] flex items-center gap-1 opacity-90">
                                            <Sparkles className="w-2.5 h-2.5 text-primary animate-pulse" />
                                            Advanced Engine
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 relative z-10">
                                    {(toolType === 'image' || toolType === 'edit' || toolType === 'video') && (
                                        <motion.button
                                            whileHover={{ scale: 1.1, backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setIsLibraryOpen(true)}
                                            className="px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-1.5 text-primary transition-all hover:shadow-lg hover:shadow-primary/10"
                                            title="Prompt Library"
                                        >
                                            <img src="/logo/Logo.svg" alt="AISA" className="w-3.5 h-3.5 object-contain" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Prompt Library</span>
                                        </motion.button>
                                    )}
                                    <motion.button 
                                        whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.7)", rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={onClose} 
                                        className="w-7 h-7 rounded-full bg-white/50 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-md transition-all shadow-sm border border-white/50 relative z-10"
                                    >
                                        <X size={16} strokeWidth={2.5} />
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        {/* ── Body ── */}
                        <div className="relative z-20 px-5 sm:px-6 py-5 space-y-5 sm:space-y-6 max-h-[60vh] sm:max-h-[55vh] overflow-y-auto custom-scrollbar">
                            
                            {/* Segmented Aspect Control — hidden for edit mode */}
                            {config.aspectRatio !== undefined && toolType !== 'edit' && (
                                <div>
                                    {toolType === 'video' && (
                                        <div className="flex items-center gap-2 mb-3 ml-1">
                                            <div className="w-1 h-1 rounded-full bg-slate-800 shadow-[0_0_6px_rgba(0,0,0,0.5)]" />
                                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-800/80 drop-shadow-sm">Aspect Ratio</p>
                                        </div>
                                    )}

                                    <div className={`relative grid ${toolType === 'video' ? 'grid-cols-3' : 'grid-cols-4'} gap-1.5 bg-white/50 p-1.5 rounded-[16px] border border-white/60 shadow-[inset_0_2px_12px_rgba(0,0,0,0.03)] backdrop-blur-xl`}>
                                        <LayoutGroup id="aspectSwitch">
                                            {aspectRatios.map((ar) => {
                                                const isActive = config.aspectRatio === ar.id;
                                                return (
                                                    <motion.button
                                                        key={ar.id}
                                                        onClick={() => onChange('aspectRatio', ar.id)}
                                                        whileHover={!isActive ? { scale: 1.05 } : {}}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="relative h-12 rounded-[10px] flex flex-col items-center justify-center transition-colors outline-none overflow-hidden group shadow-sm"
                                                    >
                                                        {isActive ? (
                                                            <WaveFill />
                                                        ) : (
                                                            <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-[10px]" />
                                                        )}

                                                        <div className={`relative z-10 flex flex-col items-center transition-all duration-300 ${isActive ? 'scale-105' : 'scale-100 opacity-70 group-hover:opacity-100'}`}>
                                                            <div className="flex items-center justify-center mb-1 drop-shadow-sm">
                                                                <div 
                                                                    className={`border-[1.5px] rounded-[2px] transition-colors ${isActive ? 'border-white' : 'border-slate-500 group-hover:border-slate-800'}`}
                                                                    style={{ 
                                                                        width: ar.w > ar.h ? 12 : ar.w === ar.h ? 9 : 6,
                                                                        height: ar.h > ar.w ? 12 : ar.h === ar.w ? 9 : 6,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className={`text-[9.5px] font-black tracking-tighter ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>{ar.label}</span>
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </LayoutGroup>
                                    </div>
                                </div>
                            )}

                            {/* Synthesis Core Items */}
                            {config.modelId !== undefined && (
                                <div className="space-y-3.5">
                                    <div className="flex items-center gap-2 mb-3 ml-1">
                                        <div className="w-1 h-1 rounded-full bg-slate-800 shadow-[0_0_6px_rgba(0,0,0,0.5)]" />
                                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-800/80 drop-shadow-sm">Synthesis Core</p>
                                    </div>
                                    <div className="space-y-3 relative">
                                        <AnimatePresence>
                                            {toolPricing.models.map((model, idx) => {
                                                const isActive = config.modelId === model.id;
                                                const isThisHovered = hoveredModel === model.id;
                                                const hoverBaseColor = modelHoverColors[idx % modelHoverColors.length];

                                                return (
                                                    <motion.div
                                                        key={model.id || model.name || idx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.08, type: "spring", stiffness: 300, damping: 25 }}
                                                        className="relative"
                                                    >
                                                        {isActive && (
                                                            <motion.div 
                                                                layoutId="activeModelRing"
                                                                className="absolute -inset-[1px] rounded-[20px] bg-gradient-to-r from-primary via-[#8b5cf6] to-[#0ea5e9] opacity-[0.35] blur-[5px] z-0"
                                                            />
                                                        )}

                                                        <motion.button
                                                            onHoverStart={() => setHoveredModel(model.id)}
                                                            onHoverEnd={() => setHoveredModel(null)}
                                                            onClick={() => onChange('modelId', model.id)}
                                                            whileHover={{ y: -2, scale: 1.01 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            className={`w-full relative p-[14px] rounded-[18px] text-left transition-all duration-300 z-10 overflow-hidden ${
                                                                isActive 
                                                                ? 'bg-white shadow-[0_15px_30px_-5px_rgba(var(--primary-rgb),0.25)] border-2 border-primary/20' 
                                                                : `bg-white/60 border border-white/50 hover:${hoverBaseColor} shadow-sm backdrop-blur-md hover:shadow-lg`
                                                            }`}
                                                        >
                                                            {/* Lens Flare Sweep Effect when Hovered */}
                                                            {isThisHovered && !isActive && (
                                                                <motion.div 
                                                                    initial={{ left: "-100%" }}
                                                                    animate={{ left: "200%" }}
                                                                    transition={{ duration: 1.2, ease: "easeInOut" }}
                                                                    className="absolute top-0 bottom-0 w-[50%] bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 pointer-events-none"
                                                                />
                                                            )}

                                                            <div className="flex items-center gap-3.5 relative z-10 w-full">
                                                                <motion.div 
                                                                    animate={{ scale: isActive ? 1.1 : 1 }}
                                                                    className={`w-[36px] h-[36px] rounded-[12px] flex items-center justify-center transition-all duration-500 shadow-inner shrink-0 ${isActive ? 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-[0_8px_20px_rgba(var(--primary-rgb),0.4)] border border-primary/50' : 'bg-white text-slate-400 group-hover:text-primary'}`}
                                                                >
                                                                    {model.speed === 'Fast' ? <Rocket size={18} className={isActive ? 'drop-shadow-md' : ''} /> : <Zap size={18} className={isActive ? 'drop-shadow-md' : ''} />}
                                                                </motion.div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className={`text-[14px] font-black truncate pr-2 transition-colors ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>{model.name}</span>
                                                                        
                                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                                            <span className={`text-[8.5px] font-black uppercase tracking-[0.1em] transition-colors ${isActive ? 'text-primary' : 'text-slate-500'}`}>
                                                                                {model.price === 0 ? 'Free' : `${model.price} CR`}
                                                                            </span>
                                                                            
                                                                            {isActive && (
                                                                                <motion.div
                                                                                    initial={{ scale: 0, rotate: -90 }}
                                                                                    animate={{ scale: 1, rotate: 0 }}
                                                                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                                                                    className="bg-primary/10 rounded-full p-0.5"
                                                                                >
                                                                                    <Check size={12} className="text-primary" strokeWidth={4} />
                                                                                </motion.div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <p className={`text-[10.5px] font-medium leading-snug transition-colors line-clamp-2 ${isActive ? 'text-slate-500' : 'text-slate-400 group-hover:text-slate-600'}`}>{model.description}</p>
                                                                </div>
                                                            </div>
                                                        </motion.button>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* ── Footer ── */}
                        <div className="p-4 relative z-20 border-t border-black/[0.04] bg-white/40 backdrop-blur-md">
                            <motion.button 
                                whileHover={{ scale: 1.01, y: -0.5 }}
                                whileTap={{ 
                                    scale: 0.98,
                                    y: 0,
                                    transition: { type: "spring", stiffness: 250, damping: 20 }
                                }}
                                onClick={onClose}
                                className="relative w-11/12 mx-auto flex items-center justify-center py-2.5 rounded-[12px] bg-gradient-to-r from-primary via-[#4F46E5] to-[#3B82F6] group overflow-hidden shadow-[0_10px_20px_rgba(var(--primary-rgb),0.25)]"
                                style={{ backgroundSize: '200% 100%' }}
                                animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:200%_0,0_0] bg-no-repeat group-hover:animate-shine pointer-events-none transition-all duration-1000 ease-out" />

                                <div className="relative z-10 flex items-center justify-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5 text-white drop-shadow-sm group-hover:scale-105 transition-transform duration-500" strokeWidth={2.5} />
                                    <span className="text-[11.5px] font-black text-white uppercase tracking-[0.2em] drop-shadow-sm">Activate Core</span>
                                </div>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
            
            {/* Prompt Library Modal Integration */}
            <PromptLibraryModal 
                isOpen={isLibraryOpen}
                mode={toolType === 'edit' ? 'edit' : toolType === 'video' ? 'video' : 'generate'}
                referenceImage={referenceImage}
                onClose={() => setIsLibraryOpen(false)}
                onSelect={(prompt) => {
                    if (onContentSelect) {
                        onContentSelect(prompt);
                    }
                    setIsLibraryOpen(false);
                    onClose(); // Close the settings card too for seamless UX
                }}
            />

            <style jsx>{`
                @keyframes shine {
                    100% { background-position: -200% 0, 0 0; }
                }
            `}</style>
        </AnimatePresence>
    );
};

export default MagicToolSettingsCard;
