#!/usr/bin/env python3
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
# Find all h3 elements
print('All h3 in #galeria:')
gal_start = t.find('id="galeria"')
for m in re.finditer(r'<h3[^>]*>([^<]+)</h3>', t[gal_start:]):
    title = m.group(1).strip()
    pos = gal_start + m.start()
    print(f'  pos {pos}: {title!r}')
