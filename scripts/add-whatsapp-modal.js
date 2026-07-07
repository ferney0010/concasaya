#!/usr/bin/env node
/**
 * add-whatsapp-modal.js
 *
 * Inyecta <link href="/assets/css/whatsapp-modal.css"> en el <head>
 * y <script src="/assets/js/whatsapp-modal.js"></script> antes del
 * </body>, en todos los HTMLs del proyecto que tengan un link
 * wa.me/573142891018 pero aun no tengan el modal cargado.
 *
 * Reglas:
 *   - Skip archivos que ya tengan el modal (whatsapp-modal.css o
 *     whatsapp-modal.js referenciados).
 *   - Detecta la indentacion del ultimo <link rel="stylesheet">
 *     existente (o el ultimo <script src="...">) y la replica.
 *   - Preserva BOM UTF-8 si el archivo lo tiene.
 *   - Preserva CRLF vs LF segun el archivo original.
 *   - Inyeccion idempotente: si ya esta, no duplica.
 *
 * Uso:
 *   node scripts/add-whatsapp-modal.js
 *   node scripts/add-whatsapp-modal.js --dry-run
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = ['.git', 'node_modules'];
const CSS_TAG = '<link rel="stylesheet" href="/assets/css/whatsapp-modal.css" />';
const JS_TAG = '<script src="/assets/js/whatsapp-modal.js"></script>';
const WA_ME = 'wa.me/573142891018';

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

function detectBom(buf) {
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return { bom: true, bodyStart: 3, encoding: 'utf8-bom' };
  }
  return { bom: false, bodyStart: 0, encoding: 'utf8' };
}

function detectLineEnding(text) {
  const sample = text.slice(0, 8192);
  return sample.includes('\r\n') ? '\r\n' : '\n';
}

function findLastScriptSrcBeforeBody(text) {
  // Busca el ultimo <script src="..."></script> antes de </body>.
  // Usa regex lazy para NO consumir el \r\n de final de linea.
  const bodyClose = text.toLowerCase().lastIndexOf('</body>');
  if (bodyClose === -1) return null;
  const beforeBody = text.slice(0, bodyClose);
  const re = /^[ \t]*<script\s+[^>]*src\s*=\s*["'][^"']+["'][^>]*>\s*?<\/script>[ \t]*$/gim;
  let lastMatch = null;
  let m;
  while ((m = re.exec(beforeBody)) !== null) {
    lastMatch = m;
  }
  return lastMatch;
}

function findLastLinkStylesheetInHead(text) {
  // Busca el ultimo <link rel="stylesheet" ...> dentro del <head>.
  // Usa regex lazy para NO consumir el \r\n de final de linea.
  const headOpenMatch = /<head[^>]*>/i.exec(text);
  if (!headOpenMatch) return null;
  const headOpen = headOpenMatch.index + headOpenMatch[0].length;
  const headClose = text.toLowerCase().indexOf('</head>', headOpen);
  if (headClose === -1) return null;
  const head = text.slice(headOpen, headClose);
  const re = /^[ \t]*<link\s+[^>]*rel\s*=\s*["']stylesheet["'][^>]*>[ \t]*$/gim;
  let lastMatch = null;
  let m;
  while ((m = re.exec(head)) !== null) {
    lastMatch = { match: m[0], offset: headOpen + m.index };
  }
  return lastMatch;
}

function detectIndent(sample) {
  // Toma la primera linea del sample y devuelve su prefijo de espacios/tabs.
  const line = sample.split(/\r?\n/)[0] || '';
  const m = /^[ \t]*/.exec(line);
  return m ? m[0] : '    ';
}

function processFile(file) {
  const raw = fs.readFileSync(file);
  const { bom, bodyStart } = detectBom(raw);
  const text = raw.slice(bodyStart).toString('utf8');

  // Skip si ya tiene el modal (CSS o JS).
  if (/whatsapp-modal\.css/.test(text) || /whatsapp-modal\.js/.test(text)) {
    return { skipped: true, reason: 'already has modal' };
  }

  // Skip si no tiene wa.me (no es relevante).
  if (!text.includes(WA_ME)) {
    return { skipped: true, reason: 'no wa.me' };
  }

  const eol = detectLineEnding(text);
  let modified = text;

  // 1) Inyectar CSS despues del ultimo <link rel="stylesheet"> en <head>.
  const lastLink = findLastLinkStylesheetInHead(modified);
  if (lastLink) {
    const indent = detectIndent(lastLink.match);
    const insert = `${indent}${CSS_TAG}`;
    const insertAt = lastLink.offset + lastLink.match.length;
    modified = modified.slice(0, insertAt) + eol + insert + modified.slice(insertAt);
  } else {
    // Sin links en head: insertar justo antes de </head>.
    const headClose = modified.toLowerCase().lastIndexOf('</head>');
    if (headClose === -1) {
      return { skipped: true, reason: 'no </head> found' };
    }
    const indent = '    '; // default 4 espacios
    const insert = `${indent}${CSS_TAG}`;
    modified = modified.slice(0, headClose) + insert + eol + modified.slice(headClose);
  }

  // 2) Inyectar JS despues del ultimo <script src="..."> antes de </body>.
  const lastScript = findLastScriptSrcBeforeBody(modified);
  if (lastScript) {
    const indent = detectIndent(lastScript[0]);
    const insert = `${indent}${JS_TAG}`;
    const insertAt = lastScript.index + lastScript[0].length;
    modified = modified.slice(0, insertAt) + eol + insert + modified.slice(insertAt);
  } else {
    // Sin scripts antes de </body>: insertar justo antes de </body>.
    const bodyClose = modified.toLowerCase().lastIndexOf('</body>');
    if (bodyClose === -1) {
      return { skipped: true, reason: 'no </body> found' };
    }
    const indent = '    '; // default 4 espacios
    const insert = `${indent}${JS_TAG}`;
    modified = modified.slice(0, bodyClose) + insert + eol + modified.slice(bodyClose);
  }

  if (modified === text) {
    return { skipped: true, reason: 'no changes needed' };
  }

  // Escribir preservando BOM.
  const body = Buffer.from(modified, 'utf8');
  const out = bom ? Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), body]) : body;

  if (!DRY_RUN) {
    fs.writeFileSync(file, out);
  }

  return { modified: true };
}

function main() {
  const files = walkHtml(ROOT);
  const stats = { total: files.length, modified: 0, skippedAlready: 0, skippedNoWa: 0, errors: [] };

  for (const file of files) {
    try {
      const result = processFile(file);
      if (result.modified) {
        stats.modified++;
        const rel = path.relative(ROOT, file);
        console.log(`  modified: ${rel}`);
      } else if (result.reason === 'already has modal') {
        stats.skippedAlready++;
      } else if (result.reason === 'no wa.me') {
        stats.skippedNoWa++;
      }
    } catch (e) {
      stats.errors.push({ file, error: e.message });
      console.error(`  ERROR: ${file} -- ${e.message}`);
    }
  }

  console.log('');
  console.log('---');
  console.log(`Total HTMLs escaneados:    ${stats.total}`);
  console.log(`Modificados:               ${stats.modified}`);
  console.log(`Saltados (ya tienen modal): ${stats.skippedAlready}`);
  console.log(`Saltados (sin wa.me):      ${stats.skippedNoWa}`);
  console.log(`Errores:                   ${stats.errors.length}`);
  if (DRY_RUN) console.log('(dry-run: no se escribio nada)');
}

main();