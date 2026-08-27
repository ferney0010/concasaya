// OG image del artículo "Casas prefabricadas económicas en Colombia".
// Estilo SinMulta adaptado a Concasaya: fondo azul sólido con textura,
// texto blanco 100% legible, badges claros, precio destacado separado.
import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "assets", "images", "og-casas-economicas-colombia.webp");

// Paleta Concasaya (idéntica al sitio web)
const C = {
  blueDeep: "#0a2540",
  blue: "#0077b6",
  blueMid: "#023e7d",
  cyan: "#00d4ff",
  yellow: "#ffd166",
  yellowDeep: "#f5b400",
  pink: "#ff5d8f",
  green: "#10e0a0",
  white: "#ffffff",
  white80: "rgba(255,255,255,0.85)",
  white70: "rgba(255,255,255,0.7)",
  white50: "rgba(255,255,255,0.5)",
  white15: "rgba(255,255,255,0.15)",
  white08: "rgba(255,255,255,0.08)",
};

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Gradiente azul sólido (diagonal sutil) -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${C.blueDeep}"/>
      <stop offset="55%" stop-color="${C.blue}"/>
      <stop offset="100%" stop-color="${C.blueMid}"/>
    </linearGradient>

    <!-- Glow cian superior derecho (acento sutil, no tapa texto) -->
    <radialGradient id="glowTR" cx="92%" cy="12%" r="40%">
      <stop offset="0%" stop-color="rgba(0,212,255,0.35)"/>
      <stop offset="100%" stop-color="rgba(0,212,255,0)"/>
    </radialGradient>

    <!-- Glow rosa inferior izquierdo (acento sutil) -->
    <radialGradient id="glowBL" cx="8%" cy="92%" r="35%">
      <stop offset="0%" stop-color="rgba(255,93,143,0.28)"/>
      <stop offset="100%" stop-color="rgba(255,93,143,0)"/>
    </radialGradient>

    <!-- Patrón de puntos (textura) -->
    <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="14" cy="14" r="1.3" fill="rgba(255,255,255,0.20)"/>
    </pattern>
    <pattern id="dotsFine" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
      <circle cx="7" cy="7" r="0.6" fill="rgba(255,255,255,0.10)"/>
    </pattern>

    <!-- Acento amarillo para el badge -->
    <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${C.yellow}"/>
      <stop offset="100%" stop-color="${C.yellowDeep}"/>
    </linearGradient>

    <!-- Filtro blur para acentos decorativos -->
    <filter id="softBlur"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>

  <!-- Capas de fondo -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glowTR)"/>
  <rect width="1200" height="630" fill="url(#glowBL)"/>
  <rect width="1200" height="630" fill="url(#dotsFine)"/>
  <rect width="1200" height="630" fill="url(#dots)"/>

  <!-- Acentos decorativos difuminados (esquinas, lejos del texto) -->
  <g filter="url(#softBlur)" opacity="0.55">
    <circle cx="1100" cy="100" r="80" fill="${C.cyan}"/>
    <circle cx="100" cy="540" r="90" fill="${C.pink}"/>
  </g>

  <!-- Badge DESTACADO (esquina superior izquierda) -->
  <g transform="translate(60, 60)">
    <rect x="0" y="0" width="290" height="44" rx="22" ry="22" fill="url(#yellowGrad)"/>
    <g transform="translate(22, 22)">
      <path d="M 0 -10 L 3 -3 L 10 -3 L 4 2 L 6 9 L 0 5 L -6 9 L -4 2 L -10 -3 L -3 -3 Z" fill="${C.blueDeep}"/>
    </g>
    <text x="160" y="29" font-family="Helvetica, Arial, sans-serif" font-size="16"
          font-weight="800" fill="${C.blueDeep}" text-anchor="middle" letter-spacing="1.2">
      DESTACADO · GUÍA 2026
    </text>
  </g>

  <!-- Tag de categoría (esquina superior derecha) -->
  <g transform="translate(920, 60)">
    <rect x="0" y="0" width="220" height="44" rx="22" ry="22"
          fill="${C.white15}" stroke="rgba(255,255,255,0.32)" stroke-width="1.5"/>
    <g transform="translate(24, 22)">
      <circle cx="0" cy="0" r="7" fill="none" stroke="${C.white}" stroke-width="2"/>
      <path d="M -3 0 L 0 3 L 5 -3" stroke="${C.white}" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>
    <text x="128" y="29" font-family="Helvetica, Arial, sans-serif" font-size="15"
          font-weight="700" fill="${C.white}" text-anchor="middle" letter-spacing="1">
      COMPRA · COLOMBIA
    </text>
  </g>

  <!-- TÍTULO PRINCIPAL — 100% BLANCO, bold, legible -->
  <g transform="translate(60, 195)">
    <text font-family="Helvetica, Arial, sans-serif" font-weight="900" fill="${C.white}">
      <tspan x="0" y="0" font-size="68" letter-spacing="-1">Casas prefabricadas</tspan>
      <tspan x="0" y="84" font-size="68" letter-spacing="-1">económicas en Colombia</tspan>
    </text>
  </g>

  <!-- Línea de acento (separador) -->
  <rect x="60" y="395" width="60" height="4" rx="2" fill="${C.yellow}"/>

  <!-- Subtítulo/bajada -->
  <g transform="translate(60, 425)">
    <text font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="500" fill="${C.white80}">
      <tspan x="0" y="0">Opciones reales desde $25M a $50M. Qué SÍ es, qué NO es, y cómo</tspan>
      <tspan x="0" y="30">evitar que te vendan gato por liebre. Guía honesta 2026.</tspan>
    </text>
  </g>

  <!-- Bloque autor + fecha (estilo SinMulta) -->
  <g transform="translate(60, 540)">
    <!-- Avatar circular -->
    <circle cx="22" cy="20" r="22" fill="url(#yellowGrad)"/>
    <text x="22" y="27" font-family="Helvetica, Arial, sans-serif" font-size="20"
          font-weight="800" fill="${C.blueDeep}" text-anchor="middle">F</text>
    <!-- Autor -->
    <text x="58" y="16" font-family="Helvetica, Arial, sans-serif" font-size="15"
          font-weight="700" fill="${C.white}">Por Ferney Bello</text>
    <text x="58" y="33" font-family="Helvetica, Arial, sans-serif" font-size="13"
          font-weight="500" fill="${C.white70}">CEO · Codify Tech</text>
    <!-- Separador -->
    <line x1="200" y1="6" x2="200" y2="34" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
    <!-- Fecha -->
    <text x="220" y="16" font-family="Helvetica, Arial, sans-serif" font-size="14"
          font-weight="600" fill="${C.white}">27 de agosto de 2026</text>
    <text x="220" y="33" font-family="Helvetica, Arial, sans-serif" font-size="13"
          font-weight="500" fill="${C.white70}">11 min de lectura</text>
  </g>

  <!-- (Sin logo CONCASAYA — ya aparece en el sitio web y la card del blog) -->

  <!-- Badge de precio (esquina inferior derecha, separado del texto principal) -->
  <g transform="translate(880, 495)">
    <rect x="0" y="0" width="260" height="90" rx="20" ry="20"
          fill="${C.white}" opacity="0.96"/>
    <text x="20" y="28" font-family="Helvetica, Arial, sans-serif" font-size="12"
          font-weight="800" fill="${C.blue}" letter-spacing="1.5">PRECIO REAL</text>
    <text x="20" y="62" font-family="Helvetica, Arial, sans-serif" font-size="32"
          font-weight="900" fill="${C.blueDeep}" letter-spacing="-0.5">$25M a $50M</text>
    <text x="20" y="80" font-family="Helvetica, Arial, sans-serif" font-size="11"
          font-weight="600" fill="${C.blue}" opacity="0.7">Cifras 2026 · CONCASAYA</text>
  </g>
</svg>`;

await sharp(Buffer.from(svg))
  .resize(1200, 630)
  .webp({ quality: 92, effort: 5 })
  .toFile(outPath);

console.log(`✓ OG image (estilo SinMulta) generado: ${outPath}`);
