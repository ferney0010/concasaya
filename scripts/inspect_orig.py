#!/usr/bin/env python3
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
# Find the old "cabin-grid-vidrio" blocks - those are the bad ones
for m in re.finditer(r'<div class="gallery-grid">', t):
    p = m.start()
    nxt = t.find('<div class="gallery-grid">', p+1)
    if nxt < 0: nxt = len(t)
    end_search = t.rfind('        </div>', p, nxt)
    if end_search < 0: end_search = t.rfind('</div>', p, nxt)
    end = end_search + len('</div>')
    block = t[p:end]
    cats = set(re.findall(r'data-category="([\w]+)"', block))
    # count thumbs by any class containing "gallery-thumb"
    thumb_count = len(re.findall(r'class="gallery-thumb', block))
    img_refs = re.findall(r'data-href="catalogo concasaya/medium/(img\d+)\.webp"', block)
    unique_imgs = list(dict.fromkeys(img_refs))
    print(f'  pos {p}-{end}: thumbs={thumb_count}, unique_imgs={len(unique_imgs)}, cats={cats}, len={end-p}')
    if unique_imgs:
        print(f'    first 5: {unique_imgs[:5]}')
