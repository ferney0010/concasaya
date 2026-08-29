// Tarea 2d: fix directo y surgical del mini-cotizador.
// Lee el archivo, identifica el IIFE del mini-cotizador, lo reemplaza
// por una versión limpia y correcta.
import { readFileSync, writeFileSync } from 'fs';

const files = ['index.html', 'blog/precio-casa-prefabricada-colombia-2026.html'];

// El IIFE limpio del mini-cotizador (4 inputs + 1 toggle, mensaje completo)
const cleanIife = `      (function () {
        const m2Input = document.getElementById('hero-m2');
        const sistemaSelect = document.getElementById('hero-sistema');
        const zonaSelect = document.getElementById('hero-zona');
        const estimateValue = document.getElementById('hero-estimate-value');
        const waBtn = document.getElementById('hero-wa-btn');
        if (!m2Input || !sistemaSelect || !zonaSelect || !estimateValue || !waBtn) return;

        // Precios CONCASAYA por m² (precios base Bogotá/Sabana, 2026)
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
          const tieneLote = (document.getElementById('hero-lote-tiene')?.value || '').trim();
          const base = precios[sistema] || 1150000;
          const multZona = zonaMult[zona] || 1.0;
          const baseCalc = base * m2 * multZona;
          const min = baseCalc * 0.85;
          const max = baseCalc * 1.55;
          estimateValue.textContent = formatMillones(min) + ' - ' + formatMillones(max);

          // Construir mensaje de WhatsApp con TODOS los datos del mini-cotizador
          const lines = [];
          lines.push('Hola CONCASAYA, quiero cotizar una casa prefabricada.');
          lines.push('• Metros\\u00b2: ' + m2 + ' m\\u00b2');
          lines.push('• Sistema: ' + sistemaLabel[sistema]);
          lines.push('• Zona: ' + zonaLabel[zona]);
          if (tieneLote === 'si') {
            lines.push('• Lote: S\\u00ed, ya tengo lote');
          } else if (tieneLote === 'no') {
            lines.push('• Lote: A\\u00fan no tengo lote, necesito ayuda para encontrar uno');
          }
          lines.push('• Referencia inicial vista en la web: ' + formatMillones(min) + ' - ' + formatMillones(max) + ' (s\\u00e9 que es muy preliminar, faltan acabados, instalaciones, licencia, transporte, etc.)');
          lines.push('\\u00bfMe pueden pasar una cotizaci\\u00f3n real con estos datos?');
          waBtn.href = 'https://wa.me/573142891018?text=' + encodeURIComponent(lines.join('\\n'));
        }

        // Listeners de inputs
        m2Input.addEventListener('input', calcular);
        sistemaSelect.addEventListener('change', calcular);
        zonaSelect.addEventListener('change', calcular);

        // Toggle "¿Ya tienes lote?"
        const loteButtons = document.querySelectorAll('.hero-cta-lote-btn');
        const loteTiene = document.getElementById('hero-lote-tiene');
        loteButtons.forEach(function (btn) {
          btn.addEventListener('click', function () {
            loteButtons.forEach(function (b) { b.classList.remove('is-active'); });
            btn.classList.add('is-active');
            if (loteTiene) loteTiene.value = btn.getAttribute('data-lote');
            calcular();
          });
        });

        // Cálculo inicial
        calcular();
      })();`;

for (const file of files) {
  let html = readFileSync(file, 'utf8');
  const before = html;

  // Encuentra el IIFE del mini-cotizador por su comentario + estructura
  const marker = 'Mini-cotizador del hero';
  const markerIdx = html.indexOf(marker);
  if (markerIdx < 0) {
    console.log(`⚠ [${file}] No encontré el marker del mini-cotizador`);
    continue;
  }
  // Encuentra el <script> que abre (anterior más cercano)
  const scriptOpen = html.lastIndexOf('<script>', markerIdx);
  if (scriptOpen < 0) {
    console.log(`⚠ [${file}] No encontré <script>`);
    continue;
  }
  // Encuentra el </script> que cierra (siguiente después del marker)
  const scriptClose = html.indexOf('</script>', markerIdx);
  if (scriptClose < 0) {
    console.log(`⚠ [${file}] No encontré </script>`);
    continue;
  }

  const oldBlock = html.substring(scriptOpen, scriptClose + '</script>'.length);
  // Reemplaza el bloque completo
  const newBlock = '<script>\n' + cleanIife + '\n    </script>';

  html = html.substring(0, scriptOpen) + newBlock + html.substring(scriptClose + '</script>'.length);
  writeFileSync(file, html, 'utf8');
  console.log(`✓ [${file}]: IIFE del mini-cotizador reemplazado (${oldBlock.length} → ${newBlock.length} chars)`);
}
console.log('\n✓ Tarea 2d lista.');
