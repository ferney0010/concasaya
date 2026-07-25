import re
from pathlib import Path
text = Path(r"C:\Workspace\concasaya\modelos.html").read_text(encoding="utf-8")
opens = re.findall(r'<div\b', text)
closes = re.findall(r'</div>', text)
print(f'<div>: {len(opens)}, </div>: {len(closes)}, diff: {len(opens) - len(closes)}')
