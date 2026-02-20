function renderNavMunicipios() {
  var list = window.MUNICIPIOS;
  if (!list || !list.length) return;

  var baseHref = "/pages/";
  var icon = '<i class="fas fa-map-marker-alt municipio-icon"></i>';

  var currentSlug = null;
  var pathname = typeof window.location !== "undefined" && window.location.pathname || "";
  var match = pathname.match(/\/pages\/([a-z0-9-]+)\.html$/i);
  if (match) currentSlug = match[1];

  function esc(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  var desktopHtml = "";
  var mobileHtml = "";
  for (var i = 0; i < list.length; i++) {
    var m = list[i];
    var href = baseHref + m.slug + ".html";
    var nombre = esc(m.nombre);
    var isCurrent = currentSlug === m.slug;
    var desktopCls = "municipio-item block px-4 py-2 hover:bg-light " + (isCurrent ? "text-primary font-bold" : "hover:text-primary");
    var mobileCls = "municipio-item block py-2.5 px-8 text-sm " + (isCurrent ? "text-gray-700 hover:text-primary hover:bg-white transition font-bold text-primary" : "text-gray-700 hover:text-primary hover:bg-white transition");
    desktopHtml += "<li><a class=\"" + desktopCls + "\" href=\"" + esc(href) + "\">" + icon + nombre + "</a></li>";
    mobileHtml += "<a class=\"" + mobileCls + "\" href=\"" + esc(href) + "\">" + icon + nombre + "</a>";
  }

  var desktopEl = document.getElementById("nav-municipios-desktop");
  var mobileEl = document.getElementById("tablet-dropdown-menu");
  var footerEl = document.getElementById("nav-municipios-footer");
  if (desktopEl) desktopEl.innerHTML = desktopHtml;
  if (mobileEl) mobileEl.innerHTML = mobileHtml;
  if (footerEl) {
    var footerHtml = "";
    for (var j = 0; j < list.length; j++) {
      var f = list[j];
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
