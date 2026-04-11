const fs = require('fs');
const p = 'f:/aisa_New/AISA/src/Components/CashFlowStockModal.jsx';
let content = fs.readFileSync(p, 'utf-8');

content = content.replace(
  '<div className="mb-4">\\r\\n                                   <Zap fill="currentColor"',
  '<div className="flex flex-col lg:flex-row gap-8 items-center text-left w-full"><div className="flex flex-col items-center justify-center w-full lg:w-2/5">\\n                               <div className="mb-4">\\n                                   <Zap fill="currentColor"'
);
content = content.replace(
  '<div className="mb-4">\\n                                   <Zap fill="currentColor"',
  '<div className="flex flex-col lg:flex-row gap-8 items-center text-left w-full"><div className="flex flex-col items-center justify-center w-full lg:w-2/5">\\n                               <div className="mb-4">\\n                                   <Zap fill="currentColor"'
);

// Change layout class of the report container and close the first wrap column
content = content.replace(
  /<div className="mt-8 text-left bg-white\/40 p-6 rounded-2xl border border-white\/50 prose prose-sm max-w-none prose-slate">/,
  '</div>\\n\\n                               <div className="text-left bg-white/60 p-6 rounded-2xl border border-white/50 prose prose-sm max-w-none prose-slate w-full lg:w-3/5 h-full shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80">\\n                                   <h3 className="text-xs font-black text-[#111] uppercase tracking-[0.2em] mb-4 opacity-70 border-b border-black/5 pb-2">Analysis Report</h3>'
);

// Add the closing div right before </motion.div> for the new flex wrapper
content = content.replace(
  /<\/ReactMarkdown>\s*<\/div>\s*<\/motion\.div>/,
  '</ReactMarkdown>\\n                                </div>\\n                                </div>\\n                             </motion.div>'
);

// Update indicator flex gap
content = content.replace(
  '<div className="mt-8 flex justify-center gap-6">',
  '<div className="mt-6 flex justify-center gap-4 flex-wrap">'
);

fs.writeFileSync(p, content);
console.log('Update successful');
