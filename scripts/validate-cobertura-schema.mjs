import { readFileSync } from 'fs';
const html = readFileSync('pages/casas-prefabricadas-colombia.html', 'utf8');
const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!match) { console.log('No JSON-LD found'); process.exit(1); }
try {
  const parsed = JSON.parse(match[1]);
  console.log('OK: JSON parsea');
  console.log('@graph items:', parsed['@graph'].length);
  parsed['@graph'].forEach(n => {
    const t = Array.isArray(n['@type']) ? n['@type'].join(', ') : n['@type'];
    if (n.itemListElement) console.log('  -', t, '|', n.itemListElement.length, 'items');
    else if (n.mainEntity) console.log('  -', t, '|', n.mainEntity.length, 'preguntas');
    else if (n.hasOfferCatalog) console.log('  -', t, '| HasOfferCatalog');
    else console.log('  -', t);
  });
} catch (e) {
  console.log('ERR:', e.message);
  process.exit(1);
}
