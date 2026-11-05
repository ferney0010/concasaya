// Captura una seccion concreta de una pagina (por selector) para revisarla.
// Usa CDP con scroll real para que AOS dispare.
//
// Uso: node scripts/captura-seccion.mjs <url> <selector> <nombre> [ancho]
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", ".tmp-capturas");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9377;

const URL_TARGET = process.argv[2];
const SELECTOR = process.argv[3];
const NOMBRE = process.argv[4] || "seccion";
const ANCHO = parseInt(process.argv[5] || "1280", 10);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  if (!URL_TARGET || !SELECTOR) {
    console.error("Uso: node scripts/captura-seccion.mjs <url> <selector> <nombre> [ancho]");
    process.exit(1);
  }
  mkdirSync(OUT_DIR, { recursive: true });
  const profileDir = join(tmpdir(), "cdp-sec-" + Date.now());

  const chrome = spawn(CHROME, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profileDir}`,
    "--hide-scrollbars",
    "--no-first-run",
    "--disable-gpu",
    "about:blank",
  ]);
  chrome.stderr.on("data", () => {});
  let version = null;
  for (let i = 0; i < 40; i++) {
    try {
      version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
      break;
    } catch {
      await sleep(250);
    }
  }
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((res) => ws.addEventListener("open", res, { once: true }));

  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
    }
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const i = ++id;
      pending.set(i, { resolve, reject });
      ws.send(JSON.stringify({ id: i, method, params, sessionId }));
    });

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send(
    "Emulation.setDeviceMetricsOverride",
    { width: ANCHO, height: 900, deviceScaleFactor: 1, mobile: ANCHO < 700 },
    sessionId
  );
  await send("Page.navigate", { url: URL_TARGET }, sessionId);
  await sleep(2200);

  // Recorre la pagina para que AOS dispare, y vuelve al objetivo.
  const r = await send(
    "Runtime.evaluate",
    {
      expression: `(async () => {
        const alto = document.body.scrollHeight;
        for (let y = 0; y < alto; y += 350) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 45));
        }
        const el = document.querySelector(${JSON.stringify(SELECTOR)});
        if (!el) return 'NO ENCONTRADO';
        el.scrollIntoView({block:'start'});
        await new Promise(r => setTimeout(r, 700));
        const r = el.getBoundingClientRect();
        return JSON.stringify({
          top: Math.round(r.top), height: Math.round(r.height),
          scrollW: document.documentElement.scrollWidth,
          clientW: document.documentElement.clientWidth,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
        });
      })()`,
      awaitPromise: true,
      returnByValue: true,
    },
    sessionId
  );
  console.log("medicion:", r.result.value);

  const shot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
  const file = join(OUT_DIR, `${NOMBRE}.png`);
  writeFileSync(file, Buffer.from(shot.data, "base64"));
  console.log(`-> ${file}`);

  ws.close();
  chrome.kill();
  try {
    rmSync(profileDir, { recursive: true, force: true });
  } catch {}
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
