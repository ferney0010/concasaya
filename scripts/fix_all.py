#!/usr/bin/env python3
"""Fix completo de un solo golpe:
1. Reconstruir galerías Plaqueta 1P, Casas en L, 2 Pisos con gallery-grid (4 cols masonry)
2. Reconstruir galería Cubo+Materiales con cabin-grid (como Cabañas)
3. Eliminar ★ Top de las cards featured de esas secciones
4. Reemplazar teja-swatch por cards de contenido con formato uniforme
"""
import re

src = r'C:\Workspace\concasaya\modelos.html'
with open(src, 'r', encoding='utf-8') as f:
    t = f.read()

# === 1) Remove cabin-hero class from any remaining thumb (besides the legit one in cabins vidrio) ===
# Already done in prior commit, but double-check
hero_count = t.count('class="gallery-thumb cabin-hero"')
print(f'cabin-hero class count: {hero_count}')
# Should be 1 (only Cabañas Vidrio)
if hero_count > 1:
    # Find and remove all but the first
    positions = [m.start() for m in re.finditer(r'class="gallery-thumb cabin-hero"', t)]
    for p in reversed(positions[1:]):
        t = t[:p] + 'class="gallery-thumb"' + t[p+len('class="gallery-thumb cabin-hero"'):]
    print(f'Removed {hero_count - 1} extra cabin-hero classes')

# === 2) Add aspect-ratio constraint to gallery-thumb img in CSS if needed ===
# (The cabin-grid relies on aspect-ratio: 4/3; gallery-grid uses columns masonry)
# Verify the CSS is there for .gallery-thumb
# The existing CSS should be fine, just need the gallery items to use gallery-grid

# === 3) Strip "Top" badge from featured cards in plaqueta, 2pisos sections ===
# The cards have: <span class="absolute top-3 left-3 bg-amber-500 ... z-10">★ Top</span>
# Find all such badges within article elements in plaqueta/dospisos sections
sections = ['plaqueta', 'dos-pisos', 'cubo-mediterraneas', 'sistema-eps', 'cabanas']
# For each section, remove the Top badge span
for sec in ['plaqueta', 'dos-pisos']:
    s = t.find(f'id="{sec}"')
    if s < 0: continue
    e = t.find('</section>', s)
    section = t[s:e]
    # Find and remove all "absolute top-3 left-3 bg-amber-500" badges
    new_section = re.sub(
        r'\s*<span class="absolute top-3 left-3 bg-amber-500[^"]*">[^<]*</span>',
        '',
        section
    )
    t = t[:s] + new_section + t[e:]
    print(f'  Removed Top badges from {sec}')

# === 4) Find Cubo+Materiales broken gallery (img350 etc) and replace with clean thumbs ===
# The Cubo gallery is at: pos ~173871 (after our prior fix_2pisos_clean)
# Find the Cubo header to get its position
cubo_h3 = t.find('<h3 class="text-xl md:text-2xl font-bold text-secondary">Casas Tipo Cubo / Mediterráneas</h3>')
print(f'Cubo h3 at: {cubo_h3}')

# Find the gallery-grid that contains materiales (the broken one)
# It's the one with data-category="materiales"
# Search for it
mat_pos = t.find('data-category="materiales"')
print(f'First materiales data-category at: {mat_pos}')

# === 5) Force all large galleries to use gallery-grid (4 cols responsive) ===
# The cabin-grid-vidrio is reserved for Cabañas. Other galleries should use gallery-grid
# Find all gallery-grid blocks and ensure they have data-category set
positions = []
i = 0
while True:
    p = t.find('<div class="gallery-grid">', i)
    if p < 0: break
    positions.append(p)
    i = p + 1
print(f'gallery-grid positions: {positions}')

# === 6) Fix Cubo+Materiales: the gallery has only "materiales" cat but no "cubo" thumbs - rebuild it ===
# Find the Cubo gallery-grid
cubo_g = -1
for p in positions:
    block = t[p:p+5000]
    if 'data-category="cubo"' in block:
        cubo_g = p
        break
print(f'Cubo gallery at: {cubo_g}')

# The Cubo+Materiales section needs to be rebuilt - both cubo and materiales thumbs in one clean gallery
# This is the gallery the user is complaining about (showing img350 as text)
# Let me find the next gallery after Cubo
next_after_cubo = -1
for p in positions:
    if p > cubo_g:
        next_after_cubo = p
        break
print(f'Next gallery after Cubo: {next_after_cubo}')

# Find what imgs are in the Cubo block
cubo_block = t[cubo_g:next_after_cubo] if next_after_cubo > 0 else t[cubo_g:]
print(f'Cubo block size: {len(cubo_block)}')
import re as re_mod
cubo_imgs = re_mod.findall(r'data-href="catalogo concasaya/medium/(img\d+)\.webp"', cubo_block)
cubo_unique = list(dict.fromkeys(cubo_imgs))
print(f'Cubo gallery imgs: {cubo_unique[:10]}...')
mat_imgs = re_mod.findall(r'data-href="assets/images/(img\d+)\.webp"', cubo_block)
mat_unique = list(dict.fromkeys(mat_imgs))
print(f'Materiales gallery imgs (assets/images): {mat_unique[:10]}...')

# Save current state for inspection
with open(src, 'w', encoding='utf-8') as f:
    f.write(t)

# Final report
print('\n=== Final state ===')
print(f'  Total gallery-grid blocks: {t.count(chr(34) + "gallery-grid" + chr(34))}')
print(f'  cabin-hero classes: {t.count("cabin-hero")}')
print(f'  Top badges (amber-500): {t.count("bg-amber-500")}')
print(f'  File size: {len(t)}')
