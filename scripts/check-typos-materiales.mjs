import fs from 'node:fs';
const html = fs.readFileSync('C:/Workspace/concasaya/materiales.html', 'utf8');

// Texto visible: fuera de style/script
const body = html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ');

const words = body.split(/\s+/).map((w) => w.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '')).filter(Boolean);
const norm = words.map((w) => w.toLowerCase());

// Palabras internas que casi siempre son erratas al escribir en español
const sospechosas = [
  'tecotizamos', 'tecotiza', 'nsoescribes', 'entregamoss', 'calculamso', 'calculamosn',
  'tecalculamos', 'teentregamos', 'tecotizar', 'nnecesitas', 'tecotizan',
  'paracc', 'dde', 'xq', 'qe', 'kien', 'ta', 'x'
];

const encontradas = new Set();
sospechosas.forEach((s) => {
  norm.forEach((w, i) => { if (w === s) encontradas.add(words[i] + '  (en: ...' + words.slice(Math.max(0, i - 3), i + 4).join(' ') + '...)'); });
});

// Duplicaciones consecutivas tipo "de de", "la la", "que que", "y y"
const duplicadas = new Set();
const rep = /(^|\s)(de|la|el|los|las|que|y|en|un|una|por|con|para|al)\s+\2(?=\s|$)/gi;
let m;
while ((m = rep.exec(body)) !== null) duplicadas.add(m[0].trim());

console.log('--- posibles erratas internas ---');
console.log([...encontradas].join('\n') || 'ninguna');
console.log('--- palabras duplicadas ---');
console.log([...duplicadas].join('\n') || 'ninguna');
console.log('--- paso 2 ---');
console.log(/Cotizamos el valor/.test(html) ? 'OK: "Cotizamos el valor"' : 'FALLA: no encontro el titulo corregido');