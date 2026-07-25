#!/usr/bin/env python3
"""Tag each <a class="gallery-thumb"> in modelos.html with data-category
and data-variant, based on the position of the surrounding <div class="gallery-grid">.

Mapping (block order in page):
  1. Plaqueta (93 imgs)       -> category=plaqueta   variant=default
  2. 2 Pisos (18 imgs)        -> category=2pisos     variant=default
  3. Cubo/Mediterraneas (8)   -> category=cubo       variant=default
  4. EPS (1 img)              -> category=eps        variant=default
  5. Materiales/Acabados (26) -> category=materiales variant=default
  6. Proceso (5)              -> category=proceso    variant=default

Cabana gallery (uses cabin-panel structure) is skipped — already has its own tabs.
"""
import re
import sys

FILE = r"C:\Workspace\concasaya\modelos.html"

CATEGORIES = [
    ("plaqueta", "default"),
    ("2pisos",   "default"),
    ("cubo",     "default"),
    ("eps",      "default"),
    ("materiales", "default"),
    ("proceso",  "default"),
]

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# 1) Find all <div class="gallery-grid"> markers
markers = [(m.start(), m.end()) for m in re.finditer(r'<div class="gallery-grid">', content)]
print(f"Found {len(markers)} gallery-grid blocks (expected 6)")

if len(markers) != len(CATEGORIES):
    print(f"!! Block count mismatch: {len(markers)} vs {len(CATEGORIES)}")
    sys.exit(1)

# 2) For each block, find matching </div> by depth counting
blocks = []
for i, (s, e) in enumerate(markers):
    depth = 1
    pos = e
    while pos < len(content) and depth > 0:
        next_open = content.find("<div", pos)
        next_close = content.find("</div>", pos)
        if next_close == -1:
            print(f"!! No close for block {i}")
            sys.exit(1)
        if next_open != -1 and next_open < next_close:
            depth += 1
            pos = next_open + 4
        else:
            depth -= 1
            pos = next_close + 6
    blocks.append((s, pos))

# 3) Within each block, find every <a ... class="gallery-thumb ... " ...> and add data-category/data-variant
total_thumbs = 0
new_content = content
# Process in reverse order so offsets stay valid
for i in range(len(blocks) - 1, -1, -1):
    s, e = blocks[i]
    category, variant = CATEGORIES[i]
    block = new_content[s:e]
    # find every <a tag that has class="gallery-thumb... "
    # we want to add data-category="X" data-variant="Y" right after the existing data-lightbox
    pattern = re.compile(r'(<a\s+[^>]*?class="gallery-thumb[^"]*"[^>]*?data-lightbox="catalog"[^>]*?)(>)', re.DOTALL)
    counter = [0]
    def repl(m):
        counter[0] += 1
        return m.group(1) + f' data-category="{category}" data-variant="{variant}"' + m.group(2)
    new_block, n = pattern.subn(repl, block)
    new_content = new_content[:s] + new_block + new_content[e:]
    total_thumbs += n
    print(f"Block {i+1} ({category}): tagged {n} thumbs")

print(f"Total thumbs tagged: {total_thumbs}")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Done. modelos.html updated.")
