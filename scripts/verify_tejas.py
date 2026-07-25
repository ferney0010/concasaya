#!/usr/bin/env python3
"""Verifica que las imágenes quedaron en su sitio."""
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()
for n in ['927', '929', '945', '965', '968', '972']:
    count = t.count(f'img{n}.webp')
    print(f'img{n}.webp: {count} refs')
# Verify there's no remaining teja-swatch with background gradient
import re
grads = re.findall(r'teja-swatch[^>]*style="background: linear-gradient', t)
print('gradients remaining:', len(grads))
print('Galería de Tejas present:', 'Galería de Tejas' in t)
print('Tip Barro present (img927):', 'img927' in t)
