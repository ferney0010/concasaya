#!/usr/bin/env python3
"""Encuentra la sección 'Categoría 4 de 5' (Cubo) completa."""
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

# Find all "Categoría X de 5" anchors
import re
for m in re.finditer(r'Categor\u00eda \d de 5', t):
    print(f'  {m.start()}: {m.group(0)}')

# Look for sections by their id attribute nearby
for m in re.finditer(r'<section id="([^"]+)"', t):
    print(f'  section #{m.start()}: id={m.group(1)!r}')
