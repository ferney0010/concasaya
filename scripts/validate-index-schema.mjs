// Validador: extrae todos los bloques JSON-LD del index.html y los parsea
import { readFileSync } from 'fs';

const html = readFileSync('index.html', 'utf8');
const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];

console.log(`Bloques JSON-LD encontrados: ${blocks.length}`);

let errors = 0;
blocks.forEach((b, i) => {
  try {
    const parsed = JSON.parse(b[1]);
    const types = parsed['@graph']
      ? parsed['@graph'].map(n => n['@type']).flat().join(', ')
      : parsed['@type'];
    console.log(`OK  [${i}] tipos: ${types}`);
  } catch (e) {
    errors++;
    console.log(`ERR [${i}] ${e.message}`);
  }
});

// Sanity checks del HTML
const checks = [
  { pattern: /\+12\.000/, name: 'contador +12.000 visible' },
  { pattern: /\+10<\/p>\s*<p class="text-gray-300">Años de Experiencia/, name: 'contador +10 visible' },
  { pattern: /\+98%/, name: 'contador +98% visible' },
  { pattern: /\+825/, name: 'contador +825 visible' },
  { pattern: /Más de 10 años construyendo casas prefabricadas en Colombia/, name: 'h2 AEO' },
  { pattern: /counter-number[\s\S]*?innerText = prefix \+ '0' \+ suffix/, name: 'script reset contadores' },
  { pattern: /hasOfferCatalog/, name: 'hasOfferCatalog en schema' },
  { pattern: /FAQPage/, name: 'FAQPage en schema' },
  { pattern: /825 municipios/, name: '825 municipios mencionado' },
];

console.log('\nSanity checks:');
let htmlOk = 0;
for (const c of checks) {
  const ok = c.pattern.test(html);
  console.log(`${ok ? 'OK ' : 'NO '} ${c.name}`);
  if (ok) htmlOk++;
}

if (errors === 0 && htmlOk === checks.length) {
  console.log('\nTODO OK ✅');
  process.exit(0);
} else {
  console.log(`\nFallaron: ${errors} JSON, ${checks.length - htmlOk} HTML`);
  process.exit(1);
}
