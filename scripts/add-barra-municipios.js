/**
 * Añade la barra inferior (chatbot + WhatsApp + redes) a municipios que no la tienen.
 * Solo reemplaza el bloque "fixed bottom-5 right-5" - no toca nada más.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const pagesDir = path.join(root, "pages");

const MUNICIPIOS = [
  { slug: "chia", nombre: "Chía" }, { slug: "cajica", nombre: "Cajicá" }, { slug: "cota", nombre: "Cota" },
  { slug: "mosquera", nombre: "Mosquera" }, { slug: "zipaquira", nombre: "Zipaquirá" }, { slug: "sopo", nombre: "Sopó" },
  { slug: "suba", nombre: "Suba" }, { slug: "funza", nombre: "Funza" }, { slug: "villadeleyva", nombre: "Villa de Leyva" },
  { slug: "la-vega", nombre: "La Vega" }, { slug: "madrid", nombre: "Madrid" }, { slug: "tocancipa", nombre: "Tocancipá" },
  { slug: "tunja", nombre: "Tunja" }, { slug: "santa-marta", nombre: "Santa Marta" }, { slug: "boyaca", nombre: "Boyacá" },
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
      .chatbot-modal.is-open { opacity: 1; pointer-events: auto; }
      .chatbot-modal.is-open .chatbot-modal-content { transform: scale(1); }`;

function getBarBlock(waHref) {
  return `
    <!-- Barra inferior con chatbot, WhatsApp y redes sociales -->
    <div class="fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <div id="social-bottom-bar" class="flex items-center gap-3 px-4 py-3 w-full justify-center bg-white/10 backdrop-blur-md border-t border-white/15 shadow-[0_-8px_30px_rgba(0,0,0,0.25)]">
        <button type="button" id="chatbot-floating-btn" aria-label="Abrir asistente virtual" class="cta-attention w-11 h-11 rounded-full flex items-center justify-center bg-white border border-primary/40 text-primary shadow-md transition-all duration-300 hover:bg-white hover:border-primary hover:-translate-y-0.5 hover:scale-110">
          <i class="fas fa-robot text-lg"></i>
        </button>
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
    </div>
    <div id="chatbot-modal" class="chatbot-modal fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 opacity-0 pointer-events-none transition-all duration-300" aria-hidden="true" aria-modal="true" role="dialog">
      <div class="chatbot-modal-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm" data-close-modal></div>
      <div class="chatbot-modal-content relative flex flex-col w-full h-full sm:max-w-4xl sm:max-h-[90vh] sm:h-[85vh] sm:rounded-2xl sm:shadow-2xl overflow-hidden bg-white transform transition-all duration-300 scale-95">
        <div class="chatbot-modal-header flex-shrink-0 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-primary/90 text-white shadow-md">
          <span class="font-semibold text-sm sm:text-base flex items-center gap-2"><i class="fas fa-robot"></i> Asistente Virtual CONCASAYA</span>
          <button type="button" id="chatbot-modal-close" aria-label="Cerrar chatbot" class="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors duration-200">
            <i class="fas fa-times text-lg"></i>
          </button>
        </div>
        <div class="chatbot-modal-body flex-1 min-h-0 relative">
          <iframe id="chatbot-iframe" src="about:blank" title="Asistente Virtual CONCASAYA" class="absolute inset-0 w-full h-full border-0"></iframe>
        </div>
      </div>
    </div>
    <script>
      (function(){
        var m=document.getElementById("chatbot-modal"),btn=document.getElementById("chatbot-floating-btn"),closeBtn=document.getElementById("chatbot-modal-close"),iframe=document.getElementById("chatbot-iframe");
        function openModal(){if(iframe)iframe.src="/chatbot.html";if(m){m.classList.add("is-open");m.setAttribute("aria-hidden","false");}document.body.style.overflow="hidden";document.addEventListener("keydown",onEsc);}
        function closeModal(){if(m){m.classList.remove("is-open");m.setAttribute("aria-hidden","true");}document.body.style.overflow="";document.removeEventListener("keydown",onEsc);}
        function onEsc(e){if(e.key==="Escape")closeModal();}
        if(btn)btn.addEventListener("click",openModal);if(closeBtn)closeBtn.addEventListener("click",closeModal);
        if(m){var b=m.querySelector("[data-close-modal]");if(b)b.addEventListener("click",closeModal);}
      })();
    <\/script>`;
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
  if (!c.includes("chatbot-modal.is-open")) {
    c = c.replace("</style>", CSS_BLOCK + "\n    </style>");
    changed = true;
  }
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
