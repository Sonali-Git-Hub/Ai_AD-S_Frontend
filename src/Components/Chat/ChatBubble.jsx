import React from 'react';
import { motion } from 'framer-motion';
import { User, Download, FileText, FileSpreadsheet, Presentation, File as FileIcon, Edit2, Copy, Trash2, Undo2, ChevronDown, ThumbsUp, ThumbsDown, Share, Volume2, Pause, ExternalLink, Globe, Wand2, Zap, Sparkles, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula as highlighterTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { logo } from '../../constants';
import { MODES } from '../../utils/modeDetection';
import { copyText } from '../../utils/clipboard';
import ActionCard from '../ActionCard';
import AISnapshot from '../../landingpage/AISnapshot';
import toast from 'react-hot-toast';

const CashFlowChartWidget = React.lazy(() => import('../../Tools/AI_Cashflow/CashFlowChartWidget').catch(() => ({ default: () => null })));
const CustomVideoPlayer = React.lazy(() => import('../../Tools/AI_Video_Generator/CustomVideoPlayer').catch(() => ({ default: () => null })));

// Reusable Skeleton loader for streaming messages
const Skeleton = () => (
  <div className="w-full space-y-3 animate-pulse py-2">
    <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded-full w-3/4" />
    <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded-full w-1/2" />
    <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded-full w-5/6" />
  </div>
);

// Simple inline ImageViewer for markdown-embedded images
const ImageViewer = ({ src, alt }) => (
  <img src={src} alt={alt || 'AI Image'} className="max-w-full h-auto object-contain" />
);

const areEqual = (prevProps, nextProps) => {
  if (prevProps.msg !== nextProps.msg) return false;

  const wasLast = prevProps.idx === prevProps.messages.length - 1;
  const isLast = nextProps.idx === nextProps.messages.length - 1;
  if (wasLast !== isLast) return false;

  if (isLast || wasLast) {
    if (prevProps.suggestions !== nextProps.suggestions) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;
  }

  if ((prevProps.typingMessageId === prevProps.msg.id) !== (nextProps.typingMessageId === nextProps.msg.id)) return false;

  if (prevProps.expandedMessages?.[prevProps.msg.id] !== nextProps.expandedMessages?.[nextProps.msg.id]) return false;

  if ((prevProps.activeMessageId === prevProps.msg.id) !== (nextProps.activeMessageId === nextProps.msg.id)) return false;

  const wasEditing = prevProps.editingMessageId === prevProps.msg.id;
  const isEditing = nextProps.editingMessageId === nextProps.msg.id;
  if (wasEditing !== isEditing) return false;

  if (isEditing && prevProps.editContent !== nextProps.editContent) return false;

  if (prevProps.messageFeedback?.[prevProps.msg.id] !== nextProps.messageFeedback?.[nextProps.msg.id]) return false;

  const wasSpeaking = prevProps.speakingMessageId === prevProps.msg.id;
  const isSpeaking = nextProps.speakingMessageId === nextProps.msg.id;
  if (wasSpeaking !== isSpeaking) return false;
  if (isSpeaking && prevProps.isPaused !== nextProps.isPaused) return false;

  if (prevProps.downloadedMessages?.[prevProps.msg.id] !== nextProps.downloadedMessages?.[nextProps.msg.id]) return false;

  if (prevProps.msg.imageUrl) {
    if ((prevProps.isDownloadingUrl === prevProps.msg.imageUrl) !== (nextProps.isDownloadingUrl === nextProps.msg.imageUrl)) return false;
  }

  return true;
};

const ChatBubble = React.memo(({
  msg,
  idx,
  messages,
  typingMessageId,
  expandedMessages,
  setExpandedMessages,
  activeMessageId,
  setActiveMessageId,
  editingMessageId,
  editContent,
  setEditContent,
  startEditing,
  cancelEdit,
  saveEdit,
  messageFeedback,
  handleThumbsUp,
  handleThumbsDown,
  handleCopyMessage,
  handleShare,
  handlePdfAction,
  handleDownload,
  handleMessageDelete,
  handleMessageUndo,
  handleDownloadCodeProject,
  speakResponse,
  speakingMessageId,
  isPaused,
  downloadedMessages,
  isDownloadingUrl,
  navigate,
  activateToolWithTypingEffect,
  setCurrentMode,
  viewingDoc,
  setViewingDoc,
  suggestions,
  handleSuggestionClick,
  isLoading,
  scrollToBottom,
  setIsMagicEditing,
  setEditRefImage,
  inputRef,
  handleCopyImage,
}) => {
  if (!msg) return null;

  const isMediaFeature = msg.mode === MODES.IMAGE_GENERATION ||
    msg.mode === MODES.VIDEO_GENERATION ||
    msg.mode === MODES.IMAGE_EDIT ||
    !!msg.imageUrl || !!msg.videoUrl;

  // System log row (tool activation banners)
  if (msg.isSystemLog) {
    return (
      <div className="w-full flex justify-center">
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-5 py-2.5 my-6 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/50 rounded-2xl w-fit mx-auto shadow-sm"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Zap size={14} className="text-indigo-500" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
            {msg.content.replace(/\*/g, '')}
          </span>
        </motion.div>
      </div>
    );
  }

  const FEEDBACK_PROMPTS_LOCAL = {
    en: ["Was this helpful?","How did I do?","Is this answer detailed enough?","Did I answer your question?","Need anything else?","Is this what you were looking for?","Happy to help!","Let me know if you need more info","Any other questions?","Hope this clears things up!"],
    hi: ["क्या यह मददगार था?","मैंने कैसा किया?","क्या यह जवाब पर्याप्त है?","क्या मैंने आपके सवाल का जवाब दिया?","कुछ और चाहिए?","क्या आप यही खोज रहे थे?","मदद करके खुशी हुई!","अगर और जानकारी चाहिए तो बताएं","कोई और सवाल?","उम्मीद है यह समझ आया!"]
  };

  const TOOL_NAMES = {
    legal_draft_maker: "Draft Maker",
    legal_case_predictor: "Case Predictor",
    legal_argument_builder: "Argument Builder",
    legal_evidence_checker: "Evidence Analyst",
    legal_contract_analyzer: "Contract Analyzer",
    legal_strategy_engine: "Strategy Engine"
  };

  const getModeInfoLocal = (mode) => {
    switch (mode) {
      case MODES.DEEP_SEARCH: return { label: "AI Deep Search", color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" };
      case MODES.WEB_SEARCH: return { label: "AI Web Search", color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" };
      case MODES.IMAGE_GENERATION: return { label: "AI Image Generation", color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" };
      case MODES.VIDEO_GENERATION: return { label: "AI Video Generation", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" };
      case MODES.IMAGE_EDIT: return { label: "AI Magic Edit", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" };
      case MODES.CODING_HELP: return { label: "AI Code Writer", color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" };
      case MODES.DOCUMENT_CONVERT: return { label: "AI Doc Convert", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
      case MODES.FILE_ANALYSIS: return { label: "AI File Analysis", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
      case MODES.LEGAL_TOOLKIT: return { label: "AI Legal™", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-600/10 dark:bg-indigo-400/10", border: "border-indigo-600/20 dark:border-indigo-400/20" };
      case MODES.CASHFLOW: return { label: "AI CashFlow", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
      default: return null;
    }
  };

  const transformLegalActionsLocal = (content) => {
    if (!content) return "";
    const actionRegex = /(?:👉\s*)?(?:\*\*)?([^*:]+)(?:\*\*)?[:\-]?\s*([^\[\n]+)\s*\[(Action:\s*[^\]]+)\]\(action:([^)]+)\)/g;
    return content.replace(actionRegex, (match, title, desc, action, link) => {
      return `\n[ActionCard|${title.trim()}|${desc.trim()}|${action.trim()}](action:${link.trim()})\n`;
    });
  };

  return (
    <div
      key={msg.id}
      data-message-id={msg.id}
      className={`chatgpt-message-row group ${msg.role === 'user' ? 'user-row mb-0 sm:mb-6' : 'ai-row mb-0 sm:mb-8'} ${idx === 0 ? 'mt-1 lg:mt-2' : ''}`}
      onClick={(e) => {
        const selectionText = window.getSelection().toString();
        if (selectionText && selectionText.length > 0) return;
        if (e.target.closest('.selection-toolbar-container')) return;
        setActiveMessageId(activeMessageId === msg.id ? null : msg.id);
      }}
    >
      <div className="chatgpt-message-content select-text">
        <div className="chatgpt-avatar-container w-8 h-8 rounded-full flex items-center justify-center shrink-0">
          {msg.role === 'user' ? (
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              <img src={logo} alt="AISA" className="w-6 h-[18px] object-cover object-top" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 chatgpt-text select-text">
          {msg.role === 'user' && msg.mode && getModeInfoLocal(msg.mode) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`inline-flex !flex-row !items-center w-fit gap-2 px-3 py-1 rounded-full border shadow-sm ${getModeInfoLocal(msg.mode).bg} ${getModeInfoLocal(msg.mode).border} ${getModeInfoLocal(msg.mode).color} mt-1.5 mb-3`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap leading-none">{getModeInfoLocal(msg.mode).label}</span>
            </motion.div>
          )}

          {((msg.attachments && msg.attachments.length > 0) || msg.attachment) && (
            <div className="flex flex-col gap-3 mb-3 mt-1">
              {(msg.attachments || (msg.attachment ? [msg.attachment] : [])).map((att, attIdx) => (
                <div key={attIdx} className="w-full">
                  {att.type === 'image' ? (
                    <div
                      className="relative group/image overflow-hidden rounded-xl border border-white/20 shadow-lg transition-all hover:scale-[1.01] cursor-pointer max-w-[320px]"
                      onClick={() => setViewingDoc(att)}
                    >
                      <img
                        src={att.url}
                        alt="Attachment"
                        className="w-full h-auto max-h-[400px] object-contain bg-black/5"
                        loading="lazy"
                        onError={(e) => {
                          if (att.url && !e.target.dataset.retried) {
                            e.target.dataset.retried = "true";
                            const isSignedUrl = att.url?.includes('X-Goog-Signature');
                            e.target.src = isSignedUrl ? att.url : att.url + (att.url.includes('?') ? '&' : '?') + 'retry=' + Date.now();
                          } else {
                            e.target.src = `https://placehold.co/600x400/333/eee?text=Attachment+Unavailable`;
                          }
                        }}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(att.url, att.name); }}
                        className="absolute top-2 right-2 p-2 bg-black/40 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition-all hover:bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors backdrop-blur-md ${msg.role === 'user' ? 'bg-transparent border-white/20 hover:bg-white/10 shadow-none' : 'bg-secondary/30 border-border hover:bg-secondary/50'}`}>
                      <div
                        className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer p-0.5 rounded-lg"
                        onClick={() => setViewingDoc(att)}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${(() => {
                          const name = (att.name || '').toLowerCase();
                          if (msg.role === 'user') return 'bg-white shadow-sm';
                          if (name.endsWith('.pdf')) return 'bg-red-50 dark:bg-red-900/20';
                          if (name.match(/\.(doc|docx)$/)) return 'bg-blue-50 dark:bg-blue-900/20';
                          if (name.match(/\.(xls|xlsx|csv)$/)) return 'bg-emerald-50 dark:bg-emerald-900/20';
                          if (name.match(/\.(ppt|pptx)$/)) return 'bg-blue-50 dark:bg-blue-900/20';
                          return 'bg-secondary';
                        })()}`}>
                          {(() => {
                            const name = (att.name || '').toLowerCase();
                            if (name.match(/\.(xls|xlsx|csv)$/)) return <FileSpreadsheet className="w-6 h-6 text-emerald-600" />;
                            if (name.match(/\.(ppt|pptx)$/)) return <Presentation className="w-6 h-6 text-blue-600" />;
                            if (name.endsWith('.pdf')) return <FileText className="w-6 h-6 text-red-600" />;
                            if (name.match(/\.(doc|docx)$/)) return <FileIcon className="w-6 h-6 text-blue-600" />;
                            return <FileIcon className="w-6 h-6 text-primary" />;
                          })()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate text-xs mb-0.5">{att.name || 'File'}</p>
                          <p className="text-[10px] opacity-70 uppercase tracking-tight font-medium">
                            {(() => {
                              const name = (att.name || '').toLowerCase();
                              if (name.endsWith('.pdf')) return 'PDF • Preview';
                              if (name.match(/\.(doc|docx)$/)) return 'WORD • Preview';
                              if (name.match(/\.(xls|xlsx|csv)$/)) return 'EXCEL';
                              if (name.match(/\.(ppt|pptx)$/)) return 'SLIDES';
                              return 'DOCUMENT';
                            })()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(att.url, att.name); }}
                        className={`p-2 rounded-lg transition-colors shrink-0 ${msg.role === 'user' ? 'hover:bg-white/20 text-white' : 'hover:bg-primary/10 text-primary'}`}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {editingMessageId === msg.id ? (
            <div className="flex flex-col gap-3 min-w-[200px] w-full mt-2">
              <textarea
                ref={(el) => {
                  if (el) {
                    el.style.height = 'auto';
                    el.style.height = `${el.scrollHeight}px`;
                  }
                }}
                value={editContent}
                onChange={(e) => {
                  setEditContent(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                className="w-full bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white rounded-2xl p-4 text-[15px] focus:outline-none border border-slate-200 dark:border-white/10 placeholder-slate-400 dark:placeholder-white/40 min-h-[56px] max-h-[400px] leading-relaxed resize-none shadow-sm transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/10 overflow-y-auto scrollbar-thin"
                rows={1}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(msg); }
                  if (e.key === 'Escape') cancelEdit();
                }}
              />
              <div className="flex gap-3 justify-end items-center">
                <button onClick={cancelEdit} className="text-slate-500 dark:text-white/80 hover:text-slate-800 dark:hover:text-white text-sm font-medium transition-colors">Cancel</button>
                <button onClick={() => saveEdit(msg)} className="bg-primary text-white dark:bg-white dark:text-primary px-6 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-sm">Update</button>
              </div>
            </div>
          ) : (
            (msg.content || (msg.id === typingMessageId)) && (
              <div id={`msg-text-${msg.id}`} className={`chat-bubble-text break-words overflow-wrap-anywhere ${msg.role === 'model' ? 'prose prose-sm max-w-none' : ''}`}>
                <div className="relative group/msg-content">
                  {msg.id === typingMessageId && !msg.content ? (
                    <Skeleton />
                  ) : (
                    <div className="flex flex-col">
                      <div className={`collapsible-container ${msg.content && msg.content.length > 350 && msg.id !== typingMessageId && expandedMessages[msg.id] === false ? 'collapsed-message' : ''}`}>
                        <ReactMarkdown
                          className="select-text"
                          remarkPlugins={[remarkGfm]}
                          urlTransform={(value) => value}
                          components={{
                            a: ({ href, children }) => {
                              const text = children?.toString() || "";
                              if (href && href.startsWith('action:')) {
                                const isLocked = text.includes('🔒') || text.includes('Unlock');
                                if (text.startsWith('ActionCard|')) {
                                  const parts = text.split('|');
                                  const title = parts[1] || "";
                                  const desc = parts[2] || "";
                                  const actionLabel = (parts[3] || "Open").replace(/^Action:\s*/i, '');
                                  return (
                                    <ActionCard
                                      title={title}
                                      desc={desc}
                                      action={actionLabel}
                                      link={href}
                                      isLocked={isLocked}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        const toolKey = href.replace('action:', '');
                                        setCurrentMode('LEGAL_TOOLKIT');
                                        const toolName = TOOL_NAMES[toolKey] || toolKey;
                                        if (isLocked) { window.dispatchEvent(new CustomEvent('premium_required', { detail: { toolName } })); return; }
                                        activateToolWithTypingEffect(toolKey, toolName);
                                      }}
                                    />
                                  );
                                }
                                return (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const toolKey = href.replace('action:', '');
                                      setCurrentMode('LEGAL_TOOLKIT');
                                      const toolName = TOOL_NAMES[toolKey] || toolKey;
                                      if (isLocked) { window.dispatchEvent(new CustomEvent('premium_required', { detail: { toolName } })); return; }
                                      activateToolWithTypingEffect(toolKey, toolName);
                                    }}
                                    className={`inline-flex mt-2 items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 ${isLocked ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20' : 'bg-gradient-to-r from-primary/10 to-primary-dark/10 border border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/40'}`}
                                  >
                                    {children}
                                    <ChevronRight className="w-4 h-4 ml-1 opacity-70" />
                                  </button>
                                );
                              }
                              const isInternal = href && href.startsWith('/');
                              return (
                                <a
                                  href={href}
                                  onClick={(e) => { if (isInternal) { e.preventDefault(); navigate(href); } }}
                                  className="text-primary hover:underline font-bold cursor-pointer"
                                  target={isInternal ? "_self" : "_blank"}
                                  rel={isInternal ? "" : "noopener noreferrer"}
                                >
                                  {children}
                                </a>
                              );
                            },
                            p: ({ children }) => <p>{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5">{children}</ol>,
                            li: ({ children }) => <li>{children}</li>,
                            h1: ({ children }) => <h1 className="font-bold tracking-tight">{children}</h1>,
                            h2: ({ children }) => <h2 className="font-bold tracking-tight">{children}</h2>,
                            h3: ({ children }) => <h3 className="font-bold tracking-tight">{children}</h3>,
                            strong: ({ children }) => <strong>{children}</strong>,
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-4 rounded-xl border border-border/50 shadow-lg bg-surface/30 backdrop-blur-sm">
                                <table className="w-full border-collapse text-sm">{children}</table>
                              </div>
                            ),
                            thead: ({ children }) => <thead className="bg-primary/10 border-b border-border/50">{children}</thead>,
                            tbody: ({ children }) => <tbody className="divide-y divide-border/30">{children}</tbody>,
                            tr: ({ children }) => <tr className="transition-colors hover:bg-white/3">{children}</tr>,
                            th: ({ children }) => <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-primary">{children}</th>,
                            td: ({ children }) => <td className="px-4 py-3 text-sm text-maintext leading-relaxed">{children}</td>,
                            mark: ({ children }) => <mark className="bg-[#5555ff] text-white px-1 py-0.5 rounded-sm">{children}</mark>,
                            code: ({ node, inline, className, children, ...props }) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const lang = match ? match[1] : '';
                              const codeValue = String(children).replace(/\n$/, '');
                              const isUser = msg.role === 'user';
                              if (!inline) {
                                return (
                                  <div className={`rounded-xl overflow-hidden my-3 border ${isUser ? 'border-white/10 bg-[#282a36]/50' : 'border-[#191a21] bg-[#282a36]'} shadow-2xl w-full max-w-full group/code`}>
                                    {!isUser && (
                                      <div className="flex items-center justify-between px-4 py-3 bg-[#21222c] border-b border-[#191a21]">
                                        <div className="flex items-center gap-2">
                                          <div className="flex items-center gap-1.5 mr-2">
                                            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                                          </div>
                                          <span className="text-[10px] font-black uppercase tracking-widest text-[#6272a4]">{lang || 'plain text'}</span>
                                        </div>
                                        <button
                                          onClick={() => { copyText(codeValue); toast.success("Code copied!"); }}
                                          className="flex items-center gap-1.5 text-[11px] font-bold text-[#6272a4] hover:text-[#f8f8f2] transition-all bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg border border-transparent hover:border-white/10 active:scale-95"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                          Copy
                                        </button>
                                      </div>
                                    )}
                                    <div className={`w-full ${isUser ? 'bg-transparent' : 'bg-[#282a36]'}`}>
                                      <SyntaxHighlighter
                                        className="custom-scrollbar"
                                        language={lang || 'text'}
                                        style={highlighterTheme}
                                        PreTag="div"
                                        customStyle={{ margin: 0, padding: isUser ? '16px' : '20px', fontSize: isUser ? '13px' : '14px', lineHeight: '1.7', background: 'transparent', borderRadius: 0, border: 'none', color: '#f8f8f2', fontFamily: '"Fira Code", "JetBrains Mono", source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace', overflowX: 'auto', overflowY: 'auto', maxHeight: isUser ? '500px' : '600px', WebkitOverflowScrolling: 'touch' }}
                                        codeTagProps={{ style: { fontFamily: 'inherit', background: 'transparent', color: 'inherit', display: 'block', minWidth: 'max-content' } }}
                                        {...props}
                                      >
                                        {codeValue}
                                      </SyntaxHighlighter>
                                    </div>
                                  </div>
                                );
                              }
                              return <code className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-md font-mono text-primary font-bold mx-0.5 text-xs translate-y-[-1px] inline-block" {...props}>{children}</code>;
                            },
                            img: ({ node, ...props }) => {
                              const isDownloading = isDownloadingUrl === props.src;
                              return (
                                <div className="relative my-4 group/img-container max-w-full">
                                  <div className="relative group/image overflow-hidden aspect-auto max-w-[500px] cursor-zoom-in w-fit" onClick={() => setViewingDoc({ url: props.src, type: 'image', name: 'AI Image' })}>
                                    {msg.role === 'model' && (
                                      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center opacity-0 group-hover/img-container:opacity-100 transition-opacity duration-500">
                                        <div className="flex items-center gap-2">
                                          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">AISA™ Generated Asset</span>
                                        </div>
                                      </div>
                                    )}
                                    <img src={props.src} alt={props.alt || "AI Image"} className="max-w-full h-auto object-contain" />
                                  </div>
                                  <button
                                    onClick={() => handleDownload(props.src, `AISA_gen_${Date.now()}.png`)}
                                    disabled={isDownloading}
                                    className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/20 text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
                                  >
                                    {isDownloading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                                    <span className="text-[10px] font-bold uppercase">{isDownloading ? 'Downloading...' : 'Download'}</span>
                                  </button>
                                </div>
                              );
                            },
                          }}
                        >
                          {transformLegalActionsLocal(msg.content || msg.text || "")}
                        </ReactMarkdown>
                      </div>

                      {(msg.content || msg.text) && (msg.content || msg.text).length > 350 && msg.id !== typingMessageId && (
                        <div className="flex justify-start w-full mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedMessages(prev => {
                                const next = { ...prev, [msg.id]: prev[msg.id] === false ? true : false };
                                if (next[msg.id]) { setTimeout(() => scrollToBottom(true, 'smooth'), 100); }
                                return next;
                              });
                            }}
                            className="read-more-btn"
                            title={expandedMessages[msg.id] !== false ? 'Show less' : 'Read full response'}
                            aria-expanded={expandedMessages[msg.id] !== false}
                          >
                            <span className="read-more-btn__text">
                              {expandedMessages[msg.id] !== false ? 'Show less' : 'Read Full Response ↓'}
                            </span>
                            <ChevronDown className={`read-more-btn__icon ${expandedMessages[msg.id] !== false ? 'rotated' : ''}`} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {msg.cashflowData && (
                    <React.Suspense fallback={<div className="h-48 w-full bg-surface-hover animate-pulse rounded-xl" />}>
                      <CashFlowChartWidget data={msg.cashflowData} />
                    </React.Suspense>
                  )}
                </div>

                {msg.role === 'model' && msg.isRealTime && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-4">
                    <p className="text-[10px] font-bold uppercase text-subtext mb-3 flex items-center gap-2">
                      <ExternalLink className="w-3 h-3" />
                      Web Sources
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source, sIdx) => (
                        <a key={sIdx} href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 hover:bg-primary/10 border border-border rounded-lg transition-all group/source">
                          {source.url && source.url.includes('http') ? <Globe className="w-3 h-3 text-subtext group-hover/source:text-primary" /> : <FileText className="w-3 h-3 text-subtext group-hover/source:text-primary" />}
                          <span className="text-xs font-medium text-maintext group-hover/source:text-primary truncate max-w-[150px]">{source.title}</span>
                          <div className="w-4 h-4 bg-primary/20 rounded flex items-center justify-center">
                            <ExternalLink className="w-2.5 h-2.5 text-primary" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {msg.videoUrl && (
                  <div className="relative mt-4 mb-2 w-fit max-w-full">
                    <React.Suspense fallback={<div className="w-full aspect-video bg-black/20 animate-pulse rounded-xl" />}>
                      <CustomVideoPlayer src={msg.videoUrl} compact={true} />
                    </React.Suspense>
                  </div>
                )}

                {msg.imageUrl && (
                  <div
                    className="relative group/generated mt-4 mb-2 overflow-hidden rounded-2xl transition-all duration-500 ease-in-out border border-transparent hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10 cursor-zoom-in w-fit max-w-sm"
                    onClick={() => { if (!viewingDoc) setViewingDoc({ url: msg.imageUrl, type: 'image', name: 'Generated Image' }); }}
                  >
                    <img
                      src={msg.imageUrl}
                      alt="Generated Content"
                      className="w-full h-auto max-h-[420px] object-contain transition-all duration-500"
                      loading="eager"
                      onLoad={() => scrollToBottom(true)}
                      onError={(e) => {
                        if (!e.target.dataset.retried) {
                          e.target.dataset.retried = "true";
                          setTimeout(() => {
                            const isSignedUrl = msg.imageUrl?.includes('X-Goog-Signature');
                            e.target.src = isSignedUrl ? msg.imageUrl : msg.imageUrl + (msg.imageUrl.includes('?') ? '&' : '?') + 'retry=' + Date.now();
                          }, 2000);
                        } else {
                          const finalErrorMsg = msg.imageUrl?.includes('cloudinary') ? 'Cloudinary Error' : 'Image Load Error';
                          e.target.src = `https://placehold.co/600x400/222/fff?text=${encodeURIComponent(finalErrorMsg)}%0AClick+to+Retry`;
                          e.target.style.cursor = 'pointer';
                          e.target.onclick = (event) => {
                            event.stopPropagation();
                            const isSignedUrl = msg.imageUrl?.includes('X-Goog-Signature');
                            e.target.src = isSignedUrl ? msg.imageUrl : msg.imageUrl + (msg.imageUrl.includes('?') ? '&' : '?') + 'manual=' + Date.now();
                          };
                        }
                      }}
                    />
                    <div className="absolute bottom-5 right-4 flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover/generated:opacity-100 transition-all duration-500 scale-100 sm:scale-90 sm:group-hover/generated:scale-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMagicEditing(true);
                          setEditRefImage({ url: msg.imageUrl, name: 'Generated Asset', type: 'image/png' });
                          toast.success('Magic Edit mode active! Type your request.');
                          inputRef.current?.focus();
                        }}
                        className="p-2.5 bg-white/20 backdrop-blur-sm text-primary rounded-xl hover:bg-white/30 shadow-lg border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
                        title="Edit this Image"
                      >
                        <Wand2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopyImage(msg.imageUrl); }}
                        className="p-2.5 bg-white/20 backdrop-blur-sm text-primary rounded-xl hover:bg-white/30 shadow-lg border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
                        title="Copy Image"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        disabled={isDownloadingUrl === msg.imageUrl}
                        onClick={(e) => { e.stopPropagation(); handleDownload(msg.imageUrl, 'AISA-generated.png'); }}
                        className={`p-2.5 rounded-xl shadow-lg border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${isDownloadingUrl === msg.imageUrl ? 'bg-zinc-600 cursor-wait' : 'bg-primary text-white hover:bg-primary/90'}`}
                        title="Download High-Res"
                      >
                        {isDownloadingUrl === msg.imageUrl ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Download className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {msg.role === 'user' ? (
            <div className="mt-3 pt-2 border-t border-slate-200/30 dark:border-white/10 flex items-center justify-end gap-3 w-full">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button onClick={() => handleMessageDelete(msg.id)} className="p-1 text-slate-400 dark:text-zinc-500 hover:text-red-500 hover:bg-red-50/10 rounded transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleMessageUndo(msg)} className="p-1 text-slate-400 dark:text-zinc-500 hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors" title="Undo/Restore to Input">
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                  {!msg.attachment && (
                    <button onClick={() => startEditing(msg)} className="p-1 text-slate-400 dark:text-zinc-500 hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors" title="Edit">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => handleCopyMessage(msg.content || msg.text)} className="p-1 text-slate-400 dark:text-zinc-500 hover:text-maintext hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors" title="Copy">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ) : (
            !msg.isProcessing && !msg.isGenerating && !msg.error && typingMessageId !== msg.id && (
              <div className="mt-3 pt-2 border-t border-slate-200/20 dark:border-zinc-800/80 w-full block">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                  {(() => {
                    const isHindiContent = /[\u0900-\u097F]/.test(msg.content);
                    const prompts = isHindiContent ? FEEDBACK_PROMPTS_LOCAL.hi : FEEDBACK_PROMPTS_LOCAL.en;
                    const msgIdentifier = (msg.id || msg._id || Date.now()).toString();
                    const promptIndex = (msgIdentifier.charCodeAt(msgIdentifier.length - 1) || 0) % prompts.length;
                    return (
                      <p className="text-[11px] text-subtext font-medium flex items-center gap-1.5 shrink-0 m-0 leading-none">
                        {prompts[promptIndex]}
                        <span className="text-xs">😊</span>
                      </p>
                    );
                  })()}
                  <div className="flex flex-col items-end gap-2 self-end sm:self-auto">
                    <div className="flex items-center gap-2">
                      {!isMediaFeature && (() => {
                        const msgIdentifier = (msg.id || msg._id || idx).toString();
                        const isSpeaking = speakingMessageId === msgIdentifier;
                        return (
                          <button
                            onClick={() => speakResponse(msg.content, null, msgIdentifier, msg.attachments || [], true)}
                            className={`transition-colors p-1 rounded ${isSpeaking ? 'text-primary bg-primary/10' : 'text-subtext hover:text-primary hover:bg-surface-hover'}`}
                            title={isSpeaking && !isPaused ? "Pause" : "Speak"}
                          >
                            {isSpeaking && !isPaused ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })()}
                      {!isMediaFeature && (
                        <button onClick={() => handleCopyMessage(msg.content || msg.text)} className="p-1 text-subtext hover:text-maintext hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors" title="Copy">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => handleThumbsUp(msg.id)} className={`transition-colors p-1 rounded ${messageFeedback[msg.id]?.type === 'up' ? 'text-primary bg-primary/10' : 'text-subtext hover:text-primary hover:bg-surface-hover'}`} title="Helpful">
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleThumbsDown(msg.id)} className={`transition-colors p-1 rounded ${messageFeedback[msg.id]?.type === 'down' ? 'text-red-500 bg-red-50/10' : 'text-subtext hover:text-red-500 hover:bg-surface-hover'}`} title="Not Helpful">
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleShare(msg.content)} className="text-subtext hover:text-primary transition-colors p-1 hover:bg-surface-hover rounded" title="Share Text">
                        <Share className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-800 ml-1 pl-1">
                        {(msg.mode === MODES.LEGAL_TOOLKIT || msg.toolUsed?.toLowerCase().startsWith('legal_') || msg.toolUsed?.toLowerCase().includes('legal') || msg.toolUsed === 'Draft Maker') && (
                          <button onClick={() => startEditing(msg)} className="text-primary hover:text-primary transition-all p-1 hover:bg-primary/5 rounded flex items-center gap-1 active:scale-95 group/edit" title="Edit Draft">
                            <Edit2 className="w-3.5 h-3.5 group-hover/edit:scale-110 transition-transform" />
                          </button>
                        )}
                        {(msg.detectedMode === 'CODING_HELP' || msg.detectedMode === 'CODE_WRITER') ? (
                          <button onClick={() => handleDownloadCodeProject(msg)} className="text-primary hover:text-primary-dark transition-all p-1 hover:bg-primary/5 rounded flex items-center gap-1 active:scale-95 group/code" title="Download Code Project (ZIP)">
                            <FileText className="w-3.5 h-3.5 group-hover/code:scale-110 transition-transform" />
                          </button>
                        ) : (
                          !isMediaFeature && (
                            <button
                              onClick={() => handlePdfAction('download', msg)}
                              className={`transition-all p-1 rounded flex items-center gap-1 active:scale-95 group/pdf ${downloadedMessages[msg.id] ? 'text-primary bg-primary/10 hover:bg-primary/20' : 'text-subtext hover:text-primary hover:bg-surface-hover'}`}
                              title="Download Ready-Made PDF Report"
                            >
                              <FileText className="w-3.5 h-3.5 group-hover/pdf:scale-110 transition-transform" />
                            </button>
                          )
                        )}
                      </div>
                      <span className="text-[10px] text-subtext/60 dark:text-subtext/40 font-medium ml-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {msg.conversion && msg.conversion.file && (
            <div className="mt-4 pt-3 border-t border-border/40 space-y-3" style={{ maxWidth: '260px' }}>
              {msg.conversion.mimeType.startsWith('audio/') && (() => {
                const audioSrc = msg.conversion.blobUrl || `data:${msg.conversion.mimeType};base64,${msg.conversion.file}`;
                const playerId = `player-${msg.id}`;
                return (
                  <div className="rounded-2xl overflow-hidden mb-2" style={{ background: 'linear-gradient(135deg, rgba(20,20,40,0.95) 0%, rgba(30,20,60,0.95) 100%)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <div className="px-3 pt-3 pb-1 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                        <Volume2 className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{msg.conversion.fileName}</p>
                        <p className="text-[10px] text-purple-300/60 font-medium">
                          {msg.conversion.fileSize || ''}{msg.conversion.charCount ? ` · ${msg.conversion.charCount}c` : ''} · Audio
                        </p>
                      </div>
                    </div>
                    <div className="px-3 pb-3">
                      <audio id={playerId} src={audioSrc} preload="metadata" style={{ display: 'none' }} />
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={(e) => {
                            const audio = document.getElementById(playerId);
                            if (!audio) return;
                            if (audio.paused) { audio.play(); } else { audio.pause(); }
                          }}
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-lg"
                          style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                        </button>
                        <span className="text-[10px] text-purple-300/60 font-medium">{msg.conversion.fileSize || ''}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
              {!msg.conversion.mimeType.startsWith('audio/') && (
                <div className="flex items-center justify-between px-1 py-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-maintext truncate">{msg.conversion.fileName}</p>
                    <p className="text-[9px] text-subtext font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <span className="px-1 py-0.5 bg-primary/10 text-primary rounded-md">{msg.conversion.fileSize || "Ready"}</span>
                      {msg.conversion.mimeType.includes('pdf') ? 'PDF' : 'DOCX'}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const downloadToast = toast.loading("Starting download...");
                    try {
                      const byteCharacters = atob(msg.conversion.file);
                      const byteNumbers = new Array(byteCharacters.length);
                      for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
                      const byteArray = new Uint8Array(byteNumbers);
                      const blob = new Blob([byteArray], { type: msg.conversion.mimeType });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = msg.conversion.fileName;
                      document.body.appendChild(a); a.click();
                      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); toast.dismiss(downloadToast); toast.success("Download complete!"); }, 500);
                    } catch (err) { toast.dismiss(downloadToast); toast.error("Download failed"); }
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-white rounded-lg transition-all shadow-lg font-bold text-[11px] active:scale-95 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          )}

          {idx === messages.length - 1 && (msg.role === 'model' || msg.role === 'assistant') &&
            suggestions.length > 0 && !isLoading && !typingMessageId && (
              <div className="suggestions-container animate-in fade-in slide-in-from-bottom-3 duration-500">
                {suggestions.map((item, sugIdx) => (
                  <button key={sugIdx} onClick={() => handleSuggestionClick(item)} className="suggestion-btn">
                    {item}
                  </button>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}, areEqual);

ChatBubble.displayName = 'ChatBubble';
export default ChatBubble;
