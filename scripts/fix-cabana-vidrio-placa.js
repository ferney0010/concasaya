/**
 * Excepcion de la Cabana de Vidrio 25 m2: SI incluye placa de cimentacion
 * (dato del cliente, 2026-10-26). Los otros 4 modelos no la incluyen.
 *
 * Cambia:
 *  1) La nota de precio de la card de la Cabana de Vidrio (solo la PRIMERA
 *     ocurrencia: es la primera card del catalogo; la ultima, Casa 80m2,
 *     mantiene "no incluye cimentacion").
 *  2) El CTA de WhatsApp de ese modelo.
 *  3) El texto introductorio del catalogo.
 *  4) Las frases que dicen que "los precios no incluyen placa", anadiendo
 *     la excepcion (FAQ de modelos, landings de Villa de Leyva y el articulo
 *     de la guia de constructora).
 *
 * Uso: node scripts/fix-cabana-vidrio-placa.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const CON_CATALOGO = [
  'modelos.html',
  'pages/villadeleyva.html',
  'pages/casas-de-campo-villa-de-leyva.html',
  'pages/cabanas-turisticas-villa-de-leyva.html'
];

// 1) Nota de la card de la Cabana de Vidrio: solo la primera ocurrencia.
const NOTA_VIEJA = '<p class="mp-precio__nota">Obra negra desde &middot; no incluye cimentaci&oacute;n</p>';
const NOTA_NUEVA = '<p class="mp-precio__nota">Obra negra desde &middot; placa de cimentaci&oacute;n incluida</p>';

// 2) CTA de WhatsApp de la Cabana de Vidrio 25 m2.
const CTA_VIEJO = 'Hermosa%20caba%C3%B1a%20de%20vidrio%2025%20metros%2C%20pozo%20septic%20y%20terminada%20en%20tan%20solo%20%2459.725.900';
const CTA_NUEVO = 'Hermosa%20caba%C3%B1a%20de%20vidrio%2025%20metros%2C%20con%20placa%20de%20cimentaci%C3%B3n%20incluida%2C%20pozo%20septic%20y%20terminada%20en%20tan%20solo%20%2459.725.900';

// 3) Texto introductorio del catalogo.
const INTRO_VIEJO = 'Todos los modelos son personalizables. La placa de cimentación, las instalaciones y los muebles se cotizan aparte.';
const INTRO_NUEVO = 'Todos los modelos son personalizables. Las instalaciones y los muebles se cotizan aparte. La placa de cimentación va aparte en 4 de los 5 modelos; la Cabaña de Vidrio 25 m² ya la incluye.';

// 4) Frases con la excepcion.
const EXCEPCION = ', salvo la Cabaña de Vidrio 25 m² que sí la incluye';

const REGLAS = [
  ['modelos.html',
    'Los precios son de obra negra y no incluyen placa de cimentación.',
    'Los precios son de obra negra y no incluyen placa de cimentación' + EXCEPCION + '.'],
  ['pages/cabanas-turisticas-villa-de-leyva.html',
    'Los precios no incluyen placa de cimentación.',
    'Los precios no incluyen placa de cimentación' + EXCEPCION + '.'],
  ['pages/casas-de-campo-villa-de-leyva.html',
    'Los precios no incluyen placa de cimentacion.',
    'Los precios no incluyen placa de cimentación' + EXCEPCION + '.'],
  ['pages/casas-de-campo-villa-de-leyva.html',
    'Ninguno incluye placa de cimentación.',
    'Solo la Cabaña de Vidrio 25 m² incluye placa de cimentación; los otros cuatro modelos la cotizan aparte.'],
  ['blog/casas-prefabricadas-en-bogota-guia-constructora.html',
    'Los precios son de obra negra y no incluyen placa de cimentación.',
    'Los precios son de obra negra y no incluyen placa de cimentación, salvo la Cabaña de Vidrio 25 m2 que sí la incluye.'],
  ['blog/casas-prefabricadas-en-bogota-guia-constructora.html',
    'Todos son de obra negra y no incluyen placa de cimentación, que se cotiza aparte;',
    'Todos son de obra negra y no incluyen placa de cimentación, que se cotiza aparte, salvo la Cabaña de Vidrio 25 m2 que sí la incluye;'],
  ['blog/casas-prefabricadas-en-bogota-guia-constructora.html',
    'Son precios de obra negra y no incluyen placa de cimentación.',
    'Son precios de obra negra y no incluyen placa de cimentación, salvo la Cabaña de Vidrio 25 m2 que sí la incluye.']
];

let ok = 0;
const errores = [];

// --- A) Nota de la Cabana de Vidrio (primera ocurrencia) + CTA + intro ---
for (const file of CON_CATALOGO) {
  const abs = path.join(ROOT, file);
  let html = fs.readFileSync(abs, 'utf8');

  const i = html.indexOf(NOTA_VIEJA);
  if (i === -1) {
    errores.push(`NO ENCONTRADA la nota de la Cabana de Vidrio en ${file}`);
  } else {
    html = html.slice(0, i) + NOTA_NUEVA + html.slice(i + NOTA_VIEJA.length);
    ok++;
    console.log(`[${file}] nota de la Cabana de Vidrio -> placa incluida`);
  }

  if (html.includes(CTA_VIEJO)) {
    html = html.split(CTA_VIEJO).join(CTA_NUEVO);
    ok++;
    console.log(`[${file}] CTA de WhatsApp con placa incluida`);
  } else {
    errores.push(`NO ENCONTRADO el CTA de la Cabana de Vidrio en ${file}`);
  }

  if (html.includes(INTRO_VIEJO)) {
    html = html.split(INTRO_VIEJO).join(INTRO_NUEVO);
    ok++;
    console.log(`[${file}] texto introductorio del catalogo`);
  } else {
    errores.push(`NO ENCONTRADO el texto introductorio en ${file}`);
  }

  fs.writeFileSync(abs, html, 'utf8');
}

// --- B) Frases con la excepcion ---
for (const [file, from, to] of REGLAS) {
  const abs = path.join(ROOT, file);
  let html = fs.readFileSync(abs, 'utf8');
  const n = html.split(from).length - 1;
  if (!n) {
    if (html.includes(to)) { console.log(`[${file}] ya aplicado: ${from.slice(0, 45)}`); continue; }
    errores.push(`NO ENCONTRADO en ${file}: ${from.slice(0, 70)}`);
    continue;
  }
  html = html.split(from).join(to);
  fs.writeFileSync(abs, html, 'utf8');
  ok += n;
  console.log(`[${file}] x${n}  ${from.slice(0, 62)}`);
}

console.log(`\nCambios: ${ok}`);
if (errores.length) {
  console.log('ERRORES:');
  errores.forEach((e) => console.log('  ' + e));
  process.exitCode = 1;
}
