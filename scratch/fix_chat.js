import fs from 'fs';

const filePath = 'H:/aisa_new_web/AISA_New/src/pages/Chat.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// We want to delete the lines between </ReactMarkdown>\s*<\/div> and </div>\s*<\/div>\s*<\/div>\s*<\/div>
// Let's locate the ReactMarkdown and see if we can replace the broken code section.
// Specifically:
const targetString = `                                            </ReactMarkdown>
                                          </div>

                                                    const next = { ...prev, [msg.id]: !prev[msg.id] };
                                                     if (next[msg.id]) {
                                                       setTimeout(() => {
                                                         scrollToBottom(true, 'smooth');
                                                       }, 100);
                                                     }
                                                     return next;
                                                   });
                                                 }}
                                                 className="read-more-btn"
                                                 title={expandedMessages[msg.id] ? 'Show less' : 'Read full response'}
                                                 aria-expanded={!!expandedMessages[msg.id]}
                                               >
                                                 <span className="read-more-btn__text">
                                                   {expandedMessages[msg.id]
                                                     ? 'Show less'
                                                     : \`Read Full Response ↓\`}
                                                 </span>
                                                 <ChevronDown
                                                   className={\`read-more-btn__icon \${expandedMessages[msg.id] ? 'rotated' : ''}\`}
                                                 />
                                               </button>
                                             </div>
                                           )}`;

// Since the spacing or line endings might vary, let's normalize line endings to check if it matches.
// A simpler way: we search for the start and end and replace the block between them.
const startMarker = `                                            </ReactMarkdown>\r\n                                          </div>`;
const endMarker = `                                               </button>\r\n                                             </div>\r\n                                           )}`;

// Let's see if that matches. Or let's just do a regex replace.
// We want to replace from 'const next = { ...prev, [msg.id]: !prev[msg.id] };' up to and including the closing ')}' for the read-more button.
const regex = /\s*const\s+next\s+=\s+\{\s+\.\.\.prev,\s+\[msg\.id\]:\s+!prev\[msg\.id\]\s+\};[\s\S]*?<\/button>\s*<\/div>\s*\)\}/;

if (regex.test(content)) {
    content = content.replace(regex, '');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully fixed Chat.jsx!");
} else {
    // Try with normalized line endings
    const normalizedContent = content.replace(/\r\n/g, '\n');
    const regexNorm = /\s*const\s+next\s+=\s+\{\s+\.\.\.prev,\s+\[msg\.id\]:\s+!prev\[msg\.id\]\s+\};[\s\S]*?<\/button>\s*<\/div>\s*\)\}/;
    if (regexNorm.test(normalizedContent)) {
        const fixed = normalizedContent.replace(regexNorm, '');
        fs.writeFileSync(filePath, fixed, 'utf8');
        console.log("Successfully fixed Chat.jsx (normalized line endings)!");
    } else {
        console.log("Could not find the target code block!");
    }
}
