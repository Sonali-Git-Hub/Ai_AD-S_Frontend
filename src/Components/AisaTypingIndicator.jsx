import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

const AisaTypingIndicator = ({ visible = true, message = "AISA™ is thinking" }) => {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-start gap-2 md:gap-3 mb-4 w-full max-w-5xl mx-auto px-4 md:px-0"
    >
      {/* Avatar */}
      <div className="flex items-center gap-2 px-0 py-1 opacity-80">
        <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {message}
        </span>
        <div className="flex gap-1 ml-1.5">
          <div className="w-1 h-1 rounded-full bg-indigo-500/40 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-1 rounded-full bg-indigo-500/40 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-1 rounded-full bg-indigo-500/40 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </motion.div>
  );
};

export default AisaTypingIndicator;
