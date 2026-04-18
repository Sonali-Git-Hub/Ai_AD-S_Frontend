const fs = require('fs');
let lines = fs.readFileSync('src/Components/AiSocialMediaDashboard.jsx', 'utf8').split('\n');

const newCode = \                {[
                  { label: 'GPT-4', icon: '??', desc: 'Prompt' },
                  { icon: '?', plain: true },
                  { label: 'Imagen', icon: '???', desc: 'Visual' },
                  { icon: '?', plain: true },
                  { label: 'GCS', icon: '??', desc: 'Upload' },
                  { icon: '?', plain: true },
                  { label: 'Asset', icon: '?', desc: 'Saved' },
                ].map((step, i) =>
                  step.plain ? (
                    <span key={i} className="text-slate-300 dark:text-white/20 font-black text-xs">?</span>\;

lines.splice(4217, 9, newCode);
fs.writeFileSync('src/Components/AiSocialMediaDashboard.jsx', lines.join('\n'), 'utf8');
console.log('Fixed pipeline steps via lines script');
