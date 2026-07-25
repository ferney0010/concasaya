#!/usr/bin/env python3
"""Dump el bloque exacto de la galería Cubo dentro de #galeria."""
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

# Gallery section starts at id="galeria"
gal_start = t.find('id="galeria"')
# Find first sub-gallery wrapper - the cubo one likely begins with a <div class="mb-12"> or similar
# Let's find the first <div ... around 202000
pos = 201000
end = 210000
# Find the <a tag for first cubo gallery thumb
first_cubo_gallery_thumb = t.find('data-category="cubo"', 200000)
print('first cubo gallery thumb pos:', first_cubo_gallery_thumb)
# Go back to find enclosing <div class="mb-12 or similar
div_open = t.rfind('<div', 0, first_cubo_gallery_thumb)
print('enclosing div at:', div_open)
# Show before the div
print(t[div_open-300:div_open+500])
print('---')
# Show after the last thumb
last_cubo_gallery_thumb = t.rfind('data-category="cubo"')
print('last cubo gallery thumb pos:', last_cubo_gallery_thumb)
# Find the </div></div></div> closing the sub-section
after_last = t[last_cubo_gallery_thumb:last_cubo_gallery_thumb+800]
print(after_last[:800])
