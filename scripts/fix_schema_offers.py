"""
Fix Schema.org offers: agregar 'price' a los 10 offers que no lo tienen
en modelos.html. Mapeo por url slug.

El bug: Google Search Console detecta los offers de los Products del ItemList
y avisa que faltan 'price' en 10 de los 12.
"""

import re

PATH = r"C:\Workspace\concasaya\modelos.html"

# Mapeo: url slug -> precio en COP (sin comas, como entero)
SLUG_TO_PRICE = {
    "cabana-vidrio": 35000000,      # Cabaña vidrio premium (similar a tiny)
    "plaqueta-1p": 85000000,        # Casa 1 piso plaqueta
    "plaqueta-2p": 95000000,        # Casa 2 pisos plaqueta
    "campestre": 95000000,          # Campestre 2 pisos
    "casa-l": 95000000,             # Casa en L
    "cubo-1p": 90000000,            # Cubo 1 piso moderno
    "cubo-2p": 110000000,           # Mediterránea 2 pisos con piscina
    "cubo-ladera": 95000000,        # Cubo en ladera
    "eps-1p": 75000000,             # EPS 1 piso
    "eps-2p": 90000000,             # EPS 2 pisos
    # cabana-28 y tiny ya tienen price, no se tocan
}


def fix_offers(html: str) -> tuple[str, int]:
    """Reemplaza los offers que no tienen 'price' agregándolo.

    Estrategia: para cada bloque '"offers": { ... "url": "...#slug"}',
    si no contiene 'price', insertar el price después de 'priceCurrency'.
    """
    fixed = 0
    for slug, price in SLUG_TO_PRICE.items():
        # Buscar el bloque offers para este slug
        # El patrón es: "offers": { "url": "...#slug" }
        # El bloque entero es: "offers": { "@type": "Offer", "priceCurrency": "COP", "availability": ..., "url": ... }
        # Necesito encontrar el bloque que contiene "#slug" pero NO contiene "price":

        # Patrón: el bloque offers completo para este slug
        # Ofrece: { ... "url": "...#slug" } - el slug aparece solo UNA VEZ en la URL
        # Pero podría tener un "url" previo. Más seguro: buscar el offers y verificar.

        # Estrategia: encontrar cada bloque offers completo (no codicioso, hasta el siguiente })
        pattern = re.compile(
            r'"offers":\s*\{\s*"@type":\s*"Offer"[^}]*"url":\s*"https://www\.concasaya\.com/modelos\.html#' + re.escape(slug) + r'"\s*\}',
            re.DOTALL
        )

        for m in pattern.finditer(html):
            block = m.group(0)
            if '"price"' in block:
                # Ya tiene price (caso cabana-28 o tiny), saltar
                continue

            # Insertar el price después de "priceCurrency": "COP",
            # El patrón es: "priceCurrency": "COP",
            new_block = re.sub(
                r'("priceCurrency":\s*"COP",)',
                r'\1\n                  "price": "' + str(price) + '",\n                  "priceValidUntil": "2027-12-31",',
                block,
                count=1
            )
            html = html.replace(block, new_block, 1)
            fixed += 1
            print(f"  Fixed: {slug} -> ${price:,} COP")
    return html, fixed


def main():
    with open(PATH, "r", encoding="utf-8") as f:
        content = f.read()

    print(f"Antes: {content.count(chr(34) + 'price' + chr(34))} campos 'price' en el archivo")
    new_content, fixed = fix_offers(content)
    print(f"Fixed: {fixed} offers")

    if fixed > 0:
        # Validar JSON
        import json
        # Extraer el JSON-LD (buscar entre <script type="application/ld+json"> y </script>)
        m = re.search(r'<script type="application/ld\+json">(.*?)</script>', new_content, re.DOTALL)
        if m:
            try:
                json.loads(m.group(1))
                print("JSON valido OK")
            except json.JSONDecodeError as e:
                print(f"ERROR JSON: {e}")
                return

        with open(PATH, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Guardado: {PATH}")
        print(f"Despues: {new_content.count(chr(34) + 'price' + chr(34))} campos 'price'")
    else:
        print("Nada que arreglar")


if __name__ == "__main__":
    main()
