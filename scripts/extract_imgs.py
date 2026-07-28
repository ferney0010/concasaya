#!/usr/bin/env python3
"""Extrae las imágenes de cada galería problemática."""
import re
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

for p, title in [(141240, 'Plaqueta 1P'), (164243, 'Casas en L'), (170843, '2 Pisos')]:
    # Find gallery-grid start
    g_start = t.find('<div class="gallery-grid">', p)
    # Find the matching closing </div> of the gallery-grid - the LAST </div> in the block before the next sub-gallery
    # The structure: <div class="gallery-grid"> ... <div class="grid grid-cols-2...">...</div></div>
    # End of gallery-grid is at the last </div></div> pattern. Let's find the </div></div> closing it.
    # Find the closing tag: the gallery block ends right before the next <div class="mb-12"> OR the next gallery header
    # Simpler: find the next sibling or grandparent end. The gallery-grid ends with a single </div> at the same indent.
    # Find the closing </div> at the right indent. The </div> after </div> of inner grid.
    # Pattern: ..."</div>\n\n        </div>\n\n          " or similar
    # Let's just find from g_start to the LAST </div> before the next <div class="mb-12">
    next_mb12 = t.find('<div class="mb-12">', g_start + 1)
    # That's the next sub-gallery. The current one ends at the closing </div> just before that.
    # The closing </div> for our gallery-grid is the last </div> in the range g_start..next_mb12
    end_search_start = next_mb12 - 500
    # find the last </div> before next_mb12
    end = t.rfind('</div>', g_start, next_mb12) + len('</div>')
    block = t[g_start:end]
    # extract img numbers
    imgs = re.findall(r'img(\d+)\.webp', block)
    print(f'\n=== {title} (pos {g_start} - {end}, {end-g_start} chars) ===')
    print(f'  imgs: {imgs}')
    # show first 300 chars
    print('  first 300:', block[:300].replace('\n', ' '))
