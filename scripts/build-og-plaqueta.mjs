// Genera la OG image de /materiales#cotizador con la misma estetica de los
// OG del sitio (ver scripts/build-og-index.mjs):
// - Fondo con degradado azul corporativo CONCASAYA
// - Titulo en blanco bold, centrado, con la parte clave en verde
// - Tag "PLAQUETA DE CONCRETO" arriba a la izquierda
// - Logo CONCASAYA + concasaya.com arriba a la derecha
// - Linea de acento amarilla debajo del titulo
// - Textura de puntos sutil
//
// Tamano: 1200x630 (estandar OG / Twitter Card)
import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "assets", "images", "og-plaqueta-de-concreto.webp");

const colors = {
  bgDarker: "#0a2540",
  bg: "#0077b6",
  bgDeep: "#023e7d",
  accent: "#00d4ff",
  yellow: "#ffd166",
  green: "#86f08f",
  label: "PLAQUETA DE CONCRETO",
};

// Titulo en 3 lineas balanceadas.
const lines = [
  "Plaqueta de Concreto",
  "3.500 PSI con refuerzo en grafita",
  "$27.500 por m² · mínimo 30 m²",
];

const titleSize = 54;
const lineHeight = 68;
const blockWidth = 1080;
const cx = 600;
const cy = 320;

const longest = lines.reduce((a, b) => (a.length > b.length ? a : b));
const approxWidth = longest.length * titleSize * 0.58;
if (approxWidth > blockWidth) {
  console.warn(
    `⚠ La línea más larga (${longest.length} chars) mide ~${Math.round(
      approxWidth
    )}px, excede ${blockWidth}px.`
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

// La 3ra linea (el precio) va en verde: es el dato que vende.
const priceLine = `<tspan x="0" dy="${lineHeight}" fill="${colors.green}">${esc(
  lines[2]
)}</tspan>`;
const tspansMixed =
  `<tspan x="0" dy="${firstDy}">${esc(lines[0])}</tspan>` +
  `<tspan x="0" dy="${lineHeight}">${esc(lines[1])}</tspan>` +
  priceLine;

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

  <!-- Tag categoría (esquina sup-izq) -->
  <g transform="translate(60, 60)">
    <rect x="0" y="0" width="270" height="44" rx="22" ry="22"
          fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>
    <circle cx="22" cy="22" r="5" fill="${colors.accent}"/>
    <text x="146" y="29" font-family="Helvetica, Arial, sans-serif" font-size="14"
          font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1.6">
      ${colors.label}
    </text>
  </g>

  <!-- Logo CONCASAYA (esquina sup-der) -->
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

  <!-- Título centrado -->
  <g transform="translate(${cx}, ${cy})">
    <text font-family="Helvetica, Arial, sans-serif" font-size="${titleSize}"
          font-weight="900" fill="#ffffff" text-anchor="middle"
          style="text-shadow: 0 2px 18px rgba(0,0,0,0.4);">
      ${tspansMixed}
    </text>
  </g>

  <!-- Línea de acento amarilla centrada debajo del título -->
  <rect x="${cx - 30}" y="${cy + (lines.length * lineHeight) / 2 + 12}"
        width="60" height="4" rx="2" fill="${colors.yellow}"/>

  <!-- Pie: condiciones comerciales -->
  <text x="${cx}" y="576" font-family="Helvetica, Arial, sans-serif" font-size="17"
        font-weight="600" fill="rgba(255,255,255,0.72)" text-anchor="middle">
    Entrega cargada en planta · Transporte por cuenta del comprador
  </text>
</svg>`;

await sharp(Buffer.from(svg))
  .resize(1200, 630)
  .webp({ quality: 92, effort: 4 })
  .toFile(outPath);

console.log(`✓ OG image de plaqueta generada: ${outPath}`);
console.log(
  `  ${lines.length} líneas, fontSize ${titleSize}, línea más larga: ${longest.length} chars (~${Math.round(
    approxWidth
  )}px)`
);
