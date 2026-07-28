#!/usr/bin/env python3
"""Trace 2 Pisos gallery block boundary more carefully.

Strategy: look for the FIRST </div></div> pair after <div class="gallery-grid">
where the second </div> is at the same indent as the opening <div class="gallery-grid">.
"""
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
i = t.find('<div class="gallery-grid">', t.find('Casas Prefabricadas de Dos Pisos'))
print(f'2pisos gallery-grid starts at {i}')
# Find lines after to see structure
lines = t[i:i+30000].split('\n')
depth = 1
line_no = 0
for line in lines:
    line_no += 1
    if '<div' in line and '</div>' not in line:
        depth += 1
    if '</div>' in line and '<div' not in line:
        depth -= 1
    if depth == 0:
        print(f'closed at line {line_no}: {line[:200]}')
        # get char position
        end = i + sum(len(l)+1 for l in lines[:line_no])
        print(f'closed at char {end}')
        # show first 100 and last 500 chars of block
        block = t[i:end]
        print(f'block len: {len(block)}')
        print(f'block end: {block[-300:]!r}')
        break
