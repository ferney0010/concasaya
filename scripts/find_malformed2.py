#!/usr/bin/env python3
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
m = re.search(r'data-href="catalogo concasaya/medium/<', t)
if m:
    print('Malformed at', m.start(), ':', repr(t[m.start():m.start()+200]))
else:
    print('No malformed data-href')
m2 = re.findall(r'data-href="[^"]*<', t)
print('Broken data-hrefs:', len(m2))
for x in m2[:3]:
    print('  ', repr(x[:80]))
