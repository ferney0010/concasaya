from pathlib import Path
import sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
p = Path(r"C:\Workspace\concasaya\modelos.html")
text = p.read_text(encoding="utf-8")

# Find all <a> tags with data-category="materiales" that are NOT inside a <div>
# Find the broken pattern
broken = '        </div>\n\nvoid(0);" class="gallery-thumb group block" data-lightbox="catalog" data-href="catalogo concasaya/medium/img350.webp"'
n = text.count(broken)
print(f'Broken pattern occurrences: {n}')

# Find all data-category="materiales" positions
import re
positions = [m.start() for m in re.finditer(r'data-category="materiales"', text)]
print(f'\nFound {len(positions)} materiales thumbs')
for pos in positions:
    line = text.count('\n', 0, pos) + 1
    # Find the data-href= in the same <a>
    m = re.search(r'data-href="([^"]+)"', text[max(0, pos-400):pos+100])
    if m:
        print(f'  line {line}: {m.group(1)}')
    else:
        print(f'  line {line}: ?')
