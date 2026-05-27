const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const blog = fs.readFileSync(path.join(ROOT, "blog.html"), "utf8");
const headerMatch = blog.match(
  /<header class="bg-white shadow-md fixed w-full top-0 z-50">[\s\S]*?<\/header>/
);
if (!headerMatch) {
  console.error("No header in blog.html");
  process.exit(1);
}
const HEADER = headerMatch[0];
const HEADER_RE =
  /<header class="bg-white shadow-md fixed w-full top-0 z-50">[\s\S]*?<\/header>/;
const NAV_CSS = '<link rel="stylesheet" href="/assets/css/nav-shared.css" />';
const SCRIPTS =
  '    <script src="/assets/js/municipios.js"></script>\n    <script src="/assets/js/nav-municipios.js"></script>\n    <script src="/assets/js/nav-menu.js"></script>';

function walk(d, list = []) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      if (!["node_modules", "scripts", "admin"].includes(f)) walk(p, list);
    } else if (f.endsWith(".html")) list.push(p);
  }
  return list;
}

let n = 0;
for (const file of walk(ROOT)) {
  let c = fs.readFileSync(file, "utf8");
  if (!c.includes("hidden lg:flex space-x-6") || c.includes("nav-desktop-primary")) {
    continue;
  }
  const o = c;
  c = c.replace(HEADER_RE, HEADER);
  if (!c.includes("nav-shared.css")) {
    c = c.replace(/<\/head>/i, NAV_CSS + "\n  </head>");
  }
  if (!c.includes("nav-menu.js")) {
    if (c.includes("nav-municipios.js")) {
      c = c.replace(
        /<script src="\/assets\/js\/nav-municipios\.js"><\/script>/,
        (m) => m + '\n    <script src="/assets/js/nav-menu.js"></script>'
      );
    } else if (c.includes("</body>")) {
      c = c.replace("</body>", SCRIPTS + "\n  </body>");
    }
  }
  if (!c.includes("municipios.js") && c.includes("nav-municipios-desktop")) {
    c = c.replace("</body>", SCRIPTS + "\n  </body>");
  }
  if (c !== o) {
    fs.writeFileSync(file, c);
    n++;
    console.log(path.relative(ROOT, file));
  }
}
console.log("Legacy blog headers updated:", n);
