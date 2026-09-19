#!/usr/bin/env node
/**
 * remove-descanso-alert.js
 *
 * Quita las referencias al modal "Pausa Programada" de todos los HTML
 * del proyecto: <link rel="stylesheet" href="/assets/css/descanso-alert.css">
 * y <script src="/assets/js/descanso-alert.js"></script>.
 *
 * Los archivos descanso-alert.css y descanso-alert.js NO se borran del repo
 * (quedar como backup por si la duena del sitio quiere reactivar la alerta).
 * Solo se desactivan al dejar de referenciarlos desde los HTML.
 *
 * Reglas:
 *   - Procesa todos los .html del proyecto (raiz, blog/, pages/).
 *   - Skip archivos que ya no tienen las referencias (idempotente).
 *   - Preserva CRLF vs LF segun el archivo original.
 *   - Preserva BOM UTF-8 si existe.
 *   - Borra la linea completa del <link> o <script>, junto con el salto
 *     de linea siguiente si queda vacia la linea resultante.
 *
 * Uso:
 *   node scripts/remove-descanso-alert.js
 *   node scripts/remove-descanso-alert.js --dry-run
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = ['.git', 'node_modules', '.deploy-staging', 'tmp-test'];

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
    return { bom: true, bodyStart: 3 };
  }
  return { bom: false, bodyStart: 0 };
}

function detectLineEnding(text) {
  const sample = text.slice(0, 8192);
  return sample.includes('\r\n') ? '\r\n' : '\n';
}

function processFile(file) {
  const raw = fs.readFileSync(file);
  const { bom, bodyStart } = detectBom(raw);
  const text = raw.slice(bodyStart).toString('utf8');

  // Regex para capturar la linea completa (incluyendo whitespace alrededor).
  // Toleramos multiples CRs antes del LF (algunos archivos del proyecto tienen
  // CRLF duplicados por historial de conversiones).
  // link: <link rel="stylesheet" href="/assets/css/descanso-alert.css" />
  // script: <script src="/assets/js/descanso-alert.js"></script>
  const linkRe = /^[ \t]*<link\s+[^>]*href\s*=\s*["']\/assets\/css\/descanso-alert\.css["'][^>]*>[ \t]*\r*\n/gim;
  const scriptRe = /^[ \t]*<script\s+[^>]*src\s*=\s*["']\/assets\/js\/descanso-alert\.js["'][^>]*>\s*?<\/script>[ \t]*\r*\n?/gim;

  const hadLink = linkRe.test(text);
  linkRe.lastIndex = 0;
  const hadScript = scriptRe.test(text);
  scriptRe.lastIndex = 0;

  if (!hadLink && !hadScript) {
    return { skipped: true, reason: 'no references found' };
  }

  let modified = text;
  if (hadLink) {
    linkRe.lastIndex = 0;
    modified = modified.replace(linkRe, '');
  }
  if (hadScript) {
    scriptRe.lastIndex = 0;
    modified = modified.replace(scriptRe, '');
  }

  if (DRY_RUN) {
    return { changed: true, preview: true, hadLink, hadScript };
  }

  // Reconstruir con BOM si lo tenia
  const out = (bom ? Buffer.from([0xef, 0xbb, 0xbf]) : Buffer.alloc(0));
  fs.writeFileSync(file, Buffer.concat([out, Buffer.from(modified, 'utf8')]));
  return { changed: true, hadLink, hadScript };
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
      changedFiles.push(rel + ' (link:' + r.hadLink + ', script:' + r.hadScript + ')');
    } else {
      skipped++;
      reasons[r.reason] = (reasons[r.reason] || 0) + 1;
    }
  });
  console.log('--- remove-descanso-alert ' + (DRY_RUN ? '(dry-run)' : '') + ' ---');
  console.log('Total HTML procesados: ' + files.length);
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