/* ==========================================================================
   GUÍA COMERCIAL CONCASAYA — lógica de la presentación
   /guia-comercial/
   Navegación sin recarga, guía del asesor por módulo, pantalla completa,
   atajos de teclado, lightbox y diagnóstico en vivo (sin persistencia).
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------- utilidad */
  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* Marca que el JS corrio: habilita las animaciones de entrada.
     Se pone al inicio para que no haya un destello de contenido ya oculto. */
  document.body.classList.add('gc-js');

  /* ------------------------------------------------- orden de las pantallas */
  const slides = $$('.gc-slide');
  const titles = slides.map(s => ({
    id: s.id,
    modulo: s.dataset.modulo || '',
    titulo: s.dataset.titulo || ''
  }));

  const byId = {};
  titles.forEach((t, i) => { byId[t.id] = i; });

  let current = 0;

  /* ------------------------------------------- guía del asesor por módulo */
  const GUIA = {
    indice: {
      explica: [
        'Esta es la pantalla de arranque: ubique al cliente y ubique el punto de partida del recorrido.',
        'Muestre el hero en una frase: son ocho temas para explicar el proyecto de principio a fin.',
        'Los 8 temas están en tarjetas con foto: se puede saltar directamente al que interese.',
        'Aclare que las fotos que verá son obra real terminada y entregada.'
      ],
      pregunta: '¿Sobre cuál de estos ocho temas quiere empezar a hablar?',
      confirma: ['Si ya tiene terreno y en qué municipio', 'Si viene a ver el showroom o quiere visita a obra'],
      dudas: ['"¿Y esto es más caro que una casa normal?"'],
      transicion: 'Empecemos por lo más importante: qué es exactamente una casa prefabricada.'
    },
    'mod-1': {
      explica: [
        'La idea que debe quedar: los componentes se fabrican en planta y se ensamblan en el terreno. No es una casa "de paquete", es una obra con proyecto.',
        'Nombre los sistemas de CONCASAYA: plaqueta de concreto, construcción en seco y construcción modular.',
        'Explique con la foto del panel cómo se ve un componente real antes de llegar a la obra.',
        'Sea explícito: no todas las casas prefabricadas son iguales; lo que define el resultado es el sistema, el acabado y el control de obra.'
      ],
      pregunta: '¿Ya había visto una casa prefabricada antes? ¿Y había visto cómo se arma?',
      confirma: ['Qué sistema le interesta más', 'Si el cliente ya tenía una idea de "prefabricada" de otro tipo'],
      dudas: [
        '"¿Eso no es más barato que hacerla toda en obra?"',
        '"¿Y el calor y el frío cómo se manejan?"'
      ],
      transicion: 'Ahora que ya sabe qué es, veamos con qué materiales se hace y por qué dura lo que dura.'
    },
    'mod-2': {
      explica: [
        'Señale la plaqueta de concreto: panel de 98 × 98 cm y 3,5 cm de espesor, fabricado en planta.',
        'Diferencie obra negra, obra blanca y llave en mano, y qué incluye cada una.',
        'Use el dato de garantía: 10 años en estructura (cimentación, muros y cubierta) con póliza de aseguradora.',
        'Mencione NSR-10 sin entrar en detalles técnicos: es lo que el cliente necesita para quedarse tranquilo.'
      ],
      pregunta: '¿Qué nivel de terminación quiere usted? ¿Le alcanza con obra gris o quiere entrega terminada?',
      confirma: [
        'Nivel de acabado deseado',
        'Tipo de cubierta: teja en fibrocemento o teja en barro',
        'Si necesita certificaciones de materiales específicas'
      ],
      dudas: [
        '"¿Cada cuánto hay que pintar?"',
        '"¿Y el mantenimiento de la cubierta?"'
      ],
      transicion: 'Con los materiales claros, veamos los modelos concretos y sus distribuciones.'
    },
    'mod-3': {
      explica: [
        'No compare por m²: el precio lo define el sistema constructivo y el nivel de acabado.',
        'Explique el caso de la Cabaña de Vidrio: 25 m² y es el modelo más caro. Es el mejor ejemplo para enseñar a leer el catálogo.',
        'Los 5 modelos son personalizables en distribución, acabados y cubierta.',
        'Abra el plano del modelo que le interese en la pantalla del cliente.'
      ],
      pregunta: '¿Cuántas habitaciones necesita y quién va a vivir allí?',
      confirma: [
        'Modelo de mayor interés',
        'Número de habitaciones y baños',
        'Necesidad de zonas especiales (BBQ, zona de ropas, terraza, sótano)'
      ],
      dudas: [
        '"¿Por qué una de 25 m² cuesta más que una de 36?"',
        '"¿Puedo cambiar la distribución?"'
      ],
      transicion: 'Elegido el modelo, veamos qué necesita su terreno para que ese proyecto sea posible.'
    },
    'mod-4': {
      explica: [
        'Este módulo es el que protege la operación: el terreno define el precio y el plazo.',
        'Repase las 8 verificaciones. Si el cliente ya tiene lote, pida fotos y pregunte por pendiente y acceso.',
        'Deje claro que la placa de cimentación se cotiza aparte según el estudio de suelos.',
        'El acceso al lote es la variable que más afecta el flete y el montaje.'
      ],
      pregunta: '¿Ya sabe si el lote tiene agua y redes de acueducto y alcantarillado hasta la casa?',
      confirma: [
        'Municipio exacto del lote',
        'Fotos del lote y pendiente aproximado',
        'Si hay calle por donde pueda entrar el transporte',
        'Si ya tiene estudio de suelos'
      ],
      dudas: [
        '"¿Y si mi lote es muy inclinado?"',
        '"¿La licencia corre por su cuenta o la hacen ustedes?"'
      ],
      transicion: 'Con el terreno claro, le muestro el camino completo hasta la entrega.'
    },
    'mod-5': {
      explica: [
        'Recorra las 8 etapas en orden. Pregunte en cuál está el cliente: eso define su expectativa de fecha.',
        'La etapa 6 (preparación del sitio) es donde aparece la cimentación: aclare que se cotiza aparte salvo en la Cabaña de Vidrio.',
        'La etapa 7 es la que el cliente ve: el levante. Use las fotos de obra real.',
        'Cierre con la etapa 8: el checklist de cierre y el protocolo de postventa quedan por escrito.'
      ],
      pregunta: '¿Ha tenido alguna vez una obra en marcha? ¿Qué es lo que más le llama la atención en un proceso así?',
      confirma: ['En qué etapa está hoy su proyecto', 'Si hay fecha o evento que condiciona el inicio'],
      dudas: [
        '"¿Cuánto tarda realmente?"',
        '"¿Y si llueve durante el montaje?"'
      ],
      transicion: 'Ahora sí: cuánto cuesta y qué queda por fuera de ese precio.'
    },
    'mod-6': {
      explica: [
        'Diga el precio de catálogo con alcance cerrado: qué incluye y qué no.',
        'Subraye la excepción: la Cabaña de Vidrio 25 m² sí incluye placa de cimentación. Todos los demás no.',
        'Separe lo que sí es un presupuesto: el precio de catálogo es el punto de partida, no el total.',
        'Los plazos publicados son de 45 a 90 días según modelo y finalización; confirme vigencia antes de comprometer fechas.'
      ],
      pregunta: '¿Quiere que le desglosemos la cotización por escrito, con alcance cerrado?',
      confirma: [
        'Municipio del proyecto',
        'Nivel de acabados',
        'Acceso al lote',
        'Condiciones de pago: hay que confirmarlas con CONCASAYA, no improvisarlas'
      ],
      dudas: [
        '"¿Y las instalaciones eléctricas?"',
        '"¿Los muebles van aparte?"'
      ],
      transicion: 'Resolvamos las dudas que suelen aparecer antes de decidir.'
    },
    'mod-7': {
      explica: [
        'Sea honesto con las observaciones que hay en las reseñas: hay clientes que mencionan detalles menores pendientes al cierre y el servicio de postventa.',
        'La respuesta es que el cierre de obra y las visitas de postventa se dejan escritos, con fechas y responsable.',
        'Use la ficha del directorio: 9.6/10 en 93 reseñas, con respuesta pública a cada caso.',
        'No prometa plazos que no estén confirmados: si no hay dato oficial, dilo así.'
      ],
      pregunta: '¿Cuál es la duda que más ha dejado en su cabeza hasta ahora?',
      confirma: ['Objección principal del cliente', 'Información que hay que confirmar con el equipo técnico'],
      dudas: [
        '"¿Y si me arrepiento después de firmar?"',
        '"¿Cómo sé que no me van a subir el precio a mitad de obra?"'
      ],
      transicion: 'Vamos a dejar por escrito lo que usted necesita. Hagamos el diagnóstico.'
    },
    'mod-8': {
      explica: [
        'Complete el diagnóstico en voz alta con el cliente. El resumen aparece en pantalla y no se guarda.',
        'Cierre con un siguiente paso concreto: revisión del modelo, validación del terreno, cotización o visita al showroom.',
        'Envíe el resumen por WhatsApp desde el botón. Eso ya es un avance real.',
        'Recuerde: el showroom de Suba es Cl. 147 #101-56, Local 64, Centro Comercial Fiesta.'
      ],
      pregunta: '¿Le parece que dejemos agendada una visita al showroom o una cotización por escrito?',
      confirma: [
        'Municipio y disponibilidad para visita',
        'Si tiene o no terreno confirmado',
        'Modelo de interés',
        'Presupuesto orientativo',
        'Plazo de inicio'
      ],
      dudas: [
        '"¿Puedo aplazar la decisión?"',
        '"¿Me pueden mandar la cotización por correo?"'
      ],
      transicion: 'Le dejamos la cotización escrita con alcance cerrado y agendamos la visita.'
    }
  };

  /* --------------------------------------------------------------- helpers */
  function slideId(i) { return titles[i] ? titles[i].id : ''; }

  function setGuide(id) {
    const data = GUIA[id];
    const body = $('#gc-asesor-body');
    const label = $('#gc-asesor-mod');
    if (!data) {
      label.textContent = 'Sin notas';
      body.innerHTML = '<p style="font-size:.9rem;color:var(--gc-ink-3)">Este módulo no tiene notas del asesor.</p>';
      return;
    }
    const t = titles[current];
    label.textContent = t ? (t.modulo + ' · ' + t.titulo) : id;

    const block = (title, html) =>
      '<div class="gc-guideblock"><h4>' + title + '</h4>' + html + '</div>';

    const ul = items => items && items.length
      ? '<ul>' + items.map(i => '<li>' + i + '</li>').join('') + '</ul>'
      : '<p>—</p>';

    body.innerHTML =
      block('Qué explicar', ul(data.explica)) +
      block('Qué preguntar', '<p>' + data.pregunta + '</p>') +
      block('Qué confirmar', ul(data.confirma)) +
      block('Dudas frecuentes', ul(data.dudas)) +
      '<div class="gc-asesor__nav"><strong>Transición al siguiente módulo:</strong> ' + data.transicion + '</div>';
  }

  /* ------------------------------------------------------ estado visitado */
  const VISIT_KEY = 'gc_visitados';
  function getVisited() {
    try { return JSON.parse(sessionStorage.getItem(VISIT_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function markVisited(id) {
    try {
      const v = getVisited();
      if (!v.includes(id)) {
        v.push(id);
        sessionStorage.setItem(VISIT_KEY, JSON.stringify(v));
      }
    } catch (e) { /* modo privado: sin persistencia */ }
  }
  function paintVisited() {
    const v = getVisited();
    $$('.gc-idx-card').forEach(card => {
      const id = card.dataset.ir;
      const target = v.indexOf('mod-' + id) !== -1 ? 'mod-' + id : (id === 'indice' ? 'indice' : null);
      card.classList.toggle('is-visited', !!target);
    });
  }

  /* ------------------------------------------------------------ navegación */
  function goTo(index, skipScroll) {
    if (index < 0 || index >= slides.length) return;
    slides.forEach(s => s.classList.remove('is-active'));
    slides[index].classList.add('is-active');
    current = index;

    // enlace directo por hash: /guia-comercial/#mod-3 abre ese módulo
    try {
      history.replaceState(null, '', '#' + slides[index].id);
    } catch (e) { /* sin history API: se omite */ }

    const t = titles[index];
    $('#gc-nav-title').textContent = t.titulo;
    $('#gc-nav-sub').textContent = t.modulo;
    $('#gc-progress-label').textContent = t.titulo;

    const pct = Math.round(((index + 1) / slides.length) * 100);
    const bar = $('#gc-progress');
    bar.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', String(pct));

    $('#gc-prev').disabled = index === 0;
    $('#gc-next').disabled = index === slides.length - 1;

    markVisited(t.id);
    paintVisited();
    setGuide(t.id);
    revealIn(slides[index]);

    if (!skipScroll) window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function goToId(id) {
    const i = byId[id];
    if (i !== undefined) { goTo(i); return; }
    if (id === 'indice') { goTo(byId.indice); return; }
    const mod = parseInt(id, 10);
    if (!isNaN(mod)) goTo(byId['mod-' + mod]);
  }

  /* --------------------------------------------------------------- eventos */
  $$('[data-ir]').forEach(el => {
    el.addEventListener('click', () => {
      const target = el.dataset.ir;
      if (target === 'indice') goToId('indice');
      else goToId('mod-' + target);
    });
  });

  $('#gc-prev').addEventListener('click', () => goTo(current - 1));
  $('#gc-next').addEventListener('click', () => goTo(current + 1));
  $('#gc-btn-indice').addEventListener('click', () => goToId('indice'));

  /* Desplazamiento suave dentro de la pantalla (boton "Ver los 8 temas") */
  $$('[data-scroll]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* --------------------------------------------------- guía del asesor (UI) */
  const asesor = $('#gc-asesor');
  const overlay = $('#gc-overlay');

  function openAsesor() {
    asesor.classList.add('is-open');
    asesor.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-on');
  }
  function closeAsesor() {
    asesor.classList.remove('is-open');
    asesor.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-on');
  }
  function toggleAsesor() {
    if (asesor.classList.contains('is-open')) closeAsesor(); else openAsesor();
    $('#gc-btn-guia').setAttribute('aria-expanded', String(asesor.classList.contains('is-open')));
  }

  $('#gc-btn-guia').addEventListener('click', toggleAsesor);
  $('#gc-asesor-close').addEventListener('click', closeAsesor);
  overlay.addEventListener('click', closeAsesor);

  /* Ocultar la guía del asesor por completo (monitor solo para el cliente) */
  const btnSolo = $('#gc-btn-solo-cliente');
  btnSolo.addEventListener('click', () => {
    const hidden = document.body.classList.toggle('gc-asesor-hidden');
    btnSolo.setAttribute('aria-pressed', String(hidden));
    btnSolo.innerHTML = hidden
      ? '<span aria-hidden="true">👁</span> Mostrar notas'
      : '<span aria-hidden="true">👁</span> Vista cliente';
    if (hidden) closeAsesor();
  });

  /* --------------------------------------------------- pantalla completa */
  $('#gc-btn-full').addEventListener('click', () => {
    if (!document.fullscreenElement) {
      const el = document.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) req.call(el);
    } else {
      const ex = document.exitFullscreen || document.webkitExitFullscreen;
      if (ex) ex.call(document);
    }
  });

  /* ------------------------------------------------------------- teclado */
  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); goTo(current + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goTo(current - 1); }
    else if (e.key === 'Escape') { closeAsesor(); closeLightbox(); }
    else if (e.key === 'i' || e.key === 'I') { goToId('indice'); }
    /* Home y End se dejan al navegador: desplazan dentro del modulo actual. */
  });

  /* ------------------------------------------------------------ lightbox */
  const lb = $('#gc-lightbox');
  const lbImg = $('#gc-lightbox-img');
  const lbCap = $('#gc-lightbox-cap');

  function openLightbox(src, cap, alt) {
    lbImg.src = src;
    lbImg.alt = alt || cap || '';
    lbCap.textContent = cap || '';
    lb.classList.add('is-open');
  }
  function closeLightbox() { lb.classList.remove('is-open'); }

  $$('[data-lightbox]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tpl = btn.dataset.phTemplate;
      if (tpl) {
        const node = document.getElementById(tpl);
        if (node) {
          const box = $('.gc-lightbox__box');
          box.innerHTML = '';
          box.appendChild(node.content.cloneNode(true));
          lb.classList.add('is-open');
          return;
        }
      }
      openLightbox(btn.dataset.lightbox, btn.dataset.cap, btn.dataset.alt);
    });
  });
  $('#gc-lightbox-close').addEventListener('click', closeLightbox);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

  /* -------------------------------------------- pregunta interactiva (m1) */
  $$('[data-ask]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.ask;
      const out = document.getElementById('out-' + id);
      if (!out) return;
      const parent = btn.closest('.gc-ask');
      $$('.gc-ask__out', parent).forEach(o => o.classList.remove('is-on'));
      out.classList.add('is-on');
    });
  });

  /* --------------------------------------------------- diagnóstico (m8) */
  const resumen = {
    municipio: null, terreno: null, tipo: null,
    habitaciones: null, presupuesto: null, plazo: null
  };

  function paintResumen() {
    Object.keys(resumen).forEach(k => {
      const dd = document.querySelector('[data-r="' + k + '"]');
      if (!dd) return;
      const v = resumen[k];
      dd.textContent = v || 'Sin definir';
      dd.classList.toggle('is-empty', !v);
    });
  }

  $$('.gc-field__opts').forEach(group => {
    const key = group.dataset.q;
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('.gc-opt');
      if (!btn) return;
      $$('.gc-opt', group).forEach(o => o.classList.remove('is-sel'));
      btn.classList.add('is-sel');
      resumen[key] = btn.dataset.v;
      paintResumen();
    });
  });

  const inputMunicipio = $('#gc-q-municipio');
  if (inputMunicipio) {
    inputMunicipio.addEventListener('input', () => {
      resumen.municipio = inputMunicipio.value.trim() || null;
      paintResumen();
    });
  }

  $('#gc-btn-limpiar').addEventListener('click', () => {
    Object.keys(resumen).forEach(k => { resumen[k] = null; });
    $$('.gc-opt').forEach(o => o.classList.remove('is-sel'));
    if (inputMunicipio) inputMunicipio.value = '';
    paintResumen();
  });

  /* ------------------------------------------------------------- arranque */
  const hash = (location.hash || '').replace('#', '');
  const start = (hash && byId[hash] !== undefined) ? byId[hash] : 0;
  goTo(start, true);
  // el navegador hace scroll nativo al elemento del hash y lo deja bajo la
  // barra fija: se fuerza el inicio en cada carga con hash.
  window.scrollTo(0, 0);
  paintVisited();

  window.addEventListener('hashchange', () => {
    const h = (location.hash || '').replace('#', '');
    if (h && byId[h] !== undefined) goTo(byId[h]);
  });

  // El resumen arranca con los valores por defecto del formulario vacío.
  paintResumen();

  /* ------------------------------------------------------ aparicion al scroll */
  const revealables = $$('[data-reveal]');

  function reveal(el) {
    el.classList.add('is-in');
  }

  /* Al activar un modulo se revela de inmediato todo lo que ya esta a la
     vista; el resto entra al hacer scroll. Hay un seguro final: si el
     observador fallara, nada queda invisible (importante en una presentacion
     frente al cliente). */
  function revealIn(slide) {
    const items = $$('[data-reveal]', slide);
    const vh = window.innerHeight || 800;
    items.forEach((el, i) => {
      const top = el.getBoundingClientRect().top;
      if (top < vh * 0.92) {
        setTimeout(() => reveal(el), Math.min(i * 55, 260));
      }
    });
    setTimeout(() => items.forEach(reveal), 2600);
  }

  if ('IntersectionObserver' in window && revealables.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => reveal(entry.target), Math.min(i * 55, 260));
        io.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -5% 0px' });
    revealables.forEach(el => io.observe(el));
  } else {
    revealables.forEach(reveal);
  }

  /* ------------------------------------------------------------- año footer */
  const yearEl = $('#gc-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
