const fs = require('fs');
const content = fs.readFileSync('src/Components/AiSocialMediaDashboard.jsx', 'utf8');

// We'll replace the entire Pipeline section with one that uses Lucide icons
const startMarker = '{/* Pipeline Steps Preview */}';
const endMarker = '          </div>\n\n          {/* Footer Actions */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const newSection = \{/* Pipeline Steps Preview */}
            <div className=\"mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5\">
              <p className=\"text-[8px] font-black text-slate-400 uppercase tracking-[3px] mb-3\">Generation Pipeline</p>
              <div className=\"flex items-center gap-2\">
                {[
                  { label: 'GPT-4', icon: <BrainCircuit className=\"w-4 h-4 mx-auto\" />, desc: 'Prompt' },
                  { icon: <ArrowRight className=\"w-3 h-3 text-slate-300\" />, plain: true },
                  { label: 'Imagen', icon: <ImageIcon className=\"w-4 h-4 mx-auto\" />, desc: 'Visual' },
                  { icon: <ArrowRight className=\"w-3 h-3 text-slate-300\" />, plain: true },
                  { label: 'GCS', icon: <Upload className=\"w-4 h-4 mx-auto\" />, desc: 'Upload' },
                  { icon: <ArrowRight className=\"w-3 h-3 text-slate-300\" />, plain: true },
                  { label: 'Asset', icon: <Sparkles className=\"w-4 h-4 mx-auto\" />, desc: 'Saved' },
                ].map((step, i) =>
                  step.plain ? (
                    <div key={i} className=\"flex items-center justify-center\">{step.icon}</div>
                  ) : (
                    <div key={i} className=\"flex-1 text-center\">
                      <div className=\"text-primary mb-1 flex justify-center\">{step.icon}</div>
                      <p className=\"text-[7px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest\">{step.label}</p>
                    </div>
                  )
                )}
              </div>
            </div>\;

    const updatedContent = content.substring(0, startIndex) + newSection + content.substring(endIndex);
    fs.writeFileSync('src/Components/AiSocialMediaDashboard.jsx', updatedContent, 'utf8');
    console.log('Successfully updated pipeline to use Lucide icons.');
} else {
    console.log('Could not find start or end markers.');
}
