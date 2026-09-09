/* ============================================================
 * Aviso de Pausa por Agenda - CONCASAYA
 * Modal inescapable que se muestra automaticamente al abrir
 * cualquier pagina que incluya este script.
 *
 * - Aparece en la primera carga (modal inescapable con backdrop).
 * - Persistencia 7 dias: no se vuelve a mostrar al mismo usuario
 *   durante una semana (localStorage).
 * - Solo se cierra con la X o el boton "Entendido".
 * - Copy literal aprobado por el cliente (2026-09-09).
 * ============================================================ */
(function () {
  'use strict';

  var CONFIG = {
    storageKey: 'concasaya_da_ack_v1',
    showAgainAfterDays: 7
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

  // ---- HTML ----
  function buildModalHTML() {
    return [
      '<div id="da-backdrop" role="dialog" aria-modal="true" aria-label="Aviso de pausa CONCASAYA">',
      '  <div id="da-card">',
      '    <button type="button" id="da-close" aria-label="Cerrar aviso">&times;</button>',
      '    <img src="/assets/images/pausa-concasaya.jpeg" alt="CONCASAYA - Pausa programada por agenda completa" class="da-flyer-img" />',
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

  function close(persist) {
    var backdrop = document.getElementById('da-backdrop');
    if (!backdrop) return;
    backdrop.classList.remove('da-open');
    lockScroll(false);
    if (persist) markAcknowledged();
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

    // Click en el backdrop (fuera del card) NO cierra el modal
    // (es inescapable para que el usuario se entere de la pausa).

    if (btnConfirm) {
      btnConfirm.addEventListener('click', function () {
        close(true);
      });
    }

    if (btnClose) {
      btnClose.addEventListener('click', function () {
        close(true);
      });
    }

    // Escape tambien cierra (con persistencia)
    document.addEventListener('keydown', function (e) {
      if (backdrop.classList.contains('da-open') && e.key === 'Escape') {
        e.preventDefault();
        close(true);
      }
    });
  }

  // ---- Init ----
  function init() {
    inject();
    wire();
    // Aparece automaticamente al cargar (con persistencia 7 dias)
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
