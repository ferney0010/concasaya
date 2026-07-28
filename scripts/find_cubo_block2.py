#!/usr/bin/env python3
import re

src = r'C:\Workspace\concasaya\modelos.html'
with open(src, 'r', encoding='utf-8') as f:
    t = f.read()

# Cubo+Materiales block: gallery-grid at 188955, ends at next mb-12 (206224)
gg_start = 188955
next_mb12 = 206224

# Find the </div> that closes the gallery-grid
# The gallery-grid block contains ALL thumbs (cubo + materiales)
block = t[gg_start:next_mb12]
print(f'Block size: {len(block)}')

# Find the close of gallery-grid
# gallery-grid has nested </div> for each thumb's img but no <div> inside thumbs
# So the structure is: <div class="gallery-grid"> ... <a>...</a> ... </div>
# Find last </div> before next mb-12
# Simpler: find the closing pattern
close_marker = '          </div>\n\n        </div>\n\n      <div class="mb-12">'
close_pos = block.find(close_marker)
if close_pos > 0:
    gg_end = gg_start + close_pos + len('          </div>')
else:
    # fallback
    gg_end = next_mb12
print(f'gg_start: {gg_start}, gg_end: {gg_end}')

# Extract gallery content
gallery_content = t[gg_start:gg_end]
print(f'Gallery content: {len(gallery_content)} chars')

# Extract all <a> thumbs
thumbs = re.findall(r'<a [^>]*?data-href="catalogo concasaya/medium/(img\d+)\.webp"[^>]*?>.*?</a>', gallery_content, re.S)
print(f'Total thumbs: {len(thumbs)}')

cubo_thumbs_full = []
mat_thumbs_full = []
unknown = []
for t_full in thumbs:
    if 'data-category="cubo"' in t_full:
        cubo_thumbs_full.append(t_full)
    elif 'data-category="materiales"' in t_full:
        mat_thumbs_full.append(t_full)
    else:
        unknown.append(t_full)
print(f'Cubo: {len(cubo_thumbs_full)}, Materiales: {len(mat_thumbs_full)}, Unknown: {len(unknown)}')

# Now find the header (h3 + badge) which is BEFORE gg_start
# The h3 and badge are in the mb-12 wrapper. Find the start of the mb-12
mb12_start = t.rfind('<div class="mb-12">', 0, gg_start)
print(f'mb-12 start: {mb12_start}')

# Header: from mb-12 start to gg_start
header = t[mb12_start:gg_start]
print(f'Header: {len(header)} chars')
# Update Cubo badge count
header = re.sub(r'>(\d+) fotos<', f'>{len(cubo_thumbs_full)} fotos<', header, count=1)

# Footer: from gg_end to next_mb12
footer = t[gg_end:next_mb12]
print(f'Footer: {len(footer)} chars')

# Build new Cubo block (use original header)
new_cubo = header + '<div class="gallery-grid">\n\n' + '\n'.join(cubo_thumbs_full) + '\n\n          </div>\n\n        </div>'

# Build new Materiales block (new header)
mat_header = (
    '<div class="mb-12">\n\n'
    '          <div class="flex items-center gap-3 mb-4">\n\n'
    '            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">\n\n'
    '              <i class="fas fa-palette"></i>\n\n'
    '            </div>\n\n'
    '            <div>\n\n'
    '              <h3 class="text-xl md:text-2xl font-bold text-secondary">Materiales y Acabados</h3>\n\n'
    '              <p class="text-sm text-gray-500">Galería de materiales y acabados interiores</p>\n\n'
    '            </div>\n\n'
    f'            <span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">{len(mat_thumbs_full)} fotos</span>\n\n'
    '          </div>\n\n'
    '          <div class="gallery-grid">\n\n'
)
new_mat = mat_header + '\n'.join(mat_thumbs_full) + '\n\n          </div>\n\n        </div>'

# Combine
new_block = new_cubo + '\n\n      ' + new_mat + footer

t = t[:mb12_start] + new_block + t[next_mb12:]

with open(src, 'w', encoding='utf-8') as f:
    f.write(t)

print('\n=== Verify ===')
print(f'  cubo thumbs: {t.count("data-category=" + chr(34) + "cubo" + chr(34))}')
print(f'  materiales thumbs: {t.count("data-category=" + chr(34) + "materiales" + chr(34))}')
print(f'  file size: {len(t)}')
