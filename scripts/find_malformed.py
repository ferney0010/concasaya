#!/usr/bin/env python3
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
# Find any data-href that contains another <div or stray content
for m in re.finditer(r'data-href="[^"]*<', t):
    p = m.start()
    print(f'\n=== pos {p} ===')
    print(t[p:p+400])
    print('---')
