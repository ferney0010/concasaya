#!/usr/bin/env python3
"""Imprime las 80 líneas que siguen a <!-- Acabados interiores -->"""
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()
idx = t.find('<!-- Acabados interiores -->')
print('idx:', idx)
print(t[idx:idx+4500])
