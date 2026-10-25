/**
 * Actualiza los atributos width/height de los <img> que apuntan a imagenes
 * recortadas, usando los tamaños reales nuevos (assets/images/_recorte-marca.json).
 * Evita que el HTML declare dimensiones que ya no corresponden al archivo.
 *
 * Uso: node scripts/actualizar-dimensiones.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const INFORME = path.join(ROOT, 'assets', 'images', '_recorte-marca.json');

if (!fs.existsSync(INFORME)) {
  console.error('Falta assets/images/_recorte-marca.json (correr scripts/recortar-marca-ia.mjs)');
  process.exit(1);
}

const { recortadas } = JSON.parse(fs.readFileSync(INFORME, 'utf8'));
const porNombre = new Map(recortadas.map((r) => [r.rel, r.despues]));

function listHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.html') && !f.includes('.bak'))
    .filter((f) => !f.startsWith('.tmp-') && !f.startsWith('tmp-'))
    .map((f) => path.join(dir, f));
}

const archivos = [
  ...listHtml(ROOT).filter((f) => !f.includes(path.sep + 'pages' + path.sep) && !f.includes(path.sep + 'blog' + path.sep)),
  ...listHtml(path.join(ROOT, 'pages')),
  ...listHtml(path.join(ROOT, 'blog'))
];

let cambios = 0;
const tocados = [];

for (const file of archivos) {
  let html = fs.readFileSync(file, 'utf8');
  let cambiosArchivo = 0;

  html = html.replace(/<img\b[^>]*>/gi, (tag) => {
    for (const [rel, dims] of porNombre) {
      const base = path.basename(rel);
      if (!tag.includes(base)) continue;
      let nuevo = tag;
      nuevo = nuevo.replace(/(width=")\d+(")/, `$1${dims.w}$2`);
      nuevo = nuevo.replace(/(height=")\d+(")/, `$1${dims.h}$2`);
      if (nuevo !== tag) { cambiosArchivo++; cambios++; }
      return nuevo;
    }
    return tag;
  });

  if (cambiosArchivo) {
    fs.writeFileSync(file, html, 'utf8');
    tocados.push(`${path.relative(ROOT, file).split(path.sep).join('/')}: ${cambiosArchivo}`);
  }
}

console.log(`Tags <img> actualizados: ${cambios}`);
tocados.forEach((t) => console.log('  ' + t));
