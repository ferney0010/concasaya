import { readFileSync } from 'fs';
for (const file of ['index.html', 'blog/precio-casa-prefabricada-colombia-2026.html']) {
  const f = readFileSync(file, 'utf8');
  // Buscar el IIFE del mini-cotizador (siempre tiene 'hero-m2' y 'hero-wa-modal')
  const m2Idx = f.indexOf("getElementById('hero-m2')");
  if (m2Idx < 0) { console.log(`[${file}] hero-m2 no encontrado`); continue; }
  // Buscar el inicio del IIFE (anterior más cercano)
  const iifeStart = f.lastIndexOf('(function () {', m2Idx);
  if (iifeStart < 0) { console.log(`[${file}] IIFE start no encontrado`); continue; }
  const iifeEnd = f.indexOf('})();', iifeStart) + 4;
  if (iifeEnd < 0) { console.log(`[${file}] IIFE end no encontrado`); continue; }
  const code = f.substring(iifeStart, iifeEnd);
  try {
    new Function(code);
    console.log(`✓ [${file}]: IIFE del mini-cotizador parsea (${code.length} chars)`);
  } catch (e) {
    console.log(`✗ [${file}]: ${e.message}`);
    process.exit(1);
  }
}
