"""
Fix: Reemplazar los price-badge 'Consultar' (que parecen botones verdes
y confunden) por badges de destaque semánticos según el modelo.

Lógica:
- Cabaña de Vidrio      -> "Destacado" (badge naranja)
- 2 Pisos Premium       -> "Premium" (badge dorado)

Estos badges se ven al lado del título, pero con estilo DIFERENTE al price-badge
para que no parezca un botón de acción.
"""

import re

PATH = r"C:\Workspace\concasaya\modelos.html"

# Mapeo por modelo: title -> texto del badge + color
BADGES = {
    "Cabaña de Vidrio":         ("Destacado",  "#f59e0b"),  # amber/orange
    "2 Pisos Premium con Balcón": ("Premium",  "#eab308"),  # yellow/gold
}


def main():
    with open(PATH, "r", encoding="utf-8") as f:
        content = f.read()

    fixed = 0
    for title, (badge_text, color) in BADGES.items():
        # Buscar el bloque completo:
        # <span class="price-badge"><i class="fas fa-tag"></i>Consultar</span>
        # que esté justo después del <h3 ... >TITLE</h3>
        pattern = re.compile(
            r'(<h3 class="title[^"]*">' + re.escape(title) + r'</h3>\s*'
            r'<span class="price-badge"><i class="fas fa-tag"></i>)Consultar(</span>)'
        )
        replacement = (
            r'\1</span>\n                    '
            r'<span class="destaque-badge" '
            r'style="background:' + color + ';color:white;'
            r'padding:0.375rem 0.75rem;border-radius:9999px;'
            r'font-weight:700;font-size:0.75rem;'
            r'box-shadow:0 4px 14px rgba(0,0,0,0.2);'
            r'border:2px solid rgba(255,255,255,0.3);'
            r'display:inline-flex;align-items:center;gap:0.375rem;'
            r'text-transform:uppercase;letter-spacing:0.5px;'
            r'line-height:1;white-space:nowrap;">'
            r'<i class="fas fa-star"></i>' + badge_text +
            r'</span>'
        )
        new_content, n = pattern.subn(replacement, content)
        if n > 0:
            content = new_content
            fixed += n
            print(f"  Fixed: {title} -> '{badge_text}'")
        else:
            print(f"  NO match: {title}")

    if fixed > 0:
        with open(PATH, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"\nGuardado: {PATH} ({fixed} badges corregidos)")
    else:
        print("\nNada que arreglar")


if __name__ == "__main__":
    main()
