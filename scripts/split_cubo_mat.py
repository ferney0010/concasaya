#!/usr/bin/env python3
"""Split the Cubo+Materiales gallery into 2 separate galleries.

Current state: 1 <div class="mb-12"> with 1 h3 "Casas Tipo Cubo / Mediterráneas"
containing a gallery-grid with 8 cubo thumbs + 7 materiales thumbs mixed.

Target state: 2 separate sub-galleries:
1. Cubo (8 imgs): 1286, 1280, 1011, 988, 1018, 1032, 1043, 1049
2. Materiales (7 imgs): 350, 353, 1141, 1172, 1240, 1243, 1246, 1339, 1345, 1352, 1355, 1386, 362, 379, 442, 968, 972, 1137, 1371, 1382, 929, 965, 1369

Wait, that's 23 materiales imgs. The original has 25. Let me just split the existing block.
"""
import re

src = r'C:\Workspace\concasaya\modelos.html'
with open(src, 'r', encoding='utf-8') as f:
    t = f.read()

# Find the Cubo mb-12 block
cubo_mb12 = t.find('<div class="mb-12">', t.find('id="cubo-mediterraneas"'))
proceso_h3 = t.find('<h3 class="text-xl md:text-2xl font-bold text-secondary">Proceso Constructivo</h3>')
cubo_end = t.find('</div>\n\n      </div>\n\n      <div class="mb-12">\n\n          <div class="flex', cubo_mb12, proceso_h3)
if cubo_end < 0:
    # fallback
    cubo_end = proceso_h3

block = t[cubo_mb12:cubo_end]
print(f'Cubo block size: {len(block)}')
# Count cubo vs materiales
cubo_thumbs = re.findall(r'<a [^>]*data-href="catalogo concasaya/medium/(img\d+)\.webp"[^>]*data-category="cubo"', block)
mat_thumbs = re.findall(r'<a [^>]*data-href="catalogo concasaya/medium/(img\d+)\.webp"[^>]*data-category="materiales"', block)
print(f'Cubo thumbs: {cubo_thumbs}')
print(f'Materiales thumbs: {mat_thumbs}')
