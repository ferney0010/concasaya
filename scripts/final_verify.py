#!/usr/bin/env python3
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()

# Find all gallery-grid positions
all_gg = [m.start() for m in re.finditer(r'<div class="gallery-grid">', t)]
print('All gallery-grid positions:', all_gg)

# Check each
labels = ['Cabañas', 'Plaqueta 1P', 'Casas en L', '2 Pisos', 'Cubo+Materiales', 'Proceso']
for i, p in enumerate(all_gg):
    next_p = all_gg[i+1] if i+1 < len(all_gg) else len(t)
    block = t[p:next_p]
    thumbs = len(re.findall(r'class="gallery-thumb', block))
    imgs = re.findall(r'data-href="catalogo concasaya/medium/(img\d+)\.webp"', block)
    unique_imgs = list(dict.fromkeys(imgs))
    malformed = bool(re.search(r'data-href="catalogo concasaya/medium/<', block))
    cats = set(re.findall(r'data-category="([\w]+)"', block))
    print(f'  {labels[i] if i < len(labels) else "?"}: thumbs={thumbs}, unique_imgs={len(unique_imgs)}, cats={cats}, malformed={malformed}')
