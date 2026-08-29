// Simulo la lógica del render mobile para ver qué deptos se forman
import { readFileSync } from 'fs';

// Cargo el archivo municipios.js
const municipiosJsCode = readFileSync('assets/js/municipios.js', 'utf8');
// Ejecuto en un contexto controlado (sin window real, pero podemos simular)
const ctx = {};
new Function('window', municipiosJsCode)(ctx);

const municipios = ctx.MUNICIPIOS || [];
const paises = ctx.PAISES || [];
console.log(`Total municipios: ${municipios.length}`);
console.log(`Total países: ${paises.length}`);

const DEPT_MAP = {
  "Bogotá D.C.": "Cundinamarca",
  "Chía": "Cundinamarca", "Cajicá": "Cundinamarca", "Zipaquirá": "Cundinamarca",
  "Sopó": "Cundinamarca", "Cota": "Cundinamarca", "Suba": "Cundinamarca",
  "Norte de Bogotá": "Cundinamarca", "Funza": "Cundinamarca",
  "Mosquera": "Cundinamarca", "Madrid": "Cundinamarca", "Tocancipá": "Cundinamarca",
  "La Vega": "Cundinamarca", "La Calera": "Cundinamarca", "La Mesa": "Cundinamarca",
  "Guasca": "Cundinamarca", "Sesquilé": "Cundinamarca", "Soacha": "Cundinamarca",
  "Facatativá": "Cundinamarca", "Fusagasugá": "Cundinamarca", "Pacho": "Cundinamarca",
  "Mesitas del Colegio": "Cundinamarca", "Subachoque": "Cundinamarca",
  "Supatá": "Cundinamarca", "Villeta": "Cundinamarca",
  "Tunja": "Boyacá", "Villa de Leyva": "Boyacá", "Duitama": "Boyacá",
  "Sogamoso": "Boyacá", "Paipa": "Boyacá", "Samacá": "Boyacá",
  "Boyacá": "Boyacá", "Chiquinquirá": "Boyacá", "Chocontá": "Boyacá",
  "Firavitoba": "Boyacá", "Ráquira": "Boyacá", "Valle de Tenza": "Boyacá",
  "Barbosa": "Santander", "Vélez": "Santander", "Puente Nacional": "Santander",
  "San Francisco": "Santander",
  "Santa Marta": "Magdalena",
};

const CIUDADES_PRINCIPALES = [
  "Bogotá D.C.", "Chía", "Cajicá", "Zipaquirá", "Sopó", "Funza",
  "Mosquera", "Madrid", "Tocancipá", "Tunja", "Villa de Leyva", "Barbosa"
];

// Calcular deptos
const deptos = {};
for (const m of municipios) {
  if (CIUDADES_PRINCIPALES.indexOf(m.nombre) !== -1) continue;
  const depto = DEPT_MAP[m.nombre] || "Otros";
  if (!deptos[depto]) deptos[depto] = [];
  deptos[depto].push(m);
}

console.log(`\nDeptos formados:`);
const deptoKeys = Object.keys(deptos).sort((a, b) => deptos[b].length - deptos[a].length);
deptoKeys.forEach(d => {
  console.log(`  ${d}: ${deptos[d].length} municipios`);
  deptos[d].forEach(m => console.log(`    - ${m.nombre}`));
});

// Identificar municipios sin mapear
console.log(`\nMunicipios sin mapear (caen en "Otros"):`);
deptos["Otros"]?.forEach(m => console.log(`  - ${m.nombre}`));
