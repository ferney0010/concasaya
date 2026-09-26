# Concasaya — Notas para AI agents

Sitio web de CONCASAYA, cliente principal de Ferney. **Regla crítica**: NUNCA hacer algo que perjudique este proyecto. Ante la duda, no tocar.

## Stack
- HTML estático + Tailwind local compilado (Tailwind v3.4.19 con CSS variables para opacity)
- Deploy: Cloudflare Pages directo con wrangler (NO Vercel, NO GitHub integration)
- Server local: `node server.js` en puerto 3000 (para preview antes de deploy)

## Deploy a producción (Cloudflare Pages)

**Proyecto**: `concasaya` en Cloudflare Pages. URL producción: `concasaya.com`. Custom domain redirige `www.concasaya.com` → `concasaya.com`.

**Comando único de deploy** (correr desde `C:\Workspace\concasaya` en PowerShell):

```powershell
Set-Location "C:\Workspace\concasaya"
$sha = git log -1 --format="%H"
$msg = git log -1 --format="%s"
& "$env:LOCALAPPDATA\pnpm\wrangler.CMD" pages deploy "." `
    --project-name=concasaya `
    --branch=main `
    --commit-hash=$sha `
    --commit-message="$msg" `
    --commit-dirty=true
```

**Importante**:
- `--commit-dirty=true` permite deployar con cambios sin commitear (útil cuando hay archivos `.tmp-*`).
- Si `tmp-test/` vuelve a tener archivos >25 MiB (límite de Cloudflare Pages), borrarlos ANTES del deploy con:
  ```powershell
  Get-ChildItem "tmp-test" -Recurse -File -ErrorAction SilentlyContinue |
      Where-Object { $_.Length -gt 25MB } | Remove-Item -Force
  ```

**Verificar post-deploy**:
```powershell
$urls = @('https://concasaya.com/modelos', 'https://concasaya.com/', 'https://concasaya.com/ventajas')
foreach ($u in $urls) {
    $r = Invoke-WebRequest -Uri $u -Method Head -UseBasicParsing -MaximumRedirection 5
    Write-Host "$u -> $($r.StatusCode)"
}
```

Los 3 deben dar 200 OK. El 308 redirect inicial de `www` → `sin www` es comportamiento normal de Cloudflare.

## Estructura de páginas importantes
- `index.html` — homepage
- `modelos.html` — catálogo de 5 casas prefabricadas (cards con tabs Foto/Plano vía `peer-checked`)
- `ventajas.html` — sistemas constructivos (sin EPS, usa plaqueta/sec/modular)
- `cotizador-precios-casas-prefabricadas.html` — calculadora de precios
- `pages/<municipio>.html` — landing pages de municipios (~70 archivos)

## Archivos críticos del cliente (NUNCA tocar sin confirmación explícita)
- `assets/css/whatsapp-modal.css` + `assets/js/whatsapp-modal.js` — modal warm-up de WhatsApp
- `assets/js/chatbot.js` — chatbot de IA
- Schema.org JSON-LD en el `<head>` de cada página — afecta SEO directamente
- `sitemap.xml` y `robots.txt`

## Convenciones del repo
- Nombres de archivos de modelos: `assets/images/modelos/<slug>-<metros>.webp` + `<slug>-<metros>-plano.webp`
- Botones CTA usan WhatsApp con mensaje pre-cargado (wa.me/573142891018?text=...)
- Imágenes placeholder en `assets/images/` raíz (cabaña18, casa2, cubo1, colonial, casal1, etc.)
- Tabs Foto/Plano sin JS — usan CSS `peer-checked/foto:` y `peer-checked/plano:`

## Server local para preview

```powershell
Set-Location "C:\Workspace\concasaya"
node server.js
# El server responde en http://localhost:3000
```

**Importante**: el background task de bash mata el server a los 30 minutos exactos. Si pasa, simplemente relanzarlo. No es un bug, es un límite del sistema.

## Memoria del proyecto

- Modal WhatsApp con Natalia/Alicia/Jorge rotación. Script idempotente: `scripts/add-whatsapp-modal.js`
- Hero transactional con 3 CTAs en index/modelos/blog
- 70+ páginas de municipios en `pages/` (mismo template + nombre del municipio)
