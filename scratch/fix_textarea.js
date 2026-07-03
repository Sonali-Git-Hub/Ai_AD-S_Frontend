import fs from 'fs';

const filePath = 'H:/aisa_new_web/AISA_New/src/pages/Chat.jsx';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// Target: the orphaned fragment and old textarea that needs to be replaced
const oldBlock = `                      </AnimatePresence>

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
                            if (inputValue.trim() || selectedFiles.length > 0 || longTextPreview) {
                              handleSendMessage(e);
                            }
                          }
                        }}
                        placeholder={isLimitReached ? t('limitReached') || "Chat limit reached. Sign in to continue." : (window.innerWidth < 768 ? "Ask anything..." : ((activeTool && TOOL_PLACEHOLDERS[activeTool]) ? TOOL_PLACEHOLDERS[activeTool] : typedPlaceholder))}
                        rows={1}
                        className={\`w-full bg-transparent border-0 focus:ring-0 outline-none focus:outline-none px-1 pt-2.5 pb-0 sm:px-3 sm:py-2 text-slate-800 dark:text-zinc-100 text-left placeholder-slate-400 dark:placeholder-zinc-500 resize-none overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] font-normal leading-normal text-[15px] sm:text-[16px] \${isLimitReached ? 'cursor-not-allowed opacity-50' : ''}\`}
                        style={{ minHeight: '38px', height: '38px', maxHeight: '140px' }}
                      />
                    </div>`;

const newBlock = `                      </AnimatePresence>

                      <div className="relative w-full group">
                        <textarea
                          id="chat-input"
                          ref={inputRef}
                          value={inputValue}
                          disabled={gen.isGenerating || isLimitReached}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) setIsAutoPreviewDisabled(false);
                            const lineCount = val.split('\\n').length;

                            // Threshold: 400 chars or 9 lines (more than 8)
                            if (!isAutoPreviewDisabled && !isInputExpanded && (lineCount > 8 || val.length > 400)) {
                              setLongTextPreview(val);
                              setInputValue('');
                            } else {
                              setInputValue(val);
                              if (!isInputExpanded) {
                                e.target.style.height = 'auto';
                                e.target.style.height = \`\${Math.min(e.target.scrollHeight, 140)}px\`;
                              }
                            }
                          }}
                          onPaste={(e) => {
                            const pastedText = e.clipboardData.getData('text');
                            const lineCount = pastedText.split('\\n').length;

                            // Threshold: 400 chars or 9 lines (more than 8)
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
                              if (inputValue.trim() || selectedFiles.length > 0 || longTextPreview) {
                                handleSendMessage(e);
                              }
                            }
                          }}
                          placeholder={isLimitReached ? t('limitReached') || "Chat limit reached. Sign in to continue." : (window.innerWidth < 768 ? "Ask anything..." : ((activeTool && TOOL_PLACEHOLDERS[activeTool]) ? TOOL_PLACEHOLDERS[activeTool] : typedPlaceholder))}
                          rows={1}
                          className={\`w-full bg-transparent border-0 focus:ring-0 outline-none focus:outline-none px-1 pt-2.5 pb-0 sm:px-3 sm:py-2 pr-8 text-slate-800 dark:text-zinc-100 text-left placeholder-slate-400 dark:placeholder-zinc-500 resize-none overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] font-normal leading-normal text-[15px] sm:text-[16px] transition-all duration-300 \${isLimitReached ? 'cursor-not-allowed opacity-50' : ''}\`}
                          style={isInputExpanded
                            ? { minHeight: '220px', height: '220px', maxHeight: '500px' }
                            : { minHeight: '38px', height: '38px', maxHeight: '140px' }
                          }
                        />

                        {/* Expand/Collapse Toggle Button (Gemini-style) */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsInputExpanded(prev => !prev);
                            setTimeout(() => inputRef.current?.focus(), 50);
                          }}
                          title={isInputExpanded ? 'Collapse input' : 'Expand input'}
                          className={\`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200
                            text-slate-400 dark:text-zinc-500
                            hover:text-slate-600 dark:hover:text-zinc-300
                            hover:bg-slate-100 dark:hover:bg-zinc-800
                            \${isInputExpanded ? 'opacity-100' : 'opacity-0 group-focus-within:opacity-100 hover:!opacity-100'}\`}
                          style={{ zIndex: 10 }}
                        >
                          {isInputExpanded
                            ? <Minimize2 className="w-3.5 h-3.5" />
                            : <Maximize2 className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>
                    </div>`;

if (content.includes(oldBlock)) {
    const fixed = content.replace(oldBlock, newBlock);
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log('Successfully replaced textarea block!');
} else {
    console.log('Could not find the old block!');
    // Let's try to debug
    const idx = content.indexOf('e.preventDefault();\n                            setLongTextPreview(pastedText)');
    console.log('Found orphaned code at index:', idx);
}
