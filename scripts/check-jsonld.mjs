/**
 * Valida que todos los bloques JSON-LD del repo sean JSON valido.
 * Útil tras editar contenido de FAQ (respuestas que viven duplicadas en el
 * <script type="application/ld+json"> y en el HTML visible).
 *
 * Uso: node scripts/check-jsonld.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function listHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.html') && !f.includes('.bak'))
    .filter((f) => !f.startsWith('.tmp-') && !f.startsWith('tmp-'))
    .map((f) => path.join(dir, f));
}

const files = [
  ...listHtml(ROOT).filter((f) => !f.includes(path.sep + 'pages' + path.sep) && !f.includes(path.sep + 'blog' + path.sep)),
  ...listHtml(path.join(ROOT, 'pages')),
  ...listHtml(path.join(ROOT, 'blog'))
];

let totalBlocks = 0;
const errors = [];

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    totalBlocks++;
    const raw = m[1].trim();
    try {
      JSON.parse(raw);
    } catch (err) {
      const rel = path.relative(ROOT, file).split(path.sep).join('/');
      errors.push(`${rel} (offset ${m.index}): ${err.message}`);
    }
  }
}

console.log(`Archivos revisados: ${files.length} | Bloques JSON-LD: ${totalBlocks}`);
if (errors.length) {
  console.log('\nJSON-LD INVALIDO:');
  errors.forEach((e) => console.log('  ' + e));
  process.exitCode = 1;
} else {
  console.log('Todos los bloques JSON-LD son validos.');
}
