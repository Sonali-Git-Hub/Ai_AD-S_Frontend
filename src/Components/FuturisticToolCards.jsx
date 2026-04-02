import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ImagePlus, PlaySquare, Headphones, Code, Sparkles, Zap, Search, Globe, FileText, Wand2, PlayCircle, Scale, Video, Brain } from 'lucide-react';

/* ─── Typewriter Engine ────────────────────────────────────── */

const TypewriterPrompt = ({ text, active }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!active) { setDisplayed(''); return; }
    
    let intervalId;
    let timeoutId = setTimeout(() => {
      let i = 0;
      intervalId = setInterval(() => {
        setDisplayed(text.slice(0, i));
        i++;
        if (i > text.length) clearInterval(intervalId);
      }, 35);
    }, 400);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [active, text]);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4 text-center z-20">
      <div className="bg-black/70 backdrop-blur-md rounded-lg p-2.5 border border-white/10 inline-block max-w-[90%] shadow-2xl">
        <p className="text-[10px] sm:text-[11px] font-mono font-bold text-white leading-tight">
          <span className="text-primary mr-1">/</span>{displayed}
          <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="inline-block w-1 h-3 bg-primary ml-0.5" />
        </p>
      </div>
    </div>
  );
};

const ToolPreviewContent = ({ id, prompt, active }) => {
  const [phase, setPhase] = useState('typing'); // typing -> generating -> result

  useEffect(() => {
    if (!active) { setPhase('typing'); return; }
    
    const typingTimer = setTimeout(() => {
      setPhase('generating');
    }, 2800);

    const generatingTimer = setTimeout(() => {
      setPhase('result');
    }, 4500);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(generatingTimer);
    };
  }, [active]);

  const getResultImage = () => {
    const images = {
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&h=250&auto=format&fit=crop",
      video: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&h=250&auto=format&fit=crop",
      edit_image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=400&h=250&auto=format&fit=crop",
      image_to_video: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=400&h=250&auto=format&fit=crop"
    };
    return images[id] || null;
  };

  const getResultText = () => {
    const responses = {
      deep_search: [
        "Analysis Complete: 247 global datasets indexed.",
        "Trend identified: 18.2% growth in AI infrastructure.",
        "Conclusion: Sustainable tech is the leading sector for 2026."
      ],
      web_search: [
        "Live Feed [CNBC]: Market indices hit record highs today.",
        "SpaceX Update: Starship successfully reached orbit.",
        "Weather: Global temperatures stabilize near arctic regions."
      ],
      document: [
        "Financial Report 2025.pdf analyzed.",
        "Revenue: $12.4M (Up 14% YoY)",
        "Top Risk: Supply chain volatility in Southeast Asia.",
        "Action: Redundancy in logistics suggested."
      ],
      code: [
        "import torch",
        "import torch.nn as nn",
        "class AisaModel(nn.Module):",
        "   def forward(self, x):",
        "      return self.model(x)"
      ],
      audio: [
        "Processing Audio Track 04...",
        "Voice: Natural Male (British)",
        "Clarity: 99.8% High Fidelity",
        "Duration: 00:04:12"
      ],
      legal: [
        "Section 4.2 - Identified Liability Breach.",
        "Risk Factor: Moderate (72% probability code check).",
        "Recommendation: Amend clause 12 for compliance."
      ]
    };
    return responses[id] || ["AI Task Successfully Completed.", "Verified by AISA Engine V4.2", "Runtime: 0.8s Total Latency."];
  };

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col bg-slate-50">
      <AnimatePresence mode="wait">
        {phase === 'typing' && (
          <motion.div
            key="typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center p-4"
          >
            <TypewriterPrompt text={prompt} active={active} />
          </motion.div>
        )}

        {phase === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-3 p-4"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-16 h-16 rounded-full border-4 border-primary/20"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-t-4 border-primary rounded-full"
              />
            </div>
            <p className="text-[12px] font-black text-primary uppercase tracking-widest animate-pulse">AISA AI is Generating...</p>
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 w-full h-full p-2"
          >
            {getResultImage() ? (
              <div className="w-full h-full rounded-xl overflow-hidden relative group">
                <img src={getResultImage()} className="w-full h-full object-cover" alt="Preview" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <p className="text-[10px] text-white font-bold truncate">{prompt}</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col justify-between shadow-inner">
                 <div className="space-y-1">
                   {getResultText().map((line, i) => (
                     <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className={`text-[9px] font-mono p-1 rounded-md ${id === 'code' ? 'bg-slate-900 text-blue-300' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}
                     >
                       {line}
                     </motion.div>
                   ))}
                 </div>
                 <div className="flex items-center gap-2 border-t border-slate-100 pt-1.5 mt-auto">
                   <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                     <Brain size={10} className="text-primary" />
                   </div>
                   <p className="text-[9px] font-black text-primary uppercase tracking-tight">AI Result Confirmed</p>
                 </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Tools Data ───────────────────────────────── */

const ALL_TOOLS = [
  { id: 'image', label: 'Generate Image', badge: 'IMAGE', desc: 'Create visuals from text', icon: ImagePlus, color: '#a78bfa', prompt: "Generate cinematic 8k image of a golden retriever in space..." },
  { id: 'video', label: 'Generate Video', badge: 'VIDEO', desc: 'Text to Cinematic Video', icon: Video, color: '#fb923c', prompt: "Creating realistic drone flight over mountains at sunset..." },
  { id: 'image_to_video', label: 'Image to Video', badge: 'ANIMATE', desc: 'Image to Video Magic', icon: PlayCircle, color: '#f97316', prompt: "Animate this static scene with dynamic lighting & motion..." },
  { id: 'edit_image', label: 'Edit Image', badge: 'MAGIC EDIT', desc: 'Magic Image Editor', icon: Wand2, color: '#f43f5e', prompt: "Modify the sky to be a neon-lit cyberpunk sunset..." },
  { id: 'deep_search', label: 'Deep Search', badge: 'INTELLIGENCE', desc: 'Research complex topics', icon: Search, color: '#0ea5e9', prompt: "Analyze global market trends and future tech predictions..." },
  { id: 'web_search', label: 'Real-Time Search', badge: 'REAL-TIME', desc: 'Live web data access', icon: Globe, color: '#22d3ee', prompt: "Search for live updates on the latest SpaceX launch..." },
  { id: 'document', label: 'Analyze Document', badge: 'DOCUMENT', desc: 'Chat with PDFs & Docs', icon: FileText, color: '#3b82f6', prompt: "Summarize this 50-page legal PDF and identify risks..." },
  { id: 'code', label: 'Code Writer', badge: 'CODE', desc: 'Write & debug code', icon: Code, color: '#6366f1', prompt: "Write a robust Python script for a neural network..." },
  { id: 'audio', label: 'Convert to Audio', badge: 'AUDIO', desc: 'Text/Docs to Voice', icon: Headphones, color: '#34d399', prompt: "Synthesize this report into a natural sounding male voice..." },
  { id: 'legal', label: 'AI Legal', badge: 'LEGAL', desc: 'Specialized AI legal tools', icon: Scale, color: '#818cf8', prompt: "Analyze this employment contract for potential loopholes..." },
];

/* ─── 3D Tilt Card ─────────────────────────────────────────── */

const ToolCard = ({ tool, onToolSelect, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const { icon: Icon } = tool;

  // Mouse-tracked 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-65, 65], [10, -10]), { stiffness: 150, damping: 25 });
  const rotY = useSpring(useTransform(x, [-65, 65], [-10, 10]), { stiffness: 150, damping: 25 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => {
    if (window.innerWidth >= 768) {
      x.set(0); y.set(0);
      setIsHovered(false);
    }
  };

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) {
      setIsHovered(true);
    }
  };

  const handleCardClick = () => {
    if (window.innerWidth < 768) {
      if (!isHovered) {
        setIsHovered(true);
      } else {
        onToolSelect(tool.id);
      }
    } else {
      onToolSelect(tool.id);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="w-full h-[125px] sm:h-[135px] relative cursor-pointer"
      style={{ perspective: '1200px', willChange: 'transform' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      // Idle floating animation
      animate={{
        y: [0, -6, 0],
        transition: {
          duration: 3 + index * 0.4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.15,
        }
      }}
      whileTap={{ scale: 0.96 }}
    >
      <motion.div
        className="w-full h-full relative"
        style={{
          transformStyle: 'preserve-3d',
          rotateX: isHovered ? rotX : 0,
          rotateY: isHovered ? rotY : 0,
        }}
      >
        {/* ── Flip wrapper ── */}
        <motion.div
          animate={{ rotateY: isHovered ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 1 }}
          className="w-full h-full relative"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* FRONT */}
          <div
            className="absolute inset-0 w-full h-full rounded-[24px] overflow-hidden border border-white/10 flex flex-col justify-between p-4 group"
            style={{
              backfaceVisibility: 'hidden',
              background: 'rgba(20, 24, 45, 0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              transform: 'translateZ(0)',
            }}
          >
            {/* Glow on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[24px]"
              style={{ boxShadow: `inset 0 0 40px ${tool.color}22, 0 0 30px ${tool.color}18` }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${tool.color} 0%, transparent 70%)` }}
            />
            {/* Shimmer sweep */}
            <div className="absolute inset-0 overflow-hidden rounded-[24px] pointer-events-none">
              <motion.div
                className="absolute top-0 left-[-60%] w-[40%] h-full skew-x-[-20deg]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }}
                animate={{ left: ['−60%', '140%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
              />
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${tool.color}20` }}
              >
                <Icon size={18} style={{ color: tool.color }} />
              </div>
              <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                {tool.badge}
              </span>
            </div>

            <div className="relative z-10 space-y-1">
              <h3 className="text-[14px] font-black text-white leading-tight">{tool.label}</h3>
              <p className="text-[10px] text-white/40 font-medium truncate">{tool.desc}</p>
            </div>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 w-full h-full rounded-[24px] overflow-hidden border border-black/5 flex flex-col"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(0)',
            }}
          >
            <ToolPreviewContent id={tool.id} prompt={tool.prompt} active={isHovered} />
            <div className="p-3 bg-black/[0.03] border-t border-black/[0.05] flex items-center justify-between relative z-10">
              <div className="min-w-0 flex-1 mr-2 text-left">
                <div className="text-[9px] font-black text-black/80 uppercase tracking-tighter truncate">{tool.label}</div>
                <div className="text-[8px] text-black/40 truncate font-semibold">Launch AISA Agent</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onToolSelect(tool.id); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg"
                style={{ background: tool.color, color: '#fff' }}
              >
                <Zap size={14} strokeWidth={4} fill="#fff" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Main Grid Component ────────────────────────────────────────── */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.88, rotateX: 12 },
  visible: {
    opacity: 1, y: 0, scale: 1, rotateX: 0,
    transition: { type: 'spring', stiffness: 160, damping: 20 }
  }
};

const FuturisticToolCards = ({ onToolSelect }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div className="w-full py-8 sm:py-12 px-3 flex justify-center" ref={ref}>
      <motion.div
        className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 max-w-6xl"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {ALL_TOOLS.map((tool, index) => (
          <motion.div
            key={tool.id}
            variants={cardVariants}
            style={{ transformOrigin: 'center bottom' }}
          >
            <ToolCard
              tool={tool}
              index={index}
              onToolSelect={onToolSelect}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default FuturisticToolCards;
export { ToolCard };
