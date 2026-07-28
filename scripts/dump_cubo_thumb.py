#!/usr/bin/env python3
import re
t = open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8').read()
# Find the gallery content
gg_start = 188955
gg_end = 206224
gallery = t[gg_start:gg_end]
# Find first <a> tag
first_a = gallery.find('<a ')
if first_a > 0:
    end_a = gallery.find('</a>', first_a) + 4
    print('First <a>:', gallery[first_a:end_a])
# Show 30th <a>
all_a = re.findall(r'<a [^>]*?>.*?</a>', gallery, re.S)
print(f'Total <a>: {len(all_a)}')
print('30th:', all_a[29][:300] if len(all_a) > 29 else 'N/A')
