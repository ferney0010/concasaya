/**
 * Genera las miniaturas de la banda de evidencia del footer.
 *
 * Se usan SOLO fotos reales de obra entregada (Villa de Leyva + interior).
 * Miniaturas webp livianas: el footer aparece en 89 paginas, asi que el peso
 * por pagina tiene que ser minimo.
 *
 * Uso: node scripts/generar-miniaturas-footer.mjs
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG = path.join(ROOT, 'assets', 'images');

const FUENTES = [
  { src: 'galeria-villa-casa-blanca-zocalo.webp', out: 'footer-evidencia-1.webp', alt: 'Casa real de dos pisos con zócalo de piedra, entregada en Villa de Leyva' },
  { src: 'img1386.webp', out: 'footer-evidencia-2.webp', alt: 'Interior real de casa prefabricada CONCASAYA ya entregada' },
  { src: 'galeria-villa-casa-teja-madera.webp', out: 'footer-evidencia-3.webp', alt: 'Casa real con estructura de madera y teja, entregada en Villa de Leyva' }
];

const ANCHO = 360;
const ALTO = 240;

for (const f of FUENTES) {
  const info = await sharp(path.join(IMG, f.src))
    .resize(ANCHO, ALTO, { fit: 'cover', position: 'attention' })
    .webp({ quality: 74 })
    .toFile(path.join(IMG, f.out));
  console.log(`${f.out.padEnd(28)} ${info.width}x${info.height}  ${Math.round(info.size / 1024)}KB  (de ${f.src})`);
}
