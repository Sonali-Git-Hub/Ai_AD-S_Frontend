const fs = require('fs');

const files = [
  'src/Components/LegalToolkitCard.jsx',
  'src/Navigation.Provider.jsx',
  'src/pages/Chat.jsx'
];

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Regex to match conflict blocks
    // <<<<<<< Updated upstream\n(.*?)\n=======\n(.*?)\n>>>>>>> Stashed changes
    // We want to keep group 2 (Stashed changes)
    const conflictRegex = /<<<<<<< Updated upstream[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>> Stashed changes/g;
    
    content = content.replace(conflictRegex, '$1');
    
    fs.writeFileSync(file, content);
    console.log(`Resolved conflicts in ${file}`);
  } catch (err) {
    console.error(`Failed on ${file}: ${err.message}`);
  }
});
