import React from 'react';
import { Briefcase } from 'lucide-react';

const LegalWorkspaceWelcome = ({ currentCase }) => {
  if (!currentCase) return null;
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in zoom-in duration-500 min-h-[400px]">
      <div className="pointer-events-auto flex flex-col items-center">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-primary/20">
          <Briefcase className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
          {currentCase.name} <span className="text-primary">Workspace</span>
        </h2>
        <p className="max-w-md text-subtext font-medium leading-relaxed mb-8">
          This case is now active. You can analyze documents, predict outcomes, or draft legal papers specifically for this case.
        </p>
      </div>
    </div>
  );
};

export default LegalWorkspaceWelcome;
