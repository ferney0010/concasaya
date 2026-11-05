// Mide el espacio libre del nav desktop para saber si cabe un enlace mas.
// Uso: node scripts/medir-nav.mjs [url...]
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9344;
const URLS = process.argv.slice(2);
if (!URLS.length) URLS.push("http://localhost:3000/index.html");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const profileDir = join(tmpdir(), "cdp-nav-" + Date.now());
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

  for (const url of URLS) {
    // Se mide en 1440 (escritorio grande) y en 1280 (escritorio pequeno,
    // el breakpoint lg arranca en 1024).
    for (const width of [1440, 1280, 1024]) {
      await send(
        "Emulation.setDeviceMetricsOverride",
        { width, height: 900, deviceScaleFactor: 1, mobile: false },
        sessionId
      );
      await send("Page.navigate", { url }, sessionId);
      await sleep(1400);
      const r = await send(
        "Runtime.evaluate",
        {
          expression: `(() => {
            const nav = document.querySelector('.nav-desktop-primary');
            if (!nav) return JSON.stringify({error:'sin nav'});
            const cont = nav.closest('nav');
            const cs = getComputedStyle(nav);
            const estilos = [];
            for (const c of nav.children) {
              const r2 = c.getBoundingClientRect();
              estilos.push(Math.round(r2.width));
            }
            return JSON.stringify({
              navScrollW: nav.scrollWidth,
              navClientW: nav.clientWidth,
              contClientW: cont.clientWidth,
              sumaAnchos: estilos.reduce((a,b)=>a+b,0),
              gap: cs.gap,
              items: estilos.length,
              overflowBody: document.documentElement.scrollWidth > document.documentElement.clientWidth
            });
          })()`,
          returnByValue: true,
        },
        sessionId
      );
      const info = JSON.parse(r.result.value);
      const gapTotal = info.gap ? parseFloat(info.gap) * (info.items - 1) : 0;
      const usado = info.sumaAnchos + gapTotal;
      const libre = info.contClientW - usado;
      console.log(
        `${url} @${width}px | items=${info.items} usado=${Math.round(usado)} cont=${info.contClientW} LIBRE=${Math.round(libre)}px`
      );
    }
  }

  ws.close();
  chrome.kill();
  try {
    (await import("node:fs")).rmSync(profileDir, { recursive: true, force: true });
  } catch {}
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
