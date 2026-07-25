# -*- coding: utf-8 -*-
"""Complete fix for the Materiales gallery:
1. Re-insert the missing <a href="javascript:void(0);" prefix that was lost
   between the CUBO block close and the first materiales thumb (img350).
2. Wrap ALL 23 materiales thumbs in their own <div class="gallery-grid"> for proper masonry.
3. Wrap that in a <div class="mb-12"> with a header (icon + title + count badge).
"""
import re
import sys
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

p = Path(r"C:\Workspace\concasaya\modelos.html")
text = p.read_text(encoding="utf-8")

# ---------- STEP 1: Fix the missing <a href="javascript:void(0);" prefix ----------
# The broken text is: </div>\n</div>\nvoid(0);" class="gallery-thumb group block" data-lightbox="catalog" data-href="catalogo concasaya/medium/img350.webp"
# We need to insert the missing <a href="javascript:void(0); class="gallery-thumb group block" data-lightbox="catalog"
# Note: the broken text already contains `class="gallery-thumb group block" data-lightbox="catalog"`
# So we just need to add the missing opening tag part.

# Use a precise regex anchored on the unique end (img350.webp)
m = re.search(r'(</div>\s*</div>\s*)void\(0\);" class="gallery-thumb group block" data-lightbox="catalog" data-href="catalogo concasaya/medium/img350\.webp"', text)
if not m:
    print('ERROR: broken pattern not found')
    sys.exit(1)

print(f'Found broken anchor at line {text.count(chr(10), 0, m.start())+1}')
old_broken = m.group(0)
fixed = m.group(1) + '<a href="javascript:void(0);" class="gallery-thumb group block" data-lightbox="catalog" data-href="catalogo concasaya/medium/img350.webp"'
text = text.replace(old_broken, fixed, 1)
print('Step 1 done: inserted missing <a href prefix')

# ---------- STEP 2: Wrap all materiales thumbs in <div class="gallery-grid"> ----------
# Now find the first <a ...> for img350 and the last </a> after img1369.webp
m_first = re.search(r'<a href="javascript:void\(0\);" class="gallery-thumb group block" data-lightbox="catalog" data-href="catalogo concasaya/medium/img350\.webp"[^>]*>', text)
m_last = re.search(r'<a href="javascript:void\(0\);" class="gallery-thumb group block" data-lightbox="catalog" data-href="catalogo concasaya/medium/img1369\.webp"[^>]*>', text)

if not m_first or not m_last:
    print('ERROR: cannot find first/last materiales thumb after step 1')
    sys.exit(1)

# Find the actual <a> tag start (might be just before m_first)
a_start = text.rfind('<a ', 0, m_first.start())
if a_start < 0:
    a_start = text.rfind('<a\t', 0, m_first.start())
# Find the </a> end after the last <a> tag
a_end = text.find('</a>', m_last.end()) + len('</a>')

print(f'Step 2: wrapping from byte {a_start} to {a_end} (lines {text.count(chr(10), 0, a_start)+1}..{text.count(chr(10), 0, a_end)+1})')

inner = text[a_start:a_end]
# Count the thumbs for the badge
thumb_count = inner.count('data-href="catalogo concasaya/medium/')
print(f'  Found {thumb_count} materiales thumbs to wrap')

# Build the wrapper
header = '''        <div class="mb-12">

          <div class="flex items-center gap-3 mb-4">

            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">

              <i class="fas fa-palette"></i>

            </div>

            <div>

              <h3 class="text-xl md:text-2xl font-bold text-secondary">Materiales y Acabados</h3>

              <p class="text-sm text-gray-500">Acabados interiores y exteriores: enchapes, pisos, pinturas y m\u00e1s</p>

            </div>

            <span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">''' + str(thumb_count) + ''' fotos</span>

          </div>

          <div class="gallery-grid">



'''
footer = '''


          </div>

        </div>

'''
text = text[:a_start] + header + inner + footer + text[a_end:]
print('Step 2 done: wrapped materiales in mb-12 + gallery-grid')

# Write back
p.write_text(text, encoding="utf-8")
print(f'\nFinal size: {len(text)} bytes')

# Verify
m2 = re.search(r'data-href="catalogo concasaya/medium/img350\.webp"', text)
if m2:
    pos = m2.start()
    print('--- 200 chars before img350 (after fix) ---')
    print(text[max(0, pos-200):pos+50].replace('★','*'))
