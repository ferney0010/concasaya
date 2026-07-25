#!/usr/bin/env python3
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()
import re
for img in ['img1055', 'img1087', 'img1093', 'img1099']:
    print(f'\n=== {img}.webp ===')
    for m in re.finditer(re.escape(img)+r'\.webp', t):
        pos = m.start()
        line_start = t.rfind('\n', 0, pos)+1
        line_end = t.find('\n', pos)
        line = t[line_start:line_end]
        # trim long
        if len(line) > 200: line = line[:200] + '...'
        print(f'  pos {pos}: {line.strip()}')
