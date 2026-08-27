// Toma screenshots del artículo renderizado con Chrome headless
// para preview visual antes de commitear.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "tmp-test");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// HTML temporal con CSS que desactiva las animaciones AOS
// (sin esto, el contenido queda con opacity:0 y el screenshot sale vacío).
const filePath = join(__dirname, "..", "blog", "casas-prefabricadas-economicas-colombia.html");
const original = await import("node:fs").then(m => m.readFileSync(filePath, "utf8"));
const noAnim = original
  .replace("</style>", "[data-aos], .post-content, .quick-answer, .cta-box, .sidebar-block, .sidebar-cta, .og-hero, .og-hero__content { opacity: 1 !important; transform: none !important; } html { scroll-behavior: auto !important; }</style>");
const previewFile = join(outDir, "_preview-economicas-noanim.html");
writeFileSync(previewFile, noAnim, "utf8");
const fileUrl = `file:///${previewFile.replace(/\\/g, "/")}`;

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

// 1) Hero (top del artículo)
const heroOut = join(outDir, "preview-economicas-hero.png");
spawn(chrome, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  "--virtual-time-budget=2000",
  "--window-size=1280,720",
  `--screenshot=${heroOut}`, fileUrl
], { stdio: "ignore" });
await sleep(3500);

// 2) Vista media (hero + quick answer + tabla de 4 gamas)
const midOut = join(outDir, "preview-economicas-mid.png");
spawn(chrome, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  "--virtual-time-budget=2000",
  "--window-size=1280,1800",
  `--screenshot=${midOut}`, fileUrl
], { stdio: "ignore" });
await sleep(3500);

// 3) Vista completa (full-page)
const fullOut = join(outDir, "preview-economicas-full.png");
spawn(chrome, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  "--virtual-time-budget=2000",
  "--window-size=1280,5400",
  `--screenshot=${fullOut}`, fileUrl
], { stdio: "ignore" });
await sleep(5000);

// 4) Vista mobile (375x812) para verificar responsive
const mobileOut = join(outDir, "preview-economicas-mobile.png");
spawn(chrome, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  "--virtual-time-budget=2000",
  "--window-size=375,1800",
  `--screenshot=${mobileOut}`, fileUrl
], { stdio: "ignore" });
await sleep(3500);

console.log("✓ Screenshots guardados:");
console.log("  Hero:   ", heroOut);
console.log("  Mid:    ", midOut);
console.log("  Full:   ", fullOut);
console.log("  Mobile: ", mobileOut);
