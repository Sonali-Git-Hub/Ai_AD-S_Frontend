
import os

file_path = r'c:\Users\USER\Desktop\AISA_change\AISA\src\pages\Chat.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """            activateToolWithTypingEffect(tool.id, tool.name);

            // If a case is active, clear messages so the new tool starts fresh within that case

            if (currentCase) {
              setMessages([{
                id: Date.now().toString(),
                role: 'model',
                content: `You've activated **${tool.name}** within the case **${currentCase.name}**.\\n\\nAll context from this case is available. How would you like to proceed?`,
                timestamp: Date.now(),
              }]);
            } else {
              setMessages([{
                id: Date.now().toString(),
                role: 'model',
                content: `**${tool.name} Activated** ⚖️\\n\\nI am ready to assist you. You can upload relevant documents or describe your situation to get started.`,
                timestamp: Date.now(),
              }]);
            }"""

# Note the double backslash in the target for the newline characters in the content string

replacement = """            activateToolWithTypingEffect(tool.id, tool.name);

            // If a case is active, append activation message rather than clearing history
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'model',
              content: currentCase 
                ? `You've activated **${tool.name}** within the case **${currentCase.name}**.\\n\\nAll context from this case is available. How would you like to proceed?`
                : `**${tool.name} Activated** ⚖️\\n\\nI am ready to assist you. You can upload relevant documents or describe your situation to get started.`,
              timestamp: Date.now(),
            }]);"""

if target in content:
    new_content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success: Pattern replaced.")
else:
    print("Error: Target pattern not found.")
    # Print a slice of the content around the expected area to debug
    idx = content.find("activateToolWithTypingEffect(tool.id, tool.name);")
    if idx != -1:
        print("Found starting point. Context:")
        print(repr(content[idx:idx+500]))
    else:
        print("Could not even find the starting function call.")
