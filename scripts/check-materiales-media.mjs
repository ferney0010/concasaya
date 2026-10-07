import { spawn } from 'node:child_process';
import http from 'node:http';

const PORT = 9222;
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  '--remote-debugging-port=' + PORT,
  'about:blank'
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(path) {
  const res = await fetch('http://127.0.0.1:' + PORT + path);
  return res.json();
}

function cdp(ws, method, params, sessionId) {
  return new Promise((resolve) => {
    const id = Math.floor(Math.random() * 1e9);
    const to = setTimeout(() => resolve({ timeout: true }), 15000);
    const onMsg = (data) => {
      const msg = JSON.parse(data);
      if (msg.id === id) {
        clearTimeout(to);
        ws.off('message', onMsg);
        resolve(msg);
      }
    };
    ws.on('message', onMsg);
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
}

async function run() {
  await sleep(2500);
  const list = await getJson('/json/list');
  const target = list.find((t) => t.type === 'page');
  const { WebSocket } = await import('ws').catch(() => ({ WebSocket: globalThis.WebSocket }));
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.on('open', r));

  await cdp(ws, 'Page.enable');
  const metrics = [
    { name: 'desktop', width: 1440, height: 900, mobile: false },
    { name: 'mobile', width: 390, height: 844, mobile: true }
  ];

  for (const m of metrics) {
    await cdp(ws, 'Emulation.setDeviceMetricsOverride', {
      width: m.width, height: m.height, deviceScaleFactor: 2, mobile: m.mobile
    });
    await cdp(ws, 'Page.navigate', { url: 'http://localhost:3000/materiales.html' });
    await sleep(3200);
    await cdp(ws, 'Runtime.evaluate', { expression: 'window.scrollTo(0, 1500)' });
    await sleep(1800);

    const expr = `(() => {
      const imgs = [...document.querySelectorAll('.mc-media img')];
      const cards = [...document.querySelectorAll('.mc-card')];
      const doc = document.documentElement;
      const media = imgs.map(i => ({
        src: i.currentSrc.split('/').pop(),
        w: i.naturalWidth,
        h: Math.round(i.getBoundingClientRect().height),
        top: Math.round(i.getBoundingClientRect().top),
        r: Math.round(i.getBoundingClientRect().right)
      }));
      const iconGap = cards[0] ? (() => {
        const m = cards[0].querySelector('.mc-media').getBoundingClientRect();
        const ic = cards[0].querySelector('.mc-icon').getBoundingClientRect();
        return Math.round(ic.top - m.bottom);
      })() : null;
      return JSON.stringify({
        overflow: doc.scrollWidth - doc.clientWidth,
        cols: getComputedStyle(document.querySelector('.mc-grid')).gridTemplateColumns.split(' ').length,
        cardHeights: cards.map(c => Math.round(c.getBoundingClientRect().height)),
        iconGapBajoFoto: iconGap,
        totalH: Math.round(doc.scrollHeight),
        media
      });
    })()`;

    const r = await cdp(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true });
    console.log('=== ' + m.name + ' RAW ===');
    console.log(JSON.stringify(r).slice(0, 1500));
    if (r.result && r.result.result && typeof r.result.result.value === 'string') {
      console.log(JSON.stringify(JSON.parse(r.result.result.value), null, 1));
    }
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

run();