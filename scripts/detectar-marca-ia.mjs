/**
 * Detecta la marca de agua de Gemini (estrella de 4 puntas color crema) en la
 * esquina inferior derecha de las imagenes.
 *
 * La estrella es un blob PEQUENO y compacto de pixeles crema, con forma de
 * cruz de 4 puntas (densa dentro de su bbox pero no llena el rectangulo).
 * Se exige ademas que este en la posicion donde aparece en las lotes de
 * Gemini (~93% del ancho, ~94% del alto).
 *
 * Uso: node scripts/detectar-marca-ia.mjs
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG_DIR = path.join(ROOT, 'assets', 'images');

// Zona de busqueda (fraccion de la imagen completa).
const X0 = 0.86, X1 = 0.99;
const Y0 = 0.85, Y1 = 0.99;

function esCrema(r, g, b) {
  const dif = r - b;
  return r > 200 && r < 253 && g > 190 && g < 251 && b > 150 && b < 244 &&
    dif >= 10 && dif <= 50 && (g - b) >= 1 && (g - b) <= 36;
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

function componentes(pts, w) {
  // 4-conectividad sobre pixeles crema
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

const resultados = [];
for (const rel of walk(IMG_DIR)) {
  const file = path.join(IMG_DIR, rel);
  try {
    const meta = await sharp(file).metadata();
    const left = Math.round(meta.width * X0);
    const top = Math.round(meta.height * Y0);
    const width = Math.max(1, Math.round(meta.width * (X1 - X0)));
    const height = Math.max(1, Math.round(meta.height * (Y1 - Y0)));
    if (width < 15 || height < 15) continue;

    const { data, info } = await sharp(file)
      .extract({ left, top, width, height })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pts = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * info.channels;
        if (esCrema(data[i], data[i + 1], data[i + 2])) pts.push({ x, y });
      }
    }
    if (!pts.length) { resultados.push({ rel, hit: 0, det: 'sin crema' }); continue; }

    let mejor = null;
    for (const comp of componentes(pts, width)) {
      const area = comp.length;
      if (area < 70 || area > 2200) continue;
      const xs = comp.map((p) => p.x), ys = comp.map((p) => p.y);
      const bw = Math.max(...xs) - Math.min(...xs) + 1;
      const bh = Math.max(...ys) - Math.min(...ys) + 1;
      if (bw < 10 || bh < 10 || bw > 110 || bh > 110) continue;
      const aspecto = bw / bh;
      if (aspecto < 0.55 || aspecto > 1.8) continue;
      const densidad = area / (bw * bh);
      if (densidad < 0.14 || densidad > 0.72) continue;
      const cx = Math.min(...xs) + bw / 2;
      const cy = Math.min(...ys) + bh / 2;
      const score = area * (1 - Math.abs(densidad - 0.38));
      if (!mejor || score > mejor.score) {
        mejor = { score, area, bw, bh, cx, cy };
      }
    }
    resultados.push({
      rel,
      hit: mejor ? 1 : 0,
      det: mejor
        ? `${mejor.area}px bbox ${mejor.bw}x${mejor.bh} centro ${(left + mejor.cx).toFixed(0)},${(top + mejor.cy).toFixed(0)} (${((left + mejor.cx) / meta.width * 100).toFixed(1)}%, ${((top + mejor.cy) / meta.height * 100).toFixed(1)}%)`
        : 'sin blob con forma de estrella'
    });
  } catch (e) {
    resultados.push({ rel, hit: 0, det: 'error: ' + e.message });
  }
}

const positivos = resultados.filter((r) => r.hit);
console.log(`Con marca de estrella (${positivos.length}):\n`);
positivos.sort((a, b) => a.rel.localeCompare(b.rel)).forEach((r) => console.log(`  ${r.rel}\n      ${r.det}`));
console.log(`\nRevisados: ${resultados.length} | sin marca: ${resultados.length - positivos.length}`);
console.log('\nEjemplos de control (sin marca):');
resultados.filter((r) => !r.hit).slice(0, 6).forEach((r) => console.log(`  ${r.rel}  -> ${r.det}`));
