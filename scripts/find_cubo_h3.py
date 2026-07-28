#!/usr/bin/env python3
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
# Cubo h3
cubo_h3 = t.find('Casas Tipo Cubo / Mediterráneas</h3>')
print(f'Cubo h3 at: {cubo_h3}')
print(t[cubo_h3-300:cubo_h3+200])
print('---')
# Find the next mb-12 after Cubo
mb12_after = t.find('<div class="mb-12">', cubo_h3)
print(f'Next mb-12 after Cubo h3: {mb12_after}')
# What is the gallery-grid in this block?
gg = t.find('<div class="gallery-grid">', cubo_h3)
print(f'First gallery-grid after Cubo h3: {gg}')
