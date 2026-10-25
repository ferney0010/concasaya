/**
 * Verifica el DOM renderizado del listado del blog (Chrome headless --dump-dom)
 * y comprueba que la tarjeta de un articulo apunte a la imagen esperada.
 *
 * Uso: node scripts/verificar-tarjeta-blog.mjs [slug]
 */
import { execSync } from 'node:child_process';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL_LISTADO = 'https://concasaya.com/blog';
const SLUG = process.argv[2] || 'pozos-septicos-colombia-legalidad-requisitos';

const dom = execSync(
  `"${CHROME}" --headless=new --disable-gpu --virtual-time-budget=9000 --dump-dom "${URL_LISTADO}"`,
  { encoding: 'utf8', maxBuffer: 80 * 1024 * 1024 }
);

console.log(`DOM renderizado: ${dom.length} chars`);
console.log(`slug buscado: ${SLUG}`);
console.log(`presente en el DOM: ${dom.includes(SLUG)}`);

const idx = dom.indexOf(SLUG);
if (idx === -1) {
  console.log('\nEl articulo no esta en la pagina 1 del listado (esta mas abajo).');
} else {
  const trozo = dom.slice(Math.max(0, idx - 2500), idx + 2500);
  const imgs = [...tramo.matchAll(/<img[^>]*>/g)]
    .map((m) => m[0])
    .filter((t) => t.includes('assets/images'));
  console.log('\n<img> cerca de la tarjeta:');
  imgs.forEach((t) => console.log('  ' + t.replace(/\s+/g, ' ').slice(0, 220)));
}

console.log('\nTodas las imagenes que cargo el listado:');
const todas = [...dom.matchAll(/src="(https:\/\/www\.concasaya\.com\/assets\/images\/[^"]+)"/g)]
  .map((m) => m[1]);
const cuenta = {};
todas.forEach((u) => { cuenta[u] = (cuenta[u] || 0) + 1; });
Object.entries(cuenta).forEach(([u, n]) => console.log(`  x${n}  ${u}`));
