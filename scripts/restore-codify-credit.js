#!/usr/bin/env node
/**
 * restore-codify-credit.js
 *
 * Inverso de replace-codify-credit.js: quita el bloque romantico
 * "Hecho con [corazon] por Codify Tech" del footer y vuelve al
 * copy sobrio "Desarrollado por Codify Tech" en todos los HTMLs
 * del proyecto que aun tengan el copy romantico.
 *
 * Reglas:
 *   - Skip archivos que ya tengan "Desarrollado por" (no duplica).
 *   - Skip archivos sin el bloque romantico.
 *   - Tolera variaciones de indentacion (regex multiline flexible).
 *   - Preserva BOM UTF-8 si el archivo lo tiene.
 *   - Preserva CRLF vs LF segun el archivo original.
 *   - Reemplazo idempotente: si ya esta el copy sobrio, no toca.
 *
 * Uso:
 *   node scripts/restore-codify-credit.js
 *   node scripts/restore-codify-credit.js --dry-run
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = ['.git', 'node_modules', 'node_modules_backup'];

// Bloque romantico actual: "Hecho con [corazon] por Codify Tech"
// Tolera espacios variables al inicio de cada linea.
const OLD_BLOCK = [
  '<div class="flex flex-col items-center gap-1">',
  '<a',
  'href="https://www.codifytech.click/"',
  'target="_blank"',
  'rel="noopener noreferrer"',
  'aria-label="Codify Tech"',
  'class="group inline-flex items-center justify-center gap-2 text-base font-light tracking-wide text-gray-300 hover:text-white transition-colors duration-300"',
  '>',
  '<span>Hecho con</span>',
  '<span',
  'class="text-red-500 text-lg leading-none animate-pulse group-hover:scale-125 transition-transform duration-300 inline-block"',
  'aria-hidden="true"',
  '>\\u2764</span',
  '>',
  '<span>por</span>',
  '<span',
  'class="font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300 underline-offset-4 group-hover:underline"',
  '>Codify Tech</span',
  '>',
  '</a>',
  '</div>',
].join('\\s*');

const OLD_RE = new RegExp(
  '^[ \\t]*' + OLD_BLOCK + '[ \\t]*$',
  'm',
);

// Bloque sobrio: "Desarrollado por Codify Tech"
const NEW_BLOCK = `<div class="flex flex-col items-center gap-2">
            <p class="text-xs text-gray-500">Desarrollado por</p>
            <a
              href="https://www.codifytech.click/"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center space-x-2 text-cyan-400"
            >
              <span class="font-semibold text-sm">Codify Tech</span>
              <i class="fas fa-external-link-alt text-xs text-cyan-400"></i>
            </a>
          </div>`;

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
  return text.slice(0, 8192).includes('\r\n') ? '\r\n' : '\n';
}

function processFile(file) {
  const buf = fs.readFileSync(file);
  const { bom, bodyStart } = detectBom(buf);
  const text = buf.slice(bodyStart).toString('utf8');
  const eol = detectLineEnding(text);

  // Skip si ya tiene el copy sobrio (no duplica).
  if (text.includes('Desarrollado por') && text.includes('Codify Tech') && !text.includes('\u2764')) {
    return { status: 'already-sober' };
  }

  if (!OLD_RE.test(text)) {
    return { status: 'no-romantic-block' };
  }

  // Reemplazo.
  const updated = text.replace(OLD_RE, NEW_BLOCK);

  // Ajustar line endings al original.
  const outText = eol === '\r\n' ? updated.replace(/\n/g, '\r\n') : updated;
  const outBuf = Buffer.concat([
    bom ? Buffer.from([0xef, 0xbb, 0xbf]) : Buffer.alloc(0),
    Buffer.from(outText, 'utf8')
  ]);

  if (DRY_RUN) {
    return { status: 'would-update' };
  }

  fs.writeFileSync(file, outBuf);
  return { status: 'updated' };
}

function main() {
  const files = walkHtml(ROOT);
  const stats = { updated: 0, 'would-update': 0, 'already-sober': 0, 'no-romantic-block': 0 };
  const touched = [];

  for (const f of files) {
    const r = processFile(f);
    if (r.status === 'updated' || r.status === 'would-update') {
      touched.push(f);
    }
    stats[r.status] = (stats[r.status] || 0) + 1;
  }

  console.log('Modo: ' + (DRY_RUN ? 'DRY-RUN' : 'WRITE'));
  console.log('Archivos escaneados: ' + files.length);
  console.log('Actualizados: ' + (stats.updated + (stats['would-update'] || 0)));
  console.log('Ya tenian copy sobrio: ' + stats['already-sober']);
  console.log('Sin bloque romantico: ' + stats['no-romantic-block']);
  if (touched.length) {
    console.log('\nArchivos tocados:');
    for (const t of touched) {
      console.log('  ' + path.relative(ROOT, t));
    }
  }
}

main();
