/**
 * Verifica el deploy en produccion: los 3 URLs clave dan 200 y el HTML
 * servido contiene los valores nuevos y NO los viejos.
 *
 * Uso: node scripts/verify-deploy.mjs [url-base]
 */
const BASE = process.argv[2] || 'https://concasaya.com';

const CHECKS = [
  {
    url: '/modelos',
    nuevo: [
      ['Los precios del catálogo son obra negra e incluyen muros, estructura de cubierta y techo', true],
      ['no incluye cimentaci', true],
      ['Teja a elegir: fibrocemento o barro', true],
      ['Modelo real de casa prefabricada CONCASAYA', true],
      ['Plano real del modelo de casa prefabricada CONCASAYA Cabaña La Vega 54 m2', true]
    ],
    viejo: [
      ['e incluyen placa de cimentación, muros', false],
      ['Muebles de cocina, closets y detalles decorativos se cotizan aparte', false],
      ['placa de cimentación incluida', false],
      ['instalaciones eléctricas e hidráulicas', false]
    ]
  },
  {
    url: '/',
    nuevo: [
      ['galeria-villa-casa-blanca-zocalo.webp', true],
      ['Casas Campestres Amplias', true]
    ],
    viejo: [
      ['src="assets/images/herocasa.webp"', false]
    ]
  },
  {
    url: '/ventajas',
    nuevo: [['plaqueta', true]],
    viejo: []
  },
  {
    url: '/',
    nuevo: [
      ['Modelos reales, proyectos reales', true],
      ['footer-evidencia-1.webp', true],
      ['Son fotos reales: no son renders ni imágenes generadas por IA', true]
    ],
    viejo: []
  },
  {
    url: '/pages/chia',
    nuevo: [
      ['Modelos reales, proyectos reales', true],
      ['footer-evidencia-3.webp', true]
    ],
    viejo: []
  },
  {
    url: '/galeria',
    nuevo: [
      ['Modelos reales, proyectos reales', true]
    ],
    viejo: []
  }
];

const urls = ['/modelos', '/', '/ventajas'];
let fallos = 0;

console.log(`Verificando ${BASE}\n`);

for (const u of urls) {
  try {
    const r = await fetch(BASE + u, { headers: { 'Cache-Control': 'no-cache' } });
    console.log(`${u} -> ${r.status}`);
    if (r.status !== 200) { fallos++; continue; }
  } catch (e) {
    console.log(`${u} -> ERROR ${e.message}`);
    fallos++;
  }
}

for (const check of CHECKS) {
  const r = await fetch(BASE + check.url, { headers: { 'Cache-Control': 'no-cache' } });
  const html = await r.text();
  console.log(`\n--- ${check.url} ---`);
  for (const [patron, esperado] of [...(check.nuevo || []), ...(check.viejo || [])]) {
    const ok = html.includes(patron);
    const bien = ok === esperado;
    if (!bien) fallos++;
    const etiqueta = esperado ? 'debe estar' : 'NO debe estar';
    console.log(`  ${bien ? 'OK  ' : 'FAIL'}  [${etiqueta}]  ${patron.slice(0, 72)}`);
  }
}

console.log(fallos === 0 ? '\nTODO CORRECTO' : `\nFALLOS: ${fallos}`);
if (fallos) process.exitCode = 1;
