"""
Insert the complete gallery section into modelos.html before the FAQ section.
Also add CSS for the gallery and a lightbox script.
"""
import os

MODELOS = r'C:\Workspace\concasaya\modelos.html'
GALLERY = r'C:\Workspace\concasaya\scripts\gallery_clean.txt'

# Read gallery items
with open(GALLERY, 'r', encoding='utf-8') as f:
    gallery_items = f.read().strip()

# Read modelos.html
with open(MODELOS, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add gallery section HTML before <section id="faq"
gallery_section = f'''
      <!-- ============================================================
           11.5 GALERÍA COMPLETA DEL CATÁLOGO
           ============================================================ -->
      <section id="galeria" class="py-16 lg:py-20 bg-white section-anchor">
        <div class="container mx-auto px-4 sm:px-6">
          <div class="text-center max-w-3xl mx-auto mb-10" data-aos="fade-up">
            <span class="section-eyebrow mb-3"><i class="fas fa-images"></i> Galería Completa</span>
            <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-4">Más de 168 fotos de nuestros proyectos</h2>
            <p class="text-lg text-gray-600">
              Explora toda nuestra galería de casas prefabricadas, cabañas, casas en plaqueta, de dos pisos, tipo cubo/mediterráneas, sistema EPS y más. Click en cualquier imagen para verla en tamaño completo.
            </p>
            <p class="text-sm text-gray-500 mt-3">
              <i class="fas fa-info-circle mr-1"></i>Las imágenes se cargan progresivamente al hacer scroll. Totalmente responsive y optimizadas.
            </p>
          </div>

          <div class="gallery-grid" id="gallery-grid">
{gallery_items}
          </div>
        </div>
      </section>

'''

# Insert before <section id="faq"
marker = '      <section id="faq"'
if marker in content:
    content = content.replace(marker, gallery_section + marker, 1)
    print("OK: gallery section inserted before FAQ")
else:
    print("ERROR: FAQ section not found")

# 2. Add gallery CSS to the <style> block (just before </style>)
gallery_css = '''
      /* ====== Galería completa ====== */
      .gallery-grid { columns: 2; column-gap: 1rem; }
      @media (min-width: 640px) { .gallery-grid { columns: 3; } }
      @media (min-width: 1024px) { .gallery-grid { columns: 4; } }
      @media (min-width: 1280px) { .gallery-grid { columns: 5; } }
      .gallery-thumb { position: relative; display: block; aspect-ratio: 4/3; overflow: hidden; border-radius: 0.75rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: all 0.3s ease; break-inside: avoid; margin-bottom: 1rem; background: #f3f4f6; }
      .gallery-thumb:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
      .gallery-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
      .gallery-thumb:hover img { transform: scale(1.08); }
      .gallery-thumb::after { content: '\f00e'; font-family: 'Font Awesome 6 Free'; font-weight: 900; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: white; background: rgba(0, 119, 182, 0); font-size: 1.5rem; transition: all 0.3s ease; pointer-events: none; }
      .gallery-thumb:hover::after { background: rgba(0, 119, 182, 0.4); }
      .gallery-thumb-label { position: absolute; bottom: 0; left: 0; right: 0; padding: 0.5rem 0.75rem; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); color: white; font-size: 0.8rem; font-weight: 500; }

      /* ====== Lightbox ====== */
      .lightbox { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.92); display: none; align-items: center; justify-content: center; padding: 1rem; opacity: 0; transition: opacity 0.3s ease; }
      .lightbox.is-open { display: flex; opacity: 1; }
      .lightbox img { max-width: 95vw; max-height: 90vh; object-fit: contain; border-radius: 0.5rem; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
      .lightbox-close { position: absolute; top: 1rem; right: 1rem; width: 3rem; height: 3rem; border-radius: 9999px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.5rem; transition: all 0.2s ease; }
      .lightbox-close:hover { background: rgba(255,255,255,0.3); transform: rotate(90deg); }
      .lightbox-counter { position: absolute; top: 1rem; left: 1rem; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); color: white; padding: 0.5rem 1rem; border-radius: 9999px; font-weight: 600; font-size: 0.875rem; }
      .lightbox-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 3.5rem; height: 3.5rem; border-radius: 9999px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.25rem; transition: all 0.2s ease; }
      .lightbox-nav:hover { background: rgba(255,255,255,0.3); }
      .lightbox-prev { left: 1rem; }
      .lightbox-next { right: 1rem; }
'''

style_marker = '    </style>'
if style_marker in content:
    content = content.replace(style_marker, gallery_css + '\n' + style_marker, 1)
    print("OK: gallery CSS added")
else:
    print("ERROR: </style> not found")

# 3. Add lightbox HTML + script before closing </body>
lightbox_html = '''
    <!-- Lightbox para galería -->
    <div id="lightbox" class="lightbox" role="dialog" aria-modal="true" aria-label="Visor de imagen" aria-hidden="true">
      <button class="lightbox-close" aria-label="Cerrar"><i class="fas fa-times"></i></button>
      <button class="lightbox-nav lightbox-prev" aria-label="Imagen anterior"><i class="fas fa-chevron-left"></i></button>
      <div class="lightbox-counter" id="lightbox-counter">1 / 1</div>
      <img id="lightbox-img" src="" alt="Imagen del catálogo CONCASAYA" />
      <button class="lightbox-nav lightbox-next" aria-label="Imagen siguiente"><i class="fas fa-chevron-right"></i></button>
    </div>

    <script>
      // ====== Lightbox para galería ======
      (function() {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCounter = document.getElementById('lightbox-counter');
        const lightboxClose = lightbox.querySelector('.lightbox-close');
        const lightboxPrev = lightbox.querySelector('.lightbox-prev');
        const lightboxNext = lightbox.querySelector('.lightbox-next');
        const thumbs = Array.from(document.querySelectorAll('[data-lightbox="catalog"]'));
        let currentIndex = 0;

        function openLightbox(idx) {
          currentIndex = idx;
          updateLightbox();
          lightbox.classList.add('is-open');
          lightbox.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
        }
        function closeLightbox() {
          lightbox.classList.remove('is-open');
          lightbox.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
        function updateLightbox() {
          const t = thumbs[currentIndex];
          if (!t) return;
          const href = t.getAttribute('href');
          lightboxImg.src = href;
          lightboxImg.alt = t.getAttribute('aria-label') || 'Imagen';
          lightboxCounter.textContent = (currentIndex + 1) + ' / ' + thumbs.length;
        }
        function prevImage() { currentIndex = (currentIndex - 1 + thumbs.length) % thumbs.length; updateLightbox(); }
        function nextImage() { currentIndex = (currentIndex + 1) % thumbs.length; updateLightbox(); }

        thumbs.forEach((thumb, idx) => {
          thumb.addEventListener('click', (e) => { e.preventDefault(); openLightbox(idx); });
        });
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
        lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
        document.addEventListener('keydown', (e) => {
          if (!lightbox.classList.contains('is-open')) return;
          if (e.key === 'Escape') closeLightbox();
          if (e.key === 'ArrowLeft') prevImage();
          if (e.key === 'ArrowRight') nextImage();
        });
      })();
    </script>
'''

body_marker = '</body>'
if body_marker in content:
    content = content.replace(body_marker, lightbox_html + '\n' + body_marker, 1)
    print("OK: lightbox HTML+script added before </body>")
else:
    print("ERROR: </body> not found")

# Write back
with open(MODELOS, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nDone. modelos.html now has {len(content)} characters.")
