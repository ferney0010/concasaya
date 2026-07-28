#!/usr/bin/env python3
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
# Find the literal text the user saw
m = re.search(r'void\(0\);[^<]*class="gallery-thumb', t)
if m:
    print(f'found at {m.start()}')
    print(t[max(0,m.start()-200):m.start()+500])
else:
    print('not found in current file (already fixed or was different)')
