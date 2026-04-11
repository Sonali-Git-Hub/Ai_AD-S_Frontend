import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, FileText, Upload, ShieldCheck, AlertCircle, ArrowRight, Search, CheckCircle2 } from 'lucide-react';

const AiLegalDemoCard = ({ onClick }) => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const totalSlides = 5;

    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % totalSlides);
        }, 3600);
        return () => clearInterval(timer);
    }, [isHovered]);

    const slideVariants = {
        enter: { rotateY: 90, opacity: 0, scale: 0.9 },
        center: {
            rotateY: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        },
        exit: {
            rotateY: -90,
            opacity: 0,
            scale: 0.9,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const renderSlideContent = () => {
        switch (activeSlide) {
            case 0: // INTRO
                return (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center h-full text-center p-5"
                    >
                        <div className="relative mb-5">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 bg-indigo-400/30 blur-2xl rounded-full"
                            />
                            <div className="w-16 h-16 bg-white/60 rounded-2xl flex items-center justify-center border border-white/70 relative z-10 backdrop-blur-md shadow-[0_8px_20px_rgba(99,102,241,0.2)]">
                                <Scale size={32} className="text-indigo-600" />
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-1.5 tracking-tight uppercase italic">How AILEGAL Works</h3>
                        <p className="text-xs text-indigo-500/80 font-semibold tracking-wide">AI-powered legal document analysis</p>

                        {/* Background Document Glow */}
                        <div className="absolute inset-x-10 bottom-8 top-36 opacity-[0.04] pointer-events-none">
                            <FileText size={160} className="text-indigo-900 mx-auto" />
                        </div>
                    </motion.div>
                );

            case 1: // UPLOAD
                return (
                    <motion.div
                        key="upload"
                        className="flex flex-col items-center justify-center h-full text-center p-5"
                    >
                        <motion.div
                            initial={{ x: -80, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="w-full max-w-[180px] bg-white/60 border border-white/70 rounded-2xl p-3.5 mb-5 backdrop-blur-sm shadow-md"
                        >
                            <div className="flex items-center gap-2.5 mb-2.5">
                                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <FileText size={14} className="text-indigo-600" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full mb-1.5" />
                                    <div className="w-2/3 h-1.5 bg-slate-200 rounded-full" />
                                </div>
                            </div>
                            <div className="w-full h-[50px] border-2 border-dashed border-indigo-200 rounded-xl flex flex-col items-center justify-center gap-1">
                                <Upload size={14} className="text-indigo-300" />
                                <span className="text-[7px] text-slate-400 uppercase font-bold tracking-widest">Drop Contract</span>
                            </div>
                        </motion.div>
                        <h4 className="text-base font-bold text-slate-900 mb-1.5 tracking-tight">Upload your contract</h4>
                        <p className="text-[10px] text-slate-500 mb-5 max-w-[180px]">Securely upload NDAs, MSAs, or any legal agreement.</p>
                        <motion.button
                            animate={{ boxShadow: ['0 0 0px rgba(99,102,241,0)', '0 0 18px rgba(99,102,241,0.45)', '0 0 0px rgba(99,102,241,0)'] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="px-5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)]"
                        >
                            Select File
                        </motion.button>
                    </motion.div>
                );

            case 2: // AI ANALYSIS
                return (
                    <motion.div
                        key="analysis"
                        className="flex flex-col items-center h-full p-5"
                    >
                        <div className="w-full max-w-[210px] bg-white/50 border border-white/70 rounded-2xl p-4 relative overflow-hidden backdrop-blur-sm h-[150px] shadow-sm">
                            {/* Document Skeleton */}
                            <div className="space-y-2.5 opacity-25">
                                <div className="w-full h-1.5 bg-slate-400 rounded-full" />
                                <div className="w-3/4 h-1.5 bg-slate-400 rounded-full" />
                                <div className="w-full h-1.5 bg-slate-400 rounded-full" />
                                <div className="w-5/6 h-1.5 bg-slate-400 rounded-full" />
                                <div className="w-full h-1.5 bg-slate-400 rounded-full" />
                                <div className="w-2/3 h-1.5 bg-slate-400 rounded-full" />
                            </div>

                            {/* Scanning Wave */}
                            <motion.div
                                animate={{ top: ['0%', '100%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-x-0 h-8 z-10 pointer-events-none"
                                style={{
                                    background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.35), transparent)',
                                    filter: 'blur(3px)'
                                }}
                            />
                            <motion.div
                                animate={{ top: ['0%', '100%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-x-0 h-[2px] bg-indigo-500/80 z-20 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                            />

                            <div className="absolute inset-0 flex items-center justify-center z-30">
                                <div className="bg-indigo-100/80 p-2.5 rounded-full backdrop-blur-md border border-indigo-200/60 shadow-md">
                                    <Search size={20} className="text-indigo-600 animate-pulse" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 text-center">
                            <h4 className="text-base font-bold text-slate-900 mb-1.5 tracking-tight">AI analyzes clauses</h4>
                            <p className="text-[10px] text-slate-500">Semantic understanding of legal obligations.</p>
                        </div>
                    </motion.div>
                );

            case 3: // RESULTS
                return (
                    <motion.div
                        key="results"
                        className="flex flex-col items-center h-full p-5"
                    >
                        <div className="w-full space-y-2.5">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-red-50/80 border border-red-200/60 p-2.5 rounded-xl flex items-center gap-2.5 shadow-sm"
                            >
                                <AlertCircle size={16} className="text-red-500 shrink-0" />
                                <div className="flex-1">
                                    <div className="text-[7px] font-black text-red-500 uppercase tracking-widest mb-0.5">Risk detected</div>
                                    <div className="text-[9.5px] text-slate-700 font-medium">Undefined liability cap in section 4.1</div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-emerald-50/80 border border-emerald-200/60 p-2.5 rounded-xl flex items-center gap-2.5 shadow-sm"
                            >
                                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                                <div className="flex-1">
                                    <div className="text-[7px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Safe clause</div>
                                    <div className="text-[9.5px] text-slate-700 font-medium">Termination notice period is standard</div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="bg-emerald-50/80 border border-emerald-200/60 p-2.5 rounded-xl flex items-center gap-2.5 shadow-sm"
                            >
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                <div className="flex-1">
                                    <div className="text-[7px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Safe clause</div>
                                    <div className="text-[9.5px] text-slate-700 font-medium">Standard governing law (Delaware)</div>
                                </div>
                            </motion.div>
                        </div>
                        <div className="mt-auto pt-4 text-center">
                            <h4 className="text-base font-bold text-slate-900 tracking-tight">Instant Risk Profiling</h4>
                        </div>
                    </motion.div>
                );

            case 4: // INSIGHT
                return (
                    <motion.div
                        key="insight"
                        className="flex flex-col items-center justify-center h-full text-center p-5"
                    >
                        <div className="w-full max-w-[210px] bg-indigo-50/70 border border-indigo-200/50 rounded-2xl p-4 mb-5 backdrop-blur-sm shadow-sm">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="text-[8px] font-black text-indigo-600 uppercase tracking-[0.2em]">Summary Result</span>
                            </div>
                            <h5 className="text-lg font-black text-slate-900 italic mb-2 tracking-tighter uppercase">AILEGAL</h5>
                            <p className="text-[9.5px] text-slate-600 leading-relaxed font-medium">"Your contract is 85% compliant with industry standards. We suggest matching Section 4's indemnity with standard market rates."</p>
                        </div>

                        <h4 className="text-base font-black text-slate-900 mb-3.5 tracking-tight uppercase italic">Get instant suggestions</h4>

                        <motion.button
                            onClick={onClick}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] relative shadow-[0_8px_20px_rgba(99,102,241,0.35)] transition-all"
                        >
                            <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            Try AILEGAL
                            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        /* Outer wrapper for border + halo */
        <div className="relative">

            {/* Animated color-cycling outer halo */}
            <motion.div
                animate={{
                    background: [
                        "radial-gradient(ellipse at 50% 0%,   rgba(99,102,241,0.60) 0%, transparent 65%)",
                        "radial-gradient(ellipse at 100% 50%, rgba(59,130,246,0.60) 0%, transparent 65%)",
                        "radial-gradient(ellipse at 50% 100%,rgba(139,92,246,0.60) 0%, transparent 65%)",
                        "radial-gradient(ellipse at 0% 50%,   rgba(79,70,229,0.55)  0%, transparent 65%)",
                        "radial-gradient(ellipse at 50% 0%,   rgba(99,102,241,0.60) 0%, transparent 65%)"
                    ]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-[12px] rounded-[32px] pointer-events-none z-0 blur-[18px]"
            />

            {/* Animated color-cycling border */}
            <motion.div
                animate={{
                    background: [
                        "linear-gradient(0deg,   #6366f1, #4f46e5, #3b82f6, #8b5cf6)",
                        "linear-gradient(90deg,  #3b82f6, #6366f1, #7c3aed, #4338ca)",
                        "linear-gradient(180deg, #8b5cf6, #3b82f6, #4f46e5, #6366f1)",
                        "linear-gradient(270deg, #4338ca, #7c3aed, #6366f1, #2563eb)",
                        "linear-gradient(360deg, #6366f1, #4f46e5, #3b82f6, #8b5cf6)"
                    ]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-[1.5px] rounded-[21px] pointer-events-none z-[1] opacity-80"
            />

            {/* Main card */}
            <motion.div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.02 }}
                animate={{ y: [0, -8, 0] }}
                transition={{
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: 0.4 }
                }}
                className="relative w-[280px] h-[400px] rounded-[20px] overflow-hidden cursor-pointer z-[2] shadow-[0_30px_60px_-15px_rgba(79,70,229,0.35),inset_0_2px_4px_rgba(255,255,255,0.85)]"
                style={{ perspective: '1000px' }}
            >
                {/* Frosted glass base */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[60px] z-0 rounded-[20px]" />

                {/* Color-cycling cinematic blobs */}
                <motion.div
                    animate={{
                        backgroundColor: ["#3730a3", "#4338ca", "#6366f1", "#4f46e5", "#3730a3"],
                        x: ["0%", "35%", "0%"], y: ["0%", "20%", "0%"], scale: [1, 1.25, 1]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -left-[15%] w-[70%] h-[70%] rounded-full opacity-[0.45] mix-blend-multiply pointer-events-none z-[1] blur-[60px]"
                />
                <motion.div
                    animate={{
                        backgroundColor: ["#4c1d95", "#6d28d9", "#7c3aed", "#8b5cf6", "#4c1d95"],
                        x: ["0%", "-30%", "0%"], y: ["0%", "25%", "0%"], scale: [1, 1.3, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                    className="absolute -bottom-[25%] -right-[20%] w-[70%] h-[75%] rounded-full opacity-[0.40] mix-blend-multiply pointer-events-none z-[1] blur-[60px]"
                />
                <motion.div
                    animate={{
                        backgroundColor: ["#1e3a8a", "#2563eb", "#3b82f6", "#1d4ed8", "#1e3a8a"],
                        x: ["0%", "20%", "0%"], y: ["0%", "-20%", "0%"], scale: [1, 1.15, 1]
                    }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 7 }}
                    className="absolute top-[25%] right-[5%] w-[50%] h-[50%] rounded-full opacity-[0.28] mix-blend-multiply pointer-events-none z-[1] blur-[50px]"
                />

                {/* Glass border shine */}
                <div className="absolute inset-0 rounded-[20px] border border-white/55 z-[3] pointer-events-none shadow-[inset_0_1px_3px_rgba(255,255,255,0.8)]" />

                {/* Content */}
                <div className="relative h-full w-full flex flex-col z-[8]">
                    {/* Header / Status Bar */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.05] bg-white/35 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-[0.2em]">DEMO_MODE_ACTIVE</span>
                        </div>
                        <div className="flex gap-1">
                            {[0, 1, 2, 3, 4].map(i => (
                                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${activeSlide === i ? 'w-3.5 bg-indigo-500' : 'w-1 bg-slate-300'}`} />
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSlide}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="absolute inset-0"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                {renderSlideContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 w-full bg-slate-200/60">
                        <motion.div
                            key={activeSlide}
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 3.6, ease: "linear" }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 opacity-60"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AiLegalDemoCard;
