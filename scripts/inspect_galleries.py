#!/usr/bin/env python3
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
for m in re.finditer(r'<div class="gallery-grid">', t):
    p = m.start()
    nxt = t.find('<div class="gallery-grid">', p+1)
    if nxt < 0: nxt = len(t)
    end_search = t.rfind('        </div>', p, nxt)
    if end_search < 0: end_search = t.rfind('</div>', p, nxt)
    end = end_search + len('</div>')
    block = t[p:end]
    cats = set(re.findall(r'data-category="([\w]+)"', block))
    thumb_count = block.count('class="gallery-thumb group block"')
    print(f'  pos {p}-{end}: thumbs={thumb_count}, cats={cats}, len={end-p}')
