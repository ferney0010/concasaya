#!/usr/bin/env python3
import re

src = r'C:\Workspace\concasaya\modelos.html'
with open(src, 'r', encoding='utf-8') as f:
    t = f.read()

# Use the h3 marker to find the start
cubo_h3 = t.find('<h3 class="text-xl md:text-2xl font-bold text-secondary">Casas Tipo Cubo / Mediterráneas</h3>')
# Find the <div class="mb-12"> that contains this h3
mb12_start = t.rfind('<div class="mb-12">', 0, cubo_h3)
print(f'Cubo h3 at: {cubo_h3}, mb-12 start: {mb12_start}')

# Find the end of this block by counting <div and </div>
depth = 0
i = mb12_start
while i < len(t):
    next_open = t.find('<div', i + 1)
    next_close = t.find('</div>', i + 1)
    if next_close < 0:
        break
    if 0 <= next_open < next_close:
        depth += 1
        i = next_open + 4
    else:
        depth -= 1
        i = next_close + 6
        if depth == 0:
            break

cubo_end = i
print(f'Cubo block: {mb12_start} - {cubo_end} ({cubo_end - mb12_start} chars)')

# Verify
print('Next mb-12 after:', t.find('<div class="mb-12">', mb12_start + 1))

block = t[mb12_start:cubo_end]
# Find the gallery-grid
gg_start = block.find('<div class="gallery-grid">')
gg_end = block.rfind('          </div>') + len('          </div>')
gallery_content = block[gg_start:gg_end]
print(f'Gallery content: {len(gallery_content)} chars')

# Extract all <a> tags
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
if unknown:
    print('Unknown samples:', [u[:80] for u in unknown[:3]])

# Now split: extract header (up to gallery-grid), rebuild 2 sub-blocks
header = block[:gg_start]
footer = block[gg_end:]
print(f'Header: {len(header)}, Footer: {len(footer)}')

# Use the existing header for Cubo (it has the title and badge)
# Just update the badge count
cubo_badge = str(len(cubo_thumbs_full))
mat_badge = str(len(mat_thumbs_full))

# Build new Cubo block (uses original header with updated badge)
cubo_block_new = re.sub(r'>(\d+) fotos<', f'>{cubo_badge} fotos<', header, count=1)
cubo_block_new += '<div class="gallery-grid">\n\n' + '\n'.join(cubo_thumbs_full) + '\n\n          </div>\n\n        </div>'

# Build Materiales block (new header with materiales icon/title)
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
    f'            <span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">{mat_badge} fotos</span>\n\n'
    '          </div>\n\n'
    '          <div class="gallery-grid">\n\n'
)
mat_block_new = mat_header + '\n'.join(mat_thumbs_full) + '\n\n          </div>\n\n        </div>'

new_block = cubo_block_new + '\n\n      ' + mat_block_new

t = t[:mb12_start] + new_block + t[cubo_end:]

with open(src, 'w', encoding='utf-8') as f:
    f.write(t)

print('\n=== Verify ===')
print(f'  cubo thumbs: {t.count(chr(34) + "cubo" + chr(34) + chr(32) + chr(34) + chr(47) + chr(62) or "data-category=" + chr(34) + "cubo" + chr(34))}')
print(f'  materiales thumbs: {t.count("data-category=" + chr(34) + "materiales" + chr(34))}')
print(f'  file size: {len(t)}')
