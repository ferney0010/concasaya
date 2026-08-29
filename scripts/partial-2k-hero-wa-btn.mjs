// Solo modifica el botón "WhatsApp" verde del hero del index:
// - href: javascript:void(0)
// - agregar id="hero-wa-btn-hero"
import { readFileSync, writeFileSync } from 'fs';

const file = 'index.html';
let html = readFileSync(file, 'utf8');
const before = html;

// Encontrar el href largo del botón "vi su página" y reemplazarlo
const re = /(<a\s*\n\s*href=")https:\/\/wa\.me\/573142891018\?text=Hola%20CONCASAYA%2C%20vi%20su%20p%C3%A1gina[^"]*("\s*\n\s*target="_blank"\s*\n\s*class="w-full sm:w-auto[^"]*">)/;
if (re.test(html)) {
  html = html.replace(re, '$1javascript:void(0)$2\n                id="hero-wa-btn-hero"');
  console.log('✓ Botón WhatsApp del hero: id="hero-wa-btn-hero" + javascript:void(0) agregados');
} else {
  console.log('⚠ No se encontró el botón. El archivo ya fue modificado o el patrón no coincide.');
  process.exit(1);
}

if (html !== before) {
  writeFileSync(file, html, 'utf8');
  console.log('✓ Archivo guardado');
}
