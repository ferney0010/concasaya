// assets/js/parallax-cta.js
// Parallax de fondo para los bloques CTA del index, con GSAP ScrollTrigger.
// La capa .pg-layer es 18% mas alta que la seccion (scale 1.18) y se desplaza
// mas lento que el scroll, que es lo que produce la sensacion de profundidad.
(function () {
  "use strict";

  function iniciarParallax() {
    var capas = document.querySelectorAll(".pg-layer");

    if (!capas.length) return;

    // Si GSAP no esta disponible (CDN bloqueado), el fondo queda estatico:
    // el CSS .pg-layer ya lo centra y escala, asi que no se ve roto.
    if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") {
      return;
    }

    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    // Respeta la preferencia del sistema de reducir movimiento.
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    Array.prototype.forEach.call(capas, function (capa) {
      gsap.fromTo(
        capa,
        { yPercent: -9 },
        {
          yPercent: 9,
          ease: "none",
          scrollTrigger: {
            trigger: capa.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    // El alto de las secciones cambia con el responsive; recalcular al redimensionar.
    varRecalcular();
  }

  var temporizador = null;
  function varRecalcular() {
    window.clearTimeout(temporizador);
    temporizador = window.setTimeout(function () {
      if (typeof window.ScrollTrigger !== "undefined") window.ScrollTrigger.refresh();
    }, 250);
  }

  window.addEventListener("resize", varRecalcular, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarParallax);
  } else {
    iniciarParallax();
  }
})();
