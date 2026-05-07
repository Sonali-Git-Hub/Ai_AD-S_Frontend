import React from 'react';
import { motion } from 'framer-motion';

const AisaTypingIndicator = ({ visible = true, message = "AISA™ is thinking" }) => {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 opacity-80 py-1"
    >
      <span className="text-[7px] text-primary/70 font-bold uppercase tracking-[0.1em]">
        {message}
      </span>
      <div className="flex gap-1 ml-1 items-center">
        <div className="w-[3px] h-[3px] rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-[3px] h-[3px] rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-[3px] h-[3px] rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </motion.div>
  );
};

export default AisaTypingIndicator;

