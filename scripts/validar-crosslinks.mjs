// Verifica que todos los enlaces de las cajas de cross-links apunten a
// articulos que existen en disco.
//
// OJO con PowerShell: `${f}.Name` dentro de una cadena concatena el
// nombre del objeto, no su propiedad Name. Por eso el path quedaba mal y
// TODO salia como roto. Aqui se hace con Node para evitar esa trampa.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const BLOG = "blog";

let revisados = 0;
const rotos = [];
const placas = [];

for (const name of readdirSync(BLOG).filter((f) => f.endsWith(".html"))) {
  const html = readFileSync(join(BLOG, name), "utf8");
  const cajas = html.match(
    /<div class="crosslink-box" data-crosslinks="1">[\s\S]*?<\/div>/g
  );
  if (!cajas) continue;

  for (const caja of cajas) {
    for (const m of caja.matchAll(/href="([^"]+)"/g)) {
      const href = m[1];
      if (href === "/plaqueta-de-concreto") {
        placas.push(`${name} -> ${href}`);
        continue;
      }
      if (!href.startsWith("/blog/")) continue;
      revisados++;
      const destino = join(BLOG, href.replace("/blog/", "") + ".html");
      if (!existsSync(destino)) rotos.push(`${name} -> ${href}`);
    }
  }
}

console.log(`Enlaces /blog/ revisados: ${revisados}`);
console.log(`Enlaces a /plaqueta-de-concreto: ${placas.length}`);
console.log(`Rotos: ${rotos.length}`);
for (const r of rotos) console.log("  ROTO " + r);

// Cada articulo con caja debe enlazar al menos 2 articulos del blog.
console.log("\nCobertura por articulo:");
const files = readdirSync(BLOG).filter((f) => f.endsWith(".html"));
for (const name of files) {
  const html = readFileSync(join(BLOG, name), "utf8");
  const caja = html.match(
    /<div class="crosslink-box" data-crosslinks="1">[\s\S]*?<\/div>/
  );
  if (!caja) continue;
  const n = [...caja[0].matchAll(/href="\/blog\//g)].length;
  const pq = caja[0].includes('/plaqueta-de-concreto') ? " +pq" : "";
  if (n < 2) console.log(`  ${name}: solo ${n} enlaces de articulo${pq}`);
}
console.log("  (sin avisos arriba = todos con 3 o mas)");
