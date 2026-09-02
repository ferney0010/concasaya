// Potencia blog/precio-casa-prefabricada-colombia-2026.html con:
// - Layout de 2 columnas (main + sidebar sticky)
// - TOC con scroll spy
// - Sidebar con sugerencias del cluster
// - IDs en los h2 para anchor links
// - Botón flotante ya existe, no se duplica
// NO modifica: meta tags, og:image, imágenes, contenido del cuerpo.
// Idempotente.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = "C:/Workspace/concasaya";
const rel = "blog/precio-casa-prefabricada-colombia-2026.html";
const path = join(repoRoot, rel);
let src = readFileSync(path, "utf8");
const before = src;
const changes = [];

// 1) Reemplazar el container principal por article-layout de 2 columnas.
//    El original: <div class="container mx-auto px-6 max-w-4xl">
//    Reemplazamos por: apertura del grid + article-main wrapper (sin cerrar)
const oldContainer = '<div class="container mx-auto px-6 max-w-4xl">';
const newContainer = '<div class="article-layout"><div class="article-main">';
if (src.includes(oldContainer) && !src.includes(newContainer)) {
  src = src.replace(oldContainer, newContainer);
  changes.push("container → article-layout");
}

// 2) Cerrar article + article-main, e insertar aside con TOC + sugerencias + CTA.
//    El original cierra: </div>\n      </article>\n    </main>
//    (el </div> cierra el container, </article> cierra el article, </main> cierra el main exterior)
//    Reemplazamos por: cierre del article, cierre de article-main, ASIDE con sidebar, cierre de article-layout, y dejamos que </main> exterior siga cerrando después.
const oldClose = `        </div>
      </article>
    </main>`;
const sidebarHTML = `
          </div>
        </article>
        </div>
        <aside class="article-sidebar" aria-label="Índice y artículos relacionados">
          <div class="article-sidebar__inner">
            <nav class="sidebar-block" aria-label="Tabla de contenidos">
              <h3 class="sidebar-block__title"><i class="fas fa-list"></i> En este artículo</h3>
              <ol class="toc-list" id="toc-list">
                <li><a href="#precios-m2">Precios por m² en Colombia 2026</a></li>
                <li><a href="#ejemplos-area">Ejemplos por área (60/80/120 m²)</a></li>
                <li><a href="#factores-precio">Factores que afectan el precio final</a></li>
                <li><a href="#proyectos-galeria">Proyectos CONCASAYA: inspírate</a></li>
                <li><a href="#mas-lecturas">Más lecturas en el blog</a></li>
              </ol>
            </nav>
            <nav class="sidebar-block" aria-label="Artículos relacionados">
              <h3 class="sidebar-block__title"><i class="fas fa-book-open"></i> Te puede interesar</h3>
              <ul class="related-list">
                <li>
                  <a href="/blog/casas-prefabricadas-economicas-colombia.html">
                    <span class="related-icon"><i class="fas fa-dollar-sign"></i></span>
                    <span class="related-text">
                      <strong>Casas prefabricadas económicas</strong>
                      <span>Rangos honestos desde $25M</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href="/blog/casas-prefabricadas-llave-en-mano-colombia.html">
                    <span class="related-icon"><i class="fas fa-key"></i></span>
                    <span class="related-text">
                      <strong>Llave en mano: qué incluye</strong>
                      <span>La diferencia entre kit y entrega habitable</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href="/blog/casas-modulares-colombia.html">
                    <span class="related-icon"><i class="fas fa-cube"></i></span>
                    <span class="related-text">
                      <strong>Casas modulares en Colombia</strong>
                      <span>Precios por m² y qué incluye</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href="/blog/casa-prefabricada-para-finca-colombia.html">
                    <span class="related-icon"><i class="fas fa-tractor"></i></span>
                    <span class="related-text">
                      <strong>Casa para finca: 5 cosas clave</strong>
                      <span>Precios y logística rural</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href="/cotizador-precios-casas-prefabricadas.html">
                    <span class="related-icon"><i class="fas fa-calculator"></i></span>
                    <span class="related-text">
                      <strong>Cotizador de precios en línea</strong>
                      <span>Estimado en 5 minutos</span>
                    </span>
                  </a>
                </li>
              </ul>
            </nav>
            <div class="sidebar-cta">
              <h3>¿Listo para cotizar tu casa?</h3>
              <p>Usá el cotizador en línea o escribinos por WhatsApp con la zona y los metros que necesitás.</p>
              <a href="/cotizador-precios-casas-prefabricadas.html"><i class="fas fa-calculator"></i> Cotizar ahora</a>
            </div>
          </div>
        </aside>
      </div>
    </main>`;
if (src.includes(oldClose) && !src.includes('id="toc-list"')) {
  src = src.replace(oldClose, sidebarHTML);
  changes.push("cierre article + aside con sidebar");
}

// 3) Agregar IDs a los 5 h2 principales.
//    El H2 "Convierte estos precios..." está dentro de un callout, NO lo incluimos.
const idReplacements = [
  ['<h2>Precios por Metro Cuadrado en Colombia 2026</h2>', '<h2 id="precios-m2">Precios por Metro Cuadrado en Colombia 2026</h2>'],
  ['<h2>Ejemplos de Precio Total por Área (Bogotá, obra gris)</h2>', '<h2 id="ejemplos-area">Ejemplos de Precio Total por Área (Bogotá, obra gris)</h2>'],
  ['<h2>Factores que Afectan el Precio Final</h2>', '<h2 id="factores-precio">Factores que Afectan el Precio Final</h2>'],
  ['<h2>Proyectos CONCASAYA: Inspírate con Nuestra Galería</h2>', '<h2 id="proyectos-galeria">Proyectos CONCASAYA: Inspírate con Nuestra Galería</h2>'],
  ['<h2>Más Lecturas en el Blog</h2>', '<h2 id="mas-lecturas">Más Lecturas en el Blog</h2>'],
];
for (const [old, neu] of idReplacements) {
  if (src.includes(old) && !src.includes(neu)) {
    src = src.replace(old, neu);
    changes.push(`id → ${neu.match(/id="([^"]+)"/)[1]}`);
  }
}

// 4) Insertar el CSS del layout + sidebar + TOC al final del bloque <style>.
//    Lo agregamos justo antes del último </style>.
const cssNuevo = `
      /* Layout de 2 columnas: contenido + sidebar */
      .article-layout {
        display: grid; grid-template-columns: 1fr; gap: 2.5rem;
        max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem;
      }
      @media (min-width: 1024px) {
        .article-layout { grid-template-columns: minmax(0, 1fr) 300px; }
      }
      .article-main { min-width: 0; }
      .article-sidebar { position: relative; }
      @media (min-width: 1024px) {
        .article-sidebar__inner {
          position: sticky; top: 100px;
          max-height: calc(100vh - 120px); overflow-y: auto;
          padding-right: 0.25rem;
        }
        .article-sidebar__inner::-webkit-scrollbar { width: 6px; }
        .article-sidebar__inner::-webkit-scrollbar-track { background: transparent; }
        .article-sidebar__inner::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
        .article-sidebar__inner::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      }
      @media (max-width: 1023px) {
        .article-sidebar { order: -1; }
        .article-sidebar__inner { position: static !important; max-height: none !important; }
      }
      .sidebar-block {
        background: #fff; border: 1px solid #e2e8f0; border-radius: 18px;
        padding: 1.35rem 1.5rem; margin-bottom: 1.25rem;
        box-shadow: 0 8px 28px rgba(15, 23, 42, 0.05);
      }
      .sidebar-block__title {
        font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px;
        color: #0077b6; margin: 0 0 1rem 0; padding-bottom: 0.65rem;
        border-bottom: 2px solid #e0f2fe;
        display: flex; align-items: center; gap: 0.5rem;
      }
      .toc-list { list-style: none; padding: 0; margin: 0; counter-reset: tocitem; }
      .toc-list li { counter-increment: tocitem; margin-bottom: 0.45rem; }
      .toc-list a {
        display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.5rem 0.6rem;
        color: #475569; font-size: 0.92rem; line-height: 1.4; border-radius: 10px;
        text-decoration: none; transition: all 0.18s ease; border-left: 3px solid transparent;
      }
      .toc-list a::before {
        content: counter(tocitem, decimal); flex-shrink: 0; min-width: 1.5rem; height: 1.5rem;
        background: #f1f5f9; color: #64748b; font-size: 0.78rem; font-weight: 700;
        border-radius: 6px; display: grid; place-items: center;
      }
      .toc-list a:hover { background: #f0f9ff; color: #0077b6; border-left-color: #0077b6; }
      .toc-list a.is-active { background: #e0f2fe; color: #0369a1; font-weight: 700; border-left-color: #0077b6; }
      .toc-list a.is-active::before { background: #0077b6; color: #fff; }
      .related-list { list-style: none; padding: 0; margin: 0; }
      .related-list li { margin-bottom: 0.75rem; }
      .related-list a {
        display: flex; gap: 0.7rem; align-items: flex-start; padding: 0.6rem 0.7rem;
        color: #1e293b; font-size: 0.92rem; line-height: 1.4; text-decoration: none;
        border-radius: 10px; background: #f8fafc; border: 1px solid #f1f5f9;
        transition: all 0.18s ease;
      }
      .related-list a:hover { background: #f0f9ff; border-color: #bae6fd; color: #0369a1; }
      .related-list .related-icon {
        flex-shrink: 0; width: 1.85rem; height: 1.85rem; border-radius: 8px;
        background: #0077b6; color: #fff; display: grid; place-items: center; font-size: 0.8rem;
      }
      .related-list .related-text strong { display: block; color: #0f172a; font-weight: 700; font-size: 0.92rem; margin-bottom: 0.15rem; }
      .related-list .related-text span { color: #64748b; font-size: 0.8rem; }
      .sidebar-cta {
        background: linear-gradient(135deg, #0077b6 0%, #023e7d 100%);
        color: #fff; border-radius: 18px; padding: 1.5rem 1.5rem;
        box-shadow: 0 12px 32px rgba(0, 119, 182, 0.22);
        text-align: center;
      }
      .sidebar-cta h3 { color: #fff; font-size: 1.1rem; font-weight: 800; margin: 0 0 0.5rem 0; }
      .sidebar-cta p { color: rgba(255,255,255,0.88); font-size: 0.88rem; line-height: 1.45; margin: 0 0 1.1rem 0; }
      .sidebar-cta a {
        display: inline-flex; align-items: center; gap: 0.5rem;
        background: #ffd166; color: #0a2540; font-weight: 800;
        padding: 0.75rem 1.25rem; border-radius: 999px; text-decoration: none;
        font-size: 0.92rem; transition: transform 0.18s ease;
      }
      .sidebar-cta a:hover { transform: translateY(-2px); }
`;
const lastStyleClose = src.lastIndexOf("</style>");
if (lastStyleClose !== -1 && !src.includes("grid-template-columns: minmax(0, 1fr) 300px")) {
  src = src.slice(0, lastStyleClose) + cssNuevo + src.slice(lastStyleClose);
  changes.push("CSS del layout + sidebar + TOC");
}

// 5) Insertar el JS de scroll spy antes de la primera referencia a whatsapp-modal.js
//    (que está en línea ~981). El script va en su propio bloque <script>.
const scrollSpyJS = `
    <script>
      (function () {
        const tocLinks = document.querySelectorAll('#toc-list a[href^="#"]');
        if (!tocLinks.length) return;
        const sections = Array.from(tocLinks)
          .map(link => {
            const id = link.getAttribute('href').slice(1);
            return { id, link, target: document.getElementById(id) };
          })
          .filter(item => item.target);
        if (!sections.length) return;
        const setActive = (activeId) => {
          tocLinks.forEach(l => l.classList.remove('is-active'));
          if (activeId) {
            const found = sections.find(s => s.id === activeId);
            if (found) found.link.classList.add('is-active');
          }
        };
        const observer = new IntersectionObserver(
          (entries) => {
            const visible = entries
              .filter(e => e.isIntersecting)
              .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
            if (visible.length > 0) setActive(visible[0].target.id);
          },
          { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
        );
        sections.forEach(s => observer.observe(s.target));
        tocLinks.forEach(link => {
          link.addEventListener('click', (e) => {
            const target = document.getElementById(link.getAttribute('href').slice(1));
            if (target) {
              e.preventDefault();
              const offset = 100;
              const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
              window.scrollTo({ top, behavior: 'smooth' });
              setActive(link.getAttribute('href').slice(1));
            }
          });
        });
      })();
    </script>
`;
if (!src.includes("'#toc-list a[href^=\"#\"]'")) {
  const idx = src.indexOf('<script src="/assets/js/whatsapp-modal.js"></script>');
  if (idx !== -1) {
    src = src.slice(0, idx) + scrollSpyJS + "\n    " + src.slice(idx);
    changes.push("JS scroll spy");
  }
}

if (src !== before) {
  writeFileSync(path, src, "utf8");
  console.log(`✓ ${rel} actualizado. Cambios:`);
  for (const c of changes) console.log(`  - ${c}`);
} else {
  console.log(`· ${rel} sin cambios (idempotente o ya aplicado).`);
}
