#!/usr/bin/env python3
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()
# Find each cabin-hero and show 600 chars after to see if it's in a grid
positions = [136682, 141313, 164332, 170948]
for pos in positions:
    # look back for nearest <div class="gallery-grid">
    grid_pos = t.rfind('<div class="gallery-grid', 0, pos)
    if grid_pos > 0 and pos - grid_pos < 2000:
        # show 800 chars from grid start
        print(f'\n--- cabin-hero at {pos} (grid at {grid_pos}) ---')
        print(t[grid_pos:grid_pos+1500])
        print('...')
