
import os

file_path = r'c:\Users\USER\Desktop\AISA_change\AISA\src\pages\Chat.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
changed = 0
for line in lines:
    # Pattern for newUserMsg
    if 'setMessages(prev => [...prev, newUserMsg]);' in line:
        new_lines.append(line.replace('setMessages(prev => [...prev, newUserMsg]);', 'setMessages(prev => prev.filter(m => !m.isSystemLog).concat(newUserMsg));'))
        changed += 1
    # Pattern for handleGenerateImage/Video
    elif 'setMessages(prev => [...prev, userMsg, newMessage]);' in line:
        new_lines.append(line.replace('setMessages(prev => [...prev, userMsg, newMessage]);', 'setMessages(prev => prev.filter(m => !m.isSystemLog).concat([userMsg, newMessage]));'))
        changed += 1
    else:
        new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Success: {changed} patterns replaced.")
