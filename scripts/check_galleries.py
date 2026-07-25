#!/usr/bin/env python3
import re
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

print('cabin-grid-vidrio:', t.count('cabin-grid-vidrio'))
print('gallery-grid:', t.count('gallery-grid'))

for m in re.finditer(r'<h3[^>]*>([^<]+)</h3>', t):
    title = m.group(1).strip()
    if any(k in title for k in ['Plaqueta', 'Casas en L', 'Casas Prefabricadas de Dos', 'Cubo', 'Materiales', 'Proceso', 'Galería']):
        pos = m.start()
        chunk = t[pos:pos+2000]
        for cm in re.finditer(r'<div class="([^"]+)"', chunk[:500]):
            print(f'  {title[:50]:50s} -> {cm.group(1)}')
            break
