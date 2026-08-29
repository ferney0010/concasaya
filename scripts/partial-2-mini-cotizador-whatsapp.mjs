// Tarea 2: agrega 2 campos al mini-cotizador (nombre + municipio exacto) y los
// incluye en el mensaje de WhatsApp. Se aplica al index.html y al artículo
// destacado (blog/precio-casa-prefabricada-colombia-2026.html).
import { readFileSync, readdirSync, writeFileSync } from 'fs';

const files = ['index.html', 'blog/precio-casa-prefabricada-colombia-2026.html'];

// 1) Construir la lista de municipios para el select (lee /pages/ + fijos)
const pagesDir = 'pages';
const pageFiles = readdirSync(pagesDir).filter(f => f.endsWith('.html') && !f.startsWith('casas-prefabricadas-colombia'));
const fixes = {
  'chia': 'Chía', 'cajica': 'Cajicá', 'zipaquira': 'Zipaquirá', 'sopo': 'Sopó',
  'cota': 'Cota', 'mosquera': 'Mosquera', 'madrid': 'Madrid', 'tocancipa': 'Tocancipá',
  'funza': 'Funza', 'suba': 'Suba', 'norte-bogota': 'Norte de Bogotá',
  'villadeleyva': 'Villa de Leyva', 'la-vega': 'La Vega', 'la-mesa': 'La Mesa',
  'la-calera': 'La Calera', 'tunja': 'Tunja', 'duitama': 'Duitama', 'paipa': 'Paipa',
  'samaca': 'Samacá', 'boyaca': 'Boyacá', 'sogamoso': 'Sogamoso',
  'chiquinquira': 'Chiquinquirá', 'choconta': 'Chocontá', 'firavitoba': 'Firavitoba',
  'raquira': 'Ráquira', 'valle-de-tenza': 'Valle de Tenza', 'santa-marta': 'Santa Marta',
  'barbosa': 'Barbosa', 'velez': 'Vélez', 'puente-nacional': 'Puente Nacional',
  'san-francisco': 'San Francisco', 'facatativa': 'Facatativá', 'fusagasuga': 'Fusagasugá',
  'soacha': 'Soacha', 'pacho': 'Pacho', 'supata': 'Supatá', 'subachoque': 'Subachoque',
  'mesitas-del-colegio': 'Mesitas del Colegio', 'sesquile': 'Sesquilé', 'guasca': 'Guasca',
  'villeta': 'Villeta',
  'colombianos-en-el-exterior': 'Colombianos en el exterior',
  'colombianos-estados-unidos': 'Estados Unidos',
  'colombianos-espana': 'España',
  'colombianos-canada': 'Canadá',
  'colombianos-mexico': 'México',
};
const allMunis = pageFiles.map(f => {
  const slug = f.replace('.html', '');
  const nombre = fixes[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return { slug, nombre };
});

// 2) Generar las <option> para el select, agrupadas por depto
function deptoOf(slug) {
  if (slug === 'bogota') return 'Bogotá D.C.';
  const bogSab = ['chia','cajica','zipaquira','sopo','cota','suba','norte-bogota','funza','mosquera','madrid','tocancipa'];
  if (bogSab.includes(slug)) return 'Bogotá y Sabana';
  const cundi = ['la-vega','la-calera','la-mesa','guasca','sesquile','soacha','facatativa','fusagasuga','pacho','mesitas-del-colegio','subachoque','supata','villeta'];
  if (cundi.includes(slug)) return 'Cundinamarca';
  const boy = ['tunja','villadeleyva','duitama','sogamoso','paipa','samaca','boyaca','chiquinquira','choconta','firavitoba','raquira','valle-de-tenza'];
  if (boy.includes(slug)) return 'Boyacá';
  const san = ['barbosa','velez','puente-nacional','san-francisco'];
  if (san.includes(slug)) return 'Santander';
  if (slug === 'santa-marta') return 'Magdalena';
  if (slug.startsWith('colombianos-')) return 'En el exterior';
  return 'Otros';
}
const groups = {};
for (const m of allMunis) {
  const d = deptoOf(m.slug);
  if (!groups[d]) groups[d] = [];
  groups[d].push(m);
}
for (const d in groups) groups[d].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
const ORDER = ['Bogotá y Sabana', 'Cundinamarca', 'Boyacá', 'Santander', 'Magdalena', 'En el exterior'];
const opts = ['<option value="" disabled selected>— Elige tu municipio —</option>'];
for (const d of ORDER) {
  if (!groups[d]) continue;
  opts.push(`<optgroup label="${d}">`);
  for (const m of groups[d]) {
    const url = m.slug === 'bogota' ? '/' : ('/pages/' + m.slug + '.html');
    opts.push(`<option value="${m.nombre}" data-url="${url}">${m.nombre}</option>`);
  }
  opts.push('</optgroup>');
}
const selectOptsHtml = opts.join('\n                  ');

// 3) El HTML adicional: 2 campos (nombre + municipio)
const extraFieldsHtml = `
                <label class="hero-cta-field">
                  <span class="hero-cta-field__label">Tu nombre</span>
                  <input type="text" id="hero-nombre" placeholder="Ej: Juan Pérez" autocomplete="name" class="hero-cta-input" />
                </label>
                <label class="hero-cta-field">
                  <span class="hero-cta-field__label">Tu municipio</span>
                  <select id="hero-municipio" class="hero-cta-input">
                    ${selectOptsHtml}
                  </select>
                </label>
`;

// 4) El nuevo mensaje de WhatsApp (función calcular)
const newCalcular = `function calcular() {
          const m2 = Math.max(20, Math.min(500, parseInt(m2Input.value) || 60));
          const sistema = sistemaSelect.value;
          const zona = zonaSelect.value;
          const nombre = (document.getElementById('hero-nombre')?.value || '').trim();
          const municipio = (document.getElementById('hero-municipio')?.value || '').trim();
          const base = precios[sistema] || 1150000;
          const multZona = zonaMult[zona] || 1.0;
          // Rango amplio (referencia preliminar) para reflejar costos ocultos típicos
          const baseCalc = base * m2 * multZona;
          const min = baseCalc * 0.85;
          const max = baseCalc * 1.55;
          estimateValue.textContent = formatMillones(min) + ' - ' + formatMillones(max);

          // Construir mensaje de WhatsApp con TODOS los datos + nota de que es referencial
          const lines = [];
          lines.push('Hola CONCASAYA, quiero cotizar una casa prefabricada.');
          if (nombre) lines.push('• Mi nombre: ' + nombre);
          lines.push('• Metros\\u00b2: ' + m2 + ' m\\u00b2');
          lines.push('• Sistema: ' + sistemaLabel[sistema]);
          lines.push('• Zona: ' + zonaLabel[zona]);
          if (municipio) lines.push('• Mi municipio: ' + municipio);
          lines.push('• Referencia inicial vista en la web: ' + formatMillones(min) + ' - ' + formatMillones(max) + ' (s\\u00e9 que es muy preliminar, faltan acabados, instalaciones, licencia, transporte, etc.)');
          lines.push('\\u00bfMe pueden pasar una cotizaci\\u00f3n real con estos datos?');
          waBtn.href = 'https://wa.me/573142891018?text=' + encodeURIComponent(lines.join('\\n'));
        }`;

// 5) Aplicar cambios a cada archivo
for (const file of files) {
  let html = readFileSync(file, 'utf8');
  const original = html;
  const changes = [];

  // 5a) Insertar los 2 campos extra (nombre + municipio) justo antes de la
  // <div class="hero-cta-estimate" id="hero-estimate"...
  const marker = '<div class="hero-cta-estimate" id="hero-estimate"';
  const idx = html.indexOf(marker);
  if (idx < 0) {
    console.log(`⚠ [${file}] No encontré hero-cta-estimate`);
    continue;
  }
  // Verificar que aún no estén insertados
  if (html.indexOf('id="hero-nombre"') >= 0) {
    changes.push('(ya tenía los campos extra)');
  } else {
    html = html.substring(0, idx) + extraFieldsHtml + '\n                ' + html.substring(idx);
    changes.push('campos extra (nombre + municipio) insertados');
  }

  // 5b) Reemplazar la función calcular() — solo si no tiene ya la versión nueva
  if (!html.includes('Mi nombre: ') && html.includes("function calcular() {")) {
    const oldCalcular = /function calcular\(\) \{[\s\S]*?waBtn\.href = [^;]+;/;
    if (oldCalcular.test(html)) {
      html = html.replace(oldCalcular, newCalcular);
      changes.push('función calcular() reemplazada con nombre+municipio');
    }
  } else if (html.includes('Mi nombre: ')) {
    changes.push('(calcular ya estaba actualizada)');
  } else {
    changes.push('⚠ no se encontró la función calcular() original');
  }

  // 5c) Agregar listeners para los nuevos inputs (si no están)
  if (!html.includes("getElementById('hero-nombre')?.addEventListener") && !html.includes("getElementById('hero-nombre')?.add")) {
    // Buscar el último addEventListener de 'change' o 'input' e insertar después
    const inputRe = /m2Input\.addEventListener\('input', calcular\);/;
    if (inputRe.test(html)) {
      const listenersToAdd = `
        const nombreInput = document.getElementById('hero-nombre');
        const municipioSelect = document.getElementById('hero-municipio');
        if (nombreInput) nombreInput.addEventListener('input', calcular);
        if (municipioSelect) municipioSelect.addEventListener('change', calcular);`;
      html = html.replace(inputRe, inputRe.exec(html)[0] + listenersToAdd);
      changes.push('listeners para nombre/municipio agregados');
    } else {
      changes.push('⚠ no se encontró patrón para agregar listeners');
    }
  } else {
    changes.push('(listeners ya estaban)');
  }

  writeFileSync(file, html, 'utf8');
  console.log(`✓ [${file}]: ${changes.join(' | ')}`);
}
console.log('\n✓ Tarea 2 lista.');
