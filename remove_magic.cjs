const fs = require('fs');
let content = fs.readFileSync('src/Components/AiSocialMediaDashboard.jsx', 'utf8');

// Regex to find the Magic Create button container and remove it
const regex = /<div className=\"flex gap-4 w-full sm:w-auto\">[\\s\\S]*?Magic Create[\\s\\S]*?<\\/div>/;
content = content.replace(regex, '');

// Clean up the parent container classes (remove flex-col sm:flex-row justify-between gap-6)
content = content.replace(/flex flex-col sm:flex-row items-center justify-between gap-6/, 'flex items-center');

fs.writeFileSync('src/Components/AiSocialMediaDashboard.jsx', content, 'utf8');
console.log('Removed Magic Create button');
