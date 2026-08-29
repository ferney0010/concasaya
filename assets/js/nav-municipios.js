// Render del dropdown "Cobertura" en el header + "Cobertura" en el tablet-menu.
// v4: desktop limpio (4 columnas, sin iconos, header con badge, footer con pills).
//      mobile: 'Ver toda la cobertura' como link principal, 'CIUDADES PRINCIPALES',
//              'POR DEPARTAMENTO' con <details> colapsables (HTML nativo, sin JS extra),
//              'EN EL EXTERIOR' para países, CTA al final.
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

  // Definición de ciudades y departamentos (basado en la sección Cobertura del index)
  // Estructura: nombre → depto (null = va directo como "Colombia" general)
  var DEPT_MAP = {
    // Bogotá y Sabana
    "Bogotá D.C.": "Cundinamarca",  // agrupamos con Cundi
    "Chía": "Cundinamarca", "Cajicá": "Cundinamarca", "Zipaquirá": "Cundinamarca",
    "Sopó": "Cundinamarca", "Cota": "Cundinamarca", "Suba": "Cundinamarca",
    "Norte de Bogotá": "Cundinamarca", "Funza": "Cundinamarca",
    "Mosquera": "Cundinamarca", "Madrid": "Cundinamarca", "Tocancipá": "Cundinamarca",
    // Cundinamarca resto
    "La Vega": "Cundinamarca", "La Calera": "Cundinamarca", "La Mesa": "Cundinamarca",
    "Guasca": "Cundinamarca", "Sesquilé": "Cundinamarca", "Soacha": "Cundinamarca",
    "Facatativá": "Cundinamarca", "Fusagasugá": "Cundinamarca", "Pacho": "Cundinamarca",
    "Mesitas del Colegio": "Cundinamarca", "Subachoque": "Cundinamarca",
    "Supatá": "Cundinamarca", "Villeta": "Cundinamarca",
    // Boyacá
    "Tunja": "Boyacá", "Villa de Leyva": "Boyacá", "Duitama": "Boyacá",
    "Sogamoso": "Boyacá", "Paipa": "Boyacá", "Samacá": "Boyacá",
    "Boyacá": "Boyacá", "Chiquinquirá": "Boyacá", "Chocontá": "Boyacá",
    "Firavitoba": "Boyacá", "Ráquira": "Boyacá", "Valle de Tenza": "Boyacá",
    // Santander
    "Barbosa": "Santander", "Vélez": "Santander", "Puente Nacional": "Santander",
    "San Francisco": "Santander",
    // Magdalena
    "Santa Marta": "Magdalena",
  };

  // Las 12 ciudades principales (las que aparecen en la sección "Cobertura" del index)
  var CIUDADES_PRINCIPALES = [
    "Bogotá D.C.", "Chía", "Cajicá", "Zipaquirá", "Sopó", "Funza",
    "Mosquera", "Madrid", "Tocancipá", "Tunja", "Villa de Leyva", "Barbosa"
  ];

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
      "#nav-municipios-desktop .coverage-header{",
      "  padding:1rem 1.4rem 0.9rem;border-bottom:1px solid #eef2f6;",
      "}",
      "#nav-municipios-desktop .coverage-header-title{",
      "  display:inline-flex;align-items:center;gap:0.5rem;",
      "  font-size:0.78rem;font-weight:800;color:#0a2540;",
      "}",
      "#nav-municipios-desktop .coverage-header-title .coverage-count{color:#0077b6;font-weight:700;}",
      "#nav-municipios-desktop .coverage-body{",
      "  flex:1 1 auto;overflow-y:auto;",
      "  overscroll-behavior:contain;-webkit-overflow-scrolling:touch;",
      "  padding:1.1rem 1.4rem 0.4rem;",
      "  display:grid;grid-template-columns:repeat(4,minmax(0,1fr));",
      "  gap:0.5rem 1.6rem;",
      "}",
      "#nav-municipios-desktop .coverage-body::-webkit-scrollbar{width:8px;}",
      "#nav-municipios-desktop .coverage-body::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}",
      "#nav-municipios-desktop .coverage-body::-webkit-scrollbar-thumb:hover{background:#94a3b8;}",
      "#nav-municipios-desktop .coverage-section-title{",
      "  font-size:0.7rem;font-weight:800;",
      "  text-transform:uppercase;letter-spacing:0.08em;",
      "  color:#0077b6;margin:0 0 0.55rem;",
      "}",
      "#nav-municipios-desktop .coverage-section-title .coverage-section-count{color:#94a3b8;font-weight:600;margin-left:0.3rem;}",
      "#nav-municipios-desktop .coverage-subsection-title{",
      "  font-size:0.65rem;font-weight:700;",
      "  text-transform:uppercase;letter-spacing:0.06em;",
      "  color:#0077b6;opacity:0.75;margin:0.85rem 0 0.35rem;",
      "}",
      "#nav-municipios-desktop .municipio-item{",
      "  display:block;padding:0.45rem 0;",
      "  font-size:0.95rem;line-height:1.35;",
      "  color:#334155;text-decoration:none;",
      "  transition:color .12s ease,padding-left .12s ease;",
      "}",
      "#nav-municipios-desktop .municipio-item:hover{color:#0077b6;padding-left:0.3rem;}",
      "#nav-municipios-desktop .municipio-item.is-current{color:#0077b6;font-weight:700;}",
      "#nav-municipios-desktop .coverage-footer{",
      "  padding:0.9rem 1.4rem 1rem;",
      "  border-top:1px solid #eef2f6;background:#fafbfc;",
      "}",
      "#nav-municipios-desktop .coverage-footer-pills{display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:0.65rem;}",
      "#nav-municipios-desktop .coverage-pill{",
      "  display:inline-flex;align-items:center;gap:0.3rem;",
      "  padding:0.3rem 0.7rem;",
      "  font-size:0.78rem;font-weight:600;",
      "  color:#0077b6;background:#e0f2fe;border-radius:999px;",
      "  text-decoration:none;",
      "}",
      "#nav-municipios-desktop .coverage-pill:hover{background:#bae6fd;}",
      "#nav-municipios-desktop .coverage-pill i{font-size:0.7rem;}",
      "#nav-municipios-desktop .coverage-footer-cta{",
      "  display:inline-flex;align-items:center;gap:0.4rem;",
      "  font-size:0.85rem;font-weight:700;",
      "  color:#0a2540;text-decoration:none;",
      "  padding:0.45rem 0.7rem;border-radius:8px;",
      "}",
      "#nav-municipios-desktop .coverage-footer-cta:hover{background:#e0f2fe;color:#0077b6;}",
      "@media (max-width:1180px){",
      "  #nav-municipios-desktop{width:min(96vw,720px);}",
      "  #nav-municipios-desktop .coverage-body{grid-template-columns:repeat(3,minmax(0,1fr));}",
      "}",
      "@media (max-width:1023px){",
      "  #nav-municipios-desktop{display:none!important;}",
      "}",
      // === Menú tablet/mobile (hamburger) — colapsables por departamento ===
      "#tablet-menu.open{max-height:calc(100vh - 64px)!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch;}",
      // Sección "Ver toda la cobertura" (link principal)
      "#tablet-dropdown-menu{box-sizing:border-box;max-width:100%;}",
      "#tablet-dropdown-menu *{box-sizing:border-box;}",
      "#tablet-dropdown-menu .coverage-main-link{",
      "  display:block;",
      "  padding:0.85rem 1rem;",
      "  font-size:1rem;font-weight:700;color:#0a2540;",
      "  text-decoration:none;",
      "  border-left:3px solid transparent;",
      "  max-width:100%;",
      "}",
      "#tablet-dropdown-menu .coverage-main-link:hover{",
      "  background:#eff6ff;color:#0077b6;border-left-color:#0077b6;",
      "}",
      "#tablet-dropdown-menu .coverage-main-link.is-current{",
      "  background:#dbeafe;color:#0077b6;border-left-color:#0077b6;",
      "}",
      // Subtítulos de sección
      "#tablet-dropdown-menu .coverage-section-title{",
      "  padding:0.85rem 1rem 0.3rem;",
      "  font-size:0.7rem;font-weight:800;text-transform:uppercase;",
      "  letter-spacing:0.08em;color:#0077b6;",
      "  border-top:1px solid #e2e8f0;",
      "  background:#f8fafc;",
      "  max-width:100%;",
      "}",
      "#tablet-dropdown-menu .coverage-section-title:first-child{border-top:none;}",
      // Items de ciudades (links simples)
      "#tablet-dropdown-menu .municipio-item{",
      "  display:block;",
      "  padding:0.7rem 1rem;",
      "  font-size:0.95rem;line-height:1.4;",
      "  color:#334155;text-decoration:none;",
      "  border-left:3px solid transparent;",
      "  max-width:100%;word-break:break-word;",
      "}",
      "#tablet-dropdown-menu .municipio-item:hover{",
      "  background:#eff6ff;color:#0077b6;border-left-color:#0077b6;",
      "}",
      "#tablet-dropdown-menu .municipio-item.is-current{",
      "  background:#dbeafe;color:#0077b6;font-weight:700;border-left-color:#0077b6;",
      "}",
      // Departamentos colapsables (details/summary)
      "#tablet-dropdown-menu .coverage-depto{",
      "  border-bottom:1px solid #eef2f6;",
      "  max-width:100%;",
      "}",
      "#tablet-dropdown-menu .coverage-depto[open] .coverage-depto-summary i{transform:rotate(180deg);}",
      "#tablet-dropdown-menu .coverage-depto-summary{",
      "  display:flex;align-items:center;justify-content:space-between;gap:0.5rem;",
      "  padding:0.7rem 1rem;",
      "  font-size:0.95rem;font-weight:600;color:#1e293b;",
      "  background:transparent;border:none;width:100%;text-align:left;",
      "  cursor:pointer;list-style:none;",
      "  transition:background .12s ease;",
      "  max-width:100%;",
      "}",
      "#tablet-dropdown-menu .coverage-depto-summary::-webkit-details-marker{display:none;}",
      "#tablet-dropdown-menu .coverage-depto-summary::marker{display:none;content:'';}",
      "#tablet-dropdown-menu .coverage-depto-summary:hover{background:#f1f5f9;}",
      "#tablet-dropdown-menu .coverage-depto-summary .coverage-depto-name{",
      "  display:flex;align-items:center;gap:0.5rem;",
      "  min-width:0;flex:1 1 auto;",
      "}",
      "#tablet-dropdown-menu .coverage-depto-summary .coverage-depto-name i{",
      "  color:#0077b6;font-size:0.85rem;flex-shrink:0;",
      "}",
      "#tablet-dropdown-menu .coverage-depto-summary .coverage-depto-count{",
      "  color:#94a3b8;font-weight:500;font-size:0.82rem;flex-shrink:0;",
      "}",
      "#tablet-dropdown-menu .coverage-depto-summary i.coverage-depto-chevron{",
      "  color:#94a3b8;font-size:0.75rem;",
      "  transition:transform .2s ease;flex-shrink:0;",
      "}",
      "#tablet-dropdown-menu .coverage-depto-list{",
      "  background:#fafbfc;padding:0.25rem 0 0.5rem;",
      "  max-width:100%;",
      "}",
      "#tablet-dropdown-menu .coverage-depto-list .municipio-item{",
      "  padding:0.55rem 1rem 0.55rem 1.75rem;",
      "  font-size:0.9rem;",
      "  max-width:100%;word-break:break-word;",
      "}",
      // Footer con pills + CTA
      "#tablet-dropdown-menu .coverage-footer{",
      "  padding:0.9rem 1rem 1.1rem;",
      "  border-top:1px solid #e2e8f0;background:#f8fafc;",
      "  max-width:100%;",
      "}",
      "#tablet-dropdown-menu .coverage-footer-pills{",
      "  display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:0.7rem;",
      "  max-width:100%;",
      "}",
      "#tablet-dropdown-menu .coverage-pill{",
      "  display:inline-flex;align-items:center;gap:0.3rem;",
      "  padding:0.4rem 0.75rem;",
      "  font-size:0.82rem;font-weight:600;",
      "  color:#0077b6;background:#e0f2fe;border-radius:999px;",
      "  text-decoration:none;",
      "  max-width:100%;",
      "}",
      "#tablet-dropdown-menu .coverage-footer-cta{",
      "  display:flex;align-items:center;justify-content:center;gap:0.5rem;",
      "  color:#fff;background:#0077b6;font-weight:700;font-size:0.95rem;",
      "  text-decoration:none;padding:0.85rem 1rem;border-radius:10px;",
      "  max-width:100%;",
      "}",
      "#tablet-dropdown-menu .coverage-footer-cta:hover{background:#023e7d;}",
      "@media (max-width:640px){",
      "  #tablet-dropdown-menu.open{max-height:60vh!important;}",
      "}",
      "@media (max-width:420px){",
      "  #tablet-dropdown-menu .coverage-main-link,",
      "  #tablet-dropdown-menu .municipio-item,",
      "  #tablet-dropdown-menu .coverage-section-title,",
      "  #tablet-dropdown-menu .coverage-depto-summary,",
      "  #tablet-dropdown-menu .coverage-footer{padding-left:0.85rem;padding-right:0.85rem;}",
      "  #tablet-dropdown-menu .coverage-depto-list .municipio-item{padding-left:1.6rem;}",
      "  #tablet-dropdown-menu .coverage-pill{font-size:0.78rem;padding:0.35rem 0.65rem;}",
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
  var desktopHtml = '' +
    '<div class="coverage-header">' +
      '<div class="coverage-header-title">' +
        '<i class="fas fa-earth-americas" style="color:#0077b6;"></i>' +
        'Ver toda la cobertura <span class="coverage-count">(' + (municipios.length + paises.length + 1) + ' ciudades y municipios)</span>' +
      '</div>' +
    '</div>' +
    '<div class="coverage-body">';

  desktopHtml += '<div class="coverage-section-title">Colombia</div>';
  desktopHtml += '<a class="municipio-item' + (isCurrentCol ? " is-current" : "") + '" href="' + colHref + '">Casas prefabricadas en Colombia</a>';

  desktopHtml += '<div class="coverage-subsection-title">Bogotá y Sabana</div>';
  var bogotaSabana = ["Bogotá D.C.", "Chía", "Cajicá", "Zipaquirá", "Sopó", "Cota", "Suba", "Norte de Bogotá", "Funza", "Mosquera", "Madrid", "Tocancipá"];
  for (var i = 0; i < municipios.length; i++) {
    var m = municipios[i];
    if (bogotaSabana.indexOf(m.nombre) === -1) continue;
    var href = baseHref + m.slug + ".html";
    var isCurrent = currentSlug === m.slug;
    desktopHtml += '<a class="municipio-item' + (isCurrent ? " is-current" : "") + '" href="' + href + '">' + esc(m.nombre) + '</a>';
  }

  desktopHtml += '<div class="coverage-section-title">Cundinamarca <span class="coverage-section-count">resto</span></div>';
  var cundiResto = ["La Vega", "La Calera", "La Mesa", "Guasca", "Sesquilé", "Soacha", "Facatativá", "Fusagasugá", "Pacho", "Mesitas del Colegio", "Subachoque", "Supatá", "Villeta"];
  for (var j = 0; j < municipios.length; j++) {
    var mc = municipios[j];
    if (cundiResto.indexOf(mc.nombre) === -1) continue;
    var hrefc = baseHref + mc.slug + ".html";
    var isCurrentC = currentSlug === mc.slug;
    desktopHtml += '<a class="municipio-item' + (isCurrentC ? " is-current" : "") + '" href="' + hrefc + '">' + esc(mc.nombre) + '</a>';
  }

  desktopHtml += '<div class="coverage-section-title">Boyacá</div>';
  var boyacaList = ["Tunja", "Villa de Leyva", "Duitama", "Sogamoso", "Paipa", "Samacá", "Boyacá", "Chiquinquirá", "Chocontá", "Firavitoba", "Ráquira", "Valle de Tenza"];
  for (var k = 0; k < municipios.length; k++) {
    var mb = municipios[k];
    if (boyacaList.indexOf(mb.nombre) === -1) continue;
    var hrefb = baseHref + mb.slug + ".html";
    var isCurrentB = currentSlug === mb.slug;
    desktopHtml += '<a class="municipio-item' + (isCurrentB ? " is-current" : "") + '" href="' + hrefb + '">' + esc(mb.nombre) + '</a>';
  }

  desktopHtml += '<div class="coverage-section-title">Santander</div>';
  var santanderList = ["Barbosa", "Vélez", "Puente Nacional", "San Francisco"];
  for (var ks = 0; ks < municipios.length; ks++) {
    var ms = municipios[ks];
    if (santanderList.indexOf(ms.nombre) === -1) continue;
    var hrefs = baseHref + ms.slug + ".html";
    var isCurrentS = currentSlug === ms.slug;
    desktopHtml += '<a class="municipio-item' + (isCurrentS ? " is-current" : "") + '" href="' + hrefs + '">' + esc(ms.nombre) + '</a>';
  }

  desktopHtml += '<div class="coverage-subsection-title">Magdalena</div>';
  for (var km = 0; km < municipios.length; km++) {
    var mm = municipios[km];
    if (mm.nombre !== "Santa Marta") continue;
    var hrefm = baseHref + mm.slug + ".html";
    var isCurrentM = currentSlug === mm.slug;
    desktopHtml += '<a class="municipio-item' + (isCurrentM ? " is-current" : "") + '" href="' + hrefm + '">' + esc(mm.nombre) + '</a>';
  }

  desktopHtml += '<div class="coverage-subsection-title">En el exterior</div>';
  for (var p = 0; p < paises.length; p++) {
    var pais = paises[p];
    var paisHref = baseHref + pais.slug + ".html";
    var isCurrentP = currentSlug === pais.slug;
    desktopHtml += '<a class="municipio-item' + (isCurrentP ? " is-current" : "") + '" href="' + paisHref + '">' + esc(pais.nombre) + '</a>';
  }

  desktopHtml += '</div>';

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

  // ============ RENDER MOBILE (con details colapsables) ============
  var mobileHtml = '';

  // 1) "Ver toda la cobertura" como link principal
  mobileHtml += '<a class="coverage-main-link' + (isCurrentCol ? " is-current" : "") + '" href="' + colHref + '">Ver toda la cobertura</a>';

  // 2) CIUDADES PRINCIPALES — las 12 top
  mobileHtml += '<div class="coverage-section-title">Ciudades principales</div>';
  for (var ci = 0; ci < municipios.length; ci++) {
    var cm = municipios[ci];
    if (CIUDADES_PRINCIPALES.indexOf(cm.nombre) === -1) continue;
    var hrefcM = baseHref + cm.slug + ".html";
    var isCurrentCm = currentSlug === cm.slug;
    mobileHtml += '<a class="municipio-item' + (isCurrentCm ? " is-current" : "") + '" href="' + hrefcM + '">' + esc(cm.nombre) + '</a>';
  }

  // 3) POR DEPARTAMENTO — agrupamos los municipios restantes por depto, colapsables
  // Calculamos los deptos que tienen al menos un municipio que NO esté en CIUDADES_PRINCIPALES
  var deptos = {};
  for (var di = 0; di < municipios.length; di++) {
    var dm = municipios[di];
    if (CIUDADES_PRINCIPALES.indexOf(dm.nombre) !== -1) continue; // ya está arriba
    var depto = DEPT_MAP[dm.nombre] || "Otros";
    if (!deptos[depto]) deptos[depto] = [];
    deptos[depto].push(dm);
  }
  // Orden de deptos: por cantidad desc
  var deptoKeys = Object.keys(deptos).sort(function (a, b) {
    return deptos[b].length - deptos[a].length;
  });

  mobileHtml += '<div class="coverage-section-title">Por departamento</div>';
  for (var dk = 0; dk < deptoKeys.length; dk++) {
    var dname = deptoKeys[dk];
    var ditems = deptos[dname];
    var deptoIcon = "fas fa-map-marker-alt";
    // <details> con la lista dentro
    mobileHtml += '<details class="coverage-depto">' +
      '<summary class="coverage-depto-summary">' +
        '<span class="coverage-depto-name">' +
          '<i class="' + deptoIcon + '"></i>' +
          esc(dname) +
          '<span class="coverage-depto-count">(' + ditems.length + ')</span>' +
        '</span>' +
        '<i class="fas fa-chevron-down coverage-depto-chevron"></i>' +
      '</summary>' +
      '<div class="coverage-depto-list">';
    for (var dij = 0; dij < ditems.length; dij++) {
      var dmun = ditems[dij];
      var dhref = baseHref + dmun.slug + ".html";
      var disCur = currentSlug === dmun.slug;
      mobileHtml += '<a class="municipio-item' + (disCur ? " is-current" : "") + '" href="' + dhref + '">' + esc(dmun.nombre) + '</a>';
    }
    mobileHtml += '</div></details>';
  }

  // 4) EN EL EXTERIOR
  mobileHtml += '<div class="coverage-section-title">En el exterior</div>';
  for (var pe = 0; pe < paises.length; pe++) {
    var pais2 = paises[pe];
    var hrefp2 = baseHref + pais2.slug + ".html";
    var isCurrentP2 = currentSlug === pais2.slug;
    mobileHtml += '<a class="municipio-item' + (isCurrentP2 ? " is-current" : "") + '" href="' + hrefp2 + '">' + esc(pais2.nombre) + '</a>';
  }

  // 5) Footer con pills + CTA
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

  // ============ FOOTER GLOBAL (preservado) ============
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
