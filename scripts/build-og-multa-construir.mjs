// Genera el OG image del post "multa-construir-sin-licencia-colombia" con:
// - Color sólido de la categoría Guías (verde azulado Concasaya)
// - Título del post en blanco bold, centrado y sin estiramiento
// - Tag de categoría arriba a la izquierda
// - Logo CONCASAYA + concasaya.com arriba a la derecha
// - SIN burbujas (solo gradiente + textura de puntos muy sutil)
import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "assets", "images", "og-multa-construir-sin-licencia-colombia.webp");

const colors = {
  bgDarker: "#134e4a",
  bg: "#0d9488",
  bgDeep: "#115e59",
  accent: "#5eead4",
  yellow: "#ffd166",
  label: "GUÍA"
};

const lines = [
  "¿Me pueden multar por",
  "construir sin licencia",
  "en Colombia?"
];

const titleSize = 60;
const lineHeight = 72;
const cx = 600;
const cy = 330;

const longest = lines.reduce((a, b) => (a.length > b.length ? a : b));
const approxWidth = longest.length * titleSize * 0.58;
if (approxWidth > 1080) {
  console.warn(
    `⚠ La línea más larga (${longest.length} chars) mide ~${Math.round(approxWidth)}px, excede 1080px.`
  );
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const firstDy = -((lines.length - 1) * lineHeight) / 2;
const tspans = lines
  .map(
    (line, i) =>
      `<tspan x="0" dy="${i === 0 ? firstDy : lineHeight}">${esc(line)}</tspan>`
  )
  .join("");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.bgDarker}"/>
      <stop offset="55%" stop-color="${colors.bg}"/>
      <stop offset="100%" stop-color="${colors.bgDeep}"/>
    </linearGradient>
    <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="16" cy="16" r="1" fill="rgba(255,255,255,0.14)"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#dots)"/>

  <g transform="translate(60, 60)">
    <rect x="0" y="0" width="170" height="44" rx="22" ry="22"
          fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>
    <circle cx="22" cy="22" r="5" fill="${colors.accent}"/>
    <text x="100" y="29" font-family="Helvetica, Arial, sans-serif" font-size="15"
          font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="2">
      ${colors.label}
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

  <rect x="${cx - 30}" y="${cy + (lines.length * lineHeight) / 2 + 12}"
        width="60" height="4" rx="2" fill="${colors.yellow}"/>
</svg>`;

await sharp(Buffer.from(svg))
  .resize(1200, 630)
  .webp({ quality: 92, effort: 4 })
  .toFile(outPath);

console.log(`✓ OG image (multas): ${outPath}`);
console.log(`  ${lines.length} líneas, fontSize ${titleSize}, línea más larga: ${longest.length} chars (~${Math.round(approxWidth)}px)`);
