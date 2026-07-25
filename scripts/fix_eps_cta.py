# -*- coding: utf-8 -*-
"""Fix CTA 'Beneficios del Sistema EPS' text contrast issues.
- The background is dark blue (linear-gradient #0d4f6e -> #072a3d).
- The 'text-cyan-100/90' class is invalid Tailwind syntax (slash with 90 doesn't work
  on text-cyan-100 in some Tailwind versions).
- Replace with valid white/light-cyan classes for proper contrast.
"""
from pathlib import Path

p = Path(r"C:\Workspace\concasaya\modelos.html")
text = p.read_text(encoding="utf-8")

fixes = [
    # Subtitle intro paragraph
    ('<p class="text-lg text-cyan-100/90">',
     '<p class="text-lg text-cyan-100">'),
    # The leaf badge "Por qué elegir EPS" - keep cyan but ensure visibility
    ('<span class="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 rounded-full text-xs font-bold uppercase tracking-wider mb-4">',
     '<span class="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-400/30 text-white border border-cyan-300/50 rounded-full text-xs font-bold uppercase tracking-wider mb-4">'),
    # Heading - already text-white, fine
    # The "Conoce más" button at the bottom - white text on transparent should be fine but let me make it more visible
    # Find the EPS section closing divs
]

for old, new in fixes:
    if old not in text:
        print(f'WARN: not found: {old[:80]}')
    else:
        count = text.count(old)
        text = text.replace(old, new)
        print(f'Replaced {count}x: {old[:80]} -> {new[:80]}')

p.write_text(text, encoding="utf-8")
print(f'\nSize: {p.stat().st_size} bytes')
