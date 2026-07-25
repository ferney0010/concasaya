#!/usr/bin/env python3
"""Intenta parsear el HTML con html.parser y reporta errores."""
from html.parser import HTMLParser

class V(HTMLParser):
    def __init__(self):
        super().__init__()
        self.errors = []
        self.stack = []
        self.void = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
    def handle_starttag(self, tag, attrs):
        if tag in self.void: return
        self.stack.append((tag, self.getpos()))
    def handle_endtag(self, tag):
        if not self.stack:
            self.errors.append(f'extra </{tag}> at {self.getpos()}')
            return
        top_tag, top_pos = self.stack[-1]
        if top_tag == tag:
            self.stack.pop()
        else:
            self.errors.append(f'mismatch: expected </{top_tag}> from {top_pos} but got </{tag}> at {self.getpos()}')
            # try to recover: pop until match
            while self.stack and self.stack[-1][0] != tag:
                self.stack.pop()
            if self.stack: self.stack.pop()

with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()
v = V()
v.feed(t)
print('errors:', len(v.errors))
for e in v.errors[:15]:
    print('  ', e)
print('unclosed stack:', [(tag, pos) for tag, pos in v.stack])
