// Inserta el script del cotizador en materiales.html.
//
// Se hace con Node y no con el editor porque el archivo tiene saltos de
// linea LF y espacios finales que hacen fallar la comparacion literal.
import { readFileSync, writeFileSync } from "node:fs";

const RUTA = "materiales.html";
let html = readFileSync(RUTA, "utf8");

if (html.includes("/assets/js/plaqueta-cotizador.js")) {
  console.log("El script ya estaba: no se toca.");
  process.exit(0);
}

const ANCLA =
  '    <script src="/assets/js/whatsapp-modal.js"></script>\n';
const i = html.indexOf(ANCLA);
if (i === -1) {
  console.error("No se encontro el ancla del script de whatsapp-modal.js");
  process.exit(1);
}

const INSERCION =
  ANCLA +
  '\n' +
  '    <!-- Cotizador de plaqueta de concreto (seccion #cotizador de esta pagina) -->\n' +
  '    <script src="/assets/js/plaqueta-cotizador.js"></script>\n';

html = html.slice(0, i) + INSERCION + html.slice(i + ANCLA.length);
writeFileSync(RUTA, html, "utf8");
console.log("Script del cotizador insertado.");
