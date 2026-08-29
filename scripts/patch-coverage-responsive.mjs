// Aplica parches masivos de responsive a la sección 'coverage' del index
// (clases que faltan en 11 cards porque el Edit tool falló con replace_all).
import { readFileSync, writeFileSync } from 'fs';

const file = 'index.html';
let html = readFileSync(file, 'utf8');

const patches = [
  {
    name: 'cards <a> class: agregar min-w-0',
    from: 'class="group block p-5 border border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition h-full"',
    to:   'class="group block p-5 border border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition h-full min-w-0"',
  },
  {
    name: 'cards <h3>: agregar break-words',
    from: '<h3 class="font-bold text-dark group-hover:text-primary transition text-lg">',
    to:   '<h3 class="font-bold text-dark group-hover:text-primary transition text-lg break-words">',
  },
  {
    name: 'cards <span>: agregar whitespace-nowrap',
    from: '<span class="text-sm text-primary font-semibold mt-2 inline-flex items-center gap-1">',
    to:   '<span class="text-sm text-primary font-semibold mt-2 inline-flex items-center gap-1 whitespace-nowrap">',
  },
  {
    name: 'cards <i> arrow: quitar translate-x-1',
    from: '<i class="fas fa-arrow-right text-xs transition group-hover:translate-x-1"></i>',
    to:   '<i class="fas fa-arrow-right text-xs"></i>',
  },
];

let totalReplaced = 0;
for (const p of patches) {
  // Escape regex special chars
  const escFrom = p.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escFrom, 'g');
  const matches = html.match(re);
  const count = matches ? matches.length : 0;
  if (count === 0) {
    console.log(`⚠ ${p.name}: 0 matches (puede que ya esté aplicado o que falte el patrón)`);
    continue;
  }
  html = html.replace(re, p.to);
  totalReplaced += count;
  console.log(`✓ ${p.name}: ${count} reemplazos`);
}

writeFileSync(file, html, 'utf8');
console.log(`\nTotal: ${totalReplaced} reemplazos aplicados.`);
