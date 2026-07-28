#!/usr/bin/env python3
import re
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

# Plaqueta 1P: 33 unique imgs (1 hero + 32 grid) -> badge should say 33
# Wait, my script counted 33. So the badge should be 33. But after fix, badge says 39. Let me fix.
# Original badge said 33. New count is 33. Keep at 33.
# But the script output said "Plaqueta 1P badge: 39". That means we changed it to 39. But I want 33.
# Let me just set it to 33 explicitly.

# Plaqueta 1P: 33 imgs (1 hero + 32 grid)
t = re.sub(r'(Plaqueta de 1 Piso</h3>.*?)<span class="ml-auto[^"]*"[^>]*>(\d+) fotos</span>',
           r'\1<span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">33 fotos</span>',
           t, count=1, flags=re.S)

# 2 Pisos: 39 imgs (1 hero + 38 grid)
t = re.sub(r'(Casas Prefabricadas de Dos Pisos</h3>.*?)<span class="ml-auto[^"]*"[^>]*>(\d+) fotos</span>',
           r'\1<span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">39 fotos</span>',
           t, count=1, flags=re.S)

# Casas en L: 9 imgs (1 hero + 8 grid)
t = re.sub(r'(Casas en L</h3>.*?)<span class="ml-auto[^"]*"[^>]*>(\d+) fotos</span>',
           r'\1<span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">9 fotos</span>',
           t, count=1, flags=re.S)

with open(r'C:\Workspace\concasaya\modelos.html', 'w', encoding='utf-8') as f:
    f.write(t)

# Verify
for label, pattern in [('Plaqueta 1P', r'Plaqueta de 1 Piso</h3>.*?(\d+) fotos'),
                        ('2 Pisos', r'Casas Prefabricadas de Dos Pisos</h3>.*?(\d+) fotos'),
                        ('Casas en L', r'Casas en L</h3>.*?(\d+) fotos')]:
    m = re.search(pattern, t, re.S)
    if m: print(f'{label}: {m.group(1)} fotos')
