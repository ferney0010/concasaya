#!/usr/bin/env python3
"""Localiza el CSS del hero y la estructura de las galerías."""
import re
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

# Find cabin-hero CSS
for m in re.finditer(r'\.cabin-hero[^{]*\{[^}]+\}', t):
    print('CSS:', m.group(0)[:300])
    print('---')

# Find gallery-grid CSS
for m in re.finditer(r'\.gallery-grid[^{]*\{[^}]+\}', t):
    print('gallery-grid CSS:', m.group(0)[:300])
    print('---')

# Find thumb-label CSS
for m in re.finditer(r'\.thumb-label[^{]*\{[^}]+\}', t):
    print('thumb-label CSS:', m.group(0)[:300])
    print('---')

# Find gallery-thumb CSS
for m in re.finditer(r'\.gallery-thumb[^{]*\{[^}]+\}', t):
    print('gallery-thumb CSS:', m.group(0)[:300])
    print('---')
