/**
 * Reorganiza la navegación (menú Empresa + barra compacta) en todas las páginas HTML.
 * Run: node scripts/update-nav-reorganize.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const NAV_CSS = '<link rel="stylesheet" href="/assets/css/nav-shared.css" />';
const NAV_MENU_JS = '<script src="/assets/js/nav-menu.js"></script>';

const EMPRESA_KEYS = new Set([
  "empresa",
  "empresa-eps",
  "empresa-galeria",
  "empresa-nosotros",
  "empresa-faq",
  "empresa-referidos",
]);

function walkDir(dir, fileList = []) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f === "node_modules" || f === "scripts" || f === "admin") continue;
      walkDir(full, fileList);
    } else if (f.endsWith(".html")) fileList.push(full);
  }
  return fileList;
}

function detectActive(content, filePath) {
  const base = path.basename(filePath, ".html");
  const rel = path.relative(ROOT, filePath).replace(/\\/g, "/");

  const byFile = {
    index: "inicio",
    modelos: "modelos",
    ventajas: "empresa-eps",
    galeria: "empresa-galeria",
    blog: "blog",
    nosotros: "empresa-nosotros",
    faq: "empresa-faq",
    referidos: "empresa-referidos",
    contacto: "contacto",
    "cotizador-precios-casas-prefabricadas": "cotizador",
  };
  if (byFile[base]) return byFile[base];
  if (rel.startsWith("pages/")) return "cobertura";
  if (rel.startsWith("blog/") && base !== "post") return "blog";

  if (
    /href="(?:\/|https:\/\/www\.concasaya\.com\/?)"[^>]*class="[^"]*text-primary[^"]*font-bold/.test(
      content
    )
  ) {
    return "inicio";
  }
  const hrefActive = [
    ["modelos", /href="\/modelos\.html"[^>]*class="[^"]*text-primary[^"]*font-bold/],
    ["cotizador", /href="\/cotizador-precios-casas-prefabricadas\.html"[^>]*class="[^"]*text-primary[^"]*font-bold/],
    ["blog", /href="\/blog\.html"[^>]*class="[^"]*text-primary[^"]*font-bold/],
    ["contacto", /href="\/contacto\.html"[^>]*class="[^"]*bg-primary[^"]*text-white[^"]*font-bold/],
    ["empresa-eps", /href="\/ventajas\.html"[^>]*class="[^"]*text-primary[^"]*font-bold/],
    ["empresa-galeria", /href="\/galeria\.html"[^>]*class="[^"]*text-primary[^"]*font-bold/],
    ["empresa-nosotros", /href="\/nosotros\.html"[^>]*class="[^"]*text-primary[^"]*font-bold/],
    ["empresa-faq", /href="\/faq\.html"[^>]*class="[^"]*text-primary[^"]*font-bold/],
    ["empresa-referidos", /href="\/referidos\.html"[^>]*class="[^"]*text-primary[^"]*font-bold/],
    ["cobertura", /<button[^>]*class="[^"]*text-primary[^"]*font-bold[^"]*"[^>]*>[\s\S]*?Municipios|Cobertura/],
  ];
  for (const [key, re] of hrefActive) {
    if (re.test(content)) return key;
  }

  return null;
}

function getInicioHref(content) {
  const m = content.match(/href="([^"]+)"[^>]*class="[^"]*tablet-menu-item[^"]*active[^"]*"[^>]*>[\s\S]*?Inicio/);
  if (m) return m[1];
  const m2 = content.match(/href="([^"]+)"[^>]*>[\s\S]{0,80}?Inicio<\/a/);
  if (m2 && (m2[1] === "/" || m2[1].includes("concasaya.com"))) return m2[1];
  return "/";
}

function cls(active, key, boldOnly) {
  if (active === key) {
    return boldOnly
      ? "text-primary font-bold transition duration-300"
      : "text-primary font-bold transition duration-300";
  }
  return "text-dark hover:text-primary transition duration-300";
}

function cotizadorCls(active) {
  if (active === "cotizador") {
    return "text-primary font-bold transition duration-300 font-semibold";
  }
  return "text-dark hover:text-primary transition duration-300 font-semibold";
}

function buildDesktopNav(active, inicioHref) {
  const coberturaBtn = cls(active, "cobertura");
  const empresaBtn = EMPRESA_KEYS.has(active) || active === "empresa"
    ? "text-primary font-bold transition duration-300 inline-flex items-center"
    : "text-dark hover:text-primary transition duration-300 inline-flex items-center";

  return `        <div class="hidden lg:flex nav-desktop-primary items-center">
          <a href="${inicioHref}" class="${cls(active, "inicio")}"
            >Inicio</a
          >
          <a
            href="/modelos.html"
            class="${cls(active, "modelos")}"
            >Modelos</a
          >
          <a
            href="/cotizador-precios-casas-prefabricadas.html"
            class="${cotizadorCls(active)}"
            >Cotizador de precios</a
          >

          <div class="relative dropdown">
            <button
              type="button"
              class="${coberturaBtn} inline-flex items-center"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <span>Cobertura</span>
              <i class="fas fa-chevron-down ml-2 text-xs"></i>
            </button>
            <ul id="nav-municipios-desktop" class="dropdown-menu absolute hidden text-dark pt-2 min-w-[600px] bg-white rounded-lg shadow-xl"></ul>
          </div>

          <div class="relative dropdown">
            <button
              type="button"
              class="${empresaBtn}"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <span>Empresa</span>
              <i class="fas fa-chevron-down ml-2 text-xs"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu--simple absolute text-dark bg-white rounded-lg shadow-xl">
              <li>
                <a href="/nosotros.html" class="block ${cls(active, "empresa-nosotros")}"
                  ><i class="fas fa-users mr-2 text-primary w-4 text-center"></i>Sobre Nosotros</a
                >
              </li>
              <li>
                <a href="/ventajas.html" class="block ${cls(active, "empresa-eps")}"
                  ><i class="fas fa-info-circle mr-2 text-primary w-4 text-center"></i>¿Qué es EPS?</a
                >
              </li>
              <li>
                <a href="/galeria.html" class="block ${cls(active, "empresa-galeria")}"
                  ><i class="fas fa-images mr-2 text-primary w-4 text-center"></i>Galería</a
                >
              </li>
              <li>
                <a href="/faq.html" class="block ${cls(active, "empresa-faq")}"
                  ><i class="fas fa-question-circle mr-2 text-primary w-4 text-center"></i>Preguntas Frecuentes</a
                >
              </li>
              <li>
                <a href="/referidos.html" class="block ${cls(active, "empresa-referidos")}"
                  ><i class="fas fa-gift mr-2 text-primary w-4 text-center"></i>Plan Referidos</a
                >
              </li>
            </ul>
          </div>

          <a
            href="/blog.html"
            class="${cls(active, "blog")}"
            >Blog</a
          >
          <a
            href="/contacto.html"
            class="bg-primary text-white px-4 py-2 rounded-full hover:opacity-90 transition duration-300 shrink-0"
            >Contacto</a
          >
        </div>`;
}

function tabletItem(active, key, href, icon, label) {
  const isActive = active === key;
  const base = "tablet-menu-item block py-3 px-6 text-base font-medium";
  const classes = isActive
    ? `${base} active`
    : `${base} text-dark`;
  return `        <a href="${href}" class="${classes}"
          ><i class="${icon}"></i>${label}</a
        >`;
}

function buildTabletNav(active, inicioHref) {
  const inicio = tabletItem(active, "inicio", inicioHref, "fas fa-home mr-3 text-primary", "Inicio");
  const modelos = tabletItem(active, "modelos", "/modelos.html", "fas fa-building mr-3 text-primary", "Modelos");
  const cotizador = tabletItem(
    active,
    "cotizador",
    "/cotizador-precios-casas-prefabricadas.html",
    "fas fa-calculator mr-3 text-primary",
    "Cotizador de precios"
  );
  const blog = tabletItem(active, "blog", "/blog.html", "fas fa-blog mr-3 text-primary", "Blog");
  const contactoCls =
    active === "contacto"
      ? "tablet-menu-item active block py-3 px-6 text-base font-medium text-white bg-primary rounded-lg mx-4 my-2 hover:opacity-90 transition"
      : "tablet-menu-item block py-3 px-6 text-base font-medium text-white bg-primary rounded-lg mx-4 my-2 hover:opacity-90 transition";

  const empresaSub = (key, href, icon, label) => {
    const subActive = active === key ? " bg-primary/5 text-primary font-semibold" : "";
    return `            <a href="${href}" class="tablet-menu-item block py-3 px-8 text-sm font-medium text-dark${subActive}"
              ><i class="${icon}"></i>${label}</a
            >`;
  };

  return `      <div id="tablet-menu" class="lg:hidden bg-white border-t shadow-lg">
${inicio}
${modelos}
${cotizador}
        <div class="relative">
          <button
            class="tablet-menu-item w-full text-left flex items-center justify-between py-3 px-6 text-base font-medium text-dark"
            id="tablet-dropdown-btn"
          >
            <span
              ><i class="fas fa-earth-americas mr-3 text-primary"></i
              >Cobertura</span
            >
            <i
              id="tablet-dropdown-icon"
              class="fas fa-chevron-down text-xs menu-icon transition-transform"
            ></i>
          </button>
          <div id="tablet-dropdown-menu" class="tablet-submenu">
          </div>
        </div>
        <div class="relative">
          <button
            class="tablet-menu-item w-full text-left flex items-center justify-between py-3 px-6 text-base font-medium text-dark"
            id="tablet-empresa-dropdown-btn"
          >
            <span><i class="fas fa-building mr-3 text-primary"></i>Empresa</span>
            <i
              id="tablet-empresa-dropdown-icon"
              class="fas fa-chevron-down text-xs menu-icon transition-transform"
            ></i>
          </button>
          <div id="tablet-empresa-dropdown-menu" class="tablet-submenu tablet-submenu--empresa">
${empresaSub("empresa-nosotros", "/nosotros.html", "fas fa-users mr-3 text-primary", "Sobre Nosotros")}
${empresaSub("empresa-eps", "/ventajas.html", "fas fa-info-circle mr-3 text-primary", "¿Qué es EPS?")}
${empresaSub("empresa-galeria", "/galeria.html", "fas fa-images mr-3 text-primary", "Galería")}
${empresaSub("empresa-faq", "/faq.html", "fas fa-question-circle mr-3 text-primary", "Preguntas Frecuentes")}
${empresaSub("empresa-referidos", "/referidos.html", "fas fa-gift mr-3 text-primary", "Plan Referidos")}
          </div>
        </div>
${blog}
        <a href="/contacto.html" class="${contactoCls}"
          ><i class="fas fa-envelope mr-3"></i>Contacto</a
        >
      </div>`;
}

const DESKTOP_RE =
  /<div class="hidden lg:flex(?: nav-desktop-primary)?[^"]* items-center">[\s\S]*?<\/div>\s*(?=<div class="lg:hidden">)/;

const TABLET_RE =
  /<!-- Menú Tablet y Móvil[^>]*-->\s*<div id="tablet-menu"[\s\S]*?<\/div>\s*(?=<\/header>)/;

const TABLET_RE_ALT =
  /<div id="tablet-menu" class="lg:hidden bg-white border-t shadow-lg">[\s\S]*?<\/div>\s*(?=<\/header>)/;

function stripInlineMenuScript(content) {
  return content
    .replace(
      /\s*\/\/ Menú tablet\/móvil[\s\S]*?bindTabletDropdown[\s\S]*?tabletEmpresaDropdownIcon\.classList\.add\("open"\);\s*\}\s*\);\s*\}\s*/g,
      "\n"
    )
    .replace(
      /\s*const menuBtn = document\.getElementById\("menu-btn"\);[\s\S]*?tabletDropdownIcon\.classList\.add\("open"\);\s*\}\s*\);\s*\}\s*/g,
      "\n"
    );
}

function ensureAssets(content) {
  if (!content.includes("nav-shared.css")) {
    content = content.replace(/<\/head>/i, `    ${NAV_CSS}\n  </head>`);
  }
  if (!content.includes("nav-menu.js")) {
    if (content.includes("nav-municipios.js")) {
      content = content.replace(
        /<script src="\/assets\/js\/nav-municipios\.js"><\/script>/,
        `<script src="/assets/js/nav-municipios.js"></script>\n    ${NAV_MENU_JS}`
      );
    } else if (content.includes("</body>")) {
      content = content.replace("</body>", `    ${NAV_MENU_JS}\n  </body>`);
    }
  }
  return content;
}

function removeDuplicateNavCss(content) {
  if (!content.includes("nav-shared.css")) return content;
  return content.replace(
    /\s*\/\* Menú desplegable simple \(Empresa, etc\.\) \*\/[\s\S]*?\.nav-desktop-primary > \.dropdown > button \{[\s\S]*?white-space: nowrap;\s*\}\s*/g,
    "\n"
  );
}

const files = walkDir(ROOT).filter((p) => {
  const c = fs.readFileSync(p, "utf8");
  return c.includes("tablet-dropdown-menu") && c.includes("nav-municipios-desktop");
});

let updated = 0;
for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const orig = content;
  const active = detectActive(content, file);
  const inicioHref = getInicioHref(content);

  const desktopNav = buildDesktopNav(active, inicioHref);
  const tabletNav = buildTabletNav(active, inicioHref);

  if (DESKTOP_RE.test(content)) {
    content = content.replace(DESKTOP_RE, desktopNav + "\n        ");
  }

  if (TABLET_RE.test(content)) {
    content = content.replace(
      TABLET_RE,
      (active === "inicio"
        ? "      <!-- Menú Tablet y Móvil Mejorado -->\n"
        : "      ") + tabletNav + "\n    "
    );
  } else if (TABLET_RE_ALT.test(content)) {
    content = content.replace(TABLET_RE_ALT, tabletNav + "\n    ");
  }

  content = stripInlineMenuScript(content);
  content = removeDuplicateNavCss(content);
  content = ensureAssets(content);

  if (content !== orig) {
    fs.writeFileSync(file, content, "utf8");
    updated++;
    console.log("Updated:", path.relative(ROOT, file), active ? `(${active})` : "");
  }
}

console.log("Done. Updated", updated, "files.");
