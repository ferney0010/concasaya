// Genera el OG image del artículo "Casas prefabricadas económicas en Colombia".
// Tamaño: 1200x630 (estándar OG).
// Diseño: gradiente azul Concasaya + textura de puntos + título + bajada + logo.
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, "..", "assets", "images");
const outPath = join(assetsDir, "og-casas-economicas-colombia.webp");

// SVG del OG: 1200x630
// - Background: gradiente azul Concasaya (#0077b6 → #0a2540) con textura de puntos
// - Acento: círculo decorativo (rosa Concasaya) esquina sup-der
// - Texto: blanco con tipografía bold sans-serif
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Gradiente principal: azul Concasaya -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0077b6"/>
      <stop offset="55%" stop-color="#023e7d"/>
      <stop offset="100%" stop-color="#0a2540"/>
    </linearGradient>

    <!-- Patrón de puntos (textura) -->
    <pattern id="dots" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
      <circle cx="18" cy="18" r="1.4" fill="rgba(255,255,255,0.18)"/>
    </pattern>

    <!-- Patrón de puntos más sutil para overlay -->
    <pattern id="dotsSmall" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
      <circle cx="11" cy="11" r="0.7" fill="rgba(255,255,255,0.08)"/>
    </pattern>

    <!-- Glow superior derecho -->
    <radialGradient id="glow" cx="85%" cy="15%" r="55%">
      <stop offset="0%" stop-color="rgba(255,64,129,0.42)"/>
      <stop offset="60%" stop-color="rgba(255,64,129,0)"/>
    </radialGradient>

    <!-- Glow inferior izquierdo -->
    <radialGradient id="glow2" cx="10%" cy="95%" r="45%">
      <stop offset="0%" stop-color="rgba(0,168,232,0.35)"/>
      <stop offset="65%" stop-color="rgba(0,168,232,0)"/>
    </radialGradient>
  </defs>

  <!-- Capa base -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect width="1200" height="630" fill="url(#dotsSmall)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>
  <rect width="1200" height="630" fill="url(#dots)"/>

  <!-- Marco decorativo interior -->
  <rect x="40" y="40" width="1120" height="550" rx="28" ry="28"
        fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="2"/>

  <!-- Badge "Guía 2026" -->
  <g transform="translate(80, 110)">
    <rect x="0" y="0" width="240" height="46" rx="23" ry="23"
          fill="rgba(255,255,255,0.13)" stroke="rgba(255,255,255,0.32)" stroke-width="1.5"/>
    <text x="120" y="30" font-family="Helvetica, Arial, sans-serif" font-size="20"
          font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">
      GUÍA · CONCASAYA 2026
    </text>
  </g>

  <!-- Título principal (2 líneas) -->
  <g transform="translate(80, 220)">
    <text font-family="Helvetica, Arial, sans-serif" font-weight="800" fill="#ffffff">
      <tspan x="0" y="0" font-size="76" letter-spacing="-1.2">Casas prefabricadas</tspan>
      <tspan x="0" y="92" font-size="76" letter-spacing="-1.2">económicas en Colombia</tspan>
    </text>
  </g>

  <!-- Acento: precio destacado -->
  <g transform="translate(80, 460)">
    <text font-family="Helvetica, Arial, sans-serif" font-weight="700" fill="#ffffff">
      <tspan x="0" y="0" font-size="34" letter-spacing="-0.4">Opciones reales desde</tspan>
      <tspan x="368" y="0" font-size="40" font-weight="800" fill="#ffd166">$25M hasta $50M</tspan>
    </text>
  </g>

  <!-- Bajada -->
  <g transform="translate(80, 525)">
    <text font-family="Helvetica, Arial, sans-serif" font-size="24" font-weight="500"
          fill="rgba(255,255,255,0.86)">
      <tspan x="0" y="0">Qué SÍ es, qué NO es, y cómo evitar que te vendan gato por liebre.</tspan>
    </text>
  </g>

  <!-- Logo CONCASAYA esquina inferior derecha -->
  <g transform="translate(960, 525)">
    <rect x="0" y="-32" width="180" height="44" rx="22" ry="22"
          fill="rgba(255,255,255,0.96)"/>
    <text x="90" y="0" font-family="Helvetica, Arial, sans-serif" font-size="22"
          font-weight="800" fill="#0077b6" text-anchor="middle" letter-spacing="2.5">
      CONCASAYA
    </text>
  </g>

  <!-- Tag URL discret -->
  <g transform="translate(80, 580)">
    <text font-family="Helvetica, Arial, sans-serif" font-size="16"
          font-weight="500" fill="rgba(255,255,255,0.6)" letter-spacing="0.5">
      concasaya.com · Precios por m² · Cobertura Bogotá, Cundinamarca y Boyacá
    </text>
  </g>
</svg>`;

// Renderizar a WebP (1200x630) con sharp
await sharp(Buffer.from(svg))
  .resize(1200, 630)
  .webp({ quality: 90, effort: 5 })
  .toFile(outPath);

console.log(`✓ OG image generado: ${outPath}`);
