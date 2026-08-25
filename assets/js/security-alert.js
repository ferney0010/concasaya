/* ============================================================
 * Alerta de Seguridad Anti-Estafa - CONCASAYA
 * Modal inescapable en primera carga con canales oficiales,
 * reglas anti-fraude y enlace a la politica de proteccion.
 *
 * - Aparece INMEDIATAMENTE al cargar cualquier pagina que incluya este script.
 * - Bloquea scroll del body mientras esta abierto.
 * - Persistencia en localStorage: se muestra 1 vez cada 7 dias por usuario.
 * - Boton flotante para reabrirla manualmente cuando se necesite.
 * - Boton "Ver politica" lleva a /proteccion-contra-estafas.html
 * ============================================================ */
(function () {
  'use strict';

  // ---- CONFIG (canales oficiales, mismos que el resto del sitio) ----
  var CONFIG = {
    storageKey: 'concasaya_sa_ack_v1',
    // 7 dias. Si quieres que se muestre en cada visita, pon 0.
    showAgainAfterDays: 7,
    // URL de la politica de proteccion
    policyUrl: '/proteccion-contra-estafas.html',
    // Canales oficiales (texto plano, no se renderiza HTML, se inyecta seguro)
    channels: [
      {
        type: 'whatsapp',
        icon: 'fa-brands fa-whatsapp',
        label: 'WhatsApp oficial',
        value: '+57 314 289 1018',
        href: 'https://wa.me/573142891018?text=Hola%20CONCASAYA%2C%20necesito%20verificar%20un%20canal%20de%20contacto%20antes%20de%20realizar%20un%20pago.',
        primary: true
      },
      {
        type: 'whatsapp',
        icon: 'fa-brands fa-whatsapp',
        label: 'WhatsApp secundario',
        value: '+57 316 577 1582',
        href: 'https://wa.me/573165771582?text=Hola%20CONCASAYA%2C%20necesito%20verificar%20un%20canal%20de%20contacto%20antes%20de%20realizar%20un%20pago.'
      },
      {
        type: 'email',
        icon: 'fa-solid fa-envelope',
        label: 'Correo de seguridad CONCASAYA (Codify Tech)',
        value: 'contacto@codifytech.click',
        href: 'mailto:contacto@codifytech.click'
      },
      {
        type: 'office',
        icon: 'fa-solid fa-location-dot',
        label: 'Oficina fisica (Bogota)',
        value: 'Cl. 147 #101-56 Local 64, Centro Comercial Fiesta',
        href: null
      },
      {
        type: 'web',
        icon: 'fa-solid fa-globe',
        label: 'Sitio web oficial',
        value: 'www.concasaya.com',
        href: 'https://www.concasaya.com/'
      },
      {
        type: 'tiktok',
        icon: 'fa-brands fa-tiktok',
        label: 'TikTok oficial',
        value: '@concasayaprefabricados',
        href: 'https://www.tiktok.com/@concasayaprefabricados'
      }
    ]
  };

  // ---- Persistencia ----
  function shouldShow() {
    try {
      var raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return true;
      var data = JSON.parse(raw);
      if (!data || !data.ack) return true;
      if (CONFIG.showAgainAfterDays <= 0) return true;
      var ageMs = Date.now() - (data.ts || 0);
      var maxMs = CONFIG.showAgainAfterDays * 24 * 60 * 60 * 1000;
      return ageMs > maxMs;
    } catch (e) {
      return true;
    }
  }
  function markAcknowledged() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify({
        ack: true,
        ts: Date.now(),
        version: 1
      }));
    } catch (e) { /* sin localStorage, no pasa nada */ }
  }

  // ---- HTML builder ----
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildChannelsHTML() {
    return CONFIG.channels.map(function (c) {
      var valueHTML = c.href
        ? '<a href="' + esc(c.href) + '" target="_blank" rel="noopener noreferrer">' + esc(c.value) + '</a>'
        : '<strong>' + esc(c.value) + '</strong>';
      var tag = c.primary ? '<span class="sa-tag">Principal</span>' : '';
      return (
        '<div class="sa-channel">' +
          '<i class="' + esc(c.icon) + '"></i>' +
          '<div>' +
            '<div style="font-size:11.5px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;">' + esc(c.label) + tag + '</div>' +
            '<div style="margin-top:2px;">' + valueHTML + '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  function buildModalHTML() {
    return [
      '<div id="sa-backdrop" role="dialog" aria-modal="true" aria-labelledby="sa-title">',
      '  <div id="sa-card">',
      '    <button type="button" id="sa-close" aria-label="Cerrar aviso">&times;</button>',

      // FLYER: replica del aviso anti-estafa de CONCASAYA
      '    <div class="sa-flyer">',
      '      <div class="sa-flyer-top">',
      '        <div class="sa-siren"><i class="fa-solid fa-bell fa-shake"></i></div>',
      '        <div class="sa-flyer-brand">',
      '          <img src="/assets/images/logoconcasaya.webp" alt="CONCASAYA" class="sa-flyer-logo" onerror="this.outerHTML=\'<div class=&quot;sa-flyer-logo-text&quot;>CONCASAYA<\/div>\'" />',
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
    ].join('\n');
  }

  // ---- Inyectar ----
  function inject() {
    if (document.getElementById('sa-backdrop')) return;
    var wrapper = document.createElement('div');
    wrapper.innerHTML = buildModalHTML();
    // Mover todos los hijos al body
    while (wrapper.firstChild) {
      document.body.appendChild(wrapper.firstChild);
    }
  }

  // ---- Open / Close ----
  function lockScroll(lock) {
    if (lock) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  }

  function open() {
    var backdrop = document.getElementById('sa-backdrop');
    if (!backdrop) return;
    backdrop.classList.add('sa-open');
    backdrop.style.display = 'flex';
    lockScroll(true);
    // Focus en el checkbox para accesibilidad
    setTimeout(function () {
      var cb = document.getElementById('sa-ack-input');
      if (cb) cb.focus({ preventScroll: true });
    }, 350);
  }

  function close(persist) {
    var backdrop = document.getElementById('sa-backdrop');
    if (!backdrop) return;
    backdrop.classList.remove('sa-open');
    lockScroll(false);
    if (persist) markAcknowledged();
    // Mostrar boton de reabrir
    var reopen = document.getElementById('sa-reopen');
    if (reopen) reopen.style.display = 'inline-flex';
    // Quitar del DOM despues de la transicion
    setTimeout(function () {
      backdrop.style.display = 'none';
    }, 300);
  }

  // ---- Wire up ----
  function wire() {
    var backdrop  = document.getElementById('sa-backdrop');
    var btnConfirm= document.getElementById('sa-btn-confirm');
    var btnClose  = document.getElementById('sa-close');
    var reopenBtn = document.getElementById('sa-reopen');

    if (!backdrop) return;

    // Click en el backdrop (fuera del card) cierra el modal
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) {
        close(true);
      }
    });

    // Boton "Entendido, cerrar"
    if (btnConfirm) {
      btnConfirm.addEventListener('click', function () {
        close(true);
      });
    }

    // Boton X
    if (btnClose) {
      btnClose.addEventListener('click', function () {
        close(true);
      });
    }

    // Boton flotante para reabrir
    if (reopenBtn) {
      reopenBtn.addEventListener('click', function () {
        reopenBtn.style.display = 'none';
        open();
      });
    }

    // Escape cierra el modal
    document.addEventListener('keydown', function (e) {
      if (backdrop.classList.contains('sa-open') && e.key === 'Escape') {
        e.preventDefault();
        close(true);
      }
    });
  }

  // ---- Init ----
  function init() {
    inject();
    wire();
    if (shouldShow()) {
      // Mostrar inmediatamente (sin delay) para bloquear al usuario antes que haga click
      // Usamos requestAnimationFrame para asegurar que el DOM esta pintado
      requestAnimationFrame(function () {
        open();
      });
    } else {
      // No mostrar alerta, pero dejar el boton de reabrir visible
      var reopenBtn = document.getElementById('sa-reopen');
      if (reopenBtn) reopenBtn.style.display = 'inline-flex';
    }
  }

  // Asegurar que FontAwesome este disponible para los iconos
  function ensureFontAwesome() {
    if (document.querySelector('link[href*="fontawesome"], link[href*="font-awesome"], script[data-fa-i2svg]')) return;
    if (document.querySelector('[data-fa-i2svg], .fa, .fas, .far, .fab')) return;
    // No agregamos FontAwesome dinamicamente porque el sitio ya lo carga en el head
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ============================================================
  // Fix dropdowns del nav (Empresa / Cobertura)
  // - Toggle con click en el boton
  // - Cerrar con click fuera, click en item, o Escape
  // - Solo desktop (>=1024px). En mobile se usa el menu hamburguesa.
  // ============================================================
  function fixDropdowns() {
    var buttons = document.querySelectorAll('.dropdown > button[aria-haspopup="true"]');
    if (!buttons.length) return;

    function closeAll(except) {
      buttons.forEach(function (btn) {
        if (btn === except) return;
        btn.setAttribute('aria-expanded', 'false');
        var menu = btn.parentElement.querySelector('.dropdown-menu');
        if (menu) {
          menu.style.opacity = '0';
          menu.style.visibility = 'hidden';
          menu.style.transform = 'translateY(10px)';
          menu.style.pointerEvents = 'none';
        }
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        closeAll(btn);
        var menu = btn.parentElement.querySelector('.dropdown-menu');
        if (!menu) return;
        if (expanded) {
          btn.setAttribute('aria-expanded', 'false');
          menu.style.opacity = '0';
          menu.style.visibility = 'hidden';
          menu.style.transform = 'translateY(10px)';
          menu.style.pointerEvents = 'none';
        } else {
          btn.setAttribute('aria-expanded', 'true');
          menu.style.opacity = '1';
          menu.style.visibility = 'visible';
          menu.style.transform = 'translateY(0)';
          menu.style.pointerEvents = 'auto';
        }
      });
    });

    // Click fuera cierra todos
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.dropdown')) closeAll(null);
    });

    // Escape cierra todos
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll(null);
    });

    // Click en un item del menu lo cierra
    document.querySelectorAll('.dropdown-menu a').forEach(function (a) {
      a.addEventListener('click', function () { closeAll(null); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixDropdowns);
  } else {
    fixDropdowns();
  }
})();
