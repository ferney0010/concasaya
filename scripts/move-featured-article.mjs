// 1) Elimina el bloque featured-article actual (entre coverage y gallery).
// 2) Inserta featured-article MEJORADO (botones con mejor padding) justo
//    después del cierre del blog preview.
import { readFileSync, writeFileSync } from 'fs';

const file = 'index.html';
let html = readFileSync(file, 'utf8');

// --- Paso 1: eliminar featured-article actual ---
// Lo identifico por su comentario de apertura único.
const startMarker = '<!-- Artículo destacado del blog:';
const startIdx = html.indexOf(startMarker);
if (startIdx < 0) {
  console.error('No encontré el featured-article actual');
  process.exit(1);
}

// Para encontrar el cierre, busco el </section> posterior que cierra el featured-article.
// El featured-article contiene 'Ver todas las guías' justo antes del </section>.
const todasIdx = html.indexOf('Ver todas las guías', startIdx);
const endIdx   = html.indexOf('</section>', todasIdx) + '</section>'.length;

const before = html.substring(0, startIdx);
const after  = html.substring(endIdx);
html = before + after;
console.log(`✓ Featured-article antiguo eliminado (${endIdx - startIdx} chars)`);

// --- Paso 2: insertar featured-article MEJORADO después del blog preview ---
const blogEndMarker = 'Visitar Nuestro Blog';
const blogEndIdx    = html.indexOf('</section>', html.indexOf(blogEndMarker)) + '</section>'.length;
if (blogEndIdx < 0) {
  console.error('No encontré el cierre del blog preview');
  process.exit(1);
}

const featuredBlock = `
      <!-- Artículo destacado del blog: el más pinned (precio-casa-prefabricada-colombia-2026).
           Aparece DESPUÉS del blog preview (después de las 3 guías más recientes)
           como contenido complementario de conversión. -->
      <section id="featured-article" class="py-20 bg-gradient-to-b from-white to-slate-50">
        <div class="container mx-auto px-6">
          <div class="text-center mb-12" data-aos="fade-up">
            <h2 class="text-3xl md:text-4xl font-bold text-dark mb-4">
              Lee esto antes de cotizar tu casa
            </h2>
            <p class="text-lg text-gray-600 max-w-3xl mx-auto">
              La guía más leída del blog. Responde las preguntas que todo el mundo hace antes de tomar una decisión.
            </p>
          </div>

          <article
            class="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 grid grid-cols-1 lg:grid-cols-12"
            data-aos="fade-up"
            itemscope
            itemtype="https://schema.org/Article"
          >
            <meta itemprop="author" content="Equipo CONCASAYA" />
            <meta itemprop="datePublished" content="2026-03-04" />
            <link itemprop="url" href="https://www.concasaya.com/blog/precio-casa-prefabricada-colombia-2026.html" />

            <!-- Imagen -->
            <a
              href="/blog/precio-casa-prefabricada-colombia-2026.html"
              class="lg:col-span-5 block relative overflow-hidden min-w-0"
              aria-label="Leer guía de precios de casas prefabricadas 2026"
            >
              <img
                src="/assets/images/cassa1.webp"
                alt="Casa prefabricada moderna CONCASAYA - referencia de precios 2026"
                class="w-full h-72 lg:h-full object-cover transition duration-500 hover:scale-105"
                loading="lazy"
                decoding="async"
                width="800"
                height="600"
              />
              <span
                class="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-yellow-400 text-gray-900 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-lg"
              >
                <i class="fas fa-star text-[10px]"></i>
                Destacado
              </span>
            </a>

            <!-- Contenido -->
            <div class="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center min-w-0">
              <div class="flex items-center gap-2 mb-4 flex-wrap">
                <span class="inline-block text-xs font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                  Guías
                </span>
                <span class="text-xs text-gray-500">·</span>
                <time datetime="2026-03-04" class="text-xs text-gray-500">
                  4 de marzo de 2026
                </time>
                <span class="text-xs text-gray-500">·</span>
                <span class="text-xs text-gray-500 inline-flex items-center gap-1">
                  <i class="far fa-clock"></i> 8 min de lectura
                </span>
              </div>

              <h3
                class="text-2xl sm:text-3xl font-extrabold text-dark mb-4 leading-tight break-words"
                itemprop="headline"
              >
                <a
                  href="/blog/precio-casa-prefabricada-colombia-2026.html"
                  class="hover:text-primary transition"
                >
                  Cuánto Cuesta una Casa Prefabricada en Colombia 2026: Precios por m²
                </a>
              </h3>

              <p class="text-gray-600 text-base sm:text-lg mb-6 leading-relaxed" itemprop="description">
                Precios actuales de casas prefabricadas en Colombia. EPS desde $1.450.000/m², plaqueta desde $600.000/m². Ejemplos 60m², 80m², 120m². Cotización gratuita con CONCASAYA.
              </p>

              <div class="flex items-center gap-3 mb-6">
                <div
                  class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0"
                  aria-hidden="true"
                >
                  EC
                </div>
                <div>
                  <p class="text-sm font-semibold text-dark" itemprop="author">Equipo CONCASAYA</p>
                  <p class="text-xs text-gray-500">Constructora · 15 años de experiencia</p>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-4">
                <a
                  href="/blog/precio-casa-prefabricada-colombia-2026.html"
                  class="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold text-base hover:opacity-90 transition shadow-lg shadow-primary/25 whitespace-nowrap"
                >
                  Leer la guía completa
                  <i class="fas fa-arrow-right text-sm"></i>
                </a>
                <a
                  href="/blog.html"
                  class="inline-flex items-center justify-center gap-2 bg-slate-50 text-dark border border-gray-200 px-8 py-4 rounded-full font-bold text-base hover:bg-white hover:border-primary hover:text-primary transition whitespace-nowrap"
                >
                  Ver todas las guías
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>
`;

const final = html.substring(0, blogEndIdx) + featuredBlock + html.substring(blogEndIdx);
writeFileSync(file, final, 'utf8');
console.log(`✓ Featured-article insertado después del blog preview (${featuredBlock.length} chars)`);
console.log(`  Blog preview cierra en char ${blogEndIdx}`);
