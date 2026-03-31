import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Scale, ArrowRight } from 'lucide-react';

const SUGGESTION_MAP = {
  'legal_draft_maker': { name: 'Draft Document', icon: Scale, color: 'text-blue-600', bg: 'bg-blue-50' },
  'legal_contract_analyzer': { name: 'Analyze Contract', icon: Scale, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'legal_case_predictor': { name: 'Predict Outcome', icon: Scale, color: 'text-purple-600', bg: 'bg-purple-50' },
  'legal_notice_generator': { name: 'Generate Notice', icon: Scale, color: 'text-orange-600', bg: 'bg-orange-50' },
  'legal_evidence_checker': { name: 'Check Evidence', icon: Scale, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  'legal_nda_generator': { name: 'Create NDA', icon: Scale, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

const LegalToolSuggestions = ({ suggestions, onSelect }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Suggested Actions</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {suggestions.map((toolId, index) => {
          const config = SUGGESTION_MAP[toolId] || { name: toolId.replace('legal_', '').replace('_', ' '), icon: ArrowRight, color: 'text-slate-600', bg: 'bg-slate-50' };
          const Icon = config.icon;

          return (
            <motion.button
              key={toolId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(toolId, config.name)}
              className={`flex items-center gap-2.5 px-4 py-2.5 ${config.bg} border border-transparent hover:border-slate-200 rounded-2xl shadow-sm transition-all group`}
            >
              <Icon className={`w-4 h-4 ${config.color}`} />
              <span className="text-xs font-bold text-slate-700">{config.name}</span>
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default LegalToolSuggestions;
