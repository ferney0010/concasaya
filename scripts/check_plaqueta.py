#!/usr/bin/env python3
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
ps = t.find('id="plaqueta"')
pe = t.find('id="dos-pisos"')
pb = t[ps:pe]
# Find all h3 in the block
h3s = re.findall(r'<h3[^>]*>([^<]+)</h3>', pb)
print('h3s in plaqueta:', h3s)
# Find all articles
arts = re.findall(r'<article[^>]*>(.*?)</article>', pb, re.S)
print('articles in plaqueta:', len(arts))
for i, a in enumerate(arts):
    title_m = re.search(r'<h3[^>]*>([^<]+)</h3>', a)
    if title_m:
        print(f'  art {i}: {title_m.group(1)[:60]}')
