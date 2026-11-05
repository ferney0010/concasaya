// Inserta el enlace "Plaqueta" al nav del sitio (escritorio + tablet) en las
// paginas que tienen la barra de navegacion compartida.
//
// Es idempotente: si el enlace ya existe, la pagina se salta.
// Es seguro: solo escribe si encontro UN anchor de "Materiales" en cada zona
// y si el conteo final de enlaces coincide con lo esperado.
//
// Uso:
//   node scripts/agregar-nav-plaqueta.mjs          (dry-run: solo informa)
//   node scripts/agregar-nav-plaqueta.mjs --apply  (escribe los archivos)
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const APPLY = process.argv.includes("--apply");

// --- Textos de los enlaces -----------------------------------------------
// Escritorio: una palabra, como "Modelos" / "Materiales" / "Empresa".
// El nav de escritorio esta justo de espacio a 1024px: por eso es corto.
const DESKTOP_HTML = `<a href="/materiales#cotizador" class="text-dark hover:text-primary transition duration-300">Plaqueta</a>`;
// Tablet: hay mas espacio, se puede ser explicito.
const TABLET_HTML = `<a href="/materiales#cotizador" class="tablet-menu-item block py-3 px-6 text-base font-medium text-dark"><i class="fas fa-layer-group mr-3 text-primary"></i>Plaqueta de concreto</a>`;

// --- Recorrer el repo ----------------------------------------------------
function htmlFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    // node_modules: dependencias. .git: control de versiones.
    // tmp-test: pruebas de deploy. .deploy-staging: copia de trabajo del
    // sitio (NO es el sitio publicado, no se toca).
    if (
      name === "node_modules" ||
      name === ".git" ||
      name === "tmp-test" ||
      name === ".deploy-staging"
    ) {
      continue;
    }
    // Los .tmp-*.html son archivos de trabajo, no paginas del sitio.
    if (name.startsWith(".tmp-") || name.startsWith("tmp-")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) htmlFiles(full, acc);
    else if (name.endsWith(".html")) acc.push(full);
  }
  return acc;
}

// Extrae el anchor de "Materiales" dentro de una region delimitada.
// Devuelve {inicio, fin} del anchor completo o null.
//
// El repo tiene el HTML formateado con saltos de linea dentro del tag
// (herencia de un formateador de HTML): el cierre puede ser `</a>` o
// `</a          >`. El regex tolera ambos y los saltos de linea intermedios.
function findMaterialesAnchor(html, desde, hasta) {
  const region = html.slice(desde, hasta);
  const re = /<a\b[^>]*href="\/materiales"[^>]*>[\s\S]*?<\/a\s*>/g;
  let m;
  let ultimo = null;
  while ((m = re.exec(region)) !== null) ultimo = m;
  if (!ultimo) return null;
  return { inicio: desde + ultimo.index, fin: desde + ultimo.index + ultimo[0].length };
}

// Zona escritorio: del div nav-desktop-primary hasta el boton de menu movil.
// No todas las paginas tienen el boton movil con la misma marca, asi que se
// busca cualquiera de los cierres conocidos; si no hay ninguno, se usa el
// siguiente bloque de la pagina (el nav de escritorio es el unico bloque
// con esos enlaces, asi que basta con un margen acotado).
function zonaEscritorio(html) {
  const i = html.indexOf('nav-desktop-primary');
  if (i === -1) return null;
  const finCandidates = [
    html.indexOf('id="menu-btn"', i),
    html.indexOf('<div class="lg:hidden">', i),
    html.indexOf('id="tablet-menu"', i),
  ].filter((x) => x !== -1);
  if (!finCandidates.length) {
    // Sin marcador de cierre: se toma el nav completo hasta el </header>.
    const fin = html.indexOf('</header>', i);
    if (fin === -1) return null;
    return { desde: i, hasta: fin };
  }
  return { desde: i, hasta: Math.min(...finCandidates) };
}

// Zona tablet: dentro del div #tablet-menu.
function zonaTablet(html) {
  const i = html.indexOf('id="tablet-menu"');
  if (i === -1) return null;
  // El menu tablet termina con su </div> de cierre; se toma un margen amplio
  // y luego se recorta al primer </div> de nivel.
  const fin = html.indexOf('</header>', i);
  if (fin === -1) return null;
  return { desde: i, hasta: fin };
}

const files = htmlFiles(ROOT);
let modificados = 0;
let saltados = 0;
const problemas = [];
const detalle = [];

for (const file of files) {
  const rel = relative(ROOT, file).split(sep).join("/");
  // La pagina nueva ya trae su propio nav: no se toca.
  if (rel === "plaqueta-de-concreto.html") continue;

  let html = readFileSync(file, "utf8");
  const original = html;

  if (html.includes('href="/materiales#cotizador"')) {
    saltados++;
    continue;
  }

  const cambios = [];

  // --- Escritorio ---
  const zEsc = zonaEscritorio(html);
  if (zEsc) {
    const anchor = findMaterialesAnchor(html, zEsc.desde, zEsc.hasta);
    if (anchor) {
      cambios.push({ ...anchor, html: DESKTOP_HTML });
    }
  }

  // --- Tablet ---
  const zTab = zonaTablet(html);
  if (zTab) {
    const anchor = findMaterialesAnchor(html, zTab.desde, zTab.hasta);
    if (anchor) {
      cambios.push({ ...anchor, html: TABLET_HTML });
    }
  }

  if (!cambios.length) {
    saltados++;
    continue;
  }

  // Insertar de atrás hacia adelante para no invalidar los offsets.
  cambios.sort((a, b) => b.inicio - a.inicio);
  for (const c of cambios) {
    html = html.slice(0, c.fin) + "\n          " + c.html + html.slice(c.fin);
  }

  // Verificacion: el numero de enlaces nuevos debe ser el esperado y no debe
  // haber quedado ningun anchor de Materiales duplicado.
  const nuevos = (html.match(/href="\/materiales#cotizador"/g) || []).length;
  const esperados = cambios.length;
  if (nuevos !== esperados) {
    problemas.push(`${rel}: esperaba ${esperados} enlaces, quedaron ${nuevos}`);
    continue;
  }

  if (html !== original) {
    if (APPLY) writeFileSync(file, html, "utf8");
    modificados++;
    detalle.push(`  ${rel} (+${esperados})`);
  }
}

console.log(`Dry-run: ${APPLY ? "ESCRITURA ACTIVADA" : "no se escribio nada"}`);
console.log(`Paginas con nav actualizado: ${modificados}`);
console.log(`Paginas saltadas (sin nav / ya actualizadas): ${saltados}`);
if (detalle.length) {
  console.log("\nDetalle:");
  for (const d of detalle.slice(0, 12)) console.log(d);
  if (detalle.length > 12) console.log(`  ... y ${detalle.length - 12} mas`);
}
if (problemas.length) {
  console.error("\nProblemas (NO se escribieron):");
  for (const p of problemas) console.error("  " + p);
  process.exit(1);
}
