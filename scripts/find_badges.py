#!/usr/bin/env python3
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
for needle in ['Casas en L', 'Casas Prefabricadas de Dos Pisos', 'Plaqueta de 1 Piso']:
    print(f'\n=== {needle} ===')
    for m in re.finditer(r'<h3[^>]*>\s*' + re.escape(needle) + r'\s*</h3>', t):
        pos = m.start()
        badge_m = re.search(r'<span class="ml-auto[^"]*"[^>]*>(\d+) fotos</span>', t[pos:pos+2000])
        if badge_m:
            print(f'  pos {pos}: badge = {badge_m.group(1)} fotos')
        else:
            # show snippet
            print(f'  pos {pos}: NO BADGE within 2000 chars. Snippet: {t[pos:pos+300]!r}')
