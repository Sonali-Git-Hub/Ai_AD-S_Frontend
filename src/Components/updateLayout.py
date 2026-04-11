import sys
import re

p = 'f:/aisa_New/AISA/src/Components/CashFlowStockModal.jsx'

with open(p, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change motion.div class
content = content.replace(
    'className={`border-2 border-dashed rounded-[24px] p-10 text-center shadow-sm relative overflow-hidden',
    'className={`border-2 border-dashed rounded-[24px] p-8 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center gap-8'
)

# 2. Add an inner wrap for the "Verdict" section
# Let's find exactly '<div className="mb-4">\n                                    <Zap fill="currentColor"'
target1 = '<div className="mb-4">\n                                    <Zap fill="currentColor"'
replace1 = '<div className="flex flex-col items-center justify-center w-full lg:w-2/5 shrink-0 order-1 lg:order-2">\n                                <div className="mb-4">\n                                    <Zap fill="currentColor"'
content = content.replace(target1, replace1)

# 3. Add closing tags before report section and style the report container
target2 = '<div className="mt-8 text-left bg-white/40 p-6 rounded-2xl border border-white/50 prose prose-sm max-w-none prose-slate">'
replace2 = '</div>\n                                <div className="text-left bg-white/60 p-6 rounded-2xl border border-white/50 prose prose-sm max-w-none prose-slate shadow-sm w-full lg:w-3/5 h-full order-2 lg:order-1">\n                                    <h3 className="text-xs font-black text-[#111] uppercase tracking-[0.2em] mb-4 opacity-70 border-b border-black/5 pb-2">Analysis Report</h3>'
content = content.replace(target2, replace2)

# 4. Modify the margin/gap on the Indicators block
target3 = '<div className="mt-8 flex justify-center gap-6">'
replace3 = '<div className="mt-6 flex justify-center gap-4 flex-wrap">'
content = content.replace(target3, replace3)

with open(p, 'w', encoding='utf-8') as f:
    f.write(content)

print("Python modification executed")
