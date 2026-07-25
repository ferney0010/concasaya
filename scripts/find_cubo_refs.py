#!/usr/bin/env python3
import re
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()
# Find cubo gallery section
for m in re.finditer(r'data-category="cubo"', t):
    print('cubo ref at', m.start())
i = t.find('CAT_META')
print('CAT_META at', i)
# show CAT_META section
print(t[i:i+2500])
