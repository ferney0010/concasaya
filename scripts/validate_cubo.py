#!/usr/bin/env python3
"""Validar que el HTML está balanceado."""
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

# Count opening/closing tags for common elements
import re
def count(tag):
    opens = len(re.findall(rf'<{tag}[\s>]', t))
    closes = len(re.findall(rf'</{tag}>', t))
    return opens, closes

for tag in ['div', 'article', 'section', 'a', 'span', 'h3', 'h4', 'p', 'ul', 'li', 'img', 'button']:
    o, c = count(tag)
    diff = '✓' if o == c else f'✗ DIFF={o-c}'
    print(f'  {tag}: open={o} close={c} {diff}')

# Check file size
print(f'\nFile size: {len(t)} bytes')
