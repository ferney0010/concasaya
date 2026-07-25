#!/usr/bin/env python3
import re
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

# Find all <a class="gallery-thumb cabin-hero"
# These should only remain for the Cabañas Vidrio hero
hero_positions = [m.start() for m in re.finditer(r'class="gallery-thumb cabin-hero"', t)]
print('cabin-hero positions:', hero_positions)

# The first one is Cabañas Vidrio (correct). Remove cabin-hero from the others.
for p in reversed(hero_positions[1:]):
    # Replace 'gallery-thumb cabin-hero' with 'gallery-thumb'
    old = 'class="gallery-thumb cabin-hero"'
    new = 'class="gallery-thumb"'
    if t[p:p+len(old)] == old:
        t = t[:p] + new + t[p+len(old):]
        print(f'  removed cabin-hero at {p}')

with open(r'C:\Workspace\concasaya\modelos.html', 'w', encoding='utf-8') as f:
    f.write(t)

# Verify
hero_after = [m.start() for m in re.finditer(r'class="gallery-thumb cabin-hero"', t)]
print('cabin-hero positions AFTER:', hero_after)
print('Final size:', len(t))
