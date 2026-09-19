// Reemplaza el JSON-LD actual (WebPage + BreadcrumbList) por uno expandido:
// WebPage (mejorado) + BreadcrumbList + ItemList (46 municipios/países) +
// FAQPage (10 preguntas) + Service + Organization.
import { readFileSync, readdirSync, writeFileSync } from 'fs';

const file = 'pages/casas-prefabricadas-colombia.html';
let html = readFileSync(file, 'utf8');

// 1) Escanear /pages/ para la lista
const files = readdirSync('pages').filter(f => f.endsWith('.html') && !f.startsWith('casas-prefabricadas-colombia'));
const fixes = {
  'chia': 'Chía', 'cajica': 'Cajicá', 'zipaquira': 'Zipaquirá', 'sopo': 'Sopó',
  'cota': 'Cota', 'mosquera': 'Mosquera', 'madrid': 'Madrid', 'tocancipa': 'Tocancipá',
  'funza': 'Funza', 'suba': 'Suba', 'norte-bogota': 'Norte de Bogotá',
  'villadeleyva': 'Villa de Leyva', 'la-vega': 'La Vega', 'la-mesa': 'La Mesa',
  'la-calera': 'La Calera', 'tunja': 'Tunja', 'duitama': 'Duitama', 'paipa': 'Paipa',
  'samaca': 'Samacá', 'boyaca': 'Boyacá', 'sogamoso': 'Sogamoso',
  'chiquinquira': 'Chiquinquirá', 'choconta': 'Chocontá', 'firavitoba': 'Firavitoba',
  'raquira': 'Ráquira', 'valle-de-tenza': 'Valle de Tenza', 'santa-marta': 'Santa Marta',
  'barbosa': 'Barbosa', 'velez': 'Vélez', 'puente-nacional': 'Puente Nacional',
  'san-francisco': 'San Francisco', 'facatativa': 'Facatativá', 'fusagasuga': 'Fusagasugá',
  'soacha': 'Soacha', 'pacho': 'Pacho', 'supata': 'Supatá', 'subachoque': 'Subachoque',
  'mesitas-del-colegio': 'Mesitas del Colegio', 'sesquile': 'Sesquilé', 'guasca': 'Guasca',
  'villeta': 'Villeta',
  'colombianos-en-el-exterior': 'Colombianos en el exterior',
  'colombianos-estados-unidos': 'Estados Unidos',
  'colombianos-espana': 'España',
  'colombianos-canada': 'Canadá',
  'colombianos-mexico': 'México',
};
const allMunis = files.map(f => {
  const slug = f.replace('.html', '');
  const nombre = fixes[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return { slug, nombre };
});

function deptoOf(slug) {
  if (slug === 'bogota') return 'Bogotá D.C.';
  const bogSab = ['chia','cajica','zipaquira','sopo','cota','suba','norte-bogota','funza','mosquera','madrid','tocancipa'];
  if (bogSab.includes(slug)) return 'Bogotá y Sabana';
  const cundi = ['la-vega','la-calera','la-mesa','guasca','sesquile','soacha','facatativa','fusagasuga','pacho','mesitas-del-colegio','subachoque','supata','villeta'];
  if (cundi.includes(slug)) return 'Cundinamarca';
  const boy = ['tunja','villadeleyva','duitama','sogamoso','paipa','samaca','boyaca','chiquinquira','choconta','firavitoba','raquira','valle-de-tenza'];
  if (boy.includes(slug)) return 'Boyacá';
  const san = ['barbosa','velez','puente-nacional','san-francisco'];
  if (san.includes(slug)) return 'Santander';
  if (slug === 'santa-marta') return 'Magdalena';
  if (slug.startsWith('colombianos-')) return 'En el exterior';
  return 'Otros';
}

// Orden: deptos Colombia, luego exterior
const ORDER = ['Bogotá y Sabana', 'Cundinamarca', 'Boyacá', 'Santander', 'Magdalena', 'En el exterior'];
const orderedMunis = [];
for (const d of ORDER) {
  const inDepto = allMunis.filter(m => deptoOf(m.slug) === d)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  for (const m of inDepto) orderedMunis.push(m);
}

// 2) Construir el ItemList (46 items)
const itemListElements = [];
let pos = 1;
// Primer item: Bogotá D.C. (página general)
itemListElements.push({
  "@type": "ListItem",
  "position": pos++,
  "item": {
    "@type": "Place",
    "name": "Bogotá D.C.",
    "address": { "@type": "PostalAddress", "addressLocality": "Bogotá", "addressRegion": "Bogotá D.C.", "addressCountry": "CO" },
    "url": "https://www.concasaya.com/"
  }
});
for (const m of orderedMunis) {
  const isExt = deptoOf(m.slug) === 'En el exterior';
  itemListElements.push({
    "@type": "ListItem",
    "position": pos++,
    "item": {
      "@type": "Place",
      "name": m.nombre,
      "url": "https://www.concasaya.com/pages/" + m.slug + ".html",
      ...(isExt ? {} : {
        "address": {
          "@type": "PostalAddress",
          "addressLocality": m.nombre,
          "addressRegion": deptoOf(m.slug),
          "addressCountry": "CO"
        }
      }),
      "containedInPlace": isExt ? { "@type": "Country", "name": "Exterior" } : { "@type": "AdministrativeArea", "name": deptoOf(m.slug) }
    }
  });
}

// 3) FAQ: 10 preguntas reales
const faqs = [
  {
    q: '¿Cuánto cuesta una casa prefabricada en Colombia en 2026?',
    a: 'Los rangos reales de CONCASAYA para 2026 son: Plaqueta de concreto desde $600.000/m² (obra negra) hasta $1.850.000/m² (llave en mano), y Paneles EPS desde $1.450.000/m² hasta $1.950.000/m². Para una casa de 60-80m² llave en mano el rango es de $111M a $240M COP. El precio final depende de ubicación, acabados, instalaciones, placa, transporte y licencia de construcción.'
  },
  {
    q: '¿Necesito licencia de construcción para una casa prefabricada?',
    a: 'Sí, en la mayoría de los casos. La licencia de construcción es obligatoria para cualquier obra nueva en Colombia, incluidas las casas prefabricadas. Excepciones: vivienda rural dispersa del propietario según Resolución 1138 de 2024, reparaciones menores y reforzamientos. CONCASAYA te acompaña en todo el proceso de radicación ante la curaduría o alcaldía, con tiempo típico de 2-8 semanas según municipio.'
  },
  {
    q: '¿Cuánto se demora construir una casa prefabricada vs una tradicional?',
    a: 'Las casas prefabricadas de CONCASAYA se entregan en 4 a 8 semanas dependiendo del sistema y nivel de terminados: 4 semanas para EPS llave en mano, 5-6 semanas para plaqueta obra gris, 6-8 semanas para plaqueta llave en mano. Una construcción tradicional toma 6-12 meses. Adicionalmente debes sumar 2-8 semanas para la licencia de construcción.'
  },
  {
    q: '¿Construyen casas prefabricadas en todo Colombia?',
    a: 'CONCASAYA opera con equipo propio en 41 municipios de Bogotá, Cundinamarca, Boyacá, Santander y Magdalena, y gestiona proyectos en los 825 municipios restantes de Colombia a través de aliados logísticos verificados. También tenemos cobertura para colombianos en el exterior en Estados Unidos, España, Canadá y México.'
  },
  {
    q: '¿Qué sistema es mejor: Paneles EPS o Plaqueta de concreto?',
    a: 'Depende de tu proyecto. Paneles EPS: mejor aislamiento térmico y acústico, más livianos (ideales para suelos con限制 de carga), 4-5 semanas de construcción. Plaqueta de concreto: mayor robustez estructural, mejor comportamiento en climas fríos, muros cortafuegos RF 120 minutos, mayor durabilidad. Para climas cálidos y templados recomendamos EPS; para climas fríos o proyectos de gran tamaño recomendamos plaqueta.'
  },
  {
    q: '¿Cuál es la diferencia entre obra negra, obra gris y obra blanca?',
    a: 'Obra negra: solo estructura (cimentación, muros, cubierta), sin acabados. Para autoconstrucción. Obra gris: estructura + pañetes + instalaciones básicas (eléctricas e hidráulicas empotradas), listo para acabados finales. Obra blanca: llave en mano completa con acabados, baños, cocina, pintura, pisos y detalles, lista para habitar.'
  },
  {
    q: '¿Construyen casas en clima frío y caliente?',
    a: 'Sí. Ajustamos especificaciones según el clima del municipio: para Boyacá y altiplano cundinamarqués usamos sistemas con mayor inercia térmica (plaqueta); para Sabana de Bogotá y clima templado funcionan ambos sistemas; para clima cálido recomendamos Paneles EPS por su aislamiento superior. Confirmamos tu ubicación en el menú Cobertura o por WhatsApp.'
  },
  {
    q: '¿Cuánto dura la garantía de una casa prefabricada CONCASAYA?',
    a: '10 años en estructura (cimentación, muros, cubierta), 5 años en instalaciones hidráulicas y eléctricas, 1 año en acabados (pintura, pisos, grifería). La garantía está cubierta por una póliza de cumplimiento con aseguradora. CONCASAYA es una empresa colombiana formal, SAS constituida en 2018, con más de 12.000 proyectos entregados y 98% de clientes satisfechos.'
  },
  {
    q: '¿Puedo construir una casa prefabricada en suelo rural?',
    a: 'Sí. En suelo rural puedes construir bajo dos modalidades: (1) Vivienda rural dispersa según Resolución 1138 de 2024, que permite construcción del propietario en su propio suelo rural sin licencia hasta ciertos límites; (2) Licencia de construcción regular si superas esos límites o si la zona tiene POT vigente. CONCASAYA evalúa tu caso particular y te indica la mejor ruta.'
  },
  {
    q: '¿Cómo es el proceso para cotizar una casa prefabricada con CONCASAYA?',
    a: 'El proceso es: 1) Diagnóstico inicial gratuito por WhatsApp o formulario (municipio, m², sistema de tu interés). 2) Cotización preliminar con rangos por m². 3) Cotización real con diseño arquitectónico, presupuesto detallado y cronograma. 4) Firma de contrato y anticipo. 5) Diseño arquitectónico y radicación de licencia. 6) Construcción (4-8 semanas). 7) Entrega llave en mano. Tiempo total: 2-4 meses desde el primer contacto hasta tener la casa lista.'
  },
];

// 4) Construir el JSON-LD completo
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.concasaya.com/pages/casas-prefabricadas-colombia.html#webpage",
      "url": "https://www.concasaya.com/pages/casas-prefabricadas-colombia.html",
      "name": "Casas Prefabricadas en Colombia | Cobertura Completa CONCASAYA",
      "alternateName": "Casas Prefabricadas Colombia - CONCASAYA",
      "description": "Casas prefabricadas en Colombia con CONCASAYA: 41 municipios en Bogotá, Cundinamarca, Boyacá, Santander y Magdalena + 5 países en el exterior. Más de 15 años de experiencia, 12.000 proyectos entregados. Paneles EPS y plaqueta de concreto desde $600K/m².",
      "inLanguage": "es-CO",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://www.concasaya.com/#website",
        "name": "CONCASAYA",
        "url": "https://www.concasaya.com/"
      },
      "about": { "@id": "https://www.concasaya.com/#organization" },
      "mainEntity": { "@id": "https://www.concasaya.com/#service" },
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": "https://www.concasaya.com/assets/images/fondo4.webp",
        "width": 1920, "height": 1080
      },
      "speakable": {
        "@type": "SpeakableSpecification",
        "xpath": [
          "/html/head/title",
          "/html/head/meta[@name='description']/@content",
          "//*[@id='seccion-sistemas']//h2",
          "//*[@id='seccion-precios']//h2",
          "//*[@id='seccion-tiempos']//h2"
        ]
      },
      "datePublished": "2026-01-15",
      "dateModified": "2026-08-29",
      "inLanguage": "es-CO"
    },
    {
      "@type": "Organization",
      "@id": "https://www.concasaya.com/#organization",
      "name": "CONCASAYA",
      "alternateName": "CONCASAYA Casas Prefabricadas",
      "url": "https://www.concasaya.com/",
      "logo": "https://www.concasaya.com/assets/images/logoconcasaya.webp",
      "image": "https://www.concasaya.com/assets/images/herocasa.webp",
      "foundingDate": "2018",
      "description": "Constructora colombiana especializada en casas prefabricadas con paneles EPS y plaqueta de concreto. Más de 12.000 proyectos entregados en 41 municipios y 5 países. 98% de clientes satisfechos.",
      "telephone": "+57-314-289-1018",
      "email": "contacto@codifytech.click",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Cl. 147 #101-56 Local 64, Centro Comercial Fiesta",
        "addressLocality": "Bogotá",
        "addressRegion": "Bogotá D.C.",
        "addressCountry": "CO",
        "postalCode": "111156"
      },
      "areaServed": [
        {"@type": "Country", "name": "Colombia"},
        {"@type": "AdministrativeArea", "name": "Bogotá D.C."},
        {"@type": "AdministrativeArea", "name": "Cundinamarca"},
        {"@type": "AdministrativeArea", "name": "Boyacá"},
        {"@type": "AdministrativeArea", "name": "Santander"},
        {"@type": "AdministrativeArea", "name": "Magdalena"},
        {"@type": "Country", "name": "Estados Unidos"},
        {"@type": "Country", "name": "España"},
        {"@type": "Country", "name": "Canadá"},
        {"@type": "Country", "name": "México"}
      ]
    },
    {
      "@type": "Service",
      "@id": "https://www.concasaya.com/#service",
      "serviceType": "Construcción de casas prefabricadas",
      "name": "Casas Prefabricadas en Colombia",
      "description": "Diseño, construcción y entrega de casas prefabricadas con paneles EPS y plaqueta de concreto en Bogotá, Cundinamarca, Boyacá, Santander, Magdalena y para colombianos en el exterior.",
      "provider": { "@id": "https://www.concasaya.com/#organization" },
      "areaServed": { "@id": "https://www.concasaya.com/#organization" },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Sistemas constructivos CONCASAYA",
        "itemListElement": [
          {
            "@type": "OfferCatalog",
            "name": "Paneles EPS",
            "itemListElement": [
              {"@type": "Offer", "name": "Casa prefabricada paneles EPS obra gris", "priceSpecification": {"@type": "PriceSpecification", "priceCurrency": "COP", "price": "1450000", "description": "Precio por m² (referencia preliminar)"}},
              {"@type": "Offer", "name": "Casa prefabricada paneles EPS obra blanca (llave en mano)", "priceSpecification": {"@type": "PriceSpecification", "priceCurrency": "COP", "price": "1950000", "description": "Precio por m² (referencia preliminar)"}}
            ]
          },
          {
            "@type": "OfferCatalog",
            "name": "Plaqueta de concreto",
            "itemListElement": [
              {"@type": "Offer", "name": "Casa prefabricada plaqueta obra negra", "priceSpecification": {"@type": "PriceSpecification", "priceCurrency": "COP", "price": "600000", "description": "Precio por m² (referencia preliminar)"}},
              {"@type": "Offer", "name": "Casa prefabricada plaqueta obra gris", "priceSpecification": {"@type": "PriceSpecification", "priceCurrency": "COP", "price": "1150000", "description": "Precio por m² (referencia preliminar)"}},
              {"@type": "Offer", "name": "Casa prefabricada plaqueta obra blanca (llave en mano)", "priceSpecification": {"@type": "PriceSpecification", "priceCurrency": "COP", "price": "1850000", "description": "Precio por m² (referencia preliminar)"}}
            ]
          }
        ]
      },
      "termsOfService": "https://www.concasaya.com/proteccion-contra-estafas.html",
      "serviceOutput": "Casa prefabricada habitada con servicios básicos funcionando",
      "providerMobility": "static"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.concasaya.com/"},
        {"@type": "ListItem", "position": 2, "name": "Casas prefabricadas en Colombia", "item": "https://www.concasaya.com/pages/casas-prefabricadas-colombia.html"}
      ]
    },
    {
      "@type": "ItemList",
      "name": "Cobertura completa de CONCASAYA en Colombia y el exterior",
      "description": "Lista completa de los 41 municipios y 5 países donde CONCASAYA ofrece construcción de casas prefabricadas.",
      "numberOfItems": itemListElements.length,
      "itemListElement": itemListElements
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.concasaya.com/pages/casas-prefabricadas-colombia.html#faq",
      "mainEntity": faqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      }))
    }
  ]
};

// 5) Encontrar y reemplazar el JSON-LD actual
const ldStart = html.indexOf('<script type="application/ld+json">');
if (ldStart < 0) { console.error('No encontré JSON-LD'); process.exit(1); }
const ldEnd = html.indexOf('</script>', ldStart);
const before = html.substring(0, ldStart);
const after = html.substring(ldEnd);
const newLd = '<script type="application/ld+json">' + JSON.stringify(jsonLd, null, 2) + '\n    </script>';
html = before + newLd + after;
console.log(`✓ JSON-LD reemplazado. Bloques: ${jsonLd['@graph'].length} (WebPage, Organization, Service, BreadcrumbList, ItemList, FAQPage)`);
console.log(`  - ItemList: ${itemListElements.length} lugares`);
console.log(`  - FAQPage: ${faqs.length} preguntas`);

writeFileSync(file, html, 'utf8');
console.log('\n✓ Parte 1D lista.');
