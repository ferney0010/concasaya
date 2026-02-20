/**
 * Replace static "Zonas de Cobertura" ul with nav-municipios-footer placeholder in pages/*.html
 */
const fs = require("fs");
const path = require("path");

const re = /<h4 class="font-semibold mb-4">Zonas de Cobertura<\/h4>\s*<ul class="space-y-2 text-gray-400">[\s\S]*?<\/ul>/;
const replacement = '<h4 class="font-semibold mb-4">Zonas de Cobertura</h4>\n            <ul id="nav-municipios-footer" class="space-y-2 text-gray-400"></ul>';

const pagesDir = path.join(__dirname, "..", "pages");
const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith(".html"));
let done = 0;
for (const f of files) {
  const filePath = path.join(pagesDir, f);
  let content = fs.readFileSync(filePath, "utf8");
  if (!content.includes("nav-municipios-footer") && re.test(content)) {
    content = content.replace(re, replacement);
    fs.writeFileSync(filePath, content, "utf8");
    done++;
    console.log("Updated:", f);
  }
}
console.log("Done. Updated", done, "files.");
