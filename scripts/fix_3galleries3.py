#!/usr/bin/env python3
"""Reescribe las 3 galerías. Busca por data-category directamente."""
import re

src = r'C:\Workspace\concasaya\modelos.html'
with open(src, 'r', encoding='utf-8') as f:
    t = f.read()

def extract_imgs(t, start_pos, end_pos):
    block = t[start_pos:end_pos]
    imgs = []
    for m in re.finditer(r'data-href="catalogo concasaya/medium/(img\d+)\.webp"', block):
        imgs.append(m.group(1))
    seen = set()
    unique = []
    for img in imgs:
        if img not in seen:
            seen.add(img)
            unique.append(img)
    return unique

def find_block_for_category(t, category):
    """Find the <div class="gallery-grid"> that contains thumbs with this data-category.
    Returns (start, end) of the gallery-grid block."""
    # Find all gallery-grid positions
    positions = []
    i = 0
    while True:
        p = t.find('<div class="gallery-grid">', i)
        if p < 0: break
        positions.append(p)
        i = p + 1
    # For each, check if it contains thumbs with our category
    for idx, p in enumerate(positions):
        # End of this gallery is at the next </div></div> closing, before the next gallery-grid
        next_p = positions[idx + 1] if idx + 1 < len(positions) else len(t)
        # find closing </div>
        end = t.rfind('        </div>', p, next_p)
        if end < 0:
            end = t.rfind('</div>', p, next_p)
        end += len('</div>')
        block = t[p:end]
        if f'data-category="{category}"' in block:
            return (p, end)
    return (None, None)

def build_thumb(img, category, variant='default', include_badge=False, badge_text='', label_text=''):
    badge_html = ''
    label_html = ''
    if include_badge:
        badge_html = f'\n            <span class="cabin-hero-badge">{badge_text}</span>'
    if label_text:
        label_html = f'\n            <span class="cabin-thumb-label cabin-thumb-label-dark"><i class="fas fa-home"></i> {label_text}</span>'
    return f'''              <a href="javascript:void(0);" class="gallery-thumb group block" data-lightbox="catalog" data-href="catalogo concasaya/medium/{img}.webp" role="button" tabindex="0" aria-label="Ampliar imagen" oncontextmenu="return false" ondragstart="return false" aria-label="Imagen del catálogo CONCASAYA" data-category="{category}" data-variant="{variant}">

                <img src="catalogo concasaya/thumbs/{img}.webp" alt="Casas CONCASAYA" loading="lazy" decoding="async" class="w-full h-full object-cover" />{badge_html}{label_html}

              </a>'''

galleries = [
    ('2pisos', '2 Pisos'),
    ('l', 'Casa en L'),
    ('plaqueta1p', 'Plaqueta 1 Piso'),
]

# Find all targets first
targets = []
for cat, label in galleries:
    s, e = find_block_for_category(t, cat)
    if s is None:
        print(f'WARN: {cat} not found')
        continue
    imgs = extract_imgs(t, s, e)
    print(f'{cat}: {len(imgs)} unique imgs, pos {s}-{e}')
    targets.append((s, e, cat, label, imgs))

# Sort by start position DESCENDING
targets.sort(key=lambda x: -x[0])

for s, e, cat, label, imgs in targets:
    thumbs = []
    for i, img in enumerate(imgs):
        if i == 0:
            thumbs.append(build_thumb(img, cat, include_badge=True, badge_text='★ Top', label_text=label))
        else:
            thumbs.append(build_thumb(img, cat))
    new_block = '<div class="gallery-grid">\n\n' + '\n'.join(thumbs) + '\n\n          </div>'
    t = t[:s] + new_block + t[e:]
    print(f'  {cat} replaced. New size: {len(t)}')

# Update the 2 Pisos photo count from 33 to 42
t = t.replace('Casas Prefabricadas de Dos Pisos</h3>\n              <p class="text-sm text-gray-500">Casas familiares de 2 pisos en plaqueta de concreto reforzada, campestres y coloniales, con techo de teja de barro</p>\n            </div>\n            <span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">33 fotos</span>',
              'Casas Prefabricadas de Dos Pisos</h3>\n              <p class="text-sm text-gray-500">Casas familiares de 2 pisos en plaqueta de concreto reforzada, campestres y coloniales, con techo de teja de barro</p>\n            </div>\n            <span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">42 fotos</span>', 1)

# Update Plaqueta 1P: 33 -> 32 (hero + 31 grid)
t = t.replace('Plaqueta de 1 Piso</h3>\n              <p class="text-sm text-gray-500">Casas tradicionales de 1 piso en plaqueta de concreto reforzada, coloniales y en forma de L, con techo de teja de barro</p>\n            </div>\n            <span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">33 fotos</span>',
              'Plaqueta de 1 Piso</h3>\n              <p class="text-sm text-gray-500">Casas tradicionales de 1 piso en plaqueta de concreto reforzada, coloniales y en forma de L, con techo de teja de barro</p>\n            </div>\n            <span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">32 fotos</span>', 1)

with open(src, 'w', encoding='utf-8') as f:
    f.write(t)

# Verify
print('\n=== Final verification ===')
for cat, name in [('plaqueta1p', 'Plaqueta 1P'), ('l', 'Casas en L'), ('2pisos', '2 Pisos')]:
    s, e = find_block_for_category(t, cat)
    block = t[s:e]
    thumb_count = block.count('class="gallery-thumb group block"')
    has_nested = '<div class="grid grid-cols-2' in block
    print(f'  {name}: thumbs={thumb_count}, has nested grid={has_nested}')

print('\nFinal size:', len(t))
