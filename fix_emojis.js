const fs = require('fs');
let content = fs.readFileSync('src/Components/AiSocialMediaDashboard.jsx', 'utf8');

// Find the generation pipeline mapping array using regex
const regex = /\{\[\s*(?:\{[^\}]+\},\s*)+\]\.map\(\(step,\s*i\)\s*=>/g;
let match;
while ((match = regex.exec(content)) !== null) {
    if (content.substring(match.index - 50, match.index).includes('Generation Pipeline')) {
        const replacement = "{[\n                  { label: 'GPT-4', icon: '??', desc: 'Prompt' },\n                  { icon: '?', plain: true },\n                  { label: 'Imagen', icon: '???', desc: 'Visual' },\n                  { icon: '?', plain: true },\n                  { label: 'GCS', icon: '??', desc: 'Upload' },\n                  { icon: '?', plain: true },\n                  { label: 'Asset', icon: '?', desc: 'Saved' },\n                ].map((step, i) =>";
        content = content.substring(0, match.index) + replacement + content.substring(match.index + match[0].length);
        break;
    }
}

// Replace the arrow inside the map
content = content.replace(/<span key=\{i\} className="text-slate-300 dark:text-white\/20 font-black text-xs">[^<]+<\/span>/g, '<span key={i} className="text-slate-300 dark:text-white/20 font-black text-xs">?</span>');

fs.writeFileSync('src/Components/AiSocialMediaDashboard.jsx', content, 'utf8');
console.log("Successfully replaced emojis.");
