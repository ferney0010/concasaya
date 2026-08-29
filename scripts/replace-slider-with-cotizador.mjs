// Reemplaza el slider del hero del index con el mini-cotizador transaccional
// (el mismo que está en /blog/precio-casa-prefabricada-colombia-2026.html).
// 1) Reemplaza el bloque <div class="hero-slider hidden lg:block">...</div>
// 2) Agrega CSS del mini-cotizador al <style> del index
// 3) Agrega JS del mini-cotizador al <script> del index
// 4) Arregla los 3 CTAs del hero (texto más corto + whitespace-nowrap)
import { readFileSync, writeFileSync } from 'fs';

const file = 'index.html';
let html = readFileSync(file, 'utf8');

// ============================================================
// 1) Reemplazar el bloque del slider con el mini-cotizador
// ============================================================
const sliderStart = html.indexOf('<!-- Slider de imágenes y videos con overlays de beneficios transaccionales (solo PC) -->');
const sliderEnd   = html.indexOf('<!-- Modal para mostrar imágenes en tamaño completo -->');
if (sliderStart < 0 || sliderEnd < 0) {
  console.error('No encontré los marcadores del slider');
  process.exit(1);
}

const cotizadorHtml = `<!-- Mini-cotizador transaccional (mismo que en /blog/precio-casa-prefabricada-colombia-2026.html).
           Solo visible en desktop (lg+). En mobile se ven los CTAs. -->
          <div class="hero-slider hidden lg:block">
            <div class="hero-cta-card">
              <span class="hero-cta-card__tag">
                <i class="fas fa-calculator"></i> Cotizá en 1 minuto
              </span>
              <h3 class="hero-cta-card__title">Calculá tu precio ahora</h3>
              <p class="hero-cta-card__lead">Elegí metros y sistema. Te pasamos el estimado por WhatsApp.</p>

              <form class="hero-cta-form" id="hero-cotizador" onsubmit="return false;">
                <label class="hero-cta-field">
                  <span class="hero-cta-field__label">¿Cuántos m² necesitás?</span>
                  <input type="number" id="hero-m2" min="20" max="500" step="10" value="60" inputmode="numeric" class="hero-cta-input" />
                </label>
                <label class="hero-cta-field">
                  <span class="hero-cta-field__label">¿Qué sistema preferís?</span>
                  <select id="hero-sistema" class="hero-cta-input">
                    <option value="plaqueta-negra">Plaqueta obra negra (más económico)</option>
                    <option value="plaqueta-gris" selected>Plaqueta obra gris (recomendado)</option>
                    <option value="plaqueta-blanca">Plaqueta obra blanca (llave en mano)</option>
                    <option value="eps-gris">Paneles EPS obra gris</option>
                    <option value="eps-blanca">Paneles EPS obra blanca</option>
                  </select>
                </label>
                <label class="hero-cta-field">
                  <span class="hero-cta-field__label">¿En qué zona estás?</span>
                  <select id="hero-zona" class="hero-cta-input">
                    <option value="bogota-sabana" selected>Bogotá o Sabana (Chía, Cajicá, Zipaquirá, Soacha)</option>
                    <option value="cundinamarca">Otro municipio de Cundinamarca</option>
                    <option value="boyaca">Boyacá (Tunja, Duitama, Sogamoso, Samacá)</option>
                    <option value="otro">Otro departamento del país</option>
                  </select>
                </label>
                <div class="hero-cta-estimate" id="hero-estimate" aria-live="polite">
                  <span class="hero-cta-estimate__label">Referencia inicial (muy preliminar):</span>
                  <span class="hero-cta-estimate__value" id="hero-estimate-value">$50M - $100M</span>
                </div>
                <p class="hero-cta-estimate__disclaimer">
                  <i class="fas fa-info-circle"></i> Este número es solo un punto de partida. El precio real depende de ubicación, acabados, instalaciones completas (baño, cocina, eléctricas), placa, transporte, movimiento de tierra y licencia de obra. Un asesor de CONCASAYA te da el número exacto en menos de 24h.
                </p>
                <a href="#" id="hero-wa-btn" target="_blank" rel="noopener" class="hero-cta-card__btn">
                  <i class="fab fa-whatsapp"></i> Pedir cotización por WhatsApp
                </a>
              </form>

              <p class="hero-cta-card__trust">
                <i class="fas fa-lock"></i> Sin compromiso · Respuesta en menos de 24h
              </p>
            </div>
          </div>

          `;

const before = html.substring(0, sliderStart);
const after  = html.substring(sliderEnd);
html = before + cotizadorHtml + after;
console.log(`✓ Slider reemplazado por mini-cotizador`);

// ============================================================
// 2) Agregar CSS del mini-cotizador al <style> del index
// ============================================================
const cssCotizador = `
      /* Mini-cotizador del hero (mismo styling que en /blog/precio-...html) */
      .hero-cta-card {
        background: rgba(255, 255, 255, 0.97);
        backdrop-filter: blur(12px);
        border-radius: 18px;
        padding: 1.1rem 1.2rem 1rem;
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.6);
        max-width: 420px;
        margin: 0 auto;
      }
      .hero-cta-card__tag {
        display: inline-flex; align-items: center; gap: 0.35rem;
        background: linear-gradient(135deg, #0077b6 0%, #00a8e8 100%);
        color: #fff;
        padding: 0.3rem 0.7rem;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        margin-bottom: 0.55rem;
      }
      .hero-cta-card__title {
        color: #0a2540; font-size: 1.15rem; font-weight: 800; line-height: 1.2;
        margin: 0 0 0.25rem 0;
      }
      .hero-cta-card__lead {
        color: #475569; font-size: 0.8rem; line-height: 1.4;
        margin: 0 0 0.7rem 0;
      }
      .hero-cta-form { display: flex; flex-direction: column; gap: 0.5rem; }
      .hero-cta-field { display: flex; flex-direction: column; gap: 0.2rem; }
      .hero-cta-field__label {
        color: #334155; font-size: 0.72rem; font-weight: 700;
      }
      .hero-cta-input {
        width: 100%;
        padding: 0.55rem 0.75rem;
        font-size: 0.85rem;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        background: #fff;
        color: #0a2540;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .hero-cta-input:focus {
        outline: none;
        border-color: #0077b6;
        box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.15);
      }
      .hero-cta-estimate {
        background: #e0f2fe;
        border-left: 3px solid #0077b6;
        border-radius: 10px;
        padding: 0.55rem 0.7rem;
        display: flex; flex-direction: column; gap: 0.15rem;
        margin-top: 0.3rem;
      }
      .hero-cta-estimate__label {
        color: #0369a1; font-size: 0.68rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.5px;
      }
      .hero-cta-estimate__value {
        color: #0a2540; font-size: 1.1rem; font-weight: 800;
      }
      .hero-cta-estimate__disclaimer {
        background: #fef3c7;
        border-left: 3px solid #f59e0b;
        border-radius: 10px;
        padding: 0.55rem 0.7rem;
        margin: 0;
        color: #78350f; font-size: 0.7rem; line-height: 1.4;
        display: flex; gap: 0.4rem; align-items: flex-start;
      }
      .hero-cta-estimate__disclaimer i { color: #b45309; margin-top: 0.1rem; flex-shrink: 0; }
      .hero-cta-card__btn {
        display: flex; align-items: center; justify-content: center; gap: 0.55rem;
        width: 100%;
        background: #25d366;
        color: #fff;
        font-weight: 800; font-size: 0.95rem;
        padding: 0.85rem 1rem;
        border-radius: 999px;
        text-decoration: none;
        box-shadow: 0 8px 20px rgba(37, 211, 102, 0.3);
        transition: background 0.18s ease, transform 0.18s ease;
        margin-top: 0.4rem;
      }
      .hero-cta-card__btn:hover { background: #1ebe5d; transform: translateY(-2px); }
      .hero-cta-card__trust {
        display: flex; align-items: center; justify-content: center; gap: 0.3rem;
        color: #64748b; font-size: 0.7rem;
        margin: 0.5rem 0 0 0;
      }
      .hero-cta-card__trust i { color: #10b981; }
      @media (min-width: 1024px) and (max-width: 1279px) {
        .hero-cta-card { max-width: 380px; padding: 0.95rem 1rem 0.9rem; }
        .hero-cta-card__title { font-size: 1.05rem; }
      }
`;

// Insertar el CSS del cotizador justo ANTES del cierre </style>
const styleClose = '</style>';
const styleCloseIdx = html.indexOf(styleClose);
if (styleCloseIdx < 0) {
  console.error('No encontré </style>');
  process.exit(1);
}
html = html.substring(0, styleCloseIdx) + cssCotizador + '\n    ' + html.substring(styleCloseIdx);
console.log(`✓ CSS del mini-cotizador agregado`);

// ============================================================
// 3) Agregar JS del mini-cotizador (justo antes del cierre del body)
// ============================================================
const jsCotizador = `
    <!-- Lógica del mini-cotizador del hero (mismo que en /blog/precio-casa-prefabricada-colombia-2026.html) -->
    <script>
      (function () {
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
          const base = precios[sistema] || 1150000;
          const multZona = zonaMult[zona] || 1.0;
          // Rango amplio (referencia preliminar) para reflejar costos ocultos típicos
          const baseCalc = base * m2 * multZona;
          const min = baseCalc * 0.85;
          const max = baseCalc * 1.55;
          estimateValue.textContent = formatMillones(min) + ' - ' + formatMillones(max);

          const msg = 'Hola CONCASAYA, quiero cotizar una casa prefabricada.\\n' +
            '• Metros²: ' + m2 + ' m²\\n' +
            '• Sistema: ' + sistemaLabel[sistema] + '\\n' +
            '• Zona: ' + zonaLabel[zona] + '\\n' +
            '• Referencia inicial vista en la web: ' + formatMillones(min) + ' - ' + formatMillones(max) + ' (sé que es muy preliminar, faltan acabados, instalaciones, licencia, transporte, etc.)\\n' +
            '¿Me pueden pasar una cotización real con estos datos?';
          waBtn.href = 'https://wa.me/573142891018?text=' + encodeURIComponent(msg);
        }

        m2Input.addEventListener('input', calcular);
        sistemaSelect.addEventListener('change', calcular);
        zonaSelect.addEventListener('change', calcular);
        calcular();
      })();
    </script>
`;

// Insertar el JS justo antes del cierre </body>
const bodyClose = '</body>';
const bodyCloseIdx = html.indexOf(bodyClose);
if (bodyCloseIdx < 0) {
  console.error('No encontré </body>');
  process.exit(1);
}
html = html.substring(0, bodyCloseIdx) + jsCotizador + '\n  ' + html.substring(bodyCloseIdx);
console.log(`✓ JS del mini-cotizador agregado`);

// ============================================================
// 4) Arreglar los 3 CTAs del hero: texto corto + whitespace-nowrap
// ============================================================
const ctaReplacements = [
  {
    name: 'Ver Modelos',
    fromText: '<span>Ver Modelos</span>',
    toText:   '<span>Ver Modelos</span>',
    fromClass: /class="w-full sm:w-auto px-6 sm:px-7 lg:px-6 py-4 sm:py-3\.5 lg:py-3 bg-primary text-white rounded-full font-semibold text-base sm:text-lg lg:text-base hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"/,
    toClass:   'class="w-full sm:w-auto px-6 sm:px-7 lg:px-6 py-4 sm:py-3.5 lg:py-3 bg-primary text-white rounded-full font-semibold text-base sm:text-lg lg:text-base hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl whitespace-nowrap"',
  },
  {
    name: 'Cotizador → Cotizar gratis',
    fromText: '<span>Cotizador de precios gratis</span>',
    toText:   '<span>Cotizar gratis</span>',
    fromClass: /class="w-full sm:w-auto px-6 sm:px-7 lg:px-6 py-4 sm:py-3\.5 lg:py-3 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500 text-white rounded-full font-semibold text-base sm:text-lg lg:text-base hover:from-orange-600 hover:via-orange-500 hover:to-yellow-600 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl inline-flex items-center justify-center gap-2 shadow-xl border-2 border-orange-300\/50 hover:border-orange-200"/,
    toClass:   'class="w-full sm:w-auto px-6 sm:px-7 lg:px-6 py-4 sm:py-3.5 lg:py-3 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500 text-white rounded-full font-semibold text-base sm:text-lg lg:text-base hover:from-orange-600 hover:via-orange-500 hover:to-yellow-600 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl inline-flex items-center justify-center gap-2 shadow-xl border-2 border-orange-300/50 hover:border-orange-200 whitespace-nowrap"',
  },
  {
    name: 'WhatsApp',
    fromText: '<span>Hablar por WhatsApp</span>',
    toText:   '<span>WhatsApp</span>',
    fromClass: /class="w-full sm:w-auto px-6 sm:px-7 lg:px-6 py-4 sm:py-3\.5 lg:py-3 bg-green-500 text-white rounded-full font-semibold text-base sm:text-lg lg:text-base hover:bg-green-600 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"/,
    toClass:   'class="w-full sm:w-auto px-6 sm:px-7 lg:px-6 py-4 sm:py-3.5 lg:py-3 bg-green-500 text-white rounded-full font-semibold text-base sm:text-lg lg:text-base hover:bg-green-600 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl whitespace-nowrap"',
  },
];

for (const c of ctaReplacements) {
  // Cambiar el texto
  if (html.includes(c.fromText)) {
    html = html.replace(c.fromText, c.toText);
    console.log(`✓ Texto: ${c.name}`);
  } else {
    console.warn(`⚠ Texto no encontrado: ${c.name}`);
  }
  // Cambiar la clase (agregar whitespace-nowrap)
  if (c.fromClass.test(html)) {
    html = html.replace(c.fromClass, c.toClass);
    console.log(`✓ Clase: ${c.name} (whitespace-nowrap agregado)`);
  } else {
    console.warn(`⚠ Clase no encontrada: ${c.name}`);
  }
}

writeFileSync(file, html, 'utf8');
console.log('\n✓ Hero actualizado. Listo para verificar.');
