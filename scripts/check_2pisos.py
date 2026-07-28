#!/usr/bin/env python3
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
# Find 2 Pisos gallery-grid (first one after h3)
h3_pos = t.find('<h3 class="text-xl md:text-2xl font-bold text-secondary">Casas Prefabricadas de Dos Pisos</h3>')
print(f'h3 at: {h3_pos}')
g_start = t.find('<div class="gallery-grid">', h3_pos)
print(f'gallery-grid at: {g_start}')
# Find next gallery-grid
next_g = t.find('<div class="gallery-grid">', g_start + 1)
print(f'next gallery-grid: {next_g}')
block = t[g_start:next_g]
print(f'block size: {len(block)}')
print(f'thumbs count: {block.count(chr(34) + "gallery-thumb" + chr(34))}')
# Find all data-href
hrefs = re.findall(r'data-href="catalogo concasaya/medium/(img\d+)\.webp"', block)
print(f'unique imgs: {len(set(hrefs))}, list: {list(set(hrefs))[:5]}...')
# Check for malformed
m = re.search(r'data-href="catalogo concasaya/medium/<', block)
print(f'malformed: {bool(m)}')
