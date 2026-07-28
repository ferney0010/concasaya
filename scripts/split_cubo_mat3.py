#!/usr/bin/env python3
import re

src = r'C:\Workspace\concasaya\modelos.html'
with open(src, 'r', encoding='utf-8') as f:
    t = f.read()

cubo_mb12 = t.find('<div class="mb-12">', t.find('id="cubo-mediterraneas"'))
proceso_h3 = t.find('<h3 class="text-xl md:text-2xl font-bold text-secondary">Proceso Constructivo</h3>')
close_pattern = '</div>\n\n        </div>\n\n      <div class="mb-12">'
close_pos = t.find(close_pattern, cubo_mb12, proceso_h3)
if close_pos < 0:
    close_pos = proceso_h3
cubo_end = close_pos + len('        </div>')
print(f'Cubo block: {cubo_mb12} - {cubo_end}')

block = t[cubo_mb12:cubo_end]

gg_start = block.find('<div class="gallery-grid">')
gg_end = block.rfind('          </div>') + len('          </div>')
header = block[:gg_start]
gallery_content = block[gg_start:gg_end]
footer = block[gg_end:]
print(f'Header: {len(header)} chars, Gallery: {len(gallery_content)}, Footer: {len(footer)}')

thumbs = re.findall(r'<a [^>]*?data-href="catalogo concasaya/medium/(img\d+)\.webp"[^>]*?>.*?</a>', gallery_content, re.S)
print(f'Total thumbs: {len(thumbs)}')

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

cubo_badge = str(len(cubo_thumbs_full))
mat_badge = str(len(mat_thumbs_full))

cubo_section = (
    '<div class="mb-12">\n\n'
    '          <div class="flex items-center gap-3 mb-4">\n\n'
    '            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">\n\n'
    '              <i class="fas fa-cube"></i>\n\n'
    '            </div>\n\n'
    '            <div>\n\n'
    '              <h3 class="text-xl md:text-2xl font-bold text-secondary">Casas Tipo Cubo / Mediterráneas</h3>\n\n'
    '              <p class="text-sm text-gray-500">Diseño contemporáneo con líneas rectas y grandes ventanales</p>\n\n'
    '            </div>\n\n'
    '            <span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">' + cubo_badge + ' fotos</span>\n\n'
    '          </div>\n\n'
    '          <div class="gallery-grid">\n\n'
    + '\n'.join(cubo_thumbs_full) + '\n\n          </div>\n\n        </div>'
)

mat_section = (
    '<div class="mb-12">\n\n'
    '          <div class="flex items-center gap-3 mb-4">\n\n'
    '            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">\n\n'
    '              <i class="fas fa-palette"></i>\n\n'
    '            </div>\n\n'
    '            <div>\n\n'
    '              <h3 class="text-xl md:text-2xl font-bold text-secondary">Materiales y Acabados</h3>\n\n'
    '              <p class="text-sm text-gray-500">Galería de materiales y acabados interiores</p>\n\n'
    '            </div>\n\n'
    '            <span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">' + mat_badge + ' fotos</span>\n\n'
    '          </div>\n\n'
    '          <div class="gallery-grid">\n\n'
    + '\n'.join(mat_thumbs_full) + '\n\n          </div>\n\n        </div>'
)

new_block = cubo_section + '\n\n      ' + mat_section

t = t[:cubo_mb12] + new_block + t[cubo_end:]

with open(src, 'w', encoding='utf-8') as f:
    f.write(t)

print('\n=== Verify ===')
print(f'  cubo thumbs: {t.count("data-category=" + chr(34) + "cubo" + chr(34))}')
print(f'  materiales thumbs: {t.count("data-category=" + chr(34) + "materiales" + chr(34))}')
print(f'  file size: {len(t)}')
