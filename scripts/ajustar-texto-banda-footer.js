/**
 * Ajusta el texto de la banda del footer para que la afirmacion sea exacta.
 *
 * Antes: "Las fotografias de este sitio son de obras terminadas..." (implica que
 * TODO el sitio es material real, pero en la galeria todavia hay 13 renders
 * pendientes de material nuevo).
 * Ahora: "Las fotografias de esta banda son de obras terminadas..." (limita la
 * afirmacion a las 3 miniaturas, que si son obra real entregada).
 *
 * Uso: node scripts/ajustar-texto-banda-footer.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const FROM = `Las fotografías de este sitio son de obras terminadas y entregadas a clientes en Boyacá,
              Cundinamarca y Bogotá. No son renders ni imágenes generadas por IA.`;

const TO = `Las fotografías de esta banda son de casas terminadas y entregadas a clientes en Boyacá,
              Cundinamarca y Bogotá. No son renders ni imágenes generadas por IA.`;

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
  ...listHtml(ROOT).filter((f) => !f.includes('/')),
  ...listHtml(path.join(ROOT, 'pages'), 'pages'),
  ...listHtml(path.join(ROOT, 'blog'), 'blog')
];

let n = 0;
const tocados = [];
for (const rel of archivos) {
  const abs = path.join(ROOT, rel);
  let html = fs.readFileSync(abs, 'utf8');
  if (!html.includes(FROM)) continue;
  html = html.split(FROM).join(TO);
  fs.writeFileSync(abs, html, 'utf8');
  n++;
  tocados.push(rel);
}

console.log(`Textos ajustados en ${n} archivos`);
