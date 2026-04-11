const fs = require('fs');
const p = 'f:/aisa_New/AISA/src/Components/CashFlowStockModal.jsx';
let content = fs.readFileSync(p, 'utf-8');

// The goal: Wrap everything inside motion.div EXCEPT the last div into a left-column div.
// And put the last div in a right-column. But wait, we want report on the left, verdict on the right.

// We will just do targeted string replaces.

// 1. motion.div className
content = content.replace(
  /className=\{`border-2 border-dashed rounded-\[24px\] p-10 text-center shadow-sm relative overflow-hidden/g,
  'className={`border-2 border-dashed rounded-[24px] p-8 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center gap-8'
);

// 2. Wrap the first 4 elements in a div (Verdict side on right, but for now just wrapping)
content = content.replace(
  /<div className="mb-4">\s*<Zap fill="currentColor"/s,
  '<div className="flex flex-col items-center justify-center w-full lg:w-2/5 shrink-0 order-1 lg:order-2">\\n                                <div className="mb-4">\\n                                    <Zap fill="currentColor"'
);

// 3. Find the end of the indicators div and close our wrapper
content = content.replace(
  /<\/div>\s*<\/div>\s*<div className="mt-8 text-left bg-white\/40 p-6/s,
  '</div>\\n                                </div>\\n                                </div>\\n\\n                                <div className="text-left bg-white/60 p-6 rounded-2xl border border-white/50 prose prose-sm max-w-none prose-slate shadow-sm w-full lg:w-3/5 h-full order-2 lg:order-1">\\n                                    <h3 className="text-xs font-black text-[#111] uppercase tracking-[0.2em] mb-4 opacity-70 border-b border-black/5 pb-2">Analysis Report</h3>'
);

// 4. Change the inner flex wrappers logic for Indicators
content = content.replace(
  /<div className="mt-8 flex justify-center gap-6">/g,
  '<div className="mt-6 flex justify-center gap-4 flex-wrap">'
);

fs.writeFileSync(p, content);
console.log('Update script completely executed');
