/**
 * Actualiza las landings de Villa de Leyva al catalogo vigente 2026.
 *
 * El bloque del catalogo ya se copio desde modelos.html (script
 * portar-catalogo-villa-de-leyva.js). Aqui se alinean los TEXTOS sueltos
 * (metas, JSON-LD, FAQ visible, parrafos) con los precios reales:
 *
 *   Casa El Moral 36 m2   $24.845.900 -> $23.127.700
 *   Cabana La Vega 54 m2  $44.460.000 -> $41.580.690
 *   Casa 80 m2           $55.368.200 (ya vigente)
 *   Casa Firavitoba      84 m2 $62.429.500 -> 70 m2 $56.797.500
 *   Cabana de Vidrio 25  $63.750.000 -> $59.725.900
 *
 * NO se tocan los precios tachados (mp-precio__antes): son el precio de lista
 * y asi se muestran en el catalogo.
 *
 * Uso: node scripts/fix-precios-villa-de-leyva.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const REGLAS = [
  // ---------------------------------------------------- pages/villadeleyva.html
  ['pages/villadeleyva.html',
    'Casas prefabricadas en Villa de Leyva desde $24.845.900. 5 modelos de 36 a 84 m²',
    'Casas prefabricadas en Villa de Leyva desde $23.127.700. 5 modelos de 36 a 80 m²'],
  ['pages/villadeleyva.html',
    '5 modelos de 36 a 84 m² con precio real de lista: desde $24.845.900.',
    '5 modelos de 36 a 80 m² con precio real: desde $23.127.700.'],
  ['pages/villadeleyva.html',
    '"description": "Casas prefabricadas en Villa de Leyva desde $24.845.900: 5 modelos de 36 a 84 m²',
    '"description": "Casas prefabricadas en Villa de Leyva desde $23.127.700: 5 modelos de 36 a 80 m²'],
  ['pages/villadeleyva.html', '"name": "Casa Firavitoba 84 m²"', '"name": "Casa Firavitoba 70 m²"'],
  ['pages/villadeleyva.html',
    '"image": "https://www.concasaya.com/assets/images/modelos/casa-firavitoba-84m2.webp"',
    '"image": "https://www.concasaya.com/assets/images/modelos/casa-firavitoba-70m2.webp"'],
  ['pages/villadeleyva.html',
    'El precio más bajo del catálogo es la Casa El Moral de 36 m² por 24.845.900 pesos, y el más alto la Cabaña de Vidrio de 25 m² por 63.750.000 pesos.',
    'El precio más bajo del catálogo es la Casa El Moral de 36 m² por 23.127.700 pesos, y el más alto la Cabaña de Vidrio de 25 m² por 59.725.900 pesos.'],
  ['pages/villadeleyva.html',
    'Desde 24.845.900 pesos (Casa El Moral 36 m²). Los 5 modelos van de 36 a 84 m² y el más alto es la Cabaña de Vidrio de 25 m² por 63.750.000.',
    'Desde 23.127.700 pesos (Casa El Moral 36 m²). Los 5 modelos van de 36 a 80 m² y el más alto es la Cabaña de Vidrio de 25 m² por 59.725.900.'],
  ['pages/villadeleyva.html',
    'Una casa de 80 a 84 m² se maneja',
    'Una casa de 80 m² se maneja'],

  // ------------------------------- pages/casas-de-campo-villa-de-leyva.html
  ['pages/casas-de-campo-villa-de-leyva.html',
    'Casa de campo prefabricada en Villa de Leyva desde $24.845.900. 3 modelos de 36 a 84 m²',
    'Casa de campo prefabricada en Villa de Leyva desde $23.127.700. 3 modelos de 36 a 80 m²'],
  ['pages/casas-de-campo-villa-de-leyva.html',
    'Casa de campo desde $24.845.900 en vereda de Boyacá.',
    'Casa de campo desde $23.127.700 en vereda de Boyacá.'],
  ['pages/casas-de-campo-villa-de-leyva.html',
    '"description": "Casas de campo prefabricadas en Villa de Leyva y Boyaca desde $24.845.900.',
    '"description": "Casas de campo prefabricadas en Villa de Leyva y Boyaca desde $23.127.700.'],
  ['pages/casas-de-campo-villa-de-leyva.html',
    'content="https://www.concasaya.com/assets/images/modelos/casa-firavitoba-84m2.webp"',
    'content="https://www.concasaya.com/assets/images/modelos/casa-firavitoba-70m2.webp"'],
  ['pages/casas-de-campo-villa-de-leyva.html',
    'Desde 24.845.900 pesos la Casa El Moral de 36 m2 con 2 alcobas. La Casa 80 m2 de un piso cuesta 55.368.200 y la Casa Firavitoba de 84 m2 con 3 alcobas y 2 banos cuesta 62.429.500',
    'Desde 23.127.700 pesos la Casa El Moral de 36 m2 con 2 alcobas. La Casa 80 m2 de un piso cuesta 55.368.200 y la Casa Firavitoba de 70 m2 con 3 alcobas y 2 banos cuesta 56.797.500'],
  ['pages/casas-de-campo-villa-de-leyva.html',
    '<i class="fas fa-tag mr-1.5"></i>Desde $24.845.900',
    '<i class="fas fa-tag mr-1.5"></i>Desde $23.127.700'],
  ['pages/casas-de-campo-villa-de-leyva.html',
    'casas de campo de 36 a 84 m²',
    'casas de campo de 36 a 80 m²'],
  ['pages/casas-de-campo-villa-de-leyva.html',
    'con licencia gestionada, entrega en 60 a 90 días y desde $24.845.900.',
    'con licencia gestionada, entrega en 60 a 90 días y desde $23.127.700.'],
  ['pages/casas-de-campo-villa-de-leyva.html',
    '¿Cuánto cuesta y cuánto tarda? <strong>Desde $24.845.900</strong>',
    '¿Cuánto cuesta y cuánto tarda? <strong>Desde $23.127.700</strong>'],
  ['pages/casas-de-campo-villa-de-leyva.html',
    'Desde <strong>$24.845.900</strong> la Casa El Moral de 36 m² con 2 alcobas. La Casa 80 m² de un piso cuesta $55.368.200 y la Casa Firavitoba de 84 m² con 3 alcobas y 2 baños',
    'Desde <strong>$23.127.700</strong> la Casa El Moral de 36 m² con 2 alcobas. La Casa 80 m² de un piso cuesta $55.368.200 y la Casa Firavitoba de 70 m² con 3 alcobas y 2 baños'],

  // ---------------------------- pages/cabanas-turisticas-villa-de-leyva.html
  ['pages/cabanas-turisticas-villa-de-leyva.html',
    'Modelos desde $44.460.000, licencia gestionada',
    'Modelos desde $41.580.690, licencia gestionada'],
  ['pages/cabanas-turisticas-villa-de-leyva.html',
    'Cabañas prefabricadas desde $44.460.000 listas para rentar.',
    'Cabañas prefabricadas desde $41.580.690 listas para rentar.'],
  ['pages/cabanas-turisticas-villa-de-leyva.html',
    'Desde 44.460.000 pesos la Cabaña La Vega de 54 m² con 3 alcobas, y 63.750.000 pesos la Cabaña de Vidrio de 25 m².',
    'Desde 41.580.690 pesos la Cabaña La Vega de 54 m² con 3 alcobas, y 59.725.900 pesos la Cabaña de Vidrio de 25 m².'],
  ['pages/cabanas-turisticas-villa-de-leyva.html',
    '<i class="fas fa-tag mr-1.5"></i>Desde $44.460.000',
    '<i class="fas fa-tag mr-1.5"></i>Desde $41.580.690'],
  ['pages/cabanas-turisticas-villa-de-leyva.html',
    'con inversión desde <strong>$24.845.900</strong>',
    'con inversión desde <strong>$23.127.700</strong>'],
  ['pages/cabanas-turisticas-villa-de-leyva.html',
    '<strong>$24.845.900</strong>, sin placa de cimentación',
    '<strong>$23.127.700</strong>, sin placa de cimentación'],
  ['pages/cabanas-turisticas-villa-de-leyva.html',
    '84 m² · familiar',
    '70 m² · familiar'],
  ['pages/cabanas-turisticas-villa-de-leyva.html',
    'Sobre la Cabaña La Vega de 54 m² ($44.460.000)',
    'Sobre la Cabaña La Vega de 54 m² ($41.580.690)'],
  ['pages/cabanas-turisticas-villa-de-leyva.html',
    'Desde <strong>$44.460.000</strong> la Cabaña La Vega de 54 m² con 3 alcobas, y $63.750.000 la Cabaña de Vidrio de 25 m².',
    'Desde <strong>$41.580.690</strong> la Cabaña La Vega de 54 m² con 3 alcobas, y $59.725.900 la Cabaña de Vidrio de 25 m².'],

  // ---- restos que quedaron sueltos en la segunda pasada ----
  ['pages/casas-de-campo-villa-de-leyva.html',
    'y 2 baños cuesta $62.429.500. Ninguno incluye placa de cimentación.',
    'y 2 baños cuesta $56.797.500. Ninguno incluye placa de cimentación.'],
  ['pages/cabanas-turisticas-villa-de-leyva.html',
    'la Casa El Moral de 36 m² cuesta 24.845.900. Los precios no incluyen placa de cimentación.',
    'la Casa El Moral de 36 m² cuesta 23.127.700. Los precios no incluyen placa de cimentación.'],
  ['pages/cabanas-turisticas-villa-de-leyva.html',
    'la Casa El Moral de 36 m² cuesta $24.845.900. Ninguno incluye placa de cimentación.',
    'la Casa El Moral de 36 m² cuesta $23.127.700. Ninguno incluye placa de cimentación.']
];

let ok = 0;
let yaHechos = 0;
const errores = [];

for (const [file, from, to] of REGLAS) {
  const abs = path.join(ROOT, file);
  let html = fs.readFileSync(abs, 'utf8');
  const n = html.split(from).length - 1;
  if (!n) {
    // Idempotente: si el texto nuevo ya estaba, no es un error.
    if (html.includes(to)) { yaHechos++; continue; }
    errores.push(`NO ENCONTRADO en ${file}: ${from.slice(0, 75)}`);
    continue;
  }
  html = html.split(from).join(to);
  fs.writeFileSync(abs, html, 'utf8');
  ok += n;
  console.log(`[${file}] x${n}  ${from.slice(0, 68)}`);
}

console.log(`\nReemplazos: ${ok} | ya aplicados: ${yaHechos}`);
if (errores.length) {
  console.log('ERRORES:');
  errores.forEach((e) => console.log('  ' + e));
  process.exitCode = 1;
}
