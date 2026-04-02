import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Bot, User, Search, ImageIcon, Video, Globe, Code2, Zap,
  Sparkles, ExternalLink, Terminal, ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

/* ─── Feature scripts — very fast timing ─── */
const FEATURES = [
  {
    id: 'intro',
    label: 'Intro',
    icon: Sparkles,
    color: '#818cf8',
    glow: 'rgba(99,102,241,0.5)',
    bgAccent: 'rgba(30,27,75,0.4)',
    type: 'title',
    text: 'HOW DOES AISA WORKS',
    steps: [],
  },
  {
    id: 0,
    label: 'Deep Search',
    icon: Search,
    color: '#60a5fa',
    glow: 'rgba(59,130,246,0.4)',
    bgAccent: 'rgba(30,58,138,0.3)',
    steps: [
      { from: 'user', text: 'Research latest LLM breakthroughs in 2025.' },
      { from: 'ai',   text: '🔍 Scanning 200+ sources…', typing: true, ms: 450 },
      { from: 'ai',   text: '📄 63 papers found:\n• GPT-5 reasoning +47%\n• MoE scaling laws\n• Multimodal alignment', card: 'search', ms: 150 },
      { from: 'user', text: 'Summarize the top finding.' },
      { from: 'ai',   text: '🧠 Chain-of-thought self-verification reduces hallucination by 47%.', ms: 400 },
    ],
  },
  {
    id: 1,
    label: 'Image Gen',
    icon: ImageIcon,
    color: '#a78bfa',
    glow: 'rgba(139,92,246,0.4)',
    bgAccent: 'rgba(76,29,149,0.3)',
    steps: [
      { from: 'user', text: 'Generate a cyberpunk city at night.' },
      { from: 'ai',   text: '🎨 Generating with AISA Image Engine…', typing: true, ms: 450 },
      { from: 'ai',   text: '✅ Image ready!', card: 'image', ms: 150 },
      { from: 'user', text: 'Add pink and blue neon tones.' },
      { from: 'ai',   text: '🎨 Re-rendering with neon palette…', typing: true, ms: 400 },
      { from: 'ai',   text: '✅ Updated version generated!', card: 'image2', ms: 150 },
    ],
  },
  {
    id: 2,
    label: 'Video Gen',
    icon: Video,
    color: '#f472b6',
    glow: 'rgba(236,72,153,0.4)',
    bgAccent: 'rgba(131,24,67,0.3)',
    steps: [
      { from: 'user', text: 'Create a 5s cinematic AI robot in space.' },
      { from: 'ai',   text: '🎬 Rendering frames 0%…', typing: true, ms: 380 },
      { from: 'ai',   text: '⏳ 40%… 75%… 100% ✅', typing: true, ms: 420 },
      { from: 'ai',   text: '🎬 Video ready! 5s · 4K · 24fps', card: 'video', ms: 150 },
      { from: 'user', text: 'Add orchestral music.' },
      { from: 'ai',   text: '🎵 Audio layer added. Final export done!', ms: 350 },
    ],
  },
  {
    id: 3,
    label: 'Web Browse',
    icon: Globe,
    color: '#2dd4bf',
    glow: 'rgba(45,212,191,0.4)',
    bgAccent: 'rgba(19,78,74,0.3)',
    steps: [
      { from: 'user', text: 'Current Bitcoin price and market sentiment?' },
      { from: 'ai',   text: '🌐 Browsing live data…', typing: true, ms: 380 },
      { from: 'ai',   text: '📊 BTC: $67,420 (+3.2%)\n🟢 Sentiment: Bullish\nETF inflows: $2.1B this week', card: 'web', ms: 150 },
      { from: 'user', text: 'Price prediction next month?' },
      { from: 'ai',   text: '📈 78% analysts bullish.\nTarget: $70K–$80K by April.', ms: 380 },
    ],
  },
  {
    id: 4,
    label: 'Code AI',
    icon: Code2,
    color: '#818cf8',
    glow: 'rgba(99,102,241,0.4)',
    bgAccent: 'rgba(49,46,129,0.3)',
    steps: [
      { from: 'user', text: 'Write a Python Google scraper function.' },
      { from: 'ai',   text: '💻 Writing code…', typing: true, ms: 420 },
      { from: 'ai',   text: '', card: 'code', ms: 150 },
      { from: 'user', text: 'Add error handling + rate limiting.' },
      { from: 'ai',   text: '🔧 Added try/except + 1s delay. ✅', ms: 350 },
    ],
  },
  {
    id: 'outro',
    label: 'Finish',
    icon: Sparkles,
    color: '#ffffff',
    glow: 'rgba(236,72,153,0.5)',
    bgAccent: 'rgba(70,20,50,0.4)',
    type: 'title',
    text: 'ONE AI ANYTHING IS POSSIBLE',
    steps: [],
  },
];

const CODE_SNIPPET = `import requests, time
from bs4 import BeautifulSoup

def search(query, n=10):
  headers = {"User-Agent": "Mozilla/5.0"}
  try:
    r = requests.get(
      f"https://google.com/search?q={query}&num={n}",
      headers=headers, timeout=10
    )
    soup = BeautifulSoup(r.text, "html.parser")
    time.sleep(1)  # rate limit
    return [x.text for x in soup.select(".LC20lb")]
  except Exception as e:
    return {"error": str(e)}`;

/* ── Result cards ── */
const Card = ({ type, isDarkMode }) => {
  if (type === 'search') return (
    <div style={{ marginTop: 8, background: isDarkMode ? 'rgba(96,165,250,0.08)' : 'rgba(96,165,250,0.15)', border: isDarkMode ? '1px solid rgba(96,165,250,0.2)' : '1px solid rgba(96,165,250,0.4)', borderRadius: 8, padding: '8px 12px' }}>
      {['MIT AI Lab — LLM Reasoning 2025', 'Stanford HAI — Foundation Models', 'DeepMind — Gemini Ultra'].map((t, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: i < 2 ? 4 : 0 }}>
          <ExternalLink size={10} style={{ color: isDarkMode ? '#60a5fa' : '#3b82f6', flexShrink: 0 }} />
          <span style={{ fontSize: '0.72rem', color: isDarkMode ? '#93c5fd' : '#1e40af', fontWeight: isDarkMode ? 400 : 500 }}>{t}</span>
        </div>
      ))}
    </div>
  );
  if (type === 'image' || type === 'image2') return (
    <div style={{
      marginTop: 8, height: 90, borderRadius: 8,
      background: isDarkMode 
        ? (type === 'image' ? 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' : 'linear-gradient(135deg,#6a0572,#11998e,#1a1a2e)')
        : (type === 'image' ? 'linear-gradient(135deg,rgba(167,139,250,0.1),rgba(139,92,246,0.15))' : 'linear-gradient(135deg,rgba(45,212,191,0.15),rgba(16,185,129,0.15))'),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid rgba(167,139,250,0.2)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(255,0,150,0.1),rgba(0,150,255,0.1))' }} />
      <Sparkles size={22} style={{ color: isDarkMode ? '#c4b5fd' : '#6d28d9', position: 'relative', zIndex: 1 }} />
      <span style={{ marginLeft: 6, color: isDarkMode ? '#c4b5fd' : '#4f46e5', fontSize: '0.75rem', fontWeight: 600, position: 'relative', zIndex: 1 }}>
        {type === 'image' ? 'Cyberpunk City' : 'Neon Edition'}
      </span>
    </div>
  );
  if (type === 'video') return (
    <div style={{
      marginTop: 8, height: 70, borderRadius: 8,
      background: isDarkMode ? 'linear-gradient(135deg,rgba(50,0,30,1),rgba(15,0,50,1))' : 'linear-gradient(135deg,rgba(244,114,182,0.1),rgba(219,39,119,0.1))',
      border: isDarkMode ? '1px solid rgba(244,114,182,0.2)' : '1px solid rgba(244,114,182,0.3)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 16px',
    }}>
      <div style={{ width: '100%', height: 3, background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg,#f472b6,#a855f7)', borderRadius: 2, animation: 'vprog 2s ease-out forwards' }} />
      </div>
      <span style={{ fontSize: '0.7rem', color: isDarkMode ? 'rgba(244,114,182,0.8)' : '#be185d', fontWeight: 600 }}>▶ 5s · 4K · 24fps · +Audio</span>
    </div>
  );
  if (type === 'web') return (
    <div style={{ marginTop: 8, background: isDarkMode ? 'rgba(45,212,191,0.07)' : 'rgba(45,212,191,0.15)', border: isDarkMode ? '1px solid rgba(45,212,191,0.2)' : '1px solid rgba(45,212,191,0.4)', borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isDarkMode ? '#6ee7b7' : '#047857' }}>BTC/USD</span>
        <span style={{ fontSize: '0.73rem', color: isDarkMode ? '#34d399' : '#059669', fontWeight: 700 }}>$67,420 ▲3.2%</span>
      </div>
      <div style={{ height: 28, background: isDarkMode ? 'rgba(45,212,191,0.08)' : 'rgba(45,212,191,0.1)', borderRadius: 5, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
        <span style={{ fontSize: '0.68rem', color: isDarkMode ? 'rgba(45,212,191,0.5)' : '#0f766e', fontWeight: isDarkMode ? 400 : 500 }}>Live chart ↗ CoinGecko</span>
      </div>
    </div>
  );
  if (type === 'code') return (
    <div style={{ marginTop: 8, background: isDarkMode ? 'rgba(5,5,20,0.9)' : 'rgba(238,242,255,1)', border: isDarkMode ? '1px solid rgba(129,140,248,0.2)' : '1px solid rgba(129,140,248,0.4)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '5px 10px', background: isDarkMode ? 'rgba(99,102,241,0.1)' : 'rgba(129,140,248,0.2)', display: 'flex', alignItems: 'center', gap: 5, borderBottom: isDarkMode ? '1px solid rgba(129,140,248,0.1)' : '1px solid rgba(129,140,248,0.2)' }}>
        <Terminal size={10} style={{ color: isDarkMode ? '#818cf8' : '#4338ca' }} />
        <span style={{ fontSize: '0.65rem', color: isDarkMode ? '#818cf8' : '#4338ca', fontWeight: 600 }}>python</span>
      </div>
      <pre style={{ margin: 0, padding: '8px 10px', fontSize: '0.62rem', color: isDarkMode ? '#a5b4fc' : '#312e81', fontWeight: 500, lineHeight: 1.55, whiteSpace: 'pre-wrap', overflowX: 'hidden' }}>{CODE_SNIPPET}</pre>
    </div>
  );
  return null;
};

/* ── Typing dots ── */
const Dots = ({ color }) => (
  <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', height: 14 }}>
    {[0,1,2].map(i => (
      <span key={i} style={{
        display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
        background: color, animation: `td 1s ease-in-out ${i*0.15}s infinite`,
      }}/>
    ))}
  </span>
);

/* ── Bubble ── */
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
        {msg.typing ? <Dots color={color} /> : (msg.text || '')}
        {!msg.typing && msg.card && <Card type={msg.card} isDarkMode={isDarkMode} />}
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

/* ─────────────────── Main Component ─────────────────── */
const DemoSection = () => {
  const { theme } = useTheme();
  const normalizedTheme = typeof theme === 'string' ? theme.toLowerCase() : 'system';
  const isDarkMode = normalizedTheme === 'dark' || (normalizedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  const sectionRef = useRef(null);
  const cardRef    = useRef(null);
  const glowRef    = useRef(null);
  const chatRef    = useRef(null);

  const [activeIdx, setActiveIdx]   = useState(0);
  const [messages, setMessages]     = useState([]);
  const [started, setStarted]       = useState(false);
  const runRef = useRef(false);

  /* Run one feature's chat sequence */
  const runFeature = useCallback(async (idx) => {
    const feat = FEATURES[idx];
    setActiveIdx(idx);
    setMessages([]);

    if (feat.type === 'title') {
      // Boom effect for the intro slide
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
        // Show typing
        setMessages(prev => [...prev, { ...step, typing: true, id: uid + 't' }]);
        await sleep(step.ms || 450);
        if (!runRef.current) return;
        // Settle
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

    await sleep(700); // pause before flip
  }, []);

  /* 3D flip between features */
  const flipToNext = useCallback((card, nextIdx, onDone) => {
    const tl = gsap.timeline({ onComplete: onDone });
    // Flip out — front half
    tl.to(card, { rotateY: 90, scale: 0.94, duration: 0.15, ease: 'power2.in' })
    // Swap content (happens at 90deg — invisible)
      .call(() => setMessages([]))
      .call(() => setActiveIdx(nextIdx))
    // Flip in — back half
      .to(card, { rotateY: 0, scale: 1, duration: 0.15, ease: 'power2.out' });
  }, []);

  /* Infinite cycle */
  const cycle = useCallback(async () => {
    runRef.current = true;
    let idx = 0;
    while (runRef.current) {
      await runFeature(idx);
      if (!runRef.current) break;
      const next = (idx + 1) % FEATURES.length;
      // Do flip, then run next feature
      await new Promise(res => flipToNext(cardRef.current, next, res));
      idx = next;
    }
  }, [runFeature, flipToNext]);

  /* Boom reveal on scroll */
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (started) cycle();
    return () => { runRef.current = false; };
  }, [started, cycle]);

  const feat = FEATURES[activeIdx];
  const FeatIcon = feat.icon;

  return (
    <section ref={sectionRef} style={{
      position: 'relative', padding: '100px 1.5rem 120px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflow: 'hidden',
      background: isDarkMode 
        ? 'linear-gradient(180deg,rgba(6,6,18,0.99) 0%,rgba(3,3,10,1) 100%)'
        : 'linear-gradient(180deg,#F8FAFF 0%,#EEF2FF 100%)',
    }}>
      {/* Label */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '5px 15px', borderRadius: 999,
        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.28)',
        marginBottom: '1.25rem', zIndex: 10, position: 'relative',
      }}>
        <Zap size={11} style={{ color: '#818cf8' }} />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#818cf8' }}>LIVE DEMO</span>
      </div>

      {/* Heading */}
      <h2 style={{
        fontSize: 'clamp(1.8rem,5vw,3.2rem)', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#0F172A',
        textAlign: 'center', marginBottom: '0.6rem',
        letterSpacing: '-0.03em', lineHeight: 1.1, zIndex: 10, position: 'relative',
      }}>
        See AISA{' '}
        <span style={{
          background: 'linear-gradient(135deg,#4F46E5,#7C3AED,#EC4899)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>in Action</span>
      </h2>
      <p style={{
        color: isDarkMode ? 'rgba(148,163,184,0.65)' : '#475569', fontSize: '0.95rem', textAlign: 'center',
        maxWidth: 440, lineHeight: 1.6, marginBottom: '2.8rem', position: 'relative', zIndex: 10,
      }}>
        Every feature flips automatically — watch the full demo.
      </p>

      {/* Ambient glow */}
      <div ref={glowRef} style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 700, height: 500, borderRadius: '50%',
        background: `radial-gradient(ellipse,${feat.glow} 0%,rgba(168,85,247,0.1) 50%,transparent 100%)`,
        filter: 'blur(50px)', pointerEvents: 'none', zIndex: 1,
        transition: 'background 0.5s ease',
      }}/>

      {/* Feature indicator pills — above card */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: '1.2rem', zIndex: 10, position: 'relative',
      }}>
        {FEATURES.map((f, i) => {
          const TabIcon = f.icon;
          const isActive = i === activeIdx;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 12px', borderRadius: 999,
              background: isActive ? `${f.color}20` : (isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(15, 23, 42, 0.04)'),
              border: isActive ? `1px solid ${f.color}55` : (isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15, 23, 42, 0.08)'),
              color: isActive ? f.color : (isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(15, 23, 42, 0.35)'),
              fontSize: '0.68rem', fontWeight: isActive ? 700 : 400,
              transition: 'all 0.35s ease',
            }}>
              <TabIcon size={11} />
              <span style={{ display: window?.innerWidth < 600 ? 'none' : 'inline' }}>{f.label}</span>
              {isActive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: f.color, animation: 'pulse 1.2s infinite' }} />}
            </div>
          );
        })}
      </div>

      {/* ── DEMO CARD (flip target) ── */}
      <div
        ref={cardRef}
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: 840,
          borderRadius: 20,
          background: isDarkMode 
            ? `linear-gradient(160deg, rgba(15,15,35,0.95) 0%, ${feat.bgAccent} 100%)`
            : `linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(238,242,255,0.95) 100%)`,
          border: isDarkMode ? `1px solid ${feat.color}33` : `1px solid ${feat.color}15`,
          backdropFilter: 'blur(40px)',
          overflow: 'hidden',
          boxShadow: isDarkMode 
            ? `0 0 70px ${feat.glow}, 0 30px 80px rgba(0,0,0,0.7)`
            : `0 20px 60px rgba(100,116,139,0.12)`,
          transition: 'box-shadow 0.5s ease, border-color 0.5s ease, background 0.5s ease',
          transformStyle: 'preserve-3d',
          perspective: '1200px',
        }}
      >
        {/* Chrome bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '11px 16px', borderBottom: isDarkMode ? `1px solid ${feat.color}20` : `1px solid ${feat.color}15`,
          background: isDarkMode ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.6)',
          borderTopLeftRadius: 20, borderTopRightRadius: 20
        }}>
          {['#ff5f57','#febc2e','#28c840'].map((c,i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }}/>
          ))}
          <div style={{
            flex: 1, textAlign: 'center',
            background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)', borderRadius: 7,
            padding: '3px 12px', fontSize: '0.68rem',
            color: isDarkMode ? 'rgba(148,163,184,0.5)' : '#475569', maxWidth: 220, margin: '0 auto',
            fontWeight: 500
          }}>
            aisa.ai — AI Workspace
          </div>
          {/* Live badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 999,
            background: `${feat.color}18`, border: `1px solid ${feat.color}40`,
            fontSize: '0.6rem', fontWeight: 700, color: feat.color,
          }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: feat.color, animation: 'pulse 1.2s infinite' }}/>
            LIVE
          </div>
        </div>

        {/* Feature header row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 16px', borderBottom: isDarkMode ? `1px solid rgba(255,255,255,0.05)` : `1px solid rgba(15,23,42,0.05)`,
          background: isDarkMode ? `${feat.color}08` : `${feat.color}05`,
        }}>
          <FeatIcon size={14} style={{ color: feat.color }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: feat.color, letterSpacing: '0.1em' }}>
            {feat.label.toUpperCase()}
          </span>
          <ChevronRight size={12} style={{ color: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)' }} />
          <span style={{ fontSize: '0.68rem', color: isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.4)', fontWeight: 500 }}>
            {activeIdx + 1} of {FEATURES.length}
          </span>
          {/* Progress track */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            {FEATURES.map((_, i) => (
              <div key={i} style={{
                height: 3, borderRadius: 2,
                width: i === activeIdx ? 24 : 6,
                background: i === activeIdx ? feat.color : (isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.1)'),
                transition: 'all 0.4s ease',
              }}/>
            ))}
          </div>
        </div>

        {/* Chat body */}
        <div
          ref={chatRef}
          style={{
            padding: '14px 16px 16px',
            minHeight: 260, maxHeight: 300,
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
              textAlign: 'center', padding: '0 40px', gap: 16
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: `linear-gradient(135deg, ${feat.color}44, ${feat.color})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 40px ${feat.color}44`,
                animation: 'pulse 2s infinite'
              }}>
                 <FeatIcon size={30} color="#fff" />
              </div>
              <h2 style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.3rem)',
                fontWeight: 900,
                color: isDarkMode ? '#fff' : '#0F172A',
                textShadow: isDarkMode ? `0 0 30px ${feat.color}66` : 'none',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
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
                  color: isDarkMode ? 'rgba(148,163,184,0.25)' : 'rgba(15,23,42,0.3)', paddingBottom: 10,
                }}>
                  <FeatIcon size={26} style={{ color: feat.color, opacity: 0.35 }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>Starting {feat.label}…</span>
                </div>
              )}
              {messages.map(msg => (
                <Bubble key={msg.id} msg={msg} color={feat.color} isDarkMode={isDarkMode} />
              ))}
            </>
          )}
        </div>

        {/* Input */}
        <div style={{
          padding: '10px 14px',
          borderTop: isDarkMode ? `1px solid ${feat.color}18` : `1px solid ${feat.color}12`,
          display: 'flex', gap: 8, alignItems: 'center',
          background: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
        }}>
          <div style={{
            flex: 1, padding: '8px 12px', borderRadius: 10,
            background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.8)',
            border: isDarkMode ? `1px solid ${feat.color}22` : `1px solid ${feat.color}25`,
            color: isDarkMode ? 'rgba(148,163,184,0.3)' : '#475569', fontSize: '0.78rem',
            fontWeight: 500,
          }}>
            Message AISA…
          </div>
          <button style={{
            padding: '8px 16px', borderRadius: 10, border: 'none',
            background: `linear-gradient(135deg,${feat.color}cc,${feat.color})`,
            color: '#fff', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
            boxShadow: `0 0 14px ${feat.glow}`,
            transition: 'all 0.4s ease',
          }}>
            Send
          </button>
        </div>
      </div>

      <style>{`
        @keyframes td {
          0%,70%,100%{transform:scale(1);opacity:0.35}
          35%{transform:scale(1.7);opacity:1}
        }
        @keyframes bIn {
          from{opacity:0;transform:translateY(8px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes pulse {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:0.4;transform:scale(0.6)}
        }
        @keyframes vprog {
          from{transform:scaleX(0);transform-origin:left}
          to{transform:scaleX(1);transform-origin:left}
        }
        div[ref] div::-webkit-scrollbar{width:3px}
        .demo-scroll-thumb::-webkit-scrollbar-thumb{background:${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.1)'};border-radius:3px}
      `}</style>
    </section>
  );
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export default DemoSection;
