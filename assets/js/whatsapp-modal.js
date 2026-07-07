// Modal warm-up de WhatsApp
// - Inyecta el HTML del modal en cualquier pagina que incluya este script
// - Detecta todos los <a href="https://wa.me/..."> y los intercepta para abrir el modal
// - Al click en una opcion rapida del modal, cierra el modal y abre WhatsApp con prefill
// - 3 perfiles de asesores rotativos al azar al abrir el modal
(function () {
  'use strict';

  // === CONFIG ===
  var WHATSAPP_NUMBER = '573142891018';
  var SESSION_KEY = 'wm_seen_asesor';

  var ADVISORS = [
    {
      name: 'Natalia',
      role: 'Asesora comercial',
      initial: 'N',
      gradient: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 100%)',
      welcome: '\u00a1Hola! \u00bfC\u00f3mo te llamas? Cu\u00e9ntame qu\u00e9 tipo de casa buscas y te ayudo a encontrar la ideal.'
    },
    {
      name: 'Alicia',
      role: 'Asesora comercial',
      initial: 'A',
      gradient: 'linear-gradient(135deg, #005f94 0%, #48cae4 100%)',
      welcome: '\u00a1Hola! Soy Alicia, tu asesora en CONCASAYA. Estoy aqu\u00ed para resolver tus dudas sobre casas prefabricadas.'
    },
    {
      name: 'Jorge',
      role: 'Asesor comercial',
      initial: 'J',
      gradient: 'linear-gradient(135deg, #023e8a 0%, #0096c7 100%)',
      welcome: '\u00a1Hola! Soy Jorge. Dime en qu\u00e9 municipio buscas tu casa y te oriento con precios y tiempos.'
    }
  ];

  var ACTIONS = [
    {
      label: 'Quiero cotizar mi casa',
      icon: 'fa-calculator',
      text: 'Hola, vi su p\u00e1gina y quiero cotizar una casa prefabricada. \u00bfMe pueden ayudar con un estimado?'
    },
    {
      label: 'Ver modelos disponibles',
      icon: 'fa-house',
      text: 'Hola, vi los modelos en su web. \u00bfPueden mostrarme los disponibles con precios y zonas de cobertura?'
    },
    {
      label: 'Hablar con un asesor humano',
      icon: 'fa-headset',
      text: 'Hola, me gustar\u00eda hablar con un asesor humano sobre una casa prefabricada en Bogot\u00e1 o Cundinamarca.'
    }
  ];

  // === UTILIDADES ===
  function pickAdvisor() {
    // Rota entre los 3 asesores para que no salga siempre el mismo
    // (sesion-aware: si reabre el modal en la misma sesion, mantiene el mismo)
    try {
      var saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        var found = ADVISORS.find(function (a) { return a.name === saved; });
        if (found) return found;
      }
    } catch (e) { /* sessionStorage puede no estar disponible */ }
    var idx = Math.floor(Math.random() * ADVISORS.length);
    var chosen = ADVISORS[idx];
    try { sessionStorage.setItem(SESSION_KEY, chosen.name); } catch (e) {}
    return chosen;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildModalHtml(advisor) {
    var adv = advisor;
    var actionsHtml = ACTIONS.map(function (a, i) {
      return '<button type="button" class="wm-action" data-action-idx="' + i + '">' +
               '<i class="fas ' + a.icon + '"></i>' +
               '<span>' + escapeHtml(a.label) + '</span>' +
             '</button>';
    }).join('');
    return '' +
      '<div id="wm-backdrop" role="dialog" aria-modal="true" aria-labelledby="wm-name" aria-hidden="true">' +
        '<div id="wm-card">' +
          '<div id="wm-header">' +
            '<div class="wm-avatar" style="background:' + adv.gradient + '">' + adv.initial + '</div>' +
            '<div class="wm-info">' +
              '<div class="wm-name" id="wm-name">' +
                '<span>' + escapeHtml(adv.name) + '</span>' +
                ' <span style="opacity:0.85;font-weight:400;font-size:13px;">\u00b7 ' + escapeHtml(adv.role) + '</span>' +
              '</div>' +
              '<div class="wm-status">en l\u00ednea</div>' +
            '</div>' +
            '<button type="button" class="wm-close" aria-label="Cerrar" data-wm-close>' +
              '<i class="fas fa-times"></i>' +
            '</button>' +
          '</div>' +
          '<div id="wm-body">' +
            '<div class="wm-bubble wm-agent" data-wm-msg="0">\u00a1Hola! \u00bfEn qu\u00e9 te podemos ayudar?</div>' +
            '<div class="wm-bubble wm-typing" data-wm-typing aria-hidden="true">' +
              '<span></span><span></span><span></span>' +
            '</div>' +
            '<div class="wm-bubble wm-agent" data-wm-msg="1" style="display:none"></div>' +
            '<div class="wm-actions">' + actionsHtml + '</div>' +
          '</div>' +
          '<div id="wm-footer">Conversaci\u00f3n atendida por el equipo de CONCASAYA \u00b7 Respuesta en menos de 24h</div>' +
        '</div>' +
      '</div>';
  }

  // === ESTADO ===
  var backdrop, card, body, msgEls, typingEl, actionsEl, currentAdvisor;

  // === MOSTRAR BURBUJA + TYPING ===
  function showMessage(idx, text) {
    var el = msgEls[idx];
    if (!el) return;
    el.textContent = text;
    el.classList.add('wm-show');
    el.style.display = '';
    body.scrollTop = body.scrollHeight;
  }

  function runTypingThenShow(idx, text, delayBefore) {
    typingEl.style.display = '';
    body.scrollTop = body.scrollHeight;
    setTimeout(function () {
      typingEl.style.display = 'none';
      showMessage(idx, text);
    }, delayBefore);
  }

  // === OPEN / CLOSE ===
  function open() {
    if (!backdrop) return;
    currentAdvisor = pickAdvisor();
    // Reset
    msgEls[0].textContent = '\u00a1Hola! \u00bfEn qu\u00e9 te podemos ayudar?';
    msgEls[0].classList.add('wm-show');
    msgEls[0].style.display = '';
    msgEls[1].classList.remove('wm-show');
    msgEls[1].style.display = 'none';
    msgEls[1].textContent = '';
    typingEl.style.display = 'none';
    actionsEl.classList.remove('wm-show');
    // Header: actualizar avatar con el asesor elegido
    var avatar = card.querySelector('.wm-avatar');
    var nameEl = card.querySelector('.wm-name');
    avatar.style.background = currentAdvisor.gradient;
    avatar.textContent = currentAdvisor.initial;
    nameEl.innerHTML = '<span>' + escapeHtml(currentAdvisor.name) + '</span>' +
      ' <span style="opacity:0.85;font-weight:400;font-size:13px;">\u00b7 ' + escapeHtml(currentAdvisor.role) + '</span>';
    // Mostrar backdrop
    backdrop.style.display = 'flex';
    backdrop.setAttribute('aria-hidden', 'false');
    // Forzar reflow para que la animacion de entrada funcione
    void backdrop.offsetWidth;
    requestAnimationFrame(function () { backdrop.classList.add('wm-open'); });
    // Secuencia de burbujas
    setTimeout(function () {
      runTypingThenShow(1, currentAdvisor.welcome, 1200);
    }, 700);
    setTimeout(function () {
      actionsEl.classList.add('wm-show');
      body.scrollTop = body.scrollHeight;
    }, 2400);
    // Cerrar con ESC
    document.addEventListener('keydown', onKey);
  }

  function close() {
    if (!backdrop) return;
    backdrop.classList.remove('wm-open');
    backdrop.setAttribute('aria-hidden', 'true');
    setTimeout(function () { backdrop.style.display = 'none'; }, 250);
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) { if (e.key === 'Escape') close(); }

  // === CLICK EN ACCION ===
  function onAction(e) {
    var btn = e.target.closest('.wm-action');
    if (!btn) return;
    var idx = parseInt(btn.getAttribute('data-action-idx'), 10);
    var a = ACTIONS[idx];
    if (!a) return;
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(a.text);
    close();
    // Peque\u00f1o delay para que se vea el cierre del modal antes de abrir WhatsApp
    setTimeout(function () { window.open(url, '_blank'); }, 200);
  }

  // === INTERCEPTAR ENLACES WHATSAPP ===
  function interceptWhatsAppLinks() {
    var links = document.querySelectorAll('a[href^="https://wa.me/"]');
    links.forEach(function (a) {
      // Evitar duplicar listeners
      if (a.__wmBound) return;
      a.__wmBound = true;
      a.addEventListener('click', function (e) {
        // Si el link tiene target=_blank, dejamos que se abra normal (caso tipico en la barra social)
        // pero abrimos nuestro modal primero para warm-up
        e.preventDefault();
        open();
      });
    });
  }

  // === INIT ===
  function init() {
    // Inyectar el HTML del modal
    var tmp = document.createElement('div');
    tmp.innerHTML = buildModalHtml(ADVISORS[0]); // placeholder
    document.body.appendChild(tmp.firstChild);
    // Capturar referencias
    backdrop = document.getElementById('wm-backdrop');
    card = document.getElementById('wm-card');
    body = document.getElementById('wm-body');
    msgEls = body.querySelectorAll('[data-wm-msg]');
    typingEl = body.querySelector('[data-wm-typing]');
    actionsEl = body.querySelector('.wm-actions');
    // Eventos
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) close();
    });
    card.querySelector('[data-wm-close]').addEventListener('click', close);
    body.addEventListener('click', onAction);
    // Interceptar todos los enlaces wa.me existentes
    interceptWhatsAppLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
