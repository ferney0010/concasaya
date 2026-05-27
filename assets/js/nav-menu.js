(function () {
  "use strict";

  function resetMenuIcon(menuIcon) {
    if (!menuIcon) return;
    menuIcon.classList.remove("fa-times", "open");
    menuIcon.classList.add("fa-bars");
  }

  function setMenuIconOpen(menuIcon) {
    if (!menuIcon) return;
    menuIcon.classList.remove("fa-bars");
    menuIcon.classList.add("fa-times", "open");
  }

  function getMenuIcon(menuBtn) {
    return (
      document.getElementById("menu-icon") ||
      (menuBtn ? menuBtn.querySelector("i") : null)
    );
  }

  function closeTabletMenu(tabletMenu, menuIcon) {
    if (!tabletMenu) return;
    tabletMenu.classList.remove("open");
    resetMenuIcon(menuIcon);
  }

  function initNavMenu() {
    var menuBtn = document.getElementById("menu-btn");
    var tabletMenu = document.getElementById("tablet-menu");
    var mobileMenu = document.getElementById("mobile-menu");
    var menuIcon = getMenuIcon(menuBtn);

    if (menuBtn && menuBtn.dataset.navMenuBound !== "1") {
      if (tabletMenu) {
        menuBtn.dataset.navMenuBound = "1";
        menuBtn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          var isOpen = tabletMenu.classList.contains("open");
          tabletMenu.classList.toggle("open");
          if (isOpen) {
            resetMenuIcon(menuIcon);
          } else {
            setMenuIconOpen(menuIcon);
          }
        });
      } else if (mobileMenu) {
        menuBtn.dataset.navMenuBound = "1";
        menuBtn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          mobileMenu.classList.toggle("hidden");
        });
      }
    }

    function bindTabletDropdown(btnId, menuId, iconId) {
      var btn = document.getElementById(btnId);
      var menu = document.getElementById(menuId);
      var icon = document.getElementById(iconId);
      if (!btn || !menu || btn.dataset.navMenuBound === "1") return;
      btn.dataset.navMenuBound = "1";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var isOpen = menu.classList.contains("open");
        menu.classList.toggle("open");
        if (icon) {
          icon.classList.toggle("open", !isOpen);
        }
      });
    }

    bindTabletDropdown(
      "tablet-dropdown-btn",
      "tablet-dropdown-menu",
      "tablet-dropdown-icon"
    );
    bindTabletDropdown(
      "tablet-empresa-dropdown-btn",
      "tablet-empresa-dropdown-menu",
      "tablet-empresa-dropdown-icon"
    );

    if (tabletMenu && menuBtn && !document.documentElement.dataset.navMenuOutsideBound) {
      document.documentElement.dataset.navMenuOutsideBound = "1";
      document.addEventListener("click", function (e) {
        if (!tabletMenu.classList.contains("open")) return;
        if (!tabletMenu.contains(e.target) && !menuBtn.contains(e.target)) {
          closeTabletMenu(tabletMenu, menuIcon);
        }
      });
    }

    if (tabletMenu && !document.documentElement.dataset.navMenuScrollBound) {
      document.documentElement.dataset.navMenuScrollBound = "1";
      var lastScroll = 0;
      window.addEventListener("scroll", function () {
        var currentScroll = window.pageYOffset;
        if (tabletMenu.classList.contains("open")) {
          if (Math.abs(currentScroll - lastScroll) > 50) {
            closeTabletMenu(tabletMenu, menuIcon);
          }
        }
        lastScroll = currentScroll;
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavMenu);
  } else {
    initNavMenu();
  }
})();
