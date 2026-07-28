#!/usr/bin/env python3
import subprocess, re
# Get the modelos.html from commit 9b90e89
result = subprocess.run(['git', 'show', '9b90e89:modelos.html'], cwd=r'C:\Workspace\concasaya', capture_output=True, text=True)
html = result.stdout
# Find all imgs with data-category="2pisos"
# Find the gallery block by looking for "Casas Prefabricadas de Dos Pisos" h3
h3_pos = html.find('Casas Prefabricadas de Dos Pisos')
# find the gallery-grid after that
g_start = html.find('<div class="gallery-grid">', h3_pos)
g_end = html.find('</div>\n        </div>\n\n      </section>', g_start)
if g_end < 0:
    g_end = html.find('</div>\n\n      </section>', g_start)
block = html[g_start:g_end] if g_start > 0 and g_end > 0 else ''
imgs = re.findall(r'data-href="catalogo concasaya/medium/(img\d+)\.webp"', block)
print(f'2pisos imgs in commit 9b90e89: {len(imgs)}')
print('imgs:', imgs)
