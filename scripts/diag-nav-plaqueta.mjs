// Diagnostico: en que zona (escritorio / tablet) se encuentra el anchor de
// "Materiales" en cada pagina con nav. Solo informa: no escribe nada.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function htmlFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (["node_modules", ".git", "tmp-test", ".deploy-staging"].includes(name)) continue;
    if (name.startsWith(".tmp-") || name.startsWith("tmp-")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) htmlFiles(full, acc);
    else if (name.endsWith(".html")) acc.push(full);
  }
  return acc;
}

const ANCHOR = /<a\b[^>]*href="\/materiales"[^>]*>[\s\S]*?<\/a\s*>/;

const resumen = {};
const detalle = [];

for (const file of htmlFiles(ROOT)) {
  const rel = relative(ROOT, file).split(sep).join("/");
  if (rel === "plaqueta-de-concreto.html") continue;
  const c = readFileSync(file, "utf8");
  if (!c.includes("nav-desktop-primary")) continue;
  if (c.includes('href="/materiales#cotizador"')) {
    resumen["ya tiene"] = (resumen["ya tiene"] || 0) + 1;
    continue;
  }

  const i = c.indexOf("nav-desktop-primary");
  const fins = [
    c.indexOf('id="menu-btn"', i),
    c.indexOf('<div class="lg:hidden">', i),
    c.indexOf('id="tablet-menu"', i),
  ].filter((x) => x !== -1);
  const hasta = fins.length ? Math.min(...fins) : c.indexOf("</header>", i);
  const desk = ANCHOR.test(c.slice(i, hasta));

  const ti = c.indexOf('id="tablet-menu"');
  let tab = false;
  if (ti !== -1) {
    const th = c.indexOf("</header>", ti);
    tab = ANCHOR.test(c.slice(ti, th === -1 ? undefined : th));
  }

  const n = (desk ? 1 : 0) + (tab ? 1 : 0);
  const clave = `+${n}`;
  resumen[clave] = (resumen[clave] || 0) + 1;
  if (n !== 2) detalle.push(`  ${rel}  desk=${desk} tab=${tab}`);
}

console.log("Resumen:", JSON.stringify(resumen));
console.log("\nPaginas que NO reciben los 2 enlaces (tablet):");
for (const d of detalle) console.log(d);
