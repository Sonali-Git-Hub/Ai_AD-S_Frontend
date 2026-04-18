const fs = require('fs');
const lines = fs.readFileSync('src/Components/AiSocialMediaDashboard.jsx', 'utf8').split('\n');

// Line 4131 and 4137 in view_file (0-indexed 4130 and 4136)
lines[4130] = '        icon: <ImageIcon className=\"w-8 h-8 text-primary\" />,';
lines[4136] = '        icon: <Library className=\"w-8 h-8 text-primary\" />,';

fs.writeFileSync('src/Components/AiSocialMediaDashboard.jsx', lines.join('\n'), 'utf8');
console.log('Successfully updated post format icons using line numbers.');
