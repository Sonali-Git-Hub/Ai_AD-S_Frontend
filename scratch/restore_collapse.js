import fs from 'fs';

// ─── FIX CHAT.JSX ───
const chatPath = 'H:/aisa_new_web/AISA_New/src/pages/Chat.jsx';
let chatContent = fs.readFileSync(chatPath, 'utf8');

// Replace collapsible-container class
const chatClassTarget = '<div className="collapsible-container">';
const chatClassReplacement = '<div className={`collapsible-container ${msg.content && msg.content.length > 350 && msg.id !== typingMessageId && expandedMessages[msg.id] === false ? \'collapsed-message\' : \'\'}`}>';
chatContent = chatContent.replace(chatClassTarget, chatClassReplacement);

// Insert button back
const chatMarkdownEnd = `                                            </ReactMarkdown>
                                          </div>`;
const chatMarkdownReplacement = `                                            </ReactMarkdown>
                                          </div>

                                          {(msg.content || msg.text) && (msg.content || msg.text).length > 350 && msg.id !== typingMessageId && (
                                            <div className="flex justify-start w-full mt-2">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setExpandedMessages(prev => {
                                                    const next = { ...prev, [msg.id]: prev[msg.id] === false ? true : false };
                                                    if (next[msg.id]) {
                                                      setTimeout(() => {
                                                        scrollToBottom(true, 'smooth');
                                                      }, 100);
                                                    }
                                                    return next;
                                                  });
                                                }}
                                                className="read-more-btn"
                                                title={expandedMessages[msg.id] !== false ? 'Show less' : 'Read full response'}
                                                aria-expanded={expandedMessages[msg.id] !== false}
                                              >
                                                <span className="read-more-btn__text">
                                                  {expandedMessages[msg.id] !== false
                                                    ? 'Show less'
                                                    : \`Read Full Response ↓\`}
                                                </span>
                                                <ChevronDown
                                                  className={\`read-more-btn__icon \${expandedMessages[msg.id] !== false ? 'rotated' : ''}\`}
                                                />
                                              </button>
                                            </div>
                                          )}`;

// Normalize and replace
const chatNorm = chatContent.replace(/\r\n/g, '\n');
const chatMarkNorm = chatMarkdownEnd.replace(/\r\n/g, '\n');
const chatReplNorm = chatMarkdownReplacement.replace(/\r\n/g, '\n');

if (chatNorm.includes(chatMarkNorm)) {
    const fixedChat = chatNorm.replace(chatMarkNorm, chatReplNorm);
    fs.writeFileSync(chatPath, fixedChat, 'utf8');
    console.log("Successfully restored collapse logic in Chat.jsx!");
} else {
    console.log("Could not find Markdown end block in Chat.jsx!");
}


// ─── FIX SHAREDCHAT.JSX ───
const sharedChatPath = 'H:/aisa_new_web/AISA_New/src/pages/SharedChat.jsx';
let sharedContent = fs.readFileSync(sharedChatPath, 'utf8');

// Replace collapsible-container class
const sharedClassTarget = '<div className="collapsible-container">';
const sharedClassReplacement = '<div className={`collapsible-container ${msg.content && msg.content.length > 350 && expandedMessages[idx] === false ? \'collapsed-message\' : \'\'}`}>';
sharedContent = sharedContent.replace(sharedClassTarget, sharedClassReplacement);

// Insert button back
const sharedMarkdownEnd = `                            {msg.content}
                          </ReactMarkdown>
                        </div>`;
const sharedMarkdownReplacement = `                            {msg.content}
                          </ReactMarkdown>
                        </div>

                        {/* Expand/Collapse Button */}
                        {(msg.content || msg.text) && (msg.content || msg.text).length > 350 && (
                          <div className="flex justify-start w-full mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedMessages(prev => ({ ...prev, [idx]: prev[idx] === false }));
                              }}
                              className="read-more-btn"
                              title={expandedMessages[idx] !== false ? 'Show less' : 'Read full response'}
                              aria-expanded={expandedMessages[idx] !== false}
                            >
                              <span className="read-more-btn__text">
                                {expandedMessages[idx] !== false
                                  ? 'Show less'
                                  : \`Read Full Response ↓\`}
                              </span>
                              <ChevronDown
                                className={\`read-more-btn__icon \${expandedMessages[idx] !== false ? 'rotated' : ''}\`}
                              />
                            </button>
                          </div>
                        )}`;

// Normalize and replace
const sharedNorm = sharedContent.replace(/\r\n/g, '\n');
const sharedMarkNorm = sharedMarkdownEnd.replace(/\r\n/g, '\n');
const sharedReplNorm = sharedMarkdownReplacement.replace(/\r\n/g, '\n');

if (sharedNorm.includes(sharedMarkNorm)) {
    const fixedShared = sharedNorm.replace(sharedMarkNorm, sharedReplNorm);
    fs.writeFileSync(sharedChatPath, fixedShared, 'utf8');
    console.log("Successfully restored collapse logic in SharedChat.jsx!");
} else {
    console.log("Could not find Markdown end block in SharedChat.jsx!");
}
