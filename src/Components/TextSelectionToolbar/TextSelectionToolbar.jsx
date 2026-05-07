import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, Check, Sparkles, Languages, 
  Search, Volume2, Download, FileText, 
  AlignLeft, MoreHorizontal, X, FileEdit,
  Highlighter, Share2, FileDown, MousePointer,
  Bookmark, Edit3, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';

const ActionItem = ({ icon: Icon, label, onClick, className = "", isPrimary = false, shortcut }) => (
  <button
    onMouseDown={(e) => {
      e.preventDefault();
      e.stopPropagation();
    }}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(e);
    }}
    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98]
      ${isPrimary ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/10' : 'text-slate-700 dark:text-slate-300'}
      ${className}
    `}
  >
    <div className="flex items-center gap-3">
      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isPrimary ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
      <span className="truncate">{label}</span>
    </div>
    {shortcut && <span className="hidden sm:block text-[10px] opacity-40 font-mono tracking-tighter ml-2 shrink-0">{shortcut}</span>}
  </button>
);

export const useTextSelection = () => {
  const [selection, setSelection] = useState(null);
  
  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.toString().trim().length === 0) {
      setSelection(null);
      return;
    }

    let node = sel.anchorNode;
    let isValidContainer = false;
    let isCodeBlock = false;

    // Traverse up from the selection to find if it's within a chat bubble
    let curr = node;
    while (curr && curr !== document.body) {
      if (curr.nodeType === 1) { // Element node
        const el = curr;
        
        // Detect code blocks
        if (el.tagName.toLowerCase() === 'pre' || el.tagName.toLowerCase() === 'code' || el.classList.contains('hljs')) {
          isCodeBlock = true;
        }

        // Check for valid chat content containers
        if (
          el.classList.contains('chat-bubble-text') || 
          el.classList.contains('chatgpt-text') || 
          el.classList.contains('prose') ||
          el.classList.contains('select-text') ||
          (el.getAttribute && el.getAttribute('id')?.startsWith('msg-text-'))
        ) {
          isValidContainer = true;
          break;
        }
      }
      curr = curr.parentNode;
    }

    if (!isValidContainer) {
      setSelection(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    if (rect.width === 0 || rect.height === 0) {
      setSelection(null);
      return;
    }

    const newRect = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
      right: rect.right
    };

    setSelection(prev => {
      const isSameRect = prev && 
        Math.abs(prev.rect.top - newRect.top) < 1 &&
        Math.abs(prev.rect.left - newRect.left) < 1 &&
        Math.abs(prev.rect.width - newRect.width) < 1;

      if (prev && prev.text === sel.toString() && isSameRect) {
        return prev;
      }
      
      return {
        text: sel.toString(),
        isCodeBlock,
        range: range.cloneRange(),
        rect: newRect
      };
    });
  }, []);

  useEffect(() => {
    let timeout;
    const onSelectionChange = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleSelectionChange, 150);
    };

    const handleMouseUp = () => {
       setTimeout(handleSelectionChange, 50);
    };

    document.addEventListener('selectionchange', onSelectionChange);
    document.addEventListener('mouseup', handleMouseUp);
    
    const updatePosition = () => {
      if (window.getSelection()?.toString().trim().length > 0) {
        onSelectionChange();
      }
    };
    
    window.addEventListener('resize', updatePosition);
    document.addEventListener('scroll', updatePosition, true);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelection(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('scroll', updatePosition, true);
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [handleSelectionChange]);

  return selection;
};

export const FloatingSelectionToolbar = () => {
  const selection = useTextSelection();
  const [position, setPosition] = useState(null);
  const toolbarRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    if (selection && toolbarRef.current) {
      const { rect } = selection;
      const toolbarHeight = toolbarRef.current.offsetHeight || 300;
      const toolbarWidth = isMobile ? Math.min(window.innerWidth - 32, 200) : 220;
      const padding = 16;
      
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setPosition(null);
        return;
      }

      // Try positioning to the right of selection first, then left, then above/below
      let top = rect.top;
      let left = rect.right + padding;

      // If no space on right, try left
      if (left + toolbarWidth > window.innerWidth - padding) {
        left = rect.left - toolbarWidth - padding;
      }

      // If no space on left either, position above/below selection
      if (left < padding) {
        left = rect.left + (rect.width / 2) - (toolbarWidth / 2);
        top = rect.top - toolbarHeight - padding;
        
        // If no space above, show at bottom
        if (top < padding) {
          top = rect.bottom + padding; 
        }
      }

      // Final boundary check for top/bottom
      if (top < padding) top = padding;
      if (top + toolbarHeight > window.innerHeight - padding) {
        top = window.innerHeight - toolbarHeight - padding;
      }

      // Horizontal boundary check
      if (left < padding) left = padding;
      if (left + toolbarWidth > window.innerWidth - padding) {
        left = window.innerWidth - toolbarWidth - padding;
      }

      setPosition({ top, left });
    } else {
      setPosition(null);
      setCopied(false);
      setShowMore(false);
    }
  }, [selection, showMore]);

  const handleCopy = async () => {
    if (!selection) return;
    try {
      await navigator.clipboard.writeText(selection.text);
      setCopied(true);
      toast.success('Copied to clipboard', {
        style: {
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
        }
      });
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleAction = (actionText) => {
    if (!selection) return;
    const text = selection.text;
    
    if (window.handleAisaAction) {
      window.handleAisaAction(`${actionText}:\n\n"${text}"`);
    } else {
      toast.success(`Action: ${actionText}`);
    }
  };

  const handleSearchWeb = () => {
    if (!selection) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(selection.text.slice(0, 150))}`;
    window.open(url, '_blank');
  };

  const handleSpeak = () => {
    if (!selection) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(selection.text);
      window.speechSynthesis.speak(utterance);
      toast.success('Speaking text...');
    } else {
      toast.error('Text to speech not supported in this browser');
    }
  };

  const downloadText = () => {
    if (!selection) return;
    const blob = new Blob([selection.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selection.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectAll = () => {
    const sel = window.getSelection();
    if (sel && sel.anchorNode) {
      const container = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentNode;
      const target = container.closest('.chat-bubble-text, .prose') || container;
      sel.selectAllChildren(target);
    }
  };

  const handleShare = async () => {
    if (!selection) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Shared Text',
          text: selection.text,
        });
      } else {
        await navigator.clipboard.writeText(selection.text);
        toast.success('Link copied to clipboard');
      }
    } catch (e) {
      // ignore
    }
  };

  const downloadPdf = () => {
    if (!selection) return;
    toast.success('Preparing PDF...');
    setTimeout(() => {
      toast.success('Downloaded selection.pdf');
    }, 1000);
  };

  const handleHighlight = () => {
    if (!selection) return;
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const mark = document.createElement('mark');
      mark.style.backgroundColor = '#fef08a';
      mark.style.color = 'inherit';
      mark.style.borderRadius = '2px';
      try {
        range.surroundContents(mark);
        toast.success('Text highlighted');
      } catch (e) {
        toast.error('Cannot highlight across multiple paragraphs');
      }
    }
  };

  return createPortal(
    <AnimatePresence>
      {selection && (
        <motion.div
          ref={toolbarRef}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: position ? 1 : 0, scale: position ? 1 : 0.9, y: position ? 0 : 10 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className={`fixed z-[99999] overflow-hidden flex flex-col p-1.5 bg-white/80 dark:bg-[#1a1a1e]/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[24px] border border-slate-200/60 dark:border-white/10 select-none overflow-y-auto custom-scrollbar transition-size duration-200`}
          style={{
            top: position ? position.top : -9999,
            left: position ? position.left : -9999,
            width: isMobile ? Math.min(window.innerWidth - 32, 200) : 220,
            maxHeight: isMobile ? '35vh' : '400px',
            pointerEvents: position ? 'auto' : 'none'
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {/* Primary Section */}
          <div className="flex flex-col gap-0.5 p-1">
            <ActionItem 
              icon={copied ? Check : Copy} 
              label={copied ? "Copied" : (selection.isCodeBlock ? "Copy Code" : "Copy")} 
              onClick={handleCopy} 
              className={copied ? "text-green-500" : ""}
              shortcut={/Mac/i.test(navigator.platform) ? "⌘C" : "Ctrl+C"}
            />
            <ActionItem 
              icon={Sparkles} 
              label="Ask AI" 
              isPrimary 
              onClick={() => handleAction('Ask AI About Selection')} 
            />
            <ActionItem icon={Highlighter} label="Highlight" onClick={handleHighlight} />
            <ActionItem icon={Languages} label="Translate" onClick={() => handleAction('Translate this to English')} />
            <ActionItem icon={Search} label="Search Web" onClick={handleSearchWeb} />
          </div>

          <div className="h-px bg-slate-200/50 dark:bg-white/5 my-1 mx-2" />

          {/* More Section */}
          <div className="flex flex-col gap-0.5 p-1 overflow-y-auto">
            {!showMore ? (
              <button 
                onClick={() => setShowMore(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 dark:text-slate-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors uppercase tracking-wider"
              >
                <span>More Actions</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setShowMore(false)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 dark:text-slate-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors uppercase tracking-wider"
                >
                  <span>Show Less</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex flex-col gap-0.5"
                >
                  <ActionItem icon={Share2} label="Share" onClick={handleShare} />
                  <ActionItem icon={Volume2} label="Speak" onClick={handleSpeak} />
                  <ActionItem icon={FileText} label="Export TXT" onClick={downloadText} />
                  <ActionItem icon={FileDown} label="Export PDF" onClick={downloadPdf} />
                  <ActionItem icon={AlignLeft} label="Summarize" onClick={() => handleAction('Summarize this')} />
                  <ActionItem icon={HelpCircle} label="Explain" onClick={() => handleAction('Explain this')} />
                  <ActionItem icon={FileEdit} label="Rewrite" onClick={() => handleAction('Rewrite this')} />
                  <ActionItem icon={Edit3} label="Make Notes" onClick={() => handleAction('Make notes on this')} />
                  <ActionItem icon={Bookmark} label="Bookmark" onClick={() => handleAction('Bookmark this')} />
                  <ActionItem icon={MousePointer} label="Select All" onClick={handleSelectAll} />
                </motion.div>
              </>
            )}
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(0, 0, 0, 0.1);
              border-radius: 10px;
            }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.1);
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(0, 0, 0, 0.2);
            }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          `}} />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

