#!/usr/bin/env python3
"""Find unbalanced <span> tags in modelos.html (regex-based, line-numbered)."""
import re
from pathlib import Path

content = Path(r"C:\Workspace\concasaya\modelos.html").read_text(encoding="utf-8")

# Find all <span ...> opens and </span> closes
opens = [(m.start(), m.group(0)) for m in re.finditer(r'<span\b[^>]*>', content)]
closes = [(m.start(), '</span>') for m in re.finditer(r'</span>', content)]

print(f"Found {len(opens)} <span> opens and {len(closes)} </span> closes")

# Walk through and try to match. Use line numbers.
line_starts = [0]
for i, c in enumerate(content):
    if c == '\n': line_starts.append(i + 1)

def line_no(pos):
    # binary search
    lo, hi = 0, len(line_starts) - 1
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if line_starts[mid] <= pos: lo = mid
        else: hi = mid - 1
    return lo + 1

# Try to match opens and closes
stack = []
all_events = [(p, 'open', t) for p, t in opens] + [(p, 'close', t) for p, t in closes]
all_events.sort()
for pos, kind, tag in all_events:
    if kind == 'open':
        stack.append((pos, tag))
    else:
        if not stack:
            print(f"!! Stray </span> at L{line_no(pos)} pos {pos}")
            continue
        stack.pop()

print(f"\nUnclosed <span> at end: {len(stack)}")
for pos, tag in stack[-10:]:
    snippet = content[max(0,pos-80):pos+150].replace('\n', ' ')
    print(f"  L{line_no(pos)} pos {pos}: {snippet!r}")
