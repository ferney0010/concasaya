// Captura el nav (barra superior) de una pagina, para revisar como queda el
// enlace "Plaqueta" en escritorio y en movil.
// Uso: node scripts/captura-nav.mjs [url] [nombre]
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", ".tmp-capturas");
const URL_TARGET = process.argv[2] || "http://localhost:3000/";
const NOMBRE = process.argv[3] || "nav";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9366;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const profileDir = join(tmpdir(), "cdp-navcap-" + Date.now());
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

  for (const p of [
    { name: "escritorio", width: 1440, height: 160, dsf: 1, mobile: false },
    { name: "movil", width: 390, height: 700, dsf: 2, mobile: true },
  ]) {
    await send(
      "Emulation.setDeviceMetricsOverride",
      { width: p.width, height: p.height, deviceScaleFactor: p.dsf, mobile: p.mobile },
      sessionId
    );
    await send("Page.navigate", { url: URL_TARGET }, sessionId);
    await sleep(1800);

    if (p.mobile) {
      // Abrir el menu movil para ver el enlace en la lista.
      await send(
        "Runtime.evaluate",
        {
          expression: `(() => {
            const b = document.getElementById('menu-btn');
            if (b) b.click();
            return 'ok';
          })()`,
          returnByValue: true,
        },
        sessionId
      );
      await sleep(700);
    }

    const shot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
    const file = join(OUT_DIR, `${NOMBRE}-nav-${p.name}.png`);
    writeFileSync(file, Buffer.from(shot.data, "base64"));
    console.log(`-> ${file}`);
  }

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
