// Reemplaza el IIFE del mini-cotizador del index.html (el comentario usa
// "Lógica del mini-cotizador" con L mayúscula).
import { readFileSync, writeFileSync } from 'fs';

const file = 'index.html';
let html = readFileSync(file, 'utf8');

const cleanJs = `      (function () {
        const m2Input = document.getElementById('hero-m2');
        const sistemaSelect = document.getElementById('hero-sistema');
        const zonaSelect = document.getElementById('hero-zona');
        const estimateValue = document.getElementById('hero-estimate-value');
        const waBtn = document.getElementById('hero-wa-btn');
        const modal = document.getElementById('hero-wa-modal');
        if (!m2Input || !sistemaSelect || !zonaSelect || !estimateValue || !waBtn || !modal) return;

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

        // Mensajes pre-armados según la opción elegida
        function buildMsg(opt, data) {
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

        // Abrir modal al hacer click en el botón principal
        waBtn.addEventListener('click', function (e) {
          e.preventDefault();
          modal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
        });

        // Cerrar modal (backdrop, X, ESC)
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

        // Click en cada opción: armar mensaje + abrir WhatsApp
        modal.querySelectorAll('[data-hero-wa-opt]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            const opt = btn.getAttribute('data-hero-wa-opt');
            const data = calcular();
            const msg = buildMsg(opt, data);
            const url = 'https://wa.me/573142891018?text=' + encodeURIComponent(msg);
            window.open(url, '_blank', 'noopener,noreferrer');
            cerrarModal();
          });
        });

        // Listeners de inputs (actualizan el rango en vivo)
        m2Input.addEventListener('input', calcular);
        sistemaSelect.addEventListener('change', calcular);
        zonaSelect.addEventListener('change', calcular);

        // Cálculo inicial
        calcular();
      })();`;

// Encontrar el IIFE del mini-cotizador
const marker = 'Lógica del mini-cotizador del hero';
const markerIdx = html.indexOf(marker);
if (markerIdx < 0) {
  console.log('No encontré el marker en index.html');
  process.exit(1);
}
const scriptOpen = html.lastIndexOf('<script>', markerIdx);
const scriptClose = html.indexOf('</script>', markerIdx);
if (scriptOpen < 0 || scriptClose < 0) {
  console.log('No encontré <script> o </script>');
  process.exit(1);
}
const before = html.substring(0, scriptOpen);
const after = html.substring(scriptClose + '</script>'.length);
const newBlock = '<script>\n' + cleanJs + '\n    </script>';
html = before + newBlock + after;

writeFileSync(file, html, 'utf8');
console.log(`✓ [index.html]: IIFE reemplazado con versión modal (${scriptClose - scriptOpen} → ${newBlock.length} chars)`);
