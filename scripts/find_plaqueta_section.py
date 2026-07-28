#!/usr/bin/env python3
"""Encuentra el bloque de Plaqueta 2 Pisos en la galería."""
import re
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

# Find all h3 in #galeria section
gal_start = t.find('id="galeria"')
print('galeria starts at', gal_start)

# Look for "Plaqueta de 2 Pisos" h3
for m in re.finditer(r'Plaqueta de 2 Pisos|Casas Prefabricadas de Dos Pisos', t):
    pos = m.start()
    print(f'pos {pos}: {m.group(0)!r}')

# Find section with plaqueta 2 pisos (likely in #galeria as a sub-section)
# Also check for h3 containing "Plaqueta"
for m in re.finditer(r'<h3[^>]*>([^<]*Plaqueta[^<]*)</h3>', t):
    pos = m.start()
    print(f'pos {pos}: h3={m.group(1)!r}')

# Find img821 and img791 usage
print('img821.webp refs:', t.count('img821.webp'))
print('img791.webp refs:', t.count('img791.webp'))
