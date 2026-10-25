/**
 * Genera _dev-imagenes.html: visor local de TODAS las imagenes del repo
 * para elegir Rapidamente cual usar en una card.
 *
 * Uso: node scripts/build-dev-imagenes.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, '_dev-imagenes.html');

const EXCLUDE = /^(og-|logoconcasaya|logocasa|logocasah|planos\.|paneleps)/i;
const HIGHLIGHT = 'galeria-villa-casa-blanca-zocalo.webp';

function walk(dir, prefix = '') {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const rel = prefix ? prefix + '/' + entry.name : entry.name;
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      out.push(...walk(path.join(dir, entry.name), rel));
    } else if (/\.(webp|jpg|jpeg|png)$/i.test(entry.name)) {
      out.push(rel);
    }
  }
  return out;
}

const files = walk(path.join(ROOT, 'assets', 'images'))
  .filter((f) => !EXCLUDE.test(path.basename(f)))
  .sort((a, b) => {
    const base = path.basename(a);
    if (base === HIGHLIGHT) return -1;
    if (path.basename(b) === HIGHLIGHT) return 1;
    return a.localeCompare(b, 'es');
  });

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const cards = files
  .map((f) => {
    const base = path.basename(f);
    const isCurrent = base === HIGHLIGHT;
    return `      <figure class="card${isCurrent ? ' current' : ''}" data-name="${esc(f.toLowerCase())}">
        <button class="shot" type="button" data-src="assets/images/${esc(f)}" data-file="${esc(f)}">
          <img src="assets/images/${esc(f)}" alt="${esc(f)}" loading="lazy" decoding="async" />
        </button>
        <figcaption>
          <span class="n">${esc(f)}</span>
          ${isCurrent ? '<span class="badge">ACTUAL</span>' : ''}
        </figcaption>
      </figure>`;
  })
  .join('\n');

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Visor de imagenes (dev) - CONCASAYA</title>
<style>
  :root { --azul:#0077b6; --borde:#e2e8f0; --gris:#64748b; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; background:#f8fafc; color:#0f172a; }
  header { position: sticky; top:0; z-index:5; background:#fff; border-bottom:1px solid var(--borde); padding:14px 18px; }
  header h1 { margin:0 0 3px; font-size:17px; }
  header p { margin:0 0 10px; font-size:12px; color:var(--gris); }
  #q { width:100%; max-width:420px; padding:9px 11px; border:1px solid var(--borde); border-radius:8px; font-size:14px; }
  #count { font-size:11px; color:var(--gris); margin-top:6px; }
  #grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:14px; padding:18px; }
  .card { margin:0; background:#fff; border:1px solid var(--borde); border-radius:10px; overflow:hidden; }
  .card.current { border-color:var(--azul); box-shadow:0 0 0 2px rgba(0,119,182,.18); }
  .shot { display:block; width:100%; padding:0; border:0; background:#eef2f7; cursor:pointer; height:170px; }
  .shot img { width:100%; height:170px; object-fit:cover; display:block; }
  figcaption { padding:8px 10px; display:flex; align-items:center; gap:6px; }
  .n { font-size:11px; font-family:ui-monospace,Menlo,Consolas,monospace; color:#334155; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .badge { background:var(--azul); color:#fff; font-size:9px; font-weight:700; padding:2px 6px; border-radius:99px; margin-left:auto; }
  .hidden { display:none; }
  #lb { position:fixed; inset:0; background:rgba(15,23,42,.88); display:none; align-items:center; justify-content:center; flex-direction:column; gap:12px; padding:24px; z-index:20; }
  #lb.open { display:flex; }
  #lb img { max-width:92vw; max-height:78vh; border-radius:8px; background:#fff; }
  #lb .info { color:#fff; font-size:13px; text-align:center; font-family:ui-monospace,Menlo,Consolas,monospace; }
  #lb button { background:var(--azul); color:#fff; border:0; border-radius:8px; padding:9px 16px; font-size:13px; cursor:pointer; }
</style>
</head>
<body>
  <header>
    <h1>Visor de imagenes del repo &mdash; CONCASAYA</h1>
    <p>Clic en una imagen para verla grande. La que usa hoy la card "Casas Campestres Amplias" esta marcada ACTUAL.</p>
    <input id="q" type="search" placeholder="Filtrar por nombre de archivo..." autocomplete="off" />
    <div id="count"></div>
  </header>
  <main id="grid">
${cards}
  </main>
  <div id="lb">
    <img id="lbimg" alt="" />
    <div class="info" id="lbinfo"></div>
    <div style="display:flex;gap:10px">
      <button id="lbcopy" type="button">Copiar nombre</button>
      <button id="lbclose" type="button">Cerrar</button>
    </div>
  </div>
<script>
  var q = document.getElementById('q');
  var grid = document.getElementById('grid');
  var lb = document.getElementById('lb');
  var lbimg = document.getElementById('lbimg');
  var lbinfo = document.getElementById('lbinfo');

  function filter() {
    var term = q.value.trim().toLowerCase();
    var shown = 0;
    grid.querySelectorAll('.card').forEach(function (c) {
      var hit = !term || c.dataset.name.indexOf(term) !== -1;
      c.classList.toggle('hidden', !hit);
      if (hit) shown++;
    });
    document.getElementById('count').textContent = shown + ' de ' + grid.querySelectorAll('.card').length + ' imagenes';
  }
  q.addEventListener('input', filter);

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.shot');
    if (!btn) return;
    lbimg.src = btn.dataset.src;
    lbinfo.textContent = btn.dataset.file;
    lb.classList.add('open');
  });
  document.getElementById('lbclose').addEventListener('click', function () { lb.classList.remove('open'); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.classList.remove('open'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('open'); });
  document.getElementById('lbcopy').addEventListener('click', function () {
    var t = lbinfo.textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(t);
    document.getElementById('lbcopy').textContent = 'Copiado: ' + t;
  });

  filter();
</script>
</body>
</html>
`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('OK -> ' + OUT);
console.log('  imagenes listadas: ' + files.length);
