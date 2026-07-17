import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecoilState } from 'recoil';
import { useIsDark } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { toggleState } from '../../userStore/userData';
import { logo } from '../../constants';
import LegalLogo from '../../Tools/AI_Legal/components/LegalLogo';

import {
  X, FileText, Edit2, AlertCircle, Camera, Paperclip, Sliders, Image as ImageIcon, Video, Globe,
  Volume2, Mic, Minimize2, Maximize2, SendHorizontal, Headphones, Code, Wand2, ChevronDown, Check,
  Sparkles, MessageSquare, PlaySquare, Megaphone, TrendingUp, Search, Plus, Brain
} from 'lucide-react';

const SendRipple = ({ onComplete }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <motion.div
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: 3.5, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        onAnimationComplete={onComplete}
        className="absolute inset-0 rounded-full border-2 border-primary/40 bg-primary/5"
      />
      {/* Mini Sparkle Burst for Send */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const dist = 60 + Math.random() * 40;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <Sparkles size={10} className="text-primary fill-current" />
          </motion.div>
        );
      })}
    </div>
  );
};

export const ChatInput = ({
  legalView,
  currentMode,
  selectedLegalTool,
  viewingDoc,
  inputValue,
  setInputValue,
  filePreviews,
  longTextPreview,
  setLongTextPreview,
  setIsAutoPreviewDisabled,
  isAutoPreviewDisabled,
  isMagicEditing,
  editRefImage,
  setEditRefImage,
  isInputExpanded,
  setIsInputExpanded,
  isCashFlowMode,
  isSearchingStocks,
  stockSearchResults,
  setSelectedStock,
  setStockSearchResults,
  isAttachMenuOpen,
  setIsAttachMenuOpen,
  isToolsMenuOpen,
  setIsToolsMenuOpen,
  isWebSearch,
  isDeepSearch,
  isImageGeneration,
  isVideoGeneration,
  isVoiceMode,
  isAudioConvertMode,
  isDocumentConvert,
  isCodeWriter,
  activeAgent,
  messages,
  isListening,
  gen,
  ripples,
  setRipples,
  isLaunching,
  isLimitReached,
  typedPlaceholder,
  activeTool,
  imageAspectRatio,
  imageModelId,
  videoAspectRatio,
  videoResolution,
  setIsStockModalOpen,
  setIsMagicSettingsOpen,
  isMagicSettingsOpen,
  setIsVideoGeneration,
  setIsImageGeneration,
  setIsDeepSearch,
  setIsWebSearch,
  setIsAudioConvertMode,
  setIsDocumentConvert,
  setIsCodeWriter,
  setIsMagicEditing,
  setIsMagicImageModalOpen,
  setIsMagicVideoModalOpen,
  setIsCashFlowMode,
  setIsSocialMediaDashboardOpen,
  setLegalView,
  setCurrentCase,
  setCurrentProjectId,
  isFileAnalysis,
  setIsFileAnalysis,
  setActiveTool,
  setCurrentMode,
  setSelectedLegalTool,
  checkPremiumTool,
  activeSessionId,
  abortControllerRef,
  setIsLoading,
  getSessionLock,
  isSendHovered,
  setIsSendHovered,
  toast,
  navigate,
  editRefImageState,

  // Refs
  inputRef,
  uploadInputRef,
  driveInputRef,
  photosInputRef,
  cameraInputRef,
  menuRef,
  toolsMenuRef,
  attachBtnRef,
  toolsBtnRef,

  // Constants
  TOOL_PRICING,
  TOOL_PLACEHOLDERS,
  MODES,
  handleSendMessage,
  handleRemoveFile,
  handleFileSelect,
  handleDocToVoiceSelect,
  handleVoiceInput,
  setIsVoiceSettingsOpen
}) => {
  const isDark = useIsDark();
  const { t } = useLanguage();
  const [tglState] = useRecoilState(toggleState);

  const getAgentCapabilities = (agentName, category) => {
    const name = (agentName || '').toLowerCase();
    const cat = (category || '').toLowerCase();
    if (name === 'AI Ads' || !name) {
      return {
        canUploadImages: true,
        canUploadDocs: true,
        canVoice: true,
        canVideo: true,
        canCamera: true
      };
    }
    const caps = {
      canUploadImages: true,
      canUploadDocs: true,
      canVoice: true,
      canVideo: true,
      canCamera: true
    };
    if (cat.includes('hr') || cat.includes('finance') || name.includes('doc') || name.includes('legal')) {
      caps.canVideo = false;
      caps.canCamera = false;
      caps.canUploadImages = false;
    } else if (cat.includes('design') || cat.includes('creative') || name.includes('photo')) {
      caps.canVoice = false;
      caps.canVideo = false;
      caps.canUploadDocs = false;
    } else if (name.includes('voice') || name.includes('call') || name.includes('bot')) {
      caps.canUploadImages = false;
      caps.canUploadDocs = false;
      caps.canCamera = false;
      caps.canVideo = false;
    } else if (cat.includes('medical') || cat.includes('health')) {
      caps.canVideo = false;
      caps.canUploadImages = true;
    }
    return caps;
  };

  const hiddenSidebar = tglState.sidebarOpen && window.innerWidth < 1024;
  const showInput =
    legalView !== 'DASHBOARD' &&
    legalView !== 'PRECEDENTS' &&
    !(currentMode === 'LEGAL_TOOLKIT' && selectedLegalTool?.id && selectedLegalTool.id !== 'legal_my_case') &&
    !viewingDoc;

  if (!showInput) return null;

  return (
    <div className={`absolute bottom-0 left-0 right-0 z-[1001] pointer-events-none aisa-chat-input-container ${hiddenSidebar ? 'hidden' : ''}`}>
      {/* Background solid layer to hide text scrolling behind/below input */}
      <div className="relative z-20 bg-slate-50 dark:bg-[#0b0c15] sm:bg-white sm:dark:bg-[#0b0c15]" style={{ padding: '0.5rem 1rem calc(1.75rem + env(safe-area-inset-bottom, 0px)) 1rem' }}>
        <div className="max-w-4xl mx-auto w-full pointer-events-auto">

          <form
            onSubmit={handleSendMessage}
            className="relative w-full flex flex-col transition-all duration-300 p-1 z-[1002] aisa-chat-input-wrapper bg-white dark:bg-[#121212] border border-slate-200/60 dark:border-zinc-800 rounded-[28px] sm:rounded-[32px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none overflow-visible"
          >
            {/* Internal File Preview Area */}
            {(filePreviews.length > 0 || longTextPreview) && (
              <div className="flex flex-wrap gap-4 px-3 py-2 mb-1">
                {filePreviews.map((preview) => (
                  <div key={preview.id} className="relative group shrink-0 w-[68px] sm:w-[76px] aspect-square bg-slate-100 dark:bg-zinc-800 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-700 overflow-visible">
                    {preview.type.startsWith('image/') ? (
                      <div className="w-full h-full rounded-2xl overflow-hidden">
                        <img src={preview.url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-1">
                        <FileText className="w-7 h-7 text-primary/60" />
                        <span className="text-[7px] font-black uppercase text-primary/70 mt-1 truncate px-1">{preview.type.split('/')[1]?.split('-')[0] || 'FILE'}</span>
                      </div>
                    )}
                    <div className="absolute -top-1.5 -right-1.5 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all z-[101]">
                      <button type="button" className="w-6 h-6 bg-white dark:bg-zinc-700 text-slate-800 dark:text-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 dark:border-zinc-600 hover:scale-110"><Edit2 size={12} /></button>
                      <button type="button" onClick={() => handleRemoveFile(preview.id)} className="w-6 h-6 bg-white dark:bg-zinc-700 text-red-500 rounded-full flex items-center justify-center shadow-lg border border-slate-100 dark:border-zinc-600 hover:scale-110"><X size={12} /></button>
                    </div>
                  </div>
                ))}

                {longTextPreview && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="max-w-[85%] sm:max-w-[70%] mb-2"
                  >
                    <div className="p-2 sm:p-2.5 bg-slate-50 dark:bg-zinc-800/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-zinc-700/50 flex items-center justify-between group shadow-md">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[9px] font-black text-primary uppercase tracking-[0.1em] mb-0">Text Preview</p>
                          <p className="text-[12px] text-slate-600 dark:text-zinc-400 truncate font-medium">
                            {longTextPreview.substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3 pr-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAutoPreviewDisabled(true);
                            setInputValue(longTextPreview);
                            setLongTextPreview(null);
                            if (inputRef.current) {
                              setTimeout(() => {
                                inputRef.current.focus();
                                inputRef.current.style.height = 'auto';
                                inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 140)}px`;
                              }, 50);
                            }
                          }}
                          className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors uppercase"
                        >
                          Show in field
                        </button>
                        <button
                          type="button"
                          onClick={() => { setLongTextPreview(null); setIsAutoPreviewDisabled(false); }}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-full transition-colors text-slate-400 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Reference Image Preview */}
            {isMagicEditing && editRefImage && filePreviews.length === 0 && (
              <div className="flex p-2 mb-1">
                <div className="relative group shrink-0 w-16 h-16 bg-white dark:bg-zinc-800 border border-primary/20 rounded-xl shadow-md overflow-visible">
                  <img src={editRefImage.url} alt="Reference" className="w-full h-full object-cover rounded-xl" />
                  <button type="button" onClick={() => setEditRefImage(null)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-lg border border-white/20"><X size={12} /></button>
                </div>
              </div>
            )}

            <input id="file-upload" type="file" ref={uploadInputRef} onChange={handleFileSelect} multiple className="hidden" />
            <input id="drive-upload" type="file" ref={driveInputRef} onChange={handleFileSelect} multiple className="hidden" />
            <input id="doc-voice-upload" type="file" onChange={handleDocToVoiceSelect} className="hidden" accept=".pdf,.doc,.docx,.txt" />
            <input id="photos-upload" type="file" ref={photosInputRef} onChange={handleFileSelect} multiple className="hidden" accept="image/*" />
            <input id="camera-upload" type="file" ref={cameraInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" capture="environment" />

            <div className={`flex w-full gap-2 ${isInputExpanded || inputValue.includes('\n') || inputValue.length > 100 ? 'items-end' : 'items-center'}`}>

              {/* AI CashFlow Search Results Dropdown */}
              {isCashFlowMode && inputValue.trim().length >= 2 && !isSearchingStocks && (
                <div className="absolute bottom-full left-0 right-0 mb-3 px-2 z-[1020] pointer-events-auto max-h-[300px] overflow-y-auto custom-scrollbar">
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
                    {stockSearchResults.length === 0 ? (
                      <div className="px-4 py-6 text-center text-rose-500">
                        <AlertCircle className="w-6 h-6 mx-auto mb-1.5 opacity-80" />
                        <p className="text-xs font-bold uppercase tracking-wider">This stock is not supported by the selected market.</p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium mt-0.5">Only Indian stocks are currently available.</p>
                      </div>
                    ) : (
                      stockSearchResults.map((stock) => (
                        <button
                          key={stock.symbol}
                          type="button"
                          onClick={() => {
                            setSelectedStock(stock);
                            setInputValue(stock.name);
                            setStockSearchResults([]);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-primary/10 border-b border-slate-100 dark:border-zinc-800 last:border-0 flex items-center justify-between group transition-colors"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors">{stock.symbol}</span>
                            <span className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1">{stock.name}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-slate-500 dark:text-zinc-400 font-bold uppercase">{stock.region}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Menu Backdrop Layer */}
              <AnimatePresence>
                {(isAttachMenuOpen || isToolsMenuOpen) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1010] bg-black/5 dark:bg-black/20 backdrop-blur-[1px] pointer-events-auto"
                    onClick={() => {
                      setIsAttachMenuOpen(false);
                      setIsToolsMenuOpen(false);
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Left Attach Dropdown Menu */}
              <AnimatePresence>
                {isAttachMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                    ref={menuRef}
                    className={`fixed sm:absolute bottom-[max(80px,calc(env(safe-area-inset-bottom)+80px))] sm:bottom-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 ${(isWebSearch || isDeepSearch || isImageGeneration || isVideoGeneration || isVoiceMode || isAudioConvertMode || isDocumentConvert || isCodeWriter || isMagicEditing || isFileAnalysis || isCashFlowMode || currentMode === 'LEGAL_TOOLKIT') ? 'sm:mb-[68px]' : 'sm:mb-6'} w-[calc(100%-32px)] sm:w-[220px] bg-white/95 dark:bg-[#1c1c1e]/95 border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden z-[1020] backdrop-blur-xl ring-1 ring-black/[0.05]`}
                  >
                    <div className="p-2.5 space-y-1">
                      {getAgentCapabilities(activeAgent.agentName, activeAgent.category).canCamera && (
                        <button
                          type="button"
                          onClick={() => {
                            cameraInputRef.current?.click();
                            setIsAttachMenuOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 hover:bg-primary/10 rounded-xl transition-all group cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors shrink-0">
                            <Camera className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors" />
                          </div>
                          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">Camera & Scan</span>
                        </button>
                      )}
                      <label
                        htmlFor="file-upload"
                        onClick={() => setIsAttachMenuOpen(false)}
                        className="w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 hover:bg-primary/10 rounded-xl transition-all group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors shrink-0">
                          <Paperclip className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">Upload files</span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tools Menu slide up */}
              <AnimatePresence>
                {isToolsMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                    ref={toolsMenuRef}
                    className={`fixed sm:absolute bottom-[max(80px,calc(env(safe-area-inset-bottom)+80px))] sm:bottom-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 ${(isWebSearch || isDeepSearch || isImageGeneration || isVideoGeneration || isVoiceMode || isAudioConvertMode || isDocumentConvert || isCodeWriter || isMagicEditing || isFileAnalysis || isCashFlowMode || currentMode === 'LEGAL_TOOLKIT') ? 'sm:mb-[68px]' : 'sm:mb-6'} w-[calc(100%-24px)] sm:w-[320px] bg-white dark:bg-[#1c1c1e] border border-slate-200/50 dark:border-white/10 rounded-[32px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)] overflow-hidden z-[1020] ring-1 ring-black/[0.05] backdrop-blur-xl`}
                    style={{ maxHeight: 'calc(100vh - 180px)' }}
                  >
                    <div className="px-6 py-5 bg-slate-50/50 dark:bg-white/5 border-b border-slate-200/50 dark:border-white/5 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20 shadow-inner">
                          <img src={logo} alt="AISA" className="w-8 h-5.5 object-cover object-top" />
                        </div>
                        <div>
                          <h3 className="text-[17px] font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">
                            AISA ™ Magic Tools
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Advanced Suite</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 pb-12 space-y-1.5 overflow-y-auto scrollbar-hide scroll-smooth will-change-transform" style={{ maxHeight: 'calc(100vh - 220px)' }}>

                      <button
                        type="button"
                        onClick={() => {
                          if (!checkPremiumTool('Generate Image')) return;
                          setIsToolsMenuOpen(false);
                          const newMode = !isImageGeneration;
                          setIsImageGeneration(newMode);
                          setIsVideoGeneration(false);
                          setIsDeepSearch(false);
                          setIsAudioConvertMode(false);
                          setIsDocumentConvert(false);
                          setIsCodeWriter(false);
                          if (newMode) {
                            setActiveTool('image');
                            toast.success("Image Generation Mode Enabled");
                          } else {
                            setActiveTool(null);
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isImageGeneration ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                      >
                        <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 tool-icon-premium ${isImageGeneration ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                          <ImageIcon className="w-5.5 h-5.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                            <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Generate Image</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Create unique AI art from your text.</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!checkPremiumTool('Generate Video')) return;
                          setIsToolsMenuOpen(false);
                          const newMode = !isVideoGeneration;
                          setIsVideoGeneration(newMode);
                          setIsImageGeneration(false);
                          setIsDeepSearch(false);
                          setIsAudioConvertMode(false);
                          setIsDocumentConvert(false);
                          setIsCodeWriter(false);
                          if (newMode) {
                            setActiveTool('video');
                            toast.success("Video Generation Mode Enabled");
                          } else {
                            setActiveTool(null);
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isVideoGeneration ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                      >
                        <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 tool-icon-premium ${isVideoGeneration ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                          <Video className="w-5.5 h-5.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                            <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Generate Video</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Convert scenes into dynamic videos.</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!checkPremiumTool('Web Search')) return;
                          setIsToolsMenuOpen(false);
                          setIsWebSearch(!isWebSearch);
                          setIsDeepSearch(false);
                          setIsImageGeneration(false);
                          setIsVideoGeneration(false);
                          setIsAudioConvertMode(false);
                          setIsDocumentConvert(false);
                          setIsCodeWriter(false);
                          if (!isWebSearch) {
                            setActiveTool('web_search');
                            toast.success("Real-Time Web Search Active");
                          } else {
                            setActiveTool(null);
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isWebSearch ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                      >
                        <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 tool-icon-premium ${isWebSearch ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                          <Globe className="w-5.5 h-5.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                            <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Web Search</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Fast and accurate web queries.</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!checkPremiumTool('Deep Search')) return;
                          setIsToolsMenuOpen(false);
                          setIsDeepSearch(!isDeepSearch);
                          setIsWebSearch(false);
                          setIsImageGeneration(false);
                          setIsVideoGeneration(false);
                          setIsAudioConvertMode(false);
                          setIsDocumentConvert(false);
                          setIsCodeWriter(false);
                          if (!isDeepSearch) {
                            setActiveTool('deep_search');
                            toast.success("Deep Search Mode Enabled");
                          } else {
                            setActiveTool(null);
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isDeepSearch ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                      >
                        <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 tool-icon-premium ${isDeepSearch ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                          <Search className="w-5.5 h-5.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                            <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Deep Search</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">In-depth analysis and data mining.</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!checkPremiumTool('Convert to Audio')) return;
                          setIsToolsMenuOpen(false);
                          setIsAudioConvertMode(!isAudioConvertMode);
                          setIsDeepSearch(false);
                          setIsImageGeneration(false);
                          setIsVideoGeneration(false);
                          setIsDocumentConvert(false);
                          setIsCodeWriter(false);
                          if (!isAudioConvertMode) {
                            setActiveTool('audio');
                            toast.success("Convert to Audio Mode Active");
                          } else {
                            setActiveTool(null);
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isAudioConvertMode ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                      >
                        <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 tool-icon-premium ${isAudioConvertMode ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                          <Headphones className="w-5.5 h-5.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                            <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Convert to Audio</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Natural-sounding text-to-speech.</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!checkPremiumTool('Document Converter')) return;
                          setIsToolsMenuOpen(false);
                          const nextState = !isDocumentConvert;
                          setIsDocumentConvert(nextState);
                          setIsFileAnalysis(false);
                          setIsDeepSearch(false);
                          setIsImageGeneration(false);
                          setIsVideoGeneration(false);
                          setIsAudioConvertMode(false);
                          setIsCodeWriter(false);
                          if (nextState) {
                            setActiveTool('document');
                            uploadInputRef.current?.click();
                            toast.success("Document Converter Mode Active");
                          } else {
                            setActiveTool(null);
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isDocumentConvert ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                      >
                        <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 tool-icon-premium ${isDocumentConvert ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                          <FileText className="w-5.5 h-5.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                            <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Convert Documents</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Format conversion and text extraction.</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!checkPremiumTool('Code Writer')) return;
                          setIsToolsMenuOpen(false);
                          setIsCodeWriter(!isCodeWriter);
                          setIsDeepSearch(false);
                          setIsImageGeneration(false);
                          setIsVideoGeneration(false);
                          setIsAudioConvertMode(false);
                          setIsDocumentConvert(false);
                          setIsMagicEditing(false);
                          if (!isCodeWriter) {
                            setActiveTool('code');
                            toast.success("Code Writer Mode Enabled");
                          } else {
                            setActiveTool(null);
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isCodeWriter ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                      >
                        <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 tool-icon-premium ${isCodeWriter ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                          <Code className="w-5.5 h-5.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                            <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Code Writer</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Generate multi-language code snippets.</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!checkPremiumTool('Edit Image')) return;
                          setIsToolsMenuOpen(false);
                          const newMode = !isMagicEditing;
                          setIsMagicEditing(newMode);
                          setIsMagicImageModalOpen(false);

                          if (newMode && !editRefImageState && messages.length > 0) {
                            const lastImg = [...messages].reverse().find(m => m.imageUrl);
                            if (lastImg) setEditRefImage({ url: lastImg.imageUrl, name: 'Last Generated', type: 'image' });
                          }

                          setIsImageGeneration(false);
                          setIsVideoGeneration(false);
                          setIsDeepSearch(false);
                          setIsWebSearch(false);
                          setIsAudioConvertMode(false);
                          setIsDocumentConvert(false);
                          setIsCodeWriter(false);
                          setIsCashFlowMode(false);
                          setIsFileAnalysis(false);
                          if (newMode) {
                            setActiveTool('edit_image');
                            toast.success("Image Editing Enabled");
                          } else {
                            setActiveTool(null);
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isMagicEditing ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                      >
                        <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 tool-icon-premium ${isMagicEditing ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                          <Wand2 className="w-5.5 h-5.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                            <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Edit Image</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Magic Image Editor.</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!checkPremiumTool('AI CashFlow')) return;
                          setIsToolsMenuOpen(false);
                          const newMode = !isCashFlowMode;
                          setIsCashFlowMode(newMode);
                          setIsImageGeneration(false);
                          setIsVideoGeneration(false);
                          setIsDeepSearch(false);
                          setIsWebSearch(false);
                          setIsAudioConvertMode(false);
                          setIsDocumentConvert(false);
                          setIsCodeWriter(false);
                          setIsMagicEditing(false);
                          setIsFileAnalysis(false);
                          if (newMode) {
                            setActiveTool('ai_cashflow');
                            setIsStockModalOpen(true);
                            toast.success("AI CashFlow Explorer Active");
                          } else {
                            setActiveTool(null);
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${isCashFlowMode ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                      >
                        <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 tool-icon-premium ${isCashFlowMode ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                          <TrendingUp className="w-5.5 h-5.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                            <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">AI CashFlow</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Live Analysis & Reports.</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!checkPremiumTool('AI Legal')) return;
                          setIsToolsMenuOpen(false);

                          const isCurrentlyLegal = currentMode === 'LEGAL_TOOLKIT';

                          if (!isCurrentlyLegal) {
                            setCurrentMode(MODES.LEGAL_TOOLKIT);
                            setSelectedLegalTool({ id: 'legal_my_case', name: 'AI Legal' });
                            setLegalView('DASHBOARD');
                            setIsMagicVideoModalOpen(false);
                            setCurrentCase(null);
                            setCurrentProjectId(null);
                          } else {
                            setCurrentMode(MODES.NORMAL_CHAT);
                            setSelectedLegalTool(null);
                            setLegalView('CHAT');
                          }

                          setIsImageGeneration(false);
                          setIsVideoGeneration(false);
                          setIsDeepSearch(false);
                          setIsAudioConvertMode(false);
                          setIsDocumentConvert(false);
                          setIsCodeWriter(false);
                          setIsMagicEditing(false);
                          if (!isCurrentlyLegal) {
                            setActiveTool('legal');
                            navigate('/dashboard/legal', { replace: true });
                            toast.success("AI Legal Enabled ⚖️");
                          } else {
                            setActiveTool(null);
                            navigate('/dashboard/chat/new', { replace: true });
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 ${currentMode === 'LEGAL_TOOLKIT' ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md'}`}
                      >
                        <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 tool-icon-premium ${currentMode === 'LEGAL_TOOLKIT' ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300'}`}>
                          <LegalLogo size={32} showText={true} style={{ color: currentMode === 'LEGAL_TOOLKIT' ? '#fff' : undefined }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                            <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">AI Legal</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">{t('aiLegalToolsCount')}</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!checkPremiumTool('Image to Video')) return;
                          setIsToolsMenuOpen(false);
                          setIsMagicVideoModalOpen(true);
                          setActiveTool('image_to_video');
                          toast.success("Image to Video Mode Active");
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md`}
                      >
                        <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 tool-icon-premium bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300`}>
                          <PlaySquare className="w-5.5 h-5.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                            <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">Image to Video</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Animate your images with AI magic.</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!checkPremiumTool('AI Ad Agent')) return;
                          setIsToolsMenuOpen(false);
                          setIsSocialMediaDashboardOpen(true);
                          setActiveTool('aiad_agent');
                          toast.success("AI ADS™ Active");
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3.5 rounded-3xl transition-all group cursor-pointer border-2 bg-white/50 dark:bg-white/5 border-white/80 dark:border-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-md`}
                      >
                        <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 tool-icon-premium bg-slate-50 dark:bg-zinc-800 border-white dark:border-zinc-700 text-slate-600 dark:text-slate-300`}>
                          <Megaphone className="w-5.5 h-5.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="aisa-badge-small !bg-primary !text-white !font-black !px-2 !rounded-md">AISA ™</span>
                            <span className="text-[14.5px] font-extrabold text-slate-800 dark:text-white leading-none">AIADS™</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Automate 30 days of social media content.</p>
                        </div>
                      </button>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-1 sm:gap-2 pl-1.5 sm:pl-3 shrink-0">
                <div className="relative">
                  <motion.button
                    type="button"
                    ref={attachBtnRef}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setIsAttachMenuOpen(!isAttachMenuOpen);
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] rounded-full flex items-center justify-center bg-slate-50 dark:bg-zinc-800 text-slate-500 hover:text-primary transition-all border border-slate-200/50 dark:border-zinc-700/50 shadow-sm relative z-[1003]"
                    title="Attachments"
                  >
                    <Plus className={`w-5 h-5 transition-transform duration-300 ${isAttachMenuOpen ? 'rotate-45' : ''}`} />
                  </motion.button>
                </div>

                <div className="relative">
                  <motion.button
                    type="button"
                    ref={toolsBtnRef}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      setIsToolsMenuOpen(!isToolsMenuOpen);
                      setIsAttachMenuOpen(false);
                    }}
                    className="w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] rounded-full flex items-center justify-center bg-slate-50 dark:bg-zinc-800 text-slate-500 hover:text-primary transition-all border border-slate-200/50 dark:border-zinc-700/50 shadow-sm relative z-[1003]"
                    title="AISA ™ Magic Tools"
                  >
                    <Brain className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="flex-1 flex items-start min-w-0 bg-transparent border-0 ring-0 focus:ring-0 group">
                <AnimatePresence>
                  {(isWebSearch || isDeepSearch || isImageGeneration || isVideoGeneration || isVoiceMode || isAudioConvertMode || isDocumentConvert || isCodeWriter || isMagicEditing || isFileAnalysis || isCashFlowMode || currentMode === 'LEGAL_TOOLKIT') && (
                    <div className="absolute bottom-full left-0 mb-3.5 flex flex-row items-center justify-start pointer-events-none z-[100] w-full">
                      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pointer-events-auto px-2 sm:px-3 py-1 max-w-full">
                        {isCashFlowMode && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsStockModalOpen(true)}
                            className="flex flex-row items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-transparent backdrop-blur-md whitespace-nowrap shrink-0 cursor-pointer hover:bg-primary/20 transition-all"
                          >
                            <TrendingUp size={12} strokeWidth={3} /> <span className="hidden sm:inline">AI CashFlow</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsCashFlowMode(false);
                                setActiveTool(null);
                              }}
                              className="ml-1 hover:text-primary/80 p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </motion.div>
                        )}
                        {isWebSearch && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-row items-center gap-3 px-3.5 py-1.5 bg-primary/20 dark:bg-primary/25 text-primary rounded-full text-xs font-bold border border-primary/40 backdrop-blur-3xl whitespace-nowrap shrink-0 transition-all hover:bg-primary/30 group shadow-[0_8px_32px_-4px_rgba(var(--primary-rgb),0.3)] relative overflow-hidden ring-1 ring-white/10"
                          >
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
                            <div className="flex flex-row items-center gap-2 relative z-10">
                              <div className="w-5 h-5 rounded-lg bg-primary dark:bg-primary flex flex-row items-center justify-center shadow-lg shadow-primary/40 text-white">
                                <Globe size={14} strokeWidth={3} />
                              </div>
                              <span className="uppercase tracking-widest text-[9px] font-black">Web Search</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setIsWebSearch(false); setActiveTool(null); }}
                              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white text-primary dark:text-primary transition-all hover:rotate-90 relative z-10"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        )}
                        {isDeepSearch && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-row items-center gap-3 px-3.5 py-1.5 bg-primary/20 dark:bg-primary/25 text-primary rounded-full text-xs font-bold border border-primary/40 backdrop-blur-3xl whitespace-nowrap shrink-0 transition-all hover:bg-primary/30 group shadow-[0_8px_32px_-4px_rgba(var(--primary-rgb),0.3)] relative overflow-hidden ring-1 ring-white/10"
                          >
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
                            <div className="flex flex-row items-center gap-2 relative z-10">
                              <div className="w-5 h-5 rounded-lg bg-primary dark:bg-primary flex items-center justify-center shadow-lg shadow-primary/40 text-white">
                                <Search size={14} strokeWidth={3} />
                              </div>
                              <span className="uppercase tracking-widest text-[9px] font-black">Deep Search</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setIsDeepSearch(false); setActiveTool(null); }}
                              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white text-primary dark:text-primary transition-all hover:rotate-90 relative z-10"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        )}
                        {isImageGeneration && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-row items-center gap-3 px-3.5 py-1.5 bg-primary/20 dark:bg-primary/25 text-primary rounded-full text-xs font-bold border border-primary/40 backdrop-blur-3xl whitespace-nowrap shrink-0 transition-all hover:bg-primary/30 group shadow-[0_8px_32px_-4px_rgba(var(--primary-rgb),0.3)] relative overflow-hidden ring-1 ring-white/10"
                          >
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
                            <div className="flex flex-row items-center gap-2 relative z-10">
                              <div className="w-5 h-5 rounded-lg bg-primary dark:bg-primary flex items-center justify-center shadow-lg shadow-primary/40 text-white">
                                <ImageIcon size={14} strokeWidth={3} />
                              </div>
                              <span className="uppercase tracking-widest text-[9px] font-black">Image Gen</span>
                            </div>
                            <div className="w-[1px] h-3 bg-primary/40 mx-0.5 relative z-10" />
                            <button
                              type="button"
                              onClick={() => setIsMagicSettingsOpen(!isMagicSettingsOpen)}
                              className="flex flex-row items-center gap-1.5 hover:text-primary dark:hover:text-primary transition-all px-1.5 py-0.5 rounded-md hover:bg-white/10 relative z-10"
                            >
                              <span className="text-[10px] font-extrabold opacity-90">{imageAspectRatio}</span>
                              <span className="text-[10px] font-black truncate max-w-[60px] sm:max-w-[100px] tracking-tight">
                                {TOOL_PRICING.image.models.find(m => m.id === imageModelId)?.name.replace('AISA ', '') || 'Model'}
                              </span>
                              <ChevronDown size={11} className={`transition-transform duration-300 ${isMagicSettingsOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => { setIsImageGeneration(false); setActiveTool(null); }}
                              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white text-primary dark:text-primary transition-all hover:rotate-90 relative z-10"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        )}
                        {isVideoGeneration && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-row items-center gap-3 px-3.5 py-1.5 bg-primary/20 dark:bg-primary/25 text-primary rounded-full text-xs font-bold border border-primary/40 backdrop-blur-3xl whitespace-nowrap shrink-0 transition-all hover:bg-primary/30 group shadow-[0_8px_32px_-4px_rgba(var(--primary-rgb),0.3)] relative overflow-hidden ring-1 ring-white/10"
                          >
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
                            <div className="flex flex-row items-center gap-2 relative z-10">
                              <div className="w-5 h-5 rounded-lg bg-primary dark:bg-primary flex items-center justify-center shadow-lg shadow-primary/40 text-white">
                                <Video size={14} strokeWidth={3} />
                              </div>
                              <span className="uppercase tracking-widest text-[9px] font-black">Video Gen</span>
                            </div>
                            <div className="w-[1px] h-3 bg-primary/40 mx-0.5 relative z-10" />
                            <button
                              type="button"
                              onClick={() => setIsMagicSettingsOpen(!isMagicSettingsOpen)}
                              className="flex flex-row items-center gap-1.5 hover:text-primary dark:hover:text-primary transition-all px-1.5 py-0.5 rounded-md hover:bg-white/10 relative z-10"
                            >
                              <span className="text-[10px] font-extrabold opacity-90">{videoAspectRatio || 'D'}</span>
                              <span className="text-[10px] font-black tracking-tight ml-1">{videoResolution}</span>
                              <ChevronDown size={11} className={`transition-transform duration-300 ${isMagicSettingsOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => { setIsVideoGeneration(false); setActiveTool(null); }}
                              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white text-primary dark:text-primary transition-all hover:rotate-90 relative z-10"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        )}
                        {isVoiceMode && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex flex-row items-center gap-2.5 px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-xs font-bold border border-primary/30 backdrop-blur-xl whitespace-nowrap shrink-0 transition-all hover:bg-primary/15 group shadow-lg shadow-primary/10"
                          >
                            <div className="flex flex-row items-center gap-2">
                              <div className="w-5 h-5 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Volume2 size={14} strokeWidth={2.5} />
                              </div>
                              <span className="uppercase tracking-wide text-[10px] font-black">Voice Mode</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setIsVoiceMode(false); setActiveTool(null); }}
                              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-primary/20 text-primary dark:text-primary transition-all hover:rotate-90"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        )}
                        {isAudioConvertMode && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex flex-row items-center gap-2.5 px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-xs font-bold border border-primary/30 backdrop-blur-xl whitespace-nowrap shrink-0 transition-all hover:bg-primary/15 group shadow-lg shadow-primary/10"
                          >
                            <div className="flex flex-row items-center gap-2">
                              <div className="w-5 h-5 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Headphones size={14} strokeWidth={2.5} />
                              </div>
                              <span className="uppercase tracking-wide text-[10px] font-black">Audio Convert</span>
                            </div>
                            <button type="button" onClick={() => setIsVoiceSettingsOpen(true)} className="ml-1 w-5 h-5 rounded-lg flex items-center justify-center hover:bg-primary/20 text-subtext hover:text-primary transition-colors" title="Voice Settings">
                              <Sliders size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => { setIsAudioConvertMode(false); setActiveTool(null); }}
                              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-primary/20 text-primary transition-all hover:rotate-90"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        )}
                        {isDocumentConvert && (
                          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-transparent backdrop-blur-md whitespace-nowrap shrink-0">
                            <FileText size={12} strokeWidth={3} /> <span>Doc Convert</span>
                            <button onClick={() => { setIsDocumentConvert(false); setActiveTool(null); }} className="ml-1 hover:text-primary/80"><X size={12} /></button>
                          </motion.div>
                        )}
                        {isCodeWriter && (
                          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-transparent backdrop-blur-md whitespace-nowrap shrink-0">
                            <Code size={12} strokeWidth={3} /> <span>Code Writer</span>
                            <button onClick={() => { setIsCodeWriter(false); setActiveTool(null); }} className="ml-1 hover:text-primary/80"><X size={12} /></button>
                          </motion.div>
                        )}

                        {isMagicEditing && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-row items-center gap-3 px-3.5 py-1.5 bg-primary/20 dark:bg-primary/25 text-primary rounded-full text-xs font-bold border border-primary/40 backdrop-blur-3xl whitespace-nowrap shrink-0 transition-all hover:bg-primary/30 group shadow-[0_8px_32px_-4px_rgba(var(--primary-rgb),0.3)] relative overflow-hidden ring-1 ring-white/10"
                          >
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
                            <div className="flex flex-row items-center gap-2 relative z-10">
                              <div className="w-5 h-5 rounded-lg bg-primary dark:bg-primary flex items-center justify-center shadow-lg shadow-primary/40 text-white">
                                <Wand2 size={14} strokeWidth={3} />
                              </div>
                              <span className="uppercase tracking-widest text-[9px] font-black hidden xs:inline">{t('imageEdit')}</span>
                            </div>
                            <div className="w-[1px] h-3 bg-primary/40 mx-0.5 relative z-10" />
                            <button
                              type="button"
                              onClick={() => setIsMagicSettingsOpen(!isMagicSettingsOpen)}
                              className="flex flex-row items-center gap-1.5 hover:text-primary dark:hover:text-primary transition-all px-1.5 py-0.5 rounded-md hover:bg-white/10 relative z-10"
                            >
                              <span className="text-[10px] font-extrabold opacity-90">{imageAspectRatio}</span>
                              <span className="text-[10px] font-black truncate max-w-[60px] sm:max-w-[100px] tracking-tight">
                                {TOOL_PRICING.image.models.find(m => m.id === imageModelId)?.name.replace('AISA ', '') || 'Model'}
                              </span>
                              <ChevronDown size={11} className={`transition-transform duration-300 ${isMagicSettingsOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => { setIsMagicEditing(false); setActiveTool(null); }}
                              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white text-primary dark:text-primary transition-all hover:rotate-90 relative z-10"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        )}
                        {isFileAnalysis && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex flex-row items-center gap-2.5 px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-xs font-bold border border-primary/30 backdrop-blur-xl whitespace-nowrap shrink-0 transition-all hover:bg-primary/15 group shadow-lg shadow-primary/10"
                          >
                            <div className="flex flex-row items-center gap-2">
                              <div className="w-5 h-5 rounded-lg bg-primary/20 flex items-center justify-center">
                                <FileText size={14} strokeWidth={2.5} />
                              </div>
                              <span className="uppercase tracking-wide text-[10px] font-black">{t('analyzeDocument')}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setIsFileAnalysis(false); setActiveTool(null); }}
                              className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-primary/20 text-primary dark:text-primary transition-all hover:rotate-90"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}
                </AnimatePresence>

                <div className="relative w-full group">
                  <textarea
                    id="chat-input"
                    ref={inputRef}
                    value={inputValue}
                    disabled={gen.isGenerating || isLimitReached}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) setIsAutoPreviewDisabled(false);
                      const lineCount = val.split('\n').length;

                      if (!isAutoPreviewDisabled && !isInputExpanded && (lineCount > 8 || val.length > 400)) {
                        setLongTextPreview(val);
                        setInputValue('');
                      } else {
                        setInputValue(val);
                        if (!isInputExpanded) {
                          e.target.style.height = 'auto';
                          e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                        }
                      }
                    }}
                    onPaste={(e) => {
                      const pastedText = e.clipboardData.getData('text');
                      const lineCount = pastedText.split('\n').length;

                      if (!isInputExpanded && (lineCount > 8 || pastedText.length > 400)) {
                        e.preventDefault();
                        setLongTextPreview(pastedText);
                        setInputValue('');
                        setIsAutoPreviewDisabled(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (gen.isGenerating) return;
                        if (inputValue.trim() || filePreviews.length > 0 || longTextPreview) {
                          handleSendMessage(e);
                        }
                      }
                    }}
                    placeholder={isLimitReached ? t('limitReached') || "Chat limit reached. Sign in to continue." : (window.innerWidth < 768 ? "Ask anything..." : ((activeTool && TOOL_PLACEHOLDERS[activeTool]) ? TOOL_PLACEHOLDERS[activeTool] : typedPlaceholder))}
                    rows={1}
                    className={`w-full bg-transparent border-0 focus:ring-0 outline-none focus:outline-none px-1 py-[9px] sm:px-3 sm:py-[7px] pr-8 text-slate-800 dark:text-zinc-100 text-left placeholder-slate-400 dark:placeholder-zinc-500 resize-none overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] font-normal leading-normal text-[15px] sm:text-[16px] transition-all duration-300 ${isLimitReached ? 'cursor-not-allowed opacity-50' : ''}`}
                    style={isInputExpanded
                      ? { minHeight: '220px', height: '220px', maxHeight: '500px' }
                      : { minHeight: '38px', maxHeight: '140px' }
                    }
                  />

                  {/* Expand/Collapse Toggle Button (Gemini-style) */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsInputExpanded(!isInputExpanded);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    title={isInputExpanded ? 'Collapse input' : 'Expand input'}
                    className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200
                      text-slate-400 dark:text-zinc-500
                      hover:text-slate-600 dark:hover:text-zinc-300
                      hover:bg-slate-100 dark:hover:bg-zinc-800
                      ${isInputExpanded ? 'opacity-100' : 'opacity-0 group-focus-within:opacity-100 hover:!opacity-100'}`}
                    style={{ zIndex: 10 }}
                  >
                    {isInputExpanded
                      ? <Minimize2 className="w-3.5 h-3.5" />
                      : <Maximize2 className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              </div>

              {/* Right Actions Group */}
              <div className="flex items-center gap-[4px] sm:gap-[6px] pr-[2px] shrink-0">
                {isListening && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full border border-red-500/20 mr-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-[10px] font-bold text-red-600 uppercase">{t('rec')}</span>
                  </div>
                )}

                {!isListening && !inputValue && (
                  <>
                    {getAgentCapabilities(activeAgent.agentName, activeAgent.category).canVoice && (
                      <div className="relative">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleVoiceInput}
                          className="w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] rounded-full flex items-center justify-center bg-white dark:bg-zinc-800 text-slate-500 hover:text-primary transition-all shadow-sm border border-slate-200/50 dark:border-zinc-700/50 relative overflow-visible z-20"
                          title={t('voiceInput')}
                        >
                          <Mic className={`w-[18px] h-[18px] shrink-0 transition-colors`} />
                        </motion.button>
                      </div>
                    )}
                  </>
                )}

                {gen.isGenerating ? (
                  <button
                    type="button"
                    onClick={() => {
                      gen.abort();
                      if (abortControllerRef.current) abortControllerRef.current.abort();
                      setIsLoading(false);
                      const chatLock = getSessionLock(activeSessionId);
                      chatLock.locked = false;
                    }}
                    className="w-[36px] h-[36px] rounded-full text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <div className="w-[12px] h-[12px] bg-white rounded-sm" />
                  </button>
                ) : (
                  <div className="flex items-center gap-[6px] relative">
                    <motion.button
                      type="submit"
                      disabled={gen.isGenerating || (!inputValue.trim() && filePreviews.length === 0 && !longTextPreview)}
                      onMouseEnter={() => setIsSendHovered(true)}
                      onMouseLeave={() => setIsSendHovered(false)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={t('send')}
                      className={`w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] rounded-full flex items-center justify-center transition-all shadow-lg relative overflow-visible z-20 text-white`}
                      style={{
                        background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))`,
                        boxShadow: isSendHovered ? `0 10px 20px -5px var(--color-primary-border)` : `none`
                      }}
                    >
                      <AnimatePresence>
                        {ripples.map(id => (
                          <SendRipple key={id} onComplete={() => setRipples(r => r.filter(i => i !== id))} />
                        ))}
                      </AnimatePresence>
                      <motion.div
                        animate={isLaunching ? {
                          y: [0, -120],
                          scale: [1, 2.8, 0],
                          opacity: [1, 0.4, 0],
                          rotate: [0, 720],
                          filter: ["blur(0px)", "blur(30px)"]
                        } : { y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, ease: "anticipate" }}
                        className="relative z-10"
                      >
                        <SendHorizontal
                          className="w-[18px] h-[18px] sm:w-5 sm:h-5 transition-all duration-300"
                          strokeWidth={2.5}
                        />
                      </motion.div>
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
