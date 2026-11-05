// Agrega la excepcion data-wm-direct al interceptor de enlaces de WhatsApp.
//
// Se hace con Node porque whatsapp-modal.js usa CRLF y la comparacion
// literal del editor no encuentra el bloque.
import { readFileSync, writeFileSync } from "node:fs";

const RUTA = "assets/js/whatsapp-modal.js";
let js = readFileSync(RUTA, "utf8");
const nl = js.includes("\r\n") ? "\r\n" : "\n";

// 1) Documentacion del comportamiento.
const DOC_OLD = `  // Si tiene data-wm-msg, ese texto se antepone al mensaje final para que el
  // asesor sepa QUE pidio el cliente (videollamada, terrenos, etc.), que es
  // informacion que se perdia al pasar por el modal.`;
const DOC_NEW = `  // Si tiene data-wm-msg, ese texto se antepone al mensaje final para que el
  // asesor sepa QUE pidio el cliente (videollamada, terrenos, etc.), que es
  // informacion que se perdia al pasar por el modal.
  //
  // EXCEPCION: data-wm-direct="1" -> el enlace NO se intercepta y abre
  // WhatsApp de una vez con el mensaje que ya trae en su href. Se usa en los
  // botones que ya traen el resumen listo (el cotizador de plaqueta, por
  // ejemplo): preguntar de nuevo si tiene lote o que quiere seria redundante
  // porque el usuario ya escribio su pedido y el resumen ya va en el mensaje.`;

if (!js.includes(DOC_OLD)) {
  console.error("No se encontro el bloque de documentacion.");
  process.exit(1);
}
js = js.replace(DOC_OLD, DOC_NEW);

// 2) La condicion real: no enlazar los directos.
const CODE_OLD = `      if (a.__wmBound) return;
      a.__wmBound = true;
      a.addEventListener('click', function (e) {`;
const CODE_NEW = `      if (a.__wmBound) return;
      a.__wmBound = true;
      // Enlace directo: se deja que el navegador lo abra tal cual, con el
      // mensaje que ya trae en el href.
      if (a.getAttribute('data-wm-direct') === '1') return;
      a.addEventListener('click', function (e) {`;

if (!js.includes(CODE_OLD)) {
  console.error("No se encontro el bloque de codigo del interceptor.");
  process.exit(1);
}
js = js.replace(CODE_OLD, CODE_NEW);

writeFileSync(RUTA, js, "utf8");
console.log("Interceptor actualizado: data-wm-direct=1 abre WhatsApp sin pasar por el modal.");
