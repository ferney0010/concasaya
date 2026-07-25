# -*- coding: utf-8 -*-
"""Final fix for Materiales gallery."""
import re
import sys
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

p = Path(r"C:\Workspace\concasaya\modelos.html")
text = p.read_text(encoding="utf-8")

# ---------- STEP 1 ----------
m = re.search(r'(</div>\s*</div>\s*)void\(0\);" class="gallery-thumb group block" data-lightbox="catalog" data-href="catalogo concasaya/medium/img350\.webp"', text)
if not m:
    print('ERROR: broken pattern not found')
    sys.exit(1)
old_broken = m.group(0)
fixed = m.group(1) + '<a href="javascript:void(0);" class="gallery-thumb group block" data-lightbox="catalog" data-href="catalogo concasaya/medium/img350.webp"'
text = text.replace(old_broken, fixed, 1)
print('Step 1 done')

# ---------- STEP 2: Find materiales thumbs range ----------
# Find ALL img350 positions, take the LAST one (materiales)
all_img350 = [m.start() for m in re.finditer(r'data-href="catalogo concasaya/medium/img350\.webp"', text)]
m_first_pos = all_img350[-1]
a_start = text.rfind('<a ', 0, m_first_pos)
if a_start < 0:
    a_start = text.rfind('<a\t', 0, m_first_pos)
print(f'Step 2: first <a at line {text.count(chr(10), 0, a_start)+1}')

# Find the last thumb. img1369 is the last. Find its </a>
all_img1369 = [m.start() for m in re.finditer(r'data-href="catalogo concasaya/medium/img1369\.webp"', text)]
# Take the LAST one (the materiales one)
m_last_pos = all_img1369[-1]
a_end = text.find('</a>', m_last_pos) + len('</a>')
print(f'Step 2: last </a> at line {text.count(chr(10), 0, a_end)+1}')

inner = text[a_start:a_end]
thumb_count = inner.count('data-href="catalogo concasaya/medium/')
print(f'  Wrapping {thumb_count} thumbs')

# Build wrapper
header = '''        <div class="mb-12">

          <div class="flex items-center gap-3 mb-4">

            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">

              <i class="fas fa-palette"></i>

            </div>

            <div>

              <h3 class="text-xl md:text-2xl font-bold text-secondary">Materiales y Acabados</h3>

              <p class="text-sm text-gray-500">Acabados interiores y exteriores para personalizar tu casa</p>

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
print('Step 2 done')

p.write_text(text, encoding="utf-8")
print(f'\nFinal size: {len(text)} bytes')

# Verify
all_img350_after = [m.start() for m in re.finditer(r'data-href="catalogo concasaya/medium/img350\.webp"', text)]
for pos in all_img350_after:
    ctx_after = text[max(0, pos-200):pos]
    if 'data-category="materiales"' in ctx_after:
        print(f'  materiales img350 at line {text.count(chr(10), 0, pos)+1}')
        print('  Context:', text[pos-200:pos+50].replace('★','*'))
        break

# Check div balance
import re
opens = re.findall(r'<div\b', text)
closes = re.findall(r'</div>', text)
print(f'\nHTML balance: <div>={len(opens)}, </div>={len(closes)}, diff={len(opens)-len(closes)}')
