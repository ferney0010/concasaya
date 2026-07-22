"""Limpiar price-badge vacíos que quedaron después del fix anterior."""
import re

PATH = r"C:\Workspace\concasaya\modelos.html"

with open(PATH, "r", encoding="utf-8") as f:
    content = f.read()

# Quitar los price-badge vacíos (con icono fa-tag pero sin texto)
pat = re.compile(r'\s*<span class="price-badge"><i class="fas fa-tag"></i></span>')
new_content, n = pat.subn('', content)
print(f"price-badge vacíos quitados: {n}")

if n > 0:
    with open(PATH, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Guardado")
