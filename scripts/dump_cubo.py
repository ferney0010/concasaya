#!/usr/bin/env python3
"""Dump sección cubo-mediterraneas."""
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()
start = t.find('id="cubo-mediterraneas"')
end = t.find('id="sistema-eps"')
print('start:', start, 'end:', end, 'len:', end-start)
with open(r'C:\Workspace\concasaya\scripts\_cubo_dump.txt', 'w', encoding='utf-8') as o:
    o.write(t[start:end])
print('written')
