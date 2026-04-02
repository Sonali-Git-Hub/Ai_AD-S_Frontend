import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

const AisaTypingIndicator = ({ visible = true }) => {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-start gap-3 mb-4"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.2))',
            border: '1px solid rgba(139,92,246,0.4)',
            boxShadow: '0 0 12px rgba(139,92,246,0.3)',
          }}>
          <Bot style={{ width: 14, height: 14, color: '#a78bfa' }} />
        </div>
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-xl"
          style={{
            border: '1px solid rgba(139,92,246,0.4)',
            animation: 'neon-pulse 2s ease-in-out infinite',
          }} />
      </div>

      {/* Typing bubble */}
      <div className="aisa-typing-indicator">
        <Sparkles style={{ width: 10, height: 10, color: 'rgba(167,139,250,0.7)', flexShrink: 0 }} />
        <span style={{ fontSize: '11px', color: 'rgba(167,139,250,0.7)', fontWeight: 600 }}>
          AISA is thinking
        </span>
        <div className="aisa-typing-dot" />
        <div className="aisa-typing-dot" />
        <div className="aisa-typing-dot" />
      </div>
    </motion.div>
  );
};

export default AisaTypingIndicator;
