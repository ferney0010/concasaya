#!/usr/bin/env python3
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
for m in re.finditer(r'flex items-center gap-3 mb-4', t):
    pos = m.start()
    chunk = t[pos:pos+500].replace('\n', ' ')
    print(f'pos {pos}: {chunk[:300]}')
    print('---')
