"""
Generate the HTML for the complete gallery (all 168 images).
"""
import os
import glob

SRC = r'C:\Workspace\concasaya\catalogo concasaya'
THUMBS = 'catalogo concasaya/thumbs'
MEDIUM = 'catalogo concasaya/medium'

# Get all valid images, sorted numerically by name
all_files = glob.glob(os.path.join(SRC, '*.webp'))
def sort_key(f):
    name = os.path.basename(f).replace('img', '').replace('.webp', '')
    try:
        return int(name)
    except:
        return 99999
all_files.sort(key=sort_key)

valid = [os.path.basename(f) for f in all_files if os.path.getsize(f) >= 8000]

# Generate HTML
lines = []
for name in valid:
    lines.append(f'          <a href="{MEDIUM}/{name}" class="gallery-thumb group block" data-lightbox="catalog" aria-label="Imagen del catálogo CONCASAYA">')
    lines.append(f'            <img src="{THUMBS}/{name}" alt="Imagen del catálogo CONCASAYA" loading="lazy" decoding="async" class="w-full h-full object-cover" />')
    lines.append(f'          </a>')

# Write to a new file
out_path = r'C:\Workspace\concasaya\scripts\gallery_clean.txt'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f"Written {len(valid)} gallery items to {out_path}")
