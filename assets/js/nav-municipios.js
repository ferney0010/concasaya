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
    return '<li class="col-span-full px-4 pt-3 pb-1 text-xs font-bold uppercase tracking-wide text-gray-500">' +
      '<i class="' + iconClass + ' mr-2 text-primary"></i>' + esc(label) + '</li>';
  }

  function renderMobileSectionHeader(label, iconClass) {
    return '<div class="col-span-2 px-8 pt-3 pb-1 text-xs font-bold uppercase tracking-wide text-gray-500">' +
      '<i class="' + iconClass + ' mr-2 text-primary"></i>' + esc(label) + '</div>';
  }

  var desktopHtml = "";
  var mobileHtml = "";

  if (paises.length) {
    desktopHtml += renderSectionHeader("Países", "fas fa-earth-americas");
    mobileHtml += renderMobileSectionHeader("Países", "fas fa-earth-americas");
    for (var p = 0; p < paises.length; p++) {
      var pais = paises[p];
      var paisHref = baseHref + pais.slug + ".html";
      var paisNombre = esc(pais.nombre);
      var paisIcon = '<i class="' + esc(pais.icono || "fas fa-globe-americas") + ' municipio-icon"></i>';
      var isCurrentPais = currentSlug === pais.slug;
      var paisDesktopCls = "municipio-item block px-4 py-2 hover:bg-light " + (isCurrentPais ? "text-primary font-bold" : "hover:text-primary");
      var paisMobileCls = "municipio-item block py-2.5 px-8 text-sm " + (isCurrentPais ? "text-gray-700 hover:text-primary hover:bg-white transition font-bold text-primary" : "text-gray-700 hover:text-primary hover:bg-white transition");
      desktopHtml += "<li><a class=\"" + paisDesktopCls + "\" href=\"" + esc(paisHref) + "\">" + paisIcon + paisNombre + "</a></li>";
      mobileHtml += "<a class=\"" + paisMobileCls + "\" href=\"" + esc(paisHref) + "\">" + paisIcon + paisNombre + "</a>";
    }
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
      desktopHtml += "<li><a class=\"" + desktopCls + "\" href=\"" + esc(href) + "\">" + municipioIcon + nombre + "</a></li>";
      mobileHtml += "<a class=\"" + mobileCls + "\" href=\"" + esc(href) + "\">" + municipioIcon + nombre + "</a>";
    }
  }

  var desktopEl = document.getElementById("nav-municipios-desktop");
  var mobileEl = document.getElementById("tablet-dropdown-menu");
  var footerEl = document.getElementById("nav-municipios-footer");
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
