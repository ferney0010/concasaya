import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function splice(htmlRel, snippetRel) {
  const htmlPath = path.join(ROOT, htmlRel);
  let html = fs.readFileSync(htmlPath, "utf8");
  const inner = fs.readFileSync(path.join(ROOT, snippetRel), "utf8").trimEnd();
  const re = /<main class="pt-20">[\s\S]*?<\/main>/;
  if (!re.test(html)) throw new Error(`No <main> match: ${htmlRel}`);
  html = html.replace(re, `<main class="pt-20">\n${inner}\n    </main>`);
  fs.writeFileSync(htmlPath, html);
}

splice(
  "blog/construccion-prefabricada-cundinamarca-guia-concasaya.html",
  "blog/snippets/construccion-cundinamarca-inner.html"
);
splice(
  "blog/guia-casas-prefabricadas-colombia-concasaya.html",
  "blog/snippets/guia-casas-prefabricadas-colombia-inner.html"
);
console.log("splice-blog-main OK");
