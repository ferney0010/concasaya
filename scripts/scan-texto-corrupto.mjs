// Escanea HTML del repo buscando artefactos de texto: restos de markdown,
// palabras pegadas, fragmentos en ingles, guiones bajos dentro de palabras.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const SKIP = new Set(['node_modules', '.git', 'tmp-test', 'assets', 'scripts', '.wrangler', '.deploy-staging', '.cache']);

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (SKIP.has(e)) continue;
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (extname(p) === '.html') out.push(p);
  }
  return out;
}

const EN = /\b(speak|people|should|would|could|the|and|with|from|your|your|they|this|that|about|these|those|make|have|been|will|write|read|like)\b/gi;
const GLUED = /\b(en|de|del|y|a|al|el|la|los|las|un|una|unos|unas|lo|su|sus|con|por|para|que|se|si|sin|sobre|entre|como|cuando|ya|le|les|me|te|mi|tu|nos)([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,})/g;
const UNDERSCORE = /\b[a-záéíóúñ]{2,}_[a-záéíóúñ]{2,}\b/g;
const MD = /\*\*[^*\n]{3,}\*\*/g;

const files = walk(ROOT);
let total = 0;

for (const file of files) {
  let html = readFileSync(file, 'utf8');
  const rel = file.slice(ROOT.length + 1);

  // fuera script/style/json-ld/comentarios
  html = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');

  const hits = [];
  const push = (kind, m) => hits.push({ kind, text: m[0].trim() });

  let m;
  UNDERSCORE.lastIndex = 0;
  while ((m = UNDERSCORE.exec(html))) push('guion_bajo', m);

  MD.lastIndex = 0;
  while ((m = MD.exec(html))) push('markdown', m);

  GLUED.lastIndex = 0;
  while ((m = GLUED.exec(html))) {
    // filtra partidos legitimos (ej. "La Casa", "de Bogota") por lista negra
    const t = m[0];
    if (/^(de|del|el|la|los|las|un|una|al)\s?(Bogot|Colomb|Cundin|Boyac|Calle|Cl\.|Suba|Medell|Cali)/.test(t)) continue;
    push('pegado', m);
  }

  EN.lastIndex = 0;
  while ((m = EN.exec(html))) {
    const t = m[0];
    const idx = m.index;
    const ctx = html.slice(Math.max(0, idx - 45), idx + 45).replace(/\s+/g, ' ');
    if (/[a-záéíóúñ]/.test(ctx) && !/[\.\?!:;]/.test(ctx.slice(0, 20))) push('ingles', m);
  }

  if (hits.length) {
    total += hits.length;
    const uniq = new Map();
    for (const h of hits) {
      const key = h.kind + '|' + h.text;
      if (!uniq.has(key)) uniq.set(key, h);
    }
    console.log(`\n=== ${rel} ===`);
    for (const h of uniq.values()) console.log(`  [${h.kind}] ${h.text}`);
  }
}
console.log(`\n--- total hallazgos: ${total} ---`);
