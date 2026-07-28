#!/usr/bin/env python3
"""Dump Cubo gallery (que se ve bien) para ver la estructura correcta."""
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()
i = t.find('Casas Cubo y Mediterr')
grid_start = t.find('<div class="gallery-grid">', i)
print(t[grid_start:grid_start+1500])
