# -*- coding: utf-8 -*-
"""Fix img1027.webp -> img1081.webp (file img1027 doesn't exist)."""
from pathlib import Path
p = Path(r"C:\Workspace\concasaya\modelos.html")
html = p.read_text(encoding="utf-8")
count = html.count("img1027.webp")
html2 = html.replace("img1027.webp", "img1081.webp")
p.write_text(html2, encoding="utf-8")
print(f"Replaced {count} occurrences of img1027.webp -> img1081.webp")
