// Restaura las imágenes reales de los 23 posts (las del git HEAD~1).
// Solo el post del nuevo artículo (casas-prefabricadas-economicas-colombia)
// mantiene el OG image.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, "..", "blog", "static-posts-config.js");
const imagesDir = join(__dirname, "..", "assets", "images");

// Obtener el config ORIGINAL del git (antes de mi cambio)
const originalConfig = execSync(
  `git show 119e66e:blog/static-posts-config.js`,
  { cwd: join(__dirname, ".."), encoding: "utf8" }
);

// Parsear el config original con vm para extraer images
const vm = await import("node:vm");
const t = originalConfig
  .replace(/^\s*export\s+const\s+staticPosts\s*=\s*/m, "return ")
  .replace(/^\s*export\s+function\s+/gm, "function ");
const originalPosts = (() => {
  const s = new vm.Script("(function() { " + t + " })()");
  return s.runInThisContext();
})();

// Parsear el config actual
let currentConfig = readFileSync(configPath, "utf8");
const t2 = currentConfig
  .replace(/^\s*export\s+const\s+staticPosts\s*=\s*/m, "return ")
  .replace(/^\s*export\s+function\s+/gm, "function ");
const currentPosts = (() => {
  const s = new vm.Script("(function() { " + t2 + " })()");
  return s.runInThisContext();
})();

// Por cada post en el config actual, restaurar la image del original
// EXCEPTO el post del nuevo artículo (casas-prefabricadas-economicas-colombia)
// que mantiene el OG image que generamos
const NEW_POST_SLUG = "casas-prefabricadas-economicas-colombia";

let restored = 0;
let kept = 0;
for (const current of currentPosts) {
  const original = originalPosts.find(p => p.slug === current.slug);
  if (!original) continue;

  if (current.slug === NEW_POST_SLUG) {
    // Mantener el OG image nuevo (sin texto) que ya está en el config
    kept++;
  } else {
    // Restaurar la image original
    const oldImg = current.image;
    const newImg = original.image;
    if (oldImg !== newImg) {
      currentConfig = currentConfig.replace(oldImg, newImg);
      restored++;
    }
  }
}

writeFileSync(configPath, currentConfig, "utf8");
console.log(`✓ Config restaurado:`);
console.log(`  ${restored} posts restaurados a su imagen original`);
console.log(`  ${kept} post mantiene su OG image`);

// Borrar los OG images huérfanos (los 23 que generé por error)
const orphanedFiles = execSync(
  `ls assets/images/blog-og-*.webp 2>/dev/null || true`,
  { cwd: join(__dirname, ".."), encoding: "utf8" }
).trim().split("\n").filter(Boolean);

console.log(`\nArchivos huérfanos a borrar: ${orphanedFiles.length}`);
for (const f of orphanedFiles) {
  try {
    execSync(`git rm -f "${f}"`, { cwd: join(__dirname, ".."), encoding: "utf8" });
  } catch (e) {
    // No está en git, borrar directamente
    try {
      execSync(`del /f "${f}"`, { cwd: join(__dirname, ".."), shell: "cmd.exe", encoding: "utf8" });
    } catch (e2) {}
  }
}
console.log("✓ OG images huérfanos borrados");
