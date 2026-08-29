// Tarea 2c: fix del bug (} extra) y simplificación.
// 1) Quita el input condicional de "municipio/vereda" (muchas preguntas)
// 2) Quita los listeners huérfanos de nombre/municipio (ya no existen)
// 3) Arregla el bug de sintaxis con los } extra en la función calcular()
import { readFileSync, writeFileSync } from 'fs';

const files = ['index.html', 'blog/precio-casa-prefabricada-colombia-2026.html'];

for (const file of files) {
  let html = readFileSync(file, 'utf8');
  const before = html;
  const changes = [];

  // 1) Quitar el label condicional de ubicación del lote
  const labelPattern = /\s*<label class="hero-cta-field hero-cta-lote-ubicacion"[^>]*>[\s\S]*?<\/label>\n/;
  if (labelPattern.test(html)) {
    html = html.replace(labelPattern, '\n');
    changes.push('quitado input condicional municipio/vereda');
  }

  // 2) En la función calcular, quitar la línea de ubicLote y la rama del "si" con ubicación
  // La rama actual es:
  //   if (tieneLote === 'si') {
  //     lines.push('• Lote: S\u00ed, ya tengo lote' + (ubicLote ? ' (' + ubicLote + ')' : ' (ubicaci\u00f3n por confirmar)'));
  //   } else if (tieneLote === 'no') {
  //     ...
  //   }
  // La nueva rama es:
  //   if (tieneLote === 'si') {
  //     lines.push('• Lote: S\u00ed, ya tengo lote');
  //   } else if (tieneLote === 'no') {
  //     lines.push('• Lote: A\u00fan no, necesito ayuda para encontrar uno');
  //   }
  const oldSiLine = "            lines.push('• Lote: S\\\\u00ed, ya tengo lote' + (ubicLote ? ' (' + ubicLote + ')' : ' (ubicaci\\\\u00f3n por confirmar)'));";
  const newSiLine = "            lines.push('• Lote: S\\\\u00ed, ya tengo lote');";
  if (html.includes(oldSiLine)) {
    html = html.replace(oldSiLine, newSiLine);
    changes.push('simplificada rama Lote: S\u00ed (sin par\u00e9ntesis ubic)');
  }

  // 3) Quitar la línea de "const ubicLote = ..." en calcular()
  const oldUbic = "          const ubicLote = (document.getElementById('hero-lote-ubicacion')?.value || '').trim();\n";
  if (html.includes(oldUbic)) {
    html = html.replace(oldUbic, '');
    changes.push('quitada const ubicLote (input ya no existe)');
  }

  // 4) Quitar la línea de listeners huérfanos
  const oldListeners = `        const nombreInput = document.getElementById('hero-nombre');
        const municipioSelect = document.getElementById('hero-municipio');
        if (nombreInput) nombreInput.addEventListener('input', calcular);
        if (municipioSelect) municipioSelect.addEventListener('change', calcular);
        `;
  if (html.includes(oldListeners)) {
    html = html.replace(oldListeners, '');
    changes.push('quitados listeners hu\u00e9rfanos de nombre/municipio');
  }

  // 5) Quitar el bloque que muestra/oculta ubicWrap (ya no existe)
  const oldUbicToggle = `            if (loteUbicWrap) {
              loteUbicWrap.style.display = (btn.getAttribute('data-lote') === 'si') ? '' : 'none';
            }
            `;
  if (html.includes(oldUbicToggle)) {
    html = html.replace(oldUbicToggle, '');
    changes.push('quitado toggle de ubicWrap');
  }

  // 6) Quitar las constantes huérfanas del JS
  const oldUbicConsts = `        const loteUbicWrap = document.getElementById('hero-lote-ubicacion-wrap');
        const loteUbic = document.getElementById('hero-lote-ubicacion');
        `;
  if (html.includes(oldUbicConsts)) {
    html = html.replace(oldUbicConsts, '');
    changes.push('quitadas constantes loteUbic hu\u00e9rfanas');
  }
  if (html.includes("if (loteUbic) loteUbic.addEventListener('input', calcular);")) {
    html = html.replace("if (loteUbic) loteUbic.addEventListener('input', calcular);\n", '');
    changes.push('quitado listener hu\u00e9rfano de loteUbic');
  }

  // 7) FIX DEL BUG: } extra al final de la función calcular
  // Después de mis reemplazos, la estructura quedó:
  //   function calcular() {
  //     ...
  //     waBtn.href = '...';
  //   }      ← cierre de la función
  //   }      ← EXTRA (sin abrir nada) — ESTE ES EL BUG
  //   }
  // Lo arreglo: busco el patrón "        }\n        }\n" y lo reemplazo por uno solo
  const bugPattern = "        }\n        }\n";
  if (html.includes(bugPattern)) {
    html = html.replace(bugPattern, "        }\n");
    changes.push('FIX bug: } extra eliminado');
  }

  if (html !== before) {
    writeFileSync(file, html, 'utf8');
    console.log(`✓ [${file}]: ${changes.join(' | ')}`);
  } else {
    console.log(`- [${file}]: sin cambios`);
  }
}
console.log('\n✓ Tarea 2c lista.');
