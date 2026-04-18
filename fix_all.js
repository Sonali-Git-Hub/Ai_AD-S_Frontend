/**
 * fix_all.js — removes ALL remaining git conflict markers from Chat.jsx
 * Run: node fix_all.js
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Chat.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
const before = lines.length;

const cleaned = lines.filter(line => {
  const t = line.replace(/\r$/, '');
  return (
    t !== '>>>>>>> Stashed changes' &&
    t !== '<<<<<<< Updated upstream' &&
    t !== '======='
  );
});

const after = cleaned.length;
fs.writeFileSync(filePath, cleaned.join('\n'), 'utf8');

console.log(`✅ Done! Removed ${before - after} conflict marker lines.`);
console.log(`   File: ${filePath}`);
