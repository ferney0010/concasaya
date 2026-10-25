/**
 * Recorta la esquina inferior derecha de las imagenes que llevan la marca de
 * agua de Gemini (estrella de 4 puntas), dejando el resto de la foto intacto.
 *
 * La posicion exacta de la estrella se detecta en cada imagen: se buscan
 * pixeles color crema (el matiz de la marca) en la esquina, se agrupan en
 * componentes conexas y se toma la mas cercana a la esquina. Se recorta solo
 * hasta el borde de esa estrella + un margen, no un porcentaje fijo.
 *
 * Salida: assets/images/_recorte-marca.json (tamanos antes/despues) para
 * actualizar los width/height del HTML.
 *
 * Uso: node scripts/recortar-marca-ia.mjs [--dry]
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG_DIR = path.join(ROOT, 'assets', 'images');
const DRY = process.argv.includes('--dry');

// Lista verificada con montaje de esquinas (ver AGENTS.md).
const MARCADAS = [
  'aislamiento.webp', 'aula1.webp', 'bodega1.webp', 'bodega2.webp',
  'bodegaaa.jpg', 'cabaña18.webp', 'cabaññ1.webp', 'campe1.webp',
  'casa2.webp', 'casal1.webp', 'casco.webp', 'caseta.webp',
  'cass2.webp', 'cass3.webp', 'cass4.webp', 'cocina.webp',
  'colonial.webp', 'cubo1.webp', 'fondo1.webp', 'fondo2.webp',
  'fondo3.webp', 'fondo4.webp', 'fondo5.webp', 'herocasa.webp',
  'herocasa1.webp', 'img1055.webp', 'img1304.webp', 'img1318.webp',
  'mezanine.webp', 'sala.webp', 'terminada.webp', 'tiniy1.webp'
];

const ZONA_X = 0.70, ZONA_Y = 0.70, ZONA_W = 0.30, ZONA_H = 0.30;
const MARGEN = 0.015; // margen extra al recortar (fraccion del ancho/alto)
const FALLBACK_W = 0.82; // si no se detecta la estrella, se conserva este ancho
const FALLBACK_H = 0.84;

function esCrema(r, g, b) {
  const dif = r - b;
  return r > 195 && r < 255 && g > 185 && g < 253 && b > 145 && b < 246 &&
    dif >= 8 && dif <= 55 && (g - b) >= 0 && (g - b) <= 38;
}

function componentes(pts, w) {
  const idx = new Map();
  pts.forEach((p, i) => idx.set(p.y * w + p.x, i));
  const visto = new Set();
  const comps = [];
  for (let i = 0; i < pts.length; i++) {
    if (visto.has(i)) continue;
    const pila = [i];
    visto.add(i);
    const comp = [];
    while (pila.length) {
      const j = pila.pop();
      comp.push(pts[j]);
      const { x, y } = pts[j];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = (y + dy) * w + (x + dx);
        if (idx.has(k) && !visto.has(idx.get(k))) {
          visto.add(idx.get(k));
          pila.push(idx.get(k));
        }
      }
    }
    comps.push(comp);
  }
  return comps;
}

const informe = [];

for (const rel of MARCADAS) {
  const file = path.join(IMG_DIR, rel);
  if (!fs.existsSync(file)) { console.log(`  (no existe) ${rel}`); continue; }

  // Se lee a memoria ANTES de tocar nada: si sharp mantiene el descriptor del
  // archivo abierto, Windows bloquea la escritura (UNKNOWN / EPERM).
  const src = fs.readFileSync(file);
  const meta = await sharp(src).metadata();
  const zx = Math.round(meta.width * ZONA_X);
  const zy = Math.round(meta.height * ZONA_Y);
  const zw = Math.min(Math.round(meta.width * ZONA_W), meta.width - zx);
  const zh = Math.min(Math.round(meta.height * ZONA_H), meta.height - zy);

  const { data, info } = await sharp(src)
    .extract({ left: zx, top: zy, width: zw, height: zh })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pts = [];
  for (let y = 0; y < zh; y++) {
    for (let x = 0; x < zw; x++) {
      const i = (y * zw + x) * info.channels;
      if (esCrema(data[i], data[i + 1], data[i + 2])) pts.push({ x, y });
    }
  }

  let bordeX = null, bordeY = null, det = 'fallback';

  if (pts.length) {
    const candidatas = [];
    for (const comp of componentes(pts, zw)) {
      const area = comp.length;
      if (area < 40 || area > 4000) continue;
      const xs = comp.map((p) => p.x), ys = comp.map((p) => p.y);
      const bw = Math.max(...xs) - Math.min(...xs) + 1;
      const bh = Math.max(...ys) - Math.min(...ys) + 1;
      if (bw < 8 || bh < 8 || bw > 140 || bh > 140) continue;
      const aspecto = bw / bh;
      if (aspecto < 0.4 || aspecto > 2.5) continue;
      const densidad = area / (bw * bh);
      if (densidad < 0.08 || densidad > 0.85) continue;
      candidatas.push({
        minX: Math.min(...xs), minY: Math.min(...ys),
        pos: Math.min(...xs) + Math.min(...ys),
        area, bw, bh
      });
    }
    if (candidatas.length) {
      // La mas cercana a la esquina inferior derecha.
      candidatas.sort((a, b) => b.pos - a.pos);
      const c = candidatas[0];
      bordeX = zx + c.minX;
      bordeY = zy + c.minY;
      det = `estrella ${c.bw}x${c.bh} (${c.area}px) en ${zx + c.minX},${zy + c.minY}`;
    }
  }

  const margenX = Math.round(meta.width * MARGEN);
  const margenY = Math.round(meta.height * MARGEN);

  const nuevoW = bordeX !== null
    ? Math.max(60, bordeX - margenX)
    : Math.round(meta.width * FALLBACK_W);
  const nuevoH = bordeY !== null
    ? Math.max(60, bordeY - margenY)
    : Math.round(meta.height * FALLBACK_H);

  const recortePct = Math.round((1 - (nuevoW * nuevoH) / (meta.width * meta.height)) * 100);
  console.log(`  ${rel.padEnd(24)} ${meta.width}x${meta.height} -> ${nuevoW}x${nuevoH}  (-${recortePct}%)  ${det}`);

  informe.push({
    rel,
    antes: { w: meta.width, h: meta.height },
    despues: { w: nuevoW, h: nuevoH }
  });

  if (!DRY) {
    const ext = path.extname(rel).toLowerCase();
    let img = sharp(src).extract({ left: 0, top: 0, width: nuevoW, height: nuevoH });
    if (ext === '.png') img = img.png();
    else if (ext === '.jpg' || ext === '.jpeg') img = img.jpeg({ quality: 90 });
    else img = img.webp({ quality: 90 });
    const buffer = await img.toBuffer();
    fs.writeFileSync(file, buffer);
  }
}

fs.writeFileSync(
  path.join(IMG_DIR, '_recorte-marca.json'),
  JSON.stringify({ generado: new Date().toISOString(), dry: DRY, recortadas: informe }, null, 2)
);

console.log(`\nRecortadas: ${informe.length}`);
console.log('Informe -> assets/images/_recorte-marca.json');
