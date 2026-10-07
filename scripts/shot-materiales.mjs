import { spawn } from 'node:child_process';
import fs from 'node:fs';

const PORT = 9223;
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  '--remote-debugging-port=' + PORT, 'about:blank'
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function cdp(ws, method, params) {
  return new Promise((resolve) => {
    const id = Math.floor(Math.random() * 1e9);
    const to = setTimeout(() => resolve({ timeout: true }), 20000);
    const onMsg = (data) => {
      const msg = JSON.parse(data);
      if (msg.id === id) { clearTimeout(to); ws.off('message', onMsg); resolve(msg); }
    };
    ws.on('message', onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function run() {
  await sleep(2500);
  const list = await fetch('http://127.0.0.1:' + PORT + '/json/list').then((r) => r.json());
  const target = list.find((t) => t.type === 'page');
  const { WebSocket } = await import('ws').catch(() => ({ WebSocket: globalThis.WebSocket }));
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.on('open', r));
  await cdp(ws, 'Page.enable');

  const shots = [
    { name: 'mat-cards-desktop.png', w: 1440, h: 1000, mobile: false, y: 1500 },
    { name: 'mat-cards-mobile.png', w: 390, h: 1400, mobile: true, y: 2750 }
  ];

  for (const s of shots) {
    await cdp(ws, 'Emulation.setDeviceMetricsOverride', {
      width: s.w, height: s.h, deviceScaleFactor: 2, mobile: s.mobile
    });
    await cdp(ws, 'Page.navigate', { url: 'http://localhost:3000/materiales.html' });
    await sleep(3500);
    await cdp(ws, 'Runtime.evaluate', { expression: 'window.scrollTo(0,' + s.y + ')' });
    await sleep(2000);
    const r = await cdp(ws, 'Page.captureScreenshot', { format: 'png' });
    if (r.result && r.result.data) {
      fs.writeFileSync('C:/Workspace/concasaya/tmp-shots/' + s.name, Buffer.from(r.result.data, 'base64'));
      console.log('OK ' + s.name);
    } else {
      console.log('FALLO ' + s.name + ' ' + JSON.stringify(r).slice(0, 200));
    }
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}
run();
