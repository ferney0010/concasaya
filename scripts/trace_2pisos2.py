#!/usr/bin/env python3
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
# Find the #galeria section
gal_start = t.find('id="galeria"')
# Find the "Casas Prefabricadas de Dos Pisos" h3 INSIDE the gallery section
gal_chunk = t[gal_start:]
# find <h3 ...>Casas Prefabricadas de Dos Pisos</h3>
m = re.search(r'<h3[^>]*>Casas Prefabricadas de Dos Pisos</h3>', gal_chunk)
print(f'h3 found at relative pos {m.start() if m else None}')
# in absolute terms
if m:
    h3_abs = gal_start + m.start()
    print(f'absolute pos: {h3_abs}')
    # find gallery-grid AFTER this
    g_start = t.find('<div class="gallery-grid">', h3_abs)
    print(f'gallery-grid starts at {g_start}')
    # find the close
    lines = t[g_start:g_start+30000].split('\n')
    depth = 1
    line_no = 0
    for line in lines:
        line_no += 1
        if '<div' in line and '</div>' not in line:
            depth += 1
        if '</div>' in line and '<div' not in line:
            depth -= 1
        if depth == 0:
            end = g_start + sum(len(l)+1 for l in lines[:line_no])
            print(f'closed at char {end}, line {line_no}')
            block = t[g_start:end]
            print(f'block len: {len(block)}')
            # count imgs
            imgs = re.findall(r'data-href="catalogo concasaya/medium/(img\d+)\.webp"', block)
            print(f'unique imgs: {len(set(imgs))}')
            break
