const fs = require('fs');
const path = 'c:/Users/USER/Desktop/AISA-Preview/Aisa_beta/src/Tools/AI_Cashflow/CashFlowStockModal.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = `onClick={() => {
                               setIsMaximized(false);
                               // Small delay to allow minimize transition
                               setTimeout(() => {
                                  const chatInput = document.querySelector('textarea');
                                  if (chatInput) {
                                     chatInput.focus();
                                     chatInput.value = \`Analyze \${selectedStock?.symbol} further: \`;
                                  }
                               }, 500);
                            }}`;

const replacement = `onClick={() => {
                               onClose();
                               // Small delay to allow closing transition
                               setTimeout(() => {
                                  const chatInput = document.querySelector('textarea');
                                  if (chatInput) {
                                     chatInput.focus();
                                     const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                                     nativeInputValueSetter.call(chatInput, \`Question about \${selectedStock?.name || selectedStock?.symbol}: \`);
                                     chatInput.dispatchEvent(new Event('input', { bubbles: true }));
                                  }
                               }, 400);
                            }}`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
console.log('replaced');
