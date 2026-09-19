#!/usr/bin/env node
/**
 * add-strict-lote-flag.js
 *
 * Agrega el atributo data-wm-strict-lote al <body> de todos los HTML
 * del proyecto que tengan cargado el modal de WhatsApp (whatsapp-modal.js)
 * y al menos un enlace wa.me/573142891018. Asi el filtro estricto del
 * checklist de lote se aplica en TODAS las paginas con boton de WhatsApp.
 *
 * Reglas:
 *   - Solo procesa archivos que tienen el modal cargado (whatsapp-modal.js).
 *   - Skip si no tienen ningun enlace wa.me (paginas sin WhatsApp no aplica).
 *   - Idempotente: skip si el <body> ya tiene data-wm-strict-lote.
 *   - Preserva CRLF vs LF segun el archivo original.
 *   - Preserva la indentacion y atributos existentes del <body>.
 *
 * Uso:
 *   node scripts/add-strict-lote-flag.js
 *   node scripts/add-strict-lote-flag.js --dry-run
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = ['.git', 'node_modules', 'tmp-test'];
const WA_ME = 'wa.me/573142891018';
const MODAL_JS = 'whatsapp-modal.js';
const FLAG_ATTR = 'data-wm-strict-lote';

const DRY_RUN = process.argv.includes('--dry-run');

function walkHtml(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtml(full, acc);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      acc.push(full);
    }
  }
  return acc;
}

function detectLineEnding(text) {
  const sample = text.slice(0, 8192);
  return sample.includes('\r\n') ? '\r\n' : '\n';
}

function addFlagToBody(text) {
  // Encuentra el <body ...> (con cualquier atributo, multilinea tolerante).
  // La regex captura desde '<' hasta '>' sin consumir el newline siguiente.
  const re = /<body\b([^>]*)>/i;
  const m = re.exec(text);
  if (!m) return null;
  const existingAttrs = m[1] || '';
  if (existingAttrs.includes(FLAG_ATTR)) {
    return { skipped: true, reason: 'flag already present' };
  }
  // Insertar el atributo antes del '>' conservando el orden natural
  const newTag = '<body' + existingAttrs + ' ' + FLAG_ATTR + '>';
  const start = m.index;
  const end = start + m[0].length;
  return { replacedText: text.slice(0, start) + newTag + text.slice(end) };
}

function processFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  // Skip si no tiene el modal cargado (no tiene caso activar el flag ahi)
  if (!raw.includes(MODAL_JS)) {
    return { skipped: true, reason: 'no whatsapp-modal.js loaded' };
  }
  // Skip si no tiene ningun wa.me (pagina sin boton de WhatsApp)
  if (!raw.includes(WA_ME)) {
    return { skipped: true, reason: 'no wa.me link' };
  }
  const result = addFlagToBody(raw);
  if (!result) {
    return { skipped: true, reason: 'no <body> tag found' };
  }
  if (result.skipped) {
    return { skipped: true, reason: result.reason };
  }
  if (DRY_RUN) {
    return { changed: true, preview: true };
  }
  fs.writeFileSync(file, result.replacedText, 'utf8');
  return { changed: true };
}

function main() {
  const files = walkHtml(ROOT);
  let modified = 0;
  let skipped = 0;
  const reasons = {};
  const changedFiles = [];
  files.forEach(function (file) {
    const rel = path.relative(ROOT, file);
    const r = processFile(file);
    if (r.changed) {
      modified++;
      changedFiles.push(rel);
    } else {
      skipped++;
      reasons[r.reason] = (reasons[r.reason] || 0) + 1;
    }
  });
  console.log('--- add-strict-lote-flag ' + (DRY_RUN ? '(dry-run)' : '') + ' ---');
  console.log('Total HTML encontrados: ' + files.length);
  console.log('Modificados: ' + modified);
  console.log('Omitidos:    ' + skipped);
  if (Object.keys(reasons).length) {
    console.log('Razones de skip:');
    Object.keys(reasons).forEach(function (k) { console.log('  - ' + k + ': ' + reasons[k]); });
  }
  if (DRY_RUN && changedFiles.length) {
    console.log('\nArchivos que se modificarian:');
    changedFiles.forEach(function (f) { console.log('  ' + f); });
  }
}

main();