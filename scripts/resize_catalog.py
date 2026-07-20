"""
Resize all catalog images to thumb (400px) and medium (800px) variants.
Saves to catalogo concasaya/thumbs/ and catalogo concasaya/medium/.
"""
import os
import glob
from PIL import Image

SRC = r'C:\Workspace\concasaya\catalogo concasaya'
THUMB_DIR = os.path.join(SRC, 'thumbs')
MEDIUM_DIR = os.path.join(SRC, 'medium')

os.makedirs(THUMB_DIR, exist_ok=True)
os.makedirs(MEDIUM_DIR, exist_ok=True)

files = sorted(glob.glob(os.path.join(SRC, '*.webp')))
print(f"Processing {len(files)} images...")

ok, err, skipped = 0, 0, 0
for i, f in enumerate(files, 1):
    name = os.path.basename(f)
    sz = os.path.getsize(f)
    # Skip tiny files (likely broken/placeholder)
    if sz < 8000:
        print(f"  [{i}/{len(files)}] SKIP (too small: {sz//1024}KB): {name}")
        skipped += 1
        continue
    try:
        img = Image.open(f).convert('RGB')
        # Thumbnail 400px
        thumb = img.copy()
        thumb.thumbnail((400, 400), Image.LANCZOS)
        thumb.save(os.path.join(THUMB_DIR, name), 'WEBP', quality=72, method=6)
        # Medium 800px
        med = img.copy()
        med.thumbnail((800, 800), Image.LANCZOS)
        med.save(os.path.join(MEDIUM_DIR, name), 'WEBP', quality=78, method=6)
        ok += 1
        if i % 20 == 0:
            print(f"  [{i}/{len(files)}] {ok} ok, {err} err, {skipped} skip")
    except Exception as e:
        print(f"  [{i}/{len(files)}] ERR {name}: {e}")
        err += 1

print(f"\nDone: {ok} ok, {err} err, {skipped} skip ({ok+err+skipped}/{len(files)} total)")
print(f"Thumbs: {THUMB_DIR}")
print(f"Medium: {MEDIUM_DIR}")
