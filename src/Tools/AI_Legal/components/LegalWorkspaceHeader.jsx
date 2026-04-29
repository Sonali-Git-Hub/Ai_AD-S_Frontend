import React from 'react';
import { ArrowLeft, Briefcase, Users, Edit2, Trash2 } from 'lucide-react';

const LegalWorkspaceHeader = ({
  currentCase,
  isRenamingCase,
  renameValue,
  setRenameValue,
  handleRenameCase,
  setIsRenamingCase,
  handleDeleteCase,
  handleBackToDashboard
}) => {
  return (
    <div className="w-full px-6 sm:px-12 pt-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800/50 pb-6">
      <div className="flex flex-col gap-4">
        <button
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-black text-[10px] uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-full transition-all hover:gap-3 w-fit"
        >
          <ArrowLeft size={14} />
          Back to Case List
        </button>

        {currentCase && (
          <div className="flex items-center gap-4 ml-1">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-500/30">
              <Briefcase size={20} />
            </div>
            <div className="flex-1 min-w-0">
              {isRenamingCase === currentCase._id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameCase(currentCase._id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameCase(currentCase._id);
                      if (e.key === 'Escape') setIsRenamingCase(null);
                    }}
                    className="bg-slate-50 dark:bg-black/20 border border-indigo-500 rounded-xl px-3 py-1.5 text-lg font-black w-full outline-none text-slate-900 dark:text-white"
                    autoFocus
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none truncate">{currentCase.name}</h2>
                  <p className="text-xs text-subtext font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                    <Users size={12} className="text-indigo-500" />
                    {currentCase?.clientName || 'Private Client'}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {currentCase && (
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => {
              setRenameValue(currentCase.name);
              setIsRenamingCase(currentCase._id);
            }}
            className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800/80 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm group"
            title="Rename Case"
          >
            <Edit2 size={18} className="group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => handleDeleteCase(currentCase._id)}
            className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-red-500 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm group"
            title="Delete Case"
          >
            <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};

export default LegalWorkspaceHeader;
