/**
 * Quita la marca de agua de Gemini (estrella de 4 puntas) de las imagenes del
 * repo recortando la esquina affected. La estrella se localiza con TEMPLATE
 * MATCHING binario: se usa la forma real de la estrella (extraida de
 * cass3.webp) como plantilla y se busca su mejor coincidencia en la esquina
 * inferior derecha de cada imagen.
 *
 * Se recorta SOLO lo necesario (hasta el borde izquierdo/superior de la
 * estrella + margen), no un porcentaje fijo.
 *
 * Salida: assets/images/_marcadas-ia.json con los tamaños nuevos, para
 * actualizar los width/height del HTML.
 *
 * Uso: node scripts/limpiar-marca-ia.mjs [--dry]
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG_DIR = path.join(ROOT, 'assets', 'images');
const PLANTILLA_SRC = path.join(IMG_DIR, 'cass3.webp');
const DRY = process.argv.includes('--dry');

// Caja de la estrella dentro de cass3 (medida sobre el recorte ampliado).
const TPL = { left: 1008, top: 878, width: 44, height: 32 };
// Zona de busqueda (fracciones de la imagen completa).
const BUSCA_X = 0.72, BUSCA_Y = 0.72, BUSCA_W = 0.28, BUSCA_H = 0.28;
const UMBRAL = 0.55; // correlacion binaria minima para darlo por detectado
const MARGEN = 0.012; // margen extra de recorte (fraccion del ancho/alto)

function esCrema(r, g, b) {
  const dif = r - b;
  return r > 195 && r < 255 && g > 185 && g < 253 && b > 145 && b < 246 &&
    dif >= 8 && dif <= 55 && (g - b) >= 0 && (g - b) <= 38;
}

async function binarioCrema(file, left, top, width, height) {
  const { data, info } = await sharp(file)
    .extract({ left, top, width, height })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const o = i * info.channels;
    mask[i] = esCrema(data[o], data[o + 1], data[o + 2]) ? 1 : 0;
  }
  return mask;
}

// --- plantilla: forma de la estrella ---
const tplMask = await binarioCrema(
  PLANTILLA_SRC, TPL.left, TPL.top, TPL.width, TPL.height
);
const tplPix = [];
for (let y = 0; y < TPL.height; y++) {
  for (let x = 0; x < TPL.width; x++) {
    if (tplMask[y * TPL.width + x]) tplPix.push([x, y]);
  }
}
console.log(`Plantilla: ${tplPix.length} px crema de ${TPL.width}x${TPL.height}`);

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

const marcados = [];

for (const rel of walk(IMG_DIR)) {
  const file = path.join(IMG_DIR, rel);
  let meta;
  try { meta = await sharp(file).metadata(); } catch { continue; }

  const zx = Math.round(meta.width * BUSCA_X);
  const zy = Math.round(meta.height * BUSCA_Y);
  const zw = Math.min(Math.round(meta.width * BUSCA_W), meta.width - zx);
  const zh = Math.min(Math.round(meta.height * BUSCA_H), meta.height - zy);
  if (zw < TPL.width || zh < TPL.height) continue;

  const mask = await binarioCrema(file, zx, zy, zw, zh);

  let mejor = -1, mejorX = 0, mejorY = 0;
  for (let oy = 0; oy <= zh - TPL.height; oy++) {
    for (let ox = 0; ox <= zw - TPL.width; ox++) {
      let hits = 0;
      for (const [px, py] of tplPix) {
        if (mask[(oy + py) * zw + (ox + px)]) hits++;
      }
      const score = hits / tplPix.length;
      if (score > mejor) { mejor = score; mejorX = ox; mejorY = oy; }
    }
  }

  if (mejor < UMBRAL) continue;

  // Caja de la estrella en la imagen completa.
  const ex1 = zx + mejorX;                       // borde izquierdo
  const ey1 = zy + mejorY;                       // borde superior
  const margenX = Math.round(meta.width * MARGEN);
  const margenY = Math.round(meta.height * MARGEN);

  const nuevoAncho = Math.max(50, ex1 - margenX);
  const nuevoAlto = Math.max(50, ey1 - margenY);

  marcados.push({
    rel,
    score: Number(mejor.toFixed(3)),
    antes: { w: meta.width, h: meta.height },
    despues: { w: nuevoAncho, h: nuevoAlto }
  });

  console.log(`  ${rel.padEnd(42)} score ${mejor.toFixed(3)}  ${meta.width}x${meta.height} -> ${nuevoAncho}x${nuevoAlto}`);

  if (!DRY) {
    const out = path.join(IMG_DIR, rel);
    const tmp = out + '.tmp.webp';
    await sharp(file)
      .extract({ left: 0, top: 0, width: nuevoAncho, height: nuevoAlto })
      .toFormat(path.extname(rel).toLowerCase() === '.png' ? 'png' : 'webp', { quality: 90 })
      .toFile(tmp);
    fs.renameSync(tmp, out);
  }
}

const informe = { generado: new Date().toISOString(), dry: DRY, marcadas };
fs.writeFileSync(path.join(IMG_DIR, '_marcadas-ia.json'), JSON.stringify(informe, null, 2));
console.log(`\nMarcadas detectadas: ${marcados.length}`);
console.log('Informe -> assets/images/_marcadas-ia.json');
