import React, { useState, useEffect, useRef } from 'react';
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
        }, 3600); // 2.8s delay + 0.8s transition ≈ 3.6s total cycle per slide
        return () => clearInterval(timer);
    }, [isHovered]);

    const slideVariants = {
        enter: { rotateY: 90, opacity: 0, scale: 0.9 },
        center: { 
            rotateY: 0, 
            opacity: 1, 
            scale: 1,
            transition: { 
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1] 
            }
        },
        exit: { 
            rotateY: -90, 
            opacity: 0, 
            scale: 0.9,
            transition: { 
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1] 
            }
        }
    };

    const renderSlideContent = () => {
        switch(activeSlide) {
            case 0: // INTRO
                return (
                    <motion.div 
                        key="intro"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center h-full text-center p-6"
                    >
                        <div className="relative mb-6">
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"
                            />
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 relative z-10 backdrop-blur-md">
                                <Scale size={40} className="text-indigo-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight uppercase italic">How AILEGAL Works</h3>
                        <p className="text-sm text-indigo-200/60 font-medium tracking-wide">AI-powered legal document analysis</p>
                        
                        {/* Background Document Glow */}
                        <div className="absolute inset-x-10 bottom-10 top-40 opacity-5 pointer-events-none">
                            <FileText size={200} className="text-white mx-auto" />
                        </div>
                    </motion.div>
                );
            case 1: // UPLOAD
                return (
                    <motion.div 
                        key="upload"
                        className="flex flex-col items-center justify-center h-full text-center p-6"
                    >
                        <motion.div 
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="w-full max-w-[200px] bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 backdrop-blur-sm shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                    <FileText size={16} className="text-indigo-400" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="w-full h-1.5 bg-white/10 rounded-full mb-1.5" />
                                    <div className="w-2/3 h-1.5 bg-white/10 rounded-full" />
                                </div>
                            </div>
                            <div className="w-full h-[60px] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 group-hover:border-indigo-500/30 transition-colors">
                                <Upload size={18} className="text-white/20" />
                                <span className="text-[8px] text-white/30 uppercase font-bold tracking-widest">Drop Contract</span>
                            </div>
                        </motion.div>
                        <h4 className="text-lg font-bold text-white mb-2 tracking-tight">Upload your contract</h4>
                        <p className="text-[11px] text-white/50 mb-6 max-w-[200px]">Securely upload NDAs, MSAs, or any legal agreement.</p>
                        <motion.button 
                            animate={{ boxShadow: ['0 0 0px rgba(99,102,241,0)', '0 0 20px rgba(99,102,241,0.4)', '0 0 0px rgba(99,102,241,0)'] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="px-6 py-2 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white"
                        >
                            Select File
                        </motion.button>
                    </motion.div>
                );
            case 2: // AI ANALYSIS
                return (
                    <motion.div 
                        key="analysis"
                        className="flex flex-col items-center h-full p-6"
                    >
                        <div className="w-full max-w-[240px] bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm h-[180px]">
                            {/* Document Skeleton */}
                            <div className="space-y-3 opacity-20">
                                <div className="w-full h-2 bg-white rounded-full" />
                                <div className="w-3/4 h-2 bg-white rounded-full" />
                                <div className="w-full h-2 bg-white rounded-full" />
                                <div className="w-5/6 h-2 bg-white rounded-full" />
                                <div className="w-full h-2 bg-white rounded-full" />
                                <div className="w-2/3 h-2 bg-white rounded-full" />
                            </div>
                            
                            {/* Scanning Wave */}
                            <motion.div 
                                animate={{ top: ['0%', '100%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-x-0 h-10 z-10 pointer-events-none"
                                style={{ 
                                    background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.4), transparent)',
                                    filter: 'blur(4px)'
                                }}
                            />
                            <motion.div 
                                animate={{ top: ['0%', '100%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-x-0 h-[2px] bg-indigo-400/80 z-20 shadow-[0_0_15px_rgba(99,102,241,1)]"
                            />
                            
                            <div className="absolute inset-0 flex items-center justify-center z-30">
                                <div className="bg-indigo-600/20 p-3 rounded-full backdrop-blur-md border border-indigo-500/30">
                                    <Search size={24} className="text-white animate-pulse" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 text-center">
                            <h4 className="text-lg font-bold text-white mb-2 tracking-tight">AI analyzes clauses</h4>
                            <p className="text-[11px] text-white/50">Semantic understanding of legal obligations.</p>
                        </div>
                    </motion.div>
                );
            case 3: // RESULTS
                return (
                    <motion.div 
                        key="results"
                        className="flex flex-col items-center h-full p-6"
                    >
                        <div className="w-full space-y-3">
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3"
                            >
                                <AlertCircle size={18} className="text-red-400" />
                                <div className="flex-1">
                                    <div className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-0.5">Risk detected</div>
                                    <div className="text-[10px] text-white/70 font-medium">Undefined liability cap in section 4.1</div>
                                </div>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-3"
                            >
                                <ShieldCheck size={18} className="text-emerald-400" />
                                <div className="flex-1">
                                    <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Safe clause</div>
                                    <div className="text-[10px] text-white/70 font-medium">Termination notice period is standard</div>
                                </div>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-3"
                            >
                                <CheckCircle2 size={18} className="text-emerald-400" />
                                <div className="flex-1">
                                    <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Safe clause</div>
                                    <div className="text-[10px] text-white/70 font-medium">Standard governing law (Delaware)</div>
                                </div>
                            </motion.div>
                        </div>
                        <div className="mt-auto pt-6 text-center">
                            <h4 className="text-lg font-bold text-white tracking-tight">Instant Risk Profiling</h4>
                        </div>
                    </motion.div>
                );
            case 4: // INSIGHT
                return (
                    <motion.div 
                        key="insight"
                        className="flex flex-col items-center justify-center h-full text-center p-6"
                    >
                        <div className="w-full max-w-[240px] bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 mb-8 backdrop-blur-sm">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Summary Result</span>
                            </div>
                            <h5 className="text-xl font-black text-white italic mb-2 tracking-tighter uppercase">AILEGAL</h5>
                            <p className="text-[10px] text-white/60 leading-relaxed font-medium">"Your contract is 85% compliant with industry standards. We suggest matching Section 4's indemnity with standard market rates."</p>
                        </div>
                        
                        <h4 className="text-lg font-black text-white mb-4 tracking-tight uppercase italic">Get instant suggestions</h4>
                        
                        <motion.button 
                            onClick={onClick}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group flex items-center gap-3 px-8 py-3 bg-white text-black rounded-full text-[11px] font-black uppercase tracking-[0.2em] relative transition-all"
                        >
                            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-0 hover:opacity-20 transition-opacity" />
                            Try AILEGAL
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.03 }}
            animate={{ 
                y: [0, -10, 0],
                boxShadow: isHovered 
                    ? '0 0 50px rgba(99, 102, 241, 0.2), 0 0 100px rgba(129, 140, 248, 0.1)' 
                    : '0 0 30px rgba(99, 102, 241, 0.05)'
            }}
            transition={{ 
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.4 },
                boxShadow: { duration: 0.6 }
            }}
            className="relative w-[340px] h-[480px] rounded-[20px] overflow-hidden cursor-pointer bg-[#0b0b12] border border-white/5"
            style={{ 
                perspective: '1000px',
            }}
        >
            {/* Soft Glow Border Overlay */}
            <div className="absolute inset-0 rounded-[20px] p-[1px] pointer-events-none opacity-40">
                <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-indigo-500/50 via-transparent to-purple-500/50" />
            </div>

            {/* Inner Glass Layer */}
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[20px]" />

            {/* Content Area */}
            <div className="relative h-full w-full flex flex-col z-10">
                {/* Header / Status Bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">DEMO_MODE_ACTIVE</span>
                    </div>
                    <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${activeSlide === i ? 'w-4 bg-indigo-500' : 'w-1 bg-white/10'}`} />
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

                {/* Footer Progress Indicator (Optional but nice) */}
                <div className="h-1 w-full bg-white/5">
                    <motion.div 
                        key={activeSlide}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3.6, ease: "linear" }}
                        className="h-full bg-indigo-500/30"
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default AiLegalDemoCard;
