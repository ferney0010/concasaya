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

**Nota del plano de La Vega** (2026-10-25): el cliente envió un plano nuevo (10 x 9 m, con
9 m², 15 m² y 42 m² = 66 m² de distribución) que **no cuadra con el nombre del modelo** (54 m²).
Se puso tal cual, sin "corregir" nada. Si en el futuro alguien ve la incongruencia, el plano lo
mandó el cliente: no cambiarlo sin volver a preguntarle. Se generó con
`scripts/conv-plano.mjs` (2400x1792, 20% de aire abajo para la barra de tabs).

Cualquier cambio de precio debe propagarse a: la card, el CTA de WhatsApp, el `price` del JSON-LD,
el FAQ visible, el FAQ de Google y las metas OG/Twitter —incluido el rango "desde/hasta" del
catálogo, que cambia cuando el modelo más caro deja de serlo.

## Alcance del precio de catálogo (CONFIRMADO por el cliente 2026-10-25)

Regla oficial, ya no hay que confirmarla:

- **La placa de cimentación NO se incluye** en el precio de catálogo. Se cotiza aparte según el
  estudio de suelos y el tipo de placa que el terreno exige.
- **Las instalaciones eléctricas e hidráulicas NO se incluyen** tampoco (obra negra).
- **Los muebles** (cocina, closets, detalles decorativos) tampoco forman parte del precio.
- **Los precios NO cambian**: el catálogo ya era "obra negra" sin placa. No recalcular cifras.

Esta regla está aplicada en las 5 cards de `modelos.html` (notas `mp-precio__nota` y los CTA de
WhatsApp), en el FAQ visible + JSON-LD de `modelos.html`, en `pages/cabanas-turisticas-villa-de-leyva.html`,
`pages/casas-de-campo-villa-de-leyva.html` y en 6 artículos de `blog/`. El script que aplicó el
cambio es `scripts/fix-cimentacion.js` (reemplazos literales, idempotente: ya no encuentra nada).

**No volver a afirmar que la placa va incluida.** Si se toca ese tema, el patrón correcto es
"se cotiza aparte". NO tocar: la garantía de 10 años en estructura (cimentación, muros, cubierta),
las referencias a la NSR-10 ni los pasajes que hablan del mercado en general (consejos para
comparar cotizaciones de terceros).

## Cubierta del catálogo (2026-10-25)

**Dos opciones de teja disponibles: fibrocemento o barro.** Está escrito como ítem de
especificación en las 4 cards con teja de `modelos.html` ("Teja a elegir: fibrocemento o barro")
y en el FAQ de personalización (visible + JSON-LD).

**La Cabaña de Vidrio 25m² NO lleva ese ítem**: es acristalada con techo plano
(`assets/images/modelos/cabana-vidrio-25m2-800.webp`). Si el cliente confirma que también
ofrece teja para ese modelo, se agrega el ítem a su card.

## Banda de evidencia en el footer (2026-10-25)

El footer de **las 100 páginas** del sitio lleva una banda con el concepto "Modelos reales,
proyectos reales": 3 miniaturas de obra real (`footer-evidencia-1/2/3.webp`, 48 KB en total,
lazy), los 3 datos verificables (93 reseñas 9.6/10, garantía 10 años, 12.000 proyectos) y un
enlace a `/modelos#proyectos-reales`.

- Se insertó con `scripts/agregar-banda-evidencia.js` (idempotente, valida antes que las 41
  clases CSS existan en `assets/css/tailwind.css` — no hay que recompilar Tailwind).
- Las miniaturas se generan con `scripts/generar-miniaturas-footer.mjs`.
- **Ojo al texto**: dice "Las fotografías de **esta banda** son de casas terminadas...", NO
  "de este sitio". La galería todavía tiene 13 renders pendientes de material nuevo, así que
  el claim general no sería cierto hasta reemplazarlos.

## Imágenes con marca de agua de IA (2026-10-25)

**32 imágenes del repo tienen la estrella de 4 puntas de Gemini en la esquina inferior derecha.**
El cliente recibió una queja de que "los modelos parecían hechos con IA". Ya se añadió la sección
`#proyectos-reales` en `modelos.html` (fotos de obra entregada + 93 reseñas de terceros) y se
reescribieron los alt del catálogo a "Modelo real de casa prefabricada".

**Estado 2026-10-25 (16:30)**: la marca **ya fue eliminada** de las 32 — se recortó la esquina de cada
una (`scripts/recortar-marca-ia.mjs`, con detección real de la estrella por color crema) y se
actualizaron los `width/height` del HTML (`scripts/actualizar-dimensiones.mjs`, 19 tags en 5
archivos). Verificado con un montaje de control: **cero estrellas restantes**. Las fotos quedaron
intactas; solo se perdió la esquina inferior derecha (entre 11% y 52% del área, según dónde
estaba la estrella).

Las 32 imágenes:
```
aislamiento.webp   aula1.webp        bodega1.webp       bodega2.webp
bodegaaa.jpg       cabaña18.webp     cabaññ1.webp       campe1.webp
casa2.webp         casal1.webp       casco.webp         caseta.webp
cass2.webp         cass3.webp        cass4.webp         cocina.webp
colonial.webp      cubo1.webp        fondo1.webp        fondo2.webp
fondo3.webp        fondo4.webp       fondo5.webp        herocasa.webp
herocasa1.webp     img1055.webp      img1304.webp       img1318.webp
mezanine.webp      sala.webp         terminada.webp     tiniy1.webp
```

Las 5 fotos del catálogo (`assets/images/modelos/*.webp`) **NO** tenían marca. `img1333.webp` es
dudosa (revisar).

**Pendiente**: el cliente va a mandar material real nuevo para reemplazar estas 32. Al llegar,
reemplazar en `assets/data/gallery.json` (13 de las 32 están en la galería: `cabaññ1`, `img1055`,
`cubo1`, `tiniy1`, `mezanine`, `bodega1`, `bodega2`, `bodegaaa`, `caseta`, `cass2`, `cass3`,
`cass4`, `colonial`) y en las landings que las usan. **Si el material nuevo viene sin marca de
agua, no hay que recortar nada.**

**Aviso**: `img214.webp` está titulando "Casa campestre con teja de barro" en la galería pero es un
**pozo séptico**. Corregir al reemplazar.

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
6. **Bump del `?v=` del listado** (paso 7 del flujo, ver abajo): sin esto el artículo nuevo **no se ve**
   en `/blog` para quien ya había visitado la página.
7. **Validar antes de commitear**:
   ```powershell
   node scripts/check-texto-corrupto.cjs "blog/<slug>.html"
   ```
   Detecta caracteres CJK y mezclas de idiomas que se cuelan al escribir HTML largo en español.

### Por qué el artículo "no aparece" en el listado (2026-10-19)

El listado de `/blog` se arma en el cliente con `blog/static-posts-config.js`, y ese archivo se sirve
con `Cache-Control: public, max-age=14400, must-revalidate` (4 horas de cache en el navegador).

El archivo `_headers` de la raíz **no sirve como fix en producción**: la zona de `www.concasaya.com`
tiene una regla de caché a nivel de zona que sobrescribe el `Cache-Control` de los assets y lo deja
en 14400. En `*.pages.dev` sí se ve `max-age=0`, pero el dominio real no.

**Por eso el import en `blog.html` lleva un `?v=`:**
```js
import { staticPosts, applyThumbnailFlipEffective } from "./blog/static-posts-config.js?v=20261019";
```
Al ser una URL nueva, el navegador no la tiene cacheada y la descarga al instante. **Cada vez que se
publique un post hay que subir ese `?v=`** (formato `?v=AAAAMMDD-N`); es el único paso que garantiza
que el artículo se vea de inmediato en `/blog` y no 4 horas después.

Dato de referencia: el grid muestra 9 artículos por página (`PAGE_SIZE = 9`) y el post con
`pinned: true` ocupa el bloque grande de "Artículo destacado" arriba. El orden del grid es por fecha
descendente, así que el post más nuevo queda **primero en el grid**, debajo del destacado.

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
