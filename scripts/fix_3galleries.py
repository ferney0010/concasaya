#!/usr/bin/env python3
"""Reescribe las 3 galerías problemáticas con estructura limpia (como Cubo).

Estructura objetivo:
  <div class="gallery-grid">
    <a class="gallery-thumb group block" ...>
      <img ... />
    </a>
    <a class="gallery-thumb group block" ...>
      <img ... />
    </a>
    ...
  </div>
"""
import re

src = r'C:\Workspace\concasaya\modelos.html'
with open(src, 'r', encoding='utf-8') as f:
    t = f.read()

# Extract image lists per category (only need unique img numbers, in order)
def extract_imgs(t, start_pos, end_pos):
    """Extract unique img numbers in order from a gallery block."""
    block = t[start_pos:end_pos]
    # Find all data-href="catalogo concasaya/medium/imgXXX.webp"
    imgs_with_pos = []
    for m in re.finditer(r'data-href="catalogo concasaya/medium/(img\d+)\.webp"', block):
        imgs_with_pos.append(m.group(1))
    # Dedupe preserving order
    seen = set()
    unique = []
    for img in imgs_with_pos:
        if img not in seen:
            seen.add(img)
            unique.append(img)
    return unique

def find_gallery_end(t, start):
    """Find the closing </div> of the gallery-grid block at start.
    The block ends with the closing </div> of the OUTER <div class="gallery-grid">.
    The bad structure has nested divs. The closing </div> is the LAST </div> before the next sibling.
    """
    # Find the LAST </div> in the block, before the next <div class="mb-12">
    next_mb12 = t.find('<div class="mb-12">', start + 1)
    if next_mb12 < 0:
        next_mb12 = len(t)
    # Last </div> in [start, next_mb12) range
    end = t.rfind('</div>', start, next_mb12)
    # Make sure the gallery ends - look for a matching </div> after the </div> of inner grid
    # The structure ends with: ... </a></div>\n\n        </div>
    # We need to find the rightmost </div> that closes our gallery-grid
    # Actually the LAST </div> should close our outer div
    return end + len('</div>')

def build_thumb(img, category, variant='default', include_badge=False, badge_text='', label_text=''):
    """Build a clean gallery thumb."""
    badge_html = ''
    label_html = ''
    if include_badge:
        badge_html = f'\n            <span class="cabin-hero-badge">{badge_text}</span>'
    if label_text:
        label_html = f'\n            <span class="cabin-thumb-label cabin-thumb-label-dark"><i class="fas fa-home"></i> {label_text}</span>'
    return f'''              <a href="javascript:void(0);" class="gallery-thumb group block" data-lightbox="catalog" data-href="catalogo concasaya/medium/{img}.webp" role="button" tabindex="0" aria-label="Ampliar imagen" oncontextmenu="return false" ondragstart="return false" aria-label="Imagen del catálogo CONCASAYA" data-category="{category}" data-variant="{variant}">

                <img src="catalogo concasaya/thumbs/{img}.webp" alt="Casas CONCASAYA" loading="lazy" decoding="async" class="w-full h-full object-cover" />{badge_html}{label_html}

              </a>'''

# --- 1) Plaqueta 1P ---
p1_start = t.find('<div class="gallery-grid">', t.find('Plaqueta de 1 Piso'))
p1_end = find_gallery_end(t, p1_start)
p1_imgs = extract_imgs(t, p1_start, p1_end)
print(f'Plaqueta 1P: {len(p1_imgs)} imgs, pos {p1_start}-{p1_end}')

# The principal (first image) gets the hero treatment
p1_thumbs = []
for i, img in enumerate(p1_imgs):
    if i == 0:
        # Hero with badge
        p1_thumbs.append(build_thumb(img, 'plaqueta1p', include_badge=True, badge_text='★ Top', label_text='Plaqueta 1 Piso'))
    else:
        p1_thumbs.append(build_thumb(img, 'plaqueta1p'))

new_p1 = '<div class="gallery-grid">\n\n' + '\n'.join(p1_thumbs) + '\n\n          </div>'
t = t[:p1_start] + new_p1 + t[p1_end:]

# --- 2) Casas en L ---
# Re-find positions after t was modified
p2_start = t.find('<div class="gallery-grid">', t.find('Casas en L'))
p2_end = find_gallery_end(t, p2_start)
p2_imgs = extract_imgs(t, p2_start, p2_end)
print(f'Casas en L: {len(p2_imgs)} imgs, pos {p2_start}-{p2_end}')

p2_thumbs = []
for i, img in enumerate(p2_imgs):
    if i == 0:
        p2_thumbs.append(build_thumb(img, 'l', include_badge=True, badge_text='★ Top', label_text='Casa en L'))
    else:
        p2_thumbs.append(build_thumb(img, 'l'))

new_p2 = '<div class="gallery-grid">\n\n' + '\n'.join(p2_thumbs) + '\n\n          </div>'
t = t[:p2_start] + new_p2 + t[p2_end:]

# --- 3) Casas Prefabricadas de Dos Pisos ---
p3_start = t.find('<div class="gallery-grid">', t.find('Casas Prefabricadas de Dos Pisos'))
p3_end = find_gallery_end(t, p3_start)
p3_imgs = extract_imgs(t, p3_start, p3_end)
print(f'2 Pisos: {len(p3_imgs)} imgs, pos {p3_start}-{p3_end}')

p3_thumbs = []
for i, img in enumerate(p3_imgs):
    if i == 0:
        p3_thumbs.append(build_thumb(img, '2pisos', include_badge=True, badge_text='★ Top', label_text='2 Pisos'))
    else:
        p3_thumbs.append(build_thumb(img, '2pisos'))

new_p3 = '<div class="gallery-grid">\n\n' + '\n'.join(p3_thumbs) + '\n\n          </div>'
t = t[:p3_start] + new_p3 + t[p3_end:]

# Update photo count badges in headers
# Plaqueta de 1 Piso: "33 fotos"
# Casas en L: "9 fotos"
# Casas Prefabricadas de Dos Pisos: "42 fotos"
t = t.replace('Plaqueta de 1 Piso', 'Plaqueta de 1 Piso', 1)  # noop
# Just leave the photo counts; they're informational

with open(src, 'w', encoding='utf-8') as f:
    f.write(t)

# Verify
print('\n=== Verification ===')
for cat, name in [('plaqueta1p', 'Plaqueta 1P'), ('l', 'Casas en L'), ('2pisos', '2 Pisos')]:
    block_start = t.find(f'data-category="{cat}"')
    if block_start > 0:
        # find the next </div> after the gallery
        gallery_start = t.rfind('<div class="gallery-grid">', 0, block_start)
        gallery_end = t.find('</div>\n\n        </div>', gallery_start)
        if gallery_end < 0:
            gallery_end = t.find('</div>', gallery_start + 200)
        block = t[gallery_start:gallery_end+6]
        nested_grid = '<div class="grid grid-cols-2' in block
        print(f'  {name}: gallery-grid at {gallery_start}, has nested grid: {nested_grid}')
        # count thumbs
        thumb_count = block.count('class="gallery-thumb group block"')
        print(f'    thumbs: {thumb_count}')

print('\nFinal size:', len(t))
