/**

 * Elimina handlers inline duplicados del menú móvil (nav-menu.js ya los maneja).

 * Run: node scripts/remove-duplicate-nav-handlers.js

 */

const fs = require("fs");

const path = require("path");



const ROOT = path.join(__dirname, "..");



function walk(d, list = []) {

  for (const f of fs.readdirSync(d)) {

    const p = path.join(d, f);

    if (fs.statSync(p).isDirectory()) {

      if (!["node_modules", "scripts", "admin"].includes(f)) walk(p, list);

    } else if (f.endsWith(".html")) list.push(p);

  }

  return list;

}



const PATTERNS = [

  // Bloque compacto (municipios): menuBtn + dropdown + click fuera

  /\s*const menuBtn = document\.getElementById\(['"]menu-btn['"]\);[\s\S]*?document\.addEventListener\(['"]click['"],\s*\(e\)\s*=>\s*\{[\s\S]*?tabletMenu\.classList\.remove\(['"]open['"]\);[\s\S]*?\}\s*\);\s*\n/g,

  // Variante con comillas dobles en remove

  /\s*const menuBtn = document\.getElementById\(["']menu-btn["']\);[\s\S]*?}\s*\);\s*\n\s*}\s*\);\s*\n/g,

  // Index/modelos: bloque menú tablet dentro de script grande

  /\s*const menuBtn = document\.getElementById\(["']menu-btn["']\);[\s\S]*?\/\/ Dropdown de municipios en tablet[\s\S]*?}\s*}\s*\n\s*\n\s*const tabletEmpresaDropdownBtn[\s\S]*?}\s*}\s*\n\s*\n\s*\/\/ Cerrar menú al hacer clic fuera[\s\S]*?}\s*}\s*\);\s*\n\s*\n\s*\/\/ Cerrar menú al hacer scroll[\s\S]*?}\s*\);\s*\n/g,

  /\s*const menuBtn = document\.getElementById\(["']menu-btn["']\);[\s\S]*?\/\/ Cerrar menú al hacer clic fuera[\s\S]*?}\s*}\s*\);\s*\n/g,

  /\s*const menuBtn = document\.getElementById\(["']menu-btn["']\);[\s\S]*?\/\/ Dropdown de municipios[\s\S]*?}\s*}\s*\n\s*\n\s*const tabletEmpresaDropdownBtn[\s\S]*?}\s*}\s*\n/g,

  /\s*const menuBtn = document\.getElementById\(["']menu-btn["']\);[\s\S]*?\/\/ Menú tablet[\s\S]*?}\s*}\s*\n\s*\n\s*\/\/ Dropdown de municipios[\s\S]*?}\s*}\s*\n/g,

  // Blogs: mobile-menu toggle

  /\s*const menuBtn = document\.getElementById\(["']menu-btn["']\);[\s\S]*?mobileMenu\.classList\.toggle\(["']hidden["']\);[\s\S]*?\}\s*\n/g,

  /\s*document\.getElementById\(["']menu-btn["']\)\?\.addEventListener\(["']click["'],\s*\(\)\s*=>\s*document\.getElementById\(["']mobile-menu["']\)\?\.classList\.toggle\(["']hidden["']\)\);\s*\n/g,
  /\s*const menuBtn = document\.getElementById\(["']menu-btn["']\);\s*\n\s*const mobileMenu = document\.getElementById\(["']mobile-menu["']\);\s*\n\s*if \(menuBtn && mobileMenu\) menuBtn\.addEventListener\([^;]+;\s*\n/g,
  /\s*const menuBtn = document\.getElementById\(["']menu-btn["']\);\s*\n\s*const mobileMenu = document\.getElementById\(["']mobile-menu["']\);\s*\n\s*if \(menuBtn && mobileMenu\) \{\s*\n\s*menuBtn\.addEventListener\([\s\S]*?\}\s*\n/g,

  // Scroll handler roto (tabletMenu sin definir)

  /\s*\/\/ Cerrar menú al hacer scroll \(opcional, mejora UX\)[\s\S]*?lastScroll = currentScroll;\s*\}\);\s*\n/g,

];



let n = 0;

for (const file of walk(ROOT)) {

  if (!fs.readFileSync(file, "utf8").includes("nav-menu.js")) continue;

  let c = fs.readFileSync(file, "utf8");

  const orig = c;

  for (const re of PATTERNS) {

    c = c.replace(re, "\n");

  }

  c = c.replace(

    /\s*const tabletEmpresaDropdownBtn = document\.getElementById\("tablet-empresa-dropdown-btn"\);[\s\S]*?}\s*}\s*\n/g,

    "\n"

  );

  if (c !== orig) {

    fs.writeFileSync(file, c);

    n++;

    console.log(path.relative(ROOT, file));

  }

}

console.log("Removed duplicate handlers from", n, "files");

