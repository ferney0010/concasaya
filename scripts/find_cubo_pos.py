#!/usr/bin/env python3
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
cubo_section = t.find('id="cubo-mediterraneas"')
cubo_mb12 = t.find('<div class="mb-12">', cubo_section)
print('cubo-mediterraneas at:', cubo_section)
print('Cubo mb-12 at:', cubo_mb12)
print('Next mb-12 after:', t.find('<div class="mb-12">', cubo_mb12 + 1))
print('Proceso h3 at:', t.find('Proceso Constructivo</h3>'))
