#!/usr/bin/env python3
"""Use a simple state machine to find balanced <div> blocks."""
from html.parser import HTMLParser
import re

t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()

# Find 2 Pisos gallery-grid absolute position
gal_start = t.find('id="galeria"')
gal_chunk = t[gal_start:]
m = re.search(r'<h3[^>]*>Casas Prefabricadas de Dos Pisos</h3>', gal_chunk)
h3_abs = gal_start + m.start()
g_start = t.find('<div class="gallery-grid">', h3_abs)
print(f'g_start: {g_start}')

# Walk the HTML and find when we return to depth 0 from g_start
# Use a custom parser
class DivCounter(HTMLParser):
    def __init__(self):
        super().__init__()
        self.count = 0
        self.start = -1
        self.void = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
    def handle_starttag(self, tag, attrs):
        if tag in self.void: return
        if tag == 'div':
            if self.count == 0 and self.start < 0:
                self.start = self.getpos()[0]  # not used, but track
            self.count += 1
    def handle_endtag(self, tag):
        if tag in self.void: return
        if tag == 'div':
            self.count -= 1

# Instead use a regex-based state machine: count <div ...> not in attribute strings
# Simpler: split on newlines and check each line for opening/closing divs
chunk = t[g_start:]
lines = chunk.split('\n')
print(f'lines in chunk: {len(lines)}')

# Better approach: use a real stack-based scan
# Scan for "<div" and "</div>" but only when they form valid tags (not in attr values)
import re
# Use a simple regex: <div(\s|>) for opening, </div> for closing
# BUT exclude <div...> inside <a> tag (those are like <a><div>...</div></a>)
# Since the structure is <a><div>aspect-ratio</div><div>content</div></a>, we have nested divs in anchors
# But that's what we WANT to count.

# Let me try a different approach: find the </div> that closes our <div class="gallery-grid">
# by finding it AFTER the last inner </a> tag.
# The structure: <div class="gallery-grid"> ... <a>...</a>... </div> (where the last </div> before the next sub-gallery)
# We can use the </div></div> pattern at the end of the block.

# Find all <div class="gallery-grid"> in the file
all_gg = [m.start() for m in re.finditer(r'<div class="gallery-grid">', t)]
print(f'all gallery-grid positions: {all_gg}')

# The 2 Pisos gallery-grid is the 3rd one (index 2)
g_2pisos = all_gg[2]
print(f'2pisos gallery-grid: {g_2pisos}')

# Find the next gallery-grid (which is the start of Cubo gallery)
g_next = all_gg[3]
print(f'next gallery-grid: {g_next}')

# The end of 2pisos gallery is the last </div> just before g_next
# The pattern: ...</div>\n\n        </div>  (gallery close)  \n\n          <h3>...Cubo</h3>
# Look for '</div>\n\n        </div>\n\n          <div class="mb-12">' (sub-gallery open marker)
# Actually the simpler: look for the </div> at indent 8 (matching the gallery open)
sub_marker = '        </div>\n\n      <div class="mb-12">'
g_end = t.find(sub_marker, g_2pisos, g_next)
print(f'sub_marker at: {g_end}')
# That's the END of 2pisos (the </div> closes our outer)
# Add the length of the marker up to '</div>'
if g_end > 0:
    # We want to include up to and including the </div> at the start of sub_marker
    g_end_pos = g_end + len('        </div>')
    print(f'g_end (inclusive): {g_end_pos}')
    block = t[g_2pisos:g_end_pos]
    print(f'block len: {len(block)}')
    imgs = re.findall(r'data-href="catalogo concasaya/medium/(img\d+)\.webp"', block)
    print(f'unique imgs: {len(set(imgs))}')
    print(f'block tail: {block[-300:]!r}')
