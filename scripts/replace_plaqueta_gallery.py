#!/usr/bin/env python3
"""Replace the Plaqueta gallery block (header + grid) with a curated list
of 31 images: 407 = "principal" (hero), 30 others in a normal grid.

Operates on modelos.html: replaces from the start of the Plaqueta <h3> to
just before the 2-Pisos <h3>, using the curated image list from the user.
"""
from pathlib import Path
import re

FILE = Path(r"C:\Workspace\concasaya\modelos.html")
content = FILE.read_text(encoding="utf-8")

# Curated list (order matters for visual rhythm)
PRINCIPAL = "407"
OTHERS = [
    "367", "379", "404", "413", "423", "426", "434", "439", "442", "454",
    "457", "465", "471", "478", "484", "489", "492", "503", "508", "516",
    "523", "529", "535", "545", "550", "557", "562", "569", "575", "581", "617"
]
TOTAL = len(OTHERS) + 1   # 31

# Build the new block
def thumb(idx, principal=False):
    """Build a single <a class="gallery-thumb"> thumb.
    For principal: add cabin-hero class for 2x2 sizing and '★ Top' badge + 'Plaqueta' label.
    For normal:  simple thumb.
    """
    extra_class = " cabin-hero" if principal else ""
    badge = (
        '<span class="cabin-hero-badge">★ Top</span>'
        '<span class="cabin-thumb-label cabin-thumb-label-dark"><i class="fas fa-home"></i> Plaqueta</span>'
    ) if principal else ""
    sizes = ('(max-width: 1024px) 100vw, 50vw' if principal
             else '(max-width: 640px) 50vw, 33vw')
    return f'''          <a href="javascript:void(0);" class="gallery-thumb{extra_class}" data-lightbox="catalog" data-href="catalogo concasaya/medium/img{idx}.webp" role="button" tabindex="0" aria-label="Casa en plaqueta de concreto {idx}" oncontextmenu="return false" ondragstart="return false" data-category="plaqueta" data-variant="default">
            <img src="catalogo concasaya/thumbs/img{idx}.webp" srcset="catalogo%20concasaya/thumbs/img{idx}.webp" 400w, "catalogo%20concasaya/medium/img{idx}.webp" 800w" sizes="{sizes}" alt="Casa en plaqueta de concreto CONCASAYA" loading="lazy" decoding="async" class="w-full h-full object-cover" />
            {badge}
          </a>
'''

# Build hero (img407 with hero+grid layout) — we wrap the 30 others in a div
hero = thumb(PRINCIPAL, principal=True)
others_html = "".join(thumb(i) for i in OTHERS)

new_block = f'''        <div class="mb-12">

          <div class="flex items-center gap-3 mb-4">

            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">

              <i class="fas fa-home"></i>

            </div>

            <div>

              <h3 class="text-xl md:text-2xl font-bold text-secondary">Casas en Plaqueta de Concreto</h3>

              <p class="text-sm text-gray-500">Casas tradicionales de 1 piso, en proceso y terminadas, con techo de teja de barro</p>

            </div>

            <span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">{TOTAL} fotos</span>

          </div>

          <div class="cabin-grid-vidrio">

{hero}            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">

{others_html}            </div>

          </div>

        </div>

'''

# Now find the existing Plaqueta block in content and replace it
start_marker = '<h3 class="text-xl md:text-2xl font-bold text-secondary">Casas en Plaqueta de Concreto</h3>'
end_marker   = '<h3 class="text-xl md:text-2xl font-bold text-secondary">Casas Prefabricadas de Dos Pisos</h3>'

s = content.find(start_marker)
e = content.find(end_marker)
if s == -1 or e == -1:
    print("!! markers not found")
    raise SystemExit(1)

# Walk backwards from s to find the start of the <div class="mb-12"> wrapper
mb12_start = content.rfind('<div class="mb-12">', 0, s)
if mb12_start == -1:
    print("!! wrapper div not found")
    raise SystemExit(1)

# Walk forward from e (exclusive) skipping trailing whitespace
# We want the new block to end with </div> and \n\n before the next h3
# new_block already ends with "\n\n" so we splice cleanly

new_content = content[:mb12_start] + new_block + content[e:]
FILE.write_text(new_content, encoding="utf-8")
print(f"OK: replaced Plaqueta gallery block ({TOTAL} images: 1 hero + {len(OTHERS)} grid)")
print(f"  Block was: {e - mb12_start} bytes")
print(f"  Block now: {len(new_block)} bytes")
