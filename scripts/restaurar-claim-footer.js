/**
 * Restaura el claim general del footer.
 *
 * Contexto (2026-10-25): el cliente confirma que las imagenes del repo son
 * FOTOGRAFIAS REALES de obra entregada, retocadas con Gemini solo para mejorar
 * la iluminacion. La estrella de Gemini no era señal de render: delataba el
 * retoque y por eso el cliente recibia la queja de "esto lo hizo la IA".
 *
 * Con ese dato, el claim general del footer vuelve a ser cierto:
 * "Las fotografias de este sitio son de obras terminadas y entregadas..."
 *
 * Uso: node scripts/restaurar-claim-footer.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const FROM = `Las fotografías de esta banda son de casas terminadas y entregadas a clientes en Boyacá,
              Cundinamarca y Bogotá. No son renders ni imágenes generadas por IA.`;

const TO = `Las fotografías de este sitio son de obras terminadas y entregadas a clientes en Boyacá,
              Cundinamarca y Bogotá. Son fotos reales: no son renders ni imágenes generadas por IA.`;

function listHtml(dir, pre = '') {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const rel = pre ? pre + '/' + e.name : e.name;
    if (e.isDirectory()) out.push(...listHtml(path.join(dir, e.name), rel));
    else if (e.name.toLowerCase().endsWith('.html') && !e.name.includes('.bak')) {
      if (e.name.startsWith('tmp-') || e.name.startsWith('.tmp-')) continue;
      out.push(rel);
    }
  }
  return out;
}

const archivos = [
  ...listHtml(ROOT).filter((f) => !f.includes('/')),
  ...listHtml(path.join(ROOT, 'pages'), 'pages'),
  ...listHtml(path.join(ROOT, 'blog'), 'blog')
];

let n = 0;
for (const rel of archivos) {
  const abs = path.join(ROOT, rel);
  let html = fs.readFileSync(abs, 'utf8');
  if (!html.includes(FROM)) continue;
  html = html.split(FROM).join(TO);
  fs.writeFileSync(abs, html, 'utf8');
  n++;
}

console.log(`Claim restaurado en ${n} archivos`);
