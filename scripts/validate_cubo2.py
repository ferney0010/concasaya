#!/usr/bin/env python3
"""Comparar balance antes y después del cambio."""
import subprocess
# Run before
result_before = subprocess.run(['git', 'show', 'HEAD:modelos.html'], cwd=r'C:\Workspace\concasaya', capture_output=True, text=True)
before = result_before.stdout
# Run after
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    after = f.read()

import re
def count(t, tag):
    o = len(re.findall(rf'<{tag}[\s>]', t))
    c = len(re.findall(rf'</{tag}>', t))
    return o, c

for tag in ['div', 'span', 'a', 'button', 'article', 'section']:
    bo, bc = count(before, tag)
    ao, ac = count(after, tag)
    print(f'  {tag}: before ({bo}/{bc}, diff {bo-bc}) → after ({ao}/{ac}, diff {ao-ac})')
