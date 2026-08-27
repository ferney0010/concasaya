// OG image SIN TEXTO — solo fondo visual atmosférico.
// El hero del artículo y la card del blog muestran texto.
// Este OG image se usa solo para compartir el link (WhatsApp/redes/Google).
import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "assets", "images", "og-casas-economicas-colombia.webp");

const C = {
  blueDeep: "#0a2540",
  blue: "#0077b6",
  blueMid: "#023e7d",
  cyan: "#00d4ff",
  yellow: "#ffd166",
  pink: "#ff5d8f",
  green: "#10e0a0",
};

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Gradiente azul sólido (diagonal) -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${C.blueDeep}"/>
      <stop offset="55%" stop-color="${C.blue}"/>
      <stop offset="100%" stop-color="${C.blueMid}"/>
    </linearGradient>

    <!-- Glows de acento (esquinas) -->
    <radialGradient id="glowTR" cx="92%" cy="12%" r="40%">
      <stop offset="0%" stop-color="rgba(0,212,255,0.45)"/>
      <stop offset="100%" stop-color="rgba(0,212,255,0)"/>
    </radialGradient>
    <radialGradient id="glowBL" cx="8%" cy="92%" r="40%">
      <stop offset="0%" stop-color="rgba(255,93,143,0.35)"/>
      <stop offset="100%" stop-color="rgba(255,93,143,0)"/>
    </radialGradient>
    <radialGradient id="glowBR" cx="90%" cy="85%" r="30%">
      <stop offset="0%" stop-color="rgba(16,224,160,0.30)"/>
      <stop offset="100%" stop-color="rgba(16,224,160,0)"/>
    </radialGradient>

    <!-- Patrón de puntos (textura principal) -->
    <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="14" cy="14" r="1.4" fill="rgba(255,255,255,0.22)"/>
    </pattern>
    <pattern id="dotsFine" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
      <circle cx="7" cy="7" r="0.7" fill="rgba(255,255,255,0.10)"/>
    </pattern>

    <!-- Filtro blur para acentos -->
    <filter id="softBlur"><feGaussianBlur stdDeviation="20"/></filter>
  </defs>

  <!-- FONDO BASE -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glowTR)"/>
  <rect width="1200" height="630" fill="url(#glowBL)"/>
  <rect width="1200" height="630" fill="url(#glowBR)"/>
  <rect width="1200" height="630" fill="url(#dotsFine)"/>
  <rect width="1200" height="630" fill="url(#dots)"/>

  <!-- ACENTOS DECORATIVOS DIFUMINADOS (esquinas) -->
  <g filter="url(#softBlur)" opacity="0.65">
    <circle cx="1100" cy="100" r="100" fill="${C.cyan}"/>
    <circle cx="100" cy="540" r="110" fill="${C.pink}"/>
    <circle cx="1080" cy="540" r="80" fill="${C.green}"/>
  </g>

  <!-- Forma geométrica abstracta: casa estilizada (silueta, sin texto) -->
  <g opacity="0.18" transform="translate(820, 200)">
    <!-- Casa grande -->
    <path d="M 0 200 L 0 100 L 110 0 L 220 100 L 220 200 Z" fill="none" stroke="${C.cyan}" stroke-width="2"/>
    <!-- Ventana -->
    <rect x="60" y="120" width="40" height="40" fill="none" stroke="${C.cyan}" stroke-width="2"/>
    <!-- Puerta -->
    <rect x="120" y="130" width="50" height="70" fill="none" stroke="${C.cyan}" stroke-width="2"/>
    <!-- Casa pequeña al lado -->
    <path d="M 250 200 L 250 140 L 320 80 L 390 140 L 390 200 Z" fill="none" stroke="${C.pink}" stroke-width="2"/>
    <rect x="290" y="150" width="30" height="30" fill="none" stroke="${C.pink}" stroke-width="2"/>
  </g>

  <!-- Líneas decorativas esquinas (esquinas tipo tarjeta) -->
  <g stroke="${C.white}" stroke-width="2" opacity="0.20" fill="none">
    <path d="M 40 90 L 40 40 L 90 40"/>
    <path d="M 1110 40 L 1160 40 L 1160 90"/>
    <path d="M 40 540 L 40 590 L 90 590"/>
    <path d="M 1110 590 L 1160 590 L 1160 540"/>
  </g>

  <!-- Círculos decorativos pequeños (no compitiendo con texto) -->
  <g opacity="0.7">
    <circle cx="180" cy="120" r="6" fill="${C.yellow}"/>
    <circle cx="200" cy="160" r="3" fill="${C.cyan}"/>
    <circle cx="160" cy="170" r="4" fill="${C.pink}"/>
    <circle cx="1000" cy="500" r="5" fill="${C.green}"/>
    <circle cx="1020" cy="470" r="3" fill="${C.yellow}"/>
  </g>
</svg>`;

await sharp(Buffer.from(svg))
  .resize(1200, 630)
  .webp({ quality: 92, effort: 5 })
  .toFile(outPath);

console.log(`✓ OG image (sin texto, solo visual) generado: ${outPath}`);
