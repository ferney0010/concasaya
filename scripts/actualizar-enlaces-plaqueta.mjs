// ===========================================================================
// Actualiza las referencias a /materiales#cotizador.
//
// El cotizador se fusiono dentro de /materiales (seccion #cotizador), asi que
// todas las URLs internas pasan a apuntar ahi:
//   /materiales#cotizador            -> /materiales#cotizador
//   /materiales#cotizador  -> /materiales#cotizador
//
// Es idempotente: si no encuentra nada, no escribe.
//
// Uso:
//   node scripts/actualizar-enlaces-plaqueta.mjs           (dry-run)
//   node scripts/actualizar-enlaces-plaqueta.mjs --apply   (escribe)
// ===========================================================================
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const APPLY = process.argv.includes("--apply");

const VIEJO = "/materiales#cotizador";
const NUEVO = "/materiales#cotizador";

// Carpetas y archivos que no se tocan.
const EXCLUIDOS = new Set([
  "node_modules",
  ".git",
  "tmp-test",
  ".deploy-staging",
  ".tmp-capturas",
]);

// El propio archivo puente conserva su URL: no se reescribe.
const NO_REESCRIBIR = new Set([
  "plaqueta-de-concreto.html",
  // La CSS y el JS de la pagina vieja se eliminan: el cotizador ahora usa
  // assets/css/materiales-plaqueta.css y sigue con assets/js/plaqueta-cotizador.js.
  "assets/css/materiales#cotizador.css",
]);

// Extensiones que pueden contener enlaces.
const EXT = new Set([".html", ".js", ".mjs", ".xml", ".css", ".txt"]);

function archivos(dir) {
  const acc = [];
  for (const name of readdirSync(dir)) {
    if (EXCLUIDOS.has(name)) continue;
    if (name.startsWith(".tmp-") || name.startsWith("tmp-")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) acc.push(...archivos(full));
    else {
      const ext = name.slice(name.lastIndexOf("."));
      if (EXT.has(ext)) acc.push(full);
    }
  }
  return acc;
}

let modificados = 0;
const detalle = [];

for (const file of archivos(ROOT)) {
  const rel = relative(ROOT, file).split(sep).join("/");
  if (NO_REESCRIBIR.has(rel)) continue;

  let html = readFileSync(file, "utf8");
  if (!html.includes(VIEJO)) continue;

  // Se cuentan las apariciones reales de la URL (no el nombre de un archivo).
  const n = (html.match(/\/materiales#cotizador(?![\w-])/g) || []).length;
  if (!n) continue;

  const nuevo = html.replace(
    /\/materiales#cotizador(#[a-z-]+)?(?![\w-])/g,
    NUEVO
  );

  if (nuevo !== html) {
    if (APPLY) writeFileSync(file, nuevo, "utf8");
    modificados++;
    detalle.push(`  ${rel} (${n})`);
  }
}

console.log(`Dry-run: ${APPLY ? "ESCRITURA ACTIVADA" : "no se escribio nada"}`);
console.log(`Archivos actualizados: ${modificados}`);
if (detalle.length) {
  console.log("\nDetalle:");
  for (const d of detalle) console.log(d);
}
