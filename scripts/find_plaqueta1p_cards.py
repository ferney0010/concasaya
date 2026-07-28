#!/usr/bin/env python3
import re
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

# Find all featured cards under the plaqueta section
# Plaqueta section starts at id="plaqueta"
plaqueta_start = t.find('id="plaqueta"')
plaqueta_end = t.find('id="dos-pisos"')
print(f'plaqueta section: {plaqueta_start} to {plaqueta_end}')

# Find all data-img for open-modal-btn in this section
for m in re.finditer(r'data-img="([^"]+)"', t[plaqueta_start:plaqueta_end]):
    pos = plaqueta_start + m.start()
    img = m.group(1)
    # find data-model near it
    nearby = t[pos-200:pos+100]
    model_m = re.search(r'data-model="([^"]+)"', nearby)
    model = model_m.group(1) if model_m else '?'
    print(f'  pos {pos}: img={img}  model={model}')

# Find <article> with id="plaqueta-2p" or similar
for m in re.finditer(r'<article[^>]*id="([^"]*2p[^"]*)"', t):
    pos = m.start()
    print(f'  2p article at {pos}: id={m.group(1)}')
    # Find the title in this article
    end_article = t.find('</article>', pos)
    block = t[pos:end_article]
    title_m = re.search(r'<h3[^>]*>([^<]+)</h3>', block)
    if title_m:
        print(f'    title: {title_m.group(1)}')
