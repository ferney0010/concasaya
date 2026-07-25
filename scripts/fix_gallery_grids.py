#!/usr/bin/env python3
"""Arregla las galerías grandes (Plaqueta 1P, Casas en L, 2 Pisos) que usan cabin-grid-vidrio mal.

Estrategia: reemplazar el primer cabin-hero por un thumb normal y cambiar el contenedor
de cabin-grid-vidrio a gallery-grid (CSS columns masonry).
"""
import re
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

# Find each <div class="cabin-grid-vidrio"> that is NOT the first one (cabins)
# We have 4 cabin-grid-vidrio total. Cabins vidrio is the first one.
# The other 3 are the bad ones.
positions = [m.start() for m in re.finditer(r'<div class="cabin-grid-vidrio">', t)]
print(f'cabin-grid-vidrio positions: {positions}')

# Apply fix to positions[1], [2], [3] only (skip first which is cabanas)
for p in positions[1:]:
    # Replace the container
    t = t[:p] + '<div class="gallery-grid">' + t[p + len('<div class="cabin-grid-vidrio">'):]
    # Also remove the cabin-hero class from the first <a> inside this block
    # Find first <a class="gallery-thumb cabin-hero" after p
    a_match = re.search(r'<a href="javascript:void\(0\);" class="gallery-thumb cabin-hero"', t[p:])
    if a_match:
        a_pos = p + a_match.start()
        # Replace cabin-hero with empty
        t = t[:a_pos] + t[:a_pos].replace('gallery-thumb cabin-hero', 'gallery-thumb') + t[a_pos + len(t[:a_pos]) - len(t[:a_pos]):]
        # Actually simpler: do a direct replace
        # The above is buggy. Let me do it again with the actual t.
# Reset and do correctly
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
positions = [m.start() for m in re.finditer(r'<div class="cabin-grid-vidrio">', t)]

# Process from last to first to preserve offsets
for p in reversed(positions[1:]):
    # 1. Replace the div container
    old_div = '<div class="cabin-grid-vidrio">'
    new_div = '<div class="gallery-grid">'
    assert t[p:p+len(old_div)] == old_div, f"expected cabin-grid-vidrio at {p}"
    t = t[:p] + new_div + t[p+len(old_div):]
    # 2. Find first cabin-hero after this position and remove class
    a_re = re.search(r'<a href="javascript:void\(0\);" class="gallery-thumb cabin-hero"', t[p:])
    if a_re:
        a_pos = p + a_re.start()
        # Remove " cabin-hero" from the class
        a_end = a_pos + len('<a href="javascript:void(0);" class="gallery-thumb cabin-hero"')
        t = t[:a_end] + t[a_end:].replace(' cabin-hero"', '"', 1)

# Write
with open(r'C:\Workspace\concasaya\modelos.html', 'w', encoding='utf-8') as f:
    f.write(t)

# Verify
remaining = [m.start() for m in re.finditer(r'<div class="cabin-grid-vidrio">', t)]
print(f'After fix: cabin-grid-vidrio positions: {remaining}')
remaining_hero = [m.start() for m in re.finditer(r'class="gallery-thumb cabin-hero"', t)]
print(f'After fix: gallery-thumb cabin-hero positions: {remaining_hero}')

# Also fix Cubo gallery? It uses gallery-grid already (no cabin-hero). Check it.
cubo_h3 = t.find('Casas Cubo y Mediterr')
if cubo_h3 > 0:
    # Check what container the Cubo gallery uses
    grid_pos = t.find('<div class="gallery-grid', cubo_h3)
    print(f'CUBO gallery grid container: {t[grid_pos:grid_pos+50]!r}')

print('Final size:', len(t))
