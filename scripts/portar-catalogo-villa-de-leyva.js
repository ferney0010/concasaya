/**
 * Porta el catalogo de modelos.html a las landings de Villa de Leyva.
 *
 * 1) Extrae el bloque <section id="catalogo-modelos"> de modelos.html (las 5
 *    cards con precios vigentes, tabs Foto/Plano, specs y alt "modelo real").
 * 2) Copia el CSS que las cards necesitan y la landing no tiene (se saca del
 *    <style> de modelos.html: .modelo-card, .mp-precio__cols, .mp-precio__nota,
 *    .mp-precio__terminos).
 * 3) Reemplaza el bloque de modelos de cada landing por el del catalogo.
 *
 * Idempotente: si la landing ya tiene el bloque del catalogo, no hace nada.
 *
 * Uso: node scripts/portar-catalogo-villa-de-leyva.js [--dry]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRY = process.argv.includes('--dry');

const MODELOS = path.join(ROOT, 'modelos.html');
const LANDINGS = [
  'pages/villadeleyva.html',
  'pages/casas-de-campo-villa-de-leyva.html',
  'pages/cabanas-turisticas-villa-de-leyva.html'
];

// --- 1) Bloque del catalogo ---
const htmlModelos = fs.readFileSync(MODELOS, 'utf8');
const ini = htmlModelos.indexOf('<section id="catalogo-modelos"');
const fin = htmlModelos.indexOf('</section>', ini) + '</section>'.length;
const CATALOGO = htmlModelos.slice(ini, fin);
console.log(`Bloque del catalogo: ${CATALOGO.length} chars`);

// --- 2) CSS que hace falta ---
// Los <style> de modelos.html estan repartidos: las reglas de las cards estan
// en el ultimo bloque, no en el primero. Se concatenan todos.
const cssModelos = [...htmlModelos.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
  .map((m) => m[1])
  .join('\n');

// Clases de las cards que la landing no trae (los iconos fa-* vienen de FA).
const NECESARIAS = ['modelo-card', 'mp-precio__cols', 'mp-precio__nota', 'mp-precio__terminos'];

// El <style> de modelos.html esta lleno de lineas en blanco: se normaliza a
// una regla por linea para poder filtrar.
const reglas = cssModelos
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('}')
  .map((r) => r.trim() + '}')
  .filter((r) => r.includes('{'));

const reglasFaltantes = reglas.filter((r) => {
  const sel = r.slice(0, r.indexOf('{'));
  return NECESARIAS.some((c) => sel.includes('.' + c));
});

// Las @keyframes que usan esas reglas (cardFadeIn) tambien hay que portarlas,
// si no las animaciones no corren.
function extraerKeyframes(css) {
  const out = [];
  const re = /@keyframes\s+([\w-]+)\s*\{/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    let i = m.index + m[0].length;
    let nivel = 1;
    while (i < css.length && nivel > 0) {
      if (css[i] === '{') nivel++;
      else if (css[i] === '}') nivel--;
      i++;
    }
    out.push(css.slice(m.index, i).trim());
  }
  return out;
}

const keyframesModelos = extraerKeyframes(cssModelos);
const nombresNecesarios = new Set(
  reglasFaltantes.join(' ').match(/animation[^;]*?([\w-]+)\s*(?:[\d.]+m?s)?\s*(?:ease[^;]*)?(?:infinite|forwards|both)?\s*;/g) || []
);
const keyframesPortar = keyframesModelos.filter((k) => {
  const nombre = k.match(/@keyframes\s+([\w-]+)/)[1];
  return reglasFaltantes.some((r) => r.includes(nombre));
});

console.log(`Reglas CSS a portar: ${reglasFaltantes.length}`);
reglasFaltantes.forEach((r) => console.log('   ' + r.replace(/\s+/g, ' ').slice(0, 120)));
console.log(`Keyframes a portar: ${keyframesPortar.length}`);
keyframesPortar.forEach((k) => console.log('   ' + k.replace(/\s+/g, ' ').slice(0, 90)));

const CSS_PORTADO = `
      /* ====== Catalogo de modelos (traido de modelos.html) ====== */
${reglasFaltantes.map((r) => '      ' + r).join('\n')}
${keyframesPortar.map((k) => '      ' + k.replace(/\n/g, '\n      ')).join('\n')}
`;

// --- 3) Sustitucion en cada landing ---
const MARCA = 'id="catalogo-modelos"';

for (const rel of LANDINGS) {
  const abs = path.join(ROOT, rel);
  let html = fs.readFileSync(abs, 'utf8');

  if (html.includes(MARCA)) {
    console.log(`\n${rel}: ya tiene el catalogo, se omite`);
    continue;
  }

  // Se localiza la seccion de modelos de la landing y se reemplaza.
  const m = html.match(/<section[^>]*id="modelos-villa"[^>]*>[\s\S]*?<\/section>/i)
    || html.match(/<section[^>]*id="modelos[^"]*"[^>]*>[\s\S]*?<\/section>/i);

  if (!m) {
    console.log(`\n${rel}: no se encontro la seccion de modelos, se omite`);
    continue;
  }

  const seccion = m[0];
  const largoAntes = seccion.length;
  html = html.replace(seccion, CATALOGO);

  // Se inyecta el CSS faltante al final del <style> de la landing.
  if (html.includes(CSS_PORTADO.trim())) {
    console.log(`\n${rel}: CSS ya presente`);
  } else {
    const cierre = html.indexOf('</style>');
    html = html.slice(0, cierre) + CSS_PORTADO + html.slice(cierre);
  }

  if (!DRY) fs.writeFileSync(abs, html, 'utf8');
  console.log(`\n${rel}: seccion de modelos reemplazada (${largoAntes} -> ${CATALOGO.length} chars) + CSS portado`);
}

console.log(DRY ? '\n(DRY RUN: no se escribio nada)' : '\nListo');
