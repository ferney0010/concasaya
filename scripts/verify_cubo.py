#!/usr/bin/env python3
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()
import re
# All data-category="cubo" in the file
for m in re.finditer(r'data-category="cubo"', t):
    pos = m.start()
    # find the data-img of the same tag
    chunk = t[pos-200:pos+300]
    img_m = re.search(r'data-img="([^"]+)"', chunk)
    if img_m:
        print(f'  pos {pos}: data-img = {img_m.group(1)}')
    else:
        # It's a gallery thumb
        href_m = re.search(r'data-href="([^"]+)"', chunk)
        if href_m:
            print(f'  pos {pos}: gallery href = {href_m.group(1)}')
        else:
            print(f'  pos {pos}: ??? no img/href')
print('---')
# Counts
for img in ['img1027', 'img1061', 'img1067', 'img1072', 'img1081', 'img1275', 'img1286', 'img1280', 'img1011', 'img988', 'img1018', 'img1032', 'img1043', 'img1049']:
    print(f'  {img}.webp: {t.count(img+".webp")} refs')
# Verify img1093 and img1099 are gone from featured (but might still be in old <a> text in WhatsApp links)
print('---')
print('img1093.webp:', t.count('img1093.webp'))
print('img1099.webp:', t.count('img1099.webp'))
print('img1055.webp:', t.count('img1055.webp'))
print('img1087.webp:', t.count('img1087.webp'))
