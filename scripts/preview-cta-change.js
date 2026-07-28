// preview-cta-change.js (v2)
// Muestra antes/despues de cada bloque reemplazado.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const target = process.argv[2] || 'sopo';
const src = path.resolve(__dirname, '..', 'pages', `${target}.html`);
if (!fs.existsSync(src)) {
  console.error(`No existe: ${src}`);
  process.exit(1);
}

const before = fs.readFileSync(src, 'utf8');

// --- Preparamos dir temporal con el archivo ---
const tmpDir = path.resolve(__dirname, '..', '__preview_dir');
if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
fs.mkdirSync(tmpDir);
fs.copyFileSync(src, path.join(tmpDir, `${target}.html`));

// --- Parcheamos el script principal para usar ese dir y NO escribir ---
const scriptPath = path.resolve(__dirname, 'update-cta-buttons.js');
const original = fs.readFileSync(scriptPath, 'utf8');
// Solo cambiamos el dir. El script SI escribe, pero sobre el archivo en __preview_dir.
let patched = original
  .replace("const PAGES_DIR = path.join(ROOT, 'pages');", "const PAGES_DIR = path.join(ROOT, '__preview_dir');");
const tmpScript = path.resolve(__dirname, '__tmp_script.js');
fs.writeFileSync(tmpScript, patched);

let scriptLog = '';
try {
  scriptLog = execSync(`node "${tmpScript}"`, { encoding: 'utf8', stdio: 'pipe' });
} catch (e) {
  console.error('Error ejecutando script:', e.message);
  console.error(e.stdout);
  console.error(e.stderr);
  process.exit(1);
} finally {
  if (fs.existsSync(tmpScript)) fs.unlinkSync(tmpScript);
}

const after = fs.readFileSync(path.join(tmpDir, `${target}.html`), 'utf8');

// --- Mostramos los cambios (diff simple) ---
function findAnchorBlocks(html, label) {
  // Captura un bloque <a ...>...</a> multilinea de un label especifico.
  const re = new RegExp(
    '(^[ \\t]*<a[\\s\\S]*?' + label.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '[\\s\\S]*?</a[ \\t]*\\n[ \\t]*>)',
    'm'
  );
  const m = re.exec(html);
  return m ? m[1] : null;
}

function findDivBlocks(html) {
  // Captura un <div class="flex flex-col sm:flex-row ..."> ... </div>
  const re = /(^[ \t]*<div class="flex flex-col sm:flex-row[^"]*"[\s\S]*?\n[ \t]*<\/div>)/gm;
  const matches = [];
  let m;
  while ((m = re.exec(html)) !== null) matches.push(m[1]);
  return matches;
}

const beforeButtons = [
  findAnchorBlocks(before, 'Cotizar Proyecto'),
  findAnchorBlocks(before, 'Agendar Visita Técnica'),
].filter(Boolean);
const afterDivs = findDivBlocks(after);
const afterWhatsapp = findAnchorBlocks(after, 'WhatsApp') || [];

console.log('\n=========================================');
console.log(`  ${target}.html`);
console.log('=========================================\n');

console.log('--- ANTES ---');
for (const b of beforeButtons) {
  console.log(b);
  console.log();
}

console.log('--- DESPUES (bloques nuevos) ---');
for (const d of afterDivs) {
  console.log(d);
  console.log();
}
for (const a of afterWhatsapp) {
  // Mostrar solo los anchors WhatsApp standalone (los que NO estan dentro de un div flex).
  console.log(a);
  console.log();
}

// Cleanup
fs.rmSync(tmpDir, { recursive: true, force: true });
