#!/usr/bin/env python3
import re
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

# Find all hero-related classes used in #galeria
for m in re.finditer(r'class="gallery-thumb[^"]*cabin-hero[^"]*"', t):
    print('cabin-hero at', m.start(), ':', m.group(0)[:200])
