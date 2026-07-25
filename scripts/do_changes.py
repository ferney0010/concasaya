#!/usr/bin/env python3
"""Cambios directos:
1. Eliminar card 'Plaqueta 2 Pisos con Balcón'
2. Miniatura card '2 Pisos' -> img821
3. Miniatura card 'Campestre 2 Pisos' -> img839
"""
import re

src = r'C:\Workspace\concasaya\modelos.html'
with open(src, 'r', encoding='utf-8') as f:
    t = f.read()

# Find the 3 Plaqueta cards in the plaqueta section (id="plaqueta")
plaqueta_start = t.find('id="plaqueta"')
plaqueta_end = t.find('id="dos-pisos"')
plaqueta_block = t[plaqueta_start:plaqueta_end]

# === CHANGE 1: Remove "Plaqueta 2 Pisos con Balcón" card ===
# Find the article that contains "Plaqueta 2 Pisos con Balcón"
# It's the 2nd of 3 cards in plaqueta section
articles = list(re.finditer(r'<article[^>]*id="plaqueta[^"]*"[^>]*>.*?</article>', plaqueta_block, re.S))
print(f'Found {len(articles)} plaqueta articles')

removed = False
for art_m in articles:
    art_text = art_m.group(0)
    if 'Plaqueta 2 Pisos con Balcón' in art_text:
        # Remove this article from the block
        t = t[:plaqueta_start + art_m.start()] + t[plaqueta_start + art_m.end():]
        print(f'Removed plaqueta 2P card (was {len(art_text)} chars)')
        removed = True
        break

if not removed:
    print('WARN: plaqueta 2P card not found!')

# === CHANGE 2 & 3: Update miniatura for "2 Pisos" card (img135 -> img821) and "Campestre 2 Pisos" (img1199 -> img839) ===
# Re-find dos-pisos section
dos_pisos_start = t.find('id="dos-pisos"')
dos_pisos_end = t.find('id="cubo-mediterraneas"')
dp_block = t[dos_pisos_start:dos_pisos_end]

# Find articles in 2pisos section
dp_articles = list(re.finditer(r'<article[^>]*>.*?</article>', dp_block, re.S))
print(f'Found {len(dp_articles)} 2pisos articles')

# Update miniatura in absolute file positions
# We need to find the article containing "Casa 2 Pisos" (uses img135) and "Campestre 2 Pisos" (uses img1199)
# For each, find the first <img src="..."> and replace with the new img

# Re-scan after the removal
dp_start = t.find('id="dos-pisos"')
dp_end = t.find('id="cubo-mediterraneas"')
dp_block = t[dp_start:dp_end]

# Find all articles
dp_articles = list(re.finditer(r'<article[^>]*>.*?</article>', dp_block, re.S))
for art_m in dp_articles:
    art_text = art_m.group(0)
    art_abs = dp_start + art_m.start()
    if 'Casa 2 Pisos' in art_text and 'data-img="catalogo concasaya/medium/img135.webp"' in art_text:
        # Update src/srcset of the <img> AND data-img of the button
        # Replace img135 -> img821 in all 3 places (img src, img srcset, button data-img)
        new_art = art_text
        # img src
        new_art = new_art.replace('catalogo concasaya/thumbs/img135.webp', 'catalogo concasaya/thumbs/img821.webp')
        new_art = new_art.replace('catalogo concasaya/medium/img135.webp', 'catalogo concasaya/medium/img821.webp')
        # srcset (URL encoded)
        new_art = new_art.replace('catalogo%20concasaya/thumbs/img135.webp', 'catalogo%20concasaya/thumbs/img821.webp')
        new_art = new_art.replace('catalogo%20concasaya/medium/img135.webp', 'catalogo%20concasaya/medium/img821.webp')
        # button data-img
        new_art = new_art.replace('data-img="catalogo concasaya/medium/img135.webp"', 'data-img="catalogo concasaya/medium/img821.webp"')
        t = t[:art_abs] + new_art + t[art_abs + len(art_text):]
        print(f'Updated "2 Pisos" card: img135 -> img821')
    elif 'Campestre 2 Pisos' in art_text and 'data-img="catalogo concasaya/medium/img1199.webp"' in art_text:
        new_art = art_text
        new_art = new_art.replace('catalogo concasaya/thumbs/img1199.webp', 'catalogo concasaya/thumbs/img839.webp')
        new_art = new_art.replace('catalogo concasaya/medium/img1199.webp', 'catalogo concasaya/medium/img839.webp')
        new_art = new_art.replace('catalogo%20concasaya/thumbs/img1199.webp', 'catalogo%20concasaya/thumbs/img839.webp')
        new_art = new_art.replace('catalogo%20concasaya/medium/img1199.webp', 'catalogo%20concasaya/medium/img839.webp')
        new_art = new_art.replace('data-img="catalogo concasaya/medium/img1199.webp"', 'data-img="catalogo concasaya/medium/img839.webp"')
        t = t[:art_abs] + new_art + t[art_abs + len(art_text):]
        print(f'Updated "Campestre 2 Pisos" card: img1199 -> img839')

with open(src, 'w', encoding='utf-8') as f:
    f.write(t)

# Verify
print('\n=== Verification ===')
# Check plaqueta section cards
ps = t.find('id="plaqueta"')
pe = t.find('id="dos-pisos"')
pb = t[ps:pe]
plaqueta_articles = re.findall(r'<h3 class="text-2xl font-bold">([^<]+)</h3>', pb)
print(f'Plaqueta cards remaining: {plaqueta_articles}')

# Check dos-pisos section
ds = t.find('id="dos-pisos"')
de = t.find('id="cubo-mediterraneas"')
db = t[ds:de]
print(f'dos-pisos section has img135: {"img135.webp" in db}')
print(f'dos-pisos section has img1199: {"img1199.webp" in db}')
print(f'dos-pisos section has img821: {"img821.webp" in db}')
print(f'dos-pisos section has img839: {"img839.webp" in db}')

print('\nFinal size:', len(t))
