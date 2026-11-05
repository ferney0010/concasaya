// Captura screenshots reales (movil y escritorio) via CDP directo.
// El AGENTS.md advierte que `chrome --headless --screenshot` miente en movil
// (no aplica device emulation), asi que se usa CDP con
// Emulation.setDeviceMetricsOverride, que es lo que hace DevTools.
//
// Uso: node scripts/captura-plaqueta.mjs [url]
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", ".tmp-capturas");
const URL_TARGET = process.argv[2] || "http://localhost:3000/plaqueta-de-concreto";
const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9333;

// Perfiles: mobile real (iPhone 13 class) y escritorio 1440.
const PROFILES = [
  {
    name: "movil",
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
    fullPage: true,
  },
  {
    name: "escritorio",
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
    fullPage: false,
  },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getJson(url) {
  const res = await fetch(url);
  return res.json();
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const profileDir = join(tmpdir(), "cdp-plaqueta-" + Date.now());

  const chrome = spawn(CHROME, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profileDir}`,
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "about:blank",
  ]);
  chrome.stderr.on("data", () => {});

  // Esperar a que el puerto de depuracion responda.
  let version = null;
  for (let i = 0; i < 40; i++) {
    try {
      version = await getJson(`http://127.0.0.1:${PORT}/json/version`);
      break;
    } catch {
      await sleep(250);
    }
  }
  if (!version) {
    chrome.kill();
    throw new Error("Chrome no abrio el puerto de depuracion");
  }

  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", rej, { once: true });
  });
  const cdp = new Cdp(ws);

  const { targetId } = await cdp.send("Target.createTarget", {
    url: "about:blank",
  });
  const { sessionId } = await cdp.send("Target.attachToTarget", {
    targetId,
    flatten: true,
  });

  // En sesion flatten hay que mandar sessionId en cada mensaje.
  const rawSend = cdp.send.bind(cdp);
  cdp.send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++cdp.id;
      cdp.pending.set(id, { resolve, reject });
      cdp.ws.send(JSON.stringify({ id, method, params, sessionId }));
    });

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  for (const p of PROFILES) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: p.width,
      height: p.height,
      deviceScaleFactor: p.deviceScaleFactor,
      mobile: p.mobile,
    });
    if (p.mobile) {
      await cdp.send("Emulation.setTouchEmulationEnabled", {
        enabled: true,
        maxTouchPoints: 5,
      });
      await cdp.send("Emulation.setUserAgentOverride", {
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        platform: "iPhone",
      });
    }

    await cdp.send("Page.navigate", { url: URL_TARGET });
    await sleep(2600);

    // AOS (fade-up) solo marca los elementos cuando entran en el viewport.
    // En una captura de pagina completa el scroll virtual no dispara el
    // evento, asi que hay que recorrer la pagina de verdad antes de capturar.
    if (p.fullPage) {
      await cdp.send("Runtime.evaluate", {
        expression: `(async () => {
          const alto = document.body.scrollHeight;
          for (let y = 0; y < alto; y += 400) {
            window.scrollTo(0, y);
            await new Promise(r => setTimeout(r, 60));
          }
          window.scrollTo(0, 0);
          await new Promise(r => setTimeout(r, 400));
        })()`,
        awaitPromise: true,
      });
      await sleep(900);
    }

    // Medir el ancho de scroll: si el body se pasa del viewport hay
    // desbordamiento horizontal (el sintoma clasico de un hero roto).
    const metrics = await cdp.send("Runtime.evaluate", {
      expression: `JSON.stringify({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        innerW: window.innerWidth,
        title: document.title,
        total: (document.getElementById('pq-total')||{}).textContent || null,
        chips: document.querySelectorAll('#pq-chips .pq-chip').length,
        filas: document.querySelectorAll('#pq-table-body tr').length,
        waHref: (document.getElementById('pq-wa')||{}).getAttribute ? document.getElementById('pq-wa').getAttribute('href') : null
      })`,
      returnByValue: true,
    });
    const info = JSON.parse(metrics.result.value);
    const overflow = info.scrollW > info.clientW + 1;
    console.log(
      `[${p.name}] ${p.width}x${p.height} | scrollW=${info.scrollW} clientW=${info.clientW}` +
        ` | overflowHorizontal=${overflow ? "SI <<< PROBLEMA" : "no"}` +
        ` | chips=${info.chips} filas=${info.filas} total=${info.total}`
    );

    let shot;
    if (p.fullPage) {
      const { contentSize } = await cdp.send("Page.getLayoutMetrics");
      const h = Math.min(Math.ceil(contentSize.height), 6000);
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: p.width,
        height: h,
        deviceScaleFactor: 1,
        mobile: p.mobile,
      });
      await sleep(700);
      shot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
      });
    } else {
      shot = await cdp.send("Page.captureScreenshot", { format: "png" });
    }
    const file = join(OUT_DIR, `plaqueta-${p.name}.png`);
    writeFileSync(file, Buffer.from(shot.data, "base64"));
    console.log(`  -> ${file}`);
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
