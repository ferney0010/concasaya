// Screenshot enfocado en la tabla de 4 rangos y los cards de costos ocultos
import { spawn } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "tmp-test");

const filePath = join(__dirname, "..", "blog", "casas-prefabricadas-economicas-colombia.html");
const original = readFileSync(filePath, "utf8");

// CSS extra: además de quitar animaciones, hacer scroll al medio del artículo
const noAnim = original
  .replace("</style>", "html { scroll-behavior: auto !important; } [data-aos], .post-content, .quick-answer, .cta-box, .sidebar-block, .sidebar-cta, .og-hero, .og-hero__content { opacity: 1 !important; transform: none !important; }</style>")
  .replace("</body>", '<script>window.addEventListener("load",()=>{setTimeout(()=>{const el=document.getElementById("rangos-precio");if(el){const r=el.getBoundingClientRect();window.scrollTo(0,r.top+window.pageYOffset-60);}},200);});</script></body>');

const previewFile = join(outDir, "_preview-tabla.html");
writeFileSync(previewFile, noAnim, "utf8");
const fileUrl = `file:///${previewFile.replace(/\\/g, "/")}`;

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

// Tabla de 4 rangos
const out1 = join(outDir, "preview-economicas-tabla.png");
spawn(chrome, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  "--virtual-time-budget=4000",
  "--window-size=1280,1400",
  `--screenshot=${out1}`, fileUrl
], { stdio: "ignore" });
await sleep(4500);

// Costos ocultos (cards)
const noAnim2 = original
  .replace("</style>", "html { scroll-behavior: auto !important; } [data-aos], .post-content, .quick-answer, .cta-box, .sidebar-block, .sidebar-cta, .og-hero, .og-hero__content { opacity: 1 !important; transform: none !important; }</style>")
  .replace("</body>", '<script>window.addEventListener("load",()=>{setTimeout(()=>{const el=document.getElementById("costos-ocultos");if(el){const r=el.getBoundingClientRect();window.scrollTo(0,r.top+window.pageYOffset-60);}},200);});</script></body>');

const previewFile2 = join(outDir, "_preview-cards.html");
writeFileSync(previewFile2, noAnim2, "utf8");
const fileUrl2 = `file:///${previewFile2.replace(/\\/g, "/")}`;

const out2 = join(outDir, "preview-economicas-cards.png");
spawn(chrome, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  "--virtual-time-budget=4000",
  "--window-size=1280,1200",
  `--screenshot=${out2}`, fileUrl2
], { stdio: "ignore" });
await sleep(4500);

console.log("✓ Tabla:  ", out1);
console.log("✓ Cards:  ", out2);
