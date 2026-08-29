// Render del dropdown "Cobertura" en el header + "Cobertura" en el tablet-menu.
// Mejoras v2:
// - Buscador en tiempo real (desktop y mobile)
// - Items más grandes y respirados
// - Iconos consistentes (fa-map-marker-alt para municipios/países)
// - Municipios agrupados por departamento con sticky headers
// - Hover/active states claros (bg-blue-50, border-l-primary)
// - Scrollbar custom fina
// - Footer del dropdown con link a cobertura completa
// - Totalmente responsive (desktop, tablet, mobile)
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

  // Mapeo de municipio → departamento (para agrupar visualmente)
  var DEPTOS = {
    // Cundinamarca
    "chia": "Cundinamarca", "cajica": "Cundinamarca", "cota": "Cundinamarca",
    "mosquera": "Cundinamarca", "zipaquira": "Cundinamarca", "sopo": "Cundinamarca",
    "funza": "Cundinamarca", "la-vega": "Cundinamarca", "madrid": "Cundinamarca",
    "tocancipa": "Cundinamarca", "facatativa": "Cundinamarca", "fusagasuga": "Cundinamarca",
    "guasca": "Cundinamarca", "la-calera": "Cundinamarca", "la-mesa": "Cundinamarca",
    "mesitas-del-colegio": "Cundinamarca", "pacho": "Cundinamarca", "sesquile": "Cundinamarca",
    "soacha": "Cundinamarca", "suba": "Cundinamarca", "subachoque": "Cundinamarca",
    "supata": "Cundinamarca", "villeta": "Cundinamarca", "norte-bogota": "Cundinamarca",
    // Boyacá
    "tunja": "Boyacá", "duitama": "Boyacá", "paipa": "Boyacá", "samaca": "Boyacá",
    "boyaca": "Boyacá", "choconta": "Boyacá", "chiquinquira": "Boyacá",
    "firavitoba": "Boyacá", "raquira": "Boyacá", "sogamoso": "Boyacá",
    "valle-de-tenza": "Boyacá", "villadeleyva": "Boyacá",
    // Santander
    "barbosa": "Santander", "puente-nacional": "Santander", "velez": "Santander",
    "san-francisco": "Santander",
    // Otros
    "santa-marta": "Magdalena",
    "casas-prefabricadas-colombia": null  // es la página general, no municipio
  };

  function esc(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function deptoOf(slug) {
    if (DEPTOS.hasOwnProperty(slug)) return DEPTOS[slug];
    return "Otros";
  }

  function injectCoverageStyles() {
    if (document.getElementById("coverage-nav-responsive-styles")) return;

    var style = document.createElement("style");
    style.id = "coverage-nav-responsive-styles";
    style.textContent = [
      // === Contenedor desktop ===
      "#nav-municipios-desktop{",
      "  left:auto!important;right:0!important;top:calc(100% + 8px);",
      "  width:min(94vw,820px);min-width:min(94vw,820px)!important;",
      "  max-height:min(78vh,calc(100vh - 100px));",
      "  background:#fff;border-radius:16px;",
      "  box-shadow:0 20px 50px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.04);",
      "  display:flex;flex-direction:column;",
      "  overflow:hidden;",
      "  z-index:60;",
      "}",
      // === Header con buscador ===
      "#nav-municipios-desktop .coverage-header{",
      "  padding:0.9rem 1.1rem 0.8rem;",
      "  background:linear-gradient(180deg,#f8fafc 0%,#fff 100%);",
      "  border-bottom:1px solid #e2e8f0;",
      "  position:sticky;top:0;z-index:5;",
      "}",
      "#nav-municipios-desktop .coverage-search{",
      "  position:relative;",
      "  display:flex;align-items:center;",
      "}",
      "#nav-municipios-desktop .coverage-search i{",
      "  position:absolute;left:0.85rem;",
      "  color:#94a3b8;font-size:0.85rem;",
      "  pointer-events:none;",
      "}",
      "#nav-municipios-desktop .coverage-search input{",
      "  width:100%;",
      "  padding:0.55rem 0.75rem 0.55rem 2.3rem;",
      "  font-size:0.875rem;",
      "  border:1.5px solid #e2e8f0;",
      "  border-radius:10px;",
      "  background:#fff;color:#0a2540;",
      "  transition:border-color .15s ease,box-shadow .15s ease;",
      "}",
      "#nav-municipios-desktop .coverage-search input:focus{",
      "  outline:none;border-color:#0077b6;",
      "  box-shadow:0 0 0 3px rgba(0,119,182,.15);",
      "}",
      "#nav-municipios-desktop .coverage-search input::placeholder{color:#94a3b8;}",
      // === Body scrollable ===
      "#nav-municipios-desktop .coverage-body{",
      "  flex:1 1 auto;",
      "  overflow-y:auto;",
      "  overscroll-behavior:contain;",
      "  -webkit-overflow-scrolling:touch;",
      "  padding:0.4rem 0.6rem 0.4rem;",
      "}",
      // Scrollbar custom fina
      "#nav-municipios-desktop .coverage-body::-webkit-scrollbar{width:8px;}",
      "#nav-municipios-desktop .coverage-body::-webkit-scrollbar-track{background:transparent;}",
      "#nav-municipios-desktop .coverage-body::-webkit-scrollbar-thumb{",
      "  background:#cbd5e1;border-radius:4px;border:2px solid #fff;",
      "}",
      "#nav-municipios-desktop .coverage-body::-webkit-scrollbar-thumb:hover{background:#94a3b8;}",
      // === Section title (sticky) ===
      "#nav-municipios-desktop .coverage-section-title{",
      "  position:sticky;top:-0.4rem;",
      "  z-index:3;",
      "  padding:0.7rem 0.85rem 0.35rem;",
      "  font-size:0.7rem;font-weight:800;",
      "  text-transform:uppercase;letter-spacing:0.08em;",
      "  color:#0369a1;",
      "  background:linear-gradient(180deg,#fff 0%,rgba(255,255,255,.95) 80%,rgba(255,255,255,0) 100%);",
      "}",
      "#nav-municipios-desktop .coverage-section-title i{margin-right:0.45rem;opacity:0.7;}",
      // === Item (link) ===
      "#nav-municipios-desktop .municipio-item{",
      "  display:flex;align-items:center;gap:0.55rem;",
      "  padding:0.55rem 0.75rem;",
      "  margin:1px 0;",
      "  font-size:0.875rem;line-height:1.3;",
      "  color:#1e293b;text-decoration:none;",
      "  border-radius:8px;",
      "  border-left:3px solid transparent;",
      "  transition:background .12s ease,color .12s ease,border-color .12s ease,transform .12s ease;",
      "  min-width:0;",
      "}",
      "#nav-municipios-desktop .municipio-item:hover{",
      "  background:#eff6ff;color:#0077b6;",
      "  border-left-color:#0077b6;",
      "  transform:translateX(2px);",
      "}",
      "#nav-municipios-desktop .municipio-item.is-current{",
      "  background:#dbeafe;color:#0077b6;font-weight:700;",
      "  border-left-color:#0077b6;",
      "}",
      "#nav-municipios-desktop .municipio-icon{",
      "  width:16px;min-width:16px;font-size:0.8rem;",
      "  color:#0077b6;flex-shrink:0;",
      "  text-align:center;",
      "}",
      "#nav-municipios-desktop .coverage-name{",
      "  flex:1 1 auto;min-width:0;",
      "  overflow-wrap:break-word;",
      "}",
      "#nav-municipios-desktop .municipio-item.is-hidden{display:none;}",
      // === Países grid (5 columnas) ===
      "#nav-municipios-desktop .coverage-countries-grid{",
      "  display:grid;grid-template-columns:repeat(5,minmax(0,1fr));",
      "  gap:0.25rem;margin:0 0 0.4rem;padding:0;list-style:none;",
      "}",
      "#nav-municipios-desktop .coverage-countries-grid .municipio-item{",
      "  flex-direction:column;align-items:center;gap:0.25rem;",
      "  padding:0.55rem 0.4rem;text-align:center;font-size:0.78rem;",
      "}",
      "#nav-municipios-desktop .coverage-countries-grid .municipio-icon{font-size:1rem;}",
      // === Footer con CTA ===
      "#nav-municipios-desktop .coverage-footer{",
      "  padding:0.7rem 1rem;",
      "  background:#f8fafc;",
      "  border-top:1px solid #e2e8f0;",
      "  text-align:center;",
      "}",
      "#nav-municipios-desktop .coverage-footer a{",
      "  display:inline-flex;align-items:center;gap:0.4rem;",
      "  color:#0077b6;font-weight:700;font-size:0.85rem;",
      "  text-decoration:none;",
      "  padding:0.35rem 0.6rem;border-radius:6px;",
      "  transition:background .12s ease;",
      "}",
      "#nav-municipios-desktop .coverage-footer a:hover{background:#e0f2fe;}",
      // === Tablet breakpoints ===
      "@media (max-width:1180px){",
      "  #nav-municipios-desktop{width:min(94vw,640px);}",
      "  #nav-municipios-desktop .coverage-countries-grid{grid-template-columns:repeat(5,minmax(0,1fr));}",
      "}",
      "@media (max-width:1023px){",
      "  #nav-municipios-desktop{display:none!important;}",
      "}",
      // === Menú tablet/mobile (hamburger) ===
      "#tablet-menu.open{max-height:calc(100vh - 64px)!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch;}",
      "#tablet-dropdown-menu .coverage-search-wrap{",
      "  padding:0.8rem 1rem 0.5rem;",
      "  background:linear-gradient(180deg,#f8fafc 0%,#fff 100%);",
      "  border-bottom:1px solid #e2e8f0;",
      "}",
      "#tablet-dropdown-menu .coverage-search{position:relative;}",
      "#tablet-dropdown-menu .coverage-search i{",
      "  position:absolute;left:0.95rem;top:50%;transform:translateY(-50%);",
      "  color:#94a3b8;font-size:0.9rem;pointer-events:none;",
      "}",
      "#tablet-dropdown-menu .coverage-search input{",
      "  width:100%;",
      "  padding:0.7rem 0.85rem 0.7rem 2.6rem;",
      "  font-size:0.95rem;",
      "  border:1.5px solid #e2e8f0;border-radius:10px;",
      "  background:#fff;color:#0a2540;",
      "}",
      "#tablet-dropdown-menu .coverage-search input:focus{",
      "  outline:none;border-color:#0077b6;",
      "  box-shadow:0 0 0 3px rgba(0,119,182,.15);",
      "}",
      "#tablet-dropdown-menu .coverage-section-title{",
      "  padding:0.9rem 1.5rem 0.4rem;",
      "  font-size:0.72rem;font-weight:800;text-transform:uppercase;",
      "  letter-spacing:0.08em;color:#0369a1;",
      "}",
      "#tablet-dropdown-menu .municipio-item{",
      "  display:flex;align-items:center;gap:0.6rem;",
      "  padding:0.75rem 1.5rem;",
      "  font-size:0.95rem;line-height:1.3;",
      "  color:#1e293b;text-decoration:none;",
      "  border-left:3px solid transparent;",
      "  transition:background .12s ease,color .12s ease,border-color .12s ease;",
      "}",
      "#tablet-dropdown-menu .municipio-item:hover{",
      "  background:#eff6ff;color:#0077b6;border-left-color:#0077b6;",
      "}",
      "#tablet-dropdown-menu .municipio-item.is-current{",
      "  background:#dbeafe;color:#0077b6;font-weight:700;border-left-color:#0077b6;",
      "}",
      "#tablet-dropdown-menu .municipio-icon{",
      "  width:18px;min-width:18px;font-size:0.9rem;color:#0077b6;",
      "  text-align:center;",
      "}",
      "#tablet-dropdown-menu .municipio-item.is-hidden{display:none;}",
      "#tablet-dropdown-menu .coverage-footer{",
      "  padding:0.9rem 1.5rem 1.1rem;",
      "  border-top:1px solid #e2e8f0;background:#f8fafc;",
      "}",
      "#tablet-dropdown-menu .coverage-footer a{",
      "  display:flex;align-items:center;justify-content:center;gap:0.5rem;",
      "  color:#0077b6;font-weight:700;font-size:0.95rem;",
      "  text-decoration:none;padding:0.7rem 1rem;",
      "  background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;",
      "  transition:background .12s ease,border-color .12s ease;",
      "}",
      "#tablet-dropdown-menu .coverage-footer a:hover{",
      "  background:#eff6ff;border-color:#0077b6;",
      "}",
      "@media (max-width:640px){",
      "  #tablet-dropdown-menu.open{max-height:56vh!important;}",
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

  // ============ RENDER DESKTOP ============
  var isCurrentCol = currentSlug === colSlug;

  // Helper: render de un item (link)
  function renderItem(href, label, isCurrent, opts) {
    opts = opts || {};
    var icon = opts.icon || '<i class="fas fa-map-marker-alt municipio-icon"></i>';
    var searchKey = (opts.searchKey || label).toLowerCase();
    var currentClass = isCurrent ? " is-current" : "";
    return '<li><a class="municipio-item' + currentClass + '" ' +
      'data-coverage-search="' + esc(searchKey) + '" ' +
      'href="' + esc(href) + '">' +
      icon +
      '<span class="coverage-name">' + esc(label) + '</span>' +
      '</a></li>';
  }

  // Header con buscador
  var desktopHtml = '' +
    '<div class="coverage-header">' +
      '<div class="coverage-search">' +
        '<i class="fas fa-search"></i>' +
        '<input type="text" id="coverage-search-desktop" placeholder="Buscar municipio o país..." autocomplete="off" />' +
      '</div>' +
    '</div>' +
    '<div class="coverage-body">';

  // Sección: Colombia (general)
  desktopHtml += '<div class="coverage-section-title"><i class="fas fa-flag"></i>Colombia</div>';
  desktopHtml += renderItem(
    colHref,
    "Casas prefabricadas en Colombia",
    isCurrentCol,
    { icon: '<i class="fas fa-flag municipio-icon"></i>', searchKey: "colombia casas prefabricadas" }
  );

  // Sección: Países
  if (paises.length) {
    desktopHtml += '<div class="coverage-section-title"><i class="fas fa-earth-americas"></i>Países</div>';
    desktopHtml += '<ul class="coverage-countries-grid">';
    for (var p = 0; p < paises.length; p++) {
      var pais = paises[p];
      var paisHref = baseHref + pais.slug + ".html";
      var paisNombre = pais.nombre;
      var paisIcon = '<i class="' + (pais.icono || "fas fa-globe-americas") + ' municipio-icon"></i>';
      var isCurrentPais = currentSlug === pais.slug;
      desktopHtml += renderItem(
        paisHref, paisNombre, isCurrentPais,
        { icon: paisIcon, searchKey: paisNombre + " " + pais.slug }
      );
    }
    desktopHtml += '</ul>';
  }

  // Sección: Municipios (agrupados por departamento)
  if (municipios.length) {
    // Agrupar por departamento
    var byDepto = {};
    for (var i = 0; i < municipios.length; i++) {
      var m = municipios[i];
      var d = deptoOf(m.slug) || "Otros";
      if (!byDepto[d]) byDepto[d] = [];
      byDepto[d].push(m);
    }
    // Orden de departamentos (los que tienen más primero, después alfabético)
    var deptoOrder = Object.keys(byDepto).sort(function (a, b) {
      if (a === "Otros") return 1;
      if (b === "Otros") return -1;
      return byDepto[b].length - byDepto[a].length;
    });

    for (var dIdx = 0; dIdx < deptoOrder.length; dIdx++) {
      var depto = deptoOrder[dIdx];
      var items = byDepto[depto];
      var iconClass = depto === "Bogotá D.C." || depto === "Cundinamarca" || depto === "Boyacá" || depto === "Santander"
        ? "fas fa-map-marker-alt" : "fas fa-thumbtack";
      desktopHtml += '<div class="coverage-section-title"><i class="' + iconClass + '"></i>' + esc(depto) + ' <span style="opacity:0.5;font-weight:600;font-size:0.65rem;margin-left:0.3rem">(' + items.length + ')</span></div>';
      for (var j = 0; j < items.length; j++) {
        var mun = items[j];
        var munHref = baseHref + mun.slug + ".html";
        var isCurrentMun = currentSlug === mun.slug;
        desktopHtml += renderItem(munHref, mun.nombre, isCurrentMun);
      }
    }
  }

  // Mensaje "sin resultados" (oculto por defecto)
  desktopHtml += '<div class="coverage-no-results" style="display:none;padding:1.5rem 1rem;text-align:center;color:#64748b;font-size:0.85rem;">' +
    '<i class="fas fa-search" style="font-size:1.5rem;display:block;margin-bottom:0.5rem;color:#cbd5e1;"></i>' +
    'Sin resultados. <a href="' + coberturaCompletaHref + '" style="color:#0077b6;font-weight:700;">Ver cobertura completa</a>.' +
    '</div>';

  desktopHtml += '</div>'; // cierre coverage-body

  // Footer con CTA
  desktopHtml += '<div class="coverage-footer">' +
    '<a href="' + coberturaCompletaHref + '">' +
    'Ver cobertura completa <i class="fas fa-arrow-right"></i>' +
    '</a>' +
    '</div>';

  // ============ RENDER MOBILE (tablet-menu) ============
  var mobileHtml = '' +
    '<div class="coverage-search-wrap">' +
      '<div class="coverage-search">' +
        '<i class="fas fa-search"></i>' +
        '<input type="text" id="coverage-search-mobile" placeholder="Buscar municipio o país..." autocomplete="off" />' +
      '</div>' +
    '</div>';

  // Colombia
  mobileHtml += '<div class="coverage-section-title"><i class="fas fa-flag"></i>Colombia</div>';
  mobileHtml += '<a class="municipio-item' + (isCurrentCol ? " is-current" : "") + '" ' +
    'data-coverage-search="colombia casas prefabricadas" ' +
    'href="' + colHref + '"><i class="fas fa-flag municipio-icon"></i><span class="coverage-name">Casas prefabricadas en Colombia</span></a>';

  // Países
  if (paises.length) {
    mobileHtml += '<div class="coverage-section-title"><i class="fas fa-earth-americas"></i>Países</div>';
    for (var mp = 0; mp < paises.length; mp++) {
      var mpP = paises[mp];
      var mpHref = baseHref + mpP.slug + ".html";
      var mpIcon = '<i class="' + (mpP.icono || "fas fa-globe-americas") + ' municipio-icon"></i>';
      var mpCurrent = currentSlug === mpP.slug;
      mobileHtml += '<a class="municipio-item' + (mpCurrent ? " is-current" : "") + '" ' +
        'data-coverage-search="' + esc(mpP.nombre + " " + mpP.slug) + '" ' +
        'href="' + mpHref + '">' + mpIcon + '<span class="coverage-name">' + esc(mpP.nombre) + '</span></a>';
    }
  }

  // Municipios por departamento
  if (municipios.length) {
    var byDeptoM = {};
    for (var mi = 0; mi < municipios.length; mi++) {
      var mm = municipios[mi];
      var md = deptoOf(mm.slug) || "Otros";
      if (!byDeptoM[md]) byDeptoM[md] = [];
      byDeptoM[md].push(mm);
    }
    var deptoOrderM = Object.keys(byDeptoM).sort(function (a, b) {
      if (a === "Otros") return 1;
      if (b === "Otros") return -1;
      return byDeptoM[b].length - byDeptoM[a].length;
    });
    for (var mdIdx = 0; mdIdx < deptoOrderM.length; mdIdx++) {
      var mdepto = deptoOrderM[mdIdx];
      var mitems = byDeptoM[mdepto];
      var mIcon = "fas fa-map-marker-alt";
      mobileHtml += '<div class="coverage-section-title"><i class="' + mIcon + '"></i>' + esc(mdepto) + ' (' + mitems.length + ')</div>';
      for (var mj = 0; mj < mitems.length; mj++) {
        var mmun = mitems[mj];
        var mmHref = baseHref + mmun.slug + ".html";
        var mmCurrent = currentSlug === mmun.slug;
        mobileHtml += '<a class="municipio-item' + (mmCurrent ? " is-current" : "") + '" ' +
          'data-coverage-search="' + esc(mmun.nombre.toLowerCase()) + '" ' +
          'href="' + mmHref + '"><i class="fas fa-map-marker-alt municipio-icon"></i><span class="coverage-name">' + esc(mmun.nombre) + '</span></a>';
      }
    }
  }

  mobileHtml += '<div class="coverage-footer">' +
    '<a href="' + coberturaCompletaHref + '">' +
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

  // ============ LÓGICA DEL BUSCADOR ============
  function attachSearch(inputId, containerEl) {
    var input = document.getElementById(inputId);
    if (!input || !containerEl) return;
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var items = containerEl.querySelectorAll(".municipio-item");
      var visible = 0;
      items.forEach(function (it) {
        var key = (it.getAttribute("data-coverage-search") || "").toLowerCase();
        var match = q === "" || key.indexOf(q) !== -1;
        it.classList.toggle("is-hidden", !match);
        if (match) visible++;
      });
      // Mostrar/ocultar secciones según tengan items visibles
      var titles = containerEl.querySelectorAll(".coverage-section-title");
      titles.forEach(function (t) {
        // Buscar el siguiente hermano hasta el próximo title y ver si hay items visibles
        var hasVisible = false;
        var next = t.nextElementSibling;
        while (next && !next.classList.contains("coverage-section-title")) {
          if (next.classList.contains("municipio-item") && !next.classList.contains("is-hidden")) {
            hasVisible = true; break;
          }
          if (next.tagName === "UL" || next.tagName === "DIV") {
            var nested = next.querySelectorAll ? next.querySelectorAll(".municipio-item:not(.is-hidden)") : [];
            if (nested.length > 0) { hasVisible = true; break; }
          }
          next = next.nextElementSibling;
        }
        t.style.display = hasVisible ? "" : "none";
      });
      // Mensaje sin resultados
      var noResults = containerEl.querySelector(".coverage-no-results");
      if (noResults) {
        noResults.style.display = (visible === 0 && q !== "") ? "block" : "none";
      }
    });
  }
  attachSearch("coverage-search-desktop", desktopEl);
  attachSearch("coverage-search-mobile", mobileEl);

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
