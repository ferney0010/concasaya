#!/usr/bin/env python3
"""Replace the 2-Pisos gallery (header + grid) with the curated list of 42
images from the user. img135 = 'principal' (hero). All other 41 go in a
grid. Also rename card 'Casa 2 pisos con balcon de madera' -> 'Casa 2
Pisos' (remove 'con balcon') and point its data-img to img135.
"""
import re
from pathlib import Path

FILE = Path(r"C:\Workspace\concasaya\modelos.html")
content = FILE.read_text(encoding="utf-8")

# Curated list (order matters for visual rhythm)
PRINCIPAL = "135"
OTHERS = [
    "147", "190", "1061", "1055", "1067", "1072", "1081", "1275", "1280", "1286",
    "890", "896", "908", "920", "1032", "1043",
    "785", "791", "799", "804", "814", "821", "827", "831", "834", "839",
    "845", "852", "855", "862", "874",
    "709", "734", "741", "744", "748", "751", "756", "761", "768", "779"
]
TOTAL = len(OTHERS) + 1   # 42

# Build the new block (same pattern as Plaqueta replacement)
def thumb(idx, principal=False):
    extra_class = " cabin-hero" if principal else ""
    badge = (
        '<span class="cabin-hero-badge">★ Top</span>'
        '<span class="cabin-thumb-label cabin-thumb-label-dark"><i class="fas fa-home"></i> Plaqueta 2 Pisos</span>'
    ) if principal else ""
    sizes = ('(max-width: 1024px) 100vw, 50vw' if principal
             else '(max-width: 640px) 50vw, 33vw')
    return f'''          <a href="javascript:void(0);" class="gallery-thumb{extra_class}" data-lightbox="catalog" data-href="catalogo concasaya/medium/img{idx}.webp" role="button" tabindex="0" aria-label="Casa en plaqueta de 2 pisos {idx}" oncontextmenu="return false" ondragstart="return false" data-category="2pisos" data-variant="default">
            <img src="catalogo concasaya/thumbs/img{idx}.webp" srcset="catalogo%20concasaya/thumbs/img{idx}.webp" 400w, "catalogo%20concasaya/medium/img{idx}.webp" 800w" sizes="{sizes}" alt="Casa en plaqueta de 2 pisos CONCASAYA" loading="lazy" decoding="async" class="w-full h-full object-cover" />
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

              <h3 class="text-xl md:text-2xl font-bold text-secondary">Plaqueta de 2 Pisos</h3>

              <p class="text-sm text-gray-500">Casas familiares de 2 pisos en plaqueta de concreto reforzada, con techo de teja de barro</p>

            </div>

            <span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">{TOTAL} fotos</span>

          </div>

          <div class="cabin-grid-vidrio">

{hero}            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">

{others_html}            </div>

          </div>

        </div>

'''

# Find the 2-Pisos block in content and replace it
start_marker = '<h3 class="text-xl md:text-2xl font-bold text-secondary">Casas Prefabricadas de Dos Pisos</h3>'
end_marker   = '<h3 class="text-xl md:text-2xl font-bold text-secondary">Casas Tipo Cubo / Mediterráneas</h3>'

s = content.find(start_marker)
e = content.find(end_marker)
if s == -1 or e == -1:
    print("!! markers not found")
    raise SystemExit(1)

mb12_start = content.rfind('<div class="mb-12">', 0, s)
if mb12_start == -1:
    print("!! wrapper div not found")
    raise SystemExit(1)

new_content = content[:mb12_start] + new_block + content[e:]

# Also update the card 'Casa 2 pisos con balcon de madera' (L2094 area)
# Old: data-model="Casa 2 pisos con balcon de madera"  data-img="...img545.webp"
# New: data-model="Casa 2 Pisos"                     data-img="...img135.webp"
# Also remove 'con balcon' from specs and desc.
old_card_btn = ('data-model="Casa 2 pisos con balcón de madera" data-category="2pisos" data-variant="todas" data-img="catalogo concasaya/medium/img545.webp" '
                'data-specs="Pisos: 2 con balcón de madera|Habitaciones: 3-4|Baños: 2-3|Cubierta: Teja de barro|Estructura: Plaqueta reforzada|Ideal para: Lotes con vista y pendiente" '
                'data-desc="Casa prefabricada de 2 pisos en plaqueta de concreto reforzada con balcón amplio de madera y techo de teja. Vista panorámica, ideal para lotes con pendiente en Cundinamarca y Boyacá."')
new_card_btn = ('data-model="Casa 2 Pisos" data-category="2pisos" data-variant="todas" data-img="catalogo concasaya/medium/img135.webp" '
                'data-specs="Pisos: 2|Habitaciones: 3-4|Baños: 2-3|Cubierta: Teja de barro|Estructura: Plaqueta reforzada|Ideal para: Familias en Cundinamarca y Boyacá" '
                'data-desc="Casa prefabricada de 2 pisos en plaqueta de concreto reforzada, con techo de teja de barro. Construcción robusta con todas las comodidades modernas."')
if old_card_btn in new_content:
    new_content = new_content.replace(old_card_btn, new_card_btn)
    print("OK: card 'con balcon' -> 'Casa 2 Pisos' + data-img=img135")
else:
    print("!! card button not found (already updated?)")

# Also update the card title h3 for that card (2 Pisos con Balcón -> 2 Pisos)
old_h3 = '<h3 class="title text-2xl font-bold">2 Pisos con Balcón</h3>'
new_h3 = '<h3 class="title text-2xl font-bold">2 Pisos</h3>'
if old_h3 in new_content:
    new_content = new_content.replace(old_h3, new_h3)
    print("OK: card h3 '2 Pisos con Balcón' -> '2 Pisos'")
else:
    print("!! h3 not found")

# Update the badge in the image overlay (2 pisos + balcon madera -> 2 pisos)
old_badge = '2 pisos + balcón madera'
new_badge = '2 pisos en plaqueta'
if old_badge in new_content:
    new_content = new_content.replace(old_badge, new_badge)
    print("OK: image badge updated")
else:
    print("!! image badge not found")

# Update the description paragraph
old_desc_p = '<p class="text-gray-600 mb-4 flex-grow leading-relaxed text-sm">\n\n                  Casa prefabricada de 2 pisos en plaqueta de concreto reforzada, con balcón amplio\n\n                  de madera y techo de teja. Vista panorámica, ideal para lotes con pendiente.\n\n                </p>'
new_desc_p = '<p class="text-gray-600 mb-4 flex-grow leading-relaxed text-sm">\n\n                  Casa prefabricada de 2 pisos en plaqueta de concreto reforzada, con techo\n\n                  de teja de barro. Construcción robusta con todas las comodidades modernas.\n\n                </p>'
if old_desc_p in new_content:
    new_content = new_content.replace(old_desc_p, new_desc_p)
    print("OK: card description updated")
else:
    print("!! card description not found")

# Update CAT_META in JS (the '2pisos' name)
old_meta = "'2pisos':   { name: 'Casas Prefabricadas de Dos Pisos',eyebrow: '2 Pisos',        variantOrder: ['default'],          variantLabel: { default: 'Todas' } },"
new_meta = "'2pisos':   { name: 'Plaqueta de 2 Pisos',             eyebrow: '2 Pisos',        variantOrder: ['default'],          variantLabel: { default: 'Todas' } },"
if old_meta in new_content:
    new_content = new_content.replace(old_meta, new_meta)
    print("OK: JS CAT_META updated")
else:
    print("!! CAT_META not found")

FILE.write_text(new_content, encoding="utf-8")
print(f"Done. {TOTAL} images in 2-Pisos gallery (1 hero + {len(OTHERS)} grid)")
