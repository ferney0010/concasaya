/**
 * Add mobile scroll fix for .tablet-submenu.open to all HTML that have it
 * but don't already have the 45vh override.
 */
const fs = require("fs");
const path = require("path");

const MOBILE_SCROLL_BLOCK = `
      @media (max-width: 768px) {
        .tablet-submenu.open {
          max-height: 45vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
      }`;

function walk(dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules" && e.name !== "scripts") walk(full, list);
    else if (e.isFile() && e.name.endsWith(".html")) list.push(full);
  }
  return list;
}

const root = path.join(__dirname, "..");
const files = walk(root);
let updated = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes("tablet-submenu.open") || content.includes("max-height: 45vh")) continue;

  const orig = content;
  // Match .tablet-submenu.open { max-height: 600px; } in single or multi-line form
  content = content.replace(
    /\.tablet-submenu\.open\s*\{[\s\S]*?max-height:\s*600px;\s*\}/,
    (match) => match + MOBILE_SCROLL_BLOCK
  );

  if (content !== orig) {
    fs.writeFileSync(file, content, "utf8");
    updated++;
    console.log("Fixed:", path.relative(root, file));
  }
}
console.log("Done. Updated", updated, "files.");
