#!/usr/bin/env python3
"""Fix final de las 3 galerías: estructura limpia con la lista correcta de imgs."""
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
    positions = []
    i = 0
    while True:
        p = t.find('<div class="gallery-grid">', i)
        if p < 0: break
        positions.append(p)
        i = p + 1
    for idx, p in enumerate(positions):
        next_p = positions[idx + 1] if idx + 1 < len(positions) else len(t)
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

# Define imgs lists:
# Plaqueta 1P: from current file (33 unique)
# Casas en L: from current file (9 unique)
# 2 Pisos: from history (39 imgs) - need to recover from the corrupted state

# For 2 Pisos, use the history list. Hero = img1055
# But wait, img1055 was in the OLD 2 Pisos list. Let me check if it's still in 2pisos context.
# Actually the old list was curated by user. The user's original list for "Casas Prefabricadas de Dos Pisos" was:
# 1055, 1061, 1067, 1072, 1081, 1087, 1093, 1099, 1116 (cubos) + 147, 190, 350, 353, 1141, 1172, 1240, 1243, 1246, 1339, 1345, 1352, 1355, 1386, 362, 379, 442, 968, 972, 1137, 1371, 1382, 929, 965, 1369 (mixed) + 135, 218, 233, 1304, 1360 (extras)
# That's 39 imgs total.

# Use img1055 as principal (matches the OLD commit 9b90e89 hero)
p2pisos_imgs = [
    'img1055',  # principal/hero
    'img1061', 'img1067', 'img1072', 'img1081', 'img1087', 'img1093', 'img1099', 'img1116',
    'img147', 'img190', 'img350', 'img353', 'img1141', 'img1172', 'img1240', 'img1243', 'img1246',
    'img1339', 'img1345', 'img1352', 'img1355', 'img1386', 'img362', 'img379', 'img442',
    'img968', 'img972', 'img1137', 'img1371', 'img1382', 'img929', 'img965', 'img1369',
    'img135', 'img218', 'img233', 'img1304', 'img1360'
]
# Total: 39 imgs (1 hero + 38 grid)

# Wait, the user said "42 fotos" in the badge. Maybe they had 42. But 39 is what the history shows.
# I'll use 39 for now, and update the badge accordingly.

# Process 3 galleries, right to left
galleries = [
    ('plaqueta1p', 'Plaqueta 1 Piso'),  # smallest first to preserve offsets of larger
    ('l', 'Casa en L'),
    ('2pisos', '2 Pisos'),
]

targets = []
for cat, label in galleries:
    s, e = find_block_for_category(t, cat)
    if s is None:
        print(f'WARN: {cat} not found')
        continue
    if cat == '2pisos':
        # Use history imgs since current state is corrupted
        imgs = p2pisos_imgs
    else:
        imgs = extract_imgs(t, s, e)
    print(f'{cat}: {len(imgs)} unique imgs, pos {s}-{e}')
    targets.append((s, e, cat, label, imgs))

# Sort DESCENDING by start position
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
    print(f'  {cat} replaced with {len(imgs)} thumbs. New size: {len(t)}')

# Update photo count badges
# 2 Pisos: 33 fotos -> 39 fotos
t = t.replace(
    '<span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">33 fotos</span>',
    '<span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">39 fotos</span>',
    1
)
# Plaqueta 1P: 33 -> 32
t = t.replace(
    '<span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">32 fotos</span>',
    '<span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">32 fotos</span>',
    1
)
# Plaqueta 1P was 33 originally, became 32 (1 hero + 31 grid = 32 imgs after rewrite). Update if still 33.
# Check current state
import re as re_mod
m = re_mod.search(r'Plaqueta de 1 Piso</h3>\s*<p[^>]*>[^<]+</p>\s*</div>\s*<span class="ml-auto[^"]*"[^>]*>(\d+) fotos</span>', t)
if m:
    print(f'Plaqueta 1P badge: {m.group(1)} fotos')

with open(src, 'w', encoding='utf-8') as f:
    f.write(t)

# Verify
print('\n=== Final verification ===')
for cat, name in [('plaqueta1p', 'Plaqueta 1P'), ('l', 'Casas en L'), ('2pisos', '2 Pisos')]:
    s, e = find_block_for_category(t, cat)
    if s is None:
        print(f'  {name}: NOT FOUND')
        continue
    block = t[s:e]
    thumb_count = block.count('class="gallery-thumb group block"')
    has_nested = '<div class="grid grid-cols-2' in block
    has_bad = 'data-href="catalogo concasaya/medium/<' in block
    print(f'  {name}: thumbs={thumb_count}, nested={has_nested}, malformed={has_bad}')

# Also check there are no orphan <a tags leaking text
print('\n=== Check malformed tags ===')
m = re_mod.search(r'data-href="[^"]*<', t)
if m:
    print(f'  MALFORMED at {m.start()}: {t[m.start():m.start()+200]}')
else:
    print('  no malformed data-href tags')

print('\nFinal size:', len(t))
