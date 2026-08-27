// Inserta el botón flotante de WhatsApp (CSS + JS) en los 3 artículos nuevos
// que no lo tienen. Patrón: CSS antes de </head>, JS antes de <!-- Clarity Analytics -->.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = "C:/Workspace/concasaya";
const files = [
  "blog/casas-prefabricadas-economicas-colombia.html",
  "blog/multa-construir-sin-licencia-colombia.html",
  "blog/casa-prefabricada-para-finca-colombia.html"
];

const cssLink = `    <link rel="stylesheet" href="/assets/css/whatsapp-modal.css" />\n`;
const jsBlock = `    <!-- WhatsApp Modal (botón flotante) -->\n    <script src="/assets/js/whatsapp-modal.js"></script>\n\n`;

let totalChanged = 0;
for (const rel of files) {
  const path = join(repoRoot, rel);
  let src = readFileSync(path, "utf8");
  const before = src;

  // 1) CSS: insertar antes de </head> (si no está)
  if (!src.includes('href="/assets/css/whatsapp-modal.css"')) {
    const headClose = src.lastIndexOf("</head>");
    if (headClose === -1) {
      console.error(`✗ ${rel}: no se encontró </head>`);
      continue;
    }
    src = src.slice(0, headClose) + cssLink + src.slice(headClose);
  }

  // 2) JS: insertar antes del bloque de Clarity (si no está)
  if (!src.includes('src="/assets/js/whatsapp-modal.js"')) {
    const clarityIdx = src.indexOf("<!-- Clarity Analytics -->");
    if (clarityIdx === -1) {
      console.error(`✗ ${rel}: no se encontró el comentario de Clarity`);
      continue;
    }
    src = src.slice(0, clarityIdx) + jsBlock + src.slice(clarityIdx);
  }

  if (src !== before) {
    writeFileSync(path, src, "utf8");
    totalChanged++;
    console.log(`✓ ${rel}: WhatsApp modal agregado`);
  } else {
    console.log(`· ${rel}: ya tenía el modal, sin cambios`);
  }
}

console.log(`\n${totalChanged}/${files.length} archivos modificados.`);
