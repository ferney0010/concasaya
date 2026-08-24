// Test: ver la pagina de politica con el modal cerrado para inspeccionar el hero
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://127.0.0.1:8765/proteccion-contra-estafas.html';
const OUT_DIR = path.join(__dirname, 'tmp-test');
const OUT_FILE = path.join(OUT_DIR, 'policy-hero-only.png');

const profileDir = path.join(OUT_DIR, 'profile5');
const port = 9223;
const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--hide-scrollbars',
  `--user-data-dir=${profileDir}`,
  `--remote-debugging-port=${port}`,
  '--window-size=420,1800',
  URL
];

const chrome = spawn(CHROME, args, { stdio: 'ignore' });

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  let info = null;
  for (let i = 0; i < 30; i++) {
    await delay(500);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) { info = await res.json(); break; }
    } catch (e) {}
  }
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const tab = tabs[0];
  const WebSocket = require('ws');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  });
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const reqId = ++id;
      pending.set(reqId, resolve);
      ws.send(JSON.stringify({ id: reqId, method, params }));
    });
  }
  await new Promise(r => ws.once('open', r));
  await send('Page.enable');
  await delay(2000);

  // Marcar el modal como acknowledged y recargar
  await send('Runtime.evaluate', { expression: `localStorage.setItem('concasaya_sa_ack_v1', JSON.stringify({ack:true, ts:Date.now(), version:1}))` });
  await send('Page.reload', { ignoreCache: true });
  await delay(2500);

  // Top de la pagina
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
  await delay(500);
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(OUT_FILE, Buffer.from(shot1.result.data, 'base64'));
  console.log('Hero top guardado:', OUT_FILE);

  // Desktop size screenshot del hero
  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch(e => { console.error(e); chrome.kill(); process.exit(1); });
