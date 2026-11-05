// ===========================================================================
// Cross-linking del blog: agrega la caja "sigue leyendo" a los articulos
// que hoy prometen una lista pero no la entregan, y la caja "cluster" a los
// que no tienen ninguna.
//
// Es idempotente: si el articulo ya tiene la caja, no se toca.
//
// Uso:
//   node scripts/agregar-crosslinks.mjs           (dry-run, solo informa)
//   node scripts/agregar-crosslinks.mjs --apply   (escribe los archivos)
// ===========================================================================
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BLOG = join(ROOT, "blog");
const APPLY = process.argv.includes("--apply");

// ---------------------------------------------------------------------------
// MAPA DE CLUSTERS
// ---------------------------------------------------------------------------
// Cada cluster es un grupo de articulos que responden preguntas del mismo
// tipo. Un articulo puede pertenecer a varios: el que se elige para la caja
// es el que se lista primero en el array.
//
// Los textos salen de las descripciones que el cliente ya aprobo en
// blog/static-posts-config.js. No se inventan datos.

const ARTICULOS = {
  "precio-casa-prefabricada-colombia-2026": {
    titulo: "Precios de casas prefabricadas en Colombia 2026",
    nota: "La tabla nacional por m² para comparar",
    icono: "fa-tag",
  },
  "precio-casa-prefabricada-villa-de-leyva": {
    titulo: "Precio de casa prefabricada en Villa de Leyva",
    nota: "Los 5 modelos con su precio real",
    icono: "fa-tag",
  },
  "casas-prefabricadas-economicas-colombia": {
    titulo: "Casas prefabricadas económicas en Colombia",
    nota: "Rangos honestos desde $25M",
    icono: "fa-dollar-sign",
  },
  "casas-prefabricadas-llave-en-mano-colombia": {
    titulo: "Llave en mano: qué incluye",
    nota: "La diferencia entre kit y entrega habitable",
    icono: "fa-key",
  },
  "casas-modulares-colombia": {
    titulo: "Casas modulares en Colombia",
    nota: "Precios por m² y qué incluye",
    icono: "fa-cube",
  },
  "casas-modulares-cundinamarca": {
    titulo: "Casas modulares en Cundinamarca",
    nota: "Precios por m² y municipios",
    icono: "fa-cube",
  },
  "casa-prefabricada-para-finca-colombia": {
    titulo: "Casa para finca: 5 cosas clave",
    nota: "Precios y logística rural",
    icono: "fa-tractor",
  },
  "casas-prefabricadas-boyaca": {
    titulo: "Casas prefabricadas en Boyacá",
    nota: "Precios por municipio y plazos",
    icono: "fa-mountain",
  },
  "licencia-construccion-casas-prefabricadas-colombia": {
    titulo: "Licencia de construcción",
    nota: "El trámite antes de la primera excavación",
    icono: "fa-file-signature",
  },
  "consecuencias-no-radicar-licencia-construccion-colombia": {
    titulo: "No radicar la licencia: las 7 consecuencias",
    nota: "Lo que te va a tocar si no la radicas",
    icono: "fa-triangle-exclamation",
  },
  "multa-construir-sin-licencia-colombia": {
    titulo: "¿Me pueden multar por construir sin licencia?",
    nota: "Sanciones, montos y cómo legalizar",
    icono: "fa-gavel",
  },
  "permisos-adicionales-casas-prefabricadas-colombia": {
    titulo: "Permisos adicionales",
    nota: "Agua, luz, gas y normas urbanísticas",
    icono: "fa-tint",
  },
  "construir-respaldo-legal-casa-prefabricada-concasaya": {
    titulo: "Construir con respaldo legal",
    nota: "Por qué el orden de los pasos importa",
    icono: "fa-shield-alt",
  },
  "pozos-septicos-colombia-legalidad-requisitos": {
    titulo: "Pozos sépticos en Colombia",
    nota: "NSR-10 y Resolución 0631 de 2015",
    icono: "fa-water",
  },
  "errores-comprar-casa-prefabricada-colombia": {
    titulo: "7 errores al comprar",
    nota: "Los que más plata hacen perder",
    icono: "fa-triangle-exclamation",
  },
  "plazo-construccion-casa-prefabricada-colombia": {
    titulo: "Cuánto tarda una casa prefabricada",
    nota: "El plazo real, fase por fase",
    icono: "fa-clock",
  },
  "plaqueta-concreto-vs-bloquelon": {
    titulo: "¿Plaqueta de concreto o bloquelón?",
    nota: "La comparativa de sistemas de muro",
    icono: "fa-layer-group",
  },
  "construccion-panel-eps-vs-bloquelon": {
    titulo: "¿Panel EPS o bloquelón?",
    nota: "La otra comparativa de sistemas",
    icono: "fa-layer-group",
  },
  "construccion-prefabricada-vs-tradicional": {
    titulo: "Prefabricada vs tradicional",
    nota: "Comparativa de costos y tiempos",
    icono: "fa-hammer",
  },
  "ventajas-construccion-prefabricada-2026": {
    titulo: "Ventajas de construir prefabricado",
    nota: "La guía 2026 del material prefabricado",
    icono: "fa-star",
  },
  "guia-casas-prefabricadas-colombia-concasaya": {
    titulo: "Casas prefabricadas en Colombia: guía completa",
    nota: "Municipios, clima, precios y proceso",
    icono: "fa-map",
  },
  "casas-prefabricadas-en-colombia": {
    titulo: "Casas prefabricadas en Colombia 2026",
    nota: "La guía completa del mercado",
    icono: "fa-map",
  },
  "casas-prefabricadas-en-bogota-guia-constructora": {
    titulo: "Casas prefabricadas en Bogotá",
    nota: "93 reseñas y 7 criterios para elegir",
    icono: "fa-building",
  },
  "comprar-casa-prefabricada-colombia-2026": {
    titulo: "Comprar casa prefabricada en Colombia",
    nota: "La guía completa de compra",
    icono: "fa-cart-shopping",
  },
  "venta-casas-prefabricadas-cundinamarca": {
    titulo: "Venta de casas prefabricadas en Cundinamarca",
    nota: "La guía de la zona",
    icono: "fa-house",
  },
  "casas-prefabricadas-desde-suba-construir-cundinamarca": {
    titulo: "Casas prefabricadas desde Suba",
    nota: "Cotiza en Bogotá, construye en Cundinamarca",
    icono: "fa-city",
  },
  "casas-prefabricadas-norte-bogota-construir-cundinamarca": {
    titulo: "Casas prefabricadas desde el norte de Bogotá",
    nota: "Cotiza en la ciudad, construye afuera",
    icono: "fa-city",
  },
  "construccion-prefabricada-cundinamarca-guia-concasaya": {
    titulo: "Construcción prefabricada en Cundinamarca",
    nota: "La guía de zona con precios por municipio",
    icono: "fa-city",
  },
  "ventajas-prefabricados-clima-calido-santa-marta": {
    titulo: "Casas prefabricadas en clima cálido",
    nota: "Santa Marta y la Costa Caribe",
    icono: "fa-sun",
  },
  "comprar-casa-prefabricada-colombia-desde-el-exterior": {
    titulo: "Comprar desde el exterior",
    nota: "El proceso paso a paso",
    icono: "fa-globe-americas",
  },
  "comprar-casa-prefabricada-colombia-desde-estados-unidos-canada": {
    titulo: "Comprar desde EE. UU. y Canadá",
    nota: "El proceso para colombianos en Norteamérica",
    icono: "fa-globe-americas",
  },
  "comprar-casa-prefabricada-colombia-desde-europa": {
    titulo: "Comprar desde Europa",
    nota: "El proceso para colombianos en Europa",
    icono: "fa-globe-americas",
  },
};

// Cluster principal por articulo (el primero de la lista gana).
const CLUSTER = {
  "precio-casa-prefabricada-colombia-2026": [
    "precio-casa-prefabricada-villa-de-leyva",
    "casas-prefabricadas-economicas-colombia",
    "casas-prefabricadas-llave-en-mano-colombia",
    "casas-modulares-colombia",
  ],
  "precio-casa-prefabricada-villa-de-leyva": [
    "precio-casa-prefabricada-colombia-2026",
    "casas-prefabricadas-boyaca",
    "casas-prefabricadas-economicas-colombia",
  ],
  "casas-prefabricadas-economicas-colombia": [
    "precio-casa-prefabricada-colombia-2026",
    "casas-prefabricadas-llave-en-mano-colombia",
    "errores-comprar-casa-prefabricada-colombia",
  ],
  "casas-prefabricadas-llave-en-mano-colombia": [
    "precio-casa-prefabricada-colombia-2026",
    "plazo-construccion-casa-prefabricada-colombia",
    "casas-prefabricadas-economicas-colombia",
  ],
  "casas-modulares-colombia": [
    "precio-casa-prefabricada-colombia-2026",
    "casas-modulares-cundinamarca",
    "casas-prefabricadas-llave-en-mano-colombia",
  ],
  "casas-modulares-cundinamarca": [
    "casas-modulares-colombia",
    "venta-casas-prefabricadas-cundinamarca",
    "construccion-prefabricada-cundinamarca-guia-concasaya",
  ],
  "casa-prefabricada-para-finca-colombia": [
    "casas-prefabricadas-economicas-colombia",
    "licencia-construccion-casas-prefabricadas-colombia",
    "casas-prefabricadas-boyaca",
  ],
  "casas-prefabricadas-boyaca": [
    "precio-casa-prefabricada-villa-de-leyva",
    "precio-casa-prefabricada-colombia-2026",
    "casas-prefabricadas-economicas-colombia",
  ],
  "licencia-construccion-casas-prefabricadas-colombia": [
    "consecuencias-no-radicar-licencia-construccion-colombia",
    "multa-construir-sin-licencia-colombia",
    "permisos-adicionales-casas-prefabricadas-colombia",
  ],
  "consecuencias-no-radicar-licencia-construccion-colombia": [
    "multa-construir-sin-licencia-colombia",
    "licencia-construccion-casas-prefabricadas-colombia",
    "permisos-adicionales-casas-prefabricadas-colombia",
  ],
  "multa-construir-sin-licencia-colombia": [
    "consecuencias-no-radicar-licencia-construccion-colombia",
    "licencia-construccion-casas-prefabricadas-colombia",
    "construir-respaldo-legal-casa-prefabricada-concasaya",
  ],
  "permisos-adicionales-casas-prefabricadas-colombia": [
    "licencia-construccion-casas-prefabricadas-colombia",
    "pozos-septicos-colombia-legalidad-requisitos",
    "consecuencias-no-radicar-licencia-construccion-colombia",
  ],
  "construir-respaldo-legal-casa-prefabricada-concasaya": [
    "licencia-construccion-casas-prefabricadas-colombia",
    "errores-comprar-casa-prefabricada-colombia",
    "multa-construir-sin-licencia-colombia",
  ],
  "pozos-septicos-colombia-legalidad-requisitos": [
    "permisos-adicionales-casas-prefabricadas-colombia",
    "licencia-construccion-casas-prefabricadas-colombia",
    "casa-prefabricada-para-finca-colombia",
  ],
  "errores-comprar-casa-prefabricada-colombia": [
    "licencia-construccion-casas-prefabricadas-colombia",
    "multa-construir-sin-licencia-colombia",
    "casas-prefabricadas-economicas-colombia",
  ],
  "plazo-construccion-casa-prefabricada-colombia": [
    "casas-prefabricadas-llave-en-mano-colombia",
    "precio-casa-prefabricada-colombia-2026",
    "casa-prefabricada-para-finca-colombia",
  ],
  "plaqueta-concreto-vs-bloquelon": [
    "construccion-panel-eps-vs-bloquelon",
    "construccion-prefabricada-vs-tradicional",
    "ventajas-construccion-prefabricada-2026",
  ],
  "construccion-panel-eps-vs-bloquelon": [
    "plaqueta-concreto-vs-bloquelon",
    "construccion-prefabricada-vs-tradicional",
    "ventajas-construccion-prefabricada-2026",
  ],
  "construccion-prefabricada-vs-tradicional": [
    "plaqueta-concreto-vs-bloquelon",
    "construccion-panel-eps-vs-bloquelon",
    "ventajas-construccion-prefabricada-2026",
  ],
  "ventajas-construccion-prefabricada-2026": [
    "plaqueta-concreto-vs-bloquelon",
    "guia-casas-prefabricadas-colombia-concasaya",
    "construccion-prefabricada-vs-tradicional",
  ],
  "guia-casas-prefabricadas-colombia-concasaya": [
    "casas-prefabricadas-en-colombia",
    "precio-casa-prefabricada-colombia-2026",
    "ventajas-construccion-prefabricada-2026",
  ],
  "casas-prefabricadas-en-colombia": [
    "guia-casas-prefabricadas-colombia-concasaya",
    "comprar-casa-prefabricada-colombia-2026",
    "precio-casa-prefabricada-colombia-2026",
  ],
  "casas-prefabricadas-en-bogota-guia-constructora": [
    "precio-casa-prefabricada-colombia-2026",
    "licencia-construccion-casas-prefabricadas-colombia",
    "errores-comprar-casa-prefabricada-colombia",
  ],
  "comprar-casa-prefabricada-colombia-2026": [
    "casas-prefabricadas-en-colombia",
    "precio-casa-prefabricada-colombia-2026",
    "casas-prefabricadas-llave-en-mano-colombia",
  ],
  "venta-casas-prefabricadas-cundinamarca": [
    "casas-modulares-cundinamarca",
    "construccion-prefabricada-cundinamarca-guia-concasaya",
    "casas-prefabricadas-norte-bogota-construir-cundinamarca",
  ],
  "casas-prefabricadas-desde-suba-construir-cundinamarca": [
    "casas-prefabricadas-norte-bogota-construir-cundinamarca",
    "venta-casas-prefabricadas-cundinamarca",
    "casas-modulares-cundinamarca",
  ],
  "casas-prefabricadas-norte-bogota-construir-cundinamarca": [
    "casas-prefabricadas-desde-suba-construir-cundinamarca",
    "venta-casas-prefabricadas-cundinamarca",
    "casas-modulares-cundinamarca",
  ],
  "construccion-prefabricada-cundinamarca-guia-concasaya": [
    "venta-casas-prefabricadas-cundinamarca",
    "casas-modulares-cundinamarca",
    "ventajas-construccion-prefabricada-2026",
  ],
  "ventajas-prefabricados-clima-calido-santa-marta": [
    "ventajas-construccion-prefabricada-2026",
    "casas-prefabricadas-en-colombia",
    "casa-prefabricada-para-finca-colombia",
  ],
  "comprar-casa-prefabricada-colombia-desde-el-exterior": [
    "comprar-casa-prefabricada-colombia-desde-estados-unidos-canada",
    "comprar-casa-prefabricada-colombia-desde-europa",
    "comprar-casa-prefabricada-colombia-2026",
  ],
  "comprar-casa-prefabricada-colombia-desde-estados-unidos-canada": [
    "comprar-casa-prefabricada-colombia-desde-el-exterior",
    "comprar-casa-prefabricada-colombia-desde-europa",
    "comprar-casa-prefabricada-colombia-2026",
  ],
  "comprar-casa-prefabricada-colombia-desde-europa": [
    "comprar-casa-prefabricada-colombia-desde-el-exterior",
    "comprar-casa-prefabricada-colombia-desde-estados-unidos-canada",
    "comprar-casa-prefabricada-colombia-2026",
  ],
};

// ---------------------------------------------------------------------------
// La entrada comercial de plaqueta de concreto: no es un articulo del blog,
// es la pagina de venta del material. Va primero porque es la que empuja la
// venta que el cliente quiere.
// Solo se agrega a los articulos que de verdad hablan del sistema plaqueta
// (verificado por mencion en el cuerpo del articulo).
// ---------------------------------------------------------------------------
const ARTICULOS_CON_PLAQUETA = new Set([
  "plaqueta-concreto-vs-bloquelon",
  "construccion-panel-eps-vs-bloquelon",
  "construccion-prefabricada-vs-tradicional",
  "ventajas-construccion-prefabricada-2026",
  "guia-casas-prefabricadas-colombia-concasaya",
  "casas-prefabricadas-en-colombia",
  "casas-prefabricadas-en-bogota-guia-constructora",
  "casas-prefabricadas-economicas-colombia",
  "casas-modulares-colombia",
  "casas-modulares-cundinamarca",
  "casas-prefabricadas-llave-en-mano-colombia",
  "casa-prefabricada-para-finca-colombia",
  "precio-casa-prefabricada-colombia-2026",
  "comprar-casa-prefabricada-colombia-2026",
  "venta-casas-prefabricadas-cundinamarca",
  "construccion-prefabricada-cundinamarca-guia-concasaya",
  "comprar-casa-prefabricada-colombia-desde-el-exterior",
  "comprar-casa-prefabricada-colombia-desde-estados-unidos-canada",
  "comprar-casa-prefabricada-colombia-desde-europa",
  "errores-comprar-casa-prefabricada-colombia",
]);

// ---------------------------------------------------------------------------
// Generacion del HTML
// ---------------------------------------------------------------------------

// El articulo "plaqueta-concreto-vs-bloquelon" ya tiene una caja interna
// sobre sistemas. Para el resto se usa este formato.
function cajaCrosslink(slug) {
  const relacionados = CLUSTER[slug] || [];
  const lineas = [];

  // Entrada de la pagina de venta de plaqueta (solo si el articulo habla
  // de plaqueta). Va marcada aparte porque no es un articulo del blog.
  if (ARTICULOS_CON_PLAQUETA.has(slug)) {
    lineas.push(
      '          <li class="pq-entry">' +
        '<a href="/materiales#cotizador">Venta de plaqueta de concreto</a> ' +
        "— si ya tienes tu obra y solo necesitas el material: 3.500 PSI con refuerzo en grafita, " +
        "$27.500 por m² y pedido mínimo de 30 m², con cotizador en línea.</li>"
    );
  }

  for (const r of relacionados) {
    const info = ARTICULOS[r];
    if (!info) continue;
    lineas.push(
      `          <li><a href="/blog/${r}">${info.titulo}</a> — ${info.nota}.</li>`
    );
  }

  if (!lineas.length) return null;

  const titulo =
    ARTICULOS_CON_PLAQUETA.has(slug)
      ? "Para profundizar en sistemas, precios y material:"
      : "Sigue con estos artículos:";

  return [
    '          <div class="crosslink-box" data-crosslinks="1">',
    `            <strong>${titulo}</strong>`,
    "            <ul>",
    ...lineas,
    "            </ul>",
    "          </div>",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Anclas de insercion
// ---------------------------------------------------------------------------

// Encuentra el parrafo que promete la lista y devuelve el indice justo
// DESPUES de su cierre </p>.
function anclaPromesa(html) {
  const m = html.match(
    /[ \t]*<p>\s*Y si (?:quer[eé]s|quieres) seguir leyendo[\s\S]*?<\/p>/i
  );
  if (!m) return null;
  return { fin: m.index + m[0].length, texto: m[0] };
}

// Encuentra el bloque "Volver al Blog" y devuelve el indice del <div> que
// lo abre, para insertar la caja justo antes.
function anclaVolverBlog(html) {
  const i = html.indexOf("Volver al Blog");
  if (i === -1) return null;
  const div = html.lastIndexOf("<div", i);
  if (div === -1) return null;
  return { fin: div, texto: html.slice(div, div + 120) };
}

// Ultimo cierre del contenedor del articulo: sirve para los 3 articulos
// (desde el exterior / Europa / Canada) que terminan con la conclusion y
// no tienen bloque de "Volver al Blog".
function anclaFinContenido(html) {
  const a = html.indexOf("<article");
  const b = html.indexOf("</article>");
  const m0 = html.indexOf("<main");
  const m1 = html.indexOf("</main>");
  const ini = a !== -1 ? a : m0;
  const fin = b !== -1 ? b : m1;
  if (ini === -1 || fin === -1) return null;
  const cuerpo = html.slice(ini, fin);
  // Ultimo </p> del cuerpo (la conclusion).
  const p = cuerpo.lastIndexOf("</p>");
  if (p === -1) return null;
  return { fin: ini + p + 4, texto: cuerpo.slice(p - 60, p + 4) };
}

// ---------------------------------------------------------------------------
// CSS de la caja: se agrega como link a /assets/css/blog-crosslinks.css.
//
// No se recompila Tailwind: el CSS compilado lo comparten ~200 paginas del
// sitio y recompilarlo arriesga las clases que ya usan las paginas
// existentes. Este archivo es propio del blog.
//
// Los 3 articulos que YA traian el bloque .crosslink-box escrito en su
// <style> inline ya tienen el estilo: ahi no se inserta el link para no
// duplicar la definicion.
// ---------------------------------------------------------------------------
const CSS_BLOG = "/assets/css/blog-crosslinks.css";

function agregarLinkCss(html) {
  if (html.includes(CSS_BLOG)) return { html, ok: true };
  // Se inserta junto al resto de estilos del head.
  const ancla = html.match(
    /[ \t]*<link[^>]*href="\/assets\/css\/whatsapp-modal\.css"[^>]*\/>\s*/
  );
  if (ancla) {
    return {
      html:
        html.slice(0, ancla.index) +
        `  <link rel="stylesheet" href="${CSS_BLOG}" />\n` +
        html.slice(ancla.index),
      ok: true,
    };
  }
  // Alternativa: antes del cierre del head.
  const head = html.indexOf("</head>");
  if (head === -1) return { html, ok: false };
  return {
    html:
      html.slice(0, head) +
      `  <link rel="stylesheet" href="${CSS_BLOG}" />\n` +
      html.slice(head),
    ok: true,
  };
}

// ---------------------------------------------------------------------------
// Recorrido
// ---------------------------------------------------------------------------

function htmlFiles(dir) {
  const acc = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) acc.push(...htmlFiles(full));
    else if (name.endsWith(".html")) acc.push(full);
  }
  return acc;
}

const archivos = htmlFiles(BLOG).filter((f) => !f.endsWith("post.html"));

let modificados = 0;
const problemas = [];
const detalle = [];

for (const file of archivos) {
  const slug = relative(BLOG, file).split(sep).join("/").replace(".html", "");
  if (!CLUSTER[slug]) continue;

  let html = readFileSync(file, "utf8");

  // Idempotencia: si ya tiene una caja de relacionadas (marcada), no se toca.
  // OJO: no se busca "crosslink-box" a secas porque hay articulos con cajas
  // de otro tipo (fuentes externas, cluster geografico, lista legal) que NO
  // son una lista de relacionadas y si deben recibir esta.
  if (/data-crosslinks="1"/.test(html)) {
    continue;
  }

  const caja = cajaCrosslink(slug);
  if (!caja) continue;

  // El CSS de la caja siempre se agrega como link. 3 articulos ya definian
  // .crosslink-box en su <style> inline con las MISMAS reglas; como el link
  // va despues, el estilo queda igual en todo el blog (y suma el color de
  // los enlaces y de la entrada de plaqueta).
  const r = agregarLinkCss(html);
  if (!r.ok) {
    problemas.push(`${slug}: no se encontro donde insertar el link del CSS`);
    continue;
  }
  let nuevo = r.html;

  let ancla = anclaPromesa(nuevo);
  if (!ancla) ancla = anclaVolverBlog(nuevo);
  if (!ancla) ancla = anclaFinContenido(nuevo);
  if (!ancla) {
    problemas.push(`${slug}: no se encontro ancla de insercion`);
    continue;
  }

  nuevo =
    nuevo.slice(0, ancla.fin) + "\n" + caja + "\n" + nuevo.slice(ancla.fin);

  // Verificacion: la caja quedo dentro del contenido del articulo.
  // OJO: se valida contra <main>, no contra <article>: varias paginas del
  // blog usan <article> tambien para las tarjetas de contenido, asi que el
  // primer <article> no es necesariamente el contenedor del texto.
  const m0 = nuevo.indexOf("<main");
  const m1 = nuevo.indexOf("</main>");
  if (m0 !== -1 && m1 !== -1) {
    const pos = nuevo.indexOf('class="crosslink-box"');
    if (pos < m0 || pos > m1) {
      problemas.push(`${slug}: la caja quedo fuera del <main>`);
      continue;
    }
  }

  const hrefs = [...caja.matchAll(/href="([^"]+)"/g)].map((x) => x[1]);
  for (const h of hrefs) {
    if (!h.startsWith("/blog/")) continue;
    const destino = join(BLOG, h.replace("/blog/", "") + ".html");
    if (!statSync(destino, { throwIfNoEntry: false })) {
      problemas.push(`${slug}: enlace roto ${h}`);
    }
  }

  if (APPLY) writeFileSync(file, nuevo, "utf8");
  modificados++;
  detalle.push(
    `  ${slug.padEnd(58)} ancla=${ancla.texto.replace(/\s+/g, " ").trim().slice(0, 46)}`
  );
}

console.log(`Dry-run: ${APPLY ? "ESCRITURA ACTIVADA" : "no se escribio nada"}`);
console.log(`Articulos con caja de cross-links: ${modificados}`);
if (detalle.length) {
  console.log("\nDetalle:");
  for (const d of detalle) console.log(d);
}
if (problemas.length) {
  console.error("\nProblemas (NO se escribieron):");
  for (const p of problemas) console.error("  " + p);
  process.exit(1);
}
