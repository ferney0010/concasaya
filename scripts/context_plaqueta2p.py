#!/usr/bin/env python3
import re
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

# Find the featured card "Plaqueta 2 Pisos con Balcón"
i = t.find('Plaqueta 2 Pisos con Balcón')
print('card title at', i)
# show 1500 chars context
print(t[max(0,i-100):i+1500])
print('---')
# Find img821/791 paths
for img in ['img821', 'img791']:
    pattern = rf'{img}\.webp'
    matches = list(re.finditer(pattern, t))
    print(f'{img}.webp: {len(matches)} matches in modelos.html')
