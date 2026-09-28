// Script idempotente: quita el atributo data-wm-strict-lote del <body>.
// El filtro de 17 preguntas fue desactivado el 2026-09-28 por baja conversion.
const fs = require('fs');
const path = require('path');

const SKIP = new Set(['node_modules', '.git', '.deploy-staging', 'tmp-test']);

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP.has(entry.name) || entry.name.startsWith('.tmp-')) continue;
      walk(path.join(dir, entry.name), acc);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      acc.push(path.join(dir, entry.name));
    }
  }
  return acc;
}

let changed = 0;
const root = process.cwd();
for (const file of walk(root)) {
  const original = fs.readFileSync(file, 'utf8');
  if (!original.includes('data-wm-strict-lote')) continue;
  const updated = original
    .replace(/ data-wm-strict-lote(?=[>\s])/g, '')
    .replace(/data-wm-strict-lote(?==")/g, '');
  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    changed++;
    console.log('OK   ' + path.relative(root, file));
  }
}
console.log(`\n${changed} archivo(s) actualizados.`);
