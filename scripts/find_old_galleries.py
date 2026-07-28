#!/usr/bin/env python3
import re
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

# Find each problematic gallery block: starts with <div class="gallery-grid"> and contains <div class="grid grid-cols-2
# Find all positions
positions = []
i = 0
while True:
    p = t.find('<div class="gallery-grid">', i)
    if p < 0: break
    # Check if next 3000 chars contain the bad nested grid
    chunk = t[p:p+5000]
    if '<div class="grid grid-cols-2 md:grid-cols-3' in chunk:
        # Find the section title before
        # Look back 3000 chars for the h3
        before = t[max(0,p-3000):p]
        title_m = re.findall(r'<h3[^>]*>([^<]+)</h3>', before)
        last_title = title_m[-1] if title_m else 'unknown'
        positions.append((p, last_title))
    i = p + 1
print('Bad gallery positions:')
for p, t_ in positions:
    print(f'  pos {p}: {t_!r}')
