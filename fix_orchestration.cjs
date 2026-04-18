const fs = require('fs');
let content = fs.readFileSync('src/Components/AiSocialMediaDashboard.jsx', 'utf8');

const target = '<Layers className=\"w-12 h-12 text-slate-400\" />\\n  const renderContentOrchestration = () => {';
const replacement = '<Layers className=\"w-12 h-12 text-slate-400\" />\\n        </div>\\n        <h2 className=\"text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4\">Module: {tabId.toUpperCase()}</h2>\\n        <p className=\"text-slate-500 dark:text-slate-400 font-medium text-sm max-w-sm\">\\n          This advanced capability is currently being calibrated in Phase 2 development. Check back soon for full integration.\\n        </p>\\n        <button onClick={() => setActiveTab(\\'overview\\')} className=\"mt-12 text-xs font-black text-primary uppercase tracking-[4px] border-b-2 border-primary pb-1\">Return to Overview</button>\\n      </div>\\n    );\\n  };\\n\\n  const renderContentOrchestration = () => {';

// Try literal match first
if (content.includes(target)) {
    content = content.replace(target, replacement);
} else {
    // Try regex with flexible whitespace
    const regex = /<Layers className=\"w-12 h-12 text-slate-400\" \/>\s*const renderContentOrchestration = \(\) => \{/;
    content = content.replace(regex, replacement);
}

fs.writeFileSync('src/Components/AiSocialMediaDashboard.jsx', content, 'utf8');
console.log('Fixed orchestration structure');
