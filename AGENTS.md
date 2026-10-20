# Concasaya — Notas para AI agents

Sitio web de CONCASAYA, cliente principal de Ferney. **Regla crítica**: NUNCA hacer algo que perjudique este proyecto. Ante la duda, no tocar.

## 🚨 REGLA DE DEPLOY — NUNCA GitHub, SOLO Cloudflare wrangler

**En este proyecto NUNCA se despliega con GitHub. El único mecanismo de deploy es `wrangler pages deploy`.**

- `git push` **NO despliega nada**. No hay `.github/workflows`, no hay CI. El repo de GitHub es **solo respaldo de código**.
- Cuando Ferney dice **"haz push"**, en este proyecto significa **"correr el deploy con wrangler"**, no subir a GitHub.
- **Nunca** informar "ya hice push" como si el cambio estuviera en producción. Decir `el código está en GitHub; falta el deploy con wrangler` — o mejor, correr el deploy si lo pide.
- Verificar siempre con regex contra el HTML servido por `concasaya.com` que los valores nuevos están y los viejos no. No confiar en el mensaje de éxito de wrangler.
- Ojo: reglas genéricas de otros proyectos (p. ej. "Vercel autodespliega en el push") **NO aplican aquí**.

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

**Eso NO alcanza**: los 200 solo confirman que el sitio responde, no que sirvió el archivo correcto.
Pedir el HTML y buscar los valores nuevos y viejos:

```powershell
$r = Invoke-WebRequest "https://concasaya.com/modelos" -UseBasicParsing -Headers @{ 'Cache-Control'='no-cache' }
$r.Content -match '59\.725\.900'   # nuevo -> True
$r.Content -match 'Ahorra 13%'     # viejo -> False
```

## Estado actual del catálogo (2026-10-07)

Precios reales que el cliente suministró por WhatsApp. El bloque de precio de cada card muestra
"Precio" (referencia, tachado en rojo) y "Precio con descuento" (el real). **Sin badge de
porcentaje** — el descuento ya está aplicado sobre el valor.

| Modelo | Precio | Precio con descuento |
|---|---|---|
| Cabaña de Vidrio 25m² | $63.750.000 | $59.725.900 |
| Casa El Moral 36m² | $24.845.900 | $23.127.700 |
| Cabaña La Vega 54m² | $44.460.000 | $41.580.690 |
| Casa Firavitoba 70m² | $62.429.500 | $56.797.500 |
| Casa 80m² | $63.700.000 | $55.368.200 ← **PRECISO PENDIENTE** |

**Pendientes conocidos** (no resolver sin el dato del cliente):
1. Casa 80m² sigue con el precio viejo — falta su mensaje de WhatsApp.
2. Firavitoba 70m² usa el plano de 84m² (`casa-firavitoba-84m2-plano.webp`) — falta el plano nuevo.
3. `pages/villadeleyva.html` desactualizada: Cabaña, El Moral y Firavitoba con precios viejos.
4. Cimentación inconsistente: 3 cards dicen "no incluye", 2 dicen "incluida"; el FAQ de Google
   afirma que sí. Falta confirmar la regla real del cliente.

Cualquier cambio de precio debe propagarse a: la card, el CTA de WhatsApp, el `price` del JSON-LD,
el FAQ visible, el FAQ de Google y las metas OG/Twitter —incluido el rango "desde/hasta" del
catálogo, que cambia cuando el modelo más caro deja de serlo.

## Ficha en directorios de terceros (2026-10-19)

CONCASAYA tiene ficha en **Constructoras en Colombia** (`constructorafortaleza.com.co`): 9.6/10 con
93 reseñas de clientes. Es la única fuente de autoridad de terceros que tenemos, así que **no
quitarla ni "corregirla"**: el artículo `blog/casas-prefabricadas-en-bogota-guia-constructora.html`
hace cross-link a esa ficha y al directorio de Bogotá.

Esa ficha tiene **dos datos desactualizados** que hay que pedirles corregir (no repetirlos en
nuestro sitio):

1. Dice que trabajamos con **paneles EPS**. Hoy los sistemas son **plaqueta de concreto, construcción
   en seco y construcción modular** (ver `ventajas.html`). Nunca afirmar EPS en contenido nuevo.
2. Publica el teléfono secundario **316 577 1582**, que ya no es el vigente (**320 957 5171**).
   Los teléfonos correctos están en el JSON-LD de `index.html`.
3. También menciona la marca anterior "Kaprecol" — no se usa en nuestro contenido.

## Notas técnicas de este proyecto

- Las tabs Foto/Plano usan `:has()` en `modelos.html` para resaltar el label activo. El patrón
  `peer-checked` **no funciona** ahí porque los `<label>` viven dentro de un `<div>` absoluto y
  no son hermanos de los `<input>`. Las imágenes sí alternan porque esas sí son hermanas.
- Al medir estilos con `getComputedStyle` hay que **esperar la transición** (~200 ms, dos
  `requestAnimationFrame`); leer justo después de cambiar el estado devuelve el valor a mitad
  de camino y parece que el CSS no aplicó.
- Los planos se guardan en 2400x1792 (4:3 exacto) y se muestran con `object-cover`. Si el plano
  viene en otra proporción hay que **paddearlo** con fondo blanco, y dejar ~20% de aire abajo
  porque la barra de tabs va superpuesta ahí.
- `server.js` resuelve URLs sin extensión (`/materiales` → `materiales.html`) replicando lo que
  hace Cloudflare Pages, para que el preview local navegue como producción.
- El listado del blog está en `/blog.html`, **no** en `/blog/` (no hay `index.html` en la carpeta).

## Estructura de páginas importantes
- `index.html` — homepage
- `modelos.html` — catálogo de 5 casas prefabricadas (cards con tabs Foto/Plano vía `peer-checked`)
- `ventajas.html` — sistemas constructivos (sin EPS, usa plaqueta/sec/modular)
- `cotizador-precios-casas-prefabricadas.html` — calculadora de precios
- `pages/<municipio>.html` — landing pages de municipios (~70 archivos)

## Patrón de hero de municipio (APROBADO por el cliente)
`docs/patron-hero-municipios.md` — implementé y aprobado en `pages/villadeleyva.html` (2026-10-06).
Antes de construir un hero nuevo en `pages/`, **leer ese archivo y replicarlo**: incluye el
efecto de blur con caída espacial (`mask-image` sobre `backdrop-filter`), el aislamiento
obligatorio entre móvil y escritorio con media queries excluyentes, el bloque de precio con
descuento del catálogo y el checklist de verificación. También documenta que
`chrome --headless --screenshot` miente en móvil y hay que usar CDP.

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

## Nuevo artículo de blog — checklist obligatorio

Antes de dar por terminado un artículo nuevo en `blog/`, verificar estos 6 puntos. Omitir cualquiera deja la página rota o sin SEO.

1. **Librerías base en el `<head>`** (si faltan, la página se ve sin estilos ni iconos):
   ```html
   <link rel="stylesheet" href="/assets/css/tailwind.css" />
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
   <link rel="stylesheet" href="/assets/css/whatsapp-modal.css" />
   <link rel="stylesheet" href="/assets/css/blog-concasaya.css" />
   ```
   Los artículos usan clases de Tailwind (`bg-white`, `text-dark`, `inline-flex`, `rounded-full`) e iconos `fa-*`, así que ambas librerías son obligatorias.
2. **Favicon y theme-color**:
   ```html
   <link rel="icon" href="/assets/images/logoconcasaya.webp" sizes="any" />
   <link rel="apple-touch-icon" href="/assets/images/logoconcasaya.webp" />
   <meta name="theme-color" content="#0077b6" />
   ```
3. **OG image 1200x630** en `assets/images/og-<slug>.webp` generada con `node scripts/build-og-nuevos-blogs.mjs` (agregar el post al array `posts`). Mismo `og:image` en el JSON-LD `image`.
4. **Meta OG completas**: `og:locale` (es_CO), `article:published_time`, `article:modified_time`, `article:author`, `article:section`, `article:tag`.
5. **Registro en dos lugares**: `blog/static-posts-config.js` (listado del blog) y `sitemap.xml`.
6. **Validar antes de commitear**:
   ```powershell
   node scripts/check-texto-corrupto.cjs "blog/<slug>.html"
   ```
   Detecta caracteres CJK y mezclas de idiomas que se cuelan al escribir HTML largo en español.

### OJO: no correr `scripts/build-blog-og-images.mjs`
Ese script regenera la OG de **todos** los posts y sobrescribe fotos reales de los que no tienen OG dedicada (`casa2.webp`, `herocasa1.webp`, `cass3.webp`…). Usar solo `build-og-nuevos-blogs.mjs` para artículos nuevos.

## Server local para preview

```powershell
Set-Location "C:\Workspace\concasaya"
node server.js
# El server responde en http://localhost:3000
```

**Importante**: si el server se lanza como background task de bash, el sistema lo mata a los 30 minutos exactos. Para evitarlo, lanzarlo **desacoplado** (así sobrevive indefinidamente):

```powershell
Set-Location "C:\Workspace\concasaya"
# Matar el que hubiera antes en el puerto 3000
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 1
Start-Process -FilePath "node" -ArgumentList "server.js" `
  -WorkingDirectory "C:\Workspace\concasaya" -WindowStyle Hidden
```

Verificar con `Invoke-WebRequest http://localhost:3000 -UseBasicParsing` (debe dar 200).

**El `ENOENT: favicon.ico` que aparece en el log es normal**: el archivo no existe en el repo, pero Cloudflare sirve un favicon por su cuenta (`concasaya.com/favicon.ico` responde 200). No es un error a corregir.

## Memoria del proyecto

- Modal WhatsApp con Natalia/Alicia/Jorge rotación. Script idempotente: `scripts/add-whatsapp-modal.js`
- Hero transactional con 3 CTAs en index/modelos/blog
- 70+ páginas de municipios en `pages/` (mismo template + nombre del municipio)
