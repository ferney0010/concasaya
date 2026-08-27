// Quita el AOS del artículo de casas económicas.
// Causa: AOS CSS pone opacity:0 sin JS que lo anime, dejando el contenido invisible.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, "..", "blog", "casas-prefabricadas-economicas-colombia.html");
let html = readFileSync(filePath, "utf8");

const before = {
  dataAos: (html.match(/data-aos=/g) || []).length,
  aosCss: (html.match(/unpkg\.com\/aos/g) || []).length,
};

html = html
  .replace(/\s*<link href="https:\/\/unpkg\.com\/aos[^"]*" rel="stylesheet" \/>/g, "")
  .replace(/\s*data-aos="[^"]*"/g, "");

const after = {
  dataAos: (html.match(/data-aos=/g) || []).length,
  aosCss: (html.match(/unpkg\.com\/aos/g) || []).length,
};

writeFileSync(filePath, html, "utf8");
console.log("AOS removido:");
console.log(`  data-aos: ${before.dataAos} → ${after.dataAos}`);
console.log(`  unpkg.com/aos: ${before.aosCss} → ${after.aosCss}`);
