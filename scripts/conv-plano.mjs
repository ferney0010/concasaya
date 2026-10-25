/**
 * Convierte un plano (PNG/JPG) al formato del catalogo: WebP de 2400x1792
 * (4:3 exacto), fondo blanco, con aire reservado abajo para la barra de tabs
 * (Foto / Plano) que va superpuesta en la esquina inferior derecha de la card.
 *
 * El aire inferior es obligatorio: sin el, la barra tapa los rotulos del plano
 * (en La Vega tapaba "Con 1 Altillo" / "Con 2 Altillos", que son justo el dato
 * que explica el plano).
 *
 * Uso: node scripts/conv-plano.mjs <origen> <destino-relativo>
 *   node scripts/conv-plano.mjs plano.png assets/images/modelos/casa-x-plano.webp
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ANCHO = 2400;
const ALTO = 1792;
// En movil el bloque de imagen es de 256px y la barra cubre ~42px = 16%;
// se deja 20% por margen. Arriba 5% de aire.
const RESERVA_INFERIOR = 0.2;
const RESERVA_SUPERIOR = 0.05;

const SRC = process.argv[2];
const OUT_REL = process.argv[3];

if (!SRC || !OUT_REL) {
  console.error('Uso: node scripts/conv-plano.mjs <origen> <destino-relativo>');
  process.exit(1);
}

const OUT = path.isAbsolute(OUT_REL) ? OUT_REL : path.join(ROOT, OUT_REL);
const util = Math.round(ALTO * (1 - RESERVA_INFERIOR - RESERVA_SUPERIOR));

const scaled = await sharp(SRC)
  .resize({ width: ANCHO, height: util, fit: 'inside' })
  .toBuffer({ resolveWithObject: true });

const w = scaled.info.width;
const h = scaled.info.height;
const top = Math.round(ALTO * RESERVA_SUPERIOR);
const left = Math.round((ANCHO - w) / 2);

const info = await sharp(scaled.data)
  .extend({
    top,
    bottom: ALTO - h - top,
    left,
    right: ANCHO - w - left,
    background: { r: 255, g: 255, b: 255 }
  })
  .webp({ quality: 90 })
  .toFile(OUT);

console.log(`origen     -> ${w}x${h} (alto util ${util}px)`);
console.log(`salida     -> ${info.width}x${info.height}  ${Math.round(info.size / 1024)}KB  ${path.relative(ROOT, OUT)}`);
console.log(`aire sup   -> ${top}px (${Math.round((top / ALTO) * 100)}%)`);
console.log(`aire inf   -> ${ALTO - h - top}px (${Math.round(((ALTO - h - top) / ALTO) * 100)}%)`);
console.log(`aire lat   -> ${left}px a cada lado`);
