// Tarea 2b: reemplaza los campos de nombre+municipio por el filtro
// "¿Ya tienes lote?" + campo condicional de ubicación del lote.
// Aplica al index.html y al artículo destacado.
import { readFileSync, writeFileSync } from 'fs';

const files = ['index.html', 'blog/precio-casa-prefabricada-colombia-2026.html'];

// 1) HTML del nuevo campo: "¿Ya tienes lote?" con 2 botones + input condicional
const newFieldHtml = `
                <div class="hero-cta-field">
                  <span class="hero-cta-field__label">¿Ya tienes lote donde construir?</span>
                  <div class="hero-cta-lote-toggle" role="radiogroup" aria-label="¿Ya tienes lote?">
                    <button type="button" class="hero-cta-lote-btn" data-lote="si">
                      <i class="fas fa-map-marker-alt"></i> Sí, ya tengo lote
                    </button>
                    <button type="button" class="hero-cta-lote-btn" data-lote="no">
                      <i class="fas fa-search"></i> Aún no, ayúdenme
                    </button>
                  </div>
                  <input type="hidden" id="hero-lote-tiene" value="" />
                </div>
                <label class="hero-cta-field hero-cta-lote-ubicacion" id="hero-lote-ubicacion-wrap" style="display:none;">
                  <span class="hero-cta-field__label">¿En qué municipio / vereda?</span>
                  <input type="text" id="hero-lote-ubicacion" placeholder="Ej: Chía, vereda Bojacá" autocomplete="address-level2" class="hero-cta-input" />
                </label>
`;

// 2) HTML que va a REMPLAZAR el campo anterior (nombre + municipio)
// (es el bloque exacto que metí en partial-2)
const oldFieldPattern = /<label class="hero-cta-field">\s*<span class="hero-cta-field__label">Tu nombre<\/span>[\s\S]*?<\/label>\s*<label class="hero-cta-field">\s*<span class="hero-cta-field__label">Tu municipio<\/span>[\s\S]*?<\/label>/;

// 3) CSS del toggle
const newCss = `
      /* === Mini-cotizador: filtro "¿Ya tienes lote?" === */
      .hero-cta-lote-toggle {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.4rem;
      }
      .hero-cta-lote-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        padding: 0.55rem 0.5rem;
        font-size: 0.8rem;
        font-weight: 600;
        color: #475569;
        background: #f8fafc;
        border: 1.5px solid #e2e8f0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.15s ease;
        font-family: inherit;
      }
      .hero-cta-lote-btn:hover {
        border-color: #0077b6;
        color: #0077b6;
        background: #eff6ff;
      }
      .hero-cta-lote-btn.is-active[data-lote="si"] {
        background: linear-gradient(135deg, #0077b6 0%, #00a8e8 100%);
        color: #fff;
        border-color: #0077b6;
      }
      .hero-cta-lote-btn.is-active[data-lote="no"] {
        background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
        color: #fff;
        border-color: #f59e0b;
      }
      .hero-cta-lote-btn i { font-size: 0.78rem; }
`;

// 4) Nueva función calcular() con filtro de lote
const newCalcular = `function calcular() {
          const m2 = Math.max(20, Math.min(500, parseInt(m2Input.value) || 60));
          const sistema = sistemaSelect.value;
          const zona = zonaSelect.value;
          const tieneLote = (document.getElementById('hero-lote-tiene')?.value || '').trim();
          const ubicLote = (document.getElementById('hero-lote-ubicacion')?.value || '').trim();
          const base = precios[sistema] || 1150000;
          const multZona = zonaMult[zona] || 1.0;
          // Rango amplio (referencia preliminar) para reflejar costos ocultos típicos
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
            lines.push('• Lote: S\\u00ed, ya tengo lote' + (ubicLote ? ' (' + ubicLote + ')' : ' (ubicaci\\u00f3n por confirmar)'));
          } else if (tieneLote === 'no') {
            lines.push('• Lote: A\\u00fan no tengo lote, necesito ayuda para encontrar uno');
          } else {
            lines.push('• Lote: (no especificado)');
          }
          lines.push('• Referencia inicial vista en la web: ' + formatMillones(min) + ' - ' + formatMillones(max) + ' (s\\u00e9 que es muy preliminar, faltan acabados, instalaciones, licencia, transporte, etc.)');
          lines.push('\\u00bfMe pueden pasar una cotizaci\\u00f3n real con estos datos?');
          waBtn.href = 'https://wa.me/573142891018?text=' + encodeURIComponent(lines.join('\\n'));
        }`;

// 5) JS de los listeners (toggles + input)
const newJsBlock = `
        // Toggle "¿Ya tienes lote?"
        const loteButtons = document.querySelectorAll('.hero-cta-lote-btn');
        const loteTiene = document.getElementById('hero-lote-tiene');
        const loteUbicWrap = document.getElementById('hero-lote-ubicacion-wrap');
        const loteUbic = document.getElementById('hero-lote-ubicacion');
        loteButtons.forEach(function (btn) {
          btn.addEventListener('click', function () {
            loteButtons.forEach(function (b) { b.classList.remove('is-active'); });
            btn.classList.add('is-active');
            if (loteTiene) loteTiene.value = btn.getAttribute('data-lote');
            if (loteUbicWrap) {
              loteUbicWrap.style.display = (btn.getAttribute('data-lote') === 'si') ? '' : 'none';
            }
            calcular();
          });
        });
        if (loteUbic) loteUbic.addEventListener('input', calcular);`;

// 6) Aplicar a cada archivo
for (const file of files) {
  let html = readFileSync(file, 'utf8');
  const changes = [];

  // 6a) Reemplazar los 2 campos anteriores por el nuevo filtro
  if (oldFieldPattern.test(html)) {
    html = html.replace(oldFieldPattern, newFieldHtml.trim() + '\n');
    changes.push('campos nombre+municipio → filtro ¿Ya tienes lote?');
  } else if (html.indexOf('hero-cta-lote-toggle') >= 0) {
    changes.push('(filtro lote ya estaba)');
  } else {
    // Si no encontramos el patrón anterior, lo insertamos antes del estimate
    const marker = '<div class="hero-cta-estimate" id="hero-estimate"';
    const idx = html.indexOf(marker);
    if (idx >= 0) {
      html = html.substring(0, idx) + newFieldHtml + '\n                ' + html.substring(idx);
      changes.push('(insertado por primera vez) filtro ¿Ya tienes lote?');
    } else {
      changes.push('⚠ no encontré dónde insertar');
    }
  }

  // 6b) Reemplazar la función calcular() con la versión del filtro de lote
  if (html.includes('Mi nombre: ')) {
    const oldCalcularRe = /function calcular\(\) \{[\s\S]*?waBtn\.href = [^;]+;/;
    html = html.replace(oldCalcularRe, newCalcular);
    changes.push('calcular() con filtro de lote (reemplazada)');
  } else if (html.includes('¿Ya tienes lote?') || html.indexOf("getElementById('hero-lote-tiene')") >= 0) {
    // Si ya tiene el filtro pero no la función, reemplazar
    const oldCalcularRe2 = /function calcular\(\) \{[\s\S]*?waBtn\.href = [^;]+;/;
    if (oldCalcularRe2.test(html)) {
      html = html.replace(oldCalcularRe2, newCalcular);
      changes.push('calcular() reemplazada con versión de filtro de lote');
    } else {
      changes.push('(calcular sin cambios)');
    }
  }

  // 6c) Insertar el bloque de listeners de los toggles (después de los otros addEventListener)
  if (html.indexOf('hero-cta-lote-toggle') >= 0 && html.indexOf('loteButtons.forEach') < 0) {
    // Buscar el último addEventListener y agregar después
    const re = /(m2Input\.addEventListener\([^)]+\);)/g;
    let m;
    let last = -1;
    while ((m = re.exec(html)) !== null) last = m.index + m[0].length;
    if (last >= 0) {
      html = html.substring(0, last) + '\n' + newJsBlock + html.substring(last);
      changes.push('listeners de toggle insertados');
    } else {
      // Insertar antes de "calcular();" final
      const idxCalc = html.indexOf('calcular();');
      if (idxCalc >= 0) {
        html = html.substring(0, idxCalc) + newJsBlock + '\n        ' + html.substring(idxCalc);
        changes.push('listeners insertados antes de calcular()');
      } else {
        changes.push('⚠ no encontré dónde poner listeners');
      }
    }
  }

  // 6d) Inyectar el CSS si no está
  if (html.indexOf('=== Mini-cotizador: filtro') < 0) {
    const bodyClose = '</body>';
    const idx = html.lastIndexOf(bodyClose);
    if (idx >= 0) {
      // Buscar el <style> inyectado previamente para insertar después
      const prevStyle = 'compare-table';
      const idxPrev = html.indexOf('=== Tablas comparativas ===');
      // Para archivos sin el bloque de Tablas (como index.html), insertar antes del </body>
      html = html.substring(0, idx) + (html.indexOf('=== Tablas comparativas ===') >= 0
        ? ''
        : newCss) + '\n' + html.substring(idx);
      // Si no había bloque previo, ya se insertó
      if (html.indexOf('=== Tablas comparativas ===') >= 0 && html.indexOf('=== Mini-cotizador') < 0) {
        // Insertar después del bloque de Tablas en el mismo <style>
        const styleClose = '</style>';
        const idxStyleClose = html.indexOf(styleClose);
        if (idxStyleClose >= 0) {
          html = html.substring(0, idxStyleClose) + newCss + '\n' + html.substring(idxStyleClose);
          changes.push('CSS del toggle inyectado en <style>');
        }
      } else if (changes.some(c => c.includes('filtro'))) {
        changes.push('CSS del toggle inyectado antes de </body>');
      }
    }
  } else {
    changes.push('(CSS ya estaba)');
  }

  writeFileSync(file, html, 'utf8');
  console.log(`✓ [${file}]: ${changes.join(' | ')}`);
}
console.log('\n✓ Tarea 2b lista.');
