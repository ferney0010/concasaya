#!/usr/bin/env python3
"""Inserta una galería de tejas (img965, 968, 972) entre Tipos de Tejas y Acabados Interiores."""
with open(r'C:\Workspace\concasaya\modelos.html', 'r', encoding='utf-8') as f:
    t = f.read()

marker = '<!-- Acabados interiores -->'
assert t.count(marker) == 1, f"marker count = {t.count(marker)}"

new_block = '''<!-- Galería de Tejas -->

          <div class="mb-14">

            <h3 class="text-2xl md:text-3xl font-bold text-secondary mb-6 flex items-center gap-3" data-aos="fade-up">

              <i class="fas fa-th-large text-primary"></i>Galería de Tejas

            </h3>

            <p class="text-sm text-gray-500 mb-6" data-aos="fade-up">Detalles de instalación y texturas reales de nuestras cubiertas</p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div class="gallery-tile" data-aos="fade-up" data-aos-delay="100">

                <img src="catalogo concasaya/medium/img965.webp" alt="Detalle de teja de barro instalada en cubierta CONCASAYA" loading="lazy" decoding="async" />

                <div class="tile-label">Teja de barro instalada</div>

              </div>

              <div class="gallery-tile" data-aos="fade-up" data-aos-delay="150">

                <img src="catalogo concasaya/medium/img968.webp" alt="Teja arquitectónica metálica instalada en cubierta CONCASAYA" loading="lazy" decoding="async" />

                <div class="tile-label">Teja arquitectónica instalada</div>

              </div>

              <div class="gallery-tile" data-aos="fade-up" data-aos-delay="200">

                <img src="catalogo concasaya/medium/img972.webp" alt="Detalle constructivo de cubierta con teja CONCASAYA" loading="lazy" decoding="async" />

                <div class="tile-label">Detalle de cubierta</div>

              </div>

            </div>

          </div>



          '''

i = t.find(marker)
new_t = t[:i] + new_block + t[i:]
with open(r'C:\Workspace\concasaya\modelos.html', 'w', encoding='utf-8') as f:
    f.write(new_t)
print('OK - galería tejas añadida. size before/after:', len(t), len(new_t))
