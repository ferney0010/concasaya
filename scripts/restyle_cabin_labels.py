#!/usr/bin/env python3
"""Replace the 3 cabin label CSS rules in modelos.html with subtler, hover-revealed styles."""
from pathlib import Path

FILE = Path(r"C:\Workspace\concasaya\modelos.html")
content = FILE.read_text(encoding="utf-8")

old = """      .cabin-hero-badge { position: absolute; top: 0.75rem; left: 0.75rem; background: rgba(245, 158, 11, 0.95); color: #ffffff; font-size: 0.7rem; font-weight: 700; padding: 0.3rem 0.65rem; border-radius: 9999px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); z-index: 2; letter-spacing: 0.5px; }

      .cabin-thumb-label { position: absolute; bottom: 0.5rem; left: 0.5rem; background: rgba(0,0,0,0.65); color: #ffffff; font-size: 0.7rem; font-weight: 600; padding: 0.25rem 0.55rem; border-radius: 0.375rem; display: inline-flex; align-items: center; gap: 0.3rem; backdrop-filter: blur(4px); pointer-events: none; }
      .cabin-thumb-label i { font-size: 0.65rem; }
      .cabin-thumb-label-dark { background: rgba(245, 158, 11, 0.95); color: #ffffff; font-size: 0.8rem; padding: 0.4rem 0.75rem; }"""

new = """      /* Labels discretos: ocultos por defecto en el thumb para no tapar la imagen.
         Aparecen en hover (desktop). En touch/mobile permanecen sutiles. */
      .cabin-hero-badge {
        position: absolute; top: 0.6rem; left: 0.6rem;
        background: rgba(245, 158, 11, 0.92);
        color: #ffffff; font-size: 0.62rem; font-weight: 700;
        padding: 0.18rem 0.5rem; border-radius: 9999px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.18); z-index: 2;
        letter-spacing: 0.4px; line-height: 1.2;
        display: inline-flex; align-items: center; gap: 0.25rem;
      }
      .cabin-thumb-label {
        position: absolute; bottom: 0.45rem; left: 0.45rem;
        background: rgba(0,0,0,0.45);
        color: #ffffff; font-size: 0.66rem; font-weight: 500;
        padding: 0.18rem 0.5rem; border-radius: 0.3rem;
        display: inline-flex; align-items: center; gap: 0.28rem;
        backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
        pointer-events: none; opacity: 0; transform: translateY(4px);
        transition: opacity 0.25s ease, transform 0.25s ease;
      }
      .gallery-thumb:hover .cabin-thumb-label,
      .gallery-thumb:focus-visible .cabin-thumb-label { opacity: 1; transform: translateY(0); }
      @media (hover: none) {
        .cabin-thumb-label { opacity: 0.85; transform: none; }
      }
      .cabin-thumb-label i { font-size: 0.6rem; }
      .cabin-thumb-label-dark {
        background: rgba(245, 158, 11, 0.85);
        color: #ffffff; font-size: 0.7rem;
        padding: 0.22rem 0.55rem;
      }"""

if old in content:
    content = content.replace(old, new)
    FILE.write_text(content, encoding="utf-8")
    print("OK: cabin labels restyled")
else:
    print("!! old block not found exactly")
