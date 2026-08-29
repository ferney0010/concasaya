// Actualiza el IIFE del index para:
// - hero-wa-btn (mini-cotizador): actualiza href dinámicamente con mensaje pre-armado, NO abre modal
// - hero-wa-btn-hero (botón WhatsApp del hero): abre el modal con mensaje genérico
import { readFileSync, writeFileSync } from 'fs';

const file = 'index.html';
let html = readFileSync(file, 'utf8');

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

// Encontrar y reemplazar el IIFE actual
const m2Idx = html.indexOf("getElementById('hero-m2')");
if (m2Idx < 0) {
  console.log('No encontré hero-m2 en el index');
  process.exit(1);
}
const iifeStart = html.lastIndexOf('(function () {', m2Idx);
const iifeEnd = html.indexOf('})();', iifeStart) + 4;
if (iifeStart < 0 || iifeEnd < 0) {
  console.log('No pude localizar el IIFE');
  process.exit(1);
}
const before = html.substring(0, iifeStart);
const after = html.substring(iifeEnd);
html = before + newIife + after;
writeFileSync(file, html, 'utf8');
console.log(`✓ IIFE del index reemplazado (${iifeEnd - iifeStart} → ${newIife.length} chars)`);
console.log('  - hero-wa-btn: actualiza href con datos del mini-cotizador (NO modal)');
console.log('  - hero-wa-btn-hero: abre modal con mensaje genérico');
