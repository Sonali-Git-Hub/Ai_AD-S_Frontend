import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { Scale, TrendingUp, Sparkles, Play, ArrowRight, ShieldCheck, AlertCircle, FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/* ── COMPACT GLASSMORPHIC CARD ── */
const LabCard = ({ title, subtitle, icon: Icon, color, slides, onClick }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const cardRef = useRef(null);
    const contentRef = useRef(null);
    const isInView = useInView(cardRef, { once: false, amount: 0.4 });
    const [isHovered, setIsHovered] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);

    const flipToNext = useCallback(() => {
      if (!contentRef.current) return;
      setIsFlipping(true);
      
      const tl = gsap.timeline({
        onComplete: () => {
          setActiveIdx((prev) => (prev + 1) % slides.length);
          gsap.to(contentRef.current, { 
            rotateY: 0, 
            opacity: 1, 
            scale: 1, 
            duration: 0.8, 
            ease: "cubic-bezier(0.22, 1, 0.36, 1)",
            onComplete: () => setIsFlipping(false)
          });
        }
      });

      tl.to(contentRef.current, { 
        rotateY: 90, 
        opacity: 0, 
        scale: 0.9, 
        duration: 0.4, 
        ease: "power2.in" 
      });
    }, [slides.length]);

    useEffect(() => {
        if (!isInView || isFlipping || isHovered) return;
        
        const timer = setTimeout(() => {
          flipToNext();
        }, 2800); // 2.8 seconds delay per slide as requested

        return () => clearTimeout(timer);
    }, [isInView, activeIdx, isFlipping, flipToNext, isHovered]);

    const currentSlide = slides[activeIdx];

    return (
        <motion.div
            ref={cardRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.03, y: -5 }}
            // Premium Floating & Breathing Animation
            animate={{ 
              y: isInView ? [0, -12, 0] : 0,
            }}
            transition={{ 
              y: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 0.4, ease: "easeOut" }
            }}
            className="relative w-[340px] h-[520px] rounded-[20px] p-[1px] overflow-hidden group cursor-pointer transition-all duration-500"
            style={{ 
              background: `linear-gradient(135deg, ${color}33, transparent, ${color}11)`,
              perspective: '1000px',
              boxShadow: isHovered 
                ? `0 25px 60px -15px ${color}55, 0 0 40px ${color}22` 
                : `0 0 30px ${color}11`
            }}
        >
            {/* Outer Glow Layer */}
            <div 
              className={`absolute -inset-10 opacity-0 group-hover:opacity-60 transition-opacity duration-1000 blur-[80px] pointer-events-none z-0`}
              style={{ background: `radial-gradient(circle, ${color}44 0%, transparent 70%)` }}
            />
            {/* Glass Background */}
            <div className={`absolute inset-0 backdrop-blur-[40px] rounded-[19px] transition-colors duration-500 bg-[#0a0a12]/90`} />

            {/* Neural Pulse Layer */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
              <div className="absolute inset-0 animate-pulse" style={{ background: `radial-gradient(circle at 50% 50%, ${color}, transparent)` }} />
            </div>
            
            {/* Animated Glow Border (intensifies on hover) */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isInView ? 'opacity-30' : 'opacity-0'} group-hover:opacity-100`}>
                <div className="absolute -inset-[100%] animate-spin-slow opacity-50" style={{ background: `conic-gradient(from 0deg, transparent, ${color}, transparent, ${color}, transparent)` }} />
            </div>

            <div 
              className="relative h-full w-full rounded-[19px] p-8 flex flex-col items-center z-10 transition-all duration-500 border border-white/5 group-hover:border-white/10 bg-[#0a0a12]/95"
            >
                
                {/* Icon Section */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
                    <div 
                      className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center relative translate-z-10 transition-all duration-700 group-hover:scale-110 group-hover:bg-white/[0.05]"
                      style={{ boxShadow: `0 10px 40px -10px ${color}44` }}
                    >
                        <Icon size={32} style={{ color: color }} strokeWidth={1.5} />
                    </div>
                </div>

                {/* Title & Tagline */}
                <div className="w-full flex-1 flex flex-col min-h-0">
                    <AnimatePresence mode="wait">
                      {isInView && (
                        <motion.div 
                          key="demo"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full flex-1 flex flex-col min-h-0"
                        >
                            {/* Main Title */}
                            <h3 className="text-center text-3xl font-black italic tracking-tighter uppercase mb-3 text-white">
                                {title}
                            </h3>
                            
                            {/* Status Bar */}
                            <div className="flex items-center justify-between mb-4 px-2">
                               <div className="flex items-center gap-1.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                 <span className="text-[7px] font-black uppercase tracking-widest text-white/40">{title}_DEMO_NODE</span>
                               </div>
                               <span className="text-[7px] font-black text-primary uppercase tracking-widest animate-pulse">
                                 Slide {activeIdx + 1}/{slides.length}
                               </span>
                            </div>

                            {/* Flipping Slide Content */}
                            <div 
                              ref={contentRef}
                              className="flex-1 flex flex-col justify-center items-center text-center px-4 overflow-hidden relative"
                              style={{ transformStyle: 'preserve-3d' }}
                            >
                                <AnimatePresence mode="wait">
                                {currentSlide.type === 'intro' ? (
                                    <motion.div 
                                        key="intro"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                        className="w-full h-full flex flex-col items-center justify-center relative"
                                    >
                                        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                                            <FileText size={160} className="text-white blur-sm" />
                                        </div>
                                        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 relative z-10 border border-primary/30 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                            <Scale size={28} className="text-primary" />
                                        </div>
                                        <h4 className="text-xl font-black mb-3 text-white tracking-tight italic uppercase">{currentSlide.label}</h4>
                                        <p className="text-xs font-medium text-white/50">{currentSlide.text}</p>
                                    </motion.div>
                                ) : currentSlide.type === 'upload' ? (
                                    <motion.div 
                                        key="upload"
                                        className="w-full flex flex-col items-center"
                                    >
                                         <div className="w-full max-w-[150px] bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 backdrop-blur-md relative overflow-hidden">
                                            <motion.div 
                                                initial={{ x: -60, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ duration: 0.6, delay: 0.2 }}
                                                className="flex items-center gap-2 mb-3 bg-white/5 p-2 rounded-lg"
                                            >
                                                <FileText size={14} className="text-primary" />
                                                <div className="flex-1 h-1 bg-white/20 rounded-full" />
                                            </motion.div>
                                            <div className="h-12 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-primary/40 animate-ping" />
                                            </div>
                                         </div>
                                         <motion.h4 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm font-bold mb-2 text-white"
                                         >
                                            {currentSlide.label}
                                         </motion.h4>
                                         <p className="text-[10px] text-white/50 mb-6">{currentSlide.text}</p>
                                         <motion.div 
                                            animate={{ boxShadow: ['0 0 0px #6366f100', '0 0 15px #6366f166', '0 0 0px #6366f100'] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="px-6 py-2 bg-primary/20 border border-primary/40 rounded-full text-[9px] font-black uppercase tracking-widest text-white"
                                         >
                                            Upload UI
                                         </motion.div>
                                    </motion.div>
                                ) : currentSlide.type === 'analysis' ? (
                                    <motion.div 
                                        key="analysis"
                                        className="w-full flex flex-col items-center"
                                    >
                                        <div className="w-full max-w-[180px] h-32 bg-white/5 border border-white/5 rounded-2xl mb-6 relative overflow-hidden backdrop-blur-md">
                                            <div className="p-4 space-y-3 opacity-30">
                                                <div className="h-1 bg-white rounded-full w-full" />
                                                <div className="h-1 bg-white rounded-full w-4/5" />
                                                <div className="h-1 bg-white rounded-full w-full" />
                                                <div className="h-1 bg-white rounded-full w-3/4" />
                                            </div>
                                            {/* Dim backdrop focus effect */}
                                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
                                            {/* Scanning Line */}
                                            <motion.div 
                                                animate={{ top: ['-20%', '120%'] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                className="absolute inset-x-0 h-12 bg-gradient-to-b from-transparent via-primary/40 to-transparent blur-md z-10"
                                            />
                                            <motion.div 
                                                animate={{ top: ['-20%', '120%'] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                className="absolute inset-x-0 h-[2px] bg-primary z-20 shadow-[0_0_20px_primary]"
                                            />
                                        </div>
                                        <h4 className="text-sm font-black mb-1 text-white tracking-tight italic">{currentSlide.label}</h4>
                                        <p className="text-[10px] text-white/50 italic">{currentSlide.text}</p>
                                    </motion.div>
                                ) : currentSlide.type === 'results' ? (
                                    <div className="w-full space-y-3">
                                        <motion.div 
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.5, delay: 0.1 }}
                                            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                <span className="text-[10px] font-bold text-white/80">Indemnity Risk</span>
                                            </div>
                                            <span className="text-[8px] font-black text-red-400 bg-red-400/10 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.2)]">⚠ Risk detected</span>
                                        </motion.div>
                                        <motion.div 
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.5, delay: 0.3 }}
                                            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] font-bold text-white/80">Termination Period</span>
                                            </div>
                                            <span className="text-[8px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(16,185,129,0.2)]">✅ Safe clause</span>
                                        </motion.div>
                                        <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mt-4">{currentSlide.label}</h4>
                                    </div>
                                ) : (
                                    <motion.div 
                                        key="insight"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-full flex flex-col items-center"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                                            <ShieldCheck size={40} className="text-emerald-500" />
                                        </div>
                                        <h4 className="text-base font-black mb-3 text-white italic uppercase tracking-tight">{currentSlide.label}</h4>
                                        <p className="text-[11px] leading-relaxed text-white/60 mb-8 max-w-[220px]">{currentSlide.text}</p>
                                        
                                        <motion.div 
                                            animate={{ boxShadow: ['0 0 0px #6366f100', '0 0 25px #6366f144', '0 0 0px #6366f100'] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                            className="px-8 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl"
                                        >
                                            {activeIdx === slides.length - 1 ? 'Get Started' : 'Try AILEGAL'}
                                        </motion.div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>

                             <div className="mt-6 pt-4 border-t border-white/5 w-full relative">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <span className="text-[6px] font-black text-white/30 uppercase tracking-widest">Process Flow</span>
                                    <span className="text-[6px] font-black text-white/30 uppercase tracking-widest">100% Secure</span>
                                </div>
                                <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden mb-1">
                                    <motion.div 
                                      className="h-full" 
                                      style={{ background: color }}
                                      animate={{ width: ['0%', '100%'] }}
                                      transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
                                    />
                                </div>
                                <div className="h-[2px] w-3/4 bg-white/5 rounded-full overflow-hidden opacity-50">
                                    <motion.div 
                                      className="h-full bg-white/30" 
                                      animate={{ x: ['-100%', '200%'] }}
                                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                </div>
                             </div>

                             {/* Specialized Try Now Button */}
                             <motion.button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onClick();
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-6 w-full py-4 rounded-2xl flex items-center justify-center gap-2 group/btn transition-all relative overflow-hidden"
                                style={{ 
                                  background: 'rgba(255,255,255,0.05)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  boxShadow: isHovered ? `0 0 20px ${color}22` : 'none'
                                }}
                              >
                                <div 
                                  className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" 
                                  style={{ background: `linear-gradient(90deg, transparent, ${color}33, transparent)` }}
                                />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] relative z-10 text-white/60 group-hover/btn:text-white transition-colors leading-none mt-0.5">
                                  {activeIdx === slides.length - 1 ? 'Get Started' : 'Try Now'}
                                </span>
                                <ArrowRight size={14} className="relative z-10 transition-transform group-hover/btn:translate-x-1.5" style={{ color }} />
                              </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

const StackedCards = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const LEGAL_SLIDES = [
        { 
          label: 'How AILEGAL Works', 
          text: 'AI-powered legal document analysis and risk profiling.',
          type: 'intro'
        },
        { 
          label: 'Upload Contract', 
          text: 'Upload your contract or agreement securely.',
          type: 'upload'
        },
        { 
          label: 'Clause Analysis', 
          text: 'AI analyzes legal clauses for compliance and hidden traps.',
          type: 'analysis'
        },
        { 
          label: 'Risk Profiling', 
          text: 'Identify risk detected vs safe clauses instantly.',
          type: 'results'
        },
        { 
          label: 'Legal Insights', 
          text: 'Get instant legal insights & suggestions for your document.',
          visual: 'check'
        }
    ];

    const CASH_SLIDES = [
        { 
          label: 'Predictive Auditing', 
          text: 'Processing Q4 datasets to identify hidden revenue leaks and trends.',
          visual: 'chart'
        },
        { 
          label: 'Revenue Lift', 
          text: 'Forecast: +18% revenue lift detected via predictive neural modeling.',
          visual: 'growth'
        },
        { 
          label: 'Runway Forecast', 
          text: 'Strategy confirmed: 14 months of healthy survival runway predicted.',
          visual: 'secure'
        }
    ];

    return (
        <section className={`relative py-32 px-8 overflow-hidden flex flex-col items-center justify-center transition-colors duration-700 bg-[#0b0b12]`}>
            {/* Aesthetic Neural Background / Subtle Gradients for Light Mode */}
            <div className={`absolute inset-x-[-100px] inset-y-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]`} />
            
            <div className="text-center mb-20 z-30">
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={`inline-flex items-center gap-4 px-8 py-3 rounded-full mb-8 backdrop-blur-3xl border transition-colors bg-white/[0.04] border-white/10`}>
                    <Sparkles size={14} className="text-primary animate-pulse" />
                    <span className={`text-[10px] font-black tracking-[0.8em] uppercase leading-none mt-1 text-white/50`}>Specialized Lab Nodes</span>
                </motion.div>
                <h2 className="text-6xl font-black italic tracking-tighter uppercase mb-4 text-white leading-none">Two Core Wings of AISA™</h2>
                <p className="text-base font-medium tracking-tight text-gray-500">Unified Intelligence & Frontier Generative Engines.</p>
            </div>

            <div className="relative z-30 flex flex-wrap items-center justify-center gap-16">
                <LabCard 
                  title="AILEGAL"
                  subtitle="AI-powered legal document analysis"
                  icon={Scale}
                  color="#6366f1"
                  slides={LEGAL_SLIDES}
                  onClick={() => navigate('/dashboard/chat?mode=ailegal')}
                />
                <LabCard 
                  title="AICASHFLOW"
                  subtitle="Smart AI financial tracking & prediction lab"
                  icon={TrendingUp}
                  color="#22d3ee"
                  slides={CASH_SLIDES}
                  onClick={() => navigate('/dashboard/chat?mode=aicashflow')}
                />
            </div>
        </section>
    );
};

export default StackedCards;
