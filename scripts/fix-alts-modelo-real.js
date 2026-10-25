/**
 * Reescribe los alt/title de las imagenes del catalogo de modelos para que
 * digan explicitamente "modelo real de casa prefabricada" (y no "render",
 * "diseno" ni nada que sugiera IA).
 *
 * Uso: node scripts/fix-alts-modelo-real.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const REGLAS = [
  // modelos.html
  ['modelos.html', 'alt="Foto Cabaña de Vidrio CONCASAYA 25 m2"', 'alt="Modelo real de casa prefabricada CONCASAYA Cabaña de Vidrio 25 m2"'],
  ['modelos.html', 'alt="Plano Cabaña de Vidrio CONCASAYA 25 m2"', 'alt="Plano real del modelo de casa prefabricada CONCASAYA Cabaña de Vidrio 25 m2"'],
  ['modelos.html', 'alt="Foto Casa El Moral CONCASAYA 36 m2"', 'alt="Modelo real de casa prefabricada CONCASAYA Casa El Moral 36 m2"'],
  ['modelos.html', 'alt="Plano Casa El Moral CONCASAYA 36 m2"', 'alt="Plano real del modelo de casa prefabricada CONCASAYA Casa El Moral 36 m2"'],
  ['modelos.html', 'alt="Foto Cabaña La Vega CONCASAYA 54 m2"', 'alt="Modelo real de casa prefabricada CONCASAYA Cabaña La Vega 54 m2"'],
  ['modelos.html', 'alt="Plano de la Cabaña La Vega CONCASAYA 54 m2:', 'alt="Plano real del modelo de casa prefabricada CONCASAYA Cabaña La Vega 54 m2:'],
  ['modelos.html', 'alt="Plano Casa Firavitoba CONCASAYA 84 m2"', 'alt="Plano real del modelo de casa prefabricada CONCASAYA Casa Firavitoba (planta de 84 m2)"'],
  ['modelos.html', 'alt="Foto Casa 80m2 1 piso CONCASAYA"', 'alt="Modelo real de casa prefabricada CONCASAYA Casa 80 m2 de un piso"'],
  ['modelos.html', 'alt="Casa Firavitoba CONCASAYA de 70 m2 con terraza cubierta', 'alt="Modelo real de casa prefabricada CONCASAYA Casa Firavitoba de 70 m2 con terraza cubierta'],

  // JSON-LD del catalogo: descriptions mas explicitas
  ['modelos.html', '"description": "Cabaña prefabricada de 25 m2 con ventanales de vidrio', '"description": "Modelo real de casa prefabricada de 25 m2 con ventanales de vidrio'],
  ['modelos.html', '"description": "Casa prefabricada de 36 m², la más compacta del catálogo', '"description": "Modelo real de casa prefabricada de 36 m², la más compacta del catálogo'],
  ['modelos.html', '"description": "Casa prefabricada de 80 m² en un solo piso', '"description": "Modelo real de casa prefabricada de 80 m² en un solo piso']
];

let ok = 0;
const errores = [];

for (const [file, from, to] of REGLAS) {
  const abs = path.join(ROOT, file);
  let html = fs.readFileSync(abs, 'utf8');
  const n = html.split(from).length - 1;
  if (!n) { errores.push(`NO ENCONTRADO en ${file}: ${from.slice(0, 70)}`); continue; }
  html = html.split(from).join(to);
  fs.writeFileSync(abs, html, 'utf8');
  ok += n;
  console.log(`[${file}] x${n}  ${from.slice(0, 62)}`);
}

console.log(`\nReemplazos: ${ok}`);
if (errores.length) {
  console.log('ERRORES:');
  errores.forEach((e) => console.log('  ' + e));
  process.exitCode = 1;
}
