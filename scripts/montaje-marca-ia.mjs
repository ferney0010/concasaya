/**
 * Montaje de las esquinas inferiores derechas de las imagenes candidatas
 * (una por celda, con su nombre) para revisar de un vistazo cuales llevan la
 * marca de agua de Gemini (estrella de 4 puntas color crema).
 *
 * Uso: node scripts/montaje-marca-ia.mjs [archivo1 archivo2 ...]
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG_DIR = path.join(ROOT, 'assets', 'images');

// Tamano del recorte (fraccion de la imagen) y de la celda.
const FR_W = 0.1;
const FR_H = 0.1;
const CELDA_W = 260;
const CELDA_H = 200;
const ETIQUETA = 26;
const COLS = 5;

const args = process.argv.slice(2);
let OUT = path.join(ROOT, '.tmp-marca-ia-montaje.png');
const archivos = [];
let CENTRO = false;
for (const a of args) {
  if (a.startsWith('--out=')) OUT = path.resolve(ROOT, a.slice(6));
  else if (a === '--centro') CENTRO = true;
  else archivos.push(a);
}

function walk(dir, prefix = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const rel = prefix ? prefix + '/' + e.name : e.name;
    if (e.isDirectory()) out.push(...walk(path.join(dir, e.name), rel));
    else if (/\.(webp|jpg|jpeg|png)$/i.test(e.name)) out.push(rel);
  }
  return out;
}

const lista = archivos.length ? archivos : walk(IMG_DIR);

const celdas = [];
for (const rel of lista) {
  const file = path.join(IMG_DIR, rel);
  try {
    const meta = await sharp(file).metadata();
    const w = Math.round(meta.width * FR_W);
    const h = Math.round(meta.height * FR_H);
    const left = meta.width - w;
    const top = meta.height - h;
    const buf = await sharp(file)
      .extract({ left, top, width: w, height: h })
      .resize(CELDA_W, CELDA_H, { fit: 'cover' })
      .png()
      .toBuffer();
    const etiqueta = Buffer.from(
      `<svg width="${CELDA_W}" height="${ETIQUETA}"><rect width="100%" height="100%" fill="#0f172a"/>` +
      `<text x="6" y="18" font-family="monospace" font-size="14" fill="#38bdf8">${rel.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></svg>`
    );
    celdas.push({ buf, etiqueta, rel });
  } catch (e) {
    console.log('skip', rel, e.message);
  }
}

const filas = Math.ceil(celdas.length / COLS);
const composites = [];
for (let i = 0; i < celdas.length; i++) {
  const col = i % COLS;
  const fila = Math.floor(i / COLS);
  const x = col * (CELDA_W + 6);
  const y = fila * (CELDA_H + ETIQUETA + 6);
  composites.push({ input: celdas[i].buf, left: x, top: y });
  composites.push({ input: celdas[i].etiqueta, left: x, top: y + CELDA_H });
}

await sharp({
  create: {
    width: COLS * (CELDA_W + 6),
    height: filas * (CELDA_H + ETIQUETA + 6),
    channels: 3,
    background: { r: 15, g: 23, b: 42 }
  }
})
  .composite(composites)
  .png()
  .toFile(OUT);

console.log('Montaje ->', OUT, `(${celdas.length} imagenes)`);
