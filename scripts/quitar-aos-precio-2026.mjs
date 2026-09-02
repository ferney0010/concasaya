// Quita AOS (Animate On Scroll) de blog/precio-casa-prefabricada-colombia-2026.html
// AOS pone opacity:0 en cualquier elemento con data-aos y solo lo muestra
// cuando su JS se carga + AOS.init() corre. En este archivo el JS se carga
// pero la sidebar/indice nuevos quedaban invisibles por AOS.
//
// Remueve:
//   1. <link rel="stylesheet" href="...aos.css" />
//   2. <script src="...aos.js"></script>
//   3. AOS.init({...});
//   4. data-aos="..." en cualquier elemento
//
// Idempotente: si se corre 2 veces, no rompe nada.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = "C:/Workspace/concasaya";
const rel = "blog/precio-casa-prefabricada-colombia-2026.html";
const path = join(repoRoot, rel);
let src = readFileSync(path, "utf8");
const before = src;
const changes = [];

// 1) Link CSS de AOS (puede tener espacios/indentación variable)
const cssRegex = /\s*<link\s+href=["']https:\/\/unpkg\.com\/aos@[^"']*["']\s+rel=["']stylesheet["']\s*\/>\s*\n?/i;
if (cssRegex.test(src)) {
  src = src.replace(cssRegex, "\n");
  changes.push("link CSS de AOS removido");
}

// 2) Script JS de AOS
const jsRegex = /\s*<script\s+src=["']https:\/\/unpkg\.com\/aos@[^"']*["']\s*>\s*<\/script>\s*\n?/i;
if (jsRegex.test(src)) {
  src = src.replace(jsRegex, "\n");
  changes.push("script JS de AOS removido");
}

// 3) Bloque AOS.init() (puede estar inline en un <script> propio)
const initRegex = /\s*AOS\.init\s*\(\s*\{[^}]*\}\s*\)\s*;?\s*\n?/g;
if (initRegex.test(src)) {
  src = src.replace(initRegex, "\n");
  changes.push("AOS.init() removido");
}

// 4) data-aos="..." en cualquier elemento (con espacio o sin él)
//    Variantes: data-aos="fade-up", data-aos = "fade-up", data-aos='fade-up'
const dataAosRegex = /\s*data-aos\s*=\s*["'][^"']*["']/gi;
const matches = src.match(dataAosRegex);
if (matches) {
  src = src.replace(dataAosRegex, "");
  changes.push(`${matches.length} atributos data-aos removidos`);
}

if (src !== before) {
  writeFileSync(path, src, "utf8");
  console.log(`✓ ${rel} limpiado de AOS. Cambios:`);
  for (const c of changes) console.log(`  - ${c}`);
} else {
  console.log(`· ${rel} sin cambios (AOS ya removido o no presente).`);
}
