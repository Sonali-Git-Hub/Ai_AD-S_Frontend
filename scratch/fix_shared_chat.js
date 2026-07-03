import fs from 'fs';

const filePath = 'H:/aisa_new_web/AISA_New/src/pages/SharedChat.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetBlock = `                        {/* Expand/Collapse Button */}
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

// Normalize line endings to avoid CRLF vs LF issues
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = targetBlock.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
    const fixed = normalizedContent.replace(normalizedTarget, '');
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log("Successfully fixed SharedChat.jsx!");
} else {
    console.log("Could not find the target block in SharedChat.jsx!");
}
