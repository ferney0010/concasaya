# -*- coding: utf-8 -*-
"""Insert a 'Casas Cubo' card into the Plaqueta section (3rd card) using img1061."""
from pathlib import Path

p = Path(r"C:\Workspace\concasaya\modelos.html")
html = p.read_text(encoding="utf-8")

# Find the closing of the Plaqueta grid by anchoring to "5. CASAS DE DOS PISOS"
marker = "5. CASAS DE DOS PISOS"
idx = html.find(marker)
if idx < 0:
    raise SystemExit("marker not found")

# Walk backwards to find </article> that closes Casa en L, then the closing </div> of grid
# We'll insert right before the </div> that closes the grid
# The pattern around line 1880 is:
#   </article>
#   (blank)
#   </div>            <-- grid close
#   (blank)
#   </div>            <-- container close
#   (blank)
#   </section>

# So we find the </section> just before "5. CASAS DE DOS PISOS" and insert before that
sec_close_idx = html.rfind("</section>", 0, idx)
if sec_close_idx < 0:
    raise SystemExit("</section> not found before marker")

# Now find the </div> that is the inner-most grid close before </section>
# Look backwards from sec_close_idx for "</div>\n\n        </div>\n\n      </section>"
# We need the </div> that closes the grid container
# Pattern: "</article>\n\n          </div>\n\n        </div>\n\n      </section>"

article_close = html.rfind("</article>", 0, sec_close_idx)
if article_close < 0:
    raise SystemExit("</article> not found before </section>")

# Insert new card after this </article>
insert_pos = article_close + len("</article>")

cubo_card = '''


            <!-- Casas Cubo (preview) -->

            <article id="cubo-preview" class="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col model-card" data-aos="fade-up" data-aos-delay="400">

              <div class="image-container relative">

                <img src="catalogo concasaya/thumbs/img1061.webp" srcset="catalogo%20concasaya/thumbs/img1061.webp 400w, catalogo%20concasaya/medium/img1061.webp 800w" sizes="(max-width: 768px) 100vw, 50vw" alt="Casa cubo moderna CONCASAYA con l\u00edneas rectas y ventanales panor\u00e1micos" class="w-full h-full" loading="lazy" decoding="async" />

                <div class="image-overlay"></div>

                <div class="absolute top-5 right-5 badge text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide z-10">Estilo contempor\u00e1neo</div>

              </div>

              <div class="content-section p-7 flex flex-col flex-grow">

                <div class="mb-4">

                  <div class="flex items-center justify-between flex-wrap gap-2 mb-2">

                    <h3 class="title text-2xl font-bold">Casas Cubo / Mediterr\u00e1neas</h3>

                    <span class="price-badge"><i class="fas fa-tag"></i>Desde $130M</span>

                  </div>

                  <div class="h-1 w-16 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>

                </div>

                <p class="text-gray-600 mb-4 flex-grow leading-relaxed text-sm">

                  Arquitectura contempor\u00e1nea con l\u00edneas rectas, concreto visto y ventanales panor\u00e1micos. Dise\u00f1o premium para paisajes colombianos modernos en la Sabana de Bogot\u00e1.

                </p>

                <ul class="text-sm text-gray-600 space-y-1 mb-5">

                  <li><i class="fas fa-check text-primary mr-2"></i>Estilo cubo / mediterr\u00e1neo</li>

                  <li><i class="fas fa-check text-primary mr-2"></i>Concreto visto + ventanales</li>

                  <li><i class="fas fa-check text-primary mr-2"></i>1-2 pisos, 3-4 habitaciones</li>

                  <li><i class="fas fa-check text-primary mr-2"></i>\u00c1rea: 120m\u00b2 en adelante</li>

                </ul>

                <div class="flex flex-col sm:flex-row gap-2 mt-auto">

                  <a href="https://wa.me/573142891018?text=Hola%2C%20me%20interesa%20la%20casa%20c%C3%BAbica%20%2F%20mediterr%C3%A1nea%20moderna.%20%C2%BFCu%C3%A1l%20es%20el%20precio%3F" target="_blank" rel="noopener" class="flex-1 text-center bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-semibold transition-all inline-flex items-center justify-center gap-2"><i class="fab fa-whatsapp"></i>Cotizar</a>

                  <button class="open-modal-btn flex-1 bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-xl font-semibold transition-all inline-flex items-center justify-center gap-2" data-model="Casas Cubo y Mediterr\u00e1neas" data-category="cubo" data-variant="todas" data-img="catalogo concasaya/medium/img1061.webp" data-specs="Estilo: Cubo / Mediterr\u00e1neo|Material: Concreto visto|Ventanales: Panor\u00e1micos|Pisos: 1-2|\u00c1rea: 120m\u00b2+|Plus: L\u00edneas rectas, dise\u00f1o premium" data-desc="Casas cubo y mediterr\u00e1neas con dise\u00f1o contempor\u00e1neo, l\u00edneas rectas, concreto visto y ventanales panor\u00e1micos. Arquitectura premium para paisajes colombianos modernos en la Sabana de Bogot\u00e1."><i class="fas fa-images"></i>Ver m\u00e1s</button>

                </div>

              </div>

            </article>'''

new_html = html[:insert_pos] + cubo_card + html[insert_pos:]
p.write_text(new_html, encoding="utf-8")
print(f"OK: inserted Cubo card. File size before={len(html)}, after={len(new_html)}")
print(f"Insert position: byte offset {insert_pos}")
