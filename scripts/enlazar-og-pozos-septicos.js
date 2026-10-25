/**
 * Apunta las metas sociales del articulo de pozos septicos a la imagen OG
 * 1200x630 (la foto del cliente con el titulo). La imagen del listado del blog
 * sigue siendo img1355.webp, que es mas liviana.
 *
 * Uso: node scripts/enlazar-og-pozos-septicos.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILE = path.join(ROOT, 'blog', 'pozos-septicos-colombia-legalidad-requisitos.html');

const FROM = 'https://www.concasaya.com/assets/images/img1355.webp';
const TO = 'https://www.concasaya.com/assets/images/og-pozos-septicos-colombia-legalidad-requisitos.webp';

let html = fs.readFileSync(FILE, 'utf8');
const antes = html.split(FROM).length - 1;

// Solo las metas (og:image, twitter:image y JSON-LD "image"), no el listado.
html = html
  .replace(`<meta property="og:image" content="${FROM}" />`, `<meta property="og:image" content="${TO}" />`)
  .replace(`<meta name="twitter:image" content="${FROM}" />`, `<meta name="twitter:image" content="${TO}" />`)
  .replace(`"image": "${FROM}"`, `"image": "${TO}"`);

const despues = html.split(TO).length - 1;
fs.writeFileSync(FILE, html, 'utf8');

console.log(`ocurrencias de img1355 en el articulo: ${antes}`);
console.log(`metas apuntando a la OG 1200x630: ${despues}`);
console.log(`quedan referencias a img1355: ${html.split(FROM).length - 1}`);
