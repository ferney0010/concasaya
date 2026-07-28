#!/usr/bin/env python3
"""Dump el bloque de 2 Pisos para ver por qué sale HTML literal."""
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

# Find the 2pisos gallery
i = t.find('Casas Prefabricadas de Dos Pisos')
# The h3 is at i. Find the gallery-grid container after
grid_start = t.find('<div class="gallery-grid">', i)
# Dump until </div></div>  (closing the gallery-grid)
chunk = t[grid_start:grid_start+3000]
print(chunk[:3000])
