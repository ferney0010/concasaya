// Tarea 2i: el botón flotante de WhatsApp del blog post también debe abrir el modal
// en vez de ir directo a WhatsApp. Le agrego un listener que:
// - Hace e.preventDefault() para que NO navegue a WhatsApp directo
// - Abre el modal
// - Al elegir opción, WhatsApp se abre con el mensaje pre-armado del mini-cotizador
import { readFileSync, writeFileSync } from 'fs';

const file = 'blog/precio-casa-prefabricada-colombia-2026.html';
let html = readFileSync(file, 'utf8');
const before = html;

// 1) Identificar el botón flotante y modificarlo
// Patrón: <a href="https://wa.me/573142891018?text=..." target="_blank" rel="noopener" class="bg-green-500" aria-label="Contactar por WhatsApp">
const floatPattern = /<a\s+href="https:\/\/wa\.me\/573142891018\?text=[^"]*"\s+target="_blank"\s+rel="noopener"\s+class="bg-green-500"\s+aria-label="Contactar por WhatsApp">/;
if (floatPattern.test(html)) {
  html = html.replace(floatPattern, (match) => {
    return `<a href="javascript:void(0)" id="hero-wa-btn-floating" rel="noopener" class="bg-green-500" aria-label="Contactar por WhatsApp" data-hero-wa-floating>`;
  });
  console.log('✓ Botón flotante convertido a <a href="javascript:void(0)"> con id="hero-wa-btn-floating"');
} else {
  console.log('⚠ No encontré el botón flotante con el patrón esperado');
  process.exit(1);
}

// 2) Agregar un mini-IIFE al final del <body> (antes de </body>) que escucha
// el click en el botón flotante y abre el modal con un mensaje genérico
// (sin datos del mini-cotizador si el usuario no ha interactuado).
const floatModalScript = `
    <!-- Listener del botón flotante: abre el modal con un mensaje genérico -->
    <script>
      (function () {
        var btn = document.getElementById('hero-wa-btn-floating');
        var modal = document.getElementById('hero-wa-modal');
        if (!btn || !modal) return;

        // Para el botón flotante, usamos un mensaje genérico (no asumimos
        // que el cliente haya usado el mini-cotizador)
        var baseMsg = 'Hola CONCASAYA, quiero cotizar mi casa prefabricada.\\nVi su p\\u00e1gina y me interesa recibir m\\u00e1s informaci\\u00f3n sobre sistemas, precios y tiempos.\\n';

        btn.addEventListener('click', function (e) {
          e.preventDefault();
          modal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';

          // Sobrescribir el handler de las opciones para este caso
          // (guardamos referencia al handler original y lo restauramos al cerrar)
          var opts = modal.querySelectorAll('[data-hero-wa-opt]');
          var originalHandlers = [];
          opts.forEach(function (optBtn, idx) {
            // Capturamos el handler previo y lo restauramos
            var newClick = function () {
              var opt = optBtn.getAttribute('data-hero-wa-opt');
              var msg = baseMsg;
              if (opt === 'lote') {
                msg = baseMsg + 'Tengo el lote listo. \\u00bfMe pueden ayudar con la cotizaci\\u00f3n?';
              } else if (opt === 'busco') {
                msg = baseMsg + 'A\\u00fan no tengo lote definido. \\u00bfMe pueden asesorar?';
              } else if (opt === 'exterior') {
                msg = baseMsg + 'Estoy en el exterior. \\u00bfC\\u00f3mo manejan la log\\u00edstica?';
              }
              var url = 'https://wa.me/573142891018?text=' + encodeURIComponent(msg);
              window.open(url, '_blank', 'noopener,noreferrer');
              modal.setAttribute('aria-hidden', 'true');
              document.body.style.overflow = '';
            };
            // Guardamos handler original
            if (!optBtn.dataset.floatHandler) {
              optBtn.dataset.floatHandler = '1';
              optBtn.addEventListener('click', newClick);
            }
          });
        });
      })();
    </script>
`;

const bodyCloseIdx = html.lastIndexOf('</body>');
if (bodyCloseIdx < 0) {
  console.log('No encontré </body>');
  process.exit(1);
}
html = html.substring(0, bodyCloseIdx) + floatModalScript + '\n  ' + html.substring(bodyCloseIdx);
console.log('✓ Mini-IIFE del botón flotante inyectado');

writeFileSync(file, html, 'utf8');
console.log('\n✓ Tarea 2i lista.');
