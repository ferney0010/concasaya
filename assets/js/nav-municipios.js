function renderNavMunicipios() {
  var municipios = window.MUNICIPIOS || [];
  var paises = window.PAISES || [];
  if (!municipios.length && !paises.length) return;

  var baseHref = "/pages/";
  var municipioIcon = '<i class="fas fa-map-marker-alt municipio-icon"></i>';

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
      "#nav-municipios-desktop{left:auto!important;right:0!important;top:100%;width:min(92vw,760px);min-width:min(92vw,760px)!important;max-height:min(72vh,calc(100vh - 86px));overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:.25rem .35rem!important;padding:.5rem!important;z-index:60;}",
      "#nav-municipios-desktop .coverage-section-title,#nav-municipios-desktop .coverage-countries-wrap{grid-column:1/-1!important;}",
      "#nav-municipios-desktop .coverage-countries-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.25rem .35rem;margin:0 0 .35rem 0;padding:0;list-style:none;}",
      "#nav-municipios-desktop .coverage-countries-grid .municipio-item{height:100%;justify-content:flex-start;}",
      "#nav-municipios-desktop .coverage-section-title{font-size:10px;line-height:1.1;letter-spacing:.08em;padding:.55rem .5rem .2rem!important;}",
      "#nav-municipios-desktop .municipio-item{font-size:clamp(10px,.72vw,12px);line-height:1.22;gap:.35rem;padding:.45rem .5rem!important;margin:.08rem .12rem!important;min-width:0;white-space:normal;overflow-wrap:anywhere;word-break:normal;align-items:flex-start;}",
      "#nav-municipios-desktop .municipio-icon{width:14px;min-width:14px;font-size:.72rem;margin-top:.1rem;}",
      "#nav-municipios-desktop .coverage-name{display:block;min-width:0;max-width:100%;}",
      "#tablet-menu.open{max-height:calc(100vh - 64px)!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch;}",
      "#tablet-dropdown-menu .coverage-section-title{font-size:10px;line-height:1.1;letter-spacing:.08em;padding:.55rem 1rem .25rem!important;}",
      "#tablet-dropdown-menu .municipio-item{font-size:clamp(11px,3.2vw,13px);line-height:1.25;gap:.45rem;padding:.6rem .85rem!important;min-width:0;white-space:normal;overflow-wrap:anywhere;align-items:flex-start;}",
      "#tablet-dropdown-menu .municipio-icon{width:14px;min-width:14px;font-size:.75rem;margin-top:.1rem;}",
      "#tablet-dropdown-menu .coverage-name{display:block;min-width:0;max-width:100%;}",
      "#tablet-dropdown-menu.open{max-height:min(58vh,520px)!important;overflow-y:auto!important;}",
      "@media (max-width:1180px){#nav-municipios-desktop{width:min(92vw,620px);grid-template-columns:repeat(2,minmax(0,1fr))!important;}#nav-municipios-desktop .coverage-countries-grid{grid-template-columns:repeat(5,minmax(0,1fr));}}",
      "@media (min-width:1400px){#nav-municipios-desktop{width:min(84vw,820px);}}",
      "@media (max-width:1023px){#nav-municipios-desktop{display:none!important;}}",
      "@media (max-width:640px){#tablet-dropdown-menu{grid-template-columns:repeat(2,minmax(0,1fr))!important;}#tablet-dropdown-menu .municipio-item{font-size:11px;padding:.52rem .7rem!important;gap:.35rem;}#tablet-dropdown-menu .coverage-section-title{grid-column:1/-1;}#tablet-dropdown-menu.open{max-height:56vh!important;}}",
      "@media (max-width:420px){#tablet-dropdown-menu{grid-template-columns:1fr!important;}#tablet-dropdown-menu .coverage-section-title{grid-column:1!important;}}"
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

    var mobileEl = document.getElementById("tablet-dropdown-menu");
    if (mobileEl && mobileEl.previousElementSibling && mobileEl.previousElementSibling.tagName === "SPAN") {
      mobileEl.previousElementSibling.textContent = "Cobertura";
    }
  }

  function renderSectionHeader(label, iconClass) {
    return '<li class="coverage-section-title col-span-full px-4 pt-3 pb-1 text-xs font-bold uppercase tracking-wide text-gray-500">' +
      '<i class="' + iconClass + ' mr-2 text-primary"></i>' + esc(label) + '</li>';
  }

  function renderMobileSectionHeader(label, iconClass) {
    return '<div class="coverage-section-title col-span-2 px-8 pt-3 pb-1 text-xs font-bold uppercase tracking-wide text-gray-500">' +
      '<i class="' + iconClass + ' mr-2 text-primary"></i>' + esc(label) + '</div>';
  }

  var desktopHtml = "";
  var mobileHtml = "";

  if (paises.length) {
    desktopHtml += renderSectionHeader("Países", "fas fa-earth-americas");
    mobileHtml += renderMobileSectionHeader("Países", "fas fa-earth-americas");
    desktopHtml += '<li class="coverage-countries-wrap col-span-full"><ul class="coverage-countries-grid">';
    for (var p = 0; p < paises.length; p++) {
      var pais = paises[p];
      var paisHref = baseHref + pais.slug + ".html";
      var paisNombre = esc(pais.nombre);
      var paisIcon = '<i class="' + esc(pais.icono || "fas fa-globe-americas") + ' municipio-icon"></i>';
      var isCurrentPais = currentSlug === pais.slug;
      var paisDesktopCls = "municipio-item block px-4 py-2 hover:bg-light " + (isCurrentPais ? "text-primary font-bold" : "hover:text-primary");
      var paisMobileCls = "municipio-item block py-2.5 px-8 text-sm " + (isCurrentPais ? "text-gray-700 hover:text-primary hover:bg-white transition font-bold text-primary" : "text-gray-700 hover:text-primary hover:bg-white transition");
      desktopHtml += "<li><a class=\"" + paisDesktopCls + "\" href=\"" + esc(paisHref) + "\">" + paisIcon + "<span class=\"coverage-name\">" + paisNombre + "</span></a></li>";
      mobileHtml += "<a class=\"" + paisMobileCls + "\" href=\"" + esc(paisHref) + "\">" + paisIcon + "<span class=\"coverage-name\">" + paisNombre + "</span></a>";
    }
    desktopHtml += "</ul></li>";
  }

  if (municipios.length) {
    desktopHtml += renderSectionHeader("Municipios", "fas fa-map-marker-alt");
    mobileHtml += renderMobileSectionHeader("Municipios", "fas fa-map-marker-alt");
    for (var i = 0; i < municipios.length; i++) {
      var m = municipios[i];
      var href = baseHref + m.slug + ".html";
      var nombre = esc(m.nombre);
      var isCurrent = currentSlug === m.slug;
      var desktopCls = "municipio-item block px-4 py-2 hover:bg-light " + (isCurrent ? "text-primary font-bold" : "hover:text-primary");
      var mobileCls = "municipio-item block py-2.5 px-8 text-sm " + (isCurrent ? "text-gray-700 hover:text-primary hover:bg-white transition font-bold text-primary" : "text-gray-700 hover:text-primary hover:bg-white transition");
      desktopHtml += "<li><a class=\"" + desktopCls + "\" href=\"" + esc(href) + "\">" + municipioIcon + "<span class=\"coverage-name\">" + nombre + "</span></a></li>";
      mobileHtml += "<a class=\"" + mobileCls + "\" href=\"" + esc(href) + "\">" + municipioIcon + "<span class=\"coverage-name\">" + nombre + "</span></a>";
    }
  }

  var desktopEl = document.getElementById("nav-municipios-desktop");
  var mobileEl = document.getElementById("tablet-dropdown-menu");
  var footerEl = document.getElementById("nav-municipios-footer");
  injectCoverageStyles();
  if (desktopEl) desktopEl.innerHTML = desktopHtml;
  if (mobileEl) mobileEl.innerHTML = mobileHtml;
  updateCoverageLabels();
  if (footerEl) {
    var footerHtml = "";
    for (var c = 0; c < paises.length; c++) {
      var country = paises[c];
      var cHref = baseHref + country.slug + ".html";
      var cNombre = esc(country.nombre);
      footerHtml += "<li><a href=\"" + esc(cHref) + "\" class=\"hover:text-primary\">Casas prefabricadas para colombianos en " + cNombre + "</a></li>";
    }
    for (var j = 0; j < municipios.length; j++) {
      var f = municipios[j];
      var fHref = baseHref + f.slug + ".html";
      var fNombre = esc(f.nombre);
      footerHtml += "<li><a href=\"" + esc(fHref) + "\" class=\"hover:text-primary\">Casas Prefabricadas en " + fNombre + "</a></li>";
    }
    footerEl.innerHTML = footerHtml;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderNavMunicipios);
} else {
  renderNavMunicipios();
}
