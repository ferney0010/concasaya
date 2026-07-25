# -*- coding: utf-8 -*-
"""Refactor 3 tejas cards to use the same image-container format as the other model cards.
Removes the small .teja-swatch (height 100px) and replaces with a proper image-container div.
"""
from pathlib import Path

p = Path(r"C:\Workspace\concasaya\modelos.html")
html = p.read_text(encoding="utf-8")

# 1) Replace the 3 .teja-swatch divs with proper image-container blocks
# Teja 1: img927
old1 = '''              <div class="teja-card" data-aos="fade-up" data-aos-delay="100">

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

              </div>'''

new1 = '''              <article class="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col model-card" data-aos="fade-up" data-aos-delay="100">

                <div class="image-container relative">

                  <img src="catalogo concasaya/medium/img927.webp" alt="Teja de barro terracota CONCASAYA" class="w-full h-full" loading="lazy" decoding="async" />

                  <div class="image-overlay"></div>

                </div>

                <div class="content-section p-7 flex flex-col flex-grow">

                  <div class="mb-4">

                    <div class="flex items-center justify-between flex-wrap gap-2 mb-2">

                      <h4 class="title text-2xl font-bold">Teja de Barro</h4>

                      <span class="price-badge"><i class="fas fa-tag"></i>Tradicional</span>

                    </div>

                    <div class="h-1 w-16 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>

                  </div>

                  <p class="text-gray-600 mb-4 flex-grow leading-relaxed text-sm">

                    La elección tradicional para casas campestres y coloniales. Estética cálida y natural, fabricada en arcilla cocida.

                  </p>

                  <ul class="text-sm text-gray-600 space-y-1 mb-5">

                    <li><i class="fas fa-check text-primary mr-2"></i>Estilo tradicional cálido</li>

                    <li><i class="fas fa-check text-primary mr-2"></i>Alta durabilidad (50+ años)</li>

                    <li><i class="fas fa-check text-primary mr-2"></i>Aislamiento térmico natural</li>

                    <li><i class="fas fa-check text-primary mr-2"></i>Color terracota natural</li>

                  </ul>

                </div>

              </article>'''

# Teja 2: img929
old2 = '''              <div class="teja-card" data-aos="fade-up" data-aos-delay="200">

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

              </div>'''

new2 = '''              <article class="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col model-card" data-aos="fade-up" data-aos-delay="200">

                <div class="image-container relative">

                  <img src="catalogo concasaya/medium/img929.webp" alt="Teja arquitectónica metálica CONCASAYA" class="w-full h-full" loading="lazy" decoding="async" />

                  <div class="image-overlay"></div>

                </div>

                <div class="content-section p-7 flex flex-col flex-grow">

                  <div class="mb-4">

                    <div class="flex items-center justify-between flex-wrap gap-2 mb-2">

                      <h4 class="title text-2xl font-bold">Teja Arquitectónica Metálica</h4>

                      <span class="price-badge"><i class="fas fa-tag"></i>Moderna</span>

                    </div>

                    <div class="h-1 w-16 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>

                  </div>

                  <p class="text-gray-600 mb-4 flex-grow leading-relaxed text-sm">

                    Resistente, ligera y duradera. Disponible en varios colores para combinar con tu diseño.

                  </p>

                  <ul class="text-sm text-gray-600 space-y-1 mb-5">

                    <li><i class="fas fa-check text-primary mr-2"></i>Resistente y ligera</li>

                    <li><i class="fas fa-check text-primary mr-2"></i>Alta durabilidad</li>

                    <li><i class="fas fa-check text-primary mr-2"></i>Colores: terracota, negro, verde</li>

                    <li><i class="fas fa-check text-primary mr-2"></i>Fácil instalación</li>

                  </ul>

                </div>

              </article>'''

# Teja 3: img945
old3 = '''              <div class="teja-card" data-aos="fade-up" data-aos-delay="300">

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

              </div>'''

new3 = '''              <article class="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col model-card" data-aos="fade-up" data-aos-delay="300">

                <div class="image-container relative">

                  <img src="catalogo concasaya/medium/img945.webp" alt="Teja fibrocemento CONCASAYA" class="w-full h-full" loading="lazy" decoding="async" />

                  <div class="image-overlay"></div>

                </div>

                <div class="content-section p-7 flex flex-col flex-grow">

                  <div class="mb-4">

                    <div class="flex items-center justify-between flex-wrap gap-2 mb-2">

                      <h4 class="title text-2xl font-bold">Teja Fibrocemento</h4>

                      <span class="price-badge"><i class="fas fa-tag"></i>Económica</span>

                    </div>

                    <div class="h-1 w-16 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>

                  </div>

                  <p class="text-gray-600 mb-4 flex-grow leading-relaxed text-sm">

                    Pintada de fábrica, libre de asbesto. Excelente relación precio-durabilidad para cualquier proyecto.

                  </p>

                  <ul class="text-sm text-gray-600 space-y-1 mb-5">

                    <li><i class="fas fa-check text-primary mr-2"></i>Libre de asbesto</li>

                    <li><i class="fas fa-check text-primary mr-2"></i>Pintada de fábrica</li>

                    <li><i class="fas fa-check text-primary mr-2"></i>Económica y durable</li>

                    <li><i class="fas fa-check text-primary mr-2"></i>Variedad de colores</li>

                  </ul>

                </div>

              </article>'''

# Apply replacements
n1 = html.count(old1)
n2 = html.count(old2)
n3 = html.count(old3)

if not n1: raise SystemExit("teja 1 not found")
if not n2: raise SystemExit("teja 2 not found")
if not n3: raise SystemExit("teja 3 not found")

html2 = html.replace(old1, new1, 1).replace(old2, new2, 1).replace(old3, new3, 1)
p.write_text(html2, encoding="utf-8")
print(f"Refactored 3 tejas cards. Size: {len(html)} -> {len(html2)}")
