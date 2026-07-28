#!/usr/bin/env python3
"""Reescribe SOLO el div.gallery-grid de 3 galerías, preservando el h3 header.

Estrategia: encontrar el patrón exacto "<div class="gallery-grid">..." y su </div>
de cierre, reemplazándolo con un thumb limpio.
"""
import re

src = r'C:\Workspace\concasaya\modelos.html'
with open(src, 'r', encoding='utf-8') as f:
    t = f.read()

def find_gallery_block(t, category):
    """Find the EXACT range of <div class="gallery-grid">...</div> for a given category.
    Returns (start, end) where start is the position of <div class="gallery-grid"> and end is after the closing </div>.
    The block is between the gallery-grid open and its matching close, BEFORE the next sub-gallery block.
    """
    # Find all gallery-grid positions
    positions = []
    i = 0
    while True:
        p = t.find('<div class="gallery-grid">', i)
        if p < 0: break
        positions.append(p)
        i = p + 1
    for idx, p in enumerate(positions):
        # Find the closing </div> for this block
        # In the bad structure, the gallery-grid contains a nested <div class="grid grid-cols-2...">...</div>
        # So the gallery-grid block has multiple closing </div> tags
        # The first </div> closes the inner grid, the second closes the gallery-grid
        # Find </div></div> pattern right after the position
        # Simpler: find the next "</div>\n\n        </div>" pattern (the second </div> closes outer)
        # But this depends on whitespace. Let's count manually.
        depth = 1
        pos = p + len('<div class="gallery-grid">')
        # Find next <div or </div>
        while depth > 0:
            next_open = t.find('<div', pos)
            next_close = t.find('</div>', pos)
            if next_close < 0:
                return None
            if next_open >= 0 and next_open < next_close:
                depth += 1
                pos = next_open + 4
            else:
                depth -= 1
                pos = next_close + len('</div>')
        return (p, pos)
    return (None, None)

def find_category_gallery(t, category):
    """Find the gallery-grid block for a specific category."""
    positions = []
    i = 0
    while True:
        p = t.find('<div class="gallery-grid">', i)
        if p < 0: break
        positions.append(p)
        i = p + 1
    for p in positions:
        s, e = (p, None)
        # Use find_gallery_block logic
        depth = 1
        pos = p + len('<div class="gallery-grid">')
        while depth > 0:
            next_open = t.find('<div', pos)
            next_close = t.find('</div>', pos)
            if next_close < 0:
                break
            if next_open >= 0 and next_open < next_close:
                depth += 1
                pos = next_open + 4
            else:
                depth -= 1
                pos = next_close + len('</div>')
        end = pos
        block = t[p:end]
        if f'data-category="{category}"' in block:
            return (p, end)
    return (None, None)

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

# 2 Pisos: use history list since current file is corrupted
p2pisos_imgs = [
    'img1055', 'img1061', 'img1067', 'img1072', 'img1081', 'img1087', 'img1093', 'img1099', 'img1116',
    'img147', 'img190', 'img350', 'img353', 'img1141', 'img1172', 'img1240', 'img1243', 'img1246',
    'img1339', 'img1345', 'img1352', 'img1355', 'img1386', 'img362', 'img379', 'img442',
    'img968', 'img972', 'img1137', 'img1371', 'img1382', 'img929', 'img965', 'img1369',
    'img135', 'img218', 'img233', 'img1304', 'img1360'
]

# Process 3 galleries, right to left
galleries = [
    ('plaqueta1p', 'Plaqueta 1 Piso'),
    ('l', 'Casa en L'),
    ('2pisos', '2 Pisos'),
]

targets = []
for cat, label in galleries:
    s, e = find_category_gallery(t, cat)
    if s is None:
        print(f'WARN: {cat} not found')
        continue
    if cat == '2pisos':
        imgs = p2pisos_imgs
    else:
        imgs = extract_imgs(t, s, e)
    print(f'{cat}: {len(imgs)} unique imgs, pos {s}-{e}')
    targets.append((s, e, cat, label, imgs))

# Sort DESCENDING
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

# Update photo count badges
# 2 Pisos: 33 -> 39
t = re.sub(r'(Casas Prefabricadas de Dos Pisos</h3>.*?)<span class="ml-auto[^"]*"[^>]*>(\d+) fotos</span>',
           r'\1<span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">39 fotos</span>',
           t, count=1, flags=re.S)

with open(src, 'w', encoding='utf-8') as f:
    f.write(t)

# Verify
print('\n=== Final verification ===')
for cat, name in [('plaqueta1p', 'Plaqueta 1P'), ('l', 'Casas en L'), ('2pisos', '2 Pisos')]:
    s, e = find_category_gallery(t, cat)
    if s is None:
        print(f'  {name}: NOT FOUND')
        continue
    block = t[s:e]
    thumb_count = block.count('class="gallery-thumb group block"')
    has_nested = '<div class="grid grid-cols-2' in block
    has_bad = 'data-href="catalogo concasaya/medium/<' in block
    print(f'  {name}: thumbs={thumb_count}, nested={has_nested}, malformed={has_bad}')

# Also check h3s are preserved
print('\n=== H3 check ===')
gal_start = t.find('id="galeria"')
for m in re.finditer(r'<h3[^>]*>([^<]+)</h3>', t[gal_start:]):
    print(f'  {(m.group(1).strip())}')

print('\nFinal size:', len(t))
