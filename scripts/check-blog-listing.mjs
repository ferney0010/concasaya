// Test definitivo: descarga el blog, pre-setea localStorage para que el modal
// anti-estafa no aparezca, y captura el listado de posts (incluyendo el nuevo).
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "tmp-test");

// 1) Descargar el blog.html
const blogUrl = "https://www.concasaya.com/blog.html";
const blogHtml = await (await fetch(blogUrl)).text();

// 2) Inyectar script que pre-setea localStorage ANTES de que se cargue el security-alert
const injectScript = `<script>
  try {
    localStorage.setItem('concasaya_sa_ack_v1', JSON.stringify({ack: true, ts: Date.now(), version: 1}));
  } catch(e) {}
</script>`;

// Insertar antes del security-alert.js
const modified = blogHtml.replace(
  /<script src="\/assets\/js\/security-alert\.js"><\/script>/,
  `${injectScript}<script src="/assets/js/security-alert.js"></script>`
);

// Reescribir las URLs de los assets para que carguen desde el dominio real
const final = modified
  .replace(/src="\.\/supabaseClient\.js"/g, 'src="https://www.concasaya.com/supabaseClient.js"')
  .replace(/src="\.\/blog\/static-posts-config\.js"/g, 'src="https://www.concasaya.com/blog/static-posts-config.js"');

const localFile = join(outDir, "_blog-nomodal.html");
writeFileSync(localFile, final, "utf8");
console.log("HTML preparado:", localFile);

// 3) Screenshot
const out = join(outDir, "check-blog-nomodal.png");
spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  "--virtual-time-budget=10000",
  "--window-size=1280,2400",
  `--screenshot=${out}`,
  `file:///${localFile.replace(/\\/g, "/")}`
], { stdio: "ignore" });
await sleep(11000);
console.log("Screenshot:", out);
