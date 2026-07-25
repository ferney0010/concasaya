#!/usr/bin/env python3
"""Replace 'Ver más modelos' with 'Ver más' in modelos.html.
Only inside <button> tags (icon class="fas fa-images") and the
comments/JS labels that mention it.
"""
from pathlib import Path
import re

FILE = Path(r"C:\Workspace\concasaya\modelos.html")
content = FILE.read_text(encoding="utf-8")

# Replace inside button labels
before_btns = len(re.findall(r'fas fa-images"></i>Ver más modelos', content))
content = content.replace('fas fa-images"></i>Ver más modelos</button>',
                          'fas fa-images"></i>Ver más</button>')
after_btns = len(re.findall(r'fas fa-images"></i>Ver más modelos', content))

# Replace in HTML/JS comments
content = content.replace('Modal de galería por categoría (Ver más modelos)',
                          'Modal de galería por categoría (Ver más)')
content = content.replace('If this button targets the new "Ver más modelos" gallery modal',
                          'If this button targets the new "Ver más" gallery modal')
content = content.replace('// ====== Category Gallery Modal (Ver más modelos) =========================',
                          '// ====== Category Gallery Modal (Ver más) =========================')
content = content.replace('/* ====== Category Gallery Modal (Ver más modelos) ====== */',
                          '/* ====== Category Gallery Modal (Ver más) ====== */')

FILE.write_text(content, encoding="utf-8")
print(f"Replaced in {before_btns} button(s); remaining 'Ver más modelos': {after_btns}")
print("Updated HTML/JS comments.")
