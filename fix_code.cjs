const fs = require('fs');
let code = fs.readFileSync('src/pages/Chat.jsx', 'utf8');

const regex1 = /navigator\.clipboard\.writeText\(codeValue\);\s*toast\.success\("Code copied!"\);/;
const replace1 = `try {
                                                            if (navigator.clipboard && window.isSecureContext) {
                                                              navigator.clipboard.writeText(codeValue);
                                                            } else {
                                                              const textArea = document.createElement("textarea");
                                                              textArea.value = codeValue;
                                                              document.body.appendChild(textArea);
                                                              textArea.select();
                                                              document.execCommand('copy');
                                                              document.body.removeChild(textArea);
                                                            }
                                                            toast.success("Code copied!");
                                                          } catch (err) {
                                                            toast.error("Failed to copy code");
                                                          }`;

const regex2 = /customStyle=\{\{\s*margin: 0,\s*padding: isUser \? '16px' : '20px',\s*fontSize: isUser \? '13px' : '14px',\s*lineHeight: '1\.7',\s*background: 'transparent',\s*borderRadius: 0,\s*border: 'none',\s*color: '#e5e7eb',/m;
const replace2 = `customStyle={{
                                                        margin: 0,
                                                        padding: isUser ? '16px' : '20px',
                                                        fontSize: isUser ? '13px' : '14px',
                                                        lineHeight: '1.7',
                                                        background: 'transparent',
                                                        borderRadius: 0,
                                                        border: 'none',
                                                        overflowX: 'auto',
                                                        overflowY: 'auto',
                                                        color: '#e5e7eb',`;

code = code.replace(regex1, replace1);
code = code.replace(regex2, replace2);
fs.writeFileSync('src/pages/Chat.jsx', code);
