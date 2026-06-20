import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, CheckCircle, ChevronRight, Zap } from 'lucide-react';

const LegalGuideModal = ({ isDark, isVisible, onClose, onContinue, tool }) => {
  if (!tool) return null;

  const features = tool.features || [
    "Create legal cases",
    "Upload evidence",
    "Track hearings",
    "Organize documents",
    "AI legal insights",
    "Case timeline management"
  ];

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

        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-8"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-8"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-900 p-6 sm:p-8 text-left align-middle shadow-2xl transition-all border border-slate-200 dark:border-zinc-800 relative">
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors z-10"
              >
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>

              <div className="flex flex-col items-center text-center mt-4 mb-6">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-[1.4rem] flex items-center justify-center mb-4">
                  {tool.icon ? React.cloneElement(tool.icon, { size: 30 }) : <Zap size={30} />}
                </div>
                <Dialog.Title as="h3" className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {tool.title} • QUICK GUIDE
                </Dialog.Title>
                <p className="text-xs text-subtext mt-2 leading-relaxed max-w-sm font-semibold">
                  {tool.desc}
                </p>
              </div>

              {/* Feature checkmarks */}
              <div className="space-y-3.5 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button 
                onClick={onContinue}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-500/20"
              >
                <span>Continue to {tool.title}</span>
                <ChevronRight size={18} />
              </button>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default LegalGuideModal;
