#!/usr/bin/env python3
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
positions = [m.start() for m in re.finditer(r'<div class="gallery-grid">', t)]
print('all gallery-grid positions:', positions)
print('next_mb12 after each:')
for p in positions:
    nxt = t.find('<div class="mb-12">', p + 1)
    print(f'  pos {p}: next mb-12 at {nxt}')
