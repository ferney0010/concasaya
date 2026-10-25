/**
 * Mapa ASCII de la esquina inferior derecha para calibrar el detector de la
 * marca de agua de Gemini (estrella de 4 puntas, gris claro translucido).
 *
 * Uso: node scripts/mapa-esquina.mjs <archivo> [mas archivos...]
 */
import sharp from 'sharp';
import path from 'node:path';

const FRACCION = 0.16; // recorte de la esquina
const CELDAS = 44;

for (const file of process.argv.slice(2)) {
  const meta = await sharp(file).metadata();
  const w = Math.round(meta.width * FRACCION);
  const h = Math.round(meta.height * FRACCION);
  const left = meta.width - w;
  const top = meta.height - h;
  const { data, info } = await sharp(file)
    .extract({ left, top, width: w, height: h })
    .resize(CELDAS, CELDAS, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`\n=== ${path.basename(file)} (${meta.width}x${meta.height}) esquina inf. der. ===`);
  for (let y = 0; y < CELDAS; y++) {
    let linea = '';
    for (let x = 0; x < CELDAS; x++) {
      const i = (y * CELDAS + x) * info.channels;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const neutro = max - min <= 14; // gris (no verde/rojo/azul saturado)
      const claro = (r + g + b) / 3 > 195;
      linea += neutro && claro ? '#' : (neutro ? '+' : '.');
    }
    console.log('  ' + linea);
  }
}
