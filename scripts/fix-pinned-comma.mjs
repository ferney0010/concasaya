// Fix: agrega la coma faltante después de `pinned: false` en el primer post,
// donde mi script anterior insertó `author:` sin preservar la coma del campo previo.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, "..", "blog", "static-posts-config.js");
let js = readFileSync(filePath, "utf8");

const before = js.match(/pinned: false\s*\n\s*author:/g);
console.log("Ocurrencias del bug:", before?.length || 0);

const fixed = js.replace(/(pinned: false)\s*\n(\s*author:)/g, "$1,\n$2");

// También verificar que el config JS sea válido: parsear como módulo
const withoutImport = fixed.replace(/^export const staticPosts = /m, "const staticPosts = ");
try {
  // Usar vm o new Function para validar sintaxis JS sin ejecutarlo
  new Function(withoutImport.replace(/^.*?=\s*\[/, "const arr = [").replace(/\]\s*;?\s*$/, "]; return arr;"));
  console.log("✓ Sintaxis JS válida");
} catch (e) {
  console.error("✗ Error de sintaxis:", e.message);
}

writeFileSync(filePath, fixed, "utf8");
console.log("✓ Fix aplicado");
