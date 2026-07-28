#!/usr/bin/env python3
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
# Find Cubo block
cubo_h3 = t.find('<h3 class="text-xl md:text-2xl font-bold text-secondary">Casas Tipo Cubo / Mediterráneas</h3>')
end = t.find('<h3 class="text-xl md:text-2xl font-bold text-secondary">Proceso Constructivo</h3>')
print('Cubo section:', cubo_h3, '-', end)
block = t[cubo_h3:end]
print(block[:3000])
print('---')
print('...')
print(block[-3000:])
