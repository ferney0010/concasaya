// Render del dropdown "Cobertura" en el header + "Cobertura" en el tablet-menu.
// v3: layout limpio tipo mega-menu, 4 columnas en desktop, sin buscador ni iconos
// en los items, header con badge descriptivo, footer con pills de departamentos.
// Mobile: lista vertical simple, items grandes y respirados, secciones claras.
function renderNavMunicipios() {
  var municipios = window.MUNICIPIOS || [];
  var paises = window.PAISES || [];
  if (!municipios.length && !paises.length) return;

  var baseHref = "/pages/";
  var colSlug = "casas-prefabricadas-colombia";
  var colHref = baseHref + colSlug + ".html";
  var coberturaCompletaHref = colHref;

  var currentSlug = null;
  var pathname = typeof window.location !== "undefined" && window.location.pathname || "";
  var match = pathname.match(/\/pages\/([a-z0-9-]+)\.html$/i);
  if (match) currentSlug = match[1];

  function esc(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function injectCoverageStyles() {
    if (document.getElementById("coverage-nav-responsive-styles")) return;

    var style = document.createElement("style");
    style.id = "coverage-nav-responsive-styles";
    style.textContent = [
      // === Contenedor desktop (mega-menu limpio) ===
      "#nav-municipios-desktop{",
      "  left:auto!important;right:0!important;top:calc(100% + 6px);",
      "  width:min(96vw,920px);min-width:min(96vw,920px)!important;",
      "  max-height:min(82vh,calc(100vh - 90px));",
      "  background:#fff;border-radius:14px;",
      "  box-shadow:0 18px 50px rgba(15,23,42,.14),0 0 0 1px rgba(15,23,42,.04);",
      "  display:flex;flex-direction:column;",
      "  overflow:hidden;",
      "  z-index:60;",
      "}",
      // === Header con badge ===
      "#nav-municipios-desktop .coverage-header{",
      "  padding:1rem 1.4rem 0.9rem;",
      "  border-bottom:1px solid #eef2f6;",
      "}",
      "#nav-municipios-desktop .coverage-header-title{",
      "  display:inline-flex;align-items:center;gap:0.5rem;",
      "  font-size:0.78rem;font-weight:800;",
      "  color:#0a2540;letter-spacing:0.01em;",
      "}",
      "#nav-municipios-desktop .coverage-header-title .coverage-count{",
      "  color:#0077b6;font-weight:700;",
      "}",
      // === Body grid 4 columnas ===
      "#nav-municipios-desktop .coverage-body{",
      "  flex:1 1 auto;",
      "  overflow-y:auto;",
      "  overscroll-behavior:contain;",
      "  -webkit-overflow-scrolling:touch;",
      "  padding:1.1rem 1.4rem 0.4rem;",
      "  display:grid;",
      "  grid-template-columns:repeat(4,minmax(0,1fr));",
      "  gap:0.5rem 1.6rem;",
      "}",
      // Scrollbar custom fina
      "#nav-municipios-desktop .coverage-body::-webkit-scrollbar{width:8px;}",
      "#nav-municipios-desktop .coverage-body::-webkit-scrollbar-track{background:transparent;}",
      "#nav-municipios-desktop .coverage-body::-webkit-scrollbar-thumb{",
      "  background:#cbd5e1;border-radius:4px;",
      "}",
      "#nav-municipios-desktop .coverage-body::-webkit-scrollbar-thumb:hover{background:#94a3b8;}",
      // === Section title (subtítulo de columna) ===
      "#nav-municipios-desktop .coverage-section-title{",
      "  font-size:0.7rem;font-weight:800;",
      "  text-transform:uppercase;letter-spacing:0.08em;",
      "  color:#0077b6;",
      "  margin:0 0 0.55rem;padding:0;",
      "  grid-column:span 1;",
      "}",
      "#nav-municipios-desktop .coverage-section-title .coverage-section-count{",
      "  color:#94a3b8;font-weight:600;margin-left:0.3rem;",
      "}",
      // Sub-sección (dentro de una columna)
      "#nav-municipios-desktop .coverage-subsection-title{",
      "  font-size:0.65rem;font-weight:700;",
      "  text-transform:uppercase;letter-spacing:0.06em;",
      "  color:#0077b6;opacity:0.75;",
      "  margin:0.85rem 0 0.35rem;padding:0;",
      "}",
      // === Item (link) limpio, sin iconos ===
      "#nav-municipios-desktop .municipio-item{",
      "  display:block;",
      "  padding:0.45rem 0;",
      "  font-size:0.95rem;line-height:1.35;",
      "  color:#334155;text-decoration:none;",
      "  transition:color .12s ease,padding-left .12s ease;",
      "  min-width:0;",
      "}",
      "#nav-municipios-desktop .municipio-item:hover{",
      "  color:#0077b6;",
      "  padding-left:0.3rem;",
      "}",
      "#nav-municipios-desktop .municipio-item.is-current{",
      "  color:#0077b6;font-weight:700;",
      "}",
      // === Footer con pills ===
      "#nav-municipios-desktop .coverage-footer{",
      "  padding:0.9rem 1.4rem 1rem;",
      "  border-top:1px solid #eef2f6;",
      "  background:#fafbfc;",
      "}",
      "#nav-municipios-desktop .coverage-footer-pills{",
      "  display:flex;flex-wrap:wrap;gap:0.4rem;",
      "  margin-bottom:0.65rem;",
      "}",
      "#nav-municipios-desktop .coverage-pill{",
      "  display:inline-flex;align-items:center;gap:0.3rem;",
      "  padding:0.3rem 0.7rem;",
      "  font-size:0.78rem;font-weight:600;",
      "  color:#0077b6;background:#e0f2fe;",
      "  border-radius:999px;",
      "  text-decoration:none;",
      "  transition:background .12s ease;",
      "}",
      "#nav-municipios-desktop .coverage-pill:hover{background:#bae6fd;}",
      "#nav-municipios-desktop .coverage-pill i{font-size:0.7rem;}",
      "#nav-municipios-desktop .coverage-footer-cta{",
      "  display:inline-flex;align-items:center;gap:0.4rem;",
      "  font-size:0.85rem;font-weight:700;",
      "  color:#0a2540;text-decoration:none;",
      "  padding:0.45rem 0.7rem;border-radius:8px;",
      "  transition:background .12s ease;",
      "}",
      "#nav-municipios-desktop .coverage-footer-cta:hover{background:#e0f2fe;color:#0077b6;}",
      // === Tablet breakpoints ===
      "@media (max-width:1180px){",
      "  #nav-municipios-desktop{width:min(96vw,720px);}",
      "  #nav-municipios-desktop .coverage-body{grid-template-columns:repeat(3,minmax(0,1fr));}",
      "}",
      "@media (max-width:1023px){",
      "  #nav-municipios-desktop{display:none!important;}",
      "}",
      // === Menú tablet/mobile (hamburger) — limpio ===
      "#tablet-menu.open{max-height:calc(100vh - 64px)!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch;}",
      "#tablet-dropdown-menu .coverage-section-title{",
      "  padding:1rem 1.5rem 0.4rem;",
      "  font-size:0.72rem;font-weight:800;text-transform:uppercase;",
      "  letter-spacing:0.08em;color:#0077b6;",
      "  background:#f8fafc;",
      "  border-top:1px solid #e2e8f0;",
      "}",
      "#tablet-dropdown-menu .coverage-section-title:first-child{",
      "  border-top:none;",
      "}",
      "#tablet-dropdown-menu .municipio-item{",
      "  display:block;",
      "  padding:0.7rem 1.5rem;",
      "  font-size:1rem;line-height:1.4;",
      "  color:#334155;text-decoration:none;",
      "  border-left:3px solid transparent;",
      "  transition:background .12s ease,color .12s ease,border-color .12s ease,padding-left .12s ease;",
      "}",
      "#tablet-dropdown-menu .municipio-item:hover{",
      "  background:#eff6ff;color:#0077b6;border-left-color:#0077b6;",
      "  padding-left:1.8rem;",
      "}",
      "#tablet-dropdown-menu .municipio-item.is-current{",
      "  background:#dbeafe;color:#0077b6;font-weight:700;border-left-color:#0077b6;",
      "}",
      "#tablet-dropdown-menu .coverage-footer{",
      "  padding:1rem 1.5rem 1.2rem;",
      "  border-top:1px solid #e2e8f0;background:#f8fafc;",
      "}",
      "#tablet-dropdown-menu .coverage-footer-pills{",
      "  display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:0.7rem;",
      "}",
      "#tablet-dropdown-menu .coverage-pill{",
      "  display:inline-flex;align-items:center;gap:0.3rem;",
      "  padding:0.4rem 0.8rem;",
      "  font-size:0.82rem;font-weight:600;",
      "  color:#0077b6;background:#e0f2fe;",
      "  border-radius:999px;text-decoration:none;",
      "}",
      "#tablet-dropdown-menu .coverage-footer-cta{",
      "  display:flex;align-items:center;justify-content:center;gap:0.5rem;",
      "  color:#fff;background:#0077b6;font-weight:700;font-size:0.95rem;",
      "  text-decoration:none;padding:0.8rem 1rem;",
      "  border-radius:10px;",
      "  transition:background .12s ease;",
      "}",
      "#tablet-dropdown-menu .coverage-footer-cta:hover{background:#023e7d;}",
      "@media (max-width:640px){",
      "  #tablet-dropdown-menu.open{max-height:60vh!important;}",
      "}",
      "@media (max-width:420px){",
      "  #tablet-dropdown-menu .coverage-section-title{padding:0.85rem 1.1rem 0.3rem;}",
      "  #tablet-dropdown-menu .municipio-item{padding:0.65rem 1.1rem;font-size:0.95rem;}",
      "  #tablet-dropdown-menu .coverage-footer{padding:0.9rem 1.1rem 1.1rem;}",
      "}",
    ].join("");
    document.head.appendChild(style);
  }

  function updateCoverageLabels() {
    var desktopEl = document.getElementById("nav-municipios-desktop");
    if (desktopEl) {
      var desktopButton = desktopEl.parentElement && desktopEl.parentElement.querySelector("button span");
      if (desktopButton) desktopButton.textContent = "Cobertura";
    }

    var mobileButton = document.getElementById("tablet-dropdown-btn");
    if (mobileButton) {
      var mobileLabel = mobileButton.querySelector("span");
      if (mobileLabel) mobileLabel.innerHTML = '<i class="fas fa-earth-americas mr-3 text-primary"></i>Cobertura';
    }
  }

  var isCurrentCol = currentSlug === colSlug;

  // ============ RENDER DESKTOP ============
  // Header con badge descriptivo
  var totalCount = municipios.length + paises.length + 1; // +1 = Colombia general
  var desktopHtml = '' +
    '<div class="coverage-header">' +
      '<div class="coverage-header-title">' +
        '<i class="fas fa-earth-americas" style="color:#0077b6;"></i>' +
        'Ver toda la cobertura <span class="coverage-count">(' + (municipios.length + paises.length + 1) + ' ciudades y municipios)</span>' +
      '</div>' +
    '</div>' +
    '<div class="coverage-body">';

  // === COLUMNA 1: Colombia (general) + Bogotá + Sabana ===
  desktopHtml += '<div class="coverage-section-title">Colombia</div>';
  desktopHtml += '<a class="municipio-item' + (isCurrentCol ? " is-current" : "") + '" href="' + colHref + '">Casas prefabricadas en Colombia</a>';

  // Bogotá D.C. + Sabana
  desktopHtml += '<div class="coverage-subsection-title">Bogotá y Sabana</div>';
  var bogotaSabana = ["Bogotá D.C.", "Chía", "Cajicá", "Zipaquirá", "Sopó", "Cota", "Suba", "Norte de Bogotá", "Funza", "Mosquera", "Madrid", "Tocancipá"];
  for (var i = 0; i < municipios.length; i++) {
    var m = municipios[i];
    if (bogotaSabana.indexOf(m.nombre) === -1) continue;
    var href = baseHref + m.slug + ".html";
    var isCurrent = currentSlug === m.slug;
    desktopHtml += '<a class="municipio-item' + (isCurrent ? " is-current" : "") + '" href="' + href + '">' + esc(m.nombre) + '</a>';
  }

  // === COLUMNA 2: Cundinamarca (resto) ===
  desktopHtml += '<div class="coverage-section-title">Cundinamarca <span class="coverage-section-count">resto</span></div>';
  var cundiResto = ["La Vega", "La Calera", "La Mesa", "Guasca", "Sesquilé", "Soacha", "Facatativá", "Fusagasugá", "Pacho", "Mesitas del Colegio", "Subachoque", "Supatá", "Villeta"];
  for (var j = 0; j < municipios.length; j++) {
    var mc = municipios[j];
    if (cundiResto.indexOf(mc.nombre) === -1) continue;
    var hrefc = baseHref + mc.slug + ".html";
    var isCurrentC = currentSlug === mc.slug;
    desktopHtml += '<a class="municipio-item' + (isCurrentC ? " is-current" : "") + '" href="' + hrefc + '">' + esc(mc.nombre) + '</a>';
  }

  // === COLUMNA 3: Boyacá ===
  desktopHtml += '<div class="coverage-section-title">Boyacá</div>';
  var boyacaList = ["Tunja", "Villa de Leyva", "Duitama", "Sogamoso", "Paipa", "Samacá", "Boyacá", "Chiquinquirá", "Chocontá", "Firavitoba", "Ráquira", "Valle de Tenza"];
  for (var k = 0; k < municipios.length; k++) {
    var mb = municipios[k];
    if (boyacaList.indexOf(mb.nombre) === -1) continue;
    var hrefb = baseHref + mb.slug + ".html";
    var isCurrentB = currentSlug === mb.slug;
    desktopHtml += '<a class="municipio-item' + (isCurrentB ? " is-current" : "") + '" href="' + hrefb + '">' + esc(mb.nombre) + '</a>';
  }

  // === COLUMNA 4: Santander + Magdalena + Países ===
  desktopHtml += '<div class="coverage-section-title">Santander</div>';
  var santanderList = ["Barbosa", "Vélez", "Puente Nacional", "San Francisco"];
  for (var ks = 0; ks < municipios.length; ks++) {
    var ms = municipios[ks];
    if (santanderList.indexOf(ms.nombre) === -1) continue;
    var hrefs = baseHref + ms.slug + ".html";
    var isCurrentS = currentSlug === ms.slug;
    desktopHtml += '<a class="municipio-item' + (isCurrentS ? " is-current" : "") + '" href="' + hrefs + '">' + esc(ms.nombre) + '</a>';
  }

  // Magdalena
  desktopHtml += '<div class="coverage-subsection-title">Magdalena</div>';
  for (var km = 0; km < municipios.length; km++) {
    var mm = municipios[km];
    if (mm.nombre !== "Santa Marta") continue;
    var hrefm = baseHref + mm.slug + ".html";
    var isCurrentM = currentSlug === mm.slug;
    desktopHtml += '<a class="municipio-item' + (isCurrentM ? " is-current" : "") + '" href="' + hrefm + '">' + esc(mm.nombre) + '</a>';
  }

  // Países
  desktopHtml += '<div class="coverage-subsection-title">En el exterior</div>';
  for (var p = 0; p < paises.length; p++) {
    var pais = paises[p];
    var paisHref = baseHref + pais.slug + ".html";
    var isCurrentP = currentSlug === pais.slug;
    desktopHtml += '<a class="municipio-item' + (isCurrentP ? " is-current" : "") + '" href="' + paisHref + '">' + esc(pais.nombre) + '</a>';
  }

  desktopHtml += '</div>'; // cierre coverage-body

  // === Footer con pills ===
  desktopHtml += '<div class="coverage-footer">' +
    '<div class="coverage-footer-pills">' +
      '<a class="coverage-pill" href="' + colHref + '"><i class="fas fa-flag"></i> Colombia</a>' +
      '<a class="coverage-pill" href="/pages/chia.html"><i class="fas fa-map-marker-alt"></i> Chía</a>' +
      '<a class="coverage-pill" href="/pages/cajica.html"><i class="fas fa-map-marker-alt"></i> Cajicá</a>' +
      '<a class="coverage-pill" href="/pages/zipaquira.html"><i class="fas fa-map-marker-alt"></i> Zipaquirá</a>' +
      '<a class="coverage-pill" href="/pages/sopo.html"><i class="fas fa-map-marker-alt"></i> Sopó</a>' +
      '<a class="coverage-pill" href="/pages/funza.html"><i class="fas fa-map-marker-alt"></i> Funza</a>' +
      '<a class="coverage-pill" href="/pages/mosquera.html"><i class="fas fa-map-marker-alt"></i> Mosquera</a>' +
      '<a class="coverage-pill" href="/pages/tunja.html"><i class="fas fa-map-marker-alt"></i> Tunja</a>' +
      '<a class="coverage-pill" href="/pages/villadeleyva.html"><i class="fas fa-map-marker-alt"></i> Villa de Leyva</a>' +
      '<a class="coverage-pill" href="/pages/barbosa.html"><i class="fas fa-map-marker-alt"></i> Barbosa</a>' +
    '</div>' +
    '<a class="coverage-footer-cta" href="' + coberturaCompletaHref + '">' +
      'Ver cobertura completa <i class="fas fa-arrow-right"></i>' +
    '</a>' +
    '</div>';

  // ============ RENDER MOBILE (tablet-menu) ============
  var mobileHtml = '';

  // Colombia
  mobileHtml += '<div class="coverage-section-title">Colombia</div>';
  mobileHtml += '<a class="municipio-item' + (isCurrentCol ? " is-current" : "") + '" href="' + colHref + '">Casas prefabricadas en Colombia</a>';

  // Bogotá y Sabana
  mobileHtml += '<div class="coverage-section-title">Bogotá y Sabana</div>';
  for (var mi = 0; mi < municipios.length; mi++) {
    var mmi = municipios[mi];
    if (bogotaSabana.indexOf(mmi.nombre) === -1) continue;
    var hrefmi = baseHref + mmi.slug + ".html";
    var isCurrentMi = currentSlug === mmi.slug;
    mobileHtml += '<a class="municipio-item' + (isCurrentMi ? " is-current" : "") + '" href="' + hrefmi + '">' + esc(mmi.nombre) + '</a>';
  }

  // Cundinamarca resto
  mobileHtml += '<div class="coverage-section-title">Cundinamarca</div>';
  for (var mj = 0; mj < municipios.length; mj++) {
    var mmj = municipios[mj];
    if (cundiResto.indexOf(mmj.nombre) === -1) continue;
    var hrefmj = baseHref + mmj.slug + ".html";
    var isCurrentMj = currentSlug === mmj.slug;
    mobileHtml += '<a class="municipio-item' + (isCurrentMj ? " is-current" : "") + '" href="' + hrefmj + '">' + esc(mmj.nombre) + '</a>';
  }

  // Boyacá
  mobileHtml += '<div class="coverage-section-title">Boyacá</div>';
  for (var mk = 0; mk < municipios.length; mk++) {
    var mmk = municipios[mk];
    if (boyacaList.indexOf(mmk.nombre) === -1) continue;
    var hrefmk = baseHref + mmk.slug + ".html";
    var isCurrentMk = currentSlug === mmk.slug;
    mobileHtml += '<a class="municipio-item' + (isCurrentMk ? " is-current" : "") + '" href="' + hrefmk + '">' + esc(mmk.nombre) + '</a>';
  }

  // Santander
  mobileHtml += '<div class="coverage-section-title">Santander</div>';
  for (var mn = 0; mn < municipios.length; mn++) {
    var mmn = municipios[mn];
    if (santanderList.indexOf(mmn.nombre) === -1) continue;
    var hrefmn = baseHref + mmn.slug + ".html";
    var isCurrentMn = currentSlug === mmn.slug;
    mobileHtml += '<a class="municipio-item' + (isCurrentMn ? " is-current" : "") + '" href="' + hrefmn + '">' + esc(mmn.nombre) + '</a>';
  }

  // Magdalena
  mobileHtml += '<div class="coverage-section-title">Magdalena</div>';
  for (var mo = 0; mo < municipios.length; mo++) {
    var mmo = municipios[mo];
    if (mmo.nombre !== "Santa Marta") continue;
    var hrefmo = baseHref + mmo.slug + ".html";
    var isCurrentMo = currentSlug === mmo.slug;
    mobileHtml += '<a class="municipio-item' + (isCurrentMo ? " is-current" : "") + '" href="' + hrefmo + '">' + esc(mmo.nombre) + '</a>';
  }

  // Países
  mobileHtml += '<div class="coverage-section-title">En el exterior</div>';
  for (var mp = 0; mp < paises.length; mp++) {
    var paism = paises[mp];
    var hrefmp = baseHref + paism.slug + ".html";
    var isCurrentMp = currentSlug === paism.slug;
    mobileHtml += '<a class="municipio-item' + (isCurrentMp ? " is-current" : "") + '" href="' + hrefmp + '">' + esc(paism.nombre) + '</a>';
  }

  // Footer con pills + CTA
  mobileHtml += '<div class="coverage-footer">' +
    '<div class="coverage-footer-pills">' +
      '<a class="coverage-pill" href="/pages/chia.html">Chía</a>' +
      '<a class="coverage-pill" href="/pages/cajica.html">Cajicá</a>' +
      '<a class="coverage-pill" href="/pages/zipaquira.html">Zipaquirá</a>' +
      '<a class="coverage-pill" href="/pages/sopo.html">Sopó</a>' +
      '<a class="coverage-pill" href="/pages/funza.html">Funza</a>' +
      '<a class="coverage-pill" href="/pages/mosquera.html">Mosquera</a>' +
      '<a class="coverage-pill" href="/pages/tunja.html">Tunja</a>' +
      '<a class="coverage-pill" href="/pages/villadeleyva.html">Villa de Leyva</a>' +
    '</div>' +
    '<a class="coverage-footer-cta" href="' + coberturaCompletaHref + '">' +
      'Ver cobertura completa <i class="fas fa-arrow-right"></i>' +
    '</a>' +
    '</div>';

  // ============ INYECCIÓN EN DOM ============
  var desktopEl = document.getElementById("nav-municipios-desktop");
  var mobileEl = document.getElementById("tablet-dropdown-menu");
  var footerEl = document.getElementById("nav-municipios-footer");

  injectCoverageStyles();
  if (desktopEl) desktopEl.innerHTML = desktopHtml;
  if (mobileEl) mobileEl.innerHTML = mobileHtml;
  updateCoverageLabels();

  // ============ FOOTER (preservado) ============
  if (footerEl) {
    var footerHtml = "";
    footerHtml += "<li><a href=\"" + colHref + "\" class=\"hover:text-primary\">Casas prefabricadas en Colombia</a></li>";
    for (var c = 0; c < paises.length; c++) {
      var country = paises[c];
      var cHref = baseHref + country.slug + ".html";
      var cNombre = country.nombre;
      footerHtml += "<li><a href=\"" + cHref + "\" class=\"hover:text-primary\">Casas prefabricadas para colombianos en " + cNombre + "</a></li>";
    }
    for (var j = 0; j < municipios.length; j++) {
      var f = municipios[j];
      var fHref = baseHref + f.slug + ".html";
      var fNombre = f.nombre;
      footerHtml += "<li><a href=\"" + fHref + "\" class=\"hover:text-primary\">Casas Prefabricadas en " + fNombre + "</a></li>";
    }
    footerEl.innerHTML = footerHtml;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderNavMunicipios);
} else {
  renderNavMunicipios();
}
