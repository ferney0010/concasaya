// Rediseño del archivo pages/casas-prefabricadas-colombia.html — Parte 1A.
// Cambios:
// 1) Quick-answer box debajo del hero
// 2) Envolver el contenido entre el hero y contact-details en un layout
//    de 2 columnas con sidebar TOC sticky
// 3) Asignar IDs a las secciones existentes para que el TOC funcione
// 4) Insertar el sidebar con TOC (10 items)
// NO TOCA el hero, ni la sección de contacto, ni el footer.
import { readFileSync, writeFileSync } from 'fs';

const file = 'pages/casas-prefabricadas-colombia.html';
let html = readFileSync(file, 'utf8');

// Mapeo de H2 existente → ID + item del TOC
const SECCIONES = [
  { match: 'Regiones donde construimos',  id: 'seccion-cobertura',  toc: 'Cobertura' },
  { match: 'Por qué elegirnos',           id: 'seccion-ventajas',   toc: 'Ventajas' },
  { match: 'Búsquedas que cubre',         id: 'seccion-busquedas',  toc: 'Búsquedas' },
  { match: 'Reseñas',                     id: 'seccion-resenas',    toc: 'Reseñas' },
  { match: 'Galería',                     id: 'seccion-galeria',    toc: 'Galería' },
  { match: 'según ciudad',                id: 'seccion-ciudades',   toc: 'Por ciudad' },
  { match: 'proceso constructivo',        id: 'seccion-proceso',    toc: 'Proceso' },
  { match: 'faq-local',                   id: 'seccion-faq',        toc: 'FAQ' },
];

// 1) Encontrar el cierre del hero. El hero termina con la primera </section>
//    después de "Casas prefabricadas en Colombia"
const heroEndMatch = html.indexOf('</section>', html.indexOf('Casas prefabricadas en Colombia'));
if (heroEndMatch < 0) { console.error('No encontré cierre del hero'); process.exit(1); }
const heroEnd = heroEndMatch + '</section>'.length;
console.log(`Hero cierra en offset ${heroEnd}`);

// 2) Insertar el quick-answer box justo después del hero
const quickAnswer = `
      <!-- Quick answer (AEO): respuesta directa a 'cuánto cuesta una casa prefabricada en Colombia' -->
      <section class="py-10 sm:py-14 bg-gradient-to-b from-amber-50 to-white border-y border-amber-100">
        <div class="container mx-auto px-4 sm:px-6">
          <div class="max-w-4xl mx-auto">
            <div class="flex items-start gap-3 sm:gap-4">
              <div class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-500 text-white flex items-center justify-center">
                <i class="fas fa-bolt text-xl sm:text-2xl"></i>
              </div>
              <div>
                <p class="text-xs sm:text-sm font-bold text-amber-800 uppercase tracking-wider mb-1">Respuesta rápida</p>
                <h2 class="text-xl sm:text-2xl md:text-3xl font-extrabold text-dark mb-3 leading-tight">
                  ¿Cuánto cuesta una casa prefabricada en Colombia?
                </h2>
                <p class="text-base sm:text-lg text-gray-700 leading-relaxed mb-3">
                  En 2026, los rangos reales de CONCASAYA son:
                </p>
                <ul class="text-base sm:text-lg text-gray-700 space-y-1 mb-3">
                  <li><strong>Plaqueta de concreto:</strong> $600.000 a $1.850.000 por m² (obra negra, gris o blanca)</li>
                  <li><strong>Paneles EPS:</strong> $1.450.000 a $1.950.000 por m² (obra gris o blanca)</li>
                </ul>
                <p class="text-sm text-amber-900 bg-amber-100/70 border-l-4 border-amber-500 px-3 py-2 rounded">
                  <i class="fas fa-info-circle mr-1"></i>
                  <strong>Referencia muy preliminar.</strong> El precio real depende de ubicación, acabados,
                  instalaciones, placa, transporte y licencia. Un asesor de CONCASAYA te da el número exacto en menos de 24h.
                </p>
                <div class="mt-4 flex flex-col sm:flex-row gap-3">
                  <a href="/cotizador-precios-casas-prefabricadas.html" class="inline-flex items-center justify-center bg-amber-500 text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-amber-600 transition">
                    <i class="fas fa-calculator mr-2"></i>Calcular mi proyecto exacto
                  </a>
                  <a href="#seccion-cobertura" class="inline-flex items-center justify-center bg-white text-dark border-2 border-gray-200 px-5 py-2.5 rounded-full font-semibold text-sm hover:border-primary hover:text-primary transition">
                    <i class="fas fa-map-marker-alt mr-2"></i>Ver cobertura completa
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
`;
html = html.substring(0, heroEnd) + quickAnswer + html.substring(heroEnd);
console.log('✓ Quick-answer box insertado');

// 3) Encontrar el inicio de "Regiones donde construimos" (primera sección post-hero)
const startMarker = 'Regiones donde construimos';
const startIdx = html.indexOf(startMarker);
if (startIdx < 0) { console.error('No encontré "Regiones donde construimos"'); process.exit(1); }
// Retroceder hasta el '<section' más cercano antes
const sectionStart = html.lastIndexOf('<section', startIdx);
if (sectionStart < 0) { console.error('No encontré <section antes de "Regiones"'); process.exit(1); }
console.log(`Primera sección post-hero empieza en offset ${sectionStart}`);

// 4) Encontrar el inicio de <section id="contact-details" (la última sección antes del footer)
const endIdx = html.indexOf('<section id="contact-details"');
if (endIdx < 0) { console.error('No encontré contact-details'); process.exit(1); }
console.log(`Sección contact-details empieza en offset ${endIdx}`);

// 5) Asignar IDs a las secciones (buscar los H2 dentro del rango)
for (const s of SECCIONES) {
  // Buscar el H2 que contiene el texto (puede tener espacios y clases extra)
  const h2Pattern = new RegExp('<h2[^>]*>[^<]*' + s.match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^<]*</h2>', 'i');
  // Encontrar el section al que pertenece (el <section más reciente antes del H2)
  const h2Idx = html.indexOf(s.match, sectionStart);
  if (h2Idx < 0) {
    console.log(`⚠ Sección no encontrada: ${s.match}`);
    continue;
  }
  // Encontrar el <section que envuelve este H2 (el más reciente antes)
  const sectionOpen = html.lastIndexOf('<section', h2Idx);
  const sectionLineStart = html.lastIndexOf('\n', sectionOpen) + 1;
  // Insertar id="..." después del primer '>' del <section
  const openTagEnd = html.indexOf('>', sectionOpen);
  // (sin check de self-closing; las secciones de este archivo no lo son)
  // Verificar si ya tiene id
  const sectionTag = html.substring(sectionOpen, openTagEnd + 1);
  if (sectionTag.indexOf(' id=') >= 0) {
    // Reemplazar id existente
    const updated = sectionTag.replace(/ id="[^"]*"/, ` id="${s.id}"`);
    html = html.substring(0, sectionOpen) + updated + html.substring(openTagEnd + 1);
  } else {
    // Agregar id antes del >
    const updated = sectionTag.replace('>', ` id="${s.id}">`);
    html = html.substring(0, sectionOpen) + updated + html.substring(openTagEnd + 1);
  }
  console.log(`✓ ${s.toc} → #${s.id}`);
}

// 6) Construir el sidebar (TOC)
const tocItems = SECCIONES.map(s => `
            <a href="#${s.id}" class="article-toc-link" data-toc-target="${s.id}">
              <i class="fas fa-chevron-right text-[8px] opacity-0 transition"></i>
              <span>${s.toc}</span>
            </a>`).join('');

const sidebar = `
      <!-- Layout 2 columnas: sidebar TOC sticky + contenido principal -->
      <div class="article-layout">
        <aside class="article-sidebar" aria-label="Tabla de contenidos">
          <div class="article-sidebar__inner">
            <p class="article-sidebar__title">En esta página</p>
            <nav class="article-toc">
${tocItems}
            </nav>
            <div class="article-sidebar__cta">
              <p class="text-xs text-gray-500 mb-2">¿Tienes listo tu municipio?</p>
              <a href="https://wa.me/573142891018?text=Hola%20CONCASAYA%2C%20quiero%20cotizar%20mi%20casa%20prefabricada%20en%20Colombia." target="_blank" rel="noopener" class="article-sidebar__wa">
                <i class="fab fa-whatsapp"></i> Cotizar por WhatsApp
              </a>
              <a href="/cotizador-precios-casas-prefabricadas.html" class="article-sidebar__calc">
                <i class="fas fa-calculator"></i> Cotizador detallado
              </a>
            </div>
          </div>
        </aside>
        <article class="article-main">
`;

// 7) Construir el cierre del article-main
const articleClose = `
        </article>
      </div>
`;

// 8) Insertar el sidebar al inicio del rango (después de la asignación de IDs)
html = html.substring(0, sectionStart) + sidebar + html.substring(sectionStart, endIdx) + articleClose + html.substring(endIdx);
console.log('✓ Sidebar TOC + article layout insertados');

// 9) Inyectar el CSS del nuevo layout (sidebar, TOC, responsive)
// Lo agregamos al <style> del head o creamos uno nuevo. Para no tocar el <head>, lo inyectamos
// como bloque <style> al final del <body> (antes de </body>).
const layoutCss = `
<style>
  /* === Layout 2 columnas: sidebar + contenido === */
  .article-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
    max-width: 1280px;
    margin: 0 auto;
  }
  @media (min-width: 1024px) {
    .article-layout {
      grid-template-columns: 280px 1fr;
      gap: 2.5rem;
      padding: 0 1.5rem;
    }
  }
  @media (min-width: 1280px) {
    .article-layout {
      grid-template-columns: 300px 1fr;
      gap: 3rem;
    }
  }

  /* === Sidebar TOC sticky === */
  .article-sidebar {
    display: none;
  }
  @media (min-width: 1024px) {
    .article-sidebar {
      display: block;
    }
  }
  .article-sidebar__inner {
    position: sticky;
    top: 90px;
    padding: 1.25rem 0;
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }
  .article-sidebar__title {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #0077b6;
    margin: 0 0 0.85rem;
    padding: 0 0.25rem;
  }
  .article-toc {
    display: flex;
    flex-direction: column;
    gap: 1px;
    border-left: 2px solid #e2e8f0;
  }
  .article-toc-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.85rem;
    margin-left: -2px;
    border-left: 2px solid transparent;
    color: #475569;
    text-decoration: none;
    font-size: 0.875rem;
    line-height: 1.3;
    transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  }
  .article-toc-link i {
    transition: opacity 0.15s ease, transform 0.15s ease;
  }
  .article-toc-link:hover {
    color: #0077b6;
    border-left-color: #0077b6;
    background: #f0f9ff;
  }
  .article-toc-link:hover i {
    opacity: 1;
    transform: translateX(2px);
  }
  .article-toc-link.is-active {
    color: #0077b6;
    font-weight: 700;
    border-left-color: #0077b6;
    background: #e0f2fe;
  }
  .article-toc-link.is-active i {
    opacity: 1;
  }
  .article-sidebar__cta {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }
  .article-sidebar__wa,
  .article-sidebar__calc {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    width: 100%;
    padding: 0.65rem 0.85rem;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 700;
    text-decoration: none;
    margin-top: 0.5rem;
    transition: background 0.15s ease, transform 0.15s ease;
  }
  .article-sidebar__wa {
    background: #25d366;
    color: #fff;
  }
  .article-sidebar__wa:hover {
    background: #1ebe5d;
    transform: translateY(-1px);
  }
  .article-sidebar__calc {
    background: #fff;
    color: #0077b6;
    border: 1.5px solid #e2e8f0;
  }
  .article-sidebar__calc:hover {
    background: #eff6ff;
    border-color: #0077b6;
  }

  /* === Main article === */
  .article-main {
    min-width: 0;
  }
  .article-main section {
    scroll-margin-top: 90px;
  }
  .article-main h2 {
    scroll-margin-top: 90px;
  }

  /* === Mobile: TOC visible como bloque horizontal scrollable arriba de cada sección === */
  @media (max-width: 1023px) {
    .article-layout {
      padding: 0;
    }
  }
</style>
`;

const bodyClose = '</body>';
const bodyCloseIdx = html.lastIndexOf(bodyClose);
if (bodyCloseIdx < 0) {
  console.error('No encontré </body>');
  process.exit(1);
}
html = html.substring(0, bodyCloseIdx) + layoutCss + '\n' + html.substring(bodyCloseIdx);
console.log('✓ CSS del layout inyectado');

// 10) Inyectar el JS del TOC activo (IntersectionObserver para resaltar el item actual)
const tocJs = `
<script>
(function() {
  if (!('IntersectionObserver' in window)) return;
  var links = document.querySelectorAll('.article-toc-link[data-toc-target]');
  if (!links.length) return;
  var byId = {};
  links.forEach(function(l) {
    var id = l.getAttribute('data-toc-target');
    var el = document.getElementById(id);
    if (el) byId[id] = { link: l, el: el };
  });
  var ids = Object.keys(byId);
  if (!ids.length) return;
  var visible = {};
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(en) {
      visible[en.target.id] = en.intersectionRatio;
    });
    // Encontrar el item visible más arriba
    var activeId = null;
    var firstVisible = null;
    for (var i = 0; i < ids.length; i++) {
      if (visible[ids[i]] > 0) {
        if (!firstVisible) firstVisible = ids[i];
      }
    }
    activeId = firstVisible;
    links.forEach(function(l) { l.classList.remove('is-active'); });
    if (activeId && byId[activeId]) byId[activeId].link.classList.add('is-active');
  }, { rootMargin: '-90px 0px -60% 0px', threshold: [0, 0.1, 0.5, 1] });
  ids.forEach(function(id) { io.observe(byId[id].el); });
})();
</script>
`;
html = html.substring(0, bodyCloseIdx) + tocJs + html.substring(bodyCloseIdx);
console.log('✓ JS del TOC activo inyectado');

writeFileSync(file, html, 'utf8');
console.log('\n✓ Parte 1A lista.');
