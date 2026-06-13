/**
 * Enlaza social-bottom-bar.css en todas las páginas con #social-bottom-bar
 * para que el footer no quede tapado por la barra fija.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const linkTag =
  '<link rel="stylesheet" href="/assets/css/social-bottom-bar.css" />';

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

let updated = 0;
for (const file of walk(root)) {
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes('id="social-bottom-bar"')) continue;
  if (content.includes("social-bottom-bar.css")) {
    console.log("OK:", path.relative(root, file));
    continue;
  }
  content = content.replace("</head>", `    ${linkTag}\n  </head>`);
  fs.writeFileSync(file, content, "utf8");
  updated++;
  console.log("Actualizado:", path.relative(root, file));
}

console.log("\nTotal actualizados:", updated);
