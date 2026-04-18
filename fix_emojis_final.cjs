const fs = require('fs');
const lines = fs.readFileSync('src/Components/AiSocialMediaDashboard.jsx', 'utf8').split('\n');

const newCode = [
  '              <p className=\"text-[8px] font-black text-slate-400 uppercase tracking-[3px] mb-3\">Generation Pipeline</p>',
  '              <div className=\"flex items-center gap-2\">',
  '                {[',
  '                  { label: \'GPT-4\', icon: \'??\', desc: \'Prompt\' },',
  '                  { icon: \'?\', plain: true },',
  '                  { label: \'Imagen\', icon: \'???\', desc: \'Visual\' },',
  '                  { icon: \'?\', plain: true },',
  '                  { label: \'GCS\', icon: \'??\', desc: \'Upload\' },',
  '                  { icon: \'?\', plain: true },',
  '                  { label: \'Asset\', icon: \'?\', desc: \'Saved\' },',
  '                ].map((step, i) =>',
  '                  step.plain ? (',
  '                    <span key={i} className=\"text-slate-300 dark:text-white/20 font-black text-xs\">?</span>',
  '                  ) : (',
  '                    <div key={i} className=\"flex-1 text-center\">',
  '                      <span className=\"text-base block\">{step.icon}</span>',
  '                      <p className=\"text-[7px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest\">{step.label}</p>',
  '                    </div>',
  '                  )',
  '                )}',
  '              </div>'
];

// Lines 4216 to 4234 (19 lines) in the view_file output
// Note: splice is 0-indexed, so line 4216 is index 4215
lines.splice(4215, 20, ...newCode);

fs.writeFileSync('src/Components/AiSocialMediaDashboard.jsx', lines.join('\n'), 'utf8');
console.log('Successfully replaced emojis using line numbers.');
