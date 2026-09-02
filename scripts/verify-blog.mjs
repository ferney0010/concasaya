// Screenshot del blog con el modal cerrado via localStorage pre-seteado.
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "tmp-test");

// Descargar blog.html, inyectar script que setea localStorage para saltar el modal,
// y reescribir las rutas absolutas a https://www.concasaya.com
const blogUrl = "https://www.concasaya.com/blog.html";
let blogHtml = await (await fetch(blogUrl)).text();

blogHtml = blogHtml
  .replace('<script src="/assets/js/security-alert.js"></script>',
    '<script>try { localStorage.setItem("concasaya_sa_ack_v1", JSON.stringify({ack:true,ts:Date.now(),version:1})); } catch(e) {}</script><script src="/assets/js/security-alert.js"></script>')
  .replace('import { supabase } from "./supabaseClient.js";',
    'import { supabase } from "https://www.concasaya.com/supabaseClient.js";')
  .replace('import { staticPosts, applyThumbnailFlipEffective } from "./blog/static-posts-config.js";',
    'import { staticPosts, applyThumbnailFlipEffective } from "https://www.concasaya.com/blog/static-posts-config.js";');

const localFile = join(outDir, "_blog-verify.html");
writeFileSync(localFile, blogHtml, "utf8");

// Screenshot
const out = join(outDir, "verify-blog.png");
spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  "--virtual-time-budget=12000",
  "--window-size=1280,2400",
  `--screenshot=${out}`,
  `file:///${localFile.replace(/\\/g, "/")}`
], { stdio: "ignore" });
await sleep(13000);
console.log("Screenshot:", out);
