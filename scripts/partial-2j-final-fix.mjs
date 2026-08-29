// Tarea 2j: arreglo final
// 1) Revertir el botón del mini-cotizador (id="hero-wa-btn") a su comportamiento
//    original: href dinámico a wa.me con el mensaje pre-armado del mini-cotizador
//    (NO abre modal)
// 2) El botón "WhatsApp" verde del hero (línea 1726) → id="hero-wa-btn-hero",
//    abre el modal con mensaje genérico
// 3) El botón flotante del blog (ya hecho) sigue abriendo el modal
import { readFileSync, writeFileSync } from 'fs';

// === PARTE 1: Revertir el botón del mini-cotizador en el INDEX ===
const indexFile = 'index.html';
let indexHtml = readFileSync(indexFile, 'utf8');
const indexBefore = indexHtml;
const indexChanges = [];

// 1a) Cambiar href del hero-wa-btn a wa.me con mensaje pre-armado (comportamiento original)
// Patrón: <a href="javascript:void(0)" id="hero-wa-btn" class="hero-cta-card__btn">
const oldWaBtn = /<a\s+href="javascript:void\(0\)"\s+id="hero-wa-btn"\s+class="hero-cta-card__btn">/;
if (oldWaBtn.test(indexHtml)) {
  indexHtml = indexHtml.replace(oldWaBtn, '<a href="https://wa.me/573142891018?text=Hola%20CONCASAYA%2C%20quiero%20cotizar%20mi%20casa%20prefabricada" target="_blank" rel="noopener" class="hero-cta-card__btn">');
  indexChanges.push('revertido hero-wa-btn: javascript:void(0) → wa.me directo');
} else {
  indexChanges.push('(no se encontró el patrón del hero-wa-btn)');
}

// 1b) El botón del hero "WhatsApp" verde (línea 1726) — cambiar href a javascript:void(0)
// y agregar id="hero-wa-btn-hero"
// Patrón más simple: detectar la línea con "vi%20su%20p%C3%A1gina" y reemplazar
const heroBtnMarker = 'vi%20su%20p%C3%A1gina';
if (indexHtml.indexOf(heroBtnMarker) >= 0) {
  // Reemplazar la línea href= por javascript:void(0) y agregar id
  const heroBtnOld = /(<a\s*\n\s*href=")https:\/\/wa\.me\/573142891018\?text=Hola%20CONCASAYA%2C%20vi%20su%20p%C3%A1gina[^"]*("\s*\n\s*target="_blank"\s*\n\s*class="w-full sm:w-auto[^"]*">)/;
  if (heroBtnOld.test(indexHtml)) {
    indexHtml = indexHtml.replace(heroBtnOld, '$1javascript:void(0)$2\n                id="hero-wa-btn-hero"');
    indexChanges.push('botón WhatsApp del hero: agregado id="hero-wa-btn-hero" + javascript:void(0)');
  } else {
    indexChanges.push('⚠ no se encontró el botón WhatsApp del hero (regex interna)');
  }
} else {
  indexChanges.push('⚠ marker del botón WhatsApp del hero no encontrado');
}

// 1c) Reemplazar el IIFE del mini-cotizador por una versión que:
// - El hero-wa-btn va directo a WhatsApp (actualiza el href dinámicamente con datos del mini-cotizador)
// - El hero-wa-btn-hero abre el modal con mensaje genérico
// - El modal funciona como antes
const newIife = `      (function () {
        const m2Input = document.getElementById('hero-m2');
        const sistemaSelect = document.getElementById('hero-sistema');
        const zonaSelect = document.getElementById('hero-zona');
        const estimateValue = document.getElementById('hero-estimate-value');
        const waBtn = document.getElementById('hero-wa-btn');
        const waBtnHero = document.getElementById('hero-wa-btn-hero');
        const modal = document.getElementById('hero-wa-modal');
        if (!m2Input || !sistemaSelect || !zonaSelect || !estimateValue || !waBtn) return;

        const precios = {
          'plaqueta-negra': 600000,
          'plaqueta-gris': 1150000,
          'plaqueta-blanca': 1850000,
          'eps-gris': 1450000,
          'eps-blanca': 1950000
        };
        const sistemaLabel = {
          'plaqueta-negra': 'plaqueta obra negra',
          'plaqueta-gris': 'plaqueta obra gris',
          'plaqueta-blanca': 'plaqueta obra blanca',
          'eps-gris': 'paneles EPS obra gris',
          'eps-blanca': 'paneles EPS obra blanca'
        };
        const zonaMult = {
          'bogota-sabana': 1.0,
          'cundinamarca': 1.07,
          'boyaca': 1.18,
          'otro': 1.25
        };
        const zonaLabel = {
          'bogota-sabana': 'Bogotá/Sabana',
          'cundinamarca': 'Cundinamarca (otro municipio)',
          'boyaca': 'Boyacá',
          'otro': 'otro departamento'
        };

        function formatMillones(n) {
          if (n >= 1000000) return '$' + Math.round(n / 1000000) + 'M';
          if (n >= 1000) return '$' + Math.round(n / 1000) + 'K';
          return '$' + Math.round(n);
        }

        function buildMsgMini(opt, data) {
          const ref = formatMillones(data.min) + ' - ' + formatMillones(data.max);
          const base = 'Hola CONCASAYA, quiero cotizar una casa prefabricada.\\n' +
            '• Metros\\u00b2: ' + data.m2 + ' m\\u00b2\\n' +
            '• Sistema: ' + sistemaLabel[data.sistema] + '\\n' +
            '• Zona: ' + zonaLabel[data.zona] + '\\n' +
            '• Referencia inicial vista en la web: ' + ref + ' (s\\u00e9 que es muy preliminar, faltan acabados, instalaciones, licencia, transporte, etc.)\\n';
          if (opt === 'lote') {
            return base + '\\u00bfMe pueden ayudar con la cotizaci\\u00f3n real y los siguientes pasos? Tengo el lote listo.';
          } else if (opt === 'busco') {
            return base + 'A\\u00fan no tengo lote definido. \\u00bfMe pueden asesorar para encontrar el lote ideal y arrancar el proyecto?';
          } else if (opt === 'exterior') {
            return base + 'Estoy en el exterior y quiero empezar el proyecto a distancia. \\u00bfC\\u00f3mo manejan la log\\u00edstica y los pagos internacionales?';
          }
          return base + '\\u00bfMe pueden pasar una cotizaci\\u00f3n real con estos datos?';
        }

        function buildMsgHero(opt) {
          const base = 'Hola CONCASAYA, vi su p\\u00e1gina y quiero cotizar mi casa prefabricada.\\n' +
            'Necesito m\\u00e1s informaci\\u00f3n sobre sistemas, precios y tiempos.\\n';
          if (opt === 'lote') {
            return base + 'Tengo el lote listo. \\u00bfMe pueden ayudar con la cotizaci\\u00f3n?';
          } else if (opt === 'busco') {
            return base + 'A\\u00fan no tengo lote definido. \\u00bfMe pueden asesorar?';
          } else if (opt === 'exterior') {
            return base + 'Estoy en el exterior. \\u00bfC\\u00f3mo manejan la log\\u00edstica?';
          }
          return base + '\\u00bfMe pueden pasar m\\u00e1s informaci\\u00f3n?';
        }

        function calcular() {
          const m2 = Math.max(20, Math.min(500, parseInt(m2Input.value) || 60));
          const sistema = sistemaSelect.value;
          const zona = zonaSelect.value;
          const base = precios[sistema] || 1150000;
          const multZona = zonaMult[zona] || 1.0;
          const baseCalc = base * m2 * multZona;
          const min = baseCalc * 0.85;
          const max = baseCalc * 1.55;
          estimateValue.textContent = formatMillones(min) + ' - ' + formatMillones(max);
          return { m2, sistema, zona, min, max };
        }

        // 1) Botón del MINI-COTIZADOR: actualizar href dinámicamente con el mensaje
        //    pre-armado. NO abre modal — va directo a WhatsApp.
        function updateWaBtnHref() {
          const data = calcular();
          const msg = buildMsgMini('default', data);
          waBtn.href = 'https://wa.me/573142891018?text=' + encodeURIComponent(msg);
        }
        m2Input.addEventListener('input', updateWaBtnHref);
        sistemaSelect.addEventListener('change', updateWaBtnHref);
        zonaSelect.addEventListener('change', updateWaBtnHref);
        updateWaBtnHref();

        // 2) Botón WhatsApp del HERO: abre el modal con mensaje genérico
        if (waBtnHero && modal) {
          waBtnHero.addEventListener('click', function (e) {
            e.preventDefault();
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
          });

          // Click en cada opción del modal
          modal.querySelectorAll('[data-hero-wa-opt]').forEach(function (btn) {
            if (!btn.dataset.heroBound) {
              btn.dataset.heroBound = '1';
              btn.addEventListener('click', function () {
                const opt = btn.getAttribute('data-hero-wa-opt');
                const msg = buildMsgHero(opt);
                const url = 'https://wa.me/573142891018?text=' + encodeURIComponent(msg);
                window.open(url, '_blank', 'noopener,noreferrer');
                modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
              });
            }
          });

          // Cerrar modal
          function cerrarModal() {
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
          }
          modal.querySelectorAll('[data-hero-wa-close]').forEach(function (el) {
            el.addEventListener('click', cerrarModal);
          });
          document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') cerrarModal();
          });
        }
      })();`;

const marker = 'Lógica del mini-cotizador del hero';
const markerIdx = indexHtml.indexOf(marker);
if (markerIdx >= 0) {
  const scriptOpen = indexHtml.lastIndexOf('<script>', markerIdx);
  const scriptClose = indexHtml.indexOf('</script>', markerIdx);
  if (scriptOpen >= 0 && scriptClose >= 0) {
    indexHtml = indexHtml.substring(0, scriptOpen) + '<script>\n' + newIife + '\n    </script>' + indexHtml.substring(scriptClose + '</script>'.length);
    indexChanges.push('IIFE del mini-cotizador reemplazado (versión sin modal para hero-wa-btn, con modal para hero-wa-btn-hero)');
  }
}

if (indexHtml !== indexBefore) {
  writeFileSync(indexFile, indexHtml, 'utf8');
}
console.log(`✓ [index.html]: ${indexChanges.join(' | ')}`);

// === PARTE 2: Aplicar la misma lógica al blog post ===
const blogFile = 'blog/precio-casa-prefabricada-colombia-2026.html';
let blogHtml = readFileSync(blogFile, 'utf8');
const blogBefore = blogHtml;
const blogChanges = [];

// 2a) El blog tiene: hero-wa-btn (mini-cotizador), hero-wa-btn-floating (ya con modal)
// Revertir el hero-wa-btn del blog a su comportamiento original
const oldBlogWaBtn = /<a\s+href="javascript:void\(0\)"\s+id="hero-wa-btn"\s+class="hero-cta-card__btn">/;
if (oldBlogWaBtn.test(blogHtml)) {
  blogHtml = blogHtml.replace(oldBlogWaBtn, '<a href="https://wa.me/573142891018?text=Hola%20CONCASAYA%2C%20quiero%20cotizar%20mi%20casa%20prefabricada" target="_blank" rel="noopener" class="hero-cta-card__btn">');
  blogChanges.push('revertido hero-wa-btn del blog (mini-cotizador)');
}

if (blogHtml !== blogBefore) {
  writeFileSync(blogFile, blogHtml, 'utf8');
}
console.log(`✓ [blog/...]: ${blogChanges.join(' | ') || 'sin cambios (ya estaba)'}`);

console.log('\n✓ Tarea 2j lista.');
