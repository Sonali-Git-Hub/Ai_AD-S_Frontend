import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Bot, User, Scale, ShieldCheck, AlertCircle, 
  FileText, Zap, Sparkles, ChevronRight, Play, ArrowRight 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

/* ─── AILEGAL Showcase Steps ─── */
const LEGAL_STEPS = [
  {
    id: 'intro',
    label: 'How AILEGAL Works',
    icon: Sparkles,
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.5)',
    bgAccent: 'rgba(30,27,75,0.4)',
    type: 'title',
    text: 'TRANSFORMING LEGAL COMPLEXITY INTO CLARITY',
    steps: [],
  },
  {
    id: 'upload',
    label: 'Upload',
    icon: FileText,
    color: '#818cf8',
    glow: 'rgba(129,140,248,0.4)',
    bgAccent: 'rgba(30,58,138,0.3)',
    steps: [
      { from: 'user', text: 'Hey AISA, please analyze my new Service Agreement for risks.' },
      { from: 'ai',   text: '🛡️ AILEGAL Node activated. Securely processing document...', typing: true, ms: 1000 },
      { from: 'ai',   text: '✅ Upload successful. Initializing deep clause scanning...', card: 'upload', ms: 1200 },
    ],
  },
  {
    id: 'analysis',
    label: 'Analysis',
    icon: Scale,
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.45)',
    bgAccent: 'rgba(76,29,149,0.3)',
    steps: [
      { from: 'ai',   text: '🧠 Analyzing 146 clauses across 12 sections...', typing: true, ms: 1100 },
      { from: 'ai',   text: '📡 Cross-referencing current jurisdictional Case Laws...', typing: true, ms: 1000 },
      { from: 'ai',   text: '🔍 Detecting hidden indemnity mismatches...', card: 'analysis', ms: 1300 },
    ],
  },
  {
    id: 'results',
    label: 'Risk Profiling',
    icon: AlertCircle,
    color: '#f43f5e',
    glow: 'rgba(244,63,94,0.45)',
    bgAccent: 'rgba(80,10,50,0.35)',
    steps: [
      { from: 'ai',   text: '⚠️ Critical clause mismatch detected in Section 4.2.', typing: true, ms: 900 },
      { from: 'ai',   text: '✅ Mutual liability confirmed for intellectual property.', typing: true, ms: 800 },
      { from: 'ai',   text: '📊 Strategic Risk Report Generated:', card: 'results', ms: 1200 },
    ],
  },
  {
    id: 'insight',
    label: 'Legal Insight',
    icon: ShieldCheck,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.45)',
    bgAccent: 'rgba(6,50,40,0.35)',
    steps: [
      { from: 'ai',   text: '💡 Recommendation: Request a mutual cap on liability to align with market standards.', typing: true, ms: 1200 },
      { from: 'ai',   text: '✅ Document score: 84/100. Follow insights to reach 100%', card: 'insight', ms: 300 },
    ],
  },
];

/* ── Result cards ── */
const ActionCard = ({ type, isDarkMode }) => {
  if (type === 'upload') return (
    <div style={{
      marginTop: 10, width: '100%', borderRadius: 12, padding: 16,
      background: 'rgba(255,255,255,0.03)', border: '1px border-dashed rgba(255,255,255,0.15)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
         <div style={{ padding: 6, borderRadius: 8, background: 'rgba(99,102,241,0.1)' }}>
            <FileText size={16} color="#818cf8" />
         </div>
         <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #6366f1, #a855f7)', animation: 'vprog 2s forwards' }} />
         </div>
      </div>
      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>CONTRACT_004.PDF — SECURING...</span>
    </div>
  );

  if (type === 'analysis') return (
    <div style={{
      marginTop: 10, width: '100%', height: 100, borderRadius: 12, overflow: 'hidden',
      background: '#000', border: '1px solid rgba(99,102,241,0.3)', position: 'relative'
    }}>
       <div style={{ padding: 12, opacity: 0.2 }}>
          <div style={{ height: 4, width: '90%', background: '#fff', borderRadius: 2, marginBottom: 8 }} />
          <div style={{ height: 4, width: '70%', background: '#fff', borderRadius: 2, marginBottom: 8 }} />
          <div style={{ height: 4, width: '85%', background: '#fff', borderRadius: 2, marginBottom: 8 }} />
          <div style={{ height: 4, width: '60%', background: '#fff', borderRadius: 2 }} />
       </div>
       <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.1), transparent)', animation: 'scanning 2s infinite linear' }} />
       <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Zap size={20} color="#6366f1" />
          <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#6366f1', letterSpacing: '0.2em' }}>NEURAL ANALYSIS</span>
       </div>
    </div>
  );

  if (type === 'results') return (
    <div style={{ marginTop: 10, width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <AlertCircle size={14} color="#f43f5e" />
             <span style={{ fontSize: '0.72rem', color: '#f43f5e', fontWeight: 600 }}>Section 4.2 Liability Cap</span>
          </div>
          <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#f43f5e', opacity: 0.6 }}>HIGH RISK</span>
       </div>
       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <ShieldCheck size={14} color="#10b981" />
             <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Termination Rights Mapped</span>
          </div>
          <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#10b981', opacity: 0.6 }}>SAFE</span>
       </div>
    </div>
  );

  if (type === 'insight') return (
    <div style={{
      marginTop: 10, width: '100%', borderRadius: 12, padding: 16,
      background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
      border: '1px solid rgba(16,185,129,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10
    }}>
       <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(16,185,129,0.2)' }}>
          <ShieldCheck size={24} color="#10b981" />
       </div>
       <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#10b981' }}>COMPLIANCE: 84%</div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(16,185,129,0.8)', marginTop: 2 }}>Ready for negotiation optimization.</div>
       </div>
    </div>
  );

  return null;
};

const Bubble = ({ msg, color, isDarkMode }) => {
  const isUser = msg.from === 'user';
  return (
    <div style={{
      display: 'flex', gap: 8,
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 10, animation: 'bIn 0.25s ease forwards',
    }}>
      {!isUser && (
        <div style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg,${color}99,${color})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 8px ${color}55`,
        }}>
          <Bot size={13} color="#fff" />
        </div>
      )}
      <div style={{
        maxWidth: '73%', padding: '8px 12px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
        background: isUser ? `linear-gradient(135deg,${color}bb,${color})` : (isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(79, 70, 229, 0.08)'),
        border: isUser ? 'none' : (isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(79, 70, 229, 0.12)'),
        color: isDarkMode ? '#e2e8f0' : '#475569', fontSize: '0.8rem', lineHeight: 1.5, whiteSpace: 'pre-wrap',
      }}>
        {msg.typing ? <span className="flex gap-1 items-center h-4">
          {[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: `${i*0.15}s` }} />)}
        </span> : (msg.text || '')}
        {!msg.typing && msg.card && <ActionCard type={msg.card} isDarkMode={isDarkMode} />}
      </div>
      {isUser && (
        <div style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15, 23, 42, 0.1)', 
          border: isDarkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(15, 23, 42, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <User size={13} color={isDarkMode ? "#94a3b8" : "#475569"} />
        </div>
      )}
    </div>
  );
};

const AiLegalDemoSection = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
    const sectionRef = useRef(null);
    const cardRef    = useRef(null);
    const glowRef    = useRef(null);
    const chatRef    = useRef(null);
  
    const [activeIdx, setActiveIdx]   = useState(0);
    const [messages, setMessages]     = useState([]);
    const [started, setStarted]       = useState(false);
    const runRef = useRef(false);
  
    const runFeature = useCallback(async (idx) => {
      const feat = LEGAL_STEPS[idx];
      setActiveIdx(idx);
      setMessages([]);
  
      if (feat.type === 'title') {
        if (idx === 0) {
          gsap.fromTo(cardRef.current,
            { scale: 0.9, y: 30, rotateX: 15, opacity: 0 },
            { scale: 1, y: 0, rotateX: 0, opacity: 1, duration: 0.8, ease: 'elastic.out(1, 0.75)' }
          );
        }
        await sleep(2600);
        return;
      }
  
      for (let i = 0; i < feat.steps.length; i++) {
        if (!runRef.current) return;
        const step = feat.steps[i];
        const uid  = `${idx}-${i}`;
  
        if (step.from === 'ai') {
          setMessages(prev => [...prev, { ...step, typing: true, id: uid + 't' }]);
          await sleep(step.ms || 450);
          if (!runRef.current) return;
          setMessages(prev =>
            prev.map(m => m.id === uid + 't' ? { ...step, typing: false, id: uid } : m)
          );
          await sleep(150);
        } else {
          setMessages(prev => [...prev, { ...step, id: uid }]);
          await sleep(300);
        }
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
      await sleep(1000);
    }, []);
  
    const flipToNext = useCallback((card, nextIdx, onDone) => {
      const tl = gsap.timeline({ onComplete: onDone });
      tl.to(card, { rotateY: 180, scale: 0.82, filter: 'blur(8px)', duration: 0.45, ease: 'power2.inOut' })
        .call(() => setMessages([]))
        .call(() => setActiveIdx(nextIdx))
        .to(card, { rotateY: 0, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'elastic.out(1, 0.75)' });
    }, []);
  
    const cycle = useCallback(async () => {
      runRef.current = true;
      let idx = 0;
      while (runRef.current) {
        await runFeature(idx);
        if (!runRef.current) break;
        const next = (idx + 1) % LEGAL_STEPS.length;
        await new Promise(res => flipToNext(cardRef.current, next, res));
        idx = next;
      }
    }, [runFeature, flipToNext]);
  
    useEffect(() => {
      const card = cardRef.current;
      const glow = glowRef.current;
      if (!card || !glow) return;
  
      gsap.set(card, { scale: 0.82, opacity: 0, filter: 'blur(12px)', rotateY: 0 });
      gsap.set(glow, { opacity: 0, scale: 0.5 });
  
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
          once: true,
          onEnter: () => setTimeout(() => { setStarted(true); }, 700),
        },
      });
      tl.to(glow, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' })
        .to(card, { scale: 1.04, opacity: 1, filter: 'blur(0px)', duration: 0.45, ease: 'power3.out' }, '<0.1')
        .to(card, { scale: 1, duration: 0.22, ease: 'power2.inOut' });
      tl.to(glow, { scale: 1.1, opacity: 0.6, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  
      return () => {
        runRef.current = false;
        ScrollTrigger.getAll().forEach(st => { if (st.vars?.trigger === sectionRef.current) st.kill(); });
      };
    }, []);
  
    useEffect(() => {
      if (started) cycle();
      return () => { runRef.current = false; };
    }, [started, cycle]);
  
    const feat = LEGAL_STEPS[activeIdx];
    const FeatIcon = feat.icon;
  
    return (
      <section ref={sectionRef} id="ailegal-demo" style={{
        position: 'relative', padding: '100px 1.5rem 120px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        overflow: 'hidden',
        background: isDarkMode ? '#0b0b12' : '#F8FAFF',
      }}>
        {/* Ambient Glow */}
        <div ref={glowRef} style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 700, height: 500, borderRadius: '50%',
          background: `radial-gradient(ellipse,${feat.glow} 0%,rgba(99,102,241,0.1) 50%,transparent 100%)`,
          filter: 'blur(50px)', pointerEvents: 'none', zIndex: 1,
          transition: 'background 0.5s ease',
        }}/>
  
        {/* Label */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '5px 15px', borderRadius: 999,
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.28)',
          marginBottom: '1.25rem', zIndex: 10, position: 'relative',
        }}>
          <Scale size={11} style={{ color: '#818cf8' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#818cf8' }}>LEGAL AI NODE</span>
        </div>
  
        {/* Heading */}
        <h2 style={{
          fontSize: 'clamp(1.8rem,5vw,3.2rem)', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#0F172A',
          textAlign: 'center', marginBottom: '0.6rem',
          letterSpacing: '-0.03em', lineHeight: 1.1, zIndex: 10, position: 'relative',
        }}>
          See{' '}
          <span style={{
            background: 'linear-gradient(135deg,#6366f1,#a855f7,#ec4899)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>AILEGAL™</span>{' '}
          in Action
        </h2>
        <p style={{
          color: isDarkMode ? 'rgba(148,163,184,0.65)' : '#475569', fontSize: '1rem', textAlign: 'center',
          maxWidth: 500, lineHeight: 1.6, marginBottom: '3.5rem', position: 'relative', zIndex: 10,
        }}>
          AI-powered legal document analysis and risk profiling in seconds.
        </p>
  
        {/* Pipeline Steps Indicator */}
        <div style={{
          display: 'flex', gap: 6, marginBottom: '1.5rem', zIndex: 10, position: 'relative',
        }}>
          {LEGAL_STEPS.map((f, i) => {
            const TabIcon = f.icon;
            const isActive = i === activeIdx;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 16px', borderRadius: 999,
                background: isActive ? `${f.color}20` : (isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(15, 23, 42, 0.04)'),
                border: isActive ? `1px solid ${f.color}55` : (isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15, 23, 42, 0.08)'),
                color: isActive ? f.color : (isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(15, 23, 42, 0.35)'),
                fontSize: '0.7rem', fontWeight: isActive ? 800 : 500,
                transition: 'all 0.35s ease',
              }}>
                <TabIcon size={12} />
                <span style={{ display: window?.innerWidth < 640 ? 'none' : 'inline' }}>{f.label}</span>
              </div>
            );
          })}
        </div>
  
        {/* ── CARD ── */}
        <div
          ref={cardRef}
          style={{
            position: 'relative', zIndex: 10,
            width: '100%', maxWidth: 780,
            borderRadius: 24,
            background: isDarkMode 
              ? `linear-gradient(160deg, rgba(15,15,35,0.95) 0%, ${feat.bgAccent} 100%)`
              : `linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(238,242,255,0.95) 100%)`,
            border: isDarkMode ? `1px solid ${feat.color}33` : `1px solid ${feat.color}15`,
            backdropFilter: 'blur(40px)',
            overflow: 'hidden',
            boxShadow: isDarkMode 
              ? `0 0 70px ${feat.glow}, 0 30px 80px rgba(0,0,0,0.7)`
              : `0 20px 60px rgba(100,116,139,0.12)`,
            transition: 'all 0.5s ease',
            transformStyle: 'preserve-3d',
            perspective: '1200px',
          }}
        >
           {/* Chrome Bar */}
           <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '12px 20px', borderBottom: isDarkMode ? `1px solid rgba(255,255,255,0.05)` : `1px solid rgba(15,23,42,0.05)`,
            background: isDarkMode ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.6)',
          }}>
            {['#ff5f57','#febc2e','#28c840'].map((c,i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }}/>
            ))}
            <div style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
                AILEGAL.AISA.LAB
            </div>
           </div>
  
          <div
            ref={chatRef}
            style={{
              padding: '24px 24px',
              minHeight: 280, maxHeight: 320,
              overflowY: feat.type === 'title' ? 'hidden' : 'auto',
              display: 'flex', flexDirection: 'column',
              scrollBehavior: 'smooth',
            }}
            className="demo-scroll-thumb"
          >
            {feat.type === 'title' ? (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: '0 40px', gap: 20
              }}>
                <div style={{
                  width: 70, height: 70, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${feat.color}44, ${feat.color})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 50px ${feat.color}55`,
                  animation: 'pulse 2s infinite'
                }}>
                   <FeatIcon size={34} color="#fff" />
                </div>
                <h2 style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2.8rem)',
                  fontWeight: 900,
                  color: isDarkMode ? '#fff' : '#0F172A',
                  textShadow: isDarkMode ? `0 0 30px ${feat.color}66` : 'none',
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                }}>
                  {feat.text}
                </h2>
              </div>
            ) : (
              <>
                {messages.length === 0 && (
                  <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 10,
                    color: isDarkMode ? 'rgba(148,163,184,0.3)' : 'rgba(15,23,42,0.3)', paddingBottom: 10,
                  }}>
                    <FeatIcon size={26} style={{ color: feat.color, opacity: 0.35 }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>BOOTING {feat.label.toUpperCase()}...</span>
                  </div>
                )}
                {messages.map(msg => (
                  <Bubble key={msg.id} msg={msg} color={feat.color} isDarkMode={isDarkMode} />
                ))}
              </>
            )}
          </div>
  
          {/* Footer Input Area */}
          <div style={{
            padding: '12px 20px',
            background: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
            borderTop: isDarkMode ? `1px solid rgba(255,255,255,0.05)` : `1px solid rgba(15,23,42,0.05)`,
            display: 'flex', alignItems: 'center', gap: 12
          }}>
             <div style={{ flex: 1, height: 12, borderRadius: 6, background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
             <div style={{ width: 60, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${feat.color}, ${feat.color}dd)`, boxShadow: `0 0 15px ${feat.color}44` }} />
          </div>
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
        `}</style>
      </section>
    );
  };
  
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
  
  export default AiLegalDemoSection;
