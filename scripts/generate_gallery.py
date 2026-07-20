"""
Generate HTML for the 'Galería completa' section.
Reads all valid WebP images from catalogo concasaya/ and outputs a grid HTML.
"""
import os
import glob

SRC = r'C:\Workspace\concasaya\catalogo concasaya'
THUMBS = 'catalogo concasaya/thumbs'
MEDIUM = 'catalogo concasaya/medium'

# Get all valid images (skip tiny/broken)
all_files = sorted(glob.glob(os.path.join(SRC, '*.webp')), key=lambda f: int(os.path.basename(f).replace('img','').replace('.webp','')))
valid = [os.path.basename(f) for f in all_files if os.path.getsize(f) >= 8000]

print(f"// {len(valid)} imágenes válidas para la galería")

# Build HTML for each category (heuristic by number ranges)
# CABAÑAS / VIDRIO: smaller numbers, look for 2 aguas / glass
CABANAS_HERO = ['img253', 'img273', 'img294', 'img297', 'img305', 'img309', 'img316', 'img325']
# 2 PISOS: look for two-story buildings
DOS_PISOS = ['img211', 'img214', 'img535', 'img545', 'img557', 'img1318']
# CAMPESTRE 1 PISO TERMINADA
CAMPESTRE = ['img404', 'img407', 'img413', 'img423', 'img434', 'img471', 'img516', 'img523', 'img529', 'img569', 'img599', 'img623', 'img642', 'img1386']
# PLAQUETA EN PROCESO
PLAQUETA = ['img376', 'img454', 'img503', 'img562', 'img587', 'img611']
# CASA EN L
CASA_L = ['img484', 'img1318']
# CUBO/MEDITERRANEA (renders)
CUBO = ['img1055', 'img1061', 'img1067', 'img1072', 'img1081', 'img1087', 'img1093', 'img1099']
# SISTEMA EPS
EPS = ['img1116']
# ACABADOS INTERIORES
ACABADOS = ['img147', 'img190', 'img350', 'img353', 'img1339', 'img1345', 'img1352', 'img1355', 'img1386']
# PROCESO CONSTRUCTIVO
PROCESO = ['img135', 'img218', 'img233', 'img1304', 'img1360']

def gallery_html(images, label=""):
    if not images:
        return ""
    items = []
    for name in images:
        items.append(f'''          <a href="{MEDIUM}/{name}" class="gallery-thumb group block" data-lightbox="catalog" aria-label="Imagen del catálogo CONCASAYA">
            <img src="{THUMBS}/{name}" alt="Imagen del catálogo CONCASAYA" loading="lazy" decoding="async" class="w-full h-full object-cover" />
            <div class="gallery-thumb-label">{label}</div>
          </a>''')
    return '\n'.join(items)

# Output the gallery sections
print("\n===== CABAÑAS GALLERY =====")
print(gallery_html(CABANAS_HERO, "Cabaña"))

print("\n===== PLAQUETA GALLERY =====")
print(gallery_html(PLAQUETA, "Plaqueta"))

print("\n===== 2 PISOS GALLERY =====")
print(gallery_html(DOS_PISOS, "2 Pisos"))

print("\n===== CAMPESTRE GALLERY =====")
print(gallery_html(CAMPESTRE, "Campestre"))

print("\n===== CUBO GALLERY =====")
print(gallery_html(CUBO, "Cubo/Mediterránea"))

print("\n===== ACABADOS GALLERY =====")
print(gallery_html(ACABADOS, "Acabados"))

print("\n===== PROCESO GALLERY =====")
print(gallery_html(PROCESO, "Proceso"))

# ALL IMAGES for "Galería completa" final section
print("\n===== ALL IMAGES GALLERY (count={}) =====".format(len(valid)))
all_items = []
for name in valid:
    all_items.append(f'''          <a href="{MEDIUM}/{name}" class="gallery-thumb group block" data-lightbox="catalog" aria-label="Imagen del catálogo CONCASAYA">
            <img src="{THUMBS}/{name}" alt="Imagen del catálogo CONCASAYA" loading="lazy" decoding="async" class="w-full h-full object-cover" />
          </a>''')
print('\n'.join(all_items))

# Save all to a file for use in HTML
with open('gallery_items.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(all_items))

print(f"\n// Saved {len(all_items)} gallery items to gallery_items.txt")
