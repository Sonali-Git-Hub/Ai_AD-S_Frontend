import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  TrendingUp, PlusCircle, Globe, Instagram, Linkedin, Hash, 
  ArrowUpRight, Zap, Sparkles, X, ChevronLeft, ChevronRight, 
  Clock, MousePointer2, Layout, BarChart, LineChart, Search
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const cubicBezier = [0.22, 1, 0.36, 1];

const ConfettiPiece = ({ color, index }) => {
  const randomX = (Math.random() - 0.5) * 400;
  const randomY = -Math.random() * 300 - 100;
  const randomRotate = Math.random() * 720;
  const randomScale = 0.4 + Math.random();

  return (
    <motion.div
      initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 0 }}
      animate={{ 
        x: randomX, 
        y: randomY, 
        rotate: randomRotate, 
        opacity: [1, 1, 0],
        scale: randomScale
      }}
      transition={{ 
        duration: 2.2, 
        ease: "easeOut",
        delay: index * 0.005 
      }}
      style={{
        position: 'absolute',
        width: Math.random() > 0.5 ? 10 : 6,
        height: Math.random() > 0.5 ? 6 : 10,
        backgroundColor: color,
        borderRadius: Math.random() > 0.8 ? '50%' : '1px',
        zIndex: 100,
      }}
    />
  );
};

const SlideShow = ({ type, themeColor, isDarkMode }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const cashflowSlides = [
    {
      title: "Global Market Explorer",
      description: "Search and analyze 10,000+ Global & Indian stocks with AISA intelligence.",
      visual: (
        <div className="w-full h-full flex flex-col p-6 space-y-4">
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center gap-3">
             <Search size={16} className="text-white/40" />
             <div className="text-sm text-white/80 font-medium">Search stocks...<motion.span animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity }}>|</motion.span></div>
          </div>
          <div className="grid grid-cols-2 gap-3 h-full pb-4">
             {[
               { s: 'AAPL', n: 'Apple Inc.', c: '#555' },
               { s: 'MSFT', n: 'Microsoft', c: '#00A4EF' },
               { s: 'NVDA', n: 'NVIDIA', c: '#76B900' },
               { s: 'TSLA', n: 'Tesla', c: '#E81D23' }
             ].map((stock, i) => (
               <motion.div 
                 key={stock.s}
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-white/5 rounded-xl p-3 border border-white/5 relative group/stock"
               >
                  <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center font-black text-[10px]" style={{ background: stock.c + '44', color: stock.c }}>{stock.s.slice(0,2)}</div>
                  <div className="text-[10px] font-black text-white">{stock.s}</div>
                  <div className="text-[8px] text-white/40 truncate">{stock.n}</div>
                  <div className="absolute top-2 right-2 flex gap-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                  </div>
               </motion.div>
             ))}
          </div>
        </div>
      )
    },
    {
      title: "Magnificent Ticker Node",
      description: "Deep-dive into the 'Magnificent Seven' and Indian indices in real-time.",
      visual: (
        <div className="w-full h-full flex items-center justify-center p-6">
           <motion.div 
             animate={{ y: [0, -10, 0] }}
             transition={{ repeat: Infinity, duration: 4 }}
             className="w-44 h-56 bg-white/10 rounded-[2rem] border border-white/20 p-6 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden"
           >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)]">
                 <span className="text-2xl font-black text-white">MS</span>
              </div>
              <div className="text-lg font-black text-white tracking-widest">MSFT</div>
              <div className="text-[10px] text-white/40 font-bold mb-4">Microsoft Corp.</div>
              <div className="flex gap-2">
                 <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-white/60">SOFTWARE</div>
                 <div className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/40 text-[8px] font-black text-blue-400">US</div>
              </div>
              <motion.div 
                animate={{ width: ['0%', '100%'], opacity: [0, 1, 0] }} 
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-6 h-0.5 bg-primary/30" 
              />
           </motion.div>
        </div>
      )
    },
    {
       title: "AlphaVantage Engine",
       description: "Data-powered by high-frequency market APIs for 100% accuracy.",
       visual: (
         <div className="w-full h-full flex flex-col justify-center items-center gap-6 p-8">
            <div className="relative">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                 className="w-32 h-32 rounded-full border border-dashed border-white/20" 
               />
               <motion.div 
                 animate={{ rotate: -360 }}
                 transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                 className="absolute inset-2 rounded-full border border-dashed border-primary/20" 
               />
               <div className="absolute inset-0 flex items-center justify-center">
                  <BarChart size={32} className="text-primary" />
               </div>
            </div>
            <div className="text-center">
               <div className="text-[9px] font-black text-white/20 tracking-[0.4em] mb-1">REAL-TIME DATA FEED</div>
               <div className="text-xs font-bold text-white/60 font-mono">102.4 TPS • 9ms Latency</div>
            </div>
         </div>
       )
    }
  ];

  const aiaddSlides = [
    {
      title: "Universal URL Scraper",
      description: "Paste any product link or blog URL to begin the transformation.",
      visual: (
        <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8">
           <div className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
              <div className="flex items-center gap-3">
                 <Globe size={18} className="text-primary/60" />
                 <span className="text-sm font-mono text-white/80">https://amazon.com/p/B09...</span>
              </div>
              <motion.div 
                animate={{ left: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/10 to-transparent" 
              />
           </div>
           <div className="flex gap-2">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="w-2 h-2 rounded-full bg-primary" />
              <div className="w-2 h-2 rounded-full bg-primary/20" />
              <div className="w-2 h-2 rounded-full bg-primary/20" />
           </div>
        </div>
      )
    },
    {
      title: "Active Intelligence Synthesis",
      description: "AISA extracts hooks, USPs and creates viral social captions in seconds.",
      visual: (
        <div className="w-full h-full flex flex-col justify-center p-8 space-y-4">
           <div className="bg-white/5 rounded-2xl p-4 border border-white/10 relative">
              <div className="flex items-center gap-2 mb-3">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                 <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Generating Content...</span>
              </div>
              <div className="space-y-2">
                 <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="text-xs font-medium text-white/80 leading-relaxed italic"
                 >
                    "Transforming your workspace has never been easier. Discover premium aesthetics with AISA... <motion.span animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity }}>|</motion.span>"
                 </motion.div>
                 <div className="flex flex-wrap gap-2 pt-2">
                    {['#Productivity', '#AIArt', '#ModernWork'].map(tag => (
                      <span key={tag} className="text-[9px] font-black text-primary/40 bg-primary/5 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                 </div>
              </div>
           </div>
           {/* Steps in background */}
           <div className="flex justify-around opacity-30">
              <div className="flex flex-col items-center">
                 <MousePointer2 size={12} className="text-white/40 mb-1" />
                 <span className="text-[8px] font-black">SCRAPE</span>
              </div>
              <div className="flex flex-col items-center">
                 <Zap size={12} className="text-primary mb-1" />
                 <span className="text-[8px] font-black">SYNTHESIZE</span>
              </div>
              <div className="flex flex-col items-center">
                 <Layout size={12} className="text-white/40 mb-1" />
                 <span className="text-[8px] font-black">RENDER</span>
              </div>
           </div>
        </div>
      )
    },
    {
      title: "Multi-Format Renders",
      description: "Instant creation of Instagram posts, Reels scripts, and LinkedIn articles.",
      visual: (
        <div className="w-full h-full flex items-center justify-center p-6 -space-x-8">
           <motion.div 
             animate={{ rotateY: -20, rotateX: 10, x: -10 }}
             className="w-36 h-48 bg-gradient-to-br from-[#E1306C] to-[#5851DB] rounded-2xl p-4 shadow-2xl border border-white/20"
           >
              <Instagram size={14} color="white" />
              <div className="mt-4 space-y-2">
                 <div className="h-2 w-full bg-white/20 rounded" />
                 <div className="h-2 w-full bg-white/20 rounded" />
                 <div className="h-2 w-2/3 bg-white/20 rounded" />
              </div>
              <div className="mt-auto pt-8 flex gap-1">
                 <div className="w-2 h-2 rounded-full bg-white/20" />
                 <div className="w-2 h-2 rounded-full bg-white/20" />
              </div>
           </motion.div>
           <motion.div 
             animate={{ rotateY: 20, rotateX: 10, x: 10 }}
             className="w-36 h-48 bg-white p-4 rounded-2xl shadow-2xl relative"
           >
              <Linkedin size={14} color="#0077B5" />
              <div className="mt-4 space-y-2">
                 <div className="h-1.5 w-full bg-[#0077B5]/10 rounded" />
                 <div className="h-1.5 w-full bg-[#0077B5]/10 rounded" />
                 <div className="h-1.5 w-full bg-[#0077B5]/10 rounded" />
                 <div className="h-1.5 w-3/4 bg-[#0077B5]/20 rounded" />
              </div>
           </motion.div>
        </div>
      )
    }
  ];

  const currentSlides = type === 'cashflow' ? cashflowSlides : aiaddSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % currentSlides.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [currentSlides.length]);

  return (
    <div className="flex flex-col h-full">
      <div className={`flex-1 relative overflow-hidden rounded-2xl border mb-6 shadow-inner ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-[#0f111a] border-slate-200/50'}`}>
         <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: cubicBezier }}
              className="absolute inset-0"
            >
              {currentSlides[currentSlide].visual}
            </motion.div>
         </AnimatePresence>
      </div>

      <div className="space-y-2">
          <motion.h3 
            key={`h3-${currentSlide}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
          >
            {currentSlides[currentSlide].title}
          </motion.h3>
          <motion.p
            key={`p-${currentSlide}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-[11px] sm:text-sm leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}
          >
            {currentSlides[currentSlide].description}
          </motion.p>
      </div>

      <div className="flex gap-2 mt-6">
         {currentSlides.map((_, i) => (
           <div 
             key={i} 
             onClick={() => setCurrentSlide(i)}
             className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-white/20'}`} 
           />
         ))}
      </div>
    </div>
  );
};

const GiftBox = ({ title, type, themeColor, isCashflow, isDarkMode }) => {
  const [state, setState] = useState('closed'); // 'closed', 'impact', 'opened'
  const [showConfetti, setShowConfetti] = useState(false);

  // ── 3D Tilt Logic ──
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-200, 200], [15, -15]), { stiffness: 150, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-200, 200], [-15, 15]), { stiffness: 150, damping: 25 });

  const handleMouseMove = (e) => {
    if (state !== 'closed') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleOpen = () => {
    if (state === 'closed') {
      setState('impact');
      setTimeout(() => {
        setState('opened');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
      }, 250);
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setState('closed');
  };

  const confettiColors = ['#FF69B4', '#00BFFF', '#32CD32', '#FFD700', '#FF4500'];

  return (
    <>
      {/* Background Dim Focus Effect */}
      <AnimatePresence>
        {state === 'opened' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className={`fixed inset-0 backdrop-blur-sm z-[100] ${isDarkMode ? 'bg-[#0b0b12]/90' : 'bg-slate-200/60'}`}
          />
        )}
      </AnimatePresence>

      <div className={`relative ${state === 'opened' ? 'z-[101]' : 'z-10'}`}>
        {/* Confetti Explosion */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              {Array.from({ length: 50 }).map((_, i) => (
                <ConfettiPiece key={i} index={i} color={confettiColors[i % confettiColors.length]} />
              ))}
            </div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={state === 'closed' ? handleOpen : undefined}
          transition={{ duration: 0.6, ease: cubicBezier }}
          style={{
            borderRadius: state === 'opened' ? (window.innerWidth < 640 ? 24 : 40) : 24,
            width: state === 'opened' ? (window.innerWidth < 1000 ? '95vw' : '1000px') : '320px',
            height: state === 'opened' ? (window.innerWidth < 640 ? '85vh' : '650px') : '420px',
            rotateX: state === 'closed' ? rotateX : 0,
            rotateY: state === 'closed' ? rotateY : 0,
            transformStyle: 'preserve-3d',
            perspective: '1200px',
            background: state === 'opened' 
              ? (isDarkMode ? 'linear-gradient(160deg, rgba(30,30,50,0.98), rgba(10,10,20,1))' : 'linear-gradient(160deg, rgba(255,255,255,1), rgba(245,247,250,1))')
              : (isDarkMode ? `linear-gradient(160deg, ${themeColor}15, rgba(11,11,18,0.98))` : `linear-gradient(160deg, rgba(255,255,255,0.95), rgba(240,245,255,0.9))`),
            boxShadow: state === 'opened' 
              ? (isDarkMode ? '0 0 100px rgba(0,0,0,0.8)' : '0 20px 80px rgba(0,0,0,0.15)') 
              : (isDarkMode ? `0 30px 100px ${themeColor}33, 0 0 40px ${themeColor}15, inset 0 0 20px ${themeColor}08` : `0 25px 50px ${themeColor}22, inset 0 0 20px rgba(255,255,255,1)`),
            border: state === 'opened' ? (isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)') : (isDarkMode ? `1px solid ${themeColor}44` : `1px solid ${themeColor}55`),
          }}
          className="relative overflow-hidden cursor-pointer"
        >
          {/* Intense Ambient Backdrop Glow (Closed State only) */}
          {state === 'closed' && (
            <motion.div
              animate={{ 
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.1, 1] 
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -inset-[50px] pointer-events-none"
              style={{ 
                background: `radial-gradient(circle at center, ${themeColor}${isDarkMode ? '33' : '15'} 0%, transparent ${isDarkMode ? '60%' : '70%'})`,
                filter: 'blur(40px)',
                zIndex: -1
              }}
            />
          )}

          {/* Additional Outer Halo for extra punch */}
          {state === 'closed' && (
             <div className="absolute inset-0 pointer-events-none opacity-20" style={{ boxShadow: `0 0 60px 20px ${themeColor}44` }} />
          )}

          {/* Card Hover/Floating Logic - Only when closed */}
          <motion.div
            animate={state === 'closed' ? { y: [0, -15, 0] } : { y: 0 }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-full h-full flex flex-col items-center justify-center relative"
          >
            {state === 'closed' || state === 'impact' ? (
              <div className="flex flex-col items-center">
                {/* 3D Box Visual */}
                <motion.div
                   animate={state === 'impact' ? { scale: [1, 0.9, 1.15], rotate: [0, -5, 5, 0] } : {}}
                   className="relative w-48 h-48 mb-12"
                >
                   {/* Impact Flash */}
                   <AnimatePresence>
                      {state === 'impact' && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 3, opacity: [0, 0.8, 0] }}
                          className="absolute inset-0 rounded-full"
                          style={{ background: `radial-gradient(circle, ${themeColor} 100%, transparent)` }}
                        />
                      )}
                   </AnimatePresence>

                   {/* Neural Pulse Border */}
                   <motion.div
                     animate={{ opacity: [0.3, 0.6, 0.3] }}
                     transition={{ repeat: Infinity, duration: 2 }}
                     className="absolute -inset-[2px] rounded-[30px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                     style={{ 
                       background: `conic-gradient(from 0deg, transparent, ${themeColor} 50%, transparent)`,
                     }}
                   >
                     <motion.div 
                       animate={{ rotate: 360 }}
                       transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                       className="w-full h-full"
                     />
                   </motion.div>

                   {/* Box Body (The 'Core') */}
                   <div 
                      className="absolute inset-0 rounded-[28px] preserve-3d shadow-2xl overflow-hidden"
                      style={{ 
                        background: `linear-gradient(160deg, rgba(30,30,50,0.9), rgba(10,10,25,0.95))`,
                        border: `1px solid rgba(255,255,255,0.05)`,
                        backdropFilter: 'blur(20px)'
                      }}
                   >
                      {/* Internal Grid Depth */}
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(${themeColor} 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
                      
                      {/* The Hologram Core */}
                      <div className="absolute inset-0 flex items-center justify-center">
                         <motion.div 
                           animate={{ 
                             scale: [1, 1.1, 1],
                             rotate: [0, 90, 180, 270, 360]
                           }}
                           transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                           className="relative w-32 h-32 flex items-center justify-center"
                         >
                            <div 
                              className="absolute inset-0 rounded-full blur-2xl opacity-20"
                              style={{ background: themeColor }}
                            />
                            <div 
                              className="absolute inset-4 rounded-full border border-dashed opacity-30"
                              style={{ borderColor: themeColor }}
                            />
                            <Sparkles size={40} style={{ color: themeColor, filter: `drop-shadow(0 0 15px ${themeColor})` }} />
                         </motion.div>
                      </div>

                      {/* Glossy Reflection */}
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                   </div>

                   {/* Ground Shadow */}
                   <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/80 blur-3xl rounded-full" />
                </motion.div>

                <div className="text-center relative z-10">
                  <h3 className={`text-4xl font-black mb-3 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-800'}`} style={{ textShadow: isDarkMode ? `0 0 30px ${themeColor}44` : 'none' }}>{title}</h3>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`inline-flex items-center gap-3 px-6 py-2 rounded-full border backdrop-blur-xl group/btn ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-slate-200 shadow-sm'}`}
                  >
                     <span className={`text-[12px] font-black uppercase tracking-[0.3em] transition-all group-hover/btn:tracking-[0.4em] ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>Tap to Open</span>
                     <div className="w-2.5 h-2.5 rounded-full animate-heartbeat" style={{ backgroundColor: themeColor, boxShadow: `0 0 15px ${themeColor}` }} />
                  </motion.div>
                </div>
              </div>
            ) : (
              /* Expanded Demo State */
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="w-full h-full p-5 sm:p-8 md:p-12 flex flex-col md:flex-row gap-6 md:gap-12 overflow-y-auto no-scrollbar"
              >
                 {/* Close Button */}
                 <button 
                   onClick={handleClose} 
                   className={`absolute top-4 right-4 sm:top-8 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center transition-colors z-[110] shadow-md ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                 >
                    <X size={18} className={isDarkMode ? 'text-white' : 'text-slate-800'} />
                 </button>

                 {/* Left Column: Carousel Showcase */}
                 <div className="flex-1 min-h-[250px] sm:min-h-[300px]">
                    <SlideShow type={isCashflow ? 'cashflow' : 'aiadd'} themeColor={themeColor} isDarkMode={isDarkMode} />
                 </div>

                 {/* Right Column: CTA & Conversion */}
                 <div className="w-full md:w-[350px] flex flex-col justify-center items-center md:items-start text-center md:text-left pt-4 md:pt-0 pb-6 md:pb-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6">
                       <Zap size={14} className="text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">PREVIEW MODE</span>
                    </div>

                    <h2 className={`text-3xl sm:text-5xl font-black mb-2 sm:mb-4 tracking-tight leading-[1] ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                       Launching <br/> <span className="text-primary italic">Soon 🚀</span>
                    </h2>
                    
                    <p className={`text-sm sm:text-lg mb-6 sm:mb-10 font-medium leading-relaxed ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                       Be the first to experience the frontier of AI-powered financial intelligence.
                    </p>

                    <div className="space-y-3 w-full">
                       <motion.button
                         whileHover={{ scale: 1.05, y: -5 }}
                         whileTap={{ scale: 0.95 }}
                         className="w-full h-12 sm:h-16 rounded-xl sm:rounded-2xl bg-primary text-white font-black text-sm sm:text-lg tracking-widest shadow-[0_15px_30px_rgba(var(--primary-rgb),0.3)] hover:shadow-primary/50 transition-all flex items-center justify-center gap-3"
                       >
                          GET EARLY ACCESS <ArrowUpRight size={16} />
                       </motion.button>
                       <p className={`text-[9px] font-black uppercase tracking-[0.3em] text-center ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>
                          Limited early user slots remaining
                       </p>
                    </div>
                 </div>
              </motion.div>
            )}
          </motion.div>

          {/* Impact Shockwave Ring */}
          <AnimatePresence>
             {state === 'impact' && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 2.5, opacity: [0, 0.5, 0] }}
                  className="absolute inset-0 border-[4px] border-white/20 rounded-full pointer-events-none"
                />
             )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

const ComingSoonSurprise = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <section className={`relative py-32 px-6 overflow-hidden flex flex-col items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-[#0b0b12]' : 'bg-[#f8fafc]'}`}>
      {/* Background Ambience */}
      <div className={`absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full blur-[180px] pointer-events-none ${isDarkMode ? 'bg-primary/5' : 'bg-primary/10'}`} />
      <div className={`absolute bottom-1/4 right-1/4 w-[800px] h-[800px] rounded-full blur-[180px] pointer-events-none ${isDarkMode ? 'bg-purple-500/5' : 'bg-purple-500/10'}`} />

      {/* Header */}
      <div className="text-center mb-24 relative z-10">
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border mb-8 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
        >
           <Sparkles size={16} className={`${isDarkMode ? 'text-yellow-400' : 'text-amber-500'}`} />
           <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>Expansion Lab 002</span>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
        >
          Something Exciting is <br/> <span className="text-primary italic">Coming Soon</span> 🚀
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className={`text-xl max-w-2xl mx-auto font-medium ${isDarkMode ? 'text-white/30' : 'text-slate-500'}`}
        >
          Unlock the blueprints of our next frontier tools. Opening these nodes reveals the future of AISA intelligence.
        </motion.p>
      </div>

      {/* Boxes Container */}
      <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-24 relative z-10">
        <GiftBox 
          title="AICASHFLOW" 
          themeColor="#4ade80" 
          isCashflow={true}
          isDarkMode={isDarkMode}
        />
        <GiftBox 
          title="AIADD" 
          themeColor="#a855f7" 
          isCashflow={false}
          isDarkMode={isDarkMode}
        />
      </div>

      <style>{`
        @keyframes bIn {
          from{opacity:0;transform:translateY(12px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes pulse {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:0.4;transform:scale(0.85)}
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); opacity: 1; filter: brightness(1); }
          50% { transform: scale(1.4); opacity: 0.7; filter: brightness(1.5); }
        }
        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
        @keyframes vprog {
          from{transform:scaleX(0);transform-origin:left}
          to{transform:scaleX(1);transform-origin:left}
        }
        @keyframes scanning {
          0%{transform: translateY(-100%)}
          100%{transform: translateY(100%)}
        }
        .demo-scroll-thumb::-webkit-scrollbar { width: 3px; }
        .demo-scroll-thumb::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .preserve-3d { transform-style: preserve-3d; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </section>
  );
};

export default ComingSoonSurprise;
