#!/usr/bin/env python3
"""Replace 2 Pisos gallery with clean structure.
Strategy:
1. Find <div class="gallery-grid"> at pos 170843 (2pisos)
2. Find the next VALID <div class="mb-12"> AFTER the broken content (pos 191140)
3. Replace everything from 170843 to just before 191140 with a clean gallery-grid
"""
import re
src = r'C:\Workspace\concasaya\modelos.html'
with open(src, 'r', encoding='utf-8') as f:
    t = f.read()

# 2 Pisos image list from history
imgs = [
    'img1055', 'img1061', 'img1067', 'img1072', 'img1081', 'img1087', 'img1093', 'img1099', 'img1116',
    'img147', 'img190', 'img350', 'img353', 'img1141', 'img1172', 'img1240', 'img1243', 'img1246',
    'img1339', 'img1345', 'img1352', 'img1355', 'img1386', 'img362', 'img379', 'img442',
    'img968', 'img972', 'img1137', 'img1371', 'img1382', 'img929', 'img965', 'img1369',
    'img135', 'img218', 'img233', 'img1304', 'img1360'
]

# Find the start of the 2 Pisos gallery-grid
g_start = 170843  # known from trace
# Find the start of the NEXT <div class="mb-12"> (Cubo section)
# The first <div class="mb-12"> after the broken 2pisos is at 191140
# But the broken <a> tag at 173086 swallowed the Cubo header. The mb-12 is still there.
# So I need to find mb-12 after g_start
next_mb12 = t.find('<div class="mb-12">', g_start + 1)
print(f'g_start: {g_start}, next mb-12: {next_mb12}')

# Show the area around next_mb12 to verify it's the right one
print(f'around next mb-12: {t[next_mb12:next_mb12+300]!r}')

# Replace from g_start to next_mb12 with clean gallery-grid
new_block = '<div class="gallery-grid">\n\n'
for i, img in enumerate(imgs):
    if i == 0:
        badge = '\n            <span class="cabin-hero-badge">★ Top</span>'
        label = '\n            <span class="cabin-thumb-label cabin-thumb-label-dark"><i class="fas fa-home"></i> 2 Pisos</span>'
    else:
        badge = ''
        label = ''
    new_block += f'''              <a href="javascript:void(0);" class="gallery-thumb group block" data-lightbox="catalog" data-href="catalogo concasaya/medium/{img}.webp" role="button" tabindex="0" aria-label="Ampliar imagen" oncontextmenu="return false" ondragstart="return false" aria-label="Imagen del catálogo CONCASAYA" data-category="2pisos" data-variant="default">

                <img src="catalogo concasaya/thumbs/{img}.webp" alt="Casas CONCASAYA" loading="lazy" decoding="async" class="w-full h-full object-cover" />{badge}{label}

              </a>
'''
new_block += '\n          </div>\n\n          '  # closing div

t = t[:g_start] + new_block + t[next_mb12:]
print(f'After replace: size = {len(t)}')

# Update photo count badge
t = re.sub(r'(Casas Prefabricadas de Dos Pisos</h3>.*?)<span class="ml-auto[^"]*"[^>]*>(\d+) fotos</span>',
           r'\1<span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">39 fotos</span>',
           t, count=1, flags=re.S)

with open(src, 'w', encoding='utf-8') as f:
    f.write(t)

# Verify
print('\n=== Verify 2 Pisos ===')
g_start = t.find('<div class="gallery-grid">', t.find('Casas Prefabricadas de Dos Pisos'))
next_g = t.find('<div class="gallery-grid">', g_start + 1)
if next_g < 0: next_g = len(t)
block = t[g_start:next_g]
print(f'block size: {len(block)}')
thumb_count = block.count('class="gallery-thumb group block"')
print(f'thumbs: {thumb_count}')
has_bad = 'data-href="catalogo concasaya/medium/<' in block
print(f'malformed: {has_bad}')
has_cubo_in_block = 'data-category="cubo"' in block
print(f'has cubo category: {has_cubo_in_block}')

# Check Cubo is still there
print('\n=== Cubo check ===')
cubo_pos = t.find('Casas Tipo Cubo')
print(f'Cubo header at: {cubo_pos}')
# Find Cubo gallery
cubo_g = t.find('<div class="gallery-grid">', cubo_pos)
print(f'Cubo gallery at: {cubo_g}')
cubo_block = t[cubo_g:cubo_g+5000]
cubo_thumbs = cubo_block.count('class="gallery-thumb group block"')
print(f'Cubo thumbs: {cubo_thumbs}')

# H3 check
print('\n=== H3 check ===')
gal_start = t.find('id="galeria"')
for m in re.finditer(r'<h3[^>]*>([^<]+)</h3>', t[gal_start:]):
    print(f'  {(m.group(1).strip())}')
