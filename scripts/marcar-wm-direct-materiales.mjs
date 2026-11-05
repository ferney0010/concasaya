// Marca con data-wm-direct="1" los enlaces de WhatsApp que YA llevan su
// mensaje armado, para que abran WhatsApp de una vez sin pasar por el modal
// de intencion.
//
// Logica: si el href ya trae el parametro ?text=..., el mensaje esta listo
// y el modal solo haria volver a preguntar lo que el usuario ya dijo.
import { readFileSync, writeFileSync } from "node:fs";

const RUTA = "materiales.html";
let html = readFileSync(RUTA, "utf8");

// Patron de un <a ...> con href a wa.me que ya trae ?text=
const RE = /<a\s([^>]*?)href="(https:\/\/wa\.me\/[^"]*\?text=[^"]*)"([^>]*?)>/g;

let n = 0;
html = html.replace(RE, function (todo, antes, href, despues) {
  // Si ya tiene el atributo, no se toca.
  if (/data-wm-direct/.test(antes + despues)) return todo;
  n++;
  return `<a ${antes}href="${href}"${despues} data-wm-direct="1">`;
});

// El boton del cotizador: su href se reescribe por JS, pero el atributo
// tiene que estar en el HTML (el interceptor corre al cargar la pagina).
const SIN_ATRIB = /<a href="https:\/\/wa\.me\/573142891018" class="pq-wa-btn" id="pq-wa" target="_blank" rel="noopener"(?!\s+data-wm-direct)/;
if (SIN_ATRIB.test(html)) {
  html = html.replace(
    SIN_ATRIB,
    '<a href="https://wa.me/573142891018" class="pq-wa-btn" id="pq-wa" target="_blank" rel="noopener" data-wm-direct="1"'
  );
  n++;
}

writeFileSync(RUTA, html, "utf8");
console.log(`Enlaces marcados como directos: ${n}`);
