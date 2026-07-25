from pathlib import Path
import sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
p = Path(r"C:\Workspace\concasaya\modelos.html")
text = p.read_text(encoding="utf-8")

# The broken text is between </div> (CUBO close) and void(0);" class=
# Find the unique separator
# The 'img350.webp' for materiales appears at line 3659 — let me find what's right BEFORE it
idx = text.find('img350.webp', text.find('img1049.webp'))
# Look back 80 chars to see what prefix is missing
print('--- 80 chars before img350 ---')
prefix = text[idx-80:idx]
print(prefix)
print('--- position in file:', idx)

# The previous closing must be the </div> from Cubo
# Find the </div>\n\n        </div> that closes Cubo
cubo_close = '</div>\n\n        </div>\n\nvoid(0);" class="gallery-thumb group block" data-lightbox="catalog" data-href="catalogo concasaya/medium/img350.webp"'
n = text.count(cubo_close)
print(f'\nBroken close pattern: {n}')

if n != 1:
    # Try with different whitespace
    cubo_close2 = '</div>\n\n</div>\n\nvoid(0);" class="gallery-thumb group block" data-lightbox="catalog" data-href="catalogo concasaya/medium/img350.webp"'
    n2 = text.count(cubo_close2)
    print(f'Alt broken close pattern: {n2}')

# Apply the fix
fixed = '</div>\n\n        </div>\n\n        <a href="javascript:void(0);" class="gallery-thumb group block" data-lightbox="catalog" data-href="catalogo concasaya/medium/img350.webp"'
if n == 1:
    new_text = text.replace(cubo_close, fixed, 1)
    p.write_text(new_text, encoding='utf-8')
    print(f'\nFixed. Size: {len(new_text)} bytes')
else:
    print('Could not fix')
