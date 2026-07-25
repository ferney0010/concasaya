#!/usr/bin/env python3
"""Localiza la sub-galería de Cubo dentro de #galeria."""
import re
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

# Find all data-category="cubo" occurrences and surrounding context
for m in re.finditer(r'data-category="cubo"', t):
    pos = m.start()
    # find enclosing <a tag
    a_start = t.rfind('<a ', 0, pos)
    a_end = t.find('</a>', pos) + 4
    # find enclosing div
    div_start = t.rfind('<div', 0, a_start)
    # show first 250 chars
    print(f'pos={pos}  a_tag={a_start}-{a_end}  enclosing_div={div_start}')
    print('   thumb:', t[a_start:a_start+200].replace('\n',' '))
    print('---')
