#!/usr/bin/env python3
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()
# Find the Cubo gallery block
start = t.find('<div class="mb-12">', 173000)  # gallery start around 173247
# Find first 'data-category="cubo"' after that
cubo_in_gallery = t.find('data-category="cubo"', start)
# Find the end of the gallery block (next mb-12)
end = t.find('<div class="mb-12">', start+1)
print('CUBO gallery block: pos', start, 'to', end)
block = t[start:end]
import re
thumbs = re.findall(r'data-href="([^"]+)"', block)
print(f'thumbs in gallery: {len(thumbs)}')
for th in thumbs:
    print(' -', th)
# count variants
print('variant=todas in block:', block.count('data-variant="todas"'))
print('variant=default in block:', block.count('data-variant="default"'))
