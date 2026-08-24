// Inyecta security-alert.css y security-alert.js en todas las páginas HTML
// que aún no lo tengan cargado.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGETS = [
  'index.html',
  'modelos.html',
  'cotizador-precios-casas-prefabricadas.html',
  'galeria.html',
  'nosotros.html',
  'ventajas.html',
  'faq.html',
  'blog.html',
  'contacto.html',
  'referidos.html'
];

const CSS_LINE = '    <link rel="stylesheet" href="/assets/css/security-alert.css" />';
const JS_LINE = '    <script src="/assets/js/security-alert.js"></script>';

let totalChanges = 0;

for (const file of TARGETS) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) {
    console.log('[SKIP] No existe:', file);
    continue;
  }
  let html = fs.readFileSync(fullPath, 'utf8');
  const before = html;
  let log = [];

  // 1) CSS: insertar DESPUES de whatsapp-modal.css (si existe) o antes de social-bottom-bar.css
  if (!html.includes('security-alert.css')) {
    if (html.includes('whatsapp-modal.css')) {
      html = html.replace(
        /(\s*<link rel="stylesheet" href="\/assets\/css\/whatsapp-modal\.css" \/>)/,
        '$1\n' + CSS_LINE
      );
      log.push('CSS inyectado tras whatsapp-modal.css');
    } else if (html.includes('social-bottom-bar.css')) {
      html = html.replace(
        /(\s*<link rel="stylesheet" href="\/assets\/css\/social-bottom-bar\.css" \/>)/,
        CSS_LINE + '\n$1'
      );
      log.push('CSS inyectado antes de social-bottom-bar.css');
    } else {
      // fallback: antes de </head>
      html = html.replace('</head>', CSS_LINE + '\n  </head>');
      log.push('CSS inyectado antes de </head> (fallback)');
    }
  } else {
    log.push('CSS ya presente (skip)');
  }

  // 2) JS: insertar DESPUES de whatsapp-modal.js
  if (!html.includes('security-alert.js')) {
    if (html.includes('whatsapp-modal.js')) {
      html = html.replace(
        /(\s*<script src="\/assets\/js\/whatsapp-modal\.js"><\/script>)/,
        '$1\n' + JS_LINE
      );
      log.push('JS inyectado tras whatsapp-modal.js');
    } else {
      // fallback: antes de </body>
      html = html.replace('</body>', JS_LINE + '\n  </body>');
      log.push('JS inyectado antes de </body> (fallback)');
    }
  } else {
    log.push('JS ya presente (skip)');
  }

  if (html !== before) {
    fs.writeFileSync(fullPath, html, 'utf8');
    totalChanges++;
    console.log('[OK]', file, '-', log.join(' | '));
  } else {
    console.log('[=] ', file, '-', log.join(' | '));
  }
}

console.log('\nTotal archivos modificados:', totalChanges, '/', TARGETS.length);
