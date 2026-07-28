#!/usr/bin/env python3
"""Split Cubo+Materiales block into 2 separate sub-galleries.

Algorithm:
1. Find Cubo mb-12 block boundaries
2. Extract all <a> tags
3. Sort: cubo thumbs first, then materiales thumbs
4. Rebuild the block with 2 separate <h3> + 2 separate <div class="gallery-grid">
5. Split the '8 fotos' badge into '8 fotos' for Cubo and '22 fotos' for Materiales
"""
import re

src = r'C:\Workspace\concasaya\modelos.html'
with open(src, 'r', encoding='utf-8') as f:
    t = f.read()

# Find the Cubo block
cubo_mb12 = t.find('<div class="mb-12">', t.find('id="cubo-mediterraneas"'))
proceso_h3 = t.find('<h3 class="text-xl md:text-2xl font-bold text-secondary">Proceso Constructivo</h3>')
# Find the closing of Cubo mb-12 (right before Proceso mb-12)
# Pattern: '          </div>\n\n        </div>\n\n      <div class="mb-12">'
close_pattern = '</div>\n\n        </div>\n\n      <div class="mb-12">'
close_pos = t.find(close_pattern, cubo_mb12, proceso_h3)
if close_pos < 0:
    close_pos = proceso_h3
cubo_end = close_pos + len('        </div>')  # include the outer closing </div>
print(f'Cubo block: {cubo_mb12} - {cubo_end}')

block = t[cubo_mb12:cubo_end]

# Extract header and footer parts
# Find the first gallery-grid
gg_start = block.find('<div class="gallery-grid">')
# Find the close of gallery-grid
gg_end = block.rfind('          </div>') + len('          </div>')
header = block[:gg_start]
gallery_content = block[gg_start:gg_end]
footer = block[gg_end:]
print(f'Header: {len(header)} chars')
print(f'Gallery: {len(gallery_content)} chars')
print(f'Footer: {len(footer)} chars')

# Extract all <a> tags from gallery_content
# Each <a> starts with '<a href=' and ends with '</a>'
thumbs = re.findall(r'<a [^>]*?data-href="catalogo concasaya/medium/(img\d+)\.webp"[^>]*?>.*?</a>', gallery_content, re.S)
print(f'Total thumbs found: {len(thumbs)}')
# Classify
cubo_thumbs_full = []
mat_thumbs_full = []
for t_full in thumbs:
    if 'data-category="cubo"' in t_full:
        cubo_thumbs_full.append(t_full)
    elif 'data-category="materiales"' in t_full:
        mat_thumbs_full.append(t_full)
    else:
        print(f'  UNKNOWN: {t_full[:100]}')
print(f'Cubo: {len(cubo_thumbs_full)}, Materiales: {len(mat_thumbs_full)}')

# Build new block
cubo_section = '''<div class="mb-12">

          <div class="flex items-center gap-3 mb-4">

            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">

              <i class="fas fa-cube"></i>

            </div>

            <div>

              <h3 class="text-xl md:text-2xl font-bold text-secondary">Casas Tipo Cubo / Mediterráneas</h3>

              <p class="text-sm text-gray-500">Diseño contemporáneo con líneas rectas y grandes ventanales</p>

            </div>

            <span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">''' + str(len(cubo_thumbs_full)) + ' fotos</span>

          </div>

          <div class="gallery-grid">

''' + '\n'.join(cubo_thumbs_full) + '\n\n          </div>\n\n        </div>'

# Materiales section
mat_section = '''<div class="mb-12">

          <div class="flex items-center gap-3 mb-4">

            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">

              <i class="fas fa-palette"></i>

            </div>

            <div>

              <h3 class="text-xl md:text-2xl font-bold text-secondary">Materiales y Acabados</h3>

              <p class="text-sm text-gray-500">Galería de materiales y acabados interiores</p>

            </div>

            <span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">''' + str(len(mat_thumbs_full)) + ' fotos</span>

          </div>

          <div class="gallery-grid">

''' + '\n'.join(mat_thumbs_full) + '\n\n          </div>\n\n        </div>'

# Combine
new_block = cubo_section + '\n\n      ' + mat_section

# Replace
t = t[:cubo_mb12] + new_block + t[cubo_end:]

with open(src, 'w', encoding='utf-8') as f:
    f.write(t)

# Verify
print('\n=== Verify ===')
cubo_count = t.count('data-category="cubo"')
mat_count = t.count('data-category="materiales"')
print(f'  Total cubo thumbs: {cubo_count}')
print(f'  Total materiales thumbs: {mat_count}')
