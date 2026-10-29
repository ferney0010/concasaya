// Extrae el texto visible de un HTML a un .txt para revision de redaccion.
import { readFileSync, writeFileSync } from 'node:fs';

const src = process.argv[2];
const out = process.argv[3];
let html = readFileSync(src, 'utf8');

html = html
  .replace(/<script[\s\S]*?<\/script>/gi, '\n')
  .replace(/<style[\s\S]*?<\/style>/gi, '\n')
  .replace(/<!--[\s\S]*?-->/g, '\n')
  .replace(/<\/(p|h1|h2|h3|h4|li|div|section|summary|span|td|tr|ol|ul|table|details|main|article|aside|nav)>/gi, '\n')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&[a-z]+;/gi, ' ')
  .split('\n')
  .map(l => l.replace(/[ \t]+/g, ' ').trim())
  .filter(Boolean)
  .join('\n');

writeFileSync(out, html, 'utf8');
console.log('OK ->', out, html.split('\n').length, 'lineas');
