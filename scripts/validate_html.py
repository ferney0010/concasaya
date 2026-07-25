#!/usr/bin/env python3
"""Smoke test: check that modelos.html parses and key DOM structures exist."""
import sys
import re
import html.parser
from pathlib import Path

FILE = Path(r"C:\Workspace\concasaya\modelos.html")
content = FILE.read_text(encoding="utf-8")
size_kb = len(content) / 1024
print(f"File size: {size_kb:.1f} KB")

# Tag balance
open_tags  = re.findall(r'<(?!!|/)?(\w+)\b', content)
close_tags = re.findall(r'</(\w+)>', content)
void_tags = {'img','br','hr','meta','link','input','source','area','base','col','embed','param','track','wbr'}
self_closing = re.findall(r'<(img|br|hr|meta|link|input|source|area|base|col|embed|param|track|wbr)\b[^>]*>', content, re.IGNORECASE)
opens = {}
closes = {}
for t in open_tags:
    if t.lower() in void_tags: continue
    opens[t] = opens.get(t, 0) + 1
for t in close_tags:
    closes[t] = closes.get(t, 0) + 1

mismatch = []
for t in set(list(opens.keys()) + list(closes.keys())):
    o = opens.get(t, 0)
    c = closes.get(t, 0)
    if o != c:
        mismatch.append((t, o, c))

if mismatch:
    print("\n!! TAG BALANCE MISMATCH:")
    for t, o, c in sorted(mismatch):
        print(f"   {t}: open={o} close={c} diff={o-c}")
    sys.exit(1)
else:
    print("OK: tag balance correct")

# Check critical new structures
checks = {
    '<div id="categoryGalleryModal"': content.count('<div id="categoryGalleryModal"'),
    '<div id="cat-modal-grid"':       content.count('<div id="cat-modal-grid"'),
    'function openFromCard':          content.count('function openFromCard'),
    'class="open-modal-btn[data-category]" handler': content.count("'.open-modal-btn[data-category]'"),
    'data-category="cabana"':         content.count('data-category="cabana"'),
    'data-category="plaqueta"':       content.count('data-category="plaqueta"'),
    'data-category="2pisos"':         content.count('data-category="2pisos"'),
    'data-category="cubo"':           content.count('data-category="cubo"'),
    'data-category="eps"':            content.count('data-category="eps"'),
    'data-category="materiales"':     content.count('data-category="materiales"'),
    'data-category="proceso"':        content.count('data-category="proceso"'),
    'data-variant="altillo"':         content.count('data-variant="altillo"'),
    'data-variant="vidrio"':          content.count('data-variant="vidrio"'),
    'fa-images"></i>Ver más modelos': content.count('fa-images"></i>Ver más modelos'),
    'fa-images"></i>Ver más<':        content.count('fa-images"></i>Ver más<'),
}

print("\n--- Critical structures ---")
for k, v in checks.items():
    flag = "OK" if v > 0 else "!!"
    print(f"  [{flag}] {k}: {v}")

# Validate the JS is syntactically OK (rough check)
script_blocks = re.findall(r'<script>(.*?)</script>', content, re.DOTALL)
print(f"\n--- {len(script_blocks)} <script> blocks found ---")
big_scripts = sorted(script_blocks, key=len, reverse=True)[:3]
for i, s in enumerate(big_scripts):
    print(f"  Block {i+1}: {len(s)} chars")
    # look for unterminated strings
    single_quote = s.count("'")
    double_quote = s.count('"')
    backtick = s.count('`')
    print(f"    quotes: single={single_quote} double={double_quote} backtick={backtick}")
