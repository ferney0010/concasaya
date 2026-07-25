#!/usr/bin/env python3
"""After replace_2pisos_gallery.py already ran, this script fixes the
remaining 'con balcon' / 'Balcon' copy in the 2-pisos featured card:
  - h3 '2 Pisos con Balcón' -> '2 Pisos'
  - badge '2 pisos + balcón madera' -> '2 pisos en plaqueta'
  - description paragraph (remove 'con balcón amplio de madera')
"""
from pathlib import Path

FILE = Path(r"C:\Workspace\concasaya\modelos.html")
content = FILE.read_text(encoding="utf-8")

# 1. h3
old_h3 = '<h3 class="title text-2xl font-bold">2 Pisos con Balcón</h3>'
new_h3 = '<h3 class="title text-2xl font-bold">2 Pisos</h3>'
if old_h3 in content:
    content = content.replace(old_h3, new_h3)
    print("OK: h3 '2 Pisos con Balcón' -> '2 Pisos'")
else:
    print("!! h3 not found (already updated?)")

# 2. Image overlay badge
old_badge = '2 pisos + balcón madera'
new_badge = '2 pisos en plaqueta'
if old_badge in content:
    content = content.replace(old_badge, new_badge)
    print("OK: image badge updated")
else:
    print("!! badge not found")

# 3. Description paragraph
old_desc = ('<p class="text-gray-600 mb-4 flex-grow leading-relaxed text-sm">\n\n'
            '                  Casa prefabricada de 2 pisos en plaqueta de concreto reforzada, con balcón amplio\n\n'
            '                  de madera y techo de teja. Vista panorámica, ideal para lotes con pendiente.\n\n'
            '                </p>')
new_desc = ('<p class="text-gray-600 mb-4 flex-grow leading-relaxed text-sm">\n\n'
            '                  Casa prefabricada de 2 pisos en plaqueta de concreto reforzada, con techo\n\n'
            '                  de teja de barro. Construcción robusta con todas las comodidades modernas.\n\n'
            '                </p>')
if old_desc in content:
    content = content.replace(old_desc, new_desc)
    print("OK: description updated")
else:
    print("!! description not found")

# 4. List item '2 pisos con balcón de madera'
old_li = '<li><i class="fas fa-check text-primary mr-2"></i>2 pisos con balcón de madera</li>'
new_li = '<li><i class="fas fa-check text-primary mr-2"></i>2 pisos en plaqueta reforzada</li>'
if old_li in content:
    content = content.replace(old_li, new_li)
    print("OK: list item updated")
else:
    print("!! list item not found")

FILE.write_text(content, encoding="utf-8")
print("Done.")
