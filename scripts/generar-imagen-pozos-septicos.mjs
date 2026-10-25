/**
 * Reemplaza la imagen del articulo "Pozos septicos en Colombia" por la nueva
 * foto del cliente (corte transversal de un sistema septico con casa rural).
 *
 * Antes usaba img1355.webp, que era un interior con el logo de la marca
 * anterior (Kaprecol). Se sobrescribe ese archivo para que las referencias
 * (listado del blog, og:image, twitter:image y JSON-LD) queden actualizadas
 * de una sola vez, y ademas se genera una OG 1200x630 con el titulo.
 *
 * Uso: node scripts/generar-imagen-pozos-septicos.mjs <origen>
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG = path.join(ROOT, 'assets', 'images');
const SRC = process.argv[2];

if (!SRC) {
  console.error('Uso: node scripts/generar-imagen-pozos-septicos.mjs <origen>');
  process.exit(1);
}

// 1) Imagen para el listado del blog y para las redes (16:9).
// 1) Imagen para el listado del blog (se muestra pequena: 400-600 px, asi que
//    900 px es suficiente y no se descargan 300 KB en cada visita).
const base = await sharp(SRC)
  .resize(900, 506, { fit: 'cover', position: 'attention' })
  .webp({ quality: 76 })
  .toBuffer();
fs.writeFileSync(path.join(IMG, 'img1355.webp'), base);
console.log(`img1355.webp  -> 900x506  ${Math.round(base.length / 1024)}KB`);

// 2) OG 1200x630 con el titulo del articulo sobre la foto.
const W = 1200, H = 630;
const overlay = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="55%" stop-color="#0D1B2A" stop-opacity="0"/>
      <stop offset="100%" stop-color="#0D1B2A" stop-opacity="0.92"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="60" y="392" width="86" height="6" fill="#0077b6"/>
  <text x="60" y="440" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="bold" fill="#7dd3fc" letter-spacing="2">GUÍAS</text>
  <text x="60" y="500" font-family="Arial, Helvetica, sans-serif" font-size="50" font-weight="bold" fill="#ffffff">Pozos sépticos en Colombia</text>
  <text x="60" y="545" font-family="Arial, Helvetica, sans-serif" font-size="27" fill="#cbd5e1">Legalidad, normativa y requisitos 2026</text>
  <text x="60" y="592" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#94a3b8">Resolución 0330 de 2017 · Decreto 1076 · Permiso de vertimientos CAR</text>
</svg>`);

const og = await sharp(SRC)
  .resize(W, H, { fit: 'cover', position: 'attention' })
  .composite([{ input: overlay, top: 0, left: 0 }])
  .webp({ quality: 80 })
  .toFile(path.join(IMG, 'og-pozos-septicos-colombia-legalidad-requisitos.webp'));
console.log(`og-pozos-septicos...webp -> ${og.width}x${og.height}  ${Math.round(og.size / 1024)}KB`);
