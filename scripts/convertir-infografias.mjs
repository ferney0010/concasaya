// Convierte las dos infografias del cliente a WebP optimizado para web.
//
// Las imagenes originales son JPEG de 1254x1254 (~265 KB cada una). Para
// mostrarse en una seccion de materiales no necesitan esa resolucion:
// se muestran a maximo 620 px de ancho en escritorio.
//
// Salida: assets/images/materiales/infografia-*.webp
//   - 1200x1200 (2x de 600) en calidad 82
//   - width/height declarados en el HTML para evitar CLS
//
// Uso: node scripts/convertir-infografias.mjs
import sharp from "sharp";
import { mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "assets", "images", "materiales");

// Origen: los adjuntos que entrego el cliente en esta sesion.
const ORIGENES = [
  {
    src: "C:/Users/ferne/.minimax/v2/assets/2026/11/05/12-46-37-393-asset_20261105-124637-393_833fa369a4ab_4eb6cb74-Infografía de Plaqueta de Concreto CONCASAYA.png",
    out: "infografia-plaqueta-concreto.webp",
  },
  {
    src: "C:/Users/ferne/.minimax/v2/assets/2026/11/05/12-46-37-397-asset_20261105-124637-397_d7ba1e7fabcd_e1d56abe-Infografía de Teja de Barro Tipo C.png",
    out: "infografia-teja-barro-tipo-c.webp",
  },
];

const ANCHO = 1200;
const CALIDAD = 82;

mkdirSync(OUT_DIR, { recursive: true });

for (const o of ORIGENES) {
  const original = statSync(o.src).size;
  const destino = join(OUT_DIR, o.out);

  await sharp(o.src)
    .resize(ANCHO, ANCHO, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: CALIDAD, effort: 5, smartSubsample: true })
    .toFile(destino);

  const final = statSync(destino).size;
  const meta = await sharp(destino).metadata();
  console.log(
    `${o.out}: ${meta.width}x${meta.height} webp | ${(original / 1024).toFixed(0)}KB -> ${(
      final / 1024
    ).toFixed(0)}KB (-${Math.round((1 - final / original) * 100)}%)`
  );
}
