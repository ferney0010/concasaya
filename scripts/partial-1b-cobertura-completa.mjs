// Reemplaza la sección #seccion-cobertura actual con una sección completa
// de cobertura que incluye los 41 municipios + Bogotá + 5 países, organizados
// por departamento con conteo y links. Datos leídos directamente del filesystem
// para estar siempre actualizados.
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const file = 'pages/casas-prefabricadas-colombia.html';
let html = readFileSync(file, 'utf8');

// 1) Escanear /pages/ para tener la lista real de páginas
const pagesDir = 'pages';
const files = readdirSync(pagesDir).filter(f => f.endsWith('.html') && !f.startsWith('casas-prefabricadas-colombia'));
// Convertir cada filename a {slug, nombre}
const allMunis = files.map(f => {
  const slug = f.replace('.html', '');
  // Convertir slug a nombre bonito
  const nombre = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  // Casos especiales
  const fixes = {
    'chia': 'Chía', 'cajica': 'Cajicá', 'zipaquira': 'Zipaquirá', 'sopo': 'Sopó',
    'cota': 'Cota', 'mosquera': 'Mosquera', 'madrid': 'Madrid', 'tocancipa': 'Tocancipá',
    'funza': 'Funza', 'suba': 'Suba', 'norte-bogota': 'Norte de Bogotá',
    'villadeleyva': 'Villa de Leyva', 'la-vega': 'La Vega', 'la-mesa': 'La Mesa',
    'la-calera': 'La Calera', 'tunja': 'Tunja', 'duitama': 'Duitama', 'paipa': 'Paipa',
    'samaca': 'Samacá', 'boyaca': 'Boyacá', 'sogamoso': 'Sogamoso',
    'chiquinquira': 'Chiquinquirá', 'choconta': 'Chocontá', 'firavitoba': 'Firavitoba',
    'raquira': 'Ráquira', 'valle-de-tenza': 'Valle de Tenza', 'santa-marta': 'Santa Marta',
    'barbosa': 'Barbosa', 'velez': 'Vélez', 'puente-nacional': 'Puente Nacional',
    'san-francisco': 'San Francisco', 'facatativa': 'Facatativá', 'fusagasuga': 'Fusagasugá',
    'soacha': 'Soacha', 'pacho': 'Pacho', 'supata': 'Supatá', 'subachoque': 'Subachoque',
    'mesitas-del-colegio': 'Mesitas del Colegio', 'sesquile': 'Sesquilé', 'guasca': 'Guasca',
    'villeta': 'Villeta',
    'colombianos-en-el-exterior': 'Colombianos en el exterior',
    'colombianos-estados-unidos': 'Estados Unidos',
    'colombianos-espana': 'España',
    'colombianos-canada': 'Canadá',
    'colombianos-mexico': 'México',
  };
  return { slug, nombre: fixes[slug] || nombre };
});

// 2) Asignar departamento
function deptoOf(slug, nombre) {
  if (slug === 'bogota' || slug.startsWith('bogota')) return 'Bogotá D.C.';
  // Bogotá y Sabana
  const bogSab = ['chia','cajica','zipaquira','sopo','cota','suba','norte-bogota','funza','mosquera','madrid','tocancipa'];
  if (bogSab.includes(slug)) return 'Bogotá y Sabana';
  // Cundinamarca resto
  const cundi = ['la-vega','la-calera','la-mesa','guasca','sesquile','soacha','facatativa','fusagasuga','pacho','mesitas-del-colegio','subachoque','supata','villeta'];
  if (cundi.includes(slug)) return 'Cundinamarca';
  // Boyacá
  const boy = ['tunja','villadeleyva','duitama','sogamoso','paipa','samaca','boyaca','chiquinquira','choconta','firavitoba','raquira','valle-de-tenza'];
  if (boy.includes(slug)) return 'Boyacá';
  // Santander
  const san = ['barbosa','velez','puente-nacional','san-francisco'];
  if (san.includes(slug)) return 'Santander';
  // Magdalena
  if (slug === 'santa-marta') return 'Magdalena';
  // Exterior
  if (slug.startsWith('colombianos-')) return 'En el exterior';
  return 'Otros';
}

// 3) Agrupar por departamento
const groups = {};
for (const m of allMunis) {
  const d = deptoOf(m.slug, m.nombre);
  if (!groups[d]) groups[d] = [];
  groups[d].push(m);
}
// Orden interno: alfabético dentro de cada depto
for (const d in groups) {
  groups[d].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

// 4) Orden de los deptos
const ORDER = ['Bogotá y Sabana', 'Cundinamarca', 'Boyacá', 'Santander', 'Magdalena', 'En el exterior'];

// 5) Encontrar la sección #seccion-cobertura actual
const coberturaStart = html.indexOf('id="seccion-cobertura"');
if (coberturaStart < 0) {
  console.error('No encontré id="seccion-cobertura"');
  process.exit(1);
}
// Retroceder hasta el <section que abre
const sectionOpen = html.lastIndexOf('<section', coberturaStart);
// Encontrar el cierre de ese section (buscar el </section> balanceado)
let depth = 1, pos = html.indexOf('>', sectionOpen) + 1;
while (depth > 0 && pos < html.length) {
  const nextOpen = html.indexOf('<section', pos);
  const nextClose = html.indexOf('</section>', pos);
  if (nextClose < 0) { console.error('No encontré cierre'); process.exit(1); }
  if (nextOpen >= 0 && nextOpen < nextClose) { depth++; pos = nextOpen + 8; }
  else { depth--; pos = nextClose + 10; }
}
const sectionEnd = pos;
console.log(`Sección cobertura: ${sectionOpen} a ${sectionEnd} (${sectionEnd - sectionOpen} chars)`);

// 6) Construir el HTML de la nueva sección
const totalColombia = Object.entries(groups).filter(([k]) => k !== 'En el exterior').reduce((s, [, v]) => s + v.length, 0);
const totalExt = (groups['En el exterior'] || []).length;

function iconFor(depto) {
  const m = {
    'Bogotá y Sabana': 'fa-city',
    'Cundinamarca': 'fa-mountain',
    'Boyacá': 'fa-landmark',
    'Santander': 'fa-church',
    'Magdalena': 'fa-umbrella-beach',
    'En el exterior': 'fa-earth-americas',
  };
  return m[depto] || 'fa-map-marker-alt';
}

function colorFor(depto) {
  const m = {
    'Bogotá y Sabana': 'sky',
    'Cundinamarca': 'emerald',
    'Boyacá': 'amber',
    'Santander': 'rose',
    'Magdalena': 'cyan',
    'En el exterior': 'indigo',
  };
  return m[depto] || 'slate';
}

function gridItemsHtml(depto) {
  const items = groups[depto] || [];
  return items.map(m => {
    const href = m.slug === 'bogota' ? '/' : ('/pages/' + m.slug + '.html');
    const isExt = depto === 'En el exterior';
    return `<a href="${href}" class="coverage-city group flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50/50 transition text-sm">
      <i class="fas fa-${isExt ? 'globe-americas' : 'map-pin'} text-primary opacity-60 group-hover:opacity-100 text-xs"></i>
      <span class="text-dark group-hover:text-primary font-medium flex-1">${m.nombre}</span>
      <i class="fas fa-arrow-right text-primary text-xs opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all"></i>
    </a>`;
  }).join('\n          ');
}

const deptoSections = ORDER.filter(d => groups[d] && groups[d].length).map(d => {
  const color = colorFor(d);
  const icon = iconFor(d);
  const items = groups[d];
  return `<div class="coverage-depto-group mb-12" data-coverage-depto="${d}">
    <div class="flex items-center gap-3 mb-5 pb-3 border-b-2 border-${color}-200">
      <div class="w-12 h-12 rounded-xl bg-${color}-100 text-${color}-700 flex items-center justify-center flex-shrink-0">
        <i class="fas ${icon} text-xl"></i>
      </div>
      <div class="flex-1">
        <h3 class="text-xl sm:text-2xl font-bold text-dark">${d}</h3>
        <p class="text-sm text-gray-500">${items.length} ${d === 'En el exterior' ? 'países con cobertura' : 'municipios'}</p>
      </div>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      ${gridItemsHtml(d)}
    </div>
  </div>`;
}).join('\n\n        ');

const newSection = `<section id="seccion-cobertura" class="py-12 sm:py-16 bg-gradient-to-b from-white to-slate-50">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="text-center mb-10" data-aos="fade-up">
          <p class="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest mb-2">Cobertura completa</p>
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-dark mb-4 leading-tight">
            ${totalColombia} municipios en Colombia + ${totalExt} países en el exterior
          </h2>
          <p class="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Operamos con equipo propio en las principales ciudades y municipios de Bogotá, Sabana, Cundinamarca, Boyacá, Santander y Magdalena. Para el resto del país y el exterior, gestionamos tu proyecto con aliados logísticos verificados.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-3 mt-5 text-sm">
            <span class="inline-flex items-center gap-1.5 text-gray-600">
              <i class="fas fa-check-circle text-emerald-500"></i> Equipo propio
            </span>
            <span class="inline-flex items-center gap-1.5 text-gray-600">
              <i class="fas fa-check-circle text-emerald-500"></i> Licencia gestionada
            </span>
            <span class="inline-flex items-center gap-1.5 text-gray-600">
              <i class="fas fa-check-circle text-emerald-500"></i> Cotización en 24h
            </span>
          </div>
        </div>

        ${deptoSections}

        <!-- CTA final de la sección -->
        <div class="mt-12 p-6 sm:p-8 bg-gradient-to-r from-primary to-cyan-700 text-white rounded-2xl text-center">
          <h3 class="text-xl sm:text-2xl font-bold mb-2">¿Tu municipio no aparece en la lista?</h3>
          <p class="text-sm sm:text-base text-white/90 mb-5 max-w-2xl mx-auto">
            Gestionamos proyectos en todo Colombia y para colombianos en el exterior. Cuéntanos tu ubicación y te confirmamos viabilidad y tiempos.
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/573142891018?text=Hola%20CONCASAYA%2C%20necesito%20cotizar%20mi%20casa%20prefabricada.%20Mi%20municipio%20es..." target="_blank" rel="noopener" class="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-bold hover:bg-green-600 transition">
              <i class="fab fa-whatsapp"></i> Preguntar por WhatsApp
            </a>
            <a href="/cotizador-precios-casas-prefabricadas.html" class="inline-flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 rounded-full font-bold hover:bg-slate-100 transition">
              <i class="fas fa-calculator"></i> Ir al cotizador detallado
            </a>
          </div>
        </div>
      </div>
    </section>`;

// 7) Reemplazar la sección
const before = html.substring(0, sectionOpen);
const after = html.substring(sectionEnd);
html = before + newSection + after;
console.log('✓ Sección cobertura reemplazada');

// 8) Inyectar el CSS de las cards de ciudad
const coverageCss = `
<style>
  /* === Coverage cities grid === */
  .coverage-city {
    word-break: break-word;
  }
  .coverage-depto-group h3 {
    line-height: 1.2;
  }
</style>
`;
const bodyClose = '</body>';
const bodyCloseIdx = html.lastIndexOf(bodyClose);
if (bodyCloseIdx < 0) { console.error('No encontré </body>'); process.exit(1); }
// Solo agregar si no existe
if (html.indexOf('=== Coverage cities grid ===') < 0) {
  html = html.substring(0, bodyCloseIdx) + coverageCss + '\n' + html.substring(bodyCloseIdx);
  console.log('✓ CSS de coverage inyectado');
}

writeFileSync(file, html, 'utf8');
console.log('\n✓ Parte 1B lista. Total municipios Colombia: ' + totalColombia + ', países: ' + totalExt);
