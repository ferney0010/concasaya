#!/usr/bin/env python3
"""Add a new 'Casas en L' sub-gallery and update the corresponding featured card.

  - 10 images total: img630 = 'principal' (hero), 9 in grid:
    1072, 1087, 1093, 1099, 1240, 1236, 611, 484
  - Inserted between 'Plaqueta de 1 Piso' and 'Casas Prefabricadas de Dos Pisos'
  - New CAT_META entry: 'l' -> 'Casas en L'
  - Update featured card 'Casa en L con jardin central' to data-category='l'
    and point data-img to img630 (the new principal)
"""
import re
from pathlib import Path

FILE = Path(r"C:\Workspace\concasaya\modelos.html")
content = FILE.read_text(encoding="utf-8")

# 1) Build the new 'Casas en L' sub-gallery block
PRINCIPAL = "630"
OTHERS = [
    "1072", "1087", "1093", "1099", "1240", "1236", "611", "484"
]
TOTAL = len(OTHERS) + 1   # 9

def thumb(idx, principal=False):
    extra_class = " cabin-hero" if principal else ""
    badge = (
        '<span class="cabin-hero-badge">★ Top</span>'
        '<span class="cabin-thumb-label cabin-thumb-label-dark"><i class="fas fa-home"></i> Casa en L</span>'
    ) if principal else ""
    sizes = ('(max-width: 1024px) 100vw, 50vw' if principal
             else '(max-width: 640px) 50vw, 33vw')
    return f'''          <a href="javascript:void(0);" class="gallery-thumb{extra_class}" data-lightbox="catalog" data-href="catalogo concasaya/medium/img{idx}.webp" role="button" tabindex="0" aria-label="Casa en L {idx}" oncontextmenu="return false" ondragstart="return false" data-category="l" data-variant="default">
            <img src="catalogo concasaya/thumbs/img{idx}.webp" srcset="catalogo%20concasaya/thumbs/img{idx}.webp" 400w, "catalogo%20concasaya/medium/img{idx}.webp" 800w" sizes="{sizes}" alt="Casa en L CONCASAYA" loading="lazy" decoding="async" class="w-full h-full object-cover" />
            {badge}
          </a>
'''

hero = thumb(PRINCIPAL, principal=True)
others_html = "".join(thumb(i) for i in OTHERS)

new_block = f'''        <div class="mb-12">

          <div class="flex items-center gap-3 mb-4">

            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">

              <i class="fas fa-home"></i>

            </div>

            <div>

              <h3 class="text-xl md:text-2xl font-bold text-secondary">Casas en L</h3>

              <p class="text-sm text-gray-500">Casas prefabricadas en forma de L con jardín central o patio interior, en plaqueta de concreto reforzada</p>

            </div>

            <span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">{TOTAL} fotos</span>

          </div>

          <div class="cabin-grid-vidrio">

{hero}            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">

{others_html}            </div>

          </div>

        </div>

'''

# 2) Insert the new block right BEFORE the 'Casas Prefabricadas de Dos Pisos' h3
target_h3 = '<h3 class="text-xl md:text-2xl font-bold text-secondary">Casas Prefabricadas de Dos Pisos</h3>'
target_pos = content.find(target_h3)
if target_pos == -1:
    print("!! target h3 not found")
else:
    wrap_pos = content.rfind('<div class="mb-12">', 0, target_pos)
    if wrap_pos == -1:
        print("!! wrapper not found")
    else:
        new_block_end = new_block.rstrip() + "\n\n"
        content = content[:wrap_pos] + new_block_end + content[wrap_pos:]
        print(f"OK: inserted 'Casas en L' block at pos {wrap_pos}")

# 3) Add 'l' to CAT_META
old_meta_2pisos = "'2pisos':   { name: 'Casas Prefabricadas de Dos Pisos',eyebrow: '2 Pisos',        variantOrder: ['default'],          variantLabel: { default: 'Todas' } },"
new_meta_2pisos = ("'l':           { name: 'Casas en L',                      eyebrow: 'Casas en L',     variantOrder: ['default'],          variantLabel: { default: 'Todas' } },\n"
                    "          '2pisos':   { name: 'Casas Prefabricadas de Dos Pisos',eyebrow: '2 Pisos',        variantOrder: ['default'],          variantLabel: { default: 'Todas' } },")
if old_meta_2pisos in content:
    content = content.replace(old_meta_2pisos, new_meta_2pisos, 1)
    print("OK: CAT_META 'l' added")
else:
    print("!! CAT_META 2pisos line not found")

# 4) Update featured card 'Casa en L con jardin central' to data-category='l' + data-img=img630
old_card = ('data-model="Casa en L con jardín central" data-category="plaqueta1p" data-variant="todas" data-img="catalogo concasaya/medium/img484.webp"')
new_card = ('data-model="Casa en L con jardín central" data-category="l" data-variant="todas" data-img="catalogo concasaya/medium/img630.webp"')
if old_card in content:
    content = content.replace(old_card, new_card, 1)
    print("OK: 'Casa en L' card updated to category=l, data-img=img630")
else:
    print("!! featured card 'Casa en L' not found")

FILE.write_text(content, encoding="utf-8")
print("Done.")
