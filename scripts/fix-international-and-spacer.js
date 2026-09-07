/**
 * - Añade espaciador antes de la barra fija en todas las páginas
 * - Corrige footer internacional (copyright + Codify)
 * - Limpia estilos duplicados de nav que chocan con nav-shared.css
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const pagesDir = path.join(root, "pages");

const INTERNATIONAL = [
  "colombianos-estados-unidos.html",
  "colombianos-mexico.html",
  "colombianos-canada.html",
  "colombianos-espana.html",
  "colombianos-en-el-exterior.html",
  "casas-prefabricadas-colombia.html",
];

const FOOTER_CREDITS = `        <div class="border-t border-gray-700 pt-6 mt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
          <div>
            <p class="text-sm text-gray-400 mb-2">
              &copy; 2026 <span class="font-semibold text-white">CONCASAYA</span>. Todos los derechos reservados.
            </p>
            <p class="text-xs text-gray-500">
              Sitio web diseñado para la construcción de casas prefabricadas en Colombia.
            </p>
          </div>
          <div class="flex flex-col items-center gap-2">
            <p class="text-xs text-gray-500">Desarrollado por</p>
            <a
              href="https://www.codifytech.click/"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center space-x-2 text-cyan-400"
            >
              <span class="font-semibold text-sm">Codify Tech</span>
              <i class="fas fa-external-link-alt text-xs text-cyan-400"></i>
            </a>
          </div>
        </div>`;

const FOOTER_OLD_RE =
  /<div class="border-t border-gray-700 pt-6 text-center text-gray-500 text-sm">\s*<p>&copy; 2026 CONCASAYA\. Todos los derechos reservados\.<\/p>\s*<\/div>/;

const SPACER =
  '    <div id="social-bottom-bar-spacer" aria-hidden="true"></div>\n';

const BAR_COMMENT =
  "<!-- Barra inferior con WhatsApp y redes sociales -->";

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function fixInternationalStyles(content) {
  let changed = false;

  if (content.includes("}      .cta-attention")) {
    content = content.replace(
      /\}\s+\.cta-attention \{/g,
      "}\n      .cta-attention {"
    );
    changed = true;
  }

  const dupTabletRe =
    /\s*#tablet-menu \{[\s\S]*?#tablet-menu\.open \{[\s\S]*?\}\s*\.tablet-submenu \{[\s\S]*?\.tablet-submenu\.open \{[\s\S]*?\}\s*/;

  if (dupTabletRe.test(content)) {
    content = content.replace(dupTabletRe, "\n");
    changed = true;
  }

  return { content, changed };
}

let spacerUpdated = 0;
let footerUpdated = 0;
let styleUpdated = 0;

for (const file of walk(root)) {
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes('id="social-bottom-bar"')) continue;

  let fileChanged = false;
  const rel = path.relative(root, file);

  if (
    !content.includes('id="social-bottom-bar-spacer"') &&
    content.includes('id="social-bottom-bar"')
  ) {
    if (content.includes(BAR_COMMENT)) {
      content = content.replace(BAR_COMMENT, SPACER + "    " + BAR_COMMENT);
    } else {
      content = content.replace(
        /(\s*)<div class="fixed inset-x-0 bottom-0 z-40 flex justify-center">\s*\n\s*<div id="social-bottom-bar"/,
        `$1${SPACER.trimEnd()}\n$1<div class="fixed inset-x-0 bottom-0 z-40 flex justify-center">\n$1  <div id="social-bottom-bar"`
      );
    }
    fileChanged = true;
    spacerUpdated++;
  }

  if (INTERNATIONAL.some((p) => rel.replace(/\\/g, "/").endsWith(p))) {
    if (FOOTER_OLD_RE.test(content) && !content.includes("codifytech.click")) {
      content = content.replace(FOOTER_OLD_RE, FOOTER_CREDITS);
      fileChanged = true;
      footerUpdated++;
    }

    const styleFix = fixInternationalStyles(content);
    if (styleFix.changed) {
      content = styleFix.content;
      fileChanged = true;
      styleUpdated++;
    }
  }

  if (fileChanged) {
    fs.writeFileSync(file, content, "utf8");
    console.log("Actualizado:", rel);
  }
}

console.log("\nEspaciadores:", spacerUpdated);
console.log("Footers internacionales:", footerUpdated);
console.log("Estilos internacionales:", styleUpdated);
