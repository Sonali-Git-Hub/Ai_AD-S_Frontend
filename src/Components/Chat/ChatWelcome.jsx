import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ModernDashboard from '../../landingpage/ModernDashboard';

export const ChatWelcome = ({
  user,
  messages,
  isSessionLoading,
  isHydrating,
  currentCase,
  currentProjectId,
  currentMode,
  activeLegalToolkit,
  selectedLegalTool,
  activeCategory,
  onCategoryChange,
  activeToolId,
  onToolSelect
}) => {
  const showWelcome = 
    messages.length === 0 && 
    !isSessionLoading && 
    !isHydrating &&
    !currentCase &&
    (!currentProjectId || currentProjectId === 'default' || currentProjectId === 'all') &&
    currentMode !== 'LEGAL_TOOLKIT' && 
    !activeLegalToolkit && 
    !selectedLegalTool && 
    !new URLSearchParams(window.location.search).get('tool');

  if (!showWelcome) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="welcome-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 z-[50] pointer-events-none flex flex-col items-center justify-start sm:justify-start overflow-hidden sm:overflow-y-auto sm:overflow-x-hidden sm:pb-32 md:pb-48 scrollbar-hide pt-20 sm:pt-6 aisa-welcome-screen-overlay"
      >
        <div className="relative z-10 flex flex-col items-center w-full max-w-7xl mx-auto px-3 sm:px-6 h-max mt-0 sm:mt-0 pointer-events-auto">
          <ModernDashboard
            userName={user?.name || user?.email?.split('@')[0]}
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
            activeToolId={activeToolId}
            onToolSelect={onToolSelect}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatWelcome;
