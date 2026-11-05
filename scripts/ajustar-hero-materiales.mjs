// Aplica al hero de materiales.html el patron visual del hero de
// modelos.html: velo CLARO que se abre de izquierda a derecha (texto oscuro
// sobre la mitad izquierda) y la foto a color pleno en la mitad derecha.
//
// Se hace con Node porque el bloque tiene CRLF y espacios finales que hacen
// fallar la comparacion literal del editor.
import { readFileSync, writeFileSync } from "node:fs";

const RUTA = "materiales.html";
let html = readFileSync(RUTA, "utf8");

const MARCA_INICIO = "  /* --- Escritorio: dos columnas reales.";
const MARCA_FIN = "  /* --- Móvil: APROBADO.";

const i = html.indexOf(MARCA_INICIO);
const j = html.indexOf(MARCA_FIN);
if (i === -1 || j === -1 || j < i) {
  console.error("No se localizó el bloque del hero de escritorio.");
  process.exit(1);
}
const usaCRLF = html.slice(i, j).includes("\r\n");
const nl = usaCRLF ? "\r\n" : "\n";

const NUEVO = `  /* --- Escritorio: dos columnas, con el patron visual de modelos.html.
         ---
         2026-11-05 (Ferney): el hero toma el mismo lenguaje que el de
         modelos.html: la foto ocupa la mitad derecha a color pleno y un
         velo CLARO se abre de izquierda a derecha sobre la mitad
         izquierda, donde va el texto en oscuro. El velo llega hasta la
         mitad del hero y ahi se apaga, asi que la foto nunca se ve
         apagada. El texto va centrado dentro de su mitad para aprovechar
         el espacio. */
  @media (min-width: 768px) {
    .hero-mat {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: stretch;
      min-height: 620px;
      padding: 0;
      background-color: #0d1b2a;
      background-image: none;
    }

    /* --- Mitad derecha: la foto a color pleno, sin veladura ni blur --- */
    .hero-mat__photo {
      display: block;
      order: 2;
      background-image: url('/assets/images/hero-nuevo/hero-materiales-pc.webp');
      background-size: cover;
      background-position: center 62%;
      background-repeat: no-repeat;
      position: relative;
      z-index: 1;
    }

    /* --- Mitad izquierda: velo claro que acompaña hasta la mitad --- */
    .hero-mat__inner {
      order: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 104px 48px;
      position: relative;
      z-index: 2;
      background: linear-gradient(90deg,
        rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.90) 40%,
        rgba(255, 255, 255, 0.78) 62%, rgba(255, 255, 255, 0.52) 84%,
        rgba(255, 255, 255, 0.30) 100%);
    }
    /* Se apoya contra el borde de la foto: una sombra suave para que el
       corte entre las dos mitades no se vea duro. */
    .hero-mat__inner::after {
      content: "";
      position: absolute;
      top: 0;
      right: -56px;
      bottom: 0;
      width: 112px;
      background: linear-gradient(90deg, rgba(13, 27, 42, 0.16) 0%, rgba(13, 27, 42, 0) 100%);
      pointer-events: none;
    }

    /* --- Texto en oscuro: es el fondo claro, no el oscuro --- */
    .mat-title {
      font-size: 2.85rem;
      color: #0d1b2a;
      text-shadow: none;
    }
    .mat-lead {
      font-size: 1.05rem;
      color: #41525f;
      text-shadow: none;
    }
    .mat-perk {
      color: #334155;
      text-shadow: none;
    }
    .mat-perk__ico {
      background: rgba(255, 255, 255, 0.9);
      border-color: rgba(13, 27, 42, 0.14);
      color: #2e7d32;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    .mat-badge {
      background: rgba(232, 245, 233, 0.94);
      border-color: rgba(46, 125, 50, 0.18);
      color: #2e7d32;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    .mat-note {
      color: #52606d;
      text-shadow: none;
    }
    .mat-btn--ghost {
      border-color: #0077b6;
      color: #0077b6;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    .mat-btn--ghost:hover { background: #0077b6; color: #ffffff; }

    /* --- Texto centrado dentro de su mitad --- */
    .hero-mat__inner .container { max-width: none; padding: 0; width: 100%; }
    .hero-mat__text {
      max-width: 540px;
      margin: 0 auto;
      text-align: center;
    }
    .mat-perks { justify-content: center; gap: 1rem 1.5rem; margin-top: 1.9rem; }
    .mat-ctas { justify-content: center; }
    .mat-badge { margin: 0 auto; }
    .mat-note { text-align: center; }
  }

`;

html =
  html.slice(0, i) +
  NUEVO.split("\n").join(nl) +
  html.slice(j);

// El enlace del hero cambia de color: el fondo ahora es claro.
html = html.replace(
  /style="color: #86f08f; font-weight: 700; text-decoration: underline;"/g,
  'style="color: #0077b6; font-weight: 700; text-decoration: underline;"'
);

writeFileSync(RUTA, html, "utf8");
console.log(`Hero de materiales actualizado con el patron de modelos.html (saltos: ${usaCRLF ? "CRLF" : "LF"}).`);
