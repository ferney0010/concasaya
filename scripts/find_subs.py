#!/usr/bin/env python3
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
cubo_pos = t.find('id="cubo-mediterraneas"')
mb12s = list(re.finditer(r'<div class="mb-12">', t))
print('mb-12 divs after Cubo:')
for m in mb12s:
    p = m.start()
    if p > cubo_pos:
        h3 = re.search(r'<h3[^>]*>([^<]+)</h3>', t[p:p+1500])
        if h3:
            print(f'  pos {p}: {h3.group(1).strip()[:60]}')
