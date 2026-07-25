// smoke_test_modelos.mjs
// Headless Chrome test for modelos.html modal "Ver más" feature.
// Run: node scripts/smoke_test_modelos.mjs
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import { WebSocket } from 'ws';
import http from 'node:http';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://127.0.0.1:8000/modelos.html';
const PORT = 9222;

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--remote-debugging-port=' + PORT,
  '--user-data-dir=' + process.env.TEMP + '/chrome-test-' + Date.now(),
  URL
], { stdio: 'pipe' });

let chromeOut = '';
chrome.stderr.on('data', d => chromeOut += d.toString());

await wait(2500);

// Get debugger URL
const tabs = await new Promise((res, rej) => {
  http.get('http://127.0.0.1:' + PORT + '/json', r => {
    let body = '';
    r.on('data', c => body += c);
    r.on('end', () => res(JSON.parse(body)));
  }).on('error', rej);
});
const tab = tabs.find(t => t.url.includes('modelos.html'));
if (!tab) { console.error('No tab for modelos.html', tabs.map(t => t.url)); process.exit(1); }
const ws = new WebSocket(tab.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const consoleMessages = [];
const errors = [];
const results = {};

ws.on('message', m => {
  const msg = JSON.parse(m);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
  if (msg.method === 'Runtime.consoleAPICalled') {
    consoleMessages.push({ type: msg.params.type, text: msg.params.args.map(a => a.value).join(' ') });
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    errors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''));
  }
});

function send(method, params = {}) {
  const msgId = ++id;
  return new Promise(res => {
    pending.set(msgId, res);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

await new Promise(r => ws.once('open', r));
await send('Runtime.enable');
await send('Page.enable');
await send('Page.navigate', { url: URL });
await wait(3500);

async function eval_(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  return r.result?.result?.value;
}

// Test 1: Modal exists in DOM
results.modalExists = await eval_(`!!document.getElementById('categoryGalleryModal')`);

// Test 2: New modal is hidden by default
results.modalHidden = await eval_(`document.getElementById('categoryGalleryModal').style.display === '' || document.getElementById('categoryGalleryModal').style.display === 'none'`);

// Test 3: 11 buttons with data-category
results.cardButtons = await eval_(`document.querySelectorAll('.open-modal-btn[data-category]').length`);

// Test 4: All buttons say "Ver más"
results.verMasText = await eval_(`Array.from(document.querySelectorAll('.open-modal-btn[data-category]')).every(b => b.textContent.includes('Ver más'))`);

// Test 5: Tag count by category
results.thumbCounts = await eval_(`({
  cabana: document.querySelectorAll('.gallery-thumb[data-category="cabana"]').length,
  plaqueta: document.querySelectorAll('.gallery-thumb[data-category="plaqueta"]').length,
  '2pisos': document.querySelectorAll('.gallery-thumb[data-category="2pisos"]').length,
  cubo: document.querySelectorAll('.gallery-thumb[data-category="cubo"]').length,
  eps: document.querySelectorAll('.gallery-thumb[data-category="eps"]').length,
  materiales: document.querySelectorAll('.gallery-thumb[data-category="materiales"]').length,
  proceso: document.querySelectorAll('.gallery-thumb[data-category="proceso"]').length
})`);

// Test 6: Click first Cabana card and verify modal opens
results.cabanaModalOpens = await eval_(`(function(){
  const btn = document.querySelector('.open-modal-btn[data-category="cabana"][data-variant="vidrio"]');
  if (!btn) return 'no button found';
  btn.click();
  const modal = document.getElementById('categoryGalleryModal');
  const isOpen = modal.style.display === 'flex';
  return { isOpen, title: document.getElementById('cat-modal-title').textContent, count: document.getElementById('cat-modal-count').textContent };
})()`);

// Test 7: Tabs inside modal
results.cabanaTabs = await eval_(`Array.from(document.querySelectorAll('.cat-modal-tab')).map(t => ({ label: t.querySelector('span')?.textContent, count: t.querySelector('.cat-tab-count')?.textContent, active: t.classList.contains('active') }))`);

// Test 8: Click altillo tab and verify grid changes
results.altilloSwitch = await eval_(`(function(){
  const tab = Array.from(document.querySelectorAll('.cat-modal-tab')).find(t => t.textContent.includes('Con Altillo'));
  if (!tab) return 'no altillo tab';
  tab.click();
  return {
    activeTab: document.querySelector('.cat-modal-tab.active span')?.textContent,
    gridCount: document.getElementById('cat-modal-grid').children.length
  };
})()`);

// Test 9: Click Plaqueta card
results.plaquetaModal = await eval_(`(function(){
  // Close current modal first
  document.querySelector('.close-cat-modal').click();
  const btn = document.querySelector('.open-modal-btn[data-category="plaqueta"]');
  if (!btn) return 'no plaqueta button';
  btn.click();
  return {
    isOpen: document.getElementById('categoryGalleryModal').style.display === 'flex',
    title: document.getElementById('cat-modal-title').textContent,
    count: document.getElementById('cat-modal-count').textContent
  };
})()`);

// Test 10: Close modal with ESC
results.escClose = await eval_(`(function(){
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  return document.getElementById('categoryGalleryModal').style.display;
})()`);

// Test 11: Labels on Cabina panel Vidrio are hidden by default
results.labelsDefaultHidden = await eval_(`(() => {
  const vid = document.querySelector('.cabin-panel[data-panel="vidrio"]');
  const labels = vid ? vid.querySelectorAll('.cabin-thumb-label') : [];
  const allHidden = Array.from(labels).every(l => {
    const cs = window.getComputedStyle(l);
    return cs.opacity === '0' || parseFloat(cs.opacity) < 0.1;
  });
  return { count: labels.length, allHidden };
})()`);

// Test 12: Lightbox is functional after clicking a thumb in the modal
results.lightboxWorks = await eval_(`(function(){
  const btn = document.querySelector('.open-modal-btn[data-category="cubo"]');
  if (!btn) return 'no cubo button';
  btn.click();
  // simulate click on first gallery-thumb inside modal grid
  const first = document.querySelector('#cat-modal-grid .gallery-thumb');
  if (!first) return 'no thumb';
  first.click();
  return {
    modalOpen: document.getElementById('categoryGalleryModal').style.display === 'flex',
    lightboxOpen: document.getElementById('lightbox').classList.contains('is-open')
  };
})()`);

console.log('\n===== SMOKE TEST RESULTS =====');
for (const [k, v] of Object.entries(results)) {
  console.log(`  ${k}:`, JSON.stringify(v));
}
console.log('\n--- Console messages:', consoleMessages.length, '---');
consoleMessages.forEach(m => console.log(`  [${m.type}]`, m.text));
console.log('\n--- JS errors:', errors.length, '---');
errors.forEach(e => console.log('  !!', e));

chrome.kill('SIGTERM');
process.exit(errors.length === 0 ? 0 : 1);
