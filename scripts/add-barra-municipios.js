/**
 * Añade la barra inferior (WhatsApp + redes) a municipios que no la tienen.
 * Solo reemplaza el bloque "fixed bottom-5 right-5" - no toca nada más.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const pagesDir = path.join(root, "pages");

const MUNICIPIOS = [
  { slug: "chia", nombre: "Chía" }, { slug: "cajica", nombre: "Cajicá" }, { slug: "cota", nombre: "Cota" },
  { slug: "mosquera", nombre: "Mosquera" }, { slug: "zipaquira", nombre: "Zipaquirá" }, { slug: "sopo", nombre: "Sopó" },
  { slug: "suba", nombre: "Suba" }, { slug: "norte-bogota", nombre: "Norte de Bogotá" }, { slug: "funza", nombre: "Funza" }, { slug: "villadeleyva", nombre: "Villa de Leyva" },
  { slug: "la-vega", nombre: "La Vega" }, { slug: "madrid", nombre: "Madrid" }, { slug: "tocancipa", nombre: "Tocancipá" },
  { slug: "tunja", nombre: "Tunja" }, { slug: "duitama", nombre: "Duitama" }, { slug: "paipa", nombre: "Paipa" }, { slug: "samaca", nombre: "Samacá" }, { slug: "boyaca", nombre: "Boyacá" },
  { slug: "barbosa", nombre: "Barbosa" }, { slug: "choconta", nombre: "Chocontá" }, { slug: "san-francisco", nombre: "San Francisco" },
  { slug: "supata", nombre: "Supatá" }, { slug: "pacho", nombre: "Pacho" }, { slug: "puente-nacional", nombre: "Puente Nacional" },
  { slug: "la-mesa", nombre: "La Mesa" }, { slug: "mesitas-del-colegio", nombre: "Mesitas del Colegio" }, { slug: "facatativa", nombre: "Facatativá" },
  { slug: "sogamoso", nombre: "Sogamoso" }, { slug: "firavitoba", nombre: "Firavitoba" }, { slug: "valle-de-tenza", nombre: "Valle de Tenza" },
  { slug: "velez", nombre: "Vélez" }, { slug: "subachoque", nombre: "Subachoque" }, { slug: "soacha", nombre: "Soacha" },
  { slug: "guasca", nombre: "Guasca" },
  { slug: "sesquile", nombre: "Sesquilé" },
  { slug: "la-calera", nombre: "La Calera" }, { slug: "villeta", nombre: "Villeta" }, { slug: "raquira", nombre: "Ráquira" },
  { slug: "chiquinquira", nombre: "Chiquinquirá" }
];

function urlEncode(str) {
  return encodeURIComponent(str).replace(/!/g, "%21").replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/~/g, "%7E");
}

function getWhatsAppHref(nombre) {
  const text = `Hola CONCASAYA, estoy interesado en una casa prefabricada en ${nombre}. Me gustaría recibir más información.`;
  return `https://wa.me/573142891018?text=${urlEncode(text)}`;
}

const CSS_BLOCK = `
      /* Barra inferior de redes sociales */
      .cta-attention { position: relative; isolation: isolate; }
      .cta-attention::before {
        content: ""; position: absolute; inset: -4px; border-radius: 9999px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        box-shadow: 0 0 0 0 rgba(0, 119, 182, 0.55); opacity: 0.9;
        transform: scale(0.9); animation: ctaPulse 2.2s ease-out infinite; z-index: -1;
      }
      .cta-attention-whatsapp::before {
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.55); border-color: rgba(34, 197, 94, 0.5);
      }
      @keyframes ctaPulse {
        0% { opacity: 0.9; transform: scale(0.9); box-shadow: 0 0 0 0 rgba(0, 119, 182, 0.5); }
        70% { opacity: 0; transform: scale(1.25); box-shadow: 0 0 0 12px rgba(0, 119, 182, 0); }
        100% { opacity: 0; transform: scale(1.25); box-shadow: 0 0 0 0 rgba(0, 119, 182, 0); }
      }
      body:has(#social-bottom-bar) footer {
        padding-bottom: calc(2rem + 4.75rem + env(safe-area-inset-bottom, 0px)) !important;
      }`;

function getBarBlock(waHref) {
  return `
    <div id="social-bottom-bar-spacer" aria-hidden="true"></div>
    <!-- Barra inferior con WhatsApp y redes sociales -->
    <div class="fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <div id="social-bottom-bar" class="flex items-center gap-3 px-4 py-3 w-full justify-center bg-white/10 backdrop-blur-md border-t border-white/15 shadow-[0_-8px_30px_rgba(0,0,0,0.25)]">
        <a href="${waHref}" target="_blank" aria-label="WhatsApp" class="cta-attention cta-attention-whatsapp w-11 h-11 rounded-full flex items-center justify-center bg-white border border-green-400/60 text-green-600 shadow-md transition-all duration-300 hover:bg-white hover:border-green-500 hover:-translate-y-0.5 hover:scale-110 relative">
          <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white shadow-[0_0_0_2px_rgba(239,68,68,0.6)] animate-pulse"></span>
          <i class="fab fa-whatsapp text-lg"></i>
        </a>
        <a href="https://www.tiktok.com/@concasayaprefabricados" target="_blank" aria-label="TikTok" class="w-11 h-11 rounded-full flex items-center justify-center bg-black/80 backdrop-blur-sm border border-white/20 text-white shadow-md transition-transform duration-200 hover:-translate-y-0.5 hover:scale-110">
          <i class="fab fa-tiktok text-lg"></i>
        </a>
        <a href="https://www.instagram.com/concasaya" target="_blank" aria-label="Instagram" class="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-400 text-white shadow-md backdrop-blur-sm border border-white/30 transition-transform duration-200 hover:-translate-y-0.5 hover:scale-110">
          <i class="fab fa-instagram text-lg"></i>
        </a>
        <a href="https://www.facebook.com/concasaya/" target="_blank" aria-label="Facebook" class="w-11 h-11 rounded-full flex items-center justify-center bg-blue-600/90 hover:bg-blue-700 text-white shadow-md backdrop-blur-sm border border-white/20 transition-transform duration-200 hover:-translate-y-0.5 hover:scale-110">
          <i class="fab fa-facebook-f text-lg"></i>
        </a>
      </div>
    </div>`;
}

// Regex: div con "fixed" + "bottom" + "right" + "z-50" (ambas variantes: bottom-5 right-5 o bottom-4 sm:bottom-5 right-4 sm:right-5)
// Opcional: script con fabMainButton después. No exigir AOS inmediato (algunos tienen otro script antes)
const FLOATING_BLOCK_RE = /<div\s+[^>]*class="[^"]*fixed[^"]*bottom[^"]*right[^"]*z-50[^"]*"[^>]*>[\s\S]*?<\/div>\s*(?:<script>[\s\S]*?fabMainButton[\s\S]*?<\/script>\s*)?/i;

let updated = 0;
for (const m of MUNICIPIOS) {
  const f = m.slug + ".html";
  const fp = path.join(pagesDir, f);
  if (!fs.existsSync(fp)) continue;
  let c = fs.readFileSync(fp, "utf8");
  if (c.includes("id=\"social-bottom-bar\"")) {
    console.log("OK (ya tiene barra):", f);
    continue;
  }
  let changed = false;
  c = c.replace("</style>", CSS_BLOCK + "\n    </style>");
  changed = true;
  const waHref = getWhatsAppHref(m.nombre);
  const barBlock = getBarBlock(waHref);
  if (FLOATING_BLOCK_RE.test(c)) {
    c = c.replace(FLOATING_BLOCK_RE, barBlock + "\n\n    ");
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(fp, c, "utf8");
    updated++;
    console.log("Actualizado:", f);
  } else {
    console.log("Sin cambio (no match):", f);
  }
}
console.log("\nTotal actualizados:", updated);
