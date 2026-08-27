// Agrega el campo `author: "Equipo CONCASAYA"` y `readTime: "8 min"` a cada
// post del static-posts-config.js que no lo tenga.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, "..", "blog", "static-posts-config.js");
let js = readFileSync(filePath, "utf8");

const before = {
  hasAuthor: (js.match(/author:/g) || []).length,
  hasReadTime: (js.match(/readTime:/g) || []).length,
};

// En cada objeto del array, agregar `author: "Equipo CONCASAYA"` y `readTime: "8 min de lectura"`
// justo antes del cierre `}` de cada objeto, si no los tiene.
const updated = js.replace(
  /\{(\s*slug:[^}]+?)\}/g,
  (match, body) => {
    // Si ya tiene author, no hacer nada
    if (/author:/.test(body)) return match;
    return `{\n${body}    author: "Equipo CONCASAYA",\n    readTime: "8 min de lectura",\n    authorInitials: "EC",\n  }`;
  }
);

const after = {
  hasAuthor: (updated.match(/author:/g) || []).length,
  hasReadTime: (updated.match(/readTime:/g) || []).length,
};

writeFileSync(filePath, updated, "utf8");
console.log(`Campos agregados:`);
console.log(`  author:  ${before.hasAuthor} → ${after.hasAuthor}`);
console.log(`  readTime: ${before.hasReadTime} → ${after.hasReadTime}`);
