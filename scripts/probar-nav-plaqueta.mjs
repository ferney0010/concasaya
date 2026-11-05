// Prueba el enlace "Plaqueta" en el nav desktop REAL de las paginas del
// sitio: lo inyecta y mide si desborda a 1024 / 1280 / 1440 px.
// Uso: node scripts/probar-nav-plaqueta.mjs [url...]
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9355;
const URLS = process.argv.slice(2);
if (!URLS.length) URLS.push("http://localhost:3000/index.html");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const profileDir = join(tmpdir(), "cdp-navtest-" + Date.now());
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

  // Inyecta el mismo anchor que usa la pagina nueva.
  const INJECT = `(() => {
    const nav = document.querySelector('.nav-desktop-primary');
    if (!nav) return 'sin-nav';
    if (nav.querySelector('a[href="/plaqueta-de-concreto"]')) return 'ya-existe';
    const mat = Array.from(nav.children).find(a => a.getAttribute && a.getAttribute('href') === '/materiales');
    if (!mat) return 'sin-materiales';
    const a = document.createElement('a');
    a.href = '/plaqueta-de-concreto';
    a.className = 'text-primary font-bold transition duration-300';
    a.textContent = 'Plaqueta';
    mat.after(a);
    return 'ok';
  })()`;

  for (const url of URLS) {
    for (const width of [1024, 1100, 1280, 1440]) {
      await send(
        "Emulation.setDeviceMetricsOverride",
        { width, height: 900, deviceScaleFactor: 1, mobile: false },
        sessionId
      );
      await send("Page.navigate", { url }, sessionId);
      await sleep(1300);
      const inj = await send(
        "Runtime.evaluate",
        { expression: INJECT, returnByValue: true },
        sessionId
      );
      await sleep(300);
      const r = await send(
        "Runtime.evaluate",
        {
          expression: `(() => {
            try {
            const nav = document.querySelector('.nav-desktop-primary');
            if (!nav) return JSON.stringify({error:'sin-nav'});
            const cont = nav.closest('nav');
            const navR = nav.getBoundingClientRect();
            const contR = cont.getBoundingClientRect();
            const logo = cont.querySelector('a[href="/"]');
            const logoR = logo ? logo.getBoundingClientRect() : null;
            const cs = getComputedStyle(nav);
            const gap = parseFloat(cs.columnGap) || 0;
            const suma = Array.from(nav.children).reduce((a,c) => a + c.getBoundingClientRect().width, 0);
            const total = suma + gap * (nav.children.length - 1);
            return JSON.stringify({
              items: nav.children.length,
              anchoNav: Math.round(navR.width),
              navLeft: Math.round(navR.left),
              logoRight: logoR ? Math.round(logoR.right) : null,
              contW: Math.round(contR.width),
              total: Math.round(total),
              solapa: logoR ? navR.left < logoR.right : null,
              bodyOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
            });
            } catch (e) { return JSON.stringify({error: String(e)}); }
          })()`,
          returnByValue: true,
        },
        sessionId
      );
      const raw = r && r.result && r.result.value;
      if (!raw) {
        console.log(`${url} @${width}px | SIN MEDICION (iny=${inj.result.value})`);
        continue;
      }
      const info = JSON.parse(raw);
      if (info.error) {
        console.log(`${url} @${width}px | ERROR ${info.error}`);
        continue;
      }
      console.log(
        `${url.replace("http://localhost:3000", "") || "/"} @${width}px | iny=${inj.result.value} items=${info.items} nav=${info.anchoNav} total=${info.total} contW=${info.contW} navLeft=${info.navLeft} logoRight=${info.logoRight} solapa=${info.solapa ? "SI <<<" : "no"} bodyOverflow=${info.bodyOverflow}`
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
