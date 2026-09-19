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
      label: 'Todavia busco lote, que me recomiendan',
      message: 'Todavia no tengo lote. ¿Que me recomiendan para construir una casa prefabricada?'
    },
    {
      id: 'exterior',
      icon: 'fa-globe-americas',
      label: 'Estoy en el exterior, quiero cotizar',
      message: 'Estoy en el exterior y quiero cotizar una casa prefabricada en Colombia'
    }
  ];

  // === FEATURE FLAG: filtro estricto de lote ===
  // Si el <body> tiene data-wm-strict-lote, el flujo 'lote' agrega un paso 3
  // con checklist obligatorio de requisitos antes de abrir WhatsApp.
  // Default: false para no afectar las otras 69 paginas ya desplegadas.
  var STRICT_LOTE = false;
  try { STRICT_LOTE = document.body && document.body.dataset && document.body.dataset.wmStrictLote !== undefined; } catch (e) {}

  // === CHECKLIST CONVERSACIONAL DE LOTE (paso 3, solo si STRICT_LOTE) ===
  // Lista plana de 17 requisitos. Cada uno se muestra como una pregunta
  // "¿Tienes X?" con dos botones (Si / No). El usuario avanza respondiendo
  // una por una; el envio a WhatsApp se habilita al final **sin importar**
  // si cumple todos los requisitos (la duena del sitio decidio relajar el
  // filtro para no perder clientes con lotes incompletos).
  var CHECKLIST = [
    { section: 'Documentacion',         question: '¿Tienes escritura publica del predio?' },
    { section: 'Documentacion',         question: '¿Tu Certificado de Tradicion y Libertad esta actualizado?' },
    { section: 'Documentacion',         question: '¿El predio esta libre de embargos y limitaciones?' },
    { section: 'Documentacion',         question: '¿Tienes area y linderos bien definidos?' },
    { section: 'Viabilidad del lote',   question: '¿El uso del suelo de tu municipio permite construir vivienda?' },
    { section: 'Viabilidad del lote',   question: '¿Tu lote NO tiene afectaciones urbanisticas ni ambientales?' },
    { section: 'Viabilidad del lote',   question: '¿Tu lote NO esta en zona de riesgo que impida construir?' },
    { section: 'Viabilidad del lote',   question: '¿Tienes acceso legal al predio (via propia o servidumbre)?' },
    { section: 'Servicios y condic.',   question: '¿Hay disponibilidad de agua (acueducto o pozo legal)?' },
    { section: 'Servicios y condic.',   question: '¿Hay disponibilidad de energia electrica?' },
    { section: 'Servicios y condic.',   question: '¿Tienes solucion para aguas residuales (alcantarillado o pozo septico)?' },
    { section: 'Servicios y condic.',   question: '¿Tienes manejo de aguas lluvias definido?' },
    { section: 'Servicios y condic.',   question: '¿Ya verificaste las condiciones del terreno (topografia, accesos)?' },
    { section: 'Servicios y condic.',   question: '¿Tienes estudio de suelos, cuando corresponda?' },
    { section: 'Requisitos para const.',question: '¿Tienes viabilidad para obtener licencia de construccion?' },
    { section: 'Requisitos para const.',question: '¿Cuentas con los permisos ambientales necesarios?' },
    { section: 'Requisitos para const.',question: '¿Tienes la licencia de construccion aprobada y vigente?' }
  ];
  var CHECKLIST_TOTAL = CHECKLIST.length;

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
      body = 'Todavia no tengo lote. ¿Que me recomiendan para construir una casa prefabricada?';
    } else if (intentionId === 'exterior') {
      body = 'Estoy en el exterior y quiero cotizar una casa prefabricada en Colombia';
    }
    // Encabezado con municipio (si fue detectado por URL) o sin el
    if (municipality) {
      head = 'Hola, vengo de ' + municipality + ' (' + departmentId + '). ';
    }
    // Bloque destacado: modelo de interes (cuando viene de una card del catalogo)
    var modeloBlock = '';
    if (state.modeloInteres) {
      var tipoTxt = state.adaptarADiseno ? 'Quiero ADAPTAR este diseno a mi lote' : 'Quiero COTIZAR este modelo';
      modeloBlock = '*MODELO DE INTERES*\n' + tipoTxt + ': ' + state.modeloInteres + '\n\n';
    }
    if (intentionId === 'exterior') {
      return modeloBlock + 'Hola. ' + body + '.';
    }
    if (departmentId === 'Cundinamarca') {
      return modeloBlock + head + body + ' en Cundinamarca.';
    }
    if (departmentId === 'Boyaca') {
      return modeloBlock + head + body + ' en Boyaca.';
    }
    return modeloBlock + head + body + '. Estoy en otra zona de Colombia.';
  }

  // === MENSAJE PRE-ARMADO CON CHECKLIST COMPLETADO ===
  // Variante para cuando el usuario pasa el flujo del checklist.
  // Lista TODAS las respuestas (Si y No) agrupadas por seccion con
  // formato Markdown de WhatsApp para que el asesor escanee rapido.
  // - *bold* con asteriscos (se renderiza en negrita en WhatsApp)
  // - Cada item lleva "SI" / "NO" explicito al lado del check (no dependemos
  //   solo del emoji, que puede romperse en algunos clientes)
  // - Emojis ✅ ❌ solo como complemento visual; el texto es la verdad
  // - Sin emojis decorativos (casa, portapapeles) que rompen en algunos
  //   clientes de WhatsApp y editores donde el asesor pueda pegar el texto
  function buildMessageWithChecklist(intentionId, departmentId, municipality) {
    var yesCount = 0;
    var noCount = 0;
    var lines = [];
    lines.push('*NUEVA COTIZACION — CONCASAYA*');
    lines.push('');
    // Bloque destacado: modelo de interes (cuando viene de una card del catalogo)
    if (state.modeloInteres) {
      var tipoTxt = state.adaptarADiseno ? 'Quiero ADAPTAR este diseno a mi lote' : 'Quiero COTIZAR este modelo';
      lines.push('*MODELO DE INTERES*');
      lines.push(tipoTxt + ': ' + state.modeloInteres);
      lines.push('');
    }
    lines.push('Hola, te escribo para cotizar mi casa prefabricada.');
    if (municipality) {
      lines.push('Vengo de ' + municipality + ' (' + departmentId + ').');
    }
    lines.push('');
    lines.push('*RESPUESTAS DEL FILTRO DEL LOTE*');
    // Agrupar por seccion manteniendo el orden del checklist
    var currentSection = null;
    var sections = {};  // sectionName -> {yes, total}
    for (var i = 0; i < state.checklistAnswers.length; i++) {
      var item = CHECKLIST[i];
      var answer = state.checklistAnswers[i];
      if (answer) yesCount++; else noCount++;
      if (!sections[item.section]) sections[item.section] = { yes: 0, total: 0 };
      sections[item.section].total++;
      if (answer) sections[item.section].yes++;
      if (item.section !== currentSection) {
        if (currentSection !== null) {
          lines.push('');
          lines.push('—————————');
          lines.push('');
        }
        currentSection = item.section;
        var s = sections[currentSection];
        lines.push('*' + currentSection + '* — _' + s.yes + '/' + s.total + '_');
      }
      var mark = answer ? '✅' : '❌';
      var ansTxt = answer ? 'SI' : 'NO';
      // Quitar el "?" final y capitalizar la primera letra
      var txt = item.question.replace(/\?$/, '');
      txt = txt.charAt(0).toUpperCase() + txt.slice(1);
      lines.push(mark + '  *' + ansTxt + '* — ' + txt);
    }
    lines.push('');
    lines.push('—————————');
    lines.push('');
    lines.push('*Resumen:* _' + yesCount + ' SI cumplidos_  ·  _' + noCount + ' NO faltantes_  ·  Total ' + CHECKLIST_TOTAL);
    if (noCount === 0) {
      lines.push('');
      lines.push('*Todo esta en regla.*');
    }
    lines.push('');
    lines.push('¿Me puedes orientar?');
    return lines.join('\n');
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
            // Burbuja de saludo inicial (siempre visible al abrir el modal)
            '<div class="wm-bubble wm-agent wm-show" data-wm-bubble="hello">¡Hola! ¿En que te podemos ayudar?</div>' +
            // Typing indicator (oculto al inicio)
            '<div class="wm-bubble wm-typing" data-wm-typing aria-hidden="true" style="display:none">' +
              '<span></span><span></span><span></span>' +
            '</div>' +
            // Contenedor para burbujas dinamicas (user + agent) generadas
            // por las respuestas del usuario.
            '<div data-wm-conversation></div>' +
            // PASO 1: opciones de intencion (la pregunta es una burbuja del agente)
            '<div class="wm-step" data-wm-step="1">' +
              '<div class="wm-actions" data-wm-intentions></div>' +
            '</div>' +
            // PASO 2: departamento detectado (banner + opciones)
            '<div class="wm-step" data-wm-step="2-detected" style="display:none">' +
              '<div class="wm-detected-banner" data-wm-detected-banner></div>' +
              '<div class="wm-actions" data-wm-detected-actions></div>' +
            '</div>' +
            // PASO 2: departamento manual (opciones)
            '<div class="wm-step" data-wm-step="2-manual" style="display:none">' +
              '<div class="wm-actions" data-wm-departments></div>' +
            '</div>' +
            // PASO 3: checklist conversacional — una pregunta a la vez
            // El contenido se genera dinamicamente en startChecklist().
            '<div class="wm-step" data-wm-step="3-checklist" style="display:none">' +
              '<div data-wm-checklist-area></div>' +
            '</div>' +
            // PANTALLA FINAL: cierre con logo + frase + boton enviar (siempre habilitado)
            '<div class="wm-step" data-wm-step="4-final" style="display:none">' +
              '<div class="wm-final-screen">' +
                '<div class="wm-final-screen-logo">' +
                  '<span class="wm-final-screen-logo-text">CONCASAYA</span>' +
                '</div>' +
                '<h3 class="wm-final-screen-title">¿TODO ESTA EN REGLA?</h3>' +
                '<p class="wm-final-screen-sub">¡AHORA SI, PODEMOS CONSTRUIR!</p>' +
                '<p class="wm-final-screen-cta">Nos encargamos de convertir tu lote en un hogar, cumpliendo los requisitos tecnicos y legales necesarios para construir.</p>' +
                '<button type="button" class="wm-checklist-final-cta wm-show" data-wm-checklist-send>' +
                  '<i class="fas fa-paper-plane"></i>' +
                  '<span>Enviar a WhatsApp</span>' +
                '</button>' +
                '<p class="wm-final-screen-note">Si falta algun requisito, el equipo te orientara igual en WhatsApp.</p>' +
              '</div>' +
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
  var detectedBannerEl, helloBubble, conversationEl, checklistAreaEl;
  var state = {
    intention: null,
    department: null,
    detectedInfo: null,        // { department, name } o null
    modeloInteres: null,       // nombre del modelo pre-seleccionado desde una card (ej: "Plaqueta Basico 60m2")
    adaptarADiseno: false,     // true si el usuario queria "adaptar" este modelo a su lote
    checklistAnswers: [],      // [true|false] por cada pregunta respondida
    checklistIndex: 0,         // indice de la pregunta actual (0 a CHECKLIST_TOTAL-1)
    checklistCompleted: false  // true solo si respondio las 17 preguntas
  };

  // === CONVERSACION: burbujas dinamicas ===
  // Cada interaccion del usuario agrega:
  //   1) burbuja verde del usuario con su respuesta
  //   2) typing indicator del agente (~500ms)
  //   3) burbuja del agente con la siguiente pregunta (si aplica)
  // Asi el flujo se siente como un chat real, no como un wizard corporativo.

  function showUserBubble(text) {
    var wrap = document.createElement('div');
    wrap.className = 'wm-bubble wm-bubble-user';
    wrap.innerHTML = '<span class="wm-bubble-text"></span>' +
                     '<span class="wm-bubble-checks" aria-label="Mensaje enviado">' +
                       '<i class="fas fa-check"></i><i class="fas fa-check"></i>' +
                     '</span>';
    wrap.querySelector('.wm-bubble-text').textContent = text;
    conversationEl.appendChild(wrap);
    // Forzar reflow + agregar clase para animacion de entrada
    void wrap.offsetWidth;
    requestAnimationFrame(function () { wrap.classList.add('wm-show'); });
    body.scrollTop = body.scrollHeight;
    return wrap;
  }

  function showTyping() {
    var t = document.createElement('div');
    t.className = 'wm-bubble wm-typing';
    t.setAttribute('data-wm-typing-dynamic', '1');
    t.innerHTML = '<span></span><span></span><span></span>';
    conversationEl.appendChild(t);
    body.scrollTop = body.scrollHeight;
    return t;
  }

  function removeTyping() {
    var ts = conversationEl.querySelectorAll('[data-wm-typing-dynamic]');
    ts.forEach(function (el) { el.remove(); });
  }

  // html: string con HTML (puede tener <strong>, <br>, etc). Se inserta seguro.
  function showAgentBubble(html) {
    var wrap = document.createElement('div');
    wrap.className = 'wm-bubble wm-agent';
    // Permitir solo tags seguros basicos. Para nuestro uso solo necesitamos
    // <strong>, <br> y texto plano.
    wrap.innerHTML = sanitizeAgentHtml(html);
    conversationEl.appendChild(wrap);
    void wrap.offsetWidth;
    requestAnimationFrame(function () { wrap.classList.add('wm-show'); });
    body.scrollTop = body.scrollHeight;
    return wrap;
  }

  function sanitizeAgentHtml(s) {
    // Reemplazar tags <br> por saltos, escapar el resto, luego reinsertar <strong>
    var escaped = escapeHtml(s);
    escaped = escaped.replace(/&lt;br\s*\/?&gt;/gi, '<br>');
    escaped = escaped.replace(/&lt;strong&gt;/gi, '<strong>').replace(/&lt;\/strong&gt;/gi, '</strong>');
    return escaped;
  }

  // Espera typing + delay para simular chat real
  function agentSpeak(html, delayMs, callback) {
    showTyping();
    setTimeout(function () {
      removeTyping();
      showAgentBubble(html);
      if (callback) setTimeout(callback, 250);
    }, delayMs || 600);
  }

  // Limpia todas las burbujas dinamicas (para reset al abrir o back)
  function clearConversation() {
    if (!conversationEl) return;
    while (conversationEl.firstChild) conversationEl.removeChild(conversationEl.firstChild);
  }

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
      // Animar entrada de TODOS los elementos animables (banner + acciones + checklist)
      var inners = target.querySelectorAll('.wm-actions, .wm-detected-banner, .wm-checklist-intro, .wm-checklist-progress, .wm-checklist-section, .wm-checklist-final-cta');
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
    // Mostrar/ocultar boton volver segun paso
    if (stepName === '1' || stepName === '4-final') {
      backBtn.style.display = 'none';
    } else {
      backBtn.style.display = '';
    }
    // Scroll inteligente: paso 1 y pantalla final mantienen el scroll arriba
    // (las opciones o el cierre quedan visibles desde el inicio). Pasos 2/3
    // bajan al fondo para mostrar el contenido nuevo.
    if (stepName === '1' || stepName === '4-final') {
      body.scrollTop = 0;
    } else {
      body.scrollTop = body.scrollHeight;
    }
  }

  // === CHECKLIST CONVERSACIONAL ===
  // El agente hace una pregunta a la vez. El usuario responde Si o No
  // (cada respuesta se muestra como burbuja verde del usuario con check).
  // Al terminar las preguntas se muestra la pantalla final con el
  // boton "Enviar a WhatsApp" (siempre habilitado, sin importar respuestas).
  //
  // TRUCO UX: la barra de progreso usa una curva "fast-then-slow" para que
  // las primeras preguntas llenen la barra rapido y luego se desacelere.
  // Esto evita que el usuario se estrese al ver que "le falta mucho" cuando
  // apenas va por la mitad. Curva: width = (idx/total)^0.5 * 100
  //   idx=0  -> 0%   (acaba de empezar)
  //   idx=1  -> 24%  (1 de 17 respondidas, parece mas)
  //   idx=5  -> 59%
  //   idx=10 -> 80%
  //   idx=16 -> 100% (llego al final)
  // La barra NO muestra el numero de pregunta ni el total (oculto a proposito).
  //
  // ANIMACION SUAVE: el truco es renderizar primero con el width ANTERIOR
  // (sin transicion visible), forzar reflow, y luego cambiar al nuevo width.
  // Asi la transicion CSS se ve fluida del viejo al nuevo valor.
  var lastProgressWidth = 0;  // estado compartido entre renders
  function renderChecklistQuestion(idx) {
    var item = CHECKLIST[idx];
    var ratio = idx / CHECKLIST_TOTAL;          // 0..1
    var eased = Math.pow(ratio, 0.5);            // curva fast-then-slow
    var widthPct = Math.round(eased * 100);
    var progress = '<div class="wm-checklist-progress" aria-label="Pregunta ' +
                     (idx + 1) + ' de ' + CHECKLIST_TOTAL + '">' +
                     '<div class="wm-checklist-progress-bar">' +
                       '<div class="wm-checklist-progress-fill" data-wm-progress-fill style="width:' +
                         lastProgressWidth + '%"></div>' +
                     '</div>' +
                   '</div>';
    var section = '<div class="wm-checklist-section-tag">' +
                    '<i class="fas fa-tag"></i> ' + escapeHtml(item.section) +
                  '</div>';
    var question = '<div class="wm-checklist-question">' +
                     section +
                     '<strong>' + escapeHtml(item.question) + '</strong>' +
                   '</div>';
    var actions = '<div class="wm-yn-actions">' +
                    '<button type="button" class="wm-yn-btn wm-yn-yes" data-wm-yn="1">' +
                      '<i class="fas fa-check"></i> Si' +
                    '</button>' +
                    '<button type="button" class="wm-yn-btn wm-yn-no" data-wm-yn="0">' +
                      '<i class="fas fa-times"></i> No' +
                    '</button>' +
                  '</div>';
    checklistAreaEl.innerHTML = progress + question + actions;
    var fillEl = checklistAreaEl.querySelector('[data-wm-progress-fill]');
    var inners = checklistAreaEl.querySelectorAll('.wm-checklist-progress, .wm-checklist-section-tag, .wm-checklist-question, .wm-yn-btn');
    inners.forEach(function (el) { el.classList.remove('wm-show'); });
    // Forzar reflow para que el browser aplique el width viejo
    // antes de animar al nuevo (sin esto, salta de golpe)
    void checklistAreaEl.offsetWidth;
    requestAnimationFrame(function () {
      inners.forEach(function (el) { el.classList.add('wm-show'); });
      // Ahora cambiamos al width nuevo: la transicion CSS toma efecto
      if (fillEl) fillEl.style.width = widthPct + '%';
      lastProgressWidth = widthPct;
    });
  }

  // Inicia el checklist: limpia respuestas previas y muestra la primera pregunta
  function startChecklist() {
    state.checklistAnswers = [];
    state.checklistIndex = 0;
    state.checklistCompleted = false;
    lastProgressWidth = 0;
    renderChecklistQuestion(0);
  }

  // Handler cuando el usuario responde Si o No
  function onChecklistYesNo(e) {
    var btn = e.target.closest('[data-wm-yn]');
    if (!btn) return;
    // Tomar el valor antes de ocultar los botones (por si reusan el area)
    var answer = btn.getAttribute('data-wm-yn') === '1';
    var idx = state.checklistIndex;
    var item = CHECKLIST[idx];
    // Registrar respuesta
    state.checklistAnswers[idx] = answer;
    // 1) Burbuja verde del usuario
    showUserBubble(answer ? 'Si' : 'No');
    // 2) Ocultar los botones Si/No (los reemplazamos por la burbuja)
    var yn = checklistAreaEl.querySelector('.wm-yn-actions');
    if (yn) yn.style.display = 'none';
    // 3) Avanzar
    var next = idx + 1;
    state.checklistIndex = next;
    if (next < CHECKLIST_TOTAL) {
      // Siguiente pregunta despues de un breve typing
      setTimeout(function () {
        showTyping();
        setTimeout(function () {
          removeTyping();
          renderChecklistQuestion(next);
          body.scrollTop = body.scrollHeight;
        }, 450);
      }, 250);
    } else {
      // Terminaron las 17 preguntas: ir a pantalla final
      state.checklistCompleted = true;
      setTimeout(function () { showStep('4-final'); }, 600);
    }
  }

  // === ENVIAR A WHATSAPP ===
  // Si el checklist estricto fue completado, primero muestra la pantalla
  // final con logo + frase durante ~1.5s y luego abre wa.me. Esto replica
  // exactamente el flujo aprobado por la duena del sitio.
  function sendToWhatsApp() {
    var municipality = (state.detectedInfo && state.intention !== 'exterior') ? state.detectedInfo.name : null;
    var cameFromChecklist = (STRICT_LOTE && state.intention === 'lote' && state.checklistCompleted);
    var msg = cameFromChecklist
      ? buildMessageWithChecklist(state.intention, state.department, municipality)
      : buildMessage(state.intention, state.department, municipality);
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
    if (cameFromChecklist) {
      showStep('4-final');
      setTimeout(function () {
        close();
        setTimeout(function () { window.open(url, '_blank'); }, 200);
      }, 1600);
    } else {
      close();
      setTimeout(function () { window.open(url, '_blank'); }, 200);
    }
  }

  // === CLICK HANDLERS ===
  function onIntentionClick(e) {
    var btn = e.target.closest('[data-wm-intention]');
    if (!btn) return;
    var id = btn.getAttribute('data-wm-intention');
    var intention = null;
    for (var i = 0; i < INTENTIONS.length; i++) {
      if (INTENTIONS[i].id === id) { intention = INTENTIONS[i]; break; }
    }
    if (!intention) return;
    state.intention = id;
    // 1) Burbuja verde del usuario con la opcion elegida
    showUserBubble(intention.label);
    // 2) Ocultar las opciones del paso 1 (se reemplazan por la burbuja)
    intentionActionsEl.style.display = 'none';
    // Exterior: salta departamento, va directo a WhatsApp
    if (id === 'exterior') {
      setTimeout(function () { sendToWhatsApp(); }, 700);
      return;
    }
    // 3) Agente pregunta el departamento (typing + burbuja)
    var nextStep = state.detectedInfo ? '2-detected' : '2-manual';
    var questionHtml;
    if (state.detectedInfo) {
      questionHtml = 'Veo que estas en la pagina de <strong>' + state.detectedInfo.name + '</strong>. ¿Cotizamos en <strong>' + state.detectedInfo.department + '</strong>?';
    } else {
      questionHtml = '¿En que departamento estas?';
    }
    agentSpeak(questionHtml, 650, function () {
      showStep(nextStep);
    });
  }

  function onDepartmentClick(e) {
    var btn = e.target.closest('[data-wm-department]');
    if (!btn) return;
    var id = btn.getAttribute('data-wm-department');
    // Caso "__other__": el usuario rechazo la deteccion por URL
    if (id === '__other__') {
      // Burbuja verde con la respuesta del usuario
      showUserBubble('No, es otro departamento');
      // Ocultar opciones del paso 2-detected
      detectedActionsEl.style.display = 'none';
      state.department = null;
      // Agente pregunta el departamento real
      agentSpeak('¿En que departamento estas entonces?', 650, function () {
        showStep('2-manual');
      });
      return;
    }
    // Caso normal: usuario eligio un departamento
    var deptLabel = id;
    if (state.detectedInfo) {
      // Venia del paso 2-detected: el boton primario dice "Si, cotizar en [municipio]"
      deptLabel = 'Si, cotizar en ' + state.detectedInfo.name;
    } else {
      // Tomar el label del departamento desde la lista
      for (var k = 0; k < DEPARTMENTS.length; k++) {
        if (DEPARTMENTS[k].id === id) { deptLabel = DEPARTMENTS[k].label; break; }
      }
    }
    showUserBubble(deptLabel);
    state.department = id;
    // Ocultar las opciones del paso actual
    if (state.detectedInfo) {
      detectedActionsEl.style.display = 'none';
    } else {
      departmentActionsEl.style.display = 'none';
    }
    // Si el modo estricto esta activo y la intencion es 'lote', ir al paso 3
    // (checklist conversacional obligatorio) en lugar de abrir WhatsApp directo.
    if (STRICT_LOTE && state.intention === 'lote') {
      // Agente "habla" con intro del checklist antes de mostrarlo
      agentSpeak('<strong>Antes de cotizar</strong>, te hare algunas preguntas necesarias sobre tu lote. Si falta algun requisito, no te preocupes: el equipo te orientara igual en WhatsApp.', 700, function () {
        startChecklist();
        showStep('3-checklist');
      });
      return;
    }
    // Sin checklist estricto: despedida breve del agente y abre WhatsApp
    agentSpeak('¡Perfecto! Te conecto con un asesor en WhatsApp.', 650, function () {
      sendToWhatsApp();
    });
  }

  // === OPEN / CLOSE ===
  // intentionId (opcional): si viene de un enlace con data-wm-intent, se
  // pre-selecciona la intencion y se salta el paso 1 para no volver a
  // preguntar lo mismo. Valores validos: 'lote' | 'buscar' | 'exterior'.
  function open(intentionId) {
    if (!backdrop) return;
    currentAdvisor = pickAdvisor();
    // Reset estado. Si el trigger ya definio la intencion, la conservamos.
    state.intention = intentionId || null;
    state.department = null;
    state.detectedInfo = detectFromURL();
    state.checklistCompleted = false;  // cada apertura del modal empieza de cero
    state.checklistAnswers = [];
    state.checklistIndex = 0;
    lastProgressWidth = 0;
    // Reset visual: burbuja inicial
    if (helloBubble) {
      // Personalizar saludo cuando viene con modelo pre-seleccionado
      var helloText = '¡Hola! ¿En que te podemos ayudar?';
      if (state.modeloInteres) {
        var tipoTxt = state.adaptarADiseno ? 'adaptar a tu lote' : 'cotizar';
        helloText = '¡Hola! Veo que te interesa ' + tipoTxt + ' el modelo *' + state.modeloInteres + '*. Cuentame, ¿como te podemos ayudar?';
      }
      helloBubble.textContent = helloText;
      helloBubble.classList.add('wm-show');
      helloBubble.style.display = '';
    }
    typingEl.style.display = 'none';
    // Limpiar burbujas dinamicas y opciones para empezar de cero
    clearConversation();
    intentionActionsEl.style.display = '';
    departmentActionsEl.style.display = '';
    detectedActionsEl.style.display = '';
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
    // Decidir paso inicial
    if (intentionId === 'exterior') {
      // Exterior ya segmentado: salta directo a WhatsApp
      sendToWhatsApp();
    } else if (intentionId) {
      // Intencion pre-seleccionada: ir directo a paso 2
      if (state.detectedInfo) {
        showStep('2-detected');
      } else {
        showStep('2-manual');
      }
    } else {
      // Sin intencion previa: paso 1 normal
      showStep('1');
      setTimeout(function () {
        intentionActionsEl.classList.add('wm-show');
      }, 350);
    }
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
    state.checklistCompleted = false;
    state.checklistAnswers = [];
    state.checklistIndex = 0;
    lastProgressWidth = 0;
    // Limpiar burbujas dinamicas para volver al estado inicial
    clearConversation();
    // Restaurar visibilidad de las opciones del paso 1
    intentionActionsEl.style.display = '';
    departmentActionsEl.style.display = '';
    detectedActionsEl.style.display = '';
    // Limpiar el area del checklist (se regenera al entrar al paso 3)
    if (checklistAreaEl) checklistAreaEl.innerHTML = '';
    showStep('1');
  }

  // === CLICK EN BOTON "ENVIAR A WHATSAPP" DEL CHECKLIST ===
  // El boton de envio esta siempre habilitado; el usuario puede enviar
  // el mensaje a WhatsApp incluso si no cumple todos los requisitos.
  function onChecklistSendClick(e) {
    var btn = e.target.closest('[data-wm-checklist-send]');
    if (!btn) return;
    state.checklistCompleted = true;
    sendToWhatsApp();
  }

  // === INTERCEPTAR ENLACES WHATSAPP ===
  // Si el enlace tiene data-wm-intent, se pre-selecciona la intencion
  // y se salta el paso 1 del modal. Asi no se vuelve a preguntar lo
  // mismo cuando el usuario ya eligio desde una tarjeta visible.
  // Si tiene data-wm-modelo, lo guarda para incluirlo en el resumen final.
  function interceptWhatsAppLinks() {
    var links = document.querySelectorAll('a[href^="https://wa.me/"]');
    links.forEach(function (a) {
      if (a.__wmBound) return;
      a.__wmBound = true;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var intent   = a.getAttribute('data-wm-intent');
        var modelo   = a.getAttribute('data-wm-modelo');
        var adaptar  = a.getAttribute('data-wm-adaptar') === '1';
        // Guardar el modelo y el flag de adaptar para incluirlo en el mensaje final
        state.modeloInteres  = modelo || null;
        state.adaptarADiseno = !!adaptar;
        open(intent);
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
    conversationEl = body.querySelector('[data-wm-conversation]');
    checklistAreaEl = body.querySelector('[data-wm-checklist-area]');
    // Eventos
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) close();
    });
    card.querySelector('[data-wm-close]').addEventListener('click', close);
    intentionActionsEl.addEventListener('click', onIntentionClick);
    detectedActionsEl.addEventListener('click', onDepartmentClick);
    departmentActionsEl.addEventListener('click', onDepartmentClick);
    backBtn.addEventListener('click', onBack);
    // Checklist conversacional: delegation en el area del checklist para
    // capturar clicks en los botones Si/No (se regeneran en cada pregunta).
    if (checklistAreaEl) {
      checklistAreaEl.addEventListener('click', onChecklistYesNo);
    }
    var sendBtn = body.querySelector('[data-wm-checklist-send]');
    if (sendBtn) sendBtn.addEventListener('click', onChecklistSendClick);
    interceptWhatsAppLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
