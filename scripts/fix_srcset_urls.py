"""Fix srcset URLs in modelos.html: clean and re-wrap properly."""
import re
from pathlib import Path

file_path = Path(r"C:\Workspace\concasaya\modelos.html")
html = file_path.read_text(encoding="utf-8")

# Clean up: remove leading %20 in second URL position (artifact from previous attempt)
# Pattern: "%20catalogo%20concasaya/ -> "catalogo%20concasaya/
html = html.replace('"%20catalogo%20concasaya/', '"catalogo%20concasaya/')

# Now verify the structure looks correct
sample = re.search(r'srcset="[^"]+"', html)
if sample:
    print("Sample after cleanup:", sample.group(0))

# Also remove the leading "" empty before each srcset (artifact)
html = re.sub(r'srcset=""([^"]+)"\s+(\d+w)', r'srcset="\1" \2', html)

sample = re.search(r'srcset="[^"]+"', html)
if sample:
    print("Sample after cleanup2:", sample.group(0))

file_path.write_text(html, encoding="utf-8", newline="\n")
print(f"Saved. Size: {len(html)} bytes")
