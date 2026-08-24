// Agrega un enlace a la politica anti-estafa en el footer de cada pagina HTML.
// El enlace se inserta despues del item "Preguntas Frecuentes" (/faq.html)
// dentro de la lista <ul> de la seccion "Empresa" del footer.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGETS = [
  'index.html',
  'modelos.html',
  'cotizador-precios-casas-prefabricadas.html',
  'galeria.html',
  'nosotros.html',
  'ventajas.html',
  'faq.html',
  'blog.html',
  'contacto.html',
  'referidos.html'
];

const POLICY_LINK = `              <li>
                <a
                  href="/proteccion-contra-estafas.html"
                  class="text-gray-300 hover:text-red-400 transition-colors duration-200 flex items-center group"
                >
                  <i
                    class="fas fa-shield-halved text-xs mr-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  ></i>
                  <span class="flex items-center gap-2">
                    Política Anti-Estafa
                    <span class="text-[9px] font-bold uppercase bg-red-600 text-white px-1.5 py-0.5 rounded">Nuevo</span>
                  </span>
                </a>
              </li>
`;

let totalChanges = 0;

for (const file of TARGETS) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) {
    console.log('[SKIP] No existe:', file);
    continue;
  }
  let html = fs.readFileSync(fullPath, 'utf8');

  if (html.includes('/proteccion-contra-estafas.html')) {
    console.log('[=] ', file, '- enlace ya presente');
    continue;
  }

  // Patron: bloque <li>...href="/faq.html"...Preguntas Frecuentes...</li>
  // que aparece 2 veces (nav + footer). Lo unico que sabemos es que el
  // del footer usa clase "text-gray-300" (no del nav que es dropdown-menu).
  // Hay 3 formatos: multilinea puro, una-linea-por-tag, y todo en una linea.
  // Usamos 3 regex para cubrir todos los casos.

  const patterns = [
    {
      // Formato 1: index.html (multilinea puro)
      regex: /(              <li>\s*\n                <a\s*\n                  href="\/faq\.html"\s*\n                  class="text-gray-300[^"]*"\s*\n                >\s*\n(?:.|\n)*?Preguntas Frecuentes\s*<\/span>\s*\n                <\/a>\s*\n              <\/li>)/,
      replacement: '$1\n' + POLICY_LINK
    },
    {
      // Formato 2: blog.html, faq.html, etc. (tag en una sola linea con saltos)
      regex: /(              <li>\s*\n                <a href="\/faq\.html" class="text-gray-300[^"]*">\s*\n                  <i class="fas fa-chevron-right[^>]*><\/i>\s*\n                  <span>Preguntas Frecuentes<\/span>\s*\n                <\/a>\s*\n              <\/li>)/,
      replacement: '$1\n' + POLICY_LINK
    },
    {
      // Formato 3: modelos.html (todo en una linea)
      regex: /(<li><a href="\/faq\.html" class="text-gray-300[^"]*"><i class="fas fa-chevron-right[^>]*"><\/i><span>Preguntas Frecuentes<\/span><\/a><\/li>)/,
      replacement: '$1\n              <li><a href="/proteccion-contra-estafas.html" class="text-gray-300 hover:text-red-400 transition-colors duration-200 flex items-center group"><i class="fas fa-shield-halved text-xs mr-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"></i><span class="flex items-center gap-2">Política Anti-Estafa <span class="text-[9px] font-bold uppercase bg-red-600 text-white px-1.5 py-0.5 rounded">Nuevo</span></span></a></li>'
    }
  ];

  let matched = false;
  for (const p of patterns) {
    if (p.regex.test(html)) {
      html = html.replace(p.regex, p.replacement);
      fs.writeFileSync(fullPath, html, 'utf8');
      totalChanges++;
      console.log('[OK]', file, '- enlace agregado en footer');
      matched = true;
      break;
    }
  }
  if (!matched) {
    console.log('[!!]', file, '- patron no encontrado');
  }
}

console.log('\nTotal modificados:', totalChanges, '/', TARGETS.length);
