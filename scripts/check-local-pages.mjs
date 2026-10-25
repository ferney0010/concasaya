/**
 * Verifica que TODAS las paginas del repo respondan 200 en el server local.
 * Uso: node scripts/check-local-pages.mjs [baseUrl]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.argv[2] || 'http://localhost:3000';

function listHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.html') && !f.includes('.bak'))
    .filter((f) => !f.startsWith('.tmp-') && !f.startsWith('tmp-') && !f.startsWith('_dev-'))
    .map((f) => path.join(dir, f));
}

const files = [
  ...listHtml(ROOT).filter((f) => !f.includes(path.sep + 'pages' + path.sep) && !f.includes(path.sep + 'blog' + path.sep)),
  ...listHtml(path.join(ROOT, 'pages')),
  ...listHtml(path.join(ROOT, 'blog'))
].map((f) => path.relative(ROOT, f).split(path.sep).join('/'));

const toUrl = (rel) => {
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/\.html$/i, '');
};

let ok = 0;
const bad = [];

for (const rel of files) {
  const url = BASE + toUrl(rel);
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (res.status === 200) ok++;
    else bad.push(`${res.status}  ${url}  (${rel})`);
  } catch (err) {
    bad.push(`ERR  ${url}  (${rel})  ${err.message}`);
  }
}

console.log(`OK: ${ok}/${files.length}`);
if (bad.length) {
  console.log('\nFALLAN:');
  bad.forEach((b) => console.log('  ' + b));
  process.exitCode = 1;
}
