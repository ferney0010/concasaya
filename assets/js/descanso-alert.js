/* ============================================================
 * Aviso de Pausa por Agenda - CONCASAYA
 * Modal inescapable que se muestra automaticamente al abrir
 * cualquier pagina que incluya este script.
 *
 * - Aparece UNA VEZ por sesion (sessionStorage): al abrir la
 *   pestaña. No se vuelve a mostrar en refreshes / navegacion
 *   interna de la misma sesion, pero SI aparece cuando el
 *   usuario cierra la pestaña y vuelve a entrar.
 * - Solo se cierra con la X o el boton "Entendido, cerrar".
 * - Imagen oficial del cliente (2026-09-09).
 * ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'concasaya_da_ack_v1';

  // ---- Persistencia por sesion ----
  function shouldShow() {
    try {
      return !sessionStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return true;
    }
  }
  function markAcknowledged() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch (e) { /* sin sessionStorage, no pasa nada */ }
  }

  // ---- HTML ----
  function buildModalHTML() {
    return [
      '<div id="da-backdrop" role="dialog" aria-modal="true" aria-label="Aviso de pausa CONCASAYA">',
      '  <div id="da-card">',
      '    <button type="button" id="da-close" aria-label="Cerrar aviso">&times;</button>',
      '    <img src="/assets/images/pausa-concasaya.png" alt="CONCASAYA - Pausa programada por agenda completa" class="da-flyer-img" />',
      '    <div class="da-actions">',
      '      <button type="button" id="da-btn-confirm"><i class="fa-solid fa-check"></i> Entendido, cerrar</button>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');
  }

  // ---- Inyectar ----
  function inject() {
    if (document.getElementById('da-backdrop')) return;
    var wrapper = document.createElement('div');
    wrapper.innerHTML = buildModalHTML();
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
    var backdrop = document.getElementById('da-backdrop');
    if (!backdrop) return;
    backdrop.classList.add('da-open');
    backdrop.style.display = 'flex';
    lockScroll(true);
  }

  function close() {
    var backdrop = document.getElementById('da-backdrop');
    if (!backdrop) return;
    backdrop.classList.remove('da-open');
    lockScroll(false);
    markAcknowledged();
    setTimeout(function () {
      backdrop.style.display = 'none';
    }, 300);
  }

  // ---- Wire up ----
  function wire() {
    var backdrop  = document.getElementById('da-backdrop');
    var btnConfirm= document.getElementById('da-btn-confirm');
    var btnClose  = document.getElementById('da-close');

    if (!backdrop) return;

    if (btnConfirm) {
      btnConfirm.addEventListener('click', function () {
        close();
      });
    }

    if (btnClose) {
      btnClose.addEventListener('click', function () {
        close();
      });
    }

    // Escape tambien cierra
    document.addEventListener('keydown', function (e) {
      if (backdrop.classList.contains('da-open') && e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    });
  }

  // ---- Init ----
  function init() {
    inject();
    wire();
    // Aparece una vez por sesion (al abrir la pestaña)
    if (shouldShow()) {
      open();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
