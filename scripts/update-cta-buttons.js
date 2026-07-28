#!/usr/bin/env node
/**
 * update-cta-buttons.js
 *
 * Reemplaza los botones "Cotizar Proyecto" (hero) y "Agendar Visita Técnica"
 * (seccion CTA final) en las paginas de municipio de pages/, para que
 * apunten al cotizador y/o a WhatsApp directo, segun el caso.
 *
 * Patrones y reemplazos:
 *  1. Hero "Cotizar Proyecto" (11 paginas):
 *     Bloque: <a href="/contacto.html" class="bg-primary text-white px-8 py-3
 *            rounded-full font-semibold text-lg hover:opacity-90 transition
 *            duration-300" aria-label="Cotizar Proyecto de casa prefabricada
 *            en {MUNICIPIO}">Cotizar Proyecto</a>
 *     -> Bloque de 2 botones: Cotizador + WhatsApp (estilo consistente con
 *        paginas nuevas tipo cajica/chia).
 *
 *  2. Final "Agendar Visita Técnica" Variante A (4 paginas: boyaca, sopo,
 *     villadeleyva, la-vega) — sin "Cotizar Ahora" al lado:
 *     -> Bloque de 2 botones: Cotizador + WhatsApp.
 *
 *  3. Final "Agendar Visita Técnica" Variante B (3 paginas: supata,
 *     san-francisco, pacho) — con "Cotizar Ahora" al lado que YA va al
 *     cotizador:
 *     -> Solo boton WhatsApp (no duplicar cotizador).
 *
 * Idempotencia:
 *  - Detecta si el HTML nuevo ya esta presente (boton "WhatsApp" seguido en
 *    el mismo bloque) y salta sin duplicar.
 *  - Detecta BOM UTF-8 y CRLF/LF, los preserva.
 *
 * Uso:
 *   node scripts/update-cta-buttons.js          # aplica cambios
 *   node scripts/update-cta-buttons.js --dry-run  # solo muestra
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'pages');
const SKIP_DIRS = ['.git', 'node_modules'];

const DRY_RUN = process.argv.includes('--dry-run');
const COTIZADOR_HREF = '/cotizador-precios-casas-prefabricadas.html';
const WHATSAPP_BASE = 'https://wa.me/573142891018?text=';

// ---------- IO helpers ----------

function detectBom(buf) {
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return { bom: true, bodyStart: 3 };
  }
  return { bom: false, bodyStart: 0 };
}

function detectLineEnding(text) {
  return text.slice(0, 8192).includes('\r\n') ? '\r\n' : '\n';
}

function readFile(file) {
  const raw = fs.readFileSync(file);
  const { bom, bodyStart } = detectBom(raw);
  return { text: raw.slice(bodyStart).toString('utf8'), bom };
}

function writeFile(file, text, bom) {
  const body = Buffer.from(text, 'utf8');
  const out = bom ? Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), body]) : body;
  if (!DRY_RUN) fs.writeFileSync(file, out);
}

function listHtml(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listHtml(full, out);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) out.push(full);
  }
  return out;
}

// ---------- Municipio extraction ----------

const SLUG_TO_NAME = {
  'boyaca': 'Boyacá',
  'villadeleyva': 'Villa de Leyva',
  'supata': 'Supatá',
  'sopo': 'Sopó',
  'san-francisco': 'San Francisco',
  'pacho': 'Pacho',
  'la-vega': 'La Vega',
  'choconta': 'Chocontá',
  'cajica': 'Cajicá',
  'chia': 'Chía',
  'tocancipa': 'Tocancipá',
  'madrid': 'Madrid',
  'funza': 'Funza',
  'zipaquira': 'Zipaquirá',
  'santa-marta': 'Santa Marta',
  'norte-bogota': 'Norte de Bogotá',
  'colombianos-canada': 'Colombia-Canadá',
  'colombianos-en-el-exterior': 'el Exterior',
  'colombianos-espana': 'Colombia-España',
  'colombianos-estados-unidos': 'Colombia-Estados Unidos',
  'colombianos-mexico': 'Colombia-México',
  'casas-prefabricadas-colombia': 'Colombia',
};

function extractMunicipioFromHeroAria(text) {
  // aria-label="Cotizar Proyecto de casa prefabricada en {MUNICIPIO}"
  const m = /aria-label="Cotizar Proyecto de casa prefabricada en ([^"]+)"/i.exec(text);
  if (m) return m[1].trim();
  return null;
}

function extractMunicipioFromTitle(text) {
  // <title>Casas Prefabricadas en {MUNICIPIO} | ...
  const m = /<title>\s*Casas Prefabricadas en ([^|<]+)/i.exec(text);
  if (m) return m[1].trim();
  return null;
}

function extractMunicipioFromH1(text) {
  // <h1 ...><strong>Casas Prefabricadas en {MUNICIPIO}</strong></h1>
  const m = /<h1[^>]*>\s*<strong>\s*Casas Prefabricadas en ([^<]+)<\/strong>/i.exec(text);
  if (m) return m[1].trim();
  return null;
}

function municipioFromFilename(file) {
  const base = path.basename(file, '.html');
  return SLUG_TO_NAME[base] || base;
}

function resolveMunicipio(file, text) {
  return (
    extractMunicipioFromHeroAria(text) ||
    extractMunicipioFromH1(text) ||
    extractMunicipioFromTitle(text) ||
    municipioFromFilename(file)
  );
}

// ---------- Builders ----------

function whatsappText(municipio) {
  // "Hola CONCASAYA, estoy interesado en una casa prefabricada en {MUNICIPIO}. ¿Pueden ayudarme?"
  const msg = `Hola CONCASAYA, estoy interesado en una casa prefabricada en ${municipio}. ¿Pueden ayudarme?`;
  return WHATSAPP_BASE + encodeURIComponent(msg);
}

function heroButtonsBlock(municipio, indent) {
  return [
    `${indent}<div class="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">`,
    `${indent}  <a`,
    `${indent}    href="${COTIZADOR_HREF}"`,
    `${indent}    class="inline-flex items-center justify-center bg-primary text-white px-6 py-3 rounded-full font-semibold text-base sm:text-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg"`,
    `${indent}    aria-label="Cotizar Proyecto de casa prefabricada en ${municipio}"`,
    `${indent}  >`,
    `${indent}    <i class="fas fa-calculator mr-2"></i>Cotizar Proyecto`,
    `${indent}  </a>`,
    `${indent}  <a`,
    `${indent}    href="${whatsappText(municipio)}"`,
    `${indent}    target="_blank"`,
    `${indent}    class="inline-flex items-center justify-center bg-green-500 text-white px-6 py-3 rounded-full font-semibold text-base sm:text-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg"`,
    `${indent}    aria-label="WhatsApp para ${municipio}"`,
    `${indent}  >`,
    `${indent}    <i class="fab fa-whatsapp mr-2"></i>WhatsApp`,
    `${indent}  </a>`,
    `${indent}</div>`,
  ].join('\n');
}

function whatsappOnlyButton(municipio, indent, variant /* 'transparent' | 'white' */) {
  // Para Variante B (sobre fondo primary azul): estilo transparente con borde blanco
  // Para Variante A-blanco (sobre fondo blanco del CTA final): bg-green-500
  const style = variant === 'transparent'
    ? `bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white hover:text-green-600 transition duration-300 inline-flex items-center justify-center`
    : `bg-green-500 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-green-600 transition duration-300 inline-flex items-center justify-center`;
  return [
    `<a`,
    `${indent}  href="${whatsappText(municipio)}"`,
    `${indent}  target="_blank"`,
    `${indent}  class="${style}"`,
    `${indent}  aria-label="WhatsApp para ${municipio}"`,
    `${indent}>`,
    `${indent}  <i class="fab fa-whatsapp mr-2"></i>WhatsApp`,
    `${indent}</a>`,
  ].join('\n');
}

// ---------- Replacements ----------

// Indent generico para botones (12 espacios segun el patron visto en sopo.html lineas 507-512).
const BTN_INDENT = '            ';

function replaceHeroButton(text, municipio) {
  // Bloque actual:
  //   <a
  //     href="/contacto.html"
  //     class="bg-primary text-white px-8 py-3 rounded-full font-semibold text-lg hover:opacity-90 transition duration-300"
  //     aria-label="Cotizar Proyecto de casa prefabricada en {MUNICIPIO}"
  //   >Cotizar Proyecto</a
  // >
  // Lo capturamos como un anchor multilinea flexible.

  // Regex robusto: tolera CRLF o LF y la indentacion exacta.
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const re = new RegExp(
    '^(\\s*)<a\\s*\\n' +
    '\\s*href="/contacto\\.html"\\s*\\n' +
    '\\s*class="bg-primary text-white px-8 py-3 rounded-full font-semibold text-lg hover:opacity-90 transition duration-300"\\s*\\n' +
    '\\s*aria-label="Cotizar Proyecto de casa prefabricada en [^"]+"\\s*\\n' +
    '\\s*>Cotizar Proyecto</a\\s*\\n' +
    '\\s*>',
    'm'
  );

  // Idempotencia: si el bloque siguiente ya contiene un WhatsApp, saltar.
  if (/Cotizar Proyecto[\s\S]{0,2000}WhatsApp/.test(text)) {
    return { text, changed: false, reason: 'hero already has WhatsApp' };
  }

  const m = re.exec(text);
  if (!m) return { text, changed: false, reason: 'hero pattern not found' };

  const indent = m[1];
  const block = heroButtonsBlock(municipio, indent);
  const replaced = text.slice(0, m.index) + block + text.slice(m.index + m[0].length);
  return { text: replaced, changed: true };
}

function replaceAgendarFinalVarianteA(text, municipio) {
  // Bloque:
  //   <a
  //     href="/contacto.html"
  //     class="bg-white text-primary px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition duration-300"
  //   >Agendar Visita Técnica</a
  // >
  const re = new RegExp(
    '^(\\s*)<a\\s*\\n' +
    '\\s*href="/contacto\\.html"\\s*\\n' +
    '\\s*class="bg-white text-primary px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition duration-300"\\s*\\n' +
    '\\s*>Agendar Visita T[eé]cnica</a\\s*\\n' +
    '\\s*>',
    'm'
  );

  // Idempotencia: si en el archivo ya hay un anchor WhatsApp cerca, saltar.
  if (/Agendar Visita T[eé]cnica[\s\S]{0,2000}WhatsApp/i.test(text)) {
    return { text, changed: false, reason: 'final Variante A already has WhatsApp' };
  }

  const m = re.exec(text);
  if (!m) return { text, changed: false, reason: 'final Variante A pattern not found' };

  const indent = m[1];
  // Reusamos el mismo builder del hero (estilo consistente).
  const block = heroButtonsBlock(municipio, indent);
  return { text: text.slice(0, m.index) + block + text.slice(m.index + m[0].length), changed: true };
}

function replaceAgendarFinalVarianteB(text, municipio) {
  // Bloque (dentro de un flex con "Cotizar Ahora" al lado):
  //   <a
  //     href="/contacto.html"
  //     class="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white hover:text-primary transition duration-300"
  //   >Agendar Visita Técnica</a
  // >
  const re = new RegExp(
    '^(\\s*)<a\\s*\\n' +
    '\\s*href="/contacto\\.html"\\s*\\n' +
    '\\s*class="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white hover:text-primary transition duration-300"\\s*\\n' +
    '\\s*>Agendar Visita T[eé]cnica</a\\s*\\n' +
    '\\s*>',
    'm'
  );

  // Idempotencia.
  if (/Agendar Visita T[eé]cnica[\s\S]{0,2000}WhatsApp/i.test(text)) {
    return { text, changed: false, reason: 'final Variante B already has WhatsApp' };
  }

  const m = re.exec(text);
  if (!m) return { text, changed: false, reason: 'final Variante B pattern not found' };

  const indent = m[1];
  const block = whatsappOnlyButton(municipio, indent, 'transparent');
  return { text: text.slice(0, m.index) + block + text.slice(m.index + m[0].length), changed: true };
}

// ---------- Main ----------

function processFile(file) {
  const { text, bom } = readFile(file);
  const municipio = resolveMunicipio(file, text);
  let working = text;
  const changes = [];

  // 1. Hero "Cotizar Proyecto"
  {
    const r = replaceHeroButton(working, municipio);
    if (r.changed) { working = r.text; changes.push('hero'); }
  }

  // 2. Final Variante B (con "Cotizar Ahora" al lado) - intentar primero
  //    porque su regex es mas especifica.
  {
    const r = replaceAgendarFinalVarianteB(working, municipio);
    if (r.changed) { working = r.text; changes.push('final-B'); }
  }

  // 3. Final Variante A (sin "Cotizar Ahora" al lado)
  {
    const r = replaceAgendarFinalVarianteA(working, municipio);
    if (r.changed) { working = r.text; changes.push('final-A'); }
  }

  if (changes.length === 0) {
    return { file, modified: false, municipio };
  }

  writeFile(file, working, bom);
  return { file, modified: true, changes, municipio };
}

function main() {
  const files = listHtml(PAGES_DIR);
  const stats = { total: files.length, modified: 0, skipped: 0 };
  console.log(`Escaneando ${files.length} HTMLs en pages/ ...\n`);

  for (const file of files) {
    const r = processFile(file);
    const rel = path.relative(ROOT, r.file);
    if (r.modified) {
      stats.modified++;
      console.log(`  + ${rel}  [${r.changes.join(', ')}]  (${r.municipio})`);
    } else {
      stats.skipped++;
    }
  }

  console.log('\n---');
  console.log(`Total:           ${stats.total}`);
  console.log(`Modificados:     ${stats.modified}`);
  console.log(`Sin cambios:     ${stats.skipped}`);
  if (DRY_RUN) console.log('(dry-run: no se escribio nada)');
}

main();
