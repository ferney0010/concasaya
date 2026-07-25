#!/usr/bin/env python3
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

# Find the start of the Cubo gallery block
# It begins with a <div class="mb-12"> that contains the "Casas Tipo Cubo / Mediterráneas" h3
# Search backwards from pos 202250
div_open_pos = 202250
# go back to find <div class="mb-12">
back = t.rfind('<div class="mb-12">', 0, div_open_pos)
print('CUBO gallery block start at:', back)
print('text before:', t[back-50:back+200])
print('---')
# Find the end: the </div> closing the cubo block, just before the next <div class="mb-12"> (which is the EPS block)
# The EPS block starts around 206403+800 ~ 207200
# Find the next <div class="mb-12"> after div_open_pos
next_div_mb12 = t.find('<div class="mb-12">', back+1)
print('Next sub-block start at:', next_div_mb12)
# Show the text between
print('text between:', t[next_div_mb12-300:next_div_mb12+100])
