#!/usr/bin/env python3
"""Reorganiza Cubo/Mediterráneas con la lista curada del usuario.

Plan:
- Featured: 6 cards (img1027 hero + 5 más)
- Galería: 8 imgs (resto de la lista)
- Limpiar: 2 cards huérfanas sin data-category (img1093, img1099) se eliminan
"""
import re

src = r'C:\Workspace\concasaya\modelos.html'
with open(src, 'r', encoding='utf-8') as f:
    t = f.read()

# === STEP 1: Replace featured grid (8 cards -> 6 cards) ===
# Find the first <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> in the cubo section
cubo_section_start = t.find('id="cubo-mediterraneas"')
feat_grid_marker = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">'
feat_grid_start = t.find(feat_grid_marker, cubo_section_start)
# Find closing: the last </div> just before </section>
# Pattern: "          </div>\n\n        </div>\n\n      </section>"
close_pattern = '</div>\n\n        </div>\n\n      </section>'
close_idx = t.find(close_pattern, feat_grid_start)
feat_grid_end = close_idx + len('</div>')

# Sanity check
old_feat = t[feat_grid_start:feat_grid_end]
print('Old featured grid length:', len(old_feat))
print('First 200 chars:', old_feat[:200].replace('\n', ' '))

# Build new featured grid
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
print('After step 1: size delta =', len(t2) - len(t))

# === STEP 2: Replace Cubo gallery block in #galeria ===
# The old block is between 173247 and 206688
# Recompute these positions in t2 — they shouldn't have shifted since the featured grid is BEFORE the gallery
old_block_start = 173247
old_block_end = 206688

# New block: 8 imgs from user's list (1027 already used as hero, 1061, 1067, 1072, 1081, 1275 already in featured, so use the rest)
# 1061, 1067, 1072, 1081, 1275, 1286, 1280, 1011, 988, 1018, 1032, 1027 (principal), 1043, 1049
# Featured uses: 1027, 1061, 1067, 1072, 1081, 1275 (6)
# Remaining for gallery: 1286, 1280, 1011, 988, 1018, 1032, 1043, 1049 (8)
def gallery_thumb(img, idx):
    return f'''              <a href="javascript:void(0);" class="gallery-thumb group block" data-lightbox="catalog" data-href="catalogo concasaya/medium/{img}.webp" role="button" tabindex="0" aria-label="Ampliar imagen" oncontextmenu="return false" ondragstart="return false" aria-label="Casas Cubo y Mediterráneas CONCASAYA" data-category="cubo" data-variant="todas">

                <img src="catalogo concasaya/thumbs/{img}.webp" alt="Casas Tipo Cubo / Mediterráneas CONCASAYA" loading="lazy" decoding="async" class="w-full h-full object-cover" />

              </a>
'''

gallery_imgs = ['img1286', 'img1280', 'img1011', 'img988', 'img1018', 'img1032', 'img1043', 'img1049']
new_block = f'''<div class="mb-12">

          <div class="flex items-center gap-3 mb-4">

            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">

              <i class="fas fa-cube"></i>

            </div>

            <div>

              <h3 class="text-xl md:text-2xl font-bold text-secondary">Casas Tipo Cubo / Mediterráneas</h3>

              <p class="text-sm text-gray-500">Diseño contemporáneo con líneas rectas y grandes ventanales</p>

            </div>

            <span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">8 fotos</span>

          </div>

          <div class="gallery-grid">

{''.join(gallery_thumb(img, i) for i, img in enumerate(gallery_imgs))}
          </div>

        </div>
'''

t3 = t2[:old_block_start] + new_block + t2[old_block_end:]
print('After step 2: size delta =', len(t3) - len(t2))

# Write
with open(src, 'w', encoding='utf-8') as f:
    f.write(t3)
print('Done. Final size:', len(t3))
