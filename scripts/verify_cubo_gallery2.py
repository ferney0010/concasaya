#!/usr/bin/env python3
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()
# Find the new Cubo gallery block: it begins with a <div class="mb-12"> that contains "Casas Tipo Cubo / Mediterráneas" h3
import re
# Find all <h3>Casas Tipo Cubo / Mediterráneas
for m in re.finditer(r'<h3[^>]*>\s*Casas Tipo Cubo', t):
    pos = m.start()
    # find enclosing <div class="mb-12">
    div_start = t.rfind('<div class="mb-12">', 0, pos)
    div_end = t.find('</div>', t.find('</div>', t.find('</div>', div_start)+1)+1)  # crude
    # easier: find from div_start to next "data-category="cubo" outside this block
    # Just print first 200 chars
    print(f'pos {pos}, div_start {div_start}: {t[div_start:div_start+200].replace(chr(10), " ")}')
    print('---')
    # find the count of data-category="cubo" until next sub-block
    after = t[div_start:]
    # find data-category="cubo" in the first 10000 chars
    chunk = after[:10000]
    print('  cubo thumbs in this chunk:', chunk.count('data-category="cubo"'))
    # show first 6 thumbs
    thumbs = re.findall(r'data-href="([^"]+)"', chunk)
    print(f'  total thumbs in this chunk: {len(thumbs)}')
    for th in thumbs[:15]:
        print('   -', th)
    break
