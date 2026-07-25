#!/usr/bin/env python3
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
ds = t.find('id="dos-pisos"')
de = t.find('id="cubo-mediterraneas"')
db = t[ds:de]
arts = re.findall(r'<article[^>]*>(.*?)</article>', db, re.S)
for a in arts:
    title = re.search(r'<h3[^>]*>([^<]+)</h3>', a)
    img = re.search(r'data-img="([^"]+)"', a)
    if title and img:
        print(f'  {title.group(1):40s} -> {img.group(1)}')
