# -*- coding: utf-8 -*-
"""Fix malformed HTML in 2 Pisos section:
- Replace <art<article> with <article>
- Normalize the broken </article>            <article> line break.
"""
from pathlib import Path

p = Path(r"C:\Workspace\concasaya\modelos.html")
html = p.read_text(encoding="utf-8")

# Fix 1: <art<article -> <article
n1 = html.count("<art<article")
html2 = html.replace("<art<article", "<article")

# Fix 2: </article>            <article (no newline between) -> </article>\n\n            <article
broken = "</article>            <article"
n2 = html2.count(broken)
html3 = html2.replace(broken, "</article>\n\n            <article")

p.write_text(html3, encoding="utf-8")
print(f"Fixed <art<article -> <article: {n1} occurrences")
print(f"Fixed </article><article spacing: {n2} occurrences")
print(f"Size: {len(html)} -> {len(html3)}")
