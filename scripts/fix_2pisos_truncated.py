#!/usr/bin/env python3
"""Fix the corrupted 2 Pisos gallery by finding the broken <a> tag and replacing
the entire gallery-grid block with clean thumbs."""
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()

# Find the broken <a> tag with data-href ending without closing quote
# Pattern: data-href="catalogo concasaya/medium/< (no img number)
m = re.search(r'<a[^>]*data-href="catalogo concasaya/medium/<', t)
if m:
    print(f'Broken <a> at {m.start()}: {t[m.start():m.start()+200]}')
else:
    print('No broken <a> found')
    exit()

# Strategy: find the start of the 2pisos gallery-grid (before this), and find
# the END of this broken block (the </a> that closes it).
# Look for </a> AFTER the broken <a>
broken_a_start = m.start()
# Find the matching </a> by scanning forward
end_a = t.find('</a>', broken_a_start)
print(f'next </a> at {end_a}')
# Show what comes after
print(f'after </a>: {t[end_a:end_a+200]!r}')

# The 2pisos gallery-grid starts BEFORE the broken <a>. Find it.
# Look back for <div class="gallery-grid">
gallery_start = t.rfind('<div class="gallery-grid">', 0, broken_a_start)
print(f'gallery-grid starts at {gallery_start}')

# After the </a>, there's a sequence of divs/headers. We need to find where the
# 2pisos gallery block ENDS. The gallery-grid is followed by closing </div> tags,
# then the next sub-gallery block. Find the next <div class="mb-12"> after end_a
# (this is the start of Cubo).
next_mb12 = t.find('<div class="mb-12">', end_a)
print(f'next mb-12 (Cubo) at {next_mb12}')

# Now find the </div> that closes our gallery-grid. It's the </div> just before next_mb12.
# Pattern: '        </div>\n\n      <div class="mb-12">' (8 spaces, closing our outer)
end_marker = '        </div>\n\n      <div class="mb-12">'
gallery_end = t.find(end_marker, gallery_start, next_mb12)
if gallery_end < 0:
    # try alternative
    end_marker = '</div>\n\n      <div class="mb-12">'
    gallery_end = t.find(end_marker, gallery_start, next_mb12)
print(f'gallery end (alt) at {gallery_end}')

if gallery_end > 0:
    # include the </div> length
    # The end_marker ends with '<div class="mb-12">', so the </div> is at len(end_marker) - len('<div class="mb-12">')
    div_end = gallery_end + len(end_marker) - len('<div class="mb-12">')
    print(f'div close at: {div_end}')
    block = t[gallery_start:div_end]
    print(f'block len: {len(block)}')
    print(f'block first 200: {block[:200]!r}')
    print(f'block last 200: {block[-200:]!r}')

# Save for next step
with open(r'C:\Workspace\concasaya\scripts\_2pisos_block.txt', 'w', encoding='utf-8') as f:
    f.write(f'gallery_start: {gallery_start}\n')
    f.write(f'broken_a: {broken_a_start}\n')
    f.write(f'end_a: {end_a}\n')
    f.write(f'next_mb12: {next_mb12}\n')
    f.write(f'gallery_end: {gallery_end}\n')
    f.write(f'div_end: {div_end}\n')
print('Saved positions to _2pisos_block.txt')
