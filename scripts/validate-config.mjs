// Verifica que el config JS se puede importar como módulo ES sin errores.
// Usa import() dinámico (mismo mecanismo que el browser) para detectar
// cualquier problema de sintaxis o declaración duplicada.
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, "..", "blog", "static-posts-config.js");
const fileUrl = pathToFileURL(filePath).href;

try {
  const mod = await import(fileUrl);
  const posts = mod.staticPosts;
  if (!Array.isArray(posts)) {
    console.error("✗ staticPosts no es un array");
    process.exit(1);
  }
  const flipFn = mod.applyThumbnailFlipEffective;
  if (typeof flipFn !== "function") {
    console.error("✗ applyThumbnailFlipEffective no está exportada como función");
    process.exit(1);
  }
  // Detectar duplicados de slug y de URL (defensa adicional)
  const slugs = new Set();
  const urls = new Set();
  let dupes = 0;
  for (const p of posts) {
    if (slugs.has(p.slug)) {
      console.error(`✗ slug duplicado: ${p.slug}`);
      dupes++;
    }
    slugs.add(p.slug);
    if (urls.has(p.url)) {
      console.error(`✗ url duplicada: ${p.url}`);
      dupes++;
    }
    urls.add(p.url);
  }
  if (dupes > 0) process.exit(1);

  const target = posts.find(p => p.url && p.url.includes("economicas"));
  console.log(`✓ Sintaxis válida. ${posts.length} posts, todas las funciones exportadas.`);
  console.log(`  Sin duplicados.`);
  if (target) {
    console.log(`  Nuevo post: ${target.title}`);
    console.log(`    image: ${target.image}`);
    console.log(`    author: ${target.author}`);
    console.log(`    readTime: ${target.readTime}`);
  }
} catch (e) {
  console.error("✗ Error al importar el módulo:", e.message);
  process.exit(1);
}
