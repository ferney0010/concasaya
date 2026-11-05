// Valida que el HTML de las paginas modificadas sigue bien balanceado.
//
// OJO: el repo esta formateado con saltos de linea DENTRO del tag y cierres
// como `</a          >`, asi que hay que contar `</a\s*>` y no `</a>`.
//
// Compara contra git HEAD: si el balance cambio, el archivo se rompio.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const files = execSync("git diff --name-only", { encoding: "utf8" })
  .split("\n")
  .filter((f) => f.trim().endsWith(".html"));

function conteos(html) {
  const sinTags = html.replace(/<[^>]*>/g, "");
  return {
    a: (html.match(/<a\b/g) || []).length,
    aCierre: (html.match(/<\/a\s*>/g) || []).length,
    div: (html.match(/<div\b/g) || []).length,
    divCierre: (html.match(/<\/div\s*>/g) || []).length,
  };
}

let rotos = 0;
let iguales = 0;
for (const f of files) {
  const nuevo = conteos(readFileSync(f, "utf8"));
  let viejo = null;
  try {
    viejo = conteos(execSync(`git show HEAD:"${f}"`, { encoding: "utf8" }));
  } catch {
    // Archivo nuevo: solo se comprueba que este balanceado.
  }

  if (viejo) {
    const deltaA = nuevo.a - viejo.a;
    const deltaACierre = nuevo.aCierre - viejo.aCierre;
    const deltaDiv = nuevo.div - viejo.div;
    const deltaDivCierre = nuevo.divCierre - viejo.divCierre;
    const ok =
      deltaA === deltaACierre && deltaDiv === deltaDivCierre &&
      (nuevo.a === nuevo.aCierre || viejo.a !== viejo.aCierre);
    if (!ok) {
      console.log(`  ROTO ${f}: d<a>=${deltaA} d</a>=${deltaACierre} d<div>=${deltaDiv} d</div>=${deltaDivCierre}`);
      rotos++;
    } else {
      iguales++;
    }
  } else {
    if (nuevo.a !== nuevo.aCierre) {
      console.log(`  ROTO (nuevo) ${f}: <a>=${nuevo.a} </a>=${nuevo.aCierre}`);
      rotos++;
    } else {
      iguales++;
    }
  }
}

console.log(`\nPaginas html modificadas: ${files.length}`);
console.log(`Sin alteracion estructural: ${iguales}`);
console.log(`Rotos: ${rotos}`);
if (rotos) process.exit(1);
