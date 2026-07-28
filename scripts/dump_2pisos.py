#!/usr/bin/env python3
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
h3_pos = t.find('<h3 class="text-xl md:text-2xl font-bold text-secondary">Casas Prefabricadas de Dos Pisos</h3>')
g_start = t.find('<div class="gallery-grid">', h3_pos)
print(t[g_start:g_start+2000])
