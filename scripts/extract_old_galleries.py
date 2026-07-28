"""Extract the original Plaqueta 1P and Casas en L galleries from the old version."""
import re
from pathlib import Path

p = Path(r"C:\Users\ferne\AppData\Local\Temp\old_fea.html")
text = p.read_text(encoding="utf-8")

# Extract all img refs with their data-category
# Look for img tags with data-category
pat = re.compile(r'<img\s+src="([^"]+)"\s+srcset="[^"]+"\s+sizes="[^"]*"\s+alt="([^"]+)"\s+loading="lazy"\s+decoding="async"\s+class="[^"]+"\s*/>', re.IGNORECASE)
matches = pat.findall(text)
for src, alt in matches[:5]:
    print(f'{src} | {alt}')

# Find all gallery-thumb for plaqueta1p
print('\n--- plaqueta1p thumbs ---')
pat2 = re.compile(r'<a[^>]*data-category="plaqueta1p"[^>]*>\s*<img\s+src="([^"]+)"', re.IGNORECASE)
for m in pat2.finditer(text):
    src = m.group(1)
    fname = src.split('/')[-1]
    print(fname)
