// Fix simple: agrega coma antes de cada `author:` (y otros campos nuevos)
// que haya quedado sin separador.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, "..", "blog", "static-posts-config.js");
let code = readFileSync(filePath, "utf8");

function validate(src) {
  // Envolver en una función que retorne el array
  const t = src
    .replace(/^\s*export\s+const\s+staticPosts\s*=\s*/m, "return ")
    .replace(/^\s*export\s+/gm, "");
  try {
    const script = new vm.Script("(function() { " + t + " })()");
    const result = script.runInThisContext();
    return Array.isArray(result) ? result : { error: "No es un array" };
  } catch (e) {
    return { error: e.message };
  }
}

// Aplicar fix: agregar coma antes de `author:` cuando el char anterior no sea , ni { ni salto de línea con coma
// El patrón es: cualquier char que NO sea `,` o `{` seguido opcionalmente de whitespace y luego `author:`
code = code.replace(/([^{,])\s*\n(\s+author:)/g, "$1,\n$2");

// Repetir por si quedan más
let posts = validate(code);
if (posts.error) {
  console.error("✗ Error persistente:", posts.error);
  process.exit(1);
}

writeFileSync(filePath, code, "utf8");
console.log(`✓ Fix aplicado. ${posts.length} posts válidos.`);
if (posts[0]) {
  console.log(`Primer post: slug="${posts[0].slug}", author="${posts[0].author}", readTime="${posts[0].readTime}"`);
  console.log(`Último post: slug="${posts[posts.length-1].slug}", author="${posts[posts.length-1].author}"`);
}
