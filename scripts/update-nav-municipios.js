/**
 * One-time script: replace static municipios nav with placeholders in all HTML.
 * Run: node scripts/update-nav-municipios.js
 */
const fs = require("fs");
const path = require("path");

const DESKTOP_RE = /<ul\s+class="dropdown-menu absolute hidden[^>]*>[\s\S]*?<\/ul>/;
const DESKTOP_REPLACEMENT = '<ul id="nav-municipios-desktop" class="dropdown-menu absolute hidden text-dark pt-2 min-w-[600px] bg-white rounded-lg shadow-xl"></ul>';

const TABLET_RE = /<div id="tablet-dropdown-menu" class="tablet-submenu">[\s\S]*?<\/div>/;
const TABLET_REPLACEMENT = '<div id="tablet-dropdown-menu" class="tablet-submenu">\n          </div>';

const SCRIPTS = '\n    <script src="/assets/js/municipios.js"></script>\n    <script src="/assets/js/nav-municipios.js"></script>';

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== "node_modules" && f !== "scripts") walkDir(full, fileList);
    } else if (f.endsWith(".html")) fileList.push(full);
  }
  return fileList;
}

const root = path.join(__dirname, "..");
const files = walkDir(root).filter((p) => {
  const content = fs.readFileSync(p, "utf8");
  return content.includes("tablet-dropdown-menu") && content.includes("dropdown-menu absolute hidden");
});

let done = 0;
for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const orig = content;

  if (DESKTOP_RE.test(content)) {
    content = content.replace(DESKTOP_RE, DESKTOP_REPLACEMENT);
  }
  if (TABLET_RE.test(content)) {
    content = content.replace(TABLET_RE, TABLET_REPLACEMENT);
  }
  if (!content.includes("nav-municipios.js") && content.includes("</body>")) {
    content = content.replace("</body>", SCRIPTS + "\n  </body>");
  }

  if (content !== orig) {
    fs.writeFileSync(file, content, "utf8");
    done++;
    console.log("Updated:", path.relative(root, file));
  }
}
console.log("Done. Updated", done, "files.");
