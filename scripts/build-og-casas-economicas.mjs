// OG image del artículo "Casas prefabricadas económicas en Colombia".
// Tamaño: 1200x630 (estándar OG).
// Diseño: gradiente azul Concasaya + acentos vibrantes (verde, amarillo, rosa)
//         + textura de puntos + formas decorativas (blobs/círculos) + icono de casa.
import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "assets", "images", "og-casas-economicas-colombia.webp");

// Paleta vibrante
const COLOR_BLUE_DEEP = "#0a2540";     // azul oscuro base
const COLOR_BLUE = "#0077b6";          // azul Concasaya
const COLOR_CYAN = "#00d4ff";          // cian vibrante
const COLOR_GREEN = "#10e0a0";         // verde agua vibrante
const COLOR_YELLOW = "#ffd166";        // amarillo cálido (precio)
const COLOR_PINK = "#ff5d8f";          // rosa vibrante
const COLOR_ORANGE = "#ff9b50";        // naranja

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Gradiente principal: azul profundo a azul Concasaya (diagonal) -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLOR_BLUE_DEEP}"/>
      <stop offset="50%" stop-color="${COLOR_BLUE}"/>
      <stop offset="100%" stop-color="#023e7d"/>
    </linearGradient>

    <!-- Gradiente arcoíris sutil para acentos -->
    <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${COLOR_CYAN}"/>
      <stop offset="33%" stop-color="${COLOR_GREEN}"/>
      <stop offset="66%" stop-color="${COLOR_YELLOW}"/>
      <stop offset="100%" stop-color="${COLOR_PINK}"/>
    </linearGradient>

    <!-- Patrón de puntos (textura principal) -->
    <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="16" cy="16" r="1.6" fill="rgba(255,255,255,0.22)"/>
    </pattern>

    <!-- Patrón de puntos finos (overlay) -->
    <pattern id="dotsSmall" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
      <circle cx="9" cy="9" r="0.8" fill="rgba(255,255,255,0.10)"/>
    </pattern>

    <!-- Glow cian superior izquierda -->
    <radialGradient id="glowCyan" cx="15%" cy="20%" r="50%">
      <stop offset="0%" stop-color="rgba(0,212,255,0.45)"/>
      <stop offset="60%" stop-color="rgba(0,212,255,0)"/>
    </radialGradient>

    <!-- Glow verde inferior derecha -->
    <radialGradient id="glowGreen" cx="85%" cy="90%" r="50%">
      <stop offset="0%" stop-color="rgba(16,224,160,0.40)"/>
      <stop offset="60%" stop-color="rgba(16,224,160,0)"/>
    </radialGradient>

    <!-- Glow rosa medio -->
    <radialGradient id="glowPink" cx="95%" cy="40%" r="40%">
      <stop offset="0%" stop-color="rgba(255,93,143,0.35)"/>
      <stop offset="65%" stop-color="rgba(255,93,143,0)"/>
    </radialGradient>

    <!-- Gradiente para texto del precio -->
    <linearGradient id="priceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${COLOR_YELLOW}"/>
      <stop offset="100%" stop-color="${COLOR_ORANGE}"/>
    </linearGradient>

    <!-- Filtro de blur para los blobs decorativos -->
    <filter id="softBlur"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>

  <!-- Capas de fondo -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect width="1200" height="630" fill="url(#glowCyan)"/>
  <rect width="1200" height="630" fill="url(#glowGreen)"/>
  <rect width="1200" height="630" fill="url(#glowPink)"/>
  <rect width="1200" height="630" fill="url(#dotsSmall)"/>
  <rect width="1200" height="630" fill="url(#dots)"/>

  <!-- BLOBS decorativos (formas orgánicas con color) -->
  <g filter="url(#softBlur)" opacity="0.65">
    <!-- Blob cian superior izquierda -->
    <ellipse cx="80" cy="120" rx="180" ry="130" fill="${COLOR_CYAN}"/>
    <!-- Blob verde inferior derecha -->
    <ellipse cx="1080" cy="540" rx="200" ry="140" fill="${COLOR_GREEN}"/>
    <!-- Blob rosa medio derecho -->
    <ellipse cx="1100" cy="280" rx="120" ry="100" fill="${COLOR_PINK}"/>
    <!-- Blob amarillo superior derecha -->
    <ellipse cx="950" cy="80" rx="110" ry="80" fill="${COLOR_YELLOW}" opacity="0.55"/>
  </g>

  <!-- Círculos decorativos más pequeños (sin blur, más definidos) -->
  <g opacity="0.85">
    <circle cx="160" cy="500" r="14" fill="${COLOR_YELLOW}"/>
    <circle cx="200" cy="540" r="8" fill="${COLOR_CYAN}"/>
    <circle cx="100" cy="560" r="6" fill="${COLOR_PINK}"/>
    <circle cx="1050" cy="180" r="10" fill="${COLOR_GREEN}"/>
    <circle cx="1100" cy="220" r="6" fill="${COLOR_YELLOW}"/>
  </g>

  <!-- Marco decorativo interior (sutil) -->
  <rect x="40" y="40" width="1120" height="550" rx="28" ry="28"
        fill="none" stroke="rgba(255,255,255,0.20)" stroke-width="2"/>

  <!-- Esquina superior izquierda: TAG + icono de casita -->
  <g transform="translate(80, 95)">
    <!-- Icono casa estilizado -->
    <g transform="translate(0, 0)">
      <path d="M 0 22 L 22 0 L 44 22 L 44 44 L 0 44 Z"
            fill="none" stroke="${COLOR_YELLOW}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="16" y="26" width="12" height="18" fill="${COLOR_YELLOW}"/>
    </g>
    <!-- Badge "GUÍA · CONCASAYA 2026" -->
    <g transform="translate(60, 8)">
      <rect x="0" y="0" width="290" height="46" rx="23" ry="23"
            fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>
      <text x="145" y="30" font-family="Helvetica, Arial, sans-serif" font-size="20"
            font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">
        GUÍA · CONCASAYA 2026
      </text>
    </g>
  </g>

  <!-- Título principal (2 líneas) -->
  <g transform="translate(80, 210)">
    <text font-family="Helvetica, Arial, sans-serif" font-weight="800" fill="#ffffff">
      <tspan x="0" y="0" font-size="74" letter-spacing="-1.2">Casas prefabricadas</tspan>
      <tspan x="0" y="90" font-size="74" letter-spacing="-1.2" fill="url(#rainbow)">económicas en Colombia</tspan>
    </text>
  </g>

  <!-- Acento: precio destacado con gradiente amarillo-naranja -->
  <g transform="translate(80, 460)">
    <text font-family="Helvetica, Arial, sans-serif" font-weight="700" fill="#ffffff">
      <tspan x="0" y="0" font-size="32" letter-spacing="-0.4">Opciones reales desde</tspan>
      <tspan x="350" y="0" font-size="42" font-weight="800" fill="url(#priceGrad)">$25M hasta $50M</tspan>
    </text>
  </g>

  <!-- Bajada -->
  <g transform="translate(80, 520)">
    <text font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="500"
          fill="rgba(255,255,255,0.92)">
      <tspan x="0" y="0">Qué SÍ es, qué NO es, y cómo evitar que te vendan gato por liebre.</tspan>
    </text>
  </g>

  <!-- Logo CONCASAYA esquina inferior derecha -->
  <g transform="translate(950, 530)">
    <rect x="0" y="-32" width="190" height="46" rx="23" ry="23"
          fill="rgba(255,255,255,0.97)"/>
    <text x="95" y="0" font-family="Helvetica, Arial, sans-serif" font-size="22"
          font-weight="800" fill="${COLOR_BLUE}" text-anchor="middle" letter-spacing="2.5">
      CONCASAYA
    </text>
  </g>

  <!-- Tag URL + bullets coloridos -->
  <g transform="translate(80, 580)">
    <!-- Bullets arcoíris -->
    <circle cx="6" cy="-5" r="4" fill="${COLOR_CYAN}"/>
    <circle cx="22" cy="-5" r="4" fill="${COLOR_GREEN}"/>
    <circle cx="38" cy="-5" r="4" fill="${COLOR_YELLOW}"/>
    <circle cx="54" cy="-5" r="4" fill="${COLOR_PINK}"/>
    <text x="74" y="0" font-family="Helvetica, Arial, sans-serif" font-size="15"
          font-weight="600" fill="rgba(255,255,255,0.78)" letter-spacing="0.5">
      concasaya.com · Precios por m² · Cobertura Bogotá, Cundinamarca y Boyacá
    </text>
  </g>
</svg>`;

await sharp(Buffer.from(svg))
  .resize(1200, 630)
  .webp({ quality: 92, effort: 5 })
  .toFile(outPath);

console.log(`✓ OG image (colorido) generado: ${outPath}`);
