// Reemplaza security-alert.css y security-alert.js por descanso-alert.css
// y descanso-alert.js en los HTMLs principales.
//
// Contexto: el cliente pidio reemplazar el aviso de seguridad
// (modal anti-estafa) por un aviso de pausa por agenda ocupada
// (texto literal del cliente, sep 2026). El CSS y JS nuevos ya estan
// creados en assets/css/descanso-alert.css y assets/js/descanso-alert.js.
//
// NO toca proteccion-contra-estafas.html porque esa pagina
// documenta la politica anti-estafa y debe seguir mostrando el modal.
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

let totalChanges = 0;
let totalSkipped = 0;

for (const file of TARGETS) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) {
    console.log('[SKIP] No existe:', file);
    totalSkipped++;
    continue;
  }
  let html = fs.readFileSync(fullPath, 'utf8');
  const before = html;
  const log = [];

  // 1) Reemplazar CSS
  if (html.includes('/assets/css/security-alert.css')) {
    html = html.replace(
      '/assets/css/security-alert.css',
      '/assets/css/descanso-alert.css'
    );
    log.push('CSS security-alert -> descanso-alert');
  } else if (html.includes('/assets/css/descanso-alert.css')) {
    log.push('CSS descanso-alert ya presente (skip)');
  }

  // 2) Reemplazar JS
  if (html.includes('/assets/js/security-alert.js')) {
    html = html.replace(
      '/assets/js/security-alert.js',
      '/assets/js/descanso-alert.js'
    );
    log.push('JS security-alert -> descanso-alert');
  } else if (html.includes('/assets/js/descanso-alert.js')) {
    log.push('JS descanso-alert ya presente (skip)');
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
if (totalSkipped > 0) {
  console.log('Total archivos saltados (no existen):', totalSkipped);
}
