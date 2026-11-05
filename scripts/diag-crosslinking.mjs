// Compara el numero de hallazgos de check-texto-corrupto antes y despues,
// para confirmar que el texto nuevo (las cajas de cross-links) no introdujo
// problemas nuevos. Usa `git show HEAD:<archivo>` como linea base.
import { execSync } from "node:child_process";
import { writeFileSync, mkdtempSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const BLOG = "blog";
const tmp = mkdtempSync(join(tmpdir(), "crosscheck-"));

const files = readdirSync(BLOG).filter((f) => f.endsWith(".html"));

function conteo(file) {
  try {
    const out = execSync(
      `node scripts/check-texto-corrupto.cjs "${file}" 2>&1`,
      { encoding: "utf8" }
    );
    const m = out.match(/(\d+) problema\(s\) encontrado/);
    return m ? parseInt(m[1]) : 0;
  } catch {
    return 0;
  }
}

let nuevos = 0;
let mismos = 0;
const detalles = [];

for (const f of files) {
  const ruta = join(BLOG, f);
  let base = null;
  try {
    base = execSync(`git show HEAD:"${BLOG}/${f}"`, { encoding: "utf8" });
  } catch {
    continue; // archivo nuevo
  }
  const baseFile = join(tmp, f);
  writeFileSync(baseFile, base, "utf8");

  const antes = conteo(baseFile);
  const despues = conteo(ruta);
  const delta = despues - antes;
  if (delta > 0) {
    nuevos++;
    detalles.push(`  ${f}: ${antes} -> ${despues} (+${delta})`);
  } else if (delta === 0) {
    mismos++;
  }
}

console.log(`Articulos con el mismo numero de hallazgos: ${mismos}`);
console.log(`Articulos con hallazgos nuevos: ${nuevos}`);
if (detalles.length) {
  console.log("\nDetalle de los que cambiaron:");
  for (const d of detalles) console.log(d);
}
