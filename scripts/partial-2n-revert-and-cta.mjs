// Tarea 2n: revertir todos los cambios del mini-cotizador y modal duplicado.
// Restaurar el sistema original whatsapp-modal.js que intercepta todos los
// botones de WhatsApp. Reemplazar el mini-cotizador del hero por un CTA simple.
import { readFileSync, writeFileSync } from 'fs';

const files = ['index.html', 'blog/precio-casa-prefabricada-colombia-2026.html'];

for (const file of files) {
  let html = readFileSync(file, 'utf8');
  const before = html;
  const changes = [];

  // 1) Quitar el modal HTML que inyecté (id="hero-wa-modal")
  const modalHtmlPattern = /\s*<!-- Modal: opciones de WhatsApp después del mini-cotizador -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\n/;
  if (modalHtmlPattern.test(html)) {
    html = html.replace(modalHtmlPattern, '\n');
    changes.push('modal HTML (hero-wa-modal) eliminado');
  } else {
    // Patrón alternativo más simple
    const modalStart = html.indexOf('<!-- Modal: opciones de WhatsApp');
    const modalEnd = html.indexOf('</div>', html.indexOf('Conversación atendida por el equipo de CONCASAYA · Respuesta en menos de 24h</span>\n        </footer>'));
    if (modalStart >= 0 && modalEnd > modalStart) {
      // Encontrar el </div> que cierra el .hero-wa-modal
      let closeIdx = modalEnd;
      for (let i = 0; i < 3; i++) {
        closeIdx = html.indexOf('</div>', closeIdx + 1);
      }
      if (closeIdx > modalStart) {
        html = html.substring(0, modalStart) + html.substring(closeIdx + '</div>'.length + 1);
        changes.push('modal HTML eliminado (alternativo)');
      }
    } else {
      // Búsqueda por id directo
      const idMatch = html.indexOf('<div id="hero-wa-modal"');
      if (idMatch >= 0) {
        const endMatch = html.indexOf('</div>\n    </div>\n    <script type="application/ld+json">', idMatch);
        if (endMatch < 0) {
          // Buscar cierre por balance de divs
          let depth = 1;
          let pos = html.indexOf('>', idMatch) + 1;
          while (depth > 0 && pos < html.length) {
            const nextOpen = html.indexOf('<div', pos);
            const nextClose = html.indexOf('</div>', pos);
            if (nextClose < 0) break;
            if (nextOpen >= 0 && nextOpen < nextClose) { depth++; pos = nextOpen + 4; }
            else { depth--; pos = nextClose + 6; }
          }
          html = html.substring(0, idMatch) + html.substring(pos);
          changes.push('modal HTML eliminado (id match)');
        } else {
          html = html.substring(0, idMatch) + html.substring(endMatch + '</div>'.length + 1);
          changes.push('modal HTML eliminado (fin por JSON-LD)');
        }
      } else {
        changes.push('(modal HTML no encontrado)');
      }
    }
  }

  // 2) Quitar el CSS del modal que inyecté
  const cssStart = html.indexOf('/* === Modal estilo WhatsApp (mini-cotizador) === */');
  if (cssStart >= 0) {
    // Encontrar el </style> más cercano
    const cssEnd = html.indexOf('</style>', cssStart);
    if (cssEnd >= 0) {
      // Retroceder hasta el inicio del <style> o dejar el comentario
      const styleStart = html.lastIndexOf('<style>', cssStart);
      if (styleStart >= 0 && html.substring(styleStart, cssStart).trim() === '') {
        // Eliminar el bloque <style>...</style> entero si está vacío alrededor
        // En cambio, solo eliminamos desde el comentario hasta el final
        html = html.substring(0, cssStart) + html.substring(cssEnd + '</style>'.length);
        changes.push('CSS del modal eliminado');
      } else {
        html = html.substring(0, cssStart) + html.substring(cssEnd + '</style>'.length);
        changes.push('CSS del modal eliminado (sin <style> propio)');
      }
    }
  } else {
    changes.push('(CSS del modal no encontrado)');
  }

  // 3) Reemplazar el IIFE del mini-cotizador por uno mínimo que solo
  // actualice el rango cuando cambian los inputs (sin modal)
  const m2Idx = html.indexOf("getElementById('hero-m2')");
  if (m2Idx >= 0) {
    const iifeStart = html.lastIndexOf('(function () {', m2Idx);
    const iifeEnd = html.indexOf('})();', iifeStart) + 4;
    if (iifeStart >= 0 && iifeEnd >= 0) {
      const minIife = `      (function () {
        const m2Input = document.getElementById('hero-m2');
        const sistemaSelect = document.getElementById('hero-sistema');
        const zonaSelect = document.getElementById('hero-zona');
        const estimateValue = document.getElementById('hero-estimate-value');
        if (!m2Input || !sistemaSelect || !zonaSelect || !estimateValue) return;
        const precios = {
          'plaqueta-negra': 600000, 'plaqueta-gris': 1150000, 'plaqueta-blanca': 1850000,
          'eps-gris': 1450000, 'eps-blanca': 1950000
        };
        const zonaMult = { 'bogota-sabana': 1.0, 'cundinamarca': 1.07, 'boyaca': 1.18, 'otro': 1.25 };
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
        }
        m2Input.addEventListener('input', calcular);
        sistemaSelect.addEventListener('change', calcular);
        zonaSelect.addEventListener('change', calcular);
        calcular();
      })();`;
      html = html.substring(0, iifeStart) + minIife + html.substring(iifeEnd);
      changes.push('IIFE reemplazado por versión mínima (solo actualiza rango)');
    }
  } else {
    changes.push('(IIFE no encontrado)');
  }

  // 4) Restaurar el href wa.me en el hero-wa-btn del mini-cotizador
  const waBtnPattern = /<a\s+href="javascript:void\(0\)"\s+id="hero-wa-btn"\s+class="hero-cta-card__btn">/;
  if (waBtnPattern.test(html)) {
    html = html.replace(waBtnPattern, '<a href="https://wa.me/573142891018?text=Hola%20CONCASAYA%2C%20quiero%20cotizar%20mi%20casa%20prefabricada" target="_blank" rel="noopener" class="hero-cta-card__btn">');
    changes.push('hero-wa-btn: href restaurado a wa.me (el modal global lo intercepta)');
  }

  // 5) Restaurar el href wa.me en el hero-wa-btn-hero (botón verde del hero en index)
  if (file.includes('index')) {
    const heroBtnPattern = /<a\s*\n\s*href="javascript:void\(0\)"\s*\n\s*id="hero-wa-btn-hero"[\s\S]*?">/;
    if (heroBtnPattern.test(html)) {
      // Restaurar al href original de wa.me
      html = html.replace(heroBtnPattern, `<a\n                href="https://wa.me/573142891018?text=Hola%20CONCASAYA%2C%20vi%20su%20p%C3%A1gina%20y%20me%20interesa%20una%20casa%20prefabricada.%20%C2%BFMe%20pueden%20dar%20m%C3%A1s%20informaci%C3%B3n%3F"\n                target="_blank"`);
      changes.push('hero-wa-btn-hero: href restaurado a wa.me');
    }
  }

  // 6) Restaurar el href wa.me en el hero-wa-btn-floating (botón flotante del blog)
  if (file.includes('blog')) {
    const floatPattern = /<a\s+href="javascript:void\(0\)"\s+id="hero-wa-btn-floating"[^>]*>/;
    if (floatPattern.test(html)) {
      html = html.replace(floatPattern, '<a href="https://wa.me/573142891018?text=Hola%20CONCASAYA%2C%20quiero%20saber%20el%20precio%20de%20una%20casa%20prefabricada" target="_blank" rel="noopener" class="bg-green-500" aria-label="Contactar por WhatsApp">');
      changes.push('hero-wa-btn-floating: href restaurado a wa.me');
    }
  }

  if (html !== before) {
    writeFileSync(file, html, 'utf8');
    console.log(`✓ [${file}]: ${changes.join(' | ')}`);
  } else {
    console.log(`- [${file}]: sin cambios`);
  }
}
console.log('\n✓ Reversión completa. El modal global whatsapp-modal.js manejará todos los botones.');
