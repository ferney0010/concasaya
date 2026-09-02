// Genera OG images individuales para cada post del blog.
// Cada OG tiene el color de la categoría + el título del post en blanco bold.
// Sin burbujas, solo color sólido + textura de puntos sutil.
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, "..", "blog", "static-posts-config.js");
const imagesDir = join(__dirname, "..", "assets", "images");

// Colores por categoría (identidad visual)
const CATEGORY_COLORS = {
  Compra: {
    bg: "#0077b6",
    bgDeep: "#023e7d",
    bgDarker: "#0a2540",
    accent: "#00d4ff",
    label: "COMPRA"
  },
  Guías: {
    bg: "#0d9488",          // teal
    bgDeep: "#115e59",
    bgDarker: "#134e4a",
    accent: "#5eead4",
    label: "GUÍA"
  },
  Comparativas: {
    bg: "#ea580c",          // naranja
    bgDeep: "#9a3412",
    bgDarker: "#7c2d12",
    accent: "#fbbf24",
    label: "COMPARATIVA"
  },
  default: {
    bg: "#0077b6",
    bgDeep: "#023e7d",
    bgDarker: "#0a2540",
    accent: "#00d4ff",
    label: "ARTÍCULO"
  }
};

function getCategoryColors(cat) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
}

// Truncar el título a un máximo razonable para que entre en el OG
function splitTitle(title, maxLen = 50) {
  if (title.length <= maxLen) return [title];
  // Cortar en la última palabra completa antes del límite
  const words = title.split(" ");
  const lines = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length <= maxLen) {
      current = (current + " " + w).trim();
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3); // máximo 3 líneas
}

// Escapar caracteres especiales para SVG
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Cargar posts
const configCode = readFileSync(configPath, "utf8");
const testCode = configCode
  .replace(/^\s*export\s+const\s+staticPosts\s*=\s*/m, "return ")
  .replace(/^\s*export\s+/gm, "");
const script = new vm.Script("(function() { " + testCode + " })()");
const posts = script.runInThisContext();

console.log(`Generando ${posts.length} OG images...`);

for (const post of posts) {
  const cat = post.category || "default";
  const colors = getCategoryColors(cat);
  const title = post.title;
  const lines = splitTitle(title);
  const outName = `blog-og-${post.slug}.webp`;
  const outPath = join(imagesDir, outName);

  // Calcular fontSize según la cantidad de líneas
  const titleSize = lines.length === 1 ? 68 : lines.length === 2 ? 60 : 50;
  const lineHeight = titleSize * 1.1;

  // Construir tspans para el título
  const titleTspans = lines.map((line, i) =>
    `<tspan x="0" y="${i * lineHeight}">${esc(line)}</tspan>`
  ).join("");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.bgDarker}"/>
      <stop offset="60%" stop-color="${colors.bg}"/>
      <stop offset="100%" stop-color="${colors.bgDeep}"/>
    </linearGradient>
    <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="14" cy="14" r="1.3" fill="rgba(255,255,255,0.18)"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#dots)"/>

  <!-- Tag de categoría (esquina sup-izq) -->
  <g transform="translate(60, 60)">
    <rect x="0" y="0" width="${colors.label.length * 14 + 50}" height="44" rx="22" ry="22"
          fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
    <circle cx="22" cy="22" r="5" fill="${colors.accent}"/>
    <text x="${colors.label.length * 7 + 36}" y="29" font-family="Helvetica, Arial, sans-serif"
          font-size="16" font-weight="800" fill="#fff" text-anchor="middle" letter-spacing="1.5">
      ${esc(colors.label)}
    </text>
  </g>

  <!-- Logo CONCASAYA (esquina sup-der) -->
  <g transform="translate(1140, 75)">
    <text x="0" y="6" font-family="Helvetica, Arial, sans-serif" font-size="14"
          font-weight="800" fill="rgba(255,255,255,0.85)" text-anchor="end" letter-spacing="2.5">
      CONCASAYA
    </text>
    <text x="0" y="22" font-family="Helvetica, Arial, sans-serif" font-size="10"
          font-weight="500" fill="rgba(255,255,255,0.5)" text-anchor="end" letter-spacing="0.3">
      concasaya.com
    </text>
  </g>

  <!-- Título principal (centrado verticalmente) -->
  <g transform="translate(60, ${315 - (lines.length * lineHeight) / 2 + 8})">
    <text font-family="Helvetica, Arial, sans-serif" font-weight="900" fill="#ffffff"
          style="text-shadow: 0 2px 18px rgba(0,0,0,0.35);">
      ${titleTspans}
    </text>
  </g>

  <!-- Línea de acento (debajo del título) -->
  <rect x="60" y="${560 - lines.length * 4}" width="60" height="4" rx="2" fill="${colors.accent}"/>
</svg>`;

  await sharp(Buffer.from(svg))
    .resize(1200, 630)
    .webp({ quality: 92, effort: 4 })
    .toFile(outPath);

  // Actualizar el image del post en el config
  post.image = `https://www.concasaya.com/assets/images/${outName}`;
}

// Reescribir el config con las nuevas rutas
// Para no romper el formato, parseamos y regeneramos cada objeto
function formatPost(p) {
  const fields = [];
  for (const [k, v] of Object.entries(p)) {
    if (k === "title" || k === "description") {
      // multilínea
      fields.push(`    ${k}:\n      "${v.replace(/"/g, '\\"')}",`);
    } else if (typeof v === "string") {
      fields.push(`    ${k}: "${v}",`);
    } else if (typeof v === "boolean" || typeof v === "number") {
      fields.push(`    ${k}: ${v},`);
    } else if (v === null) {
      fields.push(`    ${k}: null,`);
    } else {
      fields.push(`    ${k}: ${JSON.stringify(v)},`);
    }
  }
  return `  {\n${fields.join("\n")}\n  }`;
}

const newConfig = `// Configuración de posts estáticos del blog
// Este archivo contiene la metadata de los posts HTML estáticos

export const staticPosts = [
${posts.map(formatPost).join(",\n")}
];
${configCode.split("export function")[1] || ""}`;

// Restaurar el export function que preservamos
const exportFnMatch = configCode.match(/export function[\s\S]+?\n\}/);
const finalConfig = newConfig.startsWith("// Configuración")
  ? newConfig + (exportFnMatch ? "\n" + exportFnMatch[0] : "")
  : newConfig;

writeFileSync(configPath, finalConfig, "utf8");
console.log(`✓ ${posts.length} OG images generadas y config actualizado`);
console.log(`Primer post: ${posts[0].slug} → ${posts[0].image}`);
