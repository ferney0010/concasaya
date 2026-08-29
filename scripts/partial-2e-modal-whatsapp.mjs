// Tarea 2e: rediseño completo del flujo del mini-cotizador
// 1) Quita el filtro "¿Ya tienes lote?" del mini-cotizador (vuelve a 3 inputs)
// 2) Crea un modal estilo WhatsApp con 3 opciones (Alicia - Asesora comercial)
// 3) El botón del mini-cotizador abre el modal
// 4) Cada opción del modal arma un mensaje diferente y abre WhatsApp
import { readFileSync, writeFileSync } from 'fs';

const files = ['index.html', 'blog/precio-casa-prefabricada-colombia-2026.html'];

// === HTML del modal ===
// Estilo WhatsApp-like: header verde con avatar "A", mensaje del bot,
// 3 opciones grandes (botones), footer de confianza
const modalHtml = `
    <!-- Modal: opciones de WhatsApp después del mini-cotizador -->
    <div id="hero-wa-modal" class="hero-wa-modal" aria-hidden="true" role="dialog" aria-labelledby="hero-wa-modal-title">
      <div class="hero-wa-modal__backdrop" data-hero-wa-close></div>
      <div class="hero-wa-modal__card" role="document">
        <header class="hero-wa-modal__header">
          <div class="hero-wa-modal__avatar">A</div>
          <div class="flex-1 min-w-0">
            <p class="hero-wa-modal__name">Alicia <span class="hero-wa-modal__role">· Asesora comercial</span></p>
            <p class="hero-wa-modal__status"><span class="hero-wa-modal__dot"></span> en línea</p>
          </div>
          <button type="button" class="hero-wa-modal__close" data-hero-wa-close aria-label="Cerrar">
            <i class="fas fa-times"></i>
          </button>
        </header>
        <div class="hero-wa-modal__body">
          <p class="hero-wa-modal__greeting">¡Hola! ¿En qué te podemos ayudar?</p>
          <p class="hero-wa-modal__sub">Cuéntanos que necesitas</p>
          <div class="hero-wa-modal__options" role="list">
            <button type="button" class="hero-wa-modal__opt hero-wa-modal__opt--primary" data-hero-wa-opt="lote">
              <i class="fas fa-home"></i>
              <span>Ya tengo lote, quiero cotizar</span>
              <i class="fas fa-arrow-right hero-wa-modal__arrow"></i>
            </button>
            <button type="button" class="hero-wa-modal__opt" data-hero-wa-opt="busco">
              <i class="fas fa-map-marked-alt"></i>
              <span>Todavía busco lote, que me recomienden</span>
            </button>
            <button type="button" class="hero-wa-modal__opt" data-hero-wa-opt="exterior">
              <i class="fas fa-globe-americas"></i>
              <span>Estoy en el exterior, quiero cotizar</span>
            </button>
          </div>
        </div>
        <footer class="hero-wa-modal__footer">
          <i class="fas fa-shield-halved"></i>
          <span>Conversación atendida por el equipo de CONCASAYA · Respuesta en menos de 24h</span>
        </footer>
      </div>
    </div>
`;

// === CSS del modal ===
const modalCss = `
      /* === Modal estilo WhatsApp (mini-cotizador) === */
      .hero-wa-modal {
        position: fixed;
        inset: 0;
        z-index: 70;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 12px;
      }
      .hero-wa-modal[aria-hidden="false"] { display: flex; }
      .hero-wa-modal__backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        animation: heroWaFade 0.2s ease;
      }
      @keyframes heroWaFade { from { opacity: 0; } to { opacity: 1; } }
      .hero-wa-modal__card {
        position: relative;
        width: 100%;
        max-width: 380px;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
        overflow: hidden;
        transform: translateY(10px) scale(0.97);
        animation: heroWaPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        max-height: calc(100vh - 24px);
        max-height: calc(100dvh - 24px);
        display: flex;
        flex-direction: column;
      }
      @keyframes heroWaPop {
        from { transform: translateY(10px) scale(0.97); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
      }
      .hero-wa-modal__header {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        padding: 0.85rem 1rem;
        background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
        color: #fff;
      }
      .hero-wa-modal__avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: #fff;
        color: #25d366;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        font-weight: 800;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
      .hero-wa-modal__name {
        font-size: 0.95rem;
        font-weight: 700;
        line-height: 1.2;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .hero-wa-modal__role {
        font-weight: 500;
        opacity: 0.95;
      }
      .hero-wa-modal__status {
        font-size: 0.75rem;
        margin: 0;
        opacity: 0.95;
        display: flex;
        align-items: center;
        gap: 0.3rem;
      }
      .hero-wa-modal__dot {
        display: inline-block;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #4ade80;
        box-shadow: 0 0 6px #4ade80;
        animation: heroWaPulse 2s ease-in-out infinite;
      }
      @keyframes heroWaPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      .hero-wa-modal__close {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 0.9rem;
        flex-shrink: 0;
        transition: background 0.15s ease;
      }
      .hero-wa-modal__close:hover { background: rgba(255, 255, 255, 0.35); }
      .hero-wa-modal__body {
        padding: 1.1rem 1rem 0.6rem;
        background: #fff;
        flex: 1 1 auto;
        overflow-y: auto;
      }
      .hero-wa-modal__greeting {
        font-size: 0.95rem;
        font-weight: 700;
        color: #0a2540;
        margin: 0 0 0.15rem;
        line-height: 1.3;
      }
      .hero-wa-modal__sub {
        font-size: 0.78rem;
        color: #64748b;
        margin: 0 0 0.8rem;
      }
      .hero-wa-modal__options {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .hero-wa-modal__opt {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        padding: 0.85rem 1rem;
        background: #f0fdf4;
        border: 1.5px solid #bbf7d0;
        border-radius: 12px;
        color: #0a2540;
        font-size: 0.88rem;
        font-weight: 600;
        text-align: left;
        cursor: pointer;
        transition: all 0.15s ease;
        font-family: inherit;
        text-decoration: none;
      }
      .hero-wa-modal__opt:hover {
        background: #dcfce7;
        border-color: #86efac;
        transform: translateY(-1px);
      }
      .hero-wa-modal__opt i:first-child {
        color: #16a34a;
        font-size: 1rem;
        flex-shrink: 0;
      }
      .hero-wa-modal__opt span { flex: 1 1 auto; }
      .hero-wa-modal__opt--primary {
        background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
        color: #fff;
        border-color: transparent;
      }
      .hero-wa-modal__opt--primary i:first-child { color: #fff; }
      .hero-wa-modal__opt--primary:hover {
        background: linear-gradient(135deg, #1ebe5d 0%, #0f7264 100%);
        border-color: transparent;
      }
      .hero-wa-modal__arrow {
        font-size: 0.85rem;
        opacity: 0.8;
        transition: transform 0.15s ease;
      }
      .hero-wa-modal__opt--primary:hover .hero-wa-modal__arrow {
        transform: translateX(3px);
        opacity: 1;
      }
      .hero-wa-modal__footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        padding: 0.65rem 1rem 0.85rem;
        background: #fff;
        color: #64748b;
        font-size: 0.72rem;
        text-align: center;
        line-height: 1.3;
        border-top: 1px solid #f1f5f9;
      }
      .hero-wa-modal__footer i { color: #16a34a; }
      @media (max-width: 420px) {
        .hero-wa-modal__card { max-width: 100%; }
        .hero-wa-modal__opt { font-size: 0.82rem; padding: 0.75rem 0.85rem; }
      }
`;

// === JS nuevo (mini-cotizador + modal) ===
// - m2, sistema, zona (sin filtro de lote)
// - Botón "Pedir cotización" abre modal
// - Cada opción del modal arma mensaje + abre WhatsApp
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

for (const file of files) {
  let html = readFileSync(file, 'utf8');
  const before = html;
  const changes = [];

  // 1) Quitar el bloque del filtro "¿Ya tienes lote?" (label y div)
  const filterPattern = /\s*<div class="hero-cta-field">\s*<span class="hero-cta-field__label">¿Ya tienes lote donde construir\?<\/span>[\s\S]*?<\/div>\s*<label class="hero-cta-field hero-cta-lote-ubicacion"[^>]*>[\s\S]*?<\/label>/;
  if (filterPattern.test(html)) {
    html = html.replace(filterPattern, '\n');
    changes.push('quitado filtro ¿Ya tienes lote? del mini-cotizador');
  } else {
    // Intento alternativo
    const altPattern = /<div class="hero-cta-field">\s*<span class="hero-cta-field__label">¿Ya tienes lote[^<]*<\/span>[\s\S]*?<\/div>/;
    if (altPattern.test(html)) {
      html = html.replace(altPattern, '');
      changes.push('quitado filtro lote (alternativo)');
    }
  }

  // 2) Insertar el modal HTML antes del </body>
  const bodyCloseIdx = html.lastIndexOf('</body>');
  if (bodyCloseIdx < 0) {
    console.log(`⚠ [${file}] No encontré </body>`);
    continue;
  }
  if (html.indexOf('id="hero-wa-modal"') < 0) {
    html = html.substring(0, bodyCloseIdx) + modalHtml + '\n  ' + html.substring(bodyCloseIdx);
    changes.push('modal HTML insertado');
  } else {
    changes.push('(modal ya estaba)');
  }

  // 3) Inyectar el CSS del modal antes del </body> (si no está)
  if (html.indexOf('=== Modal estilo WhatsApp (mini-cotizador) ===') < 0) {
    html = html.substring(0, bodyCloseIdx) + modalCss + '\n' + html.substring(bodyCloseIdx);
    changes.push('CSS del modal inyectado');
  } else {
    changes.push('(CSS del modal ya estaba)');
  }

  // 4) Reemplazar el IIFE del mini-cotizador por la versión limpia
  const marker = 'Mini-cotizador del hero';
  const markerIdx = html.indexOf(marker);
  if (markerIdx >= 0) {
    const scriptOpen = html.lastIndexOf('<script>', markerIdx);
    const scriptClose = html.indexOf('</script>', markerIdx);
    if (scriptOpen >= 0 && scriptClose >= 0) {
      html = html.substring(0, scriptOpen) + '<script>\n' + cleanJs + '\n    </script>' + html.substring(scriptClose + '</script>'.length);
      changes.push('IIFE reemplazado por versión limpia con modal');
    }
  } else {
    // Si no encuentra el marker, busca (function () { cerca de hero-m2
    const fnStart = html.indexOf('(function () {');
    if (fnStart >= 0) {
      // Verificar que es el IIFE del mini-cotizador
      if (html.substring(fnStart, fnStart + 200).indexOf('hero-m2') >= 0) {
        const fnEnd = html.indexOf('})();', fnStart) + 4;
        const scriptOpen2 = html.lastIndexOf('<script>', fnStart);
        const scriptClose2 = html.indexOf('</script>', fnStart);
        if (scriptOpen2 >= 0 && scriptClose2 >= 0) {
          html = html.substring(0, scriptOpen2) + '<script>\n' + cleanJs + '\n    </script>' + html.substring(scriptClose2 + '</script>'.length);
          changes.push('IIFE reemplazado (por posición)');
        }
      }
    }
  }

  if (html !== before) {
    writeFileSync(file, html, 'utf8');
    console.log(`✓ [${file}]: ${changes.join(' | ')}`);
  } else {
    console.log(`- [${file}]: sin cambios`);
  }
}
console.log('\n✓ Tarea 2e lista.');
