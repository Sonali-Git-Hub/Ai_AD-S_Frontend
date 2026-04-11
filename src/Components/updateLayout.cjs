const fs = require('fs');
const p = 'f:/aisa_New/AISA/src/Components/CashFlowStockModal.jsx';
let content = fs.readFileSync(p, 'utf-8');

content = content.replace(/\r\n/g, '\n');

content = content.replace(
  'className={`border-2 border-dashed rounded-[24px] p-10 text-center shadow-sm relative overflow-hidden',
  'className={`border-2 border-dashed rounded-[24px] p-8 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center gap-8'
);

content = content.replace(
  '<div className="mb-4">\n                                    <Zap fill="currentColor"',
  '<div className="flex flex-col items-center justify-center w-full lg:w-2/5 shrink-0 order-1 lg:order-2">\n                                <div className="mb-4">\n                                    <Zap fill="currentColor"'
);

content = content.replace(
  '<div className="mt-8 text-left bg-white/40 p-6 rounded-2xl border border-white/50 prose prose-sm max-w-none prose-slate">',
  '</div>\n                                <div className="text-left bg-white/60 p-6 rounded-2xl border border-white/50 prose prose-sm max-w-none prose-slate shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] w-full lg:w-3/5 h-full order-2 lg:order-1">\n                                    <h3 className="text-xs font-black text-[#111] uppercase tracking-[0.2em] mb-4 opacity-70 border-b border-black/5 pb-3">Analysis Report</h3>'
);

content = content.replace(
  '<div className="mt-8 flex justify-center gap-6">',
  '<div className="mt-6 flex justify-center gap-4 flex-wrap">'
);

fs.writeFileSync(p, content);
console.log('DOM node layout successfully executed!');
