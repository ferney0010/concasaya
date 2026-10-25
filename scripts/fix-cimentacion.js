/**
 * Correccion de alcance comercial: la placa de cimentacion NO esta incluida
 * en el precio de catalogo (decision del cliente, 2026-10-25).
 *
 * Solo se reemplazan cadenas literales exactas. Si un "from" no aparece en el
 * archivo, el script lo reporta como ERROR (para detectar typos) y no toca nada.
 *
 * NO se tocan: precios, garantia de 10 anos en estructura, referencias a la
 * NSR-10, ni los contextos que hablan del mercado en general (consejos para
 * comparar cotizaciones de terceros).
 *
 * Uso: node scripts/fix-cimentacion.js [--dry]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRY = process.argv.includes('--dry');

const R = [
  // ---------------------------------------------------------------- modelos.html
  {
    file: 'modelos.html',
    from: 'Los precios son de obra negra e incluyen placa de cimentación.',
    to: 'Los precios son de obra negra y no incluyen placa de cimentación.'
  },
  {
    file: 'modelos.html',
    from: 'Los precios del catálogo son obra negra e incluyen placa de cimentación, muros, estructura de cubierta y techo. Puedes elegir entre obra gris, obra blanca o completamente terminada. Muebles de cocina, closets y detalles decorativos se cotizan aparte.',
    to: 'Los precios del catálogo son obra negra e incluyen muros, estructura de cubierta y techo. Puedes elegir entre obra gris, obra blanca o completamente terminada.'
  },
  {
    file: 'modelos.html',
    from: 'Todos los modelos son personalizables y se entregan con placa de cimentación incluida.',
    to: 'Todos los modelos son personalizables. La placa de cimentación, las instalaciones y los muebles se cotizan aparte.'
  },
  {
    file: 'modelos.html',
    from: 'Obra negra desde &middot; placa de cimentaci&oacute;n incluida',
    to: 'Obra negra desde &middot; no incluye cimentaci&oacute;n'
  },
  {
    file: 'modelos.html',
    from: 'placa%20de%20cimentaci%C3%B3n%2C%20pozo%20septic',
    to: 'pozo%20septic'
  },

  // ------------------------------------------- pages/cabanas-turisticas-villa-de-leyva.html
  {
    file: 'pages/cabanas-turisticas-villa-de-leyva.html',
    from: 'Todos los precios incluyen placa de cimentación.',
    to: 'Los precios no incluyen placa de cimentación.'
  },
  {
    file: 'pages/cabanas-turisticas-villa-de-leyva.html',
    from: 'Incluye la estructura prefabricada, la placa de cimentación, el montaje en sitio y los acabados estándar.',
    to: 'Incluye la estructura prefabricada, el montaje en sitio y los acabados estándar. La placa de cimentación se cotiza aparte.'
  },
  {
    file: 'pages/cabanas-turisticas-villa-de-leyva.html',
    from: 'con placa de cimentación incluida, entrega en',
    to: 'sin placa de cimentación, entrega en'
  },
  {
    file: 'pages/cabanas-turisticas-villa-de-leyva.html',
    from: 'placa de cimentación incluida.',
    to: 'placa de cimentación cotizada aparte.'
  },
  {
    file: 'pages/cabanas-turisticas-villa-de-leyva.html',
    from: 'Todos incluyen placa de cimentación.',
    to: 'Ninguno incluye placa de cimentación.'
  },
  {
    file: 'pages/cabanas-turisticas-villa-de-leyva.html',
    from: 'Estructura prefabricada, placa de cimentación, montaje en sitio y acabados estándar.',
    to: 'Estructura prefabricada, montaje en sitio y acabados estándar. La placa de cimentación se cotiza aparte.'
  },

  // ---------------------------------------------- pages/casas-de-campo-villa-de-leyva.html
  {
    file: 'pages/casas-de-campo-villa-de-leyva.html',
    from: 'Todos los precios incluyen placa de cimentacion.',
    to: 'Los precios no incluyen placa de cimentacion.'
  },
  {
    file: 'pages/casas-de-campo-villa-de-leyva.html',
    from: 'Precio real de lista, con placa de cimentación incluida.',
    to: 'Precio real de lista, sin placa de cimentación.'
  },
  {
    file: 'pages/casas-de-campo-villa-de-leyva.html',
    from: 'Include todo: licencia, cimentación, montaje y entrega.',
    to: 'Incluye todo: licencia, montaje y entrega. La cimentación se cotiza aparte.'
  },
  {
    file: 'pages/casas-de-campo-villa-de-leyva.html',
    from: 'Todos incluyen placa de cimentación.',
    to: 'Ninguno incluye placa de cimentación.'
  },

  // ---------------------------- blog/casas-prefabricadas-en-bogota-guia-constructora.html
  {
    file: 'blog/casas-prefabricadas-en-bogota-guia-constructora.html',
    from: 'Los precios son de obra negra e incluyen placa de cimentación.',
    to: 'Los precios son de obra negra y no incluyen placa de cimentación.'
  },
  {
    file: 'blog/casas-prefabricadas-en-bogota-guia-constructora.html',
    from: 'Todos son de obra negra e incluyen placa de cimentación; el precio final',
    to: 'Todos son de obra negra y no incluyen placa de cimentación, que se cotiza aparte; el precio final'
  },
  {
    file: 'blog/casas-prefabricadas-en-bogota-guia-constructora.html',
    from: 'Son precios de obra negra e incluyen placa de cimentación.',
    to: 'Son precios de obra negra y no incluyen placa de cimentación.'
  },

  // --------------------------------- blog/casa-prefabricada-para-finca-colombia.html
  {
    file: 'blog/casa-prefabricada-para-finca-colombia.html',
    from: 'Esto incluye placa de cimentación. El tiempo puede variar',
    to: 'La placa de cimentación se cotiza y se ejecuta aparte. El tiempo puede variar'
  },
  {
    file: 'blog/casa-prefabricada-para-finca-colombia.html',
    from: 'Placa de cimentación (no es adicional como en otros proveedores).',
    to: 'Placa de cimentación (se cotiza aparte, con su propio presupuesto).'
  },
  {
    file: 'blog/casa-prefabricada-para-finca-colombia.html',
    from: '<strong>Placa de cimentación incluida en el precio base.</strong> En muchos presupuestos, la placa cotiza aparte como "cimentación". Nosotros la incluimos porque sin placa no hay casa habitable, y sería deshonesto venderte la casa sin ella.',
    to: '<strong>Placa de cimentación cotizada aparte.</strong> El precio de catálogo del modelo no incluye la placa: se cotiza según el tamaño de la casa y lo que el estudio de suelos defina para tu terreno. Te lo detallamos por escrito en la cotización, para que sepas exactamente qué estás pagando.'
  },

  // --------------------------- blog/casas-prefabricadas-economicas-colombia.html
  {
    file: 'blog/casas-prefabricadas-economicas-colombia.html',
    from: 'cubierta, puertas y ventanas básicas, y usualmente la placa de cimentación. NO suelen incluirse:',
    to: 'cubierta y puertas y ventanas básicas. NO suelen incluirse: la placa de cimentación,'
  },
  {
    file: 'blog/casas-prefabricadas-economicas-colombia.html',
    from: 'pero ese rango corresponde a la estructura básica con placa de cimentación incluida.',
    to: 'pero ese rango corresponde a la estructura básica, sin placa de cimentación.'
  },
  {
    file: 'blog/casas-prefabricadas-economicas-colombia.html',
    from: 'se monta sobre una placa de cimentación. Incluye estructura, cubierta, puertas y ventanas.',
    to: 'se monta sobre una placa de cimentación que se cotiza aparte. Incluye estructura, cubierta, puertas y ventanas.'
  },
  {
    file: 'blog/casas-prefabricadas-economicas-colombia.html',
    from: 'estructura prefabricada, placa de cimentación, cubierta, puertas y ventanas básicas.',
    to: 'estructura prefabricada, cubierta, puertas y ventanas básicas; la placa de cimentación se cotiza aparte.'
  },
  {
    file: 'blog/casas-prefabricadas-economicas-colombia.html',
    from: '<strong>Placa de cimentación</strong> (incluida en el precio, no es adicional como en muchos competidores).',
    to: '<strong>Placa de cimentación</strong> (se cotiza aparte, con su propio presupuesto).'
  },
  {
    file: 'blog/casas-prefabricadas-economicas-colombia.html',
    from: '<strong>Placa de cimentación incluida en el precio base.</strong> En muchos presupuestos, la placa cotiza aparte como "cimentación". Nosotros la incluimos porque sin placa no hay casa habitable, y sería deshonesto venderte la casa sin ella.',
    to: '<strong>Placa de cimentación cotizada aparte.</strong> El precio de catálogo del modelo no incluye la placa: se cotiza según el tamaño de la casa y lo que el estudio de suelos defina para tu terreno. Te lo detallamos por escrito en la cotización, para que sepas exactamente qué estás pagando.'
  },

  // ------------------------------- blog/errores-comprar-casa-prefabricada-colombia.html
  {
    file: 'blog/errores-comprar-casa-prefabricada-colombia.html',
    from: 'Sin ella no hay casa habitable, así que en CONCASAYA va incluida en el precio base; si tu terreno exige una placa reforzada, eso se cotiza aparte y te lo decimos.',
    to: 'Sin ella no hay casa habitable, así que en CONCASAYA la cotizamos aparte y te la detallamos en la cotización: el tipo de placa depende del estudio de suelos y del terreno, y si tu terreno exige una placa reforzada, eso también se cotiza aparte y te lo decimos.'
  },

  // ------------------------------ blog/precio-casa-prefabricada-villa-de-leyva.html
  {
    file: 'blog/precio-casa-prefabricada-villa-de-leyva.html',
    from: 'Todos los precios incluyen placa de cimentación, transporte desde Bogotá y la gestión de la licencia de construcción.',
    to: 'Todos los precios incluyen transporte desde Bogotá y la gestión de la licencia de construcción. La placa de cimentación se cotiza aparte.'
  },
  {
    file: 'blog/precio-casa-prefabricada-villa-de-leyva.html',
    from: 'Todos incluyen placa de cimentación, transporte desde Bogotá y la gestión de la licencia de construcción.',
    to: 'Todos incluyen transporte desde Bogotá y la gestión de la licencia de construcción; la placa de cimentación se cotiza aparte.'
  },
  {
    file: 'blog/precio-casa-prefabricada-villa-de-leyva.html',
    from: 'la casa prefabricada con su estructura, cubierta y distribución en alcobas, baño y cocina, la placa de cimentación, el transporte desde Bogotá y el montaje, y la gestión de la licencia de construcción. Se cobra aparte: las instalaciones eléctricas, hidráulicas, sanitarias y de gas',
    to: 'la casa prefabricada con su estructura, cubierta y distribución en alcobas, baño y cocina, el transporte desde Bogotá y el montaje, y la gestión de la licencia de construcción. Se cobra aparte: la placa de cimentación; las instalaciones eléctricas, hidráulicas, sanitarias y de gas'
  },
  {
    file: 'blog/precio-casa-prefabricada-villa-de-leyva.html',
    from: '<strong>La placa de cimentación.</strong> No es un extra; va incluida en los cinco modelos.',
    to: '<strong>La placa de cimentación.</strong> No viene incluida en el precio de catálogo: se cotiza aparte según el estudio de suelos y el tipo de placa que el terreno exige.'
  }
];

let ok = 0;
const errors = [];
const touched = {};

for (const rule of R) {
  const abs = path.join(ROOT, rule.file);
  if (!fs.existsSync(abs)) {
    errors.push(`ARCHIVO NO EXISTE: ${rule.file}`);
    continue;
  }
  let html = fs.readFileSync(abs, 'utf8');
  const count = html.split(rule.from).length - 1;
  if (count === 0) {
    errors.push(`NO ENCONTRADO en ${rule.file}: "${rule.from.slice(0, 80)}..."`);
    continue;
  }
  html = html.split(rule.from).join(rule.to);
  if (!DRY) fs.writeFileSync(abs, html, 'utf8');
  touched[rule.file] = (touched[rule.file] || 0) + count;
  ok += count;
  console.log(`[${rule.file}] x${count}\n    - ${rule.from.slice(0, 110)}\n    + ${rule.to.slice(0, 110)}\n`);
}

console.log('--------------------------------------------------');
console.log(`Reemplazos aplicados: ${ok} en ${Object.keys(touched).length} archivos` + (DRY ? ' (DRY RUN, no se escribio nada)' : ''));
Object.entries(touched).forEach(([f, n]) => console.log(`  ${f}: ${n}`));

if (errors.length) {
  console.log('\nERRORES (no se modifico esa regla):');
  errors.forEach((e) => console.log('  ' + e));
  process.exitCode = 1;
}
