// Reemplaza la funcion buildModalHTML del security-alert.js
// con un modal MINIMO: el detalle esta en /proteccion-contra-estafas.html.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'assets/js/security-alert.js');

let src = fs.readFileSync(FILE, 'utf8');

// Nueva funcion buildModalHTML: modal breve
const newFn = `  function buildModalHTML() {
    return [
      '<div id="sa-backdrop" role="dialog" aria-modal="true" aria-labelledby="sa-title">',
      '  <div id="sa-card">',
      '    <div id="sa-header">',
      '      <div id="sa-icon"><i class="fa-solid fa-shield-halved"></i></div>',
      '      <div id="sa-header-text">',
      '        <span id="sa-eyebrow">Aviso importante</span>',
      '        <h2 id="sa-title">Antes de pagar, confirma que somos CONCASAYA</h2>',
      '      </div>',
      '    </div>',
      '    <div id="sa-body">',
      '      <p class="sa-lead">Hay perfiles falsos usando nuestro nombre. Si alguien te pide dinero por fuera de los canales oficiales, no somos nosotros.</p>',
      '      <a id="sa-btn-policy-link" class="sa-link-policy" href="/proteccion-contra-estafas.html" target="_blank" rel="noopener">',
      '        <i class="fa-solid fa-shield-check"></i>',
      '        <div>',
      '          <strong>Ver canales oficiales y politica</strong>',
      '          <span>WhatsApp, correo, oficina y como verificar un pago</span>',
      '        </div>',
      '        <i class="fa-solid fa-arrow-right sa-link-arrow"></i>',
      '      </a>',
      '    </div>',
      '    <div id="sa-footer">',
      '      <label id="sa-acknowledge">',
      '        <input type="checkbox" id="sa-ack-input" />',
      '        <span>Entendi. Solo confio en los canales oficiales.</span>',
      '      </label>',
      '      <div id="sa-buttons">',
      '        <button type="button" id="sa-btn-confirm" disabled><i class="fa-solid fa-check"></i> Continuar al sitio</button>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>',
      '<button type="button" id="sa-reopen" aria-label="Ver aviso de seguridad"><i class="fa-solid fa-shield-halved"></i> Aviso de seguridad</button>'
    ].join('\\n');
  }`;

// Regex robusto: matchea la firma y todo el cuerpo hasta la llave de cierre de la funcion
const regex = /  function buildModalHTML\(\) \{[\s\S]*?\n  \}\n/;

if (regex.test(src)) {
  src = src.replace(regex, newFn + '\n');
  fs.writeFileSync(FILE, src, 'utf8');
  console.log('[OK] buildModalHTML reemplazada en security-alert.js');
} else {
  console.log('[!!] Regex no encontro buildModalHTML');
  process.exit(1);
}
