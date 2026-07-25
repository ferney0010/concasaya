from pathlib import Path
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
p = Path(r"C:\Workspace\concasaya\modelos.html")
text = p.read_text(encoding="utf-8")
idx = text.find('img350.webp')
print('--- Before img350 (2000 chars) ---')
chunk = text[idx-2000:idx]
# Replace problematic chars for printing
print(chunk.replace('★', '*'))
print('\n--- img350 + 200 ---')
print(text[idx:idx+200].replace('★', '*'))
