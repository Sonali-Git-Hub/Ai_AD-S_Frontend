import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Search, ImageIcon, Video, Globe, Code2, ArrowRight,
  Bot, User, ExternalLink, Terminal, CheckCircle2, Sparkles, Zap
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

const NUM_SLIDES = 5;
import { useLanguage } from '../context/LanguageContext';

/* ════════════════════════════════════════════
   FEATURE-SPECIFIC DEMO PANELS
   ════════════════════════════════════════════ */

/* ── 1. Deep Search Panel ── */
const DeepSearchDemo = ({ active }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(0); // 0=idle 1=scanning 2=results
  const [dots, setDots] = useState(0);
  useEffect(() => {
    if (!active) { setStep(0); return; }
    let t;
    setStep(1);
    let d = 0;
    const dotInt = setInterval(() => { d = (d + 1) % 4; setDots(d); }, 250);
    t = setTimeout(() => {
      clearInterval(dotInt);
      setStep(2);
    }, 700);
    return () => { clearTimeout(t); clearInterval(dotInt); };
  }, [active]);

  const color = '#60a5fa';
  const results = [
    { src: 'MIT AI Lab', title: 'GPT-5 Reasoning Improvements 2025' },
    { src: 'Stanford HAI', title: 'Foundation Models & Multimodal AI' },
    { src: 'DeepMind', title: 'Gemini Ultra — Scaling Analysis' },
    { src: 'OpenAI Blog', title: 'Chain-of-Thought Self-Verification' },
  ];

  return (
    <div style={panelStyle('#60a5fa')}>
      <PanelChrome color={color} label={t('chat')} />
      <div style={{ flex: 1, padding: '14px 14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Query bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(96,165,250,0.08)', border: `1px solid ${color}30` }}>
          <Search size={13} style={{ color }} />
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{t('latestLLMBreakthroughs')}</span>
        </div>

        {step === 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(148,163,184,0.7)', fontSize: '0.75rem', padding: '4px 0' }}>
            <div style={{ width: 14, height: 14, border: `2px solid ${color}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'sfSpin 0.8s linear infinite' }} />
            {t('scanningSources')}
          </div>
        )}

        {step === 2 && results.map((r, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '9px 12px', borderRadius: 9,
            background: 'rgba(96,165,250,0.06)', border: `1px solid ${color}22`,
            animation: `sfBIn 0.3s ease ${i * 0.12}s both`,
          }}>
            <CheckCircle2 size={13} style={{ color, flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: color, fontWeight: 600, marginBottom: 2 }}>{r.src}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(203,213,225,0.8)', lineHeight: 1.4 }}>{r.title}</div>
            </div>
          </div>
        ))}

        {step === 2 && (
          <div style={{ marginTop: 4, padding: '8px 12px', borderRadius: 9, background: 'rgba(96,165,250,0.04)', border: `1px solid ${color}15`, animation: 'sfBIn 0.3s ease 0.5s both' }}>
            <div style={{ fontSize: '0.68rem', color: 'rgba(148,163,184,0.5)', marginBottom: 4 }}>{t('aiSummary')}</div>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(203,213,225,0.8)', lineHeight: 1.5 }}>
              GPT-5 chain-of-thought self-verification reduces hallucination by <span style={{ color, fontWeight: 700 }}>47%</span>. MoE scaling laws show efficiency gains.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── 2. Image Generation Panel ── */
const ImageGenDemo = ({ active }) => {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const color = '#a78bfa';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    if (!active) {
      ctx.clearRect(0, 0, W, H);
      return;
    }

    // Animate pixel-by-pixel reveal of a gradient "image"
    const pixels = [];
    const CELL = 6;
    const cols = Math.ceil(W / CELL), rows = Math.ceil(H / CELL);

    // Build gradient colors
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = c / cols, ny = r / rows;
        const R = Math.round(20 + nx * 60 + ny * 40);
        const G = Math.round(5 + nx * 20);
        const B = Math.round(80 + nx * 120 + ny * 60);
        pixels.push({ x: c * CELL, y: r * CELL, color: `rgb(${R},${G},${B})`, done: false });
      }
    }

    // Shuffle pixels for random fill
    for (let i = pixels.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pixels[i], pixels[j]] = [pixels[j], pixels[i]];
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0f0c29';
    ctx.fillRect(0, 0, W, H);

    let idx = 0;
    const BATCH = 100; // pixels per frame — fast fill

    const draw = () => {
      for (let b = 0; b < BATCH && idx < pixels.length; b++, idx++) {
        const p = pixels[idx];
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, CELL, CELL);
      }
      if (idx < pixels.length) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        // Add glow overlay
        const grad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.6);
        grad.addColorStop(0, 'rgba(167,139,250,0.0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        // Restart after pause
        setTimeout(() => {
          if (animRef.current !== null) {
            ctx.clearRect(0, 0, W, H);
            idx = 0;
            for (let i = pixels.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [pixels[i], pixels[j]] = [pixels[j], pixels[i]];
            }
            animRef.current = requestAnimationFrame(draw);
          }
        }, 1000);
      }
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    };
  }, [active]);

  return (
    <div style={panelStyle('#a78bfa')}>
      <PanelChrome color={color} label={t('imageGen')} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px', gap: 10 }}>
        {/* Prompt bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 10, background: 'rgba(167,139,250,0.08)', border: `1px solid ${color}30` }}>
          <Sparkles size={12} style={{ color }} />
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)' }}>{t('cyberpunkCityNight')}</span>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, borderRadius: 10, overflow: 'hidden', border: `1px solid ${color}25`, position: 'relative', minHeight: 0 }}>
          <canvas
            ref={canvasRef}
            width={400} height={220}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
          {active && (
            <div style={{
              position: 'absolute', bottom: 8, left: 8,
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '3px 9px', borderRadius: 999,
              background: 'rgba(0,0,0,0.6)', border: `1px solid ${color}40`,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, animation: 'sfPulse 1s infinite' }} />
              <span style={{ fontSize: '0.6rem', color, fontWeight: 700 }}>{t('generating')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── 3. Video Generation Panel ── */
const VideoGenDemo = ({ active }) => {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | rendering | done
  const color = '#f472b6';
  const intRef = useRef(null);

  useEffect(() => {
    if (!active) { setProgress(0); setPhase('idle'); return; }
    setPhase('rendering');
    setProgress(0);

    const tick = () => {
      setProgress(p => {
        if (p >= 100) {
          setPhase('done');
          clearInterval(intRef.current);
          setTimeout(() => { setProgress(0); setPhase('idle'); }, 1500);
          return 100;
        }
        return p + 3;
      });
    };
    intRef.current = setInterval(tick, 25);
    return () => clearInterval(intRef.current);
  }, [active]);

  const frames = [0,1,2,3,4,5];
  return (
    <div style={panelStyle('#f472b6')}>
      <PanelChrome color={color} label={t('videoGen')} />
      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Prompt */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 10, background: 'rgba(244,114,182,0.08)', border: `1px solid ${color}30` }}>
          <Video size={12} style={{ color }} />
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)' }}>{t('cinematicAiRobot')}</span>
        </div>

        {/* Video preview frames */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 }}>
          {frames.map((f, i) => {
            const revealed = phase === 'done' || (phase === 'rendering' && progress > (i * 16));
            return (
              <div key={i} style={{
                aspectRatio: '16/9', borderRadius: 6,
                background: revealed
                  ? `linear-gradient(${135 + i * 15}deg, rgba(${60 + i*10},0,${80 - i*5},1), rgba(${20 + i*8},0,${60 - i*4},1))`
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${revealed ? color + '40' : 'rgba(255,255,255,0.08)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.3s ease',
                position: 'relative', overflow: 'hidden',
              }}>
                {revealed && <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)' }}>{`${(i * 0.83).toFixed(1)}s`}</span>}
                {!revealed && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>
              {phase === 'done' ? `✅ ${t('renderComplete')}` : phase === 'rendering' ? t('renderingFrames') : t('awaitingPrompt')}
            </span>
            <span style={{ fontSize: '0.68rem', color, fontWeight: 700 }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              background: `linear-gradient(90deg, #f472b6, #a855f7)`,
              width: `${progress}%`, transition: 'width 0.06s linear',
              boxShadow: '0 0 8px rgba(244,114,182,0.5)',
            }} />
          </div>
        </div>

        {phase === 'done' && (
          <div style={{ padding: '8px 12px', borderRadius: 9, background: 'rgba(244,114,182,0.06)', border: `1px solid ${color}20`, animation: 'sfBIn 0.3s ease both' }}>
            <div style={{ fontSize: '0.7rem', color, fontWeight: 700, marginBottom: 2 }}>🎬 {t('videoReady')}</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(203,213,225,0.6)' }}>5s · 4K · 24fps · Orchestral Audio ✓</div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── 4. Web Browse Panel ── */
const WebBrowseDemo = ({ active }) => {
  const { t } = useLanguage();
  const [price, setPrice] = useState(67000);
  const [change, setChange] = useState(3.2);
  const [news, setNews] = useState([]);
  const color = '#2dd4bf';

  useEffect(() => {
    if (!active) { setNews([]); setPrice(67000); return; }
    // Simulate live price tick
    const int = setInterval(() => {
      setPrice(p => p + (Math.random() - 0.48) * 80);
      setChange(c => +(c + (Math.random() - 0.5) * 0.1).toFixed(2));
    }, 250);

    // News loads in one by one
    const headlines = [
      { src: 'CoinDesk', text: 'Bitcoin ETF inflows hit $2.1B this week' },
      { src: 'Bloomberg', text: '78% of analysts bullish on BTC in April' },
      { src: 'Reuters', text: 'Institutional buying pressure accelerating' },
    ];
    headlines.forEach((h, i) => {
      setTimeout(() => setNews(prev => [...prev, h]), 400 + i * 250);
    });

    return () => clearInterval(int);
  }, [active]);

  return (
    <div style={panelStyle('#2dd4bf')}>
      <PanelChrome color={color} label={t('webSearch')} />
      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
        {/* Price card */}
        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(45,212,191,0.07)', border: `1px solid ${color}25` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{t('btcLive')}</span>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'sfPulse 1s infinite' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f0fdf4', letterSpacing: '-0.02em' }}>
            ${Math.round(price).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: change >= 0 ? '#34d399' : '#f87171', marginTop: 2 }}>
            {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}% {t('todayLabel')}
          </div>
          {/* Mini chart bars */}
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', marginTop: 10, height: 30 }}>
            {[40,55,45,70,60,80,65,90,75,100].map((h, i) => (
              <div key={i} style={{
                flex: 1, height: `${h}%`, borderRadius: 2,
                background: `linear-gradient(180deg, ${color}, ${color}55)`,
                opacity: 0.7 + i * 0.03,
              }} />
            ))}
          </div>
        </div>

        {/* News */}
        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.08em' }}>{t('latestNews')}</div>
        {news.map((item, i) => (
          <div key={i} style={{
            padding: '7px 10px', borderRadius: 8,
            background: 'rgba(45,212,191,0.05)', border: `1px solid ${color}18`,
            animation: 'sfBIn 0.3s ease both',
          }}>
            <div style={{ fontSize: '0.62rem', color, fontWeight: 700, marginBottom: 2 }}>{item.src}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(203,213,225,0.8)' }}>{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── 5. Code Builder Panel ── */
const CodeBuilderDemo = ({ active }) => {
  const { t } = useLanguage();
  const [typed, setTyped] = useState('');
  const color = '#818cf8';
  const fullCode = `import requests, time
from bs4 import BeautifulSoup

def google_search(query, n=10):
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        r = requests.get(
            f"https://google.com/search?q={query}",
            headers=headers, timeout=10
        )
        time.sleep(1)  # rate limit
        soup = BeautifulSoup(r.text, "html.parser")
        return [
            x.text for x in
            soup.select(".LC20lb")
        ]
    except Exception as e:
        return {"error": str(e)}`;

  const intRef = useRef(null);
  useEffect(() => {
    if (!active) { setTyped(''); return; }
    setTyped('');
    let i = 0;
    intRef.current = setInterval(() => {
      if (i >= fullCode.length) {
        clearInterval(intRef.current);
        // Restart after delay
        setTimeout(() => {
          i = 0;
          setTyped('');
          intRef.current = setInterval(() => {
            i++;
            setTyped(fullCode.slice(0, i));
            if (i >= fullCode.length) clearInterval(intRef.current);
          }, 10);
        }, 1000);
        return;
      }
      i++;
      setTyped(fullCode.slice(0, i));
    }, 10); // 10ms per char = very fast typing
    return () => clearInterval(intRef.current);
  }, [active]);

  return (
    <div style={panelStyle('#818cf8')}>
      <PanelChrome color={color} label={t('codeBuilder')} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 12px', gap: 8 }}>
        {/* User query */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 10, background: 'rgba(129,140,248,0.08)', border: `1px solid ${color}30` }}>
          <Code2 size={12} style={{ color }} />
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)' }}>{t('pythonScraper')}</span>
        </div>

        {/* Code editor pane */}
        <div style={{ flex: 1, borderRadius: 10, background: 'rgba(5,5,20,0.9)', border: `1px solid ${color}25`, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Editor chrome */}
          <div style={{ padding: '6px 12px', background: 'rgba(99,102,241,0.1)', borderBottom: `1px solid ${color}15`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <Terminal size={10} style={{ color }} />
            <span style={{ fontSize: '0.62rem', color, fontWeight: 700 }}>scraper.py</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              {[color+'44', color+'66', color].map((c, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
              ))}
            </div>
          </div>

          {/* Code with line numbers */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', minHeight: 0 }}>
            {/* Line numbers */}
            <div style={{ padding: '10px 8px', background: 'rgba(0,0,0,0.2)', borderRight: `1px solid ${color}10`, flexShrink: 0, userSelect: 'none' }}>
              {typed.split('\n').map((_, i) => (
                <div key={i} style={{ fontSize: '0.6rem', color: 'rgba(148,163,184,0.3)', lineHeight: '1.55rem', textAlign: 'right', minWidth: 16 }}>
                  {i + 1}
                </div>
              ))}
            </div>
            {/* Code */}
            <pre style={{
              margin: 0, padding: '10px 12px',
              fontSize: '0.62rem', lineHeight: '1.55rem',
              color: '#a5b4fc', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              flex: 1,
            }}>
              <SyntaxHighlight code={typed} />
              <span style={{ borderLeft: `2px solid ${color}`, animation: 'sfBlink 1s step-end infinite', marginLeft: 1 }}>&nbsp;</span>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Tiny syntax highlight ── */
const SyntaxHighlight = ({ code }) => {
  const tokens = code.split(/(import|from|def|return|try|except|for|in|if|else)\b/);
  return (
    <>
      {tokens.map((tok, i) =>
        ['import','from','def','return','try','except','for','in','if','else'].includes(tok)
          ? <span key={i} style={{ color: '#c084fc' }}>{tok}</span>
          : <span key={i}>{tok}</span>
      )}
    </>
  );
};

/* ─── Shared panel shell ─── */
const panelStyle = (color) => ({
  height: '100%', display: 'flex', flexDirection: 'column',
  borderRadius: 16,
  background: 'rgba(8,8,22,0.9)',
  border: `1px solid ${color}33`,
  backdropFilter: 'blur(24px)',
  overflow: 'hidden',
  boxShadow: `0 0 50px ${color}22, 0 20px 60px rgba(0,0,0,0.5)`,
});

const PanelChrome = ({ color, label }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '9px 14px', borderBottom: `1px solid ${color}15`,
    background: 'rgba(0,0,0,0.25)', flexShrink: 0,
  }}>
    {['#ff5f57','#febc2e','#28c840'].map((c, i) => (
      <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
    ))}
    <div style={{
      flex: 1, textAlign: 'center',
      background: 'rgba(255,255,255,0.04)', borderRadius: 6,
      padding: '3px 10px', fontSize: '0.62rem',
      color: 'rgba(148,163,184,0.4)', maxWidth: 180, margin: '0 auto',
    }}>
      AISA™ — {label}
    </div>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 3,
      padding: '2px 7px', borderRadius: 999,
      background: `${color}12`, border: `1px solid ${color}30`,
      fontSize: '0.55rem', fontWeight: 700, color,
    }}>
      <span style={{ width: 3, height: 3, borderRadius: '50%', background: color, animation: 'sfPulse 1.2s infinite' }} />
      LIVE
    </div>
  </div>
);

/* ════════════════════════════════════════════
   Feature data
   ════════════════════════════════════════════ */
const features = [
  { id:0, title:'Deep Search',      description:'AI-powered deep internet research, going beyond simple results with comprehensive cited analysis.',  icon:Search,   bgFrom:'rgba(0,24,60,1)',   bgTo:'rgba(0,10,30,1)',  accentColor:'#60a5fa', accentGlow:'rgba(59,130,246,0.35)',  Demo:DeepSearchDemo  },
  { id:1, title:'Image Generation', description:"Transform text prompts into stunning visuals instantly with AISA™'s image generation engine.",          icon:ImageIcon, bgFrom:'rgba(30,0,60,1)',  bgTo:'rgba(15,0,35,1)', accentColor:'#a78bfa', accentGlow:'rgba(139,92,246,0.35)', Demo:ImageGenDemo    },
  { id:2, title:'Video Generation', description:'Create cinematic AI videos from text or images. The future of content creation is here.',              icon:Video,    bgFrom:'rgba(60,0,30,1)',  bgTo:'rgba(30,0,15,1)', accentColor:'#f472b6', accentGlow:'rgba(236,72,153,0.35)', Demo:VideoGenDemo    },
  { id:3, title:'Web Search',       description:'Smart AI web browsing that surfaces the most relevant real-time information instantly.',               icon:Globe,    bgFrom:'rgba(0,50,40,1)',  bgTo:'rgba(0,25,20,1)', accentColor:'#2dd4bf', accentGlow:'rgba(45,212,191,0.3)',   Demo:WebBrowseDemo   },
  { id:4, title:'Code Builder',     description:'Generate, explain, and debug code across any language with a powerful AI coding assistant.',           icon:Code2,    bgFrom:'rgba(10,10,60,1)', bgTo:'rgba(5,5,30,1)',  accentColor:'#818cf8', accentGlow:'rgba(99,102,241,0.35)', Demo:CodeBuilderDemo },
];

/* ════════════════════════════════════════════
   Main StackedFeatures
   ════════════════════════════════════════════ */
const StackedFeatures = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const normalizedTheme = typeof theme === 'string' ? theme.toLowerCase() : 'system';
  const isDarkMode = normalizedTheme === 'dark' || (normalizedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  const wrapperRef = useRef(null);
  const trackRef   = useRef(null);
  const [activeSlide, setActiveSlide] = useState(-1);

  useEffect(() => {
    let ctx = gsap.matchMedia();

    ctx.add("(min-width: 769px)", () => {
      // Desktop: Horizontal Scroll with Pinning
      gsap.to(trackRef.current, {
        xPercent: -((NUM_SLIDES - 1) * 100) / NUM_SLIDES,
        ease: 'none',
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: () => `+=${(NUM_SLIDES - 1) * window.innerWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter:     () => setActiveSlide(0),
          onLeaveBack: () => setActiveSlide(-1),
          onUpdate: (self) => {
            setActiveSlide(Math.round(self.progress * (NUM_SLIDES - 1)));
          },
        },
      });
    });

    ctx.add("(max-width: 768px)", () => {
      // Mobile: Vertical Stacking, no pin, no scrubbing
      gsap.set(trackRef.current, { 
        xPercent: 0, 
        width: "100%", 
        height: "auto", 
        flexDirection: "column",
        display: "flex"
      });
      gsap.set(wrapperRef.current, { 
        height: "auto", 
        overflow: "visible" 
      });

      const slides = gsap.utils.toArray(trackRef.current.children);
      slides.forEach((slide, index) => {
        gsap.set(slide, { width: "100%", height: "auto", minHeight: "100vh" });
        ScrollTrigger.create({
          trigger: slide,
          start: "top 60%",
          onEnter: () => setActiveSlide(index),
          onEnterBack: () => setActiveSlide(index)
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div style={{ overflow: 'hidden' }}>
      <div ref={wrapperRef} className="sf-wrapper" style={{ height: '100vh', overflow: 'hidden' }}>
        <div
          ref={trackRef}
          className="sf-track"
          style={{ display: 'flex', width: `${NUM_SLIDES * 100}vw`, height: '100vh', willChange: 'transform' }}
        >
          {features.map((feat, index) => {
            const featTranslateKeys = {
              'Deep Search': { title: 'deepSearch', desc: 'deepSearchDesc' },
              'Image Generation': { title: 'imageGenTitle', desc: 'imageGenLongDesc' },
              'Video Generation': { title: 'videoGenTitle', desc: 'videoGenLongDesc' },
              'Web Search': { title: 'webSearchTitle', desc: 'webSearchLongDesc' },
              'Code Builder': { title: 'codeBuilderTitle', desc: 'codeBuilderLongDesc' }
            };
            const Icon = feat.icon;
            const { Demo } = feat;
            const isActive = activeSlide === index;
            const translatedTitle = t(featTranslateKeys[feat.title]?.title || feat.title);
            const translatedDesc = t(featTranslateKeys[feat.title]?.desc || feat.description);

            return (
              <div
                key={feat.id}
                className="sf-slide"
                style={{
                  width: '100vw', height: '100vh', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', padding: '1rem',
                  background: isDarkMode 
                    ? `radial-gradient(circle at 15% 50%, ${feat.bgFrom} 0%, ${feat.bgTo} 100%)`
                    : `radial-gradient(circle at 15% 50%, #EEF2FF 0%, #F8FAFF 100%)`,
                  overflow: 'hidden',
                }}
              >
                {/* Glows */}
                <div className="sf-glow-1" style={{ position:'absolute', top:'10%', right:'-5%', width:'55vw', height:'70vh', borderRadius:'50%', background:`radial-gradient(circle,${feat.accentGlow} 0%,transparent 65%)`, filter:'blur(60px)', pointerEvents:'none' }}/>
                <div className="sf-glow-2" style={{ position:'absolute', bottom:'-10%', left:'5%', width:'40vw', height:'50vh', borderRadius:'50%', background:`radial-gradient(circle,${feat.accentGlow.replace('0.35','0.1').replace('0.3','0.08')} 0%,transparent 70%)`, filter:'blur(70px)', pointerEvents:'none' }}/>

                <div className="sf-content-grid" style={{ 
                  position:'relative', zIndex:10, 
                  display:'grid', 
                  gridTemplateColumns: 'minmax(400px, 1.2fr) 0.8fr', 
                  gap:'6vw', alignItems:'center', 
                  maxWidth:1400, width:'92%', 
                  height:'auto',
                  margin: '0 auto'
                }}>
                  {/* Text Container */}
                  <div className="sf-text-content" style={{ display:'flex', flexDirection:'column', gap:'1.5rem', textAlign: 'left' }}>
                    <div className="sf-icon-box" style={{ width:60, height:60, borderRadius:20, background:isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255, 255, 255, 0.4)', border:`1px solid ${feat.accentColor}55`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:isDarkMode ? `0 0 30px ${feat.accentGlow}` : `0 10px 25px ${feat.accentColor}20`, backdropFilter: isDarkMode ? 'none' : 'blur(12px)' }}>
                      <Icon size={28} style={{ color:feat.accentColor }} />
                    </div>
                    <h2 className="sf-title" style={{ 
                      fontSize:'clamp(2.5rem, 4.5vw, 4rem)', 
                      fontWeight:950, 
                      lineHeight:1, 
                      color:isDarkMode ? '#ffffff' : '#0F172A', 
                      letterSpacing:'-0.04em', 
                      margin:0,
                      maxWidth: '12ch'
                    }}>
                      {translatedTitle}
                    </h2>
                    <p className="sf-description" style={{ 
                      fontSize:'clamp(1rem, 1.1vw, 1.15rem)', 
                      color:isDarkMode ? 'rgba(203,213,225,0.65)' : '#475569', 
                      lineHeight:1.7, 
                      maxWidth:480, 
                      margin:0,
                      fontWeight: 450
                    }}>
                      {translatedDesc}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1rem' }}>
                      <button 
                        onClick={() => {
                          const modeMap = {
                            'Deep Search': 'deepsearch',
                            'Image Generation': 'imagegen',
                            'Video Generation': 'videogen',
                            'Web Search': 'websearch',
                            'Code Builder': 'coding'
                          };
                          const mode = modeMap[feat.title] || 'chat';
                          navigate(`/dashboard/chat?mode=${mode}`);
                        }}
                        className="sf-button" style={{ 
                        display:'inline-flex', alignItems:'center', gap:12, padding:'14px 32px', borderRadius:18, 
                        background:isDarkMode ? feat.accentColor : feat.accentColor, 
                        color: '#fff', fontWeight:800, fontSize:'0.95rem', cursor:'pointer', 
                        border: 'none',
                        boxShadow: `0 15px 35px ${feat.accentColor}40`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}>
                        {t('tryFeature')} {translatedTitle} <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Animated Demo */}
                  <div className="sf-demo-container" style={{ 
                    height:'500px', 
                    width: '100%',
                    position: 'relative'
                  }}>
                    <Demo active={isActive} />
                  </div>
                </div>

                {/* Progress dots */}
                <div style={{ position:'absolute', bottom:'2rem', left:'50%', transform:'translateX(-50%)', display:'flex', gap:8, alignItems:'center' }}>
                  {features.map((_,i) => (
                    <div key={i} style={{ height:3, borderRadius:2, width:i===index?28:7, background:i===index?feat.accentColor:'rgba(255,255,255,0.2)', transition:'all 0.4s ease' }}/>
                  ))}
                </div>

                {/* Big bg number */}
                <div className="sf-bg-number" style={{ position:'absolute', right:'-1rem', bottom:'-2rem', fontSize:'18rem', fontWeight:900, lineHeight:1, color:isDarkMode ? 'rgba(255,255,255,0.025)' : 'rgba(79, 70, 229, 0.04)', userSelect:'none', pointerEvents:'none', zIndex:0 }}>
                  {String(index+1).padStart(2,'0')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes sfBIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sfPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.6)} }
        @keyframes sfSpin { to{transform:rotate(360deg)} }
        @keyframes sfBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes sfvp { from{transform:scaleX(0);transform-origin:left} to{transform:scaleX(1);transform-origin:left} }

        /* Mobile Optimization */
        @media (max-width: 900px) {
          .sf-content-grid {
            grid-template-columns: 1fr !important;
            height: 90vh !important;
            gap: 2rem !important;
            padding-top: 5rem !important;
            text-align: center;
          }
          .sf-text-content {
            align-items: center;
            order: 1;
          }
          .sf-demo-container {
            order: 2;
            height: 35vh !important;
            min-height: 250px !important;
            width: 100%;
          }
          .sf-title {
            font-size: 2.8rem !important;
          }
          .sf-bg-number {
            font-size: 10rem !important;
            bottom: 2rem !important;
            right: 0 !important;
          }
        }
        @media (max-width: 600px) {
          .sf-title {
            font-size: 2.2rem !important;
          }
          .sf-description {
            font-size: 0.85rem !important;
            line-height: 1.5 !important;
          }
          .sf-content-grid {
            padding-top: 4rem !important;
            height: 85vh !important;
          }
          .sf-demo-container {
            height: 30vh !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StackedFeatures;
