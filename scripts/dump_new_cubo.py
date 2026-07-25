#!/usr/bin/env python3
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()
start = t.find('id="cubo-mediterraneas"')
end = t.find('</section>', start)
# Print first 3500 chars
print(t[start:start+3500])
