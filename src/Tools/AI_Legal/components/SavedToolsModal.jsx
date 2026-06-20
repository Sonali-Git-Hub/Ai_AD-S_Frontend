import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Bookmark, AlertCircle, ChevronRight } from 'lucide-react';

const SavedToolsModal = ({ isDark, isVisible, onClose, savedTools, onLaunchTool, onRemoveTool, primaryColor = '#4f46e5' }) => {
  return (
    <Transition.Root show={isVisible} as={Fragment}>
      <Dialog as="div" className="relative z-[120000]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto flex items-end sm:items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-8"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-8"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-900 p-6 text-left align-middle shadow-2xl transition-all border border-slate-200 dark:border-zinc-800">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Bookmark size={20} className="fill-current" />
                  </div>
                  <Dialog.Title as="h3" className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Saved Tools
                  </Dialog.Title>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                  <X size={18} className="text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              {/* Scroll Content */}
              <div className="max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar space-y-4">
                {savedTools.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <AlertCircle size={40} className="text-slate-300 dark:text-slate-700 mb-4" />
                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">No Saved Tools</h4>
                    <p className="text-xs text-subtext mt-2 max-w-[240px] leading-relaxed font-medium">
                      Tap the bookmark icon on any AI Legal card to save it here for quick access.
                    </p>
                  </div>
                ) : (
                  savedTools.map((tool) => (
                    <div 
                      key={tool.toolId} 
                      className="bg-slate-50 dark:bg-black/20 border border-slate-250 dark:border-zinc-800/50 rounded-2xl p-4 flex flex-col gap-3 group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {tool.title}
                          </h5>
                          <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mt-1 inline-block">
                            {tool.category}
                          </span>
                        </div>
                        <button 
                          onClick={() => onRemoveTool(tool.toolId)}
                          className="p-2 bg-red-50 dark:bg-red-950/20 rounded-xl text-red-500 hover:scale-105 active:scale-95 transition-all"
                          title="Remove Bookmark"
                        >
                          <Bookmark size={14} className="fill-current" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => {
                          onClose();
                          onLaunchTool(tool.toolId);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-3 bg-indigo-600/5 dark:bg-indigo-600/15 text-indigo-650 dark:text-indigo-400 hover:bg-indigo-600/10 dark:hover:bg-indigo-600/20 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        <span>LAUNCH TOOL</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default SavedToolsModal;
