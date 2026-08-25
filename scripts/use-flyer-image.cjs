// Modal simplificado: usa la imagen literal del flyer
// + X visible para cerrar + boton opcional a la politica
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'assets/js/security-alert.js');

let src = fs.readFileSync(FILE, 'utf8');

const newFn = `  function buildModalHTML() {
    return [
      '<div id="sa-backdrop" role="dialog" aria-modal="true" aria-label="Aviso de seguridad CONCASAYA">',
      '  <div id="sa-card">',
      '    <button type="button" id="sa-close" aria-label="Cerrar aviso">&times;</button>',
      '    <img src="/assets/images/alerta-estafa-concasaya.png" alt="Aviso de seguridad CONCASAYA: estamos siendo suplantados, no caiga en estafas" class="sa-flyer-img" />',
      '    <div class="sa-flyer-actions">',
      '      <a id="sa-btn-policy-link" class="sa-cta-link" href="/proteccion-contra-estafas.html" target="_blank" rel="noopener">',
      '        <i class="fa-solid fa-shield-halved"></i>',
      '        <span>Ver politica de proteccion (opcional)</span>',
      '        <i class="fa-solid fa-arrow-right sa-cta-arrow"></i>',
      '      </a>',
      '      <button type="button" id="sa-btn-confirm"><i class="fa-solid fa-check"></i> Entendido, cerrar</button>',
      '    </div>',
      '  </div>',
      '</div>',
      '<button type="button" id="sa-reopen" aria-label="Ver aviso de seguridad"><i class="fa-solid fa-shield-halved"></i> Aviso de seguridad</button>'
    ].join('\\n');
  }`;

const regex = /  function buildModalHTML\(\) \{[\s\S]*?\n  \}\n/;
if (regex.test(src)) {
  src = src.replace(regex, newFn + '\n');
  fs.writeFileSync(FILE, src, 'utf8');
  console.log('[OK] Modal simplificado: usa la imagen literal');
} else {
  console.log('[!!] No se encontro buildModalHTML');
  process.exit(1);
}
