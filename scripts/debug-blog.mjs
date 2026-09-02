// Debug: captura console.log/error/warn del blog.html via CDP.
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "tmp-test");
const logFile = join(outDir, "chrome.log");

// Limpiar log anterior
writeFileSync(logFile, "");

// Lanzar Chrome con remote debugging y logging a archivo
const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--hide-scrollbars",
  "--remote-debugging-port=9222",
  "--enable-logging=stderr",
  "--v=0",
  "--user-data-dir=" + join(outDir, "chrome-user"),
  "--virtual-time-budget=10000",
  "--window-size=1280,2000",
  "https://www.concasaya.com/blog.html"
], { stdio: ["ignore", "pipe", "pipe"] });

let allLog = "";
chrome.stderr.on("data", (chunk) => { allLog += chunk.toString(); });

await sleep(10000);

// Cerrar Chrome
chrome.kill();
await sleep(1000);

writeFileSync(logFile, allLog);

// Buscar console.log/error/warn
const lines = allLog.split("\n");
const interesting = lines.filter(l =>
  l.includes("CONSOLE") ||
  l.includes("JavaScript") ||
  l.includes("Error") ||
  l.includes("error") ||
  l.includes("undefined") ||
  l.includes("staticPosts") ||
  l.includes("blog-posts")
);

console.log("=== Console output capturado (filtrado) ===");
if (interesting.length === 0) {
  console.log("(Sin logs relevantes)");
  console.log("Total líneas:", lines.length);
} else {
  interesting.slice(0, 50).forEach(l => console.log(l));
}
