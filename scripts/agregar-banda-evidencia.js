/**
 * Inserta la banda de evidencia "Modelos reales, proyectos reales" en el
 * footer de todas las paginas del sitio.
 *
 * El footer esta replicado (inline) en 89 archivos y su markup interno varia
 * entre versiones, asi que la insercion se hace justo despues de la etiqueta
 * de apertura <footer ...>, que si es identica en todos. El bloque lleva
 * z-10 para quedar por encima de la decoracion de fondo del footer.
 *
 * Es idempotente: si el bloque ya esta, no lo duplica.
 *
 * Antes de tocar nada valida que todas las clases CSS del bloque existan en
 * assets/css/tailwind.css (si falta una, aborta: no se compila Tailwind aqui).
 *
 * Uso: node scripts/agregar-banda-evidencia.js [--dry]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRY = process.argv.includes('--dry');
const CSS = path.join(ROOT, 'assets', 'css', 'tailwind.css');

const MARCA = '<!-- BANDA EVIDENCIA: modelos reales, proyectos reales -->';

const CLASES = [
  'relative', 'z-10', 'border-b', 'border-gray-700/50', 'pb-10', 'mb-10',
  'container', 'mx-auto', 'px-6',
  'grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-6', 'items-center',
  'grid-cols-2', 'lg:grid-cols-3', 'gap-2', 'text-xs', 'uppercase', 'tracking-wider',  'text-cyan-400', 'font-bold', 'mb-2', 'text-xl', 'text-white',
  'text-sm', 'text-gray-300', 'leading-relaxed', 'space-y-2', 'flex',
  'items-center', 'mr-2', 'mt-4', 'inline-flex', 'gap-2', 'transition-colors',
  'rounded-lg', 'w-full', 'h-36', 'object-cover', 'overflow-hidden'
];

// Como Tailwind escapa los caracteres especiales en el selector.
function selectorDe(clase) {
  const esc = clase.replace(/([:/.[\]()%#,])/g, '\\$1');
  return '.' + esc;
}

const css = fs.readFileSync(CSS, 'utf8');
const faltantes = CLASES.filter((c) => !css.includes(selectorDe(c)));
if (faltantes.length) {
  console.error('Clases que NO existen en tailwind.css (aborto):');
  faltantes.forEach((c) => console.error('  - ' + c));
  process.exit(1);
}
console.log(`Clases CSS validadas: ${CLASES.length}/${CLASES.length}`);

const BLOQUE = `${MARCA}
      <div class="container mx-auto px-6 relative z-10 border-b border-gray-700/50 pb-10 mb-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

          <div>
            <p class="text-xs uppercase tracking-wider text-cyan-400 font-bold mb-2">Material real</p>
            <h3 class="text-xl font-bold text-white mb-2">Modelos reales, proyectos reales</h3>
            <p class="text-sm text-gray-300 leading-relaxed">
              Las fotografías de este sitio son de obras terminadas y entregadas a clientes en Boyacá,
              Cundinamarca y Bogotá. No son renders ni imágenes generadas por IA.
            </p>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-3 gap-2">
            <img src="/assets/images/footer-evidencia-1.webp" alt="Casa real de dos pisos con zócalo de piedra, entregada en Villa de Leyva" class="w-full h-36 object-cover rounded-lg overflow-hidden" loading="lazy" decoding="async" width="360" height="240" />
            <img src="/assets/images/footer-evidencia-2.webp" alt="Interior real de casa prefabricada CONCASAYA ya entregada" class="w-full h-36 object-cover rounded-lg overflow-hidden" loading="lazy" decoding="async" width="360" height="240" />
            <img src="/assets/images/footer-evidencia-3.webp" alt="Casa real con estructura de madera y teja, entregada en Villa de Leyva" class="w-full h-36 object-cover rounded-lg overflow-hidden" loading="lazy" decoding="async" width="360" height="240" />
          </div>

          <div>
            <ul class="text-sm text-gray-300 space-y-2">
              <li class="flex items-center"><i class="fas fa-star text-cyan-400 mr-2"></i>93 reseñas de clientes verificadas (9.6/10) en un directorio independiente</li>
              <li class="flex items-center"><i class="fas fa-shield-alt text-cyan-400 mr-2"></i>Garantía de 10 años en estructura, con póliza de aseguradora</li>
              <li class="flex items-center"><i class="fas fa-hard-hat text-cyan-400 mr-2"></i>Más de 12.000 proyectos entregados en 825 municipios</li>
            </ul>
            <a href="/modelos#proyectos-reales" class="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-cyan-400 transition-colors">
              Ver fotos de obra entregada <i class="fas fa-arrow-right"></i>
            </a>
          </div>

        </div>
      </div>`;

// Variante para paginas SIN <footer>: lleva su propio fondo oscuro.
const BLOQUE_SIN_FOOTER = `
    <!-- BANDA EVIDENCIA: modelos reales, proyectos reales (pagina sin footer) -->
    <div class="bg-gray-900 text-white py-12">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

          <div>
            <p class="text-xs uppercase tracking-wider text-cyan-400 font-bold mb-2">Material real</p>
            <h3 class="text-xl font-bold text-white mb-2">Modelos reales, proyectos reales</h3>
            <p class="text-sm text-gray-300 leading-relaxed">
              Las fotografías de este sitio son de obras terminadas y entregadas a clientes en Boyacá,
              Cundinamarca y Bogotá. No son renders ni imágenes generadas por IA.
            </p>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-3 gap-2">
            <img src="/assets/images/footer-evidencia-1.webp" alt="Casa real de dos pisos con zócalo de piedra, entregada en Villa de Leyva" class="w-full h-36 object-cover rounded-lg overflow-hidden" loading="lazy" decoding="async" width="360" height="240" />
            <img src="/assets/images/footer-evidencia-2.webp" alt="Interior real de casa prefabricada CONCASAYA ya entregada" class="w-full h-36 object-cover rounded-lg overflow-hidden" loading="lazy" decoding="async" width="360" height="240" />
            <img src="/assets/images/footer-evidencia-3.webp" alt="Casa real con estructura de madera y teja, entregada en Villa de Leyva" class="w-full h-36 object-cover rounded-lg overflow-hidden" loading="lazy" decoding="async" width="360" height="240" />
          </div>

          <div>
            <ul class="text-sm text-gray-300 space-y-2">
              <li class="flex items-center"><i class="fas fa-star text-cyan-400 mr-2"></i>93 reseñas de clientes verificadas (9.6/10) en un directorio independiente</li>
              <li class="flex items-center"><i class="fas fa-shield-alt text-cyan-400 mr-2"></i>Garantía de 10 años en estructura, con póliza de aseguradora</li>
              <li class="flex items-center"><i class="fas fa-hard-hat text-cyan-400 mr-2"></i>Más de 12.000 proyectos entregados en 825 municipios</li>
            </ul>
            <a href="/modelos#proyectos-reales" class="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-cyan-400 transition-colors">
              Ver fotos de obra entregada <i class="fas fa-arrow-right"></i>
            </a>
          </div>

        </div>
      </div>
    </div>
`;

function listHtml(dir, pre = '') {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const rel = pre ? pre + '/' + e.name : e.name;
    if (e.isDirectory()) out.push(...listHtml(path.join(dir, e.name), rel));
    else if (e.name.toLowerCase().endsWith('.html') && !e.name.includes('.bak')) {
      if (e.name.startsWith('tmp-') || e.name.startsWith('.tmp-')) continue;
      out.push(rel);
    }
  }
  return out;
}

const archivos = [
  ...listHtml(ROOT).filter((f) => !f.includes('/') && !f.startsWith('scripts/') && !f.startsWith('assets/')),
  ...listHtml(path.join(ROOT, 'pages'), 'pages'),
  ...listHtml(path.join(ROOT, 'blog'), 'blog')
];

let insertados = 0;
let yaEstaban = 0;
let sinFooter = 0;
const tocados = [];

for (const rel of archivos) {
  const abs = path.join(ROOT, rel);
  let html = fs.readFileSync(abs, 'utf8');

  if (html.includes(MARCA)) { yaEstaban++; continue; }

  const m = html.match(/<footer\b[^>]*>/i);
  if (m) {
    // Con footer: se inserta justo despues de la etiqueta de apertura.
    const corte = m.index + m[0].length;
    html = html.slice(0, corte) + '\n      ' + BLOQUE + html.slice(corte);
  } else if (html.includes('</body>')) {
    // Sin footer (articulos viejos): se inserta al final del contenido, con
    // fondo oscuro propio para que el texto claro se lea igual.
    const corte = html.indexOf('</body>');
    html = html.slice(0, corte) + BLOQUE_SIN_FOOTER + html.slice(corte);
  } else {
    sinFooter++;
    continue;
  }

  if (!DRY) fs.writeFileSync(abs, html, 'utf8');
  insertados++;
  tocados.push(rel);
}

console.log(`\nArchivos revisados: ${archivos.length}`);
console.log(`  banda insertada : ${insertados}`);
console.log(`  ya la tenian    : ${yaEstaban}`);
console.log(`  sin footer      : ${sinFooter}`);
if (DRY) console.log('\n(DRY RUN: no se escribio nada)');
else {
  fs.writeFileSync(
    path.join(ROOT, 'scripts', '.tmp-banda-evidencia-archivos.txt'),
    tocados.join('\n'),
    'utf8'
  );
}
