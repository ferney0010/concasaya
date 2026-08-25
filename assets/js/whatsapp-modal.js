// Modal warm-up de WhatsApp con wizard de 2 pasos
// Paso 1: intención del usuario (3 opciones)
// Paso 2: departamento (auto-detectado por URL o selección manual)
// - Detecta el departamento desde el slug del municipio en la URL
// - 3 perfiles de asesores rotativos al azar al abrir el modal
// - Mensaje pre-armado incluye intención + departamento + URL de origen
(function () {
  'use strict';

  // === CONFIG ===
  var WHATSAPP_NUMBER = '573142891018';
  var SESSION_KEY = 'wm_seen_asesor';

  // Mapa slug -> { department, name }. Slugs de paginas de Concasaya con
  // departamento y nombre de municipio identificables por la URL. Santa Marta
  // intencionalmente excluida: no hay cobertura en la costa, asi que el slug
  // "santa-marta" no auto-detecta.
  var SLUG_INFO = {
    // Cundinamarca
    'cajica':            { department: 'Cundinamarca', name: 'Cajica' },
    'chia':              { department: 'Cundinamarca', name: 'Chia' },
    'cota':              { department: 'Cundinamarca', name: 'Cota' },
    'facatativa':        { department: 'Cundinamarca', name: 'Facatativa' },
    'funza':             { department: 'Cundinamarca', name: 'Funza' },
    'fusagasuga':        { department: 'Cundinamarca', name: 'Fusagasuga' },
    'guasca':            { department: 'Cundinamarca', name: 'Guasca' },
    'la-calera':         { department: 'Cundinamarca', name: 'La Calera' },
    'la-mesa':           { department: 'Cundinamarca', name: 'La Mesa' },
    'la-vega':           { department: 'Cundinamarca', name: 'La Vega' },
    'madrid':            { department: 'Cundinamarca', name: 'Madrid' },
    'mesitas-del-colegio': { department: 'Cundinamarca', name: 'Mesitas del Colegio' },
    'mosquera':          { department: 'Cundinamarca', name: 'Mosquera' },
    'norte-bogota':      { department: 'Cundinamarca', name: 'Norte de Bogota' },
    'pacho':             { department: 'Cundinamarca', name: 'Pacho' },
    'san-francisco':     { department: 'Cundinamarca', name: 'San Francisco' },
    'sesquile':          { department: 'Cundinamarca', name: 'Sesquile' },
    'soacha':            { department: 'Cundinamarca', name: 'Soacha' },
    'sopo':              { department: 'Cundinamarca', name: 'Sopo' },
    'suba':              { department: 'Cundinamarca', name: 'Suba' },
    'subachoque':        { department: 'Cundinamarca', name: 'Subachoque' },
    'supata':            { department: 'Cundinamarca', name: 'Supata' },
    'tocancipa':         { department: 'Cundinamarca', name: 'Tocancipa' },
    'villeta':           { department: 'Cundinamarca', name: 'Villeta' },
    'zipaquira':         { department: 'Cundinamarca', name: 'Zipaquira' },
    // Boyaca
    'barbosa':           { department: 'Boyaca', name: 'Barbosa' },
    'boyaca':            { department: 'Boyaca', name: 'Boyaca' },
    'chiquinquira':      { department: 'Boyaca', name: 'Chiquinquira' },
    'choconta':          { department: 'Boyaca', name: 'Choconta' },
    'duitama':           { department: 'Boyaca', name: 'Duitama' },
    'firavitoba':        { department: 'Boyaca', name: 'Firavitoba' },
    'paipa':             { department: 'Boyaca', name: 'Paipa' },
    'puente-nacional':   { department: 'Boyaca', name: 'Puente Nacional' },
    'raquira':           { department: 'Boyaca', name: 'Raquira' },
    'samaca':            { department: 'Boyaca', name: 'Samaca' },
    'sogamoso':          { department: 'Boyaca', name: 'Sogamoso' },
    'tunja':             { department: 'Boyaca', name: 'Tunja' },
    'valle-de-tenza':    { department: 'Boyaca', name: 'Valle de Tenza' },
    'velez':             { department: 'Boyaca', name: 'Velez' },
    'villadeleyva':      { department: 'Boyaca', name: 'Villa de Leyva' }
  };

  var ADVISORS = [
    {
      name: 'Natalia',
      role: 'Asesora comercial',
      initial: 'N',
      gradient: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 100%)',
      welcome: '¡Hola! Soy Natalia. Dime qué necesitas hoy y te oriento enseguida.'
    },
    {
      name: 'Alicia',
      role: 'Asesora comercial',
      initial: 'A',
      gradient: 'linear-gradient(135deg, #005f94 0%, #48cae4 100%)',
      welcome: '¡Hola! Soy Alicia. Cuentame que tipo de casa estas buscando y te ayudo.'
    },
    {
      name: 'Jorge',
      role: 'Asesor comercial',
      initial: 'J',
      gradient: 'linear-gradient(135deg, #023e8a 0%, #0096c7 100%)',
      welcome: '¡Hola! Soy Jorge. Dime en que zona quieres construir y te oriento con precios.'
    }
  ];

  // === INTENCIONES (PASO 1) ===
  var INTENTIONS = [
    {
      id: 'lote',
      icon: 'fa-house-circle-check',
      label: 'Ya tengo lote, quiero cotizar',
      message: 'Ya tengo lote propio y quiero cotizar una casa prefabricada'
    },
    {
      id: 'buscar',
      icon: 'fa-map-location-dot',
      label: 'Todavia busco lote, orientame',
      message: 'Todavia no tengo lote y me gustaria orientarme sobre donde y como construir'
    },
    {
      id: 'exterior',
      icon: 'fa-globe-americas',
      label: 'Estoy en el exterior, quiero cotizar',
      message: 'Estoy en el exterior y quiero cotizar una casa prefabricada en Colombia'
    }
  ];

  // === DEPARTAMENTOS (PASO 2) ===
  var DEPARTMENTS = [
    { id: 'Cundinamarca', icon: 'fa-mountain-sun', label: 'Cundinamarca' },
    { id: 'Boyaca',       icon: 'fa-mountain',     label: 'Boyaca' },
    { id: 'Otro',         icon: 'fa-earth-americas', label: 'Otro' }
  ];

  // === DETECCION DE DEPARTAMENTO POR URL ===
  function detectFromURL() {
    var path = (window.location.pathname || '').toLowerCase();
    // Extraer el ultimo segmento del path sin .html
    var m = path.match(/\/([^\/?#]+?)(?:\.html)?\/?$/);
    if (!m) return null;
    var slug = m[1];
    return SLUG_INFO[slug] || null;
  }

  // === MENSAJE PRE-ARMADO ===
  function buildMessage(intentionId, departmentId, municipality) {
    var head = '';
    var body = '';
    if (intentionId === 'lote') {
      body = 'Ya tengo lote propio y quiero cotizar una casa prefabricada';
    } else if (intentionId === 'buscar') {
      body = 'Todavia no tengo lote y me gustaria orientarme sobre donde y como construir';
    } else if (intentionId === 'exterior') {
      body = 'Estoy en el exterior y quiero cotizar una casa prefabricada en Colombia';
    }
    // Encabezado con municipio (si fue detectado por URL) o sin el
    if (municipality) {
      head = 'Hola, vengo de ' + municipality + ' (' + departmentId + '). ';
    }
    if (intentionId === 'exterior') {
      return 'Hola. ' + body + '.';
    }
    if (departmentId === 'Cundinamarca') {
      return head + body + ' en Cundinamarca.';
    }
    if (departmentId === 'Boyaca') {
      return head + body + ' en Boyaca.';
    }
    return head + body + '. Estoy en otra zona de Colombia.';
  }

  // === UTILIDADES ===
  function pickAdvisor() {
    var counter = 0;
    try {
      var saved = sessionStorage.getItem(SESSION_KEY);
      counter = saved ? parseInt(saved, 10) : 0;
      if (isNaN(counter) || counter < 0) counter = 0;
    } catch (e) {}
    var idx = counter % ADVISORS.length;
    var chosen = ADVISORS[idx];
    try { sessionStorage.setItem(SESSION_KEY, String(counter + 1)); } catch (e) {}
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

  // === HTML DEL MODAL ===
  function buildModalHtml(advisor) {
    return '' +
      '<div id="wm-backdrop" role="dialog" aria-modal="true" aria-labelledby="wm-name" aria-hidden="true">' +
        '<div id="wm-card">' +
          '<div id="wm-header">' +
            '<div class="wm-avatar" style="background:' + advisor.gradient + '">' + advisor.initial + '</div>' +
            '<div class="wm-info">' +
              '<div class="wm-name" id="wm-name">' +
                '<span>' + escapeHtml(advisor.name) + '</span>' +
                ' <span style="opacity:0.85;font-weight:400;font-size:13px;">· ' + escapeHtml(advisor.role) + '</span>' +
              '</div>' +
              '<div class="wm-status">en linea</div>' +
            '</div>' +
            '<button type="button" class="wm-close" aria-label="Cerrar" data-wm-close>' +
              '<i class="fas fa-times"></i>' +
            '</button>' +
          '</div>' +
          '<div id="wm-body">' +
            '<div class="wm-bubble wm-agent" data-wm-bubble="hello">¡Hola! ¿En que te podemos ayudar?</div>' +
            '<div class="wm-bubble wm-typing" data-wm-typing aria-hidden="true">' +
              '<span></span><span></span><span></span>' +
            '</div>' +
            // PASO 1: intencion
            '<div class="wm-step" data-wm-step="1">' +
              '<div class="wm-step-title">Cuentanos que necesitas</div>' +
              '<div class="wm-actions" data-wm-intentions></div>' +
            '</div>' +
            // PASO 2: departamento detectado
            '<div class="wm-step" data-wm-step="2-detected" style="display:none">' +
              '<div class="wm-detected-banner" data-wm-detected-banner></div>' +
              '<div class="wm-actions" data-wm-detected-actions></div>' +
            '</div>' +
            // PASO 2: departamento manual
            '<div class="wm-step" data-wm-step="2-manual" style="display:none">' +
              '<div class="wm-step-title">¿En que departamento estas?</div>' +
              '<div class="wm-actions" data-wm-departments></div>' +
            '</div>' +
            // Boton volver
            '<button type="button" class="wm-back-btn" data-wm-back style="display:none">' +
              '<i class="fas fa-arrow-left"></i> Cambiar de opcion' +
            '</button>' +
          '</div>' +
          '<div id="wm-footer">Conversacion atendida por el equipo de CONCASAYA · Respuesta en menos de 24h</div>' +
        '</div>' +
      '</div>';
  }

  // === ESTADO ===
  var backdrop, card, body, typingEl, currentAdvisor;
  var intentionActionsEl, detectedActionsEl, departmentActionsEl, backBtn;
  var detectedBannerEl, helloBubble;
  var state = {
    intention: null,
    department: null,
    detectedInfo: null  // { department, name } o null
  };

  // === RENDERIZAR PASO 1: INTENCIONES ===
  function renderIntentions() {
    intentionActionsEl.innerHTML = INTENTIONS.map(function (i) {
      var isPrimary = (i.id === 'lote'); // CTA principal: cotizar con lote
      var cls = 'wm-action' + (isPrimary ? ' wm-action-primary' : '');
      return '<button type="button" class="' + cls + '" data-wm-intention="' + i.id + '">' +
               '<i class="fas ' + i.icon + '"></i>' +
               '<span>' + escapeHtml(i.label) + '</span>' +
               (isPrimary ? '<i class="fas fa-arrow-right wm-action-arrow"></i>' : '') +
             '</button>';
    }).join('');
  }

  // === RENDERIZAR PASO 2: DEPARTAMENTO MANUAL ===
  function renderDepartments() {
    departmentActionsEl.innerHTML = DEPARTMENTS.map(function (d, i) {
      var cls = 'wm-action' + (i === 0 ? ' wm-action-primary' : '');
      return '<button type="button" class="' + cls + '" data-wm-department="' + d.id + '">' +
               '<i class="fas ' + d.icon + '"></i>' +
               '<span>' + escapeHtml(d.label) + '</span>' +
             '</button>';
    }).join('');
  }

  // === RENDERIZAR PASO 2: DEPARTAMENTO DETECTADO ===
  function renderDetected() {
    var info = state.detectedInfo;
    var dept = info.department;
    var name = info.name;
    var icon = (dept === 'Cundinamarca') ? 'fa-mountain-sun' : 'fa-mountain';
    detectedBannerEl.innerHTML = '<i class="fas fa-location-dot wm-detected-pin"></i>' +
      '<div class="wm-detected-text">' +
        'Estas viendo la pagina de <strong>' + escapeHtml(name) + '</strong>' +
        '<span class="wm-detected-sub">¿Cotizamos en ' + escapeHtml(dept) + '?</span>' +
      '</div>';
    detectedActionsEl.innerHTML =
      '<button type="button" class="wm-action wm-action-primary" data-wm-department="' + escapeHtml(dept) + '">' +
        '<i class="fas ' + icon + '"></i>' +
        '<span>Si, cotizar en ' + escapeHtml(name) + '</span>' +
        '<i class="fas fa-arrow-right wm-action-arrow"></i>' +
      '</button>' +
      '<button type="button" class="wm-action" data-wm-department="__other__">' +
        '<i class="fas fa-rotate"></i>' +
        '<span>No, es otro departamento</span>' +
      '</button>';
  }

  // === MOSTRAR PASO ===
  function showStep(stepName) {
    var steps = body.querySelectorAll('.wm-step');
    for (var i = 0; i < steps.length; i++) {
      steps[i].style.display = 'none';
    }
    var target = body.querySelector('[data-wm-step="' + stepName + '"]');
    if (target) {
      target.style.display = '';
      // Animar entrada de TODOS los elementos animables (banner + acciones)
      var inners = target.querySelectorAll('.wm-actions, .wm-detected-banner');
      inners.forEach(function (inner) {
        inner.classList.remove('wm-show');
      });
      void target.offsetWidth;
      requestAnimationFrame(function () {
        inners.forEach(function (inner) {
          inner.classList.add('wm-show');
        });
      });
    }
    if (stepName === '1') {
      backBtn.style.display = 'none';
    } else {
      backBtn.style.display = '';
    }
    body.scrollTop = body.scrollHeight;
  }

  // === ENVIAR A WHATSAPP ===
  function sendToWhatsApp() {
    var municipality = (state.detectedInfo && state.intention !== 'exterior') ? state.detectedInfo.name : null;
    var msg = buildMessage(state.intention, state.department, municipality);
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
    close();
    setTimeout(function () { window.open(url, '_blank'); }, 200);
  }

  // === CLICK HANDLERS ===
  function onIntentionClick(e) {
    var btn = e.target.closest('[data-wm-intention]');
    if (!btn) return;
    var id = btn.getAttribute('data-wm-intention');
    state.intention = id;
    if (id === 'exterior') {
      // Exterior salta departamento: ya segmentado
      sendToWhatsApp();
      return;
    }
    // Paso 2: detectado o manual
    if (state.detectedInfo) {
      showStep('2-detected');
    } else {
      showStep('2-manual');
    }
  }

  function onDepartmentClick(e) {
    var btn = e.target.closest('[data-wm-department]');
    if (!btn) return;
    var id = btn.getAttribute('data-wm-department');
    if (id === '__other__') {
      // Usuario rechazo la deteccion: mostrar 3 botones manuales
      state.department = null;
      showStep('2-manual');
      return;
    }
    state.department = id;
    sendToWhatsApp();
  }

  // === OPEN / CLOSE ===
  function open() {
    if (!backdrop) return;
    currentAdvisor = pickAdvisor();
    // Reset estado
    state.intention = null;
    state.department = null;
    state.detectedInfo = detectFromURL();
    // Reset visual: burbuja inicial
    if (helloBubble) {
      helloBubble.textContent = '¡Hola! ¿En que te podemos ayudar?';
      helloBubble.classList.add('wm-show');
      helloBubble.style.display = '';
    }
    typingEl.style.display = 'none';
    // Header
    var avatar = card.querySelector('.wm-avatar');
    var nameEl = card.querySelector('.wm-name');
    avatar.style.background = currentAdvisor.gradient;
    avatar.textContent = currentAdvisor.initial;
    nameEl.innerHTML = '<span>' + escapeHtml(currentAdvisor.name) + '</span>' +
      ' <span style="opacity:0.85;font-weight:400;font-size:13px;">· ' + escapeHtml(currentAdvisor.role) + '</span>';
    // Re-render dinamico segun deteccion
    renderIntentions();
    renderDepartments();
    if (state.detectedInfo) {
      renderDetected();
    }
    // Mostrar backdrop
    backdrop.style.display = 'flex';
    backdrop.setAttribute('aria-hidden', 'false');
    void backdrop.offsetWidth;
    requestAnimationFrame(function () { backdrop.classList.add('wm-open'); });
    // Paso 1
    showStep('1');
    // Animar entrada de intenciones despues de un beat
    setTimeout(function () {
      intentionActionsEl.classList.add('wm-show');
    }, 350);
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

  function onBack() {
    state.intention = null;
    state.department = null;
    showStep('1');
  }

  // === INTERCEPTAR ENLACES WHATSAPP ===
  function interceptWhatsAppLinks() {
    var links = document.querySelectorAll('a[href^="https://wa.me/"]');
    links.forEach(function (a) {
      if (a.__wmBound) return;
      a.__wmBound = true;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        open();
      });
    });
  }

  // === INIT ===
  function init() {
    var tmp = document.createElement('div');
    tmp.innerHTML = buildModalHtml(ADVISORS[0]);
    document.body.appendChild(tmp.firstChild);
    backdrop = document.getElementById('wm-backdrop');
    card = document.getElementById('wm-card');
    body = document.getElementById('wm-body');
    typingEl = body.querySelector('[data-wm-typing]');
    helloBubble = body.querySelector('[data-wm-bubble="hello"]');
    intentionActionsEl = body.querySelector('[data-wm-intentions]');
    detectedActionsEl = body.querySelector('[data-wm-detected-actions]');
    departmentActionsEl = body.querySelector('[data-wm-departments]');
    detectedBannerEl = body.querySelector('[data-wm-detected-banner]');
    backBtn = body.querySelector('[data-wm-back]');
    // Eventos
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) close();
    });
    card.querySelector('[data-wm-close]').addEventListener('click', close);
    intentionActionsEl.addEventListener('click', onIntentionClick);
    detectedActionsEl.addEventListener('click', onDepartmentClick);
    departmentActionsEl.addEventListener('click', onDepartmentClick);
    backBtn.addEventListener('click', onBack);
    interceptWhatsAppLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
