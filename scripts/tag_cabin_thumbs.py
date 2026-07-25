#!/usr/bin/env python3
"""Tag cabin thumbs inside .cabin-panel[data-panel="altillo"|"vidrio"] blocks.
The tiny house (img294) lives in altillo panel (already there per previous structure).
"""
import re

FILE = r"C:\Workspace\concasaya\modelos.html"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# Find each <div class="cabin-panel" data-panel="X"> ... </div>
# Use depth counter
markers = [(m.start(), m.group(1)) for m in re.finditer(r'<div class="cabin-panel[^"]*"\s+id="tab-(\w+)"[^>]*>', content)]
print(f"Found {len(markers)} cabin-panel blocks")

# For each, find matching </div>
def find_block_end(content, start, tag):
    # find <div ... and the matching </div>
    # locate first <div after start
    pos = content.find("<div", start)
    if pos == -1: return -1
    depth = 1
    p = pos + 4
    while p < len(content) and depth > 0:
        n_open  = content.find("<div",  p)
        n_close = content.find("</div>", p)
        if n_close == -1: break
        if n_open != -1 and n_open < n_close:
            depth += 1
            p = n_open + 4
        else:
            depth -= 1
            p = n_close + 6
    return p

# process in reverse
total = 0
new_content = content
for i in range(len(markers) - 1, -1, -1):
    s, variant = markers[i]
    end = find_block_end(new_content, s, variant)
    if end == -1:
        print(f"!! No end for variant={variant}")
        continue
    block = new_content[s:end]
    pattern = re.compile(r'(<a\s+[^>]*?class="gallery-thumb[^"]*"[^>]*?data-lightbox="catalog"[^>]*?)(>)', re.DOTALL)
    counter = [0]
    def repl(m):
        counter[0] += 1
        return m.group(1) + f' data-category="cabana" data-variant="{variant}"' + m.group(2)
    new_block, n = pattern.subn(repl, block)
    new_content = new_content[:s] + new_block + new_content[end:]
    total += n
    print(f"cabin-panel[{variant}]: tagged {n} thumbs")

print(f"Total cabin thumbs tagged: {total}")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(new_content)
print("Done.")
