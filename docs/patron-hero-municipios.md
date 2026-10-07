# Patrón de hero para páginas de municipio

Implementado y aprobado por el cliente el 2026-10-06 en `pages/villadeleyva.html`.
Reutilizar este patrón en cualquier landing de municipio antes de inventar uno nuevo.

## Cómo se comporta

| | Escritorio (≥768px) | Móvil (≤767px) |
|---|---|---|
| Foto | A sangre, `background` de la sección, `center 45%` | Banda propia de 44vh arriba (`hero-villa__bg`) |
| Fondo del texto | Panel negro con blur sobre la foto | Blanco puro |
| Texto | Blanco + verde `#86f08f` | Azul marino `#0d2032` + verde `#1a7434` |
| Composición | Bloque alineado a la izquierda, casa a la derecha | Foto arriba, texto abajo |

En escritorio el desenfoque **se apaga antes de la casa**: la fachada queda nítida.

## Estilo móvil (APROBADO por el cliente) — foto en banda + texto sobre blanco

Este es el look que más gustó y **no se debe cambiar**. La idea central: en móvil
la foto **no es fondo**, es una banda propia arriba, y el texto va sobre blanco.

**Por qué funciona:** con la foto a pantalla completa, `cover` tiene que ampliar
muchísimo la imagen para llenar un contenedor angosto y alto (una imagen 16:9 en
390px de ancho termina mostrando solo ~22% de su ancho). El texto acababa encima
de las ventanas oscuras de la casa y era ilegible. Separar la foto del texto
arregla la legibilidad **sin capas de opacidad ni velos**, y de paso la foto se ve
entera y sin ampliar.

```css
/* Fuera de cualquier media query: en escritorio no debe existir */
.hero-villa__bg { display: none; }

@media (max-width: 767px) {
  .hero-villa {
    min-height: 0;
    background-image: none;   /* la foto pasa a la banda de abajo */
    background-color: #ffffff;
    padding-top: 0;
    padding-bottom: 36px;
    /* Columna: la banda va arriba y el texto debajo. */
    flex-direction: column;
    align-items: stretch;
  }
  .hero-villa::before {
    display: none;             /* nada de panel oscuro ni blur */
  }
  .hero-villa__bg {
    display: block;
    height: 44vh;
    min-height: 230px;
    /* El header es fixed: sin este margen la banda queda debajo de él. */
    margin-top: 64px;
    background-image: url('/assets/images/hero-nuevo/fondo-villa-hero.webp');
    background-size: cover;
    background-position: center 40%;
  }
  .hero-villa__inner { padding-top: 1.35rem; }
  .hero-villa__text { max-width: 100%; }
  .hv-perk { padding: 0 0.45rem; font-size: 0.68rem; }
  .hv-perk__ico { width: 34px; height: 34px; font-size: 0.85rem; }
  .hv-ctas { flex-direction: column; align-items: stretch; }
  .hv-btn { width: 100%; }
  /* Sobre fondo blanco el halo blanco solo emborronaría el texto. */
  .hv-title,
  .hv-lead,
  .hv-perk {
    text-shadow: none;
  }
}
```

Tres cosas que se olvidan y rompen el look:

1. `flex-direction: column`. El hero es `display:flex` y sin esto la banda queda
   **al lado** del texto con ancho 0 (y el badge se esconde detrás del header fijo).
2. `margin-top: 64px` en la banda, porque el header es `fixed`.
3. `text-shadow: none`, porque el halo blanco se diseñó para leerse sobre foto.

## Aislamiento móvil — regla obligatoria

Todo lo del tema oscuro va dentro de `@media (min-width: 768px)`.
El móvil va en `@media (max-width: 767px)`. Son rangos excluyentes: nunca se activan
los dos. Al tocar el hero de escritorio, **no editar el bloque móvil**: es la versión
que el cliente ya aprobó.

## Estructura HTML

```html
<section class="hero-villa">
  <!-- Solo visible en movil; en escritorio queda display:none -->
  <div class="hero-villa__bg" aria-hidden="true"></div>
  <div class="hero-villa__inner">
    <div class="hero-villa__text">
      <span class="hv-badge"><i class="fas fa-house"></i>Casas prefabricadas en {MUNICIPIO}</span>
      <h1 class="hv-title">Tu casa prefabricada en <em>{MUNICIPIO}</em></h1>
      <p class="hv-lead">Diseños modernos con el encanto colonial. Rápidas, seguras y duraderas.</p>
      <ul class="hv-perks">
        <li class="hv-perk">
          <span class="hv-perk__ico"><i class="fas fa-bolt"></i></span>
          <span>Construcción<br />rápida</span>
        </li>
        <!-- + Alta resistencia y seguridad / Económicas y sostenibles -->
      </ul>
      <div class="hv-ctas">
        <a href="#modelos-{slug}" class="hv-btn hv-btn--solid">
          <i class="fas fa-house"></i>Ver modelos de casas <i class="fas fa-arrow-right hv-btn__arrow"></i>
        </a>
        <a href="https://wa.me/573142891018?text=..." class="hv-btn hv-btn--ghost" target="_blank" rel="noopener">
          <i class="fas fa-calculator"></i>Cotizar mi proyecto
        </a>
      </div>
    </div>
  </div>
</section>
```

El `margin-top: 64px` de `hero-villa__bg` en móvil existe porque el header es
`fixed`: sin él la banda de foto queda debajo del header.

## CSS: el efecto del blur con caída espacial

Este es el punto no obvio. `backdrop-filter` **no puede desvanecerse con un
degradado normal**: el desenfoque se aplica uniforme a todo el elemento. Por eso
solo hay dos opciones y ambas son malas:

- Recortar el panel (ej. `width: 72%`) → se nota una costura vertical donde
  termina el blur.
- Dejarlo a ancho completo sin más → la casa queda borrosa.

La solución es **enmascarar el desenfoque**: se aplica el blur a todo el ancho y
encima se pone un `mask-image` en degradado. Como la máscara controla la visibilidad
del elemento que lleva el filtro, el blur se desvanece progresivamente.

```css
@media (min-width: 768px) {
  .hero-villa::before {
    display: block;
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(100deg,
      rgba(6, 26, 16, 0.84) 0%, rgba(6, 26, 16, 0.7) 26%,
      rgba(6, 26, 16, 0.34) 40%, rgba(6, 26, 16, 0) 54%);
    -webkit-mask-image: linear-gradient(100deg,
      #000 0%, #000 30%, rgba(0, 0, 0, 0.45) 40%, rgba(0, 0, 0, 0) 52%);
    mask-image: linear-gradient(100deg,
      #000 0%, #000 30%, rgba(0, 0, 0, 0.45) 40%, rgba(0, 0, 0, 0) 52%);
    backdrop-filter: blur(7px) saturate(1.08);
    -webkit-backdrop-filter: blur(7px) saturate(1.08);
    pointer-events: none;
  }
}
```

La máscara llega a cero en el 52% del ancho, justo antes de donde empieza la casa.
El punto de corte se ajusta según dónde esté la fachada en cada foto.

## Checklist antes de dar por terminado un hero

1. Imágenes optimizadas a **peso de hero** (≤300 KB). La del atardecer venía en
   2.1 MB y se dejó en 260 KB con `sharp`: `resize 1920px` + `webp quality 78`.
2. `scrollWidth === clientWidth` en móvil (sin scroll horizontal).
3. Estilos calculados del móvil revisados: título oscuro, `::before` en
   `display:none`, banda usando la imagen antigua.
4. JSON-LD sigue siendo JSON válido y con los **precios reales**.
5. Captura de escritorio **y** de móvil emulada (ver abajo).

## Cómo verificar móvil de verdad

`chrome --headless --screenshot --window-size=390,844` **miente**: renderiza el
layout más ancho que el ancho de la imagen y el recorte lateral que se ve es un
artefacto, no un bug. Sirve para escritorio, no para móvil.

Para móvil hay que emular el dispositivo por CDP (`Emulation.setDeviceMetricsOverride`
con `mobile: true` y `deviceScaleFactor: 2`) y leer `Runtime.evaluate` para comparar
`documentElement.scrollWidth` contra `clientWidth`, más `getComputedStyle` de los
elementos clave. Always poner un timeout por llamada: `Page.captureScreenshot` se
cuelga en páginas pesadas y sin timeout el script no termina nunca.

## Bloque de precio con descuento (mismo lenguaje visual)

Catálogo: `modelos.html` (tarjetas de ~400px, antes/ahora lado a lado) y
`pages/villadeleyva.html` (tarjetas de 230px, **apilado** porque no cabía de otro modo).

- El "antes" es el precio vigente × 1.15 redondeado a centena de millar.
- El % que se muestra se **recalcula** sobre el redondeo: queda 13%, no 15%.
- El precio en JSON-LD, FAQ y metas es **siempre el real vigente**, nunca el tachado.