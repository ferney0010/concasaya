"""
Regenerate the gallery section in modelos.html with categorized sub-sections.
"""
import os
import sys
import re

sys.path.insert(0, r'C:\Workspace\concasaya\scripts')
from regenerate_gallery import (
    CABANAS, PLAQUETA_1P, DOS_PISOS, CUBO_MEDITERRANEAS,
    SISTEMA_EPS, ACABADOS, PROCESO, EXCLUDED
)

MODELOS = r'C:\Workspace\concasaya\modelos.html'
THUMBS = 'catalogo concasaya/thumbs'
MEDIUM = 'catalogo concasaya/medium'

def category_html(images, title, subtitle, icon):
    if not images:
        return ""
    items = []
    for name in images:
        # Skip duplicates within this category
        items.append(f'          <a href="{MEDIUM}/{name}.webp" class="gallery-thumb group block" data-lightbox="catalog" aria-label="Imagen del catálogo CONCASAYA">')
        items.append(f'            <img src="{THUMBS}/{name}.webp" alt="{title} CONCASAYA" loading="lazy" decoding="async" class="w-full h-full object-cover" />')
        items.append(f'          </a>')
    return f'''        <div class="mb-12">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">
              <i class="fas {icon}"></i>
            </div>
            <div>
              <h3 class="text-xl md:text-2xl font-bold text-secondary">{title}</h3>
              <p class="text-sm text-gray-500">{subtitle}</p>
            </div>
            <span class="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">{len(set(images))} fotos</span>
          </div>
          <div class="gallery-grid">
{chr(10).join(items)}
          </div>
        </div>'''

# Generate category sections
sections = []
sections.append(category_html(
    CABANAS,
    'Cabañas Prefabricadas',
    'Incluye cabaña 28m² con altillo, cabañas de vidrio y tiny houses',
    'fa-campground'
))
sections.append(category_html(
    PLAQUETA_1P,
    'Casas en Plaqueta de Concreto',
    'Casas tradicionales de 1 piso, en proceso y terminadas, con techo de teja de barro',
    'fa-home'
))
sections.append(category_html(
    DOS_PISOS,
    'Casas Prefabricadas de Dos Pisos',
    'Casas familiares de 2 pisos, en construcción y terminadas',
    'fa-house'
))
sections.append(category_html(
    CUBO_MEDITERRANEAS,
    'Casas Tipo Cubo / Mediterráneas',
    'Diseño contemporáneo con líneas rectas y grandes ventanales',
    'fa-cube'
))
sections.append(category_html(
    SISTEMA_EPS,
    'Casas en Sistema EPS',
    'Sistema constructivo en poliestireno expandido con aislamiento superior',
    'fa-leaf'
))
sections.append(category_html(
    ACABADOS,
    'Materiales y Acabados Interiores',
    'Cocinas, salas, baños y detalles de terminados',
    'fa-palette'
))
sections.append(category_html(
    PROCESO,
    'Proceso Constructivo',
    'Placa de cimentación, redes integradas y más',
    'fa-hard-hat'
))

full_html = '\n'.join(sections)

# Build the new gallery section
new_section = f'''      <!-- ============================================================
           11.5 GALERÍA COMPLETA DEL CATÁLOGO (por categoría)
           ============================================================ -->
      <section id="galeria" class="py-16 lg:py-20 bg-white section-anchor">
        <div class="container mx-auto px-4 sm:px-6">
          <div class="text-center max-w-3xl mx-auto mb-10" data-aos="fade-up">
            <span class="section-eyebrow mb-3"><i class="fas fa-images"></i> Galería Completa</span>
            <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-4">Más de 160 fotos de nuestros proyectos</h2>
            <p class="text-lg text-gray-600">
              Explora toda nuestra galería organizada por categoría: cabañas, casas en plaqueta, dos pisos, cubo/mediterráneas, sistema EPS, acabados y proceso constructivo. Click en cualquier imagen para verla en tamaño completo.
            </p>
            <p class="text-sm text-gray-500 mt-3">
              <i class="fas fa-info-circle mr-1"></i>Las imágenes se cargan progresivamente al hacer scroll.
            </p>
          </div>

{full_html}
        </div>
      </section>

'''

# Read modelos.html
with open(MODELOS, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the old gallery section and replace it
# The old section starts with "<!-- 11.5 GALERÍA COMPLETA" and ends before "<!-- 10. FAQ"
old_pattern = re.compile(
    r'      <!-- ={5,}\s*\n\s*11\.5 GALERÍA COMPLETA DEL CATÁLOGO.*?</section>\n\n',
    re.DOTALL
)

m = old_pattern.search(content)
if m:
    print(f"Found old gallery section: {len(m.group(0))} chars")
    content = content[:m.start()] + new_section + content[m.end():]
    print("OK: old gallery replaced with categorized version")
else:
    print("WARN: old gallery pattern not found, trying alternative")
    # Try a simpler pattern
    start_marker = '      <!-- ============================================================\n           11.5 GALERÍA COMPLETA'
    end_marker = '</section>\n\n      <!-- ============================================================\n           10. FAQ'
    s = content.find(start_marker)
    e = content.find(end_marker)
    if s >= 0 and e >= 0:
        content = content[:s] + new_section + content[e + len('</section>\n\n'):]
        print("OK: used simple find/replace")
    else:
        print("ERROR: could not locate gallery section")
        sys.exit(1)

with open(MODELOS, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nDone. modelos.html now has {len(content)} characters.")
