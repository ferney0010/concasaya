#!/usr/bin/env node
/**
 * stage-cloudflare-deploy.js
 *
 * Prepara un directorio staging .deploy-staging/ con solo los archivos que
 * deben ir a produccion (Cloudflare Pages). Evita subir cosas de dev:
 *   - node_modules/
 *   - .git/
 *   - scripts/
 *   - tmp-test/
 *   - package*.json, server.js
 *   - test-*, verify.*, _dev-skip-alert.html, indexnow-payload.json
 *   - b678cced*.txt (token aleatorio de verificacion)
 *
 * Mantiene: HTML raiz, blog/, pages/, assets/, catalogo concasaya/,
 * _redirects, robots.txt, sitemap.xml, knowledge_base.json, .htaccess
 *
 * Uso:
 *   node scripts/stage-cloudflare-deploy.js        # crea staging
 *   node scripts/stage-cloudflare-deploy.js --clean # borra staging previo
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STAGING = path.join(ROOT, '.deploy-staging');
const CLEAN = process.argv.includes('--clean');

const KEEP_FILES = new Set([
  '_redirects', 'robots.txt', 'sitemap.xml', 'knowledge_base.json', '.htaccess'
]);
const KEEP_DIRS = new Set(['assets', 'blog', 'pages', 'catalogo concasaya']);
const KEEP_HTML_ROOTS = true;  // copia todos los .html de la raiz
const SKIP_PATH_TOKENS = [
  'node_modules', '.git', 'scripts', 'tmp-test',
  'test-', 'verify.py', '_dev-skip-alert.html', 'indexnow-payload.json',
  'package.json', 'package-lock.json', 'server.js', '.wranglerignore',
  '.deploy-staging', '.cfignore'
];
const SKIP_BASENAME_RE = /^(b[0-9a-f]{20,}\.txt|package\.json|package-lock\.json|server\.js|indexnow-payload\.json|_dev-skip-alert\.html)$/i;

function shouldSkip(absPath, isDir) {
  const rel = path.relative(ROOT, absPath);
  if (!rel || rel.startsWith('..')) return true;
  const parts = rel.split(path.sep);
  const top = parts[0];
  // Si el path tiene subdirectorios, el top-level debe ser un KEEP_DIR
  // (permite entrar a assets/css, blog/algo, etc. pero skipea scripts/, src/, etc.)
  if (parts.length > 1 && !KEEP_DIRS.has(top)) return true;
  // Skip cualquier archivo/dir que tenga un token excluido en su path
  for (const tok of SKIP_PATH_TOKENS) {
    if (parts.some(p => p === tok || p.startsWith(tok))) return true;
  }
  return false;
}

function clean() {
  if (fs.existsSync(STAGING)) {
    fs.rmSync(STAGING, { recursive: true, force: true });
    console.log('Staging anterior borrado: ' + STAGING);
  }
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function walkAndStage() {
  let copied = 0;
  const entries = fs.readdirSync(ROOT, { withFileTypes: true });
  // 1) Copiar archivos puntuales de la raiz
  for (const e of entries) {
    if (!e.isFile()) continue;
    const abs = path.join(ROOT, e.name);
    if (SKIP_BASENAME_RE.test(e.name)) continue;
    if (KEEP_FILES.has(e.name)) {
      copyFile(abs, path.join(STAGING, e.name));
      copied++;
    } else if (KEEP_HTML_ROOTS && e.name.toLowerCase().endsWith('.html')) {
      copyFile(abs, path.join(STAGING, e.name));
      copied++;
    }
  }
  // 2) Copiar subdirectorios aprobados (recursivo)
  function recurseDir(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const abs = path.join(dir, item.name);
      if (shouldSkip(abs, item.isDirectory())) continue;
      const dest = path.join(STAGING, path.relative(ROOT, abs));
      if (item.isDirectory()) {
        recurseDir(abs);
      } else if (item.isFile()) {
        copyFile(abs, dest);
        copied++;
      }
    }
  }
  for (const e of entries) {
    if (e.isDirectory() && KEEP_DIRS.has(e.name)) {
      recurseDir(path.join(ROOT, e.name));
    }
  }
  return copied;
}

if (CLEAN) clean();
if (!fs.existsSync(STAGING)) fs.mkdirSync(STAGING, { recursive: true });
const copied = walkAndStage();
console.log('Archivos copiados al staging: ' + copied);
console.log('Staging en: ' + STAGING);