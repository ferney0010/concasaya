/**
 * Genera _dev-todas-las-paginas.html
 *
 * Indice local (solo dev) con TODAS las paginas del sitio:
 *  - Paginas principales (raiz del repo)
 *  - Landings de municipios y ciudades (pages/)
 *  - Articulos de blog (blog/)
 *
 * Incluye buscador en vivo, conteo por seccion y panel de vista previa (iframe).
 * No usar Tailwind aqui: el archivo se sirve standalone y no debe depender
 * de una recompilacion de assets/css/tailwind.css.
 *
 * Uso: node scripts/build-dev-index.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, '_dev-todas-las-paginas.html');

const IGNORED_ROOT = new Set([
  'modelos.html.bak',
  'ventajas.html.bak',
  '_dev-todas-las-paginas.html',
  '_dev-skip-alert.html'
]);

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í').replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)));
}

function cleanTitle(raw, fallback) {
  if (!raw) return fallback;
  let t = decodeEntities(raw).replace(/\s+/g, ' ').trim();
  t = t.replace(/\s*[|\-–—]\s*CONCASAYA.*$/i, '').trim();
  return t || fallback;
}

function extract(html) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const ogMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);

  const stripTags = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  return {
    title: cleanTitle(titleMatch && titleMatch[1], ''),
    ogTitle: cleanTitle(ogMatch && ogMatch[1], ''),
    h1: h1Match ? cleanTitle(stripTags(h1Match[1]), '') : '',
    desc: descMatch ? decodeEntities(descMatch[1]).trim() : ''
  };
}

function prettyUrl(rel) {
  return rel.replace(/\.html$/i, '').replace(/index$/i, '');
}

function listDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.html'))
    .filter((f) => !f.includes('.bak'))
    .sort();
}

const main = [];
listDir(ROOT)
  .filter((f) => !IGNORED_ROOT.has(f) && !f.startsWith('_dev-') && !f.startsWith('tmp'))
  .forEach((f) => {
    const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const meta = extract(html);
    main.push({
      url: f === 'index.html' ? '/' : prettyUrl(f),
      file: f,
      title: meta.ogTitle || meta.h1 || meta.title || prettyUrl(f),
      desc: meta.desc
    });
  });

const municipios = [];
listDir(path.join(ROOT, 'pages')).forEach((f) => {
  const html = fs.readFileSync(path.join(ROOT, 'pages', f), 'utf8');
  const meta = extract(html);
  municipios.push({
    url: '/pages/' + prettyUrl(f),
    file: 'pages/' + f,
    title: meta.ogTitle || meta.h1 || meta.title || prettyUrl(f),
    desc: meta.desc
  });
});

const blog = [];
listDir(path.join(ROOT, 'blog')).forEach((f) => {
  const html = fs.readFileSync(path.join(ROOT, 'blog', f), 'utf8');
  const meta = extract(html);
  blog.push({
    url: '/blog/' + prettyUrl(f),
    file: 'blog/' + f,
    title: meta.ogTitle || meta.h1 || meta.title || prettyUrl(f),
    desc: meta.desc
  });
});

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const renderItems = (items, prefix) =>
  items
    .map(
      (it) => `      <li class="item" data-search="${esc((it.title + ' ' + it.file + ' ' + it.desc).toLowerCase())}">
        <a class="link" href="${esc(it.url)}" target="_blank" rel="noopener">
          <span class="t">${esc(it.title)}</span>
          <span class="p">${esc(it.file)}</span>
        </a>
        <button class="btn-prev" data-url="${esc(it.url)}" type="button" title="Vista previa">Ver</button>
      </li>`
    )
    .join('\n');

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Indice de paginas (dev) - CONCASAYA</title>
<style>
  :root {
    --azul: #0077b6;
    --azul-osc: #005a8c;
    --borde: #e2e8f0;
    --gris: #64748b;
    --fondo: #f8fafc;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    background: var(--fondo);
    color: #0f172a;
    display: flex;
    min-height: 100vh;
  }
  aside {
    width: 380px;
    min-width: 380px;
    background: #fff;
    border-right: 1px solid var(--borde);
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: sticky;
    top: 0;
  }
  header { padding: 16px; border-bottom: 1px solid var(--borde); }
  header h1 { margin: 0 0 2px; font-size: 16px; }
  header p { margin: 0 0 12px; font-size: 12px; color: var(--gris); }
  #q {
    width: 100%;
    padding: 9px 11px;
    border: 1px solid var(--borde);
    border-radius: 8px;
    font-size: 14px;
  }
  #stats { margin-top: 8px; font-size: 11px; color: var(--gris); }
  #list { overflow-y: auto; flex: 1; padding: 8px 10px 40px; }
  .group { margin-bottom: 18px; }
  .group h2 {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: .09em;
    color: var(--azul-osc);
    margin: 0 0 8px;
    padding-bottom: 5px;
    border-bottom: 1px solid var(--borde);
    position: sticky;
    top: 0;
    background: #fff;
  }
  .item { display: flex; align-items: center; gap: 6px; border-radius: 7px; }
  .item:hover { background: #f1f5f9; }
  .link {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 6px 8px;
    text-decoration: none;
    color: inherit;
    min-width: 0;
  }
  .link .t {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .link .p { font-size: 10.5px; color: var(--gris); font-family: ui-monospace, Menlo, Consolas, monospace; }
  .link:hover .t { color: var(--azul); }
  .btn-prev {
    border: 1px solid var(--borde);
    background: #fff;
    color: var(--azul-osc);
    border-radius: 6px;
    font-size: 11px;
    padding: 4px 8px;
    cursor: pointer;
    margin-right: 6px;
  }
  .btn-prev:hover { background: var(--azul); color: #fff; border-color: var(--azul); }
  .hidden { display: none; }
  main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .bar {
    height: 46px;
    border-bottom: 1px solid var(--borde);
    background: #fff;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 14px;
  }
  .bar .url { font-size: 12px; color: var(--gris); font-family: ui-monospace, Menlo, Consolas, monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bar a { font-size: 12px; color: var(--azul); text-decoration: none; white-space: nowrap; }
  #frame { flex: 1; border: 0; width: 100%; background: #fff; }
  #placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gris);
    font-size: 14px;
    text-align: center;
    padding: 30px;
  }
  @media (max-width: 900px) {
    body { flex-direction: column; }
    aside { width: 100%; min-width: 0; height: auto; position: static; max-height: 45vh; }
    #frame, #placeholder { min-height: 55vh; }
  }
</style>
</head>
<body>
  <aside>
    <header>
      <h1>Indice de paginas &mdash; CONCASAYA</h1>
      <p>Preview local. Solo desarrollo: no forma parte del sitio publico.</p>
      <input id="q" type="search" placeholder="Buscar pagina (nombre o ruta)..." autocomplete="off" />
      <div id="stats"></div>
    </header>
    <nav id="list">
      <section class="group" id="g-main">
        <h2>Principales (<span class="c"></span>)</h2>
        <ul class="items">
${renderItems(main, 'main')}
        </ul>
      </section>
      <section class="group" id="g-mun">
        <h2>Municipios y landings (<span class="c"></span>)</h2>
        <ul class="items">
${renderItems(municipios, 'mun')}
        </ul>
      </section>
      <section class="group" id="g-blog">
        <h2>Blog (<span class="c"></span>)</h2>
        <ul class="items">
${renderItems(blog, 'blog')}
        </ul>
      </section>
    </nav>
  </aside>
  <main>
    <div class="bar">
      <span class="url" id="cur">Sin seleccion &mdash; elige una pagina y pulsa "Ver"</span>
      <a id="open" href="#" target="_blank" rel="noopener">Abrir en pestana nueva</a>
    </div>
    <div id="placeholder">Selecciona cualquier pagina de la lista para verla aqui.</div>
    <iframe id="frame" class="hidden" title="Vista previa"></iframe>
  </main>
<script>
  (function () {
    var q = document.getElementById('q');
    var frame = document.getElementById('frame');
    var placeholder = document.getElementById('placeholder');
    var cur = document.getElementById('cur');
    var openLink = document.getElementById('open');
    var groups = Array.prototype.slice.call(document.querySelectorAll('.group'));

    function applyFilter() {
      var term = q.value.trim().toLowerCase();
      var total = 0;
      groups.forEach(function (g) {
        var visible = 0;
        g.querySelectorAll('.item').forEach(function (li) {
          var hit = !term || li.dataset.search.indexOf(term) !== -1;
          li.classList.toggle('hidden', !hit);
          if (hit) visible++;
        });
        g.classList.toggle('hidden', visible === 0);
        var c = g.querySelector('.c');
        if (c) c.textContent = visible;
        total += visible;
      });
      document.getElementById('stats').textContent = total + ' de ' +
        (mainCount + munCount + blogCount) + ' paginas visibles';
    }

    var mainCount = ${main.length}, munCount = ${municipios.length}, blogCount = ${blog.length};

    q.addEventListener('input', applyFilter);

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-prev');
      if (!btn) return;
      var url = btn.dataset.url;
      frame.src = url;
      frame.classList.remove('hidden');
      placeholder.classList.add('hidden');
      cur.textContent = location.origin + url;
      openLink.href = url;
    });

    applyFilter();
  })();
</script>
</body>
</html>
`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('OK -> ' + OUT);
console.log('  principales: ' + main.length);
console.log('  municipios : ' + municipios.length);
console.log('  blog       : ' + blog.length);
