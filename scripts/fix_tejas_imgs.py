#!/usr/bin/env python3
"""Reemplaza los swatches de tejas por imágenes reales (img927, 929, 945, 965, 968, 972)."""
import io, sys

src_path = r'C:\Workspace\concasaya\modelos.html'

with io.open(src_path, 'r', encoding='utf-8') as f:
    html = f.read()

start_marker = '<!-- Tipos de tejas -->'
end_marker = '<!-- Acabados interiores -->'

i = html.find(start_marker)
j = html.find(end_marker, i)
if i < 0 or j < 0:
    print('Markers not found', file=sys.stderr); sys.exit(1)

new_block = '''<!-- Tipos de tejas -->

          <div class="mb-14">

            <h3 class="text-2xl md:text-3xl font-bold text-secondary mb-6 flex items-center gap-3" data-aos="fade-up">

              <i class="fas fa-home text-primary"></i>Tipos de Tejas

            </h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div class="teja-card" data-aos="fade-up" data-aos-delay="100">

                <div class="teja-swatch" style="padding:0;overflow:hidden;">

                  <img src="catalogo concasaya/medium/img927.webp" alt="Teja de barro terracota CONCASAYA" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block;" />

                </div>

                <h4 class="text-xl font-bold text-gray-900 mb-2">Teja de Barro</h4>

                <p class="text-gray-600 text-sm mb-3">La elección tradicional para casas campestres y coloniales. Estética cálida y natural.</p>

                <ul class="text-sm text-gray-700 space-y-1">

                  <li><i class="fas fa-check text-primary mr-2"></i>Estilo tradicional</li>

                  <li><i class="fas fa-check text-primary mr-2"></i>Alta durabilidad</li>

                  <li><i class="fas fa-check text-primary mr-2"></i>Aislamiento natural</li>

                </ul>

              </div>

              <div class="teja-card" data-aos="fade-up" data-aos-delay="200">

                <div class="teja-swatch" style="padding:0;overflow:hidden;">

                  <img src="catalogo concasaya/medium/img929.webp" alt="Teja arquitectónica metálica CONCASAYA" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block;" />

                </div>

                <h4 class="text-xl font-bold text-gray-900 mb-2">Teja Arquitectónica Metálica</h4>

                <p class="text-gray-600 text-sm mb-3">Resistente, ligera y duradera. Disponible en colores terracota, negro y verde militar.</p>

                <ul class="text-sm text-gray-700 space-y-1">

                  <li><i class="fas fa-circle text-orange-700 mr-2 text-xs"></i>Terracota</li>

                  <li><i class="fas fa-circle text-black mr-2 text-xs"></i>Negro</li>

                  <li><i class="fas fa-circle mr-2 text-xs" style="color:#4a5d23;"></i>Verde militar</li>

                </ul>

              </div>

              <div class="teja-card" data-aos="fade-up" data-aos-delay="300">

                <div class="teja-swatch" style="padding:0;overflow:hidden;">

                  <img src="catalogo concasaya/medium/img945.webp" alt="Teja fibrocemento CONCASAYA" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block;" />

                </div>

                <h4 class="text-xl font-bold text-gray-900 mb-2">Teja Fibrocemento</h4>

                <p class="text-gray-600 text-sm mb-3">Pintada de fábrica, libre de asbesto. Excelente relación precio-durabilidad.</p>

                <ul class="text-sm text-gray-700 space-y-1">

                  <li><i class="fas fa-check text-primary mr-2"></i>Libre de asbesto</li>

                  <li><i class="fas fa-check text-primary mr-2"></i>Pintada de fábrica</li>

                  <li><i class="fas fa-check text-primary mr-2"></i>Económica y durable</li>

                </ul>

              </div>

            </div>

          </div>



          '''

# End block ends with the start of the next section.
# We do NOT include "<!-- Acabados interiores -->" in the replacement.
new_html = html[:i] + new_block + html[j:]
with io.open(src_path, 'w', encoding='utf-8') as f:
    f.write(new_html)

print('OK - tejas block replaced. size before/after:', len(html), len(new_html))
