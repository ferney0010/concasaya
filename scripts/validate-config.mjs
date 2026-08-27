// Verifica que el config JS se puede importar sin errores
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, "..", "blog", "static-posts-config.js");
let code = readFileSync(filePath, "utf8");

// Quitar el `export` para validar como script normal
code = code.replace(/^export\s+const\s+/m, "const ");

try {
  const script = new vm.Script(code, { filename: "static-posts-config.js" });
  const context = { module: { exports: {} }, exports: {} };
  const wrapper = vm.createContext(context);
  script.runInContext(wrapper);
  const posts = context.module.exports.staticPosts || context.exports.staticPosts;
  console.log(`✓ Sintaxis válida. Posts exportados: ${posts.length}`);
  if (posts[0]) {
    console.log(`Primer post: ${posts[0].slug}`);
    console.log(`  author: ${posts[0].author || "(no)"}`);
    console.log(`  readTime: ${posts[0].readTime || "(no)"}`);
    console.log(`  pinned: ${posts[0].pinned}`);
  }
} catch (e) {
  console.error("✗ Error de sintaxis:", e.message);
  const m = e.stack.match(/static-posts-config\.js:(\d+)/);
  if (m) {
    const lineNum = parseInt(m[1]);
    const lines = code.split("\n");
    for (let i = Math.max(0, lineNum - 3); i < Math.min(lines.length, lineNum + 2); i++) {
      console.error(`  ${i + 1}: ${lines[i]}`);
    }
  }
}
