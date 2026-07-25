#!/usr/bin/env python3
"""Reorganiza la sección Cubo/Mediterráneas con la lista curada de Ferney.

Lista del usuario (14 imgs):
  1061, 1067, 1072, 1081, 1275, 1286, 1280, 1011, 988, 1018, 1032, 1027 (principal), 1043, 1049

Plan:
- 1ª card featured: img1027 (hero / principal) - con badge "★ Top"
- 5 cards restantes: 1061, 1067, 1072, 1081, 1275 (las más representativas)
- Galería Cubo: 1286, 1280, 1011, 988, 1018, 1032, 1043, 1049 (8 imgs)
- 2 cards sin data-category (img1093, img1099) → eliminarlas (no estaban en la lista)

Cubrimos 1 + 5 + 8 = 14 ✓
"""
import re

src = r'C:\Workspace\concasaya\modelos.html'
with open(src, 'r', encoding='utf-8') as f:
    t = f.read()

# --- 1) Reemplazar cards featured de Cubo (de 8 cards a 6) ---
# Find start: <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> justo después del "Categor\u00eda 4 de 5" section
cubo_section_start = t.find('id="cubo-mediterraneas"')
cubo_section_end = t.find('</section>', cubo_section_start)
assert cubo_section_start > 0 and cubo_section_end > 0

# The featured grid block we need to replace is the <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
# We can isolate it: first <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> in the section
# is the featured grid. We need to find the second </div> closing the section that contains all <article> tags.
# Simplest: replace everything from the first <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> in this section
# to the matching </div> before </section>.
feat_grid_marker = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">'
feat_grid_start = t.find(feat_grid_marker, cubo_section_start)
# Find the LAST </div> before cubo_section_end (closing the grid)
# The grid contains 8 articles. We need the closing </div> after the last article but before </section>.
# Use search for "</div>\n\n        </div>\n\n      </section>" pattern.
close_pattern = '</div>\n\n        </div>\n\n      </section>'
close_idx = t.find(close_pattern, feat_grid_start)
assert close_idx > 0, "couldn't find closing of featured grid"
feat_grid_end = close_idx + len('</div>')  # the grid-closing </div>

old_feat = t[feat_grid_start:feat_grid_end]

# Build new featured grid: 6 articles
def card(article_id, img, title, subtitle, specs, desc, model, has_top=False, delay=100):
    top_badge = '<span class="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">★ Top</span>' if has_top else ''
    whatsapp_text = f"Hola%2C%20me%20interesa%20la%20casa%20{title.lower().replace(' ', '%20')}."
    return f'''
            <article id="{article_id}" class="group relative overflow-hidden rounded-2xl shadow-xl" data-aos="fade-up" data-aos-delay="{delay}">

              {top_badge}

              <div class="aspect-[4/3] overflow-hidden">

                <img src="assets/images/{img}.webp" alt="Casa cubo/mediterránea CONCASAYA {title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" decoding="async" />

              </div>

              <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">

                <h3 class="text-white text-xl font-bold mb-1">{title}</h3>

                <p class="text-white/80 text-sm mb-3">{subtitle}</p>

                <div class="flex gap-2">

                  <a href="https://wa.me/573142891018?text={whatsapp_text}" target="_blank" rel="noopener" class="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-full font-semibold inline-flex items-center gap-1"><i class="fab fa-whatsapp"></i>Cotizar</a>

                  <button class="open-modal-btn text-xs bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-full font-semibold inline-flex items-center gap-1" data-model="{model}" data-category="cubo" data-variant="todas" data-img="assets/images/{img}.webp" data-specs="{specs}" data-desc="{desc}"><i class="fas fa-images"></i>Ver más</button>

                </div>

              </div>

            </article>
'''

new_feat = f'''<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{card("cubo-principal", "img1027", "Cúbica moderna premium", "Líneas rectas, concreto visto, ventanales", "Estilo: Cubo premium|Pisos: 1-2|Material: Concreto visto|Ventanales: Panorámicos", "Casa cúbica moderna con diseño premium, líneas rectas, concreto visto y ventanales panorámicos. Pieza destacada de nuestra línea contemporánea.", "Casa cúbica moderna premium", has_top=True, delay=100)}
{card("cubo-piscina", "img1061", "Moderna con piscina", "Fachada en piedra, iluminación", "Estilo: Moderno|Plus: Piscina|Fachada: Piedra natural|Iluminación: LED exterior", "Casa moderna con piscina, fachada en piedra natural e iluminación LED exterior. Diseño contemporáneo para disfrutar en familia.", "Casa moderna con piscina", delay=200)}
{card("cubo-blanca", "img1067", "Cúbica blanca 2 pisos", "Minimalista, ventanal al jardín", "Estilo: Cúbico minimalista|Pisos: 2|Color: Blanco|Detalle: Gran ventanal al jardín", "Casa cúbica blanca minimalista de 2 pisos con gran ventanal hacia el jardín. Líneas limpias y diseño contemporáneo.", "Casa cúbica blanca 2 pisos", delay=300)}
{card("cubo-mediterranea", "img1072", "Mediterránea 2 pisos", "Piscina, concreto visto y madera", "Estilo: Mediterráneo|Pisos: 2 + piscina|Material: Concreto + madera|Habitaciones: 3-4", "Casa mediterránea de 2 pisos con piscina, acabados en concreto visto y madera. Diseño contemporáneo para lotes campestres en Cundinamarca y Boyacá.", "Casa mediterránea 2 pisos", delay=100)}
{card("cubo-ladera", "img1081", "Cubo en ladera", "Deck madera, jardín nativo", "Estilo: Cubo en pendiente|Pisos: 2|Deck: Madera|Jardín: Nativo|Ideal para: Lotes con pendiente", "Casa tipo cubo diseñada para terrenos con pendiente, con deck de madera y jardín con plantas nativas. Estilo minimalista y funcional, ideal para paisajes de montaña.", "Casa cubo en ladera", delay=200)}
{card("cubo-concreto", "img1275", "Cúbica concreto visto", "Industrial contemporáneo", "Estilo: Cúbico industrial|Pisos: 2|Material: Concreto visto|Plus: Jardín", "Casa cúbica en concreto visto de 2 pisos con jardín. Estilo industrial contemporáneo con acabados robustos.", "Casa cúbica concreto visto", delay=300)}
          </div>'''

t2 = t[:feat_grid_start] + new_feat + t[feat_grid_end:]
print('featured grid replaced. size delta:', len(t2) - len(t))

# --- 2) Update the Cubo gallery in #galeria section ---
# Find the cubo gallery block: the <div data-category="cubo" ...> or a sequence of gallery-thumbs with data-category="cubo"
# The gallery section has anchors for each category. The Cubo gallery likely starts after "Cubo / Med" eyebrow or similar.
# Find the cubo gallery header.
cubo_gallery_marker = '<i class="fas fa-cube"></i>Casas Cubo y Mediterr'
# or similar. Let's search for the gallery grid for cubo
# Better: find all blocks of consecutive gallery-thumbs with data-category="cubo"
# These are inside a sub-grid under "Galería Completa" section.
# Let's locate by finding the cubo subheading text first
cubo_h2_idx = t2.find('Casas Cubo y Mediterr')
print('cubo gallery header at', cubo_h2_idx)
# After this h2, there's a grid with gallery-thumbs. Let's find the closing of that grid (</div></div></div> for the sub-gallery)
# Just find from cubo_h2_idx to next "data-category=" boundary or section end
sub_start = t2.find('<div class="grid', cubo_h2_idx)
# Find the end of this sub-grid: search for the first </div></div> that closes the sub-section, which is right before the next sub-section h2
# The next sub-section after Cubo in gallery should be "Sistema EPS". Let's find its header.
eps_h2_idx = t2.find('Casas en Sistema EPS', sub_start)
print('eps gallery header at', eps_h2_idx)
# The Cubo sub-gallery ends just before that. Find the closing </div> structure
# Simpler: find the last gallery-thumb for cubo, then find the closing </div></div> of its parent grid.
# Get all thumb indices for cubo
cubo_thumb_starts = [m.start() for m in re.finditer(r'data-category="cubo"', t2)]
print('cubo thumbs count in file:', len(cubo_thumb_starts))
# The 8 thumbs in the gallery (we know there are 6 in featured + 8 in gallery = 14)
# But we replaced the featured ones already. The remaining 8 should be the gallery ones.
# Let's just locate the gallery sub-grid by finding the second occurrence of a "cubo" sub-gallery block pattern.
# Simpler: just rebuild the gallery for cubo by inserting a new sub-section.

# Build new sub-gallery block
def thumb(img, label):
    return f'''              <a href="javascript:void(0);" class="gallery-thumb" data-lightbox="catalog" data-href="assets/images/{img}.webp" role="button" tabindex="0" aria-label="{label}" oncontextmenu="return false" ondragstart="return false" data-category="cubo" data-variant="todas">

                <img src="assets/images/{img}.webp" srcset="assets/images/{img}.webp" sizes="(max-width: 768px) 50vw, 25vw" alt="{label}" loading="lazy" decoding="async" />

                <div class="thumb-label">{label}</div>

              </a>
'''

gallery_thumbs = [
    thumb('img1286', 'Cubo mediterráneo 1286'),
    thumb('img1280', 'Cubo mediterráneo 1280'),
    thumb('img1011', 'Cubo mediterráneo 1011'),
    thumb('img988',  'Cubo mediterráneo 988'),
    thumb('img1018', 'Cubo mediterráneo 1018'),
    thumb('img1032', 'Cubo mediterráneo 1032'),
    thumb('img1043', 'Cubo mediterráneo 1043'),
    thumb('img1049', 'Cubo mediterráneo 1049'),
]

new_cubo_gallery = f'''
          <div class="mb-12">

            <h3 class="text-2xl font-bold text-secondary mb-4 flex items-center gap-2"><i class="fas fa-cube text-primary"></i>Casas Cubo y Mediterráneas</h3>

            <p class="text-sm text-gray-500 mb-4">Casas cúbicas y mediterráneas en concreto visto, con líneas modernas y ventanales panorámicos</p>

            <div class="gallery-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">

{''.join(gallery_thumbs)}
            </div>

          </div>

'''

# Now find the old cubo gallery block and replace it. The old block is between the
# "Casas Cubo y Mediterr" h2 and the next sub-section h2 ("Casas en Sistema EPS" h2).
# But the old structure might differ. Let me just remove from the first <div class="mb-12"> after the cubo h2 to the matching close.
old_start = t2.find('<div class="mb-12', sub_start)
# Find the next <div class="mb-12 after old_start, which would be the start of the next sub-section (EPS)
next_sub_start = t2.find('<div class="mb-12', old_start + 20)
print('old gallery start:', old_start, 'next sub-gallery start:', next_sub_start)

# Replace old with new
t3 = t2[:old_start] + new_cubo_gallery + t2[next_sub_start:]
print('gallery block replaced. size delta:', len(t3) - len(t2))

# --- 3) Update CAT_META to keep "Cubo / Med" name ---
# Already correct: 'Casas Cubo y Mediterráneas'. No change needed.

# Write
with open(src, 'w', encoding='utf-8') as f:
    f.write(t3)
print('Done. Final size:', len(t3))
