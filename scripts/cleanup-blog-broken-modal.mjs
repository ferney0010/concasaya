// Limpia el CSS y HTML roto del blog:
// - Quita bloque CSS de .hero-cta-lote-* y .hero-wa-modal*
// - Quita el HTML del modal duplicado (<div id="hero-wa-modal">)
import { readFileSync, writeFileSync } from 'fs';

const path = 'blog/precio-casa-prefabricada-colombia-2026.html';
let content = readFileSync(path, 'utf8');
const before = content.length;
const beforeLines = content.split('\n').length;

const checks = {
  before: {
    'hero-cta-lote': (content.match(/hero-cta-lote/g) || []).length,
    'hero-wa-modal': (content.match(/hero-wa-modal/g) || []).length,
    'id="hero-wa-modal"': (content.match(/id="hero-wa-modal"/g) || []).length,
    'hero-cta-form': (content.match(/hero-cta-form/g) || []).length,
    'hero-cta-field': (content.match(/hero-cta-field/g) || []).length,
    'hero-cta-input': (content.match(/hero-cta-input/g) || []).length,
    'hero-cta-estimate': (content.match(/hero-cta-estimate/g) || []).length,
    'buildMsgMini': (content.match(/buildMsgMini/g) || []).length,
    'waBtn.href': (content.match(/waBtn\.href/g) || []).length,
  }
};

// 1) Quitar CSS .hero-cta-lote-* (de /* === Mini-cotizador: filtro === hasta .hero-cta-lote-btn i)
const loteRegex = /\s*\/\*\s*===\s*Mini-cotizador:\s*filtro[^]*?\.hero-cta-lote-btn\s+i\s*\{[^}]*\}\s*/g;
content = content.replace(loteRegex, '\n');

// 2) Quitar CSS .hero-wa-modal* (de /* === Modal estilo WhatsApp hasta el @media (max-width: 420px) final)
const modalCssRegex = /\s*\/\*\s*===\s*Modal estilo WhatsApp[^]*?@media\s*\(max-width:\s*420px\)\s*\{[^}]*\{[^}]*\}\s*\{[^}]*\}\s*\{[^}]*\}\s*\{[^}]*\}\s*\{[^}]*\}\s*\{[^}]*\}\s*\{[^}]*\}\s*\{[^}]*\}\s*\{[^}]*\}\s*\}/g;
const modalCssRegexSimple = /\s*\/\*\s*===\s*Modal estilo WhatsApp[^]*?\}\s*\n\s*\n\s*<!-- Modal: opciones/;
const beforeModal = content;
content = content.replace(modalCssRegexSimple, '\n    <!-- Modal: opciones');
if (content === beforeModal) {
  console.log('WARN: Modal CSS regex did not match');
}

// 3) Quitar HTML del modal duplicado
const modalHtmlRegex = /\s*<!--\s*Modal:\s*opciones de WhatsApp[^]*?<\/div>\s*\n\s*<\/div>/;
const beforeHtml = content;
content = content.replace(modalHtmlRegex, '');
if (content === beforeHtml) {
  console.log('WARN: Modal HTML regex did not match');
}

// 4) Limpiar líneas vacías múltiples
content = content.replace(/\n\s*\n\s*\n+/g, '\n\n');

// 5) Quitar referencias residuales al form/estimate/IIFE (debería estar ya, pero por si acaso)
const patterns = [
  /\.hero-cta-form\s*\{[^}]*\}\s*/g,
  /\.hero-cta-field[^}]*\{[^}]*\}\s*/g,
  /\.hero-cta-input[^}]*\{[^}]*\}\s*/g,
  /\.hero-cta-estimate[^}]*\{[^}]*\}\s*/g,
];
for (const p of patterns) {
  content = content.replace(p, '');
}

const after = content.length;
const afterLines = content.split('\n').length;

const checksAfter = {
  after: {
    'hero-cta-lote': (content.match(/hero-cta-lote/g) || []).length,
    'hero-wa-modal': (content.match(/hero-wa-modal/g) || []).length,
    'id="hero-wa-modal"': (content.match(/id="hero-wa-modal"/g) || []).length,
    'hero-cta-form': (content.match(/hero-cta-form/g) || []).length,
    'hero-cta-field': (content.match(/hero-cta-field/g) || []).length,
    'hero-cta-input': (content.match(/hero-cta-input/g) || []).length,
    'hero-cta-estimate': (content.match(/hero-cta-estimate/g) || []).length,
    'buildMsgMini': (content.match(/buildMsgMini/g) || []).length,
    'waBtn.href': (content.match(/waBtn\.href/g) || []).length,
  }
};

console.log('BEFORE checks:');
console.log(JSON.stringify(checks.before, null, 2));
console.log('\nAFTER checks:');
console.log(JSON.stringify(checksAfter.after, null, 2));
console.log(`\nBytes: ${before} -> ${after} (delta ${after - before})`);
console.log(`Lines: ${beforeLines} -> ${afterLines} (delta ${afterLines - beforeLines})`);

writeFileSync(path, content, 'utf8');
console.log('\nOK: written');
