import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex logic: 
    # Match 'AISA' 
    # Must NOT be preceded by: Alphanumeric, underscore, forward slash (path), or single/double quote (start of path/variable)
    # Must NOT be followed by: Alphanumeric, underscore, or TM symbol
    # This specifically targets UI text and labels while avoiding code-level strings like paths or variables.
    
    # We use a non-capturing group for the boundary checks.
    # Note: Modern Python re.sub supports lookbehind.
    
    # Pattern to find AISA but exclude common code contexts
    pattern = r'(?<![a-zA-Z0-9_\/])AISA(?![a-zA-Z0-9_™])'
    
    # We want to replace it with AISA™
    # But wait, some places already have 'AISA ™' (with space) or 'AISA <sup...'.
    # I will replace it with 'AISA™' and then clean up any double TM if they occur.
    
    new_content = re.sub(pattern, 'AISA™', content)
    
    # Clean up double TMs (e.g. if it was already AISA™ but matched part of it)
    new_content = new_content.replace('AISA™™', 'AISA™')
    new_content = new_content.replace('AISA ™™', 'AISA™')
    # Clean up 'AISA ™' to 'AISA™' for consistency if desired, or keep as requested.
    # User said "AISA ho wo TM ke sat ho".
    
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    root_dir = r'c:\Users\bhara\OneDrive\Desktop\AISA\AISA\src'
    count = 0
    for root, dirs, files in os.walk(root_dir):
        # Exclude node_modules, .git, etc
        if 'node_modules' in root or '.git' in root:
            continue
            
        for file in files:
            if file.endswith(('.jsx', '.html', '.js', '.tsx', '.ts')):
                if process_file(os.path.join(root, file)):
                    print(f"Updated: {file}")
                    count += 1
    print(f"Total files updated: {count}")

if __name__ == "__main__":
    main()
