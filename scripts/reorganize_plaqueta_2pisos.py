#!/usr/bin/env python3
"""Reorganize Plaqueta + 2 Pisos sections to remove redundancy:

  1. Rename H3 'Plaqueta de 2 Pisos' -> 'Casas Prefabricadas de Dos Pisos'
     (it stays with the same 42 images; that IS the 2-pisos gallery)
  2. Add a NEW sub-gallery 'Plaqueta de 1 Piso' with the original 32 images
     (407 principal + 31 others from the earlier list)
  3. Update CAT_META in JS: add 'plaqueta1p' entry, keep '2pisos' for 42 imgs
  4. Update featured H2 'Casas en Plaqueta de Concreto Reforzada' -> keep,
     but add note this is for 1-piso now (cosmetic)
  5. Update each featured card in Plaqueta section to use data-variant="plaqueta1p"
     so modal opens correct gallery.

Order: insert 'Plaqueta 1 Piso' gallery right BEFORE 'Casas Prefabricadas
de Dos Pisos' (currently 'Plaqueta de 2 Pisos') so the page order matches
the featured sections order.
"""
import re
from pathlib import Path

FILE = Path(r"C:\Workspace\concasaya\modelos.html")
content = FILE.read_text(encoding="utf-8")

# === 1) Rename H3 'Plaqueta de 2 Pisos' -> 'Casas Prefabricadas de Dos Pisos' ===
old_h3 = '<h3 class="text-xl md:text-2xl font-bold text-secondary">Plaqueta de 2 Pisos</h3>'
new_h3 = '<h3 class="text-xl md:text-2xl font-bold text-secondary">Casas Prefabricadas de Dos Pisos</h3>'
if old_h3 in content:
    content = content.replace(old_h3, new_h3, 1)
    print("OK: H3 Plaqueta de 2 Pisos -> Casas Prefabricadas de Dos Pisos")
else:
    print("!! old_h3 not found")

# Also update the description text below the h3
old_desc = '<p class="text-sm text-gray-500">Casas familiares de 2 pisos en plaqueta de concreto reforzada, con techo de teja de barro</p>'
new_desc = '<p class="text-sm text-gray-500">Casas familiares de 2 pisos en plaqueta de concreto reforzada, campestres y coloniales, con techo de teja de barro</p>'
if old_desc in content:
    content = content.replace(old_desc, new_desc, 1)
    print("OK: 2-pisos description updated")
else:
    print("!! 2-pisos description not found")

# === 2) Build NEW 'Plaqueta 1 Piso' sub-gallery with 32 images ===
PRINCIPAL = "623"
OTHERS = [
    "367", "379", "404", "407", "413", "423", "426", "434", "439", "442",
    "454", "457", "465", "471", "478", "484", "489", "492", "503", "508",
    "516", "523", "529", "535", "545", "550", "557", "562", "569", "575", "581", "617"
]
TOTAL = len(OTHERS) + 1   # 33

def thumb(idx, principal=False):
    extra_class = " cabin-hero" if principal else ""
    badge = (
        '<span class="cabin-hero-badge">★ Top</span>'
        '<span class="cabin-thumb-label cabin-thumb-label-dark"><i class="fas fa-home"></i> Plaqueta 1 Piso</span>'
    ) if principal else ""
    sizes = ('(max-width: 1024px) 100vw, 50vw' if principal
             else '(max-width: 640px) 50vw, 33vw')
    return f'''          <a href="javascript:void(0);" class="gallery-thumb{extra_class}" data-lightbox="catalog" data-href="catalogo concasaya/medium/img{idx}.webp" role="button" tabindex="0" aria-label="Casa en plaqueta de 1 piso {idx}" oncontextmenu="return false" ondragstart="return false" data-category="plaqueta1p" data-variant="default">
            <img src="catalogo concasaya/thumbs/img{idx}.webp" srcset="catalogo%20concasaya/thumbs/img{idx}.webp" 400w, "catalogo%20concasaya/medium/img{idx}.webp" 800w" sizes="{sizes}" alt="Casa en plaqueta de concreto 1 piso CONCASAYA" loading="lazy" decoding="async" class="w-full h-full object-cover" />
            {badge}
          </a>
'''

hero = thumb(PRINCIPAL, principal=True)
others_html = "".join(thumb(i) for i in OTHERS)

new_plaqueta1p_block = f'''        <div class="mb-12">

          <div class="flex items-center gap-3 mb-4">

            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">

              <i class="fas fa-home"></i>

            </div>

            <div>

              <h3 class="text-xl md:text-2xl font-bold text-secondary">Plaqueta de 1 Piso</h3>

              <p class="text-sm text-gray-500">Casas tradicionales de 1 piso en plaqueta de concreto reforzada, coloniales y en forma de L, con techo de teja de barro</p>

            </div>

            <span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">{TOTAL} fotos</span>

          </div>

          <div class="cabin-grid-vidrio">

{hero}            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">

{others_html}            </div>

          </div>

        </div>

'''

# Insert the new Plaqueta 1 Piso block right BEFORE the (now renamed) 'Casas Prefabricadas de Dos Pisos' h3
target_h3 = '<h3 class="text-xl md:text-2xl font-bold text-secondary">Casas Prefabricadas de Dos Pisos</h3>'
target_pos = content.find(target_h3)
if target_pos == -1:
    print("!! target h3 not found")
else:
    # Find the opening <div class="mb-12"> that wraps this h3
    wrap_pos = content.rfind('<div class="mb-12">', 0, target_pos)
    if wrap_pos == -1:
        print("!! wrapper div not found")
    else:
        # Find the end of the new block
        new_block_end = new_plaqueta1p_block.rstrip() + "\n\n"
        content = content[:wrap_pos] + new_block_end + content[wrap_pos:]
        print(f"OK: inserted 'Plaqueta 1 Piso' block at pos {wrap_pos}")

# === 3) Update CAT_META in JS: add 'plaqueta1p' entry ===
old_meta_line = "'plaqueta':   { name: 'Casas en Plaqueta de Concreto',   eyebrow: 'Plaqueta',       variantOrder: ['default'],          variantLabel: { default: 'Todas' } },"
new_meta_line = "'plaqueta':   { name: 'Plaqueta de 1 Piso',              eyebrow: 'Plaqueta',       variantOrder: ['default'],          variantLabel: { default: 'Todas' } },\n          'plaqueta1p': { name: 'Plaqueta de 1 Piso',              eyebrow: 'Plaqueta 1P',    variantOrder: ['default'],          variantLabel: { default: 'Todas' } },"
if old_meta_line in content:
    content = content.replace(old_meta_line, new_meta_line, 1)
    print("OK: CAT_META 'plaqueta' renamed + 'plaqueta1p' added")
else:
    print("!! CAT_META plaqueta line not found")

old_meta_2pisos = "'2pisos':   { name: 'Plaqueta de 2 Pisos',             eyebrow: '2 Pisos',        variantOrder: ['default'],          variantLabel: { default: 'Todas' } },"
new_meta_2pisos = "'2pisos':   { name: 'Casas Prefabricadas de Dos Pisos',eyebrow: '2 Pisos',        variantOrder: ['default'],          variantLabel: { default: 'Todas' } },"
if old_meta_2pisos in content:
    content = content.replace(old_meta_2pisos, new_meta_2pisos, 1)
    print("OK: CAT_META '2pisos' name updated")
else:
    print("!! CAT_META 2pisos line not found")

# === 4) Update featured cards in Plaqueta section (L1732) to use data-category="plaqueta1p" ===
# Find the 3 buttons in that section
old_plaqueta_btn_pattern = 'data-category="plaqueta" data-variant="todas"'
new_plaqueta_btn_pattern = 'data-category="plaqueta1p" data-variant="todas"'
count = content.count(old_plaqueta_btn_pattern)
if count > 0:
    content = content.replace(old_plaqueta_btn_pattern, new_plaqueta_btn_pattern)
    print(f"OK: updated {count} plaqueta featured cards -> plaqueta1p")
else:
    print("!! plaqueta featured cards not found")

# === 5) Update schema.org Product descriptions in L399 area (ItemList offer) ===
# These are just data descriptors, the user didn't ask to change them.
# Skipping to avoid scope creep.

FILE.write_text(content, encoding="utf-8")
print(f"Done.")
