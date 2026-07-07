#!/usr/bin/env node
/**
 * remove-lead-capture-modal.js
 *
 * Elimina la linea <script src="/assets/js/lead-capture-modal.js"></script>
 * de todos los HTMLs del proyecto.
 *
 * Reglas:
 *   - Skip archivos que no tengan el script.
 *   - Preserva BOM UTF-8 si el archivo lo tiene.
 *   - Preserva CRLF vs LF segun el archivo original.
 *   - Quita lineas completas que matcheen el script tag (con o sin espacios
 *     alrededor, con o sin salto de linea final).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = ['.git', 'node_modules'];
const SCRIPT_TAG_PATTERN = /^[ \t]*<script\s+[^>]*src\s*=\s*["']\/assets\/js\/lead-capture-modal\.js["'][^>]*>\s*<\/script>[ \t]*\r?\n?/gim;

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

function processFile(file) {
  const raw = fs.readFileSync(file);
  const { bom, bodyStart } = detectBom(raw);
  const text = raw.slice(bodyStart).toString('utf8');

  if (!/lead-capture-modal\.js/.test(text)) {
    return { skipped: true, reason: 'no lead-capture-modal.js' };
  }

  const before = text.length;
  const modified = text.replace(SCRIPT_TAG_PATTERN, '');
  const after = modified.length;

  if (before === after) {
    return { skipped: true, reason: 'pattern did not match' };
  }

  const body = Buffer.from(modified, 'utf8');
  const out = bom ? Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), body]) : body;

  if (!DRY_RUN) {
    fs.writeFileSync(file, out);
  }

  return { modified: true, removed: before - after };
}

function main() {
  const files = walkHtml(ROOT);
  const stats = { total: files.length, modified: 0, skipped: 0, totalRemoved: 0 };

  for (const file of files) {
    try {
      const result = processFile(file);
      if (result.modified) {
        stats.modified++;
        stats.totalRemoved += result.removed;
        const rel = path.relative(ROOT, file);
        console.log(`  modified (-${result.removed} bytes): ${rel}`);
      } else {
        stats.skipped++;
      }
    } catch (e) {
      console.error(`  ERROR: ${file} -- ${e.message}`);
    }
  }

  console.log('');
  console.log('---');
  console.log(`Total HTMLs escaneados:    ${stats.total}`);
  console.log(`Modificados:               ${stats.modified}`);
  console.log(`Saltados (sin el script):  ${stats.skipped}`);
  console.log(`Bytes eliminados total:    ${stats.totalRemoved}`);
  if (DRY_RUN) console.log('(dry-run: no se escribio nada)');
}

main();