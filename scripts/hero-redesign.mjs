// Rediseño del hero:
// 1) Reduce el slider de 5 slides a 3 con overlays de beneficios transaccionales
//    (Ahorro 20%, Muros cortafuegos RF 120, Aislamiento acústico)
// 2) Agrega CSS para los overlays (número amarillo circular + texto del beneficio)
// 3) Ajusta el responsive de los CTAs (mejor touch target en mobile, mejor spacing en tablet)
// NO toca: H1, slogan, microtexto, OG, JSON-LD, OG image (todo lo demás sigue igual)
import { readFileSync, writeFileSync } from 'fs';

const file = 'index.html';
let html = readFileSync(file, 'utf8');

// === 1) Reemplazar el bloque del slider (5 slides → 3 con overlays) ===
const sliderOldStart = '<!-- Slider de imágenes y videos (solo visible en PC) -->';
const sliderOldEndMarker = '<!-- Modal para mostrar imágenes en tamaño completo -->';
const startIdx = html.indexOf(sliderOldStart);
const endIdx   = html.indexOf(sliderOldEndMarker);
if (startIdx < 0 || endIdx < 0) {
  console.error('No encontré los marcadores del slider');
  process.exit(1);
}

const sliderNew = `<!-- Slider de imágenes y videos con overlays de beneficios transaccionales (solo PC) -->
          <div class="hero-slider hidden lg:block">
            <div class="slider-container">
              <div class="slider-wrapper">
                <div class="slide active" data-slide-benefit="ahorro">
                  <img
                    src="assets/images/herocasa.webp"
                    alt="Casa prefabricada moderna CONCASAYA - ahorro de costo"
                    class="slide-image"
                    decoding="async"
                    fetchpriority="high"
                  />
                  <div class="slide-overlay">
                    <div class="benefit-number" aria-hidden="true">1</div>
                    <div class="benefit-text">
                      <p class="benefit-line-1">Ahorro de hasta</p>
                      <p class="benefit-line-2">el <em>20% en costo final</em></p>
                      <p class="benefit-line-3">de tu proyecto</p>
                    </div>
                  </div>
                </div>
                <div class="slide" data-slide-benefit="cortafuegos">
                  <img
                    src="assets/images/cass2.webp"
                    alt="Casa prefabricada con muros cortafuegos RF 120"
                    class="slide-image"
                    loading="lazy"
                    decoding="async"
                  />
                  <div class="slide-overlay">
                    <div class="benefit-number" aria-hidden="true">2</div>
                    <div class="benefit-text">
                      <p class="benefit-line-1">Muros <em>cortafuegos</em></p>
                      <p class="benefit-line-2">minutos <em>RF 120 MIN</em></p>
                      <p class="benefit-line-3">resistencia al fuego</p>
                    </div>
                  </div>
                </div>
                <div class="slide" data-slide-benefit="acustico">
                  <img
                    src="assets/images/eficiente.webp"
                    alt="Casa prefabricada con aislamiento acústico"
                    class="slide-image"
                    loading="lazy"
                    decoding="async"
                  />
                  <div class="slide-overlay">
                    <div class="benefit-number" aria-hidden="true">3</div>
                    <div class="benefit-text">
                      <p class="benefit-line-1">Capacidad de</p>
                      <p class="benefit-line-2">aislamiento <em>acústico</em></p>
                      <p class="benefit-line-3">para tu confort</p>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Indicadores del slider -->
              <div class="slider-indicators">
                <span class="indicator active" data-slide="0" aria-label="Beneficio 1: Ahorro"></span>
                <span class="indicator" data-slide="1" aria-label="Beneficio 2: Muros cortafuegos"></span>
                <span class="indicator" data-slide="2" aria-label="Beneficio 3: Aislamiento acústico"></span>
              </div>
            </div>
          </div>

          `;

const before = html.substring(0, startIdx);
const after  = html.substring(endIdx);
html = before + sliderNew + after;
console.log(`✓ Slider actualizado a 3 slides con overlays (de 5 slides a 3)`);

// === 2) Agregar CSS para los overlays (después del CSS del slider) ===
const cssOld = `.slider-indicators .indicator:hover {
        background: rgba(255, 255, 255, 0.8);
      }`;

const cssNew = `.slider-indicators .indicator:hover {
        background: rgba(255, 255, 255, 0.8);
      }

      /* Overlay de beneficio en cada slide (transaccional) */
      .slide-overlay {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 20;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.1rem 1.4rem;
        background: linear-gradient(
          to top,
          rgba(10, 37, 64, 0.92) 0%,
          rgba(10, 37, 64, 0.78) 60%,
          rgba(10, 37, 64, 0) 100%
        );
        border-left: 4px solid #ffd166;
        pointer-events: none;
      }
      .benefit-number {
        flex-shrink: 0;
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: #ffd166;
        color: #0a2540;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.35rem;
        font-weight: 800;
        line-height: 1;
        box-shadow: 0 4px 14px rgba(255, 209, 102, 0.4);
      }
      .benefit-text {
        flex: 1 1 auto;
        min-width: 0;
        color: #ffffff;
        line-height: 1.25;
        text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
      }
      .benefit-text p { margin: 0; }
      .benefit-line-1 {
        font-size: 0.95rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);
      }
      .benefit-line-2 {
        font-size: 1.15rem;
        font-weight: 700;
      }
      .benefit-line-2 em,
      .benefit-line-3 em {
        color: #ffd166;
        font-style: normal;
        font-weight: 800;
      }
      .benefit-line-3 {
        font-size: 0.92rem;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.88);
      }
      /* El slide no-activo no muestra el overlay (porque el slide no es visible) */
      .slide:not(.active) .slide-overlay { display: none; }`;

if (!html.includes(cssOld)) {
  console.error('No encontré el CSS viejo donde insertar');
  process.exit(1);
}
html = html.replace(cssOld, cssNew);
console.log(`✓ CSS de overlays agregado`);

// === 3) Mejorar responsive de los botones del hero ===
// Mobile: cada botón con mejor touch target (py-4 en vez de py-3)
// sm: gap más amplio entre botones en fila
// (No cambio los colores, ni los links, ni el contenido — solo padding y gap)
const ctasOldPattern = /class="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start items-stretch sm:items-center lg:px-0 px-2"/;
const ctasNewString  = 'class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start items-stretch sm:items-center lg:px-0 px-2"';
const ctasCount = (html.match(ctasOldPattern) || []).length;
if (ctasCount === 0) {
  console.error('No encontré el contenedor de CTAs del hero');
  process.exit(1);
}
html = html.replace(ctasOldPattern, ctasNewString);
console.log(`✓ CTAs del hero: gap-3 sm:gap-4 (mejor respiro en tablet)`);

// Aumentar el padding de los 3 botones del hero
const btnPatterns = [
  {
    name: 'Ver Modelos',
    from: /class="w-full sm:w-auto px-6 sm:px-7 lg:px-6 py-3 sm:py-3\.5 lg:py-3 bg-primary/g,
    to:   'class="w-full sm:w-auto px-6 sm:px-7 lg:px-6 py-4 sm:py-3.5 lg:py-3 bg-primary',
  },
  {
    name: 'Cotizador',
    from: /class="w-full sm:w-auto px-6 sm:px-7 lg:px-6 py-3 sm:py-3\.5 lg:py-3 bg-gradient-to-r from-orange/g,
    to:   'class="w-full sm:w-auto px-6 sm:px-7 lg:px-6 py-4 sm:py-3.5 lg:py-3 bg-gradient-to-r from-orange',
  },
  {
    name: 'WhatsApp',
    from: /class="w-full sm:w-auto px-6 sm:px-7 lg:px-6 py-3 sm:py-3\.5 lg:py-3 bg-green-500/g,
    to:   'class="w-full sm:w-auto px-6 sm:px-7 lg:px-6 py-4 sm:py-3.5 lg:py-3 bg-green-500',
  },
];
for (const p of btnPatterns) {
  const matches = html.match(p.from);
  if (!matches) {
    console.warn(`⚠ No encontré el patrón del botón ${p.name} (puede que ya esté actualizado)`);
    continue;
  }
  html = html.replace(p.from, p.to);
  console.log(`✓ Botón ${p.name}: padding mobile py-3 → py-4`);
}

writeFileSync(file, html, 'utf8');
console.log('\n✓ Hero rediseñado. Listo para verificar.');
