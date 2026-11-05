// Restaura el hero de materiales.html al original.
//
// El bloque CSS del hero no se puede buscar por una marca fija porque el
// texto de los comentarios fue cambiando con cada ajuste. La via fiable es
// tomar el archivo del commit anterior (donde el hero estaba aprobado) y
// copiar su bloque de escritorio tal cual, replacing el actual.
//
// Lo que NO se toca del original: el cotizador, las infografias, la FAQ y el
// JSON-LD, que son de este mismo dia y el cliente los aprobo.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const RUTA = "materiales.html";
let html = readFileSync(RUTA, "utf8");
const nl = html.includes("\r\n") ? "\r\n" : "\n";

const original = execSync(`git show HEAD~1:${RUTA}`, { encoding: "utf8" });

// --- Bloque de escritorio del ORIGINAL (el aprobado) ----------------------
const oi = original.indexOf("  /* --- Escritorio:");
const oj = original.indexOf("  /* --- Móvil: APROBADO.");
if (oi === -1 || oj === -1) {
  console.error("No se localizo el bloque original.");
  process.exit(1);
}
const bloqueOriginal = original
  .slice(oi, oj)
  .replace(/\r\n/g, "\n")
  .split("\n")
  .join(nl);

// --- Bloque de escritorio ACTUAL (a reemplazar) --------------------------
// Se localiza por la estructura del media query, no por el texto.
const iniActual = html.indexOf("  @media (min-width: 768px) {", html.indexOf(".mat-note {"));
const finActual = html.indexOf("  /* --- Móvil: APROBADO.");
if (iniActual === -1 || finActual === -1 || finActual < iniActual) {
  console.error("No se localizo el bloque actual.");
  process.exit(1);
}
// Se retrocede hasta el comentario que abre el bloque del escritorio.
const inicio = html.lastIndexOf("  /* ---", iniActual);
html = html.slice(0, inicio) + bloqueOriginal + html.slice(finActual);

// --- Fuera el elemento de foto de dos columnas ---------------------------
html = html.replace(
  /\s*<!-- Mitad derecha en escritorio[\s\S]*?-->\s*<div class="hero-mat__photo"[^>]*><\/div>/,
  "\n"
);
html = html.replace(
  /\s*\/\* Foto de escritorio: es la mitad derecha[\s\S]*?\*\/\s*\.hero-mat__photo \{ display: none; \}/,
  ""
);

// --- El enlace del hero vuelve al verde (fondo oscuro) -------------------
html = html.replace(
  /style="color: #0077b6; font-weight: 700; text-decoration: underline;"/g,
  'style="color: #86f08f; font-weight: 700; text-decoration: underline;"'
);

writeFileSync(RUTA, html, "utf8");
console.log("Hero restaurado. Verifica con el resumen de abajo.");
