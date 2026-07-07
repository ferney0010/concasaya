// Optimiza imagenes pesadas a WebP usando sharp.
// Ejecutar con:  npm run optimize:images
// Pre-requisito: npm install (instala sharp como devDep)
//
// Las imagenes listadas en TARGETS se procesan y el output se guarda
// junto al original con extension .webp. Despues hay que actualizar
// las referencias en los HTMLs (reemplazar X.jpg por X.webp).
//
// Solo procesa imagenes que pesen >= MIN_SIZE_MB para no tocar las
// pequenas que ya estan bien.

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MIN_SIZE_MB = 0.3;

const TARGETS = [
  // Editar esta lista cuando se agreguen imagenes pesadas al sitio
  { src: 'assets/images/360.jpg',        quality: 70, label: '360.jpg' },
  { src: 'assets/images/aislamiento.png', quality: 80, label: 'aislamiento.png' },
  { src: 'assets/images/oasis2.PNG',      quality: 80, label: 'oasis2.PNG' },
  { src: 'assets/images/cabaña18.PNG',    quality: 80, label: 'cabaña18.PNG' }
];

(async () => {
  console.log('=== Optimizando imagenes a WebP ===\n');
  let total = { before: 0, after: 0, processed: 0, skipped: 0 };
  for (const t of TARGETS) {
    if (!fs.existsSync(t.src)) {
      console.log(`  [SKIP] ${t.label} (no existe)`);
      total.skipped++;
      continue;
    }
    const before = fs.statSync(t.src).size;
    if (before < MIN_SIZE_MB * 1024 * 1024) {
      console.log(`  [SKIP] ${t.label} (ya es pequeña: ${(before/1024).toFixed(0)}KB)`);
      total.skipped++;
      continue;
    }
    const out = t.src.replace(/\.(jpg|png)$/i, '.webp');
    await sharp(t.src).webp({ quality: t.quality, method: 6 }).toFile(out);
    const after = fs.statSync(out).size;
    const pct = ((1 - after / before) * 100).toFixed(1);
    console.log(`  [OK]   ${t.label}: ${(before/1024/1024).toFixed(2)}MB -> ${(after/1024).toFixed(0)}KB (-${pct}%)`);
    total.before += before;
    total.after += after;
    total.processed++;
  }
  console.log(`\n=== Resumen ===`);
  console.log(`Procesadas: ${total.processed} | Omitidas: ${total.skipped}`);
  console.log(`Ahorro:     ${((total.before - total.after)/1024/1024).toFixed(2)}MB (${((1 - total.after/total.before)*100).toFixed(1)}%)`);
  console.log(`\nSIGUIENTE: actualizar las referencias en los HTMLs (.jpg -> .webp).`);
})();
