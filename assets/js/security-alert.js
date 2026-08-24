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
      '<div id="sa-backdrop" role="dialog" aria-modal="true" aria-labelledby="sa-title" aria-describedby="sa-subtitle">',
      '  <div id="sa-card">',
      '    <div id="sa-header">',
      '      <div id="sa-icon"><i class="fa-solid fa-shield-halved"></i></div>',
      '      <div id="sa-header-text">',
      '        <span id="sa-eyebrow">Alerta de seguridad</span>',
      '        <h2 id="sa-title">Evite estafas: use solo los canales oficiales de CONCASAYA</h2>',
      '        <p id="sa-subtitle">Hemos detectado suplantaciones de nuestra marca en redes y mensajeria. Antes de cualquier pago o contrato, valide que esta hablando con nosotros.</p>',
      '      </div>',
      '    </div>',
      '    <div id="sa-body">',
      '      <div class="sa-callout">',
      '        <i class="fa-solid fa-triangle-exclamation"></i>',
      '        <div><strong>CONCASAYA nunca exige dinero</strong> por proyectos sin un contrato firmado y verificable. Si alguien se lo esta pidiendo por fuera de estos canales, <strong>es una estafa</strong>.</div>',
      '      </div>',
      '      <div class="sa-rule sa-rule--bad">',
      '        <i class="fa-solid fa-circle-xmark"></i>',
      '        <div>No transferimos, no pedimos anticipos a cuentas personales ni a nombres de terceros.</div>',
      '      </div>',
      '      <div class="sa-rule sa-rule--bad">',
      '        <i class="fa-solid fa-circle-xmark"></i>',
      '        <div>No cotizamos, no cerramos negocios ni recibimos pagos por cuentas de Facebook Marketplace, Marketplace de Instagram, grupos de WhatsApp que no sean estos numeros, ni perfiles falsos en TikTok.</div>',
      '      </div>',
      '      <div class="sa-rule sa-rule--ok">',
      '        <i class="fa-solid fa-circle-check"></i>',
      '        <div>Todo pago se realiza unicamente despues de firmar contrato, en cuentas a nombre de <strong>CONCASAYA</strong> y con factura electronica.</div>',
      '      </div>',
      '      <div class="sa-rule sa-rule--alert">',
      '        <i class="fa-solid fa-gavel"></i>',
      '        <div><strong>Todo contrato donde CONCASAYA reciba dinero debe ir firmado por las partes y autenticado ante notaria.</strong> Si no cumple ambas condiciones, no representa compromiso alguno para la empresa y podria tratarse de una suplantacion.</div>',
      '      </div>',
      '      <div class="sa-channels">',
      '        <p class="sa-channels-title"><i class="fa-solid fa-shield-check"></i> Canales oficiales verificados</p>',
        buildChannelsHTML(),
      '      </div>',
      '    </div>',
      '    <div id="sa-footer">',
      '      <label id="sa-acknowledge">',
      '        <input type="checkbox" id="sa-ack-input" />',
      '        <span>Confirmo que entendi la alerta, conozco los canales oficiales y se que todo contrato de CONCASAYA debe ir firmado y autenticado ante notaria para que reciba dinero.</span>',
      '      </label>',
      '      <div id="sa-buttons">',
      '        <button type="button" id="sa-btn-policy"><i class="fa-solid fa-file-shield"></i> Ver politica de proteccion</button>',
      '        <button type="button" id="sa-btn-confirm" disabled><i class="fa-solid fa-lock"></i> Marcar como leido y continuar</button>',
      '      </div>',
      '      <p id="sa-footer-note">Si ya realizo un pago a un canal no oficial, esta alerta no representa un reconocimiento de la operacion. Dirijase a nuestra politica de proteccion para conocer los pasos a seguir.</p>',
      '    </div>',
      '  </div>',
      '</div>',
      '<button type="button" id="sa-reopen" aria-label="Ver alerta de seguridad"><i class="fa-solid fa-shield-halved"></i> Alerta de seguridad</button>'
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
    var ackInput  = document.getElementById('sa-ack-input');
    var btnPolicy = document.getElementById('sa-btn-policy');
    var btnConfirm= document.getElementById('sa-btn-confirm');
    var reopenBtn = document.getElementById('sa-reopen');

    if (!backdrop) return;

    // Bloquear cierre con click fuera o ESC: la alerta es inescapable hasta confirmar
    backdrop.addEventListener('click', function (e) {
      // Solo el contenido de la card evita el cierre
      if (e.target === backdrop) {
        // Suave "sacudida" del card para indicar que no se cierra afuera
        var card = document.getElementById('sa-card');
        if (card) {
          card.style.transform = 'translateX(-6px)';
          setTimeout(function(){ card.style.transform = 'translateX(6px)'; }, 70);
          setTimeout(function(){ card.style.transform = 'translateX(-4px)'; }, 140);
          setTimeout(function(){ card.style.transform = 'translateX(0)'; }, 210);
        }
      }
    });

    if (ackInput) {
      ackInput.addEventListener('change', function () {
        var on = ackInput.checked;
        btnConfirm.disabled = !on;
        if (on) {
          btnConfirm.classList.add('sa-btn-confirm--ready');
        } else {
          btnConfirm.classList.remove('sa-btn-confirm--ready');
        }
      });
    }

    if (btnPolicy) {
      btnPolicy.addEventListener('click', function () {
        window.open(CONFIG.policyUrl, '_blank', 'noopener');
      });
    }

    if (btnConfirm) {
      btnConfirm.addEventListener('click', function () {
        if (btnConfirm.disabled) return;
        if (!ackInput || !ackInput.checked) return;
        close(true);
      });
    }

    if (reopenBtn) {
      reopenBtn.addEventListener('click', function () {
        // Reabrir pero NO marcar como acknowledged (no persistir en esta sesion)
        if (ackInput) {
          ackInput.checked = false;
          btnConfirm.disabled = true;
          btnConfirm.classList.remove('sa-btn-confirm--ready');
        }
        reopenBtn.style.display = 'none';
        open();
      });
    }

    // Bloquear ESC (inescapable)
    document.addEventListener('keydown', function (e) {
      if (backdrop.classList.contains('sa-open') && e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
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
})();
