# -*- coding: utf-8 -*-
"""Fix the broken Materiales gallery: a <a href="javascript:void(0);" prefix was lost
between the CUBO close and the first materiales thumb (img350).
The remaining text starts with 'void(0);" class="gallery-thumb...'.
We need to re-insert the opening tag.
Also wrap all materiales thumbs in a <div class="gallery-grid"> for proper masonry.
"""
import re
import sys
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

p = Path(r"C:\Workspace\concasaya\modelos.html")
text = p.read_text(encoding="utf-8")

# 1) Fix the missing <a href="javascript:void(0);" prefix before the first materiales thumb
# The broken text has the pattern: </div>\nvoid(0);" class="gallery-thumb group block" data-lightbox="catalog" data-href="catalogo concasaya/medium/img350.webp"
# We use a regex with flexible quotes (typographic or straight)
import re
# Find the unique break point
m = re.search(r'</div>\s*void\(0\)[^\n]*class="gallery-thumb group block"\s+data-lightbox="catalog"\s+data-href="catalogo concasaya/medium/img350\.webp"', text)
if m:
    print(f'Found broken at byte {m.start()}, line {text.count(chr(10), 0, m.start())+1}')
    # Insert the missing <a href="javascript:void(0);" prefix
    old = m.group(0)
    new = '</div>\n        <a href="javascript:void(0);" class="gallery-thumb group block" data-lightbox="catalog" data-href="catalogo concasaya/medium/img350.webp"'
    text = text.replace(old, new, 1)
    print('Fixed anchor: inserted <a href="javascript:void(0);"')
else:
    print('No broken pattern found')

# 2) Wrap all 23 materiales thumbs in a <div class="gallery-grid"> container
# First, find the first materiales thumb position after the fix
m_first = re.search(r'<a[^>]*data-href="catalogo concasaya/medium/img350\.webp"[^>]*data-category="materiales"', text)
m_last = None
# Find the last materiales thumb (img1369.webp at line 3791 from earlier inspect)
m_last = re.search(r'<a[^>]*data-href="catalogo concasaya/medium/img1369\.webp"[^>]*data-category="materiales"', text)

if m_first and m_last:
    # Find the <a> tag start (just before m_first)
    a_start = text.rfind('<a', 0, m_first.start())
    # Find the </a> end (just after m_last)
    a_end = text.find('</a>', m_last.end()) + len('</a>')
    print(f'Wrapping materiales thumbs from byte {a_start} to {a_end}')
    # Get the content
    inner = text[a_start:a_end]
    # Wrap in a gallery-grid div
    new_text = text[:a_start] + '<div class="gallery-grid">\n\n' + inner + '\n\n          </div>' + text[a_end:]
    text = new_text
    print('Wrapped materiales thumbs in <div class="gallery-grid">')

# Also wrap in a mb-12 div (the section style). Check if it's already wrapped.
# Look for the parent context
m_wrapper = re.search(r'<div class="mb-12">\s*<div class="flex items-center gap-3 mb-4">', text)
if not m_wrapper:
    # If no header, just leave the gallery-grid as is - the existing parent section wraps it
    pass

p.write_text(text, encoding="utf-8")
print(f'\nFinal size: {len(text)} bytes')

# Verify
m2 = re.search(r'data-href="catalogo concasaya/medium/img350\.webp"', text)
if m2:
    pos = m2.start()
    print('--- 100 chars before img350 (after fix) ---')
    print(text[max(0, pos-100):pos+50])
