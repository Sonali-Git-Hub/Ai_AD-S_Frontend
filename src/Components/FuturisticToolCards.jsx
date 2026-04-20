import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ImagePlus, PlaySquare, Headphones, Code, Sparkles, Zap, Search, Globe, FileText, Wand2, PlayCircle, Scale, Video, Brain, TrendingUp, Megaphone, Lock } from 'lucide-react';
import LegalLogo from './LegalLogo';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

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
      <div className="bg-white/80 dark:bg-black/70 backdrop-blur-md rounded-lg p-2.5 border border-slate-200 dark:border-white/10 inline-block max-w-[90%] shadow-2xl">
        <p className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-800 dark:text-white leading-tight">
          <span className="text-primary mr-1">/</span>{displayed}
          <motion.span 
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }} 
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.6 }} 
            className="inline-block w-1 h-3 bg-primary ml-0.5" 
          />
        </p>
      </div>
    </div>
  );
};

const ToolPreviewContent = ({ id, prompt, active }) => {
  const { t } = useLanguage();
  const themeContext = useTheme();
  const theme = themeContext?.theme || 'dark';
  const isDark = theme.toLowerCase() === 'dark';
  const [phase, setPhase] = useState('typing'); // typing -> generating -> result

  useEffect(() => {
    if (!active) { setPhase('typing'); return; }
    
    const typingTimer = setTimeout(() => {
      setPhase('generating');
    }, 2200);

    const generatingTimer = setTimeout(() => {
      setPhase('result');
    }, 3800);

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
      ],
      aiad_agent: [
        "Orchestrating 30-day Campaign...",
        "Brand Voice calibrated: Premium",
        "Target Platforms: Instagram, LinkedIn, X",
        "Status: 90 Content Pieces Ready"
      ]
    };
    return responses[id] || ["AI Task Successfully Completed.", "Verified by AISA Engine V4.2", "Runtime: 0.8s Total Latency."];
  };

  return (
    <div className={`w-full h-full relative overflow-hidden flex flex-col ${isDark ? 'bg-slate-900/40' : 'bg-slate-50'}`}>
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
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.2, opacity: 1 }}
                transition={{ duration: 0.75, repeat: Infinity, repeatType: "reverse" }}
                className="w-16 h-16 rounded-full border-4 border-primary/20"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatType: "loop" }}
                className="absolute inset-0 border-t-4 border-primary rounded-full"
              />
            </div>
            <p className="text-[12px] font-black text-primary uppercase tracking-widest animate-pulse">{t('aisaAiGenerating')}</p>
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
              <div className={`w-full h-full rounded-xl border p-2.5 flex flex-col justify-between shadow-inner ${isDark ? 'bg-slate-950/60 border-white/5' : 'bg-white border-slate-100'}`}>
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
                   <p className="text-[9px] font-black text-primary uppercase tracking-tight">{t('aiResultConfirmed')}</p>
                 </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};



/* ─── 3D Tilt Card ─────────────────────────────────────────── */

const ToolCard = ({ tool, onToolSelect, index }) => {
  const { t } = useLanguage();
  const themeContext = useTheme();
  const theme = themeContext?.theme || 'dark';
  const isDark = theme.toLowerCase() === 'dark';
  const [isFlipped, setIsFlipped] = useState(false);
  const { icon: Icon } = tool;

  const isActive = tool.active;

  return (
    <div 
      className="relative w-full h-[135px] group"
      style={{ perspective: '1000px' }}
      onMouseEnter={() => !tool.comingSoon && setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="w-full h-full relative cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
        onClick={() => !tool.comingSoon && onToolSelect(tool.id === 'legal' ? 'legal_toolkit' : tool.id)}
      >
        {/* FRONT SIDE */}
        <div 
          className={`absolute inset-0 w-full h-full rounded-[22px] border p-4 flex flex-col gap-2.5 backface-hidden ${
            isActive 
              ? 'bg-primary/5 border-primary ring-1 ring-primary shadow-[0_0_30px_rgba(139,92,246,0.15)]' 
              : (isDark ? 'bg-slate-900/40 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl' : 'bg-white/70 border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl')
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col items-center gap-1">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: isDark ? `${tool.color}15` : `${tool.color}10` }}
              >
                <Icon size={tool.id === 'legal' ? 22 : 18} style={{ color: tool.color }} />
              </div>
              {tool.id === 'legal' && (
                <span className={`text-[5px] font-black uppercase tracking-tighter ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>सत्यमेव जयते</span>
              )}
            </div>

            <div className="flex flex-col items-end gap-1">
               <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                 isDark ? 'bg-white/5 text-white/40' : 'bg-[#f1f5f9] text-[#94a3b8]'
               }`}>
                 {tool.badge}
               </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <h3 className={`text-[13px] font-bold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {tool.label}
            </h3>
            <p className={`text-[9px] leading-snug line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {tool.desc}
            </p>
          </div>
        </div>

        {/* BACK SIDE */}
        <div 
          className={`absolute inset-0 w-full h-full rounded-[20px] border overflow-hidden flex flex-col backface-hidden ${
            isDark ? 'bg-slate-950 border-white/20' : 'bg-white border-slate-200 shadow-xl'
          }`}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex-1 overflow-hidden border-b border-black/5 dark:border-white/5">
            <ToolPreviewContent 
              id={tool.id} 
              prompt={tool.prompt} 
              active={isFlipped} 
            />
          </div>
          <div className="p-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Sparkles key={i} size={7} className={i < Math.floor(tool.review?.rating || 5) ? "text-amber-400 fill-amber-400" : "text-slate-300"} />
                ))}
              </div>
              <span className="text-[7px] font-black text-primary">{tool.review?.rating || '5.0'}</span>
            </div>
            <p className={`text-[8px] leading-tight italic font-medium line-clamp-2 mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              "{tool.review?.text || "Revolutionary AI tool that saves me hours of work every single day."}"
            </p>
            <div className="bg-primary text-white text-[8px] font-black uppercase tracking-widest py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20">
              <Zap size={9} fill="white" />
              {t('liveTry')}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
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

const FuturisticToolCards = ({ onToolSelect, activeToolId, isAdmin = false }) => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  /* ─── Tools Data ───────────────────────────────── */

  const ALL_TOOLS = [
    { id: 'image', label: t('generateImage'), badge: t('badgeImage'), desc: t('createVisualsFromText'), icon: ImagePlus, color: '#a78bfa', prompt: "Generate cinematic 8k image of a golden retriever in space...", review: { rating: 5, count: "12.4k", text: "STUNNING! The clarity of the generated images is better than Midjourney V6. AISA truly understands context." } },
    { id: 'video', label: t('generateVideo'), badge: t('badgeVideo'), desc: t('textToCinematicVideo'), icon: Video, color: '#fb923c', prompt: "Creating realistic drone flight over mountains at sunset...", review: { rating: 4.9, count: "8.2k", text: "The temporal consistency in the videos is industry-leading. Smooth motion without any morphing artifacts." } },
    { id: 'image_to_video', label: t('imageToVideo'), badge: t('badgeAnimate'), desc: t('imageToVideoMagic'), icon: PlayCircle, color: '#f97316', prompt: "Animate this static scene with dynamic lighting & motion...", review: { rating: 5, count: "5.7k", text: "Turned my product photos into cinematic ads in seconds. This is a game changer for my marketing agency." } },
    { id: 'edit_image', label: t('editImage'), badge: t('badgeMagicEdit'), desc: t('magicImageEditor'), icon: Wand2, color: '#f43f5e', prompt: "Modify the sky to be a neon-lit cyberpunk sunset...", review: { rating: 4.8, count: "15k", text: "Perfect for quick retouching. The AI infilling is seamless—you literally can't tell where the edit starts." } },
    { id: 'deep_search', label: t('deepSearch'), badge: t('badgeIntelligence'), desc: t('researchComplexTopics'), icon: Search, color: '#0ea5e9', prompt: "Analyze global market trends and future tech predictions...", review: { rating: 5, count: "21k", text: "Replaced my research team. It synthesizes 100+ papers into a 1-page brief perfectly. Extremely accurate indexing." } },
    { id: 'web_search', label: t('realTimeSearch'), badge: t('badgeRealTime'), desc: t('liveWebDataAccess'), icon: Globe, color: '#22d3ee', prompt: "Search for live updates on the latest SpaceX launch...", review: { rating: 4.9, count: "10k", text: "No more hallucinated news. AISA provides real-time citations and live feeds. Highly reliable for tech news." } },
    { id: 'document', label: t('analyzeDocument'), badge: t('badgeDocument'), desc: t('chatWithPdfsDocs'), icon: FileText, color: '#3b82f6', prompt: "Summarize this 50-page legal PDF and identify risks...", review: { rating: 5, count: "7.4k", text: "I uploaded a 120-page contract and it found a hidden liability clause in seconds. Worth every credit." } },
    { id: 'code', label: t('codeWriter'), badge: t('badgeCode'), desc: t('writeDebugCode'), icon: Code, color: '#6366f1', prompt: "Write a robust Python script for a neural network...", review: { rating: 4.9, count: "14.2k", text: "Writes production-ready code with tests. It actually understands modern design patterns, not just snippets." } },
    { id: 'audio', label: t('convertToAudio'), badge: t('badgeAudio'), desc: t('textDocsToVoice'), icon: Headphones, color: '#34d399', prompt: "Synthesize this report into a natural sounding male voice...", review: { rating: 4.8, count: "6k", text: "The most human-like synthesis I've heard. Even the breathing and pauses feel natural. Perfect for podcasts." } },
    { id: 'legal', label: t('aiLegal'), badge: t('badgeLegal'), desc: t('specializedAiLegalTools'), icon: LegalLogo, color: '#818cf8', prompt: "Analyze this employment contract for potential loopholes...", review: { rating: 5, count: "3.2k", text: "AISA's legal reasoning is spookily good. It identified risks that our junior lawyers missed twice." } },
    { id: 'ai_cashflow', label: t('aiCashFlow'), badge: t('badgeFinance'), desc: t('liveAnalysisReports'), icon: TrendingUp, color: '#10b981', prompt: "Analyzing cashflow...", review: { rating: 5, count: "4.2k", text: "Incredible financial insights. The real-time analysis saved us thousands." } },
    { id: 'aiad_agent', label: t('aiAds') || 'AI ADS™', badge: t('badgeAds') || 'ADS', desc: 'Social Media Orchestration', icon: Megaphone, color: '#eab308', prompt: "Generate a 30-day social media campaign for AISA...", review: { rating: 5, count: "18k", text: "Automated my entire month's content in under 5 minutes. The hashtags are perfectly optimized for trends." } },
  ];

  // Map the visual tool IDs to the IDs used in state
  const getToolActiveStatus = (toolId) => {
    if (!activeToolId) return false;
    // Map of library IDs to state IDs
    const mapping = {
       'image': 'isImageGeneration',
       'video': 'isVideoGeneration',
       'image_to_video': 'isMagicVideoModalOpen',
       'edit_image': 'isMagicEditing',
       'deep_search': 'isDeepSearch',
       'web_search': 'isWebSearch',
       'document': 'isFileAnalysis',
       'code': 'isCodeWriter',
       'audio': 'isAudioConvertMode',
       'legal': 'activeLegalToolkit'
    };
    return activeToolId === toolId;
  };

  return (
    <div className="w-full py-2 sm:py-4 px-2 sm:px-3 flex justify-center" ref={ref}>
      <motion.div
        className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-[1700px] px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {ALL_TOOLS.map((tool, index) => (
          <motion.div
            key={tool.id}
            variants={cardVariants}
            style={{ transformOrigin: 'center bottom' }}
          >
            <ToolCard
              tool={{
                ...tool,
                active: getToolActiveStatus(tool.id)
              }}
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
