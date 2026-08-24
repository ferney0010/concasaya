// Redisenha el modal de seguridad con el estilo bold de Ferney:
// - Logo CONCASAYA + sirena
// - "ATENCION!" grande
// - Banner amarillo "ESTAMOS SIENDO SUPLANTADOS"
// - 3 tarjetas con iconos grandes
// - Banner inferior amarillo con CTA
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'assets/js/security-alert.js');

let src = fs.readFileSync(FILE, 'utf8');

const newFn = `  function buildModalHTML() {
    return [
      '<div id="sa-backdrop" role="dialog" aria-modal="true" aria-labelledby="sa-title">',
      '  <div id="sa-card">',

      // HEADER: logo + sirena + titulo ATENCION
      '    <div id="sa-header">',
      '      <div class="sa-header-top">',
      '        <div class="sa-siren"><i class="fa-solid fa-bell fa-shake"></i></div>',
      '        <img src="/assets/images/logoconcasaya.webp" alt="CONCASAYA" class="sa-logo" onerror="this.style.display=\\'none\\'" />',
      '        <div class="sa-header-title">',
      '          <span class="sa-eyebrow">Aviso urgente</span>',
      '          <h2 id="sa-title">!Atencion!</h2>',
      '        </div>',
      '      </div>',
      '      <div class="sa-banner-yellow">Estamos siendo suplantados</div>',
      '      <div class="sa-subhead"><i class="fa-solid fa-triangle-exclamation"></i> No caiga en estafas</div>',
      '    </div>',

      // BODY: 3 tarjetas
      '    <div id="sa-body">',
      '      <div class="sa-grid-3">',
      '        <div class="sa-card-rule sa-card-rule--bad">',
      '          <div class="sa-icon-circle sa-icon-circle--bad"><i class="fa-solid fa-xmark"></i></div>',
      '          <strong>No pedimos anticipos</strong>',
      '          <span>Ni a cuentas personales ni a terceros</span>',
      '        </div>',
      '        <div class="sa-card-rule sa-card-rule--ok">',
      '          <div class="sa-icon-circle sa-icon-circle--ok"><i class="fa-solid fa-check"></i></div>',
      '          <strong>Todo pago despues de firmar contrato</strong>',
      '          <span>Firmado y autenticado en notaria</span>',
      '        </div>',
      '        <div class="sa-card-rule sa-card-rule--bad">',
      '          <div class="sa-icon-circle sa-icon-circle--bad"><i class="fa-solid fa-xmark"></i></div>',
      '          <strong>No recibimos pagos por redes</strong>',
      '          <span>Ni por perfiles falsos. Solo canales oficiales</span>',
      '        </div>',
      '      </div>',

      // CTA: banner amarillo
      '      <a id="sa-btn-policy-link" class="sa-cta-yellow" href="/proteccion-contra-estafas.html" target="_blank" rel="noopener">',
      '        <div class="sa-cta-icon"><i class="fa-solid fa-shield-halved"></i></div>',
      '        <div class="sa-cta-text">',
      '          <strong>Protegete, verifica y denuncia</strong>',
      '          <span>Tu seguridad es nuestra prioridad</span>',
      '        </div>',
      '        <i class="fa-solid fa-arrow-right sa-cta-arrow"></i>',
      '      </a>',
      '    </div>',

      // FOOTER
      '    <div id="sa-footer">',
      '      <label id="sa-acknowledge">',
      '        <input type="checkbox" id="sa-ack-input" />',
      '        <span>Entendi. Solo confio en los canales oficiales de CONCASAYA.</span>',
      '      </label>',
      '      <button type="button" id="sa-btn-confirm" disabled><i class="fa-solid fa-check"></i> Continuar al sitio</button>',
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
  console.log('[OK] buildModalHTML reemplazada con diseno bold');
} else {
  console.log('[!!] No se encontro buildModalHTML');
  process.exit(1);
}
