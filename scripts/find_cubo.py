#!/usr/bin/env python3
"""Encuentra el inicio y fin de la sección Cubo/Mediterráneas featured + galería."""
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

# Find each anchor
for needle in ['id="cubo"', 'Casas Cubo', 'Casas Modernas', 'Casas cúbicas', 'id="casa-cubo"', 'Casas tipo cubo',
               '5. CASAS CUBO', 'CUBO', 'casa-cubo', 'cubo-med']:
    i = t.find(needle)
    print(f'  {needle!r}: {i}')

# Search for "Cubo" in section eyebrows
import re
hits = [m.start() for m in re.finditer(r'>\s*Casas Cubo|>\s*Casas Modernas|>\s*Casas tipo cubo|>\s*Casas cúbicas|>\s*Casas Mediterr', t)]
print('eyebrow hits:', hits)
# Find span "Casas Cubo" or similar
for m in re.finditer(r'<span[^>]*section-eyebrow[^>]*>(.*?)</span>', t):
    print('  eyebrow:', m.group(1)[:80])
