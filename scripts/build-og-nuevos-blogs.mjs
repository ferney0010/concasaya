// Genera las OG images de los 3 artículos nuevos del blog CONCASAYA.
// Mismo diseño que og-casa-prefabricada-para-finca-colombia.webp:
// gradiente de categoría + textura de puntos + tag arriba-izq +
// logo arriba-der + título centrado en blanco bold + línea amarilla.
import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesDir = join(__dirname, "..", "assets", "images");

// Paletas por categoría (mismas que CATEGORY_COLORS del script maestro)
const PALETTES = {
  Compra: { bgDarker: "#0a2540", bg: "#0077b6", bgDeep: "#023e7d", accent: "#00d4ff" },
  Guías: { bgDarker: "#0f3d3a", bg: "#0d9488", bgDeep: "#115e59", accent: "#5eead4" },
};

const YELLOW = "#ffd166";

const posts = [
  {
    slug: "plazo-construccion-casa-prefabricada-colombia",
    category: "Compra",
    label: "PLAZOS",
    lines: ["Cuánto tarda una", "casa prefabricada", "en Colombia"],
    titleSize: 56,
  },
  {
    slug: "errores-comprar-casa-prefabricada-colombia",
    category: "Guías",
    label: "GUÍA",
    lines: ["7 errores al comprar", "casa prefabricada", "en Colombia"],
    titleSize: 56,
  },
  {
    slug: "casas-prefabricadas-boyaca",
    category: "Compra",
    label: "COMPRA",
    lines: ["Casas prefabricadas", "en Boyacá:", "precios y plazos"],
    titleSize: 56,
  },
  {
    slug: "consecuencias-no-radicar-licencia-construccion-colombia",
    category: "Guías",
    label: "LICENCIAS",
    lines: ["Consecuencias de no", "radicar la licencia", "de construcción"],
    titleSize: 56,
  },
  {
    slug: "precio-casa-prefabricada-villa-de-leyva",
    category: "Compra",
    label: "PRECIOS",
    lines: ["Precio de casa", "prefabricada en", "Villa de Leyva"],
    titleSize: 56,
  },
];

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildSvg({ category, label, lines, titleSize }) {
  const c = PALETTES[category];
  const lineHeight = titleSize * 1.2;
  const cx = 600;
  const cy = 320;
  const tagW = label.length * 15 + 60;

  const firstDy = -((lines.length - 1) * lineHeight) / 2;
  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="0" dy="${i === 0 ? firstDy : lineHeight}">${esc(line)}</tspan>`
    )
    .join("");

  // Verificación de ancho: la línea más larga debe caber en 1080px
  const longest = lines.reduce((a, b) => (a.length > b.length ? a : b));
  const approxWidth = longest.length * titleSize * 0.58;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.bgDarker}"/>
      <stop offset="55%" stop-color="${c.bg}"/>
      <stop offset="100%" stop-color="${c.bgDeep}"/>
    </linearGradient>
    <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="16" cy="16" r="1" fill="rgba(255,255,255,0.14)"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#dots)"/>

  <g transform="translate(60, 60)">
    <rect x="0" y="0" width="${tagW}" height="44" rx="22" ry="22"
          fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>
    <circle cx="22" cy="22" r="5" fill="${c.accent}"/>
    <text x="${tagW / 2 + 12}" y="29" font-family="Helvetica, Arial, sans-serif" font-size="15"
          font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="2">
      ${label}
    </text>
  </g>

  <g transform="translate(1140, 78)">
    <text x="0" y="0" font-family="Helvetica, Arial, sans-serif" font-size="15"
          font-weight="800" fill="rgba(255,255,255,0.95)" text-anchor="end" letter-spacing="2.5">
      CONCASAYA
    </text>
    <text x="0" y="20" font-family="Helvetica, Arial, sans-serif" font-size="11"
          font-weight="500" fill="rgba(255,255,255,0.6)" text-anchor="end" letter-spacing="0.3">
      concasaya.com
    </text>
  </g>

  <g transform="translate(${cx}, ${cy})">
    <text font-family="Helvetica, Arial, sans-serif" font-size="${titleSize}"
          font-weight="900" fill="#ffffff" text-anchor="middle"
          style="text-shadow: 0 2px 18px rgba(0,0,0,0.4);">
      ${tspans}
    </text>
  </g>

  <rect x="${cx - 30}" y="${cy + (lines.length * lineHeight) / 2 + 14}"
        width="60" height="4" rx="2" fill="${YELLOW}"/>
</svg>`;
}

for (const post of posts) {
  const outName = `og-${post.slug}.webp`;
  const outPath = join(imagesDir, outName);
  const svg = buildSvg(post);

  await sharp(Buffer.from(svg))
    .resize(1200, 630)
    .webp({ quality: 92, effort: 4 })
    .toFile(outPath);

  const longest = post.lines.reduce((a, b) => (a.length > b.length ? a : b));
  const w = Math.round(longest.length * post.titleSize * 0.58);
  console.log(`✓ ${outName}  (${post.lines.length} líneas, ~${w}px la más larga${w > 1080 ? " ⚠ EXCEDE" : ""})`);
}
console.log("\n3 OG images generadas.");
