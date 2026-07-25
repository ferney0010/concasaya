#!/usr/bin/env python3
# Find the tejas block to inspect exact bytes.
import re, sys
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()
idx = t.find('<!-- Tipos de tejas -->')
print('start_idx:', idx)
if idx >= 0:
    end = t.find('<!-- Acabados interiores -->', idx)
    print('end_idx:', end)
    block = t[idx:end]
    print('len:', len(block))
    # write block to a temp file to view in raw form
    with open(r'C:\Workspace\concasaya\scripts\_tejas_block.txt', 'w', encoding='utf-8') as o:
        o.write(block)
    print('written to scripts/_tejas_block.txt')
