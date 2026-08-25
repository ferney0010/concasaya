// Modal minimalista: el flyer como elemento principal (HTML recreado),
// boton X visible para cerrar, y CTA inferior a la politica.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'assets/js/security-alert.js');

let src = fs.readFileSync(FILE, 'utf8');

const newFn = `  function buildModalHTML() {
    return [
      '<div id="sa-backdrop" role="dialog" aria-modal="true" aria-labelledby="sa-title">',
      '  <div id="sa-card">',
      '    <button type="button" id="sa-close" aria-label="Cerrar aviso">&times;</button>',

      // FLYER: replica del aviso anti-estafa de CONCASAYA
      '    <div class="sa-flyer">',
      '      <div class="sa-flyer-top">',
      '        <div class="sa-siren"><i class="fa-solid fa-bell fa-shake"></i></div>',
      '        <div class="sa-flyer-brand">',
      '          <img src="/assets/images/logoconcasaya.webp" alt="CONCASAYA" class="sa-flyer-logo" onerror="this.outerHTML=\\'<div class=&quot;sa-flyer-logo-text&quot;>CONCASAYA<\\/div>\\'" />',
      '          <span class="sa-flyer-tagline">Prefabricados</span>',
      '        </div>',
      '        <div class="sa-flyer-watermark"><i class="fa-solid fa-exclamation"></i></div>',
      '      </div>',

      '      <div class="sa-flyer-atention">!Atencion!</div>',
      '      <div class="sa-flyer-banner">Estamos siendo suplantados</div>',

      '      <div class="sa-flyer-subhead">',
      '        <i class="fa-solid fa-triangle-exclamation"></i>',
      '        <span>No caiga en <strong>estafas</strong></span>',
      '        <span class="sa-flyer-line"></span>',
      '      </div>',

      '      <div class="sa-flyer-3cards">',
      '        <div class="sa-fcard sa-fcard--bad">',
      '          <div class="sa-fcard-icon sa-fcard-icon--bad"><i class="fa-solid fa-xmark"></i></div>',
      '          <div class="sa-fcard-text">',
      '            <strong>No pedimos anticipos</strong>',
      '            <span>Ni a cuentas personales ni a terceros</span>',
      '          </div>',
      '        </div>',
      '        <div class="sa-fcard sa-fcard--ok">',
      '          <div class="sa-fcard-icon sa-fcard-icon--ok"><i class="fa-solid fa-check"></i></div>',
      '          <div class="sa-fcard-text">',
      '            <strong>Todo pago despues de firmar contrato</strong>',
      '            <span>Firmado y autenticado en notaria</span>',
      '          </div>',
      '        </div>',
      '        <div class="sa-fcard sa-fcard--bad">',
      '          <div class="sa-fcard-icon sa-fcard-icon--bad"><i class="fa-solid fa-xmark"></i></div>',
      '          <div class="sa-fcard-text">',
      '            <strong>No recibimos pagos por redes</strong>',
      '            <span>Ni por perfiles falsos. Solo canales oficiales</span>',
      '          </div>',
      '        </div>',
      '      </div>',

      '      <div class="sa-flyer-cta">',
      '        <i class="fa-solid fa-shield-halved"></i>',
      '        <div>',
      '          <strong>Protegete, verifica y denuncia</strong>',
      '          <span>Tu seguridad es nuestra prioridad</span>',
      '        </div>',
      '      </div>',
      '    </div>',

      // CTA OPCIONAL: ver politica de proteccion (NO obligatorio)
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
  console.log('[OK] buildModalHTML reemplazada con modal-flyer minimalista');
} else {
  console.log('[!!] No se encontro buildModalHTML');
  process.exit(1);
}
