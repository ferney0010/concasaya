// Validador de texto corrupto para los blogs de CONCASAYA.
// Detecta: CJK, tokens con caracteres fuera del set español permitido,
// y palabras latinas mezcladas con no-latinas.
const fs = require('fs');

const files = process.argv.slice(2);
const ALLOWED = /^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ0-9\s.,;:!?()\[\]"'`$%&#@\/+=*_|<>~^\\{}\[\]-]*$/;

let issues = 0;
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  const lines = text.split('\n');
  const found = [];

  lines.forEach((line, i) => {
    // 1. CJK / hiragana / hangul
    const cjk = line.match(/[\u3000-\u9FFF\uAC00-\uD7AF]+/g);
    if (cjk) found.push({ line: i + 1, type: 'CJK', text: cjk.join(',') });

    // 2. Tokens con caracteres no permitidos
    const raw = line.replace(/<[^>]*>/g, ' '); // fuera etiquetas HTML
    raw.replace(/&#?[a-z0-9]+;/gi, ' ');       // entidades
    const tokens = raw.match(/[\p{L}\p{N}]+/gu) || [];
    for (const tok of tokens) {
      if (!ALLOWED.test(tok)) {
        found.push({ line: i + 1, type: 'CHAR', text: tok });
      }
    }
  });

  if (found.length) {
    issues += found.length;
    console.log(`\n=== ${f} ===`);
    const seen = new Set();
    for (const it of found) {
      const key = `${it.line}:${it.text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const src = lines[it.line - 1].trim();
      console.log(`  L${it.line} [${it.type}] "${it.text}"`);
      console.log(`      ${src.slice(0, 150)}`);
    }
  }
}
console.log(issues ? `\n${issues} problema(s) encontrado(s).` : '\nOK - sin corrupcion.');
