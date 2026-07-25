# -*- coding: utf-8 -*-
"""Surgical fix for the 2 broken <div class='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4'>
blocks. Instead of removing all content (which removed thumbnails), we keep the thumbnails
but unwrap them out of the inner div. The broken <div> is replaced with a comment marker,
the matching </div> is removed, but ALL thumbnails stay inside the gallery-grid.
"""
from pathlib import Path

p = Path(r"C:\Workspace\concasaya\modelos.html")
text = p.read_text(encoding="utf-8")

# The broken div opener is exactly:
#   <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
# followed by a blank line and an <a> tag. We want to:
#   1. Replace this opener with an empty string (or comment) - effectively unwrap
#   2. Find the matching </div> (by depth tracking) and remove it
# This way the thumbnails inside become direct children of gallery-grid.

needle = '<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">'
positions = []
i = 0
while True:
    idx = text.find(needle, i)
    if idx < 0: break
    positions.append(idx)
    i = idx + 1

print(f'Found {len(positions)} broken divs')

# For each broken div, find the matching </div> by depth tracking from after the opener
fixes = []  # list of (start_of_div, end_after_closing_div)
for pos in positions:
    # walk forward from end of <div ...> to find matching </div
    scan = pos + len(needle) + 1
    depth = 1
    while depth > 0:
        open_idx = text.find('<div', scan)
        close_idx = text.find('</div>', scan)
        if close_idx < 0:
            raise SystemExit(f'No matching </div> for div at {pos}')
        if 0 <= open_idx < close_idx:
            depth += 1
            scan = open_idx + 4
        else:
            depth -= 1
            scan = close_idx + 6
    end_idx = scan  # right after </div>
    line_op = text.count('\n', 0, pos) + 1
    line_cl = text.count('\n', 0, end_idx) + 1
    print(f'  broken div at line {line_op}, closes at line {line_cl}')
    # The pattern is: <div ...>\n\n<a>...</a>\n   </div>
    # We want to remove: <div ...>\n\n  (the <a> is the actual thumbnail - keep it!)
    # And remove: \n            </div>  (the closing of the broken div)
    fixes.append((pos, end_idx))

# Apply in reverse order
fixes.sort(reverse=True)
old_total = len(text)
for start, end in fixes:
    # The block to remove is: <div ...>\n\n  (start..first '<a'+preceding whitespace)
    # and the matching </div> at the end
    opener_end = start + len(needle)  # end of '<div ...>'
    # find next non-whitespace after opener
    scan = opener_end
    while scan < end and text[scan] in ' \t':
        scan += 1
    # remove from start to scan (the opening div + its trailing whitespace/newline)
    # also remove the matching </div> at end
    text = text[:start] + text[scan:end - len('</div>')] + text[end:]

p.write_text(text, encoding="utf-8")
print(f'\nSize: {old_total} -> {len(text)} (removed {old_total-len(text)} chars)')
