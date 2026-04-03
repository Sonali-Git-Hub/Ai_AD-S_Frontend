import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Brain, MessageSquare, ShieldCheck, Sparkles, Zap, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    id: 0,
    label: '01',
    title: 'Next-Gen Intelligence',
    subtitle: 'AISA Core Engine',
    description:
      'Powered by frontier language models, AISA reasons, plans, and executes complex tasks with human-level understanding across every domain.',
    icon: Brain,
    accent: '#60a5fa',
    glow: 'rgba(59,130,246,0.5)',
    badge: 'GPT-5 Powered',
    badgeIcon: Zap,
    gradient: 'linear-gradient(135deg,rgba(15,30,70,0.95) 0%,rgba(5,15,40,0.98) 100%)',
    highlights: ['Autonomous reasoning', 'Multi-step planning', 'Real-time learning'],
  },
  {
    id: 1,
    label: '02',
    title: 'Natural Interaction',
    subtitle: 'Conversational AI',
    description:
      'Engage in fluid, context-aware conversations. AISA understands nuance, remembers context, and responds with precision and personality.',
    icon: MessageSquare,
    accent: '#a78bfa',
    glow: 'rgba(139,92,246,0.5)',
    badge: 'Multi-modal',
    badgeIcon: Sparkles,
    gradient: 'linear-gradient(135deg,rgba(35,10,70,0.95) 0%,rgba(18,5,40,0.98) 100%)',
    highlights: ['Context memory', 'Voice & text', 'Emotion aware'],
  },
  {
    id: 2,
    label: '03',
    title: 'Privacy First',
    subtitle: 'Enterprise Security',
    description:
      'Your data stays yours. End-to-end encryption, zero data retention, and on-premise deployment options ensure complete confidentiality.',
    icon: ShieldCheck,
    accent: '#2dd4bf',
    glow: 'rgba(45,212,191,0.5)',
    badge: 'SOC 2 Certified',
    badgeIcon: Lock,
    gradient: 'linear-gradient(135deg,rgba(0,40,35,0.95) 0%,rgba(0,20,18,0.98) 100%)',
    highlights: ['Zero data retention', 'E2E encryption', 'On-premise option'],
  },
];

/* Stacked positions — back to front */
const STACKED = [
  { x: 60,  y: -28, z: -120, rotY:  18, rotX: -4, scale: 0.82, opacity: 0.7  }, // back
  { x: 28,  y: -12, z:  -55, rotY:   9, rotX: -2, scale: 0.91, opacity: 0.85 }, // mid
  { x:  0,  y:   0, z:    0, rotY:   0, rotX:  0, scale: 1.00, opacity: 1.0  }, // front
];

/* Spread positions */
const SPREAD = [
  { x: -380, y: 0, z:  20, rotY:  6, rotX: 0, scale: 0.96, opacity: 1 },
  { x:    0, y: 0, z:  40, rotY:  0, rotX: 0, scale: 1.00, opacity: 1 },
  { x:  380, y: 0, z:  20, rotY: -6, rotX: 0, scale: 0.96, opacity: 1 },
];

const Card = ({ card, cardRef, isDarkMode }) => {
  const Icon      = card.icon;
  const BadgeIcon = card.badgeIcon;
  return (
    <div
      ref={cardRef}
      style={{
        position: 'absolute',
        width: 340,
        minHeight: 440,
        borderRadius: 24,
        background: isDarkMode 
          ? card.gradient 
          : 'linear-gradient(135deg, rgba(248, 250, 255, 0.9) 0%, rgba(238, 242, 255, 0.95) 100%)', // Matches Hero bg (#F8FAFF to #EEF2FF)
        border: isDarkMode ? `1px solid ${card.accent}30` : `1px solid ${card.accent}15`,
        backdropFilter: 'blur(12px)',
        boxShadow: isDarkMode 
          ? `0 0 60px ${card.glow}, 0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)`
          : `0 20px 50px rgba(79,70,229,0.08), inset 0 1px 0 rgba(255,255,255,0.8)`,
        cursor: 'default',
        padding: '32px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        userSelect: 'none',
        willChange: 'transform',
        transformOrigin: 'center center',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {/* Icon orb */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: isDarkMode ? `linear-gradient(135deg,${card.accent}22,${card.accent}44)` : `linear-gradient(135deg,${card.accent}12,${card.accent}24)`,
          border: isDarkMode ? `1px solid ${card.accent}50` : `1px solid ${card.accent}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isDarkMode ? `0 0 20px ${card.glow}` : `0 10px 25px ${card.accent}20`,
        }}>
          <Icon size={26} style={{ color: card.accent }} />
        </div>

        {/* Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 12px', borderRadius: 999,
          background: isDarkMode ? `${card.accent}14` : `${card.accent}0A`,
          border: isDarkMode ? `1px solid ${card.accent}35` : `1px solid ${card.accent}25`,
          fontSize: '0.65rem', fontWeight: 700, color: isDarkMode ? card.accent : '#4F46E5',
          letterSpacing: '0.05em',
        }}>
          <card.badgeIcon size={10} color={isDarkMode ? undefined : '#4F46E5'} />
          {card.badge}
        </div>
      </div>

      {/* Subtitle */}
      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: isDarkMode ? card.accent : '#6366F1', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {card.subtitle}
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: '1.65rem', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#0F172A',
        lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0,
      }}>
        {card.title}
      </h3>

      {/* Description */}
      <p style={{ fontSize: '0.88rem', color: isDarkMode ? 'rgba(203,213,225,0.72)' : '#334155', lineHeight: 1.7, margin: 0 }}>
        {card.description}
      </p>

      {/* Highlights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
        {card.highlights.map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: isDarkMode ? card.accent : '#4F46E5',
              boxShadow: isDarkMode ? `0 0 8px ${card.glow}` : 'none',
            }} />
            <span style={{ 
              fontSize: '0.82rem', 
              color: isDarkMode ? 'rgba(226,232,240,0.8)' : '#334155', 
              fontWeight: 500 
            }}>{h}</span>
          </div>
        ))}
      </div>

      {/* Bottom accent bar */}
      <div style={{ marginTop: 'auto', paddingTop: 20 }}>
        <div style={{
          height: 3, borderRadius: 2,
          background: isDarkMode ? `linear-gradient(90deg,${card.accent},${card.accent}33)` : `linear-gradient(90deg,${card.accent},${card.accent}20)`,
          boxShadow: `0 0 12px ${card.accent}44`,
        }} />
      </div>

      {/* Large bg label */}
      <div style={{
        position: 'absolute', bottom: 16, right: 18,
        fontSize: '4.5rem', fontWeight: 900, lineHeight: 1,
        color: isDarkMode ? `${card.accent}15` : `${card.accent}10`,
        userSelect: 'none', pointerEvents: 'none', letterSpacing: '-0.04em',
      }}>
        {card.label}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Section
   ───────────────────────────────────────────── */
const StackedCards = () => {
  const sectionRef  = useRef(null);
  const stageRef    = useRef(null);
  const cardRefs    = useRef([]);
  const spreadRef   = useRef(false);

  const { theme } = useTheme();
  const normalizedTheme = typeof theme === 'string' ? theme.toLowerCase() : 'system';
  const isDarkMode = normalizedTheme === 'dark' || (normalizedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const applyPositions = (positions, duration = 0.65, ease = 'power3.out') => {
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const p = positions[i];
      gsap.to(el, {
        x: p.x, y: p.y, z: p.z,
        rotateY: p.rotY, rotateX: p.rotX,
        scale: p.scale, opacity: p.opacity,
        duration, ease,
        overwrite: 'auto',
      });
    });
  };

  /* Boom reveal on scroll + initial stacked state */
  useEffect(() => {
    const cards = cardRefs.current;

    // Set initial 3D state immediately (stacked)
    cards.forEach((el, i) => {
      if (!el) return;
      const p = STACKED[i];
      gsap.set(el, { x: p.x, y: p.y, z: p.z, rotateY: p.rotY, rotateX: p.rotX, scale: p.scale, opacity: 0 });
    });

    // Scroll reveal — fade & slide in
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 65%',
        once: true,
        onEnter: () => {
          cards.forEach((el, i) => {
            if (!el) return;
            const p = STACKED[i];
            gsap.to(el, {
              opacity: p.opacity,
              y: p.y,
              duration: 0.7,
              delay: i * 0.1,
              ease: 'power3.out',
            });
          });
        },
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  /* Hover handlers */
  const handleEnter = () => {
    if (spreadRef.current) return;
    spreadRef.current = true;
    applyPositions(SPREAD, 0.65, 'power3.out');
  };

  const handleLeave = () => {
    spreadRef.current = false;
    applyPositions(STACKED, 0.7, 'power3.inOut');
  };

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        padding: '130px 1.5rem 150px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        overflow: 'hidden',
        background: isDarkMode 
          ? 'linear-gradient(180deg,rgba(4,4,14,1) 0%,rgba(6,6,20,1) 100%)'
          : 'linear-gradient(180deg,#F8FAFF 0%,#EEF2FF 100%)',
      }}
    >
      {/* Background glows */}
      <div style={{ position:'absolute', top:'20%', left:'10%', width:'40vw', height:'40vw', borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'15%', right:'10%', width:'35vw', height:'35vw', borderRadius:'50%', background:'radial-gradient(circle,rgba(236,72,153,0.08) 0%,transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }} />

      {/* Section header */}
      <div style={{ textAlign:'center', marginBottom:'5rem', position:'relative', zIndex:10, maxWidth:600 }}>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:7,
          padding:'5px 16px', borderRadius:999,
          background: isDarkMode ? 'rgba(167,139,250,0.1)' : 'rgba(99,102,241,0.1)',
          border: isDarkMode ? '1px solid rgba(167,139,250,0.25)' : '1px solid rgba(99,102,241,0.28)',
          marginBottom:'1.5rem',
        }}>
          <Sparkles size={12} style={{ color: isDarkMode ? '#a78bfa' : '#818cf8' }} />
          <span style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.12em', color: isDarkMode ? '#a78bfa' : '#818cf8' }}>CORE CAPABILITIES</span>
        </div>

        <h2 style={{
          fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:900, color: isDarkMode ? '#f8fafc' : '#0F172A',
          marginBottom:'1rem', letterSpacing:'-0.03em', lineHeight:1.1,
        }}>
          Built for the{' '}
          <span style={{
            background: isDarkMode ? 'linear-gradient(135deg,#60a5fa,#a78bfa,#e879f9)' : 'linear-gradient(135deg,#4F46E5,#7C3AED,#EC4899)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            filter: isDarkMode ? 'drop-shadow(0 0 20px rgba(139,92,246,0.4))' : 'none',
          }}>
            AI Era
          </span>
        </h2>
        <p style={{ fontSize:'1rem', color: isDarkMode ? 'rgba(148,163,184,0.65)' : '#475569', lineHeight:1.7, margin:0 }}>
          Three foundational pillars that make AISA the most capable and trusted AI platform.
        </p>
      </div>

      {/* 3D Stage */}
      <div
        ref={stageRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{
          position: 'relative',
          width: 340,
          height: 460,
          perspective: '1200px',
          perspectiveOrigin: '50% 40%',
          zIndex: 10,
          cursor: 'pointer',
        }}
      >
        {/* Render back → front (reversed so front card is on top in DOM) */}
        {[...CARDS].reverse().map((card, revIdx) => {
          const realIdx = CARDS.length - 1 - revIdx;
          return (
            <Card
              key={card.id}
              card={card}
              cardRef={el => (cardRefs.current[realIdx] = el)}
              isDarkMode={isDarkMode}
            />
          );
        })}
      </div>

      {/* Hint text */}
      <p style={{
        marginTop: '3rem', fontSize:'0.78rem',
        color: isDarkMode ? 'rgba(148,163,184,0.35)' : '#94A3B8', letterSpacing:'0.06em',
        zIndex:10, position:'relative',
        animation:'scHint 2s ease-in-out infinite',
      }}>
        ↔ Hover to explore
      </p>

      <style>{`
        @keyframes scHint {
          0%,100%{opacity:0.35;transform:translateY(0)}
          50%{opacity:0.65;transform:translateY(-4px)}
        }
      `}</style>
    </section>
  );
};

export default StackedCards;
